"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AutoSlider — an auto-advancing, swipeable, looping horizontal slider that shows
 * SEVERAL items at once. Reach for this (or Marquee/Carousel) instead of yet
 * another static grid: variety in layout is what makes a site feel authored.
 *
 *   <AutoSlider itemClassName="w-[82%] sm:w-[46%] lg:w-[31%]">
 *     {items.map((i) => <ImageCard key={i.id} {...i} />)}
 *   </AutoSlider>
 *
 * Native scroll-snap = real touch swipe + keyboard. Auto-advance pauses on hover
 * and is disabled under prefers-reduced-motion.
 */
export function AutoSlider({
  children,
  className,
  itemClassName = "w-[82%] sm:w-[46%] lg:w-[31%]",
  interval = 3500,
  controls = true,
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  interval?: number;
  controls?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const items = React.Children.toArray(children);

  const step = React.useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const delta = first ? first.offsetWidth + 16 : el.clientWidth * 0.85;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir === -1 && el.scrollLeft <= 8)
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: delta * dir, behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let paused = false;
    const el = ref.current;
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    el?.addEventListener("pointerenter", onEnter);
    el?.addEventListener("pointerleave", onLeave);
    const id = setInterval(() => !paused && step(1), interval);
    return () => {
      clearInterval(id);
      el?.removeEventListener("pointerenter", onEnter);
      el?.removeEventListener("pointerleave", onLeave);
    };
  }, [interval, step]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, i) => (
          <div key={i} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </div>
        ))}
      </div>

      {controls && items.length > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => step(-1)}
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => step(1)}
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
