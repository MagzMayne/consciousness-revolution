-- ============================================================
-- SPIRAL ENGINE CHEAT CODES SCHEMA
-- Sacred Geometry Achievement & Reward System
-- ============================================================
-- Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
-- Created: 2026-03-12 | C2 Architect Design
-- Deploy: Run in Supabase SQL Editor
-- Pattern: 3 → 7 → 13 → ∞ | LFSME
-- ============================================================

-- ============================================================
-- PART 1: CHEAT CODE TABLES
-- ============================================================

-- Cheat code definitions (the sacred patterns)
CREATE TABLE IF NOT EXISTS spiral_cheat_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discovery_hint TEXT, -- Shown to users who are "close"
    reward_type TEXT CHECK (reward_type IN (
        'xp_multiplier', 'badge', 'unlock', 'frequency', 'special'
    )),
    reward_data JSONB DEFAULT '{}',
    is_repeatable BOOLEAN DEFAULT false,
    discovery_count INTEGER DEFAULT 0, -- How many users found it
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User cheat code unlocks (who found what, when)
CREATE TABLE IF NOT EXISTS spiral_cheat_code_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code_slug TEXT NOT NULL REFERENCES spiral_cheat_codes(code_slug),
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    trigger_event TEXT, -- What action triggered discovery
    metadata JSONB DEFAULT '{}', -- Context at discovery
    reward_claimed BOOLEAN DEFAULT true, -- Auto-claimed on unlock
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, code_slug) -- One per user unless repeatable
);

-- User badges (achievements)
CREATE TABLE IF NOT EXISTS spiral_user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_slug TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    badge_icon TEXT,
    badge_color TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    earned_from TEXT, -- Which cheat code or achievement
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, badge_slug)
);

-- Active XP multipliers
CREATE TABLE IF NOT EXISTS spiral_xp_multipliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    multiplier DECIMAL(3,2) DEFAULT 1.00, -- 1.5 = +50%, 2.0 = 2x, 3.0 = 3x
    source TEXT NOT NULL, -- 'cheat_code_trinity', 'purchase', 'event'
    forge_slug TEXT REFERENCES spiral_forges(slug), -- NULL = all forges
    active_from TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL = permanent
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'
);

-- Audit log for cheat code system
CREATE TABLE IF NOT EXISTS spiral_cheat_code_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code_slug TEXT,
    action TEXT, -- 'check_attempted', 'unlock_claimed', 'reward_applied'
    ip_address TEXT,
    user_agent TEXT,
    was_valid BOOLEAN,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 2: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_cheat_unlocks_user ON spiral_cheat_code_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_cheat_unlocks_code ON spiral_cheat_code_unlocks(code_slug);
