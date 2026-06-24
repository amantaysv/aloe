import { cn } from "@/lib/cn";

export default function MainContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={cn("max-w-6xl mx-auto px-4 lg:px-8 py-8 lg:py-12 pb-20 lg:pb-12", className)}>{children}</main>
  );
}
