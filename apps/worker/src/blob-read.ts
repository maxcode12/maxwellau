import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

/**
 * Read-side blob access for the publishing worker: open a stream for
 * stream-upload platforms (YouTube) and mint short-lived read-only SAS URLs
 * for pull-from-URL platforms (Meta, TikTok).
 */

const READ_SAS_TTL_MINUTES = 4 * 60; // Platforms may fetch slowly; 4h is safe.

function service(): { client: BlobServiceClient; sharedKey?: StorageSharedKeyCredential; accountName?: string } {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT;

  if (connectionString) {
    const name = /AccountName=([^;]+)/.exec(connectionString)?.[1] ?? "";
    const key = /AccountKey=([^;]+)/.exec(connectionString)?.[1] ?? "";
    return {
      client: BlobServiceClient.fromConnectionString(connectionString),
      sharedKey: new StorageSharedKeyCredential(name, key),
      accountName: name,
    };
  }
  if (accountName) {
    return {
      client: new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential(),
      ),
      accountName,
    };
  }
  throw new Error("Blob storage is not configured for the worker.");
}

export async function openBlobStream(
  container: string,
  blobKey: string,
): Promise<NodeJS.ReadableStream> {
  const { client } = service();
  const response = await client
    .getContainerClient(container)
    .getBlockBlobClient(blobKey)
    .download();
  if (!response.readableStreamBody) throw new Error("Blob has no readable body.");
  return response.readableStreamBody;
}

export async function mintReadUrl(container: string, blobKey: string): Promise<string | null> {
  const { client, sharedKey, accountName } = service();
  const blobClient = client.getContainerClient(container).getBlockBlobClient(blobKey);
  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date(Date.now() + READ_SAS_TTL_MINUTES * 60 * 1000);

  if (sharedKey) {
    const sas = generateBlobSASQueryParameters(
      {
        containerName: container,
        blobName: blobKey,
        permissions: BlobSASPermissions.parse("r"),
        startsOn,
        expiresOn,
      },
      sharedKey,
    ).toString();
    return `${blobClient.url}?${sas}`;
  }

  if (accountName) {
    const delegationKey = await client.getUserDelegationKey(startsOn, expiresOn);
    const sas = generateBlobSASQueryParameters(
      {
        containerName: container,
        blobName: blobKey,
        permissions: BlobSASPermissions.parse("r"),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      delegationKey,
      accountName,
    ).toString();
    return `${blobClient.url}?${sas}`;
  }

  return null;
}
