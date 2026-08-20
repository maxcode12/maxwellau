import "server-only";
import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

/**
 * Azure Blob Storage adapter.
 *
 * The only place in the application that touches the Azure Storage SDK.
 * Everything above it speaks in terms of `issueUploadSas` / `headBlob` /
 * `publicUrl`, so swapping the storage provider (or faking it in tests) never
 * touches application code.
 *
 * Credential strategy:
 * - Local dev: `AZURE_STORAGE_CONNECTION_STRING` (Azurite from docker-compose).
 * - Azure: `AZURE_STORAGE_ACCOUNT` + Managed Identity (DefaultAzureCredential),
 *   minting *user delegation* SAS so no account key exists in the app at all.
 */

export type UploadSas = {
  /** Full URL (blob endpoint + SAS query) the browser PUTs blocks to. */
  readonly uploadUrl: string;
  /** ISO expiry so the client can warn before the SAS dies mid-upload. */
  readonly expiresAt: string;
};

const SAS_TTL_MINUTES = 60;

type Adapter = {
  issueUploadSas(container: string, blobKey: string): Promise<UploadSas>;
  headBlob(
    container: string,
    blobKey: string,
  ): Promise<{ exists: boolean; contentLength?: number; contentType?: string }>;
  publicUrl(container: string, blobKey: string): string;
  deleteBlob(container: string, blobKey: string): Promise<void>;
};

function connectionStringAdapter(connectionString: string): Adapter {
  const service = BlobServiceClient.fromConnectionString(connectionString);
  // Shared-key credential is needed to sign SAS tokens locally.
  const accountName = /AccountName=([^;]+)/.exec(connectionString)?.[1] ?? "";
  const accountKey = /AccountKey=([^;]+)/.exec(connectionString)?.[1] ?? "";
  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  // Azurite starts with no CORS rules, so browser PUTs would fail preflight.
  // Real accounts get CORS from Terraform; this only runs on the local path.
  let corsConfigured = false;
  async function ensureLocalCors() {
    if (corsConfigured) return;
    await service.setProperties({
      cors: [
        {
          allowedOrigins: "*",
          allowedMethods: "PUT,OPTIONS",
          allowedHeaders: "*",
          exposedHeaders: "*",
          maxAgeInSeconds: 3600,
        },
      ],
    });
    corsConfigured = true;
  }

  return {
    async issueUploadSas(container, blobKey) {
      // Azurite starts empty; harmless no-op against a real account.
      await ensureLocalCors();
      await service.getContainerClient(container).createIfNotExists();
      const expiresOn = new Date(Date.now() + SAS_TTL_MINUTES * 60 * 1000);
      const sas = generateBlobSASQueryParameters(
        {
          containerName: container,
          blobName: blobKey,
          // Create + write only — the SAS cannot read, list or delete.
          permissions: BlobSASPermissions.parse("cw"),
          startsOn: new Date(Date.now() - 5 * 60 * 1000),
          expiresOn,
        },
        credential,
      ).toString();

      const blobUrl = service.getContainerClient(container).getBlockBlobClient(blobKey).url;
      return { uploadUrl: `${blobUrl}?${sas}`, expiresAt: expiresOn.toISOString() };
    },

    async headBlob(container, blobKey) {
      try {
        const properties = await service
          .getContainerClient(container)
          .getBlockBlobClient(blobKey)
          .getProperties();
        return {
          exists: true,
          contentLength: properties.contentLength,
          contentType: properties.contentType,
        };
      } catch {
        return { exists: false };
      }
    },

    publicUrl(container, blobKey) {
      return service.getContainerClient(container).getBlockBlobClient(blobKey).url;
    },

    async deleteBlob(container, blobKey) {
      await service
        .getContainerClient(container)
        .getBlockBlobClient(blobKey)
        .deleteIfExists();
    },
  };
}

function managedIdentityAdapter(accountName: string): Adapter {
  const service = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential(),
  );

  return {
    async issueUploadSas(container, blobKey) {
      const startsOn = new Date(Date.now() - 5 * 60 * 1000);
      const expiresOn = new Date(Date.now() + SAS_TTL_MINUTES * 60 * 1000);
      // User-delegation key: signed by AAD, no account key anywhere.
      const delegationKey = await service.getUserDelegationKey(startsOn, expiresOn);
      const sas = generateBlobSASQueryParameters(
        {
          containerName: container,
          blobName: blobKey,
          permissions: BlobSASPermissions.parse("cw"),
          startsOn,
          expiresOn,
          protocol: SASProtocol.Https,
        },
        delegationKey,
        accountName,
      ).toString();

      const blobUrl = service.getContainerClient(container).getBlockBlobClient(blobKey).url;
      return { uploadUrl: `${blobUrl}?${sas}`, expiresAt: expiresOn.toISOString() };
    },

    async headBlob(container, blobKey) {
      try {
        const properties = await service
          .getContainerClient(container)
          .getBlockBlobClient(blobKey)
          .getProperties();
        return {
          exists: true,
          contentLength: properties.contentLength,
          contentType: properties.contentType,
        };
      } catch {
        return { exists: false };
      }
    },

    publicUrl(container, blobKey) {
      return service.getContainerClient(container).getBlockBlobClient(blobKey).url;
    },

    async deleteBlob(container, blobKey) {
      await service
        .getContainerClient(container)
        .getBlockBlobClient(blobKey)
        .deleteIfExists();
    },
  };
}

let cached: Adapter | undefined;

export function blobStorage(): Adapter {
  if (cached) return cached;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT;

  if (connectionString) {
    cached = connectionStringAdapter(connectionString);
  } else if (accountName) {
    cached = managedIdentityAdapter(accountName);
  } else {
    throw new Error(
      "Blob storage is not configured: set AZURE_STORAGE_CONNECTION_STRING (local) or AZURE_STORAGE_ACCOUNT (Azure).",
    );
  }
  return cached;
}

/** True when a blob backend is configured; lets the UI degrade gracefully. */
export function blobStorageConfigured(): boolean {
  return Boolean(
    process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AZURE_STORAGE_ACCOUNT,
  );
}
