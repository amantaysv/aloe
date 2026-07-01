import { MainContainer, ProductGridSkeleton, Skeleton } from "@/components";

export default function Loading() {
  return (
    <MainContainer className="pt-4">
      <Skeleton className="h-4 w-64 mb-4" />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Skeleton className="aspect-square rounded-xl" />

        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-32 mt-2" />
          <Skeleton className="h-12 w-full rounded-lg mt-2" />
          <Skeleton className="h-24 w-full rounded-lg mt-4" />
        </div>
      </div>

      <Skeleton className="h-6 w-48 mb-4" />
      <ProductGridSkeleton count={6} />
    </MainContainer>
  );
}
