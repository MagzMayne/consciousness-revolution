/**
 * Netlify Function: Issue Certification
 * 
 * Issue a certification to a user after they complete requirements
 * 
 * Endpoint: /.netlify/functions/certifications-issue
 * Method: POST
 * 
 * Request body:
 * {
 *   "template_id": "uuid",
 *   "assessment_id": "uuid", (optional - if from assessment)
 *   "score_percentage": 85,
 *   "completion_time_hours": 40.5,
 *   "skills_demonstrated": ["skill1", "skill2"]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "certification": {...},
 *   "certificate_url": "https://..."
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
                error: 'Method not allowed'
            })
        };
    }

    try {
        // Initialize Supabase client with user's JWT
        const authHeader = event.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            }
        );

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Valid authentication required'
                })
            };
        }

        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const {
            template_id,
            assessment_id,
            score_percentage,
            completion_time_hours,
            skills_demonstrated
        } = body;

        if (!template_id) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Missing template_id'
                })
            };
        }

        // Get certification template
        const { data: template, error: templateError } = await supabase
            .from('certification_templates')
            .select('*')
            .eq('id', template_id)
            .eq('active', true)
            .single();

        if (templateError || !template) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Certification template not found'
                })
            };
        }

        // Verify user meets requirements
        const { data: progress, error: progressError } = await supabase
            .from('certification_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('certification_template_id', template_id)
            .single();

        if (progressError || !progress) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'No progress found for this certification',
                    message: 'User must start certification progress before issuance'
                })
            };
        }

        // Check if score meets passing percentage
        if (score_percentage < template.passing_score_percentage) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Score too low',
                    message: `Score of ${score_percentage}% does not meet passing requirement of ${template.passing_score_percentage}%`,
                    required: template.passing_score_percentage,
                    achieved: score_percentage
                })
            };
        }

        // Check if already certified
        const { data: existingCert, error: existingError } = await supabase
            .from('user_certifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('certification_template_id', template_id)
            .eq('revoked', false)
            .single();

        if (existingCert) {
            // Check if existing cert is still valid
            const isExpired = existingCert.expires_at && new Date(existingCert.expires_at) < new Date();
            
            if (!isExpired) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...CORS_HEADERS
                    },
                    body: JSON.stringify({
                        success: false,
                        error: 'Already certified',
                        message: 'User already has a valid certification',
                        existing_certification: {
                            certificate_number: existingCert.certificate_number,
                            issued_at: existingCert.issued_at,
                            expires_at: existingCert.expires_at
                        }
                    })
                };
            }
        }

        // Get user foundation
        const { data: foundation, error: foundationError } = await supabase
            .from('user_foundations')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (foundationError && foundationError.code !== 'PGRST116') {
            console.error('Foundation lookup error:', foundationError);
        }

        // Issue certification
        const { data: certification, error: issueError } = await supabase
            .from('user_certifications')
            .insert({
                user_id: user.id,
                foundation_id: foundation?.id || null,
                certification_template_id: template_id,
                score_percentage,
                completion_time_hours,
                skills_demonstrated: skills_demonstrated || [],
                metadata: {
                    assessment_id,
                    issued_by: 'system',
                    issued_at: new Date().toISOString()
                }
            })
            .select(`
                *,
                certification_templates (
                    name,
                    level,
                    certification_categories (
                        name,
                        domain
                    )
                )
            `)
            .single();

        if (issueError) {
            console.error('Issue error:', issueError);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Failed to issue certification',
                    message: issueError.message
                })
            };
        }

        // Update progress status to completed
        await supabase
            .from('certification_progress')
            .update({
                status: 'completed',
                updated_at: new Date().toISOString()
            })
            .eq('id', progress.id);

        // ENHANCEMENT: Generate certificate PDF and badge when scaling
        // Current: Returns certificate data and URL (works for now)
        const certificateUrl = `${process.env.URL || 'https://consciousnessrevolution.io'}/certifications/certificate/${certification.certificate_number}`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
            },
            body: JSON.stringify({
                success: true,
                certification: {
                    id: certification.id,
                    certificate_number: certification.certificate_number,
                    verification_code: certification.verification_code,
                    issued_at: certification.issued_at,
                    expires_at: certification.expires_at,
                    score_percentage: certification.score_percentage,
                    name: certification.certification_templates?.name,
                    level: certification.certification_templates?.level,
                    category: certification.certification_templates?.certification_categories?.name
                },
                certificate_url: certificateUrl,
                verification_url: `${process.env.URL || 'https://consciousnessrevolution.io'}/certifications/verify?code=${certification.verification_code}`,
                message: 'Congratulations! Your certification has been issued.'
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
