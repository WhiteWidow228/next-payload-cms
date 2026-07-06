import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://next-payload-cms-beige.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}