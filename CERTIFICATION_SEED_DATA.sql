-- ============================================================
-- CERTIFICATION SEED DATA
-- Real-world certifications for Consciousness Revolution
-- Created: 2026-02-16
-- ============================================================

-- This file populates certification templates with real-world job-ready certifications
-- Run after CERTIFICATION_SCHEMA.sql

BEGIN;

-- ============================================================
-- PATTERN RECOGNITION CERTIFICATIONS
-- ============================================================

INSERT INTO certification_templates (
    category_id,
    name,
    slug,
    description,
    level,
    job_titles,
    industry_standards,
    estimated_salary_range,
    career_paths,
    required_xp,
    required_patterns_completed,
    passing_score_percentage,
    duration_hours,
    learning_objectives,
    assessment_criteria,
    active,
    featured
) VALUES
(
    (SELECT id FROM certification_categories WHERE slug = 'pattern-recognition'),
    'Certified Pattern Recognition Specialist',
    'certified-pattern-recognition-specialist',
    'Master manipulation pattern detection across personal and professional contexts. This certification validates your ability to identify gaslighting, love bombing, future faking, and 20+ other manipulation tactics.',
    'Intermediate',
    ARRAY['HR Professional', 'Relationship Coach', 'Mental Health Counselor', 'Mediator', 'Social Worker', 'Life Coach'],
    ARRAY['Similar to: Certified Professional Coach (CPC)', 'Aligned with: Mental Health First Aid', 'Complements: Conflict Resolution Certification'],
    '$45,000 - $85,000 annually',
    ARRAY['Human Resources', 'Counseling & Therapy', 'Life Coaching', 'Mediation Services', 'Training & Development'],
    500,
    30,
    85,
    40,
    ARRAY[
        'Identify 20+ manipulation patterns with 90%+ accuracy',
        'Distinguish between unconscious and intentional manipulation',
        'Apply pattern recognition to real-world scenarios',
        'Teach pattern recognition skills to others',
        'Create action plans for pattern-aware environments'
    ],
    ARRAY[
        'Pattern identification test (20 scenarios)',
        'Real-world case study analysis',
        'Teaching demonstration video',
        'Personal pattern journal (30 days)',
        'Final comprehensive exam'
    ],
    TRUE,
    TRUE
),
(
    (SELECT id FROM certification_categories WHERE slug = 'pattern-recognition'),
    'Advanced Communication Pattern Analyst',
    'advanced-communication-pattern-analyst',
    'Expert-level certification in analyzing communication patterns in professional settings. Ideal for HR, management, and organizational development roles.',
    'Advanced',
    ARRAY['Organizational Development Specialist', 'HR Director', 'Workplace Culture Consultant', 'Executive Coach', 'Team Facilitator'],
    ARRAY['SHRM-CP equivalent skill validation', 'ICF coaching competencies alignment', 'Complements: PHR/SPHR certifications'],
    '$65,000 - $120,000 annually',
    ARRAY['Human Resources Leadership', 'Organizational Development', 'Executive Coaching', 'Workplace Culture Consulting'],
    1000,
    50,
    90,
    60,
    ARRAY[
        'Analyze organizational communication patterns',
        'Design intervention strategies for toxic patterns',
        'Train teams on conscious communication',
        'Create culture change programs',
        'Measure pattern shift effectiveness'
    ],
    ARRAY[
        'Organizational case study analysis',
        'Culture intervention design project',
        'Team training delivery',
        'Pattern metrics dashboard creation',
        'Comprehensive written exam'
    ],
    TRUE,
    TRUE
);

-- ============================================================
-- DEVELOPER SKILLS CERTIFICATIONS
-- ============================================================

