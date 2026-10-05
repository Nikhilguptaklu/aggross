/*
# Create ReleaseReady Database Schema

## Overview
Creates the complete database schema for the Release Communication & Readiness Brief Assistant.
This is a single-tenant application with no authentication — all data is publicly readable/writable
via the anon key.

## Tables Created

1. **release_packages** — Main release package entity (name, version, status, readiness, owner, etc.)
2. **completed_features** — Features belonging to a release package (title, description, user impact, evidence ref)
3. **bug_fixes** — Bug fixes belonging to a release package (title, description, severity, affected users, QA evidence)
4. **changed_behaviours** — Behaviour changes (title, previous behaviour, new behaviour, user impact)
5. **qa_evidence** — QA evidence items (evidence ID, test name, result, notes)
6. **known_limitations** — Known limitations (title, description)
7. **affected_user_groups** — User groups affected by the release (name)
8. **risks** — Risks associated with a release (risk, severity, description, mitigation)
9. **analysis_results** — AI analysis output for a release (timestamp)
10. **analysis_user_impact** — User impact classifications from analysis (change, impact level, explanation, evidence refs as JSONB)
11. **analysis_missing_info** — Missing information detected by analysis (what's missing, why it matters, suggested action)
12. **analysis_unsupported_claims** — Claims not supported by QA evidence (claim, problem, available evidence, confidence)
13. **analysis_risks** — Risks identified during analysis (risk, severity, description, mitigation)
14. **release_versions** — Version snapshots of release packages (version number, author, status, change summary, snapshot as JSONB)
15. **generated_summaries** — AI-generated technical and stakeholder summaries (stored as JSONB)

## Security
- RLS enabled on ALL tables.
- All policies use `TO anon, authenticated` since this is a no-auth single-tenant app.
- All CRUD operations (SELECT, INSERT, UPDATE, DELETE) are allowed for anon + authenticated.
- `USING (true)` / `WITH CHECK (true)` is intentional — data is shared/public with no user isolation.

## Important Notes
1. All child tables have `ON DELETE CASCADE` foreign keys to their parent so deleting a release package
   cleans up all related data automatically.
2. `evidence` arrays in analysis tables are stored as JSONB since they contain variable-length reference lists.
3. `generated_summaries` stores technical and stakeholder summary content as JSONB since each summary type
   has a different field structure.
4. `release_versions.snapshot` stores a full JSONB snapshot of the release package at that point in time.
5. Timestamps use `timestamptz DEFAULT now()`.
*/

