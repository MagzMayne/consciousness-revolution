-- ============================================================
-- CAREER PATHWAYS SEED DATA
-- Pre-defined career progression paths through certifications
-- Created: 2026-02-16
-- ============================================================

BEGIN;

-- ============================================================
-- CAREER PATHWAYS
-- ============================================================

INSERT INTO career_pathways (
    name, slug, description, target_role, starting_level,
    industry, estimated_duration_months, estimated_salary_range,
    certification_sequence, active, featured
) VALUES
-- Technology Career Paths
(
    'Complete Web Developer Career Path',
    'complete-web-developer',
    'Go from beginner to professional full-stack web developer. Master HTML, CSS, JavaScript, Python, and modern frameworks.',
    'Senior Full-Stack Web Developer',
    'No Experience',
    'Technology',
    12,
    '$80,000 - $140,000 annually',
    '[
        {"order": 1, "cert_slug": "html-css-fundamentals", "reason": "Foundation: Learn web basics"},
        {"order": 2, "cert_slug": "javascript-modern-web-development", "reason": "Core skill: Master JavaScript"},
        {"order": 3, "cert_slug": "python-developer-ai-automation", "reason": "Backend: Python development"},
        {"order": 4, "cert_slug": "fullstack-web-developer", "reason": "Integration: Full-stack mastery"}
    ]'::jsonb,
    TRUE,
    TRUE
),
(
    'Cloud Engineering Career Path',
    'cloud-engineering-path',
    'Become a cloud engineer specializing in AWS, Azure, and modern cloud infrastructure.',
    'Cloud Solutions Architect',
    'Some Experience',
    'Technology',
    9,
    '$100,000 - $160,000 annually',
    '[
        {"order": 1, "cert_slug": "aws-solutions-architect-prep", "reason": "Foundation: AWS fundamentals"},
        {"order": 2, "cert_slug": "azure-cloud-admin-prep", "reason": "Multi-cloud: Azure skills"},
        {"order": 3, "cert_slug": "docker-containers", "reason": "Modern infrastructure: Containerization"}
    ]'::jsonb,
    TRUE,
    TRUE
),
(
    'Cybersecurity Professional Path',
    'cybersecurity-professional-path',
    'Build a career in cybersecurity from foundational security to ethical hacking.',
    'Senior Security Engineer',
    'No Experience',
    'Technology',
    15,
    '$80,000 - $140,000 annually',
    '[
        {"order": 1, "cert_slug": "digital-privacy-security", "reason": "Foundation: Security basics"},
        {"order": 2, "cert_slug": "security-plus-prep", "reason": "Professional: CompTIA Security+"},
        {"order": 3, "cert_slug": "ethical-hacker-prep", "reason": "Advanced: Ethical hacking"}
    ]'::jsonb,
    TRUE,
    TRUE
),

-- Data & Analytics Career Paths
(
    'Data Analyst to Data Scientist Path',
    'data-analyst-to-scientist',
    'Progress from data analysis fundamentals to advanced data science and machine learning.',
    'Senior Data Scientist',
    'No Experience',
    'Data & Analytics',
    18,
    '$90,000 - $150,000 annually',
    '[
        {"order": 1, "cert_slug": "data-analyst-professional", "reason": "Foundation: Data analysis basics"},
        {"order": 2, "cert_slug": "business-intelligence-specialist", "reason": "Intermediate: BI and visualization"},
        {"order": 3, "cert_slug": "python-developer-ai-automation", "reason": "Technical: Python for data"},
        {"order": 4, "cert_slug": "ai-ml-engineer", "reason": "Advanced: Machine learning"}
    ]'::jsonb,
    TRUE,
    TRUE
),

