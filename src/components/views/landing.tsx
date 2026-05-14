"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Package,
  ShoppingCart,
  Truck,
  Headphones,
  ArrowRight,
  Shield,
  Globe,
  BarChart3,
  Star,
  MapPin,
  Clock,
  Heart,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/stores/app-store";

/* ─── Animation Variants ─── */

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Data ─── */

const features = [
  {
    icon: ShoppingCart,
    title: "Прямые закупки",
    description: "Выкупаем товары напрямую с Taobao, 1688, Tmall и других маркетплейсов — без посредников и переплат.",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Shield,
    title: "Прозрачные цены",
    description: "Полная стоимость рассчитывается до оплаты. Никаких скрытых комиссий и неожиданных доплат.",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  {
    icon: BarChart3,
    title: "Оптовые цены",
    description: "Специальные условия для постоянных клиентов. Чем больше заказ — тем ниже цена за единицу.",
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: Truck,
    title: "Быстрая доставка",
    description: "Оптимизированные маршруты и регулярные отправки — средний срок доставки от 14 дней до вашего города.",
    gradient: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-500/20",
  },
];

const steps = [
  {
    number: "01",
    title: "Оставьте заявку",
    description: "Заполните форму с ссылкой на товар из китайского магазина. Мы проверим наличие и стоимость за 15 минут.",
    icon: ShoppingCart,
  },
  {
    number: "02",
    title: "Рассчитаем стоимость",
    description: "Укажем точную цену товара, стоимость доставки и таможенного оформления. Вы оплачиваете удобным способом.",
    icon: BarChart3,
  },
  {
    number: "03",
    title: "Доставка под ключ",
    description: "Купим, проверим качество, упакуем и доставим до двери. Отслеживайте груз онлайн в реальном времени.",
    icon: Truck,
  },
];

const stats = [
  { value: "5 000+", label: "Доставленных заказов", icon: Package },
  { value: "98%", label: "Довольных клиентов", icon: Heart },
  { value: "20", label: "Дней средняя доставка", icon: Clock },
  { value: "50+", label: "Партнёров в Китае", icon: Globe },
];

const testimonials = [
  {
    name: "Тимур А.",
    role: "Владелец магазина",
    city: "Новосибирск",
    text: "Заказываю партии товаров для своего магазина через CargoHS54 уже год. Всегда вовремя, качество отличное, цены значительно ниже конкурентов.",
    rating: 5,
  },
  {
    name: "Мария С.",
    role: "Интернет-магазин",
    city: "Екатеринбург",
    text: "Купили партию одежды из 1688. Проверили каждую вещь, всё пришло в идеальном состоянии. Менеджер всегда на связи — рекомендую!",
    rating: 5,
  },
  {
    name: "Дмитрий В.",
    role: "Оптовый клиент",
    city: "Москва",
    text: "Работа на высшем уровне. Любые вопросы решаются быстро, отслеживание груза прозрачное. Экономия по сравнению с аналогами — огромная.",
    rating: 5,
  },
];

const cities = [
  "Москва", "Новосибирск", "Екатеринбург", "Казань",
  "Краснодар", "Самара", "Ростов-на-Дону", "Челябинск",
];

/* ─── Component ─── */

export function LandingView() {
  const { user, setView } = useAppStore();
  const isAuthenticated = !!user;

  return (
    <div className="flex flex-col">
      {/* ════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-mesh-hero">
        {/* Decorative blurred orbs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text content */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="max-w-xl"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} custom={0} className="mb-8">
                <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white/80">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Надёжная доставка из Китая с 2020 года
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeInUp}
                custom={1}
                className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Выкуп товаров
                <br />
                из Китая{" "}
                <span className="text-gradient">под ключ</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                custom={2}
                className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400 md:text-xl"
              >
                Закупаем, проверяем качество и доставляем товары с китайских маркетплейсов
                в любую точку России. Экономия до 70% на оптовых закупках.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeInUp}
                custom={3}
                className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
              >
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    onClick={() =>
                      setView(
                        user.role === "ADMIN"
                          ? "admin-dashboard"
                          : "client-dashboard"
                      )
                    }
                    className="group h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-8 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:brightness-110"
                  >
                    {user.role === "ADMIN"
                      ? "Панель управления"
                      : "Мои заявки"}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => setView("order-create")}
                      className="group h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-8 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:brightness-110"
                    >
                      Создать заявку
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => setView("login")}
                      className="h-13 rounded-2xl border border-white/15 bg-transparent px-8 text-base text-white/70 transition-all hover:bg-white/10 hover:border-white/25"
                    >
                      Войти в кабинет
                    </Button>
                  </>
                )}
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeInUp}
                custom={4}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                {[
                  { icon: Shield, text: "С 2020 года" },
                  { icon: Package, text: "5 000+ заказов" },
                  { icon: Star, text: "Рейтинг 4.9" },
                ].map((badge) => (
                  <div
                    key={badge.text}
                    className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white/50"
                  >
                    <badge.icon className="h-3 w-3 text-emerald-400/60" />
                    {badge.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Hero illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Glow effect behind the image */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-2xl" />

                {/* Image card with glass border */}
                <div className="glass relative rounded-3xl p-2">
                  <div className="overflow-hidden rounded-2xl">
                    <Image
                      src="/images/hero-bg-v8.png"
                      alt="Доставка грузов из Китая в Россию"
                      width={1344}
                      height={768}
                      className="h-auto w-full object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Inline stat bar below the image */}
                <div className="glass mt-3 flex items-center justify-around rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20">
                      <Truck className="h-4.5 w-4.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] leading-none text-white/50">Грузов в пути</p>
                      <p className="mt-0.5 text-base font-bold text-white">156</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20">
                      <Zap className="h-4.5 w-4.5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[11px] leading-none text-white/50">Среднее время</p>
                      <p className="mt-0.5 text-base font-bold text-white">20 дней</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade to match soft background */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#EAEEEB] dark:from-[#111614] to-transparent" />
      </section>

      {/* ════════════════════════════════════════════
          STATS SECTION
      ════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-16 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#D1D7D3]/60 dark:border-white/10 bg-[#F3F5F2] dark:bg-[#1A201D] p-2 shadow-xl shadow-black/5 dark:shadow-black/20"
          >
            <div className="rounded-2xl bg-gradient-to-br from-[#E4E8E5] to-[#F3F5F2] dark:from-[#1A201D] dark:to-[#252B28] px-6 py-8 md:px-8 md:py-10">
              <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeInUp}
                    custom={i}
                    className={`flex flex-col items-center px-4 py-6 text-center ${
                      i < stats.length - 1
                        ? "border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/10"
                        : ""
                    }`}
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-mesh-light">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-14 max-w-2xl"
          >
            <motion.p
              variants={fadeInUp}
              custom={0}
              className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400"
            >
              Преимущества
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl"
            >
              Почему выбирают CargoHS54
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-4 text-lg text-slate-500 dark:text-slate-400"
            >
              Полный цикл услуг по закупке и доставке товаров из Китая — от заявки до двери
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
          >
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={scaleIn} custom={i}>
                <Card className="group h-full overflow-hidden border-0 bg-white dark:bg-[#1A201D] shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/30">
                  <CardContent className="relative flex flex-col gap-4 p-6 sm:p-8">
                    {/* Gradient accent line at top */}
                    <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${feature.gradient}`} />

                    <div className={`mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg ${feature.shadow} transition-transform duration-300 group-hover:scale-110`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>

                    {/* Decorative accent line at bottom */}
                    <div className="mt-auto h-0.5 w-8 rounded-full bg-gradient-to-r from-emerald-300 to-teal-300 dark:from-emerald-700 dark:to-teal-700 transition-all duration-300 group-hover:w-16" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 md:py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-14 text-center"
          >
            <motion.p
              variants={fadeInUp}
              custom={0}
              className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400"
            >
              Процесс
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl"
            >
              Как это работает
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mx-auto mt-4 max-w-lg text-lg text-slate-500 dark:text-slate-400"
            >
              Три простых шага от заявки до получения товара
            </motion.p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Left: Steps */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="order-1 space-y-6 lg:order-1"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={fadeInUp}
                  custom={index}
                  className="group relative flex gap-5"
                >
                  {/* Step number with connecting line */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-transform duration-300 group-hover:scale-110">
                      <step.icon className="h-5 w-5" />
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-[#252B28] text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800/40">
                        {step.number}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="mt-2 h-full w-0.5 bg-gradient-to-b from-emerald-200 to-transparent min-h-[40px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="pt-4"
              >
                <Button
                  size="lg"
                  onClick={() => setView("order-create")}
                  className="group h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110"
                >
                  Начать сейчас
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative order-2 lg:order-2"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-100/50 to-teal-100/30 dark:from-emerald-900/20 dark:to-teal-900/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-white dark:bg-[#1A201D] p-2 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                  <Image
                    src="/images/delivery-illustration.png"
                    alt="Процесс доставки"
                    width={1024}
                    height={1024}
                    className="h-auto w-full rounded-2xl"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SHOPPING / MARKETPLACES SECTION
      ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-mesh-light">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Left: Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-100/40 to-orange-100/20 dark:from-amber-900/20 dark:to-orange-900/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-white dark:bg-[#1A201D] p-2 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                <Image
                  src="/images/shopping-illustration.png"
                  alt="Шопинг из Китая"
                  width={1024}
                  height={1024}
                  className="h-auto w-full rounded-2xl"
                />
              </div>
            </motion.div>

            {/* Right: Text + platform badges */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.p
                variants={fadeInUp}
                custom={0}
                className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400"
              >
                Маркетплейсы
              </motion.p>
              <motion.h2
                variants={fadeInUp}
                custom={1}
                className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl"
              >
                Работаем со всеми
                <br />
                <span className="text-gradient">крупнейшими</span> площадками
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                custom={2}
                className="mt-4 text-lg leading-relaxed text-slate-500 dark:text-slate-400"
              >
                Мы закупаем товары с любого китайского маркетплейса. Просто отправьте нам ссылку — мы сделаем всё остальное.
              </motion.p>

              {/* Platform badges */}
              <motion.div
                variants={fadeInUp}
                custom={3}
                className="mt-8 flex flex-wrap gap-3"
              >
                {[
                  { name: "Taobao", color: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40" },
                  { name: "1688", color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40" },
                  { name: "Tmall", color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40" },
                  { name: "Pinduoduo", color: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40" },
                  { name: "POIZON", color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/40" },
                  { name: "JD.com", color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40" },
                ].map((platform) => (
                  <span
                    key={platform.name}
                    className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold ${platform.color} transition-transform hover:scale-105`}
                  >
                    {platform.name}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-14 max-w-2xl"
          >
            <motion.p
              variants={fadeInUp}
              custom={0}
              className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400"
            >
              Отзывы
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl"
            >
              Нам доверяют клиенты
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-4 text-lg text-slate-500 dark:text-slate-400"
            >
              Более 5 000 успешных доставок по всей России
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-3"
          >
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={scaleIn} custom={i}>
                <Card className="group h-full overflow-hidden border-0 bg-white dark:bg-[#1A201D] shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/30">
                  <CardContent className="relative flex flex-col gap-4 p-6">
                    {/* Gradient accent */}
                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />

                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
                      &ldquo;{t.text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 border-t border-slate-100 dark:border-white/10 pt-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md shadow-emerald-500/20">
                        {t.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {t.name}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {t.role} · {t.city}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          MARQUEE — Cities strip
      ════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 dark:border-white/10 bg-gradient-to-r from-[#E4E8E5] to-[#EAEEEB] dark:from-[#1A201D] dark:to-[#151A17] overflow-hidden py-5">
        <div className="flex items-center gap-3">
          <span className="shrink-0 pl-6 pr-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Нам доверяют клиенты из
          </span>
          <div className="relative flex min-w-0 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-[#EAEEEB] dark:from-[#151A17] to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-[#EAEEEB] dark:from-[#151A17] to-transparent" />
            <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap">
              {[...cities, ...cities].map((city, i) => (
                <span
                  key={`${city}-${i}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400"
                >
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-mesh-hero p-[2px]"
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-gradient opacity-50" />

            <div className="relative overflow-hidden rounded-[22px] bg-mesh-hero">
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 animate-shimmer" />

              {/* Decorative orbs */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/20 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-teal-500/15 blur-[80px]" />

              <div className="relative z-10 px-6 py-14 text-center sm:px-12 sm:py-20 md:px-20 md:py-24">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white/80">
                  <Headphones className="h-4 w-4 text-emerald-400" />
                  Бесплатная консультация
                </div>

                <h2 className="text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
                  {isAuthenticated
                    ? "Готовы оформить новый заказ?"
                    : "Готовы начать экономить?"}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                  {isAuthenticated
                    ? "Создайте заявку — мы быстро рассчитаем стоимость и начнём работу над вашим заказом"
                    : "Зарегистрируйтесь и получите первую доставку со скидкой 10%. Менеджер свяжется с вами в течение 15 минут."}
                </p>

                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {isAuthenticated ? (
                    <Button
                      size="lg"
                      onClick={() => setView("order-create")}
                      className="group h-13 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-300 px-8 text-base font-semibold text-slate-900 shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:brightness-110"
                    >
                      Создать заявку
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        onClick={() => setView("register")}
                        className="group h-13 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-300 px-8 text-base font-semibold text-slate-900 shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:brightness-110"
                      >
                        Зарегистрироваться бесплатно
                        <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
