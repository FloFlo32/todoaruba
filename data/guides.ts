export interface GuideDay {
  title: string;
  narrative: string;
  activitySlugs: string[];
}

export interface Guide {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  days: GuideDay[];
}

export const guides: Guide[] = [
  {
    slug: "3-day-aruba-itinerary",
    title: "The Perfect 3-Day Aruba Itinerary",
    seoTitle: "3-Day Aruba Itinerary: A Complete Weekend Plan",
    description:
      "A tight, three-day plan for a long weekend in Aruba: one big reef day, one adventure day, and one slow day before you fly home.",
    days: [
      {
        title: "Day 1: Ease In with the Water",
        narrative:
          "Fly in, get settled, and spend the afternoon in the calmest, clearest water on the island before doing anything more ambitious.",
        activitySlugs: ["reef-snorkel-turtle-swim", "oceanfront-beachfront-dinner"],
      },
      {
        title: "Day 2: Go Big",
        narrative:
          "Your one full day, so make it count: desert trails in the morning, open water in the evening.",
        activitySlugs: ["arikok-atv-adventure", "sunset-sailing-cruise"],
      },
      {
        title: "Day 3: Slow Down Before You Fly",
        narrative:
          "A short, easy morning near the water so you land at the airport relaxed instead of rushed.",
        activitySlugs: ["sup-kayak-eco-tour"],
      },
    ],
  },
  {
    slug: "7-day-aruba-itinerary",
    title: "The Perfect 7-Day Aruba Itinerary",
    seoTitle: "7-Day Aruba Itinerary: A Full Week Plan",
    description:
      "A full week in Aruba with room to breathe: reef days, an adventure day, a boat day, a food day, and real downtime.",
    days: [
      {
        title: "Day 1: Arrival & First Swim",
        narrative: "Land, unpack, and get in the water before dinner.",
        activitySlugs: ["reef-snorkel-turtle-swim"],
      },
      {
        title: "Day 2: Wreck & Reef",
        narrative: "A full morning on or under the water at Aruba's most famous dive/snorkel site.",
        activitySlugs: ["antilla-shipwreck-snorkel", "oceanfront-beachfront-dinner"],
      },
      {
        title: "Day 3: Into the Desert",
        narrative: "Arikok National Park by ATV, with a stop at the Natural Pool.",
        activitySlugs: ["arikok-atv-adventure"],
      },
      {
        title: "Day 4: Slow Day",
        narrative: "No plans, or the closest thing to it: a mangrove paddle and an easy afternoon.",
        activitySlugs: ["sup-kayak-eco-tour", "couples-spa-beach-cabana-day"],
      },
      {
        title: "Day 5: Out on the Water",
        narrative: "A full day on a boat, ending with the sky on fire.",
        activitySlugs: ["catamaran-party-cruise", "sunset-sailing-cruise"],
      },
      {
        title: "Day 6: Town & Table",
        narrative: "Oranjestad's history and its kitchens, in one afternoon.",
        activitySlugs: ["oranjestad-walking-history-tour", "local-flavors-food-rum-tour"],
      },
      {
        title: "Day 7: One Last Swim",
        narrative: "A last easy morning at the beach before the flight home.",
        activitySlugs: ["family-beach-day-snorkel-sampler"],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
