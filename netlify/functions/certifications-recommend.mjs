/**
 * Netlify Function: Get Certification Recommendations
 * 
 * Get personalized certification recommendations based on user profile
 * 
 * Endpoint: /.netlify/functions/certifications-recommend
 * Method: POST
 * 
 * Body:
 * {
 *   "careerGoals": ["career-change", "remote-work"],
 *   "industries": ["technology", "business"],
 *   "experienceLevel": "no-experience",
 *   "timeCommitment": 10,
 *   "learningStyles": ["video", "hands-on"]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "recommendations": [
 *     {
 *       "certification": {...},
 *       "score": 95,
 *       "reasons": ["Matches your tech interest", "Beginner-friendly"],
 *       "pathway": {...}
 *     }
 *   ]
 * }
 */

import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export const handler = async (event, context) => {
    // Handle OPTIONS for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: CORS_HEADERS,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
            },
            body: JSON.stringify({
                success: false,
                error: 'Method not allowed. Use POST.'
            })
        };
    }

    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Parse request body
        const profile = JSON.parse(event.body || '{}');
        const {
            careerGoals = [],
            industries = [],
            experienceLevel = 'no-experience',
            timeCommitment = 10,
            learningStyles = []
        } = profile;

        // Validate input
        if (!industries || industries.length === 0) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Please select at least one industry of interest'
                })
            };
        }

        // Get all active certifications with their categories
        const { data: certifications, error: certsError } = await supabase
            .from('certification_templates')
            .select(`
                *,
                certification_categories (
                    id,
                    name,
                    slug,
                    domain
                )
            `)
            .eq('active', true);

        if (certsError) {
            console.error('Error fetching certifications:', certsError);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Failed to fetch certifications'
                })
            };
        }

        // Calculate recommendation scores
        const recommendations = certifications.map(cert => {
            const score = calculateScore(cert, profile);
            const reasons = generateReasons(cert, profile, score);
            
            return {
                certification: cert,
                score: score,
                reasons: reasons,
                estimatedWeeks: cert.duration_hours ? Math.ceil(cert.duration_hours / timeCommitment) : null
            };
        })
        .filter(rec => rec.score > 30) // Only show decent matches
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, 10); // Top 10 recommendations

        // Get relevant career pathways
        const { data: pathways, error: pathwaysError } = await supabase
            .from('career_pathways')
            .select('*')
            .eq('active', true)
            .order('featured', { ascending: false })
            .limit(5);

        if (pathwaysError) {
            console.error('Error fetching pathways:', pathwaysError);
        }

        // Match pathways to user profile
        const matchedPathways = pathways ? pathways
            .map(pathway => ({
                pathway: pathway,
                score: calculatePathwayScore(pathway, profile),
                reasons: generatePathwayReasons(pathway, profile)
            }))
            .filter(p => p.score > 40)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3) : [];

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
            },
            body: JSON.stringify({
                success: true,
                recommendations: recommendations,
                pathways: matchedPathways,
                profile_summary: {
                    goals: careerGoals,
                    industries: industries,
                    experience: experienceLevel,
                    time_per_week: timeCommitment,
                    learning_styles: learningStyles
                }
            })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
            },
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

/**
 * Calculate recommendation score (0-100) for a certification
 */
function calculateScore(cert, profile) {
    let score = 0;
    
    // Industry match (40 points max)
    const industryMatch = checkIndustryMatch(cert, profile.industries);
    score += industryMatch * 40;
    
    // Experience level appropriateness (25 points max)
    const levelMatch = checkLevelMatch(cert.level, profile.experienceLevel);
    score += levelMatch * 25;
    
    // Time commitment feasibility (20 points max)
    const timeMatch = checkTimeMatch(cert.duration_hours, profile.timeCommitment);
    score += timeMatch * 20;
    
    // Career goal alignment (15 points max)
    const goalMatch = checkGoalMatch(cert, profile.careerGoals);
    score += goalMatch * 15;
    
    return Math.min(Math.round(score), 100);
}

/**
 * Check if certification matches user's industry interests
 */
function checkIndustryMatch(cert, userIndustries) {
    const certCategory = cert.certification_categories?.slug || '';
    const certIndustries = (cert.career_paths || []).map(p => p.toLowerCase());
    
    // Map user selections to category slugs and keywords
    const industryMap = {
        'technology': ['developer-skills', 'cloud-computing', 'cybersecurity', 'ai-machine-learning', 'data-science'],
        'healthcare': ['healthcare-medicine', 'mental-health-counseling', 'health-wellness'],
        'education': ['education-teaching', 'corporate-training'],
        'business': ['business-management', 'supply-chain', 'quality-management'],
        'creative': ['creative-arts-design', 'content-marketing'],
        'finance': ['financial-literacy'],
        'marketing': ['content-marketing', 'sales-business-dev'],
        'personal-development': ['consciousness-tools', 'mental-health-counseling']
    };
    
    for (const userIndustry of userIndustries) {
        const matchingSlugs = industryMap[userIndustry] || [];
        if (matchingSlugs.includes(certCategory)) {
            return 1.0; // Perfect match
        }
        
        // Check if cert's career paths mention this industry
        if (certIndustries.some(ci => ci.includes(userIndustry))) {
            return 0.7; // Good match
        }
    }
    
    return 0.2; // Minimal match (still show some certs)
}

/**
 * Check if certification level matches user's experience
 */
