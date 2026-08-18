// Diffs the scraped old-site product list against Supabase, matched on
// products.external_id (the JoomShopping product_id).
//
// Deliberately NOT compared: category. The category tree was reorganized in
// scripts/migrate-categories.mjs, so old-site categories no longer line up and
// must never be synced back.
//
// Usage:
//   node scripts/joomla/diff-products.mjs
//
// Writes: scripts/joomla/data/diff.json

import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { OUT_DIR, readSupabaseEnv } from "./lib.mjs";

const { url, key } = readSupabaseEnv();
const supabase = createClient(url, key);

const old = JSON.parse(readFileSync(path.join(OUT_DIR, "joomla-products.json"), "utf8"));

// Supabase caps a single select at 1000 rows.
const ours = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("products")
    .select("id,external_id,name,price,old_price,published,image_url,category_id")
    .order("id")
    .range(from, from + 999);
  if (error) throw error;
  ours.push(...data);
  if (data.length < 1000) break;
}
console.log(`old site: ${old.length} products · supabase: ${ours.length} products`);

const byExternal = new Map();
const dupes = [];
for (const p of ours) {
  if (!p.external_id) continue;
  if (byExternal.has(p.external_id)) dupes.push(p);
  else byExternal.set(p.external_id, p);
}
const ownOnly = ours.filter((p) => !p.external_id);

const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();

const added = []; // on the old site, missing from ours
const changed = []; // present in both, some field differs
const removed = []; // in ours with an external_id the old site no longer has
const oldIds = new Set(old.map((p) => p.external_id));

for (const o of old) {
  const mine = byExternal.get(o.external_id);
  if (!mine) {
    added.push(o);
    continue;
  }
  const diffs = {};
  if (norm(o.name) !== norm(mine.name)) diffs.name = { old: mine.name, new: o.name };
  if (Number(o.price) !== Number(mine.price)) diffs.price = { old: Number(mine.price), new: Number(o.price) };
  if (o.published !== mine.published) diffs.published = { old: mine.published, new: o.published };
  if (Object.keys(diffs).length) changed.push({ id: mine.id, external_id: o.external_id, name: mine.name, diffs });
}

for (const p of ours) if (p.external_id && !oldIds.has(p.external_id)) removed.push(p);

const count = (k) => changed.filter((c) => c.diffs[k]).length;

console.log(`
matched by external_id : ${byExternal.size}
our own products (no external_id, added in the new admin) : ${ownOnly.length}
duplicate external_id rows in our db : ${dupes.length}

NEW on old site (not in our db)      : ${added.length}
CHANGED                              : ${changed.length}   (name ${count("name")} · price ${count("price")} · published ${count("published")})
GONE from old site (still in our db) : ${removed.length}`);

writeFileSync(path.join(OUT_DIR, "diff.json"), JSON.stringify({ added, changed, removed, ownOnly, dupes }, null, 1));

const show = (title, rows, fmt) => {
  if (!rows.length) return;
  console.log(`\n--- ${title} (first 15 of ${rows.length}) ---`);
  rows.slice(0, 15).forEach((r) => console.log("  " + fmt(r)));
};

show("NEW", added, (p) => `${p.external_id}  ${p.price} сом  ${p.published ? "" : "[не опубл] "}${p.name}`);
show("CHANGED", changed, (c) => {
  const parts = Object.entries(c.diffs).map(([k, v]) => `${k}: ${JSON.stringify(v.old)} → ${JSON.stringify(v.new)}`);
  return `#${c.id}  ${c.name.slice(0, 55)}\n      ${parts.join("\n      ")}`;
});
show("GONE", removed, (p) => `#${p.id} (ext ${p.external_id})  ${p.name}`);
show("OURS ONLY", ownOnly, (p) => `#${p.id}  ${p.name}`);
