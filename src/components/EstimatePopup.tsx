"use client";

import { useEffect, useState } from "react";

export function EstimatePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openPopup = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest("[data-estimate-trigger]");

      if (!trigger) {
        return;
      }

      event.preventDefault();
      setIsOpen(true);
    };

    document.addEventListener("click", openPopup);

    return () => document.removeEventListener("click", openPopup);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-4 backdrop-blur-xl"
      role="dialog"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="animate-popup-in relative w-full max-w-[460px] overflow-hidden rounded-[22px] border border-cyan-300/25 bg-[#121212] p-8 text-center shadow-[0_0_90px_rgba(19,201,232,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Закрыть окно"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/[0.05] text-2xl leading-none text-white/60 transition hover:bg-white hover:text-[#071012]"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#13c9e8] text-[#071012] shadow-[0_0_40px_rgba(19,201,232,0.42)]">
          <svg aria-hidden="true" className="size-11" fill="none" viewBox="0 0 24 24">
            <path
              d="M21 4.5 18.1 19c-.2 1-.9 1.2-1.7.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.4-5 9-8.1c.4-.4-.1-.6-.6-.3L6 12.5 1.2 11c-1-.3-1-1 .2-1.5L19.9 2.4c.9-.3 1.6.2 1.1 2.1Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-cyan-300">
          Telegram
        </p>
        <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
          Рассчитать смету прямо сейчас
        </h2>
        <div className="mt-7 grid gap-3">
          <a
            className="flex h-12 items-center justify-center rounded-lg bg-[#13c9e8] px-5 text-sm font-black uppercase text-[#071012] transition hover:bg-white"
            href="https://t.me/core_devs"
            rel="noreferrer"
            target="_blank"
          >
            @core_devs
          </a>
          <a
            className="text-sm font-bold text-white/55 transition hover:text-cyan-300"
            href="mailto:coredevs@yandex.com"
          >
            coredevs@yandex.com
          </a>
        </div>
      </div>
    </div>
  );
}
