-- ═══════════════════════════════════════════════════════════════════════════
-- Face Authentication Schema - Consciousness Revolution
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this SQL in the Supabase SQL editor to enable face auth.
--
-- Tables:
--   face_auth_descriptors — one-time enrolled face embeddings per user
--   face_auth_logs        — audit trail of all face auth attempts
--   sso_tokens            — short-lived cross-site SSO tokens
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Face descriptor storage ──────────────────────────────────────────────────
-- Stores the 128-float face-api.js descriptor for each enrolled user.
-- One active descriptor per user; re-enrollment replaces previous.
CREATE TABLE IF NOT EXISTS face_auth_descriptors (
    id              BIGSERIAL   PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descriptor      JSONB       NOT NULL,           -- 128-element float array
    model_version   TEXT        NOT NULL DEFAULT 'ssd_mobilenetv1',
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    site_origin     TEXT,                            -- which site enrolled from
    ip_address_hash TEXT                             -- anonymised enrolling IP
);

CREATE INDEX IF NOT EXISTS face_auth_desc_user ON face_auth_descriptors (user_id);
CREATE INDEX IF NOT EXISTS face_auth_desc_active ON face_auth_descriptors (user_id, is_active);

-- ── Face auth event logs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS face_auth_logs (
    id              BIGSERIAL   PRIMARY KEY,
    user_id         UUID,                            -- null for failed/unknown
    action          TEXT        NOT NULL,            -- 'enroll'|'verify'|'sso_issue'|'sso_verify'
    status          TEXT        NOT NULL,            -- 'success'|'failure'|'no_enrollment'
    site_origin     TEXT,
    ip_address_hash TEXT,
    distance        FLOAT,                           -- Euclidean distance for 'verify'
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS face_auth_logs_user   ON face_auth_logs (user_id);
CREATE INDEX IF NOT EXISTS face_auth_logs_action ON face_auth_logs (action);
CREATE INDEX IF NOT EXISTS face_auth_logs_ts     ON face_auth_logs (created_at);

-- ── Cross-site SSO tokens ─────────────────────────────────────────────────────
-- Short-lived (5-minute) one-use tokens that let an authenticated user on
-- conciousnessrevolution.io log in to barbrickdesign.github.io without
-- re-entering credentials.
CREATE TABLE IF NOT EXISTS sso_tokens (
    id          BIGSERIAL   PRIMARY KEY,
    token       TEXT        NOT NULL UNIQUE,   -- 64-hex random token
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_site TEXT        NOT NULL,          -- intended redirect host
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sso_tokens_token   ON sso_tokens (token);
CREATE INDEX IF NOT EXISTS sso_tokens_user    ON sso_tokens (user_id);
CREATE INDEX IF NOT EXISTS sso_tokens_expires ON sso_tokens (expires_at);

-- Auto-clean expired tokens daily (optional: enable pg_cron in Supabase)
-- SELECT cron.schedule('clean-sso-tokens', '0 4 * * *',
--   $$DELETE FROM sso_tokens WHERE expires_at < NOW() - INTERVAL '1 day'$$);

-- ── Row-level security ────────────────────────────────────────────────────────
-- Users can only read/write their own descriptors and logs.
ALTER TABLE face_auth_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_auth_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_tokens            ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by Netlify functions)
CREATE POLICY "service_role_all_face_desc"
    ON face_auth_descriptors FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_face_logs"
    ON face_auth_logs FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_sso_tokens"
    ON sso_tokens FOR ALL
    USING (auth.role() = 'service_role');
