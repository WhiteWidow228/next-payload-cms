import { NextRequest } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  getAdminCookieOptions,
  isAdminAuthConfigured,
} from "@/lib/admin-auth";
import { authenticateAdminUser, getDatabaseErrorMessage } from "@/lib/db";
import { redirectSeeOther } from "@/lib/http-response";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const login = String(formData.get("login") || "").trim();
  const password = String(formData.get("password") || "");

  if (!isAdminAuthConfigured()) {
    return redirectSeeOther("/admin/login?error=setup");
  }

  try {
    const user = await authenticateAdminUser(login, password);

    if (!user) {
      return redirectSeeOther("/admin/login?error=1");
    }

    const response = redirectSeeOther("/admin");
    response.cookies.set(ADMIN_COOKIE_NAME, createAdminToken(user), getAdminCookieOptions());

    return response;
  } catch (error) {
    console.error("[admin] Failed to authenticate user", getDatabaseErrorMessage(error));
    return redirectSeeOther("/admin/login?error=db");
  }
}
