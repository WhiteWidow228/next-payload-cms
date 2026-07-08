import type { Metadata } from "next";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Админка Core Devs",
  description: "Управление блоком работ компании.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
