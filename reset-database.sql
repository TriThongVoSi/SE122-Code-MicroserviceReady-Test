-- ============================================
-- Script: Reset Database
-- Description: Drop and recreate the database
-- Usage: Run this script to completely reset the database
-- ============================================
-- Drop the database if it exists
DROP DATABASE IF EXISTS quanlymuavu;

-- Create fresh database
CREATE DATABASE quanlymuavu CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Select the new database
USE quanlymuavu;

-- Confirmation message
SELECT
    'Database your_name_database has been reset successfully!' AS Status;