import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MainContainer, MobileHeader, NextCategoryLink, SubcategoryFilter, VirtualCategoryContent } from "@/components";
import { getCachedCategoriesWithSlug, getCachedSubcategorySection } from "@/lib/cached-queries";
import { parseSortParam } from "@/lib/page-params";
import { buildCategorySection } from "@/lib/subcategory-sections";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const allCategories = await getCachedCategoriesWithSlug();
  const category = allCategories?.find((c) => c.slug === slug);
  if (!category || category.parent_id) return {};
  return {
    title: `${category.name} — купить в Бишкеке`,
    description: `${category.name}: широкий выбор товаров по выгодным ценам с доставкой по Бишкеку в интернет-магазине Aloe.kg.`,
    alternates: { canonical: `/catalog/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; sub?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const validSort = parseSortParam(sp.sort);

  const allCategories = await getCachedCategoriesWithSlug();

  const category = allCategories?.find((c) => c.slug === slug);
  if (!category) notFound();

  if (category.parent_id) {
    const parent = allCategories?.find((c) => c.id === category.parent_id);
    redirect(`/catalog/${parent?.slug ?? slug}?sub=${slug}`);
  }

  const subcategories = allCategories.filter((c) => c.parent_id === category.id);

  const sections = await Promise.all(
    subcategories.map(async (s) => {
      const subSubcategories = allCategories.filter((c) => c.parent_id === s.id);
      const categoryIds = [String(s.id), ...subSubcategories.map((c) => String(c.id))];
      const { products, total } = await getCachedSubcategorySection(categoryIds, validSort);
      return { sub: s, subSubcategories, products, total };
    }),
  );

  const nonEmpty = sections.filter((s) => s.total > 0);
  if (!nonEmpty.length) notFound();

  const allSections = nonEmpty.map(({ sub, subSubcategories, products }) =>
    buildCategorySection(sub, subSubcategories, products),
  );

  // Only subcategories that actually rendered a section — a pill for an empty one would
  // scroll nowhere, since VirtualCategoryContent never received a matching section.
  const visibleSubcategories = nonEmpty.map((s) => s.sub);

  const initialSectionId = visibleSubcategories.find((s) => s.slug === sp.sub)?.id;

  const topLevelCategories = allCategories.filter((c) => !c.parent_id);
  const currentIndex = topLevelCategories.findIndex((c) => c.id === category.id);
  const nextCategory = topLevelCategories[(currentIndex + 1) % topLevelCategories.length];

  return (
    <>
      <MobileHeader title={category.name} withBackButton />
      <h1 className="sr-only md:not-sr-only md:container md:mx-auto md:px-4 md:pt-2 md:text-2xl md:font-bold">
        {category.name}
      </h1>

      <SubcategoryFilter subcategories={visibleSubcategories} />
      <MainContainer>
        <VirtualCategoryContent sections={allSections} initialSectionId={initialSectionId} />
        {nextCategory && nextCategory.id !== category.id && (
          <NextCategoryLink name={nextCategory.name} slug={nextCategory.slug} />
        )}
      </MainContainer>
    </>
  );
}
