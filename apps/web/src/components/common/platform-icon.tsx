import * as React from "react";
import { Facebook, Instagram, Music4, Youtube } from "lucide-react";
import type { SocialPlatform } from "@/lib/site-config";

/** Brand glyphs lucide does not ship. Simplified single-path marks. */
function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.5 2h-3v13.2a2.7 2.7 0 1 1-2.7-2.7c.28 0 .54.04.79.12V9.5a5.8 5.8 0 1 0 4.91 5.73V8.9a6.6 6.6 0 0 0 3.9 1.26V7.1a3.72 3.72 0 0 1-3.9-3.62V2Z" />
    </svg>
  );
}

function SpotifyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.35 14.46a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.15a.75.75 0 1 1-.34-1.46c4.55-1.04 8.48-.6 11.66 1.34a.75.75 0 0 1 .26 1.02Zm1.28-2.9a.94.94 0 0 1-1.29.31c-3.23-1.98-8.15-2.56-11.96-1.4a.94.94 0 1 1-.55-1.8c4.36-1.32 9.78-.68 13.49 1.6a.94.94 0 0 1 .31 1.29Zm.11-3.02C14.02 8.24 7.98 8.03 4.28 9.15a1.12 1.12 0 1 1-.65-2.15C7.88 5.72 14.55 5.97 18.9 8.55a1.12 1.12 0 1 1-1.16 1.92Z" />
    </svg>
  );
}

const icons: Record<SocialPlatform, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  tiktok: TikTokIcon,
  spotify: SpotifyIcon,
  appleMusic: Music4,
  audiomack: Music4,
  boomplay: Music4,
};

/**
 * Accepts any platform string — streaming destinations can name services that
 * have no dedicated glyph — and falls back to a generic music icon rather than
 * rendering `undefined` as a component.
 */
export function PlatformIcon({
  platform,
  className,
}: {
  platform: SocialPlatform | (string & {});
  className?: string;
}) {
  const Icon = icons[platform as SocialPlatform] ?? Music4;
  return <Icon className={className} aria-hidden="true" />;
}
