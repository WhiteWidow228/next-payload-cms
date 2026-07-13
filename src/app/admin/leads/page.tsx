import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteQuizLeadAction, updateQuizLeadStatusAction } from "@/app/admin/leads/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDatabaseErrorMessage, listQuizLeads, type QuizLead } from "@/lib/db";

const projectTypeLabels: Record<string, string> = {
  landing: "Лендинг",
  corporate: "Корпоративный сайт",
  ecommerce: "Интернет-магазин",
  "web-app": "Веб-приложение",
  "telegram-bot": "Telegram-бот",
  design: "Дизайн",
};

const budgetLabels: Record<string, string> = {
  "up-to-50": "До 50 000 ₽",
  "50-100": "50 000–100 000 ₽",
  "100-250": "100 000–250 000 ₽",
  "250-plus": "От 250 000 ₽",
  "need-estimate": "Нужна оценка",
};

const timelineLabels: Record<string, string> = {
  asap: "Как можно скорее",
  "one-month": "В течение месяца",
  "two-three-months": "За 2–3 месяца",
  flexible: "Срок гибкий",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

function getContactHref(contact: string) {
  const telegramMatch = contact.match(/^(?:https?:\/\/(?:t\.me|telegram\.me)\/)?@?([a-zA-Z0-9_]{5,32})\/?$/i);

  if (telegramMatch) {
    return `https://t.me/${telegramMatch[1]}`;
  }

  return `tel:+${contact.replace(/\D/g, "")}`;
}

export default async function AdminLeadsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  let leads: QuizLead[] = [];
  let databaseError: string | null = null;

  try {
    leads = await listQuizLeads();
  } catch (error) {
    databaseError = getDatabaseErrorMessage(error);
    console.error("[admin/leads] Failed to load quiz leads", error);
  }

  const newLeadsCount = leads.filter((lead) => lead.status === "new").length;

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#171717] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Core Devs Admin</p>
            <h1 className="mt-2 text-3xl font-black uppercase">Заявки из квиза</h1>
            <p className="mt-3 text-sm text-white/45">Новых: {newLeadsCount} · Всего: {leads.length}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70 transition hover:border-cyan-300/35 hover:text-cyan-300" href="/admin">
              Проекты
            </Link>
            <Link className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70 transition hover:border-cyan-300/35 hover:text-cyan-300" href="/">
              На сайт
            </Link>
          </div>
        </header>

        {databaseError ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-8 text-red-100">
            <h2 className="text-xl font-black uppercase">Заявки не загрузились</h2>
            <p className="mt-4 text-sm leading-6 text-red-100/75">{databaseError}</p>
          </div>
        ) : leads.length ? (
          <div className="grid gap-4">
            {leads.map((lead) => {
              const isNew = lead.status === "new";

              return (
                <article className={`rounded-2xl border p-5 sm:p-6 ${isNew ? "border-cyan-300/25 bg-[#10191b]" : "border-white/8 bg-[#151515]"}`} key={lead.id}>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${isNew ? "bg-cyan-300 text-[#071012]" : "bg-white/5 text-white/45"}`}>
                          {isNew ? "Новая" : "Обработана"}
                        </span>
                        <span className="text-xs text-white/35">#{lead.id} · {formatDate(lead.createdAt)}</span>
                      </div>
                      <h2 className="mt-5 text-xl font-black uppercase text-white">{projectTypeLabels[lead.projectType] || lead.projectType}</h2>
                      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="text-xs font-black uppercase text-white/35">Бюджет</dt>
                          <dd className="mt-1 text-white/75">{budgetLabels[lead.budget] || lead.budget}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-black uppercase text-white/35">Срок</dt>
                          <dd className="mt-1 text-white/75">{timelineLabels[lead.timeline] || lead.timeline}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-black uppercase text-white/35">Страница</dt>
                          <dd className="mt-1 break-all text-white/75">{lead.sourcePath}</dd>
                        </div>
                      </dl>
                      <a className="mt-6 inline-flex rounded-lg bg-[#13c9e8] px-5 py-3 text-sm font-black text-[#071012] transition hover:bg-white" href={getContactHref(lead.contact)}>
                        {lead.contact}
                      </a>
                      <p className="mt-4 text-xs leading-5 text-white/32">Согласие: версия {lead.consentVersion}, {formatDate(lead.consentAt)}</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                      <form action={updateQuizLeadStatusAction}>
                        <input name="id" type="hidden" value={lead.id} />
                        <input name="status" type="hidden" value={isNew ? "processed" : "new"} />
                        <button className="rounded-lg border border-cyan-300/30 px-4 py-3 text-xs font-black uppercase text-cyan-300 transition hover:bg-cyan-300 hover:text-[#071012]" type="submit">
                          {isNew ? "Обработано" : "Вернуть в новые"}
                        </button>
                      </form>
                      <form action={deleteQuizLeadAction}>
                        <input name="id" type="hidden" value={lead.id} />
                        <button className="rounded-lg border border-red-300/20 px-4 py-3 text-xs font-black uppercase text-red-200/70 transition hover:bg-red-400 hover:text-[#170707]" type="submit">
                          Удалить
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-10 text-center">
            <p className="text-lg font-black uppercase text-white">Заявок пока нет</p>
            <p className="mt-3 text-sm text-white/45">Новые обращения из квиза появятся здесь.</p>
          </div>
        )}
      </div>
    </main>
  );
}
