import type { Metadata } from "next";
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
import { parseBrandIds, parsePage } from "@/lib/page-params";
import { supabase } from "@/lib/supabase";
import { getBrandsForSearch, searchProducts } from "@/services/product.service";

const PAGE_SIZE = 24;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q?.trim() ? `${q} — поиск` : "Поиск",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; brand?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const currentPage = parsePage(sp.page);
  const selectedBrandIds = parseBrandIds(sp.brand);

  if (!q.trim()) {
    return (
      <>
        <MobileHeader>
          <MobileSearchInput searchPath="/search" />
        </MobileHeader>
        <MainContainer>
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Введите название товара для поиска</p>
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
        <MobileSearchInput defaultValue={q} searchPath="/search" />
      </MobileHeader>
      <MainContainer>
        <div className="mb-4 md:mb-6">
          <Title>
            Результаты поиска: <span className="text-green-600">«{q}»</span>
          </Title>
          <p className="text-sm text-gray-500 mt-1">Найдено: {total} товаров</p>
        </div>

        <ManufacturerFilter manufacturers={brands} className="mb-4 md:mb-6" />

        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">Ничего не найдено</p>
            <Link href="/" className="text-green-600 text-sm mt-2 inline-block hover:underline">
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
              basePath="/search"
              query={selectedBrandIds.length > 0 ? { q, brand: selectedBrandIds.map(String) } : { q }}
            />
          </>
        )}
      </MainContainer>
    </>
  );
}
