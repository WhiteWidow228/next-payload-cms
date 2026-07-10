import type { Metadata } from "next";

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
    <main className="min-h-screen px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1380px]">

        <section className="mt-5 rounded-[18px] border border-white/5 bg-[#171717] p-8 sm:p-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Портфолио Core Devs</p>
          <h1 className="mt-5 max-w-5xl text-4xl font-black uppercase leading-none text-white sm:text-6xl lg:text-[68px]">
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