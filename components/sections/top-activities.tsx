import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { activities, getFeaturedActivities } from "@/data/activities";
import { formatDuration, formatPrice } from "@/lib/format";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { getCategory } from "@/data/categories";

const featured = getFeaturedActivities();
const rest = activities.filter((a) => !a.featured).sort((a, b) => b.review.rating - a.review.rating);
const topActivities = [...featured, ...rest].slice(0, 6);

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

      <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {topActivities.map((activity, i) => {
          const category = getCategory(activity.categories[0]);
          return (
            <RevealItem key={activity.slug}>
              <Link
                href={`/activity/${activity.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activity.images[0]}
                    alt={activity.name}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-full bg-card font-display text-sm font-bold text-primary shadow-sm">
                    #{i + 1}
                  </span>
                  {category && (
                    <span className="absolute right-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                      {category.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                    <Star className="size-3.5 fill-primary text-primary" />
                    <span className="font-semibold text-foreground">{activity.review.rating}</span>
                    <span>({activity.review.count.toLocaleString()})</span>
                    <span className="mx-0.5">&middot;</span>
                    <Clock className="size-3.5" /> {formatDuration(activity.durationMinutes)}
                  </span>
                  <h3 className="text-lg font-semibold leading-snug">{activity.name}</h3>
                  <p className="text-sm text-muted-foreground">{activity.shortDescription}</p>
                  <p className="mt-auto pt-2 text-sm font-semibold text-foreground">
                    {formatPrice(activity.priceFrom, activity.priceUnit)}
                  </p>
                </div>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
