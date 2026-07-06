"use server";

import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createCompanyWorkItem,
  deleteCompanyWorkItem,
  updateCompanyWorkItem,
  type CompanyWorkInput,
} from "@/lib/db";

function parseList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTeamMembers(value: FormDataEntryValue | null) {
  return parseList(value).map((name, index) => ({
    name,
    avatar: `/assets/avatar-${(index % 6) + 1}.png`,
  }));
}

function parseWorkInput(formData: FormData): CompanyWorkInput {
  return {
    title: String(formData.get("title") || "").trim(),
    summary: String(formData.get("summary") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    timeTaken: String(formData.get("timeTaken") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    imageAlt: String(formData.get("imageAlt") || "").trim(),
    technologies: parseList(formData.get("technologies")),
    teamMembers: parseTeamMembers(formData.get("teamMembers")),
    ctaLabel: String(formData.get("ctaLabel") || "Рассчитать смету").trim(),
    sortOrder: Number(formData.get("sortOrder") || 0),
  };
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function saveWorkAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id") || 0);
  const input = parseWorkInput(formData);

  if (!input.title || !input.summary) {
    redirect(id ? `/admin/work/${id}?error=required` : "/admin/work/new?error=required");
  }

  if (id > 0) {
    await updateCompanyWorkItem(id, input);
  } else {
    await createCompanyWorkItem(input);
  }

  redirect("/admin");
}

export async function deleteWorkAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id") || 0);

  if (id > 0) {
    await deleteCompanyWorkItem(id);
  }

  redirect("/admin");
}