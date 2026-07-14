const FALLBACK_SITE_URL = "https://core-devs.ru";

function resolveSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SERVER_URL?.trim() || FALLBACK_SITE_URL;

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Core Devs";
export const SITE_EMAIL = "coredevs@yandex.com";
export const SITE_TELEGRAM = "https://t.me/core_devs";
export const DEFAULT_SITE_TITLE = "Разработка сайтов в Крыму под ключ | Core Devs";
export const DEFAULT_SITE_DESCRIPTION =
  "Разрабатываем сайты, интернет-магазины, Telegram-ботов и веб-сервисы для бизнеса в Крыму. Дизайн, SEO-подготовка, интеграции и запуск под ключ.";
export const SOCIAL_IMAGE = {
  url: "/assets/coredevs-hero.png",
  width: 452,
  height: 368,
  alt: "Core Devs — разработка сайтов и веб-сервисов",
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function trimMetaText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const shortened = normalized.slice(0, Math.max(1, maxLength - 1));
  const lastSpace = shortened.lastIndexOf(" ");
  const result = lastSpace > maxLength * 0.65 ? shortened.slice(0, lastSpace) : shortened;

  return `${result.trim()}…`;
}
