import type { MetadataRoute } from "next";

import { listCompanyWorkItems } from "@/lib/db";
import { seoRegionPages } from "@/lib/seo-regions";

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://next-payload-cms-beige.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let projectRoutes: MetadataRoute.Sitemap = [];

  try {
    const works = await listCompanyWorkItems();

    projectRoutes = works.map((work) => ({
      url: new URL(`/portfolio/${work.slug}`, siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.72,
    }));
  } catch {
    projectRoutes = [];
  }

  return [
    ...seoRegionPages.map((page) => ({
      url: new URL(page.href, siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: page.href === "/" ? 1 : 0.82,
    })),
    {
      url: new URL("/portfolio", siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.86,
    },
    ...projectRoutes,
  ];
}