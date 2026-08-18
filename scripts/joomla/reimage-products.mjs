// Re-fetches every product photo from the old aloe.kg (JoomShopping) store and
// rebuilds two derivatives per product:
//
//   image_url      <id>.webp        1200px  — product page + quick-view modal
//   thumbnail_url  thumb/<id>.webp   500px  — cards in grids, carousels, brand pages
//
// The source is JoomShopping's `full_` variant, i.e. the untouched original
// upload (up to ~3000px / 15 MB), so quality no longer depends on whatever the
// current Supabase file was squeezed down to.
//
// Products whose current image was uploaded through the NEW admin (its filename
// is `<epoch-ms>-<rand>.<ext>`) are left alone — that upload is newer than
// anything the old site has.
//
// Usage:
//   node scripts/joomla/reimage-products.mjs --dry-run          plan only
//   node scripts/joomla/reimage-products.mjs --limit 20         small live test
//   node scripts/joomla/reimage-products.mjs                    full run (resumable)
//   node scripts/joomla/reimage-products.mjs --only-missing     only products with no image
//
// Progress is checkpointed to data/reimage-state.json, so re-running after an
// interruption skips everything already uploaded.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { OUT_DIR, pool, readSupabaseEnv } from "./lib.mjs";

const DRY_RUN = process.argv.includes("--dry-run");
const ONLY_MISSING = process.argv.includes("--only-missing");
const LIMIT = Number(process.argv[process.argv.indexOf("--limit") + 1]) || Infinity;

const BUCKET = "product-images";
const IMG_BASE = "https://aloe.kg/components/com_jshopping/files/img_products";
const CONCURRENCY = 8;
const CHECKPOINT_EVERY = 40;

const FULL = { width: 1200, quality: 82 };
const THUMB = { width: 500, quality: 76 };

// Uploaded via the new admin (app/admin/actions.ts names files `${Date.now()}-${rand}.ext`).
const NEW_ADMIN_UPLOAD = /\/\d{13}-[a-z0-9]+\.[a-z]+$/i;

const { url: SUPABASE_URL, key } = readSupabaseEnv();
const supabase = createClient(SUPABASE_URL, key);

const STATE_FILE = path.join(OUT_DIR, "reimage-state.json");
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : { done: {}, failed: {} };
const saveState = () => {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 1));
};

// ---------------------------------------------------------------------------
// Build the work list
// ---------------------------------------------------------------------------
const oldById = new Map(
  JSON.parse(readFileSync(path.join(OUT_DIR, "joomla-products.json"), "utf8")).map((p) => [p.external_id, p]),
);

const ours = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("products")
    .select("id,external_id,name,image_url,thumbnail_url")
    .order("id")
    .range(from, from + 999);
  if (error) throw error;
  ours.push(...data);
  if (data.length < 1000) break;
}

const skipped = { noExternalId: 0, noSourceImage: 0, newAdminUpload: 0, alreadyDone: 0 };
const work = [];

for (const p of ours) {
  if (!p.external_id) {
    skipped.noExternalId++;
    continue;
  }
  const src = oldById.get(p.external_id);
  if (!src?.image_full) {
    skipped.noSourceImage++;
    continue;
  }
  if (p.image_url && NEW_ADMIN_UPLOAD.test(p.image_url)) {
    skipped.newAdminUpload++;
    continue;
  }
  if (ONLY_MISSING && p.image_url) continue;
  if (state.done[p.id]) {
    skipped.alreadyDone++;
    continue;
  }
  work.push({ id: p.id, name: p.name, oldImageUrl: p.image_url, src });
}

const todo = work.slice(0, LIMIT === Infinity ? work.length : LIMIT);

console.log(`supabase: ${ours.length} products · old site: ${oldById.size} products`);
console.log(
  `skipped — no external_id: ${skipped.noExternalId}, no photo on old site: ${skipped.noSourceImage}, uploaded via new admin: ${skipped.newAdminUpload}, already done: ${skipped.alreadyDone}`,
);
console.log(`to process: ${todo.length}${todo.length < work.length ? ` (of ${work.length}, --limit)` : ""}`);
console.log(`presets: full ${FULL.width}px q${FULL.quality} · thumb ${THUMB.width}px q${THUMB.quality}\n`);

