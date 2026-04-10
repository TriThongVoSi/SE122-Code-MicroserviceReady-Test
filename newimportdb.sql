-- =========================================================
-- ACM Platform - Comprehensive Seed Data (MySQL Compatible)
-- =========================================================
-- Version: 6.1 - Extended cross-portal scenarios - 2026-03-19
--
-- Default Admin: admin / Password: Admin@123 (user_id = 1)
-- Default Farmer: farmer / Password: Farmer@123 (user_id = 2)
-- =========================================================
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Đảm bảo database schema đã được tạo qua Flyway migrations
-- 2. Đảm bảo có user ID = 1 (admin) và ID = 2 (farmer) trong bảng users
-- 3. Chạy file này để insert dữ liệu mẫu đầy đủ các trường hợp
-- =========================================================

USE `quanlymuavu`;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. CROPS & VARIETIES
-- =========================================================
INSERT INTO crops (crop_id, crop_name, description) VALUES
                                                        (1, 'Lúa nước', 'Cây lương thực chính của Việt Nam'),
                                                        (2, 'Đậu nành', 'Cây họ đậu giàu đạm, dùng làm thực phẩm và thức ăn chăn nuôi'),
                                                        (3, 'Lạc', 'Cây họ đậu lấy củ, thích hợp vụ khô'),
                                                        (4, 'Đậu đen', 'Cây họ đậu ngắn ngày, chịu hạn khá'),
                                                        (5, 'Ngô', 'Cây lương thực lấy hạt, sinh trưởng mạnh');

INSERT INTO varieties (id, crop_id, name, description) VALUES
                                                           (1, 1, 'Đài Thơm 8', 'Giống lúa nước thơm đặc sản, đạt giải gạo ngon nhất thế giới'),
                                                           (2, 1, 'OM5451', 'Giống lúa nước năng suất cao'),
                                                           (3, 2, 'Đậu nành DT84', 'Giống đậu nành phổ thông, thích hợp vụ xuân hè'),
                                                           (4, 2, 'Đậu nành AGS398', 'Giống đậu nành năng suất cao, hạt to đồng đều'),
                                                           (5, 3, 'Lạc L14', 'Giống trồng từ hạt'),
                                                           (6, 4, 'Đậu đen xanh lòng', 'Giống đậu đen hạt chắc, chất lượng ổn định'),
                                                           (7, 5, 'Ngô lai NK7328', 'Giống ngô lai cho năng suất cao, chống chịu tốt');

-- =========================================================
-- 2. FARMS (user_id = 2)
-- =========================================================
INSERT INTO farms (farm_id, user_id, farm_name, province_id, ward_id, area, active) VALUES
                                                                                        (1, 2, 'Nông trại Phú Điền', 24, 25112, 15.50, TRUE),
                                                                                        (2, 2, 'Nông trại An Phát', 24, 25112, 10.20, TRUE),
                                                                                        (3, 2, 'Khu thử nghiệm Ngũ Cốc', 24, 25112, 3.00, FALSE);

-- =========================================================
-- 3. PLOTS (Multiple statuses)
-- =========================================================
INSERT INTO plots (plot_id, farm_id, plot_name, area, soil_type, status, created_by, created_at, updated_at) VALUES
-- Farm 1 plots
(1, 1, 'Lô A1 - Đậu nành', 2.50, 'LOAM', 'IN_USE', 2, '2024-06-01 08:00:00', NOW()),
(2, 1, 'Lô A2 - Lúa nước Đài Thơm 8', 4.00, 'CLAY', 'IN_USE', 2, '2024-06-01 08:00:00', NOW()),
(3, 1, 'Lô A3 - Luân canh lạc', 3.00, 'SANDY', 'FALLOW', 2, '2024-06-01 08:00:00', NOW()),
(4, 1, 'Lô A4 - Bảo trì tưới', 2.00, 'LOAM', 'MAINTENANCE', 2, '2024-06-01 08:00:00', NOW()),
(5, 1, 'Lô A5 - Sẵn sàng gieo ngô', 2.50, 'CLAY', 'AVAILABLE', 2, '2024-06-01 08:00:00', NOW()),
-- Farm 2 plots
(6, 2, 'Lô B1 - Đậu đen', 1.80, 'LOAM', 'IN_USE', 2, '2024-08-01 08:00:00', NOW()),(7, 2, 'Lô B2 - Lạc', 2.00, 'SANDY', 'IN_USE', 2, '2024-08-01 08:00:00', NOW()),
(8, 2, 'Lô B3 - Dự phòng', 3.00, 'CLAY', 'IDLE', 2, '2024-08-01 08:00:00', NOW());

-- =========================================================
-- 4. SEASONS (All statuses: PLANNED, ACTIVE, COMPLETED, CANCELLED, ARCHIVED)
-- =========================================================
INSERT INTO seasons (season_id, season_name, plot_id, crop_id, variety_id, start_date, planned_harvest_date, end_date, status, initial_plant_count, current_plant_count, expected_yield_kg, actual_yield_kg, budget_amount, notes, created_at) VALUES
-- COMPLETED seasons (past)
(1, 'Vụ Đậu nành Đông 2024', 1, 2, 3, '2024-09-01', '2024-11-30', '2024-12-05', 'COMPLETED', 1000, 950, 800.00, 850.50, 5000000.00, 'Vụ mùa thành công xuất sắc', '2024-09-01 08:00:00'),
(2, 'Vụ Lúa nước Thu Đông 2024', 2, 1, 1, '2024-08-15', '2024-11-15', '2024-11-20', 'COMPLETED', 5000, 4800, 3000.00, 3200.00, 15000000.00, 'Năng suất vượt kỳ vọng', '2024-08-15 08:00:00'),
-- ACTIVE seasons (current)
(3, 'Vụ Đậu nành Xuân 2025', 1, 2, 4, '2025-01-05', '2025-03-25', NULL, 'ACTIVE', 1200, 1150, 950.00, NULL, 6000000.00, 'Đang giai đoạn ra hoa', NOW()),
(4, 'Vụ Lúa nước Đông Xuân 2025', 2, 1, 2, '2024-12-20', '2025-03-15', NULL, 'ACTIVE', 6000, 5800, 3500.00, NULL, 18000000.00, 'Giai đoạn làm đòng', '2024-12-20 08:00:00'),
(5, 'Vụ Lạc 01/2025', 7, 3, 5, '2025-01-10', '2025-02-10', NULL, 'ACTIVE', 2000, 1950, 500.00, NULL, 2000000.00, 'Sinh trưởng tốt', '2025-01-10 08:00:00'),
-- PLANNED seasons (future)
(6, 'Vụ Đậu đen Hè 2025', 5, 4, 6, '2025-04-01', '2025-06-15', NULL, 'PLANNED', 800, NULL, 2000.00, NULL, 10000000.00, 'Dự kiến gieo trồng tháng 4', NOW()),
(7, 'Vụ Ngô Thu 2025', 6, 5, 7, '2025-08-01', '2025-11-01', NULL, 'PLANNED', 1500, NULL, 600.00, NULL, 4000000.00, 'Kế hoạch vụ thu', NOW()),
-- CANCELLED season
(8, 'Vụ Đậu nành bị hủy', 3, 2, 3, '2024-11-01', '2025-01-15', '2024-11-15', 'CANCELLED', 500, 0, 400.00, 0.00, 3000000.00, 'Hủy do thời tiết xấu', '2024-11-01 08:00:00'),
-- ARCHIVED season
(9, 'Vụ Lúa nước Hè 2024 [Lưu trữ]', 2, 1, 1, '2024-04-01', '2024-07-01', '2024-07-05', 'ARCHIVED', 4500, 4300, 2800.00, 2750.00, 14000000.00, 'Đã lưu trữ', '2024-04-01 08:00:00');

