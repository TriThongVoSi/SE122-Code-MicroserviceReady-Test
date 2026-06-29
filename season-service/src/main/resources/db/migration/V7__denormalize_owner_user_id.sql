-- V7__denormalize_owner_user_id.sql
-- Denormalize owner_user_id into seasons table to eliminate cross-schema JOINs.
-- This column is set when a season is created, based on the farm owner.
-- Allows season queries to filter by owner without JOINing to farm_db.

ALTER TABLE seasons ADD COLUMN owner_user_id BIGINT NULL;

-- Backfill existing seasons using the existing cross-schema JOIN pattern (one-time).
-- This is safe because the schema is still accessible during migration.
-- After migration completes, the column will be populated and the native queries
-- in SeasonRepository can be replaced with simple JPQL queries on owner_user_id.
UPDATE seasons s
JOIN farm_db.plots p ON s.plot_id = p.plot_id
JOIN farm_db.farms f ON p.farm_id = f.farm_id
SET s.owner_user_id = f.user_id
WHERE f.user_id IS NOT NULL;

-- Add index for fast owner-based queries
CREATE INDEX idx_seasons_owner_user_id ON seasons(owner_user_id);
