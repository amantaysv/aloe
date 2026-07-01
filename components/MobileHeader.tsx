import MobileBackButton from "./MobileBackButton";
import Title from "./Title";

export default function MobileHeader({
  children,
  title,
  withBackButton,
}: {
  children?: React.ReactNode;
  title?: string;
  withBackButton?: boolean;
}) {
  return (
    <div className="flex items-center md:hidden sticky rounded-2xl top-0 bg-linear-to-t from-white to-green-100 p-4 z-50">
      {withBackButton ? <MobileBackButton className="absolute" /> : null}
      {title ? <Title className="flex-1 text-center">{title}</Title> : null}
      {children}
    </div>
  );
}
