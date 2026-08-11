import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, X } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { DynamicIcon } from "@/components/icon-map";
import { ActivityCard } from "@/components/activity-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { categories } from "@/data/categories";
import { activities } from "@/data/activities";
import { brand } from "@/brand.config";

export const metadata: Metadata = {
  title: "Things to Do in Aruba",
  description:
    "Every Aruba activity, tour, and excursion in one place: snorkeling, diving, ATV tours, sunset cruises, food, nightlife, and more.",
};

export default async function ThingsToDoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  if (query) {
    const needle = query.toLowerCase();
    const results = activities.filter(
      (a) =>
        a.name.toLowerCase().includes(needle) ||
        a.shortDescription.toLowerCase().includes(needle) ||
        a.description.toLowerCase().includes(needle) ||
        a.categories.some((c) => c.includes(needle))
    );

    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="container-px mx-auto max-w-6xl py-14 sm:py-20">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-balance font-display text-3xl font-bold sm:text-4xl">
                  {`${results.length} result${results.length === 1 ? "" : "s"} for `}
                  &ldquo;{query}&rdquo;
                </h1>
              </div>
              <Link
                href="/things-to-do"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" /> Clear search
              </Link>
            </Reveal>

            {results.length > 0 ? (
              <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((activity) => (
                  <RevealItem key={activity.slug}>
                    <ActivityCard activity={activity} />
                  </RevealItem>
                ))}
              </RevealGroup>
            ) : (
              <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                Nothing matched that search. Try browsing by category instead.
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-6xl py-14 sm:py-20">
          <Reveal className="max-w-2xl">
            <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">
              Things to Do in Aruba
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {activities.length} activities across the island, from reef snorkeling to sunset
              sailing. Browse by category, or let {brand.name} build you a full itinerary.
            </p>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => {
              const count = activities.filter((a) => a.categories.includes(c.slug)).length;
              return (
                <RevealItem key={c.slug}>
                  <Link
                    href={`/things-to-do/${c.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-border/70 bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                        <DynamicIcon name={c.icon} className="size-5" />
                      </div>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <h2 className="text-lg font-semibold">{c.name}</h2>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                    <span className="mt-auto font-mono text-xs text-muted-foreground">
                      {count} {count === 1 ? "activity" : "activities"}
                    </span>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </main>
      <Footer />
    </>
  );
}
