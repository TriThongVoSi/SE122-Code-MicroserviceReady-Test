# THONG_EXECUTION_PLAN_V2

## 0) Nguyên t?c th?c thi
- Gi? nguyên ki?n trúc hi?n t?i: FE React/TS/Vite/FSD; BE Spring Boot modular monolith.
- Không s?a module Marketplace c?a Qu?nh tr? shared b?t bu?c.
- Global Search và AI Assistant d?t vào `Deferred / Later` (không dua vào P0/P1).
- Firebase Chat vào k? ho?ch hi?n t?i theo hu?ng FE-first + managed realtime backend (Firebase), không m? thêm REST chat backend m?i n?u chua b?t bu?c.
- System Log chu?n Spring Boot production format: **chua implement ngay**; tru?c tiên làm feasibility + approval gate.

## 1) Khu v?c tuy?t d?i không nên s?a (Qu?nh-owned)
- FE:
  - `agricultural-crop-management-frontend/src/features/marketplace/**`
  - `agricultural-crop-management-frontend/src/shared/api/marketplace/**`
- BE:
  - `agricultural-crop-management-backend/src/main/java/org/example/QuanLyMuaVu/module/marketplace/**`
  - `agricultural-crop-management-backend/src/main/resources/db/migration/V15__marketplace_schema.sql`
  - `agricultural-crop-management-backend/src/main/resources/db/migration/V16__marketplace_payment_proof_and_filters.sql`
  - `agricultural-crop-management-backend/src/main/resources/db/migration/V17__marketplace_lot_backed_inventory.sql`
  - `agricultural-crop-management-backend/src/main/resources/db/migration/V18__marketplace_farmer_listing_quantity_and_form_options.sql`
- Gate script:
  - `scripts/ci-marketplace-release-gate.ps1`

## 2) Shared areas n?u c?n s?a thì s?a t?i thi?u
- FE shared:
  - `src/app/routes.tsx`
  - `src/shared/api/http.ts`
  - `src/shared/contexts/*` (ch? khi b?t bu?c cho chat bootstrap)
- BE shared:
  - `module/shared/config/SecurityConfig.java`
  - logging config files trong `src/main/resources/application*.{yml,properties}`
  - `DTO/Common/ApiResponse.java` (ch? khi contract bu?c ph?i d?i)

---

## P0 (uu tiên cao nh?t)

### P0-1: ?n d?nh release gate hi?n t?i (dua test baseline v? predictable)
- Module: Core quality/release gate (FE + BE)
- File d? ki?n s?a:
  - FE tests: `src/widgets/layout/lib/config.test.ts`, `src/features/shared/preferences/PreferencesForm.test.tsx`, `src/tests/AdminAlertsPage.test.tsx`, `src/tests/ExpenseManagement.test.tsx`
  - FE code liên quan n?u c?n: `src/widgets/layout/lib/config.ts`, `src/features/shared/preferences/*`, `src/pages/admin/*`, `src/features/farmer/expense-management/*`
  - BE failing tests: `src/test/java/org/example/QuanLyMuaVu/controller/AuthenticationControllerTest.java`, `AuthenticationControllerIntegrationTest.java`, `Service/*` nhóm failing suites
- Test c?n thêm/s?a:
  - Ði?u ch?nh expected theo contract th?t hi?n t?i
  - B? sung regression assertions cho các case v?a fix
- Verify commands:
  - `cd agricultural-crop-management-frontend && npm run test -- --run`
  - `cd agricultural-crop-management-backend && mvn -q test`

### P0-2: Auth/RBAC + schema/test-data alignment
- Module: identity, shared security
- File d? ki?n s?a:
  - `backend/src/main/java/org/example/QuanLyMuaVu/module/identity/entity/User.java`
  - auth test fixtures/builders trong `src/test/java/.../controller/Authentication*`
  - n?u c?n migration b? sung: `src/main/resources/db/migration/V20__...sql` (non-marketplace)
- Test c?n thêm/s?a:
  - Auth controller + integration tests
  - RBAC path protection smoke test cho farmer/admin/buyer/employee
