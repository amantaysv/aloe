import Skeleton from "./Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden">
      <Skeleton className="aspect-square rounded-lg" />
      <div className="flex-1 flex flex-col gap-2 py-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}
