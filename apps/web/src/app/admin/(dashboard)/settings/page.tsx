import { AdminPageHeader } from "@/components/admin/primitives";
import { SettingsForm } from "@/modules/settings/components/settings-form";
import { requireRole } from "@/modules/auth/guards";
import { getContactEmails, getSocialLinks } from "@/modules/settings/service";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");

  const [links, emails] = await Promise.all([getSocialLinks(), getContactEmails()]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Website settings"
        description="Social profiles, streaming platforms and public contact addresses. Changes go live immediately."
      />
      <SettingsForm
        initial={{
          links: links.map((link) => ({
            platform: link.platform,
            label: link.label,
            kind: link.kind,
            url: link.url,
          })),
          emails,
        }}
      />
    </div>
  );
}
