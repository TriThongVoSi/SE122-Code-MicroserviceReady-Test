Import newimportdb_final.sql
Flow này dùng cho hướng Entity-first: Hibernate tạo schema từ Entity, sau đó SQL chỉ nạp dữ liệu seed.

1. Reset database rỗng
Chạy từ root repo:

mariadb -h 127.0.0.1 -P 3306 -u root -p < ./reset-database.sql

2. Chạy backend profile dev-reset
cd agricultural-crop-management-backend

./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev-reset" "-Dspring-boot.run.arguments=--dev.bootstrap-admin.enabled=true --spring.flyway.enabled=false --spring.jpa.hibernate.ddl-auto=create --spring.sql.init.mode=never"
Dừng backend sau khi schema và tài khoản mặc định đã được tạo.

3. Import dữ liệu seed

mariadb -h 127.0.0.1 -P 3306 -u root -p quanlymuavu < ./newimportdb_final.sql

4. Chạy smoke check (Không chạy cũng được)
Từ root repo:

 -h 127.0.0.1 -P 3306 -u root -p quanlymuavu < ./scripts/sql/check-newimportdb-final.sql
5. Chạy backend profile dev
cd agricultural-crop-management-backend

./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev" "-Dspring-boot.run.arguments=--spring.flyway.enabled=false --spring.jpa.hibernate.ddl-auto=validate --spring.sql.init.mode=never"

Troubleshooting schema validation
Nếu backend báo lỗi dạng:

Schema-validation: missing column [status_changed_at] in table [marketplace_products]
nghĩa là database hiện tại chưa được cập nhật schema theo Entity mới. Với flow newimportdb_final.sql, file này chỉ seed dữ liệu và không tạo/sửa cấu trúc bảng. Cách sửa chuẩn:

Với môi trường dev import lại từ đầu: chạy lại bước reset database, chạy profile dev-reset để Hibernate tạo schema mới, sau đó import lại newimportdb_final.sql.
Với database muốn giữ dữ liệu: chạy migration tương ứng trong agricultural-crop-management-backend/src/main/resources/db/migration, ví dụ V35__marketplace_product_moderation_metadata.sql, rồi chạy lại backend ở ddl-auto=validate.
Không tắt ddl-auto=validate để bỏ qua lỗi schema; lỗi này cho biết Entity và database đang lệch contract.
Seed login accounts
Các tài khoản đăng nhập chính do ApplicationInitConfig tạo:

admin@acm.local / admin123
farmer@acm.local / 12345678
employee@acm.local / 12345678
buyer@acm.local / 12345678
Các actor phụ do seed tạo thêm dùng password Password@123:

farmer.binhminh@example.com
employee.lanthao@example.com
buyer.thucphamantoan@example.com
Manual checks
Đăng nhập từng role chính: Admin, Farmer, Employee, Buyer.
Farmer kiểm tra farm, plot, season, task, field log, expense, incident, harvest.
Farmer kiểm tra kho vật tư và kho thành phẩm.
Buyer xem marketplace, giỏ hàng, đơn hàng, đánh giá và truy xuất nguồn gốc.
Employee xem task được giao, progress log và payroll.
Admin xem user, report, marketplace payment verification, notification và audit log.
Tạo mới Farm/Plot/Season qua app để xác nhận auto-increment vẫn hoạt động bình thường.