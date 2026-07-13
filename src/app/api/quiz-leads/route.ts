import { NextResponse, type NextRequest } from "next/server";

import { createQuizLead } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONSENT_VERSION = "2026-07-13";
const PROJECT_TYPES = new Set(["landing", "corporate", "ecommerce", "web-app", "telegram-bot", "design"]);
const BUDGETS = new Set(["up-to-50", "50-100", "100-250", "250-plus", "need-estimate"]);
const TIMELINES = new Set(["asap", "one-month", "two-three-months", "flexible"]);

type LeadRequest = {
  projectType?: unknown;
  budget?: unknown;
  timeline?: unknown;
  contact?: unknown;
  sourcePath?: unknown;
  consent?: unknown;
  consentVersion?: unknown;
  website?: unknown;
};

function isValidContact(value: string) {
  const phoneDigits = value.replace(/\D/g, "");
  const telegram = /^@?[a-zA-Z0-9_]{5,32}$/.test(value) || /^https?:\/\/(?:t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32}\/?$/i.test(value);

  return phoneDigits.length >= 10 || telegram;
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > 20_000) {
    return NextResponse.json({ error: "Слишком большой запрос." }, { status: 413 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }

  let body: LeadRequest;

  try {
    body = (await request.json()) as LeadRequest;
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса." }, { status: 400 });
  }

  if (String(body.website || "").trim()) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const projectType = String(body.projectType || "").trim();
  const budget = String(body.budget || "").trim();
  const timeline = String(body.timeline || "").trim();
  const contact = String(body.contact || "").trim().slice(0, 100);
  const sourcePath = String(body.sourcePath || "/").trim().slice(0, 160);
  const consentVersion = String(body.consentVersion || "").trim();

  if (
    !PROJECT_TYPES.has(projectType) ||
    !BUDGETS.has(budget) ||
    !TIMELINES.has(timeline) ||
    !isValidContact(contact) ||
    body.consent !== true ||
    consentVersion !== CONSENT_VERSION ||
    !sourcePath.startsWith("/")
  ) {
    return NextResponse.json({ error: "Проверьте ответы и согласие на обработку данных." }, { status: 400 });
  }

  try {
    const id = await createQuizLead({ projectType, budget, timeline, contact, sourcePath, consentVersion });

    return NextResponse.json({ id, ok: true }, { status: 201 });
  } catch (error) {
    console.error("[quiz-leads] Failed to save lead", error);

    return NextResponse.json({ error: "Не удалось сохранить заявку." }, { status: 500 });
  }
}