if (DRY_RUN) {
  todo.slice(0, 20).forEach((w) => console.log(`  #${w.id}  ${w.src.image_full.slice(0, 60)}  ${w.name.slice(0, 40)}`));
  console.log("\n--dry-run: nothing downloaded or written.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Fetch → encode → upload
// ---------------------------------------------------------------------------
async function download(file, attempt = 0) {
  try {
    const res = await fetch(`${IMG_BASE}/${encodeURIComponent(file)}`);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return { buffer: Buffer.from(await res.arrayBuffer()) };
  } catch (err) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      return download(file, attempt + 1);
    }
    return { error: err.message };
  }
}

/** Prefer the original; fall back to the 500px and 300px variants if it is missing or corrupt. */
async function loadSource(src) {
  const candidates = [src.image_full, src.image_main, src.image_thumb].filter(Boolean);
  const errors = [];
  for (const file of candidates) {
    const { buffer, error } = await download(file);
    if (error) {
      errors.push(`${file}: ${error}`);
      continue;
    }
    try {
      const meta = await sharp(buffer).metadata();
      if (!meta.width) throw new Error("no dimensions");
      return { buffer, meta, file };
    } catch (err) {
      errors.push(`${file}: undecodable (${err.message})`);
    }
  }
  return { error: errors.join(" | ") };
}

const encode = (buffer, { width, quality }) =>
  sharp(buffer)
    // Phone uploads carry EXIF orientation; bake it in before resizing.
    .rotate()
    .resize(width, width, { fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

let ok = 0;
let failed = 0;
let srcBytes = 0;
let outBytes = 0;
const pending = []; // DB updates awaiting the next checkpoint
const started = Date.now();

async function flush() {
  if (!pending.length) return;
  const batch = pending.splice(0, pending.length);
  // No bulk-update in PostgREST for differing values; upsert on the PK instead.
  for (const row of batch) {
    const { error } = await supabase
      .from("products")
      .update({ image_url: row.image_url, thumbnail_url: row.thumbnail_url })
      .eq("id", row.id);
    if (error) throw new Error(`db update #${row.id}: ${error.message}`);
  }
  saveState();
}

await pool(todo, CONCURRENCY, async (w, i) => {
  const { buffer, meta, file, error } = await loadSource(w.src);
  if (error) {
    failed++;
    state.failed[w.id] = error;
    console.log(`  ✗ #${w.id} ${error.slice(0, 120)}`);
    return;
  }

  try {
    const [full, thumb] = await Promise.all([encode(buffer, FULL), encode(buffer, THUMB)]);
    const fullPath = `${w.id}.webp`;
    const thumbPath = `thumb/${w.id}.webp`;

    for (const [p, body] of [
      [fullPath, full],
      [thumbPath, thumb],
    ]) {
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(p, body, { contentType: "image/webp", cacheControl: "2592000", upsert: true });
      if (upErr) throw new Error(upErr.message);
    }

    const publicUrl = (p) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p}`;
    const row = { id: w.id, image_url: publicUrl(fullPath), thumbnail_url: publicUrl(thumbPath) };

    state.done[w.id] = {
      src: file,
      srcPx: `${meta.width}x${meta.height}`,
      srcKb: Math.round(buffer.length / 1024),
      fullKb: Math.round(full.length / 1024),
      thumbKb: Math.round(thumb.length / 1024),
      // Kept so the superseded Supabase object can be cleaned up later.
      replaced: w.oldImageUrl || null,
    };
    delete state.failed[w.id];
    pending.push(row);
    ok++;
    srcBytes += buffer.length;
    outBytes += full.length + thumb.length;

    if (pending.length >= CHECKPOINT_EVERY) await flush();
    if (ok % 100 === 0) {
      const per = (Date.now() - started) / ok / 1000;
      const left = ((todo.length - i) * per) / 60;
      console.log(
        `  ${ok}/${todo.length} ok, ${failed} failed · ${(srcBytes / 1073741824).toFixed(2)} GB in → ${(outBytes / 1048576).toFixed(0)} MB out · ~${left.toFixed(0)} min left`,
      );
    }
  } catch (err) {
    failed++;
    state.failed[w.id] = err.message;
    console.log(`  ✗ #${w.id} ${err.message.slice(0, 120)}`);
  }
});

await flush();
saveState();

const mins = (Date.now() - started) / 60000;
console.log(`
done in ${mins.toFixed(1)} min
  updated : ${ok}
  failed  : ${failed}
  source downloaded : ${(srcBytes / 1073741824).toFixed(2)} GB
  uploaded          : ${(outBytes / 1048576).toFixed(0)} MB  (avg full ${(outBytes / ok / 1024 / 2).toFixed(0)} KB-ish per variant)`);
if (failed) console.log(`\nfailures are listed in data/reimage-state.json → .failed; re-run to retry them`);
