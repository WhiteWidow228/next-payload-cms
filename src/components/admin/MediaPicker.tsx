"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useRef, useState, type ChangeEvent } from "react";

import type { MediaLibraryItem } from "@/lib/media-library";

type UploadState = "idle" | "uploading" | "error";

function formatBytes(value: number) {
  if (!value) {
    return "0 КБ";
  }

  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} КБ`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} МБ`;
}

export function MediaPicker({
  assets,
  label,
  name,
  value,
}: {
  assets: MediaLibraryItem[];
  label: string;
  name: string;
  value?: string;
}) {
  const inputId = `media-${name}`;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentValue, setCurrentValue] = useState(value || "");
  const [library, setLibrary] = useState(assets);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadMessage, setUploadMessage] = useState("");

  const sortedLibrary = useMemo(
    () => [...library].sort((first, second) => Number(second.source === "uploaded") - Number(first.source === "uploaded")),
    [library],
  );
  const selectedAsset = sortedLibrary.find((asset) => asset.src === currentValue);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadState("uploading");
    setUploadMessage("Загружаем изображение...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/admin/media", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { asset?: MediaLibraryItem; error?: string };

      if (!response.ok || !payload.asset) {
        throw new Error(payload.error || "Не удалось загрузить изображение.");
      }

      setLibrary((items) => [payload.asset as MediaLibraryItem, ...items.filter((item) => item.src !== payload.asset?.src)]);
      setCurrentValue(payload.asset.src);
      setUploadState("idle");
      setUploadMessage("Изображение загружено и выбрано.");
      setIsOpen(false);
    } catch (error) {
      setUploadState("error");
      setUploadMessage(error instanceof Error ? error.message : "Не удалось загрузить изображение.");
    } finally {
      event.target.value = "";
    }
  }

  function chooseAsset(asset: MediaLibraryItem) {
    setCurrentValue(asset.src);
    setIsOpen(false);
    setUploadMessage(`Выбрано: ${asset.name}`);
  }

  return (
    <div className="block text-sm font-bold text-white/70">
      <label htmlFor={inputId}>{label}</label>
      <div className="mt-2 grid gap-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            className="h-12 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 text-white outline-none transition focus:border-cyan-300"
            id={inputId}
            name={name}
            onChange={(event) => setCurrentValue(event.target.value)}
            placeholder="/assets/project.jpg или /api/media/1"
            type="text"
            value={currentValue}
          />
          <button
            className="h-12 rounded-lg border border-cyan-300/25 px-5 text-xs font-black uppercase text-cyan-300 transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#071012]"
            onClick={() => setIsOpen(true)}
            type="button"
          >
            Обзор
          </button>
          <button
            className="h-12 rounded-lg bg-[#13c9e8] px-5 text-xs font-black uppercase text-[#071012] transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
            disabled={uploadState === "uploading"}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            Загрузить
          </button>
          <input ref={fileInputRef} accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleUpload} type="file" />
        </div>

        <div className="grid gap-3 rounded-xl border border-white/10 bg-[#101010] p-3 sm:grid-cols-[140px_1fr] sm:items-center">
          <div className="relative h-28 overflow-hidden rounded-lg border border-white/10 bg-black/30">
            {currentValue ? <img alt="Превью изображения" className="h-full w-full object-cover" src={currentValue} /> : null}
          </div>
          <div>
            <p className="text-xs font-black uppercase text-white/45">Текущее изображение</p>
            <p className="mt-2 break-all text-sm text-white/78">{currentValue || "Изображение пока не выбрано"}</p>
            {selectedAsset ? (
              <p className="mt-2 text-xs text-white/42">
                {selectedAsset.name} · {formatBytes(selectedAsset.size)} · {selectedAsset.source === "uploaded" ? "медиатека" : "assets"}
              </p>
            ) : null}
            {uploadMessage ? (
              <p className={`mt-2 text-xs ${uploadState === "error" ? "text-red-300" : "text-cyan-200/70"}`}>{uploadMessage}</p>
            ) : null}
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="max-h-[86vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Медиатека</p>
                <h2 className="mt-1 text-2xl font-black uppercase text-white">Выбери изображение проекта</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-[#13c9e8] px-5 py-3 text-xs font-black uppercase text-[#071012] transition hover:bg-white"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  Загрузить новое
                </button>
                <button
                  className="rounded-lg border border-white/10 px-5 py-3 text-xs font-black uppercase text-white/70 transition hover:border-cyan-300/40 hover:text-cyan-300"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  Закрыть
                </button>
              </div>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-5">
              {sortedLibrary.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedLibrary.map((asset) => {
                    const isSelected = asset.src === currentValue;

                    return (
                      <button
                        className={`group overflow-hidden rounded-xl border bg-[#171717] text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-300/45 ${
                          isSelected ? "border-cyan-300/70" : "border-white/10"
                        }`}
                        key={`${asset.source}-${asset.id}`}
                        onClick={() => chooseAsset(asset)}
                        type="button"
                      >
                        <span className="block h-40 overflow-hidden bg-black/30">
                          <img alt={asset.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={asset.src} />
                        </span>
                        <span className="block p-4">
                          <span className="block truncate text-sm font-black text-white">{asset.name}</span>
                          <span className="mt-2 flex items-center justify-between gap-3 text-[11px] uppercase text-white/42">
                            <span>{formatBytes(asset.size)}</span>
                            <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-cyan-300">
                              {asset.source === "uploaded" ? "медиатека" : "assets"}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">
                  В медиатеке пока нет изображений. Загрузи первое через кнопку сверху.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}