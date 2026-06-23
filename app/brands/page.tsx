import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { getCachedBrands } from "@/lib/cached-queries";

export const metadata = { title: "Бренды — Aloe.kg" };

export default async function BrandsPage() {
  const list = await getCachedBrands();

  const grouped = list.reduce<Record<string, typeof list>>((acc, brand) => {
    const letter = brand.name[0].toUpperCase();
    (acc[letter] ??= []).push(brand);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort((a, b) => a.localeCompare(b, "ru"));

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb crumbs={[{ label: "Главная", href: "/" }, { label: "Бренды" }]} />

      <div className="flex items-baseline gap-3 mb-8">
        <h1 className="text-2xl font-bold">Бренды</h1>
        <span className="text-sm text-gray-400">{list.length} производителей</span>
      </div>

      {list.length === 0 && <p className="text-gray-400 text-sm">Бренды не найдены</p>}

      <div className="flex flex-wrap gap-1 mb-8">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded border border-gray-300 hover:border-green-500 hover:text-green-600 transition-colors"
          >
            {letter}
          </a>
        ))}
      </div>

      <div className="space-y-8">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-lg font-semibold text-green-600 border-b border-gray-200 pb-1 mb-3">{letter}</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {grouped[letter].map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="block text-sm text-gray-700 hover:text-green-600 hover:underline transition-colors truncate"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
