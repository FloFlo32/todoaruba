import Link from "next/link";
import { Mail } from "lucide-react";
import { brand } from "@/brand.config";
import { GitHubIcon, XIcon } from "@/components/icons";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Why us", href: "#bento" },
      { label: "Results", href: "#stats" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Get started", href: "#cta" },
      { label: "Brand guide", href: "/brand-guide" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="container-px mx-auto grid max-w-6xl gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              {brand.name.charAt(0)}
            </span>
            {brand.name}
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {brand.tagline}
          </p>
          <div className="mt-5 flex gap-2">
            <Link
              href={`https://github.com/${brand.social.github}`}
              aria-label="GitHub"
              className="grid size-9 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <GitHubIcon className="size-4" />
            </Link>
            <Link
              href={`https://x.com/${brand.social.x}`}
              aria-label="X"
              className="grid size-9 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <XIcon className="size-4" />
            </Link>
            <Link
              href={`mailto:${brand.social.email}`}
              aria-label="Email"
              className="grid size-9 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Mail className="size-4" />
            </Link>
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm font-semibold">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 py-6">
        <p className="container-px mx-auto max-w-6xl text-sm text-muted-foreground">
          © {brand.name}. Built on the {brand.name} starter pack.
        </p>
      </div>
    </footer>
  );
}
