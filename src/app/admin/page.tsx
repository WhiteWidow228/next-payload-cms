import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listCompanyWorkItems } from "@/lib/db";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const works = await listCompanyWorkItems();

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#171717] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Core Devs Admin</p>
            <h1 className="mt-2 text-3xl font-black uppercase">Работы компании</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-lg bg-[#13c9e8] px-5 py-3 text-xs font-black uppercase text-[#071012]" href="/admin/work/new">
              Добавить работу
            </Link>
            <Link className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70" href="/">
              На сайт
            </Link>
            <form action="/admin/logout" method="post">
              <button className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70" type="submit">
                Выйти
              </button>
            </form>
          </div>
        </header>

        {works.length ? (
          <div className="grid gap-4">
            {works.map((work) => (
              <article className="grid gap-4 rounded-2xl border border-white/10 bg-[#151515] p-5 md:grid-cols-[1fr_auto]" key={work.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black uppercase">{work.title}</h2>
                    <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-300">#{work.sortOrder}</span>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">{work.summary}</p>
                  <p className="mt-3 text-sm text-white/40">{work.category} · {work.timeTaken}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link className="rounded-lg bg-white px-4 py-3 text-xs font-black uppercase text-[#071012]" href={`/admin/work/${work.id}`}>
                    Редактировать
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-8 text-center text-white/55">
            Работ пока нет. Добавь первый кейс, и он появится на главной странице.
          </div>
        )}
      </div>
    </main>
  );
}