INSERT INTO certification_templates (
    category_id,
    name,
    slug,
    description,
    level,
    job_titles,
    industry_standards,
    estimated_salary_range,
    career_paths,
    required_skills,
    passing_score_percentage,
    duration_hours,
    learning_objectives,
    assessment_criteria,
    active,
    featured
) VALUES
(
    (SELECT id FROM certification_categories WHERE slug = 'developer-skills'),
    'Full-Stack Web Developer - Consciousness Tech',
    'fullstack-web-developer',
    'Comprehensive full-stack development certification focused on building conscious applications with HTML, CSS, JavaScript, Python, and database technologies.',
    'Intermediate',
    ARRAY['Full-Stack Developer', 'Web Application Developer', 'Software Engineer', 'Frontend Developer', 'Backend Developer'],
    ARRAY['Industry equivalent: AWS Certified Developer', 'Similar to: Meta Frontend Developer Certificate', 'Comparable to: Google IT Automation Certificate'],
    '$70,000 - $130,000 annually',
    ARRAY['Web Development', 'Software Engineering', 'DevOps', 'Cloud Architecture', 'Technical Leadership'],
    ARRAY['HTML5', 'CSS3', 'JavaScript ES6+', 'Python', 'REST APIs', 'Database Design', 'Git/GitHub'],
    80,
    120,
    ARRAY[
        'Build responsive web applications from scratch',
        'Implement REST APIs with authentication',
        'Design and query relational databases',
        'Deploy applications to production',
        'Write clean, maintainable code',
        'Use version control effectively'
    ],
    ARRAY[
        'Portfolio of 3 complete web applications',
        'Code review and refactoring exercise',
        'Live coding assessment',
        'System design interview',
        'Technical documentation writing'
    ],
    TRUE,
    TRUE
),
(
    (SELECT id FROM certification_categories WHERE slug = 'developer-skills'),
    'Python Developer for AI & Automation',
    'python-developer-ai-automation',
    'Specialized Python certification covering data processing, API development, automation scripts, and AI integration. Aligned with real-world Python developer roles.',
    'Intermediate',
    ARRAY['Python Developer', 'Automation Engineer', 'Data Engineer', 'Backend Developer', 'DevOps Engineer', 'ML Engineer'],
    ARRAY['Industry equivalent: Python Institute PCAP/PCPP', 'Similar to: IBM Data Engineering Certificate', 'Aligned with: Microsoft Azure AI Fundamentals'],
    '$75,000 - $140,000 annually',
    ARRAY['Backend Development', 'Data Engineering', 'AI/ML Engineering', 'DevOps Automation', 'Research & Development'],
    ARRAY['Python 3.x', 'APIs & REST', 'Data Processing', 'SQL/NoSQL', 'Testing', 'Docker'],
    85,
    100,
    ARRAY[
        'Write production-quality Python code',
        'Build and consume REST APIs',
        'Automate business processes',
        'Process and analyze large datasets',
        'Integrate AI services',
        'Deploy Python applications'
    ],
    ARRAY[
        'Build 2 automation systems from scratch',
        'Create API with full documentation',
        'Data processing pipeline project',
        'Code quality and testing assessment',
        'Live debugging challenge'
    ],
    TRUE,
    TRUE
),
(
    (SELECT id FROM certification_categories WHERE slug = 'developer-skills'),
    'JavaScript & Modern Web Development',
    'javascript-modern-web-development',
    'Master modern JavaScript including ES6+, async programming, DOM manipulation, and popular frameworks. Prepares for frontend and full-stack roles.',
    'Intermediate',
    ARRAY['Frontend Developer', 'JavaScript Developer', 'Web Developer', 'UI Engineer', 'React Developer'],
    ARRAY['Similar to: Meta Frontend Developer', 'Aligned with: freeCodeCamp JavaScript Certification', 'Complements: AWS Certified Developer'],
    '$65,000 - $125,000 annually',
    ARRAY['Frontend Development', 'Full-Stack Development', 'Mobile Development', 'Technical Leadership'],
    ARRAY['JavaScript ES6+', 'DOM APIs', 'Async/Promises', 'HTTP/APIs', 'Testing', 'Build Tools'],
    80,
    80,
    ARRAY[
        'Write modern, clean JavaScript code',
        'Build interactive web interfaces',
        'Handle asynchronous operations',
        'Consume external APIs',
        'Test JavaScript applications',
        'Use modern development tools'
    ],
    ARRAY[
        'Build 3 interactive web applications',
        'Async programming challenge',
        'API integration project',
        'Code review assessment',
        'Live coding interview'
    ],
    TRUE,
    TRUE
);

-- ============================================================
-- COMMUNICATION & LEADERSHIP CERTIFICATIONS
-- ============================================================

