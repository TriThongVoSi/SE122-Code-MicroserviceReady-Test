## Plan: Strict Public and Dashboard Route Separation

Refactor routing into lazy loaded domain branches so public buyer pages are separated from farmer and admin bundles, then layer explicit public and dashboard layout wrappers with role-aware switch links. Keep full route parity, preserve existing auth contracts, and isolate buyer state providers to public routes only.

**Steps**
1. Build a routing orchestrator in src/app/routes.tsx that keeps RootRedirect and legacy auth redirects but replaces eager imports with React.lazy and Suspense wrappers.
2. Split route trees into domain entry modules so the top-level router only lazy loads public, farmer, admin, and employee route branches. This isolates heavy dashboard code from buyer entry traffic.
3. Preserve full farmer route parity, including SeasonProvider scope and LegacySeasonModuleRedirect behavior, inside the farmer branch to avoid behavior regression.
4. Introduce strict layout wrappers:
PublicLayout branch for marketplace and buyer flows with cart header and footer.
DashboardLayout branch for farmer, admin, and employee flows with AppShell and management header.
5. Add a new PublicHeader component in src/widgets/layout/ui that:
shows marketplace navigation and cart CTA,
shows Seller or Farmer Channel button only when authenticated role is farmer or admin,
navigates farmer to /farmer/dashboard and admin to /admin/dashboard.
6. Add a new DashboardHeader component in src/widgets/layout/ui that:
shows Back to Shop or View your store link to public routes,
uses role-based label rules while routing to /marketplace,
is mounted only in dashboard layout paths.
7. Wire layouts so switching between public and dashboard paths unmounts one layout tree and mounts the other by using separate parent route elements and role-gated branches.
8. Update src/features/auth/components/ProtectedRoute.tsx with a mock-safe, strictly typed guard that accepts existing lowercase auth roles and normalizes uppercase allowed role checks such as FARMER and ADMIN.
9. Add state isolation skeleton files:
src/app/store/authStore.ts for shared auth store facade,
src/features/buyer/store/cartStore.ts for buyer-only cart state,
src/features/farmer/store/inventoryStore.ts for farmer-only inventory state,
src/features/buyer/providers/CartProvider.tsx for buyer context.
10. Scope buyer context providers only around public routes in src/app/routes.tsx so admin and farmer dashboards do not subscribe to buyer cart state or rerender from cart updates.
11. Keep styling localized to components with Tailwind classes and avoid global style coupling between public and dashboard headers.
12. Validate with type safety and runtime checks, then confirm code splitting outcome from build artifacts.

**Relevant files**
- src/app/routes.tsx — rewrite with lazy route branches, suspense boundaries, and route-scoped providers.
- src/features/auth/components/ProtectedRoute.tsx — normalize role checks and strict typing.
- src/widgets/layout/ui/AppShell.tsx — mount dashboard switch header integration.
- src/widgets/layout/ui/Header.tsx — either slim existing internals or delegate switch logic to DashboardHeader.
- src/features/marketplace/layout/MarketplacePublicLayout.tsx — extract or replace inline header with PublicHeader.
- src/widgets/layout/ui — add PublicHeader and DashboardHeader components and export wiring.
- src/features/buyer — add buyer store and provider skeleton folders.
- src/features/farmer — add farmer store skeleton folder for inventory state.
- src/app/store/index.ts — keep scaffold, optionally re-export typed hooks plus shared auth store facade entry.

**Verification**
1. Run npm run typecheck.
2. Run npm run lint.
3. Run npm run build and confirm separated chunks for marketplace versus farmer and admin portal code.
4. Manually verify navigation switches:
public to farmer or admin via Seller or Farmer Channel button,
dashboard to public via Back to Shop or View your store link,
layout trees fully remount on cross-layout navigation.
5. Manually verify provider isolation by confirming cart context hooks are unavailable in dashboard routes.

**Decisions**
- Keep lowercase role contracts in auth and normalize for uppercase route guard inputs.
- Place new header components under src/widgets/layout/ui.
- Preserve all existing route paths while applying lazy loading and strict layout separation.

**Further Considerations**
1. Prefer direct-path lazy imports over large barrel imports in route modules to maximize chunk isolation.
2. Keep employee routes under DashboardLayout for consistency, even though explicit role requirement focused on farmer and admin.
3. If needed later, add route-level tests for role redirects and layout switching behavior.