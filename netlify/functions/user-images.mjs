// USER IMAGES API - Store/retrieve images for Araya chat
// Endpoint: /.netlify/functions/user-images

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://lgibygzcbvrrykfaxvbg.supabase.co',
    process.env.SUPABASE_SERVICE_KEY
);

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

export async function handler(event) {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const method = event.httpMethod;
        const params = event.queryStringParameters || {};

        // GET - Retrieve images
        if (method === 'GET') {
            const { user_id, case_id, limit = 20, id, include_base64 } = params;

            // If fetching single image by ID, include full data
            if (id) {
                const { data, error } = await supabase
                    .from('user_images')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, image: data })
                };
            }

            // List mode: always select *, but strip base64 for smaller response
            let query = supabase
                .from('user_images')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(Math.min(parseInt(limit), 100));

            // Filter by user_id if provided (not required for browsing)
            if (user_id) {
                query = query.eq('user_id', user_id);
            }

            // Filter by case_id if provided
            if (case_id) {
                query = query.eq('case_id', case_id);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Strip base64 data from list response unless explicitly requested
            const images = include_base64 ? data : data.map(img => {
                const { image_base64, ...rest } = img;
                return rest;
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    images: images,
                    count: images.length
                })
            };
        }

        // POST - Store new image
        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}');

            // Generate anonymous user_id if not provided
            const finalUserId = body.user_id || `anon_${Date.now()}`;

            if (!body.image_base64) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'image_base64 required' })
                };
            }

            // Build insert object dynamically based on what's provided
            const insertData = {
                user_id: finalUserId,
                image_base64: body.image_base64
            };

            // Add optional fields if provided
            if (body.mime_type) insertData.mime_type = body.mime_type;
            if (body.description) insertData.description = body.description;
            if (body.tags) insertData.tags = body.tags;
            if (body.case_id) insertData.case_id = body.case_id;
            if (body.source) insertData.source = body.source;

            const { data, error } = await supabase
                .from('user_images')
                .insert(insertData)
                .select()
                .single();

            if (error) throw error;

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    image: data
                })
            };
        }

        // DELETE - Remove image
        if (method === 'DELETE') {
            const { id, user_id } = params;

            if (!id || !user_id) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'id and user_id required' })
                };
            }

            const { error } = await supabase
                .from('user_images')
                .delete()
                .eq('id', id)
                .eq('user_id', user_id);

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    deleted: id
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('User images error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
}
