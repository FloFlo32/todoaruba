import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Aruba Trip Itineraries & Guides",
  description: "Ready-made Aruba itineraries for a long weekend or a full week, or build your own with our AI planner.",
};

export default function GuidesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-4xl py-14 sm:py-20">
          <Reveal>
            <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">Aruba Trip Guides</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Ready-made itineraries for common trip lengths. Prefer something built around your own
              dates and interests? <Link href="/plan" className="text-primary hover:underline">Use the AI planner</Link> instead.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 space-y-4">
            {guides.map((g) => (
              <RevealItem key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
                >
                  <div>
                    <h2 className="text-lg font-semibold">{g.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
                  </div>
                  <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </main>
      <Footer />
    </>
  );
}
