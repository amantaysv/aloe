import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string>;
};

function buildUrl(basePath: string, page: number, query: Record<string, string> = {}) {
  const params = new URLSearchParams({ ...query, page: String(page) });
  return `${basePath}?${params}`;
}

export default function Pagination({ page, totalPages, basePath, query }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => Math.abs(p - page) <= 2
  );

  const linkCls = "px-4 py-2 border rounded-lg text-sm hover:bg-gray-50";
  const activeCls = "bg-green-600 text-white border-green-600";

  return (
    <div className="flex justify-center gap-2 mt-8">
      {page > 1 && (
        <Link href={buildUrl(basePath, page - 1, query)} className={linkCls}>← Назад</Link>
      )}
      {pages.map((p) => (
        <Link key={p} href={buildUrl(basePath, p, query)} className={`${linkCls} ${p === page ? activeCls : ""}`}>
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={buildUrl(basePath, page + 1, query)} className={linkCls}>Вперёд →</Link>
      )}
    </div>
  );
}
