-- ============================================================
-- REAL-WORLD CERTIFICATION SYSTEM
-- Consciousness Revolution Platform
-- Created: 2026-02-16
-- ============================================================

-- ============================================================
-- CERTIFICATION TYPES & CATEGORIES
-- ============================================================

-- Certification Categories (What can be certified)
CREATE TABLE IF NOT EXISTS certification_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    domain TEXT CHECK (domain IN (
        'Command', 'Creation', 'Connection', 'Peace', 
        'Abundance', 'Wisdom', 'Purpose', 'Technical'
    )),
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certification Templates (Types of certificates that can be earned)
CREATE TABLE IF NOT EXISTS certification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES certification_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    level TEXT CHECK (level IN (
        'Foundational', 'Intermediate', 'Advanced', 'Expert', 'Master'
    )) DEFAULT 'Foundational',
    
    -- Requirements
    prerequisites TEXT[], -- Array of required certification slugs
    required_skills TEXT[],
    required_courses TEXT[],
    required_xp INTEGER DEFAULT 0,
    required_patterns_completed INTEGER DEFAULT 0,
    passing_score_percentage INTEGER DEFAULT 80 CHECK (passing_score_percentage >= 0 AND passing_score_percentage <= 100),
    
    -- Real-world relevance
    job_titles TEXT[], -- Jobs this cert prepares for
    industry_standards TEXT[], -- Industry certs this aligns with
    estimated_salary_range TEXT,
    career_paths TEXT[],
    
    -- Content
    syllabus JSONB DEFAULT '{}',
    learning_objectives TEXT[],
    assessment_criteria TEXT[],
    
    -- Metadata
    badge_image_url TEXT,
    certificate_template_url TEXT,
    duration_hours INTEGER,
    valid_for_years INTEGER DEFAULT 3,
    renewable BOOLEAN DEFAULT TRUE,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(category_id, slug)
);

-- ============================================================
-- USER CERTIFICATIONS (Earned Certificates)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE CASCADE,
    certification_template_id UUID REFERENCES certification_templates(id) ON DELETE CASCADE NOT NULL,
    
    -- Certification details
    certificate_number TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Verification
    verification_code TEXT NOT NULL UNIQUE,
    verified BOOLEAN DEFAULT TRUE,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    
    -- Achievement details
    score_percentage INTEGER,
    completion_time_hours DECIMAL(10,2),
    skills_demonstrated TEXT[],
    
    -- Digital assets
    certificate_pdf_url TEXT,
    badge_url TEXT,
    blockchain_hash TEXT, -- Future: On-chain verification
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, certification_template_id, issued_at)
);

-- ============================================================
-- CERTIFICATION PROGRESS (Tracking toward certification)
-- ============================================================

CREATE TABLE IF NOT EXISTS certification_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE CASCADE,
    certification_template_id UUID REFERENCES certification_templates(id) ON DELETE CASCADE NOT NULL,
    
    -- Progress tracking
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Requirements completion
    completed_skills TEXT[] DEFAULT '{}',
    completed_courses TEXT[] DEFAULT '{}',
    completed_assessments TEXT[] DEFAULT '{}',
    current_xp INTEGER DEFAULT 0,
    patterns_completed INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'in_progress' CHECK (status IN (
        'not_started', 'in_progress', 'assessment_ready', 
        'assessment_pending', 'completed', 'failed', 'abandoned'
    )),
    
    -- Attempts
    attempt_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, certification_template_id)
);

-- ============================================================
-- CERTIFICATION ASSESSMENTS (Tests/Evaluations)
-- ============================================================

CREATE TABLE IF NOT EXISTS certification_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_template_id UUID REFERENCES certification_templates(id) ON DELETE CASCADE NOT NULL,
    
    -- Assessment details
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN (
        'multiple_choice', 'practical', 'project', 'essay', 
        'interview', 'portfolio', 'mixed'
    )) DEFAULT 'mixed',
    
    -- Content
    questions JSONB DEFAULT '[]',
    passing_criteria JSONB DEFAULT '{}',
    rubric JSONB DEFAULT '{}',
    
    -- Timing
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 3,
    cooldown_hours INTEGER DEFAULT 24,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User assessment attempts
