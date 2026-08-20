/**
 * Generates web-optimised brand + photography assets from the owner-supplied
 * originals in /images into apps/web/public, plus a typed image manifest with
 * intrinsic dimensions and blur placeholders.
 *
 * Originals are large (100MB+) and are excluded from git; run this script after
 * adding or replacing a source image:
 *   node scripts/prepare-assets.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "images");
const WEB = path.join(root, "apps", "web");
const PUBLIC_PHOTOS = path.join(WEB, "public", "images");
const PUBLIC_BRAND = path.join(WEB, "public", "brand");
const APP_DIR = path.join(WEB, "src", "app");
const MANIFEST = path.join(WEB, "src", "content", "generated", "image-manifest.ts");

/**
 * Alt text is descriptive of what is visible only. It deliberately avoids
 * naming venues, events, dates or other people, none of which are known.
 */
const PHOTOS = [
  { file: "DSC_0146.jpg", slug: "piano-portrait-01", alt: "Maxwell AU seated at a grand piano during a quiet moment of worship.", tags: ["portrait", "music"] },
  { file: "DSC_0153.jpg", slug: "piano-portrait-02", alt: "Maxwell AU in a navy suit playing a grand piano.", tags: ["portrait", "music"] },
  { file: "DSC_0160.jpg", slug: "piano-portrait-03", alt: "Close portrait of Maxwell AU at the grand piano.", tags: ["portrait", "music"] },
  { file: "MAC_4656.jpg", slug: "ministering-01", alt: "Maxwell AU ministering on stage with a handheld microphone.", tags: ["live", "worship"] },
  { file: "MAC_4688.jpg", slug: "worship-duet-01", alt: "Maxwell AU leading worship alongside a fellow vocalist under stage lights.", tags: ["live", "worship"] },
  { file: "MAC_4774.jpg", slug: "worship-team-01", alt: "Maxwell AU and the worship team leading a congregation in praise.", tags: ["live", "team"] },
  { file: "MAC_4960.jpg", slug: "worship-team-02", alt: "Maxwell AU leading worship with backing vocalists in a wood-panelled hall.", tags: ["live", "team"] },
  { file: "MAC_4984.jpg", slug: "ministering-02", alt: "Maxwell AU singing into a microphone mid-worship.", tags: ["live", "worship"] },
  { file: "MAC_5362.jpg", slug: "live-band-bw", alt: "Black and white photograph of the live band on stage during ministration.", tags: ["live", "band"] },
  { file: "MAC_5511.jpg", slug: "fellowship-01", alt: "Maxwell AU with ministry colleagues after a service.", tags: ["community"] },
  { file: "MAC_5539.jpg", slug: "team-group-01", alt: "Group photograph of the worship team and ministry volunteers.", tags: ["community", "team"] },
  { file: "abJ2A0800.jpg", slug: "kings-time-01", alt: "Maxwell AU ministering with the live band under deep purple lighting.", tags: ["live", "kings-time"] },
  { file: "abJ2A08ab9.jpg", slug: "kings-time-02", alt: "Wide view of the worship band on the platform during a worship session.", tags: ["live", "kings-time"] },
  { file: "abJ2A097ab.jpg", slug: "hero-worship", alt: "Maxwell AU with a hand raised in worship, lit in deep blue stage light.", tags: ["live", "worship", "hero"] },
  { file: "abJ2A09ab0.jpg", slug: "ministering-03", alt: "Maxwell AU leading a congregation with the band behind him.", tags: ["live", "worship"] },
  { file: "abJ2A09ab3.jpg", slug: "worship-raised-hand", alt: "Maxwell AU worshipping with a raised hand, back-lit by stage lighting.", tags: ["live", "worship"] },
];

const MAX_WIDTH = 2000;
const QUALITY = 78;

async function blurDataUrl(input) {
  const buf = await sharp(input).resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function buildPhotos() {
  await mkdir(PUBLIC_PHOTOS, { recursive: true });
  const entries = [];
  for (const photo of PHOTOS) {
    const src = path.join(SRC, photo.file);
    const out = path.join(PUBLIC_PHOTOS, `${photo.slug}.webp`);
    const info = await sharp(src)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);
    entries.push({
      slug: photo.slug,
      src: `/images/${photo.slug}.webp`,
      width: info.width,
      height: info.height,
      alt: photo.alt,
      tags: photo.tags,
      blurDataURL: await blurDataUrl(out),
    });
    console.log(`photo  ${photo.slug.padEnd(22)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
  }
  return entries;
}

async function buildBrand() {
  await mkdir(PUBLIC_BRAND, { recursive: true });
  const logoSrc = path.join(SRC, "maxwellau-transparent-logo.png");

  // Full stacked lockup (mark + wordmark + tagline), trimmed of dead space.
  await sharp(logoSrc).trim({ threshold: 3 }).resize({ width: 900 }).png({ compressionLevel: 9, palette: true, quality: 92 }).toFile(path.join(PUBLIC_BRAND, "maxwellau-lockup.png"));

  // Crowned lion monogram only — used at small sizes (header, favicon, app icon)
  // where the wordmark would be illegible.
  const meta = await sharp(logoSrc).metadata();
  const mark = sharp(logoSrc).extract({
    left: Math.round(meta.width * 0.245),
    top: Math.round(meta.height * 0.01),
    width: Math.round(meta.width * 0.51),
    height: Math.round(meta.height * 0.74),
  });
  const markBuf = await sharp(await mark.png().toBuffer()).trim({ threshold: 12 }).toBuffer();

  await sharp(markBuf).resize({ width: 512 }).png({ compressionLevel: 9, palette: true, quality: 92 }).toFile(path.join(PUBLIC_BRAND, "maxwellau-mark.png"));

  // Next.js app icons — square, on the brand near-black so the gold glow reads.
  for (const [name, size] of [["icon.png", 512], ["apple-icon.png", 180]]) {
    await sharp({ create: { width: size, height: size, channels: 4, background: "#0B0A08" } })
      .composite([{ input: await sharp(markBuf).resize({ width: Math.round(size * 0.84), height: Math.round(size * 0.84), fit: "inside" }).toBuffer(), gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(APP_DIR, name));
  }

  console.log("brand  lockup, mark, icon.png, apple-icon.png");
  return {
    lockup: "/brand/maxwellau-lockup.png",
    mark: "/brand/maxwellau-mark.png",
  };
}

async function main() {
  const photos = await buildPhotos();
  const brand = await buildBrand();

  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(
    MANIFEST,
    `// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/prepare-assets.mjs
import type { ImageAsset } from "@/lib/images";

export const brandAssets = ${JSON.stringify(brand, null, 2)} as const;

export const imageManifest = ${JSON.stringify(photos, null, 2)} satisfies readonly ImageAsset[];
`,
    "utf8",
  );
  console.log(`\nmanifest -> ${path.relative(root, MANIFEST)} (${photos.length} images)`);
}

await main();
