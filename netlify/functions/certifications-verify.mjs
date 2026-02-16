/**
 * Netlify Function: Verify Certification
 * 
 * Public endpoint to verify a certification by certificate number or verification code
 * 
 * Endpoint: /.netlify/functions/certifications-verify
 * Method: GET
 * 
 * Query Parameters:
 * - code: Verification code (12-character alphanumeric)
 * - certificate_number: Certificate number (e.g., PRF-26-00123)
 * 
 * Response:
 * {
 *   "success": true,
 *   "verified": true,
 *   "certification": {...},
 *   "holder": {...}
 * }
 */

import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Parse query parameters
        const params = event.queryStringParameters || {};
        const { code, certificate_number } = params;

        if (!code && !certificate_number) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Missing verification parameter',
                    message: 'Provide either "code" or "certificate_number"'
                })
            };
        }

        // Build query
        let query = supabase
            .from('user_certifications')
            .select(`
                *,
                certification_templates (
                    id,
                    name,
                    slug,
                    description,
                    level,
                    certification_categories (
                        name,
                        slug,
                        domain
                    )
                ),
                user_foundations (
                    name,
                    username
                )
            `)
            .eq('verified', true)
            .eq('revoked', false);

        if (code) {
            query = query.eq('verification_code', code.toUpperCase());
        } else {
            query = query.eq('certificate_number', certificate_number.toUpperCase());
        }

        const { data: certification, error } = await query.single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found
                // Log verification attempt
                await supabase.from('certification_verifications').insert({
                    certification_id: null,
                    verifier_type: 'unknown',
                    verification_method: code ? 'code' : 'certificate_number',
                    verification_successful: false,
                    notes: `Verification failed: ${code || certificate_number} not found`,
                    ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
                    user_agent: event.headers['user-agent']
                });

                return {
                    statusCode: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        ...CORS_HEADERS
                    },
                    body: JSON.stringify({
                        success: false,
                        verified: false,
                        error: 'Certification not found',
                        message: 'No valid certification found with the provided identifier'
                    })
                };
            }

            console.error('Database error:', error);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Verification failed',
                    message: error.message
                })
            };
        }

        // Check if expired
        const isExpired = certification.expires_at && new Date(certification.expires_at) < new Date();

        // Log successful verification
        await supabase.from('certification_verifications').insert({
            certification_id: certification.id,
            verifier_type: 'unknown',
            verification_method: code ? 'code' : 'certificate_number',
            verification_successful: true,
            notes: isExpired ? 'Certification found but expired' : 'Verification successful',
            ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
            user_agent: event.headers['user-agent']
        });

        // Prepare response (hide sensitive data)
        const response = {
            success: true,
            verified: !isExpired,
            expired: isExpired,
            certification: {
                certificate_number: certification.certificate_number,
                issued_at: certification.issued_at,
                expires_at: certification.expires_at,
                name: certification.certification_templates?.name,
                level: certification.certification_templates?.level,
                category: certification.certification_templates?.certification_categories?.name,
                domain: certification.certification_templates?.certification_categories?.domain,
                score_percentage: certification.score_percentage,
                skills_demonstrated: certification.skills_demonstrated
            },
            holder: {
                name: certification.user_foundations?.name || 'Certified Professional',
                username: certification.user_foundations?.username
            },
            verification: {
                verified_at: new Date().toISOString(),
                method: code ? 'verification_code' : 'certificate_number'
            }
        };

        if (isExpired) {
            response.message = 'This certification has expired. Please contact the holder for renewal status.';
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS
            },
            body: JSON.stringify(response)
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
