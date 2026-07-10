import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getCompanyWorkItemBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

const fallbackProjectText = [
  "Этот кейс показывает подход Core Devs к задаче: мы упаковываем идею, продумываем структуру, собираем визуальный интерфейс, подключаем нужные технологии и доводим проект до состояния, в котором им удобно пользоваться и развивать дальше.",
  "Для похожих проектов можем подготовить дизайн, разработку, интеграции, админку, Telegram-бота, аналитику и SEO-структуру под нужный регион или нишу.",
];

function splitProjectText(value: string) {
  return value
    .split(/\n{2,}|\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const work = await getCompanyWorkItemBySlug(slug).catch(() => null);

  if (!work) {
    return {
      title: "Проект портфолио",
    };
  }

  const previewImage = work.image || work.detailImage || undefined;

  return {
    title: `${work.title} - кейс портфолио`,
    description: work.summary,
    alternates: {
      canonical: `/portfolio/${work.slug}`,
    },
    openGraph: {
      title: work.title,
      description: work.summary,
      images: previewImage ? [previewImage] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getCompanyWorkItemBySlug(slug).catch(() => null);

  if (!work) {
    notFound();
  }

  const detailImage = work.detailImage || work.image || "/assets/work-aura-clean.jpg";
  const projectParagraphs = splitProjectText(work.projectText || "");
  const aboutParagraphs = projectParagraphs.length ? projectParagraphs : fallbackProjectText;

  return (
    <main className="min-h-screen px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1380px]">
        <section className="mt-5 rounded-[18px] border border-white/5 bg-[#171717] p-8 sm:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase text-cyan-300">{work.category}</span>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">{work.timeTaken}</span>
          </div>
          <h1 className="mt-7 max-w-6xl text-4xl font-black uppercase leading-none text-white sm:text-6xl lg:text-[66px]">
            {work.title}
          </h1>
          <p className="mt-7 max-w-4xl text-base leading-7 text-white/52">{work.summary}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {work.technologies.map((technology) => (
              <span className="rounded-md bg-white/[0.04] px-3 py-2 text-xs text-white/62" key={technology}>
                {technology}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-[18px] border border-white/5 bg-[#111]">
          <div className="relative min-h-[360px] sm:min-h-[520px] lg:min-h-[720px]">
            <Image
              alt={work.imageAlt || work.title}
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={detailImage}
            />
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[18px] border border-white/5 bg-[#171717] p-8">
            <h2 className="text-xl font-black uppercase">О проекте</h2>
            <div className="mt-5 grid gap-5 text-sm leading-7 text-white/55">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="grid gap-4">
            <div className="rounded-[18px] border border-white/5 bg-[#171717] p-8">
              <h2 className="text-xl font-black uppercase">Команда проекта</h2>
              <div className="mt-6 grid gap-3">
                {work.teamMembers.length ? (
                  work.teamMembers.map((member) => (
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3" key={member.name}>
                      <Image alt={member.name} className="rounded-full" height={42} src={member.avatar} width={42} />
                      <span className="text-sm font-bold text-white/70">{member.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/45">Команда будет добавлена позже.</p>
                )}
              </div>
            </div>

            <div className="rounded-[18px] border border-white/5 bg-[#171717] p-8">
              <h2 className="text-xl font-black uppercase">Нужен похожий проект?</h2>
              <p className="mt-4 text-sm leading-6 text-white/50">
                Подготовим структуру, дизайн, разработку и запуск под вашу нишу, регион и реальные задачи бизнеса.
              </p>
              <a
                className="mt-7 flex h-12 items-center justify-center rounded-lg bg-[#13c9e8] px-6 text-xs font-black uppercase text-[#071012] transition hover:bg-white"
                data-estimate-trigger
                href="#"
              >
                {work.ctaLabel || "Рассчитать смету"}
              </a>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}