import {
  QueueClient,
  QueueServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-queue";
import { DefaultAzureCredential } from "@azure/identity";

/**
 * Storage Queue adapter — the only place the Azure Queue SDK is touched.
 *
 * The application enqueues opaque JSON payloads; the worker dequeues them with
 * a visibility timeout so a crashed worker's message reappears for retry.
 * Storage Queue was chosen over Service Bus deliberately (ADR 0001): the MVP
 * needs a durable work queue, not sessions/topics/transactions.
 *
 * Credentials: connection string locally (Azurite), Managed Identity in Azure.
 */

export type QueueMessage<T> = {
  readonly id: string;
  readonly popReceipt: string;
  readonly dequeueCount: number;
  readonly body: T;
};

export type QueueAdapter = {
  send(body: unknown, options?: { visibilityTimeoutSeconds?: number }): Promise<void>;
  /** Receive up to `max` messages, hidden from other consumers for `visibilitySeconds`. */
  receive<T>(max: number, visibilitySeconds: number): Promise<QueueMessage<T>[]>;
  delete(message: { id: string; popReceipt: string }): Promise<void>;
  /** Extend the visibility timeout while a long job is still running. */
  extendVisibility(
    message: { id: string; popReceipt: string },
    visibilitySeconds: number,
  ): Promise<{ popReceipt: string }>;
};

function buildClient(queueName: string): QueueClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT;

  if (connectionString) {
    const service = QueueServiceClient.fromConnectionString(connectionString);
    return service.getQueueClient(queueName);
  }
  if (accountName) {
    const service = new QueueServiceClient(
      `https://${accountName}.queue.core.windows.net`,
      new DefaultAzureCredential(),
    );
    return service.getQueueClient(queueName);
  }
  throw new Error(
    "Queue storage is not configured: set AZURE_STORAGE_CONNECTION_STRING (local) or AZURE_STORAGE_ACCOUNT (Azure).",
  );
}

export function queueConfigured(): boolean {
  return Boolean(process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AZURE_STORAGE_ACCOUNT);
}

export function createQueue(queueName: string): QueueAdapter {
  const client = buildClient(queueName);
  let created = false;
  const ensure = async () => {
    if (!created) {
      await client.createIfNotExists();
      created = true;
    }
  };

  return {
    async send(body, options) {
      await ensure();
      // Base64 keeps the payload safe for the XML transport.
      const encoded = Buffer.from(JSON.stringify(body), "utf8").toString("base64");
      await client.sendMessage(encoded, {
        visibilityTimeout: options?.visibilityTimeoutSeconds,
      });
    },

    async receive<T>(max: number, visibilitySeconds: number) {
      await ensure();
      const response = await client.receiveMessages({
        numberOfMessages: Math.min(Math.max(max, 1), 32),
        visibilityTimeout: visibilitySeconds,
      });
      return response.receivedMessageItems.map((item) => ({
        id: item.messageId,
        popReceipt: item.popReceipt,
        dequeueCount: item.dequeueCount,
        body: JSON.parse(Buffer.from(item.messageText, "base64").toString("utf8")) as T,
      }));
    },

    async delete(message) {
      await client.deleteMessage(message.id, message.popReceipt);
    },

    async extendVisibility(message, visibilitySeconds) {
      const response = await client.updateMessage(
        message.id,
        message.popReceipt,
        undefined,
        visibilitySeconds,
      );
      return { popReceipt: response.popReceipt ?? message.popReceipt };
    },
  };
}

export const PUBLISHING_QUEUE = "publishing-jobs";
