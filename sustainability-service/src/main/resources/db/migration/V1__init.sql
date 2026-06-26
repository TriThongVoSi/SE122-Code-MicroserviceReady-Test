CREATE TABLE soil_tests (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE nutrient_input_events (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE irrigation_water_analyses (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE farm_snapshots (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    user_id BIGINT NULL,
    farm_name VARCHAR(255) NULL,
    province_id INT NULL,
    province_name VARCHAR(255) NULL,
    ward_id INT NULL,
    ward_name VARCHAR(255) NULL,
    area DECIMAL(19,4) NULL,
    latitude DECIMAL(10,6) NULL,
    longitude DECIMAL(10,6) NULL,
    snapshot_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE plot_snapshots (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    plot_id INT NOT NULL,
    farm_id INT NOT NULL,
    plot_name VARCHAR(255) NULL,
    area DECIMAL(19,4) NULL,
    soil_type VARCHAR(120) NULL,
    boundary_geojson LONGTEXT NULL,
    status VARCHAR(50) NULL,
    snapshot_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE season_snapshots (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    season_id INT NOT NULL,
    season_name VARCHAR(255) NULL,
    plot_id INT NOT NULL,
    farm_id INT NULL,
    crop_id INT NULL,
    variety_id INT NULL,
    start_date DATE NULL,
    planned_harvest_date DATE NULL,
    end_date DATE NULL,
    status VARCHAR(50) NULL,
    initial_plant_count INT NULL,
    current_plant_count INT NULL,
    expected_yield_kg DECIMAL(19,4) NULL,
    actual_yield_kg DECIMAL(19,4) NULL,
    budget_amount DECIMAL(19,4) NULL,
    notes TEXT NULL,
    snapshot_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE crop_snapshots (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NOT NULL,
    crop_name VARCHAR(255) NULL,
    description TEXT NULL,
    n_content_kg_per_kg_yield DECIMAL(19,8) NULL,
    snapshot_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE harvest_snapshots (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    harvest_id INT NOT NULL,
    season_id INT NOT NULL,
    farm_id INT NULL,
    harvest_date DATE NULL,
    quantity DECIMAL(19,4) NULL,
    unit VARCHAR(20) NULL,
    grade VARCHAR(50) NULL,
    note TEXT NULL,
    snapshot_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE expense_snapshots (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    user_id BIGINT NULL,
    season_id INT NULL,
    task_id INT NULL,
    plot_id INT NULL,
    farm_id INT NULL,
    category VARCHAR(50) NULL,
    item_name VARCHAR(255) NULL,
    unit_price DECIMAL(19,4) NULL,
    quantity INT NULL,
    total_cost DECIMAL(19,4) NULL,
    amount DECIMAL(19,4) NULL,
    payment_status VARCHAR(50) NULL,
    note TEXT NULL,
    expense_date DATE NULL,
    season_name VARCHAR(255) NULL,
    plot_name VARCHAR(255) NULL,
    task_title VARCHAR(255) NULL,
    user_name VARCHAR(255) NULL,
    snapshot_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE incident_snapshots (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    season_id INT NULL,
    farm_id INT NULL,
    reported_by_id BIGINT NULL,
    incident_type VARCHAR(80) NULL,
    severity VARCHAR(20) NULL,
    description TEXT NULL,
    status VARCHAR(50) NULL,
    deadline DATE NULL,
    resolved_at TIMESTAMP NULL,
    snapshot_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE processed_events (
    event_id VARCHAR(255) NOT NULL PRIMARY KEY,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_soil_test_season ON soil_tests(season_id);
CREATE INDEX idx_soil_test_plot ON soil_tests(plot_id);
CREATE INDEX idx_nutrient_input_season ON nutrient_input_events(season_id);
CREATE INDEX idx_nutrient_input_plot ON nutrient_input_events(plot_id);
CREATE INDEX idx_irrigation_analysis_season ON irrigation_water_analyses(season_id);
CREATE INDEX idx_irrigation_analysis_plot ON irrigation_water_analyses(plot_id);
CREATE INDEX idx_farm_snapshot_farm_id ON farm_snapshots(farm_id);
CREATE INDEX idx_farm_snapshot_user_id ON farm_snapshots(user_id);
CREATE INDEX idx_plot_snapshot_plot_id ON plot_snapshots(plot_id);
CREATE INDEX idx_plot_snapshot_farm_id ON plot_snapshots(farm_id);
CREATE INDEX idx_season_snapshot_season_id ON season_snapshots(season_id);
CREATE INDEX idx_season_snapshot_plot_id ON season_snapshots(plot_id);
CREATE INDEX idx_crop_snapshot_crop_id ON crop_snapshots(crop_id);
CREATE INDEX idx_harvest_snapshot_harvest_id ON harvest_snapshots(harvest_id);
CREATE INDEX idx_harvest_snapshot_season_id ON harvest_snapshots(season_id);
CREATE INDEX idx_expense_snapshot_expense_id ON expense_snapshots(expense_id);
CREATE INDEX idx_expense_snapshot_season_id ON expense_snapshots(season_id);
CREATE INDEX idx_incident_snapshot_incident_id ON incident_snapshots(incident_id);
CREATE INDEX idx_incident_snapshot_season_id ON incident_snapshots(season_id);