CREATE TABLE IF NOT EXISTS user_assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES certification_assessments(id) ON DELETE CASCADE NOT NULL,
    certification_progress_id UUID REFERENCES certification_progress(id) ON DELETE CASCADE,
    
    -- Attempt details
    attempt_number INTEGER NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_taken_minutes INTEGER,
    
    -- Results
    score_percentage INTEGER,
    passed BOOLEAN DEFAULT FALSE,
    
    -- Responses
    answers JSONB DEFAULT '{}',
    evaluator_notes TEXT,
    feedback JSONB DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'in_progress' CHECK (status IN (
        'in_progress', 'completed', 'grading', 'graded', 'abandoned'
    )),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, assessment_id, attempt_number)
);

-- ============================================================
-- SKILLS REGISTRY (Skills that can be certified)
-- ============================================================

CREATE TABLE IF NOT EXISTS certifiable_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT CHECK (category IN (
        'Technical', 'Communication', 'Leadership', 'Pattern Recognition',
        'Financial', 'Creative', 'Analytical', 'Social'
    )),
    
    -- Industry relevance
    industry_demand TEXT CHECK (industry_demand IN ('Low', 'Medium', 'High', 'Critical')),
    related_jobs TEXT[],
    related_tools TEXT[],
    
    -- Measurement
    proficiency_levels TEXT[] DEFAULT ARRAY['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    assessment_criteria JSONB DEFAULT '{}',
    
    -- Metadata
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User skill demonstrations
CREATE TABLE IF NOT EXISTS user_skill_demonstrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES certifiable_skills(id) ON DELETE CASCADE NOT NULL,
    
    -- Demonstration details
    proficiency_level TEXT,
    demonstrated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Evidence
    evidence_type TEXT CHECK (evidence_type IN (
        'project', 'test', 'peer_review', 'work_sample', 
        'course_completion', 'pattern_completion', 'contribution'
    )),
    evidence_url TEXT,
    evidence_description TEXT,
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, skill_id, demonstrated_at)
);

-- ============================================================
-- CERTIFICATION VERIFICATION LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS certification_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_id UUID REFERENCES user_certifications(id) ON DELETE CASCADE NOT NULL,
    
    -- Verifier details
    verifier_type TEXT CHECK (verifier_type IN (
        'employer', 'educational_institution', 'individual', 'automated', 'unknown'
    )),
    verifier_name TEXT,
    verifier_email TEXT,
    verifier_organization TEXT,
    
    -- Verification details
    verification_method TEXT CHECK (verification_method IN (
        'code', 'link', 'qr', 'email', 'api'
    )),
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Result
    verification_successful BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    -- Privacy
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMPLOYER RECOGNITION (Companies that accept our certs)
-- ============================================================

CREATE TABLE IF NOT EXISTS employer_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Company details
    website TEXT,
    logo_url TEXT,
    industry TEXT,
    size_category TEXT CHECK (size_category IN (
        'startup', 'small', 'medium', 'large', 'enterprise'
    )),
    
    -- Certification acceptance
    accepted_certifications UUID[], -- Array of certification_template_ids
    hiring_roles TEXT[],
    
    -- Partnership details
    partnership_level TEXT CHECK (partnership_level IN (
        'recognized', 'preferred', 'exclusive'
    )) DEFAULT 'recognized',
    active BOOLEAN DEFAULT TRUE,
    
    -- Contact
    contact_name TEXT,
    contact_email TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_cert_templates_category ON certification_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_cert_templates_level ON certification_templates(level);
CREATE INDEX IF NOT EXISTS idx_cert_templates_active ON certification_templates(active);

CREATE INDEX IF NOT EXISTS idx_user_certs_user ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certs_template ON user_certifications(certification_template_id);
CREATE INDEX IF NOT EXISTS idx_user_certs_verification ON user_certifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_user_certs_certificate_num ON user_certifications(certificate_number);

