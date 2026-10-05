/*
# Add User Authentication and Owner-Scoped RLS

## Overview
Converts the ReleaseReady schema from single-tenant (anon-accessible) to multi-tenant
(authenticated-only, owner-scoped). Each user can only see and modify their own release
packages and all related child data.

## Changes

### 1. release_packages table
- Added `user_id` column (uuid, NOT NULL, defaults to `auth.uid()`)
- Added foreign key to `auth.users(id)` with `ON DELETE CASCADE`
- Replaced all 4 anon policies with authenticated-only, owner-scoped policies

### 2. Child tables (completed_features, bug_fixes, changed_behaviours, qa_evidence,
    known_limitations, affected_user_groups, risks, analysis_results, release_versions,
    generated_summaries)
- Replaced all 4 anon policies on each table with authenticated-only policies
- SELECT/INSERT/UPDATE/DELETE scoped through parent ownership check:
  `EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = <child>.release_id
   AND release_packages.user_id = auth.uid())`

### 3. Grandchild tables (analysis_user_impact, analysis_missing_info,
    analysis_unsupported_claims, analysis_risks)
- Replaced all 4 anon policies on each table with authenticated-only policies
- Scoped through two-level parent ownership check:
  `EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id
   WHERE ar.id = <grandchild>.analysis_id AND rp.user_id = auth.uid())`

## Security
- RLS remains enabled on all tables
- All policies now use `TO authenticated` only — anon role has NO access
- Ownership is enforced via `auth.uid()` matching `release_packages.user_id`
- The `user_id` column defaults to `auth.uid()` so inserts that omit it still work
- Child tables don't need their own `user_id` column — ownership is checked through the parent

## Important Notes
1. The `user_id` column is added with `IF NOT EXISTS` so re-running is safe.
2. Existing rows (if any) will get `NULL` for `user_id` — since we're transitioning from
   anon-accessible, there should be no production data. If there is, it should be assigned
   to a specific user before this migration.
3. All policy drops use `IF EXISTS` for idempotency.
4. The `DEFAULT auth.uid()` on `release_packages.user_id` is critical: frontend inserts
   that don't pass `user_id` will still have the correct owner set automatically.
*/

-- ============================================================
-- Add user_id to release_packages
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'release_packages' AND column_name = 'user_id') THEN
    ALTER TABLE release_packages ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_release_packages_user_id'
    AND table_name = 'release_packages') THEN
    ALTER TABLE release_packages
      ADD CONSTRAINT fk_release_packages_user_id
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================
-- Replace release_packages policies (authenticated, owner-scoped)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_release_packages" ON release_packages;
DROP POLICY IF EXISTS "anon_insert_release_packages" ON release_packages;
DROP POLICY IF EXISTS "anon_update_release_packages" ON release_packages;
DROP POLICY IF EXISTS "anon_delete_release_packages" ON release_packages;

CREATE POLICY "owner_select_release_packages" ON release_packages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "owner_insert_release_packages" ON release_packages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_release_packages" ON release_packages
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_delete_release_packages" ON release_packages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- Helper: generate child table policies
-- Each child has release_id pointing to release_packages
-- ============================================================

-- completed_features
DROP POLICY IF EXISTS "anon_select_completed_features" ON completed_features;
DROP POLICY IF EXISTS "anon_insert_completed_features" ON completed_features;
DROP POLICY IF EXISTS "anon_update_completed_features" ON completed_features;
DROP POLICY IF EXISTS "anon_delete_completed_features" ON completed_features;

CREATE POLICY "owner_select_completed_features" ON completed_features
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = completed_features.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_completed_features" ON completed_features
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = completed_features.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_completed_features" ON completed_features
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = completed_features.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = completed_features.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_completed_features" ON completed_features
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = completed_features.release_id AND release_packages.user_id = auth.uid())
  );

-- bug_fixes
DROP POLICY IF EXISTS "anon_select_bug_fixes" ON bug_fixes;
DROP POLICY IF EXISTS "anon_insert_bug_fixes" ON bug_fixes;
DROP POLICY IF EXISTS "anon_update_bug_fixes" ON bug_fixes;
DROP POLICY IF EXISTS "anon_delete_bug_fixes" ON bug_fixes;

CREATE POLICY "owner_select_bug_fixes" ON bug_fixes
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = bug_fixes.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_bug_fixes" ON bug_fixes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = bug_fixes.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_bug_fixes" ON bug_fixes
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = bug_fixes.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = bug_fixes.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_bug_fixes" ON bug_fixes
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = bug_fixes.release_id AND release_packages.user_id = auth.uid())
  );

-- changed_behaviours
DROP POLICY IF EXISTS "anon_select_changed_behaviours" ON changed_behaviours;
DROP POLICY IF EXISTS "anon_insert_changed_behaviours" ON changed_behaviours;
DROP POLICY IF EXISTS "anon_update_changed_behaviours" ON changed_behaviours;
DROP POLICY IF EXISTS "anon_delete_changed_behaviours" ON changed_behaviours;

