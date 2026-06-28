# Aloe.kg — Project Reference

## Tech Stack

- **Framework:** Next.js 16.2.9 (App Router, Server Components, Server Actions, React 19)
- **Language:** TypeScript 6.0.3 (strict mode, path alias `@/*` → root)
- **Database:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **State:** Zustand 5.0.14 with persist middleware (localStorage)
- **Styling:** Tailwind CSS 4.3.1, no dark mode
- **UI libs:** Lucide React, React Icons, Embla Carousel, react-markdown, NextTopLoader, @tailwindcss/typography
- **Code quality:** ESLint 9, Prettier (120 char, import sorting)

## Directory Structure

```
/
├── app/                    # Next.js App Router pages
├── components/             # 29 shared React components
├── lib/                    # Supabase clients, caching, cn() util
├── services/               # Data access layer (8 domain modules)
├── store/                  # Zustand stores (cart, favorites, toast, mobile-menu)
├── types/                  # TypeScript type definitions (index.ts)
├── proxy.ts                # Middleware — Supabase auth cookie management
├── next.config.ts          # Image optimization, remote patterns
└── .env.local              # Supabase keys (see below)
```

## App Routes

```
/                           # Home page (carousels: popular, new, sale, discount, categories)
/auth                       # Login / register (email+password, Google OAuth)
/auth/confirm               # Email OTP verification & OAuth PKCE callback (route.ts)
/product/[id]               # Product detail page
/catalog                    # All categories index
/catalog/[slug]             # Category listing with filters
/catalog/[slug]/[subSlug]   # Subcategory listing with filters
/brands                     # All brands index (alphabetical)
/brands/[brand]             # Brand product listing
/search                     # Search results with filters
/cart                       # Shopping cart
/checkout                   # Order form + payment success
/profile                    # User profile, orders, favorites (auth required)
/favorites                  # Saved items
/delivery                   # Delivery info
/popular /new /sale /discount  # Label-based product pages
/admin                      # Admin dashboard (role: admin)
/admin/orders               # Order management
/admin/products             # Product CRUD
/admin/categories           # Category management
/admin/brands               # Brand management
/admin/banners              # Banner carousel management
```

## Database Schema (Supabase / PostgreSQL)

### products

| column      | type        | notes                                              |
| ----------- | ----------- | -------------------------------------------------- |
| id          | int         | PK                                                 |
| external_id | text        |                                                    |
| name        | text        |                                                    |
| price       | numeric     |                                                    |
| old_price   | numeric     | nullable                                           |
| image_url   | text        |                                                    |
| product_url | text        |                                                    |
| category    | text        | string label                                       |
| category_id | int         | FK → categories.id                                 |
| label       | text        | `popular` \| `new` \| `sale` \| `discount` \| null |
| description | text        | nullable                                           |
| brand_id    | int         | FK → brands.id                                     |
| seo_text    | text        | nullable                                           |
| published   | boolean     |                                                    |
| created_at  | timestamptz |                                                    |

### categories

| column    | type | notes                                  |
| --------- | ---- | -------------------------------------- |
| id        | int  | PK                                     |
| name      | text |                                        |
| slug      | text |                                        |
| parent_id | int  | self-referential FK (null = top-level) |
| image_url | text | nullable                               |

### brands

| column | type | notes |
| ------ | ---- | ----- |
| id     | int  | PK    |
| name   | text |       |
| slug   | text |       |

### banners

| column     | type    | notes    |
| ---------- | ------- | -------- |
| id         | int     | PK       |
| image_url  | text    |          |
| sort_order | int     |          |
| active     | boolean |          |
| link       | text    | nullable |

### profiles

| column     | type        | notes           |
| ---------- | ----------- | --------------- |
| id         | uuid        | FK → auth.users |
| name       | text        |                 |
| phone      | text        |                 |
| address    | text        |                 |
| updated_at | timestamptz |                 |

### orders

| column           | type        | notes                    |
| ---------------- | ----------- | ------------------------ |
| id               | int         | PK                       |
| user_id          | uuid        | nullable FK → auth.users |
| customer_name    | text        |                          |
| customer_phone   | text        |                          |
| customer_address | text        |                          |
| comment          | text        |                          |
| items            | jsonb       | array of cart items      |
| total            | numeric     |                          |
| status           | text        | `new` \| ...             |
| created_at       | timestamptz |                          |

### cart_items

| column     | type           |
| ---------- | -------------- |
| user_id    | uuid (PK part) |
| product_id | int (PK part)  |
| quantity   | int            |

### favorites

| column     | type           |
| ---------- | -------------- |
| user_id    | uuid (PK part) |
| product_id | int (PK part)  |
| created_at | timestamptz    |

**Storage buckets:** `product-images` (product photos), `banners` (banner images), `categories` (category images)

## TypeScript Types (`/types/index.ts`)

```typescript
type Brand = { id: number; name: string; slug: string };

type Product = {
  id: number;
  external_id: string;
  name: string;
  price: number;
  image_url: string;
  product_url: string;
  category: string;
  category_id: number;
  label?: "popular" | "new" | "sale" | "discount" | null;
  old_price?: number | null;
  description?: string | null;
  brand_id?: number | null;
  brand_name?: string | null;
  seo_text?: string | null;
  published: boolean;
};

type ProductRow = Product & { brands: { name: string } | null };

function withBrandName(rows: ProductRow[]): Product[]; // maps brands.name → brand_name
```

