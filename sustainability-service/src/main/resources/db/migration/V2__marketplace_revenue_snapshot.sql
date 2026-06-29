-- V2__marketplace_revenue_snapshot.sql
-- Event-driven marketplace revenue tracking per season.
-- Eliminates cross-schema query to marketplace_db.marketplace_order_items.
-- Populated by consuming MarketplaceOrderCompletedEvent from marketplace-service.

CREATE TABLE IF NOT EXISTS marketplace_order_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    season_id INT NOT NULL,
    order_id BIGINT NOT NULL,
    farmer_user_id BIGINT NOT NULL,
    revenue DECIMAL(19,2) NOT NULL DEFAULT 0,
    completed_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_order_season (order_id, season_id),
    INDEX idx_season_id (season_id),
    INDEX idx_farmer_user_id (farmer_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: marketplace-service should be updated to include season_id and revenue in
-- MarketplaceOrderCompletedEvent payload for automatic population.
-- For now, manual backfill via the event handler when orders complete.
