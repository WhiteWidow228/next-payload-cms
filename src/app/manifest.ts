import type { MetadataRoute } from "next";

import { DEFAULT_SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — веб-студия`,
    short_name: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#13c9e8",
    lang: "ru",
    icons: [
      {
        src: "/assets/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
