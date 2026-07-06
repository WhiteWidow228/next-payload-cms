import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "core_devs_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_VERSION = 2;

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

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

export function getAdminCredentials() {
  return {
    login: process.env.ADMIN_LOGIN || "admin",
    password: process.env.ADMIN_PASSWORD || "",
  };
}

export function isAdminAuthConfigured() {
  const credentials = getAdminCredentials();

  return Boolean(credentials.password && getSecret());
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

export function createAdminToken() {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const sessionPayload = Buffer.from(JSON.stringify({ sub: "admin", exp: expiresAt, ver: SESSION_VERSION })).toString("base64url");
  const signature = sign(sessionPayload);

  if (!signature) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  return `${sessionPayload}.${signature}`;
}

export function isValidAdminToken(token?: string) {
  if (!token) {
    return false;
  }

  const [sessionPayload, signature] = token.split(".");

  if (!sessionPayload || !signature || !verifySignature(sessionPayload, signature)) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(sessionPayload, "base64url").toString("utf8")) as {
      exp?: number;
      sub?: string;
      ver?: number;
    };

    return (
      session.sub === "admin" &&
      session.ver === SESSION_VERSION &&
      typeof session.exp === "number" &&
      session.exp > Date.now()
    );
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();

  return isValidAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}