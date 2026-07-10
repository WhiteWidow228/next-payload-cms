import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteAdminUserAction, saveAdminUserAction } from "../actions";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { getDatabaseErrorMessage, listAdminUsers, type AdminUser } from "@/lib/db";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const currentUser = await getCurrentAdminUser();

  if (!currentUser) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  let users: AdminUser[] = [];
  let databaseError = "";

  try {
    users = await listAdminUsers();
  } catch (error) {
    databaseError = getDatabaseErrorMessage(error);
  }

  const errorMessage =
    params.error === "required"
      ? "Укажи логин и пароль не короче 6 символов. Для существующего пользователя пароль можно оставить пустым."
      : params.error === "save"
        ? "Не удалось сохранить пользователя. Проверь уникальность логина и не отключай последнего активного админа."
        : "";

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#171717] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Core Devs Admin</p>
            <h1 className="mt-2 text-3xl font-black uppercase">Пользователи</h1>
            <p className="mt-2 text-sm text-white/45">Ты вошел как {currentUser.login}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-lg bg-[#13c9e8] px-5 py-3 text-xs font-black uppercase text-[#071012]" href="/admin/work/new">
              Добавить проект
            </Link>
            <Link className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70" href="/admin/categories">
              Категории
            </Link>
            <Link className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70" href="/admin">
              Проекты
            </Link>
          </div>
        </header>

        {errorMessage ? <p className="mb-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-200">{errorMessage}</p> : null}

        {databaseError ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-8 text-red-100">
            <h2 className="text-xl font-black uppercase">Пользователи не загрузились из Postgres</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-red-100/75">{databaseError}</p>
          </div>
        ) : (
          <>
            <section className="mb-5 rounded-2xl border border-white/10 bg-[#151515] p-6">
              <h2 className="text-xl font-black uppercase">Новый пользователь</h2>
              <UserForm />
            </section>

            <section className="grid gap-4">
              {users.map((user) => (
                <article className="rounded-2xl border border-white/10 bg-[#151515] p-6" key={user.id}>
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black uppercase">{user.name || user.login}</h2>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/55">{user.login}</span>
                    <span className={user.isActive ? "rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-300" : "rounded-full bg-red-400/10 px-3 py-1 text-xs font-bold text-red-200"}>
                      {user.isActive ? "Активен" : "Отключен"}
                    </span>
                    {user.id === currentUser.id ? <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/65">Это ты</span> : null}
                  </div>
                  <UserForm user={user} />
                  <form action={deleteAdminUserAction} className="mt-4 border-t border-white/10 pt-4">
                    <input name="id" type="hidden" value={user.id} />
                    <button className="rounded-lg border border-red-400/30 px-5 py-3 text-xs font-black uppercase text-red-200" type="submit">
                      Удалить пользователя
                    </button>
                  </form>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function UserForm({ user }: { user?: AdminUser }) {
  return (
    <form action={saveAdminUserAction} className="mt-5 grid gap-4 md:grid-cols-[0.9fr_1fr_1fr_0.45fr_auto] md:items-end">
      {user ? <input name="id" type="hidden" value={user.id} /> : null}
      <Field label="Логин" name="login" required value={user?.login || ""} />
      <Field label="Имя" name="name" value={user?.name || ""} />
      <Field label={user ? "Новый пароль" : "Пароль"} name="password" required={!user} type="password" value="" />
      <label className="flex h-12 items-center gap-3 rounded-lg border border-white/10 bg-[#0f0f0f] px-4 text-sm font-bold text-white/70 md:mt-7">
        <input className="size-4 accent-cyan-300" defaultChecked={user?.isActive ?? true} name="isActive" type="checkbox" />
        Активен
      </label>
      <button className="h-12 rounded-lg bg-[#13c9e8] px-5 text-xs font-black uppercase text-[#071012] transition hover:bg-white" type="submit">
        {user ? "Сохранить" : "Добавить"}
      </button>
    </form>
  );
}

function Field({ label, name, required, type = "text", value }: { label: string; name: string; required?: boolean; type?: string; value: string }) {
  return (
    <label className="block text-sm font-bold text-white/70">
      {label}
      <input
        className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 text-white outline-none focus:border-cyan-300"
        defaultValue={value}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}