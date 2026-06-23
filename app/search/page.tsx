import Link from "next/link";
import ManufacturerFilter from "@/components/ManufacturerFilter";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
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

  const [{ products, total }, brands] = await Promise.all([
    searchProducts(supabase, q, { brandIds: selectedBrandIds, page: currentPage, pageSize: PAGE_SIZE }),
    getBrandsForSearch(supabase, q),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-xl font-bold">
          Результаты поиска: <span className="text-green-600">«{q}»</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Найдено: {total} товаров</p>
      </div>

      <ManufacturerFilter manufacturers={brands} />

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Ничего не найдено</p>
          <Link href="/" className="text-green-600 text-sm mt-2 inline-block hover:underline">
            Вернуться в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i === 0} />
            ))}
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/search"
            query={selectedBrandIds.length > 0 ? { q, brand: selectedBrandIds.map(String) } : { q }}
          />
        </>
      )}
    </main>
  );
}
