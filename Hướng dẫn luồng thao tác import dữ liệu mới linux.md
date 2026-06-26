# Import newimportdb_final.sql (Linux — không Docker)

Flow này dùng cho hướng Entity-first: Hibernate tạo schema từ Entity, sau đó SQL chỉ nạp dữ liệu seed.
Hướng dẫn dành cho Arch Linux với MariaDB cài trực tiếp (không dùng Docker).

## Yêu cầu trước khi bắt đầu

- **MariaDB** đã cài và đang chạy (`sudo systemctl start mariadb`)
- **Java 23+** đã cài
- Đã cấu hình file `agricultural-crop-management-backend/.env` với thông tin kết nối MariaDB:
  ```
  DB_URL=jdbc:mariadb://localhost:3306/quanlymuavu
  DB_USER=root
  DB_PASS=<mật_khẩu_mariadb_của_bạn>
  ```

> **Lưu ý:** Project sử dụng MariaDB JDBC driver (`mariadb-java-client`), URL phải bắt đầu bằng `jdbc:mariadb://` (không phải `jdbc:mysql://`).

---

## 1. Reset database rỗng

Chạy từ root repo:

```bash
mariadb -u root -p < ./reset-database.sql
```

---

## 2. Chạy backend profile dev-reset

```bash
cd agricultural-crop-management-backend

./mvnw spring-boot:run \
  "-Dspring-boot.run.profiles=dev-reset" \
  "-Dspring-boot.run.arguments=--dev.bootstrap-admin.enabled=true --spring.flyway.enabled=false --spring.jpa.hibernate.ddl-auto=create --spring.sql.init.mode=never"
```

Chờ cho đến khi thấy dòng log:
```
Started QuanLyMuaVuApplication in ... seconds
```

Dừng backend (`Ctrl+C`) sau khi schema và tài khoản mặc định đã được tạo.

---

## 3. Import dữ liệu seed

```bash
mariadb -u root -p quanlymuavu < ./newimportdb_final.sql
```

---

## 4. Chạy backend profile dev

```bash
cd agricultural-crop-management-backend

./mvnw spring-boot:run \
  "-Dspring-boot.run.profiles=dev" \
  "-Dspring-boot.run.arguments=--spring.flyway.enabled=false --spring.jpa.hibernate.ddl-auto=validate --spring.sql.init.mode=never"
```

---

## Troubleshooting

### Schema validation lỗi

Nếu backend báo lỗi dạng:
```
Schema-validation: missing column [status_changed_at] in table [marketplace_products]
```

Nghĩa là database hiện tại chưa được cập nhật schema theo Entity mới. Với flow `newimportdb_final.sql`, file này chỉ seed dữ liệu và không tạo/sửa cấu trúc bảng. Cách sửa chuẩn:

- **Với môi trường dev import lại từ đầu:** chạy lại bước reset database, chạy profile `dev-reset` để Hibernate tạo schema mới, sau đó import lại `newimportdb_final.sql`.
- **Với database muốn giữ dữ liệu:** chạy migration tương ứng trong `agricultural-crop-management-backend/src/main/resources/db/migration`, rồi chạy lại backend ở `ddl-auto=validate`.
- **Không** tắt `ddl-auto=validate` để bỏ qua lỗi schema; lỗi này cho biết Entity và database đang lệch contract.

### Lỗi "Unknown column 'RESERVED'" hoặc "Unable to determine Dialect"

Lỗi này xảy ra khi dùng **MySQL JDBC driver** (`mysql-connector-j`) để kết nối **MariaDB 11+**. MariaDB đã diverge metadata schema so với MySQL.

**Cách sửa:** Project đã chuyển sang dùng `mariadb-java-client` trong `pom.xml` và URL `jdbc:mariadb://` trong config. Nếu gặp lỗi này, kiểm tra:
1. `pom.xml` phải có dependency `org.mariadb.jdbc:mariadb-java-client` (không phải `com.mysql:mysql-connector-j`)
2. `application.properties` phải có `spring.datasource.driver-class-name=org.mariadb.jdbc.Driver`
3. `DB_URL` trong `.env` phải bắt đầu bằng `jdbc:mariadb://`

---

## Seed login accounts

Các tài khoản đăng nhập chính do `ApplicationInitConfig` tạo:

| Email | Password |
|---|---|
| admin@acm.local | admin123 |
| farmer@acm.local | 12345678 |
| employee@acm.local | 12345678 |
| buyer@acm.local | 12345678 |

Các actor phụ do seed tạo thêm dùng password `Password@123`:

- farmer.binhminh@example.com
- employee.lanthao@example.com
- buyer.thucphamantoan@example.com

---

## Manual checks

- Đăng nhập từng role chính: Admin, Farmer, Employee, Buyer.
- Farmer kiểm tra farm, plot, season, task, field log, expense, incident, harvest.
- Farmer kiểm tra kho vật tư và kho thành phẩm.
- Buyer xem marketplace, giỏ hàng, đơn hàng, đánh giá và truy xuất nguồn gốc.
- Employee xem task được giao, progress log và payroll.
- Admin xem user, report, marketplace payment verification, notification và audit log.
- Tạo mới Farm/Plot/Season qua app để xác nhận auto-increment vẫn hoạt động bình thường.