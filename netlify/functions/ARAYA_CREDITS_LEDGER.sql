-- ============================================================
-- ARAYA ENERGY LEDGER - Database Schema
-- ============================================================
-- Version: 1.0.0
-- Created: 2026-02-27
-- Platform: Supabase (PostgreSQL 15+)
-- Purpose: Unified credit system across all ARAYA products
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CORE TABLES
-- ============================================================

-- User Energy Accounts
-- Links Clerk identity to Stripe customer to Energy balance
CREATE TABLE IF NOT EXISTS araya_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,           -- Internal user ID
    clerk_id TEXT UNIQUE,                    -- Clerk authentication ID
    stripe_customer_id TEXT UNIQUE,          -- Stripe customer ID
    email TEXT,                              -- User email (denormalized for speed)

    -- Balance tracking
    current_balance INTEGER NOT NULL DEFAULT 100,  -- Current Energy balance
    lifetime_purchased INTEGER NOT NULL DEFAULT 0,  -- Total Energy ever purchased
    lifetime_consumed INTEGER NOT NULL DEFAULT 0,   -- Total Energy ever consumed
    lifetime_bonus INTEGER NOT NULL DEFAULT 0,      -- Total bonus Energy received

    -- Subscription info
    tier TEXT NOT NULL DEFAULT 'flow' CHECK (tier IN ('flow', 'create', 'build', 'scale')),
    subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'past_due', 'canceled')),
    subscription_period_end TIMESTAMPTZ,
    monthly_allocation INTEGER NOT NULL DEFAULT 100,  -- Energy per billing cycle

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transaction Ledger (append-only)
-- Every Energy movement is recorded here - source of truth
CREATE TABLE IF NOT EXISTS araya_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES araya_accounts(id) ON DELETE CASCADE,

    -- Transaction details
    amount INTEGER NOT NULL,                 -- Positive = credit, Negative = debit
    balance_after INTEGER NOT NULL,          -- Balance after this transaction

    -- Classification
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'purchase',         -- Bought Energy
        'subscription',     -- Monthly allocation
        'bonus',           -- Promotional Energy
        'consume',         -- Used Energy (product action)
        'refund',          -- Returned Energy
        'expire',          -- Bonus Energy expiration
        'admin'            -- Manual adjustment
    )),

    -- Source tracking
    product_source TEXT CHECK (product_source IN (
        'terminal',        -- ARAYA Terminal (CLI)
        'edit',           -- ARAYA Edit (Extension)
        'voice',          -- ARAYA Voice (Chat)
        'life',           -- ARAYA Life (Human OS)
        'api',            -- ARAYA API (Trinity)
        'system'          -- System-generated
    )),

    -- Action tracking (for consumption)
    action_type TEXT,                        -- Specific action (e.g., 'page_analysis', 'chat_message')

    -- External references
    stripe_payment_id TEXT,                  -- Stripe payment intent ID
    stripe_invoice_id TEXT,                  -- Stripe invoice ID

    -- Idempotency
    idempotency_key TEXT UNIQUE,             -- Prevent duplicate transactions

    -- Metadata
    metadata JSONB DEFAULT '{}',             -- Flexible additional data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Energy Packages (Stripe products)
-- Maps Stripe products to Energy amounts
CREATE TABLE IF NOT EXISTS araya_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,                      -- Display name
    description TEXT,                        -- Package description

    -- Pricing
    energy_amount INTEGER NOT NULL,          -- Base Energy included
    bonus_energy INTEGER NOT NULL DEFAULT 0, -- Extra bonus Energy
    price_usd DECIMAL(10,2) NOT NULL,        -- Price in USD

    -- Stripe mapping
    stripe_product_id TEXT UNIQUE,           -- Stripe product ID
    stripe_price_id TEXT UNIQUE,             -- Stripe price ID

    -- Package type
    package_type TEXT NOT NULL CHECK (package_type IN ('one_time', 'subscription')),
    tier TEXT CHECK (tier IN ('flow', 'create', 'build', 'scale')),
    billing_period TEXT CHECK (billing_period IN ('month', 'year')),

    -- Status
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Costs (per-action pricing)
-- Defines Energy cost for each action across products
CREATE TABLE IF NOT EXISTS araya_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product TEXT NOT NULL CHECK (product IN ('terminal', 'edit', 'voice', 'life', 'api')),
    action TEXT NOT NULL,                    -- Action identifier
    display_name TEXT NOT NULL,              -- Human-readable name
    description TEXT,                        -- What this action does

    -- Pricing
    energy_cost INTEGER NOT NULL,            -- Energy required

    -- Flags
    active BOOLEAN NOT NULL DEFAULT true,
    requires_tier TEXT,                      -- Minimum tier required (null = any)

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(product, action)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_accounts_clerk ON araya_accounts(clerk_id);
CREATE INDEX IF NOT EXISTS idx_accounts_stripe ON araya_accounts(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_email ON araya_accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_tier ON araya_accounts(tier);

CREATE INDEX IF NOT EXISTS idx_transactions_account ON araya_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON araya_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON araya_transactions(product_source);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON araya_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency ON araya_transactions(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_packages_active ON araya_packages(active, display_order);
CREATE INDEX IF NOT EXISTS idx_packages_stripe ON araya_packages(stripe_price_id);

CREATE INDEX IF NOT EXISTS idx_costs_product ON araya_costs(product, active);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE araya_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE araya_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own account
CREATE POLICY "Users view own account" ON araya_accounts
    FOR SELECT USING (auth.uid()::text = clerk_id OR auth.uid()::text = user_id);

-- Users can only see their own transactions
CREATE POLICY "Users view own transactions" ON araya_transactions
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM araya_accounts
            WHERE auth.uid()::text = clerk_id OR auth.uid()::text = user_id
        )
    );

