# Marketplace Release Closure (Batch 7)

## Scope Closed
- Buyer/public marketplace flow is runtime-ready with real backend integration under `/api/v1/marketplace/*`.
- Seller flow maps to backend `FARMER` namespace: `/api/v1/marketplace/farmer/*`.
- Admin flow maps to backend `ADMIN` namespace: `/api/v1/marketplace/admin/*`.
- Order core keeps transaction safety with idempotency + locking (from previous batches).

## Production Defaults
- Frontend marketplace client enforces real adapter path in production mode (`import.meta.env.PROD`).
- Mock adapter remains opt-in for non-production only.
- `.env.production` must not include `VITE_MARKETPLACE_USE_MOCK=true`.

## Release Gate Command
Run from workspace root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ci-marketplace-release-gate.ps1
```

## Acceptance Evidence
- Acceptance matrix: `docs/marketplace-acceptance-matrix.md`
- The matrix maps backend/frontend/integration/regression/release criteria to PASS evidence.

The gate verifies:
1. Backend compile (`mvn -q -DskipTests compile`)
2. Backend marketplace targeted suite (`mvn -q -Dtest=MarketplaceServiceTest test`)
3. Frontend build (`npm run build`)
4. Frontend FDN regression suite (`npm run test:fdn`)
5. Static release-safety assertions:
   - No `/api/v1/buyer/*` usage in marketplace runtime scopes
   - No `requiredRole="buyer"` dependency in marketplace UI scope
   - Marketplace API namespace does not drift to `/api/v1/farmer/marketplace/*` or `/api/v1/admin/marketplace/*`
   - Core non-marketplace touchpoints still wired in app routes (FDN/season/AI)

## Manual Smoke Checklist (Final Sign-Off)
1. Buyer/public:
   - Browse product list/detail
   - Add to cart, login merge, checkout create order
   - Open orders and cancel valid order
2. Seller/Farmer:
   - Open marketplace dashboard
   - Create/update own product and status
   - Open own orders and apply valid status transition
3. Admin:
   - Open moderation products
   - Moderate product status
   - Open marketplace orders and stats
4. Regression touchpoints:
   - Farmer dashboard (FDN widgets/routes)
   - Season workspace modules (nutrient/irrigation/soil/reports)
   - AI assistant route/page

## Known Non-Blocking Deferred Items
- Full browser E2E automation (Playwright/Cypress) is intentionally deferred.
- Advanced UX polish for moderation reason/address/review flows is deferred.
- Deep legacy cleanup outside marketplace scope is deferred.

## Blocking Criteria
Do not release if any of these fail:
- Marketplace release gate script fails.
- Backend compile or marketplace targeted tests fail.
- Frontend build or FDN regression suite fails.
- Namespace/guardrail checks fail (buyer namespace drift or mock path enabled in production).
