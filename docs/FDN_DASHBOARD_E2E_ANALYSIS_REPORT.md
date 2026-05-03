# Báo Cáo Phân Tích E2E: FDN Dashboard

Ngày cập nhật: 2026-04-27  
Phạm vi codebase: `SE122-Code-MicroserviceReady` (frontend + backend + migration + test)

## 1) Mục tiêu và phạm vi

Tài liệu này phân tích end-to-end cách tính năng FDN Dashboard hoạt động trong hệ thống, bao gồm:

1. Luồng đọc dữ liệu dashboard từ UI đến backend và quay lại UI.
2. Luồng ghi dữ liệu đầu vào đạm (nutrient, soil test, irrigation analysis) và cơ chế phản ánh ngược về dashboard.
3. Thuật toán tính toán FDN/NUE/N surplus/confidence/sustainability score.
4. Cơ chế bảo mật, ownership, khóa mùa vụ và ngữ nghĩa dữ liệu `measured | estimated | missing | unavailable`.
5. Nguồn dữ liệu DB, migration/backfill legacy.
6. Mức độ kiểm thử E2E/contract đang có.

## 2) Kiến trúc tổng thể FDN Dashboard

### 2.1 Frontend (Farmer Dashboard)

1. Route dashboard của farmer ở `agricultural-crop-management-frontend/src/app/routes.tsx` (xem route `/farmer/dashboard` và season workspace route).
2. Màn hình chính dashboard là `agricultural-crop-management-frontend/src/features/farmer/dashboard/index.tsx`.
3. Hook điều phối dữ liệu là `.../dashboard/hooks/useFarmerDashboard.tsx`.
4. Các panel FDN render từ dữ liệu overview:
   - KPI cards: `.../dashboard/components/FdnKpiCards.tsx`
   - Breakdown nguồn đạm: `.../dashboard/components/NitrogenInputBreakdown.tsx`
   - Alert & assistant: `.../dashboard/components/FdnAssistantPanel.tsx`
   - Historical trend: `.../dashboard/components/FdnHistoryChart.tsx`
   - Map theo thửa đất: `.../dashboard/components/FieldSustainabilityMap.tsx`

### 2.2 API layer (frontend)

1. FDN API client: `agricultural-crop-management-frontend/src/entities/dashboard/api/fdn-client.ts`.
2. React Query hooks FDN: `.../api/fdn-hooks.ts`.
3. Dashboard tasks/overview client riêng: `.../api/client.ts`, `.../api/hooks.ts`.
4. Query key chuẩn hóa: `.../model/keys.ts`.
5. Contract validation Zod (nullable semantics): `.../model/schemas.ts`.

### 2.3 Backend (Sustainability module)

1. FDN endpoints chính:
   - `GET /api/v1/dashboard/sustainability/overview`
   - `GET /api/v1/fields/map`
   - `GET /api/v1/fields/{fieldId}/sustainability-metrics`
   - `GET /api/v1/fields/{fieldId}/fdn-history`
   - `GET /api/v1/fields/{fieldId}/recommendations`
   (controller: `agricultural-crop-management-backend/src/main/java/org/example/QuanLyMuaVu/module/sustainability/controller/SustainabilityController.java`)
2. Dashboard tasks phụ trợ:
   - `GET /api/v1/dashboard/today-tasks`
   - `GET /api/v1/dashboard/upcoming-tasks`
   (controller: `.../controller/DashboardController.java`)
3. Service điều phối:
   - `SustainabilityDashboardService`
   - `SustainabilityDashboardContextService`
   - `SustainabilityCalculationService`
   - `SustainabilityDashboardMetricSupport`
   - `SustainabilityRecommendationService`

## 3) Luồng E2E đọc dữ liệu dashboard (Read path)

## 3.1 Người dùng vào dashboard

1. Farmer vào `/farmer/dashboard`, component `FarmerDashboard` mount.
2. `useFarmerDashboard()` tải:
   - Season context qua `useSeason()`.
   - FDN overview qua `useDashboardFdnOverview({ scope: 'field', seasonId })`.
   - Field map qua `useDashboardFieldMap(...)`.
   - Tasks qua `useTodayTasks(...)` và `useUpcomingTasks(...)`.

Điểm đáng chú ý:

