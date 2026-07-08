"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-2 bg-white/[0.03] p-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            className={`animate-fade-up rounded-[12px] border bg-[#171717] p-7 transition duration-300 ${
              isOpen ? "border-cyan-300/25" : "border-white/5"
            }`}
            key={item.question}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <button
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left text-base font-black text-white"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              <span>{item.question}</span>
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.04] text-cyan-300 transition ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen ? <p className="mt-5 max-w-3xl text-sm leading-6 text-white/50">{item.answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}