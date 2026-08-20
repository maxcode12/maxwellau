import { AdminBackLink, AdminPageHeader } from "@/components/admin/primitives";
import { AlbumForm } from "@/modules/music/components/album-form";

export const dynamic = "force-dynamic";

export default function NewAlbumPage() {
  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/music" label="All releases" />
        <AdminPageHeader title="New release" />
      </div>
      <AlbumForm
        initial={{
          title: "",
          slug: "",
          type: "SINGLE",
          releasedAt: "",
          releasedAtPrecision: "DAY",
          description: "",
          tracklistComplete: false,
          visibility: "DRAFT",
        }}
      />
    </div>
  );
}
