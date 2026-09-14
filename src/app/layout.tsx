import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "CargoHS54 — Грузоперевозки Китай → Россия",
    template: "%s · CargoHS54",
  },
  description:
    "Надёжные грузоперевозки и выкуп товаров из Китая в Россию: отслеживание заказов, консолидация грузов, личный кабинет и прозрачные цены.",
  keywords: [
    "грузоперевозки из Китая",
    "карго Китай Россия",
    "выкуп товаров",
    "доставка из Китая",
    "Новосибирск",
  ],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/images/logo-icon.png" }],
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "CargoHS54",
    title: "CargoHS54 — Грузоперевозки Китай → Россия",
    description:
      "Выкуп товаров и доставка грузов из Китая: личный кабинет, отслеживание статусов, консолидация заказов.",
    images: [{ url: "/images/hero-bg-v8.png", width: 1200, height: 630, alt: "CargoHS54" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CargoHS54 — Грузоперевозки Китай → Россия",
    description: "Выкуп товаров и доставка грузов из Китая в Россию.",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
