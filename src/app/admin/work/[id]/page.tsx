import { notFound, redirect } from "next/navigation";

import { WorkForm } from "../../work-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCompanyWorkItem, listProjectCategories } from "@/lib/db";
import { listMediaLibraryItems } from "@/lib/media-library";

export default async function EditWorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const [work, categories, query, mediaItems] = await Promise.all([
    getCompanyWorkItem(Number(id)),
    listProjectCategories(),
    searchParams,
    listMediaLibraryItems(),
  ]);

  if (!work) {
    notFound();
  }

  return <WorkForm categories={categories} error={query.error} mediaItems={mediaItems} work={work} />;
}