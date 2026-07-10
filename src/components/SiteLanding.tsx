import Image from "next/image";
import Link from "next/link";

import { AnimatedStatValue } from "@/components/AnimatedStatValue";
import { FaqAccordion } from "@/components/FaqAccordion";

import { listCompanyWorkItems } from "@/lib/db";
import { seoRegionPages, type SeoRegionPage } from "@/lib/seo-regions";

type WorkCard = {
  id: string | number;
  title: string;
  slug: string;
  summary: string;
  category: string;
  timeTaken: string;
  image: string;
  imageAlt: string;
  technologies: string[];
  team: Array<{ name: string; avatar: string }>;
  ctaLabel: string;
};

const stats = [
  { label: "Клиентов", value: "50+" },
  { label: "Проектов", value: "120+" },
  { label: "Довольных клиентов", value: "100%" },
  { label: "Опыт", value: "4+" },
];

const services = [
  {
    iconSrc: "/assets/icon-web-design.svg",
    title: "Дизайн сайтов",
    text: "Профессиональный дизайн в Figma. Современный, адаптивный и ориентированный на конверсию.",
    price: "от 15 000 ₽",
  },
  {
    iconSrc: "/assets/icon-telegram-bot.svg",
    title: "Telegram боты",
    text: "Функциональные боты для продаж, поддержки клиентов, автоматизации и управления бизнесом.",
    price: "от 10 000 ₽",
  },
  {
    iconSrc: "/assets/icon-web-dev.svg",
    title: "Разработка сайтов",
    text: "Разработка сайтов на WordPress, Tilda и Next.js, от лендингов до крупных интернет-магазинов.",
    price: "от 20 000 ₽",
  },
  {
    iconSrc: "/assets/icon-react.svg",
    title: "React / Веб-приложения",
    text: "Современные веб-приложения, личные кабинеты, CRM-системы и сложные интерфейсные сервисы.",
    price: "от 60 000 ₽",
  },
];

const fallbackWorks: WorkCard[] = [
  {
    id: "zenith",
    slug: "zenith-fitness-app",
    title: "Фитнес-приложение Zenith",
    summary:
      "Мобильное приложение для фитнес-студии с программами тренировок, питанием и личным кабинетом клиента.",
    category: "Мобильное приложение",
    timeTaken: "9 месяцев",
    image: "/assets/work-zenith-clean.jpg",
    imageAlt: "Экраны фитнес-приложения Zenith",
    technologies: ["React Native", "Firebase", "Redux", "REST API", "MongoDB"],
    team: [1, 2, 3, 4, 5, 6].map((item) => ({
      name: `Участник команды ${item}`,
      avatar: `/assets/avatar-${item}.png`,
    })),
    ctaLabel: "Рассчитать смету",
  },
  {
    id: "aura",
    slug: "a-aura-ecommerce",
    title: "Интернет-магазин A-Aura",
    summary:
      "Редизайн интернет-магазина с новой визуальной системой, удобным каталогом и понятной покупкой.",
    category: "Дизайн и разработка сайта",
    timeTaken: "3 месяца",
    image: "/assets/work-aura-clean.jpg",
    imageAlt: "Экраны интернет-магазина A-Aura",
    technologies: ["WordPress", "PHP", "HTML5", "CSS3", "JavaScript"],
    team: [2, 3, 4, 5, 6, 1].map((item) => ({
      name: `Участник команды ${item}`,
      avatar: `/assets/avatar-${item}.png`,
    })),
    ctaLabel: "Рассчитать смету",
  },
];

const reviews = [
  {
    title: "Разработка сайта и бота",
    text: "Core Devs сделали нам сайт на Tilda и Telegram-бота. Продажи выросли на 40%, всё в личном кабинете понятно.",
    name: "Анна Смирнова",
    role: "Основательница бренда одежды",
    avatar: "/assets/avatar-1.png",
  },
  {
    title: "Сайт на WordPress",
    text: "Заказывали корпоративный сайт на WordPress и React-приложение. Всё сделали качественно, в срок и с душой.",
    name: "Игорь Ботенко",
    role: "Директор компании ЮР",
    avatar: "/assets/avatar-2.png",
  },
  {
    title: "Сайт визитка + бот",
    text: "Обратились за разработкой сайта-визитки и бота для записи клиентов. Получили всё очень быстро и красиво.",
    name: "Екатерина Морозова",
    role: "Основательница студии красоты",
    avatar: "/assets/avatar-3.png",
  },
  {
    title: "Интернет магазин на WP",
    text: "Заказывали полноценный интернет-магазин на WordPress. Работы выполнены все: дизайн, верстка, подключение оплаты.",
    name: "Сергей Ковалёв",
    role: "Директор магазина часов",
    avatar: "/assets/avatar-4.png",
  },
];

