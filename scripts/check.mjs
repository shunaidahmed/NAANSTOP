/**
 * One runnable check for the two bits of CMS logic that can silently break the
 * site: the overlay merge (wrong merge = missing copy or a crash in Menu) and
 * the session cookie (wrong signature = anyone can edit the site).
 *
 *   node scripts/check.mjs
 */
import { build } from "esbuild";
import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

process.env.CMS_SECRET = "test-secret-for-the-check";

// Built inside node_modules so the bundle can still resolve @vercel/blob.
const dir = "node_modules/.tmp/check";
await mkdir(dir, { recursive: true });
async function load(entry, name) {
  const outfile = join(dir, name);
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    external: ["@vercel/blob"],
    logLevel: "warning",
  });
  return import(pathToFileURL(outfile).href);
}

/* ── overlay merge ───────────────────────────────────────────── */
const { merge, resolve, DEFAULT_CONTENT } = await load("src/cms/content.ts", "content.mjs");

// An empty document must leave the shipped site exactly as it is.
assert.deepEqual(resolve({}), DEFAULT_CONTENT);
assert.deepEqual(resolve(null), DEFAULT_CONTENT);

// Overriding one leaf keeps its siblings.
const patched = resolve({ site: { phone: "34600000000" } });
assert.equal(patched.site.phone, "34600000000");
assert.equal(patched.site.address, DEFAULT_CONTENT.site.address);

// Arrays replace wholesale — deleting a menu category must actually delete it.
assert.equal(resolve({ menu: [] }).menu.length, 0);

// A string overlay still wins over a string default at the same depth.
assert.equal(merge({ a: { b: "old" } }, { a: { b: "new" } }).a.b, "new");
assert.equal(merge({ a: { b: "old" } }, { a: {} }).a.b, "old");

// Copy must be JSON all the way down. A function anywhere in `translations`
// would be silently dropped by the panel and vanish from the site.
const walk = (node, path) => {
  if (typeof node === "function") throw new Error(`function left in translations at ${path}`);
  if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) walk(child, `${path}.${key}`);
  }
};
walk(DEFAULT_CONTENT.t, "t");

/* ── order message ───────────────────────────────────────────── */
const { buildOrderMessage } = await load("src/cart/message.ts", "message.mjs");
const { fmt } = await load("src/i18n/fmt.ts", "fmt.mjs");

assert.equal(fmt("{a} and {b}", { a: "x", b: 2 }), "x and 2");
assert.equal(fmt("{missing}", {}), "{missing}", "an unknown placeholder is left alone, not blanked");

const money = (n) => `${n.toFixed(2)} EUR`;
const labels = {
  heading: "NEW ORDER", orderNumber: "Order", type: "Type", pickup: "Pickup", delivery: "Delivery",
  itemsHeading: "Items", subtotal: "Subtotal", deliveryFee: "Delivery", total: "TOTAL",
  name: "Name", phone: "Phone", address: "Address", notes: "Notes", footer: "sent from the site",
};
const lines = [
  { id: "a", name: "Classic Chicken Taco", size: "Large", unitPrice: 9, quantity: 2 },
  { id: "b", name: "Loaded Fries", unitPrice: 5, quantity: 1 },
];
const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
assert.equal(subtotal, 23);

const delivered = buildOrderMessage({
  id: "NS-ABC123",
  lines,
  details: { fulfilment: "delivery", name: "Ana", phone: "600", address: "Carrer 1", notes: "" },
  subtotal,
  deliveryFee: 2.5,
  total: subtotal + 2.5,
  lang: "en",
  money,
  labels,
  address: "the shop",
});

assert.match(delivered, /NS-ABC123/);
assert.match(delivered, /2 × Classic Chicken Taco \(Large\) — 18\.00 EUR/);
assert.match(delivered, /Subtotal: 23\.00 EUR/);
assert.match(delivered, /Delivery: 2\.50 EUR/);
assert.match(delivered, /TOTAL: 25\.50 EUR/, "the delivery fee must reach the total");
assert.match(delivered, /Address: Carrer 1/);
assert.ok(!delivered.includes("Notes:"), "an empty note must not print an empty line");

// Pickup charges no fee and prints the restaurant address instead.
const collected = buildOrderMessage({
  id: "NS-ABC123",
  lines,
  details: { fulfilment: "pickup", name: "Ana", phone: "", address: "", notes: "No onion" },
  subtotal,
  deliveryFee: 0,
  total: subtotal,
  lang: "es",
  money,
  labels,
  address: "the shop",
});
assert.match(collected, /TOTAL: 23\.00 EUR/);
assert.ok(!collected.includes("Delivery: "), "pickup orders must not show a delivery fee");
assert.match(collected, /Address: the shop/);
assert.match(collected, /Notes: No onion/);

/* ── session cookie ──────────────────────────────────────────── */
const { mintCookie, signedIn } = await load("api/cms.ts", "cms.mjs");

const withCookie = (value) => new Request("https://x/api/cms", { headers: { cookie: value } });
const cookie = mintCookie().split(";")[0];

assert.equal(signedIn(withCookie(cookie)), true, "a freshly minted cookie must be accepted");
assert.equal(signedIn(withCookie("")), false, "no cookie means no session");
assert.equal(signedIn(withCookie("ns_cms=1.deadbeef")), false, "a forged signature must be rejected");

// Tampering with the expiry invalidates the signature.
const [name, token] = cookie.split("=");
const [exp, mac] = token.split(".");
assert.equal(signedIn(withCookie(`${name}=${Number(exp) + 1}.${mac}`)), false, "expiry is signed");

// Already expired.
assert.equal(signedIn(withCookie(`${name}=1.${mac}`)), false, "an expired cookie must be rejected");

/* ── the admin panel's assumptions ───────────────────────────── */
// public/admin/defaults.json is what the panel edits. It is plain JS with no
// typechecker, so a renamed field here surfaces as a blank screen there.
const { readFile } = await import("node:fs/promises");
const defaults = JSON.parse(await readFile("public/admin/defaults.json", "utf8"));

for (const path of [
  "site.name", "site.phone", "site.currency", "site.logo", "site.delivery", "site.deliveryFee",
  "site.minDeliveryOrder", "site.hours", "site.waMessage", "site.waMessageEs",
  "menu", "gallery.hero", "gallery.about", "nav", "seo.title", "tags.consent",
  "t.es.checkout.send", "t.en.checkout.send", "t.es.orderMessage.total",
]) {
  const value = path.split(".").reduce((node, key) => node?.[key], defaults);
  assert.notEqual(value, undefined, `the admin panel reads ${path}, which defaults.json does not have`);
}

// Every dish needs a numeric price, and every size needs one too — the basket
// adds them up, so a string here would concatenate instead of summing.
for (const category of defaults.menu) {
  for (const item of category.items) {
    assert.equal(typeof item.price, "number", `${item.name} has a non-numeric price`);
    for (const size of item.sizes ?? []) {
      assert.equal(typeof size.price, "number", `${item.name} / ${size.label} has a non-numeric price`);
    }
  }
}

await rm(dir, { recursive: true, force: true });
console.log("checks passed");
