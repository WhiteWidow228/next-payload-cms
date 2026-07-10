import { readdir, stat } from "fs/promises";
import path from "path";

import { listMediaAssets } from "@/lib/db";

export type MediaLibraryItem = {
  id: string;
  name: string;
  src: string;
  mimeType: string;
  size: number;
  source: "static" | "uploaded";
  createdAt?: string;
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function getMimeType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

async function listStaticMediaItems(): Promise<MediaLibraryItem[]> {
  const assetsDir = path.join(process.cwd(), "public", "assets");

  try {
    const entries = await readdir(assetsDir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()));

    return Promise.all(
      files.map(async (file) => {
        const fileStat = await stat(path.join(assetsDir, file.name));

        return {
          id: `static-${file.name}`,
          name: file.name,
          src: `/assets/${file.name}`,
          mimeType: getMimeType(file.name),
          size: fileStat.size,
          source: "static" as const,
        };
      }),
    );
  } catch {
    return [];
  }
}

export async function listMediaLibraryItems(): Promise<MediaLibraryItem[]> {
  const [staticItems, uploadedItems] = await Promise.all([
    listStaticMediaItems(),
    listMediaAssets().catch(() => []),
  ]);

  return [
    ...uploadedItems.map((asset) => ({
      id: `uploaded-${asset.id}`,
      name: asset.fileName,
      src: asset.src,
      mimeType: asset.mimeType,
      size: asset.sizeBytes,
      source: "uploaded" as const,
      createdAt: asset.createdAt,
    })),
    ...staticItems,
  ];
}