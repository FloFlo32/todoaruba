<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions

**Read [`CLAUDE.md`](./CLAUDE.md)** before writing any UI. This repo is a website
factory driven by three commands in `.claude/skills/`:

- **`/build`** — idea + reference URL + project name → a full, stunning site (scrapes
  branding + content + ≥50 images + videos/YouTube, wires the AI FAQ widget).
- **`/run`** — run the app, fix every build error.
- **`/deploy`** — GitHub + Vercel + `<project>.getyetti.com`.

Design law (full version in CLAUDE.md): make it unique (galleries, slideshows,
distinctive navbars), **gradients and gradient text are allowed**, **lucide icons
always**, **real images are mandatory** (import ≥50 from the customer's site). Keep it
simple — no PRODUCT.md/DESIGN.md ceremony.
