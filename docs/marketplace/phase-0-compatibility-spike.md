# Phase 0.0 Compatibility Spike

Date: 2026-04-19
Scope: `farm_shopping` (source only) -> `agricultural-crop-management-frontend` (target app)

## Executive Result

- Merge risk is real but controlled.
- `farm_shopping` cannot be dropped in directly.
- MVP-safe path is adapter-first migration, not framework upgrade.

## Compatibility Matrix

| Area | `farm_shopping` | Target frontend | Impact | Decision |
|---|---|---|---|---|
| React | 19.x | 18.3.1 | Medium | Keep React 18 in target; adapt imported code. |
| Router | `react-router-dom` 7.x (`createBrowserRouter`) | `react-router-dom` 6.x (`<BrowserRouter><Routes/>`) | High | Do not migrate router runtime; map pages into existing v6 route tree. |
| Tailwind | Tailwind v4 via `@tailwindcss/vite` and `@import "tailwindcss"` | Existing generated CSS + Tailwind config file | High | Do not replace current pipeline in Batch 0/1; migrate UI components only. |
| State | Zustand-only mock stores | AuthContext + React Query + existing HTTP client | High | Keep Zustand only for guest cart; use server state for auth cart/orders. |
| API layer | Mock data only, no real API contract | Existing Axios + wrapper parsing | High | Build marketplace adapter layer now (mock/real swap), freeze `{code,message,result}` envelope. |

## High-Risk Breaking Points

1. Router API mismatch:
- `farm_shopping` uses `createBrowserRouter` + `RouterProvider`.
- Target app already owns router root in `src/App.tsx` + `src/app/routes.tsx`.
- Direct adoption would break current role portals and existing route guards.

2. Tailwind runtime differences:
- `farm_shopping` expects v4 plugin flow (`@tailwindcss/vite`, `@import "tailwindcss"`).
- Target app currently ships a generated stylesheet and existing utility conventions.
- Replacing this globally is too risky for farmer/admin/FDN screens.

3. Auth/security semantics mismatch:
- `farm_shopping` role model: `buyer/seller/admin`.
- Target app role model: `farmer/admin/employee` plus legacy buyer traces.
- Marketplace buyer must map to authenticated user capability, not a role-specific guard.

4. Data layer mismatch:
- `farm_shopping` runs entirely on in-memory mock structures.
- Target app expects backend-wrapped responses and query-based state.

## Safe Migration Recommendation

1. Keep target stack unchanged in Batch 0:
- React 18, Router v6, current styling pipeline.

2. Introduce marketplace adapter contract first:
- One interface with mock and real adapter implementations.
- Freeze envelope: `{ code, message, result }` (status optional during transition).

3. Migrate module-by-module into target route tree:
- Prefix public/buyer flow under `/marketplace/*`.
- Keep farmer/admin existing flows untouched.

4. Enforce cart source-of-truth rule in adapter+contract:
- Guest: localStorage/Zustand.
- Post-login: call `POST /api/v1/marketplace/cart/merge`, then server cart is source of truth.

## Batch 0 Exit Criteria

- Compatibility decisions documented.
- Contract and adapter files created.
- No framework-level upgrade in target app.
- Existing app still builds without route/system regression.
