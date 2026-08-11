import Link from "next/link";
import { Sparkles, CalendarCheck, Ticket, ArrowRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Sparkles,
    title: "Discover",
    body: "Answer a few quick questions about your trip.",
  },
  {
    icon: CalendarCheck,
    title: "Plan",
    body: "Get a real day-by-day plan built around what you love.",
  },
  {
    icon: Ticket,
    title: "Book",
    body: "Book every activity right from the itinerary.",
  },
];

export function HowItWorks() {
  return (
    <section className="container-px mx-auto max-w-6xl py-14 sm:py-16">
      <div className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-card px-6 py-10 text-center sm:px-10">
        <Reveal>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            How it works
          </span>
        </Reveal>

        <RevealGroup className="flex flex-col gap-6 sm:flex-row sm:gap-10">
          {steps.map((s) => (
            <RevealItem key={s.title} className="flex max-w-56 flex-col items-center gap-2">
              <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <s.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1}>
          <Button asChild size="lg">
            <Link href="/plan">
              Start Planning <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
