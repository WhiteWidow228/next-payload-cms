import type { MetadataRoute } from "next";

import { seoRegionPages } from "@/lib/seo-regions";

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://next-payload-cms-beige.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return seoRegionPages.map((page) => ({
    url: new URL(page.href, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: page.href === "/" ? 1 : 0.82,
  }));
}