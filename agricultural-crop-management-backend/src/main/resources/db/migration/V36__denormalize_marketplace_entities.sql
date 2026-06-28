-- Denormalize marketplace entities: replace JPA joins with ID + snapshot fields
-- for cross-service ownership preparation.
-- This migration adds snapshot columns to existing tables.

-- marketplace_products: add snapshot fields
ALTER TABLE marketplace_products
    ADD COLUMN farmer_display_name VARCHAR(255) NULL AFTER farmer_user_id,
    ADD COLUMN farm_name VARCHAR(255) NULL AFTER farm_id,
    ADD COLUMN farm_region VARCHAR(255) NULL AFTER farm_name,
    ADD COLUMN season_name VARCHAR(255) NULL AFTER season_id,
    ADD COLUMN lot_code VARCHAR(120) NULL AFTER lot_id,
    ADD COLUMN catalog_snapshot TEXT NULL AFTER lot_code;

CREATE INDEX idx_marketplace_products_farm_id
    ON marketplace_products(farm_id);
CREATE INDEX idx_marketplace_products_season_id
    ON marketplace_products(season_id);
CREATE INDEX idx_marketplace_products_lot_id
    ON marketplace_products(lot_id);

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

-- marketplace_cart_items: add farmer snapshots
ALTER TABLE marketplace_cart_items
    ADD COLUMN farmer_user_id BIGINT NULL AFTER product_id,
    ADD COLUMN product_name VARCHAR(255) NULL AFTER farmer_user_id,
    ADD COLUMN product_slug VARCHAR(191) NULL AFTER product_name,
    ADD COLUMN image_url VARCHAR(1024) NULL AFTER product_slug,
    ADD COLUMN traceable BOOLEAN NULL DEFAULT TRUE AFTER image_url;

CREATE INDEX idx_marketplace_cart_items_product_id
    ON marketplace_cart_items(product_id);

-- marketplace_product_reviews: add buyer display name and moderation metadata
ALTER TABLE marketplace_product_reviews
    ADD COLUMN buyer_display_name VARCHAR(255) NULL AFTER buyer_user_id,
    ADD COLUMN hidden_reason VARCHAR(500) NULL AFTER hidden,
    ADD COLUMN hidden_at TIMESTAMP NULL AFTER hidden_reason,
    ADD COLUMN hidden_by_user_id BIGINT NULL AFTER hidden_at;

-- Remove JPA foreign key constraints that reference external services
-- These constraints will no longer be enforced at DB level
-- Application-level consistency should be maintained through snapshot fields

-- Drop FK: marketplace_products -> users (farmer_user_id is kept but no longer constrained)
ALTER TABLE marketplace_products
    DROP FOREIGN KEY fk_marketplace_products_farmer_user;

-- Drop FK: marketplace_products -> farms
ALTER TABLE marketplace_products
    DROP FOREIGN KEY fk_marketplace_products_farm;

-- Drop FK: marketplace_products -> seasons
ALTER TABLE marketplace_products
    DROP FOREIGN KEY fk_marketplace_products_season;

-- Drop FK: marketplace_products -> product_warehouse_lots
ALTER TABLE marketplace_products
    DROP FOREIGN KEY fk_marketplace_products_lot;

-- Drop FK: marketplace_order_groups -> users
ALTER TABLE marketplace_order_groups
    DROP FOREIGN KEY fk_marketplace_order_groups_buyer_user;

-- Drop FK: marketplace_orders -> marketplace_order_groups
ALTER TABLE marketplace_orders
    DROP FOREIGN KEY fk_marketplace_orders_order_group;

-- Drop FK: marketplace_orders -> users (buyer)
ALTER TABLE marketplace_orders
    DROP FOREIGN KEY fk_marketplace_orders_buyer_user;

-- Drop FK: marketplace_orders -> users (farmer)
ALTER TABLE marketplace_orders
    DROP FOREIGN KEY fk_marketplace_orders_farmer_user;

-- Drop FK: marketplace_order_items -> marketplace_products
ALTER TABLE marketplace_order_items
    DROP FOREIGN KEY fk_marketplace_order_items_product;

-- Drop FK: marketplace_order_items -> farms
ALTER TABLE marketplace_order_items
    DROP FOREIGN KEY fk_marketplace_order_items_farm;

-- Drop FK: marketplace_order_items -> seasons
ALTER TABLE marketplace_order_items
    DROP FOREIGN KEY fk_marketplace_order_items_season;

-- Drop FK: marketplace_order_items -> product_warehouse_lots
ALTER TABLE marketplace_order_items
    DROP FOREIGN KEY fk_marketplace_order_items_lot;

-- Drop FK: marketplace_carts -> users
ALTER TABLE marketplace_carts
    DROP FOREIGN KEY fk_marketplace_carts_user;

-- Drop FK: marketplace_cart_items -> marketplace_products
ALTER TABLE marketplace_cart_items
    DROP FOREIGN KEY fk_marketplace_cart_items_product;

-- Drop FK: marketplace_addresses -> users
ALTER TABLE marketplace_addresses
    DROP FOREIGN KEY fk_marketplace_addresses_user;

-- Drop FK: marketplace_product_reviews -> marketplace_products
ALTER TABLE marketplace_product_reviews
    DROP FOREIGN KEY fk_marketplace_reviews_product;

-- Drop FK: marketplace_product_reviews -> marketplace_orders
ALTER TABLE marketplace_product_reviews
    DROP FOREIGN KEY fk_marketplace_reviews_order;

-- Drop FK: marketplace_product_reviews -> marketplace_order_items
ALTER TABLE marketplace_product_reviews
    DROP FOREIGN KEY fk_review_order_item;

-- Drop FK: marketplace_product_reviews -> users
ALTER TABLE marketplace_product_reviews
    DROP FOREIGN KEY fk_marketplace_reviews_buyer_user;