-- =========================================================
-- 5. TASKS (All statuses: PENDING, IN_PROGRESS, DONE, OVERDUE, CANCELLED)
-- =========================================================
INSERT INTO tasks (task_id, user_id, season_id, title, description, planned_date, due_date, status, actual_start_date, actual_end_date, notes, created_at) VALUES
-- Season 3 tasks (Active đậu nành)
(1, 2, 3, 'Gieo hạt đậu nành AGS398', 'Gieo hạt vào khay ươm', '2025-01-05', '2025-01-07', 'DONE', '2025-01-05', '2025-01-06', 'Tỉ lệ nảy mầm 95%', NOW()),(2, 2, 3, 'Chuẩn bị đất lô A1', 'Cày bừa, bón vôi, phân lót', '2025-01-08', '2025-01-12', 'DONE', '2025-01-08', '2025-01-11', 'Đất sẵn sàng', NOW()),
(3, 2, 3, 'Cấy đậu nành ra ruộng', 'Cấy cây con 25 ngày tuổi', '2025-01-20', '2025-01-22', 'DONE', '2025-01-20', '2025-01-21', 'Hoàn thành sớm', NOW()),
(4, 2, 3, 'Bón phân thúc đợt 1', 'NPK 16-16-8, 20kg/sào', '2025-02-05', '2025-02-07', 'IN_PROGRESS', '2025-02-05', NULL, 'Đang thực hiện', NOW()),
(5, 2, 3, 'Phun thuốc phòng bệnh', 'Phun thuốc trừ sâu sinh học', '2025-02-10', '2025-02-12', 'PENDING', NULL, NULL, NULL, NOW()),
(6, 2, 3, 'Bón phân thúc đợt 2', 'Phân kali', '2025-02-25', '2025-02-28', 'PENDING', NULL, NULL, NULL, NOW()),
(7, 2, 3, 'Thu hoạch đợt 1', 'Thu hoạch quả chín đợt đầu', '2025-03-15', '2025-03-18', 'PENDING', NULL, NULL, NULL, NOW()),
-- Season 4 tasks (Active lúa nước)
(8, 2, 4, 'Gieo mạ', 'Gieo mạ khay', '2024-12-20', '2024-12-22', 'DONE', '2024-12-20', '2024-12-21', 'Hoàn thành', '2024-12-20 08:00:00'),
(9, 2, 4, 'Cấy lúa nước', 'Cấy lúa nước ra ruộng', '2025-01-05', '2025-01-10', 'DONE', '2025-01-05', '2025-01-09', 'Đúng tiến độ', '2025-01-01 08:00:00'),
(10, 2, 4, 'Bón phân đợt 1', 'Urê + DAP', '2025-01-20', '2025-01-22', 'DONE', '2025-01-20', '2025-01-21', 'Hoàn thành', '2025-01-15 08:00:00'),
(11, 2, 4, 'Phun thuốc trừ cỏ', 'Thuốc trừ cỏ hậu nảy mầm', '2025-01-15', '2025-01-17', 'OVERDUE', NULL, NULL, 'Chưa thực hiện - quá hạn', '2025-01-10 08:00:00'),
(12, 2, 4, 'Bón phân đón đòng', 'Kali + urê', '2025-02-10', '2025-02-15', 'IN_PROGRESS', '2025-02-12', NULL, 'Đang bón', NOW()),
-- Season 5 tasks (Lạc)
(13, 2, 5, 'Gieo hạt lạc', 'Gieo trực tiếp', '2025-01-10', '2025-01-11', 'DONE', '2025-01-10', '2025-01-10', 'Hoàn thành trong ngày', '2025-01-10 08:00:00'),
(14, 2, 5, 'Tưới nước hàng ngày', 'Tưới sáng chiều', '2025-01-12', '2025-02-10', 'IN_PROGRESS', '2025-01-12', NULL, 'Đang thực hiện', '2025-01-12 08:00:00'),
(15, 2, 5, 'Thu hoạch lứa 1', 'Cắt rau', '2025-02-05', '2025-02-07', 'PENDING', NULL, NULL, NULL, NOW()),
-- Cancelled task
(16, 2, 8, 'Chuẩn bị đất', 'Đã hủy cùng vụ mùa', '2024-11-05', '2024-11-10', 'CANCELLED', NULL, NULL, 'Vụ bị hủy', '2024-11-01 08:00:00');

-- =========================================================
-- 6. EXPENSES (Various categories & payment statuses)
-- =========================================================
INSERT INTO expenses (expense_id, user_id, season_id, task_id, category, item_name, unit_price, quantity, total_cost, amount, payment_status, note, expense_date, created_at) VALUES
-- Season 1 (Completed)
(1, 2, 1, NULL, 'SEEDS', 'Hạt giống đậu nành DT84', 20000.00, 10, 200000.00, 200000.00, 'PAID', 'Mua tại đại lý', '2024-09-02', '2024-09-02 09:00:00'),(2, 2, 1, NULL, 'FERTILIZER', 'Phân NPK 16-16-8', 55000.00, 8, 440000.00, 440000.00, 'PAID', 'Bón lót', '2024-09-05', '2024-09-05 10:00:00'),
(3, 2, 1, NULL, 'LABOR', 'Thuê nhân công thu hoạch', 250000.00, 3, 750000.00, 750000.00, 'PAID', 'Thu hoạch 3 ngày', '2024-12-01', '2024-12-01 14:00:00'),
-- Season 3 (Active)
(4, 2, 3, 1, 'SEEDS', 'Hạt giống đậu nành AGS398', 25000.00, 15, 375000.00, 375000.00, 'PAID', 'Nhập từ Đà Lạt', '2025-01-05', NOW()),
(5, 2, 3, 2, 'FERTILIZER', 'Phân hữu cơ vi sinh', 80000.00, 20, 1600000.00, 1600000.00, 'PAID', 'Bón lót', '2025-01-08', NOW()),
(6, 2, 3, 4, 'FERTILIZER', 'Phân NPK 16-16-8', 55000.00, 10, 550000.00, 550000.00, 'PENDING', 'Bón thúc đợt 1', '2025-02-05', NOW()),
(7, 2, 3, NULL, 'EQUIPMENT', 'Dây buộc đậu nành', 15000.00, 20, 300000.00, 300000.00, 'PAID', 'Cuộn 100m', '2025-01-15', NOW()),
(8, 2, 3, NULL, 'PESTICIDE', 'Thuốc trừ sâu sinh học', 120000.00, 5, 600000.00, 600000.00, 'UNPAID', 'Chờ thanh toán', '2025-02-01', NOW()),
-- Season 4 (Active lúa nước)
(9, 2, 4, 8, 'SEEDS', 'Hạt giống lúa nước OM5451', 30000.00, 60, 1800000.00, 1800000.00, 'PAID', 'Giống xác nhận', '2024-12-18', '2024-12-18 08:00:00'),
(10, 2, 4, 10, 'FERTILIZER', 'Urê', 450000.00, 10, 4500000.00, 4500000.00, 'PAID', 'Bón thúc', '2025-01-20', NOW()),
(11, 2, 4, 12, 'FERTILIZER', 'Kali clorua', 520000.00, 5, 2600000.00, 2600000.00, 'PENDING', 'Bón đón đòng', '2025-02-12', NOW()),
(12, 2, 4, NULL, 'LABOR', 'Thuê máy cấy', 800000.00, 4, 3200000.00, 3200000.00, 'PAID', '4 hecta', '2025-01-06', NOW()),
-- Season 5 (Lạc)
(13, 2, 5, 13, 'SEEDS', 'Hạt lạc', 8000.00, 5, 40000.00, 40000.00, 'PAID', '5kg hạt', '2025-01-10', '2025-01-10 08:00:00'),
(14, 2, 5, NULL, 'OTHER', 'Thuê bơm nước', 50000.00, 30, 1500000.00, 1500000.00, 'PENDING', 'Thuê theo ngày', '2025-01-12', NOW());

-- =========================================================
-- 7. HARVESTS
-- =========================================================
INSERT INTO harvests (harvest_id, season_id, harvest_date, quantity, unit, grade, note, created_at) VALUES
-- Season 1 harvests (Completed)
(1, 1, '2024-11-25', 350.00, 18000.00, 'A', 'Thu hoạch đợt 1 - Quả đẹp', '2024-11-25 17:00:00'),
(2, 1, '2024-11-30', 380.00, 19000.00, 'A', 'Thu hoạch đợt 2', '2024-11-30 16:00:00'),
(3, 1, '2024-12-05', 120.50, 15000.00, 'B', 'Thu hoạch cuối vụ - Quả nhỏ', '2024-12-05 15:00:00'),
-- Season 2 harvests (Completed lúa nước)
(4, 2, '2024-11-18', 1600.00, 8500.00, 'A', 'Thu hoạch lúa nước đợt 1', '2024-11-18 10:00:00'),
(5, 2, '2024-11-20', 1600.00, 8500.00, 'A', 'Thu hoạch lúa nước đợt 2 - hoàn thành', '2024-11-20 10:00:00'),
-- Season 9 (Archived)
(6, 9, '2024-07-03', 1400.00, 8000.00, 'A', 'Thu hoạch lúa nước hè', '2024-07-03 10:00:00'),
(7, 9, '2024-07-05', 1350.00, 8000.00, 'B', 'Đợt cuối', '2024-07-05 10:00:00');-- =========================================================
-- 8. SUPPLIERS
-- =========================================================
INSERT INTO suppliers (id, name, license_no, contact_email, contact_phone) VALUES
                                                                               (1, 'Công ty TNHH Vật tư Nông nghiệp Xanh', 'BN-2024-001', 'vattuxanh@gmail.com', '0274-3855666'),
                                                                               (2, 'Đại lý Phân bón Miền Nam', 'BN-2024-002', 'phanbonmn@gmail.com', '0283-9876543'),
                                                                               (3, 'HTX Giống cây trồng Đà Lạt', 'LD-2024-001', 'giongdalat@gmail.com', '0263-3512345');

-- =========================================================
-- 9. SUPPLY ITEMS
-- =========================================================
INSERT INTO supply_items (id, name, active_ingredient, unit, restricted_flag) VALUES
                                                                                  (1, 'Phân NPK 16-16-8', 'N-P-K 16-16-8', 'kg', FALSE),
                                                                                  (2, 'Thuốc trừ sâu sinh học B1', 'Bacillus thuringiensis', 'lít', TRUE),
                                                                                  (3, 'Phân Urê', 'N 46%', 'kg', FALSE),
                                                                                  (4, 'Phân DAP', 'N-P 18-46', 'kg', FALSE),
                                                                                  (5, 'Thuốc trừ cỏ', 'Glyphosate', 'lít', TRUE),
                                                                                  (6, 'Phân Kali clorua', 'K2O 60%', 'kg', FALSE);

-- =========================================================
-- 10. SUPPLY LOTS (Various statuses & expiry)
-- =========================================================
INSERT INTO supply_lots (id, supply_item_id, supplier_id, batch_code, expiry_date, status) VALUES
                                                                                               (1, 1, 1, 'NPK-2025-001', '2027-06-30', 'IN_STOCK'),
                                                                                               (2, 2, 1, 'BT-2024-001', '2025-03-15', 'IN_STOCK'),  -- Sắp hết hạn
                                                                                               (3, 3, 2, 'UREA-2025-001', '2027-12-31', 'IN_STOCK'),
                                                                                               (4, 4, 2, 'DAP-2025-001', '2027-12-31', 'IN_STOCK'),
                                                                                               (5, 5, 1, 'WEED-2024-001', '2025-02-01', 'EXPIRED'),  -- Đã hết hạn
                                                                                               (6, 6, 2, 'KALI-2025-001', '2027-06-30', 'IN_STOCK');

