# ACM Service Inventory Report

This report catalogs all service classes (annotated with @Service) in the monolith backend, grouped by module/domain. This serves as a service dependency blueprint for microservice extraction.

## Module: `admin`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `AdminAlertService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminDashboardFacade` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminDashboardReadService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminDocumentService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminFarmQueryService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminIncidentService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminInventoryService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminPendingApprovalService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminPlotQueryService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminReportService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminSeasonService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminTaskService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminUserCommandService` | `org.example.QuanLyMuaVu.module.admin.service` | Admin org. |
| `AdminUserQueryService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AdminUserReportService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `AuditLogService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |
| `DocumentService` | `org.example.QuanLyMuaVu.module.admin.service` | No description provided. |

## Module: `ai`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `DiseaseSuggestionService` | `org.example.QuanLyMuaVu.module.ai.service` | No description provided. |
| `GeminiService` | `org.example.QuanLyMuaVu.module.ai.service` | No description provided. |
| `SeasonCostOptimizationService` | `org.example.QuanLyMuaVu.module.ai.service` | No description provided. |

## Module: `cropcatalog`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `CropCatalogQueryService` | `org.example.QuanLyMuaVu.module.cropcatalog.service` | No description provided. |
| `CropService` | `org.example.QuanLyMuaVu.module.cropcatalog.service` | No description provided. |
| `VarietyService` | `org.example.QuanLyMuaVu.module.cropcatalog.service` | No description provided. |

## Module: `farm`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `AddressImportService` | `org.example.QuanLyMuaVu.module.farm.service` | No description provided. |
| `AddressService` | `org.example.QuanLyMuaVu.module.farm.service` | No description provided. |
| `FarmAccessService` | `org.example.QuanLyMuaVu.module.farm.service` | No description provided. |
| `FarmerOwnershipService` | `org.example.QuanLyMuaVu.module.farm.service` | Farmer Ownership Guard Service  Implements the ownership enforcement foundation as specified: - farms. |
| `FarmQueryService` | `org.example.QuanLyMuaVu.module.farm.service` | No description provided. |
| `FarmService` | `org.example.QuanLyMuaVu.module.farm.service` | No description provided. |
| `PlotService` | `org.example.QuanLyMuaVu.module.farm.service` | No description provided. |

## Module: `financial`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `ExpenseQueryService` | `org.example.QuanLyMuaVu.module.financial.service` | No description provided. |
| `ExpenseService` | `org.example.QuanLyMuaVu.module.financial.service` | No description provided. |
| `SeasonExpenseService` | `org.example.QuanLyMuaVu.module.financial.service` | No description provided. |

## Module: `identity`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `AuthenticationResponseFactory` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |
| `AuthenticationService` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |
| `GoogleAuthService` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |
| `IdentityCommandService` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |
| `IdentityQueryService` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |
| `JwtTokenService` | `org.example.QuanLyMuaVu.module.identity.service` | Service responsible for JWT token operations. |
| `PasswordResetRateLimiter` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |
| `PasswordResetService` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |
| `PreferencesService` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |
| `RoleService` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |
| `UserService` | `org.example.QuanLyMuaVu.module.identity.service` | No description provided. |

## Module: `incident`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `IncidentCommandService` | `org.example.QuanLyMuaVu.module.incident.service` | No description provided. |
| `IncidentQueryService` | `org.example.QuanLyMuaVu.module.incident.service` | No description provided. |
| `IncidentService` | `org.example.QuanLyMuaVu.module.incident.service` | No description provided. |
| `NotificationService` | `org.example.QuanLyMuaVu.module.incident.service` | No description provided. |

## Module: `inventory`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `InventoryCommandService` | `org.example.QuanLyMuaVu.module.inventory.service` | No description provided. |
| `InventoryQueryService` | `org.example.QuanLyMuaVu.module.inventory.service` | No description provided. |
| `InventoryService` | `org.example.QuanLyMuaVu.module.inventory.service` | No description provided. |
| `ProductWarehouseService` | `org.example.QuanLyMuaVu.module.inventory.service` | No description provided. |
| `ProductWarehouseTraceabilityReadService` | `org.example.QuanLyMuaVu.module.inventory.service` | No description provided. |
| `SuppliesService` | `org.example.QuanLyMuaVu.module.inventory.service` | No description provided. |

## Module: `marketplace`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `MarketplaceImageSearchService` | `org.example.QuanLyMuaVu.module.marketplace.service` | No description provided. |
| `MarketplaceProductImageStorageService` | `org.example.QuanLyMuaVu.module.marketplace.service` | No description provided. |
| `MarketplaceService` | `org.example.QuanLyMuaVu.module.marketplace.service` | No description provided. |

## Module: `season`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `DiseaseRecordService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `FieldLogService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `HarvestQueryService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `HarvestService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `LaborManagementService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `SeasonCommandService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `SeasonHarvestService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `SeasonQueryService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `SeasonService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `SeasonStatusService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `SeasonTaskService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `SeasonValidationService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `SeasonWorkspaceAccessService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `TaskCommandService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `TaskQueryService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `TaskService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |
| `TaskWorkspaceService` | `org.example.QuanLyMuaVu.module.season.service` | No description provided. |

## Module: `shared/core`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `FirebaseChatContactService` | `org.example.QuanLyMuaVu.firebase` | No description provided. |
| `FirebaseChatTokenService` | `org.example.QuanLyMuaVu.firebase` | No description provided. |

## Module: `sustainability`

| Service Class | Package Path | Description |
| --- | --- | --- |
| `DashboardAlertsService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `DashboardKpiService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `DashboardPlotStatusReadService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `DashboardRecentActivityReadService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `DashboardService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `DashboardTaskReadService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `DashboardWeatherService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `FarmerReportService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `IrrigationWaterAnalysisService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `LegacyNutrientInputBackfillService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `NutrientInputIngestionService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `SoilTestService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `SustainabilityCalculationService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `SustainabilityDashboardContextService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `SustainabilityDashboardService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |
| `SustainabilityRecommendationService` | `org.example.QuanLyMuaVu.module.sustainability.service` | No description provided. |


