CREATE TABLE IF NOT EXISTS crops (
    crop_id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(255) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS varieties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    CONSTRAINT fk_varieties_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crop_nitrogen_references (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NOT NULL,
    n_content_kg_per_kg_yield DECIMAL(12,6) NOT NULL,
    source_reference VARCHAR(255) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_crop_n_ref_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Crops
INSERT INTO crops (crop_id, crop_name, description) VALUES
(1, 'Lúa nước', 'Cây lương thực chính của Việt Nam'),
(2, 'Đậu nành', 'Cây họ đậu giàu đạm, dùng làm thực phẩm và thức ăn chăn nuôi'),
(3, 'Lạc', 'Cây họ đậu lấy củ, thích hợp vụ khô'),
(4, 'Đậu đen', 'Cây họ đậu ngắn ngày, chịu hạn khá'),
(5, 'Ngô', 'Cây lương thực lấy hạt, sinh trưởng mạnh'),
(6, 'Ớt', 'Cây gia vị ngắn ngày, nhạy cảm với úng và nấm bệnh trong mùa mưa'),
(7, 'Khoai tây', 'Cây lấy củ, phù hợp vụ đông để cải tạo cấu trúc đất');

-- Seed Varieties
INSERT INTO varieties (id, crop_id, name, description) VALUES
(1, 1, 'Đài Thơm 8', 'Giống lúa nước thơm đặc sản, đạt giải gạo ngon nhất thế giới'),
(2, 1, 'OM5451', 'Giống lúa nước năng suất cao'),
(3, 2, 'Đậu nành DT84', 'Giống đậu nành phổ thông, thích hợp vụ xuân hè'),
(4, 2, 'Đậu nành AGS398', 'Giống đậu nành năng suất cao, hạt to đồng đều'),
(5, 3, 'Lạc L14', 'Giống trồng từ hạt'),
(6, 4, 'Đậu đen xanh lòng', 'Giống đậu đen hạt chắc, chất lượng ổn định'),
(7, 5, 'Ngô lai NK7328', 'Giống ngô lai cho năng suất cao, chống chịu tốt'),
(8, 6, 'Ớt chỉ thiên F1', 'Giống ớt cay, thu hoạch nhiều đợt'),
(9, 7, 'Khoai tây Atlantic', 'Giống khoai tây vụ đông, củ đồng đều');

-- Seed Crop Nitrogen References
INSERT INTO crop_nitrogen_references (id, crop_id, n_content_kg_per_kg_yield, source_reference, active, created_at, updated_at) VALUES
(1, 1, 0.013500, 'VN-PADDYRICE-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(2, 2, 0.018000, 'VN-SOYBEAN-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(3, 3, 0.028000, 'VN-PEANUT-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(4, 4, 0.012000, 'VN-BLACKBEAN-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(5, 5, 0.020000, 'VN-CORN-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(6, 6, 0.022000, 'VN-CHILI-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(7, 7, 0.004500, 'VN-POTATO-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00');
