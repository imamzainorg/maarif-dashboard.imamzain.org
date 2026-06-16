# معارف سجادية — Admin Dashboard

Admin & content-management dashboard for the **معارف سجادية** platform. Single-page app
built with **Vue 3 + Vite**, talking to the Maarif Sajadiyya API over REST (JWT auth).

- **Live:** https://maarif-dashboard.imamzain.org
- **API:** https://maarif-api.imamzain.org

## Tech stack
Vue 3 · Vite · Vue Router (history mode) · Pinia · Axios · Tailwind CSS.

## Prerequisites
- Node.js 18+ and npm

## Local development
```bash
npm install
# create a .env file (see Environment variables below)
npm run dev        # serves on http://localhost:3000
```

## Build
```bash
npm run build      # outputs static site to dist/
npm run preview    # preview the production build locally
```

## Environment variables
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | API base origin — **no trailing slash, no `/api`** (request paths already include `/api/...`). Inlined at **build time**. | `https://maarif-api.imamzain.org` |

For local development, create a `.env` file:
```
VITE_API_URL=https://maarif-api.imamzain.org
```
> `.env` is gitignored. In hosted environments set `VITE_API_URL` in the platform's
> environment variables instead (see below). If unset, the app falls back to
> `https://localhost:7091` (the local API).

## Deployment (Vercel)
This repo is connected to Vercel and **auto-deploys on every push to `main`**.

- **Framework preset:** Vite — build `npm run build`, output `dist`.
- [`vercel.json`](vercel.json) adds the SPA fallback rewrite (`/(.*)` → `/index.html`) so
  deep links / refreshes on client-side routes (e.g. `/users`) don't 404.
- **Required env var:** set `VITE_API_URL=https://maarif-api.imamzain.org` in
  Vercel → Project → Settings → Environment Variables (Production + Preview) **before**
  the first deploy, otherwise the build bakes in the localhost fallback.
- **Custom domain:** `maarif-dashboard.imamzain.org` — in Cloudflare add a CNAME
  `maarif-dashboard` → `cname.vercel-dns.com`, set to **DNS only (grey cloud)**.

## Project structure
```
src/
├── api/axiosInstance.js   # axios client: base URL + JWT header + 401/403 handling
├── stores/                # Pinia stores (auth, stations, amenities, users, …)
├── views/                 # pages (Login, DashboardOverview, Stations, Users, …)
│   └── SuperAdmin/        # super-admin-only pages (AppSettings, RoleManagement)
├── layouts/               # DashboardLayout (sidebar/header shell)
└── router/                # Vue Router routes + auth guards
```

## Authentication
Login (`POST /api/Auth/login`) returns a JWT + refresh token, stored in `localStorage`.
The axios request interceptor attaches `Authorization: Bearer <token>` to every request;
a `401` response clears the session and redirects to `/login`. Access to admin pages is
gated by the role claim in the JWT (`admin` / `super_admin`).
