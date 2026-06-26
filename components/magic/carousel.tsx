"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type Slide = { src: string; alt: string; caption?: string };

/**
 * Carousel — auto-advancing, swipeable slideshow with arrows + dots.
 * Pauses on hover/focus and respects prefers-reduced-motion (no autoplay).
 *
 *   <Carousel slides={[{ src: "/ingested/1.jpg", alt: "…", caption: "…" }]} />
 */
export function Carousel({
  slides,
  className,
  interval = 5000,
}: {
  slides: Slide[];
  className?: string;
  interval?: number;
}) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const reduce = useReducedMotion();
  const touchX = React.useRef<number | null>(null);

  const go = React.useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + slides.length) % slides.length),
    [slides.length]
  );

  React.useEffect(() => {
    if (reduce || paused || slides.length <= 1) return;
    const t = setInterval(() => go(1), interval);
    return () => clearInterval(t);
  }, [reduce, paused, slides.length, interval, go]);

  if (!slides.length) return null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card",
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Slideshow"
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div key={s.src + i} className="relative w-full shrink-0" aria-hidden={i !== index}>
            {/* Plain lazy <img>, not next/image: a many-slide carousel must not
                trigger the optimizer per slide. First slide eager, rest lazy. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.src}
              alt={s.alt}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="aspect-video w-full object-cover"
            />
            {s.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-5">
                <p className="text-sm font-medium">{s.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-card/80 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-card/80 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/40"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