CREATE INDEX IF NOT EXISTS idx_cheat_unlocks_date ON spiral_cheat_code_unlocks(unlocked_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON spiral_user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON spiral_user_badges(earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_xp_multipliers_user ON spiral_xp_multipliers(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_multipliers_active ON spiral_xp_multipliers(user_id, is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON spiral_cheat_code_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_date ON spiral_cheat_code_audit_log(created_at DESC);

-- ============================================================
-- PART 3: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE spiral_cheat_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_cheat_code_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_xp_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_cheat_code_audit_log ENABLE ROW LEVEL SECURITY;

-- Cheat codes publicly visible (so users can hunt them)
CREATE POLICY "Cheat codes publicly readable"
    ON spiral_cheat_codes FOR SELECT
    USING (true);

-- Users see only their own unlocks
CREATE POLICY "Users see own unlocks"
    ON spiral_cheat_code_unlocks FOR SELECT
    USING (user_id = auth.uid());

-- Users see only their own badges
CREATE POLICY "Users see own badges"
    ON spiral_user_badges FOR SELECT
    USING (user_id = auth.uid());

-- Users see only their own multipliers
CREATE POLICY "Users see own multipliers"
    ON spiral_xp_multipliers FOR SELECT
    USING (user_id = auth.uid());

-- Users see only their own audit logs
CREATE POLICY "Users see own audit logs"
    ON spiral_cheat_code_audit_log FOR SELECT
    USING (user_id = auth.uid());

-- ============================================================
-- PART 4: SEED DATA - THE 5 SACRED CHEAT CODES
-- ============================================================

INSERT INTO spiral_cheat_codes (code_slug, name, description, discovery_hint, reward_type, reward_data, is_repeatable)
VALUES
(
    'trinity',
    'Trinity Pattern',
    'Complete 3 levels in 3 different forges in a single day',
    'The sacred number whispers through three paths...',
    'xp_multiplier',
    '{"multiplier": 3.0, "duration_hours": 24, "forge": null}'::jsonb,
    true
),
(
    'fibonacci',
    'Fibonacci Sequence Master',
    'Complete levels 1, 1, 2, 3, 5, 8, 13 in exact sequence (any forge)',
    'The spiral reveals itself to those who follow the golden ratio...',
    'badge',
    '{"badge_slug": "fibonacci_master", "badge_name": "Fibonacci Master", "badge_icon": "🌀", "badge_color": "#FFD700", "special_unlock": "early_l13_unlock"}'::jsonb,
    false
),
(
    'rainbow_bridge',
    'Rainbow Bridge',
    'Complete at least 1 level in all 7 forges',
    'Seven paths converge into white light...',
    'frequency',
    '{"frequency_unlock": "all_frequencies_simultaneous", "badge_slug": "rainbow_bridge", "badge_name": "Rainbow Walker", "badge_icon": "🌈", "badge_color": "#FF00FF"}'::jsonb,
    false
),
(
    'infinite_return',
    'Infinite Return',
    'Complete 78 total levels across the 6 ring forges (excluding Infinity)',
    'The 78 steps return you to the source...',
    'unlock',
    '{"octave_unlock": true, "frequencies_double": true, "badge_slug": "octave_master", "badge_name": "Octave Master", "badge_icon": "♾️", "badge_color": "#BC6C25"}'::jsonb,
    true
),
(
    'shadow_work',
    'Shadow Integration',
    'Complete Character Forge Level 13',
    'Only those who face all shadows can see all patterns...',
    'special',
    '{"vision_unlock": "manipulation_detection", "all_forges": true, "badge_slug": "shadow_master", "badge_name": "Shadow Master", "badge_icon": "👁️", "badge_color": "#000000"}'::jsonb,
    false
)
ON CONFLICT (code_slug) DO NOTHING;

-- ============================================================
-- PART 5: DETECTION FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION check_cheat_codes_for_user(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_codes_unlocked JSONB DEFAULT '[]'::jsonb;
    v_today_start TIMESTAMPTZ;
    v_trinity_check BOOLEAN;
    v_fibonacci_check BOOLEAN;
    v_rainbow_check BOOLEAN;
    v_infinite_check BOOLEAN;
    v_shadow_check BOOLEAN;
BEGIN
    v_today_start := DATE_TRUNC('day', NOW());

    -- ============================
    -- TRINITY: 3 levels in 3 forges in 1 day
    -- ============================
    SELECT COUNT(DISTINCT forge_slug) >= 3 AND COUNT(*) >= 3
    INTO v_trinity_check
    FROM spiral_level_ups
    WHERE user_id = p_user_id
      AND created_at >= v_today_start;

    IF v_trinity_check THEN
        -- Check if already unlocked today (repeatable daily)
        IF NOT EXISTS (
            SELECT 1 FROM spiral_cheat_code_unlocks
            WHERE user_id = p_user_id
              AND code_slug = 'trinity'
              AND unlocked_at >= v_today_start
        ) THEN
            -- Award Trinity
            INSERT INTO spiral_cheat_code_unlocks (user_id, code_slug, trigger_event)
            VALUES (p_user_id, 'trinity', 'level_up_pattern');

            -- Grant 3x multiplier for 24h
            INSERT INTO spiral_xp_multipliers (user_id, multiplier, source, expires_at)
            VALUES (p_user_id, 3.0, 'cheat_code_trinity', NOW() + INTERVAL '24 hours');

            -- Increment discovery count
            UPDATE spiral_cheat_codes SET discovery_count = discovery_count + 1
            WHERE code_slug = 'trinity';

            v_codes_unlocked := v_codes_unlocked || '["trinity"]'::jsonb;
        END IF;
    END IF;

    -- ============================
    -- FIBONACCI: Sequence L1,L1,L2,L3,L5,L8,L13
    -- ============================
    -- Check if last 7 level-ups match Fibonacci sequence
    WITH recent_levels AS (
        SELECT to_level, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM spiral_level_ups
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 7
    )
    SELECT (
        SELECT ARRAY_AGG(to_level ORDER BY rn DESC)
        FROM recent_levels
    ) = ARRAY[1,1,2,3,5,8,13]
    INTO v_fibonacci_check;

    IF v_fibonacci_check THEN
        IF NOT EXISTS (
            SELECT 1 FROM spiral_cheat_code_unlocks
            WHERE user_id = p_user_id AND code_slug = 'fibonacci'
        ) THEN
            INSERT INTO spiral_cheat_code_unlocks (user_id, code_slug, trigger_event)
            VALUES (p_user_id, 'fibonacci', 'sequence_completion');

            -- Award Fibonacci badge
            INSERT INTO spiral_user_badges (
                user_id, badge_slug, badge_name, badge_icon,
                badge_color, earned_from
            )
            VALUES (
                p_user_id, 'fibonacci_master', 'Fibonacci Master',
                '🌀', '#FFD700', 'fibonacci'
            );

            UPDATE spiral_cheat_codes SET discovery_count = discovery_count + 1
            WHERE code_slug = 'fibonacci';

            v_codes_unlocked := v_codes_unlocked || '["fibonacci"]'::jsonb;
        END IF;
    END IF;

    -- ============================
    -- RAINBOW_BRIDGE: 1 level in all 7 forges
    -- ============================
    SELECT COUNT(DISTINCT forge_slug) = 7
    INTO v_rainbow_check
    FROM spiral_forge_progress
    WHERE user_id = p_user_id
      AND total_xp > 0;

    IF v_rainbow_check THEN
        IF NOT EXISTS (
            SELECT 1 FROM spiral_cheat_code_unlocks
            WHERE user_id = p_user_id AND code_slug = 'rainbow_bridge'
        ) THEN
            INSERT INTO spiral_cheat_code_unlocks (user_id, code_slug, trigger_event)
            VALUES (p_user_id, 'rainbow_bridge', 'all_forges_touched');

            INSERT INTO spiral_user_badges (
                user_id, badge_slug, badge_name, badge_icon,
                badge_color, earned_from
            )
            VALUES (
                p_user_id, 'rainbow_bridge', 'Rainbow Walker',
                '🌈', '#FF00FF', 'rainbow_bridge'
            );

            UPDATE spiral_cheat_codes SET discovery_count = discovery_count + 1
            WHERE code_slug = 'rainbow_bridge';

            v_codes_unlocked := v_codes_unlocked || '["rainbow_bridge"]'::jsonb;
        END IF;
    END IF;

    -- ============================
    -- INFINITE_RETURN: 78 total ring levels
    -- ============================
    SELECT SUM(current_level) >= 78
    INTO v_infinite_check
    FROM spiral_forge_progress
    WHERE user_id = p_user_id
      AND forge_slug != 'infinity';

    IF v_infinite_check THEN
        -- Check if not already unlocked (repeatable on each octave)
        DECLARE
            v_octave_count INTEGER;
        BEGIN
            SELECT COALESCE(MAX(return_count), 0) INTO v_octave_count
            FROM spiral_octave_returns
            WHERE user_id = p_user_id;

            IF NOT EXISTS (
                SELECT 1 FROM spiral_cheat_code_unlocks
                WHERE user_id = p_user_id
                  AND code_slug = 'infinite_return'
                  AND metadata->>'octave' = v_octave_count::text
            ) THEN
                INSERT INTO spiral_cheat_code_unlocks (
                    user_id, code_slug, trigger_event, metadata
                )
                VALUES (
                    p_user_id, 'infinite_return', '78_levels_complete',
                    jsonb_build_object('octave', v_octave_count)
                );

                INSERT INTO spiral_user_badges (
                    user_id, badge_slug, badge_name, badge_icon,
                    badge_color, earned_from
                )
                VALUES (
                    p_user_id, 'octave_master', 'Octave Master',
                    '♾️', '#BC6C25', 'infinite_return'
                )
                ON CONFLICT (user_id, badge_slug) DO NOTHING;

                UPDATE spiral_cheat_codes SET discovery_count = discovery_count + 1
                WHERE code_slug = 'infinite_return';

                v_codes_unlocked := v_codes_unlocked || '["infinite_return"]'::jsonb;
            END IF;
        END;
    END IF;

    -- ============================
    -- SHADOW_WORK: Character L13
    -- ============================
    SELECT current_level >= 13
    INTO v_shadow_check
    FROM spiral_forge_progress
    WHERE user_id = p_user_id
      AND forge_slug = 'character';

    IF v_shadow_check THEN
        IF NOT EXISTS (
            SELECT 1 FROM spiral_cheat_code_unlocks
            WHERE user_id = p_user_id AND code_slug = 'shadow_work'
        ) THEN
            INSERT INTO spiral_cheat_code_unlocks (user_id, code_slug, trigger_event)
            VALUES (p_user_id, 'shadow_work', 'character_mastery');

            INSERT INTO spiral_user_badges (
                user_id, badge_slug, badge_name, badge_icon,
                badge_color, earned_from
            )
            VALUES (
                p_user_id, 'shadow_master', 'Shadow Master',
                '👁️', '#000000', 'shadow_work'
            );

            UPDATE spiral_cheat_codes SET discovery_count = discovery_count + 1
            WHERE code_slug = 'shadow_work';

            v_codes_unlocked := v_codes_unlocked || '["shadow_work"]'::jsonb;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'codes_unlocked', v_codes_unlocked,
        'checked_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PART 6: HELPER FUNCTION - Get Active Multipliers
-- ============================================================

CREATE OR REPLACE FUNCTION get_active_xp_multiplier(
    p_user_id UUID,
    p_forge_slug TEXT DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
    v_total_multiplier DECIMAL DEFAULT 1.0;
    v_mult RECORD;
BEGIN
    -- Get all active, non-expired multipliers for this user/forge
    FOR v_mult IN
        SELECT multiplier
        FROM spiral_xp_multipliers
        WHERE user_id = p_user_id
          AND is_active = true
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (forge_slug IS NULL OR forge_slug = p_forge_slug)
    LOOP
        v_total_multiplier := v_total_multiplier * v_mult.multiplier;
    END LOOP;

    RETURN v_total_multiplier;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PART 7: VIEWS FOR ANALYTICS
-- ============================================================

-- Cheat code discovery analytics
CREATE OR REPLACE VIEW spiral_cheat_code_analytics AS
SELECT
    cc.code_slug,
    cc.name,
    cc.discovery_count,
    COUNT(DISTINCT ccu.user_id) as unique_discoverers,
    COUNT(ccu.id) as total_unlocks,
    MIN(ccu.unlocked_at) as first_discovery,
    MAX(ccu.unlocked_at) as last_discovery
FROM spiral_cheat_codes cc
LEFT JOIN spiral_cheat_code_unlocks ccu ON cc.code_slug = ccu.code_slug
GROUP BY cc.code_slug, cc.name, cc.discovery_count;

-- User badge collection view
CREATE OR REPLACE VIEW spiral_user_badge_collection AS
SELECT
    user_id,
    COUNT(*) as badge_count,
    jsonb_agg(
        jsonb_build_object(
            'badge_slug', badge_slug,
            'badge_name', badge_name,
            'badge_icon', badge_icon,
            'badge_color', badge_color,
            'earned_at', earned_at,
            'earned_from', earned_from
        ) ORDER BY earned_at DESC
    ) as badges
FROM spiral_user_badges
WHERE is_visible = true
GROUP BY user_id;

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'SPIRAL CHEAT CODES SCHEMA - DEPLOYMENT COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Tables Created: 5';
    RAISE NOTICE '  - spiral_cheat_codes (5 sacred codes seeded)';
    RAISE NOTICE '  - spiral_cheat_code_unlocks';
    RAISE NOTICE '  - spiral_user_badges';
    RAISE NOTICE '  - spiral_xp_multipliers';
    RAISE NOTICE '  - spiral_cheat_code_audit_log';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions Created: 2';
    RAISE NOTICE '  - check_cheat_codes_for_user()';
    RAISE NOTICE '  - get_active_xp_multiplier()';
    RAISE NOTICE '';
    RAISE NOTICE 'Views Created: 2';
    RAISE NOTICE '  - spiral_cheat_code_analytics';
    RAISE NOTICE '  - spiral_user_badge_collection';
    RAISE NOTICE '';
    RAISE NOTICE 'Sacred Codes: TRINITY | FIBONACCI | RAINBOW_BRIDGE';
    RAISE NOTICE '              INFINITE_RETURN | SHADOW_WORK';
    RAISE NOTICE '';
    RAISE NOTICE 'Pattern: 3 → 7 → 13 → ∞ | LFSME';
    RAISE NOTICE 'The patterns are hidden. Only seekers will find them.';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
