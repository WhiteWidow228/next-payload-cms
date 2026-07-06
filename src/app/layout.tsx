import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Core Devs",
  description: "Студия разработки сайтов, Telegram-ботов и веб-приложений.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
