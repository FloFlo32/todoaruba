/**
 * ────────────────────────────────────────────────────────────────────────────
 *  BRAND CONFIG — the single source of truth for this site.
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  This is the ONLY file most people need to edit to make the starter their own.
 *
 *  1. Edit the values below.
 *  2. Run:  npm run brand
 *
 *  The `brand` script propagates everything that can't be imported at runtime
 *  (package.json name, README title, theme colors in globals.css, env hints).
 *  Everything else (site name in the UI, <title>, OG metadata, footer, links)
 *  is imported directly from this file, so it updates the instant you save.
 *
 *  Colors use OKLCH — a perceptual color space. Keep the same lightness/chroma
 *  and just change the hue (the 3rd number) to re-skin the whole site:
 *    hue 265 = violet · 230 = blue · 160 = emerald · 25 = red · 70 = amber
 */

export const brand = {
  /** Product / company name. Shows in the nav, hero, footer, <title>, OG tags. */
  name: "Todo Aruba",

  /** One-line value prop. Used in the hero sub-headline + meta description. */
  tagline: "Your AI trip concierge for Aruba — tell us your dates, we plan and book the rest.",

  /** Longer description for SEO / Open Graph. ~150 chars is ideal. */
  description:
    "Tell us your dates and what you love, and Todo Aruba builds a personalized day-by-day Aruba itinerary you can book instantly.",

  /** Primary domain WITHOUT protocol. Swap to todo-aruba.com once that domain is live. */
  domain: "todoaruba.getyetti.com",

  /** Theme — drives the whole color system. Run `npm run brand` after editing. */
  theme: {
    /** Brand hue in OKLCH degrees (0–360). Tropical turquoise, matches the ocean. */
    hue: 183,
    /** Corner style. "sharp" = modern/editorial, "rounded" = friendly, "pill" = playful. */
    corners: "rounded" as "sharp" | "rounded" | "pill",
    /** Default color scheme on first paint. */
    defaultScheme: "light" as "light" | "dark",
  },

  /** Fonts. Any Google Font name works — edit, then run `npm run brand`. */
  fonts: {
    /** Big headlines. Warm editorial serif — travel-premium, not startup-generic. */
    display: "Fraunces",
    /** Body / UI text. Keep it clean and readable. */
    sans: "Inter",
    /** Code / labels / kbd — used for itinerary times, durations, prices. */
    mono: "JetBrains Mono",
  },

  /** Links shown in the footer + used by deploy scripts. */
  social: {
    github: "yetti-ai/todo-aruba",
    x: "todoaruba",
    // TODO: set this project's real support email before launch.
    email: "",
  },

  /**
   * Contact + location.
   * - whatsapp: digits only, country code first, no "+". Set it and a click-to-chat
   *   widget appears (components/widget/whatsapp-widget.tsx).
   * - address + mapQuery: set them and the <Map> section renders a pin + embedded map.
   * Left blank on purpose — this is a booking/itinerary product with no storefront
   * or support line of its own yet. Don't fill these with a scraped third party's
   * real contact details.
   */
  contact: {
    whatsapp: "",
    phone: "",
    address: "",
    mapQuery: "",
  },
} as const;

export type Brand = typeof brand;
export default brand;
