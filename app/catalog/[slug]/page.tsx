import { notFound, redirect } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import SeeAllProducts from "@/components/SeeAllProducts";
import SortSelect, { type SortValue } from "@/components/SortSelect";
import { supabase } from "@/lib/supabase";
import { getCategoriesWithSlug } from "@/services/category.service";
import { getSubcategorySection } from "@/services/product.service";

const SECTION_LIMIT = 8;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const sortParam = (sp.sort ?? "name") as SortValue;
  const validSort: SortValue = ["name", "price_asc", "price_desc"].includes(sortParam) ? sortParam : "name";

  const allCategories = await getCategoriesWithSlug(supabase);

  const category = allCategories?.find((c) => c.slug === slug);
  if (!category) notFound();

  if (category.parent_id) {
    const parent = allCategories?.find((c) => c.id === category.parent_id);
    redirect(`/catalog/${parent?.slug ?? slug}/${slug}`);
  }

  const subcategories = allCategories.filter((c) => c.parent_id === category.id);

  const sections = await Promise.all(
    subcategories.map(async (s) => {
      const { products, total } = await getSubcategorySection(supabase, s.id, validSort, SECTION_LIMIT);
      return { sub: s, products, total };
    }),
  );

  const nonEmpty = sections.filter((s) => s.total > 0);
  if (!nonEmpty.length) notFound();

  const totalCount = nonEmpty.reduce((acc, s) => acc + s.total, 0);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb crumbs={[{ label: "Главная", href: "/" }, { label: category.name }]} />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <span className="text-sm text-gray-400">{totalCount} товаров</span>
        <div className="ml-auto">
          <SortSelect current={validSort} />
        </div>
      </div>

      <div className="space-y-10">
        {nonEmpty.map(({ sub: s, products, total }) => (
          <div key={s.id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{s.name}</h2>
              <SeeAllProducts href={`/catalog/${slug}/${s.slug}`} count={total - nonEmpty.length} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i === 0} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
