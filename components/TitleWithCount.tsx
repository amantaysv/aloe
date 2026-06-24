import Title, { TitleProps } from "./Title";

type TitleWithCountProps = TitleProps & {
  count?: number;
  isBrands?: boolean;
};

export default function TitleWithCount({
  children,
  count,
  isBrands = false,
  className: titleClassname,
}: TitleWithCountProps) {
  return (
    <div className="flex items-baseline gap-3 mb-6">
      <Title className={titleClassname}>{children}</Title>
      {count ? (
        <span className="text-sm text-gray-400">
          {count} {isBrands ? "производителей" : "товаров"}
        </span>
      ) : null}
    </div>
  );
}
