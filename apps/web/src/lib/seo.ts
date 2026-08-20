import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Route path, e.g. "/music". Used for the canonical URL. */
  path: string;
  /** Absolute or root-relative image path. Defaults to the site OG image. */
  image?: string;
  type?: "website" | "article" | "profile" | "music.song" | "video.other";
  publishedTime?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  image = "/opengraph-image",
  type = "website",
  publishedTime,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: type === "music.song" || type === "video.other" ? "website" : type,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: siteConfig.name }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [imageUrl],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Renders a JSON-LD block. Content is serialised server-side and never user-authored. */
export function jsonLd(data: Record<string, unknown> | Record<string, unknown>[]): string {
  // `<` is escaped so a stray string value can never break out of the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: siteConfig.name,
  url: siteConfig.url,
  genre: ["Gospel", "Worship", "Contemporary Christian"],
  description: siteConfig.description,
  logo: absoluteUrl(siteConfig.brand.lockup),
  image: absoluteUrl(siteConfig.brand.lockup),
} as const;

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: "en-GB",
} as const;
