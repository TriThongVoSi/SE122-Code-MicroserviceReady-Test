-- Add Google Sign-In account linking support.
-- password_hash becomes nullable so Google-only accounts can exist without a local password.

ALTER TABLE users
    ADD COLUMN google_id VARCHAR(255) NULL;

CREATE UNIQUE INDEX uk_users_google_id
    ON users(google_id);

ALTER TABLE users
    MODIFY COLUMN password_hash VARCHAR(255) NULL;
