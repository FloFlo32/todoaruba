---
name: deploy
description: Ship the site live — push to GitHub, create a Vercel project, link the repo, and attach <project>.getyetti.com. Use for "/deploy", "ship it", "publish", or "go live".
user-invocable: true
argument-hint: "(uses the project name from /build)"
---

# /deploy — push, link Vercel, attach getyetti.com subdomain

One command does it: `npm run ship`. Your job is the preflight and reading the result.

## Preflight
1. **Build is green** — run `/run` first if you haven't.
2. **Brand is set** — `brand.config.ts` has the real `name` and
   `domain: <project>.getyetti.com` (the `/build` ingest sets this). The deploy derives
   the subdomain + repo name from it.
3. **Tokens in `.env`** (gitignored — never commit):
   - `GITHUB_TOKEN` — PAT with `repo` scope.
   - `VERCEL_TOKEN` — from vercel.com/account/tokens.
   - `VERCEL_TEAM` — optional team slug (use the team that owns `getyetti.com`).

## Deploy
```
npm run ship -- --dry   # preview every step, no side effects
npm run ship            # for real
```
It commits → creates/reuses the GitHub repo (named after the project, under your token's
account unless `brand.social.github` is set to `owner/repo`) → pushes → creates/links the
Vercel project (framework nextjs) → triggers a production deploy → attaches
`<project>.getyetti.com`. Idempotent; safe to re-run.

## After
- **DNS:** in the `getyetti.com` zone, add `CNAME <project> → cname.vercel-dns.com`
  (the script prints the exact record). SSL issues automatically once DNS resolves.
- `getyetti.com` must exist in the Vercel account/team the token belongs to; if the
  domain attach fails with a permission error, add `getyetti.com` to that team first.
- Report the live URL: `https://<project>.getyetti.com`.

## Troubleshooting
- `GITHUB_TOKEN/VERCEL_TOKEN missing` → add to `.env`.
- Vercel project create fails → confirm the Vercel GitHub app can access the repo, or let
  the CLI deploy uploaded files.
- `domain_already_in_use` → already attached; safe to ignore.
