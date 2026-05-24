-- Allow Google-only accounts to exist without a local password.
-- Existing password hashes for email/password accounts are preserved.

ALTER TABLE users
    MODIFY COLUMN password_hash VARCHAR(255) NULL;
