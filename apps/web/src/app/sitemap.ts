import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-config";
import { listAlbums } from "@/modules/music/service";
import { listVideos } from "@/modules/videos/service";
import { listPastEvents, listUpcomingEvents } from "@/modules/events/service";
import { listSessions } from "@/modules/kings-time/service";
import { listTestimonies } from "@/modules/testimonies/service";

export const revalidate = 3600;

const staticRoutes: readonly { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/music", priority: 0.9, changeFrequency: "weekly" },
  { path: "/videos", priority: 0.9, changeFrequency: "weekly" },
  { path: "/kings-time", priority: 0.9, changeFrequency: "monthly" },
  { path: "/events", priority: 0.8, changeFrequency: "weekly" },
  { path: "/testimonies", priority: 0.7, changeFrequency: "monthly" },
  { path: "/bio", priority: 0.7, changeFrequency: "yearly" },
  { path: "/booking", priority: 0.8, changeFrequency: "yearly" },
  { path: "/media", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [albums, videos, upcoming, past, sessions, testimonies] = await Promise.all([
    listAlbums(),
    listVideos(),
    listUpcomingEvents(),
    listPastEvents(),
    listSessions(),
    listTestimonies(),
  ]);

  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...albums.map((album) => ({
      url: absoluteUrl(`/music/${album.slug}`),
      lastModified: new Date(album.releasedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...videos.map((video) => ({
      url: absoluteUrl(`/videos/${video.slug}`),
      lastModified: new Date(video.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...[...upcoming, ...past].map((event) => ({
      url: absoluteUrl(`/events/${event.slug}`),
      lastModified: new Date(event.startsAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...[...sessions.upcoming, ...sessions.archive].map((session) => ({
      url: absoluteUrl(`/kings-time/${session.slug}`),
      lastModified: new Date(session.startsAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...testimonies.map((testimony) => ({
      url: absoluteUrl(`/testimonies/${testimony.slug}`),
      lastModified: new Date(testimony.sharedAt),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
