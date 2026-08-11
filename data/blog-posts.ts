export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string; // ISO date
  body: string[]; // paragraphs
}

export const blogPosts: BlogPost[] = [
  {
    slug: "is-aruba-safe-to-visit",
    title: "Is Aruba Safe to Visit?",
    excerpt:
      "Short answer: yes. Here's what actually makes Aruba one of the safer Caribbean destinations.",
    image: "/ingested/todoaruba/img-001.webp",
    publishedAt: "2026-06-02",
    body: [
      "Aruba is one of the safest destinations in the Caribbean. Average crime rates are low compared to other islands, and the people are famously friendly — Aruba consistently ranks among the most welcoming places to travel in the region.",
      "Weather-wise, you're also in good shape: Aruba sits just outside the hurricane belt, so it's rarely in the direct path of a storm. That's part of why the island sees so many repeat visitors year after year.",
      "As with anywhere, use normal travel common sense — keep an eye on your belongings on busy beaches, and stick to licensed operators for tours and water activities (this is exactly what our AI planner does automatically).",
    ],
  },
  {
    slug: "aruba-weather-guide",
    title: "What's the Weather Really Like in Aruba?",
    excerpt: "Aruba has the least rainfall of any island in the Caribbean. Here's what to actually expect.",
    image: "/ingested/todoaruba/img-035.webp",
    publishedAt: "2026-06-09",
    body: [
      "Aruba has the least rainfall of any island in the Caribbean, and the temperature stays around 28°C (82°F) almost all year long.",
      "Outside of the odd short shower, the sun is reliably out — one of the big reasons the island has such a high percentage of repeat visitors. It's also why an itinerary built for a specific week here tends to actually hold up, unlike destinations where you need a backup plan for every day.",
      "Steady trade winds keep things comfortable even in peak summer heat, which is also what makes Aruba such a strong wind- and kite-surfing destination.",
    ],
  },
  {
    slug: "beyond-the-beach-things-to-do-in-aruba",
    title: "Beyond the Beach: What Can You Do in Aruba?",
    excerpt:
      "Aruba's beaches get all the attention, but the island has a lot more going on than sand and sun.",
    image: "/ingested/todoaruba-real/010-www-myarubaguide-com-kini-kini-utv-1-verkleind-jpg.webp",
    publishedAt: "2026-06-16",
    body: [
      "Aruba is best known for its beaches, but there's a lot more to fill a trip. Historic Oranjestad is worth a slow walk for its museums and distinctly Caribbean colored buildings.",
      "Head to San Nicolas, known locally as \"Sunrise City,\" for a town covered in colorful, large-scale murals — it's become one of the island's best photo stops.",
      "For something more active, Arikok National Park covers nearly 20% of the island, with the Ayo and Casibari rock formations, natural pools, and desert-island landscape you won't see anywhere else in the Caribbean.",
      "And on the water: take a catamaran out to one of the island's famous shipwrecks for a snorkel, or go parasailing for a totally different view of the coastline. Our category pages for boat trips, snorkeling, diving, and ATV tours are a fast way to see what's bookable right now.",
    ],
  },
  {
    slug: "best-time-to-visit-aruba",
    title: "When's the Best Time to Visit Aruba?",
    excerpt: "Aruba is warm year-round, so timing is really about crowds and price, not weather.",
    image: "/ingested/todoaruba/img-029.webp",
    publishedAt: "2026-06-23",
    body: [
      "Because the weather is so consistently warm, Aruba works as a destination any month of the year — you're not really picking a season to avoid rain the way you might elsewhere.",
      "High season runs from mid-December through mid-April. That's when the most visitors are on the island, and prices for flights and hotels climb accordingly.",
      "If you're looking for a quieter, more affordable trip, aim for the summer months instead. You'll get the same beaches and the same weather, with noticeably smaller crowds at the popular spots.",
    ],
  },
  {
    slug: "where-to-stay-in-aruba",
    title: "Where Should You Stay in Aruba?",
    excerpt: "Palm Beach, Eagle Beach, or Oranjestad — here's how the island's main areas actually differ.",
    image: "/ingested/todoaruba-real/051-www-myarubaguide-com-booba-s-pontoon-085-webp.webp",
    publishedAt: "2026-06-30",
    body: [
      "Palm Beach is the most popular area to stay, and it's easy to see why — most of Aruba's high-rise hotels are here, along with the bulk of the island's casinos, restaurants, and watersports operators. If you want everything walkable, this is it.",
      "Eagle Beach's low-rise hotels suit a quieter stay. The beach itself is regularly rated among the best in the world, and it's noticeably less built-up than Palm Beach.",
      "Oranjestad sits a bit further from the beach, but makes up for it with color and character — it's the capital, so you get real Dutch colonial architecture, local shops, and a working harbor alongside the tourist spots.",
      "Wherever you base yourself, our AI planner accounts for travel time between areas when it builds your day-by-day itinerary, so you're not zig-zagging across the island.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
