# Aurora — the website factory

Give it a customer's URL and an idea. It scrapes their branding, content, images,
videos and YouTube links, then builds a **stunning, unique** website around them —
with an AI FAQ widget — and deploys it to `<project>.getyetti.com`.

Three commands run everything:

| Command | What it does |
|---|---|
| **`/build`** | Colleague gives a project name + reference URL + the idea → the whole repo becomes their site. Scrapes brand + content + **≥50 images** + media, designs the pages, wires the FAQ widget. |
| **`/run`** | Runs the app and fixes every build error until it's clean. |
| **`/deploy`** | Pushes to GitHub, creates + links a Vercel project, attaches `<project>.getyetti.com`. |

> The flow: **you give a URL → I build the site → you `/run` and ask for changes → `/deploy`.**

## Setup (once)

```bash
npm install
cp .env.example .env     # add OPENAI_API_KEY (widget) + GITHUB_TOKEN + VERCEL_TOKEN (deploy)
```

## Build a site

In Claude Code:

```
/build  acme  https://acme.com   — "a bold landing page for Acme's new product"
/run
/deploy
```

Or run the scraper directly:

```bash
npm run ingest -- https://acme.com --slug acme --apply   # brand + ≥50 images + media
npm run brand                                            # re-skin from brand.config.ts
```

## What every site ships with

- **A real design system** — OKLCH tokens re-skinned from one hue; **gradients welcome**.
- **Unique, rich UI** — image galleries, slideshows/carousels, distinctive navbars, bento,
  marquees, motion. lucide icons throughout. Real images, never placeholders.
- **An AI FAQ widget** — grounded in `content/knowledge.md` (seeded by the scrape).
- **A `/brand-guide` page** — live colors, type, components.

## The stack

Next.js 16 (App Router/RSC) · Tailwind v4 (no `tailwind.config.js`) · shadcn/ui ·
`motion` · lucide-react · OpenAI (widget).

## Layout

```
brand.config.ts          single source of truth (name, color, fonts, domain)
app/                     routes — page.tsx, brand-guide/, api/chat/ (widget)
components/{sections,ui,magic,widget}   magic/ = gallery, carousel, reveal, aurora, …
content/knowledge.md     the FAQ widget's source of truth
ideas/<slug>/            brief + scraped brand.json / content.md / media.json + inspiration
public/ingested/<slug>/  downloaded customer images
scripts/                 ingest-url (scraper), apply-brand, deploy
.claude/skills/          build · run · deploy
CLAUDE.md                the design law + how to build
```

See [`CLAUDE.md`](./CLAUDE.md) for the design rules.
