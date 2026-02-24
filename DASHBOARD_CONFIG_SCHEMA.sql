-- ═══════════════════════════════════════════════════════════════════════════
-- DASHBOARD CONFIG TABLE - Scalable Personalization for 1000x Distribution
-- ═══════════════════════════════════════════════════════════════════════════
-- Pattern: 3 → 7 → 13 → ∞ | LFSME
--
-- Purpose: Store user dashboard customizations in Supabase
-- Same template, infinite personalizations
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop if exists (be careful in production!)
-- DROP TABLE IF EXISTS dashboard_configs;

-- Create the main table
CREATE TABLE IF NOT EXISTS dashboard_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    dashboard TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    cloned_from TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Composite unique constraint - one config per user per dashboard
    UNIQUE(user_id, dashboard)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_user_id ON dashboard_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_dashboard ON dashboard_configs(dashboard);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_user_dashboard ON dashboard_configs(user_id, dashboard);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own configs
CREATE POLICY "Users can read own configs" ON dashboard_configs
    FOR SELECT USING (true);  -- Allow read for all (config API handles auth)

-- Policy: Users can insert their own configs
CREATE POLICY "Users can insert own configs" ON dashboard_configs
    FOR INSERT WITH CHECK (true);  -- Allow insert (API handles validation)

-- Policy: Users can update their own configs
CREATE POLICY "Users can update own configs" ON dashboard_configs
    FOR UPDATE USING (true);  -- Allow update (API handles auth)

-- Policy: Users can delete their own configs
CREATE POLICY "Users can delete own configs" ON dashboard_configs
    FOR DELETE USING (true);  -- Allow delete (API handles auth)

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dashboard_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
DROP TRIGGER IF EXISTS update_dashboard_config_timestamp ON dashboard_configs;
CREATE TRIGGER update_dashboard_config_timestamp
    BEFORE UPDATE ON dashboard_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_dashboard_config_timestamp();

-- ═══════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA - Example configs
-- ═══════════════════════════════════════════════════════════════════════════

-- Example: Commander's personalized dashboard
-- INSERT INTO dashboard_configs (user_id, dashboard, config) VALUES (
--     'commander',
--     'COMMANDER_DOMAIN_1_COMMAND',
--     '{
--         "colors": {
--             "header": "#ff4444",
--             "accent": "#00ff88",
--             "background": "#1a1a2e"
--         },
--         "text": {
--             "headerText": "COMMAND CENTER"
--         },
--         "layout": {
--             "compactMode": false
--         }
--     }'::jsonb
-- );

-- Example: Agent R's dashboard with purple theme
-- INSERT INTO dashboard_configs (user_id, dashboard, config) VALUES (
--     'agent_r',
--     'AGENT_R_DOMAIN_1_COMMAND',
--     '{
--         "colors": {
--             "header": "#8844ff",
--             "accent": "#ff44ff"
--         },
--         "branding": {
--             "companyName": "Agent R Operations"
--         }
--     }'::jsonb
-- );

-- ═══════════════════════════════════════════════════════════════════════════
-- UTILITY QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Count total customized dashboards
-- SELECT COUNT(*) FROM dashboard_configs;

-- Find users with most customizations
-- SELECT user_id, COUNT(*) as customizations
-- FROM dashboard_configs
-- GROUP BY user_id
-- ORDER BY customizations DESC
-- LIMIT 10;

-- Find most customized dashboards
-- SELECT dashboard, COUNT(*) as users
-- FROM dashboard_configs
-- GROUP BY dashboard
-- ORDER BY users DESC;

-- Clone a user's config to another user
-- INSERT INTO dashboard_configs (user_id, dashboard, config, cloned_from)
-- SELECT 'new_user_id', dashboard, config, 'source_user_id'
-- FROM dashboard_configs
-- WHERE user_id = 'source_user_id';
