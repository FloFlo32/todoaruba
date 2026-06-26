#!/usr/bin/env node
/**
 * clean — reset the repo to a blank, unbranded canvas so the CURRENT project's
 * branding can't bleed into the NEXT one. Run this between projects, before `/build`.
 *
 *   npm run clean            # DRY RUN — prints exactly what would change, touches nothing
 *   npm run clean -- --yes   # actually do it
 *
 * What it resets:
 *   · brand.config.ts        → neutral placeholder (name/colors/fonts/domain/socials)
 *   · app/page.tsx           → a blank "ready to build" canvas (demo sections removed)
 *   · content/knowledge.md   → empty FAQ knowledge base
 *   · public/ingested/*      → deleted (scraped images)
 *   · ideas/*                → deleted, except _template/ and README.md
 *   · then runs `npm run brand` to sync globals.css / fonts / package.json / README
 *
 * What it KEEPS (the reusable machinery): components/, lib/, scripts/, skills,
 * the design-token system, the FAQ widget, the brand-guide page (it re-reads the
 * neutral config automatically). It's all under git too, so a clean is reversible.
 */
import { writeFile, rm, mkdir, readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const GO = argv.includes("--yes") || argv.includes("-y") || argv.includes("--force");

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const NEUTRAL_BRAND = `/**
 * ────────────────────────────────────────────────────────────────────────────
 *  BRAND CONFIG — the single source of truth for this site.
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  This is the ONLY file most people need to edit to make the starter their own.
 *
 *  1. Edit the values below.
 *  2. Run:  npm run brand
 *
 *  (This file was reset to neutral defaults by \`npm run clean\`. Run \`/build\`,
 *   or fill it in by hand, to brand the site.)
 *
 *  Colors use OKLCH. Change the hue (0–360) to re-skin the whole site:
 *    hue 265 = violet · 230 = blue · 160 = emerald · 25 = red · 70 = amber
 */

export const brand = {
  /** Product / company name. Shows in the nav, hero, footer, <title>, OG tags. */
  name: "New Project",

  /** One-line value prop. Used in the hero sub-headline + meta description. */
  tagline: "Run /build to generate this site.",

  /** Longer description for SEO / Open Graph. ~150 chars is ideal. */
  description:
    "An unbranded starter awaiting /build — give it an idea, a reference URL, and a project name.",

  /** Primary domain WITHOUT protocol. \`/build\` sets this to <project>.getyetti.com. */
  domain: "example.com",

  /** Theme — drives the whole color system. Run \`npm run brand\` after editing. */
  theme: {
    /** Brand hue in OKLCH degrees (0–360). This single number re-skins the site. */
    hue: 255,
    /** Corner style. "sharp" = modern/editorial, "rounded" = friendly, "pill" = playful. */
    corners: "rounded" as "sharp" | "rounded" | "pill",
    /** Default color scheme on first paint. */
    defaultScheme: "dark" as "light" | "dark",
  },

  /** Fonts. Any Google Font name works — edit, then run \`npm run brand\`. */
  fonts: {
    /** Big headlines. Pick something with PERSONALITY — this is what breaks the AI look. */
    display: "Space Grotesk",
    /** Body / UI text. Keep it clean and readable. */
    sans: "Geist",
    /** Code / labels / kbd. */
    mono: "JetBrains Mono",
  },

  /** Links shown in the footer + used by deploy scripts. */
  social: {
    github: "your-org/your-repo",
    x: "",
    email: "",
  },
} as const;

export type Brand = typeof brand;
export default brand;
`;

const NEUTRAL_PAGE = `import { brand } from "@/brand.config";

/**
 * Blank canvas. \`npm run clean\` reset the site here. Run \`/build\` (idea + URL +
 * project name) to generate the real page, or compose it from components/sections/*.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-sm text-muted-foreground">{brand.name}</p>
      <h1 className="max-w-2xl text-balance text-4xl font-bold sm:text-5xl">
        Blank canvas. Ready to build.
      </h1>
      <p className="max-w-md text-pretty text-muted-foreground">
        Branding, theme, content and images have been reset. Run{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
          /build
        </code>{" "}
        with an idea, a reference URL, and a project name to generate the site.
      </p>
    </main>
  );
}
`;

const NEUTRAL_KNOWLEDGE = `# Knowledge base

This file is the FAQ widget's source of truth. It was reset by \`npm run clean\`.
The ingest pipeline (\`npm run ingest -- <url> --apply\`) overwrites it with content
scraped from the colleague's reference URL during \`/build\`.

Until then it is intentionally empty — the assistant answers ONLY from what's here.
`;

// ── Build the action list ─────────────────────────────────────────────────────
const actions = [];

actions.push({
  desc: "Reset brand.config.ts → neutral placeholder",
  run: () => writeFile(join(root, "brand.config.ts"), NEUTRAL_BRAND),
});
actions.push({
  desc: "Reset app/page.tsx → blank 'ready to build' canvas",
  run: () => writeFile(join(root, "app", "page.tsx"), NEUTRAL_PAGE),
});
actions.push({
  desc: "Reset content/knowledge.md → empty FAQ base",
  run: async () => {
    if (existsSync(join(root, "content"))) await mkdir(join(root, "content"), { recursive: true });
    return writeFile(join(root, "content", "knowledge.md"), NEUTRAL_KNOWLEDGE);
  },
});

// public/ingested/* (keep the folder, drop the images)
const ingested = join(root, "public", "ingested");
if (existsSync(ingested)) {
  const entries = await readdir(ingested).catch(() => []);
  const junk = entries.filter((e) => e !== ".gitkeep");
  if (junk.length) {
    actions.push({
      desc: `Delete ${junk.length} item(s) in public/ingested/`,
      run: async () => {
        for (const e of junk) await rm(join(ingested, e), { recursive: true, force: true });
        await writeFile(join(ingested, ".gitkeep"), "");
      },
    });
  }
}

// ideas/* except _template and README.md
const ideas = join(root, "ideas");
if (existsSync(ideas)) {
  const keep = new Set(["_template", "README.md"]);
  const entries = await readdir(ideas).catch(() => []);
  const drop = entries.filter((e) => !keep.has(e));
  if (drop.length) {
    actions.push({
      desc: `Delete generated ideas/: ${drop.join(", ")}`,
      run: async () => {
        for (const e of drop) await rm(join(ideas, e), { recursive: true, force: true });
      },
    });
  }
}

// ── Run or preview ────────────────────────────────────────────────────────────
console.log(`\n${c.bold("🧹 Clean")} — reset to a blank, unbranded canvas\n`);

const oldName = (await readFile(join(root, "brand.config.ts"), "utf8").catch(() => ""))
  .match(/name:\s*"([^"]*)"/)?.[1];
