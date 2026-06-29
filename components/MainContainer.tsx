import { cn } from "@/lib/cn";

export default function MainContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("container mx-auto px-4 md:px-0 pt-4 md:pt-0 pb-12 md:pb-0", className)}>{children}</main>;
}
