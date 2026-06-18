# Проект: aloe.kg — миграция с Joomla на Next.js

## Контекст
Интернет-магазин бытовой химии и косметики в Бишкеке (Кыргызстан).
Оригинальный сайт: https://aloe.kg — работает на Joomla 3.10 + JoomShopping (outdated, PHP 7.3).
Задача: полный rebuild на Next.js + Supabase.

---

## Стек
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Деплой:** пока локально (localhost:3000)
- **Пакеты:** @supabase/supabase-js, @supabase/ssr, zustand

---

## Supabase
- **Project URL:** `https://dnlburbuchxzxdmhuczu.supabase.co`
- **Publishable key:** `sb_publishable_a5V96BebxldwU1HnspkUCA_1x31NaVm`
- **Project name:** aloe-kg

### Таблицы в БД:
1. **products** — 1128 товаров (спарсены с aloe.kg)
   - id, external_id, name, price, image_url, product_url, category, category_id
   - RLS отключён

2. **categories** — 73 записи (11 родительских + подкатегории)
   - id (text), name, parent_id (null = родительская)
   - RLS отключён
   - Родительские: bytovaya, deti, dom, muzhchiny, ofis, kosmetika, podguzniki, gigiena, volosy, rot, telo

3. **favorites** — избранное пользователей
   - id, user_id (→ auth.users), product_id (→ products), created_at
   - RLS включён: "Users manage own favorites"

4. **cart_items** — корзина в БД (для авторизованных)
   - id, user_id, product_id, quantity, created_at
   - RLS включён: "Users manage own cart"

5. **orders** — заказы
   - id, user_id, items (jsonb), total, status (default: 'new'), created_at
   - RLS включён: "Users manage own orders"

---

## Структура проекта
```
aloe/
├── proxy.ts                # Supabase session refresh (Next.js 16 аналог middleware)
├── app/
│   ├── layout.tsx          # Root layout с Header + CatalogSidebar + Toaster
│   ├── page.tsx            # Главная — сетка всех подкатегорий
│   ├── globals.css         # Tailwind + анимация slide-up для тостов
│   ├── catalog/
│   │   └── [id]/
│   │       └── page.tsx    # Страница категории с товарами (grid) + FavoriteButton
│   ├── search/
│   │   └── page.tsx        # Страница поиска с пагинацией + FavoriteButton
│   ├── cart/
│   │   └── page.tsx        # Страница корзины (client component)
│   ├── favorites/
│   │   └── page.tsx        # Страница избранного (server, требует авторизации)
│   ├── profile/
│   │   └── page.tsx        # Профиль пользователя + история заказов (server)
│   └── auth/
│       ├── page.tsx        # Страница входа/регистрации
│       └── confirm/
│           └── route.ts    # Route handler для подтверждения email из письма Supabase
├── components/
│   ├── CatalogSidebar.tsx  # Аккордеон с категориями (client)
│   ├── Header.tsx          # Хедер с логотипом, SearchBar, избранное, CartIcon, AuthButton
│   ├── SearchBar.tsx       # Поиск с дропдауном (debounce 300ms, ilike)
│   ├── CartIcon.tsx        # Иконка корзины с счётчиком (client)
│   ├── AuthButton.tsx      # Кнопка входа/имя пользователя (client); при выходе сбрасывает favorites store
│   ├── AddToCart.tsx       # Кнопка "В корзину" с +/- (client); toast при добавлении
│   ├── FavoriteButton.tsx  # Сердечко на карточке (client); оптимистичное обновление
│   └── Toaster.tsx         # Toast-уведомления (client, fixed bottom-right)
├── lib/
│   ├── supabase.ts         # createClient для server components (без сессии)
│   ├── supabase-server.ts  # createServerClient (@supabase/ssr, с cookie)
│   └── supabase-browser.ts # createBrowserClient (@supabase/ssr)
├── store/
│   ├── cart.ts             # Zustand store для корзины (persist в localStorage)
│   ├── favorites.ts        # Zustand store для избранного (загружает IDs из Supabase)
│   └── toast.ts            # Zustand store для тостов (auto-dismiss 3.5s)
└── types/
    └── index.ts            # type Product
```

---

## Что сделано
- [x] Парсинг товаров с aloe.kg (1128 товаров в products.json)
- [x] Загрузка товаров в Supabase
- [x] Таблица categories с иерархией (родитель → подкатегории)
- [x] Главная страница — сетка подкатегорий
- [x] Страница категории — grid товаров с фото и ценой
- [x] Сайдбар с аккордеоном категорий (зелёный хедер "Каталог товаров")
- [x] Хедер с логотипом aloe.kg
- [x] Поиск — дропдаун с live-результатами + страница /search с пагинацией
- [x] Корзина — Zustand (localStorage), кнопка "В корзину" на карточках, страница /cart
- [x] Auth — страница /auth (login/register через Supabase email+password)
- [x] AuthButton в хедере (показывает email или "Войти")
- [x] Таблицы favorites, cart_items, orders с RLS политиками
- [x] proxy.ts — обновление Supabase сессии на каждый запрос (Next.js 16)
- [x] Страница профиля /profile — аватар, email, история заказов
- [x] Toast-уведомления — Zustand store + Toaster компонент (slide-up анимация)
- [x] Auth: после регистрации экран "Проверьте почту" вместо редиректа
- [x] Auth: перевод ошибок на русский + обработка уже зарегистрированного email (identities[])
- [x] Route handler /auth/confirm — обрабатывает ссылку из письма Supabase
- [x] Избранное — FavoriteButton на карточках, store, страница /favorites
- [x] Toast "Добавлено в корзину" при добавлении товара

## Что осталось сделать
- [ ] Синхронизация корзины с БД (cart_items) при авторизации
- [ ] Страница товара /catalog/[id]/[productId] с описанием
- [ ] Допарсить описания товаров (нужен повторный парсинг product_url)
- [ ] Страница оформления заказа /checkout
- [ ] Пагинация на странице категории (сейчас показывает только 24 товара — лимит парсера)
- [ ] Исправить пагинацию парсера и допарсить все ~3000 товаров
- [ ] Мобильная адаптация (сайдбар скрывается на мобиле)
- [ ] Деплой на Vercel

---

## Важные детали

### Next.js 16
- Middleware переименован в **Proxy** (`proxy.ts` вместо `middleware.ts`)
- `params` и `searchParams` в page.tsx — async: `{ params }: { params: Promise<{ id: string }> }`

### next.config.ts
```ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'aloe.kg' },
    ],
  },
}
export default nextConfig
```

### .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://dnlburbuchxzxdmhuczu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_a5V96BebxldwU1HnspkUCA_1x31NaVm
```

### Картинки товаров
Хранятся на aloe.kg: `https://aloe.kg/components/com_jshopping/files/img_products/thumb_*.jpg`
Загружаются через `<Image unoptimized />` из next/image.

### Корзина
Zustand store с persist в localStorage. При авторизации нужно будет смержить localStorage корзину с cart_items в Supabase.

### Избранное
Zustand store (`store/favorites.ts`) — загружает все product_id за один запрос при первом рендере FavoriteButton. Оптимистичное обновление. При выходе из аккаунта (AuthButton) вызывает `reset()`.

### Тосты
`store/toast.ts` — `show(message, type)`, auto-dismiss 3.5s. Типы: `success` (зелёный), `error` (красный), `info` (серый).

### Парсер
Файл `parse_aloe.py` — парсит по subcategory ID через `/catalog/category/view/{id}.html`.
Проблема: берёт только 24 товара (1 страница). Пагинация не работает корректно — нужно доработать.
