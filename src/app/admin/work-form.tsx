import Link from "next/link";

import { deleteWorkAction, saveWorkAction } from "./actions";
import type { CompanyWorkItem } from "@/lib/db";

const emptyWork: Partial<CompanyWorkItem> = {
  title: "",
  summary: "",
  category: "Дизайн и разработка сайта",
  timeTaken: "3 месяца",
  image: "/assets/work-aura-clean.jpg",
  imageAlt: "Превью проекта",
  technologies: ["Next.js", "React", "PostgreSQL"],
  teamMembers: [
    { name: "Дизайнер", avatar: "/assets/avatar-1.png" },
    { name: "Разработчик", avatar: "/assets/avatar-2.png" },
    { name: "Менеджер", avatar: "/assets/avatar-3.png" },
  ],
  ctaLabel: "Рассчитать смету",
  sortOrder: 0,
};

export function WorkForm({ error, work }: { error?: string; work?: CompanyWorkItem | null }) {
  const item = work || emptyWork;
  const technologies = item.technologies?.join("\n") || "";
  const teamMembers = item.teamMembers?.map((member) => member.name).join("\n") || "";

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#171717] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Core Devs Admin</p>
            <h1 className="mt-2 text-3xl font-black uppercase">{work ? "Редактировать работу" : "Новая работа"}</h1>
          </div>
          <Link className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70" href="/admin">
            Назад
          </Link>
        </header>

        {error ? <p className="mb-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-200">Заполни название и описание проекта.</p> : null}

        <form action={saveWorkAction} className="grid gap-5 rounded-2xl border border-white/10 bg-[#151515] p-6">
          {work ? <input name="id" type="hidden" value={work.id} /> : null}
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Название проекта" name="title" required value={item.title} />
            <Field label="Категория" name="category" value={item.category} />
          </div>
          <TextArea label="Описание" name="summary" required rows={5} value={item.summary} />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Срок" name="timeTaken" value={item.timeTaken} />
            <Field label="Порядок" name="sortOrder" type="number" value={String(item.sortOrder ?? 0)} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Путь к изображению" name="image" value={item.image} />
            <Field label="Alt изображения" name="imageAlt" value={item.imageAlt} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <TextArea label="Технологии, каждая с новой строки" name="technologies" rows={6} value={technologies} />
            <TextArea label="Команда, каждый участник с новой строки" name="teamMembers" rows={6} value={teamMembers} />
          </div>
          <Field label="Текст кнопки" name="ctaLabel" value={item.ctaLabel} />
          <div className="flex flex-wrap gap-3 pt-2">
            <button className="rounded-lg bg-[#13c9e8] px-6 py-3 text-xs font-black uppercase text-[#071012] transition hover:bg-white" type="submit">
              Сохранить
            </button>
            <Link className="rounded-lg border border-white/10 px-6 py-3 text-xs font-black uppercase text-white/70" href="/admin">
              Отмена
            </Link>
          </div>
        </form>

        {work ? (
          <form action={deleteWorkAction} className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/5 p-6">
            <input name="id" type="hidden" value={work.id} />
            <p className="text-sm text-red-100/70">Удаление нельзя отменить.</p>
            <button className="mt-4 rounded-lg bg-red-500 px-6 py-3 text-xs font-black uppercase text-white" type="submit">
              Удалить работу
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}

function Field({ label, name, required, type = "text", value }: { label: string; name: string; required?: boolean; type?: string; value?: string | number }) {
  return (
    <label className="block text-sm font-bold text-white/70">
      {label}
      <input
        className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 text-white outline-none focus:border-cyan-300"
        defaultValue={value || ""}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function TextArea({ label, name, required, rows, value }: { label: string; name: string; required?: boolean; rows: number; value?: string }) {
  return (
    <label className="block text-sm font-bold text-white/70">
      {label}
      <textarea
        className="mt-2 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-cyan-300"
        defaultValue={value || ""}
        name={name}
        required={required}
        rows={rows}
      />
    </label>
  );
}
