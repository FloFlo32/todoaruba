import Link from "next/link";
import type { Metadata } from "next";
import { X } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ViatorWidgetGrid } from "@/components/booking/viator-widget";
import { ImageCard } from "@/components/magic/image-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { categories } from "@/data/categories";
import { activities, getActivitiesByCategory, VIATOR_WIDGET, CATEGORY_VIATOR_WIDGETS } from "@/data/activities";
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
              <Reveal className="mt-10">
                <ViatorWidgetGrid partnerId={VIATOR_WIDGET.partnerId} widgetRef={VIATOR_WIDGET.widgetRef} />
              </Reveal>
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

          <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter((c) => CATEGORY_VIATOR_WIDGETS[c.slug])
              .map((c) => {
                const inCategory = getActivitiesByCategory(c.slug);
                const cover = inCategory[0]?.images[0];
                if (!cover) return null;
                return (
                  <RevealItem key={c.slug}>
                    <ImageCard
                      href={`/things-to-do/${c.slug}`}
                      src={cover}
                      alt={c.name}
                      eyebrow={`${inCategory.length} ${inCategory.length === 1 ? "activity" : "activities"}`}
                      title={c.name}
                      description={c.description}
                      className="h-full"
                    />
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
