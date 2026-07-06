import { redirect } from "next/navigation";

import { WorkForm } from "../../work-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function NewWorkPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const params = await searchParams;

  return <WorkForm error={params.error} />;
}
