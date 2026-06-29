import { cn } from "@/lib/cn";

export default function MainContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("container mx-auto", className)}>{children}</main>;
}
