# Frontend-Backend API Contracts Specification

This document defines the exact contract specifications (methods, request parameters, request/response bodies, and error codes) for the core API endpoints consumed by the frontend application.

All endpoints are prefix-routed via the **API Gateway** on port `8000` (e.g., `http://localhost:8000/api/v1/...`).

---

## Table of Contents
1. [Authentication & Profile](#1-authentication--profile)
2. [Farmer Dashboard & Preferences](#2-farmer-dashboard--preferences)
3. [Plot & Farm Management](#3-plot--farm-management)
4. [Season Management](#4-season-management)
5. [Task Management](#5-task-management)
6. [Inventory & Warehouse](#6-inventory--warehouse)
7. [Incident Management](#7-incident-management)

---

## 1. Authentication & Profile

### 1.1. Sign In (Login)
* **Endpoint**: `POST /api/v1/auth/sign-in`
* **Description**: Authenticate with username or email and password.
* **Request Header**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "identifier": "farmer1@acm.local",
    "password": "12345678",
    "rememberMe": false
  }
  ```
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "token": "eyJhbGciOiJIUzUxMiJ9.ey...",
      "tokenType": "Bearer",
      "expiresIn": 3600,
      "role": "FARMER",
      "profile": {
        "id": 2,
        "fullName": "Nguyen Van T",
        "phone": "0900000001",
        "provinceId": 24,
        "wardId": 25112
      },
      "redirectTo": "/farmer"
    }
  }
  ```
* **Response Body (Invalid Credentials - `401 Unauthorized`)**:
  ```json
  {
    "status": 401,
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username/email or password."
  }
  ```

### 1.2. Get Current User (Bootstrapping)
* **Endpoint**: `GET /api/v1/auth/me`
* **Description**: Retrieve active session profile based on JWT token.
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "userId": 2,
      "email": "farmer1@acm.local",
      "username": "farmer0",
      "roles": ["FARMER"],
      "role": "FARMER",
      "profile": {
        "id": 2,
        "fullName": "Nguyen Van T",
        "phone": "0900000001",
        "provinceId": 24,
        "wardId": 25112
      },
      "redirectTo": "/farmer"
    }
  }
  ```

### 1.3. Sign Up (Registration)
* **Endpoint**: `POST /api/v1/auth/sign-up`
* **Description**: Register a new farmer or buyer account.
* **Request Body**:
  ```json
  {
    "username": "newfarmer",
    "email": "newfarmer@acm.local",
    "password": "strongpassword123",
    "fullName": "Le Van Binh",
    "phone": "0911222333",
    "provinceId": 24,
    "wardId": 25112,
    "role": "FARMER"
  }
  ```
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "id": 15,
      "username": "newfarmer",
      "email": "newfarmer@acm.local",
      "fullName": "Le Van Binh",
      "phone": "0911222333",
      "provinceId": 24,
      "wardId": 25112,
      "role": "FARMER"
    }
  }
  ```

---

## 2. Farmer Dashboard & Preferences

### 2.1. Get & Update User Preferences
* **Endpoint**: `GET /api/v1/preferences/me`
* **Update Endpoint**: `PUT /api/v1/preferences/me`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "theme": "dark",
      "language": "vi",
      "notificationsEnabled": true,
      "dashboardLayout": "grid"
    }
  }
  ```

### 2.2. Get Dashboard Overview Metrics
* **Endpoint**: `GET /api/v1/dashboard/overview`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters**:
  * `seasonId` (optional, integer): Scope dashboard to specific season.
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "seasonContext": {
        "seasonId": 10,
        "seasonName": "Vụ Lúa Xuân 2026",
        "startDate": "2026-03-01",
        "endDate": "2026-06-30",
        "plannedHarvestDate": "2026-06-30"
      },
      "counts": {
        "activeFarms": 1,
        "activePlots": 4,
        "seasonsByStatus": {
          "ACTIVE": 1
        }
      },
      "kpis": {
        "avgYieldTonsPerHa": 6.5,
        "costPerHectare": 15000000,
        "onTimePercent": 95.0
      },
      "expenses": {
        "totalExpense": 12000000.00
      },
      "harvest": {
        "totalQuantityKg": 5200.00,
        "totalRevenue": 45000000.00,
        "expectedYieldKg": 5000.00,
        "yieldVsPlanPercent": 104.0
      },
      "alerts": {
        "openIncidents": 1,
        "expiringLots": 0,
        "lowStockItems": 2
      },
      "taskStatus": {
        "totalTasks": 24,
        "pendingTasks": 2,
        "inProgressTasks": 1,
        "completedTasks": 21,
        "overdueTasks": 0,
        "cancelledTasks": 0
      },
      "inventoryRisk": {
        "atRiskLots": 0,
        "lowStockLots": 2,
        "criticalLowStockLots": 0,
        "expiringSoonLots": 0,
        "expiredLots": 0
      },
      "lotStatus": {
        "totalLotsWithStock": 10,
        "activeLots": 10,
        "expiringSoonLots": 0,
        "expiredLots": 0,
        "unknownExpiryLots": 0
      },
      "sustainabilityAlerts": {
        "totalFields": 4,
        "highRiskFields": 0,
        "mediumRiskFields": 1,
        "lowRiskFields": 3,
        "fieldsMissingInputs": 0
      },
      "unavailableReasons": [],
      "missingInputs": []
    }
  }
  ```

---

## 3. Plot & Farm Management

### 3.1. List Plots
* **Direct Farmer Endpoint**: `GET /api/v1/plots` (returns all plots for current farmer)
* **By Farm Endpoint**: `GET /api/v1/farms/{farmId}/plots` (returns plots for specific farm)
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": [
      {
        "id": 1,
        "name": "Cánh đồng Bắc",
        "areaSquareMeters": 5000.0,
        "soilType": "CLAY",
        "status": "ACTIVE",
        "farmId": 1
      },
      {
        "id": 2,
        "name": "Cánh đồng Nam",
        "areaSquareMeters": 3500.0,
        "soilType": "SANDY",
        "status": "ACTIVE",
        "farmId": 1
      }
    ]
  }
  ```

### 3.2. Create Plot for Farm
* **Endpoint**: `POST /api/v1/farms/{farmId}/plots`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "name": "Mảnh vườn Đông",
    "areaSquareMeters": 1500.0,
    "soilType": "LOAM",
    "status": "ACTIVE"
  }
  ```
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "id": 3,
      "name": "Mảnh vườn Đông",
      "areaSquareMeters": 1500.0,
      "soilType": "LOAM",
      "status": "ACTIVE",
      "farmId": 1
    }
  }
  ```

---

## 4. Season Management

### 4.1. Create a Season
* **Endpoint**: `POST /api/v1/seasons`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "plotId": 1,
    "cropId": 2,
    "varietyId": 3,
    "name": "Vụ Lúa Xuân 2026",
    "startDate": "2026-03-01",
    "expectedHarvestDate": "2026-06-30",
    "targetYieldKg": 5000
  }
  ```
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "id": 10,
      "plotId": 1,
      "cropId": 2,
      "varietyId": 3,
      "name": "Vụ Lúa Xuân 2026",
      "startDate": "2026-03-01",
      "expectedHarvestDate": "2026-06-30",
      "targetYieldKg": 5000,
      "status": "PLANNED"
    }
  }
  ```

### 4.2. Get Season Details
* **Endpoint**: `GET /api/v1/seasons/{id}`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "id": 10,
      "plotId": 1,
      "plotName": "Cánh đồng Bắc",
      "cropName": "Lúa nước",
      "varietyName": "ST25",
      "name": "Vụ Lúa Xuân 2026",
      "startDate": "2026-03-01",
      "expectedHarvestDate": "2026-06-30",
      "actualHarvestDate": null,
      "targetYieldKg": 5000,
      "actualYieldKg": null,
      "status": "ACTIVE"
    }
  }
  ```

