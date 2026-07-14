import {
  ADMIN_COOKIE_NAME,
  LEGACY_ADMIN_COOKIE_NAME,
  getExpiredAdminCookieOptions,
} from "@/lib/admin-auth";
import { redirectSeeOther } from "@/lib/http-response";

export const runtime = "nodejs";

export async function POST() {
  const response = redirectSeeOther("/admin/login");

  response.cookies.set(ADMIN_COOKIE_NAME, "", getExpiredAdminCookieOptions());
  response.cookies.set(LEGACY_ADMIN_COOKIE_NAME, "", getExpiredAdminCookieOptions("/admin"));

  if (LEGACY_ADMIN_COOKIE_NAME !== ADMIN_COOKIE_NAME) {
    response.cookies.set(LEGACY_ADMIN_COOKIE_NAME, "", getExpiredAdminCookieOptions());
  }

  return response;
}
