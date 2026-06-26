#!/usr/bin/env node
/**
 * ingest-url — the scraper behind `/build`. Pulls a customer's brand + content +
 * media from a reference URL so we can rebuild a better site around them.
 *
 *   node scripts/ingest-url.mjs https://acme.com --slug acme --apply
 *
 * It crawls a few same-host pages and extracts:
 *   - brand: name, color (-> OKLCH hue), logo, fonts, tagline, description, socials
 *   - content: headlines, body copy, nav, FAQ
 *   - media: downloads up to ~60 real images to public/ingested/<slug>/, and lists
 *            video files + YouTube links
 *
 * Outputs ideas/<slug>/{brand.json, content.md, faq.md, media.json, idea.md} and
 * downloaded images under public/ingested/<slug>/. With --apply it also patches
 * brand.config.ts + content/knowledge.md.
 *
 * The reference URL is the most important input. Review ideas/<slug>/brand.json
 * before building.
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
import * as cheerio from "cheerio";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const argv = process.argv.slice(2);
const url = argv.find((a) => /^https?:\/\//.test(a));
const APPLY = argv.includes("--apply");
const slugArg = (() => {
  const i = argv.indexOf("--slug");
  return i >= 0 ? argv[i + 1] : null;
})();
if (!url) {
  console.error("Usage: node scripts/ingest-url.mjs <url> [--slug name] [--apply]");
  process.exit(1);
}

const MAX_PAGES = 14; // crawl enough to capture the real inner pages, not just home
const MAX_IMAGES = 60; // aim well past the 50-image mandate
const MAX_EDGE = 1600; // px — long-edge cap so files stay small & builds don't choke
const WEBP_QUALITY = 72; // good-looking, ~5-10x smaller than source
const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const origin = new URL(url).origin;
const host = new URL(url).hostname.replace(/^www\./, "");
const slug = (slugArg || host.split(".")[0]).replace(/[^a-z0-9]/gi, "-").toLowerCase();
const ideaDir = join(root, "ideas", slug);
const assetDir = join(ideaDir, "assets");
const imgDir = join(root, "public", "ingested", slug);
const abs = (u) => { try { return new URL(u, url).href; } catch { return null; } };
const sameHost = (u) => { try { return new URL(u).hostname.replace(/^www\./, "") === host; } catch { return false; } };

// ── color: sRGB -> OKLCH ─────────────────────────────────────────────────────
function parseColor(s) {
  s = s.trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  m = s.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return null;
}
function toOklch({ r, g, b }) {
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const R = lin(r), G = lin(g), B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + Bb * Bb);
  let h = (Math.atan2(Bb, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h: Math.round(h) };
}

async function fetchText(u) {
  const res = await fetch(u, { headers: { "User-Agent": UA, Accept: "text/html,*/*" }, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("html")) throw new Error("not html");
  return res.text();
}
async function downloadTo(u, dir, name) {
  try {
    const res = await fetch(u, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 2048) return null; // skip tiny sprites / tracking pixels
    const ct = res.headers.get("content-type") || "";
    let ext = (extname(new URL(u).pathname) || "").split("?")[0];
    if (!/^\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(ext))
      ext = ct.includes("svg") ? ".svg" : ct.includes("png") ? ".png" : ct.includes("webp") ? ".webp" : ct.includes("avif") ? ".avif" : ct.includes("gif") ? ".gif" : ".jpg";

    // SVG and animated GIF: keep as-is (sharp would rasterize / drop frames).
    if (/\.(svg|gif)$/i.test(ext)) {
      const file = `${name}${ext}`;
      await writeFile(join(dir, file), buf);
      return file;
    }

    // Raster images: resize to <=MAX_EDGE and re-encode to compact WebP.
    // This is the rule that keeps a 50-image site from melting the build.
    try {
      const out = await sharp(buf, { failOn: "none" })
        .rotate() // respect EXIF orientation before stripping metadata
        .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      const file = `${name}.webp`;
      await writeFile(join(dir, file), out);
      return file;
    } catch {
      // sharp couldn't decode it — fall back to the original bytes.
      const file = `${name}${ext}`;
      await writeFile(join(dir, file), buf);
      return file;
    }
  } catch { return null; }
}
// small concurrency pool
async function pool(items, n, fn) {
  const out = []; let i = 0;
  const workers = Array.from({ length: n }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  });
  await Promise.all(workers);
  return out;
}

const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
const largestFromSrcset = (ss) => {
  if (!ss) return null;
  const parts = ss.split(",").map((p) => p.trim().split(/\s+/));
  parts.sort((a, b) => (parseInt(b[1]) || 0) - (parseInt(a[1]) || 0));
  return parts[0]?.[0] || null;
};

