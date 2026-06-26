# CLAUDE.md — how to build in this repo

This repo is a **website factory**. A colleague gives an idea, a reference URL, and a
project name. We scrape that site's branding + content + media, then build a
**stunning, unique** website around it with an AI FAQ widget — and deploy it.

Three commands run the whole thing:

- **`/build`** — colleague describes the idea + URL + project name → whole repo becomes their site.
- **`/run`** — run the app, fix every build/runtime error until it's clean.
- **`/deploy`** — push to GitHub, create + link a Vercel project, attach `<project>.getyetti.com`.

Keep it simple. No PRODUCT.md / DESIGN.md / ceremony. The rules below + `brand.config.ts`
are all you need. Build fast, make it look amazing.

---

## The stack (don't fight it)

Next.js 16 (App Router, RSC) · Tailwind v4 (CSS-first `@theme`, **no tailwind.config.js**;
tokens live in `app/globals.css`) · shadcn/ui (`npm run ui -- <name>`) · `motion` for
animation · **`lucide-react` for all icons** · OpenAI for the FAQ widget.

**Dev/build run on Webpack, not Turbopack.** `npm run dev` and `npm run build` pass
`--webpack` with a 4GB heap cap (`NODE_OPTIONS=--max-old-space-size=4096`). Turbopack (the
Next 16 default) leaks uncapped native memory on M-series Macs / Node 25+ and can grow to
tens of GB (vercel/next.js#93896); the Webpack path peaks at ~500MB. `npm run dev:turbo` is
the opt-in escape hatch if you want to try Turbopack. Use Node 20.9–24 (see `.nvmrc` → 24).

**`brand.config.ts` is the single source of truth** — name, colors, fonts, domain, socials.
UI/metadata import it directly; `npm run brand` syncs build-time surfaces. Never hardcode
the name, brand color, or domain in a component.

---

## Design law — make it look designed, not generated

The goal: a visitor asks "who made this?", never "which AI made this?". Average is
invisible. Have a point of view and commit to it.

### 0. Absolute bans (these come from real failures — do not ship them)
- **No em dashes or en dashes (— –) in ANY user-facing copy or generated content.**
  Use a period, comma, colon, or parentheses. This is strict. (Code/markdown docs aside,
  never put a — in headings, body, buttons, alt text, metadata, or knowledge.md.)
- **No text laid over a photo behind a dark gradient scrim.** That overlay pattern reads
  cheap and the text turns unreadable (dark text on dark gradient is the worst case).
  Pair image + text the right way: image in its own area, text BELOW on a solid surface.
  Use `components/magic/image-card.tsx` (`ImageCard`) so nobody reaches for the overlay.
- **No unreadable contrast.** Body text must clear ~4.5:1 on its background. Never dark
  text on a dark/saturated surface or a busy image. On a colored/photographic panel, put
  text on a solid token surface (`bg-card`/`bg-background`) or invert to a light token.
- **The favicon is NOT the logo.** The logo is the branded mark in the navbar + footer
  (`ideas/<slug>/brand.json` → `logo`). The favicon is a tiny tab/metadata icon only.
  Never use the favicon as the site logo.
- **No grid-grid-grid.** Do not stack three `md:grid-cols-3` sections in a row. Vary the
  layout (see §3).

### 1. Color — tokens, and gradients are welcome
- Drive color from the semantic tokens (`bg-primary`, `text-foreground`,
  `text-muted-foreground`, `bg-card`, `border-border`, `bg-accent`). The palette derives
  from one OKLCH hue in `globals.css`, so the site re-skins from `brand.config.ts`.
- **Gradients and gradient text ARE allowed and encouraged** here — use them with taste.
  `text-gradient`, aurora backgrounds, gradient borders/buttons, mesh gradients: all fair
  game when they add energy. Don't make *everything* a gradient; let it punctuate.
- Pull the brand color from the customer's site (the scraper sets the hue). Commit to it.

### 2. Typography — the display face does the work
- Headings use `--font-display`; body `--font-sans`; code/labels `font-mono`. Big
  headlines (`text-5xl`–`text-7xl`, `font-bold`, tight tracking, `text-balance`).
- Strong hierarchy: hero ≫ section heading ≫ body. Never a flat 16px wall.

### 3. Uniqueness + structure — mirror the source, vary the layout
Every site must feel custom. Don't ship hero → 3 cards → footer.

- **Follow the source site's chronology.** The landing page sections should track the
  order of the real site (`ideas/<slug>/brand.json` → `sectionOrder`, and
  `content.md` → "Section order on home"). If they lead with services, you lead with
  services. Mirror their narrative, then make each section better.
- **Build the inner pages.** The scrape lists them (`brand.json` → `innerPages`,
  `navItems`, `footerItems`). Create a real route under `app/<path>/page.tsx` for each
  (About, Services, a detail/[slug] template, Contact, etc.). Do NOT ship a one-page site
  when the source has more. Every inner page gets the navbar, footer, proper metadata,
  real images, and the same level of polish as home (see the build skill's inner-page bar).
- **Vary the layout — not grid, grid, grid.** Use grids where a grid is right, but break
  the rhythm with other shapes:
  - an **auto-advancing slider** (`components/magic/auto-slider.tsx`, `AutoSlider`) for
    cards/testimonials/gallery rows,
  - a **marquee** (`components/magic/marquee.tsx`) for logos/tags,
  - a **carousel** (`components/magic/carousel.tsx`) slideshow,
  - an **image gallery** (`components/magic/gallery.tsx`) with lightbox,
  - **bento** grids with varied cell sizes, alternating image/text rows, sticky scroll.
- **A distinctive navbar** — not the generic centered-links bar. Mega-menu, pill nav,
  sidebar, or a bold split layout, with the real **logo** in it. Make it brand-specific.
- **Image + text pairs use `ImageCard`** (image on top, text below). No overlay scrims.

### 4. Icons — lucide, always
All icons come from `lucide-react` (brand glyphs like GitHub/X live in
`components/icons.tsx`). No emoji-as-icons, no random SVGs. Icon-only buttons get `aria-label`.

### 5. Images — never empty, never colored boxes, **never unbounded**
- **A site without imagery is a bug.** Colored `<div>` placeholders where a photo
  belongs are forbidden.
- **If the customer's site has images, importing them is mandatory: download ≥50** of
  their real images during `/build` (the scraper saves them to `public/ingested/`,
  already compressed — see the hard limits below). Use them in the hero, galleries,
  slideshows, and section backgrounds.
- **Greenfield / not enough source images:** use **Pexels or Unsplash**. Verify URLs
  resolve before shipping (Unsplash shape:
  `https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=1600&q=80`). Prefer fewer
  real photos over many guessed ones. Also pull the customer's **videos + YouTube links**
  where relevant.
- Meaningful `alt` text in the brand's voice.

#### 🚨 Image performance — HARD RULES (breaking these crashes the build)
Rendering many full-size images at once melts the dev server / build (Next optimizes
every `next/image` on demand, and large source files exhaust memory). These limits are
**not optional**:

1. **≤ 10 images rendered per page** with `next/image`. This cap does **not** apply to:
   - images inside `Gallery` (`components/magic/gallery.tsx`) or `Carousel`
     (`components/magic/carousel.tsx`) — these use plain lazy `<img>`, not the
     optimizer, so a 50-image gallery is fine; **and**
   - cases where the **user explicitly asks** for more standalone images.
   If a layout needs many images, it IS a grid → put them in `Gallery`/`Carousel`.
2. **Compress at the source.** Every file in `public/ingested/` is auto-resized to
   ≤ 1600px on the long edge and re-encoded (`npm run ingest` does this with `sharp`).
   Never commit an image > ~400 KB. If you add images by hand, run them through the
   compressor or keep them small.
3. **`next/image` discipline** for the ≤10 standalone images:
   - Always set `sizes` (e.g. `sizes="(max-width:768px) 100vw, 50vw"`) and explicit
     `width`/`height` (or `fill` + a sized parent) — no layout shift.
   - `quality={70}`–`{80}`, never the default 100.
   - Exactly **one** `priority` image per page (the hero). Everything else is lazy
     (the default). Never put `priority` on more than one image.
4. **Bulk imagery → plain lazy `<img>`** (`loading="lazy" decoding="async"`) via
   `Gallery`/`Carousel`, never 50 `next/image` tags. This is the rule that prevents the
   "100-image repo won't compile" failure.

> Why: one colleague rendered ~100 unbounded images and the dev server collapsed before
> it could compile. Stay under the caps and route bulk images through the lazy
> grid/carousel components.

> ⚠️ Turbopack is **intentionally disabled** (`npm run dev`/`build` use `--webpack` + a 4GB
> heap cap). It leaks uncapped native memory and can balloon to tens of GB; don't re-enable
> it as the default. Use `npm run dev:turbo` only to deliberately test Turbopack.

### 6. Motion — present, tasteful, accessible
- Wrap entering content in `Reveal` / `RevealGroup` (`components/magic/reveal`). Stagger lists.
- Carousels/galleries animate smoothly; ease-out curves. Reserve `BorderBeam` for one
  featured element. All motion respects `prefers-reduced-motion` (the wrappers do).

### 7. Depth & polish
- Cards, glass (`backdrop-blur`), gradients, tinted shadows (`shadow-primary/10`) all
  allowed. Layer `AuroraBackground` / `GridPattern` behind heroes & CTAs for atmosphere.

### 8. Copy — specific, never filler
- No "Welcome to our platform" / "Empower your workflow". Lead with concrete outcomes,
  real verbs. Pull source copy from the scrape (`ideas/<slug>/content.md`) and sharpen it.

### 9. Widgets + contact (FAQ, WhatsApp, Map)
- **FAQ widget** (`components/widget/faq-widget.tsx`) is mounted globally and answers from
  `content/knowledge.md` (the scraper fills it). Always wired. Bottom-right.
- **WhatsApp widget** (`components/widget/whatsapp-widget.tsx`) is also mounted globally
  and renders ONLY when `brand.contact.whatsapp` is set (the scraper hunts for a
  wa.me / api.whatsapp number). Bottom-left, click-to-chat. If the source exposes a
  WhatsApp number, it MUST appear.
- **Map / location** (`components/sections/map.tsx`, `Map`) renders when
  `brand.contact.address`/`mapQuery` is set: a pin + embedded map. If the source has a
  location, add this section (place it where they place it in their chronology).

### 10. Accessibility
One `<h1>` per page; real landmarks (`main`/`nav`/`footer`/`section`); icon buttons
labeled; decorative layers `aria-hidden`; keep contrast (don't put
`text-muted-foreground` on `bg-muted`).

---

## Conventions
- `"use client"` only for state/effects/motion; default to Server Components.
- Class merging: `cn()` from `@/lib/utils`. Named exports, PascalCase files in
  `components/{sections,ui,magic,widget}`.
- Always finish with `/run` so `npm run build` passes before `/deploy`.

## Commands
`npm run ingest -- <url> --slug <s> --apply` (scrape brand + ≥50 images + media) ·
`npm run brand` (sync theme/fonts) · `npm run ui -- <c>` (add shadcn) ·
`npm run dev` / `npm run build` · `npm run ship` (deploy).

---

## Project instructions

<!-- ▼▼▼ Your house style. Brand voice, do/don'ts, favorite references. ▼▼▼ -->

_Add your own rules here._