-- =========================================================
-- 11. WAREHOUSES
-- =========================================================
INSERT INTO warehouses (id, farm_id, name, type, province_id, ward_id) VALUES
                                                                           (1, 1, 'Kho vật tư Phú Điền', 'INPUT', 24, 25112),
                                                                           (2, 1, 'Kho nông sản Phú Điền', 'OUTPUT', 24, 25112),
                                                                           (3, 2, 'Kho An Phát', 'INPUT', 24, 25112);

-- =========================================================
-- 12. STOCK LOCATIONS
-- =========================================================
INSERT INTO stock_locations (id, warehouse_id, zone, aisle, shelf, bin) VALUES
                                                                            (1, 1, 'Khu A', 'Hàng 1', 'Kệ 1', 'Ô 1'),
                                                                            (2, 1, 'Khu A', 'Hàng 1', 'Kệ 2', 'Ô 1'),
                                                                            (3, 1, 'Khu B', 'Hàng 1', 'Kệ 1', 'Ô 1'),
                                                                            (4, 3, 'Khu chính', 'Hàng 1', 'Kệ 1', 'Ô 1');

-- =========================================================
-- 13. STOCK MOVEMENTS (IN, OUT, ADJUST)
-- =========================================================
INSERT INTO stock_movements (id, supply_lot_id, warehouse_id, location_id, movement_type, quantity, movement_date, season_id, task_id, note) VALUES
-- Nhập kho
(1, 1, 1, 1, 'IN', 200.000, '2025-01-02 08:00:00', NULL, NULL, 'Nhập kho đầu năm'),(2, 2, 1, 2, 'IN', 50.000, '2025-01-02 08:30:00', NULL, NULL, 'Nhập thuốc trừ sâu'),
(3, 3, 1, 3, 'IN', 500.000, '2025-01-05 09:00:00', NULL, NULL, 'Nhập urê'),
(4, 6, 3, 4, 'IN', 150.000, '2025-01-10 10:00:00', NULL, NULL, 'Nhập kali'),
-- Xuất kho cho vụ mùa
(5, 1, 1, 1, 'OUT', 50.000, '2025-01-08 14:00:00', 3, 2, 'Xuất cho bón lót đậu nành'),
(6, 3, 1, 3, 'OUT', 60.000, '2025-01-20 08:00:00', 4, 10, 'Xuất urê cho lúa nước'),
(7, 2, 1, 2, 'OUT', 10.000, '2025-02-01 07:00:00', 3, NULL, 'Xuất thuốc trừ sâu'),
-- Điều chỉnh
(8, 1, 1, 1, 'ADJUST', -5.000, '2025-01-15 16:00:00', NULL, NULL, 'Điều chỉnh hao hụt');

-- =========================================================
-- 14. INVENTORY BALANCES
-- =========================================================
INSERT INTO inventory_balances (id, supply_lot_id, warehouse_id, location_id, quantity) VALUES
                                                                                            (1, 1, 1, 1, 145.00),
                                                                                            (2, 2, 1, 2, 40.00),
                                                                                            (3, 3, 1, 3, 440.00),
                                                                                            (4, 6, 3, 4, 150.00);

-- =========================================================
-- 15. FIELD LOGS (Various log types)
-- =========================================================
INSERT INTO field_logs (field_log_id, season_id, log_date, log_type, notes, created_at) VALUES
-- Season 3 logs
(1, 3, '2025-01-06', 'TRANSPLANT', 'Cấy 1200 cây đậu nành, tỉ lệ sống 96%', '2025-01-06 17:00:00'),
(2, 3, '2025-01-15', 'WEATHER', 'Trời nắng ấm 28°C, thuận lợi cho sinh trưởng', '2025-01-15 08:00:00'),
(3, 3, '2025-01-20', 'GROWTH', 'Cây cao 25cm, bắt đầu phân cành', '2025-01-20 10:00:00'),
(4, 3, '2025-02-01', 'PEST', 'Phát hiện rầy mềm, mật độ thấp', '2025-02-01 09:00:00'),
(5, 3, '2025-02-05', 'FERTILIZE', 'Bón NPK thúc đợt 1, 20kg/sào', '2025-02-05 16:00:00'),
-- Season 4 logs
(6, 4, '2025-01-10', 'IRRIGATE', 'Bơm nước vào ruộng, mực nước 5cm', '2025-01-10 06:00:00'),
(7, 4, '2025-01-25', 'GROWTH', 'Lúa nước bắt đầu đẻ nhánh', '2025-01-25 10:00:00'),
(8, 4, '2025-02-10', 'WEATHER', 'Mưa nhỏ, thuận lợi cho giai đoạn làm đòng', '2025-02-10 08:00:00'),
-- Season 5 logs
(9, 5, '2025-01-12', 'OTHER', 'Rau mọc đều, tỉ lệ nảy mầm 90%', '2025-01-12 08:00:00'),
(10, 5, '2025-01-20', 'WEED', 'Nhổ cỏ xung quanh luống', '2025-01-20 16:00:00');

-- =========================================================
-- 16. INCIDENTS (All severities & statuses)
-- =========================================================
INSERT INTO incidents (id, season_id, reported_by, incident_type, severity, status, description, deadline, resolved_at, created_at) VALUES
-- OPEN incidents
(1, 3, 2, 'DISEASE', 'MEDIUM', 'OPEN', 'Phát hiện bệnh sương mai trên lá đậu nành', '2025-02-15', NULL, NOW()),
(2, 4, 2, 'PEST', 'HIGH', 'OPEN', 'Rầy nâu xuất hiện với mật độ cao', '2025-02-10', NULL, NOW()),
-- IN_PROGRESS incident
(3, 3, 2, 'PEST', 'LOW', 'IN_PROGRESS', 'Rầy mềm trên ngọn đậu nành - đang xử lý', '2025-02-20', NULL, '2025-02-01 09:00:00'),
-- RESOLVED incidents
(4, 1, 2, 'DISEASE', 'MEDIUM', 'RESOLVED', 'Bệnh thán thư trên quả - đã kiểm soát', '2024-11-20', '2024-11-18 10:00:00', '2024-11-10 08:00:00'),
(5, 2, 2, 'WEATHER', 'HIGH', 'RESOLVED', 'Mưa lớn gây ngập ruộng - đã thoát nước', '2024-10-15', '2024-10-12 16:00:00', '2024-10-10 06:00:00'),
-- CANCELLED incident
(6, 8, 2, 'OTHER', 'LOW', 'CANCELLED', 'Sự cố đã hủy cùng vụ mùa', NULL, NULL, '2024-11-05 10:00:00');

-- =========================================================
-- 17. ALERTS (All types, severities & statuses)
-- =========================================================
INSERT INTO alerts (id, type, severity, status, farm_id, season_id, plot_id, crop_id, title, message, suggested_action_type, suggested_action_url, recipient_farmer_ids, created_at, sent_at) VALUES
-- NEW alerts
(1, 'TASK_OVERDUE', 'HIGH', 'NEW', 1, 4, 2, 1, 'Công việc quá hạn', 'Phun thuốc trừ cỏ đã quá hạn 10 ngày', 'VIEW_TASK', '/tasks/11', '2', NOW(), NULL),
(2, 'INVENTORY_EXPIRING', 'MEDIUM', 'NEW', 1, NULL, NULL, NULL, 'Vật tư sắp hết hạn', 'Thuốc trừ sâu sinh học B1 sẽ hết hạn vào 15/03/2025', 'VIEW_INVENTORY', '/inventory', '2', NOW(), NULL),
-- SENT alerts
(3, 'INCIDENT_OPEN', 'HIGH', 'SENT', 1, 4, 2, 1, 'Sự cố cần xử lý', 'Rầy nâu xuất hiện với mật độ cao trên ruộng lúa nước', 'VIEW_INCIDENT', '/incidents/2', '2', NOW(), NOW()),
(4, 'BUDGET_OVERSPEND', 'MEDIUM', 'SENT', 1, 3, 1, 2, 'Vượt ngân sách', 'Chi phí vụ đậu nành đã vượt 15% so với dự kiến', 'VIEW_EXPENSES', '/expenses?seasonId=3', '2', '2025-02-01 08:00:00', '2025-02-01 08:01:00'),
-- ACKNOWLEDGED alert
(5, 'INVENTORY_EXPIRED', 'CRITICAL', 'ACKNOWLEDGED', 1, NULL, NULL, NULL, 'Vật tư đã hết hạn', 'Thuốc trừ cỏ lô WEED-2024-001 đã hết hạn', 'VIEW_INVENTORY', '/inventory', '2', '2025-02-02 08:00:00', '2025-02-02 08:01:00'),
-- RESOLVED alert
(6, 'TASK_OVERDUE', 'MEDIUM', 'RESOLVED', 1, 1, 1, 2, 'Công việc đã hoàn thành', 'Thu hoạch đậu nành đợt cuối', NULL, NULL, '2', '2024-12-01 08:00:00', '2024-12-01 08:01:00'),
-- DISMISSED alert
(7, 'INCIDENT_OPEN', 'LOW', 'DISMISSED', 1, 1, 1, 2, 'Sự cố nhỏ', 'Một số lá vàng do thiếu dinh dưỡng', NULL, NULL, '2', '2024-11-15 08:00:00', '2024-11-15 08:01:00');

