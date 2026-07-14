import type { MetadataRoute } from "next";

import { listCompanyWorkItems } from "@/lib/db";
import { seoRegionPages } from "@/lib/seo-regions";
import { absoluteUrl } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let projectRoutes: MetadataRoute.Sitemap = [];

  try {
    const works = await listCompanyWorkItems();

    projectRoutes = works.map((work) => ({
      url: absoluteUrl(`/portfolio/${work.slug}`),
      changeFrequency: "monthly",
      priority: 0.72,
    }));
  } catch {
    projectRoutes = [];
  }

  return [
    ...seoRegionPages.map((page) => ({
      url: absoluteUrl(page.href),
      changeFrequency: "weekly" as const,
      priority: page.href === "/" ? 1 : 0.82,
    })),
    {
      url: absoluteUrl("/portfolio"),
      changeFrequency: "weekly",
      priority: 0.86,
    },
    ...projectRoutes,
  ];
}
