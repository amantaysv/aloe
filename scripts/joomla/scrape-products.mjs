// Scrapes the full product list out of the old aloe.kg JoomShopping admin
// (the live prod store) so we can diff it against Supabase and re-fetch the
// original, uncompressed product images.
//
// Usage:
//   node scripts/joomla/scrape-products.mjs
//
// Credentials come from scripts/joomla/.env.joomla (git-ignored):
//   JOOMLA_BASE=https://aloe.kg
//   JOOMLA_ADMIN_KEY=...      # AdminExile query key that unlocks /administrator
//   JOOMLA_USER=...
//   JOOMLA_PASS=...
//
// Writes: scripts/joomla/data/joomla-products.json

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { adminGet, loginToJoomla, OUT_DIR, readJoomlaEnv } from "./lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGE_SIZE = 200;

// One <tr class="rowN"> of the JoomShopping product list. The list is the only
// place that exposes every product cheaply — the edit page has more fields but
// costs one request per product.
function parseRows(html) {
  const rows = html.match(/<tr class="row\d"[\s\S]*?<\/tr>/g) ?? [];
  return rows.map((row) => {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(([, c]) => c);
    const text = (c) =>
      (c ?? "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;|&apos;/g, "'")
        .replace(/&laquo;/g, "«")
        .replace(/&raquo;/g, "»")
        .replace(/\s+/g, " ")
        .trim();

    const id = row.match(/name="cid\[\]" value="(\d+)"/)?.[1];
    const thumb = row.match(/img_products\/([^"?]+)"/)?.[1] ?? null;
    // task=publish on the toggle means "clicking publishes it" → it is currently unpublished.
    const published = /listItemTask\('cb\d+','unpublish'\)/.test(row);
    const priceCell = text(cells[7]);

    return {
      external_id: id,
      name: text(cells[3]),
      category: text(cells[4]),
      manufacturer: text(cells[5]) || null,
      ean: text(cells[6]) || null,
      price: Number(priceCell.replace(/[^\d.]/g, "")) || 0,
      hits: Number(text(cells[8])) || 0,
      date: text(cells[9]),
      published,
      // JoomShopping keeps three variants side by side in img_products/:
      //   thumb_X (300px) · X (500px) · full_X (the untouched original upload)
      image_thumb: thumb,
      image_main: thumb?.replace(/^thumb_/, "") ?? null,
      image_full: thumb?.replace(/^thumb_/, "full_") ?? null,
    };
  });
}

const env = readJoomlaEnv();
const jar = await loginToJoomla(env);

const all = [];
const seen = new Set();

for (let start = 0; ; start += PAGE_SIZE) {
  const html = await adminGet(
    env,
    jar,
    `option=com_jshopping&controller=products&category_id=0&limit=${PAGE_SIZE}&limitstart=${start}`,
  );
  const rows = parseRows(html);
  if (!rows.length) break;

  let fresh = 0;
  for (const row of rows) {
    if (seen.has(row.external_id)) continue;
    seen.add(row.external_id);
    all.push(row);
    fresh++;
  }
  process.stdout.write(`  limitstart=${start}: ${rows.length} rows (${fresh} new), total ${all.length}\n`);

  // JoomShopping clamps limitstart to the last page instead of returning an
  // empty list, so stop once a page adds nothing.
  if (!fresh) break;
  if (rows.length < PAGE_SIZE) break;
}

mkdirSync(OUT_DIR, { recursive: true });
const out = path.join(OUT_DIR, "joomla-products.json");
writeFileSync(out, JSON.stringify(all, null, 1));

const noImage = all.filter((p) => !p.image_thumb).length;
console.log(`\n${all.length} products → ${path.relative(path.join(__dirname, "../.."), out)}`);
console.log(
  `  published: ${all.filter((p) => p.published).length}, unpublished: ${all.length - all.filter((p) => p.published).length}`,
);
console.log(`  without image: ${noImage}`);
