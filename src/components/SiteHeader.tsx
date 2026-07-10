"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { RegionSelect } from "@/components/RegionSelect";
import { seoRegionPages } from "@/lib/seo-regions";

const navItems = [
  { label: "Главная", anchor: "home" },
  { label: "Услуги", anchor: "services" },
  { label: "Отзывы", anchor: "reviews" },
  { label: "FAQ", anchor: "faq" },
];

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(false);
  const currentRegionPage = useMemo(() => seoRegionPages.find((page) => page.href === pathname), [pathname]);
  const currentRegionHref = currentRegionPage?.href || "/";
  const sectionBase = currentRegionPage ? currentRegionPage.href : "/";

  const getSectionHref = (anchor: string) => `${sectionBase === "/" ? "/" : sectionBase}#${anchor}`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1380px] rounded-[14px] border border-white/5 bg-[#171717]/94 shadow-[0_18px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:min-h-20 sm:px-6">
          <Link className="font-display text-sm font-black uppercase tracking-[0.08em] text-white" href={currentRegionHref} onClick={() => setIsOpen(false)}>
            Core Devs
          </Link>

          <nav className="hidden items-center gap-2 lg:flex" aria-label="Основная навигация">
            {navItems.map((item) => (
              <Link
                className="rounded-lg border border-white/5 bg-[#111] px-5 py-3 text-[11px] font-bold uppercase text-white/70 transition duration-300 hover:border-cyan-300/60 hover:text-cyan-300"
                href={getSectionHref(item.anchor)}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="rounded-lg border border-white/5 bg-[#111] px-5 py-3 text-[11px] font-bold uppercase text-white/70 transition duration-300 hover:border-cyan-300/60 hover:text-cyan-300"
              href="/portfolio"
            >
              Проекты
            </Link>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <RegionSelect currentHref={currentRegionHref} />
            <a
              className="rounded-lg bg-[#13c9e8] px-5 py-3 text-[11px] font-black uppercase text-[#071012] shadow-[0_0_30px_rgba(19,201,232,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
              data-estimate-trigger
              href="#"
            >
              Контакты
            </a>
          </div>

          <button
            aria-expanded={isOpen}
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
            className="grid size-11 place-items-center rounded-lg border border-white/10 bg-[#101010] text-white transition hover:border-cyan-300/45 hover:text-cyan-300 lg:hidden"
            type="button"
            onClick={() => setIsOpen((value) => !value)}
          >
            <span className="relative h-4 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>

        {isOpen ? (
          <div className="grid gap-2 border-t border-white/5 px-4 pb-4 lg:hidden">
            <nav className="grid gap-2 pt-4" aria-label="Мобильная навигация">
              {navItems.map((item) => (
                <Link
                  className="rounded-lg border border-white/5 bg-[#101010] px-4 py-3 text-xs font-black uppercase text-white/72 transition hover:border-cyan-300/45 hover:text-cyan-300"
                  href={getSectionHref(item.anchor)}
                  key={item.label}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                className="rounded-lg border border-white/5 bg-[#101010] px-4 py-3 text-xs font-black uppercase text-white/72 transition hover:border-cyan-300/45 hover:text-cyan-300"
                href="/portfolio"
                onClick={() => setIsOpen(false)}
              >
                Проекты
              </Link>
            </nav>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <RegionSelect currentHref={currentRegionHref} className="w-full" onChange={() => setIsOpen(false)} />
              <a
                className="flex h-11 items-center justify-center rounded-lg bg-[#13c9e8] px-5 text-xs font-black uppercase text-[#071012] transition hover:bg-white"
                data-estimate-trigger
                href="#"
                onClick={() => setIsOpen(false)}
              >
                Контакты
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}