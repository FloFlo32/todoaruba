---
name: build
description: Turn a colleague's idea + reference URL + project name into a complete, stunning website. Scrapes the customer's branding, content, images, videos and YouTube links, studies the ideas folder for inspiration, rebuilds the whole site, and wires the AI FAQ widget. Use for "/build", "build the site", or any new project from a URL.
user-invocable: true
argument-hint: "<project-name> <reference-url> — then describe the idea"
---

# /build — idea + URL → a finished website

You own the whole build. Move fast, make it look amazing, follow `CLAUDE.md`'s design law.

## Step 0 — get the brief
You need three things. Ask only for what's missing:
1. **Project name** → the slug (lowercase, hyphenated). It becomes `<slug>.getyetti.com`.
2. **Reference URL** — the customer's existing site. **Most important input.**
3. **The idea** — one paragraph: what we're building and the vibe.

Check `ideas/<slug>/` for an `idea.md` and **inspiration images in `assets/`** the colleague dropped. Use them as design direction.

## Step 1 — scrape everything from the URL
```
npm run ingest -- <reference-url> --slug <slug> --apply
npm run brand
```
This downloads the brand color (→ OKLCH hue), **logo** (the real navbar/footer mark, kept
separate from the favicon), fonts, tagline, description, content, FAQ, **≥50 real images**
(to `public/ingested/<slug>/`), the **inner-page list + nav/footer links**, the **section
chronology**, any **WhatsApp number / phone / location**, plus videos + YouTube links
(`ideas/<slug>/media.json`). It sets `brand.config.ts` (name, fonts, hue, `contact`,
`domain: <slug>.getyetti.com`).

**Then read `ideas/<slug>/brand.json` and `content.md` carefully — they are your build
plan:**
- **`logo` vs `favicon`** — the LOGO is the navbar/footer mark; put it in the navbar and
  footer. The FAVICON is only the browser-tab icon. They are NOT the same. If
  `logo` is null and `logoNote` says "inline svg", open the source and recreate the mark
  in `components/icons.tsx`. Copy the logo into `public/` for use.
- **`sectionOrder`** — the chronology to mirror on the landing page.
- **`innerPages` / `navItems` / `footerItems`** — every one of these becomes a real route
  you build in Step 2j. Do not skip inner pages.
- **`whatsapp` / `phone` / `location`** — wire the WhatsApp widget + Map (Step 2k).
- If the brand color or fonts look wrong, fix `brand.config.ts` and re-run `npm run brand`.
- If fewer than 50 images came back, top up with Pexels/Unsplash (verify URLs resolve).

## Step 2 — design the site (make it unmistakably custom)
Replace the demo: rewrite `app/page.tsx` and the `components/sections/*` for THIS brand.
The bar is **"who designed this?", never "which AI made this?"**. Generic = failure. Before
you write a line, pick a **point of view** for this brand (editorial? brutalist? warm &
organic? technical & precise? luxe & minimal?) and commit every decision to it.

### 2a — Define the design language first (decide, then build)
Write these down for yourself before coding; they make the whole site cohere:
- **One opinionated layout idea** the whole page hangs on (a structural grid, a recurring
  diagonal, an off-center axis, an editorial column system, oversized numerals…). Not
  "sections stacked centered."
- **A type pairing with personality** (see 2b). **A confident color move** (see 2c).
- **A signature element** that repeats 2–3× so the site feels authored (a custom card
  shape, a recurring badge/eyebrow style, a divider motif, a consistent corner treatment).

### 2b — Typography: the display face does the work
- **Do not default to Inter/Geist/Roboto for headings.** Pick a display face with a real
  voice and pair it deliberately. Strong, free pairings to reach for:
  *Space Grotesk · Clash Display · Fraunces (high-contrast serif) · Instrument Serif ·
  Sora · Bricolage Grotesque · Satoshi · General Sans · Geist Mono for labels.* The
  display face should not be the body face.
- **Dramatic hierarchy:** hero `text-6xl`–`text-8xl`, `font-bold`/`font-semibold`, tight
  tracking (`tracking-tight`/`-0.02em`), `text-balance`, `leading-[0.95]`. Section heads
  `text-4xl`–`text-5xl`. Body `text-base`–`text-lg`, `leading-relaxed`,
  `text-muted-foreground`. **Never a flat 16px wall.**
- Use a small mono/uppercase tracked **eyebrow** (`text-xs uppercase tracking-[0.2em]`)
  above section heads as a recurring motif. Fonts are wired via `brand.config.ts` →
  `npm run brand`; change the display family there, don't hardcode.

### 2c — Color: commit, don't beige-out
- Drive everything from the semantic tokens (`bg-primary`, `text-foreground`,
  `text-muted-foreground`, `bg-card`, `border-border`, `bg-accent`) so it re-skins from
  `brand.config.ts`. **Pull the real brand hue from the scrape.**
