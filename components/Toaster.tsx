"use client";

import { useToast } from "@/store/toast";

export default function Toaster() {
  const { toasts, remove } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => remove(toast.id)}
          className={`
            flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            cursor-pointer max-w-xs animate-slide-up
            ${toast.type === "success" ? "bg-green-600 text-white" : ""}
            ${toast.type === "error" ? "bg-red-500 text-white" : ""}
            ${toast.type === "info" ? "bg-gray-800 text-white" : ""}
          `}
        >
          {toast.type === "success" && <span className="shrink-0 mt-0.5">✓</span>}
          {toast.type === "error" && <span className="shrink-0 mt-0.5">✕</span>}
          {toast.type === "info" && <span className="shrink-0 mt-0.5">ℹ</span>}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
