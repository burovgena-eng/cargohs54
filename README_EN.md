# CargoHS54 🚚

**A full-featured buying-agent and freight service for shipping goods from China to Russia.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License: All rights reserved](https://img.shields.io/badge/License-all_rights_reserved-red.svg)](#-copyright)
[![CI](https://github.com/burovgena-eng/cargohs54/actions/workflows/ci.yml/badge.svg)](https://github.com/burovgena-eng/cargohs54/actions/workflows/ci.yml)

[Русский](README.md) · **[English](README_EN.md)**

Client and admin dashboards, purchase-request creation, delivery status tracking, per-order chat, order consolidation and product photo uploads — all in one application.

> ⚠️ Demo accounts and contact details are fictional. This project was built as a portfolio piece demonstrating the full development cycle.

---

## 📸 Screenshots

| Landing | Client dashboard |
|:---:|:---:|
| ![Landing](docs/screenshots/01-landing-hero.png) | ![Client dashboard](docs/screenshots/05-client-dashboard.png) |

| Order with chat | Admin panel |
|:---:|:---:|
| ![Order with chat](docs/screenshots/06-order-detail.png) | ![Admin panel](docs/screenshots/08-admin-dashboard.png) |

---

## ✨ Features

### For clients
- 📝 **Purchase requests** — product link, store name, quantity, CNY price, product photo
- 📊 **Personal dashboard** — order list with status filtering and order-number search
- 💬 **Per-order chat** — talk to your manager in the context of a specific order
- 👤 **Profile** — manage account details (name, phone, city)
- 🖼️ **Product photo upload** with a server-side image proxy (bypasses CORS / hotlink protection on Chinese CDNs)

### For administrators
- 📦 **Order management panel** — all client orders, status changes, pricing
- 👥 **Client profiles** — per-client stats: order counts and totals
- 📈 **Statistics** — aggregated order and user metrics
- 🏷️ **Order lifecycle management** — from request to delivery (5 statuses)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **UI** | Tailwind CSS 4, shadcn/ui, Radix UI, Framer Motion, lucide-react |
| **State** | Zustand (with persist middleware) |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Custom JWT (next-auth/jwt encode/decode) + bcryptjs |
| **Validation** | Zod |
| **Notifications** | Sonner |
| **Deployment** | Docker (multi-stage, standalone), Render, Bun |

## 🏗 Architecture

```
src/
├── app/
│   ├── api/                 # Route Handlers (REST API)
│   │   ├── auth/            # login, register, me, logout, [...nextauth]
│   │   ├── orders/          # order CRUD + per-order messages
│   │   ├── admin/           # stats, client profiles
│   │   ├── image-proxy/     # image proxy with SSRF protection
│   │   └── health/          # orchestrator health-check
│   ├── layout.tsx           # metadata, providers
│   └── page.tsx             # SPA router driven by Zustand state
├── components/
│   ├── views/               # app screens (landing, dashboards, orders)
│   ├── layout/              # header, footer
│   └── ui/                  # shadcn/ui components
├── lib/                     # db (Prisma singleton), auth-helpers, rate-limit
└── stores/                  # Zustand store (session, navigation)
```

**Key decisions:**
- **Database auto-initialization** — on first launch `ensureDb()` creates the schema and seeds demo accounts, so the app works out of the box with an empty PostgreSQL
- **Hybrid auth** — JWT via `Authorization: Bearer` for the API + cookie fallback for NextAuth compatibility
- **Rate limiting** — login attempts and anonymous proxy requests are throttled per IP
- **SSRF protection** — the image proxy blocks private subnets, validates content-type and size
- **Standalone build** — a ~150 MB Docker image with a non-root user and healthcheck

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ / Bun 1.2+
- PostgreSQL 14+ (local or cloud — e.g. Supabase / Neon)

### 1. Clone & install

```bash
git clone https://github.com/burovgena-eng/cargohs54.git
cd cargohs54
bun install        # or npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cargohs54"
NEXTAUTH_SECRET="<openssl rand -base64 48>"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database schema

```bash
bun run db:push     # prisma db push — creates the tables
```

> The app can also create the schema automatically on the first request (`ensureDb()`) and seeds demo accounts into an empty database.

### 4. Run

```bash
bun run dev         # development → http://localhost:3000
bun run build       # production build (standalone)
bun run start       # production server
```

## 🐳 Docker

The fastest way to run the full stack (app + PostgreSQL) is Docker Compose:

```bash
export NEXTAUTH_SECRET="$(openssl rand -base64 48)"
docker compose up --build
# → http://localhost:3000
```

Or build just the production image:

```bash
docker build -t cargohs54 .
docker run -p 3000:10000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://your-domain" \
  cargohs54
```

---

## 🔑 Demo Accounts

Seeded automatically into an empty database:

| Role | Email | Password |
|------|-------|----------|
| Administrator | `admin@cargohs54.ru` | `admin123` |
| Client | `test@test.ru` | `client123` |

> ⚠️ Remove the demo accounts or change the passwords before real production use.

---

## 📡 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Sign up (bcrypt password hashing) |
| `POST` | `/api/auth/login` | Sign in, returns a JWT |
| `GET` | `/api/auth/me` | Current user from the Bearer token |
| `GET/POST` | `/api/orders` | List/create orders (pagination, filters) |
| `GET/PATCH` | `/api/orders/[id]` | Order details/update |
| `GET/POST` | `/api/orders/[id]/messages` | Per-order chat |
| `GET` | `/api/admin/stats` | Aggregated statistics |
| `GET` | `/api/admin/client-profile/[id]` | Client profile for admins |
| `GET` | `/api/image-proxy?url=` | Image proxy (SSRF protection, rate limit) |
| `GET` | `/api/health` | Health check |

---

## 🔒 Security

- Passwords — **bcrypt** (10 rounds); plaintext passwords are never stored or logged
- JWTs are signed with a secret from `NEXTAUTH_SECRET` — production startup fails fast without it
- **Rate limiting** on login and anonymous image-proxy access
- **SSRF protection** in the proxy: loopback/private subnet blocking, content-type whitelist, size limit, timeout
- API-level authorization: clients see only their own orders, admins see all (role checked in every handler)
- Docker: non-root user, standalone build without unnecessary files

---

## 🗺 Roadmap Ideas

- [ ] WebSocket/SSE for real-time chat
- [ ] Payment integration (online cost calculation)
- [ ] E-mail notifications on status changes
- [ ] Tracking numbers and carrier API integration
- [ ] i18n (Russian / English / Chinese)

---

## 👤 Author

**[burovgena-eng](https://github.com/burovgena-eng)**

Built as a portfolio project demonstrating fullstack skills: from database schema and REST API design to UI, authentication and containerization.

## 📄 Copyright

**© 2026 burovgena-eng (Gennady Burov). All rights reserved.**

This repository is published solely as a portfolio — for code review and skills demonstration. Copying, reuse, distribution and creation of derivative works (code, design, texts, images) without the author's written permission is prohibited.

The `LICENSE` file is intentionally absent: without an open-source license, the default "all rights reserved" regime applies. All third-party trade names (Taobao, 1688, Tmall, JD.com, Nike, Xiaomi, etc.) mentioned in demo data and UI belong to their respective owners and are used for demonstration purposes only.
