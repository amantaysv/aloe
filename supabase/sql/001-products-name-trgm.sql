-- Trigram index for product name search.
--
-- `searchProducts` and `searchProductsAutocomplete` both use `ilike '%q%'`, which a btree
-- index cannot serve — every keystroke in the header autocomplete (300 ms debounce) and every
-- /search request is a sequential scan over the whole products table. `getBrandsForSearch`
-- then scans it a second time for the same query.
--
-- Additive and safe to run against the live database. Plain CREATE INDEX rather than
-- CONCURRENTLY: the Supabase SQL Editor wraps statements in a transaction, where CONCURRENTLY
-- is rejected — and at a few thousand rows the build holds the write lock for milliseconds.

create extension if not exists pg_trgm;

create index if not exists products_name_trgm_idx
  on public.products
  using gin (name gin_trgm_ops);

-- Verify the planner actually picks it up (expect "Bitmap Index Scan on products_name_trgm_idx"):
--   explain analyze
--   select id, name from public.products
--   where published = true and name ilike '%крем%'
--   limit 24;
