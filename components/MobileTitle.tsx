import { cn } from "@/lib/cn";
import Title, { TitleProps } from "./Title";

export default function MobileTitle({ children, className }: TitleProps) {
  return <Title className={cn("flex-1 text-center", className)}>{children}</Title>;
}
