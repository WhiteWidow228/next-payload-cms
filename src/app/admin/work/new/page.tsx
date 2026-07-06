import { redirect } from "next/navigation";

import { WorkForm } from "../../work-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listProjectCategories } from "@/lib/db";

export default async function NewWorkPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [params, categories] = await Promise.all([searchParams, listProjectCategories()]);

  return <WorkForm categories={categories} error={params.error} />;
}