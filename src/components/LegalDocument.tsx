import Link from "next/link";
import type { ReactNode } from "react";

export function LegalDocument({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen px-3 py-5 text-[#f5f5f1] sm:px-5 lg:px-8">
      <article className="mx-auto max-w-[1180px] overflow-hidden rounded-[18px] border border-white/5 bg-[#101010]">
        <header className="border-b border-white/5 px-7 pb-10 pt-[50px] sm:px-10 lg:px-14">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>
          <h1 className="mt-5 max-w-5xl text-[22px] font-black uppercase leading-[1.08] text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-white/52">{intro}</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-white/30">Редакция от 13 июля 2026 года</p>
        </header>
        <div className="grid gap-10 px-7 py-10 sm:px-10 lg:px-14 lg:py-14">{children}</div>
        <div className="border-t border-white/5 px-7 py-8 sm:px-10 lg:px-14">
          <Link className="text-xs font-black uppercase text-cyan-300 transition hover:text-white" href="/">
            ← Вернуться на главную
          </Link>
        </div>
      </article>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-black uppercase text-white sm:text-2xl">{title}</h2>
      <div className="grid max-w-4xl gap-4 text-sm leading-7 text-white/55">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li className="flex gap-3" key={item}>
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
