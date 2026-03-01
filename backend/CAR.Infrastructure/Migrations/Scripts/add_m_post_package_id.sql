-- Add package_id to m_post (run if EF migrations have not been applied).
-- Requires: at least one row in m_owner_package (id = 1) for DEFAULT, or change 1 to a valid package id.

ALTER TABLE m_post
ADD COLUMN IF NOT EXISTS package_id integer NOT NULL DEFAULT 1;
