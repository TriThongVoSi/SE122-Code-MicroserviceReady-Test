-- =========================================================
-- ACM Platform - One-Run Demo Bootstrap (MySQL 8 Compatible)
-- =========================================================
-- Version: 7.0 - Full bootstrap with marketplace demo - 2026-04-23
--
-- Demo accounts:
--   admin    / admin123
--   farmer   / 12345678
--   buyer    / 12345678
--   farmer2  / 12345678
--   employee / 12345678
--   employee2/ 12345678
-- =========================================================
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Chạy trực tiếp file này trên MySQL 8+
-- 2. File sẽ tự tạo database `quanlymuavu`
-- 3. File sẽ reset schema demo và nạp dữ liệu mẫu đầy đủ trong một lần chạy
-- =========================================================

CREATE DATABASE IF NOT EXISTS `quanlymuavu`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `quanlymuavu`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS vw_admin_inventory_lot_expiry_base;
DROP VIEW IF EXISTS vw_admin_inventory_lot_farm;
DROP VIEW IF EXISTS vw_admin_season_risk;

DROP TABLE IF EXISTS marketplace_product_reviews;
DROP TABLE IF EXISTS marketplace_addresses;
DROP TABLE IF EXISTS marketplace_order_items;
DROP TABLE IF EXISTS marketplace_orders;
DROP TABLE IF EXISTS marketplace_order_groups;
DROP TABLE IF EXISTS marketplace_cart_items;
DROP TABLE IF EXISTS marketplace_carts;
DROP TABLE IF EXISTS marketplace_products;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS product_warehouse_transactions;
DROP TABLE IF EXISTS product_warehouse_lots;
DROP TABLE IF EXISTS payroll_records;
DROP TABLE IF EXISTS task_progress_logs;
DROP TABLE IF EXISTS season_employees;
DROP TABLE IF EXISTS soil_tests;
DROP TABLE IF EXISTS irrigation_water_analyses;
DROP TABLE IF EXISTS nutrient_input_events;
DROP TABLE IF EXISTS crop_nitrogen_references;
DROP TABLE IF EXISTS document_recent_opens;
DROP TABLE IF EXISTS document_favorites;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS inventory_balances;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS stock_locations;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS supply_lots;
DROP TABLE IF EXISTS supply_items;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS field_logs;
DROP TABLE IF EXISTS harvests;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS seasons;
DROP TABLE IF EXISTS plots;
DROP TABLE IF EXISTS farms;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS varieties;
DROP TABLE IF EXISTS crops;
DROP TABLE IF EXISTS wards;
DROP TABLE IF EXISTS provinces;

-- =========================================================
-- 0. BOOTSTRAP SCHEMA
-- =========================================================

