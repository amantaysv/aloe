import { cn } from "@/lib/cn";

export const containerClassname = "container mx-auto px-4";

export default function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(containerClassname, className)}>{children}</div>;
}
