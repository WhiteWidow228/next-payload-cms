"use client";

import Image from "next/image";
import { useRef } from "react";

const teamMembers = [
  {
    name: "Максим Воронцов",
    role: "СЕО / стратег",
    image: "/assets/team-ceo.webp",
    accent: "from-cyan-300/24",
    text: "Ведет продуктовую стратегию, общается с клиентами и следит, чтобы проект решал бизнес-задачу, а не просто красиво выглядел.",
  },
  {
    name: "Артем Савин",
    role: "Backend-разработчик",
    image: "/assets/team-backend.webp",
    accent: "from-white/18",
    text: "Проектирует базы, интеграции, админки и серверную логику, чтобы сайт стабильно держал заявки, контент и рост нагрузки.",
  },
  {
    name: "Даниил Кравцов",
    role: "Frontend-разработчик",
    image: "/assets/team-frontend.webp",
    accent: "from-amber-300/18",
    text: "Собирает адаптивные интерфейсы, анимации и быстрые страницы на Next.js, React и Tailwind CSS.",
  },
  {
    name: "Алиса Морозова",
    role: "Веб-дизайнер",
    image: "/assets/team-designer.webp",
    accent: "from-pink-300/18",
    text: "Отвечает за визуальную систему, Figma-макеты, UI-киты и аккуратную подачу бренда в каждом блоке.",
  },
];

export function TeamSlider() {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  function scrollSlider(direction: "prev" | "next") {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    slider.scrollBy({
      behavior: "smooth",
      left: direction === "next" ? slider.clientWidth * 0.82 : -slider.clientWidth * 0.82,
    });
  }

  return (
    <section className="mt-[50px] overflow-hidden rounded-[18px] border border-white/5 bg-[#101010]" id="team">
      <div className="flex flex-col gap-5 border-b border-white/5 px-8 pb-8 pt-[50px] sm:px-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Core Devs team</p>
          <h2 className="mt-3 text-3xl font-black uppercase text-white sm:text-4xl">Наша команда</h2>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Предыдущий участник команды"
            className="grid size-12 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-xl text-white/70 transition hover:border-cyan-300/45 hover:text-cyan-300"
            onClick={() => scrollSlider("prev")}
            type="button"
          >
            ←
          </button>
          <button
            aria-label="Следующий участник команды"
            className="grid size-12 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-xl text-white/70 transition hover:border-cyan-300/45 hover:text-cyan-300"
            onClick={() => scrollSlider("next")}
            type="button"
          >
            →
          </button>
        </div>
      </div>

      <div className="bg-white/[0.03] p-2">
        <div
          className="flex snap-x gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={sliderRef}
        >
          {teamMembers.map((member, index) => (
            <article
              className="group relative flex min-h-[540px] animate-fade-up min-w-[82vw] snap-start flex-col overflow-hidden rounded-[14px] border border-white/5 bg-[#171717] p-7 transition duration-500 hover:-translate-y-1 hover:border-cyan-300/30 sm:min-w-[420px] lg:min-w-[31.8%]"
              key={member.name}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className={`absolute inset-x-0 top-0 h-44 bg-gradient-to-b ${member.accent} to-transparent opacity-80`} />
              <div className="relative mx-auto mt-2 h-[310px] w-full max-w-[260px] transition duration-700 group-hover:scale-[1.04]">
                <Image
                  alt={`${member.name}, ${member.role}`}
                  className="object-contain drop-shadow-[0_30px_55px_rgba(0,0,0,0.5)]"
                  fill
                  sizes="(max-width: 640px) 72vw, 260px"
                  src={member.image}
                />
              </div>
              <div className="relative mt-auto border-t border-white/5 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase leading-tight text-white">{member.name}</h3>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-300">{member.role}</p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cyan-300/10 text-cyan-300">✦</span>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/50">{member.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
