import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ViatorWidgetGrid } from "@/components/booking/viator-widget";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/magic/reveal";
import { categories, getCategory } from "@/data/categories";
import { getActivitiesByCategory, VIATOR_WIDGET, CATEGORY_VIATOR_WIDGETS } from "@/data/activities";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.seoTitle,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const list = getActivitiesByCategory(slug);
  const widget = CATEGORY_VIATOR_WIDGETS[category.slug] ?? VIATOR_WIDGET;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-6xl py-14 sm:py-20">
          <Reveal className="max-w-2xl">
            <Link href="/things-to-do" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              &larr; All categories
            </Link>
            <h1 className="mt-4 text-balance font-display text-4xl font-bold sm:text-5xl">
              {category.seoTitle}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{category.description}</p>
            <Button asChild className="mt-6">
              <Link href="/plan">Build this into my itinerary</Link>
            </Button>
          </Reveal>

          {list.length > 0 ? (
            <Reveal className="mt-12">
              <ViatorWidgetGrid partnerId={widget.partnerId} widgetRef={widget.widgetRef} />
            </Reveal>
          ) : (
            <p className="mt-12 text-muted-foreground">
              New {category.name.toLowerCase()} activities are being added soon.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
