export interface Destination {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  live: boolean;
}

/**
 * Every place-specific thing on the site (activities, categories, copy) reads
 * from data, not hardcoded strings, so adding a destination is a content
 * change, not a rebuild. Aruba is the only live market for now; the roadmap
 * list below is what "coming soon" renders on /destinations.
 */
export const destinations: Destination[] = [
  {
    slug: "aruba",
    name: "Aruba",
    tagline: "One island, calm water year-round, live today.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    live: true,
  },
  { slug: "curacao", name: "Curaçao", tagline: "Coming soon", image: "", live: false },
  { slug: "miami", name: "Miami", tagline: "Coming soon", image: "", live: false },
  { slug: "cancun", name: "Cancún", tagline: "Coming soon", image: "", live: false },
  { slug: "dubai", name: "Dubai", tagline: "Coming soon", image: "", live: false },
];
