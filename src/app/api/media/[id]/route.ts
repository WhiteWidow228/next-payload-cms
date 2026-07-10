import { NextResponse } from "next/server";

import { getMediaAsset } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  try {
    const asset = await getMediaAsset(numericId);

    if (!asset) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const body = Uint8Array.from(asset.content).buffer;

    return new NextResponse(body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(asset.fileName)}`,
        "Content-Length": String(asset.sizeBytes),
        "Content-Type": asset.mimeType,
      },
    });
  } catch {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }
}