## Services (`/services/`)

| file                   | purpose                         |
| ---------------------- | ------------------------------- |
| `product.service.ts`   | Product CRUD, filtering, search |
| `brand.service.ts`     | Brand queries                   |
| `category.service.ts`  | Category tree queries           |
| `order.service.ts`     | Order creation & listing        |
| `profile.service.ts`   | User profile read/write         |
| `cart.service.ts`      | DB cart sync (auth users)       |
| `favorites.service.ts` | DB favorites sync (auth users)  |
| `banner.service.ts`    | Banner queries                  |

## Lib Utilities (`/lib/`)

| file                  | purpose                                                         |
| --------------------- | --------------------------------------------------------------- |
| `supabase-server.ts`  | `createClient()` — SSR Supabase with cookies                    |
| `supabase-browser.ts` | `createClient()` — client-side Supabase                         |
| `supabase.ts`         | Direct anon-key client (used by `unstable_cache()` wrappers)    |
| `cn.ts`               | `cn(...classes)` — clsx + tailwind-merge                        |
| `cached-queries.ts`   | ISR-cached wrappers via `unstable_cache()`                      |
| `auth.ts`             | `requireAuth()` — server-side auth guard, redirects to `/auth`  |
| `constants.ts`        | `LABEL_MAP` (badge text/color), `ORDER_STATUS` (label/color)    |
| `page-params.ts`      | `parsePage()`, `parseSortParam()`, `parseBrandIds()` — URL helpers |

### Cached Queries (ISR tags & TTLs)

| function                                            | TTL    | tag          |
| --------------------------------------------------- | ------ | ------------ |
| `getCachedCategories()`                             | 1 hour | `categories` |
| `getCachedCategoriesWithSlug()`                     | 1 hour | `categories` |
| `getCachedBrands()`                                 | 1 hour | `brands`     |
| `getCachedBrandBySlug(slug)`                        | 1 hour | `brands`     |
| `getCachedActiveBanners()`                          | 1 hour | `banners`    |
| `getCachedProductsByLabel(label, limit?)`           | 60 s   | `products`   |
| `getCachedProductsByCategories(ids, limit?)`        | 60 s   | `products`   |
| `getCachedProductsByBrand(id, page, pageSize)`      | 60 s   | `products`   |
| `getCachedHomePageCategoryProducts(groups, limit?)` | 60 s   | `products`   |

## Zustand Stores (`/store/`)

- **cart store** — cart items array, persisted to localStorage; syncs with DB when user logs in
- **favorites store** — product IDs, syncs with DB on auth
- **toast store** — notification queue (no persistence)
- **mobile-menu store** — boolean open/close state for mobile nav (no persistence)

## Server Actions

| file                      | actions                                                                                                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/checkout/actions.ts` | `createOrder()`                                                                                                                                                                                                                   |
| `app/profile/actions.ts`  | `saveProfile()`                                                                                                                                                                                                                   |
| `app/admin/actions.ts`    | `upsertProduct()`, `deleteProduct()`, `uploadProductImage()`, `upsertCategory()`, `deleteCategory()`, `uploadCategoryImage()`, `upsertBrand()`, `deleteBrand()`, `getBrands()`, `upsertBanner()`, `deleteBanner()`, `uploadBannerImage()`, `reorderBanners()`, `updateOrderStatus()` |

## Auth

- **Provider:** Supabase Auth
- **Methods:** Email/password + Google OAuth
- **Email flow:** sign up → email OTP → `/auth/confirm` route → redirect
- **OAuth flow:** Google PKCE → `/auth/confirm` code exchange
- **Admin check:** `user.app_metadata?.role === "admin"`
- **Server auth:** `createClient()` from `supabase-server.ts` (reads cookies)
- **Client sync:** `AuthSync` component listens to auth state, updates Zustand stores
- **Protected routes:** `/admin/*` (401 redirect if not admin), `/profile` (redirect to `/auth`)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL        # https://dnlburbuchxzxdmhuczu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   # public/client-safe
SUPABASE_SERVICE_ROLE_KEY       # server-only, used in admin actions to bypass RLS
```

## Key Patterns

**No `/api` routes** — all data access via Supabase directly or Server Actions.

**Data fetching strategy:**

- RSC + `unstable_cache()` for static/semi-static data (categories, carousels)
- React `cache()` for per-request deduplication
- `Promise.all()` for parallel queries
- Dynamic product/order pages: no caching (fresh per request)

**Admin mutations** always use service role client (bypasses RLS). User mutations use anon client scoped by RLS to `auth.uid()`.

**Image optimization:** Next.js `<Image>` with AVIF/WebP, remote domains whitelisted in `next.config.ts`.

**Primary color:** `#16a34a` (green-600)

## Scripts

```bash
npm run dev         # start dev server
npm run build       # production build
npm run start       # start production server
npm run lint        # ESLint
npm run format      # Prettier write
npm run format:check
```
