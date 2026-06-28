import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getProductsByLabelPaginated } from "@/services/product.service";
import MainContainer from "./MainContainer";
import Pagination from "./Pagination";
import ProductCard from "./ProductCard";
import ProductGrid from "./ProductGrid";
import TitleWithCount from "./TitleWithCount";

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
    <MainContainer>
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-block">
        ← Главная
      </Link>

      <TitleWithCount count={total}>{title}</TitleWithCount>

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
    </MainContainer>
  );
}
