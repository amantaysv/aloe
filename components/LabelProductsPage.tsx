import { supabase } from "@/lib/supabase";
import { getPopularProductsPaginated, getProductsByLabelPaginated } from "@/services/product.service";
import MainContainer from "./MainContainer";
import Pagination from "./Pagination";
import ProductCard from "./ProductCard";
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
  const { products, total } =
    label === "popular"
      ? await getPopularProductsPaginated(supabase, { page, pageSize: PAGE_SIZE })
      : await getProductsByLabelPaginated(supabase, label, { page, pageSize: PAGE_SIZE });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <MainContainer>
      <h2 className="text-lg font-semibold mb-4 text-center md:text-left">{title}</h2>

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
