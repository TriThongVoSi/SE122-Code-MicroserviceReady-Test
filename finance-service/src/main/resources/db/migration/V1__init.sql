CREATE TABLE expenses (
    expense_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    season_id INT NOT NULL,
    task_id INT NULL,
    plot_id INT NULL,
    farm_id INT NULL,
    category VARCHAR(50) NULL,
    item_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(19,2) NOT NULL,
    quantity INT NOT NULL,
    total_cost DECIMAL(19,2) NULL,
    amount DECIMAL(19,2) NULL,
    payment_status VARCHAR(30) NULL,
    note TEXT NULL,
    expense_date DATE NOT NULL,
    season_name VARCHAR(255) NULL,
    plot_name VARCHAR(255) NULL,
    task_title VARCHAR(255) NULL,
    user_name VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE outbox_events (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    aggregate_type VARCHAR(255) NOT NULL,
    aggregate_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_expense_category ON expenses(category);
CREATE INDEX idx_expense_date ON expenses(expense_date);
CREATE INDEX idx_expense_item_name ON expenses(item_name);