-- =========================================================
-- 18. NOTIFICATIONS (for user_id = 2)
-- =========================================================
INSERT INTO notifications (id, user_id, title, message, link, alert_id, created_at, read_at) VALUES
-- Unread notifications
(1, 2, 'Công việc quá hạn', 'Phun thuốc trừ cỏ cho vụ lúa nước đã quá hạn', '/tasks/11', 1, NOW(), NULL),(2, 2, 'Vật tư sắp hết hạn', 'Thuốc trừ sâu sinh học B1 sẽ hết hạn trong 45 ngày', '/inventory', 2, NOW(), NULL),
(3, 2, 'Sự cố mới', 'Rầy nâu xuất hiện trên ruộng lúa nước - cần xử lý gấp', '/incidents/2', 3, NOW(), NULL),
-- Read notifications
(4, 2, 'Chi phí vượt ngân sách', 'Vụ đậu nành Xuân 2025 đã vượt ngân sách 15%', '/expenses?seasonId=3', 4, '2025-02-01 08:00:00', '2025-02-01 10:00:00'),
(5, 2, 'Vật tư hết hạn', 'Thuốc trừ cỏ lô WEED-2024-001 đã hết hạn sử dụng', '/inventory', 5, '2025-02-02 08:00:00', '2025-02-02 09:00:00'),
(6, 2, 'Vụ mùa hoàn thành', 'Vụ Đậu nành Đông 2024 đã hoàn thành thành công', '/seasons/1', NULL, '2024-12-05 17:00:00', '2024-12-05 18:00:00'),
(7, 2, 'Chào mừng!', 'Chào mừng bạn đến với hệ thống Quản lý Mùa vụ ACM', '/dashboard', NULL, '2024-06-01 08:00:00', '2024-06-01 08:30:00');

-- =========================================================
-- 19. DOCUMENTS
-- =========================================================
INSERT INTO documents (document_id, title, url, description, crop, stage, topic, is_active, is_public, created_by, document_type, view_count, is_pinned, created_at, updated_at) VALUES
                                                                                                                                                                                                 (1, 'Quy trình trồng đậu nành theo GAP', 'https://example.com/docs/soybean-gap.pdf', 'Hướng dẫn kỹ thuật trồng đậu nành theo tiêu chuẩn GAP', 'Đậu nành', 'ALL', 'GUIDE', TRUE, TRUE, 1, 'GUIDE', 125, TRUE, '2024-01-15 08:00:00', NOW()),
                                                                                                                                                                                                 (2, 'Lịch thời vụ 2025', 'https://example.com/docs/calendar-2025.pdf', 'Lịch thời vụ các loại cây trồng chính năm 2025', NULL, 'ALL', 'CALENDAR', TRUE, TRUE, 1, 'GUIDE', 89, TRUE, '2024-12-01 08:00:00', NOW()),
                                                                                                                                                                                                 (3, 'Kỹ thuật canh tác lúa nước Đài Thơm 8', 'https://example.com/docs/dai-thom-8-guide.pdf', 'Hướng dẫn chi tiết kỹ thuật canh tác giống lúa nước Đài Thơm 8', 'Lúa nước', 'GROWING', 'GUIDE', TRUE, TRUE, 1, 'GUIDE', 67, FALSE, '2024-06-01 08:00:00', NOW()),
                                                                                                                                                                                                 (4, 'Phòng trừ sâu bệnh hại đậu nành', 'https://example.com/docs/soybean-pest.pdf', 'Các bệnh thường gặp và biện pháp phòng trừ', 'Đậu nành', 'ALL', 'PEST_CONTROL', TRUE, TRUE, 1, 'GUIDE', 45, FALSE, '2024-08-01 08:00:00', NOW()),
                                                                                                                                                                                                 (5, 'Mẫu sổ nhật ký đồng ruộng', 'https://example.com/docs/field-log-template.xlsx', 'Mẫu sổ ghi chép hoạt động sản xuất', NULL, 'ALL', 'TEMPLATE', TRUE, TRUE, 1, 'TEMPLATE', 33, FALSE, '2024-03-01 08:00:00', NOW()),
                                                                                                                                                                                                 (6, 'Thông báo: Cập nhật hệ thống', 'https://example.com/docs/system-update-2025.pdf', 'Thông báo các tính năng mới của hệ thống ACM 2025', NULL, 'ALL', 'ANNOUNCEMENT', TRUE, TRUE, 1, 'ANNOUNCEMENT', 156, TRUE, '2025-01-01 08:00:00', NOW()),
                                                                                                                                                                                                 (7, 'Hướng dẫn sử dụng ứng dụng', 'https://example.com/docs/user-guide.pdf', 'Hướng dẫn sử dụng toàn bộ tính năng hệ thống', NULL, 'ALL', 'HELP', TRUE, TRUE, 1, 'SYSTEM_HELP', 210, FALSE, '2024-01-01 08:00:00', NOW());

-- =========================================================
-- 20. DOCUMENT FAVORITES & RECENT OPENS (for user_id = 2)
-- =========================================================
INSERT INTO document_favorites (id, user_id, document_id, created_at) VALUES
                                                                          (1, 2, 1, '2025-01-10 08:00:00'),
                                                                          (2, 2, 3, '2025-01-15 09:00:00'),
                                                                          (3, 2, 6, '2025-01-20 10:00:00');

INSERT INTO document_recent_opens (id, user_id, document_id, opened_at) VALUES
                                                                            (1, 2, 1, '2025-01-27 08:00:00'),
                                                                            (2, 2, 6, '2025-01-26 14:00:00'),
                                                                            (3, 2, 3, '2025-01-25 10:00:00'),
                                                                            (4, 2, 4, '2025-01-24 16:00:00'),
                                                                            (5, 2, 2, '2025-01-20 09:00:00');

-- =========================================================
-- 21. USER PREFERENCES (for user_id = 2)
-- =========================================================
INSERT INTO user_preferences (id, user_id, currency_code, weight_unit, locale, created_at, updated_at) VALUES
    (1, 2, 'VND', 'KG', 'vi-VN', '2024-06-01 08:00:00', NOW());

-- =========================================================
-- 22. AUDIT LOGS
-- =========================================================
INSERT INTO audit_logs (audit_log_id, entity_type, entity_id, operation, performed_by, performed_at, snapshot_data, reason, ip_address) VALUES
                                                                                                                                            (1, 'SEASON', 8, 'UPDATE', 'farmer', '2024-11-15 10:00:00', '{"status":"ACTIVE","seasonName":"Vụ Đậu nành bị hủy"}', 'Hủy vụ do thời tiết xấu', '192.168.1.100'),
                                                                                                                                            (2, 'FARM', 3, 'UPDATE', 'farmer', '2024-12-01 08:00:00', '{"active":true,"name":"Khu thử nghiệm Ngũ Cốc"}', 'Tạm ngưng hoạt động', '192.168.1.100'),
                                                                                                                                            (3, 'SEASON', 9, 'UPDATE', 'farmer', '2024-08-01 08:00:00', '{"status":"COMPLETED"}', 'Lưu trữ vụ mùa cũ', '192.168.1.100');

-- =========================================================
-- 23. PLOT GEOMETRY (for map rendering readiness)
-- =========================================================
UPDATE plots
SET boundary_geojson = '{"type":"Polygon","coordinates":[[[106.7018,10.7765],[106.7031,10.7765],[106.7031,10.7776],[106.7018,10.7776],[106.7018,10.7765]]]}'
WHERE plot_id = 1;

UPDATE plots
SET boundary_geojson = '{"type":"Polygon","coordinates":[[[106.7040,10.7759],[106.7057,10.7759],[106.7057,10.7773],[106.7040,10.7773],[106.7040,10.7759]]]}'
WHERE plot_id = 2;

UPDATE plots
SET boundary_geojson = '{"type":"Polygon","coordinates":[[[106.7090,10.7728],[106.7101,10.7728],[106.7101,10.7738],[106.7090,10.7738],[106.7090,10.7728]]]}'
WHERE plot_id = 7;

