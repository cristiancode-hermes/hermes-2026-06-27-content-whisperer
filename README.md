# 📝 Content Whisperer — AI-Powered Content Summarizer

> **Extrae conocimiento de cualquier contenido.** Pega texto o ingresa una URL para obtener un análisis estructurado con resumen ejecutivo, puntos clave, citas relevantes y estadísticas. Organiza todo en colecciones temáticas.

---

## ✨ Features

### Must Have (MVP)
- ✅ Autenticación JWT (registro/login)
- ✅ Pegar texto o ingresar URL para analizar
- ✅ AI genera resumen estructurado (ejecutivo + puntos clave + citas + estadísticas)
- ✅ Extracción automática de citas y datos relevantes
- ✅ Ver y gestionar historial de análisis
- ✅ Organizar fuentes en colecciones
- ✅ Dark mode
- ✅ Estados loading/empty/error en toda la UI
- ✅ Configuración de modo (General/Técnico/Académico/Noticias) y longitud (Breve/Normal/Detallado)
- ✅ Exportar a Markdown
- ✅ Búsqueda global (Ctrl+K / Cmd+K)

### Should Have (built)
- ✅ Búsqueda y filtro en historial
- ✅ Editar título y notas de una fuente
- ✅ Dashboard con métricas y actividad

### Architecture Highlights
- **8 entidades** (User, Source, Summary, KeyPoint, Quote, Stat, Collection, CollectionSource)
- **5 backend modules** (Auth, Sources, Analysis, Collections, Dashboard)
- **8 frontend pages** lazy-loaded (Login, Register, Dashboard, Analyze, History, Source Detail, Collections, Collection Detail)
- **AI Strategy Pattern** — OpenAI Strategy con LLM + LocalFallback Strategy con TF-IDF heurístico
- **Signal-first Angular 22** — zoneless, standalone, signals, computed, new control flow

---

## 🛠 Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (Standalone, Zoneless, Signals, Tailwind CSS v4) |
| Backend | NestJS + JWT Auth + TypeORM + Swagger |
| Database | SQLite (dev) / PostgreSQL (prod) via TypeORM |
| AI | Strategy Pattern: OpenAI (structured JSON) + LocalFallback (TF-IDF heuristic) |
| CI/CD | GitHub Actions workflow YAML |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Angular 22)              │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │
│  │  Header  │ │  Sidebar │ │  Router Outlet     │   │
│  │  (Search,│ │  (Nav)   │ │  (8 lazy pages)    │   │
│  │   Theme) │ │          │ │                    │   │
│  └──────────┘ └──────────┘ └────────────────────┘   │
│                    │ HTTP (Bearer JWT)               │
├────────────────────┼─────────────────────────────────┤
│            Backend (NestJS)                          │
│  ┌──────┐ ┌────────┐ ┌────────┐ ┌──────────┐       │
│  │ Auth │ │Sources │ │Analysis│ │Collections│       │
│  │ JWT  │ │  CRUD  │ │ AI Gen │ │  CRUD    │       │
│  └──────┘ └────────┘ └────────┘ └──────────┘       │
│  ┌───────────┐                                      │
│  │ Dashboard │                                      │
│  │  (Stats)  │                                      │
│  └───────────┘                                      │
├─────────────────────────────────────────────────────┤
│               Database (SQLite / PostgreSQL)         │
│  User → Source → Summary (1:1)                      │
│              → KeyPoint (1:N)                       │
│              → Quote (1:N)                          │
│              → Stat (1:N)                           │
│  User → Collection → CollectionSource → Source       │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

- Node.js 20+
- npm 10+

---

## 🚀 Local Setup

