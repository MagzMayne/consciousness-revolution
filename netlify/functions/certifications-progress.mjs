/**
 * Netlify Function: Get User Certification Progress
 * 
 * Retrieve certification progress for a specific user and certification
 * 
 * Endpoint: /.netlify/functions/certifications-progress
 * Method: GET, POST
 * 
 * GET: Retrieve progress
 * Query Parameters:
 * - template_id: Certification template ID
 * 
 * POST: Update progress
 * Request body:
 * {
 *   "template_id": "uuid",
 *   "completed_skill": "skill-slug",
 *   "completed_course": "course-id",
 *   "xp_earned": 100,
 *   "patterns_completed": 5
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "progress": {...}
 * }
 */

import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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

    try {
        // Initialize Supabase client with user's JWT if available
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

        if (event.httpMethod === 'GET') {
            // Get progress
            const params = event.queryStringParameters || {};
            const { template_id } = params;

            if (!template_id) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...CORS_HEADERS
                    },
                    body: JSON.stringify({
                        success: false,
                        error: 'Missing template_id parameter'
                    })
                };
            }

            const { data: progress, error } = await supabase
                .from('certification_progress')
                .select(`
                    *,
                    certification_templates (
                        id,
                        name,
                        slug,
                        level,
                        required_skills,
                        required_courses,
                        required_xp,
                        required_patterns_completed
                    )
                `)
                .eq('user_id', user.id)
                .eq('certification_template_id', template_id)
                .single();

            if (error && error.code !== 'PGRST116') { // Not found is okay
                console.error('Database error:', error);
                return {
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        ...CORS_HEADERS
                    },
                    body: JSON.stringify({
                        success: false,
                        error: 'Failed to fetch progress',
                        message: error.message
                    })
                };
            }

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: true,
                    progress: progress || null,
                    has_progress: !!progress
                })
            };
        }

        if (event.httpMethod === 'POST') {
            // Update progress
            const body = JSON.parse(event.body || '{}');
            const {
                template_id,
                completed_skill,
                completed_course,
                xp_earned,
                patterns_completed
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
                        error: 'Missing template_id in request body'
                    })
                };
            }

            // Get or create progress record
            let { data: progress, error: fetchError } = await supabase
                .from('certification_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('certification_template_id', template_id)
                .single();

            if (fetchError && fetchError.code === 'PGRST116') {
                // Create new progress record
                const { data: newProgress, error: createError } = await supabase
                    .from('certification_progress')
                    .insert({
                        user_id: user.id,
                        certification_template_id: template_id,
                        status: 'in_progress',
                        completed_skills: completed_skill ? [completed_skill] : [],
                        completed_courses: completed_course ? [completed_course] : [],
                        current_xp: xp_earned || 0,
                        patterns_completed: patterns_completed || 0
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Create error:', createError);
                    return {
                        statusCode: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            ...CORS_HEADERS
                        },
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to create progress record',
                            message: createError.message
                        })
                    };
                }

                progress = newProgress;
            } else if (fetchError) {
                console.error('Fetch error:', fetchError);
                return {
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        ...CORS_HEADERS
                    },
                    body: JSON.stringify({
                        success: false,
                        error: 'Failed to fetch progress',
                        message: fetchError.message
                    })
                };
            }

            // Update progress
            const updates = {
                last_activity_at: new Date().toISOString()
            };

            if (completed_skill) {
                const skills = progress.completed_skills || [];
                if (!skills.includes(completed_skill)) {
                    updates.completed_skills = [...skills, completed_skill];
                }
            }

            if (completed_course) {
                const courses = progress.completed_courses || [];
                if (!courses.includes(completed_course)) {
                    updates.completed_courses = [...courses, completed_course];
                }
            }

            if (xp_earned) {
                updates.current_xp = (progress.current_xp || 0) + xp_earned;
            }

            if (patterns_completed) {
                updates.patterns_completed = (progress.patterns_completed || 0) + patterns_completed;
            }

            const { data: updatedProgress, error: updateError } = await supabase
                .from('certification_progress')
                .update(updates)
                .eq('id', progress.id)
                .select()
                .single();

            if (updateError) {
                console.error('Update error:', updateError);
                return {
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        ...CORS_HEADERS
                    },
                    body: JSON.stringify({
                        success: false,
                        error: 'Failed to update progress',
                        message: updateError.message
                    })
                };
            }

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: true,
                    progress: updatedProgress,
                    updated: true
                })
            };
        }

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
