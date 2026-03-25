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
  '{"bio":{},"links":[],"theme":{},"photo":{},"logo":{}}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RPC: update_config_section
-- Atomically merges one top-level key into data without
-- overwriting sibling keys. Safe for concurrent saves.
-- ============================================================
CREATE OR REPLACE FUNCTION update_config_section(section_key text, section_value jsonb)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE config
  SET data = data || jsonb_build_object(section_key, section_value)
  WHERE id = 1
  RETURNING data;
$$;

GRANT EXECUTE ON FUNCTION update_config_section(text, jsonb) TO authenticated;

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

-- ============================================================
-- Table: link_clicks  (analytics — one row per click event)
-- ============================================================
CREATE TABLE IF NOT EXISTS link_clicks (
  id         bigserial    PRIMARY KEY,
  link_id    text         NOT NULL,
  clicked_at timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'link_clicks' AND policyname = 'link_clicks_anon_insert'
  ) THEN DROP POLICY link_clicks_anon_insert ON link_clicks; END IF;
END $$;
CREATE POLICY link_clicks_anon_insert ON link_clicks
  FOR INSERT TO anon WITH CHECK (true);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'link_clicks' AND policyname = 'link_clicks_auth_select'
  ) THEN DROP POLICY link_clicks_auth_select ON link_clicks; END IF;
END $$;
CREATE POLICY link_clicks_auth_select ON link_clicks
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- RPC: get_link_click_counts
-- Returns per-link click totals for the admin dashboard.
-- ============================================================
CREATE OR REPLACE FUNCTION get_link_click_counts()
RETURNS TABLE(link_id text, count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT link_id, count(*)::bigint FROM link_clicks GROUP BY link_id;
$$;

GRANT EXECUTE ON FUNCTION get_link_click_counts() TO authenticated;
