import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    slug: "water-activities",
    name: "Water Sports",
    seoTitle: "Best Water Sports & Activities in Aruba",
    description:
      "Jet skis, paddleboards, parasailing, and every way to get out on Aruba's calm turquoise water.",
    icon: "Waves",
  },
  {
    slug: "snorkeling",
    name: "Snorkeling",
    seoTitle: "Aruba Snorkeling Tours",
    description:
      "Reef and shipwreck snorkeling trips off Aruba's south and west coasts, guided and self-paced.",
    icon: "Fish",
  },
  {
    slug: "diving",
    name: "Diving",
    seoTitle: "Aruba Scuba Diving",
    description:
      "Wreck dives, reef dives, and PADI certification for every experience level.",
    icon: "Anchor",
  },
  {
    slug: "boat-tours",
    name: "Boat Tours",
    seoTitle: "Aruba Sunset Cruises & Boat Tours",
    description:
      "Sunset sailing, catamaran party cruises, and private charters along the coast.",
    icon: "Sailboat",
  },
  {
    slug: "adventure",
    name: "ATV & Off-Road",
    seoTitle: "Aruba ATV, UTV & Off-Road Tours",
    description:
      "ATV and UTV tours through Arikok National Park, off-road jeep safaris, and ziplining.",
    icon: "Mountain",
  },
  {
    slug: "food-dining",
    name: "Food & Dining",
    seoTitle: "Best Restaurants & Food Tours in Aruba",
    description:
      "Beachfront dinners, local food tours, and reservations worth planning a night around.",
    icon: "UtensilsCrossed",
  },
  {
    slug: "family",
    name: "Family",
    seoTitle: "Family Activities in Aruba",
    description: "Easy, safe, and genuinely fun activities for travelers with kids.",
    icon: "Users",
  },
  {
    slug: "romantic",
    name: "Romantic",
    seoTitle: "Romantic Things to Do in Aruba",
    description:
      "Aruba activities for couples: private sails, sunset dinners, and quiet beach time.",
    icon: "Heart",
  },
  {
    slug: "nightlife",
    name: "Nightlife",
    seoTitle: "Best Aruba Nightlife",
    description: "Beach bars, casinos, and late-night spots once the sun goes down.",
    icon: "Martini",
  },
  {
    slug: "nature",
    name: "Nature",
    seoTitle: "Aruba Nature & Outdoor Excursions",
    description: "National parks, natural pools, caves, and Aruba's desert-island landscape.",
    icon: "Trees",
  },
  {
    slug: "cultural-experiences",
    name: "Cultural Experiences",
    seoTitle: "Cultural Things to Do in Aruba",
    description: "Oranjestad history, local artisans, and the culture behind the postcard.",
    icon: "Landmark",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
