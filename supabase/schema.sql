-- supabase/schema.sql
-- Idempotent: safe to run multiple times.

-- ============================================================
-- Table: config
-- ============================================================
CREATE TABLE IF NOT EXISTS config (
  id   integer PRIMARY KEY,
  data jsonb   NOT NULL DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies idempotently
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'config' AND policyname = 'anon_select'
  ) THEN
    DROP POLICY anon_select ON config;
  END IF;
END $$;
CREATE POLICY anon_select ON config
  FOR SELECT TO anon USING (true);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'config' AND policyname = 'auth_all'
  ) THEN
    DROP POLICY auth_all ON config;
  END IF;
END $$;
CREATE POLICY auth_all ON config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial row if not present
INSERT INTO config (id, data)
VALUES (
  1,
  '{"bio":{},"links":[],"theme":{},"photo":{}}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage: portfolio bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (idempotent via DROP IF EXISTS pattern)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_anon_read'
  ) THEN
    DROP POLICY portfolio_anon_read ON storage.objects;
  END IF;
END $$;
CREATE POLICY portfolio_anon_read ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'portfolio');

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_auth_write'
  ) THEN
    DROP POLICY portfolio_auth_write ON storage.objects;
  END IF;
END $$;
CREATE POLICY portfolio_auth_write ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'portfolio')
  WITH CHECK (bucket_id = 'portfolio');