CREATE TABLE provinces (
    id INT NOT NULL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL,
    name_with_type VARCHAR(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wards (
    id INT NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    name_with_type VARCHAR(512) NOT NULL,
    province_id INT NOT NULL,
    CONSTRAINT fk_wards_province FOREIGN KEY (province_id) REFERENCES provinces(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
    role_id BIGINT NOT NULL PRIMARY KEY,
    role_code VARCHAR(100) NOT NULL,
    role_name VARCHAR(255) NULL,
    description VARCHAR(500) NULL,
    CONSTRAINT uk_roles_code UNIQUE (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    user_id BIGINT NOT NULL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NULL,
    full_name VARCHAR(255) NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    province_id INT NULL,
    ward_id INT NULL,
    joined_date DATETIME NULL,
    CONSTRAINT uk_users_username UNIQUE (user_name),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT fk_users_province FOREIGN KEY (province_id) REFERENCES provinces(id),
    CONSTRAINT fk_users_ward FOREIGN KEY (ward_id) REFERENCES wards(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE crops (
    crop_id INT NOT NULL PRIMARY KEY,
    crop_name VARCHAR(255) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE varieties (
    id INT NOT NULL PRIMARY KEY,
    crop_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    CONSTRAINT fk_varieties_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE farms (
    farm_id INT NOT NULL PRIMARY KEY,
    user_id BIGINT NULL,
    farm_name VARCHAR(255) NOT NULL,
    province_id INT NOT NULL,
    ward_id INT NOT NULL,
    area DECIMAL(19,2) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_farms_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_farms_province FOREIGN KEY (province_id) REFERENCES provinces(id),
    CONSTRAINT fk_farms_ward FOREIGN KEY (ward_id) REFERENCES wards(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE plots (
    plot_id INT NOT NULL PRIMARY KEY,
    farm_id INT NOT NULL,
    plot_name VARCHAR(255) NOT NULL,
    area DECIMAL(19,2) NULL,
    soil_type VARCHAR(50) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_USE',
    boundary_geojson LONGTEXT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_plots_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
    CONSTRAINT fk_plots_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE seasons (
    season_id INT NOT NULL PRIMARY KEY,
    season_name VARCHAR(255) NOT NULL,
    plot_id INT NOT NULL,
    crop_id INT NOT NULL,
    variety_id INT NULL,
    start_date DATE NOT NULL,
    planned_harvest_date DATE NULL,
    end_date DATE NULL,
    status VARCHAR(30) NOT NULL,
    initial_plant_count INT NOT NULL,
    current_plant_count INT NULL,
    expected_yield_kg DECIMAL(19,2) NULL,
    actual_yield_kg DECIMAL(19,2) NULL,
    budget_amount DECIMAL(19,2) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seasons_plot FOREIGN KEY (plot_id) REFERENCES plots(plot_id),
    CONSTRAINT fk_seasons_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id),
    CONSTRAINT fk_seasons_variety FOREIGN KEY (variety_id) REFERENCES varieties(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tasks (
    task_id INT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    season_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    planned_date DATE NULL,
    due_date DATE NULL,
    status VARCHAR(30) NULL,
    actual_start_date DATE NULL,
    actual_end_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_tasks_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE expenses (
    expense_id INT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    season_id INT NOT NULL,
    task_id INT NULL,
    category VARCHAR(50) NULL,
    item_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(19,2) NOT NULL,
    quantity INT NOT NULL,
    total_cost DECIMAL(19,2) NULL,
    amount DECIMAL(19,2) NULL,
    payment_status VARCHAR(30) NULL,
    note TEXT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_expenses_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_expenses_task FOREIGN KEY (task_id) REFERENCES tasks(task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE harvests (
    harvest_id INT NOT NULL PRIMARY KEY,
    season_id INT NOT NULL,
    harvest_date DATE NOT NULL,
    quantity DECIMAL(19,2) NOT NULL,
    unit DECIMAL(19,2) NOT NULL,
    grade VARCHAR(20) NULL,
    note VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_harvests_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE suppliers (
    id INT NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    license_no VARCHAR(100) NULL,
    contact_email VARCHAR(255) NULL,
    contact_phone VARCHAR(30) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE supply_items (
    id INT NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active_ingredient VARCHAR(255) NULL,
    unit VARCHAR(30) NOT NULL,
    restricted_flag BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE supply_lots (
    id INT NOT NULL PRIMARY KEY,
    supply_item_id INT NOT NULL,
    supplier_id INT NULL,
    batch_code VARCHAR(100) NOT NULL,
    expiry_date DATE NULL,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_supply_lots_item FOREIGN KEY (supply_item_id) REFERENCES supply_items(id),
    CONSTRAINT fk_supply_lots_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT uk_supply_lots_batch UNIQUE (batch_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE warehouses (
    id INT NOT NULL PRIMARY KEY,
    farm_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(20) NULL,
    province_id INT NULL,
    ward_id INT NULL,
    CONSTRAINT fk_warehouses_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
    CONSTRAINT fk_warehouses_province FOREIGN KEY (province_id) REFERENCES provinces(id),
    CONSTRAINT fk_warehouses_ward FOREIGN KEY (ward_id) REFERENCES wards(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_locations (
    id INT NOT NULL PRIMARY KEY,
    warehouse_id INT NOT NULL,
    zone VARCHAR(100) NULL,
    aisle VARCHAR(100) NULL,
    shelf VARCHAR(100) NULL,
    bin VARCHAR(100) NULL,
    CONSTRAINT fk_stock_locations_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_movements (
    id INT NOT NULL PRIMARY KEY,
    supply_lot_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    location_id INT NULL,
    movement_type VARCHAR(30) NOT NULL,
    quantity DECIMAL(19,3) NOT NULL,
    movement_date DATETIME NOT NULL,
    season_id INT NULL,
    task_id INT NULL,
    note TEXT NULL,
    CONSTRAINT fk_stock_movements_lot FOREIGN KEY (supply_lot_id) REFERENCES supply_lots(id),
    CONSTRAINT fk_stock_movements_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_stock_movements_location FOREIGN KEY (location_id) REFERENCES stock_locations(id),
    CONSTRAINT fk_stock_movements_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_stock_movements_task FOREIGN KEY (task_id) REFERENCES tasks(task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory_balances (
    id INT NOT NULL PRIMARY KEY,
    supply_lot_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    location_id INT NULL,
    quantity DECIMAL(19,3) NOT NULL,
    CONSTRAINT uk_inventory_balance UNIQUE (supply_lot_id, warehouse_id, location_id),
    CONSTRAINT fk_inventory_balances_lot FOREIGN KEY (supply_lot_id) REFERENCES supply_lots(id),
    CONSTRAINT fk_inventory_balances_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_inventory_balances_location FOREIGN KEY (location_id) REFERENCES stock_locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE field_logs (
    field_log_id INT NOT NULL PRIMARY KEY,
    season_id INT NOT NULL,
    log_date DATE NOT NULL,
    log_type VARCHAR(50) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_field_logs_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE incidents (
    id INT NOT NULL PRIMARY KEY,
    season_id INT NOT NULL,
    reported_by BIGINT NULL,
    incident_type VARCHAR(50) NULL,
    severity VARCHAR(20) NULL,
    status VARCHAR(30) NULL,
    description TEXT NULL,
    deadline DATE NULL,
    resolved_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_incidents_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_incidents_reported_by FOREIGN KEY (reported_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE alerts (
    id INT NOT NULL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    farm_id INT NULL,
    season_id INT NULL,
    plot_id INT NULL,
    crop_id INT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NULL,
    suggested_action_type VARCHAR(50) NULL,
    suggested_action_url VARCHAR(500) NULL,
    recipient_farmer_ids TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME NULL,
    CONSTRAINT fk_alerts_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
    CONSTRAINT fk_alerts_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_alerts_plot FOREIGN KEY (plot_id) REFERENCES plots(plot_id),
    CONSTRAINT fk_alerts_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id INT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NULL,
    message TEXT NULL,
    link VARCHAR(500) NULL,
    alert_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_notifications_alert FOREIGN KEY (alert_id) REFERENCES alerts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE documents (
    document_id INT NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    description TEXT NULL,
    crop VARCHAR(50) NULL,
    stage VARCHAR(50) NULL,
    topic VARCHAR(50) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT NULL,
    document_type VARCHAR(50) NULL,
    view_count INT NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    CONSTRAINT fk_documents_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_favorites (
    id INT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_document_favorites UNIQUE (user_id, document_id),
    CONSTRAINT fk_document_favorites_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_document_favorites_document FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_recent_opens (
    id INT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_id INT NOT NULL,
    opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_recent_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_document_recent_document FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_preferences (
    id INT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    currency_code VARCHAR(10) NULL,
    weight_unit VARCHAR(20) NULL,
    locale VARCHAR(20) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT uk_user_preferences_user UNIQUE (user_id),
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
    audit_log_id BIGINT NOT NULL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    operation VARCHAR(50) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    performed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    snapshot_data TEXT NULL,
    reason VARCHAR(500) NULL,
    ip_address VARCHAR(45) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE crop_nitrogen_references (
    id INT NOT NULL PRIMARY KEY,
    crop_id INT NOT NULL,
    n_content_kg_per_kg_yield DECIMAL(12,6) NOT NULL,
    source_reference VARCHAR(255) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_crop_n_ref_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE nutrient_input_events (
    id INT NOT NULL PRIMARY KEY,
    season_id INT NOT NULL,
    plot_id INT NOT NULL,
    input_source VARCHAR(40) NOT NULL,
    n_kg DECIMAL(19,4) NOT NULL,
    applied_date DATE NULL,
    measured BOOLEAN NOT NULL DEFAULT TRUE,
    data_source VARCHAR(120) NULL,
    source_type VARCHAR(40) NULL,
    source_document VARCHAR(255) NULL,
    note TEXT NULL,
    created_by_user_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nutrient_input_event_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_nutrient_input_event_plot FOREIGN KEY (plot_id) REFERENCES plots(plot_id),
    CONSTRAINT fk_nutrient_input_event_user FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE irrigation_water_analyses (
    id INT NOT NULL PRIMARY KEY,
    season_id INT NOT NULL,
    plot_id INT NOT NULL,
    sample_date DATE NOT NULL,
    nitrate_mg_per_l DECIMAL(19,4) NULL,
    ammonium_mg_per_l DECIMAL(19,4) NULL,
    total_n_mg_per_l DECIMAL(19,4) NULL,
    irrigation_volume_m3 DECIMAL(19,4) NOT NULL,
    legacy_n_contribution_kg DECIMAL(19,4) NULL,
    legacy_event_id INT NULL,
    legacy_derived BOOLEAN NOT NULL DEFAULT FALSE,
    measured BOOLEAN NOT NULL DEFAULT TRUE,
    source_type VARCHAR(40) NULL,
    source_document VARCHAR(255) NULL,
    lab_reference VARCHAR(255) NULL,
    note TEXT NULL,
    created_by_user_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_irrigation_analysis_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_irrigation_analysis_plot FOREIGN KEY (plot_id) REFERENCES plots(plot_id),
    CONSTRAINT fk_irrigation_analysis_user FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE soil_tests (
    id INT NOT NULL PRIMARY KEY,
    season_id INT NOT NULL,
    plot_id INT NOT NULL,
    sample_date DATE NOT NULL,
    soil_organic_matter_pct DECIMAL(12,4) NULL,
    mineral_n_kg_per_ha DECIMAL(19,4) NOT NULL,
    nitrate_mg_per_kg DECIMAL(19,4) NULL,
    ammonium_mg_per_kg DECIMAL(19,4) NULL,
    legacy_n_contribution_kg DECIMAL(19,4) NULL,
    legacy_event_id INT NULL,
    legacy_derived BOOLEAN NOT NULL DEFAULT FALSE,
    measured BOOLEAN NOT NULL DEFAULT TRUE,
    source_type VARCHAR(40) NULL,
    source_document VARCHAR(255) NULL,
    lab_reference VARCHAR(255) NULL,
    note TEXT NULL,
    created_by_user_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_soil_test_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_soil_test_plot FOREIGN KEY (plot_id) REFERENCES plots(plot_id),
    CONSTRAINT fk_soil_test_user FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE season_employees (
    id INT NOT NULL PRIMARY KEY,
    season_id INT NOT NULL,
    employee_user_id BIGINT NOT NULL,
    added_by_user_id BIGINT NULL,
    wage_per_task DECIMAL(15,2) NULL,
    active BIT(1) NOT NULL DEFAULT b'1',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_season_employee UNIQUE (season_id, employee_user_id),
    CONSTRAINT fk_season_employee_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_season_employee_user FOREIGN KEY (employee_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_season_employee_added_by FOREIGN KEY (added_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE task_progress_logs (
    id INT NOT NULL PRIMARY KEY,
    task_id INT NOT NULL,
    employee_user_id BIGINT NOT NULL,
    progress_percent INT NOT NULL,
    note TEXT NULL,
    evidence_url VARCHAR(1000) NULL,
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_progress_task FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    CONSTRAINT fk_task_progress_employee FOREIGN KEY (employee_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payroll_records (
    id INT NOT NULL PRIMARY KEY,
    employee_user_id BIGINT NOT NULL,
    season_id INT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_assigned_tasks INT NOT NULL DEFAULT 0,
    total_completed_tasks INT NOT NULL DEFAULT 0,
    wage_per_task DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT NULL,
    CONSTRAINT uk_payroll_employee_season_period UNIQUE (employee_user_id, season_id, period_start, period_end),
    CONSTRAINT fk_payroll_employee FOREIGN KEY (employee_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_payroll_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_warehouse_lots (
    id INT NOT NULL PRIMARY KEY,
    lot_code VARCHAR(100) NOT NULL,
    product_id INT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_variant VARCHAR(255) NULL,
    season_id INT NULL,
    farm_id INT NOT NULL,
    plot_id INT NOT NULL,
    harvest_id INT NULL,
    warehouse_id INT NOT NULL,
    location_id INT NULL,
    harvested_at DATE NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unit VARCHAR(30) NOT NULL,
    initial_quantity DECIMAL(19,3) NOT NULL,
    on_hand_quantity DECIMAL(19,3) NOT NULL,
    grade VARCHAR(50) NULL,
    quality_status VARCHAR(50) NULL,
    traceability_data TEXT NULL,
    note TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK',
    created_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_product_warehouse_lot_code UNIQUE (lot_code),
    CONSTRAINT uk_product_warehouse_harvest UNIQUE (harvest_id),
    CONSTRAINT fk_product_warehouse_lot_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_product_warehouse_lot_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
    CONSTRAINT fk_product_warehouse_lot_plot FOREIGN KEY (plot_id) REFERENCES plots(plot_id),
    CONSTRAINT fk_product_warehouse_lot_harvest FOREIGN KEY (harvest_id) REFERENCES harvests(harvest_id),
    CONSTRAINT fk_product_warehouse_lot_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_product_warehouse_lot_location FOREIGN KEY (location_id) REFERENCES stock_locations(id),
    CONSTRAINT fk_product_warehouse_lot_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_warehouse_transactions (
    id INT NOT NULL PRIMARY KEY,
    lot_id INT NOT NULL,
    transaction_type VARCHAR(40) NOT NULL,
    quantity DECIMAL(19,3) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    resulting_on_hand DECIMAL(19,3) NOT NULL,
    reference_type VARCHAR(50) NULL,
    reference_id VARCHAR(100) NULL,
    note TEXT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_warehouse_tx_lot FOREIGN KEY (lot_id) REFERENCES product_warehouse_lots(id),
    CONSTRAINT fk_product_warehouse_tx_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
    id BIGINT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    request_ip VARCHAR(45) NULL,
    user_agent VARCHAR(512) NULL,
    CONSTRAINT uk_password_reset_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace_products (
    id BIGINT NOT NULL PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    slug VARCHAR(191) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(120) NULL,
    short_description VARCHAR(500) NULL,
    description TEXT NULL,
    price DECIMAL(19,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    stock_quantity DECIMAL(19,3) NOT NULL,
    image_url VARCHAR(1024) NULL,
    image_urls_json TEXT NULL,
    farmer_user_id BIGINT NOT NULL,
    farm_id INT NULL,
    season_id INT NULL,
    lot_id INT NOT NULL,
    traceable BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_marketplace_products_slug UNIQUE (slug),
    CONSTRAINT uk_marketplace_products_lot UNIQUE (lot_id),
    CONSTRAINT fk_marketplace_products_farmer_user FOREIGN KEY (farmer_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_marketplace_products_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
    CONSTRAINT fk_marketplace_products_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_marketplace_products_lot FOREIGN KEY (lot_id) REFERENCES product_warehouse_lots(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace_carts (
    id BIGINT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_marketplace_carts_user UNIQUE (user_id),
    CONSTRAINT fk_marketplace_carts_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace_cart_items (
    id BIGINT NOT NULL PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(19,3) NOT NULL,
    unit_price_snapshot DECIMAL(19,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_marketplace_cart_items_cart_product UNIQUE (cart_id, product_id),
    CONSTRAINT fk_marketplace_cart_items_cart FOREIGN KEY (cart_id) REFERENCES marketplace_carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_marketplace_cart_items_product FOREIGN KEY (product_id) REFERENCES marketplace_products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace_order_groups (
    id BIGINT NOT NULL PRIMARY KEY,
    group_code VARCHAR(64) NOT NULL,
    buyer_user_id BIGINT NOT NULL,
    idempotency_key VARCHAR(128) NOT NULL,
    request_fingerprint VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_marketplace_order_groups_group_code UNIQUE (group_code),
    CONSTRAINT uk_marketplace_order_groups_idempotency UNIQUE (buyer_user_id, idempotency_key),
    CONSTRAINT fk_marketplace_order_groups_buyer_user FOREIGN KEY (buyer_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace_orders (
    id BIGINT NOT NULL PRIMARY KEY,
    order_group_id BIGINT NOT NULL,
    order_code VARCHAR(64) NOT NULL,
    buyer_user_id BIGINT NOT NULL,
    farmer_user_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    payment_verification_status VARCHAR(40) NOT NULL DEFAULT 'NOT_REQUIRED',
    payment_proof_file_name VARCHAR(255) NULL,
    payment_proof_content_type VARCHAR(150) NULL,
    payment_proof_storage_path VARCHAR(1000) NULL,
    payment_proof_uploaded_at TIMESTAMP NULL,
    payment_verified_at TIMESTAMP NULL,
    payment_verified_by_user_id BIGINT NULL,
    payment_verification_note VARCHAR(500) NULL,
    shipping_recipient_name VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(30) NOT NULL,
    shipping_address_line VARCHAR(500) NOT NULL,
    note TEXT NULL,
    subtotal DECIMAL(19,2) NOT NULL,
    shipping_fee DECIMAL(19,2) NOT NULL,
    total_amount DECIMAL(19,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_marketplace_orders_order_code UNIQUE (order_code),
    CONSTRAINT fk_marketplace_orders_order_group FOREIGN KEY (order_group_id) REFERENCES marketplace_order_groups(id),
    CONSTRAINT fk_marketplace_orders_buyer_user FOREIGN KEY (buyer_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_marketplace_orders_farmer_user FOREIGN KEY (farmer_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace_order_items (
    id BIGINT NOT NULL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    product_slug_snapshot VARCHAR(191) NOT NULL,
    image_url_snapshot VARCHAR(1024) NULL,
    unit_price_snapshot DECIMAL(19,2) NOT NULL,
    quantity DECIMAL(19,3) NOT NULL,
    line_total DECIMAL(19,2) NOT NULL,
    traceable_snapshot BOOLEAN NOT NULL DEFAULT FALSE,
    farm_id INT NULL,
    season_id INT NULL,
    lot_id INT NULL,
    CONSTRAINT fk_marketplace_order_items_order FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_marketplace_order_items_product FOREIGN KEY (product_id) REFERENCES marketplace_products(id),
    CONSTRAINT fk_marketplace_order_items_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
    CONSTRAINT fk_marketplace_order_items_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
    CONSTRAINT fk_marketplace_order_items_lot FOREIGN KEY (lot_id) REFERENCES product_warehouse_lots(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace_addresses (
    id BIGINT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    province VARCHAR(120) NOT NULL,
    district VARCHAR(120) NOT NULL,
    ward VARCHAR(120) NOT NULL,
    street VARCHAR(255) NOT NULL,
    detail VARCHAR(500) NULL,
    label VARCHAR(30) NOT NULL DEFAULT 'home',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_marketplace_addresses_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace_product_reviews (
    id BIGINT NOT NULL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    buyer_user_id BIGINT NOT NULL,
    rating TINYINT NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_marketplace_reviews_product_order_buyer UNIQUE (product_id, order_id, buyer_user_id),
    CONSTRAINT fk_marketplace_reviews_product FOREIGN KEY (product_id) REFERENCES marketplace_products(id),
    CONSTRAINT fk_marketplace_reviews_order FOREIGN KEY (order_id) REFERENCES marketplace_orders(id),
    CONSTRAINT fk_marketplace_reviews_buyer_user FOREIGN KEY (buyer_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_wards_province ON wards(province_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_province ON users(province_id);
CREATE INDEX idx_farms_user ON farms(user_id);
CREATE INDEX idx_plots_farm ON plots(farm_id);
CREATE INDEX idx_plots_status ON plots(status);
CREATE INDEX idx_season_plot_name ON seasons(plot_id, season_name);
CREATE INDEX idx_season_status ON seasons(status);
CREATE INDEX idx_tasks_season ON tasks(season_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_expense_category ON expenses(category);
CREATE INDEX idx_expense_date ON expenses(expense_date);
CREATE INDEX idx_expense_item_name ON expenses(item_name);
CREATE INDEX idx_stock_movements_lot_date ON stock_movements(supply_lot_id, movement_date);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at);
CREATE INDEX idx_audit_logs_entity_lookup ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at);
CREATE INDEX idx_crop_n_ref_crop_active ON crop_nitrogen_references(crop_id, active);
CREATE INDEX idx_nutrient_input_events_season_plot ON nutrient_input_events(season_id, plot_id);
CREATE INDEX idx_irrigation_analysis_season_plot ON irrigation_water_analyses(season_id, plot_id);
CREATE INDEX idx_soil_test_season_plot ON soil_tests(season_id, plot_id);
CREATE INDEX idx_season_employee_season ON season_employees(season_id);
CREATE INDEX idx_task_progress_task ON task_progress_logs(task_id);
CREATE INDEX idx_payroll_employee ON payroll_records(employee_user_id);
CREATE INDEX idx_product_warehouse_lot_farm ON product_warehouse_lots(farm_id);
CREATE INDEX idx_product_warehouse_lot_season ON product_warehouse_lots(season_id);
CREATE INDEX idx_product_warehouse_lot_status ON product_warehouse_lots(status);
CREATE INDEX idx_product_warehouse_tx_lot ON product_warehouse_transactions(lot_id);
CREATE INDEX idx_marketplace_products_status ON marketplace_products(status);
CREATE INDEX idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX idx_marketplace_products_traceable ON marketplace_products(traceable);
CREATE INDEX idx_marketplace_products_farmer_user ON marketplace_products(farmer_user_id);
CREATE INDEX idx_marketplace_products_farm ON marketplace_products(farm_id);
CREATE INDEX idx_marketplace_products_stock_quantity ON marketplace_products(stock_quantity);
CREATE INDEX idx_marketplace_cart_items_product ON marketplace_cart_items(product_id);
CREATE INDEX idx_marketplace_orders_buyer_user ON marketplace_orders(buyer_user_id);
CREATE INDEX idx_marketplace_orders_farmer_user ON marketplace_orders(farmer_user_id);
CREATE INDEX idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX idx_marketplace_orders_payment_verification_status ON marketplace_orders(payment_verification_status);
CREATE INDEX idx_marketplace_order_items_order ON marketplace_order_items(order_id);
CREATE INDEX idx_marketplace_order_items_product ON marketplace_order_items(product_id);
CREATE INDEX idx_marketplace_addresses_user ON marketplace_addresses(user_id);
CREATE INDEX idx_marketplace_reviews_product ON marketplace_product_reviews(product_id);
CREATE INDEX idx_marketplace_reviews_order ON marketplace_product_reviews(order_id);

-- =========================================================
-- 0.1 LOCATIONS, ROLES, USERS
-- =========================================================
-- Khởi tạo cố định ID user cho dữ liệu demo để các INSERT phía dưới tham chiếu ổn định.
SET @admin_user_id := 1;
SET @farmer_user_id := 2;
SET @buyer_user_id := 3;
SET @farmer2_user_id := 4;
SET @employee_user_id := 5;
SET @employee2_user_id := 6;

INSERT INTO provinces (id, name, slug, type, name_with_type) VALUES
    (1, 'Đồng Tháp', 'dong-thap', 'tinh', 'Tỉnh Đồng Tháp'),
    (2, 'Lâm Đồng', 'lam-dong', 'tinh', 'Tỉnh Lâm Đồng');

INSERT INTO wards (id, name, slug, type, name_with_type, province_id) VALUES
    (1, 'Mỹ An', 'my-an', 'phuong', 'Phường Mỹ An', 1),
    (2, 'Xuân Trường', 'xuan-truong', 'xa', 'Xã Xuân Trường', 2);

INSERT INTO roles (role_id, role_code, role_name, description) VALUES
    (1, 'ADMIN', 'Admin', 'Administrator user with full access'),
    (2, 'FARMER', 'Farmer', 'Farmer user'),
    (3, 'BUYER', 'Buyer', 'Marketplace buyer user'),
    (4, 'EMPLOYEE', 'Employee', 'Employee user');

INSERT INTO users (user_id, user_name, email, phone, full_name, password_hash, status, province_id, ward_id, joined_date) VALUES
    (1, 'admin', 'admin@acm.local', '0900000000', 'Administrator', '$2a$10$7iN9nIqCTnm9sE2zrREqXu6KXcc6RTcTM2Dqx02qBS0NFjgIQ4442', 'ACTIVE', 1, 1, '2024-01-01 08:00:00'),
    (2, 'farmer', 'farmer@acm.local', '0901234567', 'Nguyen Van Farmer', '$2a$10$BzROX8TgxrKpb./sQD9w..VmxFh1AJjAQAH8mxhJfdmpb2C7aWLIy', 'ACTIVE', 1, 1, '2024-06-01 08:00:00'),
    (3, 'buyer', 'buyer@acm.local', '0903234000', 'Tran Thi Buyer', '$2a$10$BzROX8TgxrKpb./sQD9w..VmxFh1AJjAQAH8mxhJfdmpb2C7aWLIy', 'ACTIVE', 1, 1, '2025-12-01 08:00:00'),
    (4, 'farmer2', 'farmer2@acm.local', '0904234567', 'Le Thi Farmer 2', '$2a$10$BzROX8TgxrKpb./sQD9w..VmxFh1AJjAQAH8mxhJfdmpb2C7aWLIy', 'ACTIVE', 2, 2, '2025-12-15 08:00:00'),
    (5, 'employee', 'employee@acm.local', '0902234567', 'Nguyen Van Employee', '$2a$10$BzROX8TgxrKpb./sQD9w..VmxFh1AJjAQAH8mxhJfdmpb2C7aWLIy', 'ACTIVE', 1, 1, '2025-11-01 08:00:00'),
    (6, 'employee2', 'employee2@acm.local', '0903234567', 'Tran Thi Employee', '$2a$10$BzROX8TgxrKpb./sQD9w..VmxFh1AJjAQAH8mxhJfdmpb2C7aWLIy', 'ACTIVE', 1, 1, '2026-01-10 08:00:00'),
    (7, 'buyer_locked', 'buyer.locked@acm.local', '0905555001', 'Pham Van Locked Buyer', '$2a$10$BzROX8TgxrKpb./sQD9w..VmxFh1AJjAQAH8mxhJfdmpb2C7aWLIy', 'LOCKED', 1, 1, '2026-02-01 08:00:00'),
    (8, 'employee_inactive', 'employee.inactive@acm.local', '0905555002', 'Do Thi Inactive Employee', '$2a$10$BzROX8TgxrKpb./sQD9w..VmxFh1AJjAQAH8mxhJfdmpb2C7aWLIy', 'INACTIVE', 1, 1, '2026-02-15 08:00:00');

INSERT INTO user_roles (user_id, role_id) VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 2),
    (5, 4),
    (6, 4),
    (7, 3),
    (8, 4);

-- =========================================================
-- 1. CROPS & VARIETIES
-- =========================================================
INSERT INTO crops (crop_id, crop_name, description) VALUES
                                                        (1, 'Lúa nước', 'Cây lương thực chính của Việt Nam'),
                                                        (2, 'Đậu nành', 'Cây họ đậu giàu đạm, dùng làm thực phẩm và thức ăn chăn nuôi'),
                                                        (3, 'Lạc', 'Cây họ đậu lấy củ, thích hợp vụ khô'),
                                                        (4, 'Đậu đen', 'Cây họ đậu ngắn ngày, chịu hạn khá'),
                                                        (5, 'Ngô', 'Cây lương thực lấy hạt, sinh trưởng mạnh'),
                                                        (6, 'Ớt', 'Cây gia vị ngắn ngày, nhạy cảm với úng và nấm bệnh trong mùa mưa'),
                                                        (7, 'Khoai tây', 'Cây lấy củ, phù hợp vụ đông để cải tạo cấu trúc đất');

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

-- =========================================================
-- 2. FARMS (primary farmer = user_id 2)
-- =========================================================
INSERT INTO farms (farm_id, user_id, farm_name, province_id, ward_id, area, active) VALUES
    (1, 2, 'Nông trại Phú Điền', 1, 1, 15.50, TRUE),
    (2, 2, 'Nông trại An Phát', 1, 1, 10.20, TRUE),
    (3, 2, 'Khu thử nghiệm Ngũ Cốc', 1, 1, 3.00, FALSE),
    (4, @farmer2_user_id, 'Nông trại Cao Nguyên Xanh', 2, 2, 12.80, TRUE);


-- =========================================================
-- 3. PLOTS (Multiple statuses)
-- =========================================================
INSERT INTO plots (plot_id, farm_id, plot_name, area, soil_type, status, created_by, created_at, updated_at) VALUES
    (1, 1, 'Lô A1 - Đậu nành', 2.50, 'LOAM', 'IN_USE', 2, '2024-06-01 08:00:00', NOW()),
    (2, 1, 'Lô A2 - Lúa nước Đài Thơm 8', 4.00, 'CLAY', 'IN_USE', 2, '2024-06-01 08:00:00', NOW()),
    (3, 1, 'Lô A3 - Luân canh lạc', 3.00, 'SANDY', 'FALLOW', 2, '2024-06-01 08:00:00', NOW()),
    (4, 1, 'Lô A4 - Bảo trì tưới', 2.00, 'LOAM', 'MAINTENANCE', 2, '2024-06-01 08:00:00', NOW()),
    (5, 1, 'Lô A5 - Sẵn sàng gieo ngô', 2.50, 'CLAY', 'AVAILABLE', 2, '2024-06-01 08:00:00', NOW()),
    (6, 2, 'Lô B1 - Đậu đen', 1.80, 'LOAM', 'IN_USE', 2, '2024-08-01 08:00:00', NOW()),
    (7, 2, 'Lô B2 - Lạc', 2.00, 'SANDY', 'IN_USE', 2, '2024-08-01 08:00:00', NOW()),
    (8, 2, 'Lô B3 - Dự phòng', 3.00, 'CLAY', 'IDLE', 2, '2024-08-01 08:00:00', NOW()),
    (9, 4, 'Lô C1 - Ngô cao nguyên', 4.60, 'LOAM', 'IN_USE', @farmer2_user_id, '2026-01-12 08:00:00', '2026-03-20 08:00:00');


-- =========================================================
-- 4. SEASONS (All statuses: PLANNED, ACTIVE, COMPLETED, CANCELLED, ARCHIVED)
-- =========================================================
INSERT INTO seasons (season_id, season_name, plot_id, crop_id, variety_id, start_date, planned_harvest_date, end_date, status, initial_plant_count, current_plant_count, expected_yield_kg, actual_yield_kg, budget_amount, notes, created_at) VALUES
    -- ============== NĂM 0 (2020): Dữ liệu rủi ro và tiền đề chu kỳ ==============
    (1, '2020 - Vụ Ớt Hè Thu (Bị hủy)', 1, 6, 8, '2020-05-15', '2020-08-15', '2020-06-20', 'CANCELLED', 45000, 0, 1500.00, 0.00, 4000000.00, 'Mùa vụ thất bại: Hủy do ngập lụt sớm, mất trắng toàn bộ cây giống', '2020-05-01 08:00:00'),
    (2, '2020 - Vụ Khoai Tây Đông [Lưu trữ]', 1, 7, 9, '2020-09-10', '2020-12-20', '2020-12-25', 'ARCHIVED', 80000, 78000, 4500.00, 4600.00, 9500000.00, 'Trồng cây lấy củ giúp cày sâu, phá vỡ tầng đất nén chặt sau đợt ngập lụt, tạo tiền đề tốt cho chu kỳ luân canh FDN 2021', '2020-09-01 08:00:00'),

    -- ============== NĂM 1 (2021): Thiết lập nền tảng FDN ban đầu ==============
    (3, '2021 - Vụ Ngô Xuân (Nền tảng FDN)', 1, 5, 7, '2021-01-15', '2021-04-25', '2021-04-28', 'COMPLETED', 18000, 17500, 2500.00, 2450.00, 7000000.00, 'Khởi đầu chu kỳ: Đất nghèo dinh dưỡng, FDN ở mức cao nhất, phụ thuộc 100% phân bón vô cơ', '2021-01-01 08:00:00'),
    (4, '2021 - Vụ Đậu nành Hè', 1, 2, 3, '2021-05-15', '2021-08-20', '2021-08-25', 'COMPLETED', 120000, 115000, 950.00, 980.00, 5000000.00, 'Đưa cây họ đậu vào để bắt đầu tạo nốt sần, tích lũy Nitơ sinh học', '2021-05-01 08:00:00'),
    (5, '2021 - Vụ Lúa Thu Đông', 1, 1, 1, '2021-09-10', '2021-12-15', '2021-12-20', 'COMPLETED', 200000, 195000, 3000.00, 3100.00, 15000000.00, 'Lúa hưởng lợi đạm dư thừa (Soil Legacy) từ vụ đậu trước, FDN bắt đầu giảm nhẹ', '2021-09-01 08:00:00'),

    -- ============== NĂM 2 (2022): Tích lũy hữu cơ ==============
    (6, '2022 - Vụ Lạc Xuân', 1, 3, 5, '2022-01-15', '2022-04-20', '2022-04-25', 'COMPLETED', 80000, 78000, 500.00, 520.00, 2000000.00, 'Gia tăng sinh khối hữu cơ, rễ lạc tơi xốp đất sâu', '2022-01-01 08:00:00'),
    (7, '2022 - Vụ Đậu đen Hè', 1, 4, 6, '2022-05-10', '2022-07-25', '2022-07-28', 'COMPLETED', 50000, 48000, 2000.00, 1950.00, 10000000.00, 'Trồng kép họ đậu để ép cực đại lượng đạm tự nhiên vào đất', '2022-05-01 08:00:00'),
    (8, '2022 - Vụ Ngô Thu', 1, 5, 7, '2022-08-15', '2022-11-20', '2022-11-25', 'COMPLETED', 18000, 17200, 2600.00, 2650.00, 7000000.00, 'Ngô thu hoạch năng suất cao nhưng FDN đã thấp hơn đáng kể so với vụ 3 (Năm 2021)', '2022-08-01 08:00:00'),

    -- ============== NĂM 3 (2023): Giai đoạn tối ưu FDN ==============
    (9, '2023 - Vụ Đậu nành Xuân', 1, 2, 4, '2023-01-15', '2023-04-20', '2023-04-22', 'COMPLETED', 130000, 125000, 1000.00, 1050.00, 5500000.00, 'Chu kỳ cố định đạm thường niên', '2023-01-01 08:00:00'),
    (10, '2023 - Vụ Lúa Hè', 1, 1, 2, '2023-05-15', '2023-08-20', '2023-08-25', 'COMPLETED', 220000, 215000, 3200.00, 3350.00, 16000000.00, 'Lúa đạt đỉnh năng suất nhờ cấu trúc đất đã được phục hồi hoàn toàn', '2023-05-01 08:00:00'),
    (11, '2023 - Vụ Lạc Thu Đông', 1, 3, 5, '2023-09-15', '2023-12-20', '2023-12-25', 'COMPLETED', 85000, 83000, 550.00, 580.00, 2200000.00, 'Phục hồi đất sau vụ lúa nước', '2023-09-01 08:00:00'),

    -- ============== NĂM 4 (2024): Ổn định và duy trì ==============
    (12, '2024 - Vụ Ngô Xuân', 1, 5, 7, '2024-01-15', '2024-04-20', '2024-04-25', 'COMPLETED', 19000, 18500, 2800.00, 2900.00, 7500000.00, 'FDN duy trì ở vùng xanh an toàn (dưới 40%)', '2024-01-01 08:00:00'),
    (13, '2024 - Vụ Đậu đen Hè', 1, 4, 6, '2024-05-15', '2024-07-25', '2024-07-28', 'COMPLETED', 55000, 53000, 2200.00, 2150.00, 10500000.00, 'Tăng cường hữu cơ', '2024-05-01 08:00:00'),
    (14, '2024 - Vụ Lúa Thu Đông', 1, 1, 1, '2024-08-15', '2024-11-20', '2024-11-25', 'COMPLETED', 210000, 205000, 3100.00, 3250.00, 15500000.00, 'Giảm 60% lượng phân đạm hóa học so với các vụ thông thường', '2024-08-01 08:00:00'),

    -- ============== NĂM 5 (2025): Chốt chu kỳ dài hạn 5 năm ==============
    (15, '2025 - Vụ Đậu nành Xuân', 1, 2, 3, '2025-01-15', '2025-04-20', '2025-04-25', 'COMPLETED', 140000, 135000, 1100.00, 1150.00, 6000000.00, 'Cố định đạm trước khi chốt chu kỳ', '2025-01-01 08:00:00'),
    (16, '2025 - Vụ Lạc Hè', 1, 3, 5, '2025-05-15', '2025-08-20', '2025-08-25', 'COMPLETED', 90000, 88000, 600.00, 620.00, 2500000.00, 'Tạo nền tảng Soil Legacy cực đại', '2025-05-01 08:00:00'),
    (17, '2025 - Vụ Ngô Thu (Kết thúc Chu kỳ 1)', 1, 5, 7, '2025-09-15', '2025-12-20', '2025-12-25', 'COMPLETED', 20000, 19500, 3000.00, 3150.00, 8000000.00, 'Chốt chu kỳ 5 năm: Ngô đạt sản lượng kỷ lục với chỉ số FDN thấp nhất lịch sử trang trại', '2025-09-01 08:00:00'),

    -- ============== NĂM 6 (2026): Khởi động Vòng luân canh thứ 2 (TRẠNG THÁI THỰC TẾ ĐẾN THÁNG 4/2026) ==============
    (18, '2026 - Vụ Đậu nành Xuân (Khởi tạo Chu kỳ 2)', 1, 2, 4, '2026-01-10', '2026-04-10', '2026-04-15', 'COMPLETED', 145000, 140000, 1150.00, 1200.00, 6200000.00, 'Vừa thu hoạch xong giữa tháng 4/2026', '2026-01-01 08:00:00'),
    (19, '2026 - Vụ Lúa Hè', 1, 1, 1, '2026-04-20', '2026-07-25', NULL, 'ACTIVE', 220000, 218000, 3300.00, NULL, 16500000.00, 'Vụ mùa đang canh tác hiện tại (Vừa sạ giống cuối tháng 4)', '2026-04-16 08:00:00'),
    (20, '2026 - Vụ Lạc Thu', 1, 3, 5, '2026-08-15', '2026-11-20', NULL, 'PLANNED', 90000, NULL, 600.00, NULL, 2500000.00, 'Kế hoạch gieo trồng cho quý 3/2026', '2026-04-16 08:00:00');


-- =========================================================
-- 5. TASKS (All statuses: PENDING, IN_PROGRESS, DONE, OVERDUE, CANCELLED)
-- =========================================================
INSERT INTO tasks (task_id, user_id, season_id, title, description, planned_date, due_date, status, actual_start_date, actual_end_date, notes, created_at) VALUES
    (1, 2, 3, 'Gieo hạt đậu nành AGS398', 'Gieo hạt vào khay ươm', '2025-01-05', '2025-01-07', 'DONE', '2025-01-05', '2025-01-06', 'Tỉ lệ nảy mầm 95%', NOW()),
    (2, 2, 3, 'Chuẩn bị đất lô A1', 'Cày bừa, bón vôi, phân lót', '2025-01-08', '2025-01-12', 'DONE', '2025-01-08', '2025-01-11', 'Đất sẵn sàng', NOW()),
    (3, 2, 3, 'Cấy đậu nành ra ruộng', 'Cấy cây con 25 ngày tuổi', '2025-01-20', '2025-01-22', 'DONE', '2025-01-20', '2025-01-21', 'Hoàn thành sớm', NOW()),
    (4, 2, 3, 'Bón phân thúc đợt 1', 'NPK 16-16-8, 20kg/sào', '2025-02-05', '2025-02-07', 'IN_PROGRESS', '2025-02-05', NULL, 'Đang thực hiện', NOW()),
    (5, 2, 3, 'Phun thuốc phòng bệnh', 'Phun thuốc trừ sâu sinh học', '2025-02-10', '2025-02-12', 'PENDING', NULL, NULL, NULL, NOW()),
    (6, 2, 3, 'Bón phân thúc đợt 2', 'Phân kali', '2025-02-25', '2025-02-28', 'PENDING', NULL, NULL, NULL, NOW()),
    (7, 2, 3, 'Thu hoạch đợt 1', 'Thu hoạch quả chín đợt đầu', '2025-03-15', '2025-03-18', 'PENDING', NULL, NULL, NULL, NOW()),
    (8, 2, 4, 'Gieo mạ', 'Gieo mạ khay', '2024-12-20', '2024-12-22', 'DONE', '2024-12-20', '2024-12-21', 'Hoàn thành', '2024-12-20 08:00:00'),
    (9, 2, 4, 'Cấy lúa nước', 'Cấy lúa nước ra ruộng', '2025-01-05', '2025-01-10', 'DONE', '2025-01-05', '2025-01-09', 'Đúng tiến độ', '2025-01-01 08:00:00'),
    (10, 2, 4, 'Bón phân đợt 1', 'Urê + DAP', '2025-01-20', '2025-01-22', 'DONE', '2025-01-20', '2025-01-21', 'Hoàn thành', '2025-01-15 08:00:00'),
    (11, 2, 4, 'Phun thuốc trừ cỏ', 'Thuốc trừ cỏ hậu nảy mầm', '2025-01-15', '2025-01-17', 'OVERDUE', NULL, NULL, 'Chưa thực hiện - quá hạn', '2025-01-10 08:00:00'),
    (12, 2, 4, 'Bón phân đón đòng', 'Kali + urê', '2025-02-10', '2025-02-15', 'IN_PROGRESS', '2025-02-12', NULL, 'Đang bón', NOW()),
    (13, 2, 5, 'Gieo hạt lạc', 'Gieo trực tiếp', '2025-01-10', '2025-01-11', 'DONE', '2025-01-10', '2025-01-10', 'Hoàn thành trong ngày', '2025-01-10 08:00:00'),
    (14, 2, 5, 'Tưới nước hàng ngày', 'Tưới sáng chiều', '2025-01-12', '2025-02-10', 'IN_PROGRESS', '2025-01-12', NULL, 'Đang thực hiện', '2025-01-12 08:00:00'),
    (15, 2, 5, 'Thu hoạch lứa 1', 'Cắt rau', '2025-02-05', '2025-02-07', 'PENDING', NULL, NULL, NULL, NOW()),
    (16, 2, 8, 'Chuẩn bị đất', 'Đã hủy cùng vụ mùa', '2024-11-05', '2024-11-10', 'CANCELLED', NULL, NULL, 'Vụ bị hủy', '2024-11-01 08:00:00'),
    (17, @employee_user_id, 16, 'Làm đất lô A1 hè 2026', 'Xới đất, bổ sung hữu cơ trước khi cấy', '2026-02-20', '2026-02-22', 'DONE', '2026-02-20', '2026-02-21', 'Nhân viên chính hoàn thành đúng hạn', '2026-02-19 08:00:00'),
    (18, @employee_user_id, 16, 'Bón phân đợt 1', 'Bón NPK và hữu cơ vi sinh', '2026-03-15', '2026-03-20', 'IN_PROGRESS', '2026-03-15', NULL, 'Đang thực hiện 70%', '2026-03-14 08:00:00'),
    (19, @employee2_user_id, 16, 'Phun phòng bệnh lá', 'Phòng sương mai theo lịch', '2026-03-18', '2026-03-25', 'PENDING', NULL, NULL, 'Chờ vật tư về kho', '2026-03-17 08:00:00'),
    (20, @employee2_user_id, 16, 'Kiểm tra hệ thống tưới', 'Bảo trì đường ống và đầu tưới', '2026-03-01', '2026-03-05', 'OVERDUE', NULL, NULL, 'Trễ do thiếu nhân lực', '2026-02-28 08:00:00'),
    (21, @employee_user_id, 16, 'Bảo trì nhà lưới', 'Gia cố khung và lưới che', '2026-03-08', '2026-03-10', 'CANCELLED', NULL, NULL, 'Tạm dừng do ưu tiên phun bệnh', '2026-03-07 08:00:00'),
    (22, @employee_user_id, 15, 'Thu hoạch đậu đen đợt cuối', 'Thu hoạch và phân loại tại ruộng', '2026-02-12', '2026-02-14', 'DONE', '2026-02-12', '2026-02-14', 'Hoàn tất 100%', '2026-02-11 08:00:00'),
    (23, @employee_user_id, 17, 'Gieo hạt lạc cải tạo đất năm 4', 'Chuẩn bị vụ lạc trong chu kỳ luân canh 5 năm', '2027-03-02', '2027-03-04', 'PENDING', NULL, NULL, 'Task năm 4 của chu kỳ dài hạn', '2026-03-18 10:00:00'),
    (24, @employee2_user_id, 18, 'Ươm giống ngô chu kỳ năm 5', 'Ươm giống trong nhà màng cho năm cuối chu kỳ', '2028-01-12', '2028-01-15', 'PENDING', NULL, NULL, 'Task tương lai xa', '2026-03-18 10:10:00'),
    (25, @employee_user_id, 15, 'Đóng gói đậu đen loại A', 'Đóng gói cho kênh siêu thị', '2026-02-14', '2026-02-15', 'DONE', '2026-02-14', '2026-02-15', 'Hoàn tất đúng chất lượng', '2026-02-14 13:00:00'),
    (26, @employee_user_id, 16, 'Thu hoạch sớm lô đậu nành', 'Thu đợt thử nghiệm cho kênh online', '2026-04-02', '2026-04-04', 'PENDING', NULL, NULL, 'Chờ đến kỳ thu hoạch', '2026-03-18 10:20:00');


-- =========================================================
-- 6. EXPENSES (Various categories & payment statuses)
-- =========================================================
INSERT INTO expenses (expense_id, user_id, season_id, task_id, category, item_name, unit_price, quantity, total_cost, amount, payment_status, note, expense_date, created_at) VALUES
    (1, 2, 1, NULL, 'SEEDS', 'Hạt giống đậu nành DT84', 20000.00, 10, 200000.00, 200000.00, 'PAID', 'Mua tại đại lý', '2024-09-02', '2024-09-02 09:00:00'),
    (2, 2, 1, NULL, 'FERTILIZER', 'Phân NPK 16-16-8', 55000.00, 8, 440000.00, 440000.00, 'PAID', 'Bón lót', '2024-09-05', '2024-09-05 10:00:00'),
    (3, 2, 1, NULL, 'LABOR', 'Thuê nhân công thu hoạch', 250000.00, 3, 750000.00, 750000.00, 'PAID', 'Thu hoạch 3 ngày', '2024-12-01', '2024-12-01 14:00:00'),
    (4, 2, 3, 1, 'SEEDS', 'Hạt giống đậu nành AGS398', 25000.00, 15, 375000.00, 375000.00, 'PAID', 'Nhập từ Đà Lạt', '2025-01-05', NOW()),
    (5, 2, 3, 2, 'FERTILIZER', 'Phân hữu cơ vi sinh', 80000.00, 20, 1600000.00, 1600000.00, 'PAID', 'Bón lót', '2025-01-08', NOW()),
    (6, 2, 3, 4, 'FERTILIZER', 'Phân NPK 16-16-8', 55000.00, 10, 550000.00, 550000.00, 'PENDING', 'Bón thúc đợt 1', '2025-02-05', NOW()),
    (7, 2, 3, NULL, 'EQUIPMENT', 'Dây buộc đậu nành', 15000.00, 20, 300000.00, 300000.00, 'PAID', 'Cuộn 100m', '2025-01-15', NOW()),
    (8, 2, 3, NULL, 'PESTICIDE', 'Thuốc trừ sâu sinh học', 120000.00, 5, 600000.00, 600000.00, 'UNPAID', 'Chờ thanh toán', '2025-02-01', NOW()),
    (9, 2, 4, 8, 'SEEDS', 'Hạt giống lúa nước OM5451', 30000.00, 60, 1800000.00, 1800000.00, 'PAID', 'Giống xác nhận', '2024-12-18', '2024-12-18 08:00:00'),
    (10, 2, 4, 10, 'FERTILIZER', 'Urê', 450000.00, 10, 4500000.00, 4500000.00, 'PAID', 'Bón thúc', '2025-01-20', NOW()),
    (11, 2, 4, 12, 'FERTILIZER', 'Kali clorua', 520000.00, 5, 2600000.00, 2600000.00, 'PENDING', 'Bón đón đòng', '2025-02-12', NOW()),
    (12, 2, 4, NULL, 'LABOR', 'Thuê máy cấy', 800000.00, 4, 3200000.00, 3200000.00, 'PAID', '4 hecta', '2025-01-06', NOW()),
    (13, 2, 5, 13, 'SEEDS', 'Hạt lạc', 8000.00, 5, 40000.00, 40000.00, 'PAID', '5kg hạt', '2025-01-10', '2025-01-10 08:00:00'),
    (14, 2, 5, NULL, 'OTHER', 'Thuê bơm nước', 50000.00, 30, 1500000.00, 1500000.00, 'PENDING', 'Thuê theo ngày', '2025-01-12', NOW()),
    (15, 2, 13, NULL, 'LABOR', 'Nhân công thu hoạch lạc chuyển tiếp', 260000.00, 2, 520000.00, 520000.00, 'PAID', 'Bổ sung dữ liệu liên tục ID', '2026-10-26', '2026-10-26 16:00:00'),
    (16, 2, 13, NULL, 'FERTILIZER', 'Phân hữu cơ bổ sung cuối vụ', 78000.00, 6, 468000.00, 468000.00, 'PAID', 'Bổ sung dữ liệu liên tục ID', '2026-09-10', '2026-09-10 16:00:00'),
    (17, @farmer_user_id, 15, 22, 'LABOR', 'Nhân công thu hoạch đậu đen', 280000.00, 4, 1120000.00, 1120000.00, 'PAID', 'Thanh toán theo ngày công', '2026-02-12', '2026-02-12 18:00:00'),
    (18, @farmer_user_id, 15, 25, 'EQUIPMENT', 'Thùng đóng gói và tem truy xuất', 18000.00, 120, 2160000.00, 2160000.00, 'PAID', 'Đóng gói loại A', '2026-02-14', '2026-02-14 19:00:00'),
    (19, @farmer_user_id, 18, 17, 'FERTILIZER', 'Phân hữu cơ vi sinh', 90000.00, 25, 2250000.00, 2250000.00, 'PAID', 'Bổ sung đất nền', '2026-02-21', '2026-02-21 16:00:00'),
    (20, @farmer_user_id, 18, 18, 'FERTILIZER', 'NPK 20-20-15', 62000.00, 20, 1240000.00, 1240000.00, 'PENDING', 'Đợt bón thúc đang triển khai', '2026-03-16', '2026-03-16 17:00:00'),
    (21, @farmer_user_id, 18, 19, 'PESTICIDE', 'Thuốc phòng sương mai', 145000.00, 6, 870000.00, 870000.00, 'UNPAID', 'Đặt hàng chưa thanh toán', '2026-03-18', '2026-03-18 15:00:00'),
    (22, @farmer_user_id, 18, 20, 'OTHER', 'Sửa đường ống tưới', 320000.00, 2, 640000.00, 640000.00, 'PENDING', 'Delay do overtime crew', '2026-03-04', '2026-03-04 16:00:00'),
    (23, @farmer_user_id, 16, 23, 'SEEDS', 'Giống lạc L14 cho năm 4 chu kỳ', 34000.00, 80, 2720000.00, 2720000.00, 'PENDING', 'Đặt cọc cho mùa vụ tương lai', '2027-02-20', '2026-03-18 15:10:00');


-- =========================================================
-- 7. HARVESTS
-- =========================================================
INSERT INTO harvests (harvest_id, season_id, harvest_date, quantity, unit, grade, note, created_at) VALUES
    (1, 1, '2024-11-25', 350.00, 18000.00, 'A', 'Thu hoạch đợt 1 - Quả đẹp', '2024-11-25 17:00:00'),
    (2, 1, '2024-11-30', 380.00, 19000.00, 'A', 'Thu hoạch đợt 2', '2024-11-30 16:00:00'),
    (3, 1, '2024-12-05', 120.50, 15000.00, 'B', 'Thu hoạch cuối vụ - Quả nhỏ', '2024-12-05 15:00:00'),
    (4, 2, '2024-11-18', 1600.00, 8500.00, 'A', 'Thu hoạch lúa nước đợt 1', '2024-11-18 10:00:00'),
    (5, 2, '2024-11-20', 1600.00, 8500.00, 'A', 'Thu hoạch lúa nước đợt 2 - hoàn thành', '2024-11-20 10:00:00'),
    (6, 9, '2024-07-03', 1400.00, 8000.00, 'A', 'Thu hoạch lúa nước hè', '2024-07-03 10:00:00'),
    (7, 9, '2024-07-05', 1350.00, 8000.00, 'B', 'Đợt cuối', '2024-07-05 10:00:00'),
    (8, 3, '2025-03-02', 260.00, 17500.00, 'A', 'Thu hoạch sớm phục vụ đơn hàng thử nghiệm', '2025-03-02 16:00:00'),
    (9, 4, '2025-02-28', 900.00, 8500.00, 'A', 'Thu hoạch lúa nước trước mốc chính vụ', '2025-02-28 17:00:00'),
    (10, 5, '2025-02-08', 180.00, 12000.00, 'B', 'Thu hoạch lạc lứa đầu', '2025-02-08 11:00:00'),
    (11, 15, '2026-02-08', 1100.00, 12500.00, 'A', 'Thu hoạch đậu đen đợt 1', '2026-02-08 16:00:00'),
    (12, 15, '2026-02-14', 950.00, 13000.00, 'A', 'Thu hoạch đậu đen đợt cuối', '2026-02-14 16:30:00'),
    (13, 16, '2026-03-10', 280.00, 22000.00, 'A', 'Thu sớm đậu nành cho kênh online', '2026-03-10 11:00:00'),
    (14, 16, '2026-03-17', 190.00, 21500.00, 'B', 'Thu đợt tiếp theo để test doanh thu', '2026-03-17 11:00:00'),
    (15, 14, '2026-03-26', 940.00, 15000.00, 'A', 'Thu hoạch ngô ngọt cao nguyên phục vụ kênh online', '2026-03-26 16:30:00');


-- =========================================================
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
                                                                                               (2, 2, 1, 'BT-2026-EXP-01', '2026-05-12', 'IN_STOCK'),
                                                                                               (3, 3, 2, 'UREA-2025-001', '2027-12-31', 'IN_STOCK'),
                                                                                               (4, 4, 2, 'DAP-UNKNOWN-01', NULL, 'IN_STOCK'),
                                                                                               (5, 5, 1, 'WEED-2024-001', '2025-02-01', 'EXPIRED'),
                                                                                               (6, 6, 2, 'KALI-2025-001', '2027-06-30', 'IN_STOCK'),
                                                                                               (7, 1, 1, 'NPK-LOW-2026-01', '2026-12-31', 'IN_STOCK'),
                                                                                               (8, 2, 1, 'BT-ABN-2026-01', '2026-12-31', 'QUARANTINED');

-- =========================================================
-- 11. WAREHOUSES
-- =========================================================
INSERT INTO warehouses (id, farm_id, name, type, province_id, ward_id) VALUES
    (1, 1, 'Kho vật tư Phú Điền', 'INPUT', 1, 1),
    (2, 1, 'Kho nông sản Phú Điền', 'OUTPUT', 1, 1),
    (3, 2, 'Kho An Phát', 'INPUT', 1, 1),
    (4, 4, 'Kho Cao Nguyên Xanh', 'OUTPUT', 2, 2);


-- =========================================================
-- 12. STOCK LOCATIONS
-- =========================================================
INSERT INTO stock_locations (id, warehouse_id, zone, aisle, shelf, bin) VALUES
    (1, 1, 'Khu A', 'Hàng 1', 'Kệ 1', 'Ô 1'),
    (2, 1, 'Khu A', 'Hàng 1', 'Kệ 2', 'Ô 1'),
    (3, 1, 'Khu B', 'Hàng 1', 'Kệ 1', 'Ô 1'),
    (4, 3, 'Khu chính', 'Hàng 1', 'Kệ 1', 'Ô 1'),
    (5, 4, 'Khu C', 'Hàng 1', 'Kệ 1', 'Ô 1');


-- =========================================================
-- 13. STOCK MOVEMENTS (IN, OUT, ADJUST)
-- =========================================================
INSERT INTO stock_movements (id, supply_lot_id, warehouse_id, location_id, movement_type, quantity, movement_date, season_id, task_id, note) VALUES
(1, 1, 1, 1, 'IN', 200.000, '2025-01-02 08:00:00', NULL, NULL, 'Initial intake for NPK lot'),
(2, 1, 1, 1, 'OUT', 50.000, '2025-01-08 14:00:00', 3, 2, 'Issued for base fertilizing task'),
(3, 1, 1, 1, 'ADJUST', -5.000, '2025-01-15 16:00:00', NULL, NULL, 'Handling loss adjustment'),
(4, 2, 1, 2, 'IN', 50.000, '2026-04-01 09:00:00', NULL, NULL, 'Incoming bio pesticide batch'),
(5, 2, 1, 2, 'OUT', 10.000, '2026-04-10 08:00:00', 19, NULL, 'Issued for active season'),
(6, 3, 1, 3, 'IN', 500.000, '2025-01-05 09:00:00', NULL, NULL, 'Urea annual purchase'),
(7, 3, 1, 3, 'OUT', 60.000, '2025-01-20 08:00:00', 4, 10, 'Issued for rice top-dressing'),
(8, 4, 3, 4, 'IN', 150.000, '2026-03-15 10:00:00', NULL, NULL, 'DAP batch with unknown expiry'),
(9, 4, 3, 4, 'OUT', 20.000, '2026-04-05 07:30:00', 19, 18, 'Issued for active season task'),
(10, 5, 1, 2, 'IN', 40.000, '2025-01-02 08:30:00', NULL, NULL, 'Legacy herbicide intake'),
(11, 5, 1, 2, 'OUT', 5.000, '2025-01-18 07:00:00', 3, NULL, 'Used before expiry'),
(12, 6, 3, 4, 'IN', 120.000, '2025-01-10 10:00:00', NULL, NULL, 'Potassium intake for farm 2'),
(13, 6, 3, 4, 'OUT', 20.000, '2025-02-01 08:30:00', 5, 14, 'Issued for peanut season'),
(14, 7, 1, 1, 'IN', 4.000, '2026-04-18 08:00:00', NULL, NULL, 'Small lot to cover low-stock scenario'),
(15, 7, 1, 1, 'OUT', 1.000, '2026-04-22 09:30:00', 19, 19, 'Issued to field team'),
(16, 8, 1, 2, 'IN', 80.000, '2026-04-05 08:00:00', NULL, NULL, 'Quarantined batch intake'),
(17, 8, 1, 2, 'ADJUST', -10.000, '2026-04-20 14:00:00', NULL, NULL, 'Damaged package adjustment'),
(18, 8, 1, 2, 'ADJUST', 5.000, '2026-04-24 11:00:00', NULL, NULL, 'Recount correction'),
(19, 8, 1, 2, 'OUT', 5.000, '2026-04-25 09:00:00', 19, NULL, 'Emergency issue after recount');

-- =========================================================
-- 14. INVENTORY BALANCES
-- =========================================================
INSERT INTO inventory_balances (id, supply_lot_id, warehouse_id, location_id, quantity) VALUES
                                                                                            (1, 1, 1, 1, 145.000),
                                                                                            (2, 2, 1, 2, 40.000),
                                                                                            (3, 3, 1, 3, 440.000),
                                                                                            (4, 4, 3, 4, 130.000),
                                                                                            (5, 5, 1, 2, 35.000),
                                                                                            (6, 6, 3, 4, 100.000),
                                                                                            (7, 7, 1, 1, 3.000),
                                                                                            (8, 8, 1, 2, 70.000);

-- =========================================================
-- 15. DOCUMENTS
-- =========================================================
INSERT INTO documents (document_id, title, url, description, crop, stage, topic, is_active, is_public, created_by, document_type, view_count, is_pinned, created_at, updated_at) VALUES
                                                                                                                                                                                                 (1, 'Quy trinh trong dau nanh theo GAP', 'https://example.com/docs/soybean-gap.pdf', 'Tai lieu van hanh chuan cho cay dau nanh.', 'Dau nanh', 'ALL', 'GUIDE', TRUE, TRUE, 1, 'GUIDE', 125, TRUE, '2024-01-15 08:00:00', NOW()),
                                                                                                                                                                                                 (2, 'Lich thoi vu 2026', 'https://example.com/docs/calendar-2026.pdf', 'Lich ke hoach vu mua dung cho dashboard va planning.', NULL, 'ALL', 'CALENDAR', TRUE, TRUE, 1, 'GUIDE', 98, TRUE, '2025-12-01 08:00:00', NOW()),
                                                                                                                                                                                                 (3, 'Ky thuat canh tac lua OM5451', 'https://example.com/docs/om5451-guide.pdf', 'Tai lieu chi tiet cho lua OM5451 va phong tru sau benh.', 'Lua nuoc', 'GROWING', 'GUIDE', TRUE, TRUE, 1, 'GUIDE', 71, FALSE, '2024-06-01 08:00:00', NOW()),
                                                                                                                                                                                                 (4, 'SOP thuoc bao ve thuc vat (Luu tru)', 'https://example.com/docs/legacy-pesticide-sop.pdf', 'Tai lieu cu duoc giu lai phuc vu audit, khong dung van hanh.', NULL, 'ALL', 'ARCHIVE', FALSE, FALSE, 1, 'GUIDE', 14, FALSE, '2023-02-01 08:00:00', NOW()),
                                                                                                                                                                                                 (5, 'Mau so nhat ky dong ruong', 'https://example.com/docs/field-log-template.xlsx', 'Template ghi nhat ky cong viec cho farmer va employee.', NULL, 'ALL', 'TEMPLATE', TRUE, TRUE, 1, 'TEMPLATE', 33, FALSE, '2024-03-01 08:00:00', NOW()),
                                                                                                                                                                                                 (6, 'Thong bao cap nhat he thong Q2/2026', 'https://example.com/docs/system-update-2026-q2.pdf', 'Thong bao tinh nang moi phuc vu demo toan bo luong nghiep vu.', NULL, 'ALL', 'ANNOUNCEMENT', TRUE, TRUE, 1, 'ANNOUNCEMENT', 172, TRUE, '2026-04-01 08:00:00', NOW()),
                                                                                                                                                                                                 (7, 'Huong dan su dung ung dung', 'https://example.com/docs/user-guide.pdf', 'Huong dan tong quan cho admin, farmer, buyer va employee.', NULL, 'ALL', 'HELP', TRUE, TRUE, 1, 'SYSTEM_HELP', 210, FALSE, '2024-01-01 08:00:00', NOW()),
                                                                                                                                                                                                 (8, 'Checklist xu ly su co noi bo', 'https://example.com/docs/internal-incident-checklist.pdf', 'Tai lieu noi bo cho dien tap incident, khong cong khai.', NULL, 'ALL', 'CHECKLIST', FALSE, FALSE, 1, 'TEMPLATE', 9, FALSE, '2025-08-01 08:00:00', NOW());
 
-- =========================================================
-- 16. INCIDENTS (All severities & statuses)
-- =========================================================
INSERT INTO incidents (id, season_id, reported_by, incident_type, severity, status, description, deadline, resolved_at, created_at) VALUES
    (1, 3, 2, 'DISEASE', 'MEDIUM', 'OPEN', 'Phát hiện bệnh sương mai trên lá đậu nành', '2025-02-15', NULL, NOW()),
    (2, 4, 2, 'PEST', 'HIGH', 'OPEN', 'Rầy nâu xuất hiện với mật độ cao', '2025-02-10', NULL, NOW()),
    (3, 3, 2, 'PEST', 'LOW', 'IN_PROGRESS', 'Rầy mềm trên ngọn đậu nành - đang xử lý', '2025-02-20', NULL, '2025-02-01 09:00:00'),
    (4, 1, 2, 'DISEASE', 'MEDIUM', 'RESOLVED', 'Bệnh thán thư trên quả - đã kiểm soát', '2024-11-20', '2024-11-18 10:00:00', '2024-11-10 08:00:00'),
    (5, 2, 2, 'WEATHER', 'HIGH', 'RESOLVED', 'Mưa lớn gây ngập ruộng - đã thoát nước', '2024-10-15', '2024-10-12 16:00:00', '2024-10-10 06:00:00'),
    (6, 8, 2, 'OTHER', 'LOW', 'CANCELLED', 'Sự cố đã hủy cùng vụ mùa', NULL, NULL, '2024-11-05 10:00:00'),
    (7, 16, @farmer_user_id, 'DISEASE', 'HIGH', 'OPEN', 'Đốm lá xuất hiện trên đậu nành lô A1', '2026-03-28', NULL, '2026-03-18 08:30:00'),
    (8, 16, @farmer_user_id, 'PEST', 'MEDIUM', 'IN_PROGRESS', 'Sâu xanh gây hại cục bộ', '2026-03-30', NULL, '2026-03-17 09:00:00'),
    (9, 15, @farmer_user_id, 'WEATHER', 'LOW', 'RESOLVED', 'Mưa trái mùa lúc cận thu', '2026-02-13', '2026-02-13 18:00:00', '2026-02-12 11:00:00'),
    (10, 17, @farmer_user_id, 'OTHER', 'LOW', 'OPEN', 'Cảnh báo nguy cơ thiếu nhân công mùa cao điểm', '2027-03-20', NULL, '2026-03-18 09:15:00');


-- =========================================================
-- 17. ALERTS (All types, severities & statuses)
-- =========================================================
INSERT INTO alerts (id, type, severity, status, farm_id, season_id, plot_id, crop_id, title, message, suggested_action_type, suggested_action_url, recipient_farmer_ids, created_at, sent_at) VALUES
    (1, 'TASK_OVERDUE', 'HIGH', 'NEW', 1, 4, 2, 1, 'Công việc quá hạn', 'Phun thuốc trừ cỏ đã quá hạn 10 ngày', 'VIEW_TASK', '/tasks/11', '2', NOW(), NULL),
    (2, 'INVENTORY_EXPIRING', 'MEDIUM', 'NEW', 1, NULL, NULL, NULL, 'Vật tư sắp hết hạn', 'Thuốc trừ sâu sinh học B1 sẽ hết hạn vào 15/03/2025', 'VIEW_INVENTORY', '/inventory', '2', NOW(), NULL),
    (3, 'INCIDENT_OPEN', 'HIGH', 'SENT', 1, 4, 2, 1, 'Sự cố cần xử lý', 'Rầy nâu xuất hiện với mật độ cao trên ruộng lúa nước', 'VIEW_INCIDENT', '/incidents/2', '2', NOW(), NOW()),
    (4, 'BUDGET_OVERSPEND', 'MEDIUM', 'SENT', 1, 3, 1, 2, 'Vượt ngân sách', 'Chi phí vụ đậu nành đã vượt 15% so với dự kiến', 'VIEW_EXPENSES', '/expenses?seasonId=3', '2', '2025-02-01 08:00:00', '2025-02-01 08:01:00'),
    (5, 'INVENTORY_EXPIRED', 'CRITICAL', 'ACKNOWLEDGED', 1, NULL, NULL, NULL, 'Vật tư đã hết hạn', 'Thuốc trừ cỏ lô WEED-2024-001 đã hết hạn', 'VIEW_INVENTORY', '/inventory', '2', '2025-02-02 08:00:00', '2025-02-02 08:01:00'),
    (6, 'TASK_OVERDUE', 'MEDIUM', 'RESOLVED', 1, 1, 1, 2, 'Công việc đã hoàn thành', 'Thu hoạch đậu nành đợt cuối', NULL, NULL, '2', '2024-12-01 08:00:00', '2024-12-01 08:01:00'),
    (7, 'INCIDENT_OPEN', 'LOW', 'DISMISSED', 1, 1, 1, 2, 'Sự cố nhỏ', 'Một số lá vàng do thiếu dinh dưỡng', NULL, NULL, '2', '2024-11-15 08:00:00', '2024-11-15 08:01:00'),
    (8, 'INCIDENT_OPEN', 'HIGH', 'NEW', 1, 16, 1, 2, 'Incident mới trên vụ đậu nành hè 2026', 'Đốm lá cần xử lý trong 48h', 'VIEW_INCIDENT', '/incidents/7', '2', '2026-03-18 08:35:00', NULL),
    (9, 'TASK_OVERDUE', 'MEDIUM', 'SENT', 1, 16, 1, 2, 'Task quá hạn hệ thống tưới', 'Task #20 đang quá hạn', 'VIEW_TASK', '/tasks/20', '2', '2026-03-18 09:00:00', '2026-03-18 09:02:00'),
    (10, 'BUDGET_OVERSPEND', 'MEDIUM', 'ACKNOWLEDGED', 1, 16, 1, 2, 'Chi phí đợt 1 vượt dự kiến', 'Chi phí NPK và nhân công cao hơn 12%', 'VIEW_EXPENSES', '/expenses?seasonId=16', '2', '2026-03-18 09:10:00', '2026-03-18 09:11:00'),
    (11, 'INVENTORY_EXPIRING', 'LOW', 'NEW', 1, NULL, NULL, NULL, 'Lô BT-2025-001 sắp hết hạn', 'Cần ưu tiên sử dụng trước 2026-04-15', 'VIEW_INVENTORY', '/inventory', '2', '2026-03-18 09:20:00', NULL),
    (12, 'TASK_OVERDUE', 'LOW', 'RESOLVED', 2, 15, 6, 4, 'Task đóng gói đã hoàn tất', 'Task #25 đã hoàn tất và đóng lương', NULL, NULL, '2', '2026-02-15 18:00:00', '2026-02-15 18:05:00');


-- =========================================================
-- 18. NOTIFICATIONS (for user_id = 2)
-- =========================================================
INSERT INTO notifications (id, user_id, title, message, link, alert_id, created_at, read_at) VALUES
    (1, 2, 'Công việc quá hạn', 'Phun thuốc trừ cỏ cho vụ lúa nước đã quá hạn', '/tasks/11', 1, NOW(), NULL),
    (2, 2, 'Vật tư sắp hết hạn', 'Thuốc trừ sâu sinh học B1 sẽ hết hạn trong 45 ngày', '/inventory', 2, NOW(), NULL),
    (3, 2, 'Sự cố mới', 'Rầy nâu xuất hiện trên ruộng lúa nước - cần xử lý gấp', '/incidents/2', 3, NOW(), NULL),
    (4, 2, 'Chi phí vượt ngân sách', 'Vụ đậu nành Xuân 2025 đã vượt ngân sách 15%', '/expenses?seasonId=3', 4, '2025-02-01 08:00:00', '2025-02-01 10:00:00'),
    (5, 2, 'Vật tư hết hạn', 'Thuốc trừ cỏ lô WEED-2024-001 đã hết hạn sử dụng', '/inventory', 5, '2025-02-02 08:00:00', '2025-02-02 09:00:00'),
    (6, 2, 'Vụ mùa hoàn thành', 'Vụ Đậu nành Đông 2024 đã hoàn thành thành công', '/seasons/1', NULL, '2024-12-05 17:00:00', '2024-12-05 18:00:00'),
    (7, 2, 'Chào mừng!', 'Chào mừng bạn đến với hệ thống Quản lý Mùa vụ ACM', '/dashboard', NULL, '2024-06-01 08:00:00', '2024-06-01 08:30:00'),
    (8, @farmer_user_id, 'Incident mới cần xử lý', 'Vụ đậu nành hè 2026 có incident đốm lá', '/incidents/7', 8, '2026-03-18 08:36:00', NULL),
    (9, @farmer_user_id, 'Task quá hạn hệ thống tưới', 'Nhân viên chưa xử lý task #20', '/tasks/20', 9, '2026-03-18 09:03:00', NULL),
    (10, @employee_user_id, 'Bạn được giao task mới', 'Task #19 và #26 đã được cấp cho đội', '/employee/tasks', NULL, '2026-03-18 09:05:00', NULL),
    (11, @employee2_user_id, 'Task quá hạn cần cập nhật', 'Vui lòng báo cáo tiến độ task #20', '/employee/progress', NULL, '2026-03-18 09:06:00', NULL),
    (12, @farmer_user_id, 'Cảnh báo vật tư sắp hết hạn', 'Lô BT-2025-001 cần được ưu tiên sử dụng', '/inventory', 11, '2026-03-18 09:21:00', NULL);


-- =========================================================
-- 19. FIELD LOGS
-- =========================================================
INSERT INTO field_logs (field_log_id, season_id, log_date, log_type, notes, created_at) VALUES
    (1, 3, '2025-01-06', 'TRANSPLANT', 'Cấy 1200 cây đậu nành, tỉ lệ sống 96%', '2025-01-06 17:00:00'),
    (2, 3, '2025-01-15', 'WEATHER', 'Trời nắng ấm 28°C, thuận lợi cho sinh trưởng', '2025-01-15 08:00:00'),
    (3, 3, '2025-01-20', 'GROWTH', 'Cây cao 25cm, bắt đầu phân cành', '2025-01-20 10:00:00'),
    (4, 3, '2025-02-01', 'PEST', 'Phát hiện rầy mềm, mật độ thấp', '2025-02-01 09:00:00'),
    (5, 3, '2025-02-05', 'FERTILIZE', 'Bón NPK thúc đợt 1, 20kg/sào', '2025-02-05 16:00:00'),
    (6, 4, '2025-01-10', 'IRRIGATE', 'Bơm nước vào ruộng, mực nước 5cm', '2025-01-10 06:00:00'),
    (7, 4, '2025-01-25', 'GROWTH', 'Lúa nước bắt đầu đẻ nhánh', '2025-01-25 10:00:00'),
    (8, 4, '2025-02-10', 'WEATHER', 'Mưa nhỏ, thuận lợi cho giai đoạn làm đòng', '2025-02-10 08:00:00'),
    (9, 5, '2025-01-12', 'OTHER', 'Rau mọc đều, tỉ lệ nảy mầm 90%', '2025-01-12 08:00:00'),
    (10, 5, '2025-01-20', 'WEED', 'Nhổ cỏ xung quanh luống', '2025-01-20 16:00:00'),
    (11, 15, '2026-02-12', 'HARVEST', 'Đã thu hoạch 100% và đóng gói tại ruộng', '2026-02-12 17:30:00'),
    (12, 16, '2026-03-16', 'FERTILIZE', 'Đợt bón phân 1 đang triển khai theo plan', '2026-03-16 16:10:00'),
    (13, 16, '2026-03-18', 'PEST', 'Ghi nhận vết bệnh lá mức độ nhẹ', '2026-03-18 10:00:00'),
    (14, 17, '2027-02-25', 'OTHER', 'Pre-check đất và kế hoạch nhân công cho năm 4 của chu kỳ', '2026-03-18 10:30:00');


-- =========================================================
-- 20. DOCUMENT FAVORITES & RECENT OPENS (for user_id = 2)
-- =========================================================
INSERT INTO document_favorites (id, user_id, document_id, created_at) VALUES
    (1, 2, 1, '2025-01-10 08:00:00'),
    (2, 2, 3, '2025-01-15 09:00:00'),
    (3, 2, 6, '2025-01-20 10:00:00'),
    (4, @farmer_user_id, 2, '2026-03-18 08:40:00'),
    (5, @employee_user_id, 7, '2026-03-18 08:45:00');


INSERT INTO document_recent_opens (id, user_id, document_id, opened_at) VALUES
    (1, 2, 1, '2025-01-27 08:00:00'),
    (2, 2, 6, '2025-01-26 14:00:00'),
    (3, 2, 3, '2025-01-25 10:00:00'),
    (4, 2, 4, '2025-01-24 16:00:00'),
    (5, 2, 2, '2025-01-20 09:00:00'),
    (6, @farmer_user_id, 6, '2026-03-18 08:50:00'),
    (7, @employee_user_id, 7, '2026-03-18 08:55:00'),
    (8, @employee2_user_id, 5, '2026-03-18 09:00:00');


-- =========================================================
-- 21. USER PREFERENCES
-- =========================================================
INSERT INTO user_preferences (id, user_id, currency_code, weight_unit, locale, created_at, updated_at) VALUES
    (1, 2, 'VND', 'KG', 'vi-VN', '2024-06-01 08:00:00', NOW()),
    (2, @employee_user_id, 'VND', 'KG', 'vi-VN', '2026-03-18 08:00:00', '2026-03-18 08:00:00'),
    (3, @employee2_user_id, 'USD', 'KG', 'en-US', '2026-03-18 08:00:00', '2026-03-18 08:00:00'),
    (4, @buyer_user_id, 'VND', 'KG', 'vi-VN', '2026-04-01 08:00:00', '2026-04-01 08:00:00'),
    (5, @farmer2_user_id, 'VND', 'KG', 'vi-VN', '2026-04-01 08:05:00', '2026-04-01 08:05:00');


-- =========================================================
-- 22. AUDIT LOGS
-- =========================================================
INSERT INTO audit_logs (audit_log_id, entity_type, entity_id, operation, performed_by, performed_at, snapshot_data, reason, ip_address) VALUES
    (1, 'SEASON', 8, 'UPDATE', 'farmer', '2024-11-15 10:00:00', '{"status":"ACTIVE","seasonName":"2024 - Vu dau nanh bi huy"}', 'Huy vu do thoi tiet xau', '192.168.1.100'),
    (2, 'FARM', 3, 'UPDATE', 'farmer', '2024-12-01 08:00:00', '{"active":true,"name":"Khu thu nghiem Ngu Coc"}', 'Tam ngung hoat dong', '192.168.1.100'),
    (3, 'SEASON', 9, 'UPDATE', 'farmer', '2024-08-01 08:00:00', '{"status":"COMPLETED"}', 'Luu tru vu mua cu', '192.168.1.100'),
    (4, 'MARKETPLACE_ORDER', 1, 'CREATE', 'buyer', '2026-04-20 09:05:00', '{"status":"COMPLETED","paymentMethod":"COD","orderCode":"MPO-2026-0001"}', 'Tao don demo COD hoan tat', '10.10.0.21'),
    (5, 'MARKETPLACE_ORDER', 2, 'PAYMENT_VERIFIED', 'admin', '2026-04-20 10:30:00', '{"status":"PREPARING","paymentVerificationStatus":"VERIFIED","orderCode":"MPO-2026-0002"}', 'Xac minh chuyen khoan cho don seller 2', '10.10.0.11'),
    (6, 'MARKETPLACE_ORDER', 3, 'PAYMENT_PROOF_SUBMITTED', 'buyer', '2026-04-22 11:05:00', '{"status":"PENDING","paymentVerificationStatus":"SUBMITTED","orderCode":"MPO-2026-0003"}', 'Buyer tai minh chung chuyen khoan', '10.10.0.21'),
    (7, 'MARKETPLACE_ORDER', 4, 'CREATE', 'buyer', '2026-04-24 08:30:00', '{"status":"CONFIRMED","paymentVerificationStatus":"AWAITING_PROOF","orderCode":"MPO-2026-0004"}', 'Don da xac nhan, cho nop bang chung thanh toan', '10.10.0.21'),
    (8, 'MARKETPLACE_ORDER', 5, 'PAYMENT_VERIFIED', 'admin', '2026-04-24 14:00:00', '{"status":"DELIVERING","paymentVerificationStatus":"VERIFIED","orderCode":"MPO-2026-0005"}', 'Xac minh thanh toan va ban giao don cho van chuyen', '10.10.0.11'),
    (9, 'MARKETPLACE_ORDER', 6, 'PAYMENT_REJECTED', 'admin', '2026-04-26 10:30:00', '{"status":"CANCELLED","paymentVerificationStatus":"REJECTED","orderCode":"MPO-2026-0006"}', 'Bang chung khong hop le, huy don', '10.10.0.11');


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
    (5, 5, 0.020000, 'VN-CORN-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
    (6, 6, 0.022000, 'VN-CHILI-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
    (7, 7, 0.004500, 'VN-POTATO-N-REF-2024', TRUE, '2025-01-01 08:00:00', '2025-01-01 08:00:00');

-- =========================================================
-- 25. ADDITIONAL HARVESTS (active seasons for dashboard output)
-- =========================================================
INSERT INTO harvests (harvest_id, season_id, harvest_date, quantity, unit, grade, note, created_at) VALUES
    (16, 6, '2022-04-22', 520.00, 13500.00, 'A', 'Final batch for season 6 historical closure', '2022-04-22 17:00:00'),
    (17, 7, '2022-07-26', 1950.00, 9800.00, 'A', 'Main black bean harvest for season 7', '2022-07-26 17:00:00'),
    (18, 8, '2022-11-22', 2650.00, 11200.00, 'A', 'Corn harvest closeout for season 8', '2022-11-22 17:00:00'),
    (19, 10, '2023-08-22', 3350.00, 8400.00, 'A', 'Rice harvest consolidation for season 10', '2023-08-22 17:00:00'),
    (20, 11, '2023-12-22', 580.00, 12800.00, 'A', 'Peanut harvest final batch for season 11', '2023-12-22 16:30:00'),
    (21, 12, '2024-04-23', 2900.00, 11500.00, 'A', 'Corn harvest finalization for season 12', '2024-04-23 17:00:00'),
    (22, 13, '2024-07-26', 2150.00, 9900.00, 'A', 'Black bean harvest finalization for season 13', '2024-07-26 16:45:00'),
    (23, 17, '2025-12-23', 3150.00, 12100.00, 'A', 'Cycle-1 closeout corn harvest for season 17', '2025-12-23 17:10:00'),
    (24, 18, '2026-04-14', 1200.00, 12400.00, 'A', 'Cycle-2 kickoff soybean harvest closure for season 18', '2026-04-14 16:40:00'),
    (25, 19, '2026-06-30', 900.00, 14600.00, 'A', 'Interim harvested volume for active season 19', '2026-06-30 17:20:00'),
    (26, 20, '2026-11-20', 0.00, 0.00, NULL, 'Planned season placeholder: no harvest recorded yet', '2026-04-16 08:30:00');


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
    (21, 2, 2, 'SOIL_LEGACY', 70.0000, '2024-09-20', FALSE, 'legacy_aggregate', 'Legacy soil aggregate', '2024-09-20 09:05:00'),
    -- FDN INTEGRATED: 5-year N cycle with harvested legumes + residue incorporation on farm_id = 1 / plot_id = 1
    (22, 10, 1, 'MINERAL_FERTILIZER', 120.0000, '2024-03-12', TRUE, 'fdn_integrated', 'Năm 1 - ngô: phân vô cơ cao, phụ thuộc lớn vào N nhân tạo', '2024-03-12 08:00:00'),
    (23, 10, 1, 'ORGANIC_FERTILIZER', 20.0000, '2024-03-05', TRUE, 'fdn_integrated', 'Năm 1 - ngô: phân hữu cơ nền mức thấp', '2024-03-05 08:00:00'),
    (24, 10, 1, 'BIOLOGICAL_FIXATION', 0.0000, '2024-04-15', FALSE, 'fdn_integrated', 'Năm 1 - ngũ cốc không tự cố định đạm', '2024-04-15 06:00:00'),
    (25, 10, 1, 'ATMOSPHERIC_DEPOSITION', 5.0000, '2024-04-01', FALSE, 'default_reference', 'Năm 1 - lắng đọng khí quyển ổn định', '2024-04-01 06:00:00'),
    (26, 10, 1, 'SEED_IMPORT', 2.0000, '2024-03-01', FALSE, 'default_reference', 'Năm 1 - nguồn N từ hạt giống', '2024-03-01 06:00:00'),
    (27, 10, 1, 'IRRIGATION_WATER', 15.0000, '2024-04-10', FALSE, 'default_reference', 'Năm 1 - N từ nước tưới mức ổn định', '2024-04-10 06:00:00'),
    (28, 10, 1, 'SOIL_LEGACY', 0.0000, '2024-03-01', FALSE, 'fdn_integrated', 'Năm 1 - chưa tính di sản đạm từ vụ trước trong chu kỳ FDN tích hợp', '2024-03-01 06:05:00'),
    (29, 11, 1, 'MINERAL_FERTILIZER', 22.0000, '2025-03-12', TRUE, 'fdn_integrated', 'Năm 2 - đậu nành: bón khoáng khởi đầu mức thấp để tối ưu chi phí nhưng vẫn đảm bảo năng suất', '2025-03-12 08:00:00'),
    (30, 11, 1, 'ORGANIC_FERTILIZER', 18.0000, '2025-03-05', TRUE, 'fdn_integrated', 'Năm 2 - đậu nành: bổ sung hữu cơ nền vừa phải để cải tạo đất', '2025-03-05 08:00:00'),
    (31, 11, 1, 'BIOLOGICAL_FIXATION', 105.0000, '2025-04-25', FALSE, 'external_reference', 'Năm 2 - đậu nành: cố định đạm sinh học cao trong chu kỳ sinh trưởng 70-90 ngày', '2025-04-25 06:00:00'),
    (32, 11, 1, 'ATMOSPHERIC_DEPOSITION', 5.0000, '2025-04-01', FALSE, 'default_reference', 'Năm 2 - lắng đọng khí quyển ổn định', '2025-04-01 06:00:00'),
    (33, 11, 1, 'SEED_IMPORT', 2.0000, '2025-03-01', FALSE, 'default_reference', 'Năm 2 - nguồn N từ hạt giống', '2025-03-01 06:00:00'),
    (34, 11, 1, 'IRRIGATION_WATER', 15.0000, '2025-04-15', FALSE, 'default_reference', 'Năm 2 - N từ nước tưới mức ổn định', '2025-04-15 06:00:00'),
    (35, 11, 1, 'SOIL_LEGACY', 0.0000, '2025-03-01', FALSE, 'fdn_integrated', 'Năm 2 - không cộng soil legacy đầu vụ; di sản đạm sẽ được chuyển sang vụ sau sau 15 ngày xử lý đất', '2025-03-01 06:05:00'),
    (36, 12, 1, 'MINERAL_FERTILIZER', 85.0000, '2026-04-25', TRUE, 'fdn_integrated', 'Năm 3 - lúa Đài Thơm 8: giảm phân vô cơ nhờ đạm tồn dư từ vụ đậu', '2026-04-25 08:00:00'),
    (37, 12, 1, 'ORGANIC_FERTILIZER', 0.0000, '2026-04-12', TRUE, 'fdn_integrated', 'Năm 3 - không bổ sung hữu cơ để làm nổi bật tác động soil legacy', '2026-04-12 08:00:00'),
    (38, 12, 1, 'BIOLOGICAL_FIXATION', 0.0000, '2026-05-20', FALSE, 'fdn_integrated', 'Năm 3 - lúa nước không tự cố định đạm', '2026-05-20 06:00:00'),
    (39, 12, 1, 'ATMOSPHERIC_DEPOSITION', 5.0000, '2026-05-01', FALSE, 'default_reference', 'Năm 3 - lắng đọng khí quyển ổn định', '2026-05-01 06:00:00'),
    (40, 12, 1, 'SEED_IMPORT', 2.0000, '2026-04-10', FALSE, 'default_reference', 'Năm 3 - nguồn N từ giống lúa', '2026-04-10 06:00:00'),
    (41, 12, 1, 'IRRIGATION_WATER', 15.0000, '2026-05-10', FALSE, 'default_reference', 'Năm 3 - N từ nước tưới mức ổn định', '2026-05-10 06:00:00'),
    (42, 12, 1, 'SOIL_LEGACY', 35.0000, '2026-04-10', FALSE, 'fdn_integrated', 'Năm 3 - đạm tồn dư từ vụ đậu năm 2025 sau thu hoạch và cày vùi tàn dư giúp giảm nhu cầu phân khoáng', '2026-04-10 06:05:00'),
    (43, 17, 2, 'MINERAL_FERTILIZER', 18.0000, '2027-03-12', TRUE, 'fdn_integrated', 'Năm 4 - lạc cải tạo đất: bón khoáng mức thấp, ưu tiên sinh học', '2027-03-12 08:00:00'),
    (44, 17, 2, 'ORGANIC_FERTILIZER', 25.0000, '2027-03-05', TRUE, 'fdn_integrated', 'Năm 4 - tăng hữu cơ để phục hồi đất trước năm cuối chu kỳ', '2027-03-05 08:00:00'),
    (45, 17, 2, 'BIOLOGICAL_FIXATION', 95.0000, '2027-04-18', FALSE, 'external_reference', 'Năm 4 - cây họ đậu cố định đạm cao và để lại di sản N', '2027-04-18 06:00:00'),
    (46, 17, 2, 'ATMOSPHERIC_DEPOSITION', 5.0000, '2027-04-01', FALSE, 'default_reference', 'Năm 4 - lắng đọng khí quyển ổn định', '2027-04-01 06:00:00'),
    (47, 17, 2, 'SEED_IMPORT', 2.0000, '2027-03-01', FALSE, 'default_reference', 'Năm 4 - nguồn N từ giống lạc', '2027-03-01 06:00:00'),
    (48, 17, 2, 'IRRIGATION_WATER', 14.0000, '2027-04-12', FALSE, 'default_reference', 'Năm 4 - N từ nước tưới mức trung bình', '2027-04-12 06:00:00'),
    (49, 17, 2, 'SOIL_LEGACY', 0.0000, '2027-03-01', FALSE, 'fdn_integrated', 'Năm 4 - không cộng legacy đầu vụ để quan sát đóng góp cố định sinh học thuần', '2027-03-01 06:05:00'),
    (50, 18, 6, 'MINERAL_FERTILIZER', 70.0000, '2028-01-25', TRUE, 'fdn_integrated', 'Năm 5 - ngô xuân: giảm phân khoáng nhờ soil legacy tích lũy qua 4 năm', '2028-01-25 08:00:00'),
    (51, 18, 6, 'ORGANIC_FERTILIZER', 12.0000, '2028-01-15', TRUE, 'fdn_integrated', 'Năm 5 - bổ sung hữu cơ mức duy trì', '2028-01-15 08:00:00'),
    (52, 18, 6, 'BIOLOGICAL_FIXATION', 0.0000, '2028-02-20', FALSE, 'fdn_integrated', 'Năm 5 - ngũ cốc không tự cố định đạm', '2028-02-20 06:00:00'),
    (53, 18, 6, 'ATMOSPHERIC_DEPOSITION', 5.0000, '2028-02-01', FALSE, 'default_reference', 'Năm 5 - lắng đọng khí quyển ổn định', '2028-02-01 06:00:00'),
    (54, 18, 6, 'SEED_IMPORT', 2.0000, '2028-01-10', FALSE, 'default_reference', 'Năm 5 - nguồn N từ giống ngô', '2028-01-10 06:00:00'),
    (55, 18, 6, 'IRRIGATION_WATER', 13.0000, '2028-02-12', FALSE, 'default_reference', 'Năm 5 - N từ nước tưới mức ổn định', '2028-02-12 06:00:00'),
    (56, 18, 6, 'SOIL_LEGACY', 42.0000, '2028-01-10', FALSE, 'fdn_integrated', 'Năm 5 - đạm tồn dư từ năm 4 giúp duy trì năng suất với đầu vào khoáng thấp', '2028-01-10 06:05:00');

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
     'Backfill legacy IRRIGATION_WATER event #16', 2, '2024-10-20 09:10:00'),
    (6, 17, 2, '2027-04-02', 7.5000, 1.5000, NULL, 1100.0000,
     NULL, NULL, FALSE, TRUE, 'LAB_MEASURED', 'https://example.com/lab/irrigation-a2-20270402.pdf', 'LAB-ROT5Y-IRR-270402',
     'Mẫu nước tưới vụ lạc năm 4', 2, '2027-04-02 10:00:00'),
    (7, 18, 6, '2028-02-14', NULL, NULL, 10.5000, 950.0000,
     NULL, NULL, FALSE, TRUE, 'USER_ENTERED', NULL, 'LAB-ROT5Y-IRR-280214',
     'Mẫu tổng N nước tưới vụ ngô năm 5', 2, '2028-02-14 09:30:00');

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
     'Backfill legacy SOIL_LEGACY event #17', 2, '2024-10-20 09:20:00'),
    (5, 17, 2, '2027-04-03', 4.1000, 12.5000, 16.0000, 4.5000,
     NULL, NULL, FALSE, TRUE, 'LAB_MEASURED', 'https://example.com/lab/soil-a2-20270403.pdf', 'LAB-ROT5Y-SOIL-270403',
     'Mẫu đất vụ lạc cải tạo năm 4', 2, '2027-04-03 14:00:00'),
    (6, 18, 6, '2028-02-15', 3.3000, 14.0000, 13.0000, 4.2000,
     NULL, NULL, FALSE, TRUE, 'LAB_MEASURED', 'https://example.com/lab/soil-b1-20280215.pdf', 'LAB-ROT5Y-SOIL-280215',
     'Mẫu đất vụ ngô năm 5 để kiểm tra duy trì soil legacy', 2, '2028-02-15 14:30:00');

-- =========================================================
-- 29. LABOR MANAGEMENT SEED
-- =========================================================
INSERT INTO season_employees (id, season_id, employee_user_id, added_by_user_id, wage_per_task, active, created_at) VALUES
    (1, 3, 2, 1, 180000.00, b'1', '2025-01-05 09:00:00'),
    (2, 4, 2, 1, 220000.00, b'1', '2024-12-25 09:00:00'),
    (3, 5, 2, 1, 140000.00, b'1', '2025-01-10 09:00:00'),
    (4, 16, @employee_user_id, @farmer_user_id, 210000.00, b'1', '2026-02-20 09:00:00'),
    (5, 16, @employee2_user_id, @farmer_user_id, 195000.00, b'1', '2026-02-20 09:05:00'),
    (6, 17, @employee_user_id, @farmer_user_id, 230000.00, b'1', '2026-03-18 09:30:00'),
    (7, 17, @employee2_user_id, @farmer_user_id, 180000.00, b'0', '2026-03-18 09:35:00');


INSERT INTO task_progress_logs (id, task_id, employee_user_id, progress_percent, note, evidence_url, logged_at) VALUES
    (1, 4, 2, 55, 'Hoàn thành khoảng 55% khối lượng bón thúc đợt 1', 'https://example.com/evidence/task-4-progress.jpg', '2025-02-06 11:00:00'),
    (2, 12, 2, 60, 'Đã bón được 60% diện tích lô A2', 'https://example.com/evidence/task-12-progress.jpg', '2025-02-13 15:00:00'),
    (3, 14, 2, 80, 'Duy trì tưới đều sáng chiều', 'https://example.com/evidence/task-14-progress.jpg', '2025-01-28 17:00:00'),
    (4, 18, @employee_user_id, 40, 'Đã bón 40% diện tích', 'https://example.com/evidence/task-18-p40.jpg', '2026-03-16 11:00:00'),
    (5, 18, @employee_user_id, 75, 'Cập nhật tiến độ sau bổ sung nhân lực', 'https://example.com/evidence/task-18-p75.jpg', '2026-03-18 14:30:00'),
    (6, 20, @employee2_user_id, 15, 'Đã kiểm tra một phần đường ống', 'https://example.com/evidence/task-20-p15.jpg', '2026-03-06 16:00:00'),
    (7, 17, @employee_user_id, 100, 'Hoàn tất làm đất', 'https://example.com/evidence/task-17-done.jpg', '2026-02-21 17:30:00'),
    (8, 22, @employee_user_id, 100, 'Thu hoạch và bàn giao đầy đủ', 'https://example.com/evidence/task-22-done.jpg', '2026-02-14 18:30:00');


INSERT INTO payroll_records (id, employee_user_id, season_id, period_start, period_end, total_assigned_tasks, total_completed_tasks, wage_per_task, total_amount, generated_at, note) VALUES
    (1, 2, 3, '2025-01-01', '2025-01-31', 7, 3, 180000.00, 540000.00, '2025-02-01 09:00:00', 'Tổng hợp lương theo task tháng 01/2025'),
    (2, 2, 4, '2025-01-01', '2025-01-31', 5, 3, 220000.00, 660000.00, '2025-02-01 09:05:00', 'Lương nhân công ruộng lúa nước tháng 01/2025'),
    (3, 2, 5, '2025-01-01', '2025-01-31', 3, 1, 140000.00, 140000.00, '2025-02-01 09:10:00', 'Lương chăm sóc lạc tháng 01/2025'),
    (4, @employee_user_id, 16, '2026-03-01', '2026-03-31', 5, 2, 210000.00, 420000.00, '2026-04-01 08:00:00', 'Lương tạm tính theo tiến độ tháng 03/2026'),
    (5, @employee2_user_id, 16, '2026-03-01', '2026-03-31', 3, 0, 195000.00, 0.00, '2026-04-01 08:05:00', 'Nhân viên 2 chưa hoàn tất task nào trong tháng'),
    (6, @employee_user_id, 15, '2026-02-01', '2026-02-28', 2, 2, 200000.00, 400000.00, '2026-03-01 08:00:00', 'Lương chốt cho vụ đậu đen đã hoàn tất');


-- =========================================================
-- 30. PRODUCT WAREHOUSE LOTS & TRANSACTIONS
-- =========================================================
INSERT INTO product_warehouse_lots (id, lot_code, product_id, product_name, product_variant, season_id, farm_id, plot_id, harvest_id, warehouse_id, location_id,
     harvested_at, received_at, unit, initial_quantity, on_hand_quantity, grade, quality_status, traceability_data, note, status,
     created_by, created_at, updated_at) VALUES
    (1, 'LOT-SOYBEAN-2025-03-01', 1001, 'Dau nanh AGS398', 'Loai A', 3, 1, 1, 8, 2, NULL,
     '2025-03-02', '2025-03-02 18:00:00', 'kg', 260.000, 210.000, 'A', 'FRESH',
     '{"harvestTaskId":7,"route":"plot-1->output-warehouse-2"}', 'Lo dau nanh baseline cho draft listing flow', 'IN_STOCK',
     2, '2025-03-02 18:00:00', '2025-03-05 09:00:00'),
    (2, 'LOT-PADDYRICE-2025-02-01', 2001, 'Lua nuoc OM5451', 'Lua kho tieu chuan', 4, 1, 2, 9, 2, NULL,
     '2025-02-28', '2025-02-28 18:00:00', 'kg', 900.000, 780.000, 'A', 'DRY',
     '{"harvestTaskId":12,"route":"plot-2->output-warehouse-2"}', 'Lo lua published chinh cho buyer catalog', 'IN_STOCK',
     2, '2025-02-28 18:00:00', '2025-03-03 09:00:00'),
    (3, 'LOT-PEANUT-2025-02-01', 3001, 'Lac tuoi', 'Loai tuoi', 5, 2, 7, 10, 3, NULL,
     '2025-02-08', '2025-02-08 12:00:00', 'kg', 180.000, 150.000, 'B', 'FRESH',
     '{"harvestTaskId":15,"route":"plot-7->warehouse-3"}', 'Lo lac dung cho pending-review listing', 'IN_STOCK',
     2, '2025-02-08 12:00:00', '2025-02-10 09:00:00'),
    (4, 'LOT-BLACKBEAN-2026-02', 4001, 'Dau den xanh long', 'Loai A', 15, 2, 6, 11, 2, NULL,
     '2026-02-08', '2026-02-08 18:00:00', 'kg', 2050.000, 1930.000, 'A', 'FRESH',
     '{"harvestTaskId":22,"route":"plot-6->warehouse-2"}', 'Lo da an sau campaign tet, dung cho hidden listing', 'IN_STOCK',
     @farmer_user_id, '2026-02-08 18:00:00', '2026-03-18 09:40:00'),
    (5, 'LOT-SOYBEAN-2026-03', 1002, 'Dau nanh AGS398 say kho 2026', 'Loai A/B', 16, 1, 1, 13, 2, NULL,
     '2026-03-10', '2026-03-10 18:30:00', 'kg', 470.000, 8.000, 'A', 'FRESH',
     '{"harvestTaskId":26,"route":"plot-1->warehouse-2"}', 'Lo low-stock de test seller dashboard canh bao ton kho', 'IN_STOCK',
     @farmer_user_id, '2026-03-10 18:30:00', '2026-04-26 09:10:00'),
    (6, 'LOT-CORN-2026-03', 5001, 'Ngo ngot NK7328', 'Loai A', 14, 4, 9, 15, 4, 5,
     '2026-03-26', '2026-03-26 18:00:00', 'kg', 940.000, 900.000, 'A', 'FRESH',
     '{"harvestTaskId":null,"route":"plot-9->warehouse-4"}', 'Lo published cua farmer 2 cho split-order flow', 'IN_STOCK',
     @farmer2_user_id, '2026-03-26 18:00:00', '2026-04-24 08:00:00'),
    (7, 'LOT-HOLD-2026-04', 6001, 'Lua reserve batch', 'Reserve', 19, 1, 2, NULL, 2, NULL,
     '2026-04-18', '2026-04-18 16:00:00', 'kg', 75.000, 75.000, 'A', 'CHECKING',
     '{"reason":"quality-hold"}', 'Lo HOLD de test bo loc trang thai kho thanh pham', 'HOLD',
     @farmer_user_id, '2026-04-18 16:00:00', '2026-04-25 09:00:00'),
    (8, 'LOT-DEP-2026-04', 6002, 'Lac demo depleted', 'Demo', 19, 1, 1, NULL, 2, NULL,
     '2026-04-10', '2026-04-10 17:00:00', 'kg', 40.000, 0.000, 'B', 'DRY',
     '{"reason":"full-consumed"}', 'Lo DEPLETED de test trang thai het ton', 'DEPLETED',
     @farmer_user_id, '2026-04-10 17:00:00', '2026-04-25 10:00:00'),
    (9, 'LOT-ARC-2025-OLD', 6003, 'Archived legacy lot', 'Legacy', 12, 1, 1, NULL, 2, NULL,
     '2025-04-25', '2025-04-25 18:00:00', 'kg', 120.000, 120.000, 'B', 'DRY',
     '{"reason":"retained-for-audit"}', 'Lo ARCHIVED de test lich su traceability', 'ARCHIVED',
     @farmer_user_id, '2025-04-25 18:00:00', '2026-04-01 08:00:00');


INSERT INTO product_warehouse_transactions (id, lot_id, transaction_type, quantity, unit, resulting_on_hand, reference_type, reference_id, note, created_by, created_at) VALUES
    (1, 1, 'RECEIPT_FROM_HARVEST', 260.000, 'kg', 260.000, 'HARVEST', '8', 'Receipt from harvest for soybean lot', 2, '2025-03-02 18:05:00'),
    (2, 1, 'STOCK_OUT', 50.000, 'kg', 210.000, 'ORDER', 'SO-2025-001', 'Stock out to distributor', 2, '2025-03-05 09:00:00'),
    (3, 2, 'RECEIPT_FROM_HARVEST', 900.000, 'kg', 900.000, 'HARVEST', '9', 'Receipt of rice lot', 2, '2025-02-28 18:05:00'),
    (4, 2, 'STOCK_OUT', 120.000, 'kg', 780.000, 'ORDER', 'SO-2025-002', 'Commercial shipment for rice lot', 2, '2025-03-03 09:00:00'),
    (5, 3, 'RECEIPT_FROM_HARVEST', 180.000, 'kg', 180.000, 'HARVEST', '10', 'Peanut lot intake', 2, '2025-02-08 12:10:00'),
    (6, 3, 'ADJUSTMENT', -30.000, 'kg', 150.000, 'INVENTORY_CHECK', 'ADJ-2025-001', 'Post-sorting shrinkage adjustment', 2, '2025-02-10 09:00:00'),
    (7, 4, 'RECEIPT_FROM_HARVEST', 1100.000, 'kg', 1100.000, 'HARVEST', '11', 'Black bean receipt batch 1', @farmer_user_id, '2026-02-08 18:05:00'),
    (8, 4, 'RECEIPT_FROM_HARVEST', 950.000, 'kg', 2050.000, 'HARVEST', '12', 'Black bean receipt batch 2', @farmer_user_id, '2026-02-14 18:05:00'),
    (9, 4, 'STOCK_OUT', 120.000, 'kg', 1930.000, 'ORDER', 'SO-2026-015', 'Stock out to retail channel', @farmer_user_id, '2026-03-01 09:00:00'),
    (10, 5, 'RECEIPT_FROM_HARVEST', 470.000, 'kg', 470.000, 'HARVEST', '13', 'Soybean 2026 lot receipt', @farmer_user_id, '2026-03-10 18:35:00'),
    (11, 5, 'STOCK_OUT', 160.000, 'kg', 310.000, 'ORDER', 'SO-2026-018', 'Initial online/offline mixed shipment', @farmer_user_id, '2026-03-18 09:35:00'),
    (12, 5, 'MARKETPLACE_ORDER_RESERVED', 20.000, 'kg', 290.000, 'MARKETPLACE_ORDER', 'MPO-2026-0004', 'Reserve inventory for confirmed bank-transfer order', @farmer_user_id, '2026-04-24 08:40:00'),
    (13, 5, 'MARKETPLACE_ORDER_RELEASED', 12.000, 'kg', 302.000, 'MARKETPLACE_ORDER', 'MPO-2026-0004', 'Release partial reservation due quantity change', @farmer_user_id, '2026-04-24 10:10:00'),
    (14, 5, 'STOCK_OUT', 294.000, 'kg', 8.000, 'MARKETPLACE_ORDER', 'MPO-2026-0001', 'Final packed-out quantity leaves low-stock remainder', @farmer_user_id, '2026-04-26 09:00:00'),
    (15, 6, 'RECEIPT_FROM_HARVEST', 940.000, 'kg', 940.000, 'HARVEST', '15', 'Corn lot intake for second seller', @farmer2_user_id, '2026-03-26 18:05:00'),
    (16, 6, 'STOCK_OUT', 40.000, 'kg', 900.000, 'ORDER', 'SO-2026-024', 'Early demo shipment from second seller', @farmer2_user_id, '2026-03-29 09:00:00'),
    (17, 6, 'TRANSFER', 120.000, 'kg', 780.000, 'WAREHOUSE_TRANSFER', 'WT-2026-003', 'Transfer to dispatch area before delivery run', @farmer2_user_id, '2026-04-24 14:10:00'),
    (18, 6, 'RETURN', 120.000, 'kg', 900.000, 'WAREHOUSE_TRANSFER', 'WT-2026-003', 'Return unsent quantity back to primary lot', @farmer2_user_id, '2026-04-24 18:20:00'),
    (19, 7, 'RECEIPT_FROM_HARVEST', 75.000, 'kg', 75.000, 'MANUAL', 'LOT-HOLD-2026-04', 'Hold lot intake pending QA release', @farmer_user_id, '2026-04-18 16:10:00'),
    (20, 8, 'RECEIPT_FROM_HARVEST', 40.000, 'kg', 40.000, 'MANUAL', 'LOT-DEP-2026-04', 'Demo depleted lot initial intake', @farmer_user_id, '2026-04-10 17:10:00'),
    (21, 8, 'STOCK_OUT', 40.000, 'kg', 0.000, 'ORDER', 'SO-2026-DEP-01', 'Fully consumed lot for depletion test case', @farmer_user_id, '2026-04-25 10:00:00'),
    (22, 9, 'RECEIPT_FROM_HARVEST', 120.000, 'kg', 120.000, 'MANUAL', 'LOT-ARC-2025-OLD', 'Legacy lot retained only for archive state testing', @farmer_user_id, '2025-04-25 18:05:00'),
    (23, 4, 'ADJUSTMENT', 0.000, 'kg', 1930.000, 'AUDIT', 'QA-2026-04', 'No-op audit entry to complete lot history', @farmer_user_id, '2026-04-26 16:00:00');

-- =========================================================
-- 33. MARKETPLACE DEMO DATA
-- =========================================================
INSERT INTO marketplace_products
    (id, version, slug, name, category, short_description, description, price, unit, stock_quantity, image_url, image_urls_json,
     farmer_user_id, farm_id, season_id, lot_id, traceable, status, published_at, created_at, updated_at)
VALUES
    (1, 0, 'dau-nanh-ags398-thu-nghiem', 'Dau nanh AGS398 thu nghiem', 'SOYBEAN', 'Draft listing for farmer create flow.', 'Used to test draft lifecycle and edit operations before review.', 155000.00, 'kg', 180.000,
     'https://loremflickr.com/1200/800/soybean,beans?lock=3981',
     '["https://loremflickr.com/1200/800/soybean,beans?lock=3981","https://loremflickr.com/1200/800/soybean,agriculture?lock=3982"]',
     2, 1, 3, 1, TRUE, 'DRAFT', NULL, '2026-04-01 08:00:00', '2026-04-01 08:00:00'),

    (2, 0, 'gao-om5451-chon-loc', 'Gao OM5451 chon loc', 'RICE', 'Main published rice listing with complete traceability.', 'Used in buyer catalog, search, and order checkout scenarios.', 125000.00, 'kg', 600.000,
     'https://loremflickr.com/1200/800/rice,grain?lock=5451',
     '["https://loremflickr.com/1200/800/rice,grain?lock=5451","https://loremflickr.com/1200/800/rice,field?lock=5452"]',
     2, 1, 4, 2, TRUE, 'PUBLISHED', '2026-04-02 08:00:00', '2026-04-02 08:00:00', '2026-04-20 08:00:00'),

    (3, 0, 'lac-tuoi-an-phat', 'Lac tuoi An Phat', 'PEANUT', 'Listing waiting admin review.', 'Used to test pending-review filters in farmer and admin dashboards.', 92000.00, 'kg', 120.000,
     'https://loremflickr.com/1200/800/peanut,nuts?lock=9201',
     '["https://loremflickr.com/1200/800/peanut,nuts?lock=9201","https://loremflickr.com/1200/800/peanut,agriculture?lock=9202"]',
     2, 2, 5, 3, TRUE, 'PENDING_REVIEW', NULL, '2026-04-03 08:00:00', '2026-04-03 08:00:00'),

    (4, 0, 'dau-den-cao-cap-tet-2026', 'Dau den cao cap Tet 2026', 'BLACK_BEAN', 'Hidden listing after campaign close.', 'Used to test hidden-status records in analytics and seller tables.', 98000.00, 'kg', 1500.000,
     'https://loremflickr.com/1200/800/blackbeans,beans?lock=20261',
     '["https://loremflickr.com/1200/800/blackbeans,beans?lock=20261","https://loremflickr.com/1200/800/blackbeans,food?lock=20262"]',
     2, 2, 15, 4, TRUE, 'HIDDEN', '2026-03-01 08:00:00', '2026-03-01 08:00:00', '2026-04-05 08:00:00'),

    (5, 0, 'dau-nanh-ags398-say-kho-2026', 'Dau nanh AGS398 say kho 2026', 'SOYBEAN', 'Published low-stock lot for seller dashboard alerts.', 'Used to test low stock KPI and reservation/release inventory flows.', 145000.00, 'kg', 8.000,
     'https://loremflickr.com/1200/800/soybeans,drybeans?lock=3985',
     '["https://loremflickr.com/1200/800/soybeans,drybeans?lock=3985","https://loremflickr.com/1200/800/soybean,harvest?lock=3986"]',
     2, 1, 16, 5, TRUE, 'PUBLISHED', '2026-04-10 08:00:00', '2026-04-10 08:00:00', '2026-04-26 09:20:00'),

    (6, 0, 'ngo-ngot-cao-nguyen-xanh', 'Ngo ngot Cao Nguyen Xanh', 'CORN', 'Published listing owned by second seller.', 'Used for split-order, delivering flow, and multi-farm buyer filters.', 170000.00, 'kg', 820.000,
     'https://loremflickr.com/1200/800/corn,maize?lock=1701',
     '["https://loremflickr.com/1200/800/corn,maize?lock=1701","https://loremflickr.com/1200/800/cornfield,agriculture?lock=1702"]',
     @farmer2_user_id, 4, 14, 6, TRUE, 'PUBLISHED', '2026-04-12 08:00:00', '2026-04-12 08:00:00', '2026-04-24 08:00:00');

INSERT INTO marketplace_carts (id, user_id, created_at, updated_at) VALUES
    (1, @buyer_user_id, '2026-04-20 10:00:00', '2026-04-22 16:00:00');

INSERT INTO marketplace_cart_items (id, cart_id, product_id, quantity, unit_price_snapshot, created_at, updated_at) VALUES
    (1, 1, 2, 0.750, 125000.00, '2026-04-22 15:30:00', '2026-04-22 15:30:00'),
    (2, 1, 6, 1.500, 170000.00, '2026-04-22 16:00:00', '2026-04-22 16:00:00');

INSERT INTO marketplace_addresses
    (id, user_id, full_name, phone, province, district, ward, street, detail, label, is_default, created_at, updated_at)
VALUES
    (1, @buyer_user_id, 'Tran Thi Buyer', '0903234000', 'Đồng Tháp', 'Cao Lãnh', 'Mỹ An', '123 Đường Demo', 'Căn góc, gần trường học', 'home', TRUE, '2026-04-18 08:00:00', '2026-04-18 08:00:00'),
    (2, @buyer_user_id, 'Tran Thi Buyer', '0903234000', 'Hồ Chí Minh', 'Quận 7', 'Tân Phú', '88 Đường Thử Nghiệm', 'Tòa nhà văn phòng', 'office', FALSE, '2026-04-18 08:05:00', '2026-04-18 08:05:00');

INSERT INTO marketplace_order_groups
    (id, group_code, buyer_user_id, idempotency_key, request_fingerprint, created_at)
VALUES
    (1, 'MOG-2026-0001', @buyer_user_id, 'demo-split-order-20260420', 'fp-split-order-20260420', '2026-04-20 09:00:00'),
    (2, 'MOG-2026-0002', @buyer_user_id, 'demo-bank-transfer-20260422', 'fp-bank-transfer-20260422', '2026-04-22 11:00:00'),
    (3, 'MOG-2026-0003', @buyer_user_id, 'demo-order-status-suite-20260424', 'fp-order-status-suite-20260424', '2026-04-24 08:20:00'),
    (4, 'MOG-2026-0004', @buyer_user_id, 'demo-rejected-payment-20260426', 'fp-rejected-payment-20260426', '2026-04-26 09:40:00');

INSERT INTO marketplace_orders
    (id, order_group_id, order_code, buyer_user_id, farmer_user_id, status, payment_method, payment_verification_status,
     payment_proof_file_name, payment_proof_content_type, payment_proof_storage_path, payment_proof_uploaded_at,
     payment_verified_at, payment_verified_by_user_id, payment_verification_note, shipping_recipient_name, shipping_phone,
     shipping_address_line, note, subtotal, shipping_fee, total_amount, created_at, updated_at)
VALUES
    (1, 1, 'MPO-2026-0001', @buyer_user_id, 2, 'COMPLETED', 'COD', 'NOT_REQUIRED',
     NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Tran Thi Buyer', '0903234000',
     '123 Duong Demo, My An, Cao Lanh, Dong Thap', 'Baseline COD completed order for history and product review.', 290000.00, 20000.00, 310000.00, '2026-04-20 09:05:00', '2026-04-21 16:00:00'),
    (2, 1, 'MPO-2026-0002', @buyer_user_id, @farmer2_user_id, 'PREPARING', 'BANK_TRANSFER', 'VERIFIED',
     'proof-order-2.png', 'image/png', 'storage/marketplace/payment-proofs/order-2/proof-order-2.png', '2026-04-20 09:12:00',
     '2026-04-20 10:30:00', 1, 'Payment verified, order moved to preparing state.', 'Tran Thi Buyer', '0903234000',
     '123 Duong Demo, My An, Cao Lanh, Dong Thap', 'Preparing order used for admin payment verification workflow.', 212500.00, 20000.00, 232500.00, '2026-04-20 09:10:00', '2026-04-22 09:00:00'),
    (3, 2, 'MPO-2026-0003', @buyer_user_id, 2, 'PENDING', 'BANK_TRANSFER', 'SUBMITTED',
     'proof-order-3.jpg', 'image/jpeg', 'storage/marketplace/payment-proofs/order-3/proof-order-3.jpg', '2026-04-22 11:05:00',
     NULL, NULL, 'Buyer submitted payment proof and waits for admin decision.', 'Tran Thi Buyer', '0903234000',
     '123 Duong Demo, My An, Cao Lanh, Dong Thap', 'Pending order used to test SUBMITTED state.', 437500.00, 20000.00, 457500.00, '2026-04-22 11:00:00', '2026-04-22 11:05:00'),
    (4, 3, 'MPO-2026-0004', @buyer_user_id, 2, 'CONFIRMED', 'BANK_TRANSFER', 'AWAITING_PROOF',
     NULL, NULL, NULL, NULL,
     NULL, NULL, 'Order confirmed but waiting buyer to upload transfer proof.', 'Tran Thi Buyer', '0903234000',
     '88 Duong Thu Nghiem, Tan Phu, Quan 7, Ho Chi Minh', 'Confirmed status coverage with awaiting-proof payment state.', 250000.00, 20000.00, 270000.00, '2026-04-24 08:30:00', '2026-04-24 08:31:00'),
    (5, 3, 'MPO-2026-0005', @buyer_user_id, @farmer2_user_id, 'DELIVERING', 'BANK_TRANSFER', 'VERIFIED',
     'proof-order-5.png', 'image/png', 'storage/marketplace/payment-proofs/order-5/proof-order-5.png', '2026-04-24 12:20:00',
     '2026-04-24 14:00:00', 1, 'Verified then handed over to logistics.', 'Tran Thi Buyer', '0903234000',
     '88 Duong Thu Nghiem, Tan Phu, Quan 7, Ho Chi Minh', 'Delivering status coverage for split-order scenario.', 306000.00, 20000.00, 326000.00, '2026-04-24 12:10:00', '2026-04-25 09:00:00'),
    (6, 4, 'MPO-2026-0006', @buyer_user_id, 2, 'CANCELLED', 'BANK_TRANSFER', 'REJECTED',
     'proof-order-6.jpg', 'image/jpeg', 'storage/marketplace/payment-proofs/order-6/proof-order-6.jpg', '2026-04-26 10:00:00',
     '2026-04-26 10:30:00', 1, 'Payment proof rejected due mismatch; order cancelled.', 'Tran Thi Buyer', '0903234000',
     '123 Duong Demo, My An, Cao Lanh, Dong Thap', 'Cancelled order used to validate rejected-payment and cancelled-order filters.', 217500.00, 20000.00, 237500.00, '2026-04-26 09:45:00', '2026-04-26 10:35:00');

INSERT INTO marketplace_order_items
    (id, order_id, product_id, product_name_snapshot, product_slug_snapshot, image_url_snapshot, unit_price_snapshot,
     quantity, line_total, traceable_snapshot, farm_id, season_id, lot_id)
VALUES
    (1, 1, 5, 'Dau nanh AGS398 say kho 2026', 'dau-nanh-ags398-say-kho-2026', 'https://loremflickr.com/1200/800/soybeans,drybeans?lock=3985',
     145000.00, 2.000, 290000.00, TRUE, 1, 16, 5),
    (2, 2, 6, 'Ngo ngot Cao Nguyen Xanh', 'ngo-ngot-cao-nguyen-xanh', 'https://loremflickr.com/1200/800/corn,maize?lock=1701',
     170000.00, 1.250, 212500.00, TRUE, 4, 14, 6),
    (3, 3, 2, 'Gao OM5451 chon loc', 'gao-om5451-chon-loc', 'https://loremflickr.com/1200/800/rice,grain?lock=5451',
     125000.00, 3.500, 437500.00, TRUE, 1, 4, 2),
    (4, 4, 2, 'Gao OM5451 chon loc', 'gao-om5451-chon-loc', 'https://loremflickr.com/1200/800/rice,grain?lock=5451',
     125000.00, 2.000, 250000.00, TRUE, 1, 4, 2),
    (5, 5, 6, 'Ngo ngot Cao Nguyen Xanh', 'ngo-ngot-cao-nguyen-xanh', 'https://loremflickr.com/1200/800/corn,maize?lock=1701',
     170000.00, 1.800, 306000.00, TRUE, 4, 14, 6),
    (6, 6, 5, 'Dau nanh AGS398 say kho 2026', 'dau-nanh-ags398-say-kho-2026', 'https://loremflickr.com/1200/800/soybeans,drybeans?lock=3985',
     145000.00, 1.500, 217500.00, TRUE, 1, 16, 5);

INSERT INTO marketplace_product_reviews
    (id, product_id, order_id, buyer_user_id, rating, comment, created_at)
VALUES
    (1, 5, 1, @buyer_user_id, 5, 'Chất lượng đậu nành rất tốt, đóng gói gọn và giao đúng hẹn.', '2026-04-21 18:00:00');



-- =========================================================
-- 34. ADMIN READ VIEWS
-- =========================================================
CREATE OR REPLACE VIEW vw_admin_season_risk AS
SELECT
    s.season_id AS season_id,
    s.season_name AS season_name,
    s.status AS season_status,
    p.plot_id AS plot_id,
    p.plot_name AS plot_name,
    f.farm_id AS farm_id,
    f.farm_name AS farm_name,
    COALESCE(incident_agg.incident_count, 0) AS incident_count,
    COALESCE(task_agg.overdue_task_count, 0) AS overdue_task_count,
    (COALESCE(incident_agg.incident_count, 0) + COALESCE(task_agg.overdue_task_count, 0)) AS risk_score
FROM seasons s
JOIN plots p ON p.plot_id = s.plot_id
JOIN farms f ON f.farm_id = p.farm_id
LEFT JOIN (
    SELECT i.season_id, COUNT(DISTINCT i.id) AS incident_count
    FROM incidents i
    GROUP BY i.season_id
) incident_agg ON incident_agg.season_id = s.season_id
LEFT JOIN (
    SELECT t.season_id, COUNT(DISTINCT t.task_id) AS overdue_task_count
    FROM tasks t
    WHERE t.status = 'OVERDUE'
    GROUP BY t.season_id
) task_agg ON task_agg.season_id = s.season_id;

CREATE OR REPLACE VIEW vw_admin_inventory_lot_farm AS
SELECT DISTINCT
    sm.supply_lot_id AS supply_lot_id,
    w.farm_id AS farm_id
FROM stock_movements sm
JOIN warehouses w ON w.id = sm.warehouse_id
WHERE sm.supply_lot_id IS NOT NULL
  AND w.farm_id IS NOT NULL;

CREATE OR REPLACE VIEW vw_admin_inventory_lot_expiry_base AS
SELECT
    f.farm_id AS farm_id,
    f.farm_name AS farm_name,
    sl.id AS supply_lot_id,
    sl.expiry_date AS expiry_date
FROM supply_lots sl
JOIN vw_admin_inventory_lot_farm lot_farm ON lot_farm.supply_lot_id = sl.id
JOIN farms f ON f.farm_id = lot_farm.farm_id
WHERE sl.expiry_date IS NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- KIỂM TRA KẾT QUẢ
-- =========================================================
SELECT '=== KẾT QUẢ BOOTSTRAP DỮ LIỆU DEMO ===' AS '';
SELECT CONCAT('Users: ', COUNT(*)) AS result FROM users;
SELECT CONCAT('Roles: ', COUNT(*)) AS result FROM roles;
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
SELECT CONCAT('Marketplace Products: ', COUNT(*)) AS result FROM marketplace_products;
SELECT CONCAT('Marketplace Carts: ', COUNT(*)) AS result FROM marketplace_carts;
SELECT CONCAT('Marketplace Cart Items: ', COUNT(*)) AS result FROM marketplace_cart_items;
SELECT CONCAT('Marketplace Order Groups: ', COUNT(*)) AS result FROM marketplace_order_groups;
SELECT CONCAT('Marketplace Orders: ', COUNT(*)) AS result FROM marketplace_orders;
SELECT CONCAT('Marketplace Order Items: ', COUNT(*)) AS result FROM marketplace_order_items;
SELECT CONCAT('Marketplace Addresses: ', COUNT(*)) AS result FROM marketplace_addresses;
SELECT CONCAT('Marketplace Reviews: ', COUNT(*)) AS result FROM marketplace_product_reviews;

SELECT
    p.id,
    p.slug,
    p.status,
    p.stock_quantity,
    lot.on_hand_quantity
FROM marketplace_products p
JOIN product_warehouse_lots lot ON lot.id = p.lot_id
ORDER BY p.id;

SELECT
    og.group_code,
    COUNT(o.id) AS split_order_count,
    SUM(o.total_amount) AS group_total_amount
FROM marketplace_order_groups og
LEFT JOIN marketplace_orders o ON o.order_group_id = og.id
GROUP BY og.id, og.group_code
ORDER BY og.id;

SELECT
    payment_method,
    payment_verification_status,
    COUNT(*) AS order_count
FROM marketplace_orders
GROUP BY payment_method, payment_verification_status
ORDER BY payment_method, payment_verification_status;

SELECT
    status,
    COUNT(*) AS product_count
FROM marketplace_products
GROUP BY status
ORDER BY status;

SELECT
    product_id,
    COUNT(*) AS review_count,
    ROUND(AVG(rating), 2) AS average_rating
FROM marketplace_product_reviews
GROUP BY product_id
ORDER BY product_id;