const faqs = [
  {
    question: "Сколько времени занимает разработка сайта?",
    answer:
      "Срок зависит от сложности. Лендинг обычно занимает 1-2 недели, полноценный сайт от 3-6 недель, веб-приложение от 1,5-2 месяцев.",
  },
  {
    question: "Берёте ли вы крупные проекты и веб-приложения?",
    answer:
      "Да. Мы разбиваем работу на этапы: аналитика, прототип, дизайн, разработка, тестирование и запуск.",
  },
  {
    question: "Можно ли подключить CRM, оплату и внешние сервисы?",
    answer:
      "Да. Подключаем платежные системы, CRM, аналитику, карты, мессенджеры и внутренние API компании.",
  },
  {
    question: "Как вы проверяете адаптивность сайта?",
    answer:
      "Тестируем интерфейс на разных экранах, браузерах и состояниях данных, чтобы сайт стабильно работал после запуска.",
  },
  {
    question: "Как вы подходите к UX-дизайну?",
    answer:
      "Сначала разбираем цели пользователя и бизнеса, затем собираем прототип, убираем лишние шаги и доводим визуал.",
  },
];

async function getCompanyWorks() {
  try {
    const items = await listCompanyWorkItems();

    if (!items.length) {
      return fallbackWorks;
    }

    return items.map((item, index) => {
      const fallback = fallbackWorks[index % fallbackWorks.length];

      return {
        id: item.id,
        title: item.title,
        slug: item.slug || fallback.slug,
        summary: item.summary,
        category: item.category || fallback.category,
        timeTaken: item.timeTaken || fallback.timeTaken,
        image: item.image || fallback.image,
        imageAlt: item.imageAlt || fallback.imageAlt,
        technologies: item.technologies.length ? item.technologies : fallback.technologies,
        team: item.teamMembers.length ? item.teamMembers : fallback.team,
        ctaLabel: item.ctaLabel || fallback.ctaLabel,
      };
    });
  } catch {
    return fallbackWorks;
  }
}