CREATE INDEX IF NOT EXISTS idx_cert_progress_user ON certification_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_progress_template ON certification_progress(certification_template_id);
CREATE INDEX IF NOT EXISTS idx_cert_progress_status ON certification_progress(status);

CREATE INDEX IF NOT EXISTS idx_assessments_template ON certification_assessments(certification_template_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_user ON user_assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_assessment ON user_assessment_attempts(assessment_id);

CREATE INDEX IF NOT EXISTS idx_skills_category ON certifiable_skills(category);
CREATE INDEX IF NOT EXISTS idx_skill_demos_user ON user_skill_demonstrations(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_demos_skill ON user_skill_demonstrations(skill_id);

CREATE INDEX IF NOT EXISTS idx_verifications_cert ON certification_verifications(certification_id);
CREATE INDEX IF NOT EXISTS idx_verifications_date ON certification_verifications(verified_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE certification_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifiable_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_demonstrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_partners ENABLE ROW LEVEL SECURITY;

-- Public can view active certifications and categories
CREATE POLICY "Public can view certification categories"
    ON certification_categories FOR SELECT
    USING (active = TRUE);

CREATE POLICY "Public can view active certification templates"
    ON certification_templates FOR SELECT
    USING (active = TRUE);

CREATE POLICY "Public can view active skills"
    ON certifiable_skills FOR SELECT
    USING (TRUE);

CREATE POLICY "Public can view employer partners"
    ON employer_partners FOR SELECT
    USING (active = TRUE);

-- Users can view their own certifications and progress
CREATE POLICY "Users can view their certifications"
    ON user_certifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their progress"
    ON certification_progress FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their assessment attempts"
    ON user_assessment_attempts FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their skill demonstrations"
    ON user_skill_demonstrations FOR ALL
    USING (user_id = auth.uid());

-- Public verification (anyone can verify a certificate with code)
CREATE POLICY "Public can verify certificates"
    ON user_certifications FOR SELECT
    USING (verified = TRUE AND revoked = FALSE);

CREATE POLICY "Public can log verifications"
    ON certification_verifications FOR INSERT
    WITH CHECK (TRUE);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Generate unique certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number(
    p_template_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year TEXT;
    v_sequence INTEGER;
    v_cert_num TEXT;
BEGIN
    -- Get template slug for prefix
    SELECT substring(slug from 1 for 3) INTO v_prefix
    FROM certification_templates
    WHERE id = p_template_id;
    
    v_prefix := UPPER(COALESCE(v_prefix, 'CER'));
    v_year := TO_CHAR(NOW(), 'YY');
    
    -- Get next sequence number for this year and template
    SELECT COUNT(*) + 1 INTO v_sequence
    FROM user_certifications
    WHERE certification_template_id = p_template_id
    AND EXTRACT(YEAR FROM issued_at) = EXTRACT(YEAR FROM NOW());
    
    -- Format: PRF-26-00123 (Prefix-Year-Sequence)
    v_cert_num := v_prefix || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 5, '0');
    
    RETURN v_cert_num;
END;
$$ LANGUAGE plpgsql;

-- Generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 12-character alphanumeric code
        v_code := UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 12));
        
        -- Check if code already exists
        SELECT EXISTS(
            SELECT 1 FROM user_certifications WHERE verification_code = v_code
        ) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
    END LOOP;
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Calculate certification progress
CREATE OR REPLACE FUNCTION calculate_certification_progress(
    p_user_id UUID,
    p_template_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_template RECORD;
    v_progress RECORD;
    v_percentage INTEGER := 0;
    v_weight_per_requirement DECIMAL;
    v_completed_count INTEGER := 0;
    v_total_requirements INTEGER := 0;
BEGIN
    -- Get template requirements
    SELECT * INTO v_template
    FROM certification_templates
    WHERE id = p_template_id;
    
    -- Get current progress
    SELECT * INTO v_progress
    FROM certification_progress
    WHERE user_id = p_user_id
    AND certification_template_id = p_template_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Count total requirements
    v_total_requirements := 
        COALESCE(array_length(v_template.required_skills, 1), 0) +
        COALESCE(array_length(v_template.required_courses, 1), 0) +
        CASE WHEN v_template.required_xp > 0 THEN 1 ELSE 0 END +
        CASE WHEN v_template.required_patterns_completed > 0 THEN 1 ELSE 0 END;
    
    IF v_total_requirements = 0 THEN
        RETURN 100;
    END IF;
    
    v_weight_per_requirement := 100.0 / v_total_requirements;
    
    -- Count completed requirements
    v_completed_count := 
        COALESCE(array_length(v_progress.completed_skills, 1), 0) +
        COALESCE(array_length(v_progress.completed_courses, 1), 0) +
        CASE WHEN v_progress.current_xp >= v_template.required_xp THEN 1 ELSE 0 END +
        CASE WHEN v_progress.patterns_completed >= v_template.required_patterns_completed THEN 1 ELSE 0 END;
    
    v_percentage := FLOOR(v_completed_count * v_weight_per_requirement);
    
    RETURN LEAST(v_percentage, 100);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update progress percentage
CREATE OR REPLACE FUNCTION update_certification_progress_percentage()
RETURNS TRIGGER AS $$
BEGIN
    NEW.progress_percentage := calculate_certification_progress(NEW.user_id, NEW.certification_template_id);
    NEW.updated_at := NOW();
    
    -- Auto-update status based on progress
    IF NEW.progress_percentage >= 100 AND NEW.status = 'in_progress' THEN
        NEW.status := 'assessment_ready';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cert_progress_percentage
    BEFORE INSERT OR UPDATE ON certification_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_certification_progress_percentage();

-- Auto-set certificate number and verification code
CREATE OR REPLACE FUNCTION set_certification_defaults()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.certificate_number IS NULL THEN
        NEW.certificate_number := generate_certificate_number(NEW.certification_template_id);
    END IF;
    
    IF NEW.verification_code IS NULL THEN
        NEW.verification_code := generate_verification_code();
    END IF;
    
    -- Set expiration if template has validity period
    IF NEW.expires_at IS NULL THEN
        SELECT 
            CASE 
                WHEN valid_for_years > 0 THEN NOW() + (valid_for_years || ' years')::INTERVAL
                ELSE NULL
            END
        INTO NEW.expires_at
        FROM certification_templates
        WHERE id = NEW.certification_template_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_cert_defaults
    BEFORE INSERT ON user_certifications
    FOR EACH ROW
    EXECUTE FUNCTION set_certification_defaults();

-- ============================================================
-- INITIAL DATA SEED
-- ============================================================

-- Insert certification categories
INSERT INTO certification_categories (name, slug, description, domain, color, sort_order) VALUES
    ('Pattern Recognition', 'pattern-recognition', 'Master the art of identifying manipulation patterns and conscious communication', 'Wisdom', '#9B30FF', 1),
    ('Developer Skills', 'developer-skills', 'Full-stack development, Python, JavaScript, and modern web technologies', 'Creation', '#00CED1', 2),
    ('Communication & Leadership', 'communication-leadership', 'Effective communication, team leadership, and conflict resolution', 'Connection', '#FFD700', 3),
    ('Financial Literacy', 'financial-literacy', 'Personal finance, business economics, and wealth building', 'Abundance', '#32CD32', 4),
    ('Consciousness Tools', 'consciousness-tools', 'Mastery of consciousness evolution tools and frameworks', 'Purpose', '#C71585', 5),
    ('Business Management', 'business-management', 'Project management, business operations, and strategic planning', 'Command', '#FF6347', 6),
    ('Security & Boundaries', 'security-boundaries', 'Personal security, digital privacy, and healthy boundaries', 'Peace', '#4682B4', 7)
ON CONFLICT (slug) DO NOTHING;

-- Commit the changes
COMMIT;
