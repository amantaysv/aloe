import Image from "next/image";
import Link from "next/link";
import {
  MainContainer,
  ManufacturerFilter,
  MobileHeader,
  MobileSearchInput,
  Pagination,
  ProductCard,
  ProductGrid,
  Title,
} from "@/components";
import { getCachedCategories } from "@/lib/cached-queries";
import { parseBrandIds, parsePage } from "@/lib/page-params";
import { supabase } from "@/lib/supabase";
import { getBrandsForSearch, searchProducts } from "@/services/product.service";

const PAGE_SIZE = 24;

const SPECIALS_BASE_URL = "https://dnlburbuchxzxdmhuczu.supabase.co/storage/v1/object/public/categories/specials";

const specials: Array<{ href: string; label: string; image_url?: string | null }> = [
  { href: "/popular", label: "Популярное", image_url: `${SPECIALS_BASE_URL}/popular.webp` },
  { href: "/new", label: "Новинки", image_url: `${SPECIALS_BASE_URL}/new.webp` },
  { href: "/sale", label: "Акции", image_url: `${SPECIALS_BASE_URL}/sale.webp` },
  { href: "/brands", label: "Бренды", image_url: `${SPECIALS_BASE_URL}/brands.webp` },
];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; brand?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const currentPage = parsePage(sp.page);
  const selectedBrandIds = parseBrandIds(sp.brand);

  const allCategories = await getCachedCategories();
  const topCategories = (
    allCategories as Array<{
      id: number;
      name: string;
      parent_id: number | null;
      slug: string;
      image_url?: string | null;
    }>
  ).filter((c) => !c.parent_id);

  if (!q.trim()) {
    return (
      <>
        <MobileHeader>
          <MobileSearchInput searchPath="/catalog" />
        </MobileHeader>
        <MainContainer>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {specials.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                {s.image_url && (
                  <Image
                    src={s.image_url}
                    alt={s.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 300px"
                  />
                )}
                <div className="absolute inset-0 bg-black/25" />
                <span className="absolute top-2 left-2 text-xs font-medium text-white drop-shadow leading-tight max-w-[calc(100%-1rem)]">
                  {s.label}
                </span>
              </Link>
            ))}
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                {cat.image_url && (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 300px"
                  />
                )}
                <div className="absolute inset-0 bg-black/25" />
                <span className="absolute top-2 left-2 text-xs font-medium text-white drop-shadow leading-tight max-w-[calc(100%-1rem)]">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </MainContainer>
      </>
    );
  }

  const [{ products, total }, brands] = await Promise.all([
    searchProducts(supabase, q, { brandIds: selectedBrandIds, page: currentPage, pageSize: PAGE_SIZE }),
    getBrandsForSearch(supabase, q),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <MobileHeader>
        <MobileSearchInput defaultValue={q} searchPath="/catalog" />
      </MobileHeader>
      <MainContainer>
        <div className="mb-4">
          <Title>
            Результаты поиска: <span className="text-green-600">«{q}»</span>
          </Title>
          <p className="text-sm text-gray-500 mt-1">Найдено: {total} товаров</p>
        </div>

        <ManufacturerFilter manufacturers={brands} className="mb-4" />

        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">Ничего не найдено</p>
            <Link href="/catalog" className="text-green-600 text-sm mt-2 inline-block hover:underline">
              Вернуться в каталог
            </Link>
          </div>
        ) : (
          <>
            <ProductGrid>
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i === 0} />
              ))}
            </ProductGrid>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              basePath="/catalog"
              query={selectedBrandIds.length > 0 ? { q, brand: selectedBrandIds.map(String) } : { q }}
            />
          </>
        )}
      </MainContainer>
    </>
  );
}
