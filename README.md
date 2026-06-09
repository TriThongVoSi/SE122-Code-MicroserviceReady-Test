<div align="center">

# 🌾 Nền tảng Quản lý Mùa vụ cùng Trợ lý ảo

### Agricultural Crop Management (ACM) Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-6DB33F?logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Java](https://img.shields.io/badge/Java-23-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Academic-blue.svg)](#license)

**Nền tảng quản lý nông nghiệp toàn diện tích hợp trí tuệ nhân tạo (Google Gemini),
hỗ trợ nông dân tối ưu hóa quy trình canh tác từ gieo trồng đến thu hoạch và thương mại hóa sản phẩm.**

[Tính năng](#-tính-năng-chính) · [Kiến trúc](#-kiến-trúc-hệ-thống) · [Cài đặt](#-cài-đặt-và-chạy) · [API Docs](#-api-documentation) · [Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt và chạy](#-cài-đặt-và-chạy)
- [Tài khoản mẫu](#-tài-khoản-mẫu)
- [API Documentation](#-api-documentation)
- [Đa ngôn ngữ](#-đa-ngôn-ngữ-i18n)
- [Triển khai](#-triển-khai)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

---

## 🌱 Giới thiệu

**ACM Platform** là một nền tảng quản lý nông nghiệp thông minh, được xây dựng nhằm số hóa toàn bộ quy trình quản lý mùa vụ cho nông dân Việt Nam. Hệ thống tích hợp **trợ lý ảo AI** (Google Gemini) giúp tư vấn kỹ thuật canh tác, chẩn đoán bệnh cây trồng, tối ưu hóa chi phí mùa vụ, cùng với một **sàn thương mại nông sản** (Marketplace) để kết nối trực tiếp người nông dân với người mua.

### 🎯 Mục tiêu

- **Số hóa** quy trình quản lý nông trại, mùa vụ, công việc, thu hoạch
- **Tối ưu hóa** chi phí sản xuất thông qua phân tích AI
- **Minh bạch hóa** nguồn gốc nông sản với hệ thống truy xuất nguồn gốc
- **Kết nối** nông dân và người mua qua sàn thương mại trực tuyến
- **Hỗ trợ** ra quyết định với trợ lý ảo AI và báo cáo phân tích dữ liệu

---

## ✨ Tính năng chính

### 🤖 Trợ lý ảo AI (Google Gemini)

| Tính năng | Mô tả |
|---|---|
| 💬 Chat AI thông minh | Tư vấn kỹ thuật canh tác, trả lời câu hỏi nông nghiệp theo ngữ cảnh |
| 🔬 Chẩn đoán bệnh cây trồng | Nhận diện bệnh qua mô tả/hình ảnh và đề xuất phương pháp xử lý |
| 💰 Tối ưu chi phí mùa vụ | Phân tích và gợi ý cắt giảm chi phí sản xuất dựa trên dữ liệu thực tế |
| 📊 Phân tích dữ liệu | Dashboard thông minh với biểu đồ phân tích dinh dưỡng, đất, nước |

### 👨‍🌾 Quản lý Nông trại (Farmer)

| Tính năng | Mô tả |
|---|---|
| 🏡 Quản lý Farm & Plot | Tạo và quản lý nông trại, thửa đất với thông tin chi tiết |
| 📅 Quản lý Mùa vụ | Lên kế hoạch mùa vụ, theo dõi tiến độ từ gieo trồng đến thu hoạch |
| ✅ Quản lý Công việc | Phân công, theo dõi nhiệm vụ cho nhân viên với deadline và trạng thái |
| 📝 Nhật ký đồng ruộng | Ghi chép hoạt động canh tác hàng ngày (Field Logs) |
| 🌾 Quản lý Thu hoạch | Theo dõi sản lượng, chất lượng thu hoạch theo lô (Product Lots) |
| 📦 Kho vật tư & thành phẩm | Quản lý kho nguyên liệu đầu vào và sản phẩm sau thu hoạch |
| 💸 Quản lý Chi phí | Theo dõi chi phí sản xuất, phân tích lợi nhuận theo mùa vụ |
| ⚠️ Quản lý Sự cố | Ghi nhận và xử lý sự cố phát sinh trong quá trình canh tác |
| 🦠 Theo dõi Dịch bệnh | Giám sát tình hình dịch bệnh cây trồng trên từng thửa đất |
| 👷 Quản lý Nhân công | Quản lý nhân viên, phân công lao động và tính lương |
| 🌤️ Widget Thời tiết | Hiển thị dự báo thời tiết liên quan đến hoạt động nông nghiệp |
| 🔬 Phân tích bền vững | Kiểm tra đất, nước tưới, dinh dưỡng đầu vào cho nông nghiệp bền vững |

### 🛒 Sàn Thương mại (Marketplace)

| Tính năng | Mô tả |
|---|---|
| 🏪 Catalog sản phẩm | Duyệt, tìm kiếm, lọc sản phẩm nông sản theo danh mục, vùng, giá |
| 🔍 Truy xuất nguồn gốc | Xem toàn bộ hành trình sản phẩm từ nông trại đến tay người mua |
| 🛒 Giỏ hàng & Thanh toán | Thêm sản phẩm, checkout với COD hoặc chuyển khoản ngân hàng |
| 📋 Quản lý Đơn hàng | Theo dõi trạng thái đơn hàng cho cả người mua và người bán |
| ⭐ Đánh giá sản phẩm | Người mua đánh giá và nhận xét sản phẩm sau khi nhận hàng |
| 🏬 Cửa hàng nông trại | Mỗi nông trại có trang riêng hiển thị sản phẩm đang bán |
| 📸 Xác minh thanh toán | Upload bằng chứng chuyển khoản, admin xác minh thanh toán |

### 🛡️ Quản trị hệ thống (Admin)

| Tính năng | Mô tả |
|---|---|
| 👥 Quản lý Người dùng | Quản lý tài khoản, phân quyền (Admin, Farmer, Employee, Buyer) |
| 🌿 Quản lý Danh mục Cây trồng | Quản lý giống cây, loại cây và thông tin kỹ thuật |
| 📊 Báo cáo & Thống kê | Dashboard tổng hợp, báo cáo hoạt động toàn hệ thống |
| 📋 Audit Logs | Theo dõi nhật ký hoạt động người dùng |
| 🔔 Cảnh báo hệ thống | Quản lý thông báo và cảnh báo |
| 📄 Quản lý Tài liệu | Quản lý tài liệu kỹ thuật, hướng dẫn |
| 🛒 Quản lý Marketplace | Duyệt sản phẩm, xác minh thanh toán, quản lý đơn hàng |

### 👷 Nhân viên (Employee)

| Tính năng | Mô tả |
|---|---|
| 📋 Xem công việc được giao | Danh sách task từ nông dân với chi tiết và deadline |
| 📈 Cập nhật tiến độ | Báo cáo tiến độ công việc (Progress Logs) |
| 💰 Xem bảng lương | Theo dõi thông tin lương và phụ cấp |

### 💬 Chat & Giao tiếp

| Tính năng | Mô tả |
|---|---|
| 🔥 Real-time Chat | Chat thời gian thực qua Firebase Firestore |
| 💬 Floating Chat | Nút chat nổi toàn ứng dụng, truy cập nhanh từ mọi trang |

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │          React 18 + Vite + TailwindCSS 4            │ │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐  │ │
│  │  │  Farmer  │  Buyer   │  Admin   │   Employee   │  │ │
│  │  │  Portal  │  Portal  │  Portal  │    Portal    │  │ │
│  │  └──────────┴──────────┴──────────┴──────────────┘  │ │
│  │  ┌──────────┬──────────┬──────────────────────────┐  │ │
│  │  │ AI Chat  │ Market   │  Real-time Chat (Firebase)│  │ │
│  │  └──────────┴──────────┴──────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API + Vite Proxy
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Spring Boot 3.5)               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Security (JWT + OAuth2)                 │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  ┌────────┬──────────┬───────────┬───────────────┐  │ │
│  │  │  Farm   │ Season   │ Inventory │  Financial    │  │ │
│  │  │ Module  │ Module   │  Module   │   Module      │  │ │
│  │  ├────────┼──────────┼───────────┼───────────────┤  │ │
│  │  │Market  │   AI     │  Identity │ Sustainability│  │ │
│  │  │ place  │ (Gemini) │  Module   │    Module     │  │ │
│  │  └────────┴──────────┴───────────┴───────────────┘  │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │         JPA / Hibernate + MapStruct                  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────┬────────────────────────┬─────────────────────┘
           │                        │
           ▼                        ▼
    ┌──────────────┐     ┌────────────────────┐
    │   MySQL 8.0  │     │  Firebase / Gemini │
    │  (Database)  │     │  (Chat + AI + Auth)│
    └──────────────┘     └────────────────────┘
```

---

## 🛠 Công nghệ sử dụng

### Backend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **Java** | 23 | Ngôn ngữ lập trình chính |
| **Spring Boot** | 3.5.3 | Framework backend |
| **Spring Security** | — | Xác thực & phân quyền (JWT + OAuth2) |
| **Spring Data JPA** | — | ORM, truy xuất cơ sở dữ liệu |
| **Spring WebFlux** | — | Reactive programming cho AI streaming |
| **MySQL** | 8.0 | Cơ sở dữ liệu quan hệ |
| **Google Gemini SDK** | 1.0.0 | Tích hợp AI (trợ lý ảo, chẩn đoán bệnh) |
| **Firebase Admin** | 9.7.0 | Quản lý xác thực, chat token bridge |
| **Lombok** | 1.18.30 | Giảm boilerplate code |
| **MapStruct** | 1.5.5 | Object mapping giữa Entity ↔ DTO |
| **Nimbus JOSE JWT** | 9.37.3 | Xử lý JWT token |
| **SpringDoc OpenAPI** | 2.7.0 | Swagger UI / API documentation |
| **MailHog** | latest | Email testing (dev environment) |
| **Docker** | — | Container hóa ứng dụng |

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **React** | 18.3 | UI library |
| **TypeScript** | 5.6+ | Type-safe JavaScript |
| **Vite** | 6.3.5 | Build tool & dev server |
| **TailwindCSS** | 4.3 | Utility-first CSS framework |
| **Radix UI** | — | Headless UI components (Accessible) |
| **TanStack React Query** | 5.x | Server state management, caching |
| **React Router DOM** | 6.26 | Client-side routing |
| **React Hook Form** | 7.55 | Form management + validation |
| **Zod** | 3.23 | Schema validation |
| **Recharts** | 2.15 | Biểu đồ, đồ thị dashboard |
| **Firebase SDK** | 11.10 | Real-time chat (Firestore) |
| **i18next** | 25.8 | Đa ngôn ngữ (Việt / English) |
| **Axios** | 1.13 | HTTP client |
| **Lucide React** | 0.487 | Icon library |
| **Sonner** | 2.0 | Toast notifications |
| **react-markdown** | 10.1 | Render markdown (AI responses) |

---

## 📁 Cấu trúc thư mục

```
SE122-Code-MicroserviceReady/
├── 📂 agricultural-crop-management-backend/     # Backend (Spring Boot)
│   ├── 📂 src/main/java/org/example/QuanLyMuaVu/
│   │   ├── 📂 Config/                # Cấu hình Security, CORS, App
│   │   ├── 📂 Controller/            # Health check controller
│   │   ├── 📂 DTO/                   # Data Transfer Objects chung
│   │   ├── 📂 Enums/                 # Enum types
│   │   ├── 📂 Exception/             # Global exception handling
│   │   ├── 📂 Service/               # Business logic chung
│   │   ├── 📂 Util/                  # Utility classes
│   │   ├── 📂 firebase/              # Firebase integration
│   │   └── 📂 module/                # Feature modules
│   │       ├── 📂 admin/             #   Quản trị hệ thống
│   │       ├── 📂 ai/                #   Trợ lý ảo (Gemini AI)
│   │       ├── 📂 cropcatalog/       #   Danh mục cây trồng
│   │       ├── 📂 farm/              #   Quản lý nông trại
│   │       ├── 📂 financial/         #   Quản lý tài chính
│   │       ├── 📂 identity/          #   Xác thực & người dùng
│   │       ├── 📂 incident/          #   Quản lý sự cố
│   │       ├── 📂 inventory/         #   Quản lý kho
│   │       ├── 📂 marketplace/       #   Sàn thương mại
│   │       ├── 📂 season/            #   Quản lý mùa vụ
│   │       ├── 📂 shared/            #   Module dùng chung
│   │       └── 📂 sustainability/    #   Phân tích bền vững
│   ├── 📄 Dockerfile                 # Docker image cho backend
│   ├── 📄 docker-compose.yml         # MySQL + MailHog services
│   ├── 📄 pom.xml                    # Maven dependencies
│   └── 📄 .env.example               # Biến môi trường mẫu
│
├── 📂 agricultural-crop-management-frontend/    # Frontend (React + Vite)
│   ├── 📂 src/
│   │   ├── 📂 app/                   # App routing configuration
│   │   ├── 📂 api/                   # API client setup
│   │   ├── 📂 components/            # Shared UI components
│   │   ├── 📂 entities/              # Domain entities (FSD layer)
│   │   ├── 📂 features/              # Feature modules
│   │   │   ├── 📂 admin/             #   Admin portal features
│   │   │   ├── 📂 ai/                #   AI assistant integration
│   │   │   ├── 📂 auth/              #   Authentication
│   │   │   ├── 📂 buyer/             #   Buyer features
│   │   │   ├── 📂 chat/              #   Real-time chat
│   │   │   ├── 📂 employee/          #   Employee features
│   │   │   ├── 📂 farmer/            #   Farmer portal features
│   │   │   ├── 📂 marketplace/       #   Marketplace features
│   │   │   └── 📂 shared/            #   Shared feature utilities
│   │   ├── 📂 hooks/                 # Custom React hooks
│   │   ├── 📂 i18n/                  # Đa ngôn ngữ config
│   │   ├── 📂 pages/                 # Page-level components
│   │   ├── 📂 providers/             # Context providers
│   │   ├── 📂 services/              # API service layer
│   │   ├── 📂 shared/                # Shared components & utilities
│   │   ├── 📂 types/                 # TypeScript type definitions
│   │   └── 📂 widgets/               # Widget components
│   ├── 📄 Dockerfile                 # Multi-stage Docker build
│   ├── 📄 vite.config.ts             # Vite configuration
│   ├── 📄 tailwind.config.ts         # Tailwind CSS config
│   ├── 📄 vercel.json                # Vercel deployment config
│   └── 📄 package.json               # NPM dependencies
│
├── 📂 docs/                          # Tài liệu dự án
│   ├── 📄 API_CONTRACT_MARKETPLACE.md # API contract cho Marketplace
│   ├── 📂 firebase/                   # Firebase rules
│   └── 📄 i18n.md                     # Hướng dẫn đa ngôn ngữ
│
├── 📂 scripts/                       # Scripts hỗ trợ
│   └── 📂 sql/                       # SQL scripts (check, migrate)
│
├── 📄 firebase.json                  # Firebase project config
├── 📄 init-mysql.sql                 # Database initialization
├── 📄 newimportdb_final.sql          # Seed data đầy đủ
└── 📄 reset-database.sql             # Reset database script
```

---

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu |
|---|---|
| **Java JDK** | 23+ |
| **Node.js** | 20+ |
| **MySQL** | 8.0 |
| **Docker** (tùy chọn) | 20+ |
| **Git** | 2.30+ |

### 1️⃣ Clone repository

```bash
git clone https://github.com/TriThongVoSi/SE122-Code-MicroserviceReady-Test.git
cd SE122-Code-MicroserviceReady
```

### 2️⃣ Thiết lập Database

**Cách A: Sử dụng Docker (Khuyến nghị)**

```bash
cd agricultural-crop-management-backend
docker-compose up -d
```

Lệnh trên sẽ khởi chạy:
- **MySQL 8.0** trên port `3306`
- **MailHog** trên port `1025` (SMTP) và `8025` (Web UI)

**Cách B: MySQL thủ công**

```sql
CREATE DATABASE IF NOT EXISTS quanlymuavu
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 3️⃣ Khởi tạo Schema & Seed Data

```powershell
# Bước 1: Reset database (từ root repo)
mysql -h localhost -P 3306 -u root -p --protocol=TCP < .\reset-database.sql

# Bước 2: Chạy backend với profile dev-reset để tạo schema
cd agricultural-crop-management-backend
.\mvnw.cmd spring-boot:run `
  "-Dspring-boot.run.profiles=dev-reset" `
  "-Dspring-boot.run.arguments=--dev.bootstrap-admin.enabled=true --spring.flyway.enabled=false --spring.jpa.hibernate.ddl-auto=create --spring.sql.init.mode=never"
# Dừng backend sau khi schema đã được tạo xong (Ctrl+C)

# Bước 3: Import seed data (từ root repo)
cd ..
mysql -h localhost -P 3306 -u root -p --protocol=TCP quanlymuavu < .\newimportdb_final.sql
```

### 4️⃣ Cấu hình biến môi trường

**Backend** — tạo file `.env` từ template:

```bash
cd agricultural-crop-management-backend
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin thực:

```properties
# Core backend
SERVER_PORT=8080
DB_URL=jdbc:mysql://localhost:3306/quanlymuavu
DB_USER=root
DB_PASS=your_password
JWT_SIGNER_KEY=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id

# Firebase (optional - cho Chat feature)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/service-account.json
```

**Frontend** — file `.env.development` đã được cấu hình sẵn cho local development.

### 5️⃣ Chạy Backend

```powershell
cd agricultural-crop-management-backend
.\mvnw.cmd spring-boot:run `
  "-Dspring-boot.run.profiles=dev" `
  "-Dspring-boot.run.arguments=--spring.flyway.enabled=false --spring.jpa.hibernate.ddl-auto=validate --spring.sql.init.mode=never"
```

Backend sẽ chạy tại: **http://localhost:8080**

### 6️⃣ Chạy Frontend

```bash
cd agricultural-crop-management-frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000** (tự động mở browser)

> **Lưu ý**: Vite dev server đã được cấu hình proxy `/api` requests đến backend tại `http://localhost:8080`.

---

## 👤 Tài khoản mẫu

Sau khi import seed data, các tài khoản sau sẵn sàng sử dụng:

### Tài khoản chính

| Role | Email | Mật khẩu |
|---|---|---|
| 🛡️ **Admin** | `admin@acm.local` | `admin123` |
| 👨‍🌾 **Farmer** | `farmer@acm.local` | `12345678` |
| 👷 **Employee** | `employee@acm.local` | `12345678` |
| 🛒 **Buyer** | `buyer@acm.local` | `12345678` |

### Tài khoản phụ (seed data)

| Role | Email | Mật khẩu |
|---|---|---|
| 👨‍🌾 Farmer | `farmer.binhminh@example.com` | `Password@123` |
| 👷 Employee | `employee.lanthao@example.com` | `Password@123` |
| 🛒 Buyer | `buyer.thucphamantoan@example.com` | `Password@123` |

---

## 📡 API Documentation

### Swagger UI

Khi backend đang chạy, truy cập Swagger UI tại:

```
http://localhost:8080/swagger-ui/index.html
```

### API Endpoint tổng quan

| Prefix | Mô tả | Auth |
|---|---|---|
| `GET /api/v1/marketplace/products/**` | Catalog sản phẩm công khai | Public |
| `GET /api/v1/marketplace/farms/**` | Thông tin nông trại công khai | Public |
| `GET /api/v1/marketplace/traceability/**` | Truy xuất nguồn gốc | Public |
| `/api/v1/marketplace/cart/**` | Giỏ hàng | BUYER |
| `/api/v1/marketplace/orders/**` | Đơn hàng (Buyer) | BUYER |
| `/api/v1/buyer/**` | API riêng cho Buyer | BUYER |
| `/api/v1/farmer/**` | API riêng cho Farmer | FARMER |
| `/api/v1/marketplace/farmer/**` | Marketplace - Seller | FARMER |
| `/api/v1/admin/**` | API quản trị | ADMIN |
| `/api/v1/marketplace/admin/**` | Marketplace Admin | ADMIN |

> 📖 Chi tiết API contract cho Marketplace xem tại [`docs/API_CONTRACT_MARKETPLACE.md`](docs/API_CONTRACT_MARKETPLACE.md)

---

## 🌐 Đa ngôn ngữ (i18n)

Ứng dụng hỗ trợ đa ngôn ngữ thông qua **i18next**:

- 🇻🇳 **Tiếng Việt** (mặc định)
- 🇬🇧 **English**

Người dùng có thể chuyển đổi ngôn ngữ trực tiếp trên giao diện. Hệ thống tự động phát hiện ngôn ngữ trình duyệt.

> 📖 Hướng dẫn thêm ngôn ngữ mới xem tại [`docs/i18n.md`](docs/i18n.md)

---

## 🚢 Triển khai

### Frontend — Vercel

Frontend được cấu hình sẵn cho Vercel deployment:

```bash
# Build production
cd agricultural-crop-management-frontend
npm run build    # Output → build/
```

File [`vercel.json`](agricultural-crop-management-frontend/vercel.json) đã cấu hình SPA routing, caching headers cho assets tĩnh.

### Backend — Docker

```bash
cd agricultural-crop-management-backend

# Build JAR
./mvnw clean package -DskipTests

# Build Docker image
docker build -t acm-backend .

# Run container
docker run -p 8080:8080 --env-file .env acm-backend
```

### Full Stack — Docker Compose

```bash
# Chạy MySQL + MailHog
cd agricultural-crop-management-backend
docker-compose up -d
```

---

## 🧪 Testing

### Backend Tests

```bash
cd agricultural-crop-management-backend
./mvnw test
```

### Frontend Tests

```bash
cd agricultural-crop-management-frontend

# Unit tests
npm run test

# Tests with UI
npm run test:ui

# FSD contract tests
npm run test:fdn

# Linting
npm run lint

# Type checking
npm run typecheck
```

---

## 🤝 Đóng góp

1. **Fork** repository
2. Tạo **feature branch**: `git checkout -b feature/ten-tinh-nang`
3. **Commit** thay đổi: `git commit -m "feat: mô tả tính năng"`
4. **Push** lên branch: `git push origin feature/ten-tinh-nang`
5. Tạo **Pull Request**

### Quy tắc commit message

```
feat:     Tính năng mới
fix:      Sửa lỗi
docs:     Thay đổi tài liệu
style:    Format code (không thay đổi logic)
refactor: Tái cấu trúc code
test:     Thêm/sửa test
chore:    Cập nhật build, config
```

---

## 📄 License

Dự án này được phát triển phục vụ mục đích học tập trong khuôn khổ môn học **SE122 — Đồ án 2** tại trường Đại học Công nghệ Thông tin (UIT).

---

<div align="center">

**Được xây dựng với ❤️ bởi Võ Sĩ Trí Thông & Hồ Ngọc Quỳnh**

🌾 *Nền tảng Quản lý Mùa vụ cùng Trợ lý ảo — Số hóa nông nghiệp Việt Nam* 🌾

</div>
