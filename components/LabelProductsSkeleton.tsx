import MainContainer from "./MainContainer";
import ProductGridSkeleton from "./ProductGridSkeleton";
import Skeleton from "./Skeleton";

export default function LabelProductsSkeleton() {
  return (
    <MainContainer>
      <Skeleton className="h-6 w-40 mb-4 mx-auto md:mx-0" />
      <ProductGridSkeleton count={12} />
    </MainContainer>
  );
}
