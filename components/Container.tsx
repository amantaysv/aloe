import { cn } from "@/lib/cn";

export const containerClassname = "container mx-auto px-4";

export default function Container({
  children,
  className,
  withMain,
}: {
  children: React.ReactNode;
  className?: string;
  withMain?: boolean;
}) {
  if (withMain)
    return (
      <main>
        <div className={cn(containerClassname, className)}>{children}</div>;
      </main>
    );

  return <div className={cn(containerClassname, className)}>{children}</div>;
}
