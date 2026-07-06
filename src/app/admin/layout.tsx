import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админка Core Devs",
  description: "Управление блоком работ компании.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
