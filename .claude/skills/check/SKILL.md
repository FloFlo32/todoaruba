---
name: check
description: Fast preflight "doctor" for the factory — reports permission mode, git cleanliness, .env tokens, project name/brand sync, CLAUDE.md and skills, deps. Use for "/check", "status", "are we ready", or before clean/build/run/deploy.
user-invocable: true
argument-hint: "(no args — prints a status report and a go / no-go verdict)"
---

# /check — preflight status

Run before the pipeline to see what's ready at a glance. Files-only, no build, sub-second.

## Run it
```
npm run check
```

## What it reports
- **Permissions** — whether bypass mode is pinned in `.claude/settings*.json`. If it
  isn't (the usual case), it's set at session launch (`--dangerously-skip-permissions`
  or Shift+Tab in Claude Code) — confirm with the user that the pipeline won't stall on
  prompts.
- **Git** — repo present, current branch, clean vs. uncommitted changes.
- **Project** — name + domain are real (not placeholders), and `package.json` /
  `globals.css` are in sync with `brand.config.ts` (else `npm run brand`).
- **Conventions** — `CLAUDE.md` present, the core skills (`build run deploy clean check`)
  exist, and whether Impeccable is installed.
- **Environment** — `node_modules`, `.env`, and the tokens `GITHUB_TOKEN` /
  `VERCEL_TOKEN` (deploy) and `OPENAI_API_KEY` (FAQ widget).

## Reading the result
- `✗` = blocker → exit code 1. Fix before proceeding.
- `⚠` = warning → safe to build/run; deploy needs the flagged item (e.g. tokens).
- `✓` = good.

## How to use it in a flow
1. Run `npm run check` and relay the summary.
2. If there are `✗` blockers, stop and fix them (install deps, restore `CLAUDE.md`, …).
3. If only `⚠`, tell the user what's missing for each downstream step, then proceed:
   **`/clean` → `/build` → `/run` → `/deploy`** (deploy only once tokens are set).