- **Have a dominant color and use it with conviction** — a saturated hero, a color-blocked
  section, a dark section for contrast against the light ones. Sites that whisper in grey
  read as templates. **Gradients & gradient text are encouraged** (`text-gradient`,
  aurora/mesh backgrounds, gradient borders/buttons) — let them *punctuate*, not coat
  everything. One or two surfaces should feel bold.
- Layer depth: tinted shadows (`shadow-primary/10`), glass (`backdrop-blur`), subtle
  borders, `AuroraBackground`/`GridPattern` behind heroes & CTAs.

### 2d — Navbar: make it specific, never the generic centered bar
Pick one and tailor it to the brand — **do not ship logo-left + centered-links + button-right.**
Options: a **pill/floating nav** (rounded, `backdrop-blur`, shadow, detached from the top
edge), a **split/asymmetric** bar, a **mega-menu**, a **sidebar/rail**, or a bordered
**editorial** header with an eyebrow row. Add a scroll state (shrinks / gains blur+border
on scroll). Mobile gets a real sheet/drawer, not a squished row.

### 2e — Cards & elements: authored, not stock shadcn boxes
- **No identical rounded-xl + border + p-6 cards in a row.** Vary them: differing sizes in
  a **bento** (`components/sections/bento.tsx`), an accent-bordered "featured" card, cards
  with an image bleed to the edge, a number/eyebrow, or a gradient-on-hover surface.
- Give cards **real hover states** (see 2g). Reserve `BorderBeam` for **one** hero/featured
  element only. Asymmetry, overlap, and varied spacing are good, avoid the even 3-up grid.
- **Image cards: image on top, text BELOW it on a solid surface.** Use `ImageCard`
  (`components/magic/image-card.tsx`). **Never** a full-bleed image with the title/text
  laid over it behind a dark gradient overlay. That pattern looks cheap and the text goes
  unreadable. If text truly must sit on an image, put it on a solid token panel, not a
  scrim.

### 2f — Icons: lucide only
Every icon from `lucide-react`; brand glyphs (GitHub/X) from `components/icons.tsx`. **No
emoji-as-icons, no random inline SVGs.** Icon-only buttons require `aria-label`. Keep icon
sizing/stroke consistent across a section.

### 2g — Interaction & cursor (this is what makes it feel built by a person)
- **Everything clickable shows `cursor-pointer`** — buttons, links, cards-as-links, tabs,
  carousel controls, the FAQ toggle. Disabled → `cursor-not-allowed`. Don't leave the
  default arrow on interactive elements.
- **Every interactive element has a visible hover + focus-visible state**: buttons lift /
  shift bg / gain shadow; cards raise (`hover:-translate-y-1 hover:shadow-lg`) with a
  `transition`; links get an underline/color move; nav items animate an underline.
  Always keep a `focus-visible:ring` for keyboard users. Use `transition-colors`/
  `transition-transform` with `duration-200`–`300` and `ease-out`.

### 2h — Motion: tasteful and human, NOT "AI animation"
- **Banned (the tells of generated sites):** everything fading up in unison on load, the
  same `whileInView fade+slide` on every block, slow 1s+ floaty fades, looping
  pulse/bounce on static content, gratuitous parallax.
- **Do instead:** wrap entering content in `Reveal`/`RevealGroup` (`components/magic/reveal`)
  with **staggered** children (50–80ms apart) and **short** durations (300–500ms, ease-out).
  Animate **on purpose** — a hero headline word-reveal, a number count-up in stats, a
  marquee of logos, smooth carousel/gallery transitions, hover micro-interactions (2g).
  Movement should be small and snappy, not drifting. **All motion respects
  `prefers-reduced-motion`** (the wrappers already do; keep it that way).

### 2i — Imagery & structure (HARD RULES)
- A hero using their real imagery + a tasteful gradient/atmosphere layer.
- An **image `Gallery`** (`components/magic/gallery.tsx`) and a **`Carousel` slideshow**
  (`components/magic/carousel.tsx`) fed by the downloaded images
  (`ideas/<slug>/media.json` → `/ingested/<slug>/...`). Real photos, **never colored boxes.**
- **🚨 Image performance (HARD RULE — see CLAUDE.md §5):** route the bulk of those ≥50
  images **through `Gallery`/`Carousel`** (plain lazy `<img>`). Use **≤10 `next/image`**
  tags per page for standalone shots, exactly **one** with `priority` (the hero). Never
  scatter 50 `next/image` tags across a page — that's what crashes the build. Ingested
  files are already compressed to ≤1600px WebP by `npm run ingest`.
