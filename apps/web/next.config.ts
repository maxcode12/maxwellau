import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` is present for styles because Next injects inline style
 * attributes for `next/image` and font loading. Scripts avoid `'unsafe-inline'`
 * in production but need `'unsafe-eval'` in development for React Refresh.
 *
 * `img-src` includes `blob:` and `data:` for the generated blur placeholders.
 * Azure Blob Storage origins are added in Phase 4 when media moves there.
 */
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://i.ytimg.com",
  "media-src 'self' blob:",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  // Direct browser-to-Blob uploads (SAS PUTs). Azurite locally, the storage
  // account in Azure.
  "connect-src 'self' https://*.blob.core.windows.net" +
    (isDev || process.env.E2E === "1" ? " ws: wss: http://127.0.0.1:10000 http://localhost:10000" : ""),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Omitted when serving over plain HTTP (dev, local E2E against 127.0.0.1):
  // WebKit upgrades subresource requests to https and they fail with SSL errors.
  ...(isDev || process.env.E2E === "1" ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@maxwellau/social", "@maxwellau/azure"],
  poweredByHeader: false,
  // Produces a minimal server bundle for the Azure Container Apps image.
  output: "standalone",
  outputFileTracingRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
