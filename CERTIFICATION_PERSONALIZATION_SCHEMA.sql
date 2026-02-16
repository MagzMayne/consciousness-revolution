-- ============================================================
-- CERTIFICATION PERSONALIZATION & RECOMMENDATION SYSTEM
-- Enable personalized certification recommendations based on user interests and strengths
-- Created: 2026-02-16
-- ============================================================

BEGIN;

-- ============================================================
-- USER CAREER PROFILE (Capture interests, goals, and strengths)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_career_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE CASCADE,
    
    -- Career Goals & Interests
    career_goals TEXT[], -- e.g., ['Become a Full-Stack Developer', 'Start own business', 'Work remotely']
    target_industries TEXT[], -- e.g., ['Technology', 'Healthcare', 'Education']
    target_roles TEXT[], -- e.g., ['Software Engineer', 'Data Analyst', 'Project Manager']
    current_role TEXT,
    years_experience INTEGER DEFAULT 0,
    
    -- Learning Preferences
    learning_pace TEXT CHECK (learning_pace IN ('Slow', 'Moderate', 'Fast', 'Intensive')) DEFAULT 'Moderate',
    available_hours_per_week INTEGER DEFAULT 10,
    preferred_learning_styles TEXT[], -- e.g., ['Visual', 'Hands-on', 'Reading', 'Video', 'Interactive']
    preferred_difficulty TEXT CHECK (preferred_difficulty IN ('Foundational', 'Intermediate', 'Advanced', 'Expert')) DEFAULT 'Intermediate',
    
    -- Domain Strengths (from 7 domains framework)
    domain_strengths JSONB DEFAULT '{
        "Command": 0,
        "Creation": 0,
        "Connection": 0,
        "Peace": 0,
        "Abundance": 0,
        "Wisdom": 0,
        "Purpose": 0
    }'::jsonb,
    
    -- Skills Assessment
    current_skill_levels JSONB DEFAULT '{}', -- { "skill_slug": { "level": "Beginner|Intermediate|Advanced|Expert", "confidence": 1-10 } }
    skills_to_develop TEXT[], -- Skills user wants to learn
    
    -- Motivation & Context
    motivation_factors TEXT[], -- e.g., ['Career change', 'Salary increase', 'Remote work', 'Personal growth']
    constraints TEXT[], -- e.g., ['Limited time', 'Budget constraints', 'No prior experience']
    
    -- Personalization Data
    completed_onboarding BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMPTZ,
    last_profile_update TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ============================================================
-- CERTIFICATION RECOMMENDATIONS (AI-generated personalized suggestions)
-- ============================================================

CREATE TABLE IF NOT EXISTS certification_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE CASCADE,
    certification_template_id UUID REFERENCES certification_templates(id) ON DELETE CASCADE NOT NULL,
    
    -- Recommendation Score & Reasoning
    recommendation_score DECIMAL(5,2) CHECK (recommendation_score >= 0 AND recommendation_score <= 100), -- 0-100 match score
    match_reasons TEXT[], -- Why this cert is recommended
    skill_gaps_addressed TEXT[], -- Skills this cert will help develop
    career_impact TEXT, -- How this cert helps career goals
    
    -- Priority & Status
    priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100), -- Higher = more urgent/important
    status TEXT DEFAULT 'suggested' CHECK (status IN (
        'suggested', 'viewed', 'saved', 'started', 'in_progress', 'completed', 'dismissed'
    )),
    
    -- User Interaction
    viewed_at TIMESTAMPTZ,
    saved_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    dismissal_reason TEXT,
    
    -- Recommendation Context
    recommended_by TEXT DEFAULT 'algorithm' CHECK (recommended_by IN (
        'algorithm', 'araya_ai', 'career_path', 'skill_gap', 'peer_success', 'trending', 'manual'
    )),
    recommendation_context JSONB DEFAULT '{}', -- Additional context for recommendation
    
    -- Metadata
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Recommendations can expire if profile changes significantly
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, certification_template_id, generated_at)
);

-- ============================================================
-- CAREER PATHWAYS (Pre-defined career progression paths)
-- ============================================================

CREATE TABLE IF NOT EXISTS career_pathways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Target Audience
    target_role TEXT NOT NULL, -- Final role this pathway leads to
    starting_level TEXT CHECK (starting_level IN ('No Experience', 'Some Experience', 'Professional')) DEFAULT 'No Experience',
    
    -- Pathway Details
    industry TEXT,
    estimated_duration_months INTEGER, -- Total time to complete pathway
    estimated_salary_range TEXT,
    
    -- Certification Sequence
    certification_sequence JSONB NOT NULL, -- Ordered array of cert template IDs with reasoning
    -- Example: [
    --   {"cert_id": "uuid1", "order": 1, "reason": "Foundation in programming"},
    --   {"cert_id": "uuid2", "order": 2, "reason": "Web development skills"},
    --   {"cert_id": "uuid3", "order": 3, "reason": "Full-stack mastery"}
    -- ]
    
    -- Success Metrics
    completion_rate DECIMAL(5,2), -- % of users who complete this pathway
    average_time_to_complete INTEGER, -- Days
    success_stories INTEGER DEFAULT 0, -- Number of users who got jobs after completing
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER CAREER PATHWAY PROGRESS (Track user progress on pathways)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_pathway_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE CASCADE,
    pathway_id UUID REFERENCES career_pathways(id) ON DELETE CASCADE NOT NULL,
    
    -- Progress Tracking
    started_at TIMESTAMPTZ DEFAULT NOW(),
    current_step INTEGER DEFAULT 1, -- Which cert in sequence user is on
    completed_steps INTEGER[] DEFAULT '{}', -- Array of completed cert template IDs
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN (
        'not_started', 'active', 'paused', 'completed', 'abandoned'
    )),
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    notes TEXT, -- User notes about their pathway journey
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, pathway_id)
);