-- Service role can do everything (for API)
CREATE POLICY "Service role full access accounts" ON araya_accounts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access transactions" ON araya_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON araya_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON araya_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_costs_updated_at
    BEFORE UPDATE ON araya_costs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Spend Energy function (atomic operation)
CREATE OR REPLACE FUNCTION spend_energy(
    p_account_id UUID,
    p_amount INTEGER,
    p_product TEXT,
    p_action TEXT,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, message TEXT) AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_idempotency_key TEXT;
BEGIN
    -- Generate idempotency key if not provided
    v_idempotency_key := COALESCE(p_idempotency_key, uuid_generate_v4()::text);

    -- Check for duplicate transaction
    IF EXISTS (SELECT 1 FROM araya_transactions WHERE idempotency_key = v_idempotency_key) THEN
        RETURN QUERY SELECT false, 0, 'Duplicate transaction';
        RETURN;
    END IF;

    -- Lock and get current balance
    SELECT current_balance INTO v_current_balance
    FROM araya_accounts
    WHERE id = p_account_id
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RETURN QUERY SELECT false, 0, 'Account not found';
        RETURN;
    END IF;

    -- Check sufficient balance
    IF v_current_balance < p_amount THEN
        RETURN QUERY SELECT false, v_current_balance, 'Insufficient Energy';
        RETURN;
    END IF;

    -- Calculate new balance
    v_new_balance := v_current_balance - p_amount;

    -- Update account
    UPDATE araya_accounts
    SET current_balance = v_new_balance,
        lifetime_consumed = lifetime_consumed + p_amount,
        updated_at = NOW()
    WHERE id = p_account_id;

    -- Record transaction
    INSERT INTO araya_transactions (
        account_id, amount, balance_after, transaction_type,
        product_source, action_type, idempotency_key
    ) VALUES (
        p_account_id, -p_amount, v_new_balance, 'consume',
        p_product, p_action, v_idempotency_key
    );

    RETURN QUERY SELECT true, v_new_balance, 'Success';
END;
$$ LANGUAGE plpgsql;

-- Add Energy function (for purchases/subscriptions)
CREATE OR REPLACE FUNCTION add_energy(
    p_account_id UUID,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_stripe_payment_id TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, message TEXT) AS $$
DECLARE
    v_new_balance INTEGER;
    v_idempotency_key TEXT;
BEGIN
    v_idempotency_key := COALESCE(p_idempotency_key, uuid_generate_v4()::text);

    -- Check for duplicate
    IF EXISTS (SELECT 1 FROM araya_transactions WHERE idempotency_key = v_idempotency_key) THEN
        RETURN QUERY SELECT false, 0, 'Duplicate transaction';
        RETURN;
    END IF;

    -- Update account and get new balance
    UPDATE araya_accounts
    SET current_balance = current_balance + p_amount,
        lifetime_purchased = CASE WHEN p_transaction_type = 'purchase'
                                  THEN lifetime_purchased + p_amount
                                  ELSE lifetime_purchased END,
        lifetime_bonus = CASE WHEN p_transaction_type = 'bonus'
                              THEN lifetime_bonus + p_amount
                              ELSE lifetime_bonus END,
        updated_at = NOW()
    WHERE id = p_account_id
    RETURNING current_balance INTO v_new_balance;

    IF v_new_balance IS NULL THEN
        RETURN QUERY SELECT false, 0, 'Account not found';
        RETURN;
    END IF;

    -- Record transaction
    INSERT INTO araya_transactions (
        account_id, amount, balance_after, transaction_type,
        product_source, stripe_payment_id, idempotency_key
    ) VALUES (
        p_account_id, p_amount, v_new_balance, p_transaction_type,
        'system', p_stripe_payment_id, v_idempotency_key
    );

    RETURN QUERY SELECT true, v_new_balance, 'Success';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default pricing tiers
