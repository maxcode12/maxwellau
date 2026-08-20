import { notFound } from "next/navigation";
import { AdminBackLink, AdminPageHeader, StatusBadge } from "@/components/admin/primitives";
import { VideoForm } from "@/modules/videos/components/video-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const video = await db.video.findUnique({ where: { id } });
  if (!video) notFound();

  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/videos" label="All videos" />
        <AdminPageHeader
          title={video.title}
          description={`/${video.slug}`}
          action={<StatusBadge status={video.visibility} />}
        />
      </div>
      <VideoForm
        initial={{
          id: video.id,
          title: video.title,
          slug: video.slug,
          description: video.description,
          category: video.category,
          publishedAt: video.publishedAt.toISOString().slice(0, 16),
          youtubeId: video.youtubeId ?? "",
          durationSeconds: video.durationSeconds?.toString() ?? "",
          featured: video.featured,
          visibility: video.visibility,
        }}
      />
    </div>
  );
}