INSERT INTO certification_templates (
    category_id,
    name,
    slug,
    description,
    level,
    job_titles,
    industry_standards,
    estimated_salary_range,
    career_paths,
    required_patterns_completed,
    passing_score_percentage,
    duration_hours,
    learning_objectives,
    assessment_criteria,
    active,
    featured
) VALUES
(
    (SELECT id FROM certification_categories WHERE slug = 'communication-leadership'),
    'Conscious Communication Professional',
    'conscious-communication-professional',
    'Learn and demonstrate conscious, pattern-aware communication skills for professional and personal relationships. Ideal for anyone in client-facing, team leadership, or communication roles.',
    'Foundational',
    ARRAY['Customer Success Manager', 'Account Manager', 'Team Lead', 'Project Manager', 'Scrum Master', 'Sales Professional'],
    ARRAY['Similar to: Professional in Business Communication (PBC)', 'Aligned with: Certified Professional in Learning and Performance (CPLP)', 'Complements: PMI-ACP'],
    '$50,000 - $95,000 annually',
    ARRAY['Customer Success', 'Sales', 'Project Management', 'Team Leadership', 'Consulting'],
    15,
    80,
    50,
    ARRAY[
        'Communicate with clarity and authenticity',
        'Recognize and address manipulation in conversations',
        'Set and maintain healthy boundaries',
        'Navigate difficult conversations',
        'Build trust through conscious communication',
        'Apply nonviolent communication principles'
    ],
    ARRAY[
        'Communication pattern analysis (10 scenarios)',
        'Recorded conversation demonstrations',
        'Conflict resolution case study',
        'Boundary-setting role-play assessment',
        'Written communication samples'
    ],
    TRUE,
    TRUE
),
(
    (SELECT id FROM certification_categories WHERE slug = 'communication-leadership'),
    'Leadership & Team Development Specialist',
    'leadership-team-development',
    'Advanced leadership certification covering conscious leadership, team dynamics, motivation, and organizational health. Prepares for management and leadership roles.',
    'Advanced',
    ARRAY['Team Manager', 'Director', 'VP of Operations', 'Chief of Staff', 'Organizational Development Manager', 'HR Business Partner'],
    ARRAY['Similar to: Certified Manager (CM)', 'Aligned with: Scrum Master Certification', 'Complements: PMI Project Management Certification'],
    '$80,000 - $150,000 annually',
    ARRAY['People Management', 'Executive Leadership', 'Organizational Development', 'Business Operations', 'Strategic Planning'],
    25,
    85,
    80,
    ARRAY[
        'Lead teams with conscious awareness',
        'Build high-performance team cultures',
        'Navigate organizational politics ethically',
        'Develop talent and career paths',
        'Drive organizational change',
        'Measure and improve team health'
    ],
    ARRAY[
        'Leadership philosophy paper',
        'Team development plan creation',
        'Change management case study',
        '360-degree feedback analysis',
        'Strategic planning exercise',
        'Live leadership scenario assessment'
    ],
    TRUE,
    TRUE
);

-- ============================================================
-- FINANCIAL LITERACY CERTIFICATIONS
-- ============================================================

