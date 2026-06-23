import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export default function SeeAllProducts({ count, href }: { href: string; count: number }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors">
      {count > 0 ? <>+{count} ещё</> : <>Перейти в раздел</>}
      <ChevronRightIcon className="w-4 h-4" />
    </Link>
  );
}
