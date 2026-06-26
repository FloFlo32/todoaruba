#!/usr/bin/env node
/**
 * check — fast preflight "doctor" for the factory. Run it before the pipeline
 * (clean → build → run → deploy) to see at a glance what's ready and what isn't.
 *
 *   npm run check
 *
 * It reads files only (no build, no network) so it returns in well under a second.
 * Exit code 0 when there are no blockers, 1 when something would break the pipeline.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const C = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};
const MARK = { ok: C.green("✓"), warn: C.yellow("⚠"), fail: C.red("✗"), info: C.dim("·") };

const rows = [];
let group = "";
const head = (g) => ((group = g), rows.push({ head: g }));
const add = (status, label, detail = "") => rows.push({ status, label, detail });

const read = async (p) => readFile(join(root, p), "utf8").catch(() => null);
const has = (p) => existsSync(join(root, p));
const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ── load inputs ───────────────────────────────────────────────────────────────
let brand = null;
try {
  ({ brand } = await import(join(root, "brand.config.ts")));
} catch {}
const pkg = JSON.parse((await read("package.json")) || "{}");
const envText = (await read(".env")) || "";
const envVal = (k) => {
  const m = envText.match(new RegExp(`^\\s*${k}\\s*=\\s*(.+)\\s*$`, "m"));
  return m && m[1].trim() ? m[1].trim() : "";
};
const settings = JSON.parse((await read(".claude/settings.json")) || "null");
const localSettings = JSON.parse((await read(".claude/settings.local.json")) || "null");

// ── 1. Permissions ──────────────────────────────────────────────────────────
head("Permissions");
{
  const mode =
    settings?.permissions?.defaultMode ||
    localSettings?.permissions?.defaultMode ||
    null;
  const inClaude = process.env.CLAUDECODE === "1" || !!process.env.CLAUDE_CODE_ENTRYPOINT;
  if (mode === "bypassPermissions") add("ok", "Bypass permissions", "defaultMode = bypassPermissions");
  else if (mode === "acceptEdits") add("warn", "Permission mode", "acceptEdits — Bash still prompts; pipeline may pause");
  else if (mode) add("warn", "Permission mode", `${mode} — pipeline may pause on prompts`);
  else
    add(
      "info",
      "Bypass permissions",
      inClaude
        ? "not pinned in settings — set at launch (--dangerously-skip-permissions / Shift+Tab)"
        : "not in a Claude Code session"
    );
}

// ── 2. Git ────────────────────────────────────────────────────────────────────
head("Git");
{
  const { execSync } = await import("node:child_process");
  const git = (cmd) => {
    try { return execSync(`git ${cmd}`, { cwd: root, stdio: "pipe", encoding: "utf8" }).trim(); }
    catch { return null; }
  };
  if (!has(".git")) add("warn", "Git repo", "not initialized — deploy will `git init`");
  else {
    const branch = git("rev-parse --abbrev-ref HEAD") || "?";
    const dirty = git("status --porcelain");
    if (dirty === null) add("warn", "Working tree", "couldn't read git status");
    else if (dirty === "") add("ok", "Working tree clean", `on ${branch}`);
    else add("warn", "Uncommitted changes", `${dirty.split("\n").length} file(s) on ${branch}`);
  }
}

// ── 3. Project identity ───────────────────────────────────────────────────────
head("Project");
{
  const placeholders = ["", "New Project", "Aurora", "Acme"];
  if (!brand) add("fail", "brand.config.ts", "missing or won't import");
  else {
    if (placeholders.includes(brand.name))
      add("warn", "Project name", `still "${brand.name}" — run /build or edit brand.config.ts`);
    else add("ok", "Project name", brand.name);

    if (!brand.domain || /example\.com$/.test(brand.domain))
      add("warn", "Domain", `${brand.domain || "unset"} — set <project>.getyetti.com`);
    else add("ok", "Domain", brand.domain);

    // package.json name should match the slug of the brand name
    const want = slug(brand.name);
    if (pkg.name !== want)
      add("warn", "brand sync", `package.json "${pkg.name}" ≠ "${want}" — run \`npm run brand\``);

    // globals.css hue should match brand.theme.hue
    const css = (await read("app/globals.css")) || "";
    const hue = css.match(/--brand-hue:\s*([\d.]+)/)?.[1];
    if (hue && brand.theme && String(brand.theme.hue) !== hue)
      add("warn", "theme sync", `globals hue ${hue}° ≠ config ${brand.theme.hue}° — run \`npm run brand\``);
    else if (hue) add("ok", "Theme", `hue ${hue}° · ${brand.theme?.corners}`);
  }
}

// ── 4. Conventions (CLAUDE.md + skills) ───────────────────────────────────────
head("Conventions");
{
  const claude = await read("CLAUDE.md");
  if (!claude || claude.trim().length < 200) add("fail", "CLAUDE.md", "missing or stub");
  else add("ok", "CLAUDE.md", `${Math.round(claude.length / 1000)}k chars`);

  const skills = await readdir(join(root, ".claude/skills")).catch(() => []);
  const core = ["build", "run", "deploy", "clean", "check"];
  const missing = core.filter((s) => !skills.includes(s));
  if (missing.length) add("warn", "Pipeline skills", `missing: ${missing.join(", ")}`);
  else add("ok", "Pipeline skills", core.join(", "));

  if (skills.includes("impeccable")) {
    const hookOk = has(".claude/skills/impeccable/scripts/hook.mjs");
    add(hookOk ? "ok" : "warn", "Impeccable", hookOk ? "installed (design detector on)" : "skill present, hook script missing");
  } else {
    const refsHook = JSON.stringify(localSettings || "").includes("impeccable");
    add(refsHook ? "warn" : "info", "Impeccable", refsHook ? "hook referenced but skill not installed — `npx impeccable install`" : "not installed");
  }
}

// ── 5. Environment / tokens ───────────────────────────────────────────────────
head("Environment");
{
  add(has("node_modules") ? "ok" : "fail", "Dependencies", has("node_modules") ? "node_modules present" : "run `npm install`");
  if (!has(".env")) add("warn", ".env", "missing — `cp .env.example .env` and fill tokens");
  else {
    add("ok", ".env", "present");
    const tok = (k, why) => add(envVal(k) ? "ok" : "warn", k, envVal(k) ? "set" : `empty — ${why}`);
    tok("GITHUB_TOKEN", "needed for /deploy");
    tok("VERCEL_TOKEN", "needed for /deploy");
    tok("OPENAI_API_KEY", "needed for the FAQ widget");
  }
  add("info", "Node", process.version);
}

// ── Render ────────────────────────────────────────────────────────────────────
const counts = { ok: 0, warn: 0, fail: 0, info: 0 };
console.log(`\n${C.bold("🩺 Preflight check")} ${C.dim(brand?.name ? `· ${brand.name}` : "")}\n`);
for (const r of rows) {
  if (r.head) { console.log(`${C.bold(r.head)}`); continue; }
  counts[r.status]++;
  console.log(`  ${MARK[r.status]} ${r.label.padEnd(20)} ${C.dim(r.detail)}`);
}

const blockers = counts.fail;
console.log(
  `\n${C.bold("Summary")}  ${C.green(counts.ok + " ok")} · ${C.yellow(counts.warn + " warn")} · ${C.red(counts.fail + " fail")}`
);
if (blockers) {
  console.log(`${C.red("✗ Not ready")} — fix the ${C.red("✗")} items, then re-run ${C.bold("npm run check")}.\n`);
  process.exit(1);
} else if (counts.warn) {
  console.log(`${C.yellow("⚠ Ready with warnings")} — review ${C.yellow("⚠")} items (deploy needs tokens; build/run are fine).\n`);
  process.exit(0);
} else {
  console.log(`${C.green("✓ All clear")} — go: ${C.bold("/clean → /build → /run → /deploy")}.\n`);
  process.exit(0);
}
