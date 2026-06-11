ALTER TABLE marketplace_products
    ADD COLUMN status_reason VARCHAR(500) NULL AFTER status,
    ADD COLUMN status_changed_at TIMESTAMP NULL AFTER status_reason,
    ADD COLUMN status_changed_by_user_id BIGINT NULL AFTER status_changed_at;

ALTER TABLE marketplace_products
    ADD CONSTRAINT fk_marketplace_products_status_changed_by
    FOREIGN KEY (status_changed_by_user_id) REFERENCES users(user_id);

CREATE INDEX idx_marketplace_products_status_changed_at
    ON marketplace_products(status_changed_at);
