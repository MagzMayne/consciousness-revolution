// Brain API - Full Cyclotron Brain Access for ARAYA
// Provides cloud access to 166K+ brain atoms via Supabase
// Endpoints: /status, /query, /context, /log, /sync

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Simple Supabase client (no SDK needed)
async function supabase(table, method, data = null, query = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    const options = {
        method: method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase error: ${error}`);
    }

    // For HEAD requests or count queries
    if (method === 'HEAD') {
        return { count: parseInt(response.headers.get('content-range')?.split('/')[1] || '0') };
    }

    if (method === 'GET' || method === 'POST') {
        return response.json();
    }
    return null;
}

// Get atom count with Prefer: count=exact
async function getAtomCount() {
    const url = `${SUPABASE_URL}/rest/v1/atoms?select=id`;
    const response = await fetch(url, {
        method: 'HEAD',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'count=exact'
        }
    });

    const range = response.headers.get('content-range');
    if (range) {
        const total = range.split('/')[1];
        return parseInt(total) || 0;
    }
    return 0;
}

// Search brain atoms by keyword
function scoreAtom(atom, query) {
    const content = (atom.content || '').toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    let score = 0;

    // Exact phrase match
    if (content.includes(queryLower)) score += 10;

    // Word matches
    for (const word of queryWords) {
        if (content.includes(word)) score += 2;
    }

    // Type weights - prioritize knowledge and patterns
    const typeWeights = {
        'knowledge': 1.5,
        'pattern': 1.4,
        'insight': 1.3,
        'concept': 1.2,
        'fact': 1.1,
        'ability': 1.0,
        'action': 0.9,
        'boot': 0.8
    };
    score *= typeWeights[atom.type] || 1;

    // Domain weights - prioritize consciousness domains
    const domainWeights = {
        '7_TRANSCEND': 1.3,
        '1_COMMAND': 1.2,
        '2_BUILD': 1.1,
        '4_PROTECT': 1.1
    };
    score *= domainWeights[atom.domain] || 1;

    return score;
}

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
};

export async function handler(event) {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    // Parse action from path or query
    const path = event.path.replace('/.netlify/functions/brain-api', '').replace('/api/brain-api', '');
    const action = path.split('/')[1] || event.queryStringParameters?.action || 'status';

    try {
        // Validate Supabase configuration
        if (!SUPABASE_URL || !SUPABASE_KEY) {
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Brain not configured',
                    details: 'Supabase credentials missing'
                })
            };
        }

        switch (action) {
            // GET /brain-api/status - Brain health and stats
            case 'status': {
                const atomCount = await getAtomCount();

                // Get latest atom timestamp (column is 'created' not 'created')
                const latest = await supabase(
                    'atoms',
                    'GET',
                    null,
                    '?select=created&order=created.desc&limit=1'
                );

                // Get type distribution (sample)
                const types = await supabase(
                    'atoms',
                    'GET',
                    null,
                    '?select=type&limit=1000'
                );

                const typeCount = {};
                if (types) {
                    types.forEach(a => {
                        typeCount[a.type] = (typeCount[a.type] || 0) + 1;
                    });
                }

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        status: 'online',
                        brain: 'cyclotron',
                        atom_count: atomCount,
                        last_sync: latest?.[0]?.created || null,
                        type_distribution: typeCount,
                        capabilities: ['query', 'context', 'log', 'sync'],
                        timestamp: new Date().toISOString()
                    })
                };
            }

            // GET /brain-api/query?q=keyword - Search atoms
            case 'query': {
                let query = '';
                let limit = 10;
                let type = null;
                let domain = null;

                if (event.httpMethod === 'POST') {
                    const body = JSON.parse(event.body || '{}');
                    query = body.query || body.q || '';
                    limit = Math.min(body.limit || 10, 50);
                    type = body.type;
                    domain = body.domain;
                } else {
                    query = event.queryStringParameters?.q || event.queryStringParameters?.query || '';
                    limit = Math.min(parseInt(event.queryStringParameters?.limit) || 10, 50);
                    type = event.queryStringParameters?.type;
                    domain = event.queryStringParameters?.domain;
                }

                if (!query) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Missing query parameter (q or query)' })
                    };
                }

                let atoms = [];
                let searchMethod = 'fts';

                // Strategy 1: Use Postgres full-text search (fast, uses GIN index)
                try {
                    // Convert query to tsquery format (words joined by &)
                    const tsQuery = query.trim().split(/\s+/).filter(w => w.length > 2).join(' & ');

                    if (tsQuery) {
                        let queryString = `?select=id,content,type,domain,created&limit=100`;

                        // Full-text search using the GIN index
                        queryString += `&content=fts.${encodeURIComponent(tsQuery)}`;

                        if (type) {
                            queryString += `&type=eq.${type}`;
                        }
                        if (domain) {
                            queryString += `&domain=eq.${domain}`;
                        }

                        queryString += '&order=created.desc';

                        atoms = await supabase('atoms', 'GET', null, queryString);
                    }
                } catch (ftsError) {
                    // FTS failed, try fallback
                    searchMethod = 'fallback';
                }

                // Strategy 2: If FTS returned nothing or failed, use filtered ILIKE (requires type or domain)
                if ((!atoms || atoms.length === 0) && (type || domain)) {
                    searchMethod = 'filtered_ilike';
                    let queryString = `?select=id,content,type,domain,created&limit=50`;

                    // Only search with ILIKE when we have a filter to reduce dataset
                    if (type) {
                        queryString += `&type=eq.${type}`;
                    }
                    if (domain) {
                        queryString += `&domain=eq.${domain}`;
                    }

                    // Use ILIKE only on filtered subset
                    queryString += `&content=ilike.*${encodeURIComponent(query)}*`;
                    queryString += '&order=created.desc';

                    try {
                        atoms = await supabase('atoms', 'GET', null, queryString);
                    } catch (ilikeError) {
                        atoms = [];
                    }
                }

                // Strategy 3: Last resort - get recent atoms and filter client-side
                if (!atoms || atoms.length === 0) {
                    searchMethod = 'recent_filter';
                    let queryString = `?select=id,content,type,domain,created&limit=500&order=created.desc`;

                    if (type) {
                        queryString += `&type=eq.${type}`;
                    }
                    if (domain) {
                        queryString += `&domain=eq.${domain}`;
                    }

                    const recentAtoms = await supabase('atoms', 'GET', null, queryString);

                    // Client-side filter
                    const queryLower = query.toLowerCase();
                    atoms = (recentAtoms || []).filter(a =>
                        a.content && a.content.toLowerCase().includes(queryLower)
                    );
                }

                // Re-score and sort by relevance
                const scored = (atoms || [])
                    .map(atom => ({ ...atom, score: scoreAtom(atom, query) }))
                    .filter(a => a.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit)
                    .map(({ score, ...atom }) => atom);

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        query,
                        count: scored.length,
                        atoms: scored,
                        search_method: searchMethod,
                        timestamp: new Date().toISOString()
                    })
                };
            }

            // GET /brain-api/context - Get recent session context
            case 'context': {
                const limit = Math.min(
                    parseInt(event.queryStringParameters?.limit) || 20,
                    100
                );
                const domain = event.queryStringParameters?.domain;

                let queryString = `?select=id,content,type,domain,created&order=created.desc&limit=${limit}`;

                if (domain) {
                    queryString += `&domain=eq.${domain}`;
                }

                const atoms = await supabase('atoms', 'GET', null, queryString);

                // Group by type for context summary
                const byType = {};
                (atoms || []).forEach(atom => {
                    if (!byType[atom.type]) byType[atom.type] = [];
                    byType[atom.type].push(atom);
                });

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        context: {
                            recent_atoms: atoms || [],
                            by_type: byType,
                            total: atoms?.length || 0
                        },
                        timestamp: new Date().toISOString()
                    })
                };
            }

            // POST /brain-api/log - Log new interaction to brain
            case 'log': {
                if (event.httpMethod !== 'POST') {
                    return {
                        statusCode: 405,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'POST required for logging' })
                    };
                }

                const body = JSON.parse(event.body || '{}');
                const { content, type = 'interaction', domain = 'ARAYA', metadata = {} } = body;

                if (!content) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'content required' })
                    };
                }

                const atom = {
                    content,
                    type,
                    domain,
                    source: 'cloud_araya',
                    metadata: JSON.stringify(metadata),
                    created: new Date().toISOString()
                };

                const result = await supabase('atoms', 'POST', atom);

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: true,
                        atom_id: result?.[0]?.id,
                        timestamp: new Date().toISOString()
                    })
                };
            }

            // GET /brain-api/sync - Get atoms for local sync (paginated)
            case 'sync': {
                const limit = Math.min(
                    parseInt(event.queryStringParameters?.limit) || 100,
                    500
                );
                const offset = parseInt(event.queryStringParameters?.offset) || 0;
                const since = event.queryStringParameters?.since; // ISO date string

                let queryString = `?select=id,content,type,domain,created&order=created.desc&limit=${limit}&offset=${offset}`;

                if (since) {
                    queryString += `&created=gt.${since}`;
                }

                const atoms = await supabase('atoms', 'GET', null, queryString);
                const totalCount = await getAtomCount();

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        atoms: atoms || [],
                        pagination: {
                            limit,
                            offset,
                            returned: atoms?.length || 0,
                            total: totalCount,
                            has_more: offset + (atoms?.length || 0) < totalCount
                        },
                        timestamp: new Date().toISOString()
                    })
                };
            }

            // GET /brain-api/domains - Get domain statistics
            case 'domains': {
                // Get sample of atoms to calculate domain distribution
                const sample = await supabase(
                    'atoms',
                    'GET',
                    null,
                    '?select=domain&limit=5000'
                );

                const domainCount = {};
                (sample || []).forEach(a => {
                    if (a.domain) {
                        domainCount[a.domain] = (domainCount[a.domain] || 0) + 1;
                    }
                });

                // Sort by count
                const sorted = Object.entries(domainCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([domain, count]) => ({ domain, count }));

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        domains: sorted,
                        total_sampled: sample?.length || 0,
                        timestamp: new Date().toISOString()
                    })
                };
            }

            // GET /brain-api/types - Get type statistics
            case 'types': {
                const sample = await supabase(
                    'atoms',
                    'GET',
                    null,
                    '?select=type&limit=5000'
                );

                const typeCount = {};
                (sample || []).forEach(a => {
                    if (a.type) {
                        typeCount[a.type] = (typeCount[a.type] || 0) + 1;
                    }
                });

                const sorted = Object.entries(typeCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => ({ type, count }));

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        types: sorted,
                        total_sampled: sample?.length || 0,
                        timestamp: new Date().toISOString()
                    })
                };
            }

            // GET /brain-api/recent - Get most recent atoms
            case 'recent': {
                const limit = Math.min(
                    parseInt(event.queryStringParameters?.limit) || 20,
                    100
                );

                const atoms = await supabase(
                    'atoms',
                    'GET',
                    null,
                    `?select=id,content,type,domain,created&order=created.desc&limit=${limit}`
                );

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        atoms: atoms || [],
                        count: atoms?.length || 0,
                        timestamp: new Date().toISOString()
                    })
                };
            }

            default:
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        error: 'Unknown action',
                        available_actions: ['status', 'query', 'context', 'log', 'sync', 'domains', 'types', 'recent'],
                        usage: {
                            status: 'GET /brain-api/status',
                            query: 'GET /brain-api/query?q=keyword&limit=10',
                            context: 'GET /brain-api/context?limit=20',
                            log: 'POST /brain-api/log { content, type, domain }',
                            sync: 'GET /brain-api/sync?limit=100&offset=0',
                            domains: 'GET /brain-api/domains',
                            types: 'GET /brain-api/types',
                            recent: 'GET /brain-api/recent?limit=20'
                        }
                    })
                };
        }

    } catch (error) {
        console.error('Brain API Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: error.message,
                action,
                timestamp: new Date().toISOString()
            })
        };
    }
}
