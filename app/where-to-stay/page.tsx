import type { Metadata } from "next";
import Link from "next/link";
import { Info, Sparkles } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { ImageCard } from "@/components/magic/image-card";
import { Button } from "@/components/ui/button";
import { stayAreas } from "@/data/stays";

export const metadata: Metadata = {
  title: "Where to Stay",
  description: "Which part of Aruba to base yourself in, area by area.",
};

/**
 * Flip to true once the Airbnb Associates application is approved and real
 * listing links exist. Until then this page must not claim an affiliate
 * partnership that doesn't exist yet.
 */
const AIRBNB_PARTNER_LIVE = false;

export default function WhereToStayPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-6xl py-14 sm:py-20">
          <Reveal>
            <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">
              Where to Stay in Aruba
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Aruba is small enough that no area is ever far from the beach — the real
              question is which part of the island fits your trip.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-8 flex gap-3 rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              {AIRBNB_PARTNER_LIVE ? (
                <>
                  <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    Todo Aruba is a member of the Airbnb Associates Program. When you book a
                    stay through the links on this page, we may earn a commission &mdash; at
                    no extra cost to you. We only feature places we&apos;d actually recommend;
                    commission never affects which stays we choose to show.
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    We&apos;re working on a partnership with Airbnb to bring hand-picked stays
                    for each area below straight into this page. Nothing is bookable here yet
                    &mdash; check back soon.
                  </p>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="mt-14 font-display text-2xl font-bold sm:text-3xl">
              Best area for you
            </h2>
          </Reveal>

          <RevealGroup className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stayAreas.map((s) => (
              <RevealItem key={s.area}>
                <ImageCard
                  src={s.image}
                  alt={`${s.name}, Aruba`}
                  eyebrow={s.bestFor}
                  title={s.name}
                  description={s.blurb}
                  className="h-full"
                />
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">
                  Know where you're staying? Build the days around it.
                </h3>
                <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                  Tell us your area and dates, and we&apos;ll plan activities that don&apos;t
                  eat your trip in transit.
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <Link href="/plan">Plan My Trip</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
