import { PlatformIcon } from "@/components/common/platform-icon";
import { Container, Section, SectionHeading } from "@/components/common/layout-primitives";
import { Reveal } from "@/components/common/reveal";
import { type SocialLink } from "@/lib/site-config";
import { getSocialLinks } from "@/modules/settings/service";

function Tile({ link }: { link: SocialLink }) {
  const shared =
    "flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center transition-all duration-300";

  if (!link.url) {
    return (
      <div
        className={`${shared} border-dashed border-ink-600 bg-ink-900/30 text-muted-warm/60`}
        aria-disabled="true"
      >
        <PlatformIcon platform={link.platform} className="size-6" />
        <span className="text-xs font-medium tracking-wide">{link.label}</span>
        <span className="text-[0.625rem] uppercase tracking-[0.14em]">Coming soon</span>
      </div>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer me"
      className={`${shared} border-ink-700 bg-ink-900/60 text-parchment hover:-translate-y-1 hover:border-gold-500/60 hover:text-gold-200 motion-reduce:hover:translate-y-0`}
    >
      <PlatformIcon platform={link.platform} className="size-6" />
      <span className="text-xs font-medium tracking-wide">{link.label}</span>
      <span className="text-[0.625rem] uppercase tracking-[0.14em] text-muted-warm">Follow</span>
    </a>
  );
}

export async function SocialSection() {
  const links = await getSocialLinks();
  const social = links.filter((link) => link.kind === "social");
  const streaming = links.filter((link) => link.kind === "streaming");

  return (
    <Section aria-labelledby="social-heading">
      <Container>
        <Reveal>
          <SectionHeading
            id="social-heading"
            eyebrow="Connect"
            title="Follow the ministry"
            description="New music, worship sessions and King's Time announcements as they happen."
            align="center"
          />
        </Reveal>

        <Reveal delay={80}>
          <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {social.map((link) => (
              <li key={link.platform}>
                <Tile link={link} />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={140}>
          <h3 className="mt-14 text-center text-xs font-medium uppercase tracking-[0.24em] text-gold-400/90">
            Listen on
          </h3>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {streaming.map((link) => (
              <li key={link.platform}>
                <Tile link={link} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