- Embed their **videos / YouTube** where it helps.
- **Readability is non-negotiable.** No dark text on a dark/saturated surface or over a
  busy image. Text over media goes on a solid token panel (`bg-card`/`bg-background`) or
  flips to a light token. Body copy clears ~4.5:1. (See CLAUDE.md §0.)

### 2j — Layout variety: do NOT do grid, grid, grid
- Use a grid where a grid is right, but break the page rhythm. Rotate through:
  an **auto-advancing slider** (`components/magic/auto-slider.tsx`, `AutoSlider`) for card
  rows / testimonials / gallery; a **marquee** (`components/magic/marquee.tsx`) for
  logos/tags; a **carousel** slideshow; an **image gallery** with lightbox; **bento** with
  varied cells; alternating image/text rows; a sticky-scroll section.
- **Follow the source site's chronology.** Order the landing sections to match
  `brand.json` → `sectionOrder`. Lead with what they lead with, then make it better.
- **Varied sections, never hero -> 3 cards -> footer.** Compose 6+ distinct sections.

### 2k — Inner pages (do NOT skip these) + contact
- **Build every inner page** the scrape found (`brand.json` → `innerPages`, `navItems`,
  `footerItems`). One route each: `app/<path>/page.tsx`, plus a detail template
  `app/<thing>/[slug]/page.tsx` where the source has detail pages. Each inner page MUST:
  carry the real navbar + footer; set `metadata` (title + description); use real scraped
  images via `ImageCard`/`Gallery`; have a proper hero/header, 2-4 real sections, and a
  CTA. **Same polish bar as home, never a thin stub.** Wire `navItems` to these routes.
- **WhatsApp:** if `brand.contact.whatsapp` is set, the `WhatsAppWidget` is already mounted
  globally and appears automatically. Confirm it shows and links to the right number.
- **Location:** if `brand.contact.address`/`mapQuery` is set, place the `Map` section
  (`components/sections/map.tsx`) where the source puts its location in the chronology.
- **Logo, not favicon:** put the real logo (`brand.json` → `logo`, copied to `public/`)
  in the navbar AND footer. The favicon is for the browser tab only.

### 2l — Copy rules
- Pull copy from `ideas/<slug>/content.md` and **sharpen it**: concrete outcomes, real
  verbs. No "Welcome to our platform" / "Empower your workflow" filler.
- **No em dashes or en dashes (— –) anywhere in copy, headings, buttons, alt text, or
  metadata.** Use a period, comma, colon, or parentheses. Strict.

## Step 3 — wire the FAQ widget
The widget is mounted globally. Confirm `content/knowledge.md` reflects the brand (the
scraper seeds it from the FAQ + content); refine its topics and the greeting/name in
`components/widget/faq-widget.tsx`.

## Step 4 — brand guide + finish
Update `/brand-guide` so it reflects the new brand. Then hand off to **`/run`** to clear
any build errors. Tell the colleague what you built and that `/run` then `/deploy` are next.

## Checklist
- [ ] Scraped; `brand.json` reviewed; `npm run brand` run; domain = `<slug>.getyetti.com`
- [ ] Real **logo** in navbar AND footer (NOT the favicon); favicon set for the tab only
- [ ] **Inner pages built** for every `innerPages`/`navItems` entry; nav links wired; each
      inner page has navbar+footer, metadata, real images, 2-4 sections, a CTA (no stubs)
- [ ] Landing sections follow the source **chronology** (`sectionOrder`)
- [ ] A clear point of view + a signature element that repeats across the page
- [ ] Distinctive **display font** (not Inter/Geist/Roboto); dramatic type hierarchy; eyebrows
- [ ] Brand color used with conviction; **all text readable** (no dark-on-dark, contrast OK)
- [ ] **Distinctive navbar** with a scroll state + real mobile menu (not centered-links bar)
- [ ] **Layout variety**: not grid/grid/grid (use AutoSlider / marquee / carousel / bento)
- [ ] Image+text uses **`ImageCard`** (image then text); NO text-over-image overlay cards
- [ ] **`cursor-pointer` + hover + focus-visible** on every interactive element
- [ ] Motion is staggered, short, on-purpose; no unison fade-up; `prefers-reduced-motion` ok
- [ ] >=50 real images (no placeholders); lucide icons only
- [ ] <=10 `next/image` per page (one `priority`); bulk images go through `Gallery`/`Carousel`
- [ ] **WhatsApp widget** shows when a number was found; **Map** added when a location exists
- [ ] **No em dashes / en dashes** anywhere in copy, headings, buttons, alt, or metadata
- [ ] Videos / YouTube embedded where relevant; copy sharpened (no filler)
- [ ] FAQ widget knowledge reflects the brand; `/brand-guide` updated
- [ ] `/run` passes (build green) and the dev server boots
