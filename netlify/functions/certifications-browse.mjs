/**
 * Netlify Function: Browse Certifications
 * 
 * Browse available certification templates by category, level, or search
 * 
 * Endpoint: /.netlify/functions/certifications-browse
 * Method: GET
 * 
 * Query Parameters:
 * - category: Filter by category slug
 * - level: Filter by level (Foundational, Intermediate, Advanced, Expert, Master)
 * - search: Search in name and description
 * - featured: true/false to show only featured certs
 * 
 * Response:
 * {
 *   "success": true,
 *   "certifications": [...],
 *   "count": 10
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
        const {
            category,
            level,
            search,
            featured
        } = params;

        // Build query
        let query = supabase
            .from('certification_templates')
            .select(`
                *,
                certification_categories (
                    id,
                    name,
                    slug,
                    domain,
                    icon,
                    color
                )
            `)
            .eq('active', true)
            .order('featured', { ascending: false })
            .order('name', { ascending: true });

        // Apply filters
        if (category) {
            query = query.eq('certification_categories.slug', category);
        }

        if (level) {
            query = query.eq('level', level);
        }

        if (featured === 'true') {
            query = query.eq('featured', true);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: certifications, error } = await query;

        if (error) {
            console.error('Database error:', error);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...CORS_HEADERS
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Failed to fetch certifications',
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
                certifications: certifications || [],
                count: certifications?.length || 0,
                filters_applied: {
                    category,
                    level,
                    search,
                    featured
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
