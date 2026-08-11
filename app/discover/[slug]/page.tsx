import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/magic/reveal";
import { blogPosts, getBlogPost } from "@/data/blog-posts";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ArubaTipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-2xl py-10 sm:py-14">
          <Reveal>
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Discover
            </Link>
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {formatDate(post.publishedAt)}
            </p>
            <h1 className="mt-2 text-balance font-display text-3xl font-bold sm:text-4xl">{post.title}</h1>
          </Reveal>

          <Reveal delay={0.06} className="mt-8 overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={post.title} className="aspect-[16/9] w-full object-cover" />
          </Reveal>

          <Reveal delay={0.1} className="mt-8 space-y-5">
            {post.body.map((paragraph, i) => (
              <p key={i} className="text-pretty leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
              <h2 className="font-display text-xl font-bold">Ready to plan your trip?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Answer a few quick questions and we&apos;ll build your day-by-day Aruba itinerary.
              </p>
              <Button asChild size="lg" className="mt-4">
                <Link href="/plan">
                  Plan My Trip <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
