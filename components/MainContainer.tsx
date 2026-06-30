import { cn } from "@/lib/cn";

export default function MainContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("container mx-auto px-4 pt-2 pb-20", className)}>{children}</main>;
}
