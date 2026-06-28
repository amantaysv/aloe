import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Title from "./Title";

export default function MobileCatalogHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <Link href="/catalog" className="absolute bg-white rounded-full text-green-600 transition-colors p-2">
        <ArrowLeft className="size-5" />
      </Link>
      <Title className="flex-1 text-center">{title}</Title>
    </div>
  );
}
