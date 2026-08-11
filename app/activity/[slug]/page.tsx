import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, X, Clock, MapPin, Star, CalendarDays } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Gallery } from "@/components/magic/gallery";
import { Reveal } from "@/components/magic/reveal";
import { Button } from "@/components/ui/button";
import { activities, getActivity } from "@/data/activities";
import { getCategory } from "@/data/categories";
import { formatDuration } from "@/lib/format";

export function generateStaticParams() {
  return activities.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const activity = getActivity(slug);
  if (!activity) return {};
  return {
    title: activity.name,
    description: activity.shortDescription,
  };
}

const TIME_LABEL: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = getActivity(slug);
  if (!activity) notFound();

  const primaryCategory = getCategory(activity.categories[0]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-5xl py-10 sm:py-14">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link href="/things-to-do" className="hover:text-foreground">
                Things to do
              </Link>
              <span>/</span>
              {primaryCategory && (
                <Link href={`/things-to-do/${primaryCategory.slug}`} className="hover:text-foreground">
                  {primaryCategory.name}
                </Link>
              )}
            </div>

            <h1 className="mt-3 text-balance font-display text-3xl font-bold sm:text-4xl">{activity.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-primary text-primary" /> {activity.review.rating} (
                {activity.review.count} reviews)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" /> {formatDuration(activity.durationMinutes)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {activity.location}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="mt-8">
            <Gallery images={activity.images.map((src) => ({ src, alt: activity.name }))} />
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-10">
              <Reveal>
                <h2 className="text-xl font-semibold">About this activity</h2>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{activity.description}</p>
              </Reveal>

              <Reveal delay={0.04}>
                <h2 className="text-xl font-semibold">Availability</h2>
                <p className="mt-3 flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4 shrink-0" />
                  Runs most days, best in the {activity.bestTimeOfDay.map((t) => TIME_LABEL[t]).join(" or ")}.
                  Exact times confirmed at booking, weather permitting.
                </p>
              </Reveal>

              <Reveal delay={0.08} className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="text-xl font-semibold">What&apos;s included</h2>
                  <ul className="mt-3 space-y-2">
                    {activity.included.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Not included</h2>
                  <ul className="mt-3 space-y-2">
                    {activity.excluded.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <h2 className="text-xl font-semibold">Meeting point</h2>
                <p className="mt-3 text-muted-foreground">{activity.meetingPoint}</p>
              </Reveal>

              <Reveal delay={0.16}>
                <h2 className="text-xl font-semibold">Cancellation policy</h2>
                <p className="mt-3 text-muted-foreground">{activity.cancellationPolicy}</p>
              </Reveal>

              <Reveal delay={0.2}>
                <h2 className="text-xl font-semibold">Reviews</h2>
                <div className="mt-3 flex items-center gap-3">
                  <span className="font-display text-3xl font-bold">{activity.review.rating}</span>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={i < Math.round(activity.review.rating) ? "size-4 fill-primary" : "size-4"}
                        />
                      ))}
                    </div>
                    Based on {activity.review.count} verified bookings
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="font-display text-3xl font-bold">
                  ${activity.priceFrom}
                  <span className="ml-1 text-base font-normal text-muted-foreground">{activity.priceUnit}</span>
                </p>
                <Button asChild size="lg" className="mt-5 w-full">
                  <a href={`/go/${activity.slug}`}>Book Now</a>
                </Button>
                <Button asChild variant="outline" className="mt-2.5 w-full">
                  <Link href="/plan">Add to my itinerary</Link>
                </Button>
                <p className="mt-4 text-xs text-muted-foreground">{activity.cancellationPolicy}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
