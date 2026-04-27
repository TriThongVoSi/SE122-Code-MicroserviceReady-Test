# THONG_CODEBASE_BASELINE_V2

## Metadata
- Generated at: 2026-04-26 (Asia/Bangkok)
- Repository: `d:\SE122-Code-MicroserviceReady`
- Scan scope: frontend + backend + config + test + migration + scripts
- Scope constraints applied:
  - Chat target = Firebase (no new backend REST chat implementation)
  - Global Search deferred (`/api/v1/search` not implemented now)
  - AI Assistant deferred (no AIController/Gemini behavior change now)
  - Marketplace is Qu?nh-owned (report-only, no direct module changes)

## 1) C?u trúc repo

### 1.1 Root
- `agricultural-crop-management-frontend/`
- `agricultural-crop-management-backend/`
- `docs/`
- `scripts/`
- SQL util scripts: `init-mysql.sql`, `reset-database.sql`, `newimportdb.sql`
- API parity artifact: `api-route-audit.json`

### 1.2 Frontend (React + TypeScript + Vite + FSD)
- Main folders:
  - `src/app`, `src/features`, `src/entities`, `src/shared`, `src/widgets`, `src/pages`
- FSD slices:
  - `src/features`: `admin`, `ai`, `auth`, `buyer`, `employee`, `farmer`, `marketplace`, `shared`
  - `src/entities`: 31 entity slices (ai/crop/dashboard/document/.../variety)
- Main route file: `src/app/routes.tsx`

### 1.3 Backend (Spring Boot modular monolith)
- Main package: `src/main/java/org/example/QuanLyMuaVu`
- Module folders under `module/`:
  - `admin`, `ai`, `cropcatalog`, `farm`, `financial`, `identity`, `incident`, `inventory`, `marketplace`, `season`, `shared`, `sustainability`
- Per-module layering present (controller/service/repository) + selected `port` packages
- Shared observer/event layer present: `module/shared/pattern/Observer/*`

### 1.4 Migration/Test/Config locations
- Flyway migrations: `backend/src/main/resources/db/migration/*.sql`
- Backend tests: `backend/src/test/java/*`
- Frontend tests: `frontend/src/**/*.test.ts(x)`
- Backend runtime config: `backend/src/main/resources/application*.{yml,properties}`
- Frontend env: `frontend/.env.development`, `frontend/.env.production`

## 2) Module chính, route chính, controller/service/repository chính

### 2.1 Frontend route chính
Source: `frontend/src/app/routes.tsx`
- Public/Auth: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
- Marketplace public: `/marketplace/*` (products, farms, traceability, cart, checkout, orders, profile)
- Farmer portal: `/farmer/*`
  - dashboard, farms, plots, seasons workspace, inventory, product-warehouse, notifications, ai-assistant, seller marketplace pages
- Admin portal: `/admin/*`
- Employee portal: `/employee/*` (tasks/progress/payroll/profile/settings)

### 2.2 Backend module map (controller/service/repository count)
| Module | Controllers | Services | Repositories |
|---|---:|---:|---:|
| admin | 16 | 16 | 6 |
| ai | 2 | 1 | 0 |
| cropcatalog | 3 | 3 | 3 |
| farm | 4 | 7 | 4 |
| financial | 2 | 3 | 1 |
| identity | 4 | 9 | 5 |
| incident | 3 | 4 | 3 |
| inventory | 3 | 5 | 9 |
| marketplace | 3 | 1 | 8 |
| season | 7 | 16 | 8 |
| shared | 1 | 0 | 0 |
| sustainability | 6 | 15 | 3 |

### 2.3 Backend controller prefix chính
- Admin: `/api/v1/admin/**`
- Auth/Identity: `/api/v1/auth/**`, `/api/v1/user/**`, `/api/v1/preferences/**`
- Farm/Plot/Location: `/api/v1/farms/**`, `/api/v1/address/**`, `/api/v1/locations/**`, plus `/api/v1/...` endpoints from `PlotController`
- Season/Task/Labor/Employee: `/api/v1/seasons/**`, `/api/v1/workspace/tasks/**`, `/api/v1/field-logs/**`, `/api/v1/farmer/labor/**`, `/api/v1/employee/**`
- Inventory/Warehouse/Supplies: `/api/v1/inventory/**`, `/api/v1/product-warehouses/**`, `/api/v1/supplies/**`
- Incident/Notification: `/api/v1/incidents/**`, `/api/v1/notifications/**`, `/api/v1/farmer/notifications/**`
- Sustainability/Dashboard/Reports: `/api/v1/dashboard/**`, `/api/v1/farmer/reports/**`, plus `/api/v1/...` sustainability endpoints
- AI: `/api/v1/farmer/ai/*`, `/api/v1/ai/qa`
- Marketplace (Qu?nh): `/api/v1/marketplace/**`

## 3) Command build/test/lint/typecheck/migration hi?n có