if (oldName && oldName !== "New Project") {
  console.log(`  current brand: ${c.cyan(oldName)}\n`);
}

actions.forEach((a) => console.log(`  ${GO ? c.yellow("•") : c.dim("·")} ${a.desc}`));
console.log(`  ${GO ? c.yellow("•") : c.dim("·")} Run \`npm run brand\` to sync theme / fonts / package.json / README`);

if (!GO) {
  console.log(
    `\n${c.dim("Dry run — nothing changed.")} Re-run to apply:\n  ${c.bold("npm run clean -- --yes")}\n` +
      `${c.dim("(Everything is under git, so a clean is reversible.)")}\n`
  );
  process.exit(0);
}

console.log("");
for (const a of actions) {
  await a.run();
  console.log(`  ${c.green("✓")} ${a.desc}`);
}

// Sync build-time surfaces from the now-neutral config.
try {
  execSync("npm run brand", { cwd: root, stdio: "ignore" });
  console.log(`  ${c.green("✓")} Synced theme / fonts / package.json / README`);
} catch {
  console.log(`  ${c.yellow("!")} Couldn't run \`npm run brand\` — run it manually.`);
}

console.log(
  `\n${c.green(c.bold("✓ Clean."))} Blank canvas ready. Next: ${c.bold("/build")} ` +
    `${c.dim("(idea + reference URL + project name)")}.\n`
);
