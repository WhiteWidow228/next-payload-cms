"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteQuizLead, updateQuizLeadStatus, type QuizLeadStatus } from "@/lib/db";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function updateQuizLeadStatusAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id") || 0);
  const requestedStatus = String(formData.get("status") || "");
  const status: QuizLeadStatus = requestedStatus === "processed" ? "processed" : "new";

  if (id > 0) {
    await updateQuizLeadStatus(id, status);
  }

  revalidatePath("/admin/leads");
}

export async function deleteQuizLeadAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id") || 0);

  if (id > 0) {
    await deleteQuizLead(id);
  }

  revalidatePath("/admin/leads");
}
