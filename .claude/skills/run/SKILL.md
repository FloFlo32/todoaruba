---
name: run
description: Build the app, fix every build/runtime error until clean, then start the dev server (npm run dev). Use for "/run", "run the app", "start the server", "fix the build", or before deploying.
user-invocable: true
argument-hint: "(no args needed)"
---

# /run — make it run, fix all errors, start the server

Get the app to a clean, working state AND leave the dev server running. Don't stop at the
first error; loop until green.

## Steps
1. **Production build:**
   ```
   npm run build
   ```
2. **If it fails:** read the error, fix the root cause in the code (types, imports,
   missing props, server/client boundaries, bad image paths), and run `npm run build`
   again. Repeat until it passes. Common fixes:
   - `"use client"` missing on a component using state/effects/motion.
   - Importing a server-only module into a client component.
   - A `lucide-react` icon that doesn't exist (check the name).
   - Image `src` pointing at a file that wasn't downloaded; fix the path or supplement.
3. **Start the dev server (REQUIRED, not optional):**
   ```
   npm run dev
   ```
   Start it **in the background** (it is long-running, never block on it). Wait for the
   "Ready" line, then confirm `http://localhost:3000` responds (e.g. a quick
   `curl -sI localhost:3000` returns 200). Verify the home page and `/brand-guide` render
   and the FAQ widget opens. Leave it running so the colleague can view the site; tell
   them the URL.
4. **Report**: state that the build is green and the dev server is live at
   `http://localhost:3000`, list anything you changed, and note any runtime warnings worth
   knowing before `/deploy`.

## Rules
- Fix the cause, not the symptom. Don't silence errors with `any` or `// @ts-ignore`
  unless there's truly no better option, and say so if you do.
- The build MUST pass before `/deploy`.
