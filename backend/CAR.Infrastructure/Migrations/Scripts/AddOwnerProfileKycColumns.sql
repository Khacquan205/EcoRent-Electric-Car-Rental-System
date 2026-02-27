-- Add KYC columns to m_owner_profile (run this on your PostgreSQL database if EF migrations were not applied).
-- Run once. Safe to run: uses IF NOT EXISTS / DO blocks to avoid errors if columns already exist.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_owner_profile' AND column_name = 'full_name') THEN
    ALTER TABLE m_owner_profile ADD COLUMN full_name character varying(200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_owner_profile' AND column_name = 'date_of_birth') THEN
    ALTER TABLE m_owner_profile ADD COLUMN date_of_birth timestamp with time zone;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_owner_profile' AND column_name = 'address') THEN
    ALTER TABLE m_owner_profile ADD COLUMN address character varying(500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_owner_profile' AND column_name = 'id_number') THEN
    ALTER TABLE m_owner_profile ADD COLUMN id_number character varying(50);
  END IF;
END $$;