### 4.3. Update Season Status (Start/Complete)
* **Start Season**: `POST /api/v1/seasons/{id}/start`
* **Complete Season**: `POST /api/v1/seasons/{id}/complete`
  * **Request Body (For complete)**:
    ```json
    {
      "actualHarvestDate": "2026-06-25",
      "actualYieldKg": 5200,
      "harvestQuality": "EXCELLENT"
    }
    ```

---

## 5. Task Management

### 5.1. List Tasks for Season
* **Endpoint**: `GET /api/v1/seasons/{seasonId}/tasks`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters**:
  * `status` (optional, string): Filter by task status.
  * `from` (optional, date): Start date in `yyyy-MM-dd` format.
  * `to` (optional, date): End date in `yyyy-MM-dd` format.
  * `page` (optional, integer): Page index, default `0`.
  * `size` (optional, integer): Page size, default `20`.
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "content": [
        {
          "id": 45,
          "seasonId": 10,
          "title": "Bón phân đợt 1",
          "description": "Bón phân Ure thúc đẩy sinh trưởng giai đoạn đầu",
          "dueDate": "2026-03-15",
          "completedDate": "2026-03-14",
          "priority": "HIGH",
          "status": "COMPLETED"
        },
        {
          "id": 46,
          "seasonId": 10,
          "title": "Phun ngừa rầy nâu",
          "description": "Sử dụng chế phẩm sinh học",
          "dueDate": "2026-04-10",
          "completedDate": null,
          "priority": "MEDIUM",
          "status": "PENDING"
        }
      ],
      "pageNumber": 0,
      "pageSize": 20,
      "totalElements": 2,
      "totalPages": 1,
      "last": true
    }
  }
  ```

### 5.2. Update Task Status
* **Endpoint**: `PATCH /api/v1/tasks/{id}/status`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "status": "COMPLETED",
    "completedDate": "2026-04-09"
  }
  ```
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "id": 46,
      "status": "COMPLETED",
      "completedDate": "2026-04-09"
    }
  }
  ```

---

## 6. Inventory & Warehouse

### 6.1. Get On-Hand Inventory
* **Endpoint**: `GET /api/v1/inventory/on-hand`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters**:
  * `warehouseId` (required, integer): Filter by Warehouse ID
  * `locationId` (optional, integer): Filter by Stock Location ID
  * `lotId` (optional, integer): Filter by Supply Lot ID
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "content": [
        {
          "lotId": 2,
          "lotCode": "LOT-NPK-001",
          "supplyItemId": 1,
          "supplyItemName": "Phân bón NPK 16-16-8",
          "warehouseId": 1,
          "warehouseName": "Kho Chính Đông Anh",
          "locationId": 5,
          "locationName": "Khu A1",
          "quantity": 350.0,
          "unit": "KG"
        }
      ],
      "pageNumber": 0,
      "pageSize": 20,
      "totalElements": 1,
      "totalPages": 1,
      "last": true
    }
  }
  ```