-- =========================================================
-- 24. CROP NITROGEN REFERENCES (for NUE/N-output quality)
-- =========================================================
INSERT INTO crop_nitrogen_references (id, crop_id, n_content_kg_per_kg_yield, source_reference, active, created_at, updated_at) VALUES
    (1, 1, 0.013500, 'VN-PADDYRICE-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
    (2, 2, 0.018000, 'VN-SOYBEAN-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
    (3, 3, 0.028000, 'VN-PEANUT-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
    (4, 4, 0.012000, 'VN-BLACKBEAN-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
    (5, 5, 0.020000, 'VN-CORN-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00');

-- =========================================================
-- 25. ADDITIONAL HARVESTS (active seasons for dashboard output)
-- =========================================================
INSERT INTO harvests (harvest_id, season_id, harvest_date, quantity, unit, grade, note, created_at) VALUES
    (8, 3, '2025-03-02', 260.00, 17500.00, 'A', 'Thu hoạch sớm phục vụ đơn hàng thử nghiệm', '2025-03-02 16:00:00'),
    (9, 4, '2025-02-28', 900.00, 8500.00, 'A', 'Thu hoạch lúa nước trước mốc chính vụ', '2025-02-28 17:00:00'),
    (10, 5, '2025-02-08', 180.00, 12000.00, 'B', 'Thu hoạch lạc lứa đầu', '2025-02-08 11:00:00');

-- =========================================================
-- 26. NUTRIENT INPUT EVENTS (aggregate inputs incl. historical legacy)
-- =========================================================
INSERT INTO nutrient_input_events
    (id, season_id, plot_id, input_source, n_kg, applied_date, measured, data_source, note, created_at)
VALUES
    (1, 3, 1, 'MINERAL_FERTILIZER', 120.0000, '2025-01-22', TRUE, 'user_entered', 'Urê + NPK đợt chính', '2025-01-22 08:30:00'),
    (2, 3, 1, 'ORGANIC_FERTILIZER', 60.0000, '2025-01-10', TRUE, 'user_entered', 'Bón compost nền', '2025-01-10 07:30:00'),
    (3, 3, 1, 'BIOLOGICAL_FIXATION', 4.0000, '2025-02-01', FALSE, 'external_reference', 'Ước tính theo canh tác xen vi sinh', '2025-02-01 06:00:00'),
    (4, 3, 1, 'ATMOSPHERIC_DEPOSITION', 6.0000, '2025-02-01', FALSE, 'default_reference', 'Theo tham chiếu cấu hình vùng', '2025-02-01 06:01:00'),
    (5, 3, 1, 'SEED_IMPORT', 2.0000, '2025-01-05', FALSE, 'default_reference', 'Nguồn N theo giống gieo trồng', '2025-01-05 06:01:00'),
    (6, 4, 2, 'MINERAL_FERTILIZER', 210.0000, '2025-01-20', TRUE, 'user_entered', 'Urê + DAP đợt 1', '2025-01-20 09:00:00'),
    (7, 4, 2, 'ORGANIC_FERTILIZER', 25.0000, '2025-01-05', TRUE, 'user_entered', 'Phân chuồng ủ hoai', '2025-01-05 08:00:00'),
    (8, 4, 2, 'ATMOSPHERIC_DEPOSITION', 8.0000, '2025-02-01', FALSE, 'default_reference', 'Tham chiếu khí quyển theo cấu hình', '2025-02-01 06:10:00'),
    (9, 4, 2, 'SEED_IMPORT', 3.0000, '2024-12-20', FALSE, 'default_reference', 'Nguồn N từ hạt giống', '2024-12-20 06:10:00'),
    (10, 5, 7, 'MINERAL_FERTILIZER', 25.0000, '2025-01-18', TRUE, 'user_entered', 'NPK giai đoạn đầu rau', '2025-01-18 07:00:00'),
    (11, 5, 7, 'ORGANIC_FERTILIZER', 12.0000, '2025-01-12', TRUE, 'user_entered', 'Bổ sung hữu cơ nền', '2025-01-12 07:00:00'),
    (12, 5, 7, 'ATMOSPHERIC_DEPOSITION', 3.0000, '2025-01-20', FALSE, 'default_reference', 'Tham chiếu khí quyển', '2025-01-20 06:00:00'),
    (13, 5, 7, 'SEED_IMPORT', 1.0000, '2025-01-10', FALSE, 'default_reference', 'Nguồn N từ hạt giống', '2025-01-10 06:00:00'),
    (14, 1, 1, 'MINERAL_FERTILIZER', 95.0000, '2024-10-01', TRUE, 'user_entered', 'Lịch sử: bón khoáng vụ hoàn thành', '2024-10-01 09:00:00'),
    (15, 1, 1, 'ORGANIC_FERTILIZER', 40.0000, '2024-09-18', TRUE, 'user_entered', 'Lịch sử: bón hữu cơ vụ hoàn thành', '2024-09-18 09:00:00'),
    (16, 1, 1, 'IRRIGATION_WATER', 9.0000, '2024-10-20', FALSE, 'legacy_aggregate', 'Lịch sử legacy aggregate (đã deprecate)', '2024-10-20 09:00:00'),
    (17, 1, 1, 'SOIL_LEGACY', 22.0000, '2024-10-20', FALSE, 'legacy_aggregate', 'Lịch sử legacy aggregate (đã deprecate)', '2024-10-20 09:05:00'),
    (18, 2, 2, 'MINERAL_FERTILIZER', 180.0000, '2024-09-10', TRUE, 'user_entered', 'Lịch sử vụ lúa nước thu đông', '2024-09-10 09:00:00'),
    (19, 2, 2, 'ORGANIC_FERTILIZER', 35.0000, '2024-09-01', TRUE, 'user_entered', 'Lịch sử vụ lúa nước thu đông', '2024-09-01 09:00:00'),
    (20, 2, 2, 'IRRIGATION_WATER', 20.0000, '2024-09-20', FALSE, 'legacy_aggregate', 'Legacy irrigation aggregate', '2024-09-20 09:00:00'),
    (21, 2, 2, 'SOIL_LEGACY', 70.0000, '2024-09-20', FALSE, 'legacy_aggregate', 'Legacy soil aggregate', '2024-09-20 09:05:00');

-- =========================================================
-- 27. DEDICATED IRRIGATION WATER ANALYSES
-- =========================================================
INSERT INTO irrigation_water_analyses
    (id, season_id, plot_id, sample_date, nitrate_mg_per_l, ammonium_mg_per_l, total_n_mg_per_l, irrigation_volume_m3,
     legacy_n_contribution_kg, legacy_event_id, legacy_derived, measured, source_type, source_document, lab_reference,
     note, created_by_user_id, created_at)
VALUES
    (1, 3, 1, '2025-02-02', 11.0000, 3.0000, NULL, 1400.0000,
     NULL, NULL, FALSE, TRUE, 'LAB_MEASURED', 'https://example.com/lab/irrigation-a1-20250202.pdf', 'LAB-HCMC-IRR-250202',
     'Mẫu nước tưới lô A1 - đợt 1', 2, '2025-02-02 10:30:00'),
    (2, 3, 1, '2025-02-20', NULL, NULL, 12.0000, 800.0000,
     NULL, NULL, FALSE, TRUE, 'USER_ENTERED', NULL, 'LAB-HCMC-IRR-250220',
     'Bổ sung mẫu tổng N giữa vụ', 2, '2025-02-20 10:30:00'),
    (3, 4, 2, '2025-02-01', 8.0000, 2.0000, NULL, 2200.0000,
     NULL, NULL, FALSE, TRUE, 'USER_ENTERED', NULL, 'LAB-PADDYRICE-250201',
     'Mẫu nước ruộng lúa nước A2', 2, '2025-02-01 09:00:00'),
    (4, 5, 7, '2025-01-25', 6.0000, 1.0000, NULL, 900.0000,
     NULL, NULL, FALSE, TRUE, 'USER_ENTERED', NULL, 'LAB-PEANUT-250125',
     'Mẫu nước tưới lạc B2', 2, '2025-01-25 09:00:00'),
    (5, 1, 1, '2024-10-20', NULL, NULL, NULL, 1000.0000,
     9.0000, 16, TRUE, FALSE, 'USER_ENTERED', NULL, NULL,
     'Backfill legacy IRRIGATION_WATER event #16', 2, '2024-10-20 09:10:00');

-- =========================================================
-- 28. DEDICATED SOIL TESTS
-- =========================================================
INSERT INTO soil_tests
    (id, season_id, plot_id, sample_date, soil_organic_matter_pct, mineral_n_kg_per_ha, nitrate_mg_per_kg, ammonium_mg_per_kg,
     legacy_n_contribution_kg, legacy_event_id, legacy_derived, measured, source_type, source_document, lab_reference,
     note, created_by_user_id, created_at)
VALUES
    (1, 3, 1, '2025-02-03', 3.2000, 11.0000, 14.0000, 4.0000,
     NULL, NULL, FALSE, TRUE, 'LAB_MEASURED', 'https://example.com/lab/soil-a1-20250203.pdf', 'LAB-HCMC-SOIL-250203',
     'Mẫu đất lô A1 - giai đoạn ra hoa', 2, '2025-02-03 14:00:00'),
    (2, 4, 2, '2025-02-01', 2.4000, 15.0000, 12.0000, 5.0000,
     NULL, NULL, FALSE, TRUE, 'LAB_MEASURED', 'https://example.com/lab/soil-a2-20250201.pdf', 'LAB-PADDYRICE-SOIL-250201',
     'Mẫu đất ruộng lúa nước A2', 2, '2025-02-01 13:20:00'),
    (3, 5, 7, '2025-01-25', 3.8000, 8.0000, 9.0000, 3.0000,
     NULL, NULL, FALSE, TRUE, 'USER_ENTERED', NULL, 'LAB-PEANUT-SOIL-250125',
     'Mẫu đất lạc B2', 2, '2025-01-25 15:20:00'),
    (4, 1, 1, '2024-10-20', NULL, 0.0000, NULL, NULL,
     22.0000, 17, TRUE, FALSE, 'USER_ENTERED', NULL, NULL,
     'Backfill legacy SOIL_LEGACY event #17', 2, '2024-10-20 09:20:00');

-- =========================================================
-- 29. LABOR MANAGEMENT SEED
-- =========================================================
INSERT INTO season_employees (id, season_id, employee_user_id, added_by_user_id, wage_per_task, active, created_at) VALUES
    (1, 3, 2, 1, 180000.00, b'1', '2025-01-05 09:00:00'),
    (2, 4, 2, 1, 220000.00, b'1', '2024-12-25 09:00:00'),
    (3, 5, 2, 1, 140000.00, b'1', '2025-01-10 09:00:00');

INSERT INTO task_progress_logs (id, task_id, employee_user_id, progress_percent, note, evidence_url, logged_at) VALUES
    (1, 4, 2, 55, 'Hoàn thành khoảng 55% khối lượng bón thúc đợt 1', 'https://example.com/evidence/task-4-progress.jpg', '2025-02-06 11:00:00'),
    (2, 12, 2, 60, 'Đã bón được 60% diện tích lô A2', 'https://example.com/evidence/task-12-progress.jpg', '2025-02-13 15:00:00'),
    (3, 14, 2, 80, 'Duy trì tưới đều sáng chiều', 'https://example.com/evidence/task-14-progress.jpg', '2025-01-28 17:00:00');

INSERT INTO payroll_records
    (id, employee_user_id, season_id, period_start, period_end, total_assigned_tasks, total_completed_tasks, wage_per_task, total_amount, generated_at, note)
VALUES
    (1, 2, 3, '2025-01-01', '2025-01-31', 7, 3, 180000.00, 540000.00, '2025-02-01 09:00:00', 'Tổng hợp lương theo task tháng 01/2025'),
    (2, 2, 4, '2025-01-01', '2025-01-31', 5, 3, 220000.00, 660000.00, '2025-02-01 09:05:00', 'Lương nhân công ruộng lúa nước tháng 01/2025'),
    (3, 2, 5, '2025-01-01', '2025-01-31', 3, 1, 140000.00, 140000.00, '2025-02-01 09:10:00', 'Lương chăm sóc lạc tháng 01/2025');

-- =========================================================
-- 30. PRODUCT WAREHOUSE LOTS & TRANSACTIONS
-- =========================================================
INSERT INTO product_warehouse_lots
    (id, lot_code, product_id, product_name, product_variant, season_id, farm_id, plot_id, harvest_id, warehouse_id, location_id,
     harvested_at, received_at, unit, initial_quantity, on_hand_quantity, grade, quality_status, traceability_data, note, status,
     created_by, created_at, updated_at)
VALUES
    (1, 'LOT-SOYBEAN-2025-03-01', 1001, 'Đậu nành AGS398', 'Loại A', 3, 1, 1, 8, 2, NULL,
     '2025-03-02', '2025-03-02 18:00:00', 'kg', 260.000, 210.000, 'A', 'FRESH',
     '{"harvestTaskId":7,"route":"plot-1->output-warehouse-2"}', 'Lô hàng đầu mùa vụ đậu nành xuân 2025', 'IN_STOCK',
     2, '2025-03-02 18:00:00', '2025-03-05 09:00:00'),
    (2, 'LOT-PADDYRICE-2025-02-01', 2001, 'Lúa nước OM5451', 'Lúa nước khô tiêu chuẩn', 4, 1, 2, 9, 2, NULL,
     '2025-02-28', '2025-02-28 18:00:00', 'kg', 900.000, 780.000, 'A', 'DRY',
     '{"harvestTaskId":12,"route":"plot-2->output-warehouse-2"}', 'Lô lúa nước đợt sớm vụ đông xuân', 'IN_STOCK',
     2, '2025-02-28 18:00:00', '2025-03-03 09:00:00'),
    (3, 'LOT-PEANUT-2025-02-01', 3001, 'Lạc', 'Loại tươi', 5, 2, 7, 10, 3, NULL,
     '2025-02-08', '2025-02-08 12:00:00', 'kg', 180.000, 150.000, 'B', 'FRESH',
     '{"harvestTaskId":15,"route":"plot-7->warehouse-3"}', 'Lô lạc phục vụ chợ đầu mối', 'IN_STOCK',
     2, '2025-02-08 12:00:00', '2025-02-10 09:00:00');

INSERT INTO product_warehouse_transactions
    (id, lot_id, transaction_type, quantity, unit, resulting_on_hand, reference_type, reference_id, note, created_by, created_at)
VALUES
    (1, 1, 'RECEIPT_FROM_HARVEST', 260.000, 'kg', 260.000, 'HARVEST', '8', 'Nhập kho thành phẩm từ thu hoạch', 2, '2025-03-02 18:05:00'),
    (2, 1, 'STOCK_OUT', 50.000, 'kg', 210.000, 'ORDER', 'SO-2025-001', 'Xuất bán cho đại lý khu vực', 2, '2025-03-05 09:00:00'),
    (3, 2, 'RECEIPT_FROM_HARVEST', 900.000, 'kg', 900.000, 'HARVEST', '9', 'Nhập kho lúa nước đợt 1', 2, '2025-02-28 18:05:00'),
    (4, 2, 'STOCK_OUT', 120.000, 'kg', 780.000, 'ORDER', 'SO-2025-002', 'Xuất giao thương lái', 2, '2025-03-03 09:00:00'),
    (5, 3, 'RECEIPT_FROM_HARVEST', 180.000, 'kg', 180.000, 'HARVEST', '10', 'Nhập kho lạc', 2, '2025-02-08 12:10:00'),
    (6, 3, 'ADJUSTMENT', -30.000, 'kg', 150.000, 'INVENTORY_CHECK', 'ADJ-2025-001', 'Điều chỉnh hao hụt sau phân loại', 2, '2025-02-10 09:00:00');

-- =========================================================
-- =========================================================
-- 31. 2026-2027 CROSS-PORTAL SCENARIOS (PAST/CURRENT/FUTURE)
-- =========================================================
SET @admin_user_id := COALESCE((SELECT user_id FROM users WHERE user_name = 'admin' LIMIT 1), 1);
SET @farmer_user_id := COALESCE((SELECT user_id FROM users WHERE user_name = 'farmer' LIMIT 1), 2);

INSERT INTO roles (role_code, role_name, description)
SELECT 'EMPLOYEE', 'Employee', 'Employee role for labor portal'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_code = 'EMPLOYEE');

INSERT INTO users (user_name, email, phone, full_name, password_hash, status, province_id, ward_id, joined_date)
SELECT
    'employee',
    'employee@acm.local',
    '0902234567',
    'Nguyen Van Employee',
    COALESCE((SELECT password_hash FROM users WHERE user_name = 'farmer' LIMIT 1), '$2a$10$7EqJtq98hPqEX7fNZaFWoO/8xQWfhKGXT5VqC7EIgA6GrCVuVi//.'),
    'ACTIVE',
    24,
    25112,
    '2025-11-01 08:00:00'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_name = 'employee');

INSERT INTO users (user_name, email, phone, full_name, password_hash, status, province_id, ward_id, joined_date)
SELECT
    'employee2',
    'employee2@acm.local',
    '0903234567',
    'Tran Thi Employee',
    COALESCE((SELECT password_hash FROM users WHERE user_name = 'farmer' LIMIT 1), '$2a$10$7EqJtq98hPqEX7fNZaFWoO/8xQWfhKGXT5VqC7EIgA6GrCVuVi//.'),
    'ACTIVE',
    24,
    25112,
    '2026-01-10 08:00:00'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_name = 'employee2');

SET @employee_user_id := COALESCE((SELECT user_id FROM users WHERE user_name = 'employee' LIMIT 1), @farmer_user_id);
SET @employee2_user_id := COALESCE((SELECT user_id FROM users WHERE user_name = 'employee2' LIMIT 1), @employee_user_id);

INSERT INTO user_roles (user_id, role_id)
SELECT @employee_user_id, r.role_id
FROM roles r
WHERE r.role_code = 'EMPLOYEE'
AND NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = @employee_user_id AND ur.role_id = r.role_id
);

