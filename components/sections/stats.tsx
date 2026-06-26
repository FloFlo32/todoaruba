import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";

const points = [
  {
    label: "One hue, whole site",
    body: "Every surface derives from a single OKLCH value. Change it and the entire site re-skins — light and dark — with no find-and-replace.",
  },
  {
    label: "Designed by Impeccable",
    body: "A design detector runs on every UI edit. Gradient text, hero-metric bands and template card grids get caught before they ship.",
  },
  {
    label: "Live in one command",
    body: "Tokens in .env, then npm run ship creates the repo, links Vercel, and wires the custom domain. Code to live URL in minutes.",
  },
];

export function Proof() {
  return (
    <section id="stats" className="container-px mx-auto max-w-6xl py-24">
      <div className="grid gap-12 md:grid-cols-[1.1fr_1.4fr] md:gap-16">
        <Reveal>
          <h2 className="text-balance text-4xl font-bold sm:text-5xl">
            The proof is that you can&apos;t tell it&apos;s a starter.
          </h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            Most templates announce themselves. This one disappears into whatever
            brand you point it at — because the system underneath is real, not a
            skin painted on top.
          </p>
        </Reveal>

        <RevealGroup className="flex flex-col">
          {points.map((p, i) => (
            <RevealItem
              key={p.label}
              className={i > 0 ? "border-t border-border pt-7 mt-7" : ""}
            >
              <p className="font-mono text-sm text-primary">{p.label}</p>
              <p className="mt-2 text-lg text-pretty">{p.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