INSERT INTO certification_templates (
    category_id,
    name,
    slug,
    description,
    level,
    job_titles,
    industry_standards,
    estimated_salary_range,
    career_paths,
    passing_score_percentage,
    duration_hours,
    learning_objectives,
    assessment_criteria,
    active,
    featured
) VALUES
(
    (SELECT id FROM certification_categories WHERE slug = 'financial-literacy'),
    'Personal Finance & Wealth Building Specialist',
    'personal-finance-specialist',
    'Comprehensive personal finance certification covering budgeting, investing, debt management, and wealth building strategies. Prepares for financial coaching and advisory roles.',
    'Intermediate',
    ARRAY['Financial Coach', 'Personal Finance Advisor', 'Wealth Coach', 'Budget Consultant', 'Financial Educator'],
    ARRAY['Similar to: Accredited Financial Counselor (AFC)', 'Aligned with: Certified Financial Education Instructor (CFEI)', 'Complements: CFP education requirements'],
    '$45,000 - $85,000 annually',
    ARRAY['Financial Coaching', 'Financial Education', 'Nonprofit Financial Services', 'Corporate Wellness Programs'],
    80,
    60,
    ARRAY[
        'Create comprehensive budgets and financial plans',
        'Teach basic investing principles',
        'Develop debt elimination strategies',
        'Guide clients on wealth building',
        'Recognize financial manipulation patterns',
        'Provide ethical financial education'
    ],
    ARRAY[
        'Personal financial plan creation',
        'Client case study analysis (3 scenarios)',
        'Financial education workshop design',
        'Investment strategy assessment',
        'Ethics and boundaries exam',
        'Mock client consultation'
    ],
    TRUE,
    TRUE
),
(
    (SELECT id FROM certification_categories WHERE slug = 'financial-literacy'),
    'Business Economics & Builder Revenue',
    'business-economics-builder-revenue',
    'Specialized certification in business economics, revenue models, and builder/creator business management. Ideal for entrepreneurs and freelancers.',
    'Advanced',
    ARRAY['Business Owner', 'Entrepreneur', 'Freelance Consultant', 'Creator Economy Manager', 'Business Development Manager'],
    ARRAY['Similar to: Certified Business Management Professional', 'Aligned with: Entrepreneurship certifications', 'Complements: MBA fundamentals'],
    '$60,000 - $150,000+ annually (entrepreneurial)',
    ARRAY['Entrepreneurship', 'Business Consulting', 'Product Management', 'Business Development', 'Creator Economy'],
    85,
    70,
    ARRAY[
        'Design sustainable business models',
        'Price products and services effectively',
        'Manage business finances',
        'Build revenue streams',
        'Scale operations profitably',
        'Navigate business economics'
    ],
    ARRAY[
        'Business model design project',
        'Revenue projection and analysis',
        'Pricing strategy case study',
        'Business plan presentation',
        'Financial modeling exercise',
        'Comprehensive business exam'
    ],
    TRUE,
    TRUE
);

-- ============================================================
-- CONSCIOUSNESS TOOLS CERTIFICATIONS
-- ============================================================

INSERT INTO certification_templates (
    category_id,
    name,
    slug,
    description,
    level,
    job_titles,
    industry_standards,
    estimated_salary_range,
    career_paths,
    required_patterns_completed,
    required_xp,
    passing_score_percentage,
    duration_hours,
    learning_objectives,
    assessment_criteria,
    active,
    featured
) VALUES
(
    (SELECT id FROM certification_categories WHERE slug = 'consciousness-tools'),
    'Consciousness Evolution Practitioner',
    'consciousness-evolution-practitioner',
    'Master all 7 domains of consciousness and become certified to guide others through consciousness evolution. The flagship certification of the Consciousness Revolution platform.',
    'Advanced',
    ARRAY['Consciousness Coach', 'Life Coach', 'Spiritual Teacher', 'Transformation Facilitator', 'Wellness Coach', 'Personal Development Coach'],
    ARRAY['Similar to: ICF Certified Coach', 'Aligned with: Certified Life Coach', 'Unique specialization in consciousness technology'],
    '$50,000 - $120,000 annually',
    ARRAY['Consciousness Coaching', 'Life Coaching', 'Spiritual Teaching', 'Transformation Facilitation', 'Wellness Coaching'],
    40,
    2000,
    90,
    100,
    ARRAY[
        'Guide clients through all 7 domains',
        'Facilitate consciousness awakening processes',
        'Apply pattern recognition to personal growth',
        'Create customized consciousness plans',
        'Teach consciousness principles',
        'Maintain ethical practice standards'
    ],
    ARRAY[
        'Mastery of all 49+ tools demonstration',
        'Client journey mapping (3 case studies)',
        'Live coaching session recordings',
        '7-domain assessment interpretation',
        'Ethics and boundaries exam',
        'Final practitioner interview'
    ],
    TRUE,
    TRUE
),
(
    (SELECT id FROM certification_categories WHERE slug = 'consciousness-tools'),
    'Pattern Recognition Course Facilitator',
    'pattern-recognition-facilitator',
    'Become certified to teach the Pattern Recognition Course. Train others in manipulation detection and conscious communication.',
    'Advanced',
    ARRAY['Workshop Facilitator', 'Corporate Trainer', 'Course Instructor', 'Community Educator', 'Team Development Specialist'],
    ARRAY['Similar to: Certified Professional in Learning and Performance (CPLP)', 'Aligned with: ATD Master Trainer', 'Unique pattern recognition specialization'],
    '$55,000 - $100,000 annually',
    ARRAY['Training & Development', 'Corporate Learning', 'Community Education', 'Workshop Facilitation'],
    30,
    1500,
    90,
    80,
    ARRAY[
        'Deliver Pattern Recognition Course curriculum',
        'Facilitate group learning experiences',
        'Adapt content to different audiences',
        'Assess participant learning',
        'Create safe learning environments',
        'Support participant transformation'
    ],
    ARRAY[
        'Teach complete 6-module course',
        'Create supplemental materials',
        'Participant feedback portfolio',
        'Facilitation skills assessment',
        'Course adaptation project',
        'Master facilitator evaluation'
    ],
    TRUE,
    FALSE
);

