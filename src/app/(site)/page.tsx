import { SiteLanding } from "@/components/SiteLanding";
import { createRegionMetadata } from "@/lib/seo-metadata";
import { defaultRegionPage } from "@/lib/seo-regions";

export const dynamic = "force-dynamic";

export const metadata = createRegionMetadata(defaultRegionPage);

export default function Home() {
  return <SiteLanding page={defaultRegionPage} />;
}
