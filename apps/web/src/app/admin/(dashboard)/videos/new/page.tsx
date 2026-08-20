import { AdminBackLink, AdminPageHeader } from "@/components/admin/primitives";
import { VideoForm } from "@/modules/videos/components/video-form";

export const dynamic = "force-dynamic";

export default function NewVideoPage() {
  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/videos" label="All videos" />
        <AdminPageHeader title="New video" />
      </div>
      <VideoForm
        initial={{
          title: "",
          slug: "",
          description: "",
          category: "WORSHIP_SESSION",
          publishedAt: "",
          youtubeId: "",
          durationSeconds: "",
          featured: false,
          visibility: "DRAFT",
        }}
      />
    </div>
  );
}
