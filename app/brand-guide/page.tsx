import type { Metadata } from "next";
import { brand } from "@/brand.config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";

export const metadata: Metadata = {
  title: "Brand guide",
  description: `The living brand guide for ${brand.name} — colors, typography, logo, and components.`,
};

const SWATCHES: { token: string; label: string; fg?: string }[] = [
  { token: "bg-background", label: "background", fg: "text-foreground" },
  { token: "bg-foreground", label: "foreground", fg: "text-background" },
  { token: "bg-primary", label: "primary", fg: "text-primary-foreground" },
  { token: "bg-secondary", label: "secondary", fg: "text-secondary-foreground" },
  { token: "bg-muted", label: "muted", fg: "text-muted-foreground" },
  { token: "bg-accent", label: "accent", fg: "text-accent-foreground" },
  { token: "bg-card", label: "card", fg: "text-card-foreground" },
  { token: "bg-destructive", label: "destructive", fg: "text-destructive-foreground" },
  { token: "bg-aurora-1", label: "aurora-1" },
  { token: "bg-aurora-2", label: "aurora-2" },
  { token: "bg-aurora-3", label: "aurora-3" },
];

const TYPE_SCALE = [
  { cls: "text-6xl font-bold", label: "Display / 6xl" },
  { cls: "text-4xl font-bold", label: "Heading / 4xl" },
  { cls: "text-2xl font-semibold", label: "Subhead / 2xl" },
  { cls: "text-base", label: "Body / base" },
  { cls: "text-sm text-muted-foreground", label: "Caption / sm muted" },
];

function Section({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <section className="border-t border-border py-14">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {note ? <p className="mt-1 text-sm text-muted-foreground">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function BrandGuide() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-5xl py-16">
          <header className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-sm text-muted-foreground">Brand guide</p>
              <h1 className="mt-2 text-5xl font-bold">{brand.name}</h1>
              <p className="mt-3 max-w-xl text-muted-foreground">{brand.tagline}</p>
            </div>
            <div className="grid size-20 place-items-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-lg shadow-primary/30">
              {brand.name.charAt(0)}
            </div>
          </header>

          <Section
            title="Color"
            note={`Derived from a single OKLCH hue (${brand.theme.hue}°). Re-skin by editing brand.config.ts → npm run brand.`}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {SWATCHES.map((s) => (
                <div
                  key={s.token}
                  className={`flex h-24 flex-col justify-end rounded-xl border border-border p-3 ${s.token} ${s.fg ?? "text-foreground"}`}
                >
                  <span className="font-mono text-xs">{s.label}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Typography" note={`Display: ${brand.fonts.display} · Body: ${brand.fonts.sans} · Mono: ${brand.fonts.mono}`}>
            <div className="space-y-6">
              {TYPE_SCALE.map((t) => (
                <div key={t.label} className="flex flex-col gap-1">
                  <span className="font-mono text-xs text-muted-foreground">{t.label}</span>
                  <span className={t.cls}>The quick brown fox jumps</span>
                </div>
              ))}
              <p className="pt-2 font-mono text-sm">
                mono · const ship = () =&gt; deploy();
              </p>
            </div>
          </Section>

          <Section title="Buttons" note="Variants share radius, focus ring, and press feedback.">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </Section>

          <Section title="Badges">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="accent">Accent</Badge>
            </div>
          </Section>

          <Section title="Radius & surfaces" note={`Corner style: ${brand.theme.corners}.`}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm font-medium">Card · rounded-lg</p>
                <p className="mt-1 text-sm text-muted-foreground">Standard surface.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-medium">Card · rounded-xl</p>
                <p className="mt-1 text-sm text-muted-foreground">Elevated surface.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-medium">Card · rounded-2xl</p>
                <p className="mt-1 text-sm text-muted-foreground">Feature surface.</p>
              </div>
            </div>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
