import type { Metadata } from "next";
import Link from "next/link";

import { PortfolioTabs } from "@/components/PortfolioTabs";
import { listCompanyWorkItems, listProjectCategories } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Портфолио проектов",
  description: "Портфолио Core Devs: сайты, Telegram-боты, дизайн, веб-приложения и digital-проекты для бизнеса.",
  alternates: {
    canonical: "/portfolio",
  },
};

export default async function PortfolioPage() {
  const [works, categories] = await Promise.all([listCompanyWorkItems(), listProjectCategories()]);

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1380px]">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 rounded-[14px] border border-white/5 bg-[#171717]/92 px-5 py-4 shadow-[0_18px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:px-6">
          <Link className="text-sm font-black uppercase tracking-[0.08em] text-white" href="/">
            Core Devs
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70 transition hover:border-cyan-300/40 hover:text-cyan-300" href="/">
              Главная
            </Link>
            <a className="rounded-lg bg-[#13c9e8] px-5 py-3 text-xs font-black uppercase text-[#071012] transition hover:bg-white" data-estimate-trigger href="#">
              Рассчитать смету
            </a>
          </div>
        </header>

        <section className="mt-5 rounded-[18px] border border-white/5 bg-[#171717] p-8 sm:p-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Портфолио Core Devs</p>
          <h1 className="mt-5 max-w-5xl text-4xl font-black uppercase leading-none text-white sm:text-6xl lg:text-[76px]">
            Все проекты студии
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-7 text-white/50">
            Собрали кейсы по сайтам, ботам, дизайну и веб-приложениям. Выбирай категорию и открывай отдельные страницы проектов с деталями, технологиями и описанием задачи.
          </p>
        </section>

        <PortfolioTabs categories={categories} works={works} />
      </div>
    </main>
  );
}