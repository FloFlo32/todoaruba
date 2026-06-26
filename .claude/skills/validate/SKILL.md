---
name: validate
description: Verify a deploy is actually live — GitHub repo has the code, Vercel project is connected and READY, and both the Vercel URL and the custom <slug>.getyetti.com domain serve 200 (no 404). Use for "/validate", "is it live", "check the deployment", or right after "/deploy".
user-invocable: true
argument-hint: "(no args — probes GitHub + Vercel + the live domain, then gives a verdict)"
---

# /validate — is the deploy actually live?

Run after `/deploy` to confirm everything is up end-to-end. Hits the network, so give
it a few seconds.

## Run it
```
npm run validate
```

## What it checks
1. **GitHub** — repo `owner/repo` (from `brand.social.github`) exists and has pushed
   commits.
2. **Vercel project** exists and is **connected to that GitHub repo**.
3. **Production deployment** is `READY` (not BUILDING / ERROR).
4. **Vercel URL** serves `200` (no 404).
5. **Custom domain** (`brand.domain`, i.e. `<slug>.getyetti.com`) is **attached and
   verified** on Vercel.
6. **Custom domain serves `200`** over HTTPS (no 404).

Tokens come from `.env` (`GITHUB_TOKEN`, `VERCEL_TOKEN`, optional `VERCEL_TEAM`) — the
same ones `/deploy` uses. Run `npm run check` first if you're unsure they're set.

## Reading the result
- `✗` = blocker → exit 1. Deploy isn't fully live.
- `⚠` = caveat (usually DNS/verification still settling, or build in progress) → exit 0.
- `✓` = live.

## Common fixes
- **Production deploy BUILDING / QUEUED** → wait ~1 min and re-run.
- **Domain not verified / domain 404** → finish DNS at the registrar
  (`A @ 76.76.21.21`, `CNAME www → cname.vercel-dns.com`), then re-run.
- **Project missing / not connected** → re-run `/deploy` (`npm run ship`).
- **Repo has no commits** → `/deploy` didn't push; re-run it.

When everything is `✓`, the site is live at `https://<brand.domain>`. That's the end of
the pipeline: `/check → /clean → /build → /run → /deploy → /validate`.