1. Nếu chưa có season thì UI hiển thị trạng thái rỗng.
2. `overview.missingInputs` được convert thành “data completion tasks” để đẩy vào panel task (kéo data-quality sang UX hành động).

## 3.2 Frontend gọi API

1. Overview: `/api/v1/dashboard/sustainability/overview`.
2. Map: `/api/v1/fields/map`.
3. Task hôm nay: `/api/v1/dashboard/today-tasks`.
4. Task sắp tới: `/api/v1/dashboard/upcoming-tasks`.

Các response được parse qua Zod schemas để đảm bảo shape và giữ đúng null semantics.

## 3.3 Backend xử lý overview/map

1. `SustainabilityController` nhận request và gọi `SustainabilityDashboardService`.
2. `SustainabilityDashboardService.getOverview(scope, ...)`:
   - Nếu `scope=farm` -> build farm overview.
   - Mặc định -> build field overview.
3. `SustainabilityDashboardContextService` resolve context:
   - Ưu tiên `seasonId`, sau đó `fieldId`, sau đó season active gần nhất của owner.
   - Kiểm tra consistency giữa `seasonId-fieldId-farmId`, sai thì `BAD_REQUEST`.
4. `SustainabilityCalculationService.calculate(season, plot)` thực hiện tính toán lõi.
5. `SustainabilityDashboardMetricSupport` map metric status, data quality summary, normalize score, alert explanation.
6. `SustainabilityRecommendationService` tạo danh sách recommendation.

## 3.4 Backend trả DTO semantic

`SustainabilityOverviewResponse` trả về đầy đủ:

1. FDN tổng/mineral/organic + level + threshold metadata.
2. NUE, N output, N surplus.
3. Yield, current season, inputs breakdown.
4. Data quality + missing inputs + assumptions/notes.
5. Metric wrappers (`fdnTotalMetric`, `nOutputMetric`, ...) gồm `value/unit/status/confidence/calculationMode`.
6. Historical trend.

Điểm quan trọng:

1. Nếu thiếu ngữ cảnh hoặc thiếu dữ liệu đầu ra thì metric được giữ `null` + status `missing/unavailable`, không ép về `0`.
2. UI đọc status để quyết định hiển thị “Insufficient data/Unavailable” thay vì số giả.

## 3.5 Frontend render

1. `FdnKpiCards` render 6 thẻ KPI.
2. `NitrogenInputBreakdown` chỉ vẽ biểu đồ nếu có numeric input thực sự; nếu không hiển thị empty-state hành động.
3. `FdnAssistantPanel` hiển thị recommendation từ backend (không tự inject lời khuyên giả phía FE).
4. `FieldSustainabilityMap` vẽ GeoJSON lên Google Maps; nếu thiếu geometry/key thì fallback list mode.
5. `FdnHistoryChart` hiển thị trend hoặc empty-state nếu chưa có lịch sử.

## 4) Luồng E2E ghi dữ liệu và phản ánh lên dashboard (Write path)

## 4.1 Điểm nhập dữ liệu

Season workspace có 3 màn:

1. Nutrient inputs: `.../SeasonNutrientInputsWorkspace.tsx`.
2. Soil tests: `.../SeasonSoilTestsWorkspace.tsx`.
3. Irrigation water analyses: `.../SeasonIrrigationWaterAnalysesWorkspace.tsx`.

Mỗi màn có 2 submit mode:

1. Lưu và ở lại workspace (`stay`).
2. Lưu và mở dashboard (`dashboard`) -> `navigate('/farmer/dashboard')` khi success.

## 4.2 API ghi dữ liệu

Frontend client gọi:

1. `POST /api/v1/seasons/{seasonId}/nutrient-inputs`
2. `POST /api/v1/seasons/{seasonId}/soil-tests`
3. `POST /api/v1/seasons/{seasonId}/irrigation-water-analyses`

Backend controllers tương ứng đều `@PreAuthorize("hasRole('FARMER')")`.

## 4.3 Validation và ownership trên backend

Các service ingestion (`NutrientInputIngestionService`, `SoilTestService`, `IrrigationWaterAnalysisService`) đều áp dụng:

1. `requireOwnedSeason` + `requireOwnedPlot`.
2. Validate plot thuộc season.
3. Chặn ghi vào season `COMPLETED/CANCELLED/ARCHIVED`.

Riêng nutrient input:

