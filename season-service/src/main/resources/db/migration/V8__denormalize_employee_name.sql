-- V8__denormalize_employee_name.sql
-- Denormalize employee name/email into season_employees table
-- to eliminate cross-schema JOIN to identity_db at runtime.

ALTER TABLE season_employees
  ADD COLUMN employee_username VARCHAR(150) NULL,
  ADD COLUMN employee_full_name VARCHAR(255) NULL,
  ADD COLUMN employee_email VARCHAR(255) NULL;

-- Backfill existing records using cross-schema JOIN (one-time during migration).
-- After migration, new employee assignments should populate these columns
-- at write time via ExternalServiceClient.getUser() lookup.
UPDATE season_employees se
JOIN identity_db.users u ON se.employee_user_id = u.user_id
SET
  se.employee_username = u.user_name,
  se.employee_full_name = u.full_name,
  se.employee_email = u.email;

-- Add indexes for search
CREATE INDEX idx_se_employee_username ON season_employees(employee_username);
CREATE INDEX idx_se_employee_full_name ON season_employees(employee_full_name);
CREATE INDEX idx_se_employee_email ON season_employees(employee_email);
