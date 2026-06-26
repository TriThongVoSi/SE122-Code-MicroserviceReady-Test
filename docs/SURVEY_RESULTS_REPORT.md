# ACM Backend Architecture Survey

## 1. Controllers & API Endpoints

Below is a complete list of all `/api/v1/...` controllers and their endpoints, categorized by module:

### Module: `admin`

#### `AdminAlertController` (Base path: `/api/v1/admin/alerts`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/alerts` | `listAlerts` |
| **POST** | `/api/v1/admin/alerts/refresh` | `refreshAlerts` |
| **POST** | `/api/v1/admin/alerts/{id}/send` | `sendAlert` |
| **PATCH** | `/api/v1/admin/alerts/{id}/status` | `updateStatus` |

#### `AdminAuditLogController` (Base path: `/api/v1/admin/audit-logs`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/audit-logs` | `listAuditLogs` |

#### `AdminCropController` (Base path: `/api/v1/admin/crops`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/crops` | `listCrops` |
| **POST** | `/api/v1/admin/crops` | `createCrop` |
| **PUT** | `/api/v1/admin/crops/{id}` | `updateCrop` |
| **DELETE** | `/api/v1/admin/crops/{id}` | `deleteCrop` |

#### `AdminDashboardController` (Base path: `/api/v1/admin`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/dashboard-stats` | `getDashboardStats` |
| **GET** | `/api/v1/admin/dashboard/pending-approvals` | `getPendingApprovals` |
| **GET** | `/api/v1/admin/dashboard/inventory-health` | `getInventoryHealth` |

#### `AdminDocumentController` (Base path: `/api/v1/admin/documents`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/documents` | `listDocuments` |
| **GET** | `/api/v1/admin/documents/{id}` | `getDocumentById` |
| **POST** | `/api/v1/admin/documents` | `createDocument` |
| **PUT** | `/api/v1/admin/documents/{id}` | `updateDocument` |
| **DELETE** | `/api/v1/admin/documents/{id}` | `softDeleteDocument` |
| **DELETE** | `/api/v1/admin/documents/{id}/permanent` | `hardDeleteDocument` |

#### `AdminFarmController` (Base path: `/api/v1/admin/farms`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/farms` | `getAllFarms` |
| **GET** | `/api/v1/admin/farms/stats` | `getFarmStats` |

#### `AdminIncidentController` (Base path: `/api/v1/admin/incidents`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/incidents` | `listAllIncidents` |
| **GET** | `/api/v1/admin/incidents/{id}` | `getIncidentDetail` |
| **PATCH** | `/api/v1/admin/incidents/{id}/triage` | `triageIncident` |
| **PATCH** | `/api/v1/admin/incidents/{id}/resolve` | `resolveIncident` |
| **PATCH** | `/api/v1/admin/incidents/{id}/cancel` | `cancelIncident` |
| **PATCH** | `/api/v1/admin/incidents/{id}/status` | `updateIncidentStatus` |

#### `AdminInventoryController` (Base path: `/api/v1/admin/inventory`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/inventory/options` | `getOptions` |
| **GET** | `/api/v1/admin/inventory/lots` | `listRiskLots` |
| **GET** | `/api/v1/admin/inventory/lots/{lotId}` | `getLotDetail` |
| **GET** | `/api/v1/admin/inventory/lots/{lotId}/movements` | `getLotMovements` |

#### `AdminPlotController` (Base path: `/api/v1/admin/plots`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/plots` | `listAllPlots` |
| **GET** | `/api/v1/admin/plots/{id}` | `getPlot` |
| **GET** | `/api/v1/admin/plots/{id}/seasons` | `listPlotSeasons` |

#### `AdminReportController` (Base path: `/api/v1/admin/reports`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/reports/yield` | `getYieldReport` |
| **GET** | `/api/v1/admin/reports/cost` | `getCostReport` |
| **GET** | `/api/v1/admin/reports/revenue` | `getRevenueReport` |
| **GET** | `/api/v1/admin/reports/profit` | `getProfitReport` |
| **GET** | `/api/v1/admin/reports/summary` | `getSummary` |
| **GET** | `/api/v1/admin/reports/export` | `exportReport` |

#### `AdminRoleController` (Base path: `/api/v1/admin/roles`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/admin/roles` | `` |
| **GET** | `/api/v1/admin/roles` | `` |
| **DELETE** | `/api/v1/admin/roles/{roleCode}` | `` |

#### `AdminSeasonController` (Base path: `/api/v1/admin/seasons`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/seasons` | `listAllSeasons` |
| **GET** | `/api/v1/admin/seasons/{id}` | `getSeasonDetail` |
| **GET** | `/api/v1/admin/seasons/{id}/pending-task-count` | `getPendingTaskCount` |
| **PUT** | `/api/v1/admin/seasons/{id}` | `updateSeason` |

#### `AdminTaskController` (Base path: `/api/v1/admin/tasks`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/tasks` | `listAllTasks` |
| **GET** | `/api/v1/admin/tasks/{id}` | `getTask` |
| **PUT** | `/api/v1/admin/tasks/{id}` | `updateTask` |

#### `AdminUserController` (Base path: `/api/v1/admin/users`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/users` | `getAllUsers` |
| **GET** | `/api/v1/admin/users/{id}` | `getUserById` |
| **POST** | `/api/v1/admin/users` | `createUser` |
| **PUT** | `/api/v1/admin/users/{id}` | `updateUser` |
| **PATCH** | `/api/v1/admin/users/{id}/status` | `updateStatus` |
| **PATCH** | `/api/v1/admin/users/{id}/password` | `resetPassword` |
| **GET** | `/api/v1/admin/users/{id}/can-delete` | `canDelete` |
| **DELETE** | `/api/v1/admin/users/{id}` | `deleteUser` |
| **GET** | `/api/v1/admin/users/roles` | `getAllRoles` |

#### `AdminUserReportController` (Base path: `/api/v1/admin/reports/users`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/reports/users/summary` | `getUserSummaryReport` |

#### `AdminVarietyController` (Base path: `/api/v1/admin/varieties`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/varieties` | `listVarieties` |
| **GET** | `/api/v1/admin/varieties/{id}` | `getVariety` |
| **POST** | `/api/v1/admin/varieties` | `createVariety` |
| **PUT** | `/api/v1/admin/varieties/{id}` | `updateVariety` |
| **DELETE** | `/api/v1/admin/varieties/{id}` | `deleteVariety` |

#### `DocumentController` (Base path: `/api/v1/documents`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/documents` | `list` |
| **GET** | `/api/v1/documents/{id}` | `getById` |
| **POST** | `/api/v1/documents/{id}/open` | `recordOpen` |
| **POST** | `/api/v1/documents/{id}/favorite` | `addFavorite` |
| **DELETE** | `/api/v1/documents/{id}/favorite` | `removeFavorite` |

### Module: `ai`

#### `AIController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/ai/qa` | `` |

#### `ChatController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/farmer/ai/chat` | `chat` |
| **POST** | `/api/v1/buyer/ai/chat` | `buyerChat` |

### Module: `cropcatalog`

#### `CatalogController` (Base path: `/api/v1/catalog`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/catalog/crops` | `getAllCrops` |
| **GET** | `/api/v1/catalog/crops/{cropId}/varieties` | `getVarietiesByCrop` |

#### `CropController` (Base path: `/api/v1/crops`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/crops` | `listCrops` |
| **POST** | `/api/v1/crops` | `createCrop` |
| **GET** | `/api/v1/crops/{id}` | `getCrop` |
| **PUT** | `/api/v1/crops/{id}` | `updateCrop` |
| **DELETE** | `/api/v1/crops/{id}` | `deleteCrop` |

#### `VarietyController` (Base path: `/api/v1/varieties`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/varieties/{id}` | `get` |
| **GET** | `/api/v1/varieties/by-crop/{cropId}` | `listByCrop` |

### Module: `farm`

#### `AddressController` (Base path: `/api/v1/address`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/address/provinces` | `listProvinces` |
| **GET** | `/api/v1/address/provinces/{id}` | `getProvince` |
| **GET** | `/api/v1/address/provinces/{provinceId}/wards` | `listWardsByProvince` |
| **GET** | `/api/v1/address/wards/{id}` | `getWard` |
| **GET** | `/api/v1/address/stats` | `getStats` |

#### `FarmController` (Base path: `/api/v1/farms`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/farms` | `getMyFarms` |
| **POST** | `/api/v1/farms` | `createFarm` |
| **GET** | `/api/v1/farms/{farmId}` | `getFarmDetail` |
| **PUT** | `/api/v1/farms/{farmId}` | `updateFarm` |
| **DELETE** | `/api/v1/farms/{farmId}` | `deleteFarm` |

#### `LocationController` (Base path: `/api/v1/locations`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/locations/provinces` | `getAllProvinces` |
| **GET** | `/api/v1/locations/wards` | `getWardsByProvince` |

#### `PlotController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/farms/{farmId}/plots` | `listPlotsByFarm` |
| **POST** | `/api/v1/farms/{farmId}/plots` | `createPlot` |
| **GET** | `/api/v1/plots` | `listAllPlots` |
| **GET** | `/api/v1/plots/{id}` | `getPlot` |
| **PUT** | `/api/v1/plots/{id}` | `updatePlot` |
| **DELETE** | `/api/v1/plots/{id}` | `deletePlot` |

### Module: `financial`

#### `ExpenseController` (Base path: `/api/v1/expenses`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/expenses` | `listAllExpenses` |