- Verify commands:
  - `cd agricultural-crop-management-backend && mvn -q -Dtest=AuthenticationControllerTest,AuthenticationControllerIntegrationTest test`
  - `cd agricultural-crop-management-backend && mvn -q -DskipTests compile`

### P0-3: Season/Farm/Expense service-port consistency (fix NPE/exception drift)
- Module: season, farm, financial, sustainability ingress
- File d? ki?n s?a:
  - `module/season/service/SeasonService.java`
  - `module/financial/service/ExpenseService.java`
  - `module/sustainability/service/NutrientInputIngestionService.java`
  - test files tuong ?ng trong `src/test/java/.../Service/*`
- Test c?n thêm/s?a:
  - c?p nh?t mocks/ports m?i (ExpenseQueryPort/FarmQueryPort)
  - ensure exception type/message contract th?ng nh?t (AppException code-first)
- Verify commands:
  - `cd agricultural-crop-management-backend && mvn -q -Dtest=SeasonServiceTest,ExpenseServiceTest,NutrientInputIngestionServiceTest,IrrigationWaterAnalysisServiceTest,SoilTestServiceTest test`

### P0-4: Firebase Chat foundation (không t?o REST chat backend m?i)
- Module: FE chat integration + env bootstrap
- File d? ki?n s?a/t?o:
  - `frontend/package.json` (add Firebase SDK)
  - `frontend/.env.development`, `frontend/.env.production` (add `VITE_FIREBASE_*` placeholders)
  - `frontend/src/shared/chat/firebaseApp.ts` (new)
  - `frontend/src/features/chat/*` (service/hooks/ui)
  - `frontend/src/app/routes.tsx` (wire route if needed, minimal)
- Test c?n thêm/s?a:
  - unit tests cho firebase adapter v?i mocked SDK
  - integration smoke test cho chat UI state
- Verify commands:
  - `cd agricultural-crop-management-frontend && npm run typecheck`
  - `cd agricultural-crop-management-frontend && npm run test -- --run src/features/chat`
  - `cd agricultural-crop-management-frontend && npm run build`

### P0-5: System Log feasibility + approval gate (không implement runtime ngay)
- Module: shared logging/observability
- File d? ki?n t?o/s?a:
  - `docs/SYSTEM_LOG_FEASIBILITY_V1.md` (new)
  - `docs/SYSTEM_LOG_APPROVAL_PROMPT_V1.md` (new)
  - (ch? kh?o sát) `backend/src/main/resources/application.properties`, `application-prod.yml`, `module/shared/config/*`
- Test c?n thêm/s?a:
  - chua code runtime -> chua d?i test runtime
  - chu?n b? checklist test cho phase implement sau approval
- Verify commands:
  - N/A for runtime
  - optional sanity compile: `cd agricultural-crop-management-backend && mvn -q -DskipTests compile`

---

## P1 (sau khi P0 ?n d?nh)

### P1-1: Endpoint backlog non-marketplace cleanup (contract-first)
- Module: admin legacy APIs, expense/report/supplies/sales/quality-result
- File d? ki?n s?a:
  - FE legacy callers: `frontend/src/services/api.admin.tsx`, `frontend/src/entities/*/api/client.ts`
  - BE controllers/services tuong ?ng non-marketplace
  - `scripts/route-audit.config.json` (gi?m ignore khi endpoint dã có)
- Test c?n thêm/s?a:
  - FE contract tests cho client slices
  - BE controller integration tests cho endpoint m?i/di?u ch?nh
- Verify commands:
  - `node scripts/route-audit.js`
  - `cd agricultural-crop-management-backend && mvn -q test`
  - `cd agricultural-crop-management-frontend && npm run test -- --run`

### P1-2: Notification + Audit Log hardening
- Module: incident/notification/admin audit
- File d? ki?n s?a:
  - `module/incident/controller/*`, `module/incident/service/*`
  - `module/admin/service/AuditLogService.java`
- Test c?n thêm/s?a:
  - notification read/unread flow
  - audit log redaction + severity handling tests
- Verify commands:
  - `cd agricultural-crop-management-backend && mvn -q -Dtest=*Notification*,*Audit* test`