-- ============================================================
-- BUSINESS MANAGEMENT CERTIFICATIONS
-- ============================================================

INSERT INTO certification_templates (
    category_id,
    name,
    slug,
    description,
    level,
    job_titles,
    industry_standards,
    estimated_salary_range,
    career_paths,
    passing_score_percentage,
    duration_hours,
    learning_objectives,
    assessment_criteria,
    active,
    featured
) VALUES
(
    (SELECT id FROM certification_categories WHERE slug = 'business-management'),
    'Conscious Project Management Professional',
    'conscious-project-management',
    'Project management certification with consciousness awareness. Combines traditional PM methodologies with pattern-aware leadership and ethical decision-making.',
    'Intermediate',
    ARRAY['Project Manager', 'Scrum Master', 'Program Manager', 'Product Manager', 'Delivery Manager', 'Agile Coach'],
    ARRAY['Complements: PMP/CAPM', 'Similar to: CSM/PSM', 'Adds consciousness layer to standard PM certifications'],
    '$70,000 - $130,000 annually',
    ARRAY['Project Management', 'Product Management', 'Program Management', 'Agile Coaching', 'Delivery Leadership'],
    80,
    70,
    ARRAY[
        'Lead projects with conscious awareness',
        'Navigate stakeholder patterns',
        'Build healthy team dynamics',
        'Make ethical project decisions',
        'Manage scope with integrity',
        'Deliver results sustainably'
    ],
    ARRAY[
        'Project plan with pattern analysis',
        'Stakeholder management case study',
        'Risk assessment with consciousness lens',
        'Team dynamics intervention plan',
        'PM methodology exam',
        'Live project simulation'
    ],
    TRUE,
    TRUE
),
(
    (SELECT id FROM certification_categories WHERE slug = 'business-management'),
    'Business Operations & Process Design',
    'business-operations-process-design',
    'Master business operations, process optimization, and systems thinking. Ideal for operations managers and efficiency specialists.',
    'Advanced',
    ARRAY['Operations Manager', 'Business Analyst', 'Process Improvement Manager', 'Chief Operations Officer', 'Efficiency Consultant'],
    ARRAY['Similar to: Six Sigma Black Belt', 'Aligned with: Lean certification', 'Complements: Business Analysis certifications'],
    '$75,000 - $140,000 annually',
    ARRAY['Operations Management', 'Business Analysis', 'Process Improvement', 'Operational Excellence', 'Executive Leadership'],
    85,
    75,
    ARRAY[
        'Design efficient business processes',
        'Analyze and optimize operations',
        'Implement process improvements',
        'Measure operational effectiveness',
        'Lead operational transformation',
        'Build operational resilience'
    ],
    ARRAY[
        'Process redesign project',
        'Operations analysis case study',
        'Efficiency metrics dashboard',
        'Change management plan',
        'Systems thinking assessment',
        'Operations strategy presentation'
    ],
    TRUE,
    FALSE
);

-- ============================================================
-- SECURITY & BOUNDARIES CERTIFICATIONS
-- ============================================================

