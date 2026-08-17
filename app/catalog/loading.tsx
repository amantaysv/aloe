import MainContainer from "@/components/MainContainer";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <MainContainer>
      <Skeleton className="h-7 w-52 mb-4 hidden md:block" />
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        {Array.from({ length: 14 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </MainContainer>
  );
}
