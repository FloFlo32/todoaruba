import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { TripPageClient } from "@/components/planner/trip-page-client";
import { getItinerary } from "@/lib/store";
import { resolveItinerary } from "@/lib/itinerary";

export const metadata: Metadata = {
  title: "My Trip",
  robots: { index: false, follow: false },
};

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itinerary = getItinerary(id);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-4xl py-14 sm:py-20">
          {itinerary ? (
            <>
              <div className="mb-8">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Your itinerary
                </span>
                <h1 className="font-display text-3xl font-bold sm:text-4xl">
                  {itinerary.days.length}-Day Aruba Trip
                </h1>
              </div>
              <TripPageClient itinerary={resolveItinerary(itinerary)} />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <h1 className="font-display text-2xl font-bold">We couldn&apos;t find that trip</h1>
              <p className="mt-2 text-muted-foreground">
                This itinerary may have expired. Let&apos;s build you a new one.
              </p>
              <Button asChild className="mt-6">
                <Link href="/plan">Plan My Trip</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
