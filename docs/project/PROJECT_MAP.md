# PROJECT_MAP — نبض المدينة
> Living project map (Constitution DOC-003). Updated as the system evolves.

## TECH_STACK
- **Frontend/Backend:** Next.js 16 (App Router), React 19, Tailwind 4
- **State:** Zustand (`src/stores`)
- **DB/ORM:** Supabase (Postgres) + Prisma (`prisma/schema.postgresql.prisma`)
- **Auth:** JWT (`jose`) httpOnly cookies; `requireAuth`; rate-limit; audit log
- **Mobile:** Capacitor WebView APK; `src/lib/api-bridge.ts` redirects `/api/*` to live server
- **Hosting:** Vercel (CLI + git integration); APK served from Supabase Storage
- **Tests:** Vitest + jsdom + @testing-library (29 tests)

## SYSTEM_FLOW
```
Web/Mobile client → Next.js route handler → service layer → Prisma → Supabase
Auth: POST /api/auth/login → httpOnly cookie → requireAuth on protected routes
Favorites sync: explicit POST/DELETE (idempotent); server = source of truth
```

## ARCHITECTURE
- Single Next.js codebase: web store (`src/components/store`), mobile view (`src/components/mobile`), admin.
- Server logic split into service layer where remediated: `src/lib/favorites.service.ts`, `src/lib/auth.service.ts`.
- `docs/architecture.md` (C4-light) + `docs/adr/ADR-001`.

## IMPORTANT_MODULES
| Module | Path | Notes |
|---|---|---|
| UI store (session) | `src/stores/ui-store.ts` | Single source of truth for web+mobile auth |
| Favorites | `src/lib/favorites.service.ts` + `src/stores/favorites-store.ts` | Idempotent explicit intent |
| Mobile store | `src/components/mobile/lib/mobile-store.ts` | Large (~1267 LOC) — split pending (ORG-002) |
| i18n | `src/lib/i18n/translations.ts` + `src/stores/language-store.ts` | Semantic keys, RTL |
| DB layer | `src/lib/db.ts` | Prisma client singleton |

## INTEGRATIONS
- Supabase Postgres (production DB)
- Supabase Storage (APK hosting)
- Vercel (deploy)
- Email/SMS services (config-driven)
- Payment gateway (config-driven)

## ORPHANS & PENDING
- `.github/workflows/build-apk.yml` — ready locally, NOT pushed (needs `workflow` PAT scope)
- DB-001: baseline migration created; `migrate resolve` NOT yet applied to production
- DOPS-002: keystore password moved to env; keystore file still tracked (rotation pending)
- ORG-002: `mobile-store.ts`, `favorites-page.tsx` still large
- PROGRESS.md holds the running session log

## KNOWN_CONSTRAINTS
- Supabase connection `connection_limit=1` in the pooler URL — mind concurrent connections.
- APK is a WebView build — no native push / deep native features.
- No CI test job yet (blocked on `workflow` scope).
- No E2E (Playwright) yet.
