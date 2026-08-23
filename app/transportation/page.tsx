import type { Metadata } from "next";
import Link from "next/link";
import { Car, PlaneTakeoff, CarTaxiFront, Bus } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { Button } from "@/components/ui/button";
import { ViatorWidgetGrid } from "@/components/booking/viator-widget";

const TRANSPORTATION_WIDGET = { partnerId: "P00315266", widgetRef: "W-61090d5b-34d9-4984-89f4-b7d9796e2e90" };

export const metadata: Metadata = {
  title: "Getting Around Aruba",
  description: "How to get around Aruba: renting a car, airport transfers, taxis, and the public bus.",
};

const MODES = [
  {
    id: "car-rental",
    icon: Car,
    title: "Renting a Car",
    description:
      "The easiest way to see the whole island on your own schedule. Rental counters are at the airport, and roads are well paved and easy to navigate, though a 4x4 helps for the sandy backcountry trails inside Arikok National Park.",
  },
  {
    id: "airport-transfers",
    icon: PlaneTakeoff,
    title: "Airport Transfers",
    description:
      "Queen Beatrix International Airport (AUA) sits just outside Oranjestad, a short ride from the Palm Beach and Eagle Beach hotel strip. Most hotels can arrange a private transfer, or a taxi from the stand right outside arrivals.",
  },
  {
    id: "taxis",
    icon: CarTaxiFront,
    title: "Taxis",
    description:
      "Aruba taxis run on fixed, government-regulated zone rates rather than a meter, so confirm the price with your driver before you set off. They're the simplest option for a night out without worrying about parking.",
  },
  {
    id: "public-bus",
    icon: Bus,
    title: "Public Bus",
    description:
      "Arubus, the island's public bus line, connects Oranjestad, the hotel strip, and San Nicolas at a fraction of a taxi fare. It's a solid budget option if your plans stay along the main coastal route.",
  },
];

export default function TransportationPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-6xl py-14 sm:py-20">
          <Reveal className="max-w-2xl">
            <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">
              Getting Around Aruba
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Aruba is about 20 miles long, so nowhere is really far &mdash; the question is
              just which way you'd rather get there.
            </p>
          </Reveal>

          <Reveal delay={0.06} className="mt-10">
            <ViatorWidgetGrid
              partnerId={TRANSPORTATION_WIDGET.partnerId}
              widgetRef={TRANSPORTATION_WIDGET.widgetRef}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="mt-16 font-display text-2xl font-bold sm:text-3xl">Good to know</h2>
          </Reveal>

          <RevealGroup className="mt-6 grid gap-5 sm:grid-cols-2">
            {MODES.map((mode) => (
              <RevealItem key={mode.id}>
                <div id={mode.id} className="scroll-mt-32 rounded-2xl border border-border bg-card p-6">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <mode.icon className="size-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">{mode.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{mode.description}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.14}>
            <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">
                  Building an itinerary? Factor in travel time.
                </h3>
                <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                  Tell us your dates and where you're staying, and we'll plan days that don't
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
