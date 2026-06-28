-- Create inventory_reservations table for marketplace order stock reservation
CREATE TABLE IF NOT EXISTS `inventory_reservations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `idempotency_key` VARCHAR(100) NOT NULL,
    `order_id` BIGINT NOT NULL,
    `order_item_id` BIGINT NULL,
    `lot_id` INT NOT NULL,
    `lot_code` VARCHAR(100) NOT NULL,
    `quantity` DECIMAL(19,3) NOT NULL,
    `unit` VARCHAR(30) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'RESERVED',
    `expires_at` DATETIME NULL,
    `confirmed_at` DATETIME NULL,
    `released_at` DATETIME NULL,
    `reason` TEXT NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT `uk_reservation_idempotency_key` UNIQUE (`idempotency_key`),
    CONSTRAINT `uk_reservation_order` UNIQUE (`order_id`, `order_item_id`),
    
    INDEX `idx_reservation_lot_id` (`lot_id`),
    INDEX `idx_reservation_status` (`status`),
    INDEX `idx_reservation_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
