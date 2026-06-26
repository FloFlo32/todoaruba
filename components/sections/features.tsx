import { Terminal, Paintbrush, Globe } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";

const steps = [
  {
    icon: Terminal,
    step: "01",
    title: "Clone & name it",
    body: "Edit one file — brand.config.ts — then run npm run brand. Name, colors, fonts, domain and metadata propagate across the whole project.",
    code: "npm run brand",
  },
  {
    icon: Paintbrush,
    step: "02",
    title: "Build with the system",
    body: "Compose pre-built sections and animated primitives. Impeccable + the bundled skills keep new pages on-brand automatically.",
    code: "npx shadcn@latest add card",
  },
  {
    icon: Globe,
    step: "03",
    title: "Ship in one command",
    body: "Drop your GitHub + Vercel tokens into .env and run the deploy script. Repo created, project linked, custom domain wired.",
    code: "npm run ship",
  },
];

export function Features() {
  return (
    <section id="features" className="container-px mx-auto max-w-6xl py-24">
      <Reveal className="max-w-2xl">
        <h2 className="text-4xl font-bold sm:text-5xl">
          Three steps to a site that ships
        </h2>
        <p className="mt-4 text-muted-foreground">
          The whole point of a starter: your colleague goes from zero to a
          branded, deployed site in an afternoon.
        </p>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <RevealItem
            key={s.step}
            className="relative flex flex-col rounded-2xl border border-border bg-card p-7"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <s.icon className="size-6" />
              </div>
              <span className="font-mono text-4xl font-bold text-foreground/10">
                {s.step}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.body}</p>
            <code className="mt-5 block rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-xs text-foreground/80">
              <span className="text-primary">$</span> {s.code}
            </code>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
