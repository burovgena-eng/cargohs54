"use client";

import { ShieldCheck, FileText, Scale, Truck, Clock, AlertTriangle, CheckCircle2, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/app-store";

export function CustomsView() {
  const { user, setView } = useAppStore();

  const steps = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Сбор документов",
      desc: "Собираем и проверяем все необходимые документы: инвойсы, сертификаты, лицензии.",
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Таможенная декларация",
      desc: "Оформляем декларацию на товары (ДТ) с правильной классификацией по ТН ВЭД.",
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Таможенная очистка",
      desc: "Пропускаем груз через таможню, оплачиваем пошлины и сборы.",
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Выпуск в свободное обращение",
      desc: "Получаем отметку таможни и передаём груз для дальнейшей доставки.",
    },
  ];

  const categories = [
    "Товары для личного пользования",
    "Коммерческие партии (ИП, ООО)",
    "Образцы и каталоги",
    "Электроника и техника",
    "Одежда и обувь",
    "Запчасти и комплектующие",
    "Строительные материалы",
    "Любые другие категории товаров",
  ];

  const importantNotes = [
    "Для таможенного оформления необходимы паспортные данные получателя",
    "Точная классификация товара по ТН ВЭД влияет на размер пошлины",
    "Некоторые товары требуют обязательной сертификации (EAC, пожарный сертификат и др.)",
    "Мы уведомим вас о необходимости дополнительных документов заранее",
    "Все таможенные платежи (пошлины, НДС, сборы) оплачиваются отдельно",
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
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
                Таможенное оформление
              </h1>
            </div>
          </div>

          <p className="text-neutral-500 max-w-2xl leading-relaxed text-base md:text-lg">
            Полное сопровождение таможенных процедур при импорте товаров из Китая.{" "}
            Мы берём на себя всю бюрократию — от декларации до получения груза.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* ── How it works ── */}
        <section className="py-12 md:py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-1">Процесс</p>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">Как это работает</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <Card
                key={i}
                className="border border-neutral-200/60 rounded-2xl shadow-sm bg-white"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 shrink-0">
                      {step.icon}
                    </div>
                    <span className="text-xs font-semibold text-neutral-500 rounded-full bg-neutral-100 px-2.5 py-1 tracking-wide">
                      ШАГ {i + 1}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2 text-neutral-900">{step.title}</CardTitle>
                  <p className="text-sm text-neutral-600 leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── What we handle + Pricing ── */}
        <section className="py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What we handle */}
            <Card className="border border-neutral-200/60 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  Что мы оформляем
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

            {/* Pricing & timelines */}
            <Card className="border border-neutral-200/60 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  Сроки и стоимость
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-200/60">
                    <p className="text-sm font-semibold text-neutral-900 mb-1">Стандартное оформление</p>
                    <p className="text-xs text-neutral-600 leading-relaxed">1–3 рабочих дня с момента прибытия груза</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-200/60">
                    <p className="text-sm font-semibold text-neutral-900 mb-1">Срочное оформление</p>
                    <p className="text-xs text-neutral-600 leading-relaxed">В день прибытия (доплата за срочность)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-200/60">
                    <p className="text-sm font-semibold text-neutral-900 mb-1">Стоимость</p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Рассчитывается индивидуально в зависимости от категории товара,
                      веса, стоимости и объёма партии. Свяжитесь с нами для точного расчёта.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* ── Important notes ── */}
        <section className="py-12 md:py-16">
          <div className="rounded-2xl border border-neutral-200/60 bg-neutral-50/50 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Важно знать</h3>
              </div>
              <ul className="space-y-3">
                {importantNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-neutral-600 leading-relaxed">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200/60 text-neutral-500 text-[10px] font-bold mt-0.5 shrink-0">
                      {i + 1}
                    </span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
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
                  Остались вопросы по таможенному оформлению?
                </h3>
                <p className="text-neutral-500 mb-8 max-w-md mx-auto leading-relaxed">
                  Наши специалисты готовы помочь с расчётом стоимости и ответить на все вопросы
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
                  Создать заявку на доставку
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
