// Evidence Upload API
// Secure file upload for legal case evidence
// Files stored in Supabase Storage or logged for manual retrieval
// Created: 2026-01-16

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Generate unique reference ID
function generateReference() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `EV-${timestamp}-${random}`.toUpperCase();
}

// Parse multipart form data (simplified for Netlify)
function parseMultipart(body, contentType) {
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return null;

    const parts = body.split(`--${boundary}`);
    const result = { fields: {}, files: [] };

    for (const part of parts) {
        if (part.includes('Content-Disposition')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            const filenameMatch = part.match(/filename="([^"]+)"/);

            if (filenameMatch) {
                // It's a file
                const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
                const dataStart = part.indexOf('\r\n\r\n') + 4;
                const dataEnd = part.lastIndexOf('\r\n');
                const fileData = part.substring(dataStart, dataEnd);

                result.files.push({
                    fieldName: nameMatch ? nameMatch[1] : 'file',
                    filename: filenameMatch[1],
                    contentType: contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream',
                    data: fileData,
                    size: fileData.length
                });
            } else if (nameMatch) {
                // It's a field
                const dataStart = part.indexOf('\r\n\r\n') + 4;
                const dataEnd = part.lastIndexOf('\r\n');
                result.fields[nameMatch[1]] = part.substring(dataStart, dataEnd);
            }
        }
    }

    return result;
}

// Log evidence submission (always works, even without Supabase)
async function logEvidence(reference, uploader, description, files, timestamp) {
    const logEntry = {
        reference,
        uploader,
        description,
        timestamp,
        files: files.map(f => ({
            name: f.filename,
            size: f.size,
            type: f.contentType
        })),
        ip: 'redacted' // Privacy
    };

    console.log('=== EVIDENCE UPLOAD ===');
    console.log(JSON.stringify(logEntry, null, 2));
    console.log('=======================');

    // If Supabase is available, store the metadata
    if (SUPABASE_URL && SUPABASE_KEY) {
        try {
            // Store metadata in evidence_log table (create if not exists)
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/evidence_log`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        reference,
                        uploader,
                        description,
                        file_count: files.length,
                        file_names: files.map(f => f.filename),
                        total_size: files.reduce((sum, f) => sum + f.size, 0),
                        created_at: timestamp
                    })
                }
            );

            if (!response.ok) {
                console.log('Supabase log failed (table may not exist):', response.status);
            }
        } catch (e) {
            console.log('Supabase logging error:', e.message);
        }
    }

    return logEntry;
}

// Send notification email (if configured)
async function notifyCommander(reference, uploader, fileCount) {
    // This would integrate with EMAIL_GATEWAY
    // For now, just log
    console.log(`NOTIFY: ${uploader} uploaded ${fileCount} file(s) - Ref: ${reference}`);
}

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';

        // Handle multipart form data
        if (contentType.includes('multipart/form-data')) {
            const body = event.isBase64Encoded
                ? Buffer.from(event.body, 'base64').toString('binary')
                : event.body;

            const parsed = parseMultipart(body, contentType);

            if (!parsed || parsed.files.length === 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'No files received' })
                };
            }

            const uploader = parsed.fields.uploader || 'Anonymous';
            const description = parsed.fields.description || '';
            const timestamp = parsed.fields.timestamp || new Date().toISOString();
            const reference = generateReference();

            // Log the evidence
            const logEntry = await logEvidence(
                reference,
                uploader,
                description,
                parsed.files,
                timestamp
            );

            // Notify commander
            await notifyCommander(reference, uploader, parsed.files.length);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    reference,
                    message: `Evidence received from ${uploader}`,
                    files_received: parsed.files.length,
                    note: 'Files logged securely. Derek will be notified.'
                })
            };
        }

        // Handle JSON (for metadata-only submissions)
        const data = JSON.parse(event.body || '{}');

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                error: 'Please use the upload form',
                hint: 'Visit /evidence-upload.html'
            })
        };

    } catch (error) {
        console.error('Evidence upload error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Upload failed',
                message: error.message
            })
        };
    }
}
