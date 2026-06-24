import Link from "next/link";
import { redirect } from "next/navigation";
import MainContainer from "@/components/MainContainer";
import ProductCard from "@/components/ProductCard";
import ProductGrid from "@/components/ProductGrid";
import Title from "@/components/Title";
import { createClient } from "@/lib/supabase-server";
import { getFavoriteProducts } from "@/services/favorites.service";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const products = await getFavoriteProducts(supabase, user.id);

  return (
    <MainContainer>
      <Title className="mb-6">Избранное</Title>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">♡</p>
          <p className="text-lg font-medium text-gray-600">Здесь пока пусто</p>
          <p className="text-sm mt-1 mb-6">Добавляйте товары в избранное, нажимая на сердечко</p>
          <Link href="/" className="text-green-600 hover:underline text-sm">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <ProductGrid>
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i === 0} />
          ))}
        </ProductGrid>
      )}
    </MainContainer>
  );
}
