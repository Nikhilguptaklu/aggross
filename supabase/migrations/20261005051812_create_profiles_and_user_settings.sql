/*
# Create Profile and User Settings Tables

## Overview
Creates two new tables to support user profiles and per-user application settings.
Both tables are owner-scoped: each authenticated user can only access their own row.

## Tables Created

### 1. profiles
Stores extended profile information for each authenticated user, supplementing the
basic email/ID available in Supabase Auth.
- `id` (uuid, primary key) — matches the user's auth.users.id
- `full_name` (text) — user's display name (shown in header dropdown, avatars)
- `avatar_url` (text) — optional profile photo URL
- `job_title` (text) — role/title (e.g. "Release Manager")
- `phone` (text) — optional contact phone
- `bio` (text) — short bio/about text
- `created_at` (timestamptz) — when the profile was created
- `updated_at` (timestamptz) — auto-updated on modification

### 2. user_settings
Stores per-user application preferences matching the Settings page.
- `id` (uuid, primary key) — matches the user's auth.users.id
- `ai_model` (text) — selected AI model (default 'gpt-4')
- `analysis_depth` (text) — analysis depth level (default 'standard')
- `auto_run_analysis` (boolean) — auto-run analysis after validation (default false)
- `require_evidence_for_claims` (boolean) — flag unsupported claims (default true)
- `notify_on_analysis_complete` (boolean) — notify when analysis finishes (default true)
- `notify_on_approval_required` (boolean) — notify when approval needed (default true)
- `default_severity_threshold` (text) — risk severity filter (default 'Medium')
- `retention_days` (int) — version snapshot retention period (default 90)
- `created_at` (timestamptz) — when settings were created
- `updated_at` (timestamptz) — auto-updated on modification

## Security
- RLS enabled on both tables.
- All policies use `TO authenticated` with `auth.uid() = id` ownership check.
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE) — no `FOR ALL`.
- The primary key `id` defaults to `auth.uid()` so inserts that omit it still work.
- The auto-updating trigger on `release_packages` is reused for `updated_at`.

## Important Notes
1. Both tables use `id uuid PRIMARY KEY DEFAULT auth.uid()` so the row ID
   is automatically the authenticated user's ID — one row per user.
2. A trigger auto-updates `updated_at` on both tables.
3. `IF NOT EXISTS` guards make this migration safe to re-run.
*/

-- ============================================================
-- 1. profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  job_title text DEFAULT '',
  phone text DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_profiles" ON profiles;
CREATE POLICY "owner_select_profiles" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "owner_insert_profiles" ON profiles;
CREATE POLICY "owner_insert_profiles" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "owner_update_profiles" ON profiles;
CREATE POLICY "owner_update_profiles" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "owner_delete_profiles" ON profiles;
CREATE POLICY "owner_delete_profiles" ON profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- ============================================================
-- 2. user_settings table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_model text NOT NULL DEFAULT 'gpt-4',
  analysis_depth text NOT NULL DEFAULT 'standard',
  auto_run_analysis boolean NOT NULL DEFAULT false,
  require_evidence_for_claims boolean NOT NULL DEFAULT true,
  notify_on_analysis_complete boolean NOT NULL DEFAULT true,
  notify_on_approval_required boolean NOT NULL DEFAULT true,
  default_severity_threshold text NOT NULL DEFAULT 'Medium',
  retention_days int NOT NULL DEFAULT 90,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_user_settings" ON user_settings;
CREATE POLICY "owner_select_user_settings" ON user_settings
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "owner_insert_user_settings" ON user_settings;
CREATE POLICY "owner_insert_user_settings" ON user_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "owner_update_user_settings" ON user_settings;
CREATE POLICY "owner_update_user_settings" ON user_settings
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "owner_delete_user_settings" ON user_settings;
CREATE POLICY "owner_delete_user_settings" ON user_settings
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- ============================================================
-- Auto-update triggers for updated_at
-- ============================================================
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON user_settings;
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
