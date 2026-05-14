import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CargoHS54 - Выкуп товаров из Китая под ключ",
  description:
    "Профессиональный сервис выкупа и доставки товаров из Китая. Прямые закупки с Taobao, 1688, Tmall. Прозрачные цены и быстрая доставка.",
  keywords: [
    "CargoHS54",
    "выкуп товаров из Китая",
    "доставка из Китая",
    "Taobao",
    "1688",
    "закупки из Китая",
  ],
  authors: [{ name: "CargoHS54" }],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "CargoHS54 - Выкуп товаров из Китая",
    description: "Профессиональный сервис выкупа и доставки товаров из Китая под ключ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
