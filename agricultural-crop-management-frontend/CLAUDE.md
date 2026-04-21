# Agricultural Crop Management Frontend - Project Structure

This document describes the current codebase structure, module responsibilities, and architectural flow.

## 1. High-Level Overview

- Stack: React 18 + TypeScript + Vite + React Router + TanStack Query + Axios + Tailwind CSS + Radix UI
- State management:
	- Primary: React Context + React Query
	- Secondary/Planned: Redux Toolkit store scaffold exists but is not actively wired
- Main architecture style:
	- Domain-oriented modules under `src/entities` and `src/features`
	- Shared platform utilities/UI under `src/shared`
	- Legacy compatibility layers still present under `src/api`, `src/components`, and `src/services`

## 2. Root Directory Structure

```text
.
|- CLAUDE.md
|- Dockerfile
|- vercel.json
|- index.html
|- package.json
|- package-lock.json
|- vite.config.ts
|- tsconfig.json
|- tsconfig.node.json
|- tailwind.config.ts
|- eslint.config.js
|- docs/
|  |- i18n.md
|- public/
|  |- index.html
|  |- manifest.json
|  |- locales/
|     |- en.json
|     |- vi.json
|- src/
```

### Root file responsibilities

- `package.json`: Scripts, dependencies, testing, linting, and typecheck commands.
- `vite.config.ts`: Vite server/build settings, alias map, proxy setup, Vitest config.
- `tsconfig.json`: Strict TS settings and path aliases (`@`, `@features`, `@entities`, etc.).
- `Dockerfile`: Container packaging for deployment.
- `vercel.json`: Vercel deployment configuration.
- `docs/i18n.md`: Internationalization documentation.

## 3. Source Directory (`src`) Structure

```text
src/
|- main.tsx
|- App.tsx
|- index.css
|- styles/
|  |- globals.css
|- app/
|  |- routes.tsx
|  |- store/
|     |- index.ts
|- api/
|  |- auth.ts
|  |- catalogApi.ts
|  |- farmsApi.ts
|  |- seasonsApi.ts
|  |- tasksApi.ts
|- components/
|  |- MarkdownMessage.tsx
|  |- ThemeToggle.tsx
|  |- chart/
|  |- common/
|  |- form/
|  |- map/
|  |- table/
|  |- ui/
|- entities/
|  |- ai/
|  |- crop/
|  |- dashboard/
|  |- document/
|  |- expense/
|  |- farm/
|  |- field-log/
|  |- harvest/
|  |- incident/
|  |- inventory/
|  |- irrigation-water-analysis/
|  |- labor/
|  |- location/
|  |- notification/
|  |- nutrient-input/
|  |- plot/
|  |- plot-status/
|  |- preferences/
|  |- product-warehouse/
|  |- quality-result/
|  |- report/
|  |- sale/
|  |- search/
|  |- season/
|  |- session/
|  |- soil-test/
|  |- soil-type/
|  |- supplies/
|  |- task/
|  |- user/
|  |- variety/
|- features/
|  |- admin/
|  |- ai/
|  |- auth/
|  |- buyer/
|  |- employee/
|  |- farmer/
|  |- marketplace/
|  |- shared/
|- hooks/
|  |- useI18n.ts
|  |- useTheme.ts
|- i18n/
|  |- index.ts
|- pages/
|  |- ForgotPassword.tsx
|  |- ResetPassword.tsx
|  |- admin/
|  |- ai/
|  |- buyer/
|  |- employee/
|  |- farmer/
|  |- shared/
|- providers/
|  |- I18nProvider.tsx
|  |- ThemeProvider.tsx
|- services/
|  |- api.admin.tsx
|  |- api.ai.tsx
|  |- api.buyer.tsx
|  |- api.farmer.ts
|- shared/
|  |- api/
|  |  |- backendAddressApi.ts
|  |  |- http.ts
|  |  |- index.ts
|  |  |- marketplace/
|  |  |- types.ts
|  |  |- vietnamAddressApi.ts
|  |- components/
|  |  |- AccountLockedModal.tsx
|  |  |- SeasonGate.tsx
|  |  |- SeasonPickerModal.tsx
|  |  |- index.ts
|  |- contexts/
|  |  |- PreferencesContext.tsx
|  |  |- SeasonContext.tsx
|  |  |- index.ts
|  |- lib/
|  |  |- formatters.ts
|  |  |- formatters.test.ts
|  |  |- passwordPolicy.ts
|  |  |- useDebounce.ts
|  |  |- utils.ts
|  |  |- hooks/
|  |  |- index.ts
|  |- ui/
|     |- index.ts
|     |- [radix-based primitives + app UI packages]
|- tests/
|  |- setup.ts
|  |- AdminAlertsPage.test.tsx
|  |- AdminInventoryPage.test.tsx
|  |- AiChat.test.tsx
|  |- Auth.test.tsx
|  |- ExpenseManagement.test.tsx
|  |- SeasonContext.test.tsx
|  |- SeasonManagement.test.tsx
|  |- useExpenseManagement.test.tsx
|- types/
|  |- Season.ts
|  |- Task.ts
|- widgets/
	 |- layout/
```

