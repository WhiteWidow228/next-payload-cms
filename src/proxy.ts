import { NextResponse, type NextRequest } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60 * 1000;
const buckets = new Map<string, Bucket>();

const LIMITS = {
  admin: 40,
  leads: 10,
  api: 80,
  pagespeed: 1000,
  default: 180,
};
const PAGESPEED_USER_AGENT = /Chrome-Lighthouse|PageSpeed Insights|Google Page Speed Insights/i;

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();

  return forwardedFor || realIp || vercelIp || "unknown";
}

function getRequestGroup(request: NextRequest): keyof typeof LIMITS {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  if (pathname === "/api/quiz-leads") {
    return "leads";
  }

  if (pathname.startsWith("/api")) {
    return "api";
  }

  if (PAGESPEED_USER_AGENT.test(request.headers.get("user-agent") || "")) {
    return "pagespeed";
  }

  return "default";
}

function cleanupBuckets(now: number) {
  if (buckets.size < 2000) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export function proxy(request: NextRequest) {
  const now = Date.now();
  const group = getRequestGroup(request);
  const limit = LIMITS[group];
  const ip = getClientIp(request);
  const key = `${ip}:${group}`;
  const current = buckets.get(key);

  cleanupBuckets(now);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return applySecurityHeaders(NextResponse.next());
  }

  current.count += 1;

  if (current.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));

    return applySecurityHeaders(
      new NextResponse("Too many requests", {
        headers: {
          "Retry-After": String(retryAfter),
        },
        status: 429,
      }),
    );
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/).*)"],
};