### 6.2. Stock Movements (History & Recording)
* **Get History Endpoint**: `GET /api/v1/inventory/movements`
  * **Query Parameters**:
    * `warehouseId` (required, integer): Filter by Warehouse ID
    * `type` (optional, string): INBOUND | OUTBOUND | ADJUSTMENT
* **Record Movement Endpoint**: `POST /api/v1/inventory/movements`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body (Record Movement)**:
  ```json
  {
    "warehouseId": 1,
    "locationId": 5,
    "lotId": 2,
    "quantity": 50.0,
    "type": "OUTBOUND",
    "reason": "DISBURSEMENT",
    "seasonId": 10,
    "taskId": 45,
    "notes": "Bón phân đợt 1 Vụ Xuân 2026"
  }
  ```
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "movementId": 289,
      "warehouseId": 1,
      "locationId": 5,
      "lotId": 2,
      "quantity": 50.0,
      "type": "OUTBOUND",
      "timestamp": "2026-03-14T09:30:00Z"
    }
  }
  ```

---

## 7. Incident Management

### 7.1. Report Incident (Pests, Weather, Disease)
* **Endpoint**: `POST /api/v1/incidents`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "plotId": 1,
    "title": "Bệnh Đạo Ôn hại lúa",
    "description": "Phát hiện vết bệnh hình thoi xuất hiện rải rác trên lá lúa cánh đồng Bắc",
    "severity": "MEDIUM"
  }
  ```
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "id": 78,
      "plotId": 1,
      "title": "Bệnh Đạo Ôn hại lúa",
      "severity": "MEDIUM",
      "status": "REPORTED",
      "reportedAt": "2026-03-20T15:45:00Z"
    }
  }
  ```

### 7.2. Resolve Incident
* **Endpoint**: `PATCH /api/v1/incidents/{id}/status`
* **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "status": "RESOLVED",
    "resolutionNotes": "Đã tiến hành xử lý phun xịt thuốc sinh học đặc trị đạo ôn, khống chế hoàn toàn vết bệnh."
  }
  ```
* **Response Body (Success - `200 OK`)**:
  ```json
  {
    "status": 200,
    "code": "SUCCESS",
    "message": "Success",
    "result": {
      "id": 78,
      "status": "RESOLVED",
      "resolvedAt": "2026-03-24T10:00:00Z"
    }
  }
  ```