INSERT INTO araya_packages (name, description, energy_amount, bonus_energy, price_usd, package_type, tier, billing_period, display_order) VALUES
    ('Flow', 'Free tier - 100 Energy/month', 100, 0, 0.00, 'subscription', 'flow', 'month', 1),
    ('Create Monthly', 'Personal creators - 1,000 Energy/month', 1000, 0, 9.99, 'subscription', 'create', 'month', 2),
    ('Create Annual', 'Personal creators - 12,000 Energy/year', 12000, 0, 99.00, 'subscription', 'create', 'year', 3),
    ('Build Monthly', 'Professionals - 3,000 Energy/month', 3000, 0, 24.99, 'subscription', 'build', 'month', 4),
    ('Build Annual', 'Professionals - 36,000 Energy/year', 36000, 0, 249.00, 'subscription', 'build', 'year', 5),
    ('Scale Monthly', 'Unlimited Energy', 999999, 0, 49.99, 'subscription', 'scale', 'month', 6),
    ('Scale Annual', 'Unlimited Energy', 999999, 0, 499.00, 'subscription', 'scale', 'year', 7)
ON CONFLICT DO NOTHING;

-- Default action costs
INSERT INTO araya_costs (product, action, display_name, description, energy_cost) VALUES
    -- Terminal
    ('terminal', 'basic_command', 'Basic Command', 'Simple CLI operation', 1),
    ('terminal', 'complex_query', 'Complex Query', 'Multi-step analysis', 2),
    ('terminal', 'brain_search', 'Brain Search', 'Query Cyclotron memory', 1),

    -- Edit (Extension)
    ('edit', 'page_analysis', 'Page Analysis', 'Analyze current page', 1),
    ('edit', 'content_generation', 'Content Generation', 'Generate text/content', 2),
    ('edit', 'summarize', 'Summarize', 'Summarize page content', 1),

    -- Voice (Chat)
    ('voice', 'standard_message', 'Standard Message', 'Regular chat message', 1),
    ('voice', 'vision_image', 'Vision Analysis', 'Analyze image', 2),
    ('voice', 'long_context', 'Long Context', 'Extended conversation', 2),

    -- Life (Human OS)
    ('life', 'daily_sync', 'Daily Sync', 'Daily dashboard update', 0),
    ('life', 'ai_coaching', 'AI Coaching', 'Personal coaching session', 5),
    ('life', 'pattern_analysis', 'Pattern Analysis', '7-domain analysis', 3),

    -- API (Trinity)
    ('api', 'basic_call', 'Basic API Call', 'Single perspective', 1),
    ('api', 'trinity_analysis', 'Trinity Analysis', 'C1xC2xC3 multi-perspective', 10),
    ('api', 'batch_process', 'Batch Process', 'Bulk operations', 5)
ON CONFLICT (product, action) DO NOTHING;

-- ============================================================
-- VIEWS
-- ============================================================

-- User balance summary view
CREATE OR REPLACE VIEW v_account_summary AS
SELECT
    a.id,
    a.user_id,
    a.email,
    a.current_balance,
    a.tier,
    a.subscription_status,
    a.monthly_allocation,
    a.lifetime_consumed,
    a.lifetime_purchased,
    COALESCE(
        (SELECT SUM(ABS(amount))
         FROM araya_transactions
         WHERE account_id = a.id
         AND transaction_type = 'consume'
         AND created_at >= DATE_TRUNC('month', NOW())),
        0
    ) as consumed_this_month,
    a.monthly_allocation - COALESCE(
        (SELECT SUM(ABS(amount))
         FROM araya_transactions
         WHERE account_id = a.id
         AND transaction_type = 'consume'
         AND created_at >= DATE_TRUNC('month', NOW())),
        0
    ) as remaining_allocation
FROM araya_accounts a;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE araya_accounts IS 'User Energy accounts linking Clerk auth to Stripe billing';
COMMENT ON TABLE araya_transactions IS 'Append-only ledger of all Energy movements';
COMMENT ON TABLE araya_packages IS 'Available Energy packages mapped to Stripe products';
COMMENT ON TABLE araya_costs IS 'Per-action Energy costs across all ARAYA products';

COMMENT ON FUNCTION spend_energy IS 'Atomically deduct Energy with balance check';
COMMENT ON FUNCTION add_energy IS 'Add Energy from purchase, subscription, or bonus';

-- ============================================================
-- END OF SCHEMA
-- ============================================================
