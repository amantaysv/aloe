import Link from "next/link";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { getProductsByLabelPaginated } from "@/services/product.service";
import CatalogTitleWithCount from "./CatalogTitleWithCount";
import ProductGrid from "./ProductGrid";

const PAGE_SIZE = 20;

interface Props {
  label: string;
  title: string;
  basePath: string;
  emptyText?: string;
  page: number;
}

export default async function LabelProductsPage({
  label,
  title,
  basePath,
  emptyText = "Товары не добавлены",
  page,
}: Props) {
  const { products, total } = await getProductsByLabelPaginated(supabase, label, { page, pageSize: PAGE_SIZE });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-block">
        ← Главная
      </Link>

      <CatalogTitleWithCount title={title} count={total} />

      {products.length === 0 ? (
        <p className="text-gray-400 text-sm">{emptyText}</p>
      ) : (
        <>
          <ProductGrid>
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i === 0} />
            ))}
          </ProductGrid>
          <Pagination page={page} totalPages={totalPages} basePath={basePath} />
        </>
      )}
    </main>
  );
}