#### `SeasonExpenseController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/seasons/{seasonId}/expenses` | `createExpense` |
| **GET** | `/api/v1/expenses/{id}` | `getExpense` |
| **PUT** | `/api/v1/expenses/{id}` | `updateExpense` |
| **GET** | `/api/v1/expenses/{id}/delete-confirmation` | `getDeleteConfirmation` |
| **DELETE** | `/api/v1/expenses/{id}` | `deleteExpense` |
| **GET** | `/api/v1/expenses/search` | `searchExpenses` |
| **GET** | `/api/v1/seasons/{seasonId}/expenses` | `listExpenses` |

### Module: `firebase`

#### `FirebaseChatTokenController` (Base path: `/api/v1/firebase`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/firebase/chat-token` | `createChatToken` |
| **GET** | `/api/v1/firebase/chat-contacts` | `getChatContacts` |

### Module: `identity`

#### `AuthenticationController` (Base path: `/api/v1/auth`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/auth/sign-in` | `` |
| **POST** | `/api/v1/auth/google` | `` |
| **GET** | `/api/v1/auth/me` | `` |
| **POST** | `/api/v1/auth/sign-up` | `` |
| **POST** | `/api/v1/auth/introspect` | `` |
| **POST** | `/api/v1/auth/refresh` | `` |
| **POST** | `/api/v1/auth/sign-out` | `` |

#### `PasswordResetController` (Base path: `/api/v1/auth`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/auth/forgot-password` | `forgotPassword` |
| **POST** | `/api/v1/auth/reset-password` | `resetPassword` |
| **GET** | `/api/v1/auth/reset-password/validate` | `validateResetToken` |

#### `PreferencesController` (Base path: `/api/v1/preferences`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/preferences/me` | `getMyPreferences` |
| **PUT** | `/api/v1/preferences/me` | `updateMyPreferences` |

#### `UserController` (Base path: `/api/v1/user`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/user/me` | `me` |
| **PUT** | `/api/v1/user/profile` | `updateProfile` |
| **PUT** | `/api/v1/user/change-password` | `changePassword` |

### Module: `incident`

#### `FarmerNotificationController` (Base path: `/api/v1/farmer/notifications`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/farmer/notifications` | `list` |
| **GET** | `/api/v1/farmer/notifications/unread-count` | `unreadCount` |
| **PATCH** | `/api/v1/farmer/notifications/{id}/read` | `markRead` |
| **PATCH** | `/api/v1/farmer/notifications/read-all` | `markAllRead` |

#### `IncidentController` (Base path: `/api/v1/incidents`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/incidents` | `listIncidents` |
| **GET** | `/api/v1/incidents/{id}` | `getIncident` |
| **POST** | `/api/v1/incidents` | `createIncident` |
| **PUT** | `/api/v1/incidents/{id}` | `updateIncident` |
| **PATCH** | `/api/v1/incidents/{id}/status` | `updateIncidentStatus` |
| **DELETE** | `/api/v1/incidents/{id}` | `deleteIncident` |
| **GET** | `/api/v1/incidents/summary` | `getIncidentSummary` |

#### `NotificationController` (Base path: `/api/v1/notifications`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/notifications` | `list` |
| **GET** | `/api/v1/notifications/unread-count` | `unreadCount` |
| **PATCH** | `/api/v1/notifications/{id}/read` | `markRead` |
| **PATCH** | `/api/v1/notifications/read-all` | `markAllRead` |

### Module: `inventory`

#### `InventoryController` (Base path: `/api/v1/inventory`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/inventory/warehouses/my` | `getMyWarehouses` |
| **GET** | `/api/v1/inventory/warehouses/{warehouseId}` | `getWarehouseById` |
| **POST** | `/api/v1/inventory/warehouses` | `createWarehouse` |
| **PATCH** | `/api/v1/inventory/warehouses/{warehouseId}` | `updateWarehouse` |
| **DELETE** | `/api/v1/inventory/warehouses/{warehouseId}` | `deleteWarehouse` |
| **GET** | `/api/v1/inventory/locations` | `getLocationsByWarehouse` |
| **GET** | `/api/v1/inventory/on-hand` | `getOnHand` |
| **GET** | `/api/v1/inventory/movements` | `getMovements` |
| **POST** | `/api/v1/inventory/movements` | `recordMovement` |
| **GET** | `/api/v1/inventory/lots/{lotId}/on-hand` | `getOnHandQuantity` |

#### `ProductWarehouseController` (Base path: `/api/v1/product-warehouses`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/product-warehouses/overview` | `getOverview` |
| **GET** | `/api/v1/product-warehouses/lots` | `listLots` |
| **GET** | `/api/v1/product-warehouses/lots/{id}` | `getLot` |
| **POST** | `/api/v1/product-warehouses/lots` | `createLot` |
| **PATCH** | `/api/v1/product-warehouses/lots/{id}` | `updateLot` |
| **DELETE** | `/api/v1/product-warehouses/lots/{id}` | `archiveLot` |
| **POST** | `/api/v1/product-warehouses/lots/{id}/adjust` | `adjustLot` |
| **POST** | `/api/v1/product-warehouses/lots/{id}/stock-out` | `stockOutLot` |
| **GET** | `/api/v1/product-warehouses/transactions` | `listTransactions` |
| **GET** | `/api/v1/product-warehouses/lots/{id}/traceability` | `getTraceability` |

#### `SuppliesController` (Base path: `/api/v1/supplies`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/supplies/suppliers` | `getSuppliers` |
| **POST** | `/api/v1/supplies/suppliers` | `createSupplier` |
| **GET** | `/api/v1/supplies/items` | `getSupplyItems` |
| **POST** | `/api/v1/supplies/items` | `createSupplyItem` |
| **GET** | `/api/v1/supplies/lots` | `getSupplyLots` |
| **POST** | `/api/v1/supplies/stock-in` | `stockIn` |

### Module: `marketplace`

#### `MarketplaceAdminController` (Base path: `/api/v1/marketplace/admin`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/marketplace/admin/products` | `listProducts` |
| **GET** | `/api/v1/marketplace/admin/products/{productId}` | `getProductDetail` |
| **PATCH** | `/api/v1/marketplace/admin/products/{productId}/status` | `updateProductStatus` |
| **GET** | `/api/v1/marketplace/admin/orders` | `listOrders` |
| **GET** | `/api/v1/marketplace/admin/orders/{orderId}` | `getOrderDetail` |
| **PATCH** | `/api/v1/marketplace/admin/orders/{orderId}/payment-verification` | `updatePaymentVerification` |
| **PATCH** | `/api/v1/marketplace/admin/orders/{orderId}/status` | `updateOrderStatus` |
| **GET** | `/api/v1/marketplace/admin/orders/{orderId}/audit-logs` | `getOrderAuditLogs` |
| **GET** | `/api/v1/marketplace/admin/stats` | `getStats` |
| **PATCH** | `/api/v1/marketplace/admin/reviews/{reviewId}/hide` | `hideReview` |
| **DELETE** | `/api/v1/marketplace/admin/reviews/{reviewId}` | `deleteReview` |

#### `MarketplaceAdminPaymentProofController` (Base path: `/api/v1/admin/marketplace/payment-proofs`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/admin/marketplace/payment-proofs` | `listPaymentProofs` |
| **PATCH** | `/api/v1/admin/marketplace/payment-proofs/{orderId}/verify` | `verifyPaymentProof` |
| **PATCH** | `/api/v1/admin/marketplace/payment-proofs/{orderId}/reject` | `rejectPaymentProof` |

#### `MarketplaceBuyerAddressAliasController` (Base path: `/api/v1/buyer/addresses`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/buyer/addresses` | `listAddresses` |
| **POST** | `/api/v1/buyer/addresses` | `createAddress` |
| **PATCH** | `/api/v1/buyer/addresses/{addressId}` | `updateAddress` |
| **DELETE** | `/api/v1/buyer/addresses/{addressId}` | `deleteAddress` |
| **PATCH** | `/api/v1/buyer/addresses/{addressId}/default` | `setDefaultAddress` |

#### `MarketplaceBuyerImageSearchController` (Base path: `/api/v1/buyer/marketplace/image-search`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/buyer/marketplace/image-search/analyze` | `analyze` |
| **POST** | `/api/v1/buyer/marketplace/image-search` | `search` |

#### `MarketplaceBuyerOrderAliasController` (Base path: `/api/v1/buyer/orders`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/buyer/orders/preview` | `previewOrder` |
| **POST** | `/api/v1/buyer/orders` | `createOrder` |
| **GET** | `/api/v1/buyer/orders` | `listOrders` |
| **GET** | `/api/v1/buyer/orders/{orderId}` | `getOrderDetail` |
| **PUT** | `/api/v1/buyer/orders/{orderId}/cancel` | `cancelOrder` |
| **POST** | `/api/v1/buyer/orders/{orderId}/cancel` | `cancelOrderPost` |
| **POST** | `/api/v1/buyer/orders/{orderId}/payment-proof` | `uploadPaymentProof` |
| **GET** | `/api/v1/buyer/orders/{orderId}/payment-proof` | `getPaymentProof` |
| **GET** | `/api/v1/buyer/orders/{orderId}/items/{itemId}/traceability` | `getOrderItemTraceability` |

