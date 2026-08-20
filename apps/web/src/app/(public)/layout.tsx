import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SampleContentNotice } from "@/components/layout/sample-content-notice";

/** Public site chrome. Admin routes render their own shell. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-gold-400 focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-ink-950"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
      <SiteFooter />
      <SampleContentNotice />
    </>
  );
}
