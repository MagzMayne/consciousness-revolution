-- ARAYA_CREDITS_LEDGER.sql
-- Unified credit system for all ARAYA products
-- Deploy: Supabase Dashboard → SQL Editor → Run this file
-- Created: 2026-02-27

-- ═══════════════════════════════════════════════════════════════
-- 1. USER PROFILES (Enhanced with Stripe integration)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS araya_user_profiles (
    id SERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    stripe_customer_id TEXT UNIQUE,
    tier TEXT DEFAULT 'free', -- 'free', 'beta', 'pro', 'enterprise'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON araya_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON araya_user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe ON araya_user_profiles(stripe_customer_id);

-- RLS policies
ALTER TABLE araya_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON araya_user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Service role full access" ON araya_user_profiles
    FOR ALL USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 2. CREDIT LEDGER (Main balance table)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS araya_credits (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    credits_balance INTEGER NOT NULL DEFAULT 0,
    lifetime_purchased INTEGER NOT NULL DEFAULT 0,
    lifetime_spent INTEGER NOT NULL DEFAULT 0,
    tier TEXT DEFAULT 'free', -- 'free', 'beta', 'pro', 'enterprise'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON araya_credits(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_credits_user_unique ON araya_credits(user_id);

-- Enable RLS
ALTER TABLE araya_credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own credits
CREATE POLICY "Users view own credits" ON araya_credits
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Service role can do anything (for API functions)
CREATE POLICY "Service role full access credits" ON araya_credits
    FOR ALL USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 3. TRANSACTION LOG (Every credit movement tracked)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS araya_credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'purchase', 'spend', 'refund', 'bonus', 'promo'
    amount INTEGER NOT NULL, -- positive for add, negative for spend
    balance_after INTEGER NOT NULL,
    product TEXT, -- 'terminal', 'browser', 'api', 'life', 'case_builder', 'unknown'
    metadata JSONB DEFAULT '{}'::jsonb,
    stripe_session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON araya_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON araya_credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON araya_credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON araya_credit_transactions(product);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe ON araya_credit_transactions(stripe_session_id);

-- RLS
ALTER TABLE araya_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON araya_credit_transactions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Service role full access transactions" ON araya_credit_transactions
    FOR ALL USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 4. CREDIT PACKAGES (Product catalog)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS araya_credit_packages (
    id SERIAL PRIMARY KEY,
    package_id TEXT UNIQUE NOT NULL, -- 'starter', 'popular', 'pro', 'enterprise'
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    bonus_credits INTEGER DEFAULT 0,
    price_cents INTEGER NOT NULL, -- Price in cents (e.g., 1000 = $10.00)
    stripe_price_id TEXT,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial packages
INSERT INTO araya_credit_packages (package_id, name, credits, bonus_credits, price_cents, metadata) VALUES
('starter', 'Starter Pack', 100, 0, 1000, '{"best_for": "Trying out ARAYA"}'::jsonb),
('popular', 'Popular Pack', 1000, 100, 9000, '{"best_for": "Regular users", "badge": "BEST VALUE"}'::jsonb),
('pro', 'Pro Pack', 5000, 1000, 39900, '{"best_for": "Power users"}'::jsonb),
('enterprise', 'Enterprise Pack', 20000, 5000, 149900, '{"best_for": "Teams & businesses"}'::jsonb)
ON CONFLICT (package_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_packages_active ON araya_credit_packages(active);

-- ═══════════════════════════════════════════════════════════════
-- 5. PRODUCT CREDIT COSTS (Pricing per action)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS araya_product_costs (
    id SERIAL PRIMARY KEY,
    product TEXT NOT NULL, -- 'terminal', 'browser', 'api', 'life', 'case_builder'
    action TEXT NOT NULL,
    credits_cost DECIMAL(10,2) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial costs
INSERT INTO araya_product_costs (product, action, credits_cost, description) VALUES
-- Terminal Chat
('terminal', 'basic_message', 1, 'Standard chat message'),
('terminal', 'vision_message', 2, 'Message with image analysis'),
('terminal', 'long_message', 2, 'Message over 500 characters'),

-- Browser Extension
('browser', 'page_analysis', 1, 'Analyze current page'),
('browser', 'screenshot_analysis', 2, 'Screenshot + analysis'),
('browser', 'document_summary', 1, 'Summarize document'),

-- Life Coach
('life', 'quick_question', 1, 'Quick Q&A'),
('life', 'coaching_session', 5, 'Full coaching session'),
('life', 'domain_analysis', 10, '7-domain life analysis'),

-- Case Builder
('case_builder', 'create_case', 2, 'Create new case'),
('case_builder', 'add_event', 1, 'Add event to case'),
('case_builder', 'generate_timeline', 3, 'Generate case timeline'),
('case_builder', 'link_evidence', 1, 'Link evidence to case'),

-- API Access
('api', 'basic_call', 0.1, 'Basic API call'),
('api', 'complex_query', 0.5, 'Complex query'),
('api', 'vision_api', 1, 'Vision API call')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_costs_product ON araya_product_costs(product);
CREATE INDEX IF NOT EXISTS idx_costs_active ON araya_product_costs(active);

-- ═══════════════════════════════════════════════════════════════
-- 6. HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function: Get user's current balance
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id TEXT)
RETURNS TABLE(credits INTEGER, tier TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT credits_balance, araya_credits.tier
    FROM araya_credits
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user has enough credits
CREATE OR REPLACE FUNCTION check_credits(p_user_id TEXT, p_required INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT credits_balance INTO v_balance
    FROM araya_credits
    WHERE user_id = p_user_id;

    RETURN COALESCE(v_balance, 0) >= p_required;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get credit cost for action
CREATE OR REPLACE FUNCTION get_action_cost(p_product TEXT, p_action TEXT)
RETURNS DECIMAL AS $$
DECLARE
    v_cost DECIMAL;
BEGIN
    SELECT credits_cost INTO v_cost
    FROM araya_product_costs
    WHERE product = p_product AND action = p_action AND active = true;

    RETURN COALESCE(v_cost, 1); -- Default to 1 credit if not found
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- 7. VIEWS FOR ANALYTICS
-- ═══════════════════════════════════════════════════════════════

-- View: User spending summary
CREATE OR REPLACE VIEW user_spending_summary AS
SELECT
    user_id,
    SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END) as total_purchased,
    SUM(CASE WHEN type = 'spend' THEN ABS(amount) ELSE 0 END) as total_spent,
    COUNT(CASE WHEN type = 'spend' THEN 1 END) as transaction_count,
    MAX(created_at) as last_transaction
FROM araya_credit_transactions
GROUP BY user_id;

-- View: Product usage stats
CREATE OR REPLACE VIEW product_usage_stats AS
SELECT
    product,
    COUNT(*) as usage_count,
    SUM(ABS(amount)) as total_credits_spent,
    AVG(ABS(amount)) as avg_credits_per_use,
    COUNT(DISTINCT user_id) as unique_users
FROM araya_credit_transactions
WHERE type = 'spend' AND product IS NOT NULL
GROUP BY product;

-- View: Daily revenue
CREATE OR REPLACE VIEW daily_revenue AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as purchases,
    SUM(amount) as credits_sold,
    COUNT(DISTINCT user_id) as unique_buyers
FROM araya_credit_transactions
WHERE type = 'purchase'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ═══════════════════════════════════════════════════════════════
-- 8. VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════

-- Check all tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'araya_%'
ORDER BY table_name;

-- Check packages loaded
SELECT package_id, name, credits, bonus_credits, price_cents
FROM araya_credit_packages
ORDER BY price_cents;

-- Check product costs loaded
SELECT product, action, credits_cost
FROM araya_product_costs
ORDER BY product, action;

-- ═══════════════════════════════════════════════════════════════
-- DEPLOYMENT COMPLETE
-- ═══════════════════════════════════════════════════════════════

SELECT 'ARAYA UNIFIED CREDITS SYSTEM - DATABASE DEPLOYED' as status,
       NOW() as deployed_at;
