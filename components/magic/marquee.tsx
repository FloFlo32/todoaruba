import { cn } from "@/lib/utils";

/**
 * Marquee — infinite horizontal/vertical scroll for logo clouds or testimonials.
 * CSS-only (no JS). Duplicate the children automatically for a seamless loop.
 *
 *   <Marquee pauseOnHover>{logos.map(...)}</Marquee>
 */
export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 2,
}: {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
}) {
  return (
    <div
      className={cn(
        "group flex gap-[var(--marquee-gap)] overflow-hidden p-2 [--marquee-gap:2rem] [--marquee-duration:40s]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 justify-around gap-[var(--marquee-gap)]",
            vertical
              ? "flex-col animate-marquee-vertical"
              : "flex-row animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
