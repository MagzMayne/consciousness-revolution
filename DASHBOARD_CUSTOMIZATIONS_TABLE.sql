-- DASHBOARD_CUSTOMIZATIONS: Live real-time edits (instant, no approval needed)
-- These are applied ON TOP of the base HTML when dashboard loads

CREATE TABLE dashboard_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Which dashboard and who owns it
  dashboard_id TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  owner_name TEXT NOT NULL,

  -- Customization content (applied via JavaScript on load)
  custom_css TEXT,           -- Extra CSS styles
  custom_js TEXT,            -- Extra JavaScript
  custom_html_inserts JSONB, -- Array of {selector, position, html} inserts
  widget_overrides JSONB,    -- Widget configuration overrides
  theme_overrides JSONB,     -- Color/font overrides

  -- Feature toggles
  features_enabled JSONB DEFAULT '[]',   -- ["chat", "notifications", etc]
  features_disabled JSONB DEFAULT '[]',

  -- Layout customizations
  layout_config JSONB,       -- Grid positions, collapsed sections, etc

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one customization set per dashboard per owner
  UNIQUE(dashboard_id, owner_id)
);

-- Index for fast lookups
CREATE INDEX idx_dashboard_customizations_lookup
ON dashboard_customizations(dashboard_id, owner_id)
WHERE is_active = true;

-- Enable RLS
ALTER TABLE dashboard_customizations ENABLE ROW LEVEL SECURITY;

-- Anyone can read (dashboards need to load customizations)
CREATE POLICY "Anyone can view customizations" ON dashboard_customizations
  FOR SELECT USING (true);

-- Only owner can insert/update their own customizations
CREATE POLICY "Owners can manage own customizations" ON dashboard_customizations
  FOR ALL USING (auth.uid() = owner_id);

-- Also allow service role (for ARAYA to edit on behalf of users)
CREATE POLICY "Service role full access" ON dashboard_customizations
  FOR ALL USING (auth.role() = 'service_role');