## 4. Runtime Composition Flow

### Boot flow

1. `src/main.tsx` mounts `<App />`
2. `src/App.tsx` composes providers in this order:
	 - `QueryClientProvider`
	 - `I18nProvider`
	 - `ThemeProvider`
	 - `ErrorBoundary`
	 - `AuthProvider`
	 - `PreferencesProvider`
	 - `BrowserRouter`
3. `src/app/routes.tsx` resolves role-aware routing and guarded routes.

### Routing model

- Public routes: sign-in, sign-up, forgot/reset password.
- Protected role areas:
	- `/admin/*`
	- `/farmer/*` (wrapped with `SeasonProvider`)
	- `/employee/*`
- Marketplace has mixed public and authenticated buyer capabilities.
- Root route redirects by auth status and resolved role.

## 5. Layer Responsibilities

### `src/app`

- Application shell concerns:
	- Route graph and guards in `routes.tsx`
	- Future global Redux store in `store/index.ts`

### `src/entities`

- Domain data contracts and low-level API access.
- Typical entity submodule pattern:
	- `model/` for types, schemas, query keys
	- `api/` for client and query hooks
	- `index.ts` as public API export surface
- Example: `entities/crop` exports typed hooks (`useCrops`, `useCreateCrop`, etc.) and schemas.

### `src/features`

- User-facing business workflows and screens by role/domain.
- Contains richer UI orchestration and state composition using entity hooks.
- Example under `features/farmer`: crop, farm management, season workspace, task/expense flows.

### `src/shared`

- Cross-cutting modules reused everywhere:
	- `shared/api/http.ts`: Axios instance with JWT attach, token refresh, and lock-account handling.
	- `shared/contexts`: season and preference context providers/hooks.
	- `shared/ui`: reusable design-system components (Radix + app wrappers).
	- `shared/lib`: utility functions, validation helpers, formatting, reusable hooks.

### `src/pages`

- Route-level page composition, especially for role-specific route leaves.
- Works alongside `features`; some pages still act as integration points for older modules.

### Legacy-compatible layers

- `src/api`: legacy API wrappers still present.
- `src/components`: legacy UI component namespace (parallel to `shared/ui`).
- `src/services`: large service-style API files by role (admin/ai/buyer/farmer).

## 6. Cross-Cutting Concerns

### Authentication/session

- `features/auth/context/AuthContext.tsx` handles login/logout, role extraction, token/session persistence.
- HTTP interceptor in `shared/api/http.ts` injects token and refreshes on 401.

### Internationalization

- `i18n/index.ts` configures i18next + detector + backend.
- Locale resources loaded from `public/locales`.
- `providers/I18nProvider.tsx` syncs preferred locale and wraps app with suspense boundary.

### Theme

- `providers/ThemeProvider.tsx` controls light/dark/system preference with localStorage + media query listeners.

### Data fetching and cache

- TanStack Query configured in `App.tsx` with retry/backoff/staleness defaults.

### Testing

- Vitest + React Testing Library setup.
- `src/tests/setup.ts` initializes jest-dom matchers.
- Tests focus on major pages/features and context behavior.

## 7. Path Aliases

Defined in `tsconfig.json` and mirrored in `vite.config.ts`:

- `@/*` -> `src/*`
- `@app/*`, `@pages/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`, `@generated/*`

This keeps imports stable and avoids deep relative paths.

## 8. Notable Observations and Technical Debt

1. Duplicate architectural layers exist:
	 - Newer FSD-style modules (`entities`, `features`, `shared`) and older layers (`api`, `services`, `components`) coexist.
2. `src/app/store/index.ts` is currently a placeholder with TODOs and no reducers registered.
3. `package.json` includes scripts:
	 - `check:fsd`
	 - `check:legacy`
	 - `check:legacy:baseline`
	 - `check:legacy:update`
	 that reference files under `scripts/`, but no `scripts/` directory is currently present in the workspace.
4. Some feature folders expose deprecated exports for backward compatibility (for example in farmer farm-management).

## 9. Recommended Navigation Map (for contributors)

When adding or updating functionality:

1. Add/adjust domain contracts in `src/entities/<domain>`.
2. Build user workflow/UI in `src/features/<role-or-domain>`.
3. Place reusable primitives in `src/shared`.
4. Wire route entry points in `src/app/routes.tsx` and route pages in `src/pages` as needed.
5. Add/extend tests in `src/tests` and feature-local tests.

## 10. Current Architectural Direction

The codebase is moving toward a Feature-Sliced-style structure centered on:

- `entities` for domain boundaries,
- `features` for business use cases,
- `shared` for platform-level reuse,

while maintaining temporary compatibility with legacy service and component namespaces.
