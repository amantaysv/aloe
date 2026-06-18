"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit() {
    setError("");
    setLoading(true);

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
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
      <main className="max-w-sm mx-auto py-16">
        <div className="border border-gray-300 rounded-xl p-6 text-center flex flex-col gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600 text-2xl">
            ✉
          </div>
          <h1 className="text-xl font-bold">Подтвердите email</h1>
          <p className="text-sm text-gray-600">
            Мы отправили письмо на <span className="font-medium text-gray-800">{email}</span>
            .
            <br />
            Перейдите по ссылке в письме, чтобы завершить регистрацию.
          </p>
          <p className="text-xs text-gray-400">Не пришло письмо? Проверьте папку «Спам».</p>
          <button
            onClick={() => {
              setRegistered(false);
              setMode("login");
            }}
            className="text-sm text-green-600 hover:underline mt-2 hover:cursor-pointer"
          >
            Войти в аккаунт
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-bold mb-6 text-center">{mode === "login" ? "Вход" : "Регистрация"}</h1>

      <div className="border border-gray-300 rounded-xl p-6 flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500"
        />

        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 hover:cursor-pointer"
        >
          {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>

        <p className="text-center text-sm text-gray-500">
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="text-green-600 hover:underline hover:cursor-pointer"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </div>
    </main>
  );
}
