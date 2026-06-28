import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Breadcrumb,
  MainContainer,
  MobileCatalogHeader,
  MobileHeader,
  ProductCard,
  ProductGrid,
  SeeAllProducts,
  SortSelect,
  SubcategoryFilter,
  TitleWithCount,
} from "@/components";
import { getCachedCategoriesWithSlug } from "@/lib/cached-queries";
import { parseSortParam } from "@/lib/page-params";
import { supabase } from "@/lib/supabase";
import { getSubcategorySection } from "@/services/product.service";

const SECTION_LIMIT = 8;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; sub?: string; page?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const validSort = parseSortParam(sp.sort);
  const activeSub = sp.sub;

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
      const { products, total } = await getSubcategorySection(supabase, s.id, validSort, SECTION_LIMIT);
      return { sub: s, products, total };
    }),
  );

  const nonEmpty = sections.filter((s) => s.total > 0);
  if (!nonEmpty.length) notFound();

  const totalCount = nonEmpty.reduce((acc, s) => acc + s.total, 0);

  return (
    <>
      <MobileHeader>
        <MobileCatalogHeader title={category.name} />
      </MobileHeader>

      <MainContainer className="pt-20">
        <Breadcrumb crumbs={[{ label: "Главная", href: "/" }, { label: category.name }]} />

        <TitleWithCount className="hidden md:flex" count={totalCount}>
          {category.name}
        </TitleWithCount>

        <SubcategoryFilter subcategories={subcategories} categorySlug={slug} activeSubSlug={activeSub} />

        <div className="flex justify-end mb-6">
          <SortSelect current={validSort} />
        </div>

        <div className="space-y-10">
          {nonEmpty.map(({ sub: s, products, total }) => (
            <div key={s.id}>
              <Link
                className="flex md:hidden items-center justify-center gap-2 text-lg font-semibold mb-4"
                href={`/catalog/${slug}/${s.slug}`}
              >
                {s.name}
                <ArrowRightIcon className="size-4" />
              </Link>
              <div className="hidden md:flex items-center justify-center md:justify-between mb-4">
                <h2 className="text-lg font-semibold">{s.name}</h2>
                <SeeAllProducts href={`/catalog/${slug}/${s.slug}`} count={total - nonEmpty.length} />
              </div>
              <ProductGrid>
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i === 0} />
                ))}
              </ProductGrid>
            </div>
          ))}
        </div>
      </MainContainer>
    </>
  );
}
