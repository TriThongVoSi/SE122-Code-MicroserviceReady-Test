-- Create outbox_events table for reliable event publishing
CREATE TABLE IF NOT EXISTS `outbox_events` (
    `id` VARCHAR(36) PRIMARY KEY,
    `aggregate_type` VARCHAR(100) NOT NULL,
    `aggregate_id` VARCHAR(100) NOT NULL,
    `event_type` VARCHAR(100) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `processed` BOOLEAN NOT NULL DEFAULT FALSE,
    
    INDEX `idx_outbox_processed` (`processed`),
    INDEX `idx_outbox_created_at` (`created_at`),
    INDEX `idx_outbox_aggregate` (`aggregate_type`, `aggregate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
