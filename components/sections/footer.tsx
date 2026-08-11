import Link from "next/link";
import { Mail } from "lucide-react";
import { brand } from "@/brand.config";

const planLinks = [
  { label: "Plan My Trip", href: "/plan" },
  { label: "Things To Do", href: "/things-to-do" },
  { label: "Discover", href: "/discover" },
];

const categoryLinks = [
  { label: "Boat Trips", href: "/things-to-do/boat-tours" },
  { label: "Snorkeling", href: "/things-to-do/snorkeling" },
  { label: "Scuba Diving", href: "/things-to-do/diving" },
  { label: "ATV & Off-Road", href: "/things-to-do/adventure" },
  { label: "Water Sports", href: "/things-to-do/water-activities" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="container-px mx-auto grid max-w-6xl gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Todo Aruba" className="h-8 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{brand.tagline}</p>
          {brand.social.email && (
            <a
              href={`mailto:${brand.social.email}`}
              className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Mail className="size-4 shrink-0" /> {brand.social.email}
            </a>
          )}
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold">Plan a trip</h4>
          <ul className="mt-4 space-y-2.5">
            {planLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold">Browse by category</h4>
          <ul className="mt-4 space-y-2.5">
            {categoryLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6">
        <p className="container-px mx-auto max-w-6xl text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {brand.name}. Aruba activities and itinerary planning.
        </p>
      </div>
    </footer>
  );
}
