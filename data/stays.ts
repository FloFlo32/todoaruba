import type { Area } from "@/lib/types";

export interface StayArea {
  area: Area;
  name: string;
  blurb: string;
  bestFor: string;
  image: string;
}

/**
 * Real lodging zones only — the northwest strip (see lib/itinerary.ts). Arikok,
 * Mangel Halto, and Baby Beach are day-trip/nature areas with no real
 * accommodation, so they're left off a "where to stay" page on purpose.
 */
export const stayAreas: StayArea[] = [
  {
    area: "palm-beach",
    name: "Palm Beach",
    blurb:
      "The resort strip — big beachfront hotels, casinos, and restaurants an easy walk from a calm, protected swimming beach.",
    bestFor: "First-time visitors, nightlife, walkable dining",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    area: "eagle-beach",
    name: "Eagle Beach",
    blurb:
      "Wider and quieter than Palm Beach, with some of the best sand on the island and the famous fofoti trees.",
    bestFor: "Couples, families, more space",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
  },
  {
    area: "malmok",
    name: "Malmok",
    blurb:
      "North of the hotel strip and closer to the island's calmest snorkeling coves. Fewer restaurants within walking distance, more peace.",
    bestFor: "Snorkelers and divers, a quieter base",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    area: "oranjestad",
    name: "Oranjestad",
    blurb:
      "The capital — colorful Dutch-Caribbean streets, local eats, and shopping, with the beaches a short drive away.",
    bestFor: "Local culture, food, budget-friendly stays",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
  },
  {
    area: "de-palm",
    name: "De Palm",
    blurb: "Central to the hotel strip and a short hop from De Palm Island's watersports pier.",
    bestFor: "Watersports access, a central base",
    image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=80",
  },
];
