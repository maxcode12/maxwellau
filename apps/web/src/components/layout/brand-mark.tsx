import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

/**
 * The header/footer lockup. The full logo's wordmark is illegible below about
 * 90px tall, so small sizes pair the crowned-lion mark with live text instead
 * of shrinking the raster lockup.
 */
export function BrandMark({
  className,
  size = "md",
  showTagline = false,
  href = "/",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  href?: string | null;
}) {
  const markSize = size === "lg" ? 64 : size === "md" ? 44 : 34;

  const content = (
    <span className={cn("flex items-center gap-3", className)}>
      <Image
        src={siteConfig.brand.mark}
        alt=""
        width={markSize}
        height={markSize}
        className="shrink-0"
        priority={size !== "sm"}
        aria-hidden="true"
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold tracking-[0.08em] text-parchment",
            size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-base",
          )}
        >
          MAXWELL <span className="text-gold-300">AU</span>
        </span>
        {showTagline ? (
          <span className="mt-1.5 text-[0.5625rem] uppercase tracking-[0.24em] text-muted-warm">
            {siteConfig.tagline}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="rounded-sm" aria-label={`${siteConfig.name} — home`}>
      {content}
    </Link>
  );
}