-- ============================================================
-- SKILL GAP ANALYSIS (Identify what skills user needs)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES certifiable_skills(id) ON DELETE CASCADE NOT NULL,
    
    -- Gap Details
    required_level TEXT CHECK (required_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    current_level TEXT CHECK (current_level IN ('None', 'Beginner', 'Intermediate', 'Advanced', 'Expert')) DEFAULT 'None',
    gap_size TEXT CHECK (gap_size IN ('Small', 'Medium', 'Large', 'Critical')),
    
    -- Context
    required_for_goal TEXT, -- Which career goal needs this skill
    certifications_that_teach UUID[], -- Array of cert template IDs that teach this skill
    estimated_learning_hours INTEGER,
    
    -- Priority
    priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
    
    -- Status
    status TEXT DEFAULT 'identified' CHECK (status IN (
        'identified', 'learning', 'practicing', 'proficient', 'dismissed'
    )),
    addressed_at TIMESTAMPTZ,
    
    -- Metadata
    identified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, skill_id)
);

-- ============================================================
-- CERTIFICATION INTEREST TRACKING (Track what users are interested in)
-- ============================================================

CREATE TABLE IF NOT EXISTS certification_interest_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    certification_template_id UUID REFERENCES certification_templates(id) ON DELETE CASCADE NOT NULL,
    
    -- Interest Signals
    signal_type TEXT CHECK (signal_type IN (
        'viewed', 'clicked', 'saved', 'shared', 'inquired', 
        'compared', 'reviewed_details', 'started_progress'
    )),
    signal_strength INTEGER DEFAULT 1 CHECK (signal_strength >= 1 AND signal_strength <= 10), -- Higher = stronger interest
    
    -- Context
    source TEXT, -- e.g., 'browse_page', 'recommendation', 'search', 'araya_chat'
    session_id TEXT,
    
    -- Metadata
    signal_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_career_profile_user ON user_career_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_career_profile_industries ON user_career_profile USING GIN(target_industries);

CREATE INDEX IF NOT EXISTS idx_cert_recommendations_user ON certification_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_recommendations_cert ON certification_recommendations(certification_template_id);
CREATE INDEX IF NOT EXISTS idx_cert_recommendations_score ON certification_recommendations(recommendation_score DESC);
CREATE INDEX IF NOT EXISTS idx_cert_recommendations_status ON certification_recommendations(status);

CREATE INDEX IF NOT EXISTS idx_career_pathways_slug ON career_pathways(slug);
CREATE INDEX IF NOT EXISTS idx_career_pathways_active ON career_pathways(active, featured);

CREATE INDEX IF NOT EXISTS idx_user_pathway_progress_user ON user_pathway_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pathway_progress_pathway ON user_pathway_progress(pathway_id);
CREATE INDEX IF NOT EXISTS idx_user_pathway_progress_status ON user_pathway_progress(status);