### 3.1 Frontend
From `frontend/package.json` scripts:
- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run test:fdn`, `npm run ci:fdn:frontend`

### 3.2 Backend
- `mvn -q -DskipTests compile`
- `mvn -q test`
- `mvn spring-boot:run`

### 3.3 CI/Test infra scripts (repo-level)
- `scripts/ci-fdn-gate.ps1`
- `scripts/ci-marketplace-release-gate.ps1`
- `scripts/fdn-staging-like-validation.ps1`
- `scripts/route-audit.js`
- Ghi nh?n: hi?n **không có** `.github/workflows/*` trong repo này.

### 3.4 Migration commands/config
- Flyway dependencies present in backend `pom.xml`
- Flyway config (default disabled in app.properties):
  - `spring.flyway.enabled=${SPRING_FLYWAY_ENABLED:false}`
  - locations: `classpath:db/migration`
- Prod profile sets `spring.flyway.enabled=true` by default override.
- Migration files currently: `V3...V19` (`db/migration/`)

## 4) Tr?ng thái ch?y build/test/lint/typecheck (baseline run)

### 4.1 Frontend (run on current workspace)
- `npm run build`: **PASS**
- `npm run lint`: **FAIL**
  - 329 issues total: **93 errors**, **236 warnings**
  - dominant blockers: FSD boundary violation (`@/hooks/*`, `@/services/*` restricted imports)
- `npm run typecheck`: **FAIL**
  - ~**100 TS errors**
  - major clusters: missing module import, API contract mismatch, form type mismatch, legacy prop mismatch
- `npm run test -- --run`: **FAIL**
  - 30 files, 103 tests; **4 failed files**, **6 failed tests**
  - failed files:
    - `src/widgets/layout/lib/config.test.ts` (3 fails)
    - `src/features/shared/preferences/PreferencesForm.test.tsx` (1 fail)
    - `src/tests/AdminAlertsPage.test.tsx` (1 fail)
    - `src/tests/ExpenseManagement.test.tsx` (1 fail)

### 4.2 Backend (run on current workspace)
- `mvn -q -DskipTests compile`: **PASS**
- `mvn -q test`: **FAIL**
  - Parsed surefire totals: **Tests=275, Failures=14, Errors=29, Skipped=0**
  - Failing suites (10):
    - `AuthenticationControllerTest` (6 errors)
    - `AuthenticationControllerIntegrationTest` (12 errors)
    - `ExpenseServiceTest$CreateExpenseTests` (2 failures)
    - `ExpenseServiceTest$UpdateExpenseTests` (2 failures)
    - `IrrigationWaterAnalysisServiceTest` (3 errors)
    - `NutrientInputIngestionServiceTest` (1 failure, 3 errors)
    - `SeasonServiceTest$CreateSeasonTests` (4 failures, 2 errors)
    - `SeasonServiceTest$DeleteSeasonTests` (5 failures)
    - `SeasonServiceTest$LegacyMethodsTests` (1 error)
    - `SoilTestServiceTest` (2 errors)
  - Main failure patterns:
    - DB/schema mismatch for auth tests (`users.user_id` default value issue)
    - Service test expectation drift (exception messages/types changed)
    - SeasonService test wiring drift (`NullPointerException` from null port dependencies)
    - Sustainability ingestion tests now failing with `Season not found`

## 5) Placeholder/TODO/mock ngoài Marketplace

### 5.1 Frontend (notable)
- Core TODO stubs:
  - `src/app/store/index.ts` (Redux store scaffold TODO)
  - `src/services/api.ai.tsx` (AI API TODO scaffold)
  - `src/pages/ai/*` pages are TODO placeholders
  - `src/pages/shared/DocumentsPage.tsx`, `src/pages/admin/FarmersPage.tsx`, `src/pages/admin/BuyersPage.tsx` are TODO placeholders
- Admin placeholder-data heavy areas:
  - `src/features/admin/dashboard/constants.ts`
  - `src/features/admin/system-settings/constants.ts`
  - `src/features/admin/system-monitoring/constants.ts`
  - `src/features/admin/buyer-management/constants.ts`
  - `src/features/admin/farmer-management/constants.ts`
- TODO tests still stubbed:
  - `src/tests/AiChat.test.tsx`, `src/tests/Auth.test.tsx`, `src/tests/SeasonManagement.test.tsx`

### 5.2 Backend (notable)
- `module/admin/service/AuditLogService.java`: TODO for external monitoring alerting and PII redaction
- `module/farm/service/PlotService.java`: TODO dependency checks before delete
- `module/ai/controller/AIController.java`: buyer QA returns placeholder answer text

## 6) Endpoint FE g?i nhung BE chua có (tách nhóm)

Data source: refreshed `api-route-audit.json` (generated 2026-04-26)
- `frontendCalls=276`
- `backendRoutes=229`
- `rawMissing=53`, `rawMethodMismatch=6`
- current unresolved drift after ignore rules: `0`

### 6.1 Thu?c Qu?nh / Marketplace
- **Không phát hi?n missing/mismatch** thu?c namespace `/api/v1/marketplace/**`.

### 6.2 Thu?c Thông / non-Marketplace
- **58 endpoint-method combos** dang FE g?i nhung BE chua expose tuong ?ng (ho?c method mismatch), hi?n du?c ignore trong audit config.
- Nhóm l?n:
  - Legacy admin suppliers API (`/api/v1/admin/suppliers/**`) - 16
  - Legacy admin reports old contract (`/api/v1/admin/reports/*`) - 7
  - Legacy admin warehouses API (`/api/v1/admin/warehouses/**`) - 7
  - Sales endpoints (`/api/v1/farmer/sales*`, `/api/v1/buyer/sales`) - 5
  - Expense advanced analytics/attachments/budget tracker - 6
  - Supplies supplier command endpoints - 4
  - Quality result endpoints - 3
  - plus admin role detail/update-by-id, admin warning, admin farm update

### 6.3 Global Search (Deferred/Later)
- Missing endpoint:
  - `GET /api/v1/search` (called by `src/entities/search/api/client.ts`)

### 6.4 AI (Deferred/Later)
- Missing endpoint from FE parity audit: **0**
- Current FE AI calls are mapped to existing BE endpoints (`/api/v1/farmer/ai/*`, `/api/v1/ai/qa`), nhung feature v?n dang ? tr?ng thái deferred theo scope.

## 7) Logging backend hi?n t?i

### 7.1 Framework/config hi?n dùng
- Spring Boot default logging stack (Logback via starter), không th?y `logback-spring.xml` custom.
- `application.properties` sets console pattern:
  - `%d{yyyy-MM-dd HH:mm:ss} - %msg%n`
- Verbose DEBUG in default/dev for app and security; prod reduces levels to WARN/INFO.

### 7.2 RequestCorrelationFilter / equivalent
- **Chua có** `RequestCorrelationFilter`.
- Không tìm th?y equivalent `OncePerRequestFilter`, `HandlerInterceptor`, ho?c MDC request correlation pipeline.
- Có requestId t? phát sinh r?i rác trong service-level logs (ví d? PasswordReset/Gemini), nhung không ph?i per-request standardized cross-cutting filter.

### 7.3 So sánh v?i target Spring Boot production-like log format
- Format hi?n t?i **chua d?t** target ki?u:
  - timestamp timezone offset + level + pid + thread + logger + structured request summary
- Chua có th?ng nh?t request log line ki?u:
  - `METHOD URI -> STATUS (ms)` v?i correlation id.

## 8) Firebase chat readiness check

### 8.1 Frontend
- Không có package/import Firebase SDK trong source scan.
- Không có `firebase` service file/app init (`initializeApp`, Firestore/Realtime APIs).
- Env files không có `VITE_FIREBASE_*` keys.

### 8.2 Backend
- Không có Firebase Admin SDK dependency/config.
- Không có chat REST module riêng; chat hi?n có là AI chat qua `/api/v1/farmer/ai/chat` (Gemini service).

### 8.3 K?t lu?n
- Firebase chat integration hi?n **chua b?t d?u** ? c? FE/BE/config/env.

## 9) R?i ro làm v? ki?n trúc n?u s?a v?i
- Tr?n thêm logic vào legacy FE `src/services/*` s? tang n? FSD và làm lint gate d? hon.
- S?a `SecurityConfig` không ki?m soát th? t? matcher có th? gây h?/khóa sai RBAC.
- Ð?ng migration/schema auth (`users.user_id`) thi?u plan migration-test có th? làm v? local/prod parity.
- Ch?m Marketplace module ho?c marketplace contracts d? phá release gate c?a Qu?nh.
- C? ép chu?n log production ngay khi chua có correlation design + volume strategy s? tang noise/log cost và khó rollback.

## 10) Khu v?c thu?c Qu?nh (khuy?n ngh? không s?a)
- FE:
  - `frontend/src/features/marketplace/**`
  - `frontend/src/shared/api/marketplace/**`
  - `frontend/src/features/buyer/providers/CartProvider.tsx` và bridge/cart merge liên quan marketplace
- BE:
  - `backend/src/main/java/org/example/QuanLyMuaVu/module/marketplace/**`
  - Marketplace migrations: `V15`..`V18`
- Scripts/gates:
  - `scripts/ci-marketplace-release-gate.ps1`

## 11) Shared area ch? nên s?a t?i thi?u (n?u b?t bu?c)
- FE shared routing/auth shell: `src/app/routes.tsx`, `src/shared/api/http.ts`
- BE shared security/envelope/config: `module/shared/config/SecurityConfig.java`, `DTO/Common/ApiResponse.java`, logging config files
- Nguyên t?c: thay d?i nh?, backward-compatible, có test contract di kèm

