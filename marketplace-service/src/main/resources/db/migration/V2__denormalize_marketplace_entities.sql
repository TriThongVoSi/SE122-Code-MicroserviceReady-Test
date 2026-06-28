-- Denormalize marketplace entities: replace JPA joins with ID + snapshot fields
-- for cross-service ownership migration.

-- marketplace_products: add snapshot fields from User, Farm, Season, Lot
ALTER TABLE marketplace_products
    ADD COLUMN farmer_display_name VARCHAR(255) NULL AFTER farmer_user_id,
    ADD COLUMN farm_name VARCHAR(255) NULL AFTER farm_id,
    ADD COLUMN farm_region VARCHAR(255) NULL AFTER farm_name,
    ADD COLUMN season_name VARCHAR(255) NULL AFTER season_id,
    ADD COLUMN lot_code VARCHAR(120) NULL AFTER lot_id,
    ADD COLUMN catalog_snapshot JSON NULL AFTER lot_code,
    ADD COLUMN status_reason VARCHAR(500) NULL AFTER status,
    ADD COLUMN status_changed_at TIMESTAMP NULL AFTER status_reason,
    ADD COLUMN status_changed_by_user_id BIGINT NULL AFTER status_changed_at;

CREATE INDEX idx_marketplace_products_farm_id
    ON marketplace_products(farm_id);
CREATE INDEX idx_marketplace_products_season_id
    ON marketplace_products(season_id);
CREATE INDEX idx_marketplace_products_lot_id
    ON marketplace_products(lot_id);
CREATE INDEX idx_marketplace_products_status_changed_at
    ON marketplace_products(status_changed_at);

-- marketplace_order_items: add traceability snapshots
ALTER TABLE marketplace_order_items
    ADD COLUMN farm_name VARCHAR(255) NULL AFTER farm_id,
    ADD COLUMN season_name VARCHAR(255) NULL AFTER season_id,
    ADD COLUMN lot_code VARCHAR(120) NULL AFTER lot_id,
    ADD COLUMN crop_name VARCHAR(255) NULL AFTER lot_code;

CREATE INDEX idx_marketplace_order_items_farm_id
    ON marketplace_order_items(farm_id);
CREATE INDEX idx_marketplace_order_items_season_id
    ON marketplace_order_items(season_id);
CREATE INDEX idx_marketplace_order_items_lot_id
    ON marketplace_order_items(lot_id);

-- marketplace_cart_items: denormalize product and farmer snapshots
ALTER TABLE marketplace_cart_items
    ADD COLUMN farmer_user_id BIGINT NOT NULL AFTER product_id,
    ADD COLUMN product_name VARCHAR(255) NULL AFTER farmer_user_id,
    ADD COLUMN product_slug VARCHAR(191) NULL AFTER product_name,
    ADD COLUMN image_url VARCHAR(1024) NULL AFTER product_slug,
    ADD COLUMN traceable BOOLEAN NOT NULL DEFAULT TRUE AFTER image_url,
    MODIFY COLUMN quantity DECIMAL(19,3) NOT NULL,
    MODIFY COLUMN unit_price_snapshot DECIMAL(19,2) NOT NULL;

CREATE INDEX idx_marketplace_cart_items_product_id
    ON marketplace_cart_items(product_id);

-- marketplace_product_reviews: add buyer display name and moderation metadata
ALTER TABLE marketplace_product_reviews
    ADD COLUMN buyer_display_name VARCHAR(255) NULL AFTER buyer_user_id,
    ADD COLUMN hidden_reason VARCHAR(500) NULL AFTER hidden,
    ADD COLUMN hidden_at TIMESTAMP NULL AFTER hidden_reason,
    ADD COLUMN hidden_by_user_id BIGINT NULL AFTER hidden_at,
    MODIFY COLUMN rating INT NOT NULL;
