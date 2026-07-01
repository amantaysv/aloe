import { notFound, redirect } from "next/navigation";
import { MainContainer, MobileHeader, SubcategoryFilter, VirtualCategoryContent } from "@/components";
import { getCachedCategoriesWithSlug } from "@/lib/cached-queries";
import { parseSortParam } from "@/lib/page-params";
import { supabase } from "@/lib/supabase";
import { getSubcategorySection } from "@/services/product.service";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const validSort = parseSortParam(sp.sort);

  const allCategories = await getCachedCategoriesWithSlug();

  const category = allCategories?.find((c) => c.slug === slug);
  if (!category) notFound();

  if (category.parent_id) {
    const parent = allCategories?.find((c) => c.id === category.parent_id);
    redirect(`/catalog/${parent?.slug ?? slug}/${slug}`);
  }

  const subcategories = allCategories.filter((c) => c.parent_id === category.id);

  const sections = await Promise.all(
    subcategories.map(async (s) => {
      const { products, total } = await getSubcategorySection(supabase, s.id, validSort);
      return { sub: s, products, total };
    }),
  );

  const nonEmpty = sections.filter((s) => s.total > 0);
  if (!nonEmpty.length) notFound();

  return (
    <>
      <MobileHeader title={category.name} withBackButton />

      <SubcategoryFilter subcategories={subcategories} scrollMode />
      <MainContainer>
        <VirtualCategoryContent
          sections={nonEmpty.map(({ sub: s, products }) => ({ id: s.id, name: s.name, products }))}
        />
      </MainContainer>
    </>
  );
}
