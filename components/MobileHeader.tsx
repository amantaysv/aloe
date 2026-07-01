"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Title from "./Title";

export default function MobileHeader({
  children,
  title,
  withBackButton,
  withGoToMainButton,
}: {
  children?: React.ReactNode;
  title?: string;
  withBackButton?: boolean;
  withGoToMainButton?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center md:hidden sticky rounded-2xl top-0 bg-linear-to-t from-white to-green-100 p-4 z-50">
      {withBackButton ? (
        <button
          onClick={() => router.back()}
          className={"md:hidden absolute flex items-center bg-white rounded-full text-green-600 transition-colors p-2"}
        >
          <ArrowLeft className="size-5" />
        </button>
      ) : null}
      {withGoToMainButton ? (
        <Link href="/" className="absolute">
          <ArrowLeft className="size-5" />
        </Link>
      ) : null}
      {title ? <Title className="flex-1 text-center">{title}</Title> : null}
      {children}
    </div>
  );
}
