-- ARAYA ENHANCEMENTS SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this SQL in the Supabase SQL editor to set up the tables required
-- by the ARAYA real-time edit, layout, optimize, and themes systems.
--
-- Tables:
--   araya_edit_logs        — real-time page edit history with session tracking
--   araya_behavior_logs    — user behavior events for optimization reasoning
--   araya_layouts          — saved user custom layouts per page
--   araya_theme_prefs      — per-user/per-page theme preferences
--   araya_theme_votes      — explicit theme upvotes
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Real-time edit logs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS araya_edit_logs (
    id          BIGSERIAL PRIMARY KEY,
    session_id  TEXT        NOT NULL,
    page        TEXT        NOT NULL,
    selector    TEXT        NOT NULL,
    property    TEXT        NOT NULL,
    value       TEXT        NOT NULL,
    user_id     TEXT        NOT NULL DEFAULT 'anonymous',
    status      TEXT        NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS araya_edit_logs_session ON araya_edit_logs (session_id);
CREATE INDEX IF NOT EXISTS araya_edit_logs_page    ON araya_edit_logs (page);
CREATE INDEX IF NOT EXISTS araya_edit_logs_user    ON araya_edit_logs (user_id);

-- ── User behavior events (feeds optimization reasoning protocol) ─────────────
CREATE TABLE IF NOT EXISTS araya_behavior_logs (
    id          BIGSERIAL PRIMARY KEY,
    event_type  TEXT        NOT NULL,
    page        TEXT        NOT NULL DEFAULT 'unknown',
    user_id     TEXT        NOT NULL DEFAULT 'anonymous',
    data        JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS araya_behavior_logs_page ON araya_behavior_logs (page);
CREATE INDEX IF NOT EXISTS araya_behavior_logs_user ON araya_behavior_logs (user_id);
CREATE INDEX IF NOT EXISTS araya_behavior_logs_event ON araya_behavior_logs (event_type);

-- ── Custom user layouts ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS araya_layouts (
    id          BIGSERIAL PRIMARY KEY,
    user_id     TEXT        NOT NULL,
    page        TEXT        NOT NULL,
    layout      JSONB       NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, page)
);

CREATE INDEX IF NOT EXISTS araya_layouts_user ON araya_layouts (user_id);
CREATE INDEX IF NOT EXISTS araya_layouts_page ON araya_layouts (page);

-- ── Theme preferences ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS araya_theme_prefs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     TEXT        NOT NULL,
    page        TEXT        NOT NULL DEFAULT '__global__',
    theme       TEXT        NOT NULL DEFAULT 'sacred',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, page)
);

CREATE INDEX IF NOT EXISTS araya_theme_prefs_user  ON araya_theme_prefs (user_id);
CREATE INDEX IF NOT EXISTS araya_theme_prefs_page  ON araya_theme_prefs (page);
CREATE INDEX IF NOT EXISTS araya_theme_prefs_theme ON araya_theme_prefs (theme);

-- ── Theme votes ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS araya_theme_votes (
    id          BIGSERIAL PRIMARY KEY,
    user_id     TEXT        NOT NULL,
    page        TEXT        NOT NULL DEFAULT '__global__',
    theme       TEXT        NOT NULL,
    voted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, page)
);

CREATE INDEX IF NOT EXISTS araya_theme_votes_theme ON araya_theme_votes (theme);
CREATE INDEX IF NOT EXISTS araya_theme_votes_page  ON araya_theme_votes (page);

-- ── Row-level security (optional — enable for production) ───────────────────
-- ALTER TABLE araya_edit_logs     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE araya_behavior_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE araya_layouts       ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE araya_theme_prefs   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE araya_theme_votes   ENABLE ROW LEVEL SECURITY;
