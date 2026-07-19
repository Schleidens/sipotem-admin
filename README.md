# SipòteM Admin Dashboard

React staff SPA for **SipòteM** (Haitian Creole tip / creator support platform).

This app is the primary staff UI. It talks **only** to Django `/api/admin/` with a Firebase Bearer token. The consumer Next.js app never calls these routes. Classic Django `/admin/` remains an ops fallback, not the day-to-day staff surface.

| Doc | Purpose |
|-----|---------|
| This README | Local onboarding, auth model, admin API map |
| [`../backend/README.md`](../backend/README.md) | API source of truth, env, auth details |
| [`../backend/DEPLOY.md`](../backend/DEPLOY.md) | Backend production / Railway |

---

## Stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| UI | React 19 |
| Bundler | Vite 8 |
| Package manager | Yarn |
| Auth (planned) | Firebase Auth (same project as `frontend/`) |
| API | Django REST `/api/admin/` |

---

## Related services

| Service | Folder | Typical URL |
|---------|--------|-------------|
| Backend (API) | `../backend/` | `http://127.0.0.1:8000` |
| Consumer app | `../frontend/` | `http://localhost:3000` |
| Realtime | `../ms-realtime/` | `http://localhost:3001` |
| **This admin SPA** | `.` | `http://localhost:5173` (Vite default) |

---

## Prerequisites

- **Node.js** 20+ recommended
- **Yarn**
- Backend running locally (or a reachable API) with migrations applied
- A Firebase user that is staff in Django (`is_staff`); production also requires custom claim `admin: true` and MFA

---

## Installation

```bash
cd admin-dashboard
yarn
cp .env.example .env
# Fill VITE_* values (same Firebase web config as frontend, plus API base URL)
yarn dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

---

## Environment variables

Copy [`.env.example`](.env.example) → `.env`. Never commit `.env`.

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Django origin, e.g. `http://127.0.0.1:8000` (no trailing slash) |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project id |
| `VITE_FIREBASE_APP_ID` | Firebase web app id |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender id |

Use the **same Firebase project** as `frontend/`. Do **not** put Firebase Admin SDK private keys or service-account JSON in this repo.

---

## Scripts

| Script | Command |
|--------|---------|
| Dev server | `yarn dev` |
| Typecheck + production build | `yarn build` |
| Lint | `yarn lint` |
| Preview production build | `yarn preview` |

---

## Authentication

1. Sign in with Firebase (same account system as the main app).
2. Send `Authorization: Bearer <Firebase ID token>` on every `/api/admin/` request.
3. Gate the UI with `GET /api/admin/me/` — this is the only admin endpoint that returns `is_staff` / `is_superuser`. If the user is not staff, do not render admin chrome.

**Production defaults (backend):** Firebase token + Django `is_staff` + custom claim `admin: true` + MFA + CORS allowlist via `ADMIN_ALLOWED_ORIGINS`. Mutations write append-only `AdminAuditLog` rows.

---

## Admin API surface

Full contract lives in [`../backend/README.md`](../backend/README.md) under **Admin API (`/api/admin/`)**. Summary:

| Area | Paths | Notes |
|------|-------|-------|
| Session | `GET /api/admin/me/` | Roles for this staff user |
| Users | `/api/admin/users/` … | List / detail / update |
| Roles | `PATCH /api/admin/users/<id>/roles/` | Superuser only; syncs Firebase `admin` claim |
| Badges | `/api/admin/users/<id>/badges/` | Award badges |
| Verification | `/api/admin/verification-requests/` … | Approve / reject blue-check |
| Payouts | `/api/admin/payment-requests/` … | Payout queue |
| Rates | `/api/admin/exchange-rates/` … | HTG/USD |
| Catalog | `/api/admin/categories/`, `profile-items/`, `badges/` | CRUD-ish catalog |
| Fundraisers | `/api/admin/fundraisers/` … | Edit / suspend / close |
| Ledger | `/api/admin/transactions/` … | Read-only |
| Notifications | `/api/admin/notifications/` | Broadcast or staff DM |
| Audit | `/api/admin/audit-logs/` | Staff: own actions; superuser: all |

By design, this SPA should not call consumer routes (`/api/users/`, tip flows, etc.).

---

## Repository layout

```
admin-dashboard/
├── public/           # Static assets (favicon)
├── src/
│   ├── App.tsx       # App shell (features TBD)
│   ├── main.tsx      # Vite entry
│   ├── App.css
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## Security notes

- Never commit `.env`, Firebase Admin credentials, or service-account JSON.
- Staff UI origin must be listed in backend `ADMIN_ALLOWED_ORIGINS` in production.
- Prefer least privilege: only superusers should hit role-mutation endpoints.
- Treat audit logs as append-only; do not invent client-side “undo” of staff actions.

---

## First-day checklist

1. `yarn` and copy `.env.example` → `.env`
2. Start backend (`../backend/`) on `:8000`
3. Confirm you have a staff Firebase user (Django `is_staff`)
4. `yarn dev` and open the Vite URL
5. Next implementation step: Firebase client + `GET /api/admin/me/` gate, then feature screens

---

## Current status

Scaffold only: Vite + React + TypeScript toolchain with a minimal placeholder shell. Auth, routing, and admin feature screens are not implemented yet.
