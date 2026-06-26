"use client";

import { motion, type Transition } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * BorderBeam — a light that travels around a card's border. Place inside a
 * `relative overflow-hidden rounded-*` element. Great for "featured" cards.
 */
export function BorderBeam({
  className,
  size = 60,
  duration = 7,
  delay = 0,
  colorFrom = "var(--color-aurora-1)",
  colorTo = "var(--color-aurora-2)",
}: {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}) {
  const transition: Transition = {
    repeat: Infinity,
    ease: "linear",
    duration,
    delay: -delay,
  };

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn(
          "absolute aspect-square bg-gradient-to-l from-[var(--from)] via-[var(--to)] to-transparent",
          className
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--from": colorFrom,
            "--to": colorTo,
          } as React.CSSProperties
        }
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={transition}
      />
    </div>
  );
}
