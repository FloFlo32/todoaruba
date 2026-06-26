import Link from "next/link";
import { ArrowRight, Palette, Zap, Rocket } from "lucide-react";
import { brand } from "@/brand.config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GridPattern } from "@/components/magic/grid-pattern";
import { BorderBeam } from "@/components/magic/border-beam";
import { AuroraBackground } from "@/components/magic/aurora-background";
import { Reveal } from "@/components/magic/reveal";

const previews = [
  { icon: Palette, title: "Design system", body: "OKLCH tokens, one hue, full dark mode." },
  { icon: Zap, title: "Motion built-in", body: "Reveals and beams, reduced-motion safe." },
  { icon: Rocket, title: "One-command deploy", body: "GitHub + Vercel + domain from a script." },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <AuroraBackground />
      <GridPattern />

      <div className="container-px mx-auto max-w-6xl pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
        <Reveal>
          <Badge variant="accent" className="mx-auto">
            <span className="font-mono">{brand.social.github}</span>
          </Badge>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
            Ship a website that looks{" "}
            <span className="text-gradient">designed</span>, not generated.
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {brand.description}
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="#cta">
                Start building <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#features">See what's inside</Link>
            </Button>
          </div>
        </Reveal>

        {/* Product preview — flat surface, one traveling beam as the single featured motion */}
        <Reveal delay={0.26}>
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xl shadow-primary/5">
              <BorderBeam />
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <span className="size-3 rounded-full bg-muted-foreground/30" />
                <span className="size-3 rounded-full bg-muted-foreground/30" />
                <span className="size-3 rounded-full bg-muted-foreground/30" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">
                  {brand.domain}
                </span>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-3">
                {previews.map((p) => (
                  <div key={p.title} className="bg-card p-5">
                    <p.icon className="size-5 text-primary" />
                    <p className="mt-3 font-medium">{p.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