-- ============================================================
-- 1. release_packages (main table)
-- ============================================================
CREATE TABLE IF NOT EXISTS release_packages (
  id text PRIMARY KEY,
  name text NOT NULL,
  version text NOT NULL,
  release_date timestamptz,
  owner text NOT NULL DEFAULT 'Unknown',
  status text NOT NULL DEFAULT 'Draft',
  readiness text NOT NULL DEFAULT 'Needs Attention',
  description text DEFAULT '',
  qa_summary text DEFAULT '',
  migration_notes text DEFAULT '',
  analysis_id text,
  tech_summary_status text NOT NULL DEFAULT 'pending',
  stakeholder_summary_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE release_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_release_packages" ON release_packages;
CREATE POLICY "anon_select_release_packages" ON release_packages
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_release_packages" ON release_packages;
CREATE POLICY "anon_insert_release_packages" ON release_packages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_release_packages" ON release_packages;
CREATE POLICY "anon_update_release_packages" ON release_packages
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_release_packages" ON release_packages;
CREATE POLICY "anon_delete_release_packages" ON release_packages
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 2. completed_features
-- ============================================================
CREATE TABLE IF NOT EXISTS completed_features (
  id text PRIMARY KEY,
  release_id text NOT NULL REFERENCES release_packages(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  user_impact text DEFAULT '',
  evidence_ref text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE completed_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_completed_features" ON completed_features;
CREATE POLICY "anon_select_completed_features" ON completed_features
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_completed_features" ON completed_features;
CREATE POLICY "anon_insert_completed_features" ON completed_features
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_completed_features" ON completed_features;
CREATE POLICY "anon_update_completed_features" ON completed_features
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_completed_features" ON completed_features;
CREATE POLICY "anon_delete_completed_features" ON completed_features
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 3. bug_fixes
-- ============================================================
CREATE TABLE IF NOT EXISTS bug_fixes (
  id text PRIMARY KEY,
  release_id text NOT NULL REFERENCES release_packages(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  severity text NOT NULL DEFAULT 'Medium',
  affected_users text DEFAULT '',
  qa_evidence text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bug_fixes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bug_fixes" ON bug_fixes;
CREATE POLICY "anon_select_bug_fixes" ON bug_fixes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bug_fixes" ON bug_fixes;
CREATE POLICY "anon_insert_bug_fixes" ON bug_fixes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bug_fixes" ON bug_fixes;
CREATE POLICY "anon_update_bug_fixes" ON bug_fixes
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bug_fixes" ON bug_fixes;
CREATE POLICY "anon_delete_bug_fixes" ON bug_fixes
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 4. changed_behaviours
-- ============================================================
CREATE TABLE IF NOT EXISTS changed_behaviours (
  id text PRIMARY KEY,
  release_id text NOT NULL REFERENCES release_packages(id) ON DELETE CASCADE,
  title text NOT NULL,
  previous_behaviour text DEFAULT '',
  new_behaviour text DEFAULT '',
  user_impact text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE changed_behaviours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_changed_behaviours" ON changed_behaviours;
CREATE POLICY "anon_select_changed_behaviours" ON changed_behaviours
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_changed_behaviours" ON changed_behaviours;
CREATE POLICY "anon_insert_changed_behaviours" ON changed_behaviours
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_changed_behaviours" ON changed_behaviours;
CREATE POLICY "anon_update_changed_behaviours" ON changed_behaviours
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_changed_behaviours" ON changed_behaviours;
CREATE POLICY "anon_delete_changed_behaviours" ON changed_behaviours
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 5. qa_evidence
-- ============================================================
CREATE TABLE IF NOT EXISTS qa_evidence (
  id text PRIMARY KEY,
  release_id text NOT NULL REFERENCES release_packages(id) ON DELETE CASCADE,
  evidence_id text NOT NULL,
  test_name text NOT NULL DEFAULT '',
  result text NOT NULL DEFAULT 'Pass',
  notes text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE qa_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_qa_evidence" ON qa_evidence;
CREATE POLICY "anon_select_qa_evidence" ON qa_evidence
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_qa_evidence" ON qa_evidence;
CREATE POLICY "anon_insert_qa_evidence" ON qa_evidence
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_qa_evidence" ON qa_evidence;
CREATE POLICY "anon_update_qa_evidence" ON qa_evidence
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_qa_evidence" ON qa_evidence;
CREATE POLICY "anon_delete_qa_evidence" ON qa_evidence
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 6. known_limitations
-- ============================================================
CREATE TABLE IF NOT EXISTS known_limitations (
  id text PRIMARY KEY,
  release_id text NOT NULL REFERENCES release_packages(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE known_limitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_known_limitations" ON known_limitations;
CREATE POLICY "anon_select_known_limitations" ON known_limitations
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_known_limitations" ON known_limitations;
CREATE POLICY "anon_insert_known_limitations" ON known_limitations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_known_limitations" ON known_limitations;
CREATE POLICY "anon_update_known_limitations" ON known_limitations
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_known_limitations" ON known_limitations;
CREATE POLICY "anon_delete_known_limitations" ON known_limitations
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 7. affected_user_groups
-- ============================================================
CREATE TABLE IF NOT EXISTS affected_user_groups (
  id text PRIMARY KEY,
  release_id text NOT NULL REFERENCES release_packages(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE affected_user_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_affected_user_groups" ON affected_user_groups;
CREATE POLICY "anon_select_affected_user_groups" ON affected_user_groups
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_affected_user_groups" ON affected_user_groups;
CREATE POLICY "anon_insert_affected_user_groups" ON affected_user_groups
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_affected_user_groups" ON affected_user_groups;
CREATE POLICY "anon_update_affected_user_groups" ON affected_user_groups
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_affected_user_groups" ON affected_user_groups;
CREATE POLICY "anon_delete_affected_user_groups" ON affected_user_groups
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 8. risks
-- ============================================================
CREATE TABLE IF NOT EXISTS risks (
  id text PRIMARY KEY,
  release_id text NOT NULL REFERENCES release_packages(id) ON DELETE CASCADE,
  risk text NOT NULL,
  severity text NOT NULL DEFAULT 'Medium',
  description text DEFAULT '',
  mitigation text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_risks" ON risks;
CREATE POLICY "anon_select_risks" ON risks
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_risks" ON risks;
CREATE POLICY "anon_insert_risks" ON risks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_risks" ON risks;
CREATE POLICY "anon_update_risks" ON risks
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_risks" ON risks;
CREATE POLICY "anon_delete_risks" ON risks
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 9. analysis_results
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_results (
  id text PRIMARY KEY,
  release_id text NOT NULL REFERENCES release_packages(id) ON DELETE CASCADE,
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analysis_results" ON analysis_results;
CREATE POLICY "anon_select_analysis_results" ON analysis_results
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analysis_results" ON analysis_results;
CREATE POLICY "anon_insert_analysis_results" ON analysis_results
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analysis_results" ON analysis_results;
CREATE POLICY "anon_update_analysis_results" ON analysis_results
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analysis_results" ON analysis_results;
CREATE POLICY "anon_delete_analysis_results" ON analysis_results
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 10. analysis_user_impact
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_user_impact (
  id text PRIMARY KEY,
  analysis_id text NOT NULL REFERENCES analysis_results(id) ON DELETE CASCADE,
  change text NOT NULL,
  impact_level text NOT NULL DEFAULT 'No User Impact',
  explanation text DEFAULT '',
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analysis_user_impact ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analysis_user_impact" ON analysis_user_impact;
CREATE POLICY "anon_select_analysis_user_impact" ON analysis_user_impact
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analysis_user_impact" ON analysis_user_impact;
CREATE POLICY "anon_insert_analysis_user_impact" ON analysis_user_impact
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analysis_user_impact" ON analysis_user_impact;
CREATE POLICY "anon_update_analysis_user_impact" ON analysis_user_impact
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analysis_user_impact" ON analysis_user_impact;
CREATE POLICY "anon_delete_analysis_user_impact" ON analysis_user_impact
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 11. analysis_missing_info
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_missing_info (
  id text PRIMARY KEY,
  analysis_id text NOT NULL REFERENCES analysis_results(id) ON DELETE CASCADE,
  missing text NOT NULL,
  why_it_matters text DEFAULT '',
  suggested_action text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analysis_missing_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analysis_missing_info" ON analysis_missing_info;
CREATE POLICY "anon_select_analysis_missing_info" ON analysis_missing_info
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analysis_missing_info" ON analysis_missing_info;
CREATE POLICY "anon_insert_analysis_missing_info" ON analysis_missing_info
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analysis_missing_info" ON analysis_missing_info;
CREATE POLICY "anon_update_analysis_missing_info" ON analysis_missing_info
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analysis_missing_info" ON analysis_missing_info;
CREATE POLICY "anon_delete_analysis_missing_info" ON analysis_missing_info
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 12. analysis_unsupported_claims
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_unsupported_claims (
  id text PRIMARY KEY,
  analysis_id text NOT NULL REFERENCES analysis_results(id) ON DELETE CASCADE,
  claim text NOT NULL,
  problem text DEFAULT '',
  available_evidence text DEFAULT '',
  confidence text NOT NULL DEFAULT 'Low',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analysis_unsupported_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analysis_unsupported_claims" ON analysis_unsupported_claims;
CREATE POLICY "anon_select_analysis_unsupported_claims" ON analysis_unsupported_claims
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analysis_unsupported_claims" ON analysis_unsupported_claims;
CREATE POLICY "anon_insert_analysis_unsupported_claims" ON analysis_unsupported_claims
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analysis_unsupported_claims" ON analysis_unsupported_claims;
CREATE POLICY "anon_update_analysis_unsupported_claims" ON analysis_unsupported_claims
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analysis_unsupported_claims" ON analysis_unsupported_claims;
CREATE POLICY "anon_delete_analysis_unsupported_claims" ON analysis_unsupported_claims
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 13. analysis_risks
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_risks (
  id text PRIMARY KEY,
  analysis_id text NOT NULL REFERENCES analysis_results(id) ON DELETE CASCADE,
  risk text NOT NULL,
  severity text NOT NULL DEFAULT 'Medium',
  description text DEFAULT '',
  mitigation text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analysis_risks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analysis_risks" ON analysis_risks;
CREATE POLICY "anon_select_analysis_risks" ON analysis_risks
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analysis_risks" ON analysis_risks;
CREATE POLICY "anon_insert_analysis_risks" ON analysis_risks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analysis_risks" ON analysis_risks;
CREATE POLICY "anon_update_analysis_risks" ON analysis_risks
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analysis_risks" ON analysis_risks;
CREATE POLICY "anon_delete_analysis_risks" ON analysis_risks
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 14. release_versions
-- ============================================================
CREATE TABLE IF NOT EXISTS release_versions (
  id text PRIMARY KEY,
  release_id text NOT NULL REFERENCES release_packages(id) ON DELETE CASCADE,
  version text NOT NULL,
  author text NOT NULL DEFAULT 'System',
  status text NOT NULL DEFAULT 'Draft',
  change_summary text DEFAULT '',
  snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE release_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_release_versions" ON release_versions;
CREATE POLICY "anon_select_release_versions" ON release_versions
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_release_versions" ON release_versions;
CREATE POLICY "anon_insert_release_versions" ON release_versions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_release_versions" ON release_versions;
CREATE POLICY "anon_update_release_versions" ON release_versions
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_release_versions" ON release_versions;
CREATE POLICY "anon_delete_release_versions" ON release_versions
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 15. generated_summaries
-- ============================================================
CREATE TABLE IF NOT EXISTS generated_summaries (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  release_id text NOT NULL UNIQUE REFERENCES release_packages(id) ON DELETE CASCADE,
  technical jsonb,
  stakeholder jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE generated_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_generated_summaries" ON generated_summaries;
CREATE POLICY "anon_select_generated_summaries" ON generated_summaries
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_generated_summaries" ON generated_summaries;
CREATE POLICY "anon_insert_generated_summaries" ON generated_summaries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_generated_summaries" ON generated_summaries;
CREATE POLICY "anon_update_generated_summaries" ON generated_summaries
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_generated_summaries" ON generated_summaries;
CREATE POLICY "anon_delete_generated_summaries" ON generated_summaries
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_completed_features_release_id ON completed_features(release_id);
CREATE INDEX IF NOT EXISTS idx_bug_fixes_release_id ON bug_fixes(release_id);
CREATE INDEX IF NOT EXISTS idx_changed_behaviours_release_id ON changed_behaviours(release_id);
CREATE INDEX IF NOT EXISTS idx_qa_evidence_release_id ON qa_evidence(release_id);
CREATE INDEX IF NOT EXISTS idx_known_limitations_release_id ON known_limitations(release_id);
CREATE INDEX IF NOT EXISTS idx_affected_user_groups_release_id ON affected_user_groups(release_id);
CREATE INDEX IF NOT EXISTS idx_risks_release_id ON risks(release_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_release_id ON analysis_results(release_id);
CREATE INDEX IF NOT EXISTS idx_analysis_user_impact_analysis_id ON analysis_user_impact(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_missing_info_analysis_id ON analysis_missing_info(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_unsupported_claims_analysis_id ON analysis_unsupported_claims(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_risks_analysis_id ON analysis_risks(analysis_id);
CREATE INDEX IF NOT EXISTS idx_release_versions_release_id ON release_versions(release_id);
CREATE INDEX IF NOT EXISTS idx_generated_summaries_release_id ON generated_summaries(release_id);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_release_packages_updated_at ON release_packages;
CREATE TRIGGER trg_release_packages_updated_at
  BEFORE UPDATE ON release_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_generated_summaries_updated_at ON generated_summaries;
CREATE TRIGGER trg_generated_summaries_updated_at
  BEFORE UPDATE ON generated_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
