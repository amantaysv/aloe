import Currency from "@/components/Currency";
import MainContainer from "@/components/MainContainer";

export const metadata = {
  title: "Доставка и оплата — Aloe.kg",
};

export default function DeliveryPage() {
  return (
    <MainContainer className="max-w-xl py-12">
      <h1 className="text-2xl font-semibold text-gray-900 mb-12">Доставка и оплата</h1>

      <div className="space-y-10 divide-y divide-gray-100">
        <section className="pt-0">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Доставка</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-gray-800">По Бишкеку и жилмассивам</span>
                <span className="text-lg font-semibold text-gray-900">
                  150 <Currency />
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Минимальная сумма заказа — 500 <Currency />
              </p>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-gray-800">Регионы</span>
                <span className="text-lg font-semibold text-gray-900">
                  от 290 <Currency />
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Итоговая цена сообщается по телефону после заказа</p>
            </div>
            <div className="text-sm text-green-600">
              Бесплатно при заказе от 5 000 <Currency /> по Бишкеку
            </div>
          </div>
        </section>

        <section className="pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Оплата</h2>
          <div className="flex gap-6 text-gray-800">
            <span>Наличными</span>
            <span>Элсом</span>
            <span>MegaPay</span>
          </div>
        </section>

        <section className="pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">График</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>6 дней в неделю, понедельник — выходной</p>
            <p>Заявки до 15:00 — доставка в тот же день до 20:00</p>
            <p>Заявки после 15:00 — доставка на следующий день</p>
          </div>
        </section>

        <section className="pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Возврат</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            В течение двух дней — только нового, неиспользованного товара. Расходы по доставке до пункта возврата несёт
            покупатель.
          </p>
        </section>
      </div>
    </MainContainer>
  );
}