-- Business & Management Career Paths
(
    'Project Manager Career Path',
    'project-manager-path',
    'Develop from foundational project coordination to strategic program management.',
    'Senior Program Manager',
    'Some Experience',
    'Business Management',
    10,
    '$80,000 - $140,000 annually',
    '[
        {"order": 1, "cert_slug": "conscious-project-management", "reason": "Foundation: PM fundamentals"},
        {"order": 2, "cert_slug": "leadership-team-development", "reason": "Leadership: Team management"},
        {"order": 3, "cert_slug": "business-operations-process-design", "reason": "Strategic: Operations mastery"}
    ]'::jsonb,
    TRUE,
    TRUE
),
(
    'Business Operations Specialist Path',
    'business-operations-path',
    'Master business operations, process improvement, and operational excellence.',
    'VP of Operations',
    'Some Experience',
    'Business Management',
    12,
    '$90,000 - $160,000 annually',
    '[
        {"order": 1, "cert_slug": "business-operations-process-design", "reason": "Foundation: Operations basics"},
        {"order": 2, "cert_slug": "quality-management", "reason": "Quality: Six Sigma/Lean"},
        {"order": 3, "cert_slug": "conscious-project-management", "reason": "Integration: Project delivery"},
        {"order": 4, "cert_slug": "leadership-team-development", "reason": "Leadership: Executive skills"}
    ]'::jsonb,
    TRUE,
    FALSE
),

-- HR & People Operations Paths
(
    'Human Resources Professional Path',
    'hr-professional-path',
    'Build an HR career from recruiting and employee relations to strategic HR leadership.',
    'HR Director',
    'No Experience',
    'Human Resources',
    14,
    '$70,000 - $120,000 annually',
    '[
        {"order": 1, "cert_slug": "talent-acquisition-specialist", "reason": "Foundation: Recruiting basics"},
        {"order": 2, "cert_slug": "conscious-communication-professional", "reason": "Core skill: Communication"},
        {"order": 3, "cert_slug": "phr-sphr-prep", "reason": "Professional: HR certification prep"},
        {"order": 4, "cert_slug": "leadership-team-development", "reason": "Advanced: HR leadership"}
    ]'::jsonb,
    TRUE,
    TRUE
),

-- Healthcare Career Paths
(
    'Healthcare Administration Career Path',
    'healthcare-admin-path',
    'Enter healthcare management from medical coding to healthcare administration.',
    'Healthcare Administrator',
    'No Experience',
    'Healthcare',
    12,
    '$60,000 - $100,000 annually',
    '[
        {"order": 1, "cert_slug": "certified-medical-coder-prep", "reason": "Foundation: Medical coding"},
        {"order": 2, "cert_slug": "healthcare-administration-pro", "reason": "Management: Healthcare admin"},
        {"order": 3, "cert_slug": "conscious-project-management", "reason": "Leadership: Project management"}
    ]'::jsonb,
    TRUE,
    TRUE
),

-- Mental Health & Counseling Paths
(
    'Professional Coach Career Path',
    'professional-coach-path',
    'Become a certified professional coach specializing in life, career, or executive coaching.',
    'Executive Coach',
    'Some Experience',
    'Coaching',
    10,
    '$60,000 - $140,000+ annually',
    '[
        {"order": 1, "cert_slug": "professional-life-coach", "reason": "Foundation: Coaching basics"},
        {"order": 2, "cert_slug": "certified-pattern-recognition-specialist", "reason": "Specialization: Pattern recognition"},
        {"order": 3, "cert_slug": "advanced-communication-pattern-analyst", "reason": "Advanced: Communication mastery"},
        {"order": 4, "cert_slug": "consciousness-evolution-practitioner", "reason": "Mastery: Consciousness coaching"}
    ]'::jsonb,
    TRUE,
    TRUE
),
(
    'Mental Health Support Professional Path',
    'mental-health-support-path',
    'Build a career supporting mental health through peer support, counseling, and specialized services.',
    'Licensed Professional Counselor',
    'No Experience',
    'Mental Health',
    16,
    '$40,000 - $70,000 annually',
    '[
        {"order": 1, "cert_slug": "certified-peer-support-specialist", "reason": "Foundation: Peer support"},
        {"order": 2, "cert_slug": "boundary-setting-professional", "reason": "Core skill: Boundaries"},
        {"order": 3, "cert_slug": "addiction-counselor-prep", "reason": "Specialization: Addiction counseling"}
    ]'::jsonb,
    TRUE,
    FALSE
),

