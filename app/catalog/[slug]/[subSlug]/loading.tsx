import { MainContainer, ProductGridSkeleton, Skeleton } from "@/components";

export default function Loading() {
  return (
    <MainContainer>
      <Skeleton className="h-7 w-56 mb-4 hidden md:block" />

      <div className="flex gap-2 py-2 flex-wrap mb-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <Skeleton className="h-9 w-40 rounded-lg ml-auto" />
      </div>

      <ProductGridSkeleton count={12} />
    </MainContainer>
  );
}
