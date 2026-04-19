# Marketplace Acceptance Matrix (Batch 7)

Date validated: 2026-04-19

## Backend Acceptance
| ID | Criterion | Status | Evidence | Note |
|---|---|---|---|---|
| BE-01 | Buyer/public namespace uses `/api/v1/marketplace/*` | PASS | `src/main/java/org/example/QuanLyMuaVu/module/marketplace/controller/MarketplaceController.java` | Runtime endpoints are under marketplace namespace. |
| BE-02 | Buyer capability uses authenticated model (no buyer role for marketplace capability) | PASS | `src/main/java/org/example/QuanLyMuaVu/module/shared/config/SecurityConfig.java` + `scripts/ci-marketplace-release-gate.ps1` | Cart/orders/addresses/reviews matcher is authenticated. |
| BE-03 | Farmer namespace protected by `FARMER` role | PASS | `src/main/java/org/example/QuanLyMuaVu/module/shared/config/SecurityConfig.java` + gate static assertion | `/api/v1/marketplace/farmer/**` has role guard. |
| BE-04 | Admin namespace protected by `ADMIN` role | PASS | `src/main/java/org/example/QuanLyMuaVu/module/shared/config/SecurityConfig.java` + gate static assertion | `/api/v1/marketplace/admin/**` has role guard. |
| BE-05 | `createOrder()` has transaction-safe core design | PASS | `src/main/java/org/example/QuanLyMuaVu/module/marketplace/service/MarketplaceService.java` + `src/test/java/org/example/QuanLyMuaVu/module/marketplace/service/MarketplaceServiceTest.java` | Includes locking/idempotency/multi-farmer split/stock deduction/cart clear. |
| BE-06 | `cancelOrder()` restores stock for valid path and blocks invalid state | PASS | `MarketplaceService.java` + `MarketplaceServiceTest.java` | Covered by targeted tests. |
| BE-07 | Cart merge endpoint runtime works with stock validation | PASS | `MarketplaceController.java`, `MarketplaceService.java`, `MarketplaceServiceTest.java` | Merge behavior covered in service tests. |
| BE-08 | API wrapper shape includes `{ code, message, result }` | PASS | `src/main/java/org/example/QuanLyMuaVu/DTO/Common/ApiResponse.java` + gate static assertion | `status` compatibility remains optional, required fields are present. |
| BE-09 | Marketplace targeted backend tests stable | PASS | Command: `mvn -q -Dtest=MarketplaceServiceTest test` (invoked by gate) | Green in Batch 7 gate run. |

## Frontend Acceptance
| ID | Criterion | Status | Evidence | Note |
|---|---|---|---|---|
| FE-01 | `/marketplace/*` route group is wired in main app | PASS | `src/app/routes.tsx` + gate static assertion | Public + buyer flows wired. |
| FE-02 | Buyer auth-only routes use auth guard, not buyer role | PASS | `src/app/routes.tsx` + gate static assertions | `ProtectedRoute requireAuth` for cart/checkout/orders. |
| FE-03 | Buyer role guard is not used for marketplace routes | PASS | gate check `requiredRole="buyer"` in marketplace scope and app routes | No dependency on buyer role for marketplace capability. |
| FE-04 | Real adapter is default production path | PASS | `src/shared/api/marketplace/client.ts` + gate static assertion | PROD hard-forces real adapter path. |
| FE-05 | Envelope contract `{ code, message, result }` enforced in FE | PASS | `src/shared/api/marketplace/contracts.ts` + gate static assertion | Parser requires `code`, `message`, `result`. |
| FE-06 | Seller FE uses farmer namespace endpoints | PASS | `src/shared/api/marketplace/real-adapter.ts` + gate static assertion | `/api/v1/marketplace/farmer/*`. |
| FE-07 | Admin FE uses admin namespace endpoints | PASS | `src/shared/api/marketplace/real-adapter.ts` + gate static assertion | `/api/v1/marketplace/admin/*`. |
| FE-08 | Login merge bridge merges guest cart then clears local guest cart | PASS | `src/pages/shared/hooks/useSignInPage.ts` + gate static assertion | Calls `marketplaceApi.mergeCart` then `clearGuestCartItems()`. |
| FE-09 | Farmer marketplace pages are discoverable in farmer portal wiring | PASS | `src/app/routes.tsx`, `src/features/farmer/portal/constants.ts` + gate static assertion | Dashboard/products/orders entries exist. |
| FE-10 | Admin marketplace pages are discoverable in admin portal wiring | PASS | `src/features/admin/portal/constants.ts`, `src/features/admin/portal/components/AdminPortalContent.tsx` + gate static assertion | Dashboard/products/orders entries and content wiring exist. |

## Integration Acceptance
| ID | Criterion | Status | Evidence | Note |
|---|---|---|---|---|
| IN-01 | FE↔BE namespace alignment is marketplace-only (no buyer namespace drift) | PASS | gate `rg` checks in marketplace scopes | No `/api/v1/buyer/*` in marketplace FE/BE scopes. |
| IN-02 | FE uses expected marketplace route/guard shape and legacy `/buyer/*` is redirected | PASS | `src/app/routes.tsx` | Compatibility redirect retained without buyer-role dependency. |
| IN-03 | Checkout sends idempotency key header | PASS | `src/shared/api/marketplace/real-adapter.ts` | Header: `X-Idempotency-Key`. |
| IN-04 | Buyer/public and seller/admin integration compiles and bundles | PASS | Command: `npm run build` (invoked by gate) | Build passes in Batch 7 gate run. |

## Regression Gate Acceptance
| ID | Criterion | Status | Evidence | Note |
|---|---|---|---|---|
| RG-01 | Backend compile passes | PASS | Command: `mvn -q -DskipTests compile` (invoked by gate) | Green in Batch 7 gate run. |
| RG-02 | Marketplace targeted backend suite passes | PASS | Command: `mvn -q -Dtest=MarketplaceServiceTest test` (invoked by gate) | Green in Batch 7 gate run. |
| RG-03 | Frontend build passes | PASS | Command: `npm run build` (invoked by gate) | Green in Batch 7 gate run. |
| RG-04 | FDN regression suite passes | PASS | Command: `npm run test:fdn` (invoked by gate) | Contracts + flow tests green. |
| RG-05 | Non-marketplace route touchpoints (AI/season/FDN) remain wired | PASS | `src/app/routes.tsx` + gate static assertions | AI assistant + nutrient/irrigation/soil/reports touchpoints asserted. |

## Release Readiness Acceptance
| ID | Criterion | Status | Evidence | Note |
|---|---|---|---|---|
| RR-01 | One-command release gate exists for deterministic repo-local sign-off | PASS | `scripts/ci-marketplace-release-gate.ps1` | Gate aggregates static checks + build/test checks. |
| RR-02 | Release closure runbook exists with smoke checklist and blocking criteria | PASS | `docs/marketplace-release-closure.md` | Includes release command, checklist, and blockers. |
| RR-03 | Acceptance matrix exists with mapped criteria and evidence | PASS | `docs/marketplace-acceptance-matrix.md` | This document. |
| RR-04 | Remaining manual work is external sign-off only (no codebase implementation gap) | PASS | `docs/marketplace-release-closure.md` manual smoke checklist | External staging/UAT execution is procedural, not missing implementation. |

## Batch 7 Result
- PASS: 27
- PARTIAL: 0
- BLOCKED: 0
