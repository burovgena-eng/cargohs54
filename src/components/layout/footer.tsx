"use client";

import { Package, Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import type { AppView } from "@/stores/app-store";

const CURRENT_YEAR = new Date().getFullYear();

const serviceLinks: { label: string; userView: AppView; guestView: AppView }[] = [
  { label: "Выкуп товаров", userView: "order-create", guestView: "register" },
  { label: "Доставка грузов", userView: "order-create", guestView: "register" },
  { label: "Консолидация заказов", userView: "order-create", guestView: "register" },
];

export function Footer() {
  const { setView, user } = useAppStore();

  return (
    <footer className="border-t border-border bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* ── Columns grid ── */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* ── Company Info ── */}
          <div className="space-y-4">
            <button
              onClick={() => setView("landing")}
              className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                <Package className="h-4.5 w-4.5" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-emerald-600 dark:text-emerald-400">Cargo</span>
                <span className="text-muted-foreground">HS54</span>
              </span>
            </button>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Профессиональный сервис выкупа и доставки товаров из Китая.
              Надёжность, скорость и прозрачные цены.
            </p>
            <p className="text-xs font-medium tracking-wide text-muted-foreground/70">
              Ваш надёжный партнёр по доставке из Китая
            </p>
          </div>

          {/* ── Services ── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Услуги
            </h3>
            <ul className="space-y-2.5 text-sm">
              {serviceLinks.map((service) => (
                <li key={service.label}>
                  <button
                    onClick={() =>
                      setView(user ? service.userView : service.guestView)
                    }
                    className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {service.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Information ── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Информация
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    setView("landing");
                    // Use requestAnimationFrame + delay for reliable scroll after view mount
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                      }, 150);
                    });
                  }}
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Как это работает
                </button>
              </li>
              {user ? (
                <>
                  <li>
                    <button
                      onClick={() => setView("order-create")}
                      className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Создать заявку
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setView(
                          user.role === "ADMIN"
                            ? "admin-dashboard"
                            : "client-dashboard"
                        )
                      }
                      className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Мои заказы
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      onClick={() => setView("register")}
                      className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Зарегистрироваться
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setView("login")}
                      className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Войти в кабинет
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* ── Contacts ── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Контакты
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:+79991234567"
                  className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 -mx-2 transition-colors hover:bg-emerald-500/10"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium tabular-nums text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">+7 (999) 123-45-67</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@cargohs54.ru"
                  className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 -mx-2 transition-colors hover:bg-emerald-500/10"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">info@cargohs54.ru</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 px-2 py-1.5 -mx-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span className="text-muted-foreground leading-relaxed">
                  Новосибирск, ул. Советская, д.&nbsp;44
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom separator ── */}
        <div className="border-t border-border my-8" />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground/70">
            &copy; {CURRENT_YEAR} CargoHS54. Все права защищены.
          </p>

          {/* Social / messaging icons */}
          <div className="flex items-center gap-1">
            <a
              href="https://t.me/cargohs54"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="group flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Send className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/79991234567"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="group flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href="mailto:info@cargohs54.ru"
              aria-label="Email"
              className="group flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground/70">
            Выкуп и доставка товаров из Китая
          </p>
        </div>
      </div>
    </footer>
  );
}
