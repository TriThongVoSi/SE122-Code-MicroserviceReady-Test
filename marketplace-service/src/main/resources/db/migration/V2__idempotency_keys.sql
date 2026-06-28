-- Create idempotency_keys table for preventing duplicate order processing
CREATE TABLE IF NOT EXISTS `idempotency_keys` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key_value` VARCHAR(100) NOT NULL,
    `endpoint` VARCHAR(255) NOT NULL,
    `response_body` TEXT NULL,
    `response_status` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` DATETIME NOT NULL,
    
    CONSTRAINT `uk_idempotency_key` UNIQUE (`key_value`),
    INDEX `idx_idempotency_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