### P1-3: Documents + Reports/Dashboard quality pass
- Module: admin documents + farmer reports/dashboard + sustainability dashboards
- File d? ki?n s?a:
  - FE: `features/farmer/documents/*`, `features/farmer/reports/*`, `features/admin/dashboard/*`
  - BE: `module/admin/controller/DocumentController.java`, `module/sustainability/controller/*`, `module/admin/controller/AdminReportController.java`
- Test c?n thêm/s?a:
  - document listing/filter/pin
  - report and dashboard data-contract tests
- Verify commands:
  - `cd agricultural-crop-management-frontend && npm run test:fdn`
  - `cd agricultural-crop-management-backend && mvn -q -Dtest=*Report*,*Dashboard*,*Document* test`

### P1-4: Warehouse core + Employee/Payroll stabilization
- Module: inventory/season employee portal
- File d? ki?n s?a:
  - BE: `module/inventory/*`, `module/season/controller/EmployeePortalController.java`, `module/season/service/LaborManagementService.java`
  - FE: `pages/farmer/InventoryPage.tsx`, `pages/farmer/ProductWarehousePage.tsx`, `pages/employee/*`
- Test c?n thêm/s?a:
  - stock movement and payroll flow integration tests
- Verify commands:
  - `cd agricultural-crop-management-backend && mvn -q -Dtest=*Inventory*,*Labor*,*Payroll* test`
  - `cd agricultural-crop-management-frontend && npm run test -- --run src/tests/AdminInventoryPage.test.tsx`

### P1-5: CI/Test infra codification
- Module: scripts + CI structure
- File d? ki?n s?a/t?o:
  - `scripts/ci-fdn-gate.ps1`
  - new non-marketplace gate script: `scripts/ci-thong-gate.ps1`
  - optional GitHub workflow introduction (if repo policy allows)
- Test c?n thêm/s?a:
  - smoke checks for scripts
- Verify commands:
  - `powershell -ExecutionPolicy Bypass -File scripts/ci-fdn-gate.ps1`
  - `powershell -ExecutionPolicy Bypass -File scripts/ci-thong-gate.ps1`

---

## P2 (nâng ch?t lu?ng, không ch?n release ng?n h?n)

### P2-1: FE legacy boundary debt paydown (FSD compliance)
- Migrate away from `@/hooks/*` and `@/services/*` legacy imports in non-marketplace slices.
- Verify: `npm run lint`, `npm run typecheck`.

### P2-2: Observability phase-2 (ch? sau approval System Log)
- Implement request correlation + access log format chu?n production-like.
- Add log regression tests and performance checks.

### P2-3: Test pyramid rebalance
- Reduce flaky UI tests; increase contract and service-level tests for non-marketplace domains.

---

## Deferred / Later (không làm ? P0/P1)

### D-1: Global Search
- Deferred endpoint: `/api/v1/search`
- FE artifacts hi?n có: `entities/search/*`, `SearchResultsPage`
- Không implement BE endpoint trong giai do?n hi?n t?i.

### D-2: AI Assistant/Gemini enhancement
- Không s?a behavior/contract `AIController` + `GeminiService` ? giai do?n hi?n t?i.
- Ch? ghi nh?n r?i ro/placeholder n?u c?n trong doc, không d?i lu?ng runtime.

---

## 3) 5 task P0 d?u tiên nên làm ngay
1. Ch?t và s?a toàn b? test d? hi?n t?i (FE 4 files, BE 10 suites) d? dua baseline v? tr?ng thái reproducible.
2. S?a Auth schema/test-data mismatch gây l?i `users.user_id` và retest full auth controller/integration.
3. S?a Season/Farm/Expense service-port mismatch (null ports + exception drift) và retest nhóm service failing.
4. D?ng Firebase Chat foundation ? FE (SDK + env + adapter + hook + UI skeleton) không m? REST chat backend m?i.
5. Vi?t `SYSTEM_LOG_FEASIBILITY_V1.md` + prompt approval riêng cho b?n tru?c khi d?ng implementation log chu?n production.

