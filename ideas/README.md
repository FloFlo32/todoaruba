# ideas/ — drop a brief here, get a website

This is the inbox for the website factory. A colleague drops a brief + a reference
URL (+ optional images) into a folder here, and the build pipeline turns it into a
designed, on-brand site with an AI FAQ widget and a brand-guide page.

## How a colleague starts a project

1. **Make a folder:** `ideas/<project-slug>/`
2. **Copy the template:** copy `ideas/_template/idea.md` into it and fill it in.
   The **Reference URL is the most important field** — brand color, logo, fonts,
   and details are pulled from it.
3. **Drop images** (logo, screenshots, inspiration) into `ideas/<slug>/assets/`.
4. Hand it to the agent: *"build the site in ideas/<slug>"* (or run
   `/impeccable craft` and point it at the folder).

## What the agent does (the pipeline)

1. **Ingest the URL** — `npm run ingest -- <url> --slug <slug>` scrapes the brand
   (name, color → OKLCH hue, logo, fonts, tagline), the content, and the FAQ into
   `ideas/<slug>/` (`brand.json`, `content.md`, `faq.md`, downloaded `assets/`).
2. **Apply the brand** — extracted identity goes into `brand.config.ts`
   (`--apply`), then `npm run brand` re-skins the whole site.
3. **Design with Impeccable** — Impeccable is the design master. The agent uses
   `/impeccable craft` / `shape` / `polish` to build sections that are genuinely
   good, not templated. See `CLAUDE.md`.
4. **Wire the AI FAQ widget** — seeded from the scraped `content/knowledge.md`,
   answered by OpenAI (`OPENAI_API_KEY` in `.env`).
5. **Generate the `/brand-guide` page** — always present; documents the colors,
   type, logo, and components for the new brand.
6. **Ship** — `npm run ship` (GitHub + Vercel + domain).

## Folders

- `ideas/_template/` — copy this to start a project.
- `ideas/<slug>/` — one folder per project. Safe to commit or keep local.