#### `MarketplaceBuyerReviewController` (Base path: `/api/v1/buyer`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/buyer/orders/{orderId}/reviews` | `createReview` |
| **PATCH** | `/api/v1/buyer/reviews/{reviewId}` | `editReview` |
| **DELETE** | `/api/v1/buyer/reviews/{reviewId}` | `deleteReview` |

#### `MarketplaceController` (Base path: `/api/v1/marketplace`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/marketplace/products` | `listProducts` |
| **GET** | `/api/v1/marketplace/products/{slug}` | `getProductBySlug` |
| **GET** | `/api/v1/marketplace/product-images/{fileName:.+}` | `getProductImage` |
| **GET** | `/api/v1/marketplace/products/{productId}/reviews` | `listProductReviews` |
| **GET** | `/api/v1/marketplace/farms` | `listFarms` |
| **GET** | `/api/v1/marketplace/farms/{farmId}` | `getFarmDetail` |
| **GET** | `/api/v1/marketplace/farms/{farmId}/reviews` | `listFarmReviews` |
| **GET** | `/api/v1/marketplace/products/{productId}/traceability` | `getProductTraceability` |
| **GET** | `/api/v1/marketplace/traceability/{productId}` | `getTraceabilityLegacy` |
| **GET** | `/api/v1/marketplace/cart` | `getCart` |
| **POST** | `/api/v1/marketplace/cart/items` | `addCartItem` |
| **PUT** | `/api/v1/marketplace/cart/items/{productId}` | `updateCartItem` |
| **PATCH** | `/api/v1/marketplace/cart/items/{productId}` | `patchCartItem` |
| **DELETE** | `/api/v1/marketplace/cart/items/{productId}` | `removeCartItem` |
| **POST** | `/api/v1/marketplace/cart/merge` | `mergeCart` |
| **DELETE** | `/api/v1/marketplace/cart` | `clearCart` |
| **POST** | `/api/v1/marketplace/orders/preview` | `previewOrder` |
| **POST** | `/api/v1/marketplace/orders` | `createOrder` |
| **POST** | `/api/v1/marketplace/orders/{orderId}/payment-proof` | `uploadPaymentProof` |
| **GET** | `/api/v1/marketplace/orders` | `listOrders` |
| **GET** | `/api/v1/marketplace/orders/{orderId}` | `getOrderDetail` |
| **PUT** | `/api/v1/marketplace/orders/{orderId}/cancel` | `cancelOrderPut` |
| **POST** | `/api/v1/marketplace/orders/{orderId}/cancel` | `cancelOrderPost` |
| **GET** | `/api/v1/marketplace/addresses` | `listAddresses` |
| **POST** | `/api/v1/marketplace/addresses` | `createAddress` |
| **PATCH** | `/api/v1/marketplace/addresses/{addressId}` | `updateAddress` |
| **PATCH** | `/api/v1/marketplace/addresses/{addressId}/default` | `setDefaultAddress` |
| **DELETE** | `/api/v1/marketplace/addresses/{addressId}` | `deleteAddress` |
| **POST** | `/api/v1/marketplace/reviews` | `createReview` |

#### `MarketplaceFarmerController` (Base path: `/api/v1/marketplace/farmer`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/marketplace/farmer/dashboard` | `getDashboard` |
| **GET** | `/api/v1/marketplace/farmer/products` | `listProducts` |
| **GET** | `/api/v1/marketplace/farmer/product-form-options` | `getProductFormOptions` |
| **GET** | `/api/v1/marketplace/farmer/products/{productId}` | `getProductDetail` |
| **POST** | `/api/v1/marketplace/farmer/products` | `createProduct` |
| **POST** | `/api/v1/marketplace/farmer/product-images` | `uploadProductImage` |
| **PUT** | `/api/v1/marketplace/farmer/products/{productId}` | `updateProduct` |
| **PATCH** | `/api/v1/marketplace/farmer/products/{productId}/status` | `updateProductStatus` |
| **GET** | `/api/v1/marketplace/farmer/orders` | `listOrders` |
| **GET** | `/api/v1/marketplace/farmer/orders/{orderId}` | `getOrderDetail` |
| **PATCH** | `/api/v1/marketplace/farmer/orders/{orderId}/status` | `updateOrderStatus` |

#### `MarketplaceFarmerOrderAliasController` (Base path: `/api/v1/farmer/orders`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/farmer/orders` | `listOrders` |
| **GET** | `/api/v1/farmer/orders/{orderId}` | `getOrderDetail` |
| **PATCH** | `/api/v1/farmer/orders/{orderId}/status` | `updateOrderStatus` |

### Module: `root`

#### `HealthController` (Base path: `/api/v1/public`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/public/health` | `health` |

### Module: `season`

#### `DiseaseRecordController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/seasons/{seasonId}/disease-records` | `listDiseaseRecordsBySeason` |
| **POST** | `/api/v1/seasons/{seasonId}/disease-records` | `createDiseaseRecord` |
| **GET** | `/api/v1/disease-records/{id}` | `getDiseaseRecordDetail` |
| **PUT** | `/api/v1/disease-records/{id}` | `updateDiseaseRecord` |
| **DELETE** | `/api/v1/disease-records/{id}` | `deleteDiseaseRecord` |
| **GET** | `/api/v1/disease-records/{id}/treatments` | `listTreatments` |
| **POST** | `/api/v1/disease-records/{id}/treatments` | `createTreatment` |
| **PUT** | `/api/v1/disease-treatments/{id}` | `updateTreatment` |
| **DELETE** | `/api/v1/disease-treatments/{id}` | `deleteTreatment` |
| **POST** | `/api/v1/disease-records/{id}/ai-suggestion` | `generateAiSuggestion` |

#### `EmployeePortalController` (Base path: `/api/v1/employee`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/employee/tasks` | `listAssignedTasks` |
| **GET** | `/api/v1/employee/seasons/{seasonId}/plan` | `getSeasonPlan` |
| **GET** | `/api/v1/employee/seasons` | `listAssignedSeasons` |
| **PATCH** | `/api/v1/employee/tasks/{taskId}/accept` | `acceptTask` |
| **POST** | `/api/v1/employee/tasks/{taskId}/progress` | `reportProgress` |
| **GET** | `/api/v1/employee/progress` | `listMyProgress` |
| **GET** | `/api/v1/employee/payroll` | `listMyPayroll` |
| **GET** | `/api/v1/employee/payroll/{payrollRecordId}` | `getMyPayrollDetail` |
| **GET** | `/api/v1/employee/seasons/{seasonId}/field-logs` | `listFieldLogs` |
| **POST** | `/api/v1/employee/seasons/{seasonId}/field-logs` | `createFieldLog` |
| **GET** | `/api/v1/employee/field-logs/{id}` | `getFieldLog` |
| **PUT** | `/api/v1/employee/field-logs/{id}` | `updateFieldLog` |
| **DELETE** | `/api/v1/employee/field-logs/{id}` | `deleteFieldLog` |
| **GET** | `/api/v1/employee/seasons/{seasonId}/disease-records` | `listDiseaseRecords` |
| **POST** | `/api/v1/employee/seasons/{seasonId}/disease-records` | `createDiseaseRecord` |
| **GET** | `/api/v1/employee/disease-records/{id}` | `getDiseaseRecordDetail` |
| **PUT** | `/api/v1/employee/disease-records/{id}` | `updateDiseaseRecord` |
| **DELETE** | `/api/v1/employee/disease-records/{id}` | `deleteDiseaseRecord` |
| **GET** | `/api/v1/employee/disease-records/{id}/treatments` | `listTreatments` |
| **POST** | `/api/v1/employee/disease-records/{id}/treatments` | `createTreatment` |
| **PUT** | `/api/v1/employee/disease-treatments/{id}` | `updateTreatment` |
| **DELETE** | `/api/v1/employee/disease-treatments/{id}` | `deleteTreatment` |
| **POST** | `/api/v1/employee/disease-records/{id}/ai-suggestion` | `generateAiSuggestion` |
| **GET** | `/api/v1/employee/seasons/{seasonId}/supplies/items` | `listSeasonSupplyItems` |
| **GET** | `/api/v1/employee/seasons/{seasonId}/supplies/lots` | `listSeasonSupplyLots` |

#### `FarmerLaborManagementController` (Base path: `/api/v1/farmer/labor`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/farmer/labor/employees/directory` | `listEmployeeDirectory` |
| **GET** | `/api/v1/farmer/labor/seasons/{seasonId}/employees` | `listSeasonEmployees` |
| **POST** | `/api/v1/farmer/labor/seasons/{seasonId}/employees` | `addSeasonEmployee` |
| **POST** | `/api/v1/farmer/labor/seasons/{seasonId}/employees/bulk` | `bulkAssignSeasonEmployees` |
| **PATCH** | `/api/v1/farmer/labor/seasons/{seasonId}/employees/{employeeUserId}` | `updateSeasonEmployee` |
| **DELETE** | `/api/v1/farmer/labor/seasons/{seasonId}/employees/{employeeUserId}` | `removeSeasonEmployee` |
| **PATCH** | `/api/v1/farmer/labor/tasks/{taskId}/assign` | `assignTaskToEmployee` |
| **GET** | `/api/v1/farmer/labor/seasons/{seasonId}/progress` | `listSeasonProgress` |
| **GET** | `/api/v1/farmer/labor/seasons/{seasonId}/payroll` | `listSeasonPayroll` |
| **GET** | `/api/v1/farmer/labor/seasons/{seasonId}/payroll/{payrollRecordId}` | `getSeasonPayrollDetail` |
| **PATCH** | `/api/v1/farmer/labor/seasons/{seasonId}/payroll/{payrollRecordId}` | `updateSeasonPayroll` |
| **POST** | `/api/v1/farmer/labor/seasons/{seasonId}/payroll/recalculate` | `recalculatePayroll` |