-- Marketing & Creative Paths
(
    'Digital Marketing Professional Path',
    'digital-marketing-path',
    'Master digital marketing from SEO and content to comprehensive marketing strategy.',
    'Digital Marketing Director',
    'No Experience',
    'Marketing',
    10,
    '$60,000 - $110,000 annually',
    '[
        {"order": 1, "cert_slug": "seo-specialist-cert", "reason": "Foundation: SEO mastery"},
        {"order": 2, "cert_slug": "social-media-marketing-pro", "reason": "Channel: Social media"},
        {"order": 3, "cert_slug": "content-marketing-strategist", "reason": "Strategy: Content marketing"},
        {"order": 4, "cert_slug": "digital-marketing-specialist", "reason": "Integration: Full digital marketing"}
    ]'::jsonb,
    TRUE,
    TRUE
),
(
    'UX/UI Designer Career Path',
    'ux-ui-designer-path',
    'Become a professional UX/UI designer with user research, prototyping, and design thinking skills.',
    'Senior Product Designer',
    'No Experience',
    'Design',
    12,
    '$70,000 - $120,000 annually',
    '[
        {"order": 1, "cert_slug": "graphic-design-specialist", "reason": "Foundation: Design fundamentals"},
        {"order": 2, "cert_slug": "ux-ui-design-professional", "reason": "Specialization: UX/UI mastery"},
        {"order": 3, "cert_slug": "fullstack-web-developer", "reason": "Technical: Understanding development"}
    ]'::jsonb,
    TRUE,
    TRUE
),

-- Education & Teaching Paths
(
    'Online Teaching Professional Path',
    'online-teaching-path',
    'Build a career as an online educator teaching English, K-12, or corporate training.',
    'Senior Online Educator',
    'No Experience',
    'Education',
    8,
    '$35,000 - $70,000 annually',
    '[
        {"order": 1, "cert_slug": "tefl-tesol-online-teaching", "reason": "Foundation: TEFL certification"},
        {"order": 2, "cert_slug": "k12-online-teaching-cert", "reason": "Specialization: K-12 teaching"},
        {"order": 3, "cert_slug": "instructional-design-specialist", "reason": "Advanced: Course design"}
    ]'::jsonb,
    TRUE,
    TRUE
),
(
    'Corporate Training Specialist Path',
    'corporate-training-path',
    'Become a corporate training professional specializing in L&D, facilitation, and talent development.',
    'Chief Learning Officer',
    'Some Experience',
    'Corporate Training',
    12,
    '$70,000 - $130,000 annually',
    '[
        {"order": 1, "cert_slug": "training-facilitator-cert", "reason": "Foundation: Facilitation skills"},
        {"order": 2, "cert_slug": "instructional-design-specialist", "reason": "Design: Course development"},
        {"order": 3, "cert_slug": "cptd-prep", "reason": "Professional: CPTD certification"},
        {"order": 4, "cert_slug": "leadership-team-development", "reason": "Leadership: L&D management"}
    ]'::jsonb,
    TRUE,
    FALSE
),

-- Financial Services Paths
(
    'Financial Coach Career Path',
    'financial-coach-path',
    'Help others achieve financial wellness through coaching, planning, and wealth building education.',
    'Senior Financial Coach',
    'No Experience',
    'Financial Services',
    9,
    '$50,000 - $100,000 annually',
    '[
        {"order": 1, "cert_slug": "personal-finance-specialist", "reason": "Foundation: Personal finance"},
        {"order": 2, "cert_slug": "professional-life-coach", "reason": "Coaching: Life coaching skills"},
        {"order": 3, "cert_slug": "business-economics-builder-revenue", "reason": "Business: Entrepreneurship"}
    ]'::jsonb,
    TRUE,
    TRUE
),

