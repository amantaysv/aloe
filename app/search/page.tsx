import Link from "next/link";
import MainContainer from "@/components/MainContainer";
import ManufacturerFilter from "@/components/ManufacturerFilter";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import Title from "@/components/Title";
import { supabase } from "@/lib/supabase";
import { getBrandsForSearch, searchProducts } from "@/services/product.service";

const PAGE_SIZE = 24;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; brand?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const currentPage = Math.max(1, parseInt(sp.page ?? "1"));
  const selectedBrandIds = (sp.brand ? (Array.isArray(sp.brand) ? sp.brand : [sp.brand]) : []).map(Number);

  if (!q.trim()) {
    return (
      <MainContainer>
        <div className="mb-6 lg:hidden">
          <SearchBar withButton />
        </div>
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Введите название товара для поиска</p>
        </div>
      </MainContainer>
    );
  }

  const [{ products, total }, brands] = await Promise.all([
    searchProducts(supabase, q, { brandIds: selectedBrandIds, page: currentPage, pageSize: PAGE_SIZE }),
    getBrandsForSearch(supabase, q),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <MainContainer>
      <div className="mb-6 lg:hidden">
        <SearchBar defaultValue={q} withButton />
      </div>

      <div className="mb-6">
        <Title>
          Результаты поиска: <span className="text-green-600">«{q}»</span>
        </Title>
        <p className="text-sm text-gray-500 mt-1">Найдено: {total} товаров</p>
      </div>

      <ManufacturerFilter manufacturers={brands} className="mb-6" />

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
  );
}
