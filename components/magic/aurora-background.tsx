import { cn } from "@/lib/utils";

/**
 * AuroraBackground — soft animated brand-colored light blobs.
 * Pure CSS (no JS), driven by the --aurora-* tokens, so it re-skins with the hue.
 * Drop behind a hero: place it as the first child of a `relative` container.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      <div className="absolute -top-1/3 left-1/2 size-[60rem] -translate-x-1/2 rounded-full bg-aurora-1/30 blur-[120px] animate-aurora" />
      <div className="absolute top-1/4 -right-1/4 size-[40rem] rounded-full bg-aurora-2/25 blur-[110px] animate-aurora [animation-delay:-6s]" />
      <div className="absolute -bottom-1/4 -left-1/4 size-[45rem] rounded-full bg-aurora-3/25 blur-[120px] animate-aurora [animation-delay:-12s]" />
    </div>
  );
}
