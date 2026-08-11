import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ActivityCard } from "@/components/activity-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/magic/reveal";
import { guides, getGuide } from "@/data/guides";
import { getActivity } from "@/data/activities";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return { title: guide.seoTitle, description: guide.description };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-4xl py-14 sm:py-20">
          <Reveal>
            <Link href="/guides" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              &larr; All guides
            </Link>
            <h1 className="mt-4 text-balance font-display text-4xl font-bold sm:text-5xl">{guide.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{guide.description}</p>
            <Button asChild className="mt-6">
              <Link href="/plan">Build a version of this trip for my dates</Link>
            </Button>
          </Reveal>

          <div className="mt-12 space-y-12">
            {guide.days.map((day, i) => (
              <Reveal key={day.title} delay={i * 0.03}>
                <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                  Day {i + 1}
                </h2>
                <h3 className="mt-1 text-2xl font-bold">{day.title}</h3>
                <p className="mt-2 max-w-2xl text-muted-foreground">{day.narrative}</p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {day.activitySlugs.map((slug) => {
                    const activity = getActivity(slug);
                    return activity ? <ActivityCard key={slug} activity={activity} /> : null;
                  })}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
