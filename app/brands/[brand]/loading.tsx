import { MainContainer, ProductGridSkeleton, Skeleton } from "@/components";

export default function Loading() {
  return (
    <MainContainer>
      <Skeleton className="h-4 w-56 mb-4" />
      <Skeleton className="h-7 w-48 mb-4 md:mb-6" />
      <ProductGridSkeleton count={12} />
    </MainContainer>
  );
}
