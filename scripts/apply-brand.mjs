#!/usr/bin/env node
/**
 * apply-brand — propagate brand.config.ts across the files that can't import it
 * at runtime (package.json, globals.css theme, lib/fonts.ts, README title).
 *
 * Usage:  npm run brand
 *
 * Everything else (UI text, <title>, OG tags, footer) imports brand.config.ts
 * directly, so it's already live the moment you save. This script only patches
 * build-time-only surfaces, between clearly marked regions, so it's idempotent.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { brand } = await import(join(root, "brand.config.ts"));

const slug = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fontImport = (name) => name.replace(/[\s-]+/g, "_");

const radiusFor = { sharp: "0.3rem", rounded: "0.75rem", pill: "1.5rem" };

const log = (label, value) =>
  console.log(`  \x1b[2m·\x1b[0m ${label.padEnd(16)} \x1b[36m${value}\x1b[0m`);

async function patch(file, fn) {
  const path = join(root, file);
  const before = await readFile(path, "utf8");
  const after = fn(before);
  if (after !== before) await writeFile(path, after);
  return after !== before;
}

const between = (src, start, end, replacement) => {
  const re = new RegExp(`(${start})[\\s\\S]*?(${end})`, "m");
  if (!re.test(src)) throw new Error(`Markers not found: ${start} … ${end}`);
  return src.replace(re, `$1\n${replacement}\n$2`);
};

console.log(`\n\x1b[1m✦ Applying brand: ${brand.name}\x1b[0m\n`);

// 1. package.json name
await patch("package.json", (src) => {
  const json = JSON.parse(src);
  json.name = slug(brand.name);
  return JSON.stringify(json, null, 2) + "\n";
});
log("package.json", slug(brand.name));

// 2. globals.css — brand hue + radius
await patch("app/globals.css", (src) => {
  let out = between(
    src,
    "/\\* brand:hue:start \\*/",
    "/\\* brand:hue:end \\*/",
    `  --brand-hue: ${brand.theme.hue}; /* set by brand.config.ts */`
  );
  const radius = radiusFor[brand.theme.corners] ?? "0.75rem";
  out = out.replace(
    /--radius:\s*[^;]+;/,
    `--radius: ${radius};`
  );
  return out;
});
log("brand hue", brand.theme.hue);
log("corners", `${brand.theme.corners} (${radiusFor[brand.theme.corners]})`);

// 3. lib/fonts.ts — regenerate the next/font import block
await patch("lib/fonts.ts", (src) => {
  const d = fontImport(brand.fonts.display);
  const s = fontImport(brand.fonts.sans);
  const m = fontImport(brand.fonts.mono);
  const names = [...new Set([d, s, m])].join(", ");
  const block = `import { ${names} } from "next/font/google";

export const fontDisplay = ${d}({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
export const fontSans = ${s}({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
export const fontMono = ${m}({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});`;
  return between(src, "// brand:fonts:start", "// brand:fonts:end", block);
});
log("fonts", `${brand.fonts.display} / ${brand.fonts.sans} / ${brand.fonts.mono}`);

// 4. README — replace the H1 title line
await patch("README.md", (src) =>
  src.replace(/^#\s.*$/m, `# ${brand.name}`)
);
log("README title", brand.name);

console.log(
  `\n\x1b[32m✓ Brand applied.\x1b[0m Run \x1b[1mnpm run dev\x1b[0m to see it.\n` +
    `  \x1b[2mIf you changed fonts, restart the dev server.\x1b[0m\n`
);