INSERT INTO user_roles (user_id, role_id)
SELECT @employee2_user_id, r.role_id
FROM roles r
WHERE r.role_code = 'EMPLOYEE'
AND NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = @employee2_user_id AND ur.role_id = r.role_id
);

INSERT INTO seasons (season_id, season_name, plot_id, crop_id, variety_id, start_date, planned_harvest_date, end_date, status, initial_plant_count, current_plant_count, expected_yield_kg, actual_yield_kg, budget_amount, notes, created_at)
VALUES
    (10, 'Vụ Đậu đen Tết 2026', 6, 4, 6, '2025-11-20', '2026-02-10', '2026-02-15', 'COMPLETED', 900, 860, 2100.00, 2050.00, 11500000.00, 'Hoàn tất sát hiện tại, dữ liệu review sau thu hoạch', '2025-11-20 08:00:00'),
    (11, 'Vụ Đậu nành Hè 2026', 1, 2, 4, '2026-02-15', '2026-05-20', NULL, 'ACTIVE', 1400, 1320, 1200.00, NULL, 8200000.00, 'Mùa vụ hiện tại cho dashboard và employee tasks', '2026-02-15 08:00:00'),
    (12, 'Vụ Lúa nước Thu Đông 2026', 2, 1, 2, '2026-09-01', '2026-12-15', NULL, 'PLANNED', 6200, NULL, 3600.00, NULL, 19500000.00, 'Mùa vụ tương lai để test planning flow', '2026-03-18 08:00:00'),
    (13, 'Vụ Ngô Xuân 2027', 6, 5, 7, '2027-01-10', '2027-04-15', NULL, 'PLANNED', 1600, NULL, 700.00, NULL, 5200000.00, 'Mốc tương lai xa để test filter date range', '2026-03-18 09:00:00');

