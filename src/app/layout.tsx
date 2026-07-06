import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://next-payload-cms-beige.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Core Devs",
  title: {
    default: "Веб-студия в Крыму | Core Devs",
    template: "%s | Core Devs",
  },
  description: "Core Devs - веб-студия: сайты, Telegram-боты, интернет-магазины и веб-приложения для бизнеса.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Core Devs",
  },
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