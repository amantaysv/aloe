import MainContainer from "@/components/MainContainer";
import Title from "@/components/Title";

export const metadata = {
  title: "Доставка и оплата — Aloe.kg",
};

export default function DeliveryPage() {
  return (
    <MainContainer className="max-w-2xl">
      <Title className="mb-8">Доставка и оплата</Title>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-green-700">Способы доставки</h2>
        <p className="text-gray-700">Доставка курьером шесть дней в неделю.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-green-700">Стоимость доставки</h2>
        <div className="space-y-3 text-gray-700">
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="font-medium">По Бишкеку и ближайшим жилмассивам</p>
            <p className="text-2xl font-bold text-green-600 mt-1">150 сом</p>
            <p className="text-sm text-gray-500 mt-1">Минимальная сумма заказа — 500 сом</p>
          </div>
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <p className="font-bold text-green-800">При заказе свыше 5 000 сом — доставка бесплатно</p>
            <p className="text-sm text-green-700 mt-1">Только по городу Бишкек</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="font-medium">Доставка в регионы</p>
            <p className="text-2xl font-bold mt-1">от 290 сом</p>
            <p className="text-sm text-gray-500 mt-1">
              Стоимость зависит от габаритов и расстояния. Итоговая цена сообщается по телефону после оформления заказа.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-green-700">Способы оплаты</h2>
        <div className="flex gap-3 flex-wrap">
          {["Наличными", "Элсом", "MegaPay"].map((method) => (
            <span key={method} className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-white">
              {method}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-green-700">Дополнительная информация</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Заявки до 15:00 — доставка в тот же день до 20:00</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Заявки после 15:00 — доставка на следующий день</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Доставка 6 дней в неделю, понедельник — выходной</span>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-green-700">Возврат товара</h2>
        <p className="text-gray-700">
          Возврат возможен в течение двух дней — только нового, неиспользованного товара. Расходы по доставке товара до
          пункта возврата несёт покупатель.
        </p>
      </section>

      <p className="text-green-600 font-medium">Удачных покупок!</p>
    </MainContainer>
  );
}
