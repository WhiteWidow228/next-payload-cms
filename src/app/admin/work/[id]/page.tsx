import { notFound, redirect } from "next/navigation";

import { WorkForm } from "../../work-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCompanyWorkItem } from "@/lib/db";

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
  const work = await getCompanyWorkItem(Number(id));

  if (!work) {
    notFound();
  }

  const query = await searchParams;

  return <WorkForm error={query.error} work={work} />;
}
