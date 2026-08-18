// Applies the old-site → Supabase product diff produced by diff-products.mjs.
//
//   changed  name / price / published are taken from the old site (it is still the live store)
//   added    inserted, with the category resolved from where sibling products already sit
//   removed  unpublished, never deleted — an order's items reference the row
//
// Never touched: category_id / category (the tree was reorganized in migrate-categories.mjs),
// old_price, label, seo_text, purchase_count, and any product without an external_id (those
// were created in the new admin).
//
// Usage:
//   node scripts/joomla/sync-products.mjs              dry run — prints every write
//   node scripts/joomla/sync-products.mjs --execute    apply
//
// Run `node backups/backup-db.mjs` first.

import { readFileSync } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { OUT_DIR, readSupabaseEnv } from "./lib.mjs";

const EXECUTE = process.argv.includes("--execute");

const { url, key } = readSupabaseEnv();
const supabase = createClient(url, key);

const diff = JSON.parse(readFileSync(path.join(OUT_DIR, "diff.json"), "utf8"));
const oldById = new Map(
  JSON.parse(readFileSync(path.join(OUT_DIR, "joomla-products.json"), "utf8")).map((p) => [p.external_id, p]),
);

const ours = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("products")
    .select("id,external_id,name,category,category_id,brand_id")
    .order("id")
    .range(from, from + 999);
  if (error) throw error;
  ours.push(...data);
  if (data.length < 1000) break;
}

// ---------------------------------------------------------------------------
// Category + brand resolution for inserts.
//
// The old site's category names no longer map 1:1 onto our tree, so instead of a
// hand-written table we ask the data: for the old-site category a new product sits
// in, where did its already-migrated siblings end up? Majority wins.
// ---------------------------------------------------------------------------
const byExternal = new Map(ours.filter((p) => p.external_id).map((p) => [p.external_id, p]));

const categoryVotes = new Map(); // old category name -> Map(category_id -> count)
for (const [externalId, mine] of byExternal) {
  const src = oldById.get(externalId);
  if (!src?.category || mine.category_id == null) continue;
  if (!categoryVotes.has(src.category)) categoryVotes.set(src.category, new Map());
  const votes = categoryVotes.get(src.category);
  votes.set(mine.category_id, (votes.get(mine.category_id) ?? 0) + 1);
}

/**
 * Where one old-site category was split across several of ours, the sibling vote can only ever
 * return the biggest of the resulting buckets. "Для мытья посуды, посудомоечные таблетки" is the
 * clearest case: it feeds Гели (81), Пасты (82) and Для ПММ (83), so every dishwasher product
 * would land in Гели. Route those by product name instead.
 */
const CATEGORY_OVERRIDES = [{ match: /посудомоеч|для\s+ПММ/i, categoryId: 83 }];

function resolveCategory(oldCategoryName, productName) {
  const override = CATEGORY_OVERRIDES.find((o) => o.match.test(productName));
  if (override) return { categoryId: override.categoryId, confidence: 1, total: 0, viaOverride: true };

  const votes = categoryVotes.get(oldCategoryName);
  if (!votes) return null;
  const [categoryId, count] = [...votes].sort((a, b) => b[1] - a[1])[0];
  const total = [...votes.values()].reduce((a, b) => a + b, 0);
  return { categoryId, confidence: count / total, total };
}

const { data: categories } = await supabase.from("categories").select("id,name");
const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));

const { data: brands } = await supabase.from("brands").select("id,name");
const brandByName = new Map((brands ?? []).map((b) => [b.name.toLowerCase().trim(), b.id]));

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------
const updates = [];
for (const c of diff.changed) {
  const fields = {};
  if (c.diffs.name) fields.name = c.diffs.name.new;
  if (c.diffs.price) fields.price = c.diffs.price.new;
  if (c.diffs.published) fields.published = c.diffs.published.new;
  updates.push({ id: c.id, name: c.name, fields });
}

const inserts = [];
const insertProblems = [];
for (const a of diff.added) {
  const cat = resolveCategory(a.category, a.name);
  if (!cat) {
    insertProblems.push({ ...a, why: `category "${a.category}" has no migrated sibling to copy from` });
    continue;
  }
  inserts.push({
    row: {
      external_id: a.external_id,
      name: a.name,
      price: a.price,
      category_id: cat.categoryId,
      category: categoryName.get(cat.categoryId) ?? a.category,
      brand_id: a.manufacturer ? (brandByName.get(a.manufacturer.toLowerCase().trim()) ?? null) : null,
      published: a.published,
      purchase_count: 0,
      // Filled by reimage-products.mjs on its next run — it works off external_id.
      image_url: "",
    },
    meta: {
      oldCategory: a.category,
      confidence: cat.confidence,
      siblings: cat.total,
      brand: a.manufacturer,
      viaOverride: cat.viaOverride ?? false,
    },
  });
}

const unpublish = diff.removed.map((p) => ({ id: p.id, external_id: p.external_id, name: p.name }));

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(
  `${EXECUTE ? "APPLYING" : "DRY RUN"} — ${updates.length} updates, ${inserts.length} inserts, ${unpublish.length} unpublish\n`,
);

console.log(`--- UPDATE (${updates.length}) ---`);
for (const u of updates) {
  console.log(`  #${u.id} ${u.name.slice(0, 55)}`);
  for (const [k, v] of Object.entries(u.fields)) console.log(`      ${k} = ${JSON.stringify(v)}`);
}

console.log(`\n--- INSERT (${inserts.length}) ---`);
for (const { row, meta } of inserts) {
  console.log(`  ext ${row.external_id}  ${row.name}`);
  console.log(
    `      ${row.price} сом · published=${row.published} · brand=${meta.brand ?? "—"} → brand_id=${row.brand_id}`,
  );
  console.log(
    `      "${meta.oldCategory}" → category_id=${row.category_id} (${row.category}), ` +
      (meta.viaOverride ? "by name override" : `${Math.round(meta.confidence * 100)}% of ${meta.siblings} siblings`),
  );
}
if (insertProblems.length) {
  console.log(`\n  !! skipped ${insertProblems.length} insert(s):`);
  insertProblems.forEach((p) => console.log(`     ext ${p.external_id} ${p.name} — ${p.why}`));
}

console.log(`\n--- UNPUBLISH (gone from the old site, kept for order history) (${unpublish.length}) ---`);
unpublish.forEach((p) => console.log(`  #${p.id} ${p.name.slice(0, 70)}`));

if (!EXECUTE) {
  console.log("\nNothing written. Re-run with --execute to apply.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------
let done = 0;
for (const u of updates) {
  const { error } = await supabase.from("products").update(u.fields).eq("id", u.id);
  if (error) throw new Error(`update #${u.id}: ${error.message}`);
  done++;
}
console.log(`\nupdated ${done} products`);

if (inserts.length) {
  const { data, error } = await supabase
    .from("products")
    .insert(inserts.map((i) => i.row))
    .select("id,external_id,name");
  if (error) throw new Error(`insert: ${error.message}`);
  data.forEach((r) => console.log(`  inserted #${r.id} (ext ${r.external_id}) ${r.name}`));
}

for (const p of unpublish) {
  const { error } = await supabase.from("products").update({ published: false }).eq("id", p.id);
  if (error) throw new Error(`unpublish #${p.id}: ${error.message}`);
}
if (unpublish.length) console.log(`unpublished ${unpublish.length} products`);

console.log("\nDone. Inserted products have no photo yet — re-run reimage-products.mjs to fetch it.");
