import MainContainer from "@/components/MainContainer";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <MainContainer className="max-w-2xl">
      <Skeleton className="h-7 w-56 mb-6" />
      <Skeleton className="h-40 w-full rounded-lg mb-6" />
      <Skeleton className="h-6 w-44 mb-3" />
      <div className="flex flex-col gap-2 mb-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-6 w-52 mb-3" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </MainContainer>
  );
}
