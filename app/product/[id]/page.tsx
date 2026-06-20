import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import FavoriteButton from "@/components/FavoriteButton";
import ProductCard from "@/components/ProductCard";
import ProductDescription from "@/components/ProductDescription";
import { supabase } from "@/lib/supabase";

const LABEL_MAP = {
  popular: { text: "Хит", cls: "bg-green-600" },
  new: { text: "Новинка", cls: "bg-blue-500" },
  sale: { text: "Акция", cls: "bg-orange-500" },
  discount: { text: "Скидка", cls: "bg-red-500" },
} as const;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();

  console.log("🚀 ~ ProductPage ~ product:", product);
  if (!product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  const label = product.label ? LABEL_MAP[product.label as keyof typeof LABEL_MAP] : null;
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-gray-700">
          Главная
        </Link>
        <span>/</span>
        <Link href={`/catalog/${product.category_id}`} className="hover:text-gray-700">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
          <Image src={product.image_url} alt={product.name} fill className="object-contain p-6" unoptimized />
          {label && (
            <div className="absolute top-3 left-3">
              <span className={`${label.cls} text-white text-xs font-semibold px-2 py-1 rounded`}>{label.text}</span>
            </div>
          )}
          {discount && (
            <div className="absolute top-3 right-12">
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">−{discount}%</span>
            </div>
          )}
          <FavoriteButton productId={product.id} />
        </div>

        <div className="flex flex-col">
          <Link href={`/catalog/${product.category_id}`} className="text-sm text-green-600 hover:underline mb-2 w-fit">
            {product.category}
          </Link>

          <h1 className="text-2xl font-bold leading-snug mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold">{product.price} сом</span>
            {product.old_price && <span className="text-lg text-gray-400 line-through">{product.old_price} сом</span>}
          </div>

          <div className="mb-6">
            <AddToCart
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
              }}
              large
            />
          </div>

          {product.description && <ProductDescription text={product.description} />}
        </div>
      </div>

      {related && related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Похожие товары</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} href={`/product/${p.id}`} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
