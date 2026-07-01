"use client";

import { Suspense, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Title } from "@/components";
import MainContainer from "@/components/MainContainer";
import { createClient } from "@/lib/supabase-browser";

const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "Неверный email или пароль",
  "Email not confirmed": "Email не подтверждён. Проверьте почту и перейдите по ссылке в письме.",
  "User already registered": "Пользователь с таким email уже зарегистрирован",
  "Password should be at least 6 characters": "Пароль должен содержать минимум 6 символов",
};

function translateError(msg: string) {
  return ERROR_MAP[msg] ?? msg;
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed") === "true";
  const confirmError = searchParams.get("error") === "confirmation_failed";
  const supabase = createClient();

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm?next=/`,
      },
    });
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      setLoading(false);
      if (error) {
        setError(translateError(error.message));
      } else if (data.user?.identities?.length === 0) {
        setError("Пользователь с таким email уже зарегистрирован");
      } else {
        setRegistered(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(translateError(error.message));
      } else {
        router.push("/");
        router.refresh();
      }
    }
  }

  if (registered) {
    return (
      <MainContainer className="pt-20">
        <div className="border border-gray-300 rounded-xl p-6 text-center flex flex-col gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600 text-2xl">
            ✉
          </div>
          <Title>Подтвердите email</Title>
          <p className="text-sm text-gray-600">
            Мы отправили письмо на <span className="font-medium text-gray-800">{email}</span>
            .
            <br />
            Перейдите по ссылке в письме, чтобы завершить регистрацию.
          </p>
          <p className="text-xs text-gray-400">Не пришло письмо? Проверьте папку «Спам».</p>
          <Button
            variant="ghost"
            onClick={() => {
              setRegistered(false);
              setMode("login");
            }}
            className="text-sm mt-2 hover:underline"
          >
            Войти в аккаунт
          </Button>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer className="max-w-sm pt-20">
      {confirmed && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span className="text-green-500 text-base">✓</span>
          Email успешно подтверждён! Теперь вы можете войти в аккаунт.
        </div>
      )}
      {confirmError && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span className="text-red-500 text-base">✕</span>
          Ссылка для подтверждения недействительна или устарела.
        </div>
      )}
      <Title className="mb-6 text-center">{mode === "login" ? "Вход" : "Регистрация"}</Title>

      <div className="border border-gray-300 rounded-xl p-6 flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-base md:text-sm focus:outline-none focus:border-green-500"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="border border-gray-300 rounded-lg px-4 py-2 text-base  md:text-sm focus:outline-none focus:border-green-500"
        />

        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <Button variant="primary" onClick={handleSubmit} disabled={loading} className="w-full py-2">
          {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400">или</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <Button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors hover:cursor-pointer"
        >
          <FcGoogle className="text-base" />
          Продолжить с Google
        </Button>

        <p className="text-center text-sm text-gray-500">
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <Button
            variant="ghost"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setEmail("");
              setPassword("");
            }}
            className="hover:underline"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </Button>
        </p>
      </div>
    </MainContainer>
  );
}
