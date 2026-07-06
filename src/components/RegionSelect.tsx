"use client";

import { useRouter } from "next/navigation";

import { seoRegionPages } from "@/lib/seo-regions";

export function RegionSelect({ currentHref }: { currentHref: string }) {
  const router = useRouter();

  return (
    <label className="relative block">
      <span className="sr-only">Выбрать регион</span>
      <select
        className="h-10 w-[158px] cursor-pointer rounded-lg border border-white/10 bg-[#101010] px-3 text-[11px] font-black uppercase text-white/75 outline-none transition hover:border-cyan-300/45 hover:text-cyan-300 focus:border-cyan-300"
        value={currentHref}
        onChange={(event) => router.push(event.target.value)}
      >
        {seoRegionPages.map((page) => (
          <option className="bg-[#101010] text-white" key={page.href} value={page.href}>
            {page.navLabel}
          </option>
        ))}
      </select>
    </label>
  );
}