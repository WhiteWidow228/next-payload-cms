import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  getAdminCookieOptions,
  getAdminCredentials,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const login = String(formData.get("login") || "").trim();
  const password = String(formData.get("password") || "");
  const credentials = getAdminCredentials();

  if (!credentials.password || login !== credentials.login || password !== credentials.password) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminToken(), getAdminCookieOptions());

  return response;
}