INSERT INTO certification_templates (
    category_id,
    name,
    slug,
    description,
    level,
    job_titles,
    industry_standards,
    estimated_salary_range,
    career_paths,
    required_patterns_completed,
    passing_score_percentage,
    duration_hours,
    learning_objectives,
    assessment_criteria,
    active,
    featured
) VALUES
(
    (SELECT id FROM certification_categories WHERE slug = 'security-boundaries'),
    'Digital Privacy & Security Specialist',
    'digital-privacy-security',
    'Comprehensive certification in digital privacy, online security, and personal data protection. Essential for anyone working in security or privacy roles.',
    'Intermediate',
    ARRAY['Privacy Officer', 'Security Analyst', 'Information Security Specialist', 'Compliance Manager', 'Data Protection Officer'],
    ARRAY['Similar to: CIPP (Certified Information Privacy Professional)', 'Aligned with: Security+ fundamentals', 'Complements: CISSP education'],
    '$65,000 - $120,000 annually',
    ARRAY['Information Security', 'Privacy Management', 'Compliance', 'Risk Management', 'Security Operations'],
    10,
    85,
    60,
    ARRAY[
        'Assess digital privacy risks',
        'Implement security best practices',
        'Manage personal data protection',
        'Navigate privacy regulations',
        'Secure online signal',
        'Teach digital security to others'
    ],
    ARRAY[
        'Privacy risk assessment project',
        'Security implementation plan',
        'Compliance framework mapping',
        'Incident response scenario',
        'Security education workshop design',
        'Comprehensive security exam'
    ],
    TRUE,
    TRUE
),
(
    (SELECT id FROM certification_categories WHERE slug = 'security-boundaries'),
    'Boundary Setting & Self-Protection Professional',
    'boundary-setting-professional',
    'Master personal and professional boundaries. Essential skills for maintaining healthy relationships and preventing exploitation.',
    'Foundational',
    ARRAY['Therapist', 'Counselor', 'HR Professional', 'Life Coach', 'Social Worker', 'Team Lead'],
    ARRAY['Complements: Mental Health First Aid', 'Aligned with: Coaching certifications', 'Unique focus on boundaries in consciousness context'],
    '$40,000 - $80,000 annually',
    ARRAY['Counseling', 'Coaching', 'Human Resources', 'Social Services', 'Personal Development'],
    20,
    80,
    40,
    ARRAY[
        'Set clear personal boundaries',
        'Recognize boundary violations',
        'Communicate boundaries effectively',
        'Maintain boundaries under pressure',
        'Teach boundary-setting to others',
        'Create boundary-respecting cultures'
    ],
    ARRAY[
        'Personal boundary plan',
        'Boundary violation case studies (5)',
        'Role-play assessments',
        'Boundary communication scripts',
        'Teaching demonstration',
        'Ethics and application exam'
    ],
    TRUE,
    TRUE
);

-- ============================================================
-- CERTIFIABLE SKILLS SEED DATA
-- ============================================================

INSERT INTO certifiable_skills (name, slug, description, category, industry_demand, related_jobs, related_tools) VALUES
-- Technical Skills
('Python Programming', 'python', 'Write production-quality Python code for web, automation, and data applications', 'Technical', 'Critical', 
    ARRAY['Python Developer', 'Data Engineer', 'Backend Developer', 'DevOps Engineer'], 
    ARRAY['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy']),
('JavaScript Development', 'javascript', 'Modern JavaScript including ES6+, async programming, and DOM manipulation', 'Technical', 'Critical',
    ARRAY['Frontend Developer', 'Full-Stack Developer', 'Web Developer'],
    ARRAY['React', 'Vue', 'Node.js', 'Express']),
('HTML & CSS', 'html-css', 'Semantic HTML5 and modern CSS including Flexbox, Grid, and responsive design', 'Technical', 'High',
    ARRAY['Frontend Developer', 'Web Designer', 'UI Developer'],
    ARRAY['Bootstrap', 'Tailwind', 'SASS', 'Figma']),
('SQL & Database Design', 'sql-databases', 'Design and query relational databases, write efficient SQL', 'Technical', 'Critical',
    ARRAY['Database Administrator', 'Backend Developer', 'Data Analyst'],
    ARRAY['PostgreSQL', 'MySQL', 'SQL Server', 'Supabase']),
('REST API Development', 'rest-api', 'Design and build RESTful APIs with authentication and documentation', 'Technical', 'High',
    ARRAY['Backend Developer', 'API Developer', 'Full-Stack Developer'],
    ARRAY['FastAPI', 'Express', 'Django REST', 'Swagger']),
