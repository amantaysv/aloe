"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function close() {
    router.back();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={close}>
      <div
        className="relative flex flex-col bg-white rounded-t-2xl md:rounded-b-2xl shadow-xl w-full max-w-3xl max-h-[95vh] md:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full absolute top-0 left-0 z-10 flex bg-white p-2">
          <button
            onClick={close}
            className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 h-full w-full overflow-y-auto scrollbar-none pt-12">{children}</div>
      </div>
    </div>
  );
}
