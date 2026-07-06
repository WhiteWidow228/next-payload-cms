import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}