1. Chặn legacy source `IRRIGATION_WATER` và `SOIL_LEGACY` trong luồng nhập mới.
2. Chuẩn hóa đơn vị `kg_n` và `kg_n_per_ha`.

## 4.4 Cache invalidation và refresh dashboard

Sau mutation success, frontend invalidate toàn bộ query FDN liên quan:

1. `sustainability-overview`
2. `field-map`
3. `field-metrics`
4. `field-history`
5. `field-recommendations`
6. `assistant-recommendations`

Do đó khi user về dashboard, số liệu được fetch lại và phản ánh dữ liệu vừa nhập.

## 5) Thuật toán tính FDN/NUE (Calculation path)

## 5.1 Thứ tự ưu tiên nguồn dữ liệu N đầu vào

Trong `SustainabilityCalculationService.calculate(...)`:

1. Bắt đầu từ explicit nutrient events.
2. Nếu có dedicated irrigation analyses thì override source `IRRIGATION_WATER`.
3. Nếu có dedicated soil tests thì override source `SOIL_LEGACY`.
4. Fallback estimation:
   - Ước tính fertilizer từ expense.
   - Ước tính fixation theo legume rule.
   - Ước tính irrigation theo số log `IRRIGATE`.
   - Ước tính atmospheric deposition.
   - Optional source mặc định.

Ý nghĩa: nguồn dedicated domain được ưu tiên hơn legacy aggregate để tránh double count.

## 5.2 Công thức chính

1. `FDN total = (N_mineral + N_organic) / Total_N_input * 100`.
2. `FDN mineral = N_mineral / Total_N_input * 100`.
3. `FDN organic = N_organic / Total_N_input * 100`.
4. `N output = harvest_kg * crop_N_content`.
5. `NUE = N_output / Total_N_input * 100`.
6. `N surplus = Total_N_input - N_output`.

Đơn vị:

1. Nếu có diện tích plot -> chuẩn hóa về `kg N/ha/season`.
2. Nếu thiếu diện tích -> giữ ở `kg N/season`.

## 5.3 Calculation mode

1. `exact_control` nếu có `CONTROL_SUPPLY > 0`.
2. `explicit_budget` nếu các nguồn required đều measured.
3. `hybrid_estimated` nếu có nguồn estimated/missing.

## 5.4 Confidence

1. Khởi tạo 1.0.
2. Trừ penalty theo method của từng nguồn (`missing`, `estimated`, `mixed`, `unavailable`).
3. Trừ thêm nếu thiếu diện tích.
4. Trừ thêm nếu dùng default crop N content.
5. Clamp trong `[0.10, 1.00]`.

## 5.5 Alert level và giải thích

1. Threshold lấy từ config:
   - low `< lowMaxExclusive`
   - medium `< mediumMaxExclusive`
   - high `>= mediumMaxExclusive`
2. Explanation text trả về kèm theo threshold source.

## 6) Semantics dữ liệu và hợp đồng FE/BE

## 6.1 Trạng thái metric

Hệ thống dùng 4 trạng thái:

1. `measured`
2. `estimated`
3. `missing`
4. `unavailable`

Status được backend tính từ source methods + context + yield availability, không hardcode ở frontend.

## 6.2 Null semantics (không fake zero)

1. `null` nghĩa là thiếu/ngữ cảnh không hợp lệ/không tính được.
2. `0` là giá trị thật khi phép tính hợp lệ cho ra 0.
3. FE helper `formatMetricValue` trả `null` nếu status `missing/unavailable`, tránh render `0.00` giả.

## 6.3 Contract validation

Frontend schemas giữ nhiều trường numeric ở dạng nullable (`NullableNumericSchema`) để map đúng semantics backend.

## 7) Persistence, migration và legacy backfill

## 7.1 Schema chính

1. `V11__sustainability_fdn_schema.sql`: tạo `nutrient_input_events`, `crop_nitrogen_references`, thêm `boundary_geojson`.
2. `V12__dedicated_irrigation_soil_domains.sql`: tạo `irrigation_water_analyses`, `soil_tests`.
3. `V13__legacy_aggregate_backfill_support.sql`: thêm cột `legacy_*` + unique index theo `legacy_event_id`.
4. `V19__align_nutrient_input_events_schema.sql`: bổ sung cột metadata còn thiếu theo kiểu backward-compatible.

