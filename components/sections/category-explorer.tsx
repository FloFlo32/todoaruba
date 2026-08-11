import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { activities, getActivitiesByCategory } from "@/data/activities";
import type { CategorySlug } from "@/lib/types";

const tiles: { name: string; slug: CategorySlug; href: string }[] = [
  { name: "Boat Trips", slug: "boat-tours", href: "/things-to-do/boat-tours" },
  { name: "Snorkeling", slug: "snorkeling", href: "/things-to-do/snorkeling" },
  { name: "Scuba Diving", slug: "diving", href: "/things-to-do/diving" },
  { name: "ATV & Off-Road", slug: "adventure", href: "/things-to-do/adventure" },
  { name: "Water Sports", slug: "water-activities", href: "/things-to-do/water-activities" },
];

export function CategoryExplorer() {
  return (
    <section className="border-y border-border/60 bg-secondary/40 py-20 sm:py-24">
      <div className="container-px mx-auto max-w-6xl">
        <Reveal className="max-w-xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Browse by category
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl font-bold sm:text-5xl">
            Trips organized the way you actually search
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => {
            // Prefer an activity whose PRIMARY category matches, so a tile like
            // "Boat Trips" doesn't end up showing a scuba photo just because a
            // multi-category snorkel-and-boat activity happened to sort first.
            const image =
              activities.find((a) => a.categories[0] === t.slug)?.images[0] ??
              getActivitiesByCategory(t.slug)[0]?.images[0];
            const count = getActivitiesByCategory(t.slug).length;
            return (
              <RevealItem key={t.slug}>
                <Link
                  href={t.href}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-border/60"
                >
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={t.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                    {count} {count === 1 ? "experience" : "experiences"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="relative flex h-full items-end justify-between gap-2 p-4">
                    <span className="text-lg font-semibold text-white">{t.name}</span>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/90 text-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            );
          })}

          <RevealItem>
            <Link
              href="/things-to-do"
              className="group flex aspect-[4/3] flex-col items-start justify-between rounded-xl border border-border/60 bg-card p-4"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <ArrowUpRight className="size-5" />
              </span>
              <div>
                <span className="text-lg font-semibold">More Things To Do</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  Food, culture, nightlife, family fun &amp; more.
                </p>
              </div>
            </Link>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
