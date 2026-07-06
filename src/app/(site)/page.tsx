import type { Metadata } from "next";

import { SiteLanding } from "@/components/SiteLanding";
import { defaultRegionPage } from "@/lib/seo-regions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: defaultRegionPage.title,
  description: defaultRegionPage.description,
  alternates: {
    canonical: defaultRegionPage.href,
  },
  openGraph: {
    title: defaultRegionPage.title,
    description: defaultRegionPage.description,
    url: defaultRegionPage.href,
  },
};

export default function Home() {
  return <SiteLanding page={defaultRegionPage} />;
}