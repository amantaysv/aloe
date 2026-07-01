import { MainContainer, ProductGridSkeleton, Skeleton } from "@/components";

export default function Loading() {
  return (
    <MainContainer>
      <div className="mb-4 md:mb-6">
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>

      <ProductGridSkeleton count={12} />
    </MainContainer>
  );
}
