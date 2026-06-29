# 🌾 Hướng dẫn Khởi chạy Hệ thống ACM (Agricultural Crop Management)

Tài liệu này hướng dẫn chi tiết các bước để chuẩn bị môi trường, khởi chạy hạ tầng Backend (Microservices) và ứng dụng Frontend (React + Vite) của hệ thống ACM.

---

## 📋 Yêu cầu hệ thống tối thiểu

* **Docker & Docker Compose**: Để chạy cơ sở dữ liệu và các microservices backend.
* **Node.js & npm (v18+)**: Để khởi chạy ứng dụng Frontend React ở chế độ nhà phát triển (Local Dev).
* **Git**: Dùng để đồng bộ mã nguồn.

---

## 🚀 Các bước khởi chạy chi tiết

### 1️⃣ Bước 1: Chuẩn bị tệp cấu hình và môi trường

1. **Chuẩn bị tệp môi trường cho Backend (`.env`)**:
   Sao chép tệp cấu hình mẫu thành `.env` tại thư mục gốc của dự án:
   * **Windows (Command Prompt)**:
     ```cmd
     copy .env.example .env
     ```
   * **Windows (PowerShell)**:
     ```powershell
     Copy-Item .env.example .env
     ```
   * **Linux/macOS**:
     ```bash
     cp .env.example .env
     ```

2. **Cập nhật Gemini API Key cho trợ lý ảo**:
   Mở tệp `.env` vừa tạo và điền khóa API Google Gemini của bạn để sử dụng các tính năng tư vấn nông nghiệp bằng AI:
   ```properties
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Cấu hình môi trường cho Frontend**:
   Tệp `.env.development` đã được tạo sẵn tại thư mục `agricultural-crop-management-frontend/.env.development` chứa thông tin cấu hình Firebase Chat và Google Maps. Bạn không cần chỉnh sửa thêm trừ khi muốn đổi tài khoản Firebase/Google Maps khác.

4. **Xác thực Asymmetric JWT (RS256)**:
   Hệ thống sử dụng cơ chế chữ ký khóa bất đối xứng RSA (RS256). Các khóa bảo mật đã được đặt sẵn trong thư mục `identity-service/src/main/resources/keys/` và tự động load khi khởi động. Không cần cấu hình `JWT_SIGNER_KEY` cũ nữa.

---

### 2️⃣ Bước 2: Khởi chạy Hạ tầng và các Microservices Backend

Chúng ta sẽ khởi chạy cơ sở dữ liệu (MySQL), message bus (RabbitMQ), bộ lưu trữ ảnh (MinIO), và toàn bộ các microservices bằng Docker Compose:

1. **Chạy lệnh khởi động hệ thống**:
   Mở terminal tại thư mục gốc của dự án và chạy:
   ```bash
   docker-compose up -d --build
   ```
   *Mẹo: Tham số `--build` đảm bảo Docker build lại các service backend với code và cấu hình mới nhất.*

2. **Kiểm tra trạng thái các container**:
   Đợi khoảng 60–90 giây cho các cơ sở dữ liệu tự động tạo bảng (qua Flyway migrations), sau đó kiểm tra trạng thái bằng lệnh:
   ```bash
   docker-compose ps
   ```
   *Hãy chắc chắn tất cả các container hiển thị trạng thái `Up` (hoặc `healthy`).*

---

### 3️⃣ Bước 3: Khởi chạy ứng dụng Frontend (React + Vite)

Khởi chạy frontend cục bộ trên máy để kết nối trực tiếp đến API Gateway thông qua cấu hình phát triển:

1. Mở terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd agricultural-crop-management-frontend
   ```

2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```

3. Khởi chạy dev server:
   ```bash
   npm run dev
   ```
   *Sau khi lệnh chạy hoàn tất, ứng dụng frontend sẽ hoạt động tại địa chỉ: **`http://localhost:5173`**.*

---

### 4️⃣ Bước 4: Import dữ liệu mẫu (Seed Data)

Khi khởi chạy lần đầu tiên, các database của microservice hoàn toàn trống. Bạn cần import dữ liệu mẫu (thông tin plot, giống cây trồng, sản phẩm marketplace,...) để trải nghiệm ứng dụng đầy đủ:

* **Trên Windows**: Tham khảo hướng dẫn và chạy script tại: [Hướng dẫn luồng thao tác import dữ liệu mới window.md](Hướng%20dẫn%20luồng%20thao%20tác%20import%20dữ%20liệu%20mới%20window.md)
* **Trên Linux/macOS**: Tham khảo hướng dẫn và chạy script tại: [Hướng dẫn luồng thao tác import dữ liệu mới linux.md](Hướng%20dẫn%20luồng%20thao%20tác%20import%20dữ%20liệu%20mới%20linux.md)

---

## 🔑 Tài khoản mẫu đăng nhập (Sau khi đã import dữ liệu)

Sau khi chạy thành công bước import dữ liệu mẫu, bạn có thể đăng nhập vào ứng dụng tại `http://localhost:5173` bằng các tài khoản sau:

| Quyền hạn (Role) | Email đăng nhập | Mật khẩu |
| :--- | :--- | :--- |
| 🛡️ **Admin** (Quản trị hệ thống) | `admin@acm.local` | `admin123` |
| 👨‍🌾 **Farmer** (Chủ nông trại) | `farmer@acm.local` | `12345678` |
| 👷 **Employee** (Nhân viên nông trại) | `employee@acm.local` | `12345678` |
| 🛒 **Buyer** (Người mua nông sản) | `buyer@acm.local` | `12345678` |

---

## 🌐 Các cổng dịch vụ và bảng điều khiển (Console URLs)

| Dịch vụ / Cổng | URL truy cập | Tài khoản / Mô tả |
| :--- | :--- | :--- |
| **Giao diện người dùng (React)** | [http://localhost:5173](http://localhost:5173) | Frontend (Dev Mode) |
| **API Gateway (Spring Cloud)** | [http://localhost:8000](http://localhost:8000) | Điều hướng API tập trung |
| **RabbitMQ Console** | [http://localhost:15672](http://localhost:15672) | `rabbituser` / `rabbitpass` |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) | `minioadmin` / `minioadmin` |
| **MailHog Webmail** | [http://localhost:8025](http://localhost:8025) | Hộp thư kiểm thử (Gửi OTP, kích hoạt) |
| **Grafana Dashboard** | [http://localhost:3001](http://localhost:3001) | Giám sát tài nguyên hệ thống |
| **Prometheus Metrics** | [http://localhost:9090](http://localhost:9090) | Bộ thu thập chỉ số hiệu năng |

---

## 🛠️ Một số lệnh hỗ trợ khi gặp lỗi (Troubleshooting)

1. **Xem log của một service cụ thể**:
   Nếu một microservice không chạy hoặc gặp lỗi khởi động, bạn có thể kiểm tra log của service đó bằng lệnh:
   ```bash
   docker-compose logs -f [tên_service]
   # Ví dụ: docker-compose logs -f identity-service
   ```

2. **Dừng toàn bộ hệ thống**:
   ```bash
   docker-compose down
   ```

3. **Reset hoàn toàn dữ liệu database để import lại**:
   ```bash
   docker-compose down -v
   # Lệnh này sẽ xóa các volume dữ liệu cũ để bạn rebuild/khởi tạo lại sạch sẽ.
   ```
