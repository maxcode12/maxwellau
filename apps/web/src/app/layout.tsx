import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { jsonLd, personSchema, websiteSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Worship, Encounter, Transformation`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Maxwell AU",
    "worship minister",
    "gospel music",
    "worship leader",
    "King's Time",
    "African worship",
    "ministry booking",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — Worship, Encounter, Transformation`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#06050a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        {children}

        <script
          type="application/ld+json"
          // Serialised server-side from static, non-user-authored objects.
          dangerouslySetInnerHTML={{ __html: jsonLd([websiteSchema, personSchema]) }}
        />
      </body>
    </html>
  );
}