('Git & Version Control', 'git', 'Use Git effectively for version control and collaboration', 'Technical', 'Critical',
    ARRAY['Any Developer Role'], ARRAY['GitHub', 'GitLab', 'Bitbucket']),

-- Pattern Recognition Skills
('Manipulation Pattern Detection', 'manipulation-detection', 'Identify gaslighting, love bombing, and other manipulation tactics', 'Pattern Recognition', 'High',
    ARRAY['HR Professional', 'Therapist', 'Coach', 'Mediator'],
    ARRAY['Pattern Library', 'Gaslighting Detector', 'Communication Analyzer']),
('Conscious Communication', 'conscious-communication', 'Communicate with clarity, authenticity, and pattern awareness', 'Communication', 'High',
    ARRAY['Manager', 'Coach', 'Consultant', 'Customer Success'],
    ARRAY['NVC Framework', 'Meeting Analyzer', 'Communication Tools']),
('Boundary Setting', 'boundary-setting', 'Set and maintain healthy boundaries in personal and professional contexts', 'Pattern Recognition', 'High',
    ARRAY['Therapist', 'Manager', 'Coach', 'HR Professional'],
    ARRAY['Boundary Setter', 'Violation Tracker', 'Pattern Detectors']),

-- Leadership Skills
('Team Leadership', 'team-leadership', 'Lead teams effectively with conscious awareness and pattern recognition', 'Leadership', 'High',
    ARRAY['Team Lead', 'Manager', 'Director', 'Scrum Master'],
    ARRAY['1-on-1 Tools', 'Team Dashboards', 'OKR Systems']),
('Conflict Resolution', 'conflict-resolution', 'Navigate and resolve conflicts using pattern-aware techniques', 'Communication', 'High',
    ARRAY['Manager', 'HR Professional', 'Mediator', 'Coach'],
    ARRAY['Conflict Analyzers', 'Mediation Tools', 'Pattern Detectors']),
('Decision Making', 'decision-making', 'Make clear, values-aligned decisions under pressure', 'Leadership', 'High',
    ARRAY['Manager', 'Executive', 'Consultant', 'Project Manager'],
    ARRAY['Decision Matrix', 'BATNA Calculator', 'Values Alignment']),

-- Financial Skills
('Personal Budgeting', 'personal-budgeting', 'Create and maintain effective personal budgets', 'Financial', 'High',
    ARRAY['Financial Coach', 'Accountant', 'Anyone'],
    ARRAY['Budgeting Tools', 'Financial Trackers', 'Spreadsheets']),
('Business Finance', 'business-finance', 'Understand and manage business finances and revenue models', 'Financial', 'High',
    ARRAY['Business Owner', 'Accountant', 'Financial Analyst'],
    ARRAY['QuickBooks', 'Financial Modeling', 'Business Dashboards']),
('Investment Basics', 'investment-basics', 'Understand investment principles and strategies', 'Financial', 'Medium',
    ARRAY['Financial Advisor', 'Financial Coach', 'Investor'],
    ARRAY['Investment Platforms', 'Financial Calculators', 'Analysis Tools']),

-- Analytical Skills
('Critical Thinking', 'critical-thinking', 'Analyze information critically and recognize logical fallacies', 'Analytical', 'Critical',
    ARRAY['Analyst', 'Researcher', 'Consultant', 'Any Role'],
    ARRAY['Truth Detector', 'Source Verifier', 'Logic Tools']),
('Data Analysis', 'data-analysis', 'Analyze and interpret data to derive insights', 'Analytical', 'High',
    ARRAY['Data Analyst', 'Business Analyst', 'Researcher'],
    ARRAY['Excel', 'Python', 'SQL', 'Visualization Tools']),

-- Creative Skills
('Content Creation', 'content-creation', 'Create engaging content across multiple formats', 'Creative', 'High',
    ARRAY['Content Creator', 'Marketer', 'Coach', 'Educator'],
    ARRAY['Writing Tools', 'Design Tools', 'Video Editors']),
('Workshop Design', 'workshop-design', 'Design and facilitate effective workshops and training', 'Creative', 'Medium',
    ARRAY['Facilitator', 'Trainer', 'Coach', 'Consultant'],
    ARRAY['Presentation Tools', 'Collaboration Platforms', 'Training Materials'])

ON CONFLICT (slug) DO NOTHING;

COMMIT;

