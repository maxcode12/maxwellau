import { AdminPageHeader } from "@/components/admin/primitives";
import { ProfileForm } from "@/modules/profile/components/profile-form";
import { getArtistProfile } from "@/modules/profile/service";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const profile = await getArtistProfile();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Artist profile"
        description="The biography shown on /bio. Saving here overrides the checked-in copy."
      />
      <ProfileForm
        initial={{
          role: profile.role,
          tagline: profile.tagline,
          summary: profile.summary,
          sections: profile.sections.map((section) => ({
            id: section.id,
            heading: section.heading,
            text: section.paragraphs.join("\n\n"),
          })),
        }}
      />
    </div>
  );
}