INSERT INTO tasks (task_id, user_id, season_id, title, description, planned_date, due_date, status, actual_start_date, actual_end_date, notes, created_at)
VALUES
    (17, @employee_user_id, 11, 'Làm đất lô A1 hè 2026', 'Xới đất, bổ sung hữu cơ trước khi cấy', '2026-02-20', '2026-02-22', 'DONE', '2026-02-20', '2026-02-21', 'Nhân viên chính hoàn thành đúng hạn', '2026-02-19 08:00:00'),
    (18, @employee_user_id, 11, 'Bón phân đợt 1', 'Bón NPK và hữu cơ vi sinh', '2026-03-15', '2026-03-20', 'IN_PROGRESS', '2026-03-15', NULL, 'Đang thực hiện 70%', '2026-03-14 08:00:00'),
    (19, @employee2_user_id, 11, 'Phun phòng bệnh lá', 'Phòng sương mai theo lịch', '2026-03-18', '2026-03-25', 'PENDING', NULL, NULL, 'Chờ vật tư về kho', '2026-03-17 08:00:00'),
    (20, @employee2_user_id, 11, 'Kiểm tra hệ thống tưới', 'Bảo trì đường ống và đầu tưới', '2026-03-01', '2026-03-05', 'OVERDUE', NULL, NULL, 'Trễ do thiếu nhân lực', '2026-02-28 08:00:00'),
    (21, @employee_user_id, 11, 'Bảo trì nhà lưới', 'Gia cố khung và lưới che', '2026-03-08', '2026-03-10', 'CANCELLED', NULL, NULL, 'Tạm dừng do ưu tiên phun bệnh', '2026-03-07 08:00:00'),
    (22, @employee_user_id, 10, 'Thu hoạch đậu đen đợt cuối', 'Thu hoạch và phân loại tại ruộng', '2026-02-12', '2026-02-14', 'DONE', '2026-02-12', '2026-02-14', 'Hoàn tất 100%', '2026-02-11 08:00:00'),
    (23, @employee_user_id, 12, 'Gieo mạ lúa nước thu đông', 'Chuẩn bị mạ cho mùa vụ 2026', '2026-09-02', '2026-09-04', 'PENDING', NULL, NULL, 'Task tương lai cho planner', '2026-03-18 10:00:00'),
    (24, @employee2_user_id, 13, 'Ươm giống ngô xuân 2027', 'Ươm giống trong nhà màng', '2027-01-12', '2027-01-15', 'PENDING', NULL, NULL, 'Task tương lai xa', '2026-03-18 10:10:00'),
    (25, @employee_user_id, 10, 'Đóng gói đậu đen loại A', 'Đóng gói cho kênh siêu thị', '2026-02-14', '2026-02-15', 'DONE', '2026-02-14', '2026-02-15', 'Hoàn tất đúng chất lượng', '2026-02-14 13:00:00'),
    (26, @employee_user_id, 11, 'Thu hoạch sớm lô đậu nành', 'Thu đợt thử nghiệm cho kênh online', '2026-04-02', '2026-04-04', 'PENDING', NULL, NULL, 'Chờ đến kỳ thu hoạch', '2026-03-18 10:20:00');

INSERT INTO expenses (expense_id, user_id, season_id, task_id, category, item_name, unit_price, quantity, total_cost, amount, payment_status, note, expense_date, created_at)
VALUES
    (17, @farmer_user_id, 10, 22, 'LABOR', 'Nhân công thu hoạch đậu đen', 280000.00, 4, 1120000.00, 1120000.00, 'PAID', 'Thanh toán theo ngày công', '2026-02-12', '2026-02-12 18:00:00'),
    (18, @farmer_user_id, 10, 25, 'EQUIPMENT', 'Thùng đóng gói và tem truy xuất', 18000.00, 120, 2160000.00, 2160000.00, 'PAID', 'Đóng gói loại A', '2026-02-14', '2026-02-14 19:00:00'),
    (19, @farmer_user_id, 11, 17, 'FERTILIZER', 'Phân hữu cơ vi sinh', 90000.00, 25, 2250000.00, 2250000.00, 'PAID', 'Bổ sung đất nền', '2026-02-21', '2026-02-21 16:00:00'),
    (20, @farmer_user_id, 11, 18, 'FERTILIZER', 'NPK 20-20-15', 62000.00, 20, 1240000.00, 1240000.00, 'PENDING', 'Đợt bón thúc đang triển khai', '2026-03-16', '2026-03-16 17:00:00'),
    (21, @farmer_user_id, 11, 19, 'PESTICIDE', 'Thuốc phòng sương mai', 145000.00, 6, 870000.00, 870000.00, 'UNPAID', 'Đặt hàng chưa thanh toán', '2026-03-18', '2026-03-18 15:00:00'),
    (22, @farmer_user_id, 11, 20, 'OTHER', 'Sửa đường ống tưới', 320000.00, 2, 640000.00, 640000.00, 'PENDING', 'Delay do overtime crew', '2026-03-04', '2026-03-04 16:00:00'),
    (23, @farmer_user_id, 12, 23, 'SEEDS', 'Giống lúa nước OM5451 cho vụ 2026', 34000.00, 80, 2720000.00, 2720000.00, 'PENDING', 'Đặt cọc cho mùa vụ tương lai', '2026-08-25', '2026-03-18 15:10:00');

INSERT INTO harvests (harvest_id, season_id, harvest_date, quantity, unit, grade, note, created_at)
VALUES
    (11, 10, '2026-02-08', 1100.00, 12500.00, 'A', 'Thu hoạch đậu đen đợt 1', '2026-02-08 16:00:00'),
    (12, 10, '2026-02-14', 950.00, 13000.00, 'A', 'Thu hoạch đậu đen đợt cuối', '2026-02-14 16:30:00'),
    (13, 11, '2026-03-10', 280.00, 22000.00, 'A', 'Thu sớm đậu nành cho kênh online', '2026-03-10 11:00:00'),
    (14, 11, '2026-03-17', 190.00, 21500.00, 'B', 'Thu đợt tiếp theo để test doanh thu', '2026-03-17 11:00:00');

INSERT INTO field_logs (field_log_id, season_id, log_date, log_type, notes, created_at)
VALUES
    (11, 10, '2026-02-12', 'HARVEST', 'Đã thu hoạch 100% và đóng gói tại ruộng', '2026-02-12 17:30:00'),
    (12, 11, '2026-03-16', 'FERTILIZE', 'Đợt bón phân 1 đang triển khai theo plan', '2026-03-16 16:10:00'),
    (13, 11, '2026-03-18', 'PEST', 'Ghi nhận vết bệnh lá mức độ nhẹ', '2026-03-18 10:00:00'),
    (14, 12, '2026-08-30', 'OTHER', 'Pre-check đất và kế hoạch nhân công cho vụ mới', '2026-03-18 10:30:00');

INSERT INTO incidents (id, season_id, reported_by, incident_type, severity, status, description, deadline, resolved_at, created_at)
VALUES
    (7, 11, @farmer_user_id, 'DISEASE', 'HIGH', 'OPEN', 'Đốm lá xuất hiện trên đậu nành lô A1', '2026-03-28', NULL, '2026-03-18 08:30:00'),
    (8, 11, @farmer_user_id, 'PEST', 'MEDIUM', 'IN_PROGRESS', 'Sâu xanh gây hại cục bộ', '2026-03-30', NULL, '2026-03-17 09:00:00'),
    (9, 10, @farmer_user_id, 'WEATHER', 'LOW', 'RESOLVED', 'Mưa trái mùa lúc cận thu', '2026-02-13', '2026-02-13 18:00:00', '2026-02-12 11:00:00'),
    (10, 12, @farmer_user_id, 'OTHER', 'LOW', 'OPEN', 'Cảnh báo nguy cơ thiếu nhân công mùa cao điểm', '2026-09-15', NULL, '2026-03-18 09:15:00');

INSERT INTO alerts (id, type, severity, status, farm_id, season_id, plot_id, crop_id, title, message, suggested_action_type, suggested_action_url, recipient_farmer_ids, created_at, sent_at)
VALUES
    (8, 'INCIDENT_OPEN', 'HIGH', 'NEW', 1, 11, 1, 2, 'Incident mới trên vụ đậu nành hè 2026', 'Đốm lá cần xử lý trong 48h', 'VIEW_INCIDENT', '/incidents/7', '2', '2026-03-18 08:35:00', NULL),
    (9, 'TASK_OVERDUE', 'MEDIUM', 'SENT', 1, 11, 1, 2, 'Task quá hạn hệ thống tưới', 'Task #20 đang quá hạn', 'VIEW_TASK', '/tasks/20', '2', '2026-03-18 09:00:00', '2026-03-18 09:02:00'),
    (10, 'BUDGET_OVERSPEND', 'MEDIUM', 'ACKNOWLEDGED', 1, 11, 1, 2, 'Chi phí đợt 1 vượt dự kiến', 'Chi phí NPK và nhân công cao hơn 12%', 'VIEW_EXPENSES', '/expenses?seasonId=11', '2', '2026-03-18 09:10:00', '2026-03-18 09:11:00'),
    (11, 'INVENTORY_EXPIRING', 'LOW', 'NEW', 1, NULL, NULL, NULL, 'Lô BT-2025-001 sắp hết hạn', 'Cần ưu tiên sử dụng trước 2026-04-15', 'VIEW_INVENTORY', '/inventory', '2', '2026-03-18 09:20:00', NULL),
    (12, 'TASK_OVERDUE', 'LOW', 'RESOLVED', 2, 10, 6, 4, 'Task đóng gói đã hoàn tất', 'Task #25 đã hoàn tất và đóng lương', NULL, NULL, '2', '2026-02-15 18:00:00', '2026-02-15 18:05:00');

INSERT INTO notifications (id, user_id, title, message, link, alert_id, created_at, read_at)
VALUES
    (8, @farmer_user_id, 'Incident mới cần xử lý', 'Vụ đậu nành hè 2026 có incident đốm lá', '/incidents/7', 8, '2026-03-18 08:36:00', NULL),
    (9, @farmer_user_id, 'Task quá hạn hệ thống tưới', 'Nhân viên chưa xử lý task #20', '/tasks/20', 9, '2026-03-18 09:03:00', NULL),
    (10, @employee_user_id, 'Bạn được giao task mới', 'Task #19 và #26 đã được cấp cho đội', '/employee/tasks', NULL, '2026-03-18 09:05:00', NULL),
    (11, @employee2_user_id, 'Task quá hạn cần cập nhật', 'Vui lòng báo cáo tiến độ task #20', '/employee/progress', NULL, '2026-03-18 09:06:00', NULL),
    (12, @farmer_user_id, 'Cảnh báo vật tư sắp hết hạn', 'Lô BT-2025-001 cần được ưu tiên sử dụng', '/inventory', 11, '2026-03-18 09:21:00', NULL);