CREATE INDEX IF NOT EXISTS idx_skill_gaps_user ON user_skill_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_skill ON user_skill_gaps(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_priority ON user_skill_gaps(priority DESC);

CREATE INDEX IF NOT EXISTS idx_interest_signals_user ON certification_interest_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_interest_signals_cert ON certification_interest_signals(certification_template_id);
CREATE INDEX IF NOT EXISTS idx_interest_signals_type ON certification_interest_signals(signal_type);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE user_career_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pathway_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_interest_signals ENABLE ROW LEVEL SECURITY;

-- Users can only view/edit their own career profile
CREATE POLICY "Users can manage their career profile"
    ON user_career_profile FOR ALL
    USING (user_id = auth.uid());

-- Users can view their own recommendations
CREATE POLICY "Users can view their recommendations"
    ON certification_recommendations FOR ALL
    USING (user_id = auth.uid());

-- Anyone can view active career pathways
CREATE POLICY "Public can view career pathways"
    ON career_pathways FOR SELECT
    USING (active = TRUE);

-- Users can view/update their pathway progress
CREATE POLICY "Users can manage their pathway progress"
    ON user_pathway_progress FOR ALL
    USING (user_id = auth.uid());

-- Users can view their skill gaps
CREATE POLICY "Users can view their skill gaps"
    ON user_skill_gaps FOR ALL
    USING (user_id = auth.uid());

-- Users can create their own interest signals
CREATE POLICY "Users can track their interest signals"
    ON certification_interest_signals FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================
-- RECOMMENDATION FUNCTIONS
-- ============================================================

-- Calculate recommendation score for a user and certification
CREATE OR REPLACE FUNCTION calculate_recommendation_score(
    p_user_id UUID,
    p_cert_template_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    v_score DECIMAL := 0;
    v_profile RECORD;
    v_cert RECORD;
    v_skill_match_count INTEGER := 0;
    v_total_required_skills INTEGER := 0;
    v_industry_match BOOLEAN := FALSE;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile
    FROM user_career_profile
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN 0; -- No profile = no score
    END IF;
    
    -- Get certification details
    SELECT * INTO v_cert
    FROM certification_templates
    WHERE id = p_cert_template_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Score Component 1: Career Goals Match (30 points max)
    -- Check if cert's job titles match user's target roles
    IF v_cert.job_titles && v_profile.target_roles THEN
        v_score := v_score + 30;
    ELSIF v_cert.career_paths && v_profile.target_industries THEN
        v_score := v_score + 20;
    END IF;
    
    -- Score Component 2: Skill Development Match (40 points max)
    -- Check how many required skills user wants to develop
    IF v_cert.required_skills IS NOT NULL AND array_length(v_cert.required_skills, 1) > 0 THEN
        v_total_required_skills := array_length(v_cert.required_skills, 1);
        
        SELECT COUNT(*) INTO v_skill_match_count
        FROM unnest(v_cert.required_skills) AS cert_skill
        WHERE cert_skill = ANY(v_profile.skills_to_develop);
        
        v_score := v_score + (v_skill_match_count::DECIMAL / v_total_required_skills * 40);
    END IF;
    
    -- Score Component 3: Level Appropriateness (20 points max)
    -- Match cert level with user's preferred difficulty
    IF v_cert.level = v_profile.preferred_difficulty THEN
        v_score := v_score + 20;
    ELSIF 
        (v_cert.level = 'Intermediate' AND v_profile.preferred_difficulty IN ('Foundational', 'Advanced')) OR
        (v_cert.level = 'Advanced' AND v_profile.preferred_difficulty = 'Intermediate')
    THEN
        v_score := v_score + 10; -- Close match
    END IF;
    
    -- Score Component 4: Time Commitment Match (10 points max)
    -- Check if cert duration fits user's available time
    IF v_cert.duration_hours IS NOT NULL AND v_profile.available_hours_per_week > 0 THEN
        DECLARE
            v_weeks_needed INTEGER := v_cert.duration_hours / v_profile.available_hours_per_week;
        BEGIN
            IF v_weeks_needed <= 12 THEN -- 3 months or less
                v_score := v_score + 10;
            ELSIF v_weeks_needed <= 24 THEN -- 6 months or less
                v_score := v_score + 5;
            END IF;
        END;
    END IF;
    
    RETURN LEAST(v_score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Generate personalized recommendations for a user
CREATE OR REPLACE FUNCTION generate_user_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    certification_template_id UUID,
    recommendation_score DECIMAL,
    match_reasons TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH scored_certs AS (
        SELECT 
            ct.id,
            calculate_recommendation_score(p_user_id, ct.id) AS score,
            ct.name,
            ct.level,
            ct.job_titles,
            ct.required_skills
        FROM certification_templates ct
        WHERE ct.active = TRUE
        AND calculate_recommendation_score(p_user_id, ct.id) > 20 -- Only show decent matches
    ),
    ranked_certs AS (
        SELECT 
            id,
            score,
            ARRAY[
                CASE WHEN score >= 70 THEN 'Excellent match for your career goals' ELSE NULL END,
                CASE WHEN score >= 50 THEN 'Develops skills you want to learn' ELSE NULL END,
                CASE WHEN score >= 30 THEN 'Appropriate for your experience level' ELSE NULL END,
                'Leads to roles you are targeting'
            ] AS reasons
        FROM scored_certs
        ORDER BY score DESC
        LIMIT p_limit
    )
    SELECT 
        rc.id,
        rc.score,
        array_remove(rc.reasons, NULL) -- Remove NULL elements
    FROM ranked_certs rc;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_career_profile_updated_at
    BEFORE UPDATE ON user_career_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER trigger_recommendations_updated_at
    BEFORE UPDATE ON certification_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER trigger_pathways_updated_at
    BEFORE UPDATE ON career_pathways
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER trigger_pathway_progress_updated_at
    BEFORE UPDATE ON user_pathway_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER trigger_skill_gaps_updated_at
    BEFORE UPDATE ON user_skill_gaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

COMMIT;

-- ============================================================
-- USAGE NOTES
-- ============================================================
-- 
-- 1. After user completes onboarding questionnaire, populate user_career_profile
-- 2. Call generate_user_recommendations() to get top cert recommendations
-- 3. Insert recommendations into certification_recommendations table
-- 4. Track user interactions via certification_interest_signals
-- 5. Update recommendations as user profile evolves
-- 
-- Example: Get top 5 recommendations for a user
-- SELECT * FROM generate_user_recommendations('user-uuid-here', 5);
-- 
-- ============================================================
