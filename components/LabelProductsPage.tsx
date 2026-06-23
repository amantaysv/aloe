import Link from "next/link";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { getProductsByLabelPaginated } from "@/services/product.service";

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
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {total ? <span className="text-sm text-gray-400">{total} товаров</span> : null}
      </div>
      {products.length === 0 ? (
        <p className="text-gray-400 text-sm">{emptyText}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i === 0} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath={basePath} />
        </>
      )}
    </main>
  );
}
