-- FDN legacy backfill validation SQL
-- Use this script before and after backfill for the SAME scope.
--
-- Optional filters:
--   SET @season_id = 33;
--   SET @from_date = '2026-01-01';
--   SET @to_date = '2026-12-31';

SET @season_id = NULL;
SET @from_date = NULL;
SET @to_date = NULL;

-- ============================================================
-- A) Legacy scan footprint
-- ============================================================
SELECT
    nie.input_source,
    COUNT(*) AS scanned_count
FROM nutrient_input_events nie
WHERE nie.input_source IN ('IRRIGATION_WATER', 'SOIL_LEGACY')
  AND (@season_id IS NULL OR nie.season_id = @season_id)
  AND (@from_date IS NULL OR nie.applied_date >= @from_date)
  AND (@to_date IS NULL OR nie.applied_date <= @to_date)
GROUP BY nie.input_source;

-- Legacy records considered invalid context (season/plot/date missing)
SELECT
    nie.input_source,
    COUNT(*) AS invalid_context_count
FROM nutrient_input_events nie
WHERE nie.input_source IN ('IRRIGATION_WATER', 'SOIL_LEGACY')
  AND (@season_id IS NULL OR nie.season_id = @season_id)
  AND (@from_date IS NULL OR nie.applied_date >= @from_date)
  AND (@to_date IS NULL OR nie.applied_date <= @to_date)
  AND (nie.season_id IS NULL OR nie.plot_id IS NULL OR nie.applied_date IS NULL)
GROUP BY nie.input_source;

-- ============================================================
-- B) Mapping coverage and idempotency
-- ============================================================
-- Mapped legacy -> dedicated counts (legacy_derived + legacy_event_id present)
SELECT
    'IRRIGATION_WATER' AS source,
    COUNT(*) AS mapped_count
FROM irrigation_water_analyses iwa
WHERE iwa.legacy_derived = TRUE
  AND iwa.legacy_event_id IS NOT NULL
  AND (@season_id IS NULL OR iwa.season_id = @season_id)
  AND (@from_date IS NULL OR iwa.sample_date >= @from_date)
  AND (@to_date IS NULL OR iwa.sample_date <= @to_date)
UNION ALL
SELECT
    'SOIL_LEGACY' AS source,
    COUNT(*) AS mapped_count
FROM soil_tests st
WHERE st.legacy_derived = TRUE
  AND st.legacy_event_id IS NOT NULL
  AND (@season_id IS NULL OR st.season_id = @season_id)
  AND (@from_date IS NULL OR st.sample_date >= @from_date)
  AND (@to_date IS NULL OR st.sample_date <= @to_date);

-- Legacy rows already mapped
SELECT
    nie.input_source,
    COUNT(*) AS already_migrated_count
FROM nutrient_input_events nie
LEFT JOIN irrigation_water_analyses iwa
    ON nie.input_source = 'IRRIGATION_WATER'
   AND iwa.legacy_event_id = nie.id
LEFT JOIN soil_tests st
    ON nie.input_source = 'SOIL_LEGACY'
   AND st.legacy_event_id = nie.id
WHERE nie.input_source IN ('IRRIGATION_WATER', 'SOIL_LEGACY')
  AND (@season_id IS NULL OR nie.season_id = @season_id)
  AND (@from_date IS NULL OR nie.applied_date >= @from_date)
  AND (@to_date IS NULL OR nie.applied_date <= @to_date)
  AND (
      (nie.input_source = 'IRRIGATION_WATER' AND iwa.id IS NOT NULL)
      OR
      (nie.input_source = 'SOIL_LEGACY' AND st.id IS NOT NULL)
  )
GROUP BY nie.input_source;

-- Remaining unmapped legacy rows (eligible candidates for migration review)
SELECT
    nie.input_source,
    COUNT(*) AS remaining_unmapped_count