INSERT INTO document_favorites (id, user_id, document_id, created_at)
VALUES
    (4, @farmer_user_id, 2, '2026-03-18 08:40:00'),
    (5, @employee_user_id, 7, '2026-03-18 08:45:00');

INSERT INTO document_recent_opens (id, user_id, document_id, opened_at)
VALUES
    (6, @farmer_user_id, 6, '2026-03-18 08:50:00'),
    (7, @employee_user_id, 7, '2026-03-18 08:55:00'),
    (8, @employee2_user_id, 5, '2026-03-18 09:00:00');

INSERT INTO user_preferences (id, user_id, currency_code, weight_unit, locale, created_at, updated_at)
VALUES
    (2, @employee_user_id, 'VND', 'KG', 'vi-VN', '2026-03-18 08:00:00', '2026-03-18 08:00:00'),
    (3, @employee2_user_id, 'USD', 'KG', 'en-US', '2026-03-18 08:00:00', '2026-03-18 08:00:00');

INSERT INTO season_employees (id, season_id, employee_user_id, added_by_user_id, wage_per_task, active, created_at)
VALUES
    (4, 11, @employee_user_id, @farmer_user_id, 210000.00, b'1', '2026-02-20 09:00:00'),
    (5, 11, @employee2_user_id, @farmer_user_id, 195000.00, b'1', '2026-02-20 09:05:00'),
    (6, 12, @employee_user_id, @farmer_user_id, 230000.00, b'1', '2026-03-18 09:30:00'),
    (7, 12, @employee2_user_id, @farmer_user_id, 180000.00, b'0', '2026-03-18 09:35:00');

INSERT INTO task_progress_logs (id, task_id, employee_user_id, progress_percent, note, evidence_url, logged_at)
VALUES
    (4, 18, @employee_user_id, 40, 'Đã bón 40% diện tích', 'https://example.com/evidence/task-18-p40.jpg', '2026-03-16 11:00:00'),
    (5, 18, @employee_user_id, 75, 'Cập nhật tiến độ sau bổ sung nhân lực', 'https://example.com/evidence/task-18-p75.jpg', '2026-03-18 14:30:00'),
    (6, 20, @employee2_user_id, 15, 'Đã kiểm tra một phần đường ống', 'https://example.com/evidence/task-20-p15.jpg', '2026-03-06 16:00:00'),
    (7, 17, @employee_user_id, 100, 'Hoàn tất làm đất', 'https://example.com/evidence/task-17-done.jpg', '2026-02-21 17:30:00'),
    (8, 22, @employee_user_id, 100, 'Thu hoạch và bàn giao đầy đủ', 'https://example.com/evidence/task-22-done.jpg', '2026-02-14 18:30:00');

INSERT INTO payroll_records
    (id, employee_user_id, season_id, period_start, period_end, total_assigned_tasks, total_completed_tasks, wage_per_task, total_amount, generated_at, note)
VALUES
    (4, @employee_user_id, 11, '2026-03-01', '2026-03-31', 5, 2, 210000.00, 420000.00, '2026-04-01 08:00:00', 'Lương tạm tính theo tiến độ tháng 03/2026'),
    (5, @employee2_user_id, 11, '2026-03-01', '2026-03-31', 3, 0, 195000.00, 0.00, '2026-04-01 08:05:00', 'Nhân viên 2 chưa hoàn tất task nào trong tháng'),
    (6, @employee_user_id, 10, '2026-02-01', '2026-02-28', 2, 2, 200000.00, 400000.00, '2026-03-01 08:00:00', 'Lương chốt cho vụ đậu đen đã hoàn tất');

INSERT INTO product_warehouse_lots
    (id, lot_code, product_id, product_name, product_variant, season_id, farm_id, plot_id, harvest_id, warehouse_id, location_id,
     harvested_at, received_at, unit, initial_quantity, on_hand_quantity, grade, quality_status, traceability_data, note, status,
     created_by, created_at, updated_at)
VALUES
    (4, 'LOT-BLACKBEAN-2026-02', 4001, 'Đậu đen xanh lòng', 'Loại A', 10, 2, 6, 11, 2, NULL,
     '2026-02-08', '2026-02-08 18:00:00', 'kg', 2050.000, 1930.000, 'A', 'FRESH',
     '{"harvestTaskId":22,"route":"plot-6->warehouse-2"}', 'Lô đậu đen vừa kết thúc mùa vụ tết 2026', 'IN_STOCK',
     @farmer_user_id, '2026-02-08 18:00:00', '2026-03-18 09:40:00'),
    (5, 'LOT-SOYBEAN-2026-03', 1002, 'Đậu nành AGS398', 'Loại A/B', 11, 1, 1, 13, 2, NULL,
     '2026-03-10', '2026-03-10 18:30:00', 'kg', 470.000, 310.000, 'A', 'FRESH',
     '{"harvestTaskId":26,"route":"plot-1->warehouse-2"}', 'Lô đậu nành của mùa vụ hiện tại 2026', 'IN_STOCK',
     @farmer_user_id, '2026-03-10 18:30:00', '2026-03-18 09:45:00');

INSERT INTO product_warehouse_transactions
    (id, lot_id, transaction_type, quantity, unit, resulting_on_hand, reference_type, reference_id, note, created_by, created_at)
VALUES
    (7, 4, 'RECEIPT_FROM_HARVEST', 1100.000, 'kg', 1100.000, 'HARVEST', '11', 'Nhập kho đậu đen đợt 1', @farmer_user_id, '2026-02-08 18:05:00'),
    (8, 4, 'RECEIPT_FROM_HARVEST', 950.000, 'kg', 2050.000, 'HARVEST', '12', 'Nhập kho đậu đen đợt 2', @farmer_user_id, '2026-02-14 18:05:00'),
    (9, 4, 'STOCK_OUT', 120.000, 'kg', 1930.000, 'ORDER', 'SO-2026-015', 'Xuất cho kênh siêu thị', @farmer_user_id, '2026-03-01 09:00:00'),
    (10, 5, 'RECEIPT_FROM_HARVEST', 470.000, 'kg', 470.000, 'HARVEST', '13', 'Nhập kho đậu nành thu sớm', @farmer_user_id, '2026-03-10 18:35:00'),
    (11, 5, 'STOCK_OUT', 160.000, 'kg', 310.000, 'ORDER', 'SO-2026-018', 'Xuất đơn online và đại lý', @farmer_user_id, '2026-03-18 09:35:00');

-- =========================================================
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- KIỂM TRA KẾT QUẢ
-- =========================================================
SELECT '=== KẾT QUẢ INSERT DỮ LIỆU MẪU ĐẦY ĐỦ ===' AS '';
SELECT CONCAT('Crops: ', COUNT(*)) AS result FROM crops;
SELECT CONCAT('Varieties: ', COUNT(*)) AS result FROM varieties;
SELECT CONCAT('Farms: ', COUNT(*)) AS result FROM farms;
SELECT CONCAT('Plots: ', COUNT(*)) AS result FROM plots;
SELECT CONCAT('Seasons: ', COUNT(*)) AS result FROM seasons;
SELECT CONCAT('Tasks: ', COUNT(*)) AS result FROM tasks;
SELECT CONCAT('Expenses: ', COUNT(*)) AS result FROM expenses;
SELECT CONCAT('Harvests: ', COUNT(*)) AS result FROM harvests;
SELECT CONCAT('Suppliers: ', COUNT(*)) AS result FROM suppliers;
SELECT CONCAT('Supply Items: ', COUNT(*)) AS result FROM supply_items;
SELECT CONCAT('Supply Lots: ', COUNT(*)) AS result FROM supply_lots;
SELECT CONCAT('Warehouses: ', COUNT(*)) AS result FROM warehouses;
SELECT CONCAT('Stock Movements: ', COUNT(*)) AS result FROM stock_movements;
SELECT CONCAT('Field Logs: ', COUNT(*)) AS result FROM field_logs;
SELECT CONCAT('Incidents: ', COUNT(*)) AS result FROM incidents;
SELECT CONCAT('Alerts: ', COUNT(*)) AS result FROM alerts;
SELECT CONCAT('Crop Nitrogen References: ', COUNT(*)) AS result FROM crop_nitrogen_references;
SELECT CONCAT('Nutrient Input Events: ', COUNT(*)) AS result FROM nutrient_input_events;
SELECT CONCAT('Irrigation Water Analyses: ', COUNT(*)) AS result FROM irrigation_water_analyses;
SELECT CONCAT('Soil Tests: ', COUNT(*)) AS result FROM soil_tests;
SELECT CONCAT('Season Employees: ', COUNT(*)) AS result FROM season_employees;
SELECT CONCAT('Task Progress Logs: ', COUNT(*)) AS result FROM task_progress_logs;
SELECT CONCAT('Payroll Records: ', COUNT(*)) AS result FROM payroll_records;
SELECT CONCAT('Product Warehouse Lots: ', COUNT(*)) AS result FROM product_warehouse_lots;
SELECT CONCAT('Product Warehouse Transactions: ', COUNT(*)) AS result FROM product_warehouse_transactions;

