import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/types";

import AddToCart from "./AddToCart";
import FavoriteButton from "./FavoriteButton";

type Props = {
  product: Product;
  className?: string;
  href?: string;
};

const LABEL_MAP = {
  popular: { text: "Хит", cls: "bg-green-600" },
  new: { text: "Новинка", cls: "bg-blue-500" },
  sale: { text: "Акция", cls: "bg-orange-500" },
  discount: { text: "Скидка", cls: "bg-red-500" },
} as const;

function ProductBadge({ label }: { label: Product["label"] }) {
  if (!label) return null;
  const { text, cls } = LABEL_MAP[label];
  return (
    <div className="absolute top-1.5 left-1.5 z-10">
      <span className={`${cls} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded`}>{text}</span>
    </div>
  );
}

export default function ProductCard({ product: p, className = "", href }: Props) {
  const productHref = href ?? `/product/${p.id}`;

  return (
    <div className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white ${className}`}>
      <Link href={productHref}>
        <div className="relative aspect-square bg-gray-50">
          <Image src={p.image_url} alt={p.name} fill className="object-contain p-2" unoptimized />
          <ProductBadge label={p.label} />
          <FavoriteButton productId={p.id} />
        </div>
        <div className="p-3">
          {p.category && <p className="text-xs text-gray-400 mb-1 truncate">{p.category}</p>}
          <p className="text-sm font-medium line-clamp-2">{p.name}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-base font-bold">{p.price} сом</p>
            {p.old_price && <p className="text-sm text-gray-400 line-through">{p.old_price} сом</p>}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <AddToCart
          product={{
            id: p.id,
            name: p.name,
            price: p.price,
            image_url: p.image_url,
          }}
        />
      </div>
    </div>
  );
}
