"use server";

import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/passwords";
import {
  createAdminUser,
  createCompanyWorkItem,
  createProjectCategory,
  deleteAdminUser,
  deleteCompanyWorkItem,
  deleteProjectCategory,
  listProjectCategories,
  updateAdminUser,
  updateCompanyWorkItem,
  updateProjectCategory,
  type AdminUserInput,
  type CompanyWorkInput,
  type ProjectCategoryInput,
} from "@/lib/db";

const DEFAULT_CTA_LABEL = "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441\u043c\u0435\u0442\u0443";

const translitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function slugify(value: string, fallback = "item") {
  const slug = value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || fallback;
}

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

async function parseWorkInput(formData: FormData): Promise<CompanyWorkInput> {
  const title = String(formData.get("title") || "").trim();
  const requestedCategorySlug = slugify(String(formData.get("categorySlug") || "sites"), "sites");
  const categories = await listProjectCategories();
  const category = categories.find((item) => item.slug === requestedCategorySlug) || categories[0];

  return {
    slug: slugify(String(formData.get("slug") || title), `work-${Date.now()}`),
    title,
    summary: String(formData.get("summary") || "").trim(),
    category: category?.name || String(formData.get("category") || "").trim(),
    categorySlug: category?.slug || requestedCategorySlug,
    timeTaken: String(formData.get("timeTaken") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    imageAlt: String(formData.get("imageAlt") || "").trim(),
    technologies: parseList(formData.get("technologies")),
    teamMembers: parseTeamMembers(formData.get("teamMembers")),
    ctaLabel: String(formData.get("ctaLabel") || DEFAULT_CTA_LABEL).trim(),
    sortOrder: Number(formData.get("sortOrder") || 0),
  };
}

function parseCategoryInput(formData: FormData): ProjectCategoryInput {
  const name = String(formData.get("name") || "").trim();

  return {
    name,
    slug: slugify(String(formData.get("slug") || name), "category"),
    description: String(formData.get("description") || "").trim(),
    sortOrder: Number(formData.get("sortOrder") || 0),
  };
}


async function parseAdminUserInput(formData: FormData): Promise<{ input: AdminUserInput; password: string }> {
  const password = String(formData.get("password") || "");

  return {
    input: {
      login: String(formData.get("login") || "").trim().toLowerCase(),
      name: String(formData.get("name") || "").trim(),
      isActive: formData.get("isActive") === "on",
      passwordHash: password ? await hashPassword(password) : undefined,
    },
    password,
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
  const input = await parseWorkInput(formData);

  if (!input.title || !input.summary) {
    redirect(id ? `/admin/work/${id}?error=required` : "/admin/work/new?error=required");
  }

  try {
    if (id > 0) {
      await updateCompanyWorkItem(id, input);
    } else {
      await createCompanyWorkItem(input);
    }
  } catch {
    redirect(id ? `/admin/work/${id}?error=save` : "/admin/work/new?error=save");
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

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id") || 0);
  const input = parseCategoryInput(formData);

  if (!input.name || !input.slug) {
    redirect("/admin/categories?error=required");
  }

  try {
    if (id > 0) {
      await updateProjectCategory(id, input);
    } else {
      await createProjectCategory(input);
    }
  } catch {
    redirect("/admin/categories?error=save");
  }

  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id") || 0);

  if (id > 0) {
    await deleteProjectCategory(id);
  }

  redirect("/admin/categories");
}
export async function saveAdminUserAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id") || 0);
  const { input, password } = await parseAdminUserInput(formData);

  if (!input.login || (!id && !password) || (password && password.length < 6)) {
    redirect("/admin/users?error=required");
  }

  try {
    if (id > 0) {
      await updateAdminUser(id, input);
    } else {
      await createAdminUser(input);
    }
  } catch {
    redirect("/admin/users?error=save");
  }

  redirect("/admin/users");
}

export async function deleteAdminUserAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id") || 0);

  try {
    if (id > 0) {
      await deleteAdminUser(id);
    }
  } catch {
    redirect("/admin/users?error=save");
  }

  redirect("/admin/users");
}