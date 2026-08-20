import Link from "next/link";
import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Testimony } from "@/modules/testimonies/types";

export function TestimonyCard({ testimony }: { testimony: Testimony }) {
  return (
    <Card as="article" className="flex h-full flex-col justify-between p-6">
      <Quote className="size-7 shrink-0 text-gold-500/60" aria-hidden="true" />

      <blockquote className="mt-5 flex-1">
        <p className="text-pretty font-display text-lg leading-relaxed text-parchment/90">
          {testimony.body ? (
            <Link
              href={`/testimonies/${testimony.slug}`}
              className="transition-colors hover:text-gold-100"
            >
              &ldquo;{testimony.quote}&rdquo;
            </Link>
          ) : (
            <>&ldquo;{testimony.quote}&rdquo;</>
          )}
        </p>
      </blockquote>

      <footer className="mt-6 border-t border-ink-700/70 pt-4">
        <p className="text-sm font-medium text-gold-200">{testimony.name}</p>
        <p className="mt-0.5 text-xs text-muted-warm">
          {testimony.location ? `${testimony.location} · ` : ""}
          <time dateTime={testimony.sharedAt}>
            {formatDate(testimony.sharedAt, { month: "long", year: "numeric" })}
          </time>
        </p>
      </footer>
    </Card>
  );
}