export async function SiteLanding({ page }: { page: SeoRegionPage }) {
  const works = await getCompanyWorks();

  return (
    <main className="min-h-screen bg-[#090909] px-3 py-5 text-[#f5f5f1] sm:px-5 lg:px-8">
      <div className="mx-auto flex max-w-[1380px] flex-col gap-5">

        <section className="grid gap-3 lg:grid-cols-[1.95fr_1fr]" id="home">
          <div className="animate-fade-up group relative overflow-hidden rounded-[16px] border border-white/5 bg-[#171717] p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] sm:p-12 lg:min-h-[430px] lg:p-14">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_75%_35%,rgba(19,201,232,0.12),transparent_24rem)] opacity-80" />
            <div className="relative z-10 flex h-full max-w-4xl flex-col justify-center">
              <button
                className="mb-6 inline-flex w-fit cursor-pointer items-center gap-3 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-4 py-2 text-xs font-black uppercase text-cyan-300 transition hover:border-cyan-300/45"
                data-estimate-trigger
                type="button"
              >
                <span className="relative flex size-7 items-center justify-center rounded-full bg-[#13c9e8] text-lg text-[#071012] shadow-[0_0_25px_rgba(19,201,232,0.65)]">
                  +
                </span>
                Заказать проект
              </button>
              <h1 className="max-w-5xl text-4xl font-black uppercase leading-[0.95] text-white sm:text-6xl lg:text-[70px]">
                {page.h1}
              </h1>
              <p className="mt-5 max-w-3xl text-sm font-bold uppercase tracking-[0.14em] text-white/82">
                {page.heroLead}
              </p>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/43">
                {page.heroText}
              </p>
            </div>
          </div>

          <article className="animate-fade-up group relative overflow-hidden rounded-[16px] border border-white/5 bg-[#171717] [animation-delay:90ms]">
            <div className="relative h-72 overflow-hidden lg:h-[300px]">
              <Image
                alt={`Digital-обложка Core Devs: ${page.regionLabel}`}
                className="object-cover transition duration-700 group-hover:scale-105"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 420px"
                src="/assets/Image.jpg"
              />
            </div>
            <div className="p-7">
              <h2 className="text-lg font-black uppercase">Core Devs</h2>
              <p className="mt-1 text-sm text-white/45">IT-разработка · {page.regionLabel}</p>
            </div>
          </article>
        </section>

        <section className="grid gap-2 rounded-[16px] border border-white/5 bg-[#111] p-2 md:grid-cols-[repeat(4,1fr)_1.05fr]">
          {stats.map((stat, index) => (
            <div
              className="animate-fade-up rounded-xl border border-white/5 bg-[#171717] px-6 py-5 text-center"
              key={stat.label}
              style={{ animationDelay: `${120 + index * 70}ms` }}
            >
              <p className="text-[11px] font-black uppercase text-white/42">{stat.label}</p>
              <AnimatedStatValue className="mt-1 block text-4xl font-black text-[#13c9e8]" value={stat.value} />
            </div>
          ))}
          <a
            className="animate-fade-up flex items-center justify-center gap-3 rounded-xl border border-white/5 bg-[#171717] px-6 py-5 text-xs font-black uppercase text-white/78 transition duration-300 hover:border-cyan-300/40 hover:text-cyan-300 md:text-sm"
            data-estimate-trigger
            href="#"
            style={{ animationDelay: "420ms" }}
          >
            <span className="grid size-9 place-items-center rounded-full bg-[#111] text-[#13c9e8]">↗</span>
            Заказать проект
          </a>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-white/5 bg-[#101010]" id="services">
          <SectionTitle title="Услуги компании" />
          <div className="grid gap-1.5 bg-white/[0.03] p-1.5 md:grid-cols-2">
            {services.map((service, index) => (
              <article
                className="animate-fade-up group min-h-[245px] rounded-[12px] border border-white/5 bg-[#171717] p-8 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
                key={service.title}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-[#1f1f1f] shadow-[0_0_24px_rgba(19,201,232,0.12)]">
                      <Image alt="" aria-hidden="true" height={56} src={service.iconSrc} width={56} />
                    </span>
                    <h3 className="text-lg font-black uppercase text-white">{service.title}</h3>
                  </div>
                  <a
                    className="rounded-full bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase text-white/45 transition group-hover:text-cyan-300"
                    data-estimate-trigger
                    href="#"
                  >
                    ↗ Примеры работ
                  </a>
                </div>
                <p className="mt-12 max-w-xl text-sm leading-6 text-white/48">{service.text}</p>
                <p className="mt-8 text-right text-lg font-black uppercase text-white/86">{service.price}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 overflow-hidden rounded-[18px] border border-white/5 bg-[#101010]" id="works">
          <div className="flex items-center justify-between border-b border-white/5 px-8 py-8 sm:px-10">
            <h2 className="text-3xl font-black uppercase text-white sm:text-4xl">Работы компании</h2>
            <Link
              className="rounded-full bg-white/[0.03] px-5 py-3 text-[11px] font-black uppercase text-white/54 transition hover:text-cyan-300"
              href="/portfolio"
            >
              ↗ Все работы
            </Link>
          </div>
          <div className="grid gap-2 bg-white/[0.03] p-2">
            {works.map((work, index) => (
              <WorkProjectCard index={index} key={work.id} work={work} />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-white/5 bg-[#101010]" id="reviews">
          <SectionTitle title="Отзывы" />
          <div className="grid gap-2 bg-white/[0.03] p-2 md:grid-cols-2 xl:grid-cols-4">
            {reviews.map((review, index) => (
              <article
                className="animate-fade-up rounded-[12px] border border-white/5 bg-[#171717] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25"
                key={review.name}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <h3 className="min-h-16 text-xl font-black uppercase leading-tight text-white">{review.title}</h3>
                <p className="mt-4 min-h-28 text-sm leading-6 text-white/48">{review.text}</p>
                <div className="mt-7 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Image alt={review.name} className="rounded-full" height={48} src={review.avatar} width={48} />
                    <div>
                      <p className="text-sm font-black text-white">{review.name}</p>
                      <p className="text-xs text-white/40">{review.role}</p>
                    </div>
                  </div>
                  <button
                    className="grid size-8 place-items-center rounded-full bg-[#111] text-cyan-300 transition hover:bg-cyan-300 hover:text-[#071012]"
                    data-estimate-trigger
                    type="button"
                  >
                    ↗
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-2 lg:grid-cols-[1.55fr_1fr]" id="faq">
          <div className="overflow-hidden rounded-[18px] border border-white/5 bg-[#101010]">
            <SectionTitle title="Часто задаваемые вопросы" />
            <FaqAccordion items={faqs} />

          </div>
          <aside className="animate-fade-up rounded-[18px] border border-white/5 bg-[#171717] p-8 lg:mt-[92px]">
            <h3 className="text-2xl font-black uppercase leading-tight text-white">Готовы вывести ваш бизнес на новый уровень?</h3>
            <p className="mt-8 text-sm leading-6 text-white/48">
              Напишите нам, и мы создадим для вас мощный цифровой инструмент, который будет работать на вас 24/7.
            </p>
            <a
              className="mt-8 flex h-13 items-center justify-center rounded-lg bg-[#13c9e8] text-xs font-black uppercase text-[#071012] transition duration-300 hover:bg-white"
              data-estimate-trigger
              href="#"
            >
              Написать нам
            </a>
          </aside>
        </section>

        <SeoTextSection page={page} />

        <section className="relative mt-20 overflow-hidden rounded-[18px] bg-[#13c9e8] p-8 text-[#071012] shadow-[0_0_80px_rgba(19,201,232,0.22)] sm:p-12" id="contact">
          <div className="animate-glow-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/25 blur-xl" />
          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <h2 className="max-w-4xl text-4xl font-black uppercase leading-none sm:text-5xl lg:text-6xl">
                Готовы усилить ваше цифровое присутствие?
              </h2>
              <p className="mt-5 max-w-4xl text-sm leading-6 text-[#08343b]/80">
                Сделайте первый шаг к сильному сайту, боту или веб-сервису. Мы быстро оценим задачу и предложим понятный план разработки.
              </p>
            </div>
            <a
              className="flex h-14 min-w-44 items-center justify-center rounded-lg bg-[#090909] px-7 text-xs font-black uppercase text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#071012]"
              data-estimate-trigger
              href="#"
            >
              Рассчитать смету ↗
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="px-8 py-8 sm:px-10">
      <h2 className="text-3xl font-black uppercase text-white sm:text-4xl">{title}</h2>
    </div>
  );
}

function SeoTextSection({ page }: { page: SeoRegionPage }) {
  return (
    <section className="mt-20 overflow-hidden rounded-[18px] border border-white/5 bg-[#101010]" id="seo">
      <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Core Devs · {page.regionLabel}</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
            {page.seoTitle}
          </h2>
          <div className="mt-7 grid gap-5 text-sm leading-7 text-white/52">
            {page.seoParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <aside className="rounded-[14px] border border-white/5 bg-[#171717] p-6">
          <h3 className="text-lg font-black uppercase text-white">Что делаем</h3>
          <ul className="mt-5 grid gap-3 text-sm text-white/58">
            {page.seoHighlights.map((item) => (
              <li className="flex gap-3" key={item}>
                <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-cyan-300/12 text-[10px] text-cyan-300">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-white/5 pt-6">
            <h3 className="text-sm font-black uppercase text-white/80">Города и регионы</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {seoRegionPages.map((region) => (
                <Link
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                    region.href === page.href
                      ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-300"
                      : "border-white/5 bg-white/[0.03] text-white/52 hover:border-cyan-300/35 hover:text-cyan-300"
                  }`}
                  href={region.href}
                  key={region.href}
                >
                  {region.navLabel}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function WorkProjectCard({ work, index }: { work: WorkCard; index: number }) {
  return (
    <article
      className="animate-fade-up grid gap-2 lg:grid-cols-[1fr_1.08fr_1fr]"
      style={{ animationDelay: `${index * 110}ms` }}
    >
      <div className="rounded-[12px] border border-white/5 bg-[#171717] p-7">
        <div className="mb-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-300/10 text-cyan-300">✦</span>
            <h3 className="text-base font-black uppercase text-white">{work.title}</h3>
          </div>
          <Link
            className="text-xs font-black uppercase text-white/55 transition hover:text-cyan-300"
            href={`/portfolio/${work.slug}`}
          >
            ↗ Детали
          </Link>
        </div>
        <div className="space-y-5 text-sm text-white/48">
          <p>Категория - <span className="text-white/75">{work.category}</span></p>
          <p>Срок - <span className="text-white/75">{work.timeTaken}</span></p>
        </div>
      </div>

      <div className="relative min-h-[300px] overflow-hidden rounded-[12px] border border-white/5 bg-[#111] lg:min-h-[330px]">
        <Image alt={work.imageAlt} className="object-cover transition duration-700 hover:scale-105" fill sizes="(max-width: 1024px) 100vw, 420px" src={work.image} />
      </div>

      <div className="grid gap-2">
        <div className="rounded-[12px] border border-white/5 bg-[#171717] p-7">
          <h4 className="text-sm font-black uppercase text-white">Технологии проекта</h4>
          <div className="mt-6 flex flex-wrap gap-2">
            {work.technologies.map((technology) => (
              <span className="rounded-md bg-white/[0.04] px-3 py-2 text-xs text-white/62" key={technology}>
                {technology}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[12px] border border-white/5 bg-[#171717] p-7">
          <h4 className="text-sm font-black uppercase text-white">Команда проекта</h4>
          <div className="mt-5 flex -space-x-2">
            {work.team.slice(0, 6).map((member) => (
              <Image
                alt={member.name}
                className="rounded-full border-2 border-[#171717]"
                height={42}
                key={`${work.id}-${member.name}`}
                src={member.avatar}
                width={42}
              />
            ))}
          </div>
          <a
            className="mt-6 flex h-12 items-center justify-center rounded-lg bg-[#13c9e8] text-xs font-black uppercase text-[#071012] transition duration-300 hover:bg-white"
            data-estimate-trigger
            href="#"
          >
            {work.ctaLabel || "Рассчитать смету"}
          </a>
        </div>
      </div>
    </article>
  );
}