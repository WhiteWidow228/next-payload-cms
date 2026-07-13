"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { CompanyWorkItem, ProjectCategory } from "@/lib/db";

export function PortfolioTabs({ categories, works }: { categories: ProjectCategory[]; works: CompanyWorkItem[] }) {
  const [activeSlug, setActiveSlug] = useState("all");
  const tabs = useMemo(() => [{ id: "all", name: "Все проекты" }, ...categories.map((category) => ({ id: category.slug, name: category.name }))], [categories]);
  const filteredWorks = activeSlug === "all" ? works : works.filter((work) => work.categorySlug === activeSlug);

  return (
    <section className="mt-[50px]">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            className={`rounded-lg border px-5 py-3 text-xs font-black uppercase transition ${
              activeSlug === tab.id
                ? "border-cyan-300/60 bg-cyan-300 text-[#071012]"
                : "border-white/10 bg-[#171717] text-white/55 hover:border-cyan-300/40 hover:text-cyan-300"
            }`}
            key={tab.id}
            type="button"
            onClick={() => setActiveSlug(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {filteredWorks.length ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {filteredWorks.map((work) => (
            <article className="group overflow-hidden rounded-[16px] border border-white/5 bg-[#171717]" key={work.id}>
              <Link className="block" href={`/portfolio/${work.slug}`}>
                <div className="relative h-72 overflow-hidden bg-[#111]">
                  <Image
                    alt={work.imageAlt || work.title}
                    className="object-cover transition duration-700 group-hover:scale-105"
                    fill
                    sizes="(max-width: 1024px) calc(100vw - 32px), 670px"
                    src={work.image || "/assets/work-aura-clean.jpg"}
                  />
                </div>
                <div className="p-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase text-cyan-300">{work.category}</span>
                    <span className="text-xs font-bold uppercase text-white/35">{work.timeTaken}</span>
                  </div>
                  <h2 className="mt-5 text-2xl font-black uppercase leading-tight text-white">{work.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-white/50">{work.summary}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {work.technologies.slice(0, 5).map((technology) => (
                      <span className="rounded-md bg-white/[0.04] px-3 py-2 text-xs text-white/62" key={technology}>
                        {technology}
                      </span>
                    ))}
                  </div>
                  <span className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase text-cyan-300">
                    Смотреть кейс <span>↗</span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[16px] border border-white/5 bg-[#171717] p-10 text-center text-white/50">
          В этой категории пока нет проектов.
        </div>
      )}
    </section>
  );
}
