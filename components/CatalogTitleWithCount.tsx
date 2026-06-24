export default function CatalogTitleWithCount({
  title,
  count,
  isBrands = false,
}: {
  title: string;
  count: number;
  isBrands?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3 mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {count ? (
        <span className="text-sm text-gray-400">
          {count} {isBrands ? "производителей" : "товаров"}
        </span>
      ) : null}
    </div>
  );
}
