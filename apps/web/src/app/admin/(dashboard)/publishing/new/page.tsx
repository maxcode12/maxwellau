import { getPublisher } from "@maxwellau/social";
import { AdminBackLink, AdminPageHeader } from "@/components/admin/primitives";
import { Composer } from "@/modules/publishing/components/composer";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [media, accounts] = await Promise.all([
    db.media.findMany({
      where: { status: "READY", type: { in: ["VIDEO", "IMAGE"] } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, title: true, type: true },
    }),
    db.socialAccount.findMany({
      where: { status: "CONNECTED" },
      orderBy: { platform: "asc" },
      select: { id: true, platform: true, displayName: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <AdminBackLink href="/admin/publishing" label="Publishing" />
        <AdminPageHeader
          title="Create post"
          description="Choose the media, write once, and select every destination."
        />
      </div>

      <Composer
        mediaOptions={media}
        accounts={accounts.map((account) => {
          const capabilities = getPublisher(account.platform).capabilities();
          return {
            id: account.id,
            platform: account.platform,
            displayName: account.displayName,
            limitation: !capabilities.video
              ? "This platform cannot receive video posts."
              : null,
          };
        })}
      />
    </div>
  );
}
