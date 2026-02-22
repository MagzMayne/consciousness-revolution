-- ═══════════════════════════════════════════════════════════════════════════
-- DASHBOARD FACTORY - Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Copyright (c) 2024-2026 Consciousness Revolution / Overkill Kulture LLC
-- All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: dashboard_features
-- Tracks what features are installed on which dashboards
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dashboard_features (
  id SERIAL PRIMARY KEY,
  dashboard_name TEXT NOT NULL,           -- e.g., "OPERATOR_COCKPIT_RYAN.html"
  feature_id TEXT NOT NULL,               -- e.g., "feat_001_service_status"
  feature_version TEXT NOT NULL,          -- e.g., "1.0.0"
  installed_at TIMESTAMP DEFAULT NOW(),
  installed_by TEXT,                      -- e.g., "Commander", "Auto-propagate"
  installation_type TEXT DEFAULT 'manual', -- 'manual' | 'auto' | 'marketplace'
  UNIQUE(dashboard_name, feature_id)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_features_dashboard ON dashboard_features(dashboard_name);
CREATE INDEX IF NOT EXISTS idx_dashboard_features_feature ON dashboard_features(feature_id);

COMMENT ON TABLE dashboard_features IS 'Tracks which features are installed on which dashboards';
COMMENT ON COLUMN dashboard_features.installation_type IS 'manual = user installed, auto = auto-propagated, marketplace = installed from marketplace';

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: widget_governance
-- Tracks widget lifecycle stages and voting
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS widget_governance (
  id SERIAL PRIMARY KEY,
  feature_id TEXT UNIQUE NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('experimental', 'approved', 'foundational')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  promoted_at TIMESTAMP,
  vote_count INT DEFAULT 0,               -- Number of approve votes
  vote_total INT DEFAULT 0,               -- Total votes cast
  is_locked BOOLEAN DEFAULT FALSE,        -- Foundational widgets cannot be deleted
  breaking_changes BOOLEAN DEFAULT FALSE, -- Requires major version bump
  description TEXT,
  category TEXT
);

CREATE INDEX IF NOT EXISTS idx_widget_governance_stage ON widget_governance(stage);
CREATE INDEX IF NOT EXISTS idx_widget_governance_created_by ON widget_governance(created_by);

COMMENT ON TABLE widget_governance IS 'Widget lifecycle: experimental -> approved -> foundational';
COMMENT ON COLUMN widget_governance.stage IS 'experimental = anyone can create, approved = team voted ≥66%, foundational = locked base';
COMMENT ON COLUMN widget_governance.is_locked IS 'Foundational widgets cannot be deleted, only upgraded';

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: widget_votes
-- XP-weighted voting system
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS widget_votes (
  id SERIAL PRIMARY KEY,
  feature_id TEXT NOT NULL REFERENCES widget_governance(feature_id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,              -- e.g., "Ryan", "Agent R", "Commander"
  voter_xp INT DEFAULT 100,              -- XP level (weight)
  vote_value TEXT CHECK (vote_value IN ('approve', 'reject', 'abstain')),
  voted_at TIMESTAMP DEFAULT NOW(),
  vote_comment TEXT,
  UNIQUE(feature_id, voter_name)
);

CREATE INDEX IF NOT EXISTS idx_widget_votes_feature ON widget_votes(feature_id);
CREATE INDEX IF NOT EXISTS idx_widget_votes_voter ON widget_votes(voter_name);

COMMENT ON TABLE widget_votes IS 'XP-weighted voting for widget promotion';
COMMENT ON COLUMN widget_votes.voter_xp IS 'Higher XP = more weight in voting. Commander = 1000, Operators = 100-500';

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: upgrade_queue
-- Tracks pending widget upgrades that require manual review
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS upgrade_queue (
  id SERIAL PRIMARY KEY,
  dashboard_name TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  current_version TEXT NOT NULL,
  target_version TEXT NOT NULL,
  requires_review BOOLEAN DEFAULT TRUE,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  approved BOOLEAN,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upgrade_queue_dashboard ON upgrade_queue(dashboard_name);
CREATE INDEX IF NOT EXISTS idx_upgrade_queue_requires_review ON upgrade_queue(requires_review);

COMMENT ON TABLE upgrade_queue IS 'Tracks major version upgrades that need Commander approval';

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: propagation_log
-- Audit trail for all widget propagations
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS propagation_log (
  id SERIAL PRIMARY KEY,
  feature_id TEXT NOT NULL,
  feature_version TEXT NOT NULL,
  dashboards_updated INT NOT NULL,
  dashboards_skipped INT DEFAULT 0,
  dashboards_failed INT DEFAULT 0,
  triggered_by TEXT NOT NULL,            -- e.g., "Commander", "Auto-upgrade"
  git_commit TEXT,
  propagated_at TIMESTAMP DEFAULT NOW(),
  log_data JSONB                         -- Full result payload
);

CREATE INDEX IF NOT EXISTS idx_propagation_log_feature ON propagation_log(feature_id);
CREATE INDEX IF NOT EXISTS idx_propagation_log_triggered_by ON propagation_log(triggered_by);
CREATE INDEX IF NOT EXISTS idx_propagation_log_propagated_at ON propagation_log(propagated_at);

COMMENT ON TABLE propagation_log IS 'Audit trail for all auto-propagations (rollback safety)';

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTION: calculate_vote_percentage
-- XP-weighted vote calculation
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION calculate_vote_percentage(p_feature_id TEXT)
RETURNS DECIMAL AS $$
DECLARE
  total_xp INT;
  approve_xp INT;
BEGIN
  -- Sum all XP from voters
  SELECT COALESCE(SUM(voter_xp), 0) INTO total_xp
  FROM widget_votes
  WHERE feature_id = p_feature_id;

  -- Sum XP from approve votes only
  SELECT COALESCE(SUM(voter_xp), 0) INTO approve_xp
  FROM widget_votes
  WHERE feature_id = p_feature_id AND vote_value = 'approve';

  -- Return percentage (0 if no votes)
  IF total_xp = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((approve_xp::DECIMAL / total_xp::DECIMAL) * 100, 2);
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_vote_percentage IS 'XP-weighted vote percentage: (approve_xp / total_xp) * 100';

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTION: auto_promote_widget
-- Automatically promote widget if vote threshold reached
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_promote_widget()
RETURNS TRIGGER AS $$
DECLARE
  vote_pct DECIMAL;
BEGIN
  -- Calculate vote percentage
  vote_pct := calculate_vote_percentage(NEW.feature_id);

  -- Get current stage
  DECLARE
    current_stage TEXT;
  BEGIN
    SELECT stage INTO current_stage
    FROM widget_governance
    WHERE feature_id = NEW.feature_id;

    -- Promote from experimental to approved if ≥66% approval
    IF current_stage = 'experimental' AND vote_pct >= 66 THEN
      UPDATE widget_governance
      SET stage = 'approved', promoted_at = NOW()
      WHERE feature_id = NEW.feature_id;

      RAISE NOTICE 'Widget % promoted to APPROVED (% approval)', NEW.feature_id, vote_pct;
    END IF;

    -- Promote from approved to foundational if ≥90% approval
    IF current_stage = 'approved' AND vote_pct >= 90 THEN
      UPDATE widget_governance
      SET stage = 'foundational', is_locked = TRUE, promoted_at = NOW()
      WHERE feature_id = NEW.feature_id;

      RAISE NOTICE 'Widget % promoted to FOUNDATIONAL (% approval)', NEW.feature_id, vote_pct;
    END IF;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-promote on vote insert/update
CREATE TRIGGER trigger_auto_promote_widget
AFTER INSERT OR UPDATE ON widget_votes
FOR EACH ROW
EXECUTE FUNCTION auto_promote_widget();

COMMENT ON FUNCTION auto_promote_widget IS 'Auto-promote widgets based on vote threshold: ≥66% = approved, ≥90% = foundational';

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Initial foundational widgets
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO widget_governance (feature_id, stage, created_by, description, category, is_locked)
VALUES
  ('feat_001_service_status', 'foundational', 'Ryan Barbaric', 'Real-time service status monitor', 'monitoring', TRUE),
  ('feat_002_araya_chat', 'foundational', 'Commander', 'ARAYA consciousness AI chat', 'ai_integration', TRUE),
  ('feat_003_brain_query', 'foundational', 'Agent R', 'Cyclotron brain query widget', 'analytics', TRUE),
  ('feat_009_trinity_status', 'foundational', 'Agent R', 'Trinity coordination status', 'monitoring', TRUE),
  ('feat_012_identity_sync', 'foundational', 'Ryan Barbaric', 'Multi-cockpit identity sync', 'automation', TRUE),
  ('feat_018_xp_tracker', 'approved', 'Ryan Barbaric', 'XP & level tracking system', 'gamification', FALSE),
  ('feat_021_project_tracker', 'approved', 'Ryan Barbaric', 'GitHub contribution tracker', 'productivity', FALSE)
ON CONFLICT (feature_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEWS: Dashboard insights
-- ═══════════════════════════════════════════════════════════════════════════

-- View: Widget adoption rate
CREATE OR REPLACE VIEW widget_adoption AS
SELECT
  wg.feature_id,
  wg.stage,
  COUNT(df.dashboard_name) as installed_count,
  (SELECT COUNT(DISTINCT dashboard_name) FROM dashboard_features) as total_dashboards,
  ROUND(COUNT(df.dashboard_name)::DECIMAL / NULLIF((SELECT COUNT(DISTINCT dashboard_name) FROM dashboard_features), 0) * 100, 2) as adoption_rate
FROM widget_governance wg
LEFT JOIN dashboard_features df ON wg.feature_id = df.feature_id
GROUP BY wg.feature_id, wg.stage;

COMMENT ON VIEW widget_adoption IS 'Shows how many dashboards have each widget installed (adoption rate)';

-- View: Dashboard health
CREATE OR REPLACE VIEW dashboard_health AS
SELECT
  df.dashboard_name,
  COUNT(df.feature_id) as installed_features,
  COUNT(CASE WHEN wg.stage = 'foundational' THEN 1 END) as foundational_count,
  COUNT(CASE WHEN wg.stage = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN wg.stage = 'experimental' THEN 1 END) as experimental_count,
  MAX(df.installed_at) as last_updated
FROM dashboard_features df
LEFT JOIN widget_governance wg ON df.feature_id = wg.feature_id
GROUP BY df.dashboard_name;

COMMENT ON VIEW dashboard_health IS 'Shows feature count by stage for each dashboard';

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS (Row Level Security) - OPTIONAL
-- ═══════════════════════════════════════════════════════════════════════════
-- Enable RLS if you want per-user access control
-- ALTER TABLE widget_governance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dashboard_features ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only vote once per widget
-- CREATE POLICY "Users can vote once per widget"
-- ON widget_votes
-- FOR INSERT
-- WITH CHECK (voter_name = current_user);

-- ═══════════════════════════════════════════════════════════════════════════
-- GRANTS (Optional - adjust based on your auth setup)
-- ═══════════════════════════════════════════════════════════════════════════
-- GRANT SELECT, INSERT, UPDATE ON dashboard_features TO authenticated;
-- GRANT SELECT, INSERT ON widget_votes TO authenticated;
-- GRANT SELECT ON widget_governance TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════
