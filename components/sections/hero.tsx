import Link from "next/link";
import { CalendarCheck, BadgePercent, ShieldCheck } from "lucide-react";
import { AuroraBackground } from "@/components/magic/aurora-background";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { SearchBar } from "@/components/sections/search-bar";

const badges = [
  { icon: CalendarCheck, label: "Real-time availability" },
  { icon: BadgePercent, label: "No markup — operator pricing" },
  { icon: ShieldCheck, label: "Instant, secure booking" },
];

const HERO_IMAGE = "/ingested/todoaruba/img-001.webp";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <AuroraBackground />

      <div className="container-px mx-auto max-w-6xl pt-16 pb-8 text-center sm:pt-24">
        <Reveal>
          <span className="mx-auto inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Your AI Aruba Concierge
          </span>
        </Reveal>
        <Reveal>
          <h1 className="mx-auto mt-4 max-w-2xl text-balance font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
            Find the best things to do in Aruba
          </h1>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            Search tours and activities, or answer a few questions and let our AI plan the whole trip.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-7">
          <SearchBar />
        </Reveal>
        <Reveal delay={0.14}>
          <Link
            href="/plan"
            className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Or let our AI plan my trip
          </Link>
        </Reveal>
      </div>

      <Reveal delay={0.16}>
        <div className="container-px relative mx-auto max-w-5xl pb-10 sm:pb-12">
          <div className="overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGE}
              alt="Aerial view of a busy white-sand Aruba beach with turquoise water and colorful umbrellas"
              loading="eager"
              className="h-[42vh] max-h-[420px] w-full object-cover"
            />
          </div>
        </div>
      </Reveal>

      <RevealGroup className="container-px mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 pb-14 sm:pb-16">
        {badges.map((b) => (
          <RevealItem key={b.label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <b.icon className="size-4 text-primary" /> {b.label}
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
