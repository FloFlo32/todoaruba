"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryImage = { src: string; alt: string };

/**
 * Gallery — responsive masonry grid with a keyboard-accessible lightbox.
 * Feed it the images scraped into /public/ingested or stock photos.
 *
 *   <Gallery images={[{ src: "/ingested/x.jpg", alt: "…" }]} />
 */
export function Gallery({
  images,
  className,
}: {
  images: GalleryImage[];
  className?: string;
}) {
  const [open, setOpen] = React.useState<number | null>(null);
  const has = images.length > 0;

  const move = React.useCallback(
    (dir: 1 | -1) =>
      setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length]
  );

  React.useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, move]);

  if (!has) return null;

  return (
    <>
      <div className={cn("columns-2 gap-3 md:columns-3 [&>*]:mb-3", className)}>
        {images.map((img, i) => (
          <button
            key={img.src + i}
            onClick={() => setOpen(i)}
            className="group block w-full overflow-hidden rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Open image: ${img.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              decoding="async"
              className="w-full transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 p-4 backdrop-blur"
          onClick={() => setOpen(null)}
        >
          <button
            aria-label="Close"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-border bg-card text-foreground"
            onClick={() => setOpen(null)}
          >
            <X className="size-5" />
          </button>
          <button
            aria-label="Previous"
            className="absolute left-4 grid size-11 place-items-center rounded-full border border-border bg-card text-foreground"
            onClick={(e) => { e.stopPropagation(); move(-1); }}
          >
            <ChevronLeft className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[open].src}
            alt={images[open].alt}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            aria-label="Next"
            className="absolute right-4 grid size-11 place-items-center rounded-full border border-border bg-card text-foreground"
            onClick={(e) => { e.stopPropagation(); move(1); }}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </>
  );
}
