# CargoHS54 🚚

**Полнофункциональный сервис выкупа товаров и грузоперевозок из Китая в Россию.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-059669.svg)](LICENSE)
[![CI](https://github.com/burovgena-eng/cargohs54/actions/workflows/ci.yml/badge.svg)](https://github.com/burovgena-eng/cargohs54/actions/workflows/ci.yml)

**[Русский](README.md)** · [English](README_EN.md)

Личный кабинет клиента и администратора, создание заявок на выкуп, отслеживание статусов доставки, внутренний чат по заявкам, консолидация заказов и загрузка изображений товаров — всё в одном приложении.

> ⚠️ Демо-аккаунты и контактные данные в приложении вымышленные. Проект создан как портфолио и демонстрация полного цикла разработки.

---

## 📸 Интерфейс

| Лендинг | Личный кабинет |
|:---:|:---:|
| ![Лендинг](docs/screenshots/01-landing-hero.png) | ![Кабинет клиента](docs/screenshots/05-client-dashboard.png) |

| Заявка с чатом | Админ-панель |
|:---:|:---:|
| ![Заявка с чатом](docs/screenshots/06-order-detail.png) | ![Админ-панель](docs/screenshots/08-admin-dashboard.png) |

<details>
<summary><b>Больше скриншотов</b></summary>

| Управление заявкой (админ) | Создание заявки |
|:---:|:---:|
| ![Управление заявкой](docs/screenshots/09-admin-order-detail.png) | ![Создание заявки](docs/screenshots/07-order-create.png) |

| Вход | Преимущества |
|:---:|:---:|
| ![Вход](docs/screenshots/04-login.png) | ![Преимущества](docs/screenshots/02-landing-features.png) |

| Процесс работы | Мобильная версия |
|:---:|:---:|
| ![Как это работает](docs/screenshots/03-landing-how.png) | ![Мобильная версия](docs/screenshots/10-mobile-landing.png) |

</details>

---

## ✨ Возможности

### Для клиентов
- 📝 **Создание заявок на выкуп** — ссылка на товар, название магазина, количество, цена в юанях, фото товара
- 📊 **Личный кабинет** — список заказов с фильтрацией по статусу и поиском по номеру
- 💬 **Чат по заявке** — переписка с менеджером в контексте конкретного заказа
- 👤 **Профиль** — управление данными аккаунта (имя, телефон, город)
- 🖼️ **Загрузка фото товаров** с проксированием изображений через сервер (обход CORS/антихотлинка китайских CDN)

### Для администраторов
- 📦 **Панель управления заявками** — все заказы клиентов, смена статусов, назначение цен
- 👥 **Профили клиентов** — статистика по каждому клиенту: количество заказов, суммы
- 📈 **Статистика** — агрегированные метрики по заявкам и пользователям
- 🏷️ **Управление жизненным циклом заказа** — от заявки до выдачи (5 статусов)

---

## 🛠 Технологии

| Слой | Стек |
|------|------|
| **Фреймворк** | Next.js 16 (App Router), React 19, TypeScript |
| **UI** | Tailwind CSS 4, shadcn/ui, Radix UI, Framer Motion, lucide-react |
| **Состояние** | Zustand (с persist-мидлварью) |
| **База данных** | PostgreSQL + Prisma ORM |
| **Аутентификация** | Кастомный JWT (next-auth/jwt encode/decode) + bcryptjs |
| **Валидация** | Zod |
| **Тосты/уведомления** | Sonner |
| **Развёртывание** | Docker (multi-stage, standalone), Render, Bun |

## 🏗 Архитектура

```
src/
├── app/
│   ├── api/                 # Route Handlers (REST API)
│   │   ├── auth/            # login, register, me, logout, [...nextauth]
│   │   ├── orders/          # CRUD заявок + сообщения по заявке
│   │   ├── admin/           # статистика, профили клиентов
│   │   ├── image-proxy/     # проксирование изображений с SSRF-защитой
│   │   └── health/          # health-check для оркестратора
│   ├── layout.tsx           # метаданные, провайдеры
│   └── page.tsx             # SPA-роутер на Zustand-состоянии
├── components/
│   ├── views/               # экраны приложения (landing, кабинеты, заявки)
│   ├── layout/              # header, footer
│   └── ui/                  # shadcn/ui компоненты
├── lib/                     # db (Prisma singleton), auth-helpers, rate-limit
└── stores/                  # Zustand store (сессия, навигация)
```

**Ключевые решения:**
- **Автоинициализация БД** — при первом запуске `ensureDb()` создаёт схему и сеет демо-аккаунты, приложение работает «из коробки» с пустым PostgreSQL
- **Гибридная аутентификация** — JWT в `Authorization: Bearer` для API + cookie-фолбэк для NextAuth-совместимости
- **Rate limiting** — ограничение попыток входа и анонимных запросов к прокси по IP
- **SSRF-защита** — image-proxy блокирует приватные подсети, проверяет content-type и размер
- **Standalone-сборка** — Docker-образ ~150 МБ с non-root пользователем и healthcheck

---

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 20+ / Bun 1.2+
- PostgreSQL 14+ (локально или в облаке — например, Supabase / Neon)

### 1. Клонирование и зависимости

```bash
git clone https://github.com/burovgena-eng/cargohs54.git
cd cargohs54
bun install        # или npm install
```

### 2. Переменные окружения

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cargohs54"
NEXTAUTH_SECRET="<openssl rand -base64 48>"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Схема базы данных

```bash
bun run db:push     # prisma db push — создаст таблицы
```

> Приложение также умеет создавать схему автоматически при первом запросе (`ensureDb()`), если таблиц ещё нет, и сеет демо-аккаунты в пустую базу.

### 4. Запуск

```bash
bun run dev         # режим разработки → http://localhost:3000
bun run build       # production-сборка (standalone)
bun run start       # production-сервер
```

## 🐳 Docker

Самый быстрый способ запустить весь стек (приложение + PostgreSQL) — Docker Compose:

```bash
export NEXTAUTH_SECRET="$(openssl rand -base64 48)"
docker compose up --build
# → http://localhost:3000
```

Или только production-образ приложения:

```bash
docker build -t cargohs54 .
docker run -p 3000:10000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://your-domain" \
  cargohs54
```

---

## 🔑 Демо-аккаунты

Создаются автоматически в пустой базе:

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | `admin@cargohs54.ru` | `admin123` |
| Клиент | `test@test.ru` | `client123` |

> ⚠️ Для продакшена удалите демо-аккаунты или смените пароли.

---

## 📡 API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `POST` | `/api/auth/register` | Регистрация (bcrypt-хеширование пароля) |
| `POST` | `/api/auth/login` | Вход, возвращает JWT |
| `GET` | `/api/auth/me` | Текущий пользователь по Bearer-токену |
| `GET/POST` | `/api/orders` | Список/создание заявок (пагинация, фильтры) |
| `GET/PATCH` | `/api/orders/[id]` | Детали/обновление заявки |
| `GET/POST` | `/api/orders/[id]/messages` | Чат по заявке |
| `GET` | `/api/admin/stats` | Агрегированная статистика |
| `GET` | `/api/admin/client-profile/[id]` | Профиль клиента для админа |
| `GET` | `/api/image-proxy?url=` | Прокси изображений (SSRF-защита, rate-limit) |
| `GET` | `/api/health` | Health-check |

---

## 🔒 Безопасность

- Пароли — **bcrypt** (10 rounds), пароль в открытом виде нигде не логируется и не хранится
- JWT подписывается секретом из `NEXTAUTH_SECRET` — в production запуск без него невозможен (fail-fast)
- **Rate limiting** на вход и на анонимный доступ к image-proxy
- **SSRF-защита** прокси: блокировка loopback/приватных подсетей, whitelist content-type, лимит размера, таймаут
- Авторизация на уровне API: клиент видит только свои заявки, админ — все (проверка роли в каждом хендлере)
- Docker: non-root пользователь, standalone-сборка без лишних файлов

---

## 🗺 Возможные улучшения

- [ ] WebSocket/SSE для чата в реальном времени
- [ ] Интеграция платёжных систем (расчёт стоимости онлайн)
- [ ] E-mail уведомления о смене статуса
- [ ] Трек-номера и интеграция с API транспортных компаний
- [ ] i18n (русский / английский / китайский)

---

## 👤 Автор

**[burovgena-eng](https://github.com/burovgena-eng)**

Проект разработан как демонстрация навыков fullstack-разработки: от проектирования схемы БД и REST API до UI, аутентификации и контейнеризации.

## ⚖️ Лицензия

Проект распространяется под лицензией **MIT** — см. файл [LICENSE](LICENSE).

Copyright © 2026 [burovgena-eng](https://github.com/burovgena-eng). Все права на торговые наименования третьих сторон (Taobao, 1688, Tmall, JD.com, Nike, Xiaomi и др.), упомянутые в демо-данных и интерфейсе, принадлежат их владельцам и использованы исключительно в демонстрационных целях.
