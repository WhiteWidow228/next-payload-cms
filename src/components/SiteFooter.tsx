export function SiteFooter() {
  return (
    <footer className="px-3 pb-5 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1380px] overflow-hidden">
        <div className="flex w-[200%] gap-4 border-y border-white/5 py-3 text-[11px] font-black uppercase text-white/32 animate-marquee">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index}>Следите за нами в соцсетях <span className="mx-3 text-[#13c9e8]">*</span></span>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[0.7fr_2fr]">
          <a
            className="flex h-20 items-center justify-between rounded-[14px] border border-white/5 bg-[#171717] px-6 text-white/50 transition hover:text-cyan-300"
            data-estimate-trigger
            href="#"
          >
            Telegram <span>↗</span>
          </a>
          <div className="flex min-h-20 flex-col justify-center gap-2 rounded-[14px] border border-white/5 bg-[#171717] px-5 py-5 text-sm text-white/40 sm:px-8 md:flex-row md:items-center md:justify-between">
            <span>© 2026 Core Devs. Все права защищены.</span>
            <span>Условия&nbsp;&nbsp; Политика конфиденциальности</span>
          </div>
        </div>
      </div>
    </footer>
  );
}