// ── crawl ────────────────────────────────────────────────────────────────────
console.log(`\n${c.bold(`🔎 Ingesting ${url}`)}  ${c.dim(`→ ideas/${slug}/ + public/ingested/${slug}/`)}\n`);
await mkdir(assetDir, { recursive: true });
await mkdir(imgDir, { recursive: true });

const visited = new Set();
const queue = [url];
const imageUrls = new Set();
const videoUrls = new Set();
const youtube = new Set();
const pages = []; // {url, path, title, headings[]} in crawl order (home first) — drives inner-page builds + chronology
let home$ = null;

while (queue.length && visited.size < MAX_PAGES) {
  const page = queue.shift();
  if (visited.has(page)) continue;
  visited.add(page);
  let html;
  try { html = await fetchText(page); } catch { continue; }
  const $ = cheerio.load(html);
  if (!home$) home$ = $;
  pages.push({
    url: page,
    path: (() => { try { return new URL(page).pathname; } catch { return "/"; } })(),
    title: clean($("title").text()),
    headings: $("h1, h2").map((_, el) => clean($(el).text())).get().filter(Boolean).slice(0, 12),
  });

  $("img").each((_, el) => {
    const u = abs(largestFromSrcset($(el).attr("srcset")) || $(el).attr("src") || $(el).attr("data-src"));
    if (u && !u.startsWith("data:")) imageUrls.add(u);
  });
  $("source[srcset]").each((_, el) => {
    const u = abs(largestFromSrcset($(el).attr("srcset")));
    if (u && !u.startsWith("data:")) imageUrls.add(u);
  });
  $("[style*='background']").each((_, el) => {
    const m = ($(el).attr("style") || "").match(/url\((['"]?)(.*?)\1\)/);
    const u = m && abs(m[2]);
    if (u && !u.startsWith("data:")) imageUrls.add(u);
  });
  $("video source[src], video[src]").each((_, el) => {
    const u = abs($(el).attr("src"));
    if (u && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u)) videoUrls.add(u);
  });
  $("a[href], iframe[src]").each((_, el) => {
    const href = $(el).attr("href") || $(el).attr("src") || "";
    const yt = href.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) youtube.add(`https://www.youtube.com/watch?v=${yt[1]}`);
  });

  // enqueue same-host internal links
  $("a[href]").each((_, el) => {
    const u = abs($(el).attr("href"));
    if (u && sameHost(u) && !u.includes("#") && !/\.(pdf|zip|jpg|png|webp|svg|mp4)$/i.test(u)) {
      if (!visited.has(u) && queue.length + visited.size < MAX_PAGES) queue.push(u);
    }
  });
}

const $ = home$ || cheerio.load("");
const meta = (sel) => $(sel).attr("content")?.trim();

// ── brand identity (from home page) ─────────────────────────────────────────
const name =
  meta('meta[property="og:site_name"]') || meta('meta[name="application-name"]') ||
  clean($("title").text()).split(/[|\-–·—]/)[0].trim() || host;
const tagline = meta('meta[property="og:title"]') || clean($("title").text()) || "";
const description = meta('meta[name="description"]') || meta('meta[property="og:description"]') || "";

const colorCount = new Map();
const noteColor = (str) => {
  for (const tok of (str || "").matchAll(/#[0-9a-fA-F]{3,6}\b|rgba?\([^)]+\)/g)) {
    const col = parseColor(tok[0]); if (!col) continue;
    const { C, L } = toOklch(col); if (C < 0.05 || L < 0.1 || L > 0.95) continue;
    const key = `${col.r},${col.g},${col.b}`;
    colorCount.set(key, (colorCount.get(key) || 0) + 1);
  }
};
$("[style]").each((_, el) => noteColor($(el).attr("style")));
$("style").each((_, el) => noteColor($(el).html()));
for (const css of $('link[rel="stylesheet"]').map((_, el) => abs($(el).attr("href"))).get().filter(Boolean).slice(0, 4)) {
  try { noteColor(await (await fetch(css, { headers: { "User-Agent": UA } })).text()); } catch {}
}
const themeColor = meta('meta[name="theme-color"]');
let brandColor = themeColor && parseColor(themeColor) ? { hex: themeColor, src: "theme-color" } : null;
if (!brandColor && colorCount.size) {
  const [top] = [...colorCount.entries()].sort((a, b) => b[1] - a[1]);
  const [r, g, b] = top[0].split(",").map(Number);
  brandColor = { hex: `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`, src: "css-frequency" };
}
const oklch = brandColor ? toOklch(parseColor(brandColor.hex)) : { h: 265 };

const fonts = new Set();
$('link[href*="fonts.googleapis.com"]').each((_, el) => {
  for (const m of ($(el).attr("href") || "").matchAll(/family=([^:&]+)/g)) fonts.add(decodeURIComponent(m[1]).replace(/\+/g, " "));
});

const socials = {};
const hostOf = (href) => { try { return new URL(href, url).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };
$("a[href]").each((_, el) => {
  const href = $(el).attr("href") || "";
  if (href.startsWith("mailto:")) { socials.email ||= href.slice(7); return; }
  const h = hostOf(href);
  if (h === "github.com") socials.github ||= href;
  if (h === "twitter.com" || h === "x.com") socials.x ||= href;
  if (h === "linkedin.com") socials.linkedin ||= href;
  if (h === "instagram.com") socials.instagram ||= href;
});

// ── LOGO vs FAVICON — they are NOT the same thing ────────────────────────────
// The favicon is a tiny metadata icon. The real LOGO lives in the navbar/footer
// (an <img>/<svg> branded mark). Build must put the LOGO in nav + footer and use
// the favicon only for the browser tab / metadata.
const faviconUrl =
  abs($('link[rel="apple-touch-icon"]').attr("href")) ||
  abs($('link[rel="icon"]').last().attr("href")) ||
  abs("/favicon.ico");
const findLogo = () => {
  const sels = [
    "header a[href='/'] img", "nav a[href='/'] img", "footer a[href='/'] img",
    "header img[alt*='logo' i]", "nav img[alt*='logo' i]", "footer img[alt*='logo' i]",
    "[class*='logo' i] img", "[id*='logo' i] img",
    "header img", "nav img", "footer img",
  ];
  for (const sel of sels) {
    const el = $(sel).first();
    if (!el.length) continue;
    const u = abs(largestFromSrcset(el.attr("srcset")) || el.attr("src") || el.attr("data-src"));
    if (u && !u.startsWith("data:")) return u;
  }
  return null; // likely an inline <svg> logo — note it so the builder grabs it by hand
};
const logoUrl = findLogo();
const logoFile = logoUrl ? await downloadTo(logoUrl, assetDir, "logo") : null;
const inlineSvgLogo = !logoUrl && $("header svg, nav svg").first().length > 0;

const ogImage = abs(meta('meta[property="og:image"]'));
if (ogImage) imageUrls.add(ogImage);

// ── WhatsApp: if they expose a wa.me / api.whatsapp number, we add a click-to-chat widget ──
let whatsapp = null;
$("a[href]").each((_, el) => {
  if (whatsapp) return;
  const href = $(el).attr("href") || "";
  const m = href.match(/(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=|whatsapp:\/\/send\?phone=|chat\.whatsapp\.com\/)(\+?\d[\d\s().-]{6,})/i);
  if (m) whatsapp = m[1].replace(/[^\d]/g, "");
});

// ── phone (tel:) ───────────────────────────────────────────────────────────
let phone = null;
$("a[href^='tel:']").each((_, el) => { if (!phone) phone = ($(el).attr("href") || "").replace("tel:", "").trim(); });

// ── location / map: address from JSON-LD, else a maps link, else <address> ───
let location = null;
$('script[type="application/ld+json"]').each((_, el) => {
  if (location) return;
  try {
    const data = JSON.parse($(el).contents().text());
    const nodes = Array.isArray(data) ? data : [data, ...(data["@graph"] || [])];
    for (const node of nodes) {
      const addr = node?.address;
      if (!addr) continue;
      const parts = typeof addr === "string"
        ? [addr]
        : [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode, addr.addressCountry].filter(Boolean);
      if (parts.length) {
        location = { address: parts.join(", "), lat: node.geo?.latitude ?? null, lng: node.geo?.longitude ?? null };
        break;
      }
    }
  } catch {}
});
if (!location) {
  $("a[href*='google.com/maps'], a[href*='maps.app.goo.gl'], iframe[src*='google.com/maps']").each((_, el) => {
    if (location) return;
    const href = $(el).attr("href") || $(el).attr("src") || "";
    const at = href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    location = { address: clean($(el).attr("aria-label") || $(el).text()) || null, mapUrl: href, lat: at?.[1] ?? null, lng: at?.[2] ?? null };
  });
}
if (!location) { const a = clean($("address").first().text()); if (a) location = { address: a }; }
if (location) location.mapQuery = location.address || (location.lat ? `${location.lat},${location.lng}` : null);

// ── nav + footer links (the spine of the inner-page build) ───────────────────
const linksIn = (scope) => {
  const seen = new Map();
  $(`${scope} a[href]`).each((_, el) => {
    const text = clean($(el).text());
    const u = abs($(el).attr("href"));
    if (!u || !text || !sameHost(u) || u.includes("#")) return;
    const path = (() => { try { return new URL(u).pathname.replace(/\/$/, "") || "/"; } catch { return null; } })();
    if (path && path !== "/" && !seen.has(path)) seen.set(path, { text, url: u, path });
  });
  return [...seen.values()];
};
const navItems = linksIn("header, nav");
const footerItems = linksIn("footer");

const imgList = [...imageUrls].slice(0, MAX_IMAGES);
const downloaded = await pool(imgList, 6, (u, i) =>
  downloadTo(u, imgDir, `img-${String(i + 1).padStart(3, "0")}`)
);
const publicImages = downloaded.filter(Boolean).map((f) => `/ingested/${slug}/${f}`);

// ── content + faq ────────────────────────────────────────────────────────────
const headings = $("h1, h2").map((_, el) => clean($(el).text())).get().filter(Boolean).slice(0, 25);
const paras = $("p").map((_, el) => clean($(el).text())).get().filter((t) => t.length > 40).slice(0, 30);
const navLinks = [...new Set($("nav a, header a").map((_, el) => clean($(el).text())).get().filter(Boolean))];
const faqs = [];
$("details").each((_, el) => {
  const q = clean($(el).find("summary").first().text());
  const a = clean($(el).clone().children("summary").remove().end().text());
  if (q && a) faqs.push({ q, a });
});
$("dl dt").each((_, el) => { const q = clean($(el).text()); const a = clean($(el).next("dd").text()); if (q && a) faqs.push({ q, a }); });

// ── write workspace ──────────────────────────────────────────────────────────
const homeSections = (pages[0]?.headings) || headings; // section order on the home page = chronology to mirror
const innerPages = pages.filter((p) => p.path && p.path !== "/").map((p) => ({ path: p.path, title: p.title, sections: p.headings }));
const brandJson = {
  source: url, ingestedFromHost: host, pagesCrawled: visited.size,
  name, tagline: clean(tagline), description: clean(description), domain: host,
  brandColor: brandColor ? { ...brandColor, oklchHue: oklch.h } : null,
  theme: { hue: oklch.h },
  fonts: [...fonts],
  // LOGO (navbar/footer mark) is separate from FAVICON (browser-tab/metadata icon).
  logo: logoFile ? `assets/${logoFile}` : null,
  logoNote: logoFile ? null : inlineSvgLogo ? "Inline <svg> logo in header — copy it by hand into components/icons.tsx" : "Logo not auto-found — grab the navbar logo manually",
  favicon: faviconUrl || null,
  images: publicImages,
  imageCount: publicImages.length,
  social: socials,
  whatsapp,
  phone,
  location,
  // Follow this section order on the landing page (the source site's chronology):
  sectionOrder: homeSections,
  navItems,
  footerItems,
  // Build a route for each of these inner/detail pages:
  innerPages,
};
await writeFile(join(ideaDir, "brand.json"), JSON.stringify(brandJson, null, 2) + "\n");
await writeFile(join(ideaDir, "media.json"), JSON.stringify({ images: publicImages, videos: [...videoUrls], youtube: [...youtube] }, null, 2) + "\n");
const mdList = (arr, f = (x) => x) => (arr.length ? arr.map((x) => `- ${f(x)}`).join("\n") : "_(none found)_");
await writeFile(join(ideaDir, "content.md"),
  `# ${name} - scraped content\n\nSource: ${url}\n\n` +
  `## Section order on home (follow this chronology when composing the landing page)\n${mdList(homeSections)}\n\n` +
  `## Inner pages to build (one route each, professional UI + images)\n${mdList(innerPages, (p) => `\`${p.path}\` - ${p.title || "(untitled)"}${p.sections?.length ? ` - sections: ${p.sections.slice(0, 6).join(", ")}` : ""}`)}\n\n` +
  `## Nav links\n${mdList(navItems, (l) => `${l.text} -> ${l.path}`)}\n\n` +
  `## Footer links\n${mdList(footerItems, (l) => `${l.text} -> ${l.path}`)}\n\n` +
  `## Headlines\n${mdList(headings)}\n\n## Body copy\n${mdList(paras)}\n\n` +
  `## Contact\n- WhatsApp: ${whatsapp || "(none)"}\n- Phone: ${phone || "(none)"}\n- Location: ${location?.address || "(none)"}${location?.mapQuery ? ` (map: ${location.mapQuery})` : ""}\n`);
await writeFile(join(ideaDir, "faq.md"),
  `# ${name} — FAQ (scraped)\n\n${faqs.length ? faqs.map((f) => `### ${f.q}\n${f.a}\n`).join("\n") : "_No FAQ found. Add Q&A here for the widget._\n"}`);
try { await readFile(join(ideaDir, "idea.md")); } catch {
  await writeFile(join(ideaDir, "idea.md"),
    `# Idea: ${name}\n\n- **Reference URL:** ${url}\n- **Project name (subdomain):** ${slug} → ${slug}.getyetti.com\n- **What we're building:** <colleague fills this in>\n- **Tone:**\n- **Must-have sections:**\n- **Inspiration images:** drop into ./assets/\n`);
}

console.log(`  ${c.dim("name")}        ${c.cyan(name)}`);
console.log(`  ${c.dim("brand color")} ${brandColor ? `${brandColor.hex} (${brandColor.src}) → hue ${oklch.h}` : "not found"}`);
console.log(`  ${c.dim("fonts")}       ${[...fonts].join(", ") || "none detected"}`);
console.log(`  ${c.dim("logo")}        ${logoFile ? c.cyan(`assets/${logoFile}`) : (inlineSvgLogo ? "inline <svg> in header (copy by hand)" : "NOT FOUND — grab navbar logo manually")}`);
console.log(`  ${c.dim("favicon")}     ${faviconUrl ? c.dim(faviconUrl) : "none"} ${c.dim("(metadata only, ≠ logo)")}`);
console.log(`  ${c.dim("images")}      ${c.bold(publicImages.length)} downloaded → public/ingested/${slug}/  ${publicImages.length < 50 ? c.dim("(under 50 — supplement with Pexels/Unsplash)") : c.green("(≥50 ✓)")}`);
console.log(`  ${c.dim("videos")}      ${videoUrls.size}   ${c.dim("youtube")} ${youtube.size}`);
console.log(`  ${c.dim("pages")}       ${visited.size} crawled  ${c.dim("inner")} ${c.bold(innerPages.length)} ${c.dim("to build")}`);
console.log(`  ${c.dim("whatsapp")}    ${whatsapp ? c.green(whatsapp) : "none"}   ${c.dim("phone")} ${phone || "none"}`);
console.log(`  ${c.dim("location")}    ${location?.address ? c.cyan(location.address) : "none"}`);
console.log(`  ${c.dim("faqs")}        ${faqs.length}`);

if (APPLY) {
  const cfgPath = join(root, "brand.config.ts");
  let cfg = await readFile(cfgPath, "utf8");
  const setStr = (key, val) => (cfg = cfg.replace(new RegExp(`(${key}:\\s*")[^"]*(")`), `$1${String(val).replace(/"/g, '\\"')}$2`));
  setStr("name", name);
  if (clean(tagline)) setStr("tagline", clean(tagline).slice(0, 90));
  if (clean(description)) setStr("description", clean(description).slice(0, 160));
  setStr("domain", `${slug}.getyetti.com`);
  // contact block (whatsapp widget + map read these) — keys are unique in the file
  if (whatsapp) setStr("whatsapp", whatsapp);
  if (phone) setStr("phone", phone);
  if (location?.address) setStr("address", location.address.slice(0, 120));
  if (location?.mapQuery) setStr("mapQuery", location.mapQuery.slice(0, 120));
  cfg = cfg.replace(/(hue:\s*)\d+/, `$1${oklch.h}`);
  if (fonts.size) {
    const f = [...fonts];
    cfg = cfg.replace(/(display:\s*")[^"]*(")/, `$1${f[0]}$2`);
    if (f[1]) cfg = cfg.replace(/(sans:\s*")[^"]*(")/, `$1${f[1]}$2`);
  }
  await writeFile(cfgPath, cfg);
  await mkdir(join(root, "content"), { recursive: true });
  await writeFile(join(root, "content", "knowledge.md"),
    `# ${name} knowledge base\n\nSource: ${url}\n\n## About\n${clean(description)}\n\n## FAQ\n${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n") || "(add Q&A)"}\n\n## Highlights\n${headings.map((h) => `- ${h}`).join("\n")}\n`);
  console.log(`\n  ${c.green("✓ applied")} → brand.config.ts (domain ${slug}.getyetti.com) + content/knowledge.md`);
  console.log(`  ${c.dim("next:")} npm run brand`);
}

console.log(`\n${c.green("✓ Ingest complete.")}\n`);
