import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CargoHS54 — Грузоперевозки Китай → Россия",
    short_name: "CargoHS54",
    description:
      "Выкуп товаров и доставка грузов из Китая в Россию: личный кабинет, отслеживание заказов, консолидация.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    lang: "ru",
    icons: [
      {
        src: "/images/logo-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  };
}
