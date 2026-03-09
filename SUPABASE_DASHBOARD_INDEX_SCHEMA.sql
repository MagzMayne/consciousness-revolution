-- DASHBOARD INDEX TABLE
-- Tracks all dashboards by date, owner, domain, type
-- Query: "What was created yesterday?" or "Show me Commander's dashboards"

CREATE TABLE IF NOT EXISTS dashboard_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    filename TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    purpose TEXT,

    -- Classification
    owner TEXT,                    -- Commander, Agent R, Tiger, etc.
    domain TEXT,                   -- 1_COMMAND, 2_BUILD, etc.
    type TEXT DEFAULT 'dashboard', -- cockpit, dashboard, hub, tool
    role_set TEXT,                 -- COMMANDER_DOMAINS, AGENT_R_DOMAINS, etc.

    -- Dates (for "show me yesterday's dashboards")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Status
    status TEXT DEFAULT 'LIVE',    -- LIVE, DRAFT, ARCHIVED, DEPRECATED
    tier TEXT DEFAULT 'BRONZE',    -- BRONZE, SILVER, GOLD

    -- DNA Metadata
    version TEXT DEFAULT '1.0.0',
    lfsme_score DECIMAL(3,1),
    trinity_complete BOOLEAN DEFAULT false,

    -- URL
    url TEXT,

    -- Full DNA (for detailed queries)
    dna JSONB
);

-- INDEXES FOR FAST QUERIES
CREATE INDEX IF NOT EXISTS idx_dashboard_created ON dashboard_index(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_owner ON dashboard_index(owner);
CREATE INDEX IF NOT EXISTS idx_dashboard_domain ON dashboard_index(domain);
CREATE INDEX IF NOT EXISTS idx_dashboard_type ON dashboard_index(type);
CREATE INDEX IF NOT EXISTS idx_dashboard_status ON dashboard_index(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_role_set ON dashboard_index(role_set);

-- Enable RLS
ALTER TABLE dashboard_index ENABLE ROW LEVEL SECURITY;

-- Service role access
CREATE POLICY "Service role full access to dashboard_index"
ON dashboard_index FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Public read access
CREATE POLICY "Public read access to dashboard_index"
ON dashboard_index FOR SELECT TO anon
USING (status = 'LIVE');

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_dashboard_index_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dashboard_index_updated
    BEFORE UPDATE ON dashboard_index
    FOR EACH ROW
    EXECUTE FUNCTION update_dashboard_index_timestamp();

-- VIEW: Today's dashboards
CREATE OR REPLACE VIEW dashboards_today AS
SELECT * FROM dashboard_index
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- VIEW: Yesterday's dashboards
CREATE OR REPLACE VIEW dashboards_yesterday AS
SELECT * FROM dashboard_index
WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
ORDER BY created_at DESC;

-- VIEW: By owner summary
CREATE OR REPLACE VIEW dashboards_by_owner AS
SELECT
    owner,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'LIVE') as live,
    COUNT(*) FILTER (WHERE tier = 'GOLD') as gold,
    MAX(updated_at) as last_updated
FROM dashboard_index
GROUP BY owner
ORDER BY total DESC;

-- FUNCTION: Quick lookup
CREATE OR REPLACE FUNCTION find_dashboards(
    p_owner TEXT DEFAULT NULL,
    p_domain TEXT DEFAULT NULL,
    p_date DATE DEFAULT NULL
)
RETURNS TABLE (
    filename TEXT,
    name TEXT,
    owner TEXT,
    domain TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.filename, d.name, d.owner, d.domain, d.created_at, d.url
    FROM dashboard_index d
    WHERE (p_owner IS NULL OR d.owner ILIKE '%' || p_owner || '%')
      AND (p_domain IS NULL OR d.domain = p_domain)
      AND (p_date IS NULL OR DATE(d.created_at) = p_date)
    ORDER BY d.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;
