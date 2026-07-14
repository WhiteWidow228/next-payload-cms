import {
  SITE_EMAIL,
  SITE_NAME,
  SITE_TELEGRAM,
  SITE_URL,
  absoluteUrl,
} from "@/lib/site-config";

type JsonLdData = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
      type="application/ld+json"
    />
  );
}

export function SiteStructuredData() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: absoluteUrl("/assets/favicon-192.png"),
            image: absoluteUrl("/assets/coredevs-hero.png"),
            email: SITE_EMAIL,
            sameAs: [SITE_TELEGRAM],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "sales",
              email: SITE_EMAIL,
              availableLanguage: ["ru"],
            },
            areaServed: ["Крым", "Симферополь", "Ялта", "Севастополь", "Краснодар", "Ростов-на-Дону", "Москва"],
            knowsAbout: [
              "разработка сайтов",
              "интернет-магазины",
              "Telegram-боты",
              "веб-приложения",
              "веб-дизайн",
              "SEO-подготовка сайтов",
            ],
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: SITE_NAME,
            inLanguage: "ru-RU",
            publisher: {
              "@id": `${SITE_URL}/#organization`,
            },
          },
        ],
      }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; path: string }> }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}
