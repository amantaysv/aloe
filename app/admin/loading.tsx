import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
