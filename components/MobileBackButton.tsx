"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export default function MobileBackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "md:hidden flex items-center bg-white rounded-full text-green-600 transition-colors p-2",
        className,
      )}
    >
      <ArrowLeft className="size-5" />
    </button>
  );
}
