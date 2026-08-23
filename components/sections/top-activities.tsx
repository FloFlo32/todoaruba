import Link from "next/link";
import { activities, VIATOR_WIDGET } from "@/data/activities";
import { Reveal } from "@/components/magic/reveal";
import { ViatorWidgetGrid } from "@/components/booking/viator-widget";

export function TopActivities() {
  return (
    <section className="container-px mx-auto max-w-6xl py-14 sm:py-16">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Traveler favorites
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold sm:text-4xl">
            Top things to do in Aruba
          </h2>
        </div>
        <Link href="/things-to-do" className="text-sm font-medium text-primary hover:underline">
          {`See all ${activities.length} activities →`}
        </Link>
      </Reveal>

      <Reveal delay={0.06} className="mt-8">
        <ViatorWidgetGrid partnerId={VIATOR_WIDGET.partnerId} widgetRef={VIATOR_WIDGET.widgetRef} />
      </Reveal>
    </section>
  );
}