## 7.2 Backfill chiến lược

1. `LegacyNutrientInputBackfillService` migrate legacy `IRRIGATION_WATER`/`SOIL_LEGACY` event sang dedicated tables.
2. `LegacyNutrientBackfillRunner` chạy theo config `app.sustainability.legacy-backfill.*` khi enable.
3. Hỗ trợ dry-run, filter theo season/date và sample decision log.

## 8) Test coverage hiện có chứng minh E2E

## 8.1 Frontend flow tests

1. `NutrientInputDashboardRoute.flow.test.tsx`:
   - Submit nutrient input -> điều hướng dashboard -> assert metric refresh.
2. `IrrigationSoilDashboardRoute.flow.test.tsx`:
   - Submit irrigation/soil dedicated domain -> dashboard phản ánh contribution mới.
3. `fdn-client.contract.test.ts`:
   - Validate API contract và semantic null values.
4. `DashboardFdnComponents.test.tsx`:
   - Xác nhận UI không hiển thị fake zero cho metric missing.

## 8.2 Backend tests

1. `SustainabilityCalculationServiceTest`:
   - Phủ measured path, missing yield path, true-zero semantics, threshold effect, dedicated-source override, empty context.
2. `SustainabilityDashboardServiceTest`:
   - Contract overview/map/recommendation, metadata source, null semantics.
3. `SustainabilityControllerTest`:
   - Contract HTTP shape, semantic null persistence, stable keys.
4. `SustainabilityRecommendationServiceTest`:
   - Rule theo confidence và mức dependency.

## 9) Nhận định kiến trúc và điểm mạnh

1. Phân lớp rõ: controller -> orchestration service -> context -> calculation -> metric support.
2. Ownership và role guard nhất quán ở cả read và write.
3. Dữ liệu FDN dashboard có traceability tốt (`thresholdSource`, `recommendationSource`, `calculationMode`, `dataQuality`).
4. Null semantics được giữ xuyên suốt FE/BE/test, giảm sai lệch diễn giải nghiệp vụ.
5. Có chiến lược chuyển đổi dữ liệu legacy sang domain chuyên biệt.

## 10) Rủi ro/khoảng trống kỹ thuật cần lưu ý

1. Encoding i18n tiếng Việt trong một số file FE đang có dấu hiệu mojibake, cần chuẩn hóa UTF-8 để tránh lỗi hiển thị.
2. Map phụ thuộc `VITE_GOOGLE_MAPS_API_KEY`; khi thiếu key thì fallback list đã có, nhưng cần giám sát telemetry cho tỷ lệ fallback.
3. Một số default estimation có ảnh hưởng mạnh đến confidence và recommendation, cần governance khi thay đổi config production.

## 11) Danh sách endpoint FDN liên quan (tổng hợp)

1. `GET /api/v1/dashboard/sustainability/overview`
2. `GET /api/v1/fields/map`
3. `GET /api/v1/fields/{fieldId}/sustainability-metrics`
4. `GET /api/v1/fields/{fieldId}/fdn-history`
5. `GET /api/v1/fields/{fieldId}/recommendations`
6. `POST /api/v1/seasons/{seasonId}/nutrient-inputs`
7. `GET /api/v1/seasons/{seasonId}/nutrient-inputs`
8. `POST /api/v1/seasons/{seasonId}/soil-tests`
9. `GET /api/v1/seasons/{seasonId}/soil-tests`
10. `POST /api/v1/seasons/{seasonId}/irrigation-water-analyses`
11. `GET /api/v1/seasons/{seasonId}/irrigation-water-analyses`
12. `GET /api/v1/dashboard/today-tasks`
13. `GET /api/v1/dashboard/upcoming-tasks`

## 12) Kết luận E2E

FDN Dashboard hiện đang vận hành theo kiến trúc dữ liệu khá chặt chẽ:

1. Dữ liệu nhập từ season workspace đi qua validation/ownership, ghi DB, invalidate cache, và hiển thị lại tức thời trên dashboard.
2. Backend giữ vai trò source-of-truth cho công thức + ngữ nghĩa metric + recommendation.
3. Frontend tập trung vào orchestration query + UX hiển thị theo status, tránh diễn giải sai số liệu.
4. Hệ thống đã có test flow/contract đủ tốt để bảo vệ regression cho các đường E2E quan trọng.