-- Entrepreneurship & Business Ownership Paths
(
    'Solopreneur to Business Owner Path',
    'solopreneur-path',
    'Build and scale your own business from freelancing to full business operations.',
    'Business Owner',
    'No Experience',
    'Entrepreneurship',
    15,
    '$50,000 - $200,000+ annually',
    '[
        {"order": 1, "cert_slug": "business-economics-builder-revenue", "reason": "Foundation: Business basics"},
        {"order": 2, "cert_slug": "digital-marketing-specialist", "reason": "Growth: Marketing your business"},
        {"order": 3, "cert_slug": "business-operations-process-design", "reason": "Scale: Operations & systems"},
        {"order": 4, "cert_slug": "leadership-team-development", "reason": "Leadership: Managing teams"}
    ]'::jsonb,
    TRUE,
    TRUE
),

-- Consciousness & Personal Development Paths
(
    'Consciousness Coach Master Path',
    'consciousness-coach-master',
    'Become a master consciousness coach guiding others through transformation and pattern recognition.',
    'Master Consciousness Practitioner',
    'Some Experience',
    'Personal Development',
    18,
    '$60,000 - $150,000+ annually',
    '[
        {"order": 1, "cert_slug": "certified-pattern-recognition-specialist", "reason": "Foundation: Pattern recognition"},
        {"order": 2, "cert_slug": "professional-life-coach", "reason": "Coaching: Life coaching"},
        {"order": 3, "cert_slug": "boundary-setting-professional", "reason": "Protection: Boundaries"},
        {"order": 4, "cert_slug": "advanced-communication-pattern-analyst", "reason": "Advanced: Communication"},
        {"order": 5, "cert_slug": "consciousness-evolution-practitioner", "reason": "Mastery: 7 domains integration"},
        {"order": 6, "cert_slug": "pattern-recognition-facilitator", "reason": "Teaching: Train others"}
    ]'::jsonb,
    TRUE,
    TRUE
);

-- ============================================================
-- CAREER PATHWAY TAGS & METADATA
-- ============================================================

-- Update pathways with additional metadata
UPDATE career_pathways
SET metadata = jsonb_build_object(
    'difficulty', 'Beginner to Intermediate',
    'time_commitment', '10-15 hours per week',
    'job_placement_rate', 'Data pending',
    'avg_salary_increase', '30-50%',
    'remote_work_friendly', true,
    'popular_industries', ARRAY['Technology', 'Software', 'Startups', 'Enterprise']
)
WHERE slug = 'complete-web-developer';

UPDATE career_pathways
SET metadata = jsonb_build_object(
    'difficulty', 'Intermediate to Advanced',
    'time_commitment', '15-20 hours per week',
    'prerequisites', ARRAY['Some IT experience', 'Networking basics'],
    'remote_work_friendly', true,
    'certifications_prepares_for', ARRAY['AWS Certified Solutions Architect', 'Azure Administrator']
)
WHERE slug = 'cloud-engineering-path';

UPDATE career_pathways
SET metadata = jsonb_build_object(
    'difficulty', 'Beginner to Advanced',
    'time_commitment', '12-18 hours per week',
    'high_demand', true,
    'government_jobs_available', true,
    'remote_work_friendly', true
)
WHERE slug = 'cybersecurity-professional-path';

COMMIT;

-- ============================================================
-- NOTES
-- ============================================================
-- 
-- These career pathways provide structured learning journeys through
-- the certification system. Each pathway:
-- 
-- 1. Has a clear target role and salary range
-- 2. Sequences certifications in logical order
-- 3. Explains why each step is important
-- 4. Estimates total time to complete
-- 5. Indicates starting level (no experience vs. some experience)
-- 
-- Users can choose a pathway or get recommended one based on their
-- career profile. Progress is tracked in user_pathway_progress table.
-- 
-- ============================================================
