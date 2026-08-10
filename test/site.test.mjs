// The hub is hand-written and deployed verbatim — `path: .` straight to Pages, no build step
// that would catch a typo first. So the things worth testing are the ones a hand edit breaks
// silently: a renamed asset still referenced, a host that drifts from CNAME, an og.png whose
// real size stops matching the dimensions the meta tags promise.
//
// Deliberately dependency-free (node: builtins only), like the repo itself.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.join(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const html = read("index.html");
const host = read("CNAME").trim();
const origin = `https://${host}`;

/** Local (repo-served) targets of every href/src, ignoring data:, external and fragments. */
function localRefs(markup) {
  return [...markup.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((ref) => !/^(?:https?:|data:|mailto:|tel:|#)/.test(ref));
}

test("every local href/src resolves to a file that is committed", () => {
  const refs = localRefs(html);
  assert.ok(refs.length > 0, "sanity: the page should reference at least one local asset");
  for (const ref of refs) {
    const rel = ref.replace(/^\//, "").split(/[?#]/)[0];
    const target = rel === "" ? "index.html" : rel;
    assert.ok(fs.existsSync(path.join(root, target)), `${ref} → missing file ${target}`);
  }
});

test("every absolute self-link uses the host in CNAME", () => {
  // Catches the hub pointing at a stale domain after a rename — the failure mode that
  // silently breaks canonical, og:url and the sitemap all at once.
  const selfLinks = [...html.matchAll(/https:\/\/([a-z0-9.-]*metzner\.uk)/g)].map((m) => m[1]);
  const foreign = [...new Set(selfLinks)].filter((h) => h !== host && !h.endsWith(`.${host}`));
  assert.deepEqual(foreign, [], `hosts that are neither ${host} nor a subdomain of it`);
});

test("canonical, og:url and og:image agree with each other and with CNAME", () => {
  const meta = (prop) =>
    html.match(new RegExp(`<meta property="${prop}" content="([^"]+)"`))?.[1] ??
    assert.fail(`missing <meta property="${prop}">`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];

  assert.equal(canonical, `${origin}/`);
  assert.equal(meta("og:url"), `${origin}/`);
  assert.equal(meta("og:image"), `${origin}/og.png`);
});

test("the sitemap lists only URLs on this host that actually exist", () => {
  const sitemap = read("sitemap.xml");
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/, "XML declaration");
  assert.match(sitemap, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 0, "a sitemap with no <loc> is worse than none");
  for (const loc of locs) {
    const url = new URL(loc);
    assert.equal(url.origin, origin, `${loc} is not on ${origin}`);
    const rel = url.pathname.replace(/^\//, "");
    const target = rel === "" ? "index.html" : rel;
    assert.ok(fs.existsSync(path.join(root, target)), `${loc} → missing file ${target}`);
  }
});

test("robots.txt points at the sitemap on the right host", () => {
  const robots = read("robots.txt");
  assert.match(robots, /^User-agent: \*/m);
  assert.ok(
    robots.includes(`Sitemap: ${origin}/sitemap.xml`),
    `robots.txt should advertise ${origin}/sitemap.xml`
  );
});

test("og.png is a real PNG whose size matches the dimensions the meta tags promise", () => {
  // gen-og.mjs has to be run by hand (it borrows til-blog's sharp), so the card and the
  // declared width/height can drift apart. Read the IHDR directly rather than add a dep.
  const png = fs.readFileSync(path.join(root, "og.png"));
  assert.deepEqual(
    [...png.subarray(0, 8)],
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    "og.png is not a PNG"
  );
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);

  const declared = (prop) =>
    Number(html.match(new RegExp(`<meta property="${prop}" content="(\\d+)"`))?.[1]);
  assert.equal(width, declared("og:image:width"));
  assert.equal(height, declared("og:image:height"));
  assert.equal(`${width}x${height}`, "1200x630", "the OG card aspect every scraper expects");
});

test("the document carries the head tags a shared link depends on", () => {
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<html lang="[a-z]{2}(?:-[A-Z]{2})?"/, "a lang attribute");
  assert.match(html, /<meta charset="UTF-8"\s*\/>/i);
  assert.match(html, /<meta name="viewport"/);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title && title.trim().length > 0, "a non-empty <title>");
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
});

test("exactly one h1 — the hub is a single page", () => {
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
});

test("preloaded fonts are actually used by a @font-face", () => {
  // A preload for a font nothing references costs a request and warns in the console.
  const preloads = [...html.matchAll(/<link rel="preload" href="([^"]+)" as="font"/g)].map(
    (m) => m[1]
  );
  assert.ok(preloads.length > 0, "sanity: the page preloads its fonts");
  for (const href of preloads) {
    assert.ok(html.includes(`url("${href}")`) || html.includes(`url('${href}')`) || html.includes(`url(${href})`),
      `${href} is preloaded but no @font-face src uses it`);
  }
});
