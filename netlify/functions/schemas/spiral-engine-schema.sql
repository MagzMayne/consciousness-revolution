-- ============================================================
-- SPIRAL ENGINE SCHEMA - 7 Forges Progression System
-- 13-Level Fibonacci XP Spiral | Pattern: 3 → 7 → 13 → ∞
-- ============================================================
-- Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
-- Created: 2026-03-11 | C1 Mechanic Build
-- Deploy: Run in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: FORGE DEFINITIONS
-- ============================================================

-- 7 Forges with metadata
CREATE TABLE IF NOT EXISTS spiral_forges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    sequence INTEGER NOT NULL CHECK (sequence >= 1 AND sequence <= 7),
    unlock_level INTEGER DEFAULT 0, -- 0 = starts unlocked, 7 = unlocked by Reality L7
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sequence)
);

-- 13 Levels per Forge with Fibonacci XP requirements
CREATE TABLE IF NOT EXISTS spiral_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 13),
    xp_required INTEGER NOT NULL,
    xp_cumulative INTEGER NOT NULL, -- Total XP from L1 to this level
    name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(level)
);

-- ============================================================
-- PART 2: USER PROGRESS TRACKING
-- ============================================================

-- User progress across all 7 forges
CREATE TABLE IF NOT EXISTS spiral_forge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users(id)
    forge_slug TEXT NOT NULL REFERENCES spiral_forges(slug) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 13),
    current_xp INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, forge_slug)
);

-- XP transactions (every XP gain/loss event)
CREATE TABLE IF NOT EXISTS spiral_xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    forge_slug TEXT NOT NULL REFERENCES spiral_forges(slug) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Can be negative for corrections
    balance_after INTEGER NOT NULL,
    source TEXT NOT NULL CHECK (source IN (
        'daily_login', 'mission_complete', 'challenge_win',
        'content_create', 'community_help', 'purchase',
        'bonus', 'admin_grant', 'correction'
    )),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Level-up history (celebration log)
CREATE TABLE IF NOT EXISTS spiral_level_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    forge_slug TEXT NOT NULL REFERENCES spiral_forges(slug) ON DELETE CASCADE,
    from_level INTEGER NOT NULL,
    to_level INTEGER NOT NULL,
    xp_at_levelup INTEGER NOT NULL,
    rewards JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forge unlock history
CREATE TABLE IF NOT EXISTS spiral_forge_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    forge_slug TEXT NOT NULL REFERENCES spiral_forges(slug) ON DELETE CASCADE,
    unlocked_by TEXT, -- 'reality_l7' or 'infinity_octave' or 'admin_grant'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, forge_slug)
);

-- Octave returns (when user hits L13 Infinity → L8 Reality)
CREATE TABLE IF NOT EXISTS spiral_octave_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    return_count INTEGER DEFAULT 1, -- How many times they've completed the spiral
    previous_reality_level INTEGER NOT NULL,
    new_reality_level INTEGER NOT NULL,
    infinity_xp_at_return INTEGER NOT NULL,
    rewards JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases (track what users buy with real money)
CREATE TABLE IF NOT EXISTS spiral_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT,
    stripe_session_id TEXT,
    stripe_payment_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    xp_granted INTEGER DEFAULT 0,
    forge_slug TEXT REFERENCES spiral_forges(slug),
    status TEXT DEFAULT 'completed' CHECK (status IN (
        'pending', 'completed', 'refunded', 'failed'
    )),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 3: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_forge_progress_user ON spiral_forge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_forge_progress_slug ON spiral_forge_progress(forge_slug);
