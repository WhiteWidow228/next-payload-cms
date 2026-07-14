import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { redirectSeeOther } from "@/lib/http-response";

export const runtime = "nodejs";

export async function POST() {
  const response = redirectSeeOther("/admin/login");

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
