import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Reveal, RevealGroup, RevealItem } from "@/components/magic/reveal";
import { ImageCard } from "@/components/magic/image-card";
import { blogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Discover",
  description: "Practical answers on safety, weather, timing, and where to stay in Aruba.",
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArubaTipsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-px mx-auto max-w-6xl py-14 sm:py-20">
          <Reveal>
            <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">Discover</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Practical, no-fluff answers on safety, weather, timing, and where to stay.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <RevealItem key={post.slug}>
                <ImageCard
                  href={`/discover/${post.slug}`}
                  src={post.image}
                  alt={post.title}
                  eyebrow={formatDate(post.publishedAt)}
                  title={post.title}
                  description={post.excerpt}
                  className="h-full"
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </main>
      <Footer />
    </>
  );
}
