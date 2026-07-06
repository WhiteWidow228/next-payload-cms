import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  getAdminCookieOptions,
  isAdminAuthConfigured,
} from "@/lib/admin-auth";
import { authenticateAdminUser, getDatabaseErrorMessage } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const login = String(formData.get("login") || "").trim();
  const password = String(formData.get("password") || "");

  if (!isAdminAuthConfigured()) {
    return NextResponse.redirect(new URL("/admin/login?error=setup", request.url), { status: 303 });
  }

  try {
    const user = await authenticateAdminUser(login, password);

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
    }

    const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
    response.cookies.set(ADMIN_COOKIE_NAME, createAdminToken(user), getAdminCookieOptions());

    return response;
  } catch (error) {
    console.error("[admin] Failed to authenticate user", getDatabaseErrorMessage(error));
    return NextResponse.redirect(new URL("/admin/login?error=db", request.url), { status: 303 });
  }
}