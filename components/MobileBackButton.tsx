"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MobileBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="md:hidden flex items-center bg-white rounded-full text-green-600 transition-colors p-2"
    >
      <ArrowLeft className="size-5" />
    </button>
  );
}
