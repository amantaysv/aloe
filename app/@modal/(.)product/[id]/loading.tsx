import ProductModal from "@/components/ProductModal";
import Skeleton from "@/components/Skeleton";

/**
 * The highest-frequency interaction in the app had no feedback at all: clicking a card left the
 * page frozen until the fetch resolved. Rendering the modal shell immediately makes the click land.
 */
export default function Loading() {
  return (
    <ProductModal>
      <div className="grid md:grid-cols-2 gap-6 p-4 md:p-6">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-32 mt-2" />
          <Skeleton className="h-11 w-full mt-2 rounded-lg" />
          <Skeleton className="h-4 w-full mt-4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </ProductModal>
  );
}
