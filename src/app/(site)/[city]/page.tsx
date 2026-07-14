import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteLanding } from "@/components/SiteLanding";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import { createRegionMetadata } from "@/lib/seo-metadata";
import { cityRegionPages, getRegionPageBySlug } from "@/lib/seo-regions";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
  return cityRegionPages.map((page) => ({ city: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const page = getRegionPageBySlug(city);

  if (!page) {
    return {};
  }

  return createRegionMetadata(page);
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const page = getRegionPageBySlug(city);

  if (!page) {
    notFound();
  }

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Главная", path: "/" },
          { name: page.regionLabel, path: page.href },
        ]}
      />
      <SiteLanding page={page} />
    </>
  );
}
