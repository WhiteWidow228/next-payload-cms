import type { Metadata } from "next";

import type { SeoRegionPage } from "@/lib/seo-regions";
import { SITE_NAME, SOCIAL_IMAGE } from "@/lib/site-config";

export function createRegionMetadata(page: SeoRegionPage): Metadata {
  const socialTitle = `${page.title} | ${SITE_NAME}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.href,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: SITE_NAME,
      title: socialTitle,
      description: page.description,
      url: page.href,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}
