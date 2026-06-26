import { cn } from "@/lib/utils";

/**
 * GridPattern — subtle dotted/lined background grid that fades at the edges.
 * Adds depth without noise. Place inside a `relative` container.
 */
export function GridPattern({
  className,
  variant = "lines",
}: {
  className?: string;
  variant?: "lines" | "dots";
}) {
  const background =
    variant === "dots"
      ? "radial-gradient(circle, var(--color-border) 1px, transparent 1px)"
      : "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      style={{
        backgroundImage: background,
        backgroundSize: variant === "dots" ? "24px 24px" : "56px 56px",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
      }}
    />
  );
}
