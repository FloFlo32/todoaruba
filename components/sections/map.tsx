import { MapPin, Navigation } from "lucide-react";
import { brand } from "@/brand.config";
import { Button } from "@/components/ui/button";

/**
 * Location section: an embedded Google map (no API key) beside an address card
 * with a real pin. Renders ONLY when brand.contact.address (or mapQuery) is set
 * (the scraper fills these). Mirror the source site: place it where they place it.
 */
export function Map() {
  const { address, mapQuery } = brand.contact ?? {};
  const query = mapQuery || address;
  if (!query) return null;

  const q = encodeURIComponent(query);
  const embed = `https://www.google.com/maps?q=${q}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${q}`;

  return (
    <section id="location" className="container-px mx-auto max-w-6xl py-24">
      <div className="grid items-stretch gap-6 overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col justify-center gap-5 p-8 sm:p-10">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Find us
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">Visit {brand.name}</h2>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
              <MapPin className="size-5" />
            </span>
            {address ? (
              <p className="text-pretty text-muted-foreground">{address}</p>
            ) : (
              <p className="text-muted-foreground">See the map for directions.</p>
            )}
          </div>
          <Button asChild className="w-fit">
            <a href={directions} target="_blank" rel="noopener noreferrer">
              <Navigation className="size-4" /> Get directions
            </a>
          </Button>
        </div>

        <div className="relative min-h-[20rem] border-t border-border md:border-l md:border-t-0">
          <iframe
            title={`Map showing ${brand.name}`}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 size-full"
          />
        </div>
      </div>
    </section>
  );
}