CREATE POLICY "owner_select_changed_behaviours" ON changed_behaviours
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = changed_behaviours.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_changed_behaviours" ON changed_behaviours
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = changed_behaviours.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_changed_behaviours" ON changed_behaviours
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = changed_behaviours.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = changed_behaviours.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_changed_behaviours" ON changed_behaviours
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = changed_behaviours.release_id AND release_packages.user_id = auth.uid())
  );

-- qa_evidence
DROP POLICY IF EXISTS "anon_select_qa_evidence" ON qa_evidence;
DROP POLICY IF EXISTS "anon_insert_qa_evidence" ON qa_evidence;
DROP POLICY IF EXISTS "anon_update_qa_evidence" ON qa_evidence;
DROP POLICY IF EXISTS "anon_delete_qa_evidence" ON qa_evidence;

CREATE POLICY "owner_select_qa_evidence" ON qa_evidence
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = qa_evidence.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_qa_evidence" ON qa_evidence
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = qa_evidence.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_qa_evidence" ON qa_evidence
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = qa_evidence.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = qa_evidence.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_qa_evidence" ON qa_evidence
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = qa_evidence.release_id AND release_packages.user_id = auth.uid())
  );

-- known_limitations
DROP POLICY IF EXISTS "anon_select_known_limitations" ON known_limitations;
DROP POLICY IF EXISTS "anon_insert_known_limitations" ON known_limitations;
DROP POLICY IF EXISTS "anon_update_known_limitations" ON known_limitations;
DROP POLICY IF EXISTS "anon_delete_known_limitations" ON known_limitations;

CREATE POLICY "owner_select_known_limitations" ON known_limitations
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = known_limitations.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_known_limitations" ON known_limitations
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = known_limitations.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_known_limitations" ON known_limitations
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = known_limitations.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = known_limitations.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_known_limitations" ON known_limitations
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = known_limitations.release_id AND release_packages.user_id = auth.uid())
  );

-- affected_user_groups
DROP POLICY IF EXISTS "anon_select_affected_user_groups" ON affected_user_groups;
DROP POLICY IF EXISTS "anon_insert_affected_user_groups" ON affected_user_groups;
DROP POLICY IF EXISTS "anon_update_affected_user_groups" ON affected_user_groups;
DROP POLICY IF EXISTS "anon_delete_affected_user_groups" ON affected_user_groups;

CREATE POLICY "owner_select_affected_user_groups" ON affected_user_groups
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = affected_user_groups.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_affected_user_groups" ON affected_user_groups
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = affected_user_groups.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_affected_user_groups" ON affected_user_groups
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = affected_user_groups.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = affected_user_groups.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_affected_user_groups" ON affected_user_groups
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = affected_user_groups.release_id AND release_packages.user_id = auth.uid())
  );

-- risks
DROP POLICY IF EXISTS "anon_select_risks" ON risks;
DROP POLICY IF EXISTS "anon_insert_risks" ON risks;
DROP POLICY IF EXISTS "anon_update_risks" ON risks;
DROP POLICY IF EXISTS "anon_delete_risks" ON risks;

CREATE POLICY "owner_select_risks" ON risks
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = risks.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_risks" ON risks
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = risks.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_risks" ON risks
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = risks.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = risks.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_risks" ON risks
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = risks.release_id AND release_packages.user_id = auth.uid())
  );

-- analysis_results
DROP POLICY IF EXISTS "anon_select_analysis_results" ON analysis_results;
DROP POLICY IF EXISTS "anon_insert_analysis_results" ON analysis_results;
DROP POLICY IF EXISTS "anon_update_analysis_results" ON analysis_results;
DROP POLICY IF EXISTS "anon_delete_analysis_results" ON analysis_results;

CREATE POLICY "owner_select_analysis_results" ON analysis_results
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = analysis_results.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_analysis_results" ON analysis_results
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = analysis_results.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_analysis_results" ON analysis_results
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = analysis_results.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = analysis_results.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_analysis_results" ON analysis_results
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = analysis_results.release_id AND release_packages.user_id = auth.uid())
  );

-- release_versions
DROP POLICY IF EXISTS "anon_select_release_versions" ON release_versions;
DROP POLICY IF EXISTS "anon_insert_release_versions" ON release_versions;
DROP POLICY IF EXISTS "anon_update_release_versions" ON release_versions;
DROP POLICY IF EXISTS "anon_delete_release_versions" ON release_versions;

CREATE POLICY "owner_select_release_versions" ON release_versions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = release_versions.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_release_versions" ON release_versions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = release_versions.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_release_versions" ON release_versions
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = release_versions.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = release_versions.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_release_versions" ON release_versions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = release_versions.release_id AND release_packages.user_id = auth.uid())
  );

