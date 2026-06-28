import { cn } from "@/lib/cn";

export type TitleProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Title({ children, className }: TitleProps) {
  return <h1 className={cn("text-xl md:text-2xl font-medium md:font-bold", className)}>{children}</h1>;
}
