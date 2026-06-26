import {
  Palette,
  Rocket,
  Sparkles,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { BorderBeam } from "@/components/magic/border-beam";
import { GridPattern } from "@/components/magic/grid-pattern";
import { cn } from "@/lib/utils";

function Cell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <RevealItem
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className
      )}
    >
      {children}
    </RevealItem>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
      {children}
    </div>
  );
}

export function Bento() {
  return (
    <section id="bento" className="container-px mx-auto max-w-6xl py-24">
      <Reveal className="max-w-2xl">
        <h2 className="text-4xl font-bold sm:text-5xl">
          Everything that makes a site feel{" "}
          <span className="text-primary">premium</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Not a theme. A design system, motion layer, and deploy pipeline that
          stop your work looking like every other AI build.
        </p>
      </Reveal>

      <RevealGroup className="mt-14 grid auto-rows-[15rem] grid-cols-1 gap-4 md:grid-cols-3">
        {/* Featured — spans 2 cols, the single border-beam moment */}
        <Cell className="md:col-span-2">
          <BorderBeam duration={9} />
          <Icon>
            <Palette className="size-5" />
          </Icon>
          <h3 className="text-xl font-semibold">A real design system</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            OKLCH color scales, a display/body/mono type pairing, radius and
            shadow tokens — re-skin the entire site by changing one hue.
          </p>
          <div className="mt-auto flex gap-2 pt-4">
            {[265, 230, 160, 25, 320].map((h) => (
              <span
                key={h}
                className="size-7 rounded-full ring-1 ring-border"
                style={{ background: `oklch(0.62 0.2 ${h})` }}
              />
            ))}
          </div>
        </Cell>

        <Cell>
          <Icon>
            <Sparkles className="size-5" />
          </Icon>
          <h3 className="text-xl font-semibold">Motion, tastefully</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Scroll reveals, marquees and beams — all reduced-motion aware.
          </p>
        </Cell>

        <Cell>
          <Icon>
            <Gauge className="size-5" />
          </Icon>
          <h3 className="text-xl font-semibold">Fast by default</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            App Router, RSC, next/font, zero CLS. Lighthouse-friendly out of the
            box.
          </p>
        </Cell>

        <Cell>
          <Icon>
            <Rocket className="size-5" />
          </Icon>
          <h3 className="text-xl font-semibold">One-command deploy</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            GitHub repo + Vercel project + custom domain from a single script.
          </p>
        </Cell>

        {/* Spans 2 cols, grid-pattern texture */}
        <Cell className="md:col-span-2">
          <GridPattern variant="dots" className="opacity-60" />
          <Icon>
            <ShieldCheck className="size-5" />
          </Icon>
          <h3 className="text-xl font-semibold">
            Conventions your whole team shares
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Bundled Claude Code skills + Impeccable mean every teammate (and
            their AI) builds new pages the same impeccable way.
          </p>
        </Cell>
      </RevealGroup>
    </section>
  );
}
