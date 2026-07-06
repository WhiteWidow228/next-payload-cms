import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { getAdminUserById, type AdminUser } from "@/lib/db";

export const ADMIN_COOKIE_NAME = "core_devs_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_VERSION = 3;

type AdminSessionPayload = {
  sub?: string;
  uid?: number;
  login?: string;
  exp?: number;
  ver?: number;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "local-dev-session-secret";
  }

  return "";
}

function sign(value: string) {
  const secret = getSecret();

  if (!secret) {
    return "";
  }

  return createHmac("sha256", secret).update(value).digest("base64url");
}

function verifySignature(value: string, signature: string) {
  const expected = sign(value);

  if (!expected) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function isAdminAuthConfigured() {
  return Boolean(getSecret());
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    maxAge: MAX_AGE_SECONDS,
    path: "/admin",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function createAdminToken(user: Pick<AdminUser, "id" | "login">) {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const sessionPayload = Buffer.from(
    JSON.stringify({ sub: "admin", uid: user.id, login: user.login, exp: expiresAt, ver: SESSION_VERSION }),
  ).toString("base64url");
  const signature = sign(sessionPayload);

  if (!signature) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  return `${sessionPayload}.${signature}`;
}

async function getSessionUserFromToken(token?: string) {
  if (!token) {
    return null;
  }

  const [sessionPayload, signature] = token.split(".");

  if (!sessionPayload || !signature || !verifySignature(sessionPayload, signature)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(sessionPayload, "base64url").toString("utf8")) as AdminSessionPayload;

    if (
      session.sub !== "admin" ||
      session.ver !== SESSION_VERSION ||
      typeof session.uid !== "number" ||
      typeof session.exp !== "number" ||
      session.exp <= Date.now()
    ) {
      return null;
    }

    const user = await getAdminUserById(session.uid);

    if (!user?.isActive) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();

  return getSessionUserFromToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function isAdminAuthenticated() {
  return Boolean(await getCurrentAdminUser());
}