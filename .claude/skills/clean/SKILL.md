---
name: clean
description: Reset the repo to a blank, unbranded canvas between projects so the current brand can't bleed into the next one. Use for "/clean", "clean the branding", "wipe the theme", "start fresh", or before a new "/build".
user-invocable: true
argument-hint: "(no args — confirms, then resets branding/theme/page/content/images)"
---

# /clean — reset to a blank canvas

Run this between projects, before `/build`, so the previous site's brand, theme,
copy, and images don't conflict with the next one.

## What it resets
- `brand.config.ts` → neutral placeholder (name, hue, fonts, domain, socials)
- `app/page.tsx` → a blank "ready to build" canvas (demo sections removed)
- `content/knowledge.md` → empty FAQ knowledge base
- `public/ingested/*` → deleted (scraped images)
- `ideas/*` → deleted, except `_template/` and `README.md`
- then runs `npm run brand` to sync `globals.css`, fonts, `package.json`, README

## What it KEEPS
All reusable machinery: `components/`, `lib/`, `scripts/`, the skills, the design-token
system, the FAQ widget, and the brand-guide page (it re-reads the neutral config). It's
all under git, so a clean is reversible.

## How to run it
1. **Preview first (safe, default — changes nothing):**
   ```
   npm run clean
   ```
   It prints the current brand and the exact list of changes.
2. **Confirm with the user**, then apply:
   ```
   npm run clean -- --yes
   ```
3. Tell them it's a blank canvas and the next step is `/build` (idea + reference
   URL + project name).

## Notes
- Never run `--yes` without surfacing the dry-run list to the user first — it deletes
  scraped images and resets files (recoverable via git, but still destructive).
- If `npm run brand` fails at the end (e.g. a bad font name left over), run it manually.