function checkLevelMatch(certLevel, userExperience) {
    const experienceMap = {
        'no-experience': { 'Foundational': 1.0, 'Intermediate': 0.5, 'Advanced': 0.2, 'Expert': 0.1 },
        'some-experience': { 'Foundational': 0.7, 'Intermediate': 1.0, 'Advanced': 0.7, 'Expert': 0.3 },
        'professional': { 'Foundational': 0.3, 'Intermediate': 0.7, 'Advanced': 1.0, 'Expert': 0.9 }
    };
    
    return experienceMap[userExperience]?.[certLevel] || 0.5;
}

/**
 * Check if certification duration matches user's time commitment
 */
function checkTimeMatch(durationHours, timePerWeek) {
    if (!durationHours || !timePerWeek) return 0.5;
    
    const weeksNeeded = durationHours / timePerWeek;
    
    if (weeksNeeded <= 12) return 1.0; // 3 months or less - excellent
    if (weeksNeeded <= 24) return 0.7; // 6 months or less - good
    if (weeksNeeded <= 36) return 0.4; // 9 months or less - acceptable
    
    return 0.2; // More than 9 months - challenging
}

/**
 * Check if certification aligns with career goals
 */
function checkGoalMatch(cert, careerGoals) {
    let match = 0;
    
    if (careerGoals.includes('career-change')) {
        if (cert.level === 'Foundational' || cert.level === 'Intermediate') {
            match = Math.max(match, 0.8);
        }
    }
    
    if (careerGoals.includes('remote-work')) {
        const remoteKeywords = ['remote', 'online', 'virtual', 'developer', 'digital', 'freelance'];
        const certText = `${cert.name} ${cert.description} ${(cert.job_titles || []).join(' ')}`.toLowerCase();
        if (remoteKeywords.some(keyword => certText.includes(keyword))) {
            match = Math.max(match, 0.9);
        }
    }
    
    if (careerGoals.includes('salary-increase') || careerGoals.includes('entrepreneurship')) {
        const salaryText = (cert.estimated_salary_range || '').toLowerCase();
        if (salaryText.includes('100,000') || salaryText.includes('120,000') || salaryText.includes('150,000')) {
            match = Math.max(match, 0.9);
        }
    }
    
    if (careerGoals.includes('passion-work')) {
        if (cert.certification_categories?.slug === 'consciousness-tools' || 
            cert.certification_categories?.slug === 'pattern-recognition') {
            match = Math.max(match, 1.0);
        }
    }
    
    return match || 0.3; // Default minimum match
}

/**
 * Generate human-readable reasons for recommendation
 */
function generateReasons(cert, profile, score) {
    const reasons = [];
    
    // Industry match reason
    const industryMatch = checkIndustryMatch(cert, profile.industries);
    if (industryMatch >= 0.7) {
        reasons.push(`Matches your interest in ${profile.industries.join(', ')}`);
    }
    
    // Experience level reason
    const levelMatch = checkLevelMatch(cert.level, profile.experienceLevel);
    if (levelMatch >= 0.7) {
        if (profile.experienceLevel === 'no-experience') {
            reasons.push('Perfect for beginners - starts from basics');
        } else if (profile.experienceLevel === 'some-experience') {
            reasons.push('Appropriate for your experience level');
        } else {
            reasons.push('Advanced content for professionals');
        }
    }
    
    // Remote work
    if (profile.careerGoals.includes('remote-work')) {
        const remoteKeywords = ['remote', 'online', 'virtual', 'developer', 'digital'];
        const certText = `${cert.name} ${cert.description}`.toLowerCase();
        if (remoteKeywords.some(keyword => certText.includes(keyword))) {
            reasons.push('Enables remote work opportunities');
        }
    }
    
    // Salary potential
    const salaryText = cert.estimated_salary_range || '';
    if (salaryText) {
        reasons.push(`Salary potential: ${salaryText}`);
    }
    
    // Time commitment
    if (cert.duration_hours) {
        const weeksNeeded = Math.ceil(cert.duration_hours / profile.timeCommitment);
        if (weeksNeeded <= 12) {
            reasons.push(`Can complete in ${weeksNeeded} weeks at your pace`);
        }
    }
    
    // High match score
    if (score >= 85) {
        reasons.push('🏆 Highly recommended based on your profile');
    }
    
    return reasons.length > 0 ? reasons : ['Relevant to your career goals'];
}

/**
 * Calculate pathway match score
 */
function calculatePathwayScore(pathway, profile) {
    let score = 0;
    
    // Industry match
    const industryLower = pathway.industry?.toLowerCase() || '';
    if (profile.industries.some(ind => industryLower.includes(ind))) {
        score += 50;
    }
    
    // Experience level
    const startingLevel = pathway.starting_level || '';
    if ((profile.experienceLevel === 'no-experience' && startingLevel === 'No Experience') ||
        (profile.experienceLevel === 'some-experience' && startingLevel === 'Some Experience') ||
        (profile.experienceLevel === 'professional' && startingLevel === 'Professional')) {
        score += 30;
    } else if (startingLevel === 'No Experience') {
        score += 15; // Accessible to everyone
    }
    
    // Featured pathways get a boost
    if (pathway.featured) {
        score += 20;
    }
    
    return score;
}

/**
 * Generate pathway recommendation reasons
 */
function generatePathwayReasons(pathway, profile) {
    const reasons = [];
    
    reasons.push(`Complete career path to ${pathway.target_role}`);
    
    if (pathway.estimated_duration_months) {
        reasons.push(`${pathway.estimated_duration_months}-month structured program`);
    }
    
    if (pathway.estimated_salary_range) {
        reasons.push(`Target salary: ${pathway.estimated_salary_range}`);
    }
    
    if (pathway.starting_level === 'No Experience') {
        reasons.push('No prior experience required');
    }
    
    return reasons;
}