#### `FieldLogController` (Base path: `/api/v1/field-logs`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/field-logs` | `listFieldLogs` |
| **GET** | `/api/v1/field-logs/{id}` | `getFieldLog` |
| **POST** | `/api/v1/field-logs` | `createFieldLog` |
| **PUT** | `/api/v1/field-logs/{id}` | `updateFieldLog` |
| **DELETE** | `/api/v1/field-logs/{id}` | `deleteFieldLog` |

#### `SeasonController` (Base path: `/api/v1/seasons`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/seasons` | `searchSeasons` |
| **GET** | `/api/v1/seasons/my` | `getMySeasons` |
| **GET** | `/api/v1/seasons/{id}` | `getSeason` |
| **POST** | `/api/v1/seasons` | `createSeason` |
| **PUT** | `/api/v1/seasons/{id}` | `updateSeason` |
| **PATCH** | `/api/v1/seasons/{id}/status` | `updateSeasonStatus` |
| **POST** | `/api/v1/seasons/{id}/start` | `startSeason` |
| **POST** | `/api/v1/seasons/{id}/complete` | `completeSeason` |
| **POST** | `/api/v1/seasons/{id}/cancel` | `cancelSeason` |
| **DELETE** | `/api/v1/seasons/{id}` | `deleteSeason` |
| **PATCH** | `/api/v1/seasons/{id}/archive` | `archiveSeason` |
| **GET** | `/api/v1/seasons/search` | `searchSeasonsByKeyword` |

#### `SeasonCostOptimizationController` (Base path: `/api/v1/seasons/{seasonId}/cost-optimization`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/seasons/{seasonId}/cost-optimization/summary` | `getSummary` |
| **POST** | `/api/v1/seasons/{seasonId}/cost-optimization/ai-suggestion` | `generateSuggestion` |

#### `SeasonHarvestController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/harvests` | `listAllHarvests` |
| **GET** | `/api/v1/harvests/summary` | `getSummary` |
| **GET** | `/api/v1/seasons/{seasonId}/harvests` | `listHarvests` |
| **GET** | `/api/v1/seasons/{seasonId}/harvests/stock-context` | `getHarvestStockContext` |
| **POST** | `/api/v1/seasons/{seasonId}/harvests` | `createHarvest` |
| **GET** | `/api/v1/harvests/{id}` | `getHarvest` |
| **PUT** | `/api/v1/harvests/{id}` | `updateHarvest` |
| **DELETE** | `/api/v1/harvests/{id}` | `deleteHarvest` |

#### `TaskController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/seasons/{seasonId}/tasks` | `listTasks` |
| **POST** | `/api/v1/seasons/{seasonId}/tasks` | `createTask` |
| **GET** | `/api/v1/tasks/{id}` | `getTask` |
| **PUT** | `/api/v1/tasks/{id}` | `updateTask` |
| **PATCH** | `/api/v1/tasks/{id}/status` | `updateTaskStatus` |
| **DELETE** | `/api/v1/tasks/{id}` | `deleteTask` |

#### `TaskWorkspaceController` (Base path: `/api/v1/workspace/tasks`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/workspace/tasks` | `createTask` |
| **GET** | `/api/v1/workspace/tasks` | `listTasks` |
| **GET** | `/api/v1/workspace/tasks/{id}` | `getTask` |
| **PUT** | `/api/v1/workspace/tasks/{id}` | `updateTask` |
| **PATCH** | `/api/v1/workspace/tasks/{id}/start` | `startTask` |
| **PATCH** | `/api/v1/workspace/tasks/{id}/done` | `doneTask` |
| **PATCH** | `/api/v1/workspace/tasks/{id}/cancel` | `cancelTask` |
| **DELETE** | `/api/v1/workspace/tasks/{id}` | `deleteTask` |
| **GET** | `/api/v1/workspace/tasks/seasons` | `getUserSeasons` |

### Module: `shared`

#### `ModuleHealthController` (Base path: `/api/v1/public`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/public/health/modules` | `moduleHealthOverview` |
| **GET** | `/api/v1/public/health/modules/{moduleName}` | `moduleHealth` |

### Module: `sustainability`

#### `DashboardController` (Base path: `/api/v1/dashboard`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/dashboard/overview` | `getOverview` |
| **GET** | `/api/v1/dashboard/today-tasks` | `getTodayTasks` |
| **GET** | `/api/v1/dashboard/upcoming-tasks` | `getUpcomingTasks` |
| **GET** | `/api/v1/dashboard/recent-activities` | `getRecentActivities` |
| **GET** | `/api/v1/dashboard/data-completeness-warnings` | `getDataCompletenessWarnings` |
| **GET** | `/api/v1/dashboard/plot-status` | `getPlotStatus` |
| **GET** | `/api/v1/dashboard/low-stock` | `getLowStock` |
| **GET** | `/api/v1/dashboard/inventory-alerts` | `getInventoryAlerts` |
| **GET** | `/api/v1/dashboard/incident-alerts` | `getIncidentAlerts` |
| **GET** | `/api/v1/dashboard/weather` | `getWeather` |

#### `FarmerReportController` (Base path: `/api/v1/farmer/reports`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/farmer/reports/yield` | `getYieldReport` |
| **GET** | `/api/v1/farmer/reports/cost` | `getCostReport` |
| **GET** | `/api/v1/farmer/reports/revenue` | `getRevenueReport` |
| **GET** | `/api/v1/farmer/reports/profit` | `getProfitReport` |

#### `IrrigationWaterAnalysisController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/seasons/{seasonId}/irrigation-water-analyses` | `create` |
| **GET** | `/api/v1/seasons/{seasonId}/irrigation-water-analyses` | `list` |

#### `NutrientInputController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/seasons/{seasonId}/nutrient-inputs` | `createNutrientInput` |
| **GET** | `/api/v1/seasons/{seasonId}/nutrient-inputs` | `listNutrientInputs` |

#### `SoilTestController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **POST** | `/api/v1/seasons/{seasonId}/soil-tests` | `create` |
| **GET** | `/api/v1/seasons/{seasonId}/soil-tests` | `list` |

#### `SustainabilityController` (Base path: `/api/v1`)
| Method | Route | Java Method |
|---|---|---|
| **GET** | `/api/v1/dashboard/sustainability/overview` | `getOverview` |
| **GET** | `/api/v1/fields/map` | `getFieldMap` |
| **GET** | `/api/v1/fields/{fieldId}/sustainability-metrics` | `getFieldMetrics` |
| **GET** | `/api/v1/fields/{fieldId}/fdn-history` | `getFieldHistory` |
| **GET** | `/api/v1/fields/{fieldId}/recommendations` | `getFieldRecommendations` |


## 2. Entities, Repositories, and Tables

Below are the JPA Entities, their corresponding database tables, and repositories organized by module/domain:

### Module/Domain: `admin`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `AuditLog` | `auditlog` | None |
| `Document` | `documents` | None |
| `DocumentFavorite` | `documentfavorite` | None |
| `DocumentRecentOpen` | `document_recent_opens` | None |

#### Repositories:
- `AuditLogRepository`
- `DocumentFavoriteRepository`
- `DocumentRecentOpenRepository`
- `DocumentRepository`

### Module/Domain: `cropcatalog`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `Crop` | `crops` | None |
| `CropNitrogenReference` | `crop_nitrogen_references` | `@ManyToOne` target: `Crop` (`crop`) |
| `Variety` | `varieties` | `@ManyToOne` target: `Crop` (`crop`) |

#### Repositories:
- `CropNitrogenReferenceRepository`
- `CropRepository`
- `VarietyRepository`

### Module/Domain: `farm`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `Farm` | `farms` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`user`)<br>`@ManyToOne` target: `Province` (`province`)<br>`@ManyToOne` target: `Ward` (`ward`) |
| `Plot` | `plots` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`user`)<br>`@ManyToOne` target: `Farm` (`farm`) |
| `Province` | `provinces` | `@OneToMany` target: `List<Ward>` (`wards`) |
| `Ward` | `wards` | `@ManyToOne` target: `Province` (`province`) |

#### Repositories:
- `FarmRepository`
- `PlotRepository`
- `ProvinceRepository`
- `WardRepository`

### Module/Domain: `financial`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `Expense` | `expenses` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`user`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Task` (`task`) |

#### Repositories:
- `ExpenseRepository`

### Module/Domain: `identity`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `InvalidatedToken` | `invalidatedtoken` | None |
| `PasswordResetToken` | `passwordresettoken` | `@ManyToOne` target: `User` (`user`) |
| `Role` | `roles` | None |
| `User` | `users` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Province` (`province`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Ward` (`ward`)<br>`@ManyToMany` target: `Set<Role>` (`roles`) |
| `UserPreference` | `userpreference` | `@ManyToOne` target: `User` (`user`) |

#### Repositories:
- `InvalidatedTokenRepository`
- `PasswordResetTokenRepository`
- `RoleRepository`
- `UserPreferenceRepository`
- `UserRepository`

### Module/Domain: `incident`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `Alert` | `alerts` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Farm` (`farm`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Plot` (`plot`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.cropcatalog.entity.Crop` (`crop`) |
| `Incident` | `incidents` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`reportedBy`) |
| `Notification` | `notification` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`user`)<br>`@ManyToOne` target: `Alert` (`alert`) |

