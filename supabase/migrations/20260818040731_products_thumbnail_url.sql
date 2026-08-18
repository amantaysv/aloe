-- Product cards (grids, carousels, brand pages) render the image at ~300-600px,
-- but were loading the same file as the product page. Split the two: image_url
-- keeps the large image used on /product/[id] and the quick-view modal, and
-- thumbnail_url holds a small variant for cards.
--
-- Nullable on purpose — the app falls back to image_url when a row has no
-- thumbnail yet, so the column can be backfilled without downtime.
alter table public.products
  add column if not exists thumbnail_url text;

comment on column public.products.thumbnail_url is
  'Small (500px) card variant of image_url. Null → fall back to image_url.';
