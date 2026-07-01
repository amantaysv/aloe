"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components";

type Props = {
  title: string;
  onClose: () => void;
  saving: boolean;
  onSave: () => void;
  saveDisabled?: boolean;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
};

export default function AdminDrawer({ title, onClose, saving, onSave, saveDisabled, error, wide, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative ml-auto w-full ${wide ? "max-w-lg" : "max-w-md"} bg-white h-full overflow-y-auto shadow-xl flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button onClick={onClose} aria-label="Закрыть" className="text-gray-400 hover:text-gray-700">
            <XIcon className="size-5" />
          </Button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {children}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button variant="primary" size="lg" onClick={onSave} disabled={saving || saveDisabled} className="w-full">
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
