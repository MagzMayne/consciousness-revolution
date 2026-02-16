-- Brain Atoms Table for Cloud Sync
-- This table syncs with local Cyclotron database (166K+ atoms)
-- Different from user_atoms which is per-user
-- Run this in Supabase SQL Editor

-- ============================================================
-- ATOMS TABLE (Raw Brain Sync)
-- ============================================================

CREATE TABLE IF NOT EXISTS atoms (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'knowledge',
    domain VARCHAR(50),
    aspect VARCHAR(50),
    phase VARCHAR(50),
    source VARCHAR(100) DEFAULT 'local_cyclotron',
    node_id VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_atoms_type ON atoms(type);
CREATE INDEX IF NOT EXISTS idx_atoms_domain ON atoms(domain);
CREATE INDEX IF NOT EXISTS idx_atoms_created ON atoms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_atoms_source ON atoms(source);
CREATE INDEX IF NOT EXISTS idx_atoms_content_search ON atoms USING gin(to_tsvector('english', content));

-- Combined index for 7x7x7 queries
CREATE INDEX IF NOT EXISTS idx_atoms_7x7x7 ON atoms(domain, aspect, phase);

-- ============================================================
-- ARAYA MEMORY TABLE (Already exists but documenting)
-- ============================================================

CREATE TABLE IF NOT EXISTS araya_memory (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_araya_memory_user ON araya_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_araya_memory_type ON araya_memory(type);

-- ============================================================
-- BRAIN SYNC LOG (Track sync operations)
-- ============================================================

CREATE TABLE IF NOT EXISTS brain_sync_log (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(50) NOT NULL,
    source VARCHAR(100),
    target VARCHAR(100),
    atom_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'success',
    error TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_created ON brain_sync_log(created_at DESC);

-- ============================================================
-- PERMISSIONS (Allow API access with anon key)
-- ============================================================

-- Grant access to authenticated and anon roles for API
GRANT SELECT, INSERT ON atoms TO anon;
GRANT SELECT, INSERT ON atoms TO authenticated;
GRANT SELECT, INSERT ON araya_memory TO anon;
GRANT SELECT, INSERT ON araya_memory TO authenticated;
GRANT SELECT, INSERT ON brain_sync_log TO anon;
GRANT SELECT, INSERT ON brain_sync_log TO authenticated;

-- Grant sequence access
GRANT USAGE, SELECT ON SEQUENCE atoms_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE atoms_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE araya_memory_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE araya_memory_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE brain_sync_log_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE brain_sync_log_id_seq TO authenticated;

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE 'Brain atoms schema created successfully!';
    RAISE NOTICE 'Tables: atoms, araya_memory, brain_sync_log';
    RAISE NOTICE 'Ready for ARAYA cloud brain access';
END $$;