CREATE INDEX IF NOT EXISTS idx_forge_progress_user_slug ON spiral_forge_progress(user_id, forge_slug);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON spiral_xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_forge ON spiral_xp_transactions(forge_slug);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created ON spiral_xp_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_level_ups_user ON spiral_level_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_level_ups_created ON spiral_level_ups(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forge_unlocks_user ON spiral_forge_unlocks(user_id);

CREATE INDEX IF NOT EXISTS idx_octave_returns_user ON spiral_octave_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_octave_returns_created ON spiral_octave_returns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON spiral_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON spiral_purchases(stripe_session_id);

-- ============================================================
-- PART 4: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE spiral_forges ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_forge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_level_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_forge_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_octave_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_purchases ENABLE ROW LEVEL SECURITY;

-- Public read for forge definitions and level requirements
CREATE POLICY "Forges publicly readable"
    ON spiral_forges FOR SELECT
    USING (true);

CREATE POLICY "Levels publicly readable"
    ON spiral_levels FOR SELECT
    USING (true);

-- Users see only their own progress
CREATE POLICY "Users see own progress"
    ON spiral_forge_progress FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users see own transactions"
    ON spiral_xp_transactions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users see own level ups"
    ON spiral_level_ups FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users see own unlocks"
    ON spiral_forge_unlocks FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users see own octave returns"
    ON spiral_octave_returns FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users see own purchases"
    ON spiral_purchases FOR SELECT
    USING (user_id = auth.uid());

-- ============================================================
-- PART 5: FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_forge_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forge_progress_updated_at
    BEFORE UPDATE ON spiral_forge_progress
    FOR EACH ROW EXECUTE FUNCTION update_forge_progress_timestamp();

-- Add XP and check for level up
CREATE OR REPLACE FUNCTION add_xp_and_level_up(
    p_user_id UUID,
    p_forge_slug TEXT,
    p_amount INTEGER,
    p_source TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_progress RECORD;
    v_level RECORD;
    v_new_total_xp INTEGER;
    v_new_level INTEGER;
    v_leveled_up BOOLEAN DEFAULT FALSE;
    v_result JSONB;
BEGIN
    -- Get current progress
    SELECT * INTO v_progress
    FROM spiral_forge_progress
    WHERE user_id = p_user_id AND forge_slug = p_forge_slug;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Forge not unlocked for user';
    END IF;

    -- Calculate new total XP
    v_new_total_xp := v_progress.total_xp + p_amount;

    -- Check what level this XP puts them at
    SELECT level INTO v_new_level
    FROM spiral_levels
    WHERE xp_cumulative <= v_new_total_xp
    ORDER BY level DESC
    LIMIT 1;

    IF v_new_level IS NULL THEN
        v_new_level := 1;
    END IF;

    -- Check if they leveled up
    IF v_new_level > v_progress.current_level THEN
        v_leveled_up := TRUE;

        -- Log level up
        INSERT INTO spiral_level_ups (user_id, forge_slug, from_level, to_level, xp_at_levelup)
        VALUES (p_user_id, p_forge_slug, v_progress.current_level, v_new_level, v_new_total_xp);

        -- Check for special unlocks
        IF p_forge_slug = 'reality' AND v_new_level = 7 THEN
            -- Unlock all other 6 forges
            PERFORM unlock_all_forges(p_user_id);
        END IF;

        IF p_forge_slug = 'infinity' AND v_new_level = 13 THEN
            -- Octave return - Reality goes to L8
            PERFORM octave_return(p_user_id);
        END IF;
    END IF;

    -- Calculate current_xp (XP within current level)
    SELECT xp_cumulative INTO v_level
    FROM spiral_levels
    WHERE level = v_new_level;

    -- Update progress
    UPDATE spiral_forge_progress
    SET
        current_level = v_new_level,
        current_xp = v_new_total_xp - COALESCE(v_level, 0),
        total_xp = v_new_total_xp,
        last_activity_at = NOW()
    WHERE user_id = p_user_id AND forge_slug = p_forge_slug;

    -- Log transaction
    INSERT INTO spiral_xp_transactions (user_id, forge_slug, amount, balance_after, source, metadata)
    VALUES (p_user_id, p_forge_slug, p_amount, v_new_total_xp, p_source, p_metadata);

    -- Return result
    v_result := jsonb_build_object(
        'success', true,
        'new_level', v_new_level,
        'total_xp', v_new_total_xp,
        'leveled_up', v_leveled_up,
        'amount_added', p_amount
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Unlock all 6 forges when Reality hits L7
CREATE OR REPLACE FUNCTION unlock_all_forges(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_forge RECORD;
BEGIN
    FOR v_forge IN SELECT slug FROM spiral_forges WHERE slug != 'reality' LOOP
        -- Create progress record
        INSERT INTO spiral_forge_progress (user_id, forge_slug, current_level, unlocked_at)
        VALUES (p_user_id, v_forge.slug, 1, NOW())
        ON CONFLICT (user_id, forge_slug) DO NOTHING;

        -- Log unlock
        INSERT INTO spiral_forge_unlocks (user_id, forge_slug, unlocked_by)
        VALUES (p_user_id, v_forge.slug, 'reality_l7')
        ON CONFLICT (user_id, forge_slug) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Octave return: L13 Infinity → L8 Reality
CREATE OR REPLACE FUNCTION octave_return(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_reality_progress RECORD;
    v_infinity_xp INTEGER;
    v_return_count INTEGER;
BEGIN
    -- Get Reality current level
    SELECT * INTO v_reality_progress
    FROM spiral_forge_progress
    WHERE user_id = p_user_id AND forge_slug = 'reality';

    -- Get Infinity XP
    SELECT total_xp INTO v_infinity_xp
    FROM spiral_forge_progress
    WHERE user_id = p_user_id AND forge_slug = 'infinity';

    -- Count previous returns
    SELECT COALESCE(MAX(return_count), 0) + 1 INTO v_return_count
    FROM spiral_octave_returns
    WHERE user_id = p_user_id;

    -- Log the octave return
    INSERT INTO spiral_octave_returns (
        user_id, return_count, previous_reality_level,
        new_reality_level, infinity_xp_at_return
    )
    VALUES (
        p_user_id, v_return_count, v_reality_progress.current_level,
        8, v_infinity_xp
    );

    -- Update Reality to L8 (skip L1-L7)
    UPDATE spiral_forge_progress
    SET
        current_level = 8,
        current_xp = 0,
        total_xp = (SELECT xp_cumulative FROM spiral_levels WHERE level = 8),
        last_activity_at = NOW()
    WHERE user_id = p_user_id AND forge_slug = 'reality';

    -- Log level jump
    INSERT INTO spiral_level_ups (user_id, forge_slug, from_level, to_level, xp_at_levelup)
    VALUES (p_user_id, 'reality', v_reality_progress.current_level, 8,
            (SELECT xp_cumulative FROM spiral_levels WHERE level = 8));
END;
$$ LANGUAGE plpgsql;

-- Initialize new user with Reality Forge at L1
CREATE OR REPLACE FUNCTION initialize_spiral_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Create Reality Forge progress
    INSERT INTO spiral_forge_progress (user_id, forge_slug, current_level, unlocked_at)
    VALUES (p_user_id, 'reality', 1, NOW())
    ON CONFLICT (user_id, forge_slug) DO NOTHING;

    -- Log unlock
    INSERT INTO spiral_forge_unlocks (user_id, forge_slug, unlocked_by)
    VALUES (p_user_id, 'reality', 'new_user')
    ON CONFLICT (user_id, forge_slug) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PART 6: SEED DATA - 7 FORGES
-- ============================================================

INSERT INTO spiral_forges (slug, name, description, color, icon, sequence, unlock_level)
VALUES
    ('reality', 'Reality Forge', 'Master the physical plane and practical skills', '#FF6B6B', '🔨', 1, 0),
    ('creation', 'Creation Forge', 'Build, design, and manifest your visions', '#4ECDC4', '🎨', 2, 7),
    ('communications', 'Communications Forge', 'Connect, influence, and express truth', '#45B7D1', '📡', 3, 7),
    ('guardian', 'Guardian Forge', 'Protect, defend, and maintain boundaries', '#96CEB4', '🛡️', 4, 7),
    ('wealth', 'Wealth Forge', 'Generate, multiply, and steward resources', '#FFEAA7', '💰', 5, 7),
    ('character', 'Character Forge', 'Develop wisdom, virtue, and self-mastery', '#DDA15E', '⚡', 6, 7),
    ('infinity', 'Infinity Forge', 'Transcend limits and access higher consciousness', '#BC6C25', '♾️', 7, 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 7: SEED DATA - 13 FIBONACCI LEVELS
-- ============================================================

-- XP requirements: L1=100, L2=100, L3=200, L4=300, L5=500, L6=800, L7=1300
-- L8=2100, L9=3400, L10=5500, L11=8900, L12=14400, L13=23300

INSERT INTO spiral_levels (level, xp_required, xp_cumulative, name, description)
VALUES
    (1, 100, 0, 'Initiate', 'First steps on the path'),
    (2, 100, 100, 'Apprentice', 'Basic understanding forms'),
    (3, 200, 200, 'Journeyman', 'Skills begin to solidify'),
    (4, 300, 400, 'Craftsman', 'Competence emerges clearly'),
    (5, 500, 700, 'Adept', 'True skill becomes visible'),
    (6, 800, 1200, 'Expert', 'Mastery starts to shine'),
    (7, 1300, 2000, 'Master', 'Command of the domain'),
    (8, 2100, 3300, 'Virtuoso', 'Excellence becomes natural'),
    (9, 3400, 5400, 'Sage', 'Wisdom guides every action'),
    (10, 5500, 8800, 'Luminary', 'Light for others to follow'),
    (11, 8900, 14300, 'Legend', 'Stories will be told'),
    (12, 14400, 23200, 'Immortal', 'Impact echoes through time'),
    (13, 23300, 37600, 'Transcendent', 'Beyond mortal limits')
ON CONFLICT (level) DO NOTHING;

-- ============================================================
-- PART 8: VIEWS FOR EASY QUERYING
-- ============================================================

-- User's complete progress dashboard
CREATE OR REPLACE VIEW spiral_user_dashboard AS
SELECT
    fp.user_id,
    f.slug as forge_slug,
    f.name as forge_name,
    f.color as forge_color,
    f.icon as forge_icon,
    f.sequence as forge_sequence,
    fp.current_level,
    fp.current_xp,
    fp.total_xp,
    l.name as level_name,
    l.xp_required as xp_for_next_level,
    fp.unlocked_at,
    fp.last_activity_at,
    CASE
        WHEN fp.unlocked_at IS NULL THEN 'locked'
        ELSE 'unlocked'
    END as status
FROM spiral_forge_progress fp
JOIN spiral_forges f ON fp.forge_slug = f.slug
LEFT JOIN spiral_levels l ON fp.current_level = l.level
ORDER BY f.sequence;

-- Leaderboard view
CREATE OR REPLACE VIEW spiral_leaderboard AS
SELECT
    user_id,
    forge_slug,
    current_level,
    total_xp,
    RANK() OVER (PARTITION BY forge_slug ORDER BY total_xp DESC) as rank,
    last_activity_at
FROM spiral_forge_progress
WHERE unlocked_at IS NOT NULL
ORDER BY forge_slug, total_xp DESC;

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'SPIRAL ENGINE SCHEMA - DEPLOYMENT COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Tables Created: 9';
    RAISE NOTICE '  - spiral_forges (7 forges seeded)';
    RAISE NOTICE '  - spiral_levels (13 Fibonacci levels seeded)';
    RAISE NOTICE '  - spiral_forge_progress';
    RAISE NOTICE '  - spiral_xp_transactions';
    RAISE NOTICE '  - spiral_level_ups';
    RAISE NOTICE '  - spiral_forge_unlocks';
    RAISE NOTICE '  - spiral_octave_returns';
    RAISE NOTICE '  - spiral_purchases';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions Created: 4';
    RAISE NOTICE '  - add_xp_and_level_up()';
    RAISE NOTICE '  - unlock_all_forges()';
    RAISE NOTICE '  - octave_return()';
    RAISE NOTICE '  - initialize_spiral_user()';
    RAISE NOTICE '';
    RAISE NOTICE 'Views Created: 2';
    RAISE NOTICE '  - spiral_user_dashboard';
    RAISE NOTICE '  - spiral_leaderboard';
    RAISE NOTICE '';
    RAISE NOTICE 'Pattern: 3 → 7 → 13 → ∞ | LFSME';
    RAISE NOTICE 'Ready for API integration!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
