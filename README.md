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
| UI | React 19 + Tailwind CSS 4 |
| Bundler | Vite 8 |
| Router | React Router 7 |
| Charts | Recharts |
| Package manager | npm |
| Auth | Firebase Auth (same project as `frontend/`) |
| API | Django REST `/api/admin/` |
| Hosting | Firebase Hosting (`sipotem-app`) |

---

## Related services

| Service | Folder | Typical URL |
|---------|--------|-------------|
| Backend (API) | `../backend/` | `http://127.0.0.1:8000` |
| Consumer app | `../frontend/` | `http://localhost:3000` |
| Realtime | `../ms-realtime/` | `http://localhost:3001` |
| **This admin SPA** | `.` | Dev: `http://localhost:5173` · Live: https://sipotem-app.web.app |

Add `http://localhost:5173` (and production admin origin) to backend `CORS_ALLOWED_ORIGINS` and `ADMIN_ALLOWED_ORIGINS`.

---

## Prerequisites

- **Node.js** 20+ (required for Firebase CLI)
- Backend running locally with migrations applied
- A Firebase user that is staff in Django (`is_staff`); production also requires custom claim `admin: true` and MFA

---

## Installation

```bash
cd admin-dashboard
npm install
cp .env.example .env
# Fill VITE_* values (same Firebase web config as frontend, plus API base URL)
npm run dev
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

Use the **same Firebase project** as `frontend/`. Do **not** put Firebase Admin SDK private keys in this repo.

---

## Scripts

| Script | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Typecheck + production build | `npm run build` |
| Lint | `npm run lint` |
| Preview production build locally | `npm run preview` |
| Build + deploy to live Hosting | `npm run deploy` |
| Build + deploy a temporary preview channel | `npm run deploy:preview` |

---

## Firebase Hosting

Live site: **https://sipotem-app.web.app**

Hosting serves the Vite build output from `dist/` (see `firebase.json`). Always build before deploy — or use the scripts above.

### One-time CLI login (local deploys)

```bash
npx firebase login
npx firebase use sipotem-app
```

### Deploy

```bash
# Production (live channel)
npm run deploy

# Named preview channel (expires in 7 days; prints a preview URL)
npm run deploy:preview
```

Equivalent manual flow:

```bash
npm run build
npx firebase deploy --only hosting
```

### GitHub Actions

| Event | Workflow | Result |
|-------|----------|--------|
| Pull request | `firebase-hosting-pull-request.yml` | Preview channel + comment on the PR |
| Push to `main` | `firebase-hosting-merge.yml` | Live channel (`https://sipotem-app.web.app`) |

Required repository secrets:

| Secret | Purpose |
|--------|---------|
| `FIREBASE_SERVICE_ACCOUNT_SIPOTEM_APP` | JSON service account with Hosting deploy access |
| `VITE_API_BASE_URL` | Production API origin (baked into the build) |
| `VITE_FIREBASE_API_KEY` | Same as local `.env` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same as local `.env` |
| `VITE_FIREBASE_PROJECT_ID` | Same as local `.env` |
| `VITE_FIREBASE_APP_ID` | Same as local `.env` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Same as local `.env` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same as local `.env` |

Add the production admin origin to backend `CORS_ALLOWED_ORIGINS` and `ADMIN_ALLOWED_ORIGINS` (e.g. `https://sipotem-app.web.app`).

---

## Authentication & MFA

1. Sign in with Firebase (email/password or Google) — same accounts as the main app.
2. If Firebase returns `auth/multi-factor-auth-required`, complete the TOTP authenticator challenge on the login screen.
3. Send `Authorization: Bearer <Firebase ID token>` on every `/api/admin/` request (`X-Admin-Client: sipotem-admin` is also sent).
4. Gate the UI with `GET /api/admin/me/` — the only admin endpoint that returns `is_staff` / `is_superuser`. Roles are stored **in memory** only (not long-lived token dumps in `localStorage`).
5. **403** → Access Denied screen (not staff / missing `admin` claim / MFA / origin).

### Production MFA (`ADMIN_REQUIRE_MFA=true`)

When the backend requires MFA (default when `DEBUG=False`), the Firebase ID token must include a non-empty `firebase.sign_in_second_factor` list. Staff must enroll TOTP in the consumer app (or Firebase console) and complete MFA at admin login before any admin API calls succeed.

When `ADMIN_REQUIRE_FIREBASE_CLAIM=true`, the token must also include custom claim `admin: true` (synced when promoting staff via `PATCH /api/admin/users/<id>/roles/`).

---

## Staff vs superuser (UI)

| Capability | Staff | Superuser |
|------------|-------|-----------|
| Payouts, verification, users edit, catalog, rates, fundraisers, notifications | Yes | Yes |
| User roles (`is_staff` / `is_superuser`) | No | Yes |
| Overview money/wallet cards, money stats, money-by-user | Hidden | Shown |
| Transaction volume averages | Hidden | Shown |
| Audit logs | Own actions (`mine=1`) | All |

UI guards are UX only; the API enforces real permissions.

---

## Admin API surface

Full contract: [`../backend/README.md`](../backend/README.md) under **Admin API**. While backend `DEBUG=True`, Swagger at `{API}/api/docs/` (tag **Admin**) is the live contract if shapes drift.

| Area | Paths |
|------|-------|
| Session | `GET /api/admin/me/` |
| Users / roles / badges | `/api/admin/users/…` |
| Verification | `/api/admin/verification-requests/…` |
| Payouts | `/api/admin/payment-requests/…` |
| Rates | `/api/admin/exchange-rates/…` |
| Catalog | `/api/admin/categories/`, `profile-items/`, `badges/` |
| Fundraisers | `/api/admin/fundraisers/…` |
| Transactions | `/api/admin/transactions/…` (read-only) |
| Notifications | `/api/admin/notifications/` |
| Audit | `/api/admin/audit-logs/` |
| Stats | `/api/admin/stats/…` |

---

## Acceptance checklist

- [ ] Login → `/api/admin/me/` gate → Access Denied for non-staff
- [ ] Staff can run payouts + verification + catalogs; cannot open money stats or roles
- [ ] Superuser sees money dashboard, money-by-user, roles, full audit
- [ ] List filters and pagination work
- [ ] Approve payout / verify user show success toasts (backend side effects)
- [ ] No role fields from consumer `/api/users/me/`
- [ ] Tokens not logged; MFA flow works in production
- [ ] Admin origin in `CORS_ALLOWED_ORIGINS` + `ADMIN_ALLOWED_ORIGINS`
- [ ] Empty states, loading, error toasts on screens
- [ ] Tables usable on mobile (horizontal scroll)

---

## Security notes

- Never commit `.env`, Firebase Admin credentials, or service-account JSON.
- Prefer least privilege: only superusers hit role-mutation and platform money endpoints.
- Treat audit logs as append-only; do not invent client-side “undo”.

---

## Source layout

```
src/
  api/           # adminClient + domain modules
  auth/          # Firebase, MFA, RequireStaff/Superuser
  components/    # UI primitives, shell, shared
  pages/         # One screen per admin area
  constants/     # Enums
  types/         # API types
```
