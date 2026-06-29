-- V9__denormalize_task_view.sql
-- Denormalize assignee_name and plot_name into tasks table
-- to eliminate cross-schema JOINs in DashboardTaskView @Subselect.

-- Add denormalized columns
ALTER TABLE tasks
  ADD COLUMN assignee_name VARCHAR(255) NULL,
  ADD COLUMN plot_name VARCHAR(255) NULL;

-- Backfill existing tasks (one-time during migration)
UPDATE tasks t
LEFT JOIN identity_db.users u ON t.user_id = u.user_id
SET t.assignee_name = u.full_name
WHERE t.user_id IS NOT NULL;

UPDATE tasks t
JOIN seasons s ON t.season_id = s.season_id
JOIN farm_db.plots p ON s.plot_id = p.plot_id
SET t.plot_name = p.plot_name;

-- Create indexes for search
CREATE INDEX idx_tasks_assignee_name ON tasks(assignee_name);
CREATE INDEX idx_tasks_plot_name ON tasks(plot_name);
