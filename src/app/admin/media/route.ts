import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createMediaAsset } from "@/lib/db";
import { listMediaLibraryItems, type MediaLibraryItem } from "@/lib/media-library";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sanitizeFileName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

  return normalized || `image-${Date.now()}`;
}

function toLibraryItem(asset: Awaited<ReturnType<typeof createMediaAsset>>): MediaLibraryItem {
  return {
    id: `uploaded-${asset.id}`,
    name: asset.fileName,
    src: asset.src,
    mimeType: asset.mimeType,
    size: asset.sizeBytes,
    source: "uploaded",
    createdAt: asset.createdAt,
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ assets: await listMediaLibraryItems() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не найден." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Можно загружать только изображения JPG, PNG, WEBP или GIF." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "Картинка слишком тяжелая. Максимум 5 МБ." }, { status: 400 });
  }

  const asset = await createMediaAsset({
    fileName: sanitizeFileName(file.name),
    mimeType: file.type,
    sizeBytes: file.size,
    content: Buffer.from(await file.arrayBuffer()),
  });

  return NextResponse.json({ asset: toLibraryItem(asset) }, { status: 201 });
}