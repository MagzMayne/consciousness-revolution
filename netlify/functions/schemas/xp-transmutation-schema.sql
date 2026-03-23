-- ============================================================
-- XP TRANSMUTATION SCHEMA
-- Tracks XP → crypto token redemption requests
--
-- Supported tokens:
--   OKK    – Overkill Kulture  : CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump
--   RootIB – Root Idea Block   : 6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump
--
-- Deploy: Run in Supabase SQL Editor
-- Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
-- ============================================================

CREATE TABLE IF NOT EXISTS xp_transmutations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_id           TEXT        UNIQUE NOT NULL,              -- internal transaction ID
    token_key       TEXT        NOT NULL CHECK (token_key IN ('OKK', 'RootIB')),
    token_address   TEXT        NOT NULL,                     -- Solana mint address
    token_symbol    TEXT        NOT NULL,
    token_name      TEXT        NOT NULL,
    xp_spent        INTEGER     NOT NULL CHECK (xp_spent > 0),
    token_amount    INTEGER     NOT NULL CHECK (token_amount > 0),
    wallet_address  TEXT        NOT NULL,                     -- destination Solana wallet
    user_id         TEXT,                                     -- platform user ID (nullable)
    vault_wallet    TEXT        NOT NULL DEFAULT '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk',
    pumpfun_url     TEXT,
    status          TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    tx_signature    TEXT,                                     -- Solana transaction signature (filled on send)
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_xp_transmutations_wallet    ON xp_transmutations (wallet_address);
CREATE INDEX IF NOT EXISTS idx_xp_transmutations_user      ON xp_transmutations (user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transmutations_status    ON xp_transmutations (status);
CREATE INDEX IF NOT EXISTS idx_xp_transmutations_token_key ON xp_transmutations (token_key);
CREATE INDEX IF NOT EXISTS idx_xp_transmutations_created   ON xp_transmutations (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_xp_transmutations_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xp_transmutations_updated_at ON xp_transmutations;
CREATE TRIGGER trg_xp_transmutations_updated_at
    BEFORE UPDATE ON xp_transmutations
    FOR EACH ROW EXECUTE FUNCTION update_xp_transmutations_updated_at();

-- RLS: anyone can insert (they need their own wallet addr); only service role updates
ALTER TABLE xp_transmutations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_transmutations_insert" ON xp_transmutations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "xp_transmutations_select_own" ON xp_transmutations
    FOR SELECT USING (
        wallet_address = current_setting('app.wallet_address', true)
        OR user_id = current_setting('app.user_id', true)
    );

-- Summary view for admins / dashboards
CREATE OR REPLACE VIEW xp_transmutation_summary AS
SELECT
    token_key,
    token_symbol,
    COUNT(*)                        AS total_requests,
    SUM(xp_spent)                   AS total_xp_spent,
    SUM(token_amount)               AS total_tokens_issued,
    COUNT(*) FILTER (WHERE status = 'pending')    AS pending,
    COUNT(*) FILTER (WHERE status = 'sent')       AS sent,
    COUNT(*) FILTER (WHERE status = 'failed')     AS failed
FROM xp_transmutations
GROUP BY token_key, token_symbol;
