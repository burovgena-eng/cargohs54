"use client";

import { Package, Boxes, Warehouse, Truck, DollarSign, CheckCircle2, ArrowLeft, BarChart3, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/app-store";

export function ConsolidationView() {
  const { user, setView } = useAppStore();

  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Экономия до 60%",
      desc: "Один общий груз вместо нескольких отдельных доставок. Меньше затрат на логистику.",
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Безопасная упаковка",
      desc: "Пересобираем груз в надёжную тару. Убираем лишние упаковки магазинов для экономии объёма.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Контроль веса",
      desc: "Фотографируем и взвешиваем каждый товар. Полная прозрачность — вы знаете, за что платите.",
    },
    {
      icon: <Warehouse className="h-6 w-6" />,
      title: "Бесплатное хранение",
      desc: "Храним ваши товары на складе в Китае до 30 дней бесплатно. Ждём, пока соберутся все заказы.",
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Гибкая отправка",
      desc: "Отправляем консолидированный груз когда вам удобно — раз в неделю, раз в месяц или по запросу.",
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Полная отчётность",
      desc: "Предоставляем фотоотчёт упаковки, опись вложения и трек-номер для отслеживания.",
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Вы делаете заказы",
      desc: "Размещайте заказы в любых магазинах Китая — 1688, Taobao, Alibaba и других.",
    },
    {
      step: 2,
      title: "Товары поступают на склад",
      desc: "Каждый товар приезжает на наш склад в Китае. Мы принимаем и учитываем.",
    },
    {
      step: 3,
      title: "Мы собираем груз",
      desc: "Объединяем все ваши товары, пересобираем упаковку, взвешиваем и фотографируем.",
    },
    {
      step: 4,
      title: "Отправка в Россию",
      desc: "Отправляем консолидированный груз выбранным способом доставки.",
    },
  ];

  const categories = [
    "Одежда, обувь и аксессуары",
    "Электроника и бытовая техника",
    "Запчасти для автомобилей",
    "Строительные материалы и инструменты",
    "Товары для дома и кухни",
    "Детские товары и игрушки",
    "Косметика и парфюмерия",
    "Любые другие легальные товары",
  ];

  return (
    <div className="min-h-[60vh]">
      {/* ── Hero ── */}
      <section className="bg-white border-b border-neutral-200/60">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Button
            variant="ghost"
            className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 mb-8 -ml-2 transition-colors"
            onClick={() => setView(user ? (user.role === "ADMIN" ? "admin-dashboard" : "client-dashboard") : "landing")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 shrink-0">
              <Boxes className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
                Консолидация товаров
              </h1>
            </div>
          </div>

          <p className="text-neutral-500 max-w-2xl leading-relaxed text-base md:text-lg">
            Объединяем ваши заказы из разных магазинов Китая в одну посылку.{" "}
            Экономьте на доставке — платите за один груз вместо нескольких.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* ── Benefits ── */}
        <section className="py-12 md:py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-1">Почему мы</p>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">Преимущества консолидации</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((item, i) => (
              <Card
                key={i}
                className="border border-neutral-200/60 rounded-2xl shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 shrink-0">
                    {item.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2 text-neutral-900">{item.title}</CardTitle>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── How it works ── */}
        <section className="py-12 md:py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-1">Процесс</p>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">Как происходит консолидация</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {processSteps.map((item) => (
              <Card
                key={item.step}
                className="border border-neutral-200/60 rounded-2xl shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2 text-neutral-900">{item.title}</CardTitle>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Pricing + Categories ── */}
        <section className="py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing */}
            <Card className="border border-neutral-200/60 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  Стоимость консолидации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-200/60">
                    <p className="text-sm font-semibold text-neutral-900 mb-1">Базовая услуга</p>
                    <p className="text-xs text-neutral-600 leading-relaxed">Бесплатно — консолидация включена в стоимость доставки</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-200/60">
                    <p className="text-sm font-semibold text-neutral-900 mb-1">Дополнительная упаковка</p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      При необходимости — усиленная упаковка, коробки, пупырчатая плёнка.
                      Стоимость зависит от размеров.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-200/60">
                    <p className="text-sm font-semibold text-neutral-900 mb-1">Хранение на складе</p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Первые 30 дней — бесплатно. Далее 5 ¥/день за единицу товара.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What can be consolidated */}
            <Card className="border border-neutral-200/60 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  Что можно консолидировать
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-neutral-600">
                  {categories.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* ── CTA ── */}
        <section className="py-12 md:py-16 pb-20">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border border-neutral-200/60 rounded-2xl shadow-sm bg-white p-8 md:p-12">
              <CardContent className="p-0">
                <div className="flex justify-center mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                    <Info className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-900 tracking-tight">
                  Хотите объединить несколько заказов в один груз?
                </h3>
                <p className="text-neutral-500 mb-8 max-w-md mx-auto leading-relaxed">
                  Создайте заявку и мы поможем объединить все ваши покупки из Китая в одну надёжную доставку
                </p>
                <Button
                  size="lg"
                  className="px-8 py-6 text-base font-semibold"
                  onClick={() => {
                    if (user) {
                      setView("order-create");
                    } else {
                      setView("register");
                    }
                  }}
                >
                  Создать заявку
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
