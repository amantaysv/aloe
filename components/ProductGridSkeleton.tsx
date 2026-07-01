import ProductCardSkeleton from "./ProductCardSkeleton";
import ProductGrid from "./ProductGrid";

export default function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ProductGrid>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ProductGrid>
  );
}