```bash
# 1. Clone or navigate to the project
cd 2026-06-27-content-whisperer

# 2. Install backend dependencies
cd apps/api && npm install && cd ../..

# 3. Install frontend dependencies
cd apps/web && npm install && cd ../..

# 4. Configure environment
cp apps/api/.env.example apps/api/.env
# Edit .env if needed (defaults work for local dev)

# 5. Run database seed
cd apps/api && SEED_DB=true node_modules/.bin/nest start --tsc 2>&1 &
# Wait for "Seed complete!" then Ctrl+C

# 6. Start API server
cd apps/api && node_modules/.bin/nest start --tsc --watch

# 7. In another terminal, start frontend
cd apps/web && node_modules/.bin/ng serve

# 8. Open browser at http://localhost:4200
# Demo login: demo@whisperer.app / password123
```

---

## 📁 Project Structure

```
2026-06-27-content-whisperer/
├── apps/
│   ├── api/                         # NestJS backend
│   │   ├── src/
│   │   │   ├── ai/                  # AI Strategy Pattern
│   │   │   │   ├── analysis.service.ts
│   │   │   │   ├── analysis.types.ts
│   │   │   │   ├── ai-strategy.interface.ts
│   │   │   │   ├── local-fallback.strategy.ts
│   │   │   │   └── openai.strategy.ts
│   │   │   ├── analysis/            # Analysis module
│   │   │   │   ├── analysis.controller.ts
│   │   │   │   ├── analysis.module.ts
│   │   │   │   └── dto/
│   │   │   ├── auth/                # JWT Auth module
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── dto/
│   │   │   ├── collections/         # Collections module
│   │   │   ├── dashboard/           # Dashboard module
│   │   │   ├── entities/            # TypeORM entities (8)
│   │   │   ├── sources/             # Sources module
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   └── seed.service.ts
│   │   └── .env.example
│   └── web/                         # Angular 22 frontend
│       └── src/
│           ├── app/
│           │   ├── components/      # Shared components (4)
│           │   ├── guards/          # Auth guard
│           │   ├── models/          # TypeScript interfaces (7)
│           │   ├── pages/           # Lazy-loaded pages (8)
│           │   └── services/        # HTTP services (8)
│           ├── main.ts
│           ├── index.html
│           └── styles.css           # Tailwind v4 + design tokens
└── docs/                            # Documentation
```

---

## 🧪 API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | JWT |
| GET | `/api/sources` | List sources (paginated) | JWT |
| GET | `/api/sources/search?q=` | Search sources | JWT |
| GET | `/api/sources/:id` | Get source detail | JWT |
| PATCH | `/api/sources/:id` | Update source | JWT |
| DELETE | `/api/sources/:id` | Delete source | JWT |
| POST | `/api/analysis/text` | Analyze pasted text | JWT |
| POST | `/api/analysis/url` | Analyze URL content | JWT |
| GET | `/api/collections` | List collections | JWT |
| POST | `/api/collections` | Create collection | JWT |
| GET | `/api/collections/:id` | Get collection with sources | JWT |
| PATCH | `/api/collections/:id` | Update collection | JWT |
| DELETE | `/api/collections/:id` | Delete collection | JWT |
| POST | `/api/collections/:id/sources` | Add source to collection | JWT |
| DELETE | `/api/collections/:id/sources/:sourceId` | Remove source from collection | JWT |
| GET | `/api/dashboard/stats` | Dashboard statistics | JWT |
| GET | `/api/dashboard/recent` | Recent 5 sources | JWT |
| GET | `/api/dashboard/top-words` | Top 20 frequent words | JWT |

Swagger docs: http://localhost:3000/api/docs (when API is running)

---

## 🗺 Roadmap

- [ ] **Comparación lado a lado** de dos fuentes
- [ ] **Web scraping completo** con metadatos (OG tags, author, date)
- [ ] **Tags personalizados** por el usuario
- [ ] **Compartir resumen** via link público
- [ ] **Extensiones de browser** (Chrome/Firefox)
- [ ] **Análisis de PDFs** subidos
- [ ] **Estadísticas de lectura** avanzadas
- [ ] **Neon PostgreSQL** deployment (requires NEON_API_KEY)
- [ ] **GitHub push** (requires GITHUB_TOKEN)
- [ ] **Real OpenAI integration** (requires OPENAI_API_KEY)

---

## 📄 License

MIT
