#!/usr/bin/env node
/**
 * validate — confirm a deploy actually landed and is serving. Run after `/deploy`.
 *
 *   npm run validate
 *
 * Checks (all live, over the network):
 *   1. GitHub repo exists and has pushed code (latest commit)
 *   2. Vercel project exists and is connected to that GitHub repo
 *   3. Latest production deployment is READY
 *   4. The Vercel deployment URL serves 200 (no 404)
 *   5. The custom domain <slug>.getyetti.com is attached + verified on Vercel
 *   6. The custom domain serves 200 over HTTPS (no 404)
 *
 * Tokens come from .env (GITHUB_TOKEN, VERCEL_TOKEN, optional VERCEL_TEAM).
 * Exit 0 when everything serving; 1 when any blocker fails.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
if (existsSync(join(root, ".env"))) process.loadEnvFile(join(root, ".env"));
let brand = null;
try { ({ brand } = await import(join(root, "brand.config.ts"))); } catch {}

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
const head = (g) => rows.push({ head: g });
const add = (status, label, detail = "") => rows.push({ status, label, detail });
const die = (msg) => { console.error(`\n${C.red("✗")} ${msg}\n`); process.exit(1); };

// ── inputs ──────────────────────────────────────────────────────────────────
if (!brand) die("brand.config.ts missing or won't import.");
if (!process.env.GITHUB_TOKEN) die("GITHUB_TOKEN missing in .env (run `npm run check`).");
if (!process.env.VERCEL_TOKEN) die("VERCEL_TOKEN missing in .env (run `npm run check`).");
const [owner, repo] = String(brand.social?.github || "").split("/");
if (!owner || !repo || owner === "your-org") die("Set brand.social.github to 'owner/repo' and run `npm run brand`.");
const domain = brand.domain && !/example\.com$/.test(brand.domain) ? brand.domain : null;

// ── api helpers ───────────────────────────────────────────────────────────────
async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  return { ok: res.ok, status: res.status, json: await res.json().catch(() => ({})) };
}
async function vercel(path) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (process.env.VERCEL_TEAM) url.searchParams.set("slug", process.env.VERCEL_TEAM);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } });
  return { ok: res.ok, status: res.status, json: await res.json().catch(() => ({})) };
}
async function httpStatus(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal, headers: { "User-Agent": "validate-bot" } });
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return { status: 0, error: e.name === "AbortError" ? "timeout" : e.message };
  } finally { clearTimeout(t); }
}

console.log(`\n${C.bold("🔬 Validate deploy")} ${C.dim(`· ${brand.name} (${owner}/${repo})`)}\n`);

// ── 1. GitHub ─────────────────────────────────────────────────────────────────
head("GitHub");
const me = await gh("/user");
if (!me.ok) add("fail", "GitHub auth", `token rejected (${me.status})`);
const repoRes = await gh(`/repos/${owner}/${repo}`);
if (!repoRes.ok) add("fail", "Repo exists", `${owner}/${repo} not found (${repoRes.status})`);
else {
  add("ok", "Repo exists", `${repoRes.json.full_name} · ${repoRes.json.private ? "private" : "public"}`);
  const commits = await gh(`/repos/${owner}/${repo}/commits?per_page=1`);
  if (commits.ok && Array.isArray(commits.json) && commits.json.length)
    add("ok", "Code pushed", `latest: ${commits.json[0].sha.slice(0, 7)} — ${(commits.json[0].commit?.message || "").split("\n")[0].slice(0, 48)}`);
  else add("fail", "Code pushed", "repo has no commits — run `npm run ship`");
}

// ── 2-5. Vercel ───────────────────────────────────────────────────────────────
head("Vercel");
let deploymentUrl = null;
const proj = await vercel(`/v9/projects/${repo}`);
if (!proj.ok) {
  add("fail", "Project exists", `no Vercel project "${repo}" (${proj.status}) — run \`npm run ship\``);
} else {
  add("ok", "Project exists", repo);
  const link = proj.json.link;
  const linkedRepo = link ? `${link.org || link.namespace || ""}/${link.repo || ""}`.replace(/^\//, "") : "";
  if (link && link.type === "github" && linkedRepo.toLowerCase() === `${owner}/${repo}`.toLowerCase())
    add("ok", "GitHub connected", linkedRepo);
  else if (link) add("warn", "GitHub connected", `linked to ${linkedRepo || link.type}, expected ${owner}/${repo}`);
  else add("warn", "GitHub connected", "project not linked to a GitHub repo");

  // latest production deployment
  const dep = await vercel(`/v6/deployments?projectId=${proj.json.id}&target=production&limit=1`);
  const d = dep.json?.deployments?.[0];
  if (!d) add("fail", "Production deploy", "no production deployment found");
  else {
    const state = d.readyState || d.state;
    deploymentUrl = d.url ? `https://${d.url}` : null;
    if (state === "READY") add("ok", "Production deploy", `READY · ${d.url}`);
    else if (["BUILDING", "QUEUED", "INITIALIZING"].includes(state))
      add("warn", "Production deploy", `${state} — still in progress, re-run shortly`);
    else add("fail", "Production deploy", `${state || "unknown"} — check Vercel dashboard`);
  }

  // domains attached to the project
  const doms = await vercel(`/v9/projects/${proj.json.id}/domains`);
  const list = doms.json?.domains || [];
  if (domain) {
    const match = list.find((x) => x.name === domain);
    if (!match) add("fail", "Domain attached", `${domain} not on the project — run \`npm run ship\``);
    else if (match.verified) add("ok", "Domain attached", `${domain} (verified)`);
    else add("warn", "Domain attached", `${domain} present but NOT verified — finish DNS`);
  } else {
    add("info", "Domain attached", "brand.domain is a placeholder — set <slug>.getyetti.com");
  }
}

// ── 6. Liveness (no 404) ──────────────────────────────────────────────────────
head("Liveness");
const judge = (label, url, res) => {
  if (res.status === 0) add("fail", label, `unreachable (${res.error}) — ${url}`);
  else if (res.status === 404) add("fail", label, `404 Not Found — ${url}`);
  else if (res.status >= 200 && res.status < 400) add("ok", label, `${res.status} — ${url}`);
  else add("fail", label, `${res.status} — ${url}`);
};
if (deploymentUrl) judge("Vercel URL serves", deploymentUrl, await httpStatus(deploymentUrl));
if (domain) {
  const url = `https://${domain}/`;
  judge("Custom domain serves", url, await httpStatus(url));
}
if (!deploymentUrl && !domain) add("warn", "Liveness", "nothing to probe yet");

// ── render ────────────────────────────────────────────────────────────────────
const counts = { ok: 0, warn: 0, fail: 0, info: 0 };
for (const r of rows) {
  if (r.head) { console.log(C.bold(r.head)); continue; }
  counts[r.status]++;
  console.log(`  ${MARK[r.status]} ${r.label.padEnd(20)} ${C.dim(r.detail)}`);
}
console.log(`\n${C.bold("Summary")}  ${C.green(counts.ok + " ok")} · ${C.yellow(counts.warn + " warn")} · ${C.red(counts.fail + " fail")}`);
if (counts.fail) {
  console.log(`${C.red("✗ Deploy not fully live")} — fix the ${C.red("✗")} items (often: wait for build, finish DNS, re-run \`npm run ship\`).\n`);
  process.exit(1);
} else if (counts.warn) {
  console.log(`${C.yellow("⚠ Live, with caveats")} — review ${C.yellow("⚠")} items (usually DNS/verification settling).\n`);
  process.exit(0);
} else {
  console.log(`${C.green("✓ All systems live")} — ${domain ? `https://${domain}` : "deployment"} is up.\n`);
  process.exit(0);
}
