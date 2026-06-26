{
  "controllers": [
    {
      "className": "HealthController",
      "module": "root",
      "basePath": "/api/v1/public",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/public/health",
          "methodName": "health"
        }
      ]
    },
    {
      "className": "FirebaseChatTokenController",
      "module": "firebase",
      "basePath": "/api/v1/firebase",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/firebase/chat-token",
          "methodName": "createChatToken"
        },
        {
          "method": "GET",
          "path": "/api/v1/firebase/chat-contacts",
          "methodName": "getChatContacts"
        }
      ]
    },
    {
      "className": "AdminAlertController",
      "module": "admin",
      "basePath": "/api/v1/admin/alerts",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/alerts",
          "methodName": "listAlerts"
        },
        {
          "method": "POST",
          "path": "/api/v1/admin/alerts/refresh",
          "methodName": "refreshAlerts"
        },
        {
          "method": "POST",
          "path": "/api/v1/admin/alerts/{id}/send",
          "methodName": "sendAlert"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/admin/alerts/{id}/status",
          "methodName": "updateStatus"
        }
      ]
    },
    {
      "className": "AdminAuditLogController",
      "module": "admin",
      "basePath": "/api/v1/admin/audit-logs",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/audit-logs",
          "methodName": "listAuditLogs"
        }
      ]
    },
    {
      "className": "AdminCropController",
      "module": "admin",
      "basePath": "/api/v1/admin/crops",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/crops",
          "methodName": "listCrops"
        },
        {
          "method": "POST",
          "path": "/api/v1/admin/crops",
          "methodName": "createCrop"
        },
        {
          "method": "PUT",
          "path": "/api/v1/admin/crops/{id}",
          "methodName": "updateCrop"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/admin/crops/{id}",
          "methodName": "deleteCrop"
        }
      ]
    },
    {
      "className": "AdminDashboardController",
      "module": "admin",
      "basePath": "/api/v1/admin",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/dashboard-stats",
          "methodName": "getDashboardStats"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/dashboard/pending-approvals",
          "methodName": "getPendingApprovals"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/dashboard/inventory-health",
          "methodName": "getInventoryHealth"
        }
      ]
    },
    {
      "className": "AdminDocumentController",
      "module": "admin",
      "basePath": "/api/v1/admin/documents",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/documents",
          "methodName": "listDocuments"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/documents/{id}",
          "methodName": "getDocumentById"
        },
        {
          "method": "POST",
          "path": "/api/v1/admin/documents",
          "methodName": "createDocument"
        },
        {
          "method": "PUT",
          "path": "/api/v1/admin/documents/{id}",
          "methodName": "updateDocument"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/admin/documents/{id}",
          "methodName": "softDeleteDocument"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/admin/documents/{id}/permanent",
          "methodName": "hardDeleteDocument"
        }
      ]
    },
    {
      "className": "AdminFarmController",
      "module": "admin",
      "basePath": "/api/v1/admin/farms",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/farms",
          "methodName": "getAllFarms"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/farms/stats",
          "methodName": "getFarmStats"
        }
      ]
    },
    {
      "className": "AdminIncidentController",
      "module": "admin",
      "basePath": "/api/v1/admin/incidents",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/incidents",
          "methodName": "listAllIncidents"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/incidents/{id}",
          "methodName": "getIncidentDetail"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/admin/incidents/{id}/triage",
          "methodName": "triageIncident"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/admin/incidents/{id}/resolve",
          "methodName": "resolveIncident"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/admin/incidents/{id}/cancel",
          "methodName": "cancelIncident"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/admin/incidents/{id}/status",
          "methodName": "updateIncidentStatus"
        }
      ]
    },
    {
      "className": "AdminInventoryController",
      "module": "admin",
      "basePath": "/api/v1/admin/inventory",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/inventory/options",
          "methodName": "getOptions"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/inventory/lots",
          "methodName": "listRiskLots"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/inventory/lots/{lotId}",
          "methodName": "getLotDetail"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/inventory/lots/{lotId}/movements",
          "methodName": "getLotMovements"
        }
      ]
    },
    {
      "className": "AdminPlotController",
      "module": "admin",
      "basePath": "/api/v1/admin/plots",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/plots",
          "methodName": "listAllPlots"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/plots/{id}",
          "methodName": "getPlot"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/plots/{id}/seasons",
          "methodName": "listPlotSeasons"
        }
      ]
    },
    {
      "className": "AdminReportController",
      "module": "admin",
      "basePath": "/api/v1/admin/reports",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/reports/yield",
          "methodName": "getYieldReport"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/reports/cost",
          "methodName": "getCostReport"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/reports/revenue",
          "methodName": "getRevenueReport"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/reports/profit",
          "methodName": "getProfitReport"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/reports/summary",
          "methodName": "getSummary"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/reports/export",
          "methodName": "exportReport"
        }
      ]
    },
    {
      "className": "AdminRoleController",
      "module": "admin",
      "basePath": "/api/v1/admin/roles",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/admin/roles",
          "methodName": ""
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/roles",
          "methodName": ""
        },
        {
          "method": "DELETE",
          "path": "/api/v1/admin/roles/{roleCode}",
          "methodName": ""
        }
      ]
    },
    {
      "className": "AdminSeasonController",
      "module": "admin",
      "basePath": "/api/v1/admin/seasons",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/seasons",
          "methodName": "listAllSeasons"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/seasons/{id}",
          "methodName": "getSeasonDetail"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/seasons/{id}/pending-task-count",
          "methodName": "getPendingTaskCount"
        },
        {
          "method": "PUT",
          "path": "/api/v1/admin/seasons/{id}",
          "methodName": "updateSeason"
        }
      ]
    },
    {
      "className": "AdminTaskController",
      "module": "admin",
      "basePath": "/api/v1/admin/tasks",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/tasks",
          "methodName": "listAllTasks"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/tasks/{id}",
          "methodName": "getTask"
        },
        {
          "method": "PUT",
          "path": "/api/v1/admin/tasks/{id}",
          "methodName": "updateTask"
        }
      ]
    },
    {
      "className": "AdminUserController",
      "module": "admin",
      "basePath": "/api/v1/admin/users",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/users",
          "methodName": "getAllUsers"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/users/{id}",
          "methodName": "getUserById"
        },
        {
          "method": "POST",
          "path": "/api/v1/admin/users",
          "methodName": "createUser"
        },
        {
          "method": "PUT",
          "path": "/api/v1/admin/users/{id}",
          "methodName": "updateUser"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/admin/users/{id}/status",
          "methodName": "updateStatus"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/admin/users/{id}/password",
          "methodName": "resetPassword"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/users/{id}/can-delete",
          "methodName": "canDelete"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/admin/users/{id}",
          "methodName": "deleteUser"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/users/roles",
          "methodName": "getAllRoles"
        }
      ]
    },
    {
      "className": "AdminUserReportController",
      "module": "admin",
      "basePath": "/api/v1/admin/reports/users",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/reports/users/summary",
          "methodName": "getUserSummaryReport"
        }
      ]
    },
    {
      "className": "AdminVarietyController",
      "module": "admin",
      "basePath": "/api/v1/admin/varieties",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/varieties",
          "methodName": "listVarieties"
        },
        {
          "method": "GET",
          "path": "/api/v1/admin/varieties/{id}",
          "methodName": "getVariety"
        },
        {
          "method": "POST",
          "path": "/api/v1/admin/varieties",
          "methodName": "createVariety"
        },
        {
          "method": "PUT",
          "path": "/api/v1/admin/varieties/{id}",
          "methodName": "updateVariety"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/admin/varieties/{id}",
          "methodName": "deleteVariety"
        }
      ]
    },
    {
      "className": "DocumentController",
      "module": "admin",
      "basePath": "/api/v1/documents",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/documents",
          "methodName": "list"
        },
        {
          "method": "GET",
          "path": "/api/v1/documents/{id}",
          "methodName": "getById"
        },
        {
          "method": "POST",
          "path": "/api/v1/documents/{id}/open",
          "methodName": "recordOpen"
        },
        {
          "method": "POST",
          "path": "/api/v1/documents/{id}/favorite",
          "methodName": "addFavorite"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/documents/{id}/favorite",
          "methodName": "removeFavorite"
        }
      ]
    },
    {
      "className": "AIController",
      "module": "ai",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/ai/qa",
          "methodName": ""
        }
      ]
    },
    {
      "className": "ChatController",
      "module": "ai",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/farmer/ai/chat",
          "methodName": "chat"
        },
        {
          "method": "POST",
          "path": "/api/v1/buyer/ai/chat",
          "methodName": "buyerChat"
        }
      ]
    },
    {
      "className": "CatalogController",
      "module": "cropcatalog",
      "basePath": "/api/v1/catalog",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/catalog/crops",
          "methodName": "getAllCrops"
        },
        {
          "method": "GET",
          "path": "/api/v1/catalog/crops/{cropId}/varieties",
          "methodName": "getVarietiesByCrop"
        }
      ]
    },
    {
      "className": "CropController",
      "module": "cropcatalog",
      "basePath": "/api/v1/crops",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/crops",
          "methodName": "listCrops"
        },
        {
          "method": "POST",
          "path": "/api/v1/crops",
          "methodName": "createCrop"
        },
        {
          "method": "GET",
          "path": "/api/v1/crops/{id}",
          "methodName": "getCrop"
        },
        {
          "method": "PUT",
          "path": "/api/v1/crops/{id}",
          "methodName": "updateCrop"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/crops/{id}",
          "methodName": "deleteCrop"
        }
      ]
    },
    {
      "className": "VarietyController",
      "module": "cropcatalog",
      "basePath": "/api/v1/varieties",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/varieties/{id}",
          "methodName": "get"
        },
        {
          "method": "GET",
          "path": "/api/v1/varieties/by-crop/{cropId}",
          "methodName": "listByCrop"
        }
      ]
    },
    {
      "className": "AddressController",
      "module": "farm",
      "basePath": "/api/v1/address",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/address/provinces",
          "methodName": "listProvinces"
        },
        {
          "method": "GET",
          "path": "/api/v1/address/provinces/{id}",
          "methodName": "getProvince"
        },
        {
          "method": "GET",
          "path": "/api/v1/address/provinces/{provinceId}/wards",
          "methodName": "listWardsByProvince"
        },
        {
          "method": "GET",
          "path": "/api/v1/address/wards/{id}",
          "methodName": "getWard"
        },
        {
          "method": "GET",
          "path": "/api/v1/address/stats",
          "methodName": "getStats"
        }
      ]
    },
    {
      "className": "FarmController",
      "module": "farm",
      "basePath": "/api/v1/farms",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/farms",
          "methodName": "getMyFarms"
        },
        {
          "method": "POST",
          "path": "/api/v1/farms",
          "methodName": "createFarm"
        },
        {
          "method": "GET",
          "path": "/api/v1/farms/{farmId}",
          "methodName": "getFarmDetail"
        },
        {
          "method": "PUT",
          "path": "/api/v1/farms/{farmId}",
          "methodName": "updateFarm"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/farms/{farmId}",
          "methodName": "deleteFarm"
        }
      ]
    },
    {
      "className": "LocationController",
      "module": "farm",
      "basePath": "/api/v1/locations",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/locations/provinces",
          "methodName": "getAllProvinces"
        },
        {
          "method": "GET",
          "path": "/api/v1/locations/wards",
          "methodName": "getWardsByProvince"
        }
      ]
    },
    {
      "className": "PlotController",
      "module": "farm",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/farms/{farmId}/plots",
          "methodName": "listPlotsByFarm"
        },
        {
          "method": "POST",
          "path": "/api/v1/farms/{farmId}/plots",
          "methodName": "createPlot"
        },
        {
          "method": "GET",
          "path": "/api/v1/plots",
          "methodName": "listAllPlots"
        },
        {
          "method": "GET",
          "path": "/api/v1/plots/{id}",
          "methodName": "getPlot"
        },
        {
          "method": "PUT",
          "path": "/api/v1/plots/{id}",
          "methodName": "updatePlot"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/plots/{id}",
          "methodName": "deletePlot"
        }
      ]
    },
    {
      "className": "ExpenseController",
      "module": "financial",
      "basePath": "/api/v1/expenses",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/expenses",
          "methodName": "listAllExpenses"
        }
      ]
    },
    {
      "className": "SeasonExpenseController",
      "module": "financial",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/seasons/{seasonId}/expenses",
          "methodName": "createExpense"
        },
        {
          "method": "GET",
          "path": "/api/v1/expenses/{id}",
          "methodName": "getExpense"
        },
        {
          "method": "PUT",
          "path": "/api/v1/expenses/{id}",
          "methodName": "updateExpense"
        },
        {
          "method": "GET",
          "path": "/api/v1/expenses/{id}/delete-confirmation",
          "methodName": "getDeleteConfirmation"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/expenses/{id}",
          "methodName": "deleteExpense"
        },
        {
          "method": "GET",
          "path": "/api/v1/expenses/search",
          "methodName": "searchExpenses"
        },
        {
          "method": "GET",
          "path": "/api/v1/seasons/{seasonId}/expenses",
          "methodName": "listExpenses"
        }
      ]
    },
    {
      "className": "AuthenticationController",
      "module": "identity",
      "basePath": "/api/v1/auth",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/auth/sign-in",
          "methodName": ""
        },
        {
          "method": "POST",
          "path": "/api/v1/auth/google",
          "methodName": ""
        },
        {
          "method": "GET",
          "path": "/api/v1/auth/me",
          "methodName": ""
        },
        {
          "method": "POST",
          "path": "/api/v1/auth/sign-up",
          "methodName": ""
        },
        {
          "method": "POST",
          "path": "/api/v1/auth/introspect",
          "methodName": ""
        },
        {
          "method": "POST",
          "path": "/api/v1/auth/refresh",
          "methodName": ""
        },
        {
          "method": "POST",
          "path": "/api/v1/auth/sign-out",
          "methodName": ""
        }
      ]
    },
    {
      "className": "PasswordResetController",
      "module": "identity",
      "basePath": "/api/v1/auth",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/auth/forgot-password",
          "methodName": "forgotPassword"
        },
        {
          "method": "POST",
          "path": "/api/v1/auth/reset-password",
          "methodName": "resetPassword"
        },
        {
          "method": "GET",
          "path": "/api/v1/auth/reset-password/validate",
          "methodName": "validateResetToken"
        }
      ]
    },
    {
      "className": "PreferencesController",
      "module": "identity",
      "basePath": "/api/v1/preferences",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/preferences/me",
          "methodName": "getMyPreferences"
        },
        {
          "method": "PUT",
          "path": "/api/v1/preferences/me",
          "methodName": "updateMyPreferences"
        }
      ]
    },
    {
      "className": "UserController",
      "module": "identity",
      "basePath": "/api/v1/user",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/user/me",
          "methodName": "me"
        },
        {
          "method": "PUT",
          "path": "/api/v1/user/profile",
          "methodName": "updateProfile"
        },
        {
          "method": "PUT",
          "path": "/api/v1/user/change-password",
          "methodName": "changePassword"
        }
      ]
    },
    {
      "className": "FarmerNotificationController",
      "module": "incident",
      "basePath": "/api/v1/farmer/notifications",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/farmer/notifications",
          "methodName": "list"
        },
        {
          "method": "GET",
          "path": "/api/v1/farmer/notifications/unread-count",
          "methodName": "unreadCount"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/farmer/notifications/{id}/read",
          "methodName": "markRead"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/farmer/notifications/read-all",
          "methodName": "markAllRead"
        }
      ]
    },
    {
      "className": "IncidentController",
      "module": "incident",
      "basePath": "/api/v1/incidents",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/incidents",
          "methodName": "listIncidents"
        },
        {
          "method": "GET",
          "path": "/api/v1/incidents/{id}",
          "methodName": "getIncident"
        },
        {
          "method": "POST",
          "path": "/api/v1/incidents",
          "methodName": "createIncident"
        },
        {
          "method": "PUT",
          "path": "/api/v1/incidents/{id}",
          "methodName": "updateIncident"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/incidents/{id}/status",
          "methodName": "updateIncidentStatus"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/incidents/{id}",
          "methodName": "deleteIncident"
        },
        {
          "method": "GET",
          "path": "/api/v1/incidents/summary",
          "methodName": "getIncidentSummary"
        }
      ]
    },
    {
      "className": "NotificationController",
      "module": "incident",
      "basePath": "/api/v1/notifications",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/notifications",
          "methodName": "list"
        },
        {
          "method": "GET",
          "path": "/api/v1/notifications/unread-count",
          "methodName": "unreadCount"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/notifications/{id}/read",
          "methodName": "markRead"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/notifications/read-all",
          "methodName": "markAllRead"
        }
      ]
    },
    {
      "className": "InventoryController",
      "module": "inventory",
      "basePath": "/api/v1/inventory",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/inventory/warehouses/my",
          "methodName": "getMyWarehouses"
        },
        {
          "method": "GET",
          "path": "/api/v1/inventory/warehouses/{warehouseId}",
          "methodName": "getWarehouseById"
        },
        {
          "method": "POST",
          "path": "/api/v1/inventory/warehouses",
          "methodName": "createWarehouse"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/inventory/warehouses/{warehouseId}",
          "methodName": "updateWarehouse"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/inventory/warehouses/{warehouseId}",
          "methodName": "deleteWarehouse"
        },
        {
          "method": "GET",
          "path": "/api/v1/inventory/locations",
          "methodName": "getLocationsByWarehouse"
        },
        {
          "method": "GET",
          "path": "/api/v1/inventory/on-hand",
          "methodName": "getOnHand"
        },
        {
          "method": "GET",
          "path": "/api/v1/inventory/movements",
          "methodName": "getMovements"
        },
        {
          "method": "POST",
          "path": "/api/v1/inventory/movements",
          "methodName": "recordMovement"
        },
        {
          "method": "GET",
          "path": "/api/v1/inventory/lots/{lotId}/on-hand",
          "methodName": "getOnHandQuantity"
        }
      ]
    },
    {
      "className": "ProductWarehouseController",
      "module": "inventory",
      "basePath": "/api/v1/product-warehouses",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/product-warehouses/overview",
          "methodName": "getOverview"
        },
        {
          "method": "GET",
          "path": "/api/v1/product-warehouses/lots",
          "methodName": "listLots"
        },
        {
          "method": "GET",
          "path": "/api/v1/product-warehouses/lots/{id}",
          "methodName": "getLot"
        },
        {
          "method": "POST",
          "path": "/api/v1/product-warehouses/lots",
          "methodName": "createLot"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/product-warehouses/lots/{id}",
          "methodName": "updateLot"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/product-warehouses/lots/{id}",
          "methodName": "archiveLot"
        },
        {
          "method": "POST",
          "path": "/api/v1/product-warehouses/lots/{id}/adjust",
          "methodName": "adjustLot"
        },
        {
          "method": "POST",
          "path": "/api/v1/product-warehouses/lots/{id}/stock-out",
          "methodName": "stockOutLot"
        },
        {
          "method": "GET",
          "path": "/api/v1/product-warehouses/transactions",
          "methodName": "listTransactions"
        },
        {
          "method": "GET",
          "path": "/api/v1/product-warehouses/lots/{id}/traceability",
          "methodName": "getTraceability"
        }
      ]
    },
    {
      "className": "SuppliesController",
      "module": "inventory",
      "basePath": "/api/v1/supplies",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/supplies/suppliers",
          "methodName": "getSuppliers"
        },
        {
          "method": "POST",
          "path": "/api/v1/supplies/suppliers",
          "methodName": "createSupplier"
        },
        {
          "method": "GET",
          "path": "/api/v1/supplies/items",
          "methodName": "getSupplyItems"
        },
        {
          "method": "POST",
          "path": "/api/v1/supplies/items",
          "methodName": "createSupplyItem"
        },
        {
          "method": "GET",
          "path": "/api/v1/supplies/lots",
          "methodName": "getSupplyLots"
        },
        {
          "method": "POST",
          "path": "/api/v1/supplies/stock-in",
          "methodName": "stockIn"
        }
      ]
    },
    {
      "className": "MarketplaceAdminController",
      "module": "marketplace",
      "basePath": "/api/v1/marketplace/admin",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/marketplace/admin/products",
          "methodName": "listProducts"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/admin/products/{productId}",
          "methodName": "getProductDetail"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/marketplace/admin/products/{productId}/status",
          "methodName": "updateProductStatus"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/admin/orders",
          "methodName": "listOrders"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/admin/orders/{orderId}",
          "methodName": "getOrderDetail"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/marketplace/admin/orders/{orderId}/payment-verification",
          "methodName": "updatePaymentVerification"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/marketplace/admin/orders/{orderId}/status",
          "methodName": "updateOrderStatus"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/admin/orders/{orderId}/audit-logs",
          "methodName": "getOrderAuditLogs"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/admin/stats",
          "methodName": "getStats"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/marketplace/admin/reviews/{reviewId}/hide",
          "methodName": "hideReview"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/marketplace/admin/reviews/{reviewId}",
          "methodName": "deleteReview"
        }
      ]
    },
    {
      "className": "MarketplaceAdminPaymentProofController",
      "module": "marketplace",
      "basePath": "/api/v1/admin/marketplace/payment-proofs",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/admin/marketplace/payment-proofs",
          "methodName": "listPaymentProofs"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/admin/marketplace/payment-proofs/{orderId}/verify",
          "methodName": "verifyPaymentProof"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/admin/marketplace/payment-proofs/{orderId}/reject",
          "methodName": "rejectPaymentProof"
        }
      ]
    },
    {
      "className": "MarketplaceBuyerAddressAliasController",
      "module": "marketplace",
      "basePath": "/api/v1/buyer/addresses",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/buyer/addresses",
          "methodName": "listAddresses"
        },
        {
          "method": "POST",
          "path": "/api/v1/buyer/addresses",
          "methodName": "createAddress"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/buyer/addresses/{addressId}",
          "methodName": "updateAddress"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/buyer/addresses/{addressId}",
          "methodName": "deleteAddress"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/buyer/addresses/{addressId}/default",
          "methodName": "setDefaultAddress"
        }
      ]
    },
    {
      "className": "MarketplaceBuyerImageSearchController",
      "module": "marketplace",
      "basePath": "/api/v1/buyer/marketplace/image-search",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/buyer/marketplace/image-search/analyze",
          "methodName": "analyze"
        },
        {
          "method": "POST",
          "path": "/api/v1/buyer/marketplace/image-search",
          "methodName": "search"
        }
      ]
    },
    {
      "className": "MarketplaceBuyerOrderAliasController",
      "module": "marketplace",
      "basePath": "/api/v1/buyer/orders",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/buyer/orders/preview",
          "methodName": "previewOrder"
        },
        {
          "method": "POST",
          "path": "/api/v1/buyer/orders",
          "methodName": "createOrder"
        },
        {
          "method": "GET",
          "path": "/api/v1/buyer/orders",
          "methodName": "listOrders"
        },
        {
          "method": "GET",
          "path": "/api/v1/buyer/orders/{orderId}",
          "methodName": "getOrderDetail"
        },
        {
          "method": "PUT",
          "path": "/api/v1/buyer/orders/{orderId}/cancel",
          "methodName": "cancelOrder"
        },
        {
          "method": "POST",
          "path": "/api/v1/buyer/orders/{orderId}/cancel",
          "methodName": "cancelOrderPost"
        },
        {
          "method": "POST",
          "path": "/api/v1/buyer/orders/{orderId}/payment-proof",
          "methodName": "uploadPaymentProof"
        },
        {
          "method": "GET",
          "path": "/api/v1/buyer/orders/{orderId}/payment-proof",
          "methodName": "getPaymentProof"
        },
        {
          "method": "GET",
          "path": "/api/v1/buyer/orders/{orderId}/items/{itemId}/traceability",
          "methodName": "getOrderItemTraceability"
        }
      ]
    },
    {
      "className": "MarketplaceBuyerReviewController",
      "module": "marketplace",
      "basePath": "/api/v1/buyer",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/buyer/orders/{orderId}/reviews",
          "methodName": "createReview"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/buyer/reviews/{reviewId}",
          "methodName": "editReview"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/buyer/reviews/{reviewId}",
          "methodName": "deleteReview"
        }
      ]
    },
    {
      "className": "MarketplaceController",
      "module": "marketplace",
      "basePath": "/api/v1/marketplace",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/marketplace/products",
          "methodName": "listProducts"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/products/{slug}",
          "methodName": "getProductBySlug"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/product-images/{fileName:.+}",
          "methodName": "getProductImage"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/products/{productId}/reviews",
          "methodName": "listProductReviews"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/farms",
          "methodName": "listFarms"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/farms/{farmId}",
          "methodName": "getFarmDetail"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/farms/{farmId}/reviews",
          "methodName": "listFarmReviews"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/products/{productId}/traceability",
          "methodName": "getProductTraceability"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/traceability/{productId}",
          "methodName": "getTraceabilityLegacy"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/cart",
          "methodName": "getCart"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/cart/items",
          "methodName": "addCartItem"
        },
        {
          "method": "PUT",
          "path": "/api/v1/marketplace/cart/items/{productId}",
          "methodName": "updateCartItem"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/marketplace/cart/items/{productId}",
          "methodName": "patchCartItem"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/marketplace/cart/items/{productId}",
          "methodName": "removeCartItem"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/cart/merge",
          "methodName": "mergeCart"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/marketplace/cart",
          "methodName": "clearCart"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/orders/preview",
          "methodName": "previewOrder"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/orders",
          "methodName": "createOrder"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/orders/{orderId}/payment-proof",
          "methodName": "uploadPaymentProof"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/orders",
          "methodName": "listOrders"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/orders/{orderId}",
          "methodName": "getOrderDetail"
        },
        {
          "method": "PUT",
          "path": "/api/v1/marketplace/orders/{orderId}/cancel",
          "methodName": "cancelOrderPut"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/orders/{orderId}/cancel",
          "methodName": "cancelOrderPost"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/addresses",
          "methodName": "listAddresses"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/addresses",
          "methodName": "createAddress"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/marketplace/addresses/{addressId}",
          "methodName": "updateAddress"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/marketplace/addresses/{addressId}/default",
          "methodName": "setDefaultAddress"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/marketplace/addresses/{addressId}",
          "methodName": "deleteAddress"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/reviews",
          "methodName": "createReview"
        }
      ]
    },
    {
      "className": "MarketplaceFarmerController",
      "module": "marketplace",
      "basePath": "/api/v1/marketplace/farmer",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/marketplace/farmer/dashboard",
          "methodName": "getDashboard"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/farmer/products",
          "methodName": "listProducts"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/farmer/product-form-options",
          "methodName": "getProductFormOptions"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/farmer/products/{productId}",
          "methodName": "getProductDetail"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/farmer/products",
          "methodName": "createProduct"
        },
        {
          "method": "POST",
          "path": "/api/v1/marketplace/farmer/product-images",
          "methodName": "uploadProductImage"
        },
        {
          "method": "PUT",
          "path": "/api/v1/marketplace/farmer/products/{productId}",
          "methodName": "updateProduct"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/marketplace/farmer/products/{productId}/status",
          "methodName": "updateProductStatus"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/farmer/orders",
          "methodName": "listOrders"
        },
        {
          "method": "GET",
          "path": "/api/v1/marketplace/farmer/orders/{orderId}",
          "methodName": "getOrderDetail"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/marketplace/farmer/orders/{orderId}/status",
          "methodName": "updateOrderStatus"
        }
      ]
    },
    {
      "className": "MarketplaceFarmerOrderAliasController",
      "module": "marketplace",
      "basePath": "/api/v1/farmer/orders",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/farmer/orders",
          "methodName": "listOrders"
        },
        {
          "method": "GET",
          "path": "/api/v1/farmer/orders/{orderId}",
          "methodName": "getOrderDetail"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/farmer/orders/{orderId}/status",
          "methodName": "updateOrderStatus"
        }
      ]
    },
    {
      "className": "DiseaseRecordController",
      "module": "season",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/seasons/{seasonId}/disease-records",
          "methodName": "listDiseaseRecordsBySeason"
        },
        {
          "method": "POST",
          "path": "/api/v1/seasons/{seasonId}/disease-records",
          "methodName": "createDiseaseRecord"
        },
        {
          "method": "GET",
          "path": "/api/v1/disease-records/{id}",
          "methodName": "getDiseaseRecordDetail"
        },
        {
          "method": "PUT",
          "path": "/api/v1/disease-records/{id}",
          "methodName": "updateDiseaseRecord"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/disease-records/{id}",
          "methodName": "deleteDiseaseRecord"
        },
        {
          "method": "GET",
          "path": "/api/v1/disease-records/{id}/treatments",
          "methodName": "listTreatments"
        },
        {
          "method": "POST",
          "path": "/api/v1/disease-records/{id}/treatments",
          "methodName": "createTreatment"
        },
        {
          "method": "PUT",
          "path": "/api/v1/disease-treatments/{id}",
          "methodName": "updateTreatment"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/disease-treatments/{id}",
          "methodName": "deleteTreatment"
        },
        {
          "method": "POST",
          "path": "/api/v1/disease-records/{id}/ai-suggestion",
          "methodName": "generateAiSuggestion"
        }
      ]
    },
    {
      "className": "EmployeePortalController",
      "module": "season",
      "basePath": "/api/v1/employee",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/employee/tasks",
          "methodName": "listAssignedTasks"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/seasons/{seasonId}/plan",
          "methodName": "getSeasonPlan"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/seasons",
          "methodName": "listAssignedSeasons"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/employee/tasks/{taskId}/accept",
          "methodName": "acceptTask"
        },
        {
          "method": "POST",
          "path": "/api/v1/employee/tasks/{taskId}/progress",
          "methodName": "reportProgress"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/progress",
          "methodName": "listMyProgress"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/payroll",
          "methodName": "listMyPayroll"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/payroll/{payrollRecordId}",
          "methodName": "getMyPayrollDetail"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/seasons/{seasonId}/field-logs",
          "methodName": "listFieldLogs"
        },
        {
          "method": "POST",
          "path": "/api/v1/employee/seasons/{seasonId}/field-logs",
          "methodName": "createFieldLog"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/field-logs/{id}",
          "methodName": "getFieldLog"
        },
        {
          "method": "PUT",
          "path": "/api/v1/employee/field-logs/{id}",
          "methodName": "updateFieldLog"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/employee/field-logs/{id}",
          "methodName": "deleteFieldLog"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/seasons/{seasonId}/disease-records",
          "methodName": "listDiseaseRecords"
        },
        {
          "method": "POST",
          "path": "/api/v1/employee/seasons/{seasonId}/disease-records",
          "methodName": "createDiseaseRecord"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/disease-records/{id}",
          "methodName": "getDiseaseRecordDetail"
        },
        {
          "method": "PUT",
          "path": "/api/v1/employee/disease-records/{id}",
          "methodName": "updateDiseaseRecord"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/employee/disease-records/{id}",
          "methodName": "deleteDiseaseRecord"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/disease-records/{id}/treatments",
          "methodName": "listTreatments"
        },
        {
          "method": "POST",
          "path": "/api/v1/employee/disease-records/{id}/treatments",
          "methodName": "createTreatment"
        },
        {
          "method": "PUT",
          "path": "/api/v1/employee/disease-treatments/{id}",
          "methodName": "updateTreatment"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/employee/disease-treatments/{id}",
          "methodName": "deleteTreatment"
        },
        {
          "method": "POST",
          "path": "/api/v1/employee/disease-records/{id}/ai-suggestion",
          "methodName": "generateAiSuggestion"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/seasons/{seasonId}/supplies/items",
          "methodName": "listSeasonSupplyItems"
        },
        {
          "method": "GET",
          "path": "/api/v1/employee/seasons/{seasonId}/supplies/lots",
          "methodName": "listSeasonSupplyLots"
        }
      ]
    },
    {
      "className": "FarmerLaborManagementController",
      "module": "season",
      "basePath": "/api/v1/farmer/labor",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/farmer/labor/employees/directory",
          "methodName": "listEmployeeDirectory"
        },
        {
          "method": "GET",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/employees",
          "methodName": "listSeasonEmployees"
        },
        {
          "method": "POST",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/employees",
          "methodName": "addSeasonEmployee"
        },
        {
          "method": "POST",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/employees/bulk",
          "methodName": "bulkAssignSeasonEmployees"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/employees/{employeeUserId}",
          "methodName": "updateSeasonEmployee"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/employees/{employeeUserId}",
          "methodName": "removeSeasonEmployee"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/farmer/labor/tasks/{taskId}/assign",
          "methodName": "assignTaskToEmployee"
        },
        {
          "method": "GET",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/progress",
          "methodName": "listSeasonProgress"
        },
        {
          "method": "GET",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/payroll",
          "methodName": "listSeasonPayroll"
        },
        {
          "method": "GET",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/payroll/{payrollRecordId}",
          "methodName": "getSeasonPayrollDetail"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/payroll/{payrollRecordId}",
          "methodName": "updateSeasonPayroll"
        },
        {
          "method": "POST",
          "path": "/api/v1/farmer/labor/seasons/{seasonId}/payroll/recalculate",
          "methodName": "recalculatePayroll"
        }
      ]
    },
    {
      "className": "FieldLogController",
      "module": "season",
      "basePath": "/api/v1/field-logs",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/field-logs",
          "methodName": "listFieldLogs"
        },
        {
          "method": "GET",
          "path": "/api/v1/field-logs/{id}",
          "methodName": "getFieldLog"
        },
        {
          "method": "POST",
          "path": "/api/v1/field-logs",
          "methodName": "createFieldLog"
        },
        {
          "method": "PUT",
          "path": "/api/v1/field-logs/{id}",
          "methodName": "updateFieldLog"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/field-logs/{id}",
          "methodName": "deleteFieldLog"
        }
      ]
    },
    {
      "className": "SeasonController",
      "module": "season",
      "basePath": "/api/v1/seasons",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/seasons",
          "methodName": "searchSeasons"
        },
        {
          "method": "GET",
          "path": "/api/v1/seasons/my",
          "methodName": "getMySeasons"
        },
        {
          "method": "GET",
          "path": "/api/v1/seasons/{id}",
          "methodName": "getSeason"
        },
        {
          "method": "POST",
          "path": "/api/v1/seasons",
          "methodName": "createSeason"
        },
        {
          "method": "PUT",
          "path": "/api/v1/seasons/{id}",
          "methodName": "updateSeason"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/seasons/{id}/status",
          "methodName": "updateSeasonStatus"
        },
        {
          "method": "POST",
          "path": "/api/v1/seasons/{id}/start",
          "methodName": "startSeason"
        },
        {
          "method": "POST",
          "path": "/api/v1/seasons/{id}/complete",
          "methodName": "completeSeason"
        },
        {
          "method": "POST",
          "path": "/api/v1/seasons/{id}/cancel",
          "methodName": "cancelSeason"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/seasons/{id}",
          "methodName": "deleteSeason"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/seasons/{id}/archive",
          "methodName": "archiveSeason"
        },
        {
          "method": "GET",
          "path": "/api/v1/seasons/search",
          "methodName": "searchSeasonsByKeyword"
        }
      ]
    },
    {
      "className": "SeasonCostOptimizationController",
      "module": "season",
      "basePath": "/api/v1/seasons/{seasonId}/cost-optimization",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/seasons/{seasonId}/cost-optimization/summary",
          "methodName": "getSummary"
        },
        {
          "method": "POST",
          "path": "/api/v1/seasons/{seasonId}/cost-optimization/ai-suggestion",
          "methodName": "generateSuggestion"
        }
      ]
    },
    {
      "className": "SeasonHarvestController",
      "module": "season",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/harvests",
          "methodName": "listAllHarvests"
        },
        {
          "method": "GET",
          "path": "/api/v1/harvests/summary",
          "methodName": "getSummary"
        },
        {
          "method": "GET",
          "path": "/api/v1/seasons/{seasonId}/harvests",
          "methodName": "listHarvests"
        },
        {
          "method": "GET",
          "path": "/api/v1/seasons/{seasonId}/harvests/stock-context",
          "methodName": "getHarvestStockContext"
        },
        {
          "method": "POST",
          "path": "/api/v1/seasons/{seasonId}/harvests",
          "methodName": "createHarvest"
        },
        {
          "method": "GET",
          "path": "/api/v1/harvests/{id}",
          "methodName": "getHarvest"
        },
        {
          "method": "PUT",
          "path": "/api/v1/harvests/{id}",
          "methodName": "updateHarvest"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/harvests/{id}",
          "methodName": "deleteHarvest"
        }
      ]
    },
    {
      "className": "TaskController",
      "module": "season",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/seasons/{seasonId}/tasks",
          "methodName": "listTasks"
        },
        {
          "method": "POST",
          "path": "/api/v1/seasons/{seasonId}/tasks",
          "methodName": "createTask"
        },
        {
          "method": "GET",
          "path": "/api/v1/tasks/{id}",
          "methodName": "getTask"
        },
        {
          "method": "PUT",
          "path": "/api/v1/tasks/{id}",
          "methodName": "updateTask"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/tasks/{id}/status",
          "methodName": "updateTaskStatus"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/tasks/{id}",
          "methodName": "deleteTask"
        }
      ]
    },
    {
      "className": "TaskWorkspaceController",
      "module": "season",
      "basePath": "/api/v1/workspace/tasks",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/workspace/tasks",
          "methodName": "createTask"
        },
        {
          "method": "GET",
          "path": "/api/v1/workspace/tasks",
          "methodName": "listTasks"
        },
        {
          "method": "GET",
          "path": "/api/v1/workspace/tasks/{id}",
          "methodName": "getTask"
        },
        {
          "method": "PUT",
          "path": "/api/v1/workspace/tasks/{id}",
          "methodName": "updateTask"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/workspace/tasks/{id}/start",
          "methodName": "startTask"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/workspace/tasks/{id}/done",
          "methodName": "doneTask"
        },
        {
          "method": "PATCH",
          "path": "/api/v1/workspace/tasks/{id}/cancel",
          "methodName": "cancelTask"
        },
        {
          "method": "DELETE",
          "path": "/api/v1/workspace/tasks/{id}",
          "methodName": "deleteTask"
        },
        {
          "method": "GET",
          "path": "/api/v1/workspace/tasks/seasons",
          "methodName": "getUserSeasons"
        }
      ]
    },
    {
      "className": "ModuleHealthController",
      "module": "shared",
      "basePath": "/api/v1/public",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/public/health/modules",
          "methodName": "moduleHealthOverview"
        },
        {
          "method": "GET",
          "path": "/api/v1/public/health/modules/{moduleName}",
          "methodName": "moduleHealth"
        }
      ]
    },
    {
      "className": "DashboardController",
      "module": "sustainability",
      "basePath": "/api/v1/dashboard",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/dashboard/overview",
          "methodName": "getOverview"
        },
        {
          "method": "GET",
          "path": "/api/v1/dashboard/today-tasks",
          "methodName": "getTodayTasks"
        },
        {
          "method": "GET",
          "path": "/api/v1/dashboard/upcoming-tasks",
          "methodName": "getUpcomingTasks"
        },
        {
          "method": "GET",
          "path": "/api/v1/dashboard/recent-activities",
          "methodName": "getRecentActivities"
        },
        {
          "method": "GET",
          "path": "/api/v1/dashboard/data-completeness-warnings",
          "methodName": "getDataCompletenessWarnings"
        },
        {
          "method": "GET",
          "path": "/api/v1/dashboard/plot-status",
          "methodName": "getPlotStatus"
        },
        {
          "method": "GET",
          "path": "/api/v1/dashboard/low-stock",
          "methodName": "getLowStock"
        },
        {
          "method": "GET",
          "path": "/api/v1/dashboard/inventory-alerts",
          "methodName": "getInventoryAlerts"
        },
        {
          "method": "GET",
          "path": "/api/v1/dashboard/incident-alerts",
          "methodName": "getIncidentAlerts"
        },
        {
          "method": "GET",
          "path": "/api/v1/dashboard/weather",
          "methodName": "getWeather"
        }
      ]
    },
    {
      "className": "FarmerReportController",
      "module": "sustainability",
      "basePath": "/api/v1/farmer/reports",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/farmer/reports/yield",
          "methodName": "getYieldReport"
        },
        {
          "method": "GET",
          "path": "/api/v1/farmer/reports/cost",
          "methodName": "getCostReport"
        },
        {
          "method": "GET",
          "path": "/api/v1/farmer/reports/revenue",
          "methodName": "getRevenueReport"
        },
        {
          "method": "GET",
          "path": "/api/v1/farmer/reports/profit",
          "methodName": "getProfitReport"
        }
      ]
    },
    {
      "className": "IrrigationWaterAnalysisController",
      "module": "sustainability",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/seasons/{seasonId}/irrigation-water-analyses",
          "methodName": "create"
        },
        {
          "method": "GET",
          "path": "/api/v1/seasons/{seasonId}/irrigation-water-analyses",
          "methodName": "list"
        }
      ]
    },
    {
      "className": "NutrientInputController",
      "module": "sustainability",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/seasons/{seasonId}/nutrient-inputs",
          "methodName": "createNutrientInput"
        },
        {
          "method": "GET",
          "path": "/api/v1/seasons/{seasonId}/nutrient-inputs",
          "methodName": "listNutrientInputs"
        }
      ]
    },
    {
      "className": "SoilTestController",
      "module": "sustainability",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "POST",
          "path": "/api/v1/seasons/{seasonId}/soil-tests",
          "methodName": "create"
        },
        {
          "method": "GET",
          "path": "/api/v1/seasons/{seasonId}/soil-tests",
          "methodName": "list"
        }
      ]
    },
    {
      "className": "SustainabilityController",
      "module": "sustainability",
      "basePath": "/api/v1",
      "mappings": [
        {
          "method": "GET",
          "path": "/api/v1/dashboard/sustainability/overview",
          "methodName": "getOverview"
        },
        {
          "method": "GET",
          "path": "/api/v1/fields/map",
          "methodName": "getFieldMap"
        },
        {
          "method": "GET",
          "path": "/api/v1/fields/{fieldId}/sustainability-metrics",
          "methodName": "getFieldMetrics"
        },
        {
          "method": "GET",
          "path": "/api/v1/fields/{fieldId}/fdn-history",
          "methodName": "getFieldHistory"
        },
        {
          "method": "GET",
          "path": "/api/v1/fields/{fieldId}/recommendations",
          "methodName": "getFieldRecommendations"
        }
      ]
    }
  ],
  "entities": [
    {
      "className": "AuditLog",
      "module": "admin",
      "tableName": "auditlog",
      "relationships": []
    },
    {
      "className": "Document",
      "module": "admin",
      "tableName": "documents",
      "relationships": []
    },
    {
      "className": "DocumentFavorite",
      "module": "admin",
      "tableName": "documentfavorite",
      "relationships": []
    },
    {
      "className": "DocumentRecentOpen",
      "module": "admin",
      "tableName": "document_recent_opens",
      "relationships": []
    },
    {
      "className": "Crop",
      "module": "cropcatalog",
      "tableName": "crops",
      "relationships": []
    },
    {
      "className": "CropNitrogenReference",
      "module": "cropcatalog",
      "tableName": "crop_nitrogen_references",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Crop",
          "fieldName": "crop"
        }
      ]
    },
    {
      "className": "Variety",
      "module": "cropcatalog",
      "tableName": "varieties",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Crop",
          "fieldName": "crop"
        }
      ]
    },
    {
      "className": "Farm",
      "module": "farm",
      "tableName": "farms",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "user"
        },
        {
          "type": "ManyToOne",
          "targetType": "Province",
          "fieldName": "province"
        },
        {
          "type": "ManyToOne",
          "targetType": "Ward",
          "fieldName": "ward"
        }
      ]
    },
    {
      "className": "Plot",
      "module": "farm",
      "tableName": "plots",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "user"
        },
        {
          "type": "ManyToOne",
          "targetType": "Farm",
          "fieldName": "farm"
        }
      ]
    },
    {
      "className": "Province",
      "module": "farm",
      "tableName": "provinces",
      "relationships": [
        {
          "type": "OneToMany",
          "targetType": "List<Ward>",
          "fieldName": "wards"
        }
      ]
    },
    {
      "className": "Ward",
      "module": "farm",
      "tableName": "wards",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Province",
          "fieldName": "province"
        }
      ]
    },
    {
      "className": "Expense",
      "module": "financial",
      "tableName": "expenses",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "user"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Task",
          "fieldName": "task"
        }
      ]
    },
    {
      "className": "InvalidatedToken",
      "module": "identity",
      "tableName": "invalidatedtoken",
      "relationships": []
    },
    {
      "className": "PasswordResetToken",
      "module": "identity",
      "tableName": "passwordresettoken",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "User",
          "fieldName": "user"
        }
      ]
    },
    {
      "className": "Role",
      "module": "identity",
      "tableName": "roles",
      "relationships": []
    },
    {
      "className": "User",
      "module": "identity",
      "tableName": "users",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Province",
          "fieldName": "province"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Ward",
          "fieldName": "ward"
        },
        {
          "type": "ManyToMany",
          "targetType": "Set<Role>",
          "fieldName": "roles"
        }
      ]
    },
    {
      "className": "UserPreference",
      "module": "identity",
      "tableName": "userpreference",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "User",
          "fieldName": "user"
        }
      ]
    },
    {
      "className": "Alert",
      "module": "incident",
      "tableName": "alerts",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Farm",
          "fieldName": "farm"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Plot",
          "fieldName": "plot"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.cropcatalog.entity.Crop",
          "fieldName": "crop"
        }
      ]
    },
    {
      "className": "Incident",
      "module": "incident",
      "tableName": "incidents",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "reportedBy"
        }
      ]
    },
    {
      "className": "Notification",
      "module": "incident",
      "tableName": "notification",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "user"
        },
        {
          "type": "ManyToOne",
          "targetType": "Alert",
          "fieldName": "alert"
        }
      ]
    },
    {
      "className": "InventoryBalance",
      "module": "inventory",
      "tableName": "inventorybalance",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "SupplyLot",
          "fieldName": "supplyLot"
        },
        {
          "type": "ManyToOne",
          "targetType": "Warehouse",
          "fieldName": "warehouse"
        },
        {
          "type": "ManyToOne",
          "targetType": "StockLocation",
          "fieldName": "location"
        }
      ]
    },
    {
      "className": "ProductWarehouseLot",
      "module": "inventory",
      "tableName": "productwarehouselot",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Farm",
          "fieldName": "farm"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Plot",
          "fieldName": "plot"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Harvest",
          "fieldName": "harvest"
        },
        {
          "type": "ManyToOne",
          "targetType": "Warehouse",
          "fieldName": "warehouse"
        },
        {
          "type": "ManyToOne",
          "targetType": "StockLocation",
          "fieldName": "location"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "createdBy"
        }
      ]
    },
    {
      "className": "ProductWarehouseTransaction",
      "module": "inventory",
      "tableName": "product_warehouse_transactions",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "ProductWarehouseLot",
          "fieldName": "lot"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "createdBy"
        }
      ]
    },
    {
      "className": "StockLocation",
      "module": "inventory",
      "tableName": "stock_locations",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Warehouse",
          "fieldName": "warehouse"
        }
      ]
    },
    {
      "className": "StockMovement",
      "module": "inventory",
      "tableName": "stock_movements",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "SupplyLot",
          "fieldName": "supplyLot"
        },
        {
          "type": "ManyToOne",
          "targetType": "Warehouse",
          "fieldName": "warehouse"
        },
        {
          "type": "ManyToOne",
          "targetType": "StockLocation",
          "fieldName": "location"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Task",
          "fieldName": "task"
        }
      ]
    },
    {
      "className": "Supplier",
      "module": "inventory",
      "tableName": "suppliers",
      "relationships": []
    },
    {
      "className": "SupplyItem",
      "module": "inventory",
      "tableName": "supply_items",
      "relationships": []
    },
    {
      "className": "SupplyLot",
      "module": "inventory",
      "tableName": "supply_lots",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "SupplyItem",
          "fieldName": "supplyItem"
        },
        {
          "type": "ManyToOne",
          "targetType": "Supplier",
          "fieldName": "supplier"
        }
      ]
    },
    {
      "className": "Warehouse",
      "module": "inventory",
      "tableName": "warehouses",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Farm",
          "fieldName": "farm"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Province",
          "fieldName": "province"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Ward",
          "fieldName": "ward"
        }
      ]
    },
    {
      "className": "MarketplaceAddress",
      "module": "marketplace",
      "tableName": "marketplace_addresses",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "user"
        }
      ]
    },
    {
      "className": "MarketplaceCart",
      "module": "marketplace",
      "tableName": "marketplace_carts",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "user"
        }
      ]
    },
    {
      "className": "MarketplaceCartItem",
      "module": "marketplace",
      "tableName": "marketplace_cart_items",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "MarketplaceCart",
          "fieldName": "cart"
        },
        {
          "type": "ManyToOne",
          "targetType": "MarketplaceProduct",
          "fieldName": "product"
        }
      ]
    },
    {
      "className": "MarketplaceOrder",
      "module": "marketplace",
      "tableName": "marketplace_orders",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "MarketplaceOrderGroup",
          "fieldName": "orderGroup"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "buyerUser"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "farmerUser"
        }
      ]
    },
    {
      "className": "MarketplaceOrderGroup",
      "module": "marketplace",
      "tableName": "marketplace_order_groups",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "buyerUser"
        }
      ]
    },
    {
      "className": "MarketplaceOrderItem",
      "module": "marketplace",
      "tableName": "marketplace_order_items",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "MarketplaceOrder",
          "fieldName": "order"
        },
        {
          "type": "ManyToOne",
          "targetType": "MarketplaceProduct",
          "fieldName": "product"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Farm",
          "fieldName": "farm"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.inventory.entity.ProductWarehouseLot",
          "fieldName": "lot"
        }
      ]
    },
    {
      "className": "MarketplaceProduct",
      "module": "marketplace",
      "tableName": "marketplace_products",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "farmerUser"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Farm",
          "fieldName": "farm"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.inventory.entity.ProductWarehouseLot",
          "fieldName": "lot"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "statusChangedByUser"
        }
      ]
    },
    {
      "className": "MarketplaceProductReview",
      "module": "marketplace",
      "tableName": "marketplaceproductreview",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "MarketplaceProduct",
          "fieldName": "product"
        },
        {
          "type": "ManyToOne",
          "targetType": "MarketplaceOrder",
          "fieldName": "order"
        },
        {
          "type": "ManyToOne",
          "targetType": "MarketplaceOrderItem",
          "fieldName": "orderItem"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "buyerUser"
        }
      ]
    },
    {
      "className": "DashboardTaskView",
      "module": "season",
      "tableName": "dashboardtaskview",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Plot",
          "fieldName": "plot"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "assignee"
        }
      ]
    },
    {
      "className": "DiseaseRecord",
      "module": "season",
      "tableName": "disease_records",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Plot",
          "fieldName": "plot"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.cropcatalog.entity.Crop",
          "fieldName": "crop"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.cropcatalog.entity.Variety",
          "fieldName": "variety"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "reportedBy"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.incident.entity.Incident",
          "fieldName": "incident"
        }
      ]
    },
    {
      "className": "DiseaseTreatment",
      "module": "season",
      "tableName": "disease_treatments",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "DiseaseRecord",
          "fieldName": "diseaseRecord"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.inventory.entity.SupplyItem",
          "fieldName": "supplyItem"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.inventory.entity.SupplyLot",
          "fieldName": "supplyLot"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.financial.entity.Expense",
          "fieldName": "expense"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "createdBy"
        }
      ]
    },
    {
      "className": "FieldLog",
      "module": "season",
      "tableName": "field_logs",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "createdBy"
        }
      ]
    },
    {
      "className": "Harvest",
      "module": "season",
      "tableName": "harvests",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Season",
          "fieldName": "season"
        }
      ]
    },
    {
      "className": "PayrollRecord",
      "module": "season",
      "tableName": "payrollrecord",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "employee"
        },
        {
          "type": "ManyToOne",
          "targetType": "Season",
          "fieldName": "season"
        }
      ]
    },
    {
      "className": "Season",
      "module": "season",
      "tableName": "seasons",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Plot",
          "fieldName": "plot"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.cropcatalog.entity.Crop",
          "fieldName": "crop"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.cropcatalog.entity.Variety",
          "fieldName": "variety"
        }
      ]
    },
    {
      "className": "SeasonEmployee",
      "module": "season",
      "tableName": "seasonemployee",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "employee"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "addedBy"
        }
      ]
    },
    {
      "className": "Task",
      "module": "season",
      "tableName": "tasks",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "user"
        },
        {
          "type": "ManyToOne",
          "targetType": "Season",
          "fieldName": "season"
        }
      ]
    },
    {
      "className": "TaskProgressLog",
      "module": "season",
      "tableName": "taskprogresslog",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "Task",
          "fieldName": "task"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.identity.entity.User",
          "fieldName": "employee"
        }
      ]
    },
    {
      "className": "IrrigationWaterAnalysis",
      "module": "sustainability",
      "tableName": "irrigation_water_analyses",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Plot",
          "fieldName": "plot"
        }
      ]
    },
    {
      "className": "NutrientInputEvent",
      "module": "sustainability",
      "tableName": "nutrient_input_events",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Plot",
          "fieldName": "plot"
        }
      ]
    },
    {
      "className": "SoilTest",
      "module": "sustainability",
      "tableName": "soil_tests",
      "relationships": [
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.season.entity.Season",
          "fieldName": "season"
        },
        {
          "type": "ManyToOne",
          "targetType": "org.example.QuanLyMuaVu.module.farm.entity.Plot",
          "fieldName": "plot"
        }
      ]
    }
  ],
  "repositories": [
    {
      "className": "AuditLogRepository",
      "module": "admin"
    },
    {
      "className": "DocumentFavoriteRepository",
      "module": "admin"
    },
    {
      "className": "DocumentRecentOpenRepository",
      "module": "admin"
    },
    {
      "className": "DocumentRepository",
      "module": "admin"
    },
    {
      "className": "CropNitrogenReferenceRepository",
      "module": "cropcatalog"
    },
    {
      "className": "CropRepository",
      "module": "cropcatalog"
    },
    {
      "className": "VarietyRepository",
      "module": "cropcatalog"
    },
    {
      "className": "FarmRepository",
      "module": "farm"
    },
    {
      "className": "PlotRepository",
      "module": "farm"
    },
    {
      "className": "ProvinceRepository",
      "module": "farm"
    },
    {
      "className": "WardRepository",
      "module": "farm"
    },
    {
      "className": "ExpenseRepository",
      "module": "financial"
    },
    {
      "className": "InvalidatedTokenRepository",
      "module": "identity"
    },
    {
      "className": "PasswordResetTokenRepository",
      "module": "identity"
    },
    {
      "className": "RoleRepository",
      "module": "identity"
    },
    {
      "className": "UserPreferenceRepository",
      "module": "identity"
    },
    {
      "className": "UserRepository",
      "module": "identity"
    },
    {
      "className": "AlertRepository",
      "module": "incident"
    },
    {
      "className": "IncidentRepository",
      "module": "incident"
    },
    {
      "className": "NotificationRepository",
      "module": "incident"
    },
    {
      "className": "InventoryBalanceRepository",
      "module": "inventory"
    },
    {
      "className": "ProductWarehouseLotRepository",
      "module": "inventory"
    },
    {
      "className": "ProductWarehouseTransactionRepository",
      "module": "inventory"
    },
    {
      "className": "StockLocationRepository",
      "module": "inventory"
    },
    {
      "className": "StockMovementRepository",
      "module": "inventory"
    },
    {
      "className": "SupplierRepository",
      "module": "inventory"
    },
    {
      "className": "SupplyItemRepository",
      "module": "inventory"
    },
    {
      "className": "SupplyLotRepository",
      "module": "inventory"
    },
    {
      "className": "WarehouseRepository",
      "module": "inventory"
    },
    {
      "className": "MarketplaceAddressRepository",
      "module": "marketplace"
    },
    {
      "className": "MarketplaceCartItemRepository",
      "module": "marketplace"
    },
    {
      "className": "MarketplaceCartRepository",
      "module": "marketplace"
    },
    {
      "className": "MarketplaceOrderGroupRepository",
      "module": "marketplace"
    },
    {
      "className": "MarketplaceOrderItemRepository",
      "module": "marketplace"
    },
    {
      "className": "MarketplaceOrderRepository",
      "module": "marketplace"
    },
    {
      "className": "MarketplaceProductRepository",
      "module": "marketplace"
    },
    {
      "className": "MarketplaceProductReviewRepository",
      "module": "marketplace"
    },
    {
      "className": "DashboardTaskViewRepository",
      "module": "season"
    },
    {
      "className": "DiseaseRecordRepository",
      "module": "season"
    },
    {
      "className": "DiseaseTreatmentRepository",
      "module": "season"
    },
    {
      "className": "FieldLogRepository",
      "module": "season"
    },
    {
      "className": "HarvestRepository",
      "module": "season"
    },
    {
      "className": "PayrollRecordRepository",
      "module": "season"
    },
    {
      "className": "SeasonEmployeeRepository",
      "module": "season"
    },
    {
      "className": "SeasonRepository",
      "module": "season"
    },
    {
      "className": "TaskProgressLogRepository",
      "module": "season"
    },
    {
      "className": "TaskRepository",
      "module": "season"
    },
    {
      "className": "IrrigationWaterAnalysisRepository",
      "module": "sustainability"
    },
    {
      "className": "NutrientInputEventRepository",
      "module": "sustainability"
    },
    {
      "className": "SoilTestRepository",
      "module": "sustainability"
    }
  ],
  "services": [
    {
      "className": "FirebaseChatContactService",
      "module": "firebase"
    },
    {
      "className": "FirebaseChatTokenService",
      "module": "firebase"
    },
    {
      "className": "AdminAlertService",
      "module": "admin"
    },
    {
      "className": "AdminDashboardFacade",
      "module": "admin"
    },
    {
      "className": "AdminDashboardReadService",
      "module": "admin"
    },
    {
      "className": "AdminDocumentService",
      "module": "admin"
    },
    {
      "className": "AdminFarmQueryService",
      "module": "admin"
    },
    {
      "className": "AdminIncidentService",
      "module": "admin"
    },
    {
      "className": "AdminInventoryService",
      "module": "admin"
    },
    {
      "className": "AdminPendingApprovalService",
      "module": "admin"
    },
    {
      "className": "AdminPlotQueryService",
      "module": "admin"
    },
    {
      "className": "AdminReportService",
      "module": "admin"
    },
    {
      "className": "AdminSeasonService",
      "module": "admin"
    },
    {
      "className": "AdminTaskService",
      "module": "admin"
    },
    {
      "className": "AdminUserCommandService",
      "module": "admin"
    },
    {
      "className": "AdminUserQueryService",
      "module": "admin"
    },
    {
      "className": "AdminUserReportService",
      "module": "admin"
    },
    {
      "className": "AuditLogService",
      "module": "admin"
    },
    {
      "className": "DocumentService",
      "module": "admin"
    },
    {
      "className": "DiseaseSuggestionService",
      "module": "ai"
    },
    {
      "className": "GeminiService",
      "module": "ai"
    },
    {
      "className": "SeasonCostOptimizationService",
      "module": "ai"
    },
    {
      "className": "CropCatalogQueryService",
      "module": "cropcatalog"
    },
    {
      "className": "CropService",
      "module": "cropcatalog"
    },
    {
      "className": "VarietyService",
      "module": "cropcatalog"
    },
    {
      "className": "AddressImportService",
      "module": "farm"
    },
    {
      "className": "AddressService",
      "module": "farm"
    },
    {
      "className": "FarmAccessService",
      "module": "farm"
    },
    {
      "className": "FarmerOwnershipService",
      "module": "farm"
    },
    {
      "className": "FarmQueryService",
      "module": "farm"
    },
    {
      "className": "FarmService",
      "module": "farm"
    },
    {
      "className": "PlotService",
      "module": "farm"
    },
    {
      "className": "ExpenseQueryService",
      "module": "financial"
    },
    {
      "className": "ExpenseService",
      "module": "financial"
    },
    {
      "className": "SeasonExpenseService",
      "module": "financial"
    },
    {
      "className": "AuthenticationResponseFactory",
      "module": "identity"
    },
    {
      "className": "AuthenticationService",
      "module": "identity"
    },
    {
      "className": "GoogleAuthService",
      "module": "identity"
    },
    {
      "className": "IdentityCommandService",
      "module": "identity"
    },
    {
      "className": "IdentityQueryService",
      "module": "identity"
    },
    {
      "className": "JwtTokenService",
      "module": "identity"
    },
    {
      "className": "PasswordResetRateLimiter",
      "module": "identity"
    },
    {
      "className": "PasswordResetService",
      "module": "identity"
    },
    {
      "className": "PreferencesService",
      "module": "identity"
    },
    {
      "className": "RoleService",
      "module": "identity"
    },
    {
      "className": "UserService",
      "module": "identity"
    },
    {
      "className": "IncidentCommandService",
      "module": "incident"
    },
    {
      "className": "IncidentQueryService",
      "module": "incident"
    },
    {
      "className": "IncidentService",
      "module": "incident"
    },
    {
      "className": "NotificationService",
      "module": "incident"
    },
    {
      "className": "InventoryCommandService",
      "module": "inventory"
    },
    {
      "className": "InventoryQueryService",
      "module": "inventory"
    },
    {
      "className": "InventoryService",
      "module": "inventory"
    },
    {
      "className": "ProductWarehouseService",
      "module": "inventory"
    },
    {
      "className": "ProductWarehouseTraceabilityReadService",
      "module": "inventory"
    },
    {
      "className": "SuppliesService",
      "module": "inventory"
    },
    {
      "className": "MarketplaceImageSearchService",
      "module": "marketplace"
    },
    {
      "className": "MarketplaceProductImageStorageService",
      "module": "marketplace"
    },
    {
      "className": "MarketplaceService",
      "module": "marketplace"
    },
    {
      "className": "DiseaseRecordService",
      "module": "season"
    },
    {
      "className": "FieldLogService",
      "module": "season"
    },
    {
      "className": "HarvestQueryService",
      "module": "season"
    },
    {
      "className": "HarvestService",
      "module": "season"
    },
    {
      "className": "LaborManagementService",
      "module": "season"
    },
    {
      "className": "SeasonCommandService",
      "module": "season"
    },
    {
      "className": "SeasonHarvestService",
      "module": "season"
    },
    {
      "className": "SeasonQueryService",
      "module": "season"
    },
    {
      "className": "SeasonService",
      "module": "season"
    },
    {
      "className": "SeasonStatusService",
      "module": "season"
    },
    {
      "className": "SeasonTaskService",
      "module": "season"
    },
    {
      "className": "SeasonValidationService",
      "module": "season"
    },
    {
      "className": "SeasonWorkspaceAccessService",
      "module": "season"
    },
    {
      "className": "TaskCommandService",
      "module": "season"
    },
    {
      "className": "TaskQueryService",
      "module": "season"
    },
    {
      "className": "TaskService",
      "module": "season"
    },
    {
      "className": "TaskWorkspaceService",
      "module": "season"
    },
    {
      "className": "DashboardAlertsService",
      "module": "sustainability"
    },
    {
      "className": "DashboardKpiService",
      "module": "sustainability"
    },
    {
      "className": "DashboardPlotStatusReadService",
      "module": "sustainability"
    },
    {
      "className": "DashboardRecentActivityReadService",
      "module": "sustainability"
    },
    {
      "className": "DashboardService",
      "module": "sustainability"
    },
    {
      "className": "DashboardTaskReadService",
      "module": "sustainability"
    },
    {
      "className": "DashboardWeatherService",
      "module": "sustainability"
    },
    {
      "className": "FarmerReportService",
      "module": "sustainability"
    },
    {
      "className": "IrrigationWaterAnalysisService",
      "module": "sustainability"
    },
    {
      "className": "LegacyNutrientInputBackfillService",
      "module": "sustainability"
    },
    {
      "className": "NutrientInputIngestionService",
      "module": "sustainability"
    },
    {
      "className": "SoilTestService",
      "module": "sustainability"
    },
    {
      "className": "SustainabilityCalculationService",
      "module": "sustainability"
    },
    {
      "className": "SustainabilityDashboardContextService",
      "module": "sustainability"
    },
    {
      "className": "SustainabilityDashboardService",
      "module": "sustainability"
    },
    {
      "className": "SustainabilityRecommendationService",
      "module": "sustainability"
    }
  ],
  "crossModuleDependencies": [
    {
      "fromModule": "firebase",
      "fromClass": "FirebaseChatContactService",
      "toModule": "farm",
      "toClass": "Farm",
      "type": "Entity"
    },
    {
      "fromModule": "firebase",
      "fromClass": "FirebaseChatContactService",
      "toModule": "farm",
      "toClass": "Province",
      "type": "Entity"
    },
    {
      "fromModule": "firebase",
      "fromClass": "FirebaseChatContactService",
      "toModule": "farm",
      "toClass": "Ward",
      "type": "Entity"
    },
    {
      "fromModule": "firebase",
      "fromClass": "FirebaseChatContactService",
      "toModule": "farm",
      "toClass": "FarmRepository",
      "type": "Repository"
    },
    {
      "fromModule": "firebase",
      "fromClass": "FirebaseChatContactService",
      "toModule": "identity",
      "toClass": "User",
      "type": "Entity"
    },
    {
      "fromModule": "firebase",
      "fromClass": "FirebaseChatContactService",
      "toModule": "identity",
      "toClass": "UserRepository",
      "type": "Repository"
    },
    {
      "fromModule": "firebase",
      "fromClass": "FirebaseChatContactService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "firebase",
      "fromClass": "FirebaseChatTokenController",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminCropController",
      "toModule": "cropcatalog",
      "toClass": "CropRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminCropController",
      "toModule": "cropcatalog",
      "toClass": "CropResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminCropController",
      "toModule": "cropcatalog",
      "toClass": "CropService",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminFarmController",
      "toModule": "farm",
      "toClass": "FarmResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentController",
      "toModule": "incident",
      "toClass": "CancelIncidentRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentController",
      "toModule": "incident",
      "toClass": "ResolveIncidentRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentController",
      "toModule": "incident",
      "toClass": "TriageIncidentRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentController",
      "toModule": "incident",
      "toClass": "UpdateIncidentStatusRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentController",
      "toModule": "incident",
      "toClass": "IncidentResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPlotController",
      "toModule": "farm",
      "toClass": "PlotResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPlotController",
      "toModule": "season",
      "toClass": "SeasonResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminRoleController",
      "toModule": "identity",
      "toClass": "RoleRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminRoleController",
      "toModule": "identity",
      "toClass": "RoleResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminRoleController",
      "toModule": "identity",
      "toClass": "RoleService",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminSeasonController",
      "toModule": "season",
      "toClass": "SeasonDetailResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminSeasonController",
      "toModule": "season",
      "toClass": "SeasonResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminTaskController",
      "toModule": "season",
      "toClass": "TaskResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminVarietyController",
      "toModule": "cropcatalog",
      "toClass": "VarietyRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminVarietyController",
      "toModule": "cropcatalog",
      "toClass": "VarietyResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminVarietyController",
      "toModule": "cropcatalog",
      "toClass": "VarietyService",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "DocumentController",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminAlertService",
      "toModule": "incident",
      "toClass": "IncidentCommandPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminAlertService",
      "toModule": "incident",
      "toClass": "IncidentQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminDashboardFacade",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminDashboardFacade",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminDashboardFacade",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminFarmQueryService",
      "toModule": "farm",
      "toClass": "FarmResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminFarmQueryService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentService",
      "toModule": "incident",
      "toClass": "CancelIncidentRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentService",
      "toModule": "incident",
      "toClass": "ResolveIncidentRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentService",
      "toModule": "incident",
      "toClass": "TriageIncidentRequest",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentService",
      "toModule": "incident",
      "toClass": "IncidentResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentService",
      "toModule": "incident",
      "toClass": "IncidentMapper",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentService",
      "toModule": "incident",
      "toClass": "IncidentCommandPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminIncidentService",
      "toModule": "incident",
      "toClass": "IncidentQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminInventoryService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminInventoryService",
      "toModule": "inventory",
      "toClass": "InventoryQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPendingApprovalService",
      "toModule": "marketplace",
      "toClass": "MarketplaceOrder",
      "type": "Entity"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPendingApprovalService",
      "toModule": "marketplace",
      "toClass": "MarketplaceProduct",
      "type": "Entity"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPendingApprovalService",
      "toModule": "marketplace",
      "toClass": "MarketplacePaymentVerificationStatus",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPendingApprovalService",
      "toModule": "marketplace",
      "toClass": "MarketplaceProductStatus",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPendingApprovalService",
      "toModule": "marketplace",
      "toClass": "MarketplaceOrderRepository",
      "type": "Repository"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPendingApprovalService",
      "toModule": "marketplace",
      "toClass": "MarketplaceProductRepository",
      "type": "Repository"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPlotQueryService",
      "toModule": "farm",
      "toClass": "PlotResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPlotQueryService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPlotQueryService",
      "toModule": "season",
      "toClass": "SeasonResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminPlotQueryService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminReportService",
      "toModule": "financial",
      "toClass": "ExpenseQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminSeasonService",
      "toModule": "season",
      "toClass": "SeasonDetailResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminSeasonService",
      "toModule": "season",
      "toClass": "SeasonResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminSeasonService",
      "toModule": "season",
      "toClass": "SeasonMapper",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminSeasonService",
      "toModule": "season",
      "toClass": "SeasonCommandPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminSeasonService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminSeasonService",
      "toModule": "season",
      "toClass": "TaskCommandPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminSeasonService",
      "toModule": "season",
      "toClass": "TaskQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminTaskService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminTaskService",
      "toModule": "season",
      "toClass": "TaskResponse",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminTaskService",
      "toModule": "season",
      "toClass": "TaskCommandPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminTaskService",
      "toModule": "season",
      "toClass": "TaskQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminUserCommandService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminUserCommandService",
      "toModule": "identity",
      "toClass": "IdentityCommandPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminUserCommandService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminUserQueryService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "admin",
      "fromClass": "AdminUserReportService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "admin",
      "toClass": "AuditLogService",
      "type": "Other"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "incident",
      "toClass": "Incident",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "incident",
      "toClass": "IncidentRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "inventory",
      "toClass": "InventoryBalance",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "inventory",
      "toClass": "SupplyLot",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "inventory",
      "toClass": "InventoryBalanceRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "season",
      "toClass": "DiseaseRecord",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "season",
      "toClass": "DiseaseTreatment",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "season",
      "toClass": "FieldLog",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "season",
      "toClass": "Season",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "season",
      "toClass": "DiseaseRecordRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "season",
      "toClass": "DiseaseTreatmentRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "season",
      "toClass": "FieldLogRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "DiseaseSuggestionService",
      "toModule": "season",
      "toClass": "SeasonWorkspaceAccessService",
      "type": "Other"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "admin",
      "toClass": "AuditLogService",
      "type": "Other"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "financial",
      "toClass": "Expense",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "financial",
      "toClass": "ExpenseRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "inventory",
      "toClass": "StockMovement",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "inventory",
      "toClass": "StockMovementRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "season",
      "toClass": "DiseaseTreatment",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "season",
      "toClass": "Season",
      "type": "Entity"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "season",
      "toClass": "DiseaseTreatmentRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "season",
      "toClass": "HarvestRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "season",
      "toClass": "PayrollRecordRepository",
      "type": "Repository"
    },
    {
      "fromModule": "ai",
      "fromClass": "SeasonCostOptimizationService",
      "toModule": "season",
      "toClass": "SeasonRepository",
      "type": "Repository"
    },
    {
      "fromModule": "cropcatalog",
      "fromClass": "VarietyService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "farm",
      "fromClass": "FarmAccessService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "farm",
      "fromClass": "FarmerOwnershipService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "farm",
      "fromClass": "FarmerOwnershipService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "farm",
      "fromClass": "FarmerOwnershipService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "farm",
      "fromClass": "FarmService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "farm",
      "fromClass": "PlotService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "farm",
      "fromClass": "PlotService",
      "toModule": "season",
      "toClass": "SeasonRepository",
      "type": "Repository"
    },
    {
      "fromModule": "farm",
      "fromClass": "PlotService",
      "toModule": "season",
      "toClass": "TaskRepository",
      "type": "Repository"
    },
    {
      "fromModule": "financial",
      "fromClass": "ExpenseRepository",
      "toModule": "admin",
      "toClass": "AdminReportProjections",
      "type": "Other"
    },
    {
      "fromModule": "financial",
      "fromClass": "ExpenseService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "financial",
      "fromClass": "ExpenseService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "financial",
      "fromClass": "SeasonExpenseService",
      "toModule": "shared",
      "toClass": "DomainEventPublisher",
      "type": "Other"
    },
    {
      "fromModule": "financial",
      "fromClass": "SeasonExpenseService",
      "toModule": "shared",
      "toClass": "ExpenseChangedEvent",
      "type": "Other"
    },
    {
      "fromModule": "financial",
      "fromClass": "SeasonExpenseService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "financial",
      "fromClass": "SeasonExpenseService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "financial",
      "fromClass": "SeasonExpenseService",
      "toModule": "season",
      "toClass": "TaskQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "identity",
      "fromClass": "PreferencesService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "identity",
      "fromClass": "UserService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "incident",
      "fromClass": "IncidentCommandService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "incident",
      "fromClass": "IncidentService",
      "toModule": "shared",
      "toClass": "DomainEventPublisher",
      "type": "Other"
    },
    {
      "fromModule": "incident",
      "fromClass": "IncidentService",
      "toModule": "shared",
      "toClass": "IncidentReportedEvent",
      "type": "Other"
    },
    {
      "fromModule": "incident",
      "fromClass": "IncidentService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "incident",
      "fromClass": "IncidentService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "incident",
      "fromClass": "NotificationService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "ProductWarehouseLotRepository",
      "toModule": "marketplace",
      "toClass": "MarketplaceProductStatus",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "InventoryCommandService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "InventoryCommandService",
      "toModule": "season",
      "toClass": "HarvestQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "InventoryQueryService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "InventoryService",
      "toModule": "admin",
      "toClass": "AuditLogService",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "InventoryService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "InventoryService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "InventoryService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "InventoryService",
      "toModule": "season",
      "toClass": "TaskQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "ProductWarehouseService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "ProductWarehouseService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "ProductWarehouseService",
      "toModule": "season",
      "toClass": "HarvestQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "ProductWarehouseService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "inventory",
      "fromClass": "SuppliesService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceProductRepository",
      "toModule": "farm",
      "toClass": "Farm",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "admin",
      "toClass": "AuditLogService",
      "type": "Other"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "ai",
      "toClass": "GeminiService",
      "type": "Other"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "cropcatalog",
      "toClass": "Crop",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "cropcatalog",
      "toClass": "Variety",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "farm",
      "toClass": "Farm",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "farm",
      "toClass": "Province",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "identity",
      "toClass": "User",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "inventory",
      "toClass": "ProductWarehouseLot",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "season",
      "toClass": "Season",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceImageSearchService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "admin",
      "toClass": "AuditLog",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "admin",
      "toClass": "AuditLogService",
      "type": "Other"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "farm",
      "toClass": "Farm",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "farm",
      "toClass": "FarmRepository",
      "type": "Repository"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "inventory",
      "toClass": "ProductWarehouseLot",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "inventory",
      "toClass": "ProductWarehouseTransaction",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "inventory",
      "toClass": "ProductWarehouseLotRepository",
      "type": "Repository"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "inventory",
      "toClass": "ProductWarehouseTransactionRepository",
      "type": "Repository"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "identity",
      "toClass": "User",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "incident",
      "toClass": "NotificationService",
      "type": "Other"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "season",
      "toClass": "Season",
      "type": "Entity"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "season",
      "toClass": "SeasonRepository",
      "type": "Repository"
    },
    {
      "fromModule": "marketplace",
      "fromClass": "MarketplaceService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordController",
      "toModule": "ai",
      "toClass": "DiseaseSuggestionRequest",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordController",
      "toModule": "ai",
      "toClass": "DiseaseSuggestionResponse",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordController",
      "toModule": "ai",
      "toClass": "DiseaseSuggestionService",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "EmployeePortalController",
      "toModule": "ai",
      "toClass": "DiseaseSuggestionRequest",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "EmployeePortalController",
      "toModule": "ai",
      "toClass": "DiseaseSuggestionResponse",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "EmployeePortalController",
      "toModule": "ai",
      "toClass": "DiseaseSuggestionService",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "EmployeePortalController",
      "toModule": "inventory",
      "toClass": "SupplyItemResponse",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "EmployeePortalController",
      "toModule": "inventory",
      "toClass": "SupplyLotResponse",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "EmployeePortalController",
      "toModule": "inventory",
      "toClass": "SuppliesService",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonCostOptimizationController",
      "toModule": "ai",
      "toClass": "SeasonCostOptimizationSuggestionRequest",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonCostOptimizationController",
      "toModule": "ai",
      "toClass": "SeasonCostOptimizationSuggestionResponse",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonCostOptimizationController",
      "toModule": "ai",
      "toClass": "SeasonCostOptimizationSummaryResponse",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonCostOptimizationController",
      "toModule": "ai",
      "toClass": "SeasonCostOptimizationService",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "HarvestRepository",
      "toModule": "admin",
      "toClass": "AdminReportProjections",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "admin",
      "toClass": "AuditLogService",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "financial",
      "toClass": "Expense",
      "type": "Entity"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "financial",
      "toClass": "ExpenseRepository",
      "type": "Repository"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "incident",
      "toClass": "Incident",
      "type": "Entity"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "incident",
      "toClass": "IncidentRepository",
      "type": "Repository"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "inventory",
      "toClass": "SupplyLot",
      "type": "Entity"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "inventory",
      "toClass": "InventoryBalanceRepository",
      "type": "Repository"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "inventory",
      "toClass": "StockMovementRepository",
      "type": "Repository"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "inventory",
      "toClass": "SupplyItemRepository",
      "type": "Repository"
    },
    {
      "fromModule": "season",
      "fromClass": "DiseaseRecordService",
      "toModule": "inventory",
      "toClass": "SupplyLotRepository",
      "type": "Repository"
    },
    {
      "fromModule": "season",
      "fromClass": "FieldLogService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "FieldLogService",
      "toModule": "identity",
      "toClass": "User",
      "type": "Entity"
    },
    {
      "fromModule": "season",
      "fromClass": "LaborManagementService",
      "toModule": "shared",
      "toClass": "DomainEventPublisher",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "LaborManagementService",
      "toModule": "shared",
      "toClass": "TaskAssignedEvent",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "LaborManagementService",
      "toModule": "shared",
      "toClass": "TaskCompletedEvent",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "LaborManagementService",
      "toModule": "admin",
      "toClass": "AuditLogService",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "LaborManagementService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "LaborManagementService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "LaborManagementService",
      "toModule": "incident",
      "toClass": "IncidentCommandPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonHarvestService",
      "toModule": "shared",
      "toClass": "DomainEventPublisher",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonHarvestService",
      "toModule": "shared",
      "toClass": "HarvestChangedEvent",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonHarvestService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonHarvestService",
      "toModule": "inventory",
      "toClass": "ProductWarehouseLot",
      "type": "Entity"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonHarvestService",
      "toModule": "inventory",
      "toClass": "HarvestStockContextView",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonHarvestService",
      "toModule": "inventory",
      "toClass": "InventoryCommandPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonHarvestService",
      "toModule": "inventory",
      "toClass": "InventoryQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonHarvestService",
      "toModule": "inventory",
      "toClass": "ReceiveHarvestRequest",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonHarvestService",
      "toModule": "inventory",
      "toClass": "ProductWarehouseLotRepository",
      "type": "Repository"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonQueryService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonService",
      "toModule": "shared",
      "toClass": "DomainEventPublisher",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonService",
      "toModule": "shared",
      "toClass": "SeasonCreatedEvent",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonService",
      "toModule": "cropcatalog",
      "toClass": "CropCatalogQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonService",
      "toModule": "financial",
      "toClass": "ExpenseQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonStatusService",
      "toModule": "shared",
      "toClass": "SeasonStatusStrategy",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonStatusService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonTaskService",
      "toModule": "shared",
      "toClass": "DomainEventPublisher",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonTaskService",
      "toModule": "shared",
      "toClass": "TaskCompletedEvent",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonTaskService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonTaskService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonWorkspaceAccessService",
      "toModule": "farm",
      "toClass": "Farm",
      "type": "Entity"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonWorkspaceAccessService",
      "toModule": "farm",
      "toClass": "Plot",
      "type": "Entity"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonWorkspaceAccessService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "SeasonWorkspaceAccessService",
      "toModule": "identity",
      "toClass": "User",
      "type": "Entity"
    },
    {
      "fromModule": "season",
      "fromClass": "TaskService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "TaskWorkspaceService",
      "toModule": "shared",
      "toClass": "DomainEventPublisher",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "TaskWorkspaceService",
      "toModule": "shared",
      "toClass": "TaskCompletedEvent",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "TaskWorkspaceService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "season",
      "fromClass": "TaskWorkspaceService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "SecurityConfig",
      "toModule": "identity",
      "toClass": "CustomJwtDecoder",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "ActiveSeasonValidator",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "CropVarietyValidator",
      "toModule": "cropcatalog",
      "toClass": "CropCatalogQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "PlotOwnershipValidator",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "PlotOwnershipValidator",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "SeasonFactory",
      "toModule": "season",
      "toClass": "CreateSeasonRequest",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "TaskFactory",
      "toModule": "season",
      "toClass": "CreateTaskRequest",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "DomainEventListener",
      "toModule": "incident",
      "toClass": "IncidentCommandPort",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "DomainEventListener",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "shared",
      "fromClass": "CurrentUserService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardController",
      "toModule": "inventory",
      "toClass": "DashboardInventoryAlertsResponse",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardController",
      "toModule": "inventory",
      "toClass": "LowStockAlertResponse",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "FarmerReportController",
      "toModule": "admin",
      "toClass": "AdminReportResponse",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "incident",
      "toClass": "Incident",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "incident",
      "toClass": "IncidentQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "inventory",
      "toClass": "DashboardInventoryAlertsResponse",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "inventory",
      "toClass": "LowStockAlertResponse",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "inventory",
      "toClass": "InventoryBalance",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "inventory",
      "toClass": "StockMovement",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "inventory",
      "toClass": "SupplyLot",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "inventory",
      "toClass": "InventoryLowStockView",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "inventory",
      "toClass": "InventoryQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "season",
      "toClass": "DashboardTaskView",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "season",
      "toClass": "TaskQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardAlertsService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardKpiService",
      "toModule": "financial",
      "toClass": "ExpenseQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardKpiService",
      "toModule": "season",
      "toClass": "HarvestQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardKpiService",
      "toModule": "season",
      "toClass": "TaskQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardPlotStatusReadService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardPlotStatusReadService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardPlotStatusReadService",
      "toModule": "incident",
      "toClass": "IncidentQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardPlotStatusReadService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "identity",
      "toClass": "User",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "incident",
      "toClass": "Incident",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "incident",
      "toClass": "IncidentRepository",
      "type": "Repository"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "inventory",
      "toClass": "StockMovement",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "inventory",
      "toClass": "StockMovementRepository",
      "type": "Repository"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "marketplace",
      "toClass": "MarketplaceOrder",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "marketplace",
      "toClass": "MarketplaceOrderRepository",
      "type": "Repository"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "season",
      "toClass": "FieldLog",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "season",
      "toClass": "Harvest",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "season",
      "toClass": "TaskProgressLog",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "season",
      "toClass": "FieldLogRepository",
      "type": "Repository"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "season",
      "toClass": "HarvestRepository",
      "type": "Repository"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardRecentActivityReadService",
      "toModule": "season",
      "toClass": "TaskProgressLogRepository",
      "type": "Repository"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardService",
      "toModule": "farm",
      "toClass": "FarmerOwnershipService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardService",
      "toModule": "inventory",
      "toClass": "DashboardInventoryAlertsResponse",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardService",
      "toModule": "inventory",
      "toClass": "LowStockAlertResponse",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardTaskReadService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardTaskReadService",
      "toModule": "identity",
      "toClass": "IdentityQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardTaskReadService",
      "toModule": "season",
      "toClass": "TaskQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardWeatherService",
      "toModule": "farm",
      "toClass": "Farm",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardWeatherService",
      "toModule": "farm",
      "toClass": "FarmerOwnershipService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardWeatherService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "DashboardWeatherService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "FarmerReportService",
      "toModule": "admin",
      "toClass": "AdminReportResponse",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "FarmerReportService",
      "toModule": "farm",
      "toClass": "FarmAccessPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "FarmerReportService",
      "toModule": "farm",
      "toClass": "FarmerOwnershipService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "FarmerReportService",
      "toModule": "financial",
      "toClass": "ExpenseQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "FarmerReportService",
      "toModule": "season",
      "toClass": "Season",
      "type": "Entity"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "FarmerReportService",
      "toModule": "season",
      "toClass": "HarvestQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "FarmerReportService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "IrrigationWaterAnalysisService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "IrrigationWaterAnalysisService",
      "toModule": "farm",
      "toClass": "FarmerOwnershipService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "NutrientInputIngestionService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "NutrientInputIngestionService",
      "toModule": "farm",
      "toClass": "FarmerOwnershipService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SoilTestService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SoilTestService",
      "toModule": "farm",
      "toClass": "FarmerOwnershipService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityCalculationService",
      "toModule": "cropcatalog",
      "toClass": "CropCatalogQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityCalculationService",
      "toModule": "financial",
      "toClass": "ExpenseQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityCalculationService",
      "toModule": "season",
      "toClass": "HarvestQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityCalculationService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityDashboardContextService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityDashboardContextService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityDashboardContextService",
      "toModule": "farm",
      "toClass": "FarmerOwnershipService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityDashboardContextService",
      "toModule": "season",
      "toClass": "SeasonQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityDashboardService",
      "toModule": "shared",
      "toClass": "CurrentUserService",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityDashboardService",
      "toModule": "farm",
      "toClass": "FarmQueryPort",
      "type": "Other"
    },
    {
      "fromModule": "sustainability",
      "fromClass": "SustainabilityDashboardService",
      "toModule": "farm",
      "toClass": "FarmerOwnershipService",
      "type": "Other"
    }
  ]
}