export * from "./contract";
export * from "./crypto";
export { youtubePublisher } from "./adapters/youtube";
export { facebookPublisher } from "./adapters/facebook";
export { instagramPublisher } from "./adapters/instagram";
export { tiktokPublisher } from "./adapters/tiktok";

import type { SocialPlatformId, SocialPublisher } from "./contract";
import { youtubePublisher } from "./adapters/youtube";
import { facebookPublisher } from "./adapters/facebook";
import { instagramPublisher } from "./adapters/instagram";
import { tiktokPublisher } from "./adapters/tiktok";

const registry: Record<SocialPlatformId, SocialPublisher> = {
  YOUTUBE: youtubePublisher,
  FACEBOOK: facebookPublisher,
  INSTAGRAM: instagramPublisher,
  TIKTOK: tiktokPublisher,
};

export function getPublisher(platform: SocialPlatformId): SocialPublisher {
  return registry[platform];
}

export function listPublishers(): SocialPublisher[] {
  return Object.values(registry);
}
