#!/usr/bin/env node
/**
 * deploy / ship — create the GitHub repo, push, deploy to Vercel, wire the domain.
 *
 *   npm run ship            # full pipeline
 *   npm run ship -- --dry   # print every step without executing
 *
 * Tokens are read from .env (gitignored — NEVER commit them):
 *   GITHUB_TOKEN   classic/fine-grained PAT with `repo` scope
 *   VERCEL_TOKEN   from https://vercel.com/account/tokens
 *   VERCEL_TEAM    (optional) team/org slug if the project lives in a team
 *
 * Target repo + domain come from brand.config.ts (social.github + domain).
 * The script is idempotent: re-running skips a repo/project that already exists.
 */
import { execSync } from "node:child_process";
import { existsSync, accessSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");

if (existsSync(join(root, ".env"))) process.loadEnvFile(join(root, ".env"));
const { brand } = await import(join(root, "brand.config.ts"));

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function die(msg) {
  console.error(`\n${c.red("✗")} ${msg}\n`);
  process.exit(1);
}
function step(n, msg) {
  console.log(`\n${c.bold(`[${n}]`)} ${msg}`);
}
function sh(cmd, opts = {}) {
  console.log(`    ${c.dim("$ " + cmd.replace(/(token[= ])\S+/gi, "$1***"))}`);
  if (DRY) return "";
  return execSync(cmd, { cwd: root, stdio: "pipe", encoding: "utf8", ...opts });
}

async function gh(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { ok: res.ok, status: res.status, json: await res.json().catch(() => ({})) };
}

async function vercel(path, { method = "GET", body } = {}) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (process.env.VERCEL_TEAM) url.searchParams.set("slug", process.env.VERCEL_TEAM);
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { ok: res.ok, status: res.status, json: await res.json().catch(() => ({})) };
}

// ── Preflight ───────────────────────────────────────────────────────────────
console.log(`\n${c.bold(`🚀 Shipping ${brand.name}`)}${DRY ? c.dim("  (dry run)") : ""}`);

if (!process.env.GITHUB_TOKEN) die("GITHUB_TOKEN missing. Add it to .env (see .env.example).");
if (!process.env.VERCEL_TOKEN) die("VERCEL_TOKEN missing. Add it to .env (see .env.example).");

// Project identity: every site lives at <slug>.getyetti.com.
// slug = the subdomain in brand.domain, else a slug of the project name.
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const slug = (() => {
  const d = String(brand.domain || "");
  const sub = d.endsWith(".getyetti.com") ? d.replace(/\.getyetti\.com$/, "") : "";
  return slugify(sub || brand.name || "site");
})();
const domain = `${slug}.getyetti.com`;
const explicitGh = String(brand.social.github || "");
const hasExplicitRepo = explicitGh.includes("/") && !explicitGh.startsWith("your-org");

// ── 1. Git ──────────────────────────────────────────────────────────────────
step(1, "Preparing local git");
if (!existsSync(join(root, ".git"))) sh("git init -b main");
try {
  accessSync(join(root, ".git"));
  sh("git add -A");
  try {
    sh('git commit -m "chore: initial commit from starter" --no-verify');
  } catch {
    console.log(`    ${c.dim("nothing to commit / already committed")}`);
  }
} catch {}

// ── 2. GitHub repo ──────────────────────────────────────────────────────────
step(2, "Resolving GitHub repo");
const me = await gh("/user");
if (!me.ok) die(`GitHub token rejected (${me.status}). Check GITHUB_TOKEN scopes (needs 'repo').`);
const owner = hasExplicitRepo ? explicitGh.split("/")[0] : me.json.login;
const repo = hasExplicitRepo ? explicitGh.split("/")[1] : slug;
const isUser = me.json.login?.toLowerCase() === owner.toLowerCase();
console.log(`    ${c.cyan(`${owner}/${repo}`)}`);

const existing = await gh(`/repos/${owner}/${repo}`);
if (existing.ok) {
  console.log(`    ${c.dim("repo already exists — reusing")}`);
} else if (!DRY) {
  const created = await gh(isUser ? "/user/repos" : `/orgs/${owner}/repos`, {
    method: "POST",
    body: { name: repo, private: false, description: brand.description },
  });
  if (!created.ok) die(`Failed to create repo (${created.status}): ${created.json.message}`);
  console.log(`    ${c.green("✓")} created ${created.json.full_name}`);
}

// ── 3. Push ─────────────────────────────────────────────────────────────────
step(3, "Pushing to GitHub");
const remote = `https://${process.env.GITHUB_TOKEN}@github.com/${owner}/${repo}.git`;
try {
  sh("git remote remove origin");
} catch {}
sh(`git remote add origin ${remote}`);
sh("git push -u origin main --force");

// ── 4. Vercel project + deploy ──────────────────────────────────────────────
step(4, "Linking & deploying to Vercel");
const proj = await vercel(`/v9/projects/${repo}`);
if (!proj.ok) {
  if (!DRY) {
    const made = await vercel("/v11/projects", {
      method: "POST",
      body: {
        name: repo,
        framework: "nextjs",
        gitRepository: { type: "github", repo: `${owner}/${repo}` },
      },
    });
    if (!made.ok) die(`Failed to create Vercel project (${made.status}): ${made.json.error?.message}`);
    console.log(`    ${c.green("✓")} project created & connected to GitHub`);
  }
} else {
  console.log(`    ${c.dim("Vercel project exists — reusing")}`);
}
// Trigger a production deploy from the connected repo via the CLI (handles upload).
const team = process.env.VERCEL_TEAM ? ` --scope ${process.env.VERCEL_TEAM}` : "";
sh(`npx --yes vercel@latest deploy --prod --yes --token ${process.env.VERCEL_TOKEN}${team}`, {
  stdio: DRY ? "pipe" : "inherit",
});

// ── 5. Custom domain (<slug>.getyetti.com) ───────────────────────────────────
step(5, `Attaching domain ${c.cyan(domain)}`);
if (!DRY) {
  const added = await vercel(`/v10/projects/${repo}/domains`, {
    method: "POST",
    body: { name: domain },
  });
  if (added.ok) {
    console.log(`    ${c.green("✓")} ${domain} attached.`);
    console.log(`      ${c.dim("DNS: in the getyetti.com zone add  CNAME " + slug + " → cname.vercel-dns.com")}`);
  } else if (added.json.error?.code === "domain_already_in_use") {
    console.log(`    ${c.dim("domain already attached")}`);
  } else {
    console.log(`    ${c.red("!")} couldn't attach domain (${added.status}): ${added.json.error?.message}`);
    console.log(`    ${c.dim("If getyetti.com isn't in this Vercel account/team, add it there first.")}`);
  }
}

console.log(`\n${c.green(c.bold("✓ Shipped."))} ${c.dim(`https://${domain}`)}\n`);
