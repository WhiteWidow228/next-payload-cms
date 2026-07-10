import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorMessage =
    params.error === "setup"
      ? "Админка не настроена. Добавь ADMIN_SESSION_SECRET в Vercel, а для первого пользователя ADMIN_LOGIN и ADMIN_PASSWORD."
      : params.error === "db"
        ? "Не удалось подключиться к базе пользователей. Проверь DATABASE_URI в Vercel."
        : params.error
          ? "Неверный логин или пароль."
          : "";

  return (
    <main className="grid min-h-screen place-items-center px-4 text-white">
      <form action="/admin/session" method="post" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171717] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Core Devs Admin</p>
        <h1 className="mt-3 text-3xl font-black uppercase">Вход</h1>
        {errorMessage ? <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{errorMessage}</p> : null}
        <label className="mt-8 block text-sm font-bold text-white/70">
          Логин
          <input className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 text-white outline-none focus:border-cyan-300" name="login" autoComplete="username" />
        </label>
        <label className="mt-5 block text-sm font-bold text-white/70">
          Пароль
          <input className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 text-white outline-none focus:border-cyan-300" name="password" type="password" autoComplete="current-password" />
        </label>
        <button className="mt-7 h-12 w-full rounded-lg bg-[#13c9e8] text-xs font-black uppercase text-[#071012] transition hover:bg-white" type="submit">
          Войти
        </button>
      </form>
    </main>
  );
}