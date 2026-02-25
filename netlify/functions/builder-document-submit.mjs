// Builder Document Submission Handler
// Stores Mission Statement, Creed, Contribution Agreements
// Connects to Airtable as single source of truth

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appXXXXXXXXXXXXXX';
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Builders';

export async function handler(event) {
    // CORS headers
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
        const data = JSON.parse(event.body);
        const { document_type, email } = data;

        if (!email) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email is required' })
            };
        }

        // If Airtable is configured, use it
        if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID !== 'appXXXXXXXXXXXXXX') {
            return await submitToAirtable(data, headers);
        }

        // Fallback: Store in Cyclotron Brain via brain-api
        return await submitToCyclotron(data, headers);

    } catch (error) {
        console.error('Submission error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to save document', details: error.message })
        };
    }
}

async function submitToAirtable(data, headers) {
    const { document_type, email, name, discord, mission, commitment, creed_accepted,
            contribution_type, contribution_description, time_commitment, hourly_rate, payment_method, specialty } = data;

    // First, check if user exists (using Email Address field in Users table)
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?filterByFormula={Email Address}="${email}"`;

    const searchResponse = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    });

    const searchResult = await searchResponse.json();
    const existingRecord = searchResult.records?.[0];

    // Get existing Values JSON to preserve previous builder data
    let existingValues = {};
    if (existingRecord?.fields?.Values) {
        try {
            existingValues = JSON.parse(existingRecord.fields.Values);
        } catch (e) {
            existingValues = { raw: existingRecord.fields.Values };
        }
    }

    // Calculate level based on documents completed
    const getLevel = (existing, newLevel) => {
        const currentLevel = existing?.fields?.['Consciousness Score'] || 1;
        return Math.max(currentLevel, newLevel);
    };

    // Build the fields based on document type
    // Maps to existing Users table: Email Address, Full Name, Mission, Values, Status, Consciousness Score
    let fields = {};
    let builderData = { ...existingValues };

    switch (document_type) {
        case 'mission_statement':
            builderData.discord = discord || builderData.discord || '';
            builderData.commitment = commitment || builderData.commitment || '';
            builderData.mission_date = new Date().toISOString().split('T')[0];
            fields = {
                'Email Address': email,
                'Full Name': name || '',
                'Mission': mission || '',
                'Values': JSON.stringify(builderData),
                'Status': 'Pending',
                'Consciousness Score': getLevel(existingRecord, 2)
            };
            break;

        case 'creed':
            builderData.creed_accepted = true;
            builderData.creed_date = new Date().toISOString().split('T')[0];
            fields = {
                'Email Address': email,
                'Values': JSON.stringify(builderData),
                'Status': 'Approved',
                'Consciousness Score': getLevel(existingRecord, 3)
            };
            break;

        case 'builder_agreement':
            builderData.builder_agreement = true;
            builderData.contribution_type = contribution_type || '';
            builderData.contribution_description = contribution_description || '';
            builderData.time_commitment = time_commitment || '';
            builderData.builder_agreement_date = new Date().toISOString().split('T')[0];
            fields = {
                'Email Address': email,
                'Values': JSON.stringify(builderData),
                'Status': 'Builder',
                'Consciousness Score': getLevel(existingRecord, 4)
            };
            break;

        case 'paid_agreement':
            builderData.paid_agreement = true;
            builderData.hourly_rate = hourly_rate || 0;
            builderData.payment_method = payment_method || '';
            builderData.specialty = specialty || '';
            builderData.paid_agreement_date = new Date().toISOString().split('T')[0];
            fields = {
                'Email Address': email,
                'Values': JSON.stringify(builderData),
                'Status': 'Builder',
                'Consciousness Score': getLevel(existingRecord, 5)
            };
            break;
    }

    let airtableUrl, method;

    if (existingRecord) {
        // Update existing record
        airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${existingRecord.id}`;
        method = 'PATCH';
    } else {
        // Create new record
        airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
        method = 'POST';
    }

    // Add typecast=true to auto-create fields that don't exist
    const response = await fetch(airtableUrl, {
        method,
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields, typecast: true })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Airtable API error');
    }

    const result = await response.json();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: `${document_type} saved successfully`,
            level: fields['Consciousness Score'],
            record_id: result.id
        })
    };
}

async function submitToCyclotron(data, headers) {
    // Fallback: Store in Cyclotron Brain
    const { document_type, email } = data;

    const atomContent = JSON.stringify({
        ...data,
        stored_at: new Date().toISOString()
    });

    // Call brain-api to store
    try {
        const brainResponse = await fetch(`${process.env.URL || 'https://conciousnessrevolution.io'}/.netlify/functions/brain-api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'add',
                category: 'builder_document',
                content: atomContent,
                tags: [document_type, email, 'builder_tracking']
            })
        });

        if (brainResponse.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `${document_type} saved to Cyclotron Brain`,
                    storage: 'cyclotron'
                })
            };
        }
    } catch (e) {
        console.log('Cyclotron fallback failed:', e);
    }

    // Last resort: Just acknowledge receipt
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: `${document_type} received (configure Airtable for persistent storage)`,
            storage: 'pending_configuration'
        })
    };
}
