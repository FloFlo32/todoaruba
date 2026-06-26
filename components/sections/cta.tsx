import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "@/brand.config";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons";
import { GridPattern } from "@/components/magic/grid-pattern";
import { Reveal } from "@/components/magic/reveal";

export function CTA() {
  return (
    <section id="cta" className="container-px mx-auto max-w-6xl py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-20 text-center sm:px-12">
          <GridPattern />
          <h2 className="mx-auto max-w-2xl text-balance text-4xl font-bold sm:text-5xl">
            Start your next site on <span className="text-primary">{brand.name}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Clone it, name it, ship it. The last starter you&apos;ll set up by hand.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={`https://github.com/${brand.social.github}`}>
                Get the starter <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`https://github.com/${brand.social.github}`}>
                <GitHubIcon className="size-4" /> Star on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
