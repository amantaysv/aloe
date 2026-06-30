"use client";

import { Truck, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function DeliveryModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
        title="Доставка"
      >
        <Truck className="size-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Доставка и оплата</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-8 divide-y divide-gray-100">
              <section className="pt-0">
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  По центру города и микрорайонам г.Бишкек
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-900 min-w-35">Доставка 200 сом</span>
                    <span className="text-gray-500 text-sm">при заказе от 500 сом</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-900 min-w-35">Доставка 0 сом</span>
                    <span className="text-gray-500 text-sm">при заказе от 10 000 сом</span>
                  </div>
                </div>
              </section>

              <section className="pt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  Жил.массивы и отдалённые районы
                </h3>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="font-semibold text-gray-900 min-w-35">Доставка 300 сом</span>
                  <span className="text-gray-500 text-sm">при заказе от 500 сом</span>
                </div>
              </section>

              <section className="pt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Срочная доставка</h3>
                <p className="text-sm text-gray-600">Отправляется Яндекс курьером и оплачивается получателем</p>
              </section>

              <section className="pt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Доставка в регионы</h3>
                <p className="text-sm text-gray-600">
                  Осуществляется Ылдам Экспресс и рассчитывается по WhatsApp после оформления заказа
                </p>
              </section>

              <section className="pt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Информация о доставке</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Принимаем заказы на сайте 24/7</p>
                  <p>Обрабатываем заказы с 10:00 до 18:00</p>
                  <p>Доставляем по предварительной договорённости с 13:00 до 20:00</p>
                  <p>Срочная доставка отправляется с 10:00 до 18:00</p>
                  <p>Понедельник — выходной</p>
                </div>
              </section>

              <section className="pt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Способы оплаты</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Наличными</p>
                  <p>Электронные кошельки (мБанк, Оптима и др.) — после подтверждения заказа через WhatsApp</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