-- generated_summaries
DROP POLICY IF EXISTS "anon_select_generated_summaries" ON generated_summaries;
DROP POLICY IF EXISTS "anon_insert_generated_summaries" ON generated_summaries;
DROP POLICY IF EXISTS "anon_update_generated_summaries" ON generated_summaries;
DROP POLICY IF EXISTS "anon_delete_generated_summaries" ON generated_summaries;

CREATE POLICY "owner_select_generated_summaries" ON generated_summaries
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = generated_summaries.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_generated_summaries" ON generated_summaries
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = generated_summaries.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_update_generated_summaries" ON generated_summaries
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = generated_summaries.release_id AND release_packages.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = generated_summaries.release_id AND release_packages.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_generated_summaries" ON generated_summaries
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM release_packages WHERE release_packages.id = generated_summaries.release_id AND release_packages.user_id = auth.uid())
  );

-- ============================================================
-- Grandchild tables (analysis detail tables)
-- Scoped through analysis_results -> release_packages ownership
-- ============================================================

-- analysis_user_impact
DROP POLICY IF EXISTS "anon_select_analysis_user_impact" ON analysis_user_impact;
DROP POLICY IF EXISTS "anon_insert_analysis_user_impact" ON analysis_user_impact;
DROP POLICY IF EXISTS "anon_update_analysis_user_impact" ON analysis_user_impact;
DROP POLICY IF EXISTS "anon_delete_analysis_user_impact" ON analysis_user_impact;

CREATE POLICY "owner_select_analysis_user_impact" ON analysis_user_impact
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_user_impact.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_analysis_user_impact" ON analysis_user_impact
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_user_impact.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_update_analysis_user_impact" ON analysis_user_impact
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_user_impact.analysis_id AND rp.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_user_impact.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_analysis_user_impact" ON analysis_user_impact
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_user_impact.analysis_id AND rp.user_id = auth.uid())
  );

-- analysis_missing_info
DROP POLICY IF EXISTS "anon_select_analysis_missing_info" ON analysis_missing_info;
DROP POLICY IF EXISTS "anon_insert_analysis_missing_info" ON analysis_missing_info;
DROP POLICY IF EXISTS "anon_update_analysis_missing_info" ON analysis_missing_info;
DROP POLICY IF EXISTS "anon_delete_analysis_missing_info" ON analysis_missing_info;

CREATE POLICY "owner_select_analysis_missing_info" ON analysis_missing_info
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_missing_info.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_analysis_missing_info" ON analysis_missing_info
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_missing_info.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_update_analysis_missing_info" ON analysis_missing_info
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_missing_info.analysis_id AND rp.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_missing_info.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_analysis_missing_info" ON analysis_missing_info
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_missing_info.analysis_id AND rp.user_id = auth.uid())
  );

-- analysis_unsupported_claims
DROP POLICY IF EXISTS "anon_select_analysis_unsupported_claims" ON analysis_unsupported_claims;
DROP POLICY IF EXISTS "anon_insert_analysis_unsupported_claims" ON analysis_unsupported_claims;
DROP POLICY IF EXISTS "anon_update_analysis_unsupported_claims" ON analysis_unsupported_claims;
DROP POLICY IF EXISTS "anon_delete_analysis_unsupported_claims" ON analysis_unsupported_claims;

CREATE POLICY "owner_select_analysis_unsupported_claims" ON analysis_unsupported_claims
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_unsupported_claims.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_analysis_unsupported_claims" ON analysis_unsupported_claims
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_unsupported_claims.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_update_analysis_unsupported_claims" ON analysis_unsupported_claims
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_unsupported_claims.analysis_id AND rp.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_unsupported_claims.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_analysis_unsupported_claims" ON analysis_unsupported_claims
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_unsupported_claims.analysis_id AND rp.user_id = auth.uid())
  );

-- analysis_risks
DROP POLICY IF EXISTS "anon_select_analysis_risks" ON analysis_risks;
DROP POLICY IF EXISTS "anon_insert_analysis_risks" ON analysis_risks;
DROP POLICY IF EXISTS "anon_update_analysis_risks" ON analysis_risks;
DROP POLICY IF EXISTS "anon_delete_analysis_risks" ON analysis_risks;

CREATE POLICY "owner_select_analysis_risks" ON analysis_risks
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_risks.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_insert_analysis_risks" ON analysis_risks
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_risks.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_update_analysis_risks" ON analysis_risks
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_risks.analysis_id AND rp.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_risks.analysis_id AND rp.user_id = auth.uid())
  );
CREATE POLICY "owner_delete_analysis_risks" ON analysis_risks
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_results ar JOIN release_packages rp ON rp.id = ar.release_id WHERE ar.id = analysis_risks.analysis_id AND rp.user_id = auth.uid())
  );