FROM nutrient_input_events nie
LEFT JOIN irrigation_water_analyses iwa
    ON nie.input_source = 'IRRIGATION_WATER'
   AND iwa.legacy_event_id = nie.id
LEFT JOIN soil_tests st
    ON nie.input_source = 'SOIL_LEGACY'
   AND st.legacy_event_id = nie.id
WHERE nie.input_source IN ('IRRIGATION_WATER', 'SOIL_LEGACY')
  AND (@season_id IS NULL OR nie.season_id = @season_id)
  AND (@from_date IS NULL OR nie.applied_date >= @from_date)
  AND (@to_date IS NULL OR nie.applied_date <= @to_date)
  AND nie.season_id IS NOT NULL
  AND nie.plot_id IS NOT NULL
  AND nie.applied_date IS NOT NULL
  AND (
      (nie.input_source = 'IRRIGATION_WATER' AND iwa.id IS NULL)
      OR
      (nie.input_source = 'SOIL_LEGACY' AND st.id IS NULL)
  )
GROUP BY nie.input_source;

-- ============================================================
-- C) Idempotency index readiness (hard pre-flight gate)
-- ============================================================
-- Expect at least one UNIQUE index on legacy_event_id in each dedicated table.
SELECT
    'irrigation_water_analyses' AS table_name,
    COALESCE(SUM(CASE WHEN non_unique = 0 THEN 1 ELSE 0 END), 0) AS unique_index_count,
    COUNT(*) AS total_indexes_on_legacy_event_id
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND table_name = 'irrigation_water_analyses'
  AND column_name = 'legacy_event_id'
UNION ALL
SELECT
    'soil_tests' AS table_name,
    COALESCE(SUM(CASE WHEN non_unique = 0 THEN 1 ELSE 0 END), 0) AS unique_index_count,
    COUNT(*) AS total_indexes_on_legacy_event_id
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND table_name = 'soil_tests'
  AND column_name = 'legacy_event_id';

-- ============================================================
-- D) Duplicate safety checks
-- ============================================================
SELECT legacy_event_id, COUNT(*) AS duplicate_count
FROM irrigation_water_analyses
WHERE legacy_event_id IS NOT NULL
GROUP BY legacy_event_id
HAVING COUNT(*) > 1;

SELECT legacy_event_id, COUNT(*) AS duplicate_count
FROM soil_tests
WHERE legacy_event_id IS NOT NULL
GROUP BY legacy_event_id
HAVING COUNT(*) > 1;

-- ============================================================
-- E) Record-level sample mapping inspection
-- ============================================================
SELECT
    nie.id AS legacy_event_id,
    nie.input_source,
    nie.season_id,
    nie.plot_id,
    nie.applied_date,
    nie.n_kg,
    CASE
        WHEN nie.input_source = 'IRRIGATION_WATER' THEN (
            SELECT iwa.id FROM irrigation_water_analyses iwa WHERE iwa.legacy_event_id = nie.id LIMIT 1
        )
        WHEN nie.input_source = 'SOIL_LEGACY' THEN (
            SELECT st.id FROM soil_tests st WHERE st.legacy_event_id = nie.id LIMIT 1
        )
        ELSE NULL
    END AS mapped_dedicated_id
FROM nutrient_input_events nie
WHERE nie.input_source IN ('IRRIGATION_WATER', 'SOIL_LEGACY')
  AND (@season_id IS NULL OR nie.season_id = @season_id)
  AND (@from_date IS NULL OR nie.applied_date >= @from_date)
  AND (@to_date IS NULL OR nie.applied_date <= @to_date)
ORDER BY nie.id DESC
LIMIT 200;

-- ============================================================
-- F) Notes
-- ============================================================
-- "conflict" counters are emitted by backfill runner logs during execution.
-- They are not persisted in DB, so validate conflict behavior from app logs.
-- If unique_index_count = 0 for any dedicated table, stop rollout and fix DB migration state first.
