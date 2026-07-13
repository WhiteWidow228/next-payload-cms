import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="px-3 pb-5 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1380px] overflow-hidden">
        <div className="flex w-[200%] gap-4 border-y border-white/5 py-3 text-[11px] font-black uppercase text-white/32 animate-marquee">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index}>CORE DEVS<span className="mx-3 text-[#13c9e8]">*</span></span>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_2fr]">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <a
              className="flex min-h-20 items-center justify-between rounded-[14px] border border-white/5 bg-[#171717] px-6 text-white/50 transition hover:text-cyan-300"
              href="https://t.me/core_devs"
              rel="noreferrer"
              target="_blank"
            >
              <span>Telegram<br /><span className="text-sm text-white/35">@core_devs</span></span> <span>&#8599;</span>
            </a>
            <a
              className="flex min-h-20 items-center justify-between rounded-[14px] border border-white/5 bg-[#171717] px-6 text-white/50 transition hover:text-cyan-300"
              href="mailto:coredevs@yandex.com"
            >
              <span>Email<br /><span className="text-sm text-white/35">coredevs@yandex.com</span></span> <span>&#8599;</span>
            </a>
          </div>
          <div className="flex min-h-20 flex-col justify-center gap-2 rounded-[14px] border border-white/5 bg-[#171717] px-5 py-5 text-sm text-white/40 sm:px-8 md:flex-row md:items-center md:justify-between">
            <span>© 2026 Core Devs. Все права защищены.</span>
            <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Правовая информация">
              <Link className="transition hover:text-cyan-300" href="/privacy">
                Политика конфиденциальности
              </Link>
              <Link className="transition hover:text-cyan-300" href="/personal-data-consent">
                Согласие на обработку данных
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
