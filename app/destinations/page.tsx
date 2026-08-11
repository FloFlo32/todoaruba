import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { destinations } from "@/data/destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Where ToDo plans trips today, and where we're headed next.",
};

export default function DestinationsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-5xl py-14 sm:py-20">
          <Reveal className="max-w-2xl">
            <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">Destinations</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              ToDo Aruba is the first stop. The same AI planner and booking marketplace is built to
              travel, one destination at a time.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) =>
              d.live ? (
                <RevealItem key={d.slug}>
                  <Link
                    href="/"
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary/30 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.image}
                        alt={d.name}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-primary">
                        Live now
                      </span>
                      <h2 className="mt-3 text-lg font-semibold">{d.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{d.tagline}</p>
                    </div>
                  </Link>
                </RevealItem>
              ) : (
                <RevealItem key={d.slug}>
                  <div className="flex h-full flex-col justify-center gap-2 rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
                    <MapPin className="size-5" />
                    <h2 className="text-lg font-semibold text-foreground/70">{d.name}</h2>
                    <p className="text-sm">{d.tagline}</p>
                  </div>
                </RevealItem>
              )
            )}
          </RevealGroup>
        </div>
      </main>
      <Footer />
    </>
  );
}
