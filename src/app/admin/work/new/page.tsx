import { redirect } from "next/navigation";

import { WorkForm } from "../../work-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listProjectCategories } from "@/lib/db";
import { listMediaLibraryItems } from "@/lib/media-library";

export default async function NewWorkPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [params, categories, mediaItems] = await Promise.all([
    searchParams,
    listProjectCategories(),
    listMediaLibraryItems(),
  ]);

  return <WorkForm categories={categories} error={params.error} mediaItems={mediaItems} />;
}