#### Repositories:
- `AlertRepository`
- `IncidentRepository`
- `NotificationRepository`

### Module/Domain: `inventory`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `InventoryBalance` | `inventorybalance` | `@ManyToOne` target: `SupplyLot` (`supplyLot`)<br>`@ManyToOne` target: `Warehouse` (`warehouse`)<br>`@ManyToOne` target: `StockLocation` (`location`) |
| `ProductWarehouseLot` | `productwarehouselot` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Farm` (`farm`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Plot` (`plot`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Harvest` (`harvest`)<br>`@ManyToOne` target: `Warehouse` (`warehouse`)<br>`@ManyToOne` target: `StockLocation` (`location`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`createdBy`) |
| `ProductWarehouseTransaction` | `product_warehouse_transactions` | `@ManyToOne` target: `ProductWarehouseLot` (`lot`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`createdBy`) |
| `StockLocation` | `stock_locations` | `@ManyToOne` target: `Warehouse` (`warehouse`) |
| `StockMovement` | `stock_movements` | `@ManyToOne` target: `SupplyLot` (`supplyLot`)<br>`@ManyToOne` target: `Warehouse` (`warehouse`)<br>`@ManyToOne` target: `StockLocation` (`location`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Task` (`task`) |
| `Supplier` | `suppliers` | None |
| `SupplyItem` | `supply_items` | None |
| `SupplyLot` | `supply_lots` | `@ManyToOne` target: `SupplyItem` (`supplyItem`)<br>`@ManyToOne` target: `Supplier` (`supplier`) |
| `Warehouse` | `warehouses` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Farm` (`farm`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Province` (`province`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Ward` (`ward`) |

#### Repositories:
- `InventoryBalanceRepository`
- `ProductWarehouseLotRepository`
- `ProductWarehouseTransactionRepository`
- `StockLocationRepository`
- `StockMovementRepository`
- `SupplierRepository`
- `SupplyItemRepository`
- `SupplyLotRepository`
- `WarehouseRepository`

### Module/Domain: `marketplace`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `MarketplaceAddress` | `marketplace_addresses` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`user`) |
| `MarketplaceCart` | `marketplace_carts` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`user`) |
| `MarketplaceCartItem` | `marketplace_cart_items` | `@ManyToOne` target: `MarketplaceCart` (`cart`)<br>`@ManyToOne` target: `MarketplaceProduct` (`product`) |
| `MarketplaceOrder` | `marketplace_orders` | `@ManyToOne` target: `MarketplaceOrderGroup` (`orderGroup`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`buyerUser`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`farmerUser`) |
| `MarketplaceOrderGroup` | `marketplace_order_groups` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`buyerUser`) |
| `MarketplaceOrderItem` | `marketplace_order_items` | `@ManyToOne` target: `MarketplaceOrder` (`order`)<br>`@ManyToOne` target: `MarketplaceProduct` (`product`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Farm` (`farm`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.inventory.entity.ProductWarehouseLot` (`lot`) |
| `MarketplaceProduct` | `marketplace_products` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`farmerUser`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Farm` (`farm`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.inventory.entity.ProductWarehouseLot` (`lot`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`statusChangedByUser`) |
| `MarketplaceProductReview` | `marketplaceproductreview` | `@ManyToOne` target: `MarketplaceProduct` (`product`)<br>`@ManyToOne` target: `MarketplaceOrder` (`order`)<br>`@ManyToOne` target: `MarketplaceOrderItem` (`orderItem`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`buyerUser`) |

#### Repositories:
- `MarketplaceAddressRepository`
- `MarketplaceCartItemRepository`
- `MarketplaceCartRepository`
- `MarketplaceOrderGroupRepository`
- `MarketplaceOrderItemRepository`
- `MarketplaceOrderRepository`
- `MarketplaceProductRepository`
- `MarketplaceProductReviewRepository`

### Module/Domain: `season`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `DashboardTaskView` | `dashboardtaskview` | `@ManyToOne` target: `Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Plot` (`plot`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`assignee`) |
| `DiseaseRecord` | `disease_records` | `@ManyToOne` target: `Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Plot` (`plot`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.cropcatalog.entity.Crop` (`crop`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.cropcatalog.entity.Variety` (`variety`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`reportedBy`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.incident.entity.Incident` (`incident`) |
| `DiseaseTreatment` | `disease_treatments` | `@ManyToOne` target: `DiseaseRecord` (`diseaseRecord`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.inventory.entity.SupplyItem` (`supplyItem`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.inventory.entity.SupplyLot` (`supplyLot`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.financial.entity.Expense` (`expense`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`createdBy`) |
| `FieldLog` | `field_logs` | `@ManyToOne` target: `Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`createdBy`) |
| `Harvest` | `harvests` | `@ManyToOne` target: `Season` (`season`) |
| `PayrollRecord` | `payrollrecord` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`employee`)<br>`@ManyToOne` target: `Season` (`season`) |
| `Season` | `seasons` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Plot` (`plot`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.cropcatalog.entity.Crop` (`crop`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.cropcatalog.entity.Variety` (`variety`) |
| `SeasonEmployee` | `seasonemployee` | `@ManyToOne` target: `Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`employee`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`addedBy`) |
| `Task` | `tasks` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`user`)<br>`@ManyToOne` target: `Season` (`season`) |
| `TaskProgressLog` | `taskprogresslog` | `@ManyToOne` target: `Task` (`task`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.identity.entity.User` (`employee`) |

#### Repositories:
- `DashboardTaskViewRepository`
- `DiseaseRecordRepository`
- `DiseaseTreatmentRepository`
- `FieldLogRepository`
- `HarvestRepository`
- `PayrollRecordRepository`
- `SeasonEmployeeRepository`
- `SeasonRepository`
- `TaskProgressLogRepository`
- `TaskRepository`

### Module/Domain: `sustainability`

#### Entities & Tables:
| Entity Class | DB Table Name | JPA Relationships |
|---|---|---|
| `IrrigationWaterAnalysis` | `irrigation_water_analyses` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Plot` (`plot`) |
| `NutrientInputEvent` | `nutrient_input_events` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Plot` (`plot`) |
| `SoilTest` | `soil_tests` | `@ManyToOne` target: `org.example.QuanLyMuaVu.module.season.entity.Season` (`season`)<br>`@ManyToOne` target: `org.example.QuanLyMuaVu.module.farm.entity.Plot` (`plot`) |

#### Repositories:
- `IrrigationWaterAnalysisRepository`
- `NutrientInputEventRepository`
- `SoilTestRepository`


## 3. Cross-Module JPA & Code Dependencies

To make the codebase microservice-ready, we must identify and freeze cross-module dependencies. These show where modules call other modules' entities, repositories, or services directly.

### Inter-Module Code References:
| Source Module | Source Class | Target Module | Target Class | Dependency Type |
|---|---|---|---|---|
| `admin` | `AdminCropController` | `cropcatalog` | `CropRequest` | **Other** |
| `admin` | `AdminCropController` | `cropcatalog` | `CropResponse` | **Other** |
| `admin` | `AdminCropController` | `cropcatalog` | `CropService` | **Other** |
| `admin` | `AdminVarietyController` | `cropcatalog` | `VarietyRequest` | **Other** |
| `admin` | `AdminVarietyController` | `cropcatalog` | `VarietyResponse` | **Other** |
| `admin` | `AdminVarietyController` | `cropcatalog` | `VarietyService` | **Other** |
| `admin` | `AdminFarmController` | `farm` | `FarmResponse` | **Other** |
| `admin` | `AdminPlotController` | `farm` | `PlotResponse` | **Other** |
| `admin` | `AdminDashboardFacade` | `farm` | `FarmQueryPort` | **Other** |
| `admin` | `AdminFarmQueryService` | `farm` | `FarmResponse` | **Other** |
| `admin` | `AdminFarmQueryService` | `farm` | `FarmQueryPort` | **Other** |
| `admin` | `AdminInventoryService` | `farm` | `FarmQueryPort` | **Other** |
| `admin` | `AdminPlotQueryService` | `farm` | `PlotResponse` | **Other** |
| `admin` | `AdminPlotQueryService` | `farm` | `FarmQueryPort` | **Other** |
| `admin` | `AdminUserCommandService` | `farm` | `FarmQueryPort` | **Other** |
| `admin` | `AdminReportService` | `financial` | `ExpenseQueryPort` | **Other** |
| `admin` | `AdminRoleController` | `identity` | `RoleRequest` | **Other** |
| `admin` | `AdminRoleController` | `identity` | `RoleResponse` | **Other** |
| `admin` | `AdminRoleController` | `identity` | `RoleService` | **Other** |
| `admin` | `AdminDashboardFacade` | `identity` | `IdentityQueryPort` | **Other** |
| `admin` | `AdminTaskService` | `identity` | `IdentityQueryPort` | **Other** |
| `admin` | `AdminUserCommandService` | `identity` | `IdentityCommandPort` | **Other** |
| `admin` | `AdminUserQueryService` | `identity` | `IdentityQueryPort` | **Other** |
| `admin` | `AdminUserReportService` | `identity` | `IdentityQueryPort` | **Other** |
| `admin` | `AdminIncidentController` | `incident` | `CancelIncidentRequest` | **Other** |
| `admin` | `AdminIncidentController` | `incident` | `ResolveIncidentRequest` | **Other** |
| `admin` | `AdminIncidentController` | `incident` | `TriageIncidentRequest` | **Other** |
| `admin` | `AdminIncidentController` | `incident` | `UpdateIncidentStatusRequest` | **Other** |
| `admin` | `AdminIncidentController` | `incident` | `IncidentResponse` | **Other** |
| `admin` | `AdminAlertService` | `incident` | `IncidentCommandPort` | **Other** |
| `admin` | `AdminAlertService` | `incident` | `IncidentQueryPort` | **Other** |
| `admin` | `AdminIncidentService` | `incident` | `CancelIncidentRequest` | **Other** |
| `admin` | `AdminIncidentService` | `incident` | `ResolveIncidentRequest` | **Other** |
| `admin` | `AdminIncidentService` | `incident` | `TriageIncidentRequest` | **Other** |
| `admin` | `AdminIncidentService` | `incident` | `IncidentResponse` | **Other** |
| `admin` | `AdminIncidentService` | `incident` | `IncidentMapper` | **Other** |
| `admin` | `AdminIncidentService` | `incident` | `IncidentCommandPort` | **Other** |
| `admin` | `AdminIncidentService` | `incident` | `IncidentQueryPort` | **Other** |
| `admin` | `AdminInventoryService` | `inventory` | `InventoryQueryPort` | **Other** |
| `admin` | `AdminPendingApprovalService` | `marketplace` | `MarketplaceOrder` | **Entity** |
| `admin` | `AdminPendingApprovalService` | `marketplace` | `MarketplaceProduct` | **Entity** |
| `admin` | `AdminPendingApprovalService` | `marketplace` | `MarketplacePaymentVerificationStatus` | **Other** |
| `admin` | `AdminPendingApprovalService` | `marketplace` | `MarketplaceProductStatus` | **Other** |
| `admin` | `AdminPendingApprovalService` | `marketplace` | `MarketplaceOrderRepository` | **Repository** |
| `admin` | `AdminPendingApprovalService` | `marketplace` | `MarketplaceProductRepository` | **Repository** |
| `admin` | `AdminPlotController` | `season` | `SeasonResponse` | **Other** |
| `admin` | `AdminSeasonController` | `season` | `SeasonDetailResponse` | **Other** |
| `admin` | `AdminSeasonController` | `season` | `SeasonResponse` | **Other** |
| `admin` | `AdminTaskController` | `season` | `TaskResponse` | **Other** |
| `admin` | `AdminDashboardFacade` | `season` | `SeasonQueryPort` | **Other** |
| `admin` | `AdminPlotQueryService` | `season` | `SeasonResponse` | **Other** |
| `admin` | `AdminPlotQueryService` | `season` | `SeasonQueryPort` | **Other** |
| `admin` | `AdminSeasonService` | `season` | `SeasonDetailResponse` | **Other** |
| `admin` | `AdminSeasonService` | `season` | `SeasonResponse` | **Other** |
| `admin` | `AdminSeasonService` | `season` | `SeasonMapper` | **Other** |
| `admin` | `AdminSeasonService` | `season` | `SeasonCommandPort` | **Other** |
| `admin` | `AdminSeasonService` | `season` | `SeasonQueryPort` | **Other** |
| `admin` | `AdminSeasonService` | `season` | `TaskCommandPort` | **Other** |
| `admin` | `AdminSeasonService` | `season` | `TaskQueryPort` | **Other** |
| `admin` | `AdminTaskService` | `season` | `TaskResponse` | **Other** |
| `admin` | `AdminTaskService` | `season` | `TaskCommandPort` | **Other** |
| `admin` | `AdminTaskService` | `season` | `TaskQueryPort` | **Other** |
| `admin` | `DocumentController` | `shared` | `CurrentUserService` | **Other** |
| `admin` | `AdminUserCommandService` | `shared` | `CurrentUserService` | **Other** |
| `ai` | `DiseaseSuggestionService` | `admin` | `AuditLogService` | **Other** |
| `ai` | `SeasonCostOptimizationService` | `admin` | `AuditLogService` | **Other** |
| `ai` | `DiseaseSuggestionService` | `farm` | `FarmAccessPort` | **Other** |
| `ai` | `SeasonCostOptimizationService` | `farm` | `FarmAccessPort` | **Other** |
| `ai` | `SeasonCostOptimizationService` | `financial` | `Expense` | **Entity** |
| `ai` | `SeasonCostOptimizationService` | `financial` | `ExpenseRepository` | **Repository** |
| `ai` | `DiseaseSuggestionService` | `incident` | `Incident` | **Entity** |
| `ai` | `DiseaseSuggestionService` | `incident` | `IncidentRepository` | **Repository** |
| `ai` | `DiseaseSuggestionService` | `inventory` | `InventoryBalance` | **Entity** |
| `ai` | `DiseaseSuggestionService` | `inventory` | `SupplyLot` | **Entity** |
| `ai` | `DiseaseSuggestionService` | `inventory` | `InventoryBalanceRepository` | **Repository** |
| `ai` | `SeasonCostOptimizationService` | `inventory` | `StockMovement` | **Entity** |
| `ai` | `SeasonCostOptimizationService` | `inventory` | `StockMovementRepository` | **Repository** |
| `ai` | `DiseaseSuggestionService` | `season` | `DiseaseRecord` | **Entity** |
| `ai` | `DiseaseSuggestionService` | `season` | `DiseaseTreatment` | **Entity** |
| `ai` | `DiseaseSuggestionService` | `season` | `FieldLog` | **Entity** |
| `ai` | `DiseaseSuggestionService` | `season` | `Season` | **Entity** |
| `ai` | `DiseaseSuggestionService` | `season` | `DiseaseRecordRepository` | **Repository** |
| `ai` | `DiseaseSuggestionService` | `season` | `DiseaseTreatmentRepository` | **Repository** |
| `ai` | `DiseaseSuggestionService` | `season` | `FieldLogRepository` | **Repository** |
| `ai` | `DiseaseSuggestionService` | `season` | `SeasonWorkspaceAccessService` | **Other** |
| `ai` | `SeasonCostOptimizationService` | `season` | `DiseaseTreatment` | **Entity** |
| `ai` | `SeasonCostOptimizationService` | `season` | `Season` | **Entity** |
| `ai` | `SeasonCostOptimizationService` | `season` | `DiseaseTreatmentRepository` | **Repository** |
| `ai` | `SeasonCostOptimizationService` | `season` | `HarvestRepository` | **Repository** |
| `ai` | `SeasonCostOptimizationService` | `season` | `PayrollRecordRepository` | **Repository** |
| `ai` | `SeasonCostOptimizationService` | `season` | `SeasonRepository` | **Repository** |
| `cropcatalog` | `VarietyService` | `season` | `SeasonQueryPort` | **Other** |
| `farm` | `FarmAccessService` | `identity` | `IdentityQueryPort` | **Other** |
| `farm` | `FarmerOwnershipService` | `identity` | `IdentityQueryPort` | **Other** |
| `farm` | `FarmerOwnershipService` | `season` | `SeasonQueryPort` | **Other** |
| `farm` | `PlotService` | `season` | `SeasonRepository` | **Repository** |
| `farm` | `PlotService` | `season` | `TaskRepository` | **Repository** |
| `farm` | `FarmerOwnershipService` | `shared` | `CurrentUserService` | **Other** |
| `farm` | `FarmService` | `shared` | `CurrentUserService` | **Other** |
| `farm` | `PlotService` | `shared` | `CurrentUserService` | **Other** |
| `financial` | `ExpenseRepository` | `admin` | `AdminReportProjections` | **Other** |
| `financial` | `SeasonExpenseService` | `farm` | `FarmAccessPort` | **Other** |
| `financial` | `ExpenseService` | `identity` | `IdentityQueryPort` | **Other** |
| `financial` | `ExpenseService` | `season` | `SeasonQueryPort` | **Other** |
| `financial` | `SeasonExpenseService` | `season` | `SeasonQueryPort` | **Other** |
| `financial` | `SeasonExpenseService` | `season` | `TaskQueryPort` | **Other** |
| `financial` | `SeasonExpenseService` | `shared` | `DomainEventPublisher` | **Other** |
| `financial` | `SeasonExpenseService` | `shared` | `ExpenseChangedEvent` | **Other** |
| `firebase` | `FirebaseChatContactService` | `farm` | `Farm` | **Entity** |
| `firebase` | `FirebaseChatContactService` | `farm` | `Province` | **Entity** |
| `firebase` | `FirebaseChatContactService` | `farm` | `Ward` | **Entity** |
| `firebase` | `FirebaseChatContactService` | `farm` | `FarmRepository` | **Repository** |
| `firebase` | `FirebaseChatContactService` | `identity` | `User` | **Entity** |
| `firebase` | `FirebaseChatContactService` | `identity` | `UserRepository` | **Repository** |
| `firebase` | `FirebaseChatContactService` | `shared` | `CurrentUserService` | **Other** |
| `firebase` | `FirebaseChatTokenController` | `shared` | `CurrentUserService` | **Other** |
| `identity` | `UserService` | `farm` | `FarmQueryPort` | **Other** |
| `identity` | `PreferencesService` | `shared` | `CurrentUserService` | **Other** |
| `incident` | `IncidentService` | `farm` | `FarmAccessPort` | **Other** |
| `incident` | `IncidentCommandService` | `identity` | `IdentityQueryPort` | **Other** |
| `incident` | `IncidentService` | `season` | `SeasonQueryPort` | **Other** |
| `incident` | `IncidentService` | `shared` | `DomainEventPublisher` | **Other** |
| `incident` | `IncidentService` | `shared` | `IncidentReportedEvent` | **Other** |
| `incident` | `NotificationService` | `shared` | `CurrentUserService` | **Other** |
| `inventory` | `InventoryService` | `admin` | `AuditLogService` | **Other** |
| `inventory` | `InventoryQueryService` | `farm` | `FarmQueryPort` | **Other** |
| `inventory` | `InventoryService` | `farm` | `FarmAccessPort` | **Other** |
| `inventory` | `InventoryService` | `farm` | `FarmQueryPort` | **Other** |
| `inventory` | `ProductWarehouseService` | `farm` | `FarmAccessPort` | **Other** |
| `inventory` | `ProductWarehouseService` | `farm` | `FarmQueryPort` | **Other** |
| `inventory` | `SuppliesService` | `farm` | `FarmAccessPort` | **Other** |
| `inventory` | `InventoryCommandService` | `identity` | `IdentityQueryPort` | **Other** |
| `inventory` | `ProductWarehouseLotRepository` | `marketplace` | `MarketplaceProductStatus` | **Other** |
| `inventory` | `InventoryCommandService` | `season` | `HarvestQueryPort` | **Other** |
| `inventory` | `InventoryService` | `season` | `SeasonQueryPort` | **Other** |
| `inventory` | `InventoryService` | `season` | `TaskQueryPort` | **Other** |
| `inventory` | `ProductWarehouseService` | `season` | `HarvestQueryPort` | **Other** |
| `inventory` | `ProductWarehouseService` | `season` | `SeasonQueryPort` | **Other** |
| `marketplace` | `MarketplaceImageSearchService` | `admin` | `AuditLogService` | **Other** |
| `marketplace` | `MarketplaceService` | `admin` | `AuditLog` | **Entity** |
| `marketplace` | `MarketplaceService` | `admin` | `AuditLogService` | **Other** |
| `marketplace` | `MarketplaceImageSearchService` | `ai` | `GeminiService` | **Other** |
| `marketplace` | `MarketplaceImageSearchService` | `cropcatalog` | `Crop` | **Entity** |
| `marketplace` | `MarketplaceImageSearchService` | `cropcatalog` | `Variety` | **Entity** |
| `marketplace` | `MarketplaceProductRepository` | `farm` | `Farm` | **Entity** |
| `marketplace` | `MarketplaceImageSearchService` | `farm` | `Farm` | **Entity** |
| `marketplace` | `MarketplaceImageSearchService` | `farm` | `Province` | **Entity** |
| `marketplace` | `MarketplaceService` | `farm` | `Farm` | **Entity** |
| `marketplace` | `MarketplaceService` | `farm` | `FarmRepository` | **Repository** |
| `marketplace` | `MarketplaceImageSearchService` | `identity` | `User` | **Entity** |
| `marketplace` | `MarketplaceService` | `identity` | `User` | **Entity** |
| `marketplace` | `MarketplaceService` | `incident` | `NotificationService` | **Other** |
| `marketplace` | `MarketplaceImageSearchService` | `inventory` | `ProductWarehouseLot` | **Entity** |
| `marketplace` | `MarketplaceService` | `inventory` | `ProductWarehouseLot` | **Entity** |
| `marketplace` | `MarketplaceService` | `inventory` | `ProductWarehouseTransaction` | **Entity** |
| `marketplace` | `MarketplaceService` | `inventory` | `ProductWarehouseLotRepository` | **Repository** |
| `marketplace` | `MarketplaceService` | `inventory` | `ProductWarehouseTransactionRepository` | **Repository** |
| `marketplace` | `MarketplaceImageSearchService` | `season` | `Season` | **Entity** |
| `marketplace` | `MarketplaceService` | `season` | `Season` | **Entity** |
| `marketplace` | `MarketplaceService` | `season` | `SeasonRepository` | **Repository** |
| `marketplace` | `MarketplaceImageSearchService` | `shared` | `CurrentUserService` | **Other** |
| `marketplace` | `MarketplaceService` | `shared` | `CurrentUserService` | **Other** |
| `season` | `HarvestRepository` | `admin` | `AdminReportProjections` | **Other** |
| `season` | `DiseaseRecordService` | `admin` | `AuditLogService` | **Other** |
| `season` | `LaborManagementService` | `admin` | `AuditLogService` | **Other** |
| `season` | `DiseaseRecordController` | `ai` | `DiseaseSuggestionRequest` | **Other** |
| `season` | `DiseaseRecordController` | `ai` | `DiseaseSuggestionResponse` | **Other** |
| `season` | `DiseaseRecordController` | `ai` | `DiseaseSuggestionService` | **Other** |
| `season` | `EmployeePortalController` | `ai` | `DiseaseSuggestionRequest` | **Other** |
| `season` | `EmployeePortalController` | `ai` | `DiseaseSuggestionResponse` | **Other** |
| `season` | `EmployeePortalController` | `ai` | `DiseaseSuggestionService` | **Other** |
| `season` | `SeasonCostOptimizationController` | `ai` | `SeasonCostOptimizationSuggestionRequest` | **Other** |
| `season` | `SeasonCostOptimizationController` | `ai` | `SeasonCostOptimizationSuggestionResponse` | **Other** |
| `season` | `SeasonCostOptimizationController` | `ai` | `SeasonCostOptimizationSummaryResponse` | **Other** |
| `season` | `SeasonCostOptimizationController` | `ai` | `SeasonCostOptimizationService` | **Other** |
| `season` | `SeasonService` | `cropcatalog` | `CropCatalogQueryPort` | **Other** |
| `season` | `DiseaseRecordService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `FieldLogService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `LaborManagementService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `SeasonHarvestService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `SeasonQueryService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `SeasonService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `SeasonService` | `farm` | `FarmQueryPort` | **Other** |
| `season` | `SeasonStatusService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `SeasonTaskService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `SeasonWorkspaceAccessService` | `farm` | `Farm` | **Entity** |
| `season` | `SeasonWorkspaceAccessService` | `farm` | `Plot` | **Entity** |
| `season` | `SeasonWorkspaceAccessService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `TaskWorkspaceService` | `farm` | `FarmAccessPort` | **Other** |
| `season` | `DiseaseRecordService` | `financial` | `Expense` | **Entity** |
| `season` | `DiseaseRecordService` | `financial` | `ExpenseRepository` | **Repository** |
| `season` | `SeasonService` | `financial` | `ExpenseQueryPort` | **Other** |
| `season` | `FieldLogService` | `identity` | `User` | **Entity** |
| `season` | `LaborManagementService` | `identity` | `IdentityQueryPort` | **Other** |
| `season` | `SeasonTaskService` | `identity` | `IdentityQueryPort` | **Other** |
| `season` | `SeasonWorkspaceAccessService` | `identity` | `User` | **Entity** |
| `season` | `TaskService` | `identity` | `IdentityQueryPort` | **Other** |
| `season` | `TaskWorkspaceService` | `identity` | `IdentityQueryPort` | **Other** |
| `season` | `DiseaseRecordService` | `incident` | `Incident` | **Entity** |
| `season` | `DiseaseRecordService` | `incident` | `IncidentRepository` | **Repository** |
| `season` | `LaborManagementService` | `incident` | `IncidentCommandPort` | **Other** |
| `season` | `EmployeePortalController` | `inventory` | `SupplyItemResponse` | **Other** |
| `season` | `EmployeePortalController` | `inventory` | `SupplyLotResponse` | **Other** |
| `season` | `EmployeePortalController` | `inventory` | `SuppliesService` | **Other** |
| `season` | `DiseaseRecordService` | `inventory` | `SupplyLot` | **Entity** |
| `season` | `DiseaseRecordService` | `inventory` | `InventoryBalanceRepository` | **Repository** |
| `season` | `DiseaseRecordService` | `inventory` | `StockMovementRepository` | **Repository** |
| `season` | `DiseaseRecordService` | `inventory` | `SupplyItemRepository` | **Repository** |
| `season` | `DiseaseRecordService` | `inventory` | `SupplyLotRepository` | **Repository** |
| `season` | `SeasonHarvestService` | `inventory` | `ProductWarehouseLot` | **Entity** |
| `season` | `SeasonHarvestService` | `inventory` | `HarvestStockContextView` | **Other** |
| `season` | `SeasonHarvestService` | `inventory` | `InventoryCommandPort` | **Other** |
| `season` | `SeasonHarvestService` | `inventory` | `InventoryQueryPort` | **Other** |
| `season` | `SeasonHarvestService` | `inventory` | `ReceiveHarvestRequest` | **Other** |
| `season` | `SeasonHarvestService` | `inventory` | `ProductWarehouseLotRepository` | **Repository** |
| `season` | `LaborManagementService` | `shared` | `DomainEventPublisher` | **Other** |
| `season` | `LaborManagementService` | `shared` | `TaskAssignedEvent` | **Other** |
| `season` | `LaborManagementService` | `shared` | `TaskCompletedEvent` | **Other** |
| `season` | `SeasonHarvestService` | `shared` | `DomainEventPublisher` | **Other** |
| `season` | `SeasonHarvestService` | `shared` | `HarvestChangedEvent` | **Other** |
| `season` | `SeasonService` | `shared` | `DomainEventPublisher` | **Other** |
| `season` | `SeasonService` | `shared` | `SeasonCreatedEvent` | **Other** |
| `season` | `SeasonStatusService` | `shared` | `SeasonStatusStrategy` | **Other** |
| `season` | `SeasonTaskService` | `shared` | `DomainEventPublisher` | **Other** |
| `season` | `SeasonTaskService` | `shared` | `TaskCompletedEvent` | **Other** |
| `season` | `TaskWorkspaceService` | `shared` | `DomainEventPublisher` | **Other** |
| `season` | `TaskWorkspaceService` | `shared` | `TaskCompletedEvent` | **Other** |
| `shared` | `CropVarietyValidator` | `cropcatalog` | `CropCatalogQueryPort` | **Other** |
| `shared` | `PlotOwnershipValidator` | `farm` | `FarmAccessPort` | **Other** |
| `shared` | `PlotOwnershipValidator` | `farm` | `FarmQueryPort` | **Other** |
| `shared` | `SecurityConfig` | `identity` | `CustomJwtDecoder` | **Other** |
| `shared` | `CurrentUserService` | `identity` | `IdentityQueryPort` | **Other** |
| `shared` | `DomainEventListener` | `incident` | `IncidentCommandPort` | **Other** |
| `shared` | `ActiveSeasonValidator` | `season` | `SeasonQueryPort` | **Other** |
| `shared` | `SeasonFactory` | `season` | `CreateSeasonRequest` | **Other** |
| `shared` | `TaskFactory` | `season` | `CreateTaskRequest` | **Other** |
| `shared` | `DomainEventListener` | `season` | `SeasonQueryPort` | **Other** |
| `sustainability` | `FarmerReportController` | `admin` | `AdminReportResponse` | **Other** |
| `sustainability` | `FarmerReportService` | `admin` | `AdminReportResponse` | **Other** |
| `sustainability` | `SustainabilityCalculationService` | `cropcatalog` | `CropCatalogQueryPort` | **Other** |
| `sustainability` | `DashboardAlertsService` | `farm` | `FarmQueryPort` | **Other** |
| `sustainability` | `DashboardPlotStatusReadService` | `farm` | `FarmQueryPort` | **Other** |
| `sustainability` | `DashboardService` | `farm` | `FarmQueryPort` | **Other** |
| `sustainability` | `DashboardService` | `farm` | `FarmerOwnershipService` | **Other** |
| `sustainability` | `DashboardWeatherService` | `farm` | `Farm` | **Entity** |
| `sustainability` | `DashboardWeatherService` | `farm` | `FarmerOwnershipService` | **Other** |
| `sustainability` | `FarmerReportService` | `farm` | `FarmAccessPort` | **Other** |
| `sustainability` | `FarmerReportService` | `farm` | `FarmerOwnershipService` | **Other** |
| `sustainability` | `IrrigationWaterAnalysisService` | `farm` | `FarmerOwnershipService` | **Other** |
| `sustainability` | `NutrientInputIngestionService` | `farm` | `FarmerOwnershipService` | **Other** |
| `sustainability` | `SoilTestService` | `farm` | `FarmerOwnershipService` | **Other** |
| `sustainability` | `SustainabilityDashboardContextService` | `farm` | `FarmQueryPort` | **Other** |
| `sustainability` | `SustainabilityDashboardContextService` | `farm` | `FarmerOwnershipService` | **Other** |
| `sustainability` | `SustainabilityDashboardService` | `farm` | `FarmQueryPort` | **Other** |
| `sustainability` | `SustainabilityDashboardService` | `farm` | `FarmerOwnershipService` | **Other** |
| `sustainability` | `DashboardKpiService` | `financial` | `ExpenseQueryPort` | **Other** |
| `sustainability` | `FarmerReportService` | `financial` | `ExpenseQueryPort` | **Other** |
| `sustainability` | `SustainabilityCalculationService` | `financial` | `ExpenseQueryPort` | **Other** |
| `sustainability` | `DashboardRecentActivityReadService` | `identity` | `User` | **Entity** |
| `sustainability` | `DashboardService` | `identity` | `IdentityQueryPort` | **Other** |
| `sustainability` | `DashboardTaskReadService` | `identity` | `IdentityQueryPort` | **Other** |
| `sustainability` | `DashboardAlertsService` | `incident` | `Incident` | **Entity** |
| `sustainability` | `DashboardAlertsService` | `incident` | `IncidentQueryPort` | **Other** |
| `sustainability` | `DashboardPlotStatusReadService` | `incident` | `IncidentQueryPort` | **Other** |
| `sustainability` | `DashboardRecentActivityReadService` | `incident` | `Incident` | **Entity** |
| `sustainability` | `DashboardRecentActivityReadService` | `incident` | `IncidentRepository` | **Repository** |
| `sustainability` | `DashboardController` | `inventory` | `DashboardInventoryAlertsResponse` | **Other** |
| `sustainability` | `DashboardController` | `inventory` | `LowStockAlertResponse` | **Other** |
| `sustainability` | `DashboardAlertsService` | `inventory` | `DashboardInventoryAlertsResponse` | **Other** |
| `sustainability` | `DashboardAlertsService` | `inventory` | `LowStockAlertResponse` | **Other** |
| `sustainability` | `DashboardAlertsService` | `inventory` | `InventoryBalance` | **Entity** |
| `sustainability` | `DashboardAlertsService` | `inventory` | `StockMovement` | **Entity** |
| `sustainability` | `DashboardAlertsService` | `inventory` | `SupplyLot` | **Entity** |
| `sustainability` | `DashboardAlertsService` | `inventory` | `InventoryLowStockView` | **Other** |
| `sustainability` | `DashboardAlertsService` | `inventory` | `InventoryQueryPort` | **Other** |
| `sustainability` | `DashboardRecentActivityReadService` | `inventory` | `StockMovement` | **Entity** |
| `sustainability` | `DashboardRecentActivityReadService` | `inventory` | `StockMovementRepository` | **Repository** |
| `sustainability` | `DashboardService` | `inventory` | `DashboardInventoryAlertsResponse` | **Other** |
| `sustainability` | `DashboardService` | `inventory` | `LowStockAlertResponse` | **Other** |
| `sustainability` | `DashboardRecentActivityReadService` | `marketplace` | `MarketplaceOrder` | **Entity** |
| `sustainability` | `DashboardRecentActivityReadService` | `marketplace` | `MarketplaceOrderRepository` | **Repository** |
| `sustainability` | `DashboardAlertsService` | `season` | `DashboardTaskView` | **Entity** |
| `sustainability` | `DashboardAlertsService` | `season` | `TaskQueryPort` | **Other** |
| `sustainability` | `DashboardKpiService` | `season` | `HarvestQueryPort` | **Other** |
| `sustainability` | `DashboardKpiService` | `season` | `TaskQueryPort` | **Other** |
| `sustainability` | `DashboardPlotStatusReadService` | `season` | `SeasonQueryPort` | **Other** |
| `sustainability` | `DashboardRecentActivityReadService` | `season` | `FieldLog` | **Entity** |
| `sustainability` | `DashboardRecentActivityReadService` | `season` | `Harvest` | **Entity** |
| `sustainability` | `DashboardRecentActivityReadService` | `season` | `TaskProgressLog` | **Entity** |
| `sustainability` | `DashboardRecentActivityReadService` | `season` | `FieldLogRepository` | **Repository** |
| `sustainability` | `DashboardRecentActivityReadService` | `season` | `HarvestRepository` | **Repository** |
| `sustainability` | `DashboardRecentActivityReadService` | `season` | `TaskProgressLogRepository` | **Repository** |
| `sustainability` | `DashboardService` | `season` | `SeasonQueryPort` | **Other** |
| `sustainability` | `DashboardTaskReadService` | `season` | `TaskQueryPort` | **Other** |
| `sustainability` | `DashboardWeatherService` | `season` | `SeasonQueryPort` | **Other** |
| `sustainability` | `FarmerReportService` | `season` | `Season` | **Entity** |
| `sustainability` | `FarmerReportService` | `season` | `HarvestQueryPort` | **Other** |
| `sustainability` | `FarmerReportService` | `season` | `SeasonQueryPort` | **Other** |
| `sustainability` | `SustainabilityCalculationService` | `season` | `HarvestQueryPort` | **Other** |
| `sustainability` | `SustainabilityCalculationService` | `season` | `SeasonQueryPort` | **Other** |
| `sustainability` | `SustainabilityDashboardContextService` | `season` | `SeasonQueryPort` | **Other** |
| `sustainability` | `DashboardAlertsService` | `shared` | `CurrentUserService` | **Other** |
| `sustainability` | `DashboardPlotStatusReadService` | `shared` | `CurrentUserService` | **Other** |
| `sustainability` | `DashboardService` | `shared` | `CurrentUserService` | **Other** |
| `sustainability` | `DashboardTaskReadService` | `shared` | `CurrentUserService` | **Other** |
| `sustainability` | `DashboardWeatherService` | `shared` | `CurrentUserService` | **Other** |
| `sustainability` | `IrrigationWaterAnalysisService` | `shared` | `CurrentUserService` | **Other** |
| `sustainability` | `NutrientInputIngestionService` | `shared` | `CurrentUserService` | **Other** |
| `sustainability` | `SoilTestService` | `shared` | `CurrentUserService` | **Other** |
| `sustainability` | `SustainabilityDashboardContextService` | `shared` | `CurrentUserService` | **Other** |
| `sustainability` | `SustainabilityDashboardService` | `shared` | `CurrentUserService` | **Other** |
