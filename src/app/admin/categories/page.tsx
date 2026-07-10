import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteCategoryAction, saveCategoryAction } from "../actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listProjectCategories, type ProjectCategory } from "@/lib/db";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [categories, params] = await Promise.all([listProjectCategories(), searchParams]);

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#171717] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Core Devs Admin</p>
            <h1 className="mt-2 text-3xl font-black uppercase">Категории проектов</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-lg bg-[#13c9e8] px-5 py-3 text-xs font-black uppercase text-[#071012]" href="/admin/work/new">
              Добавить проект
            </Link>
            <Link className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70" href="/admin">
              Проекты
            </Link>
            <Link className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70" href="/admin/users">
              Пользователи
            </Link>
          </div>
        </header>

        {params.error ? (
          <p className="mb-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-200">
            {params.error === "save" ? "Не удалось сохранить категорию. Возможно, такой slug уже занят." : "Заполни название и slug категории."}
          </p>
        ) : null}

        <section className="mb-5 rounded-2xl border border-white/10 bg-[#151515] p-6">
          <h2 className="text-xl font-black uppercase">Новая категория</h2>
          <CategoryForm />
        </section>

        <section className="grid gap-4">
          {categories.map((category) => (
            <article className="rounded-2xl border border-white/10 bg-[#151515] p-6" key={category.id}>
              <CategoryForm category={category} />
              <form action={deleteCategoryAction} className="mt-4 border-t border-white/10 pt-4">
                <input name="id" type="hidden" value={category.id} />
                <button className="rounded-lg border border-red-400/30 px-5 py-3 text-xs font-black uppercase text-red-200" type="submit">
                  Удалить категорию
                </button>
              </form>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function CategoryForm({ category }: { category?: ProjectCategory }) {
  return (
    <form action={saveCategoryAction} className="mt-5 grid gap-4 md:grid-cols-[1fr_0.8fr_1.4fr_0.35fr_auto] md:items-end">
      {category ? <input name="id" type="hidden" value={category.id} /> : null}
      <Field label="Название" name="name" required value={category?.name || ""} />
      <Field label="Slug" name="slug" required value={category?.slug || ""} />
      <Field label="Описание" name="description" value={category?.description || ""} />
      <Field label="Порядок" name="sortOrder" type="number" value={String(category?.sortOrder ?? 0)} />
      <button className="h-12 rounded-lg bg-[#13c9e8] px-5 text-xs font-black uppercase text-[#071012] transition hover:bg-white" type="submit">
        {category ? "Сохранить" : "Добавить"}
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