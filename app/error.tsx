"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, MainContainer, Title } from "@/components";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MainContainer className="max-w-lg text-center pt-24">
      <Title className="mb-2">Что-то пошло не так</Title>
      <p className="text-gray-500 text-sm mb-8">
        Не удалось загрузить страницу. Обычно помогает повторная попытка — если ошибка повторяется, напишите нам.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="primary" size="lg" onClick={reset}>
          Попробовать снова
        </Button>
        <Link
          href="/"
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-base hover:bg-gray-50 transition-colors"
        >
          На главную
        </Link>
      </div>
      {error.digest && <p className="mt-8 text-xs text-gray-400 font-mono">Код ошибки: {error.digest}</p>}
    </MainContainer>
  );
}
