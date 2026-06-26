import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ImageCard — the CORRECT way to pair an image with text.
 *
 * Image sits in its OWN contained area on top; text lives BELOW on a solid
 * surface. Do NOT lay text over the photo behind a dark gradient scrim — that
 * pattern reads cheap and hurts readability (see CLAUDE.md). This component
 * exists so nobody reaches for the overlay.
 *
 * Uses a plain lazy <img> (not next/image) so a grid/slider of these never
 * trips the optimizer. Feed it scraped images from /ingested.
 */
export function ImageCard({
  src,
  alt,
  title,
  description,
  href,
  eyebrow,
  className,
  ratio = "aspect-[4/3]",
}: {
  src: string;
  alt: string;
  title: string;
  description?: string;
  href?: string;
  eyebrow?: string;
  className?: string;
  ratio?: string;
}) {
  const inner = (
    <>
      <div className={cn("overflow-hidden bg-muted", ratio)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {eyebrow && (
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </span>
        )}
        <h3 className="flex items-start justify-between gap-2 text-lg font-semibold">
          {title}
          {href && (
            <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </h3>
        {description && (
          <p className="text-pretty text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </>
  );

  const base =
    "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

  return href ? (
    <Link href={href} className={cn(base, "cursor-pointer", className)}>
      {inner}
    </Link>
  ) : (
    <div className={cn(base, className)}>{inner}</div>
  );
}
