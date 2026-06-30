import Image from "next/image";
import Link from "next/link";
import { LABEL_MAP } from "@/lib/constants";
import type { Product } from "@/types";
import AddToCart from "./AddToCart";
import Currency from "./Currency";
import FavoriteButton from "./FavoriteButton";

type Props = {
  product: Product;
  className?: string;
  href?: string;
  priority?: boolean;
};

function ProductBadge({ label }: { label: Product["label"] }) {
  if (!label) return null;
  const { text, cls } = LABEL_MAP[label];
  return (
    <div className="absolute top-1.5 left-1.5 z-10">
      <span className={`${cls} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded`}>{text}</span>
    </div>
  );
}

export default function ProductCard({ product: p, className = "", href, priority = false }: Props) {
  const productHref = href ?? `/product/${p.id}`;

  return (
    <div className={`flex flex-col rounded-lg overflow-hidden ${className}`}>
      <Link className="flex-1 flex flex-col" href={productHref}>
        <div className="relative p-2 aspect-square shadow-xs rounded-lg">
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            className="object-contain p-2"
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <ProductBadge label={p.label} />
          <FavoriteButton productId={p.id} />
        </div>
        <div className="flex-1 flex flex-col py-3">
          <p className="flex-1 text-sm font-medium line-clamp-3" title={p.name}>
            {p.name}
          </p>
          {p.brand_name && <p className="text-xs text-gray-400 mt-0.5 truncate">{p.brand_name}</p>}
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-base font-bold">
              {p.price} <Currency />
            </p>
            {p.old_price && (
              <p className="text-sm text-gray-400 line-through">
                {p.old_price} <Currency />
              </p>
            )}
          </div>
        </div>
      </Link>
      <AddToCart
        product={{
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
        }}
      />
    </div>
  );
}
