-- ============================================================
-- Netlify DB (Neon PostgreSQL) — Core Schema
-- ============================================================
-- Database: silent-river-12795425 (Netlify DB)
-- Platform: Neon PostgreSQL (via @netlify/neon)
-- Connection: NETLIFY_DATABASE_URL / NETLIFY_DATABASE_URL_UNPOOLED
-- Created: 2026-03-25
--
-- To apply:
--   1. Connect using NETLIFY_DATABASE_URL_UNPOOLED (direct connection)
--   2. Run: psql "$NETLIFY_DATABASE_URL_UNPOOLED" -f netlify-db-schema.sql
--   Or paste into the Neon SQL editor in the Netlify dashboard.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SYSTEM: Key-Value Store
-- General-purpose configuration and state storage
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kv_store (
    key   TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_updated ON kv_store (updated_at DESC);

-- ─────────────────────────────────────────────────────────────
-- SYSTEM: Audit Log
-- Append-only record of all significant server-side events
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGSERIAL PRIMARY KEY,
    event_type  TEXT NOT NULL,
    actor       TEXT,                     -- user_id, IP, or function name
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_event   ON audit_log (event_type);
CREATE INDEX IF NOT EXISTS idx_audit_actor   ON audit_log (actor);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log (created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- USERS: Basic profile table
-- Lightweight user records for functions that need persistence
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,           -- Supabase/Clerk user ID
    email      TEXT UNIQUE,
    display_name TEXT,
    tier       TEXT NOT NULL DEFAULT 'explorer',
    metadata   JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_tier  ON users (tier);

-- ─────────────────────────────────────────────────────────────
-- FUNCTION: upsert_user
-- Insert or update a user record atomically
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION upsert_user(
    p_id           TEXT,
    p_email        TEXT,
    p_display_name TEXT DEFAULT NULL,
    p_tier         TEXT DEFAULT 'explorer',
    p_metadata     JSONB DEFAULT '{}'
)
RETURNS users AS $$
DECLARE
    v_row users;
BEGIN
    INSERT INTO users (id, email, display_name, tier, metadata)
    VALUES (p_id, p_email, p_display_name, p_tier, p_metadata)
    ON CONFLICT (id) DO UPDATE
        SET email        = EXCLUDED.email,
            display_name = COALESCE(EXCLUDED.display_name, users.display_name),
            tier         = EXCLUDED.tier,
            metadata     = users.metadata || EXCLUDED.metadata,
            updated_at   = NOW()
    RETURNING * INTO v_row;

    RETURN v_row;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: auto-update updated_at on users
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION _set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();

DROP TRIGGER IF EXISTS trg_kv_updated_at ON kv_store;
CREATE TRIGGER trg_kv_updated_at
    BEFORE UPDATE ON kv_store
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- SEED: default KV entries
-- ─────────────────────────────────────────────────────────────
INSERT INTO kv_store (key, value) VALUES
    ('db_version',   '"1.0.0"'),
    ('db_created',   to_jsonb(NOW()::text)),
    ('platform',     '"netlify-neon"')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
