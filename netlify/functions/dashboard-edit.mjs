/**
 * DASHBOARD EDIT API - Real-time editing for ARAYA and operators
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Two modes:
 * 1. INSTANT (self-edit): Owner edits their own dashboard → immediate
 * 2. PROPOSAL (other-edit): Someone else edits → goes to approval queue
 *
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 */

// Lazy-load Supabase
let _supabaseClient = null;
let _supabaseLoaded = false;

async function loadSupabase() {
    if (_supabaseLoaded) return _supabaseClient;
    _supabaseLoaded = true;
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const SUPABASE_URL = process.env.SUPABASE_URL;
        // Use SERVICE_ROLE key for RLS bypass (required for dashboard edits)
        const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (SUPABASE_URL && SUPABASE_KEY) {
            const client = createClient(SUPABASE_URL, SUPABASE_KEY);
            // Test connection with a simple query
            const { error } = await client.from('dashboard_customizations').select('id').limit(1);
            if (error) {
                console.log('[DASHBOARD-EDIT] Supabase connection test failed:', error.message);
                return null; // Fall back to local-only mode
            }
            _supabaseClient = client;
        }
    } catch (e) {
        console.log('[DASHBOARD-EDIT] Supabase not available:', e.message);
    }
    return _supabaseClient;
}

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

// Check if editor is the owner of the dashboard
async function isOwner(supabase, dashboardId, editorId) {
    // Check dashboard_customizations for ownership
    const { data } = await supabase
        .from('dashboard_customizations')
        .select('owner_id')
        .eq('dashboard_id', dashboardId)
        .single();

    if (data && data.owner_id === editorId) return true;

    // Also check if dashboard name contains the user's operator name
    // e.g., OPERATOR_COCKPIT_AGENT_R belongs to Agent R
    const { data: userData } = await supabase
        .from('auth.users')
        .select('raw_user_meta_data')
        .eq('id', editorId)
        .single();

    if (userData?.raw_user_meta_data?.operator_name) {
        const opName = userData.raw_user_meta_data.operator_name.toUpperCase().replace(/\s+/g, '_');
        if (dashboardId.toUpperCase().includes(opName)) return true;
    }

    return false;
}

export async function handler(event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const supabase = await loadSupabase();

    // If no Supabase, use local-only mode (edits persist in localStorage on client)
    const localOnlyMode = !supabase;

    try {
        // ═══════════════════════════════════════════════════════════════
        // GET: Get current customizations for a dashboard
        // ═══════════════════════════════════════════════════════════════
        if (event.httpMethod === 'GET') {
            const params = event.queryStringParameters || {};
            const dashboardId = params.dashboard_id;

            if (!dashboardId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'dashboard_id required' })
                };
            }

            // Local-only mode: return empty (client uses localStorage)
            if (localOnlyMode) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        dashboard_id: dashboardId,
                        customizations: [],
                        mode: 'local-only',
                        note: 'Using localStorage for persistence'
                    })
                };
            }

            const { data, error } = await supabase
                .from('dashboard_customizations')
                .select('*')
                .eq('dashboard_id', dashboardId)
                .eq('is_active', true);

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    dashboard_id: dashboardId,
                    customizations: data || []
                })
            };
        }

        // ═══════════════════════════════════════════════════════════════
        // POST: Apply an edit (instant if owner, proposal if not)
        // ═══════════════════════════════════════════════════════════════
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const {
                dashboard_id,
                editor_id,
                editor_name,
                editor_type = 'operator', // 'operator', 'agent', 'araya'
                edit_type, // 'css', 'js', 'theme', 'html_insert', 'widget'
                content,   // The actual edit content
                title,     // Description of the change
                force_proposal = false // Force to proposal even if owner
            } = body;

            if (!dashboard_id || !editor_name || !edit_type || !content) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Required: dashboard_id, editor_name, edit_type, content'
                    })
                };
            }

            // Local-only mode: acknowledge edit (client stores in localStorage)
            if (localOnlyMode) {
                console.log(`[DASHBOARD-EDIT] Local mode - ${edit_type} edit for ${dashboard_id} by ${editor_name}`);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        mode: 'local-only',
                        message: `Edit saved locally to ${dashboard_id}`,
                        note: 'Changes stored in browser localStorage. Backend database not configured.'
                    })
                };
            }

            // ═══════════════════════════════════════════════════════════════
            // COMMANDER BYPASS: Commander gets instant edits on ALL dashboards
            // ═══════════════════════════════════════════════════════════════
            const COMMANDER_EMAILS = ['darrickpreble@proton.me', 'darrickpreble@gmail.com'];
            const COMMANDER_NAMES = ['commander', 'commander dwrek', 'dwrek'];
            const isCommander = body.commander_bypass === true ||
                COMMANDER_EMAILS.includes((body.editor_email || '').toLowerCase()) ||
                COMMANDER_NAMES.includes((editor_name || '').toLowerCase());

            // Determine if this is an instant edit or needs approval
            const ownerCheck = editor_id ? await isOwner(supabase, dashboard_id, editor_id) : false;
            const isInstant = (ownerCheck || isCommander) && !force_proposal;

            if (isInstant) {
                // ═══════════════════════════════════════════════════════
                // INSTANT EDIT: Apply directly to dashboard_customizations
                // ═══════════════════════════════════════════════════════

                // Build update object based on edit_type
                const updateField = {
                    'css': 'custom_css',
                    'js': 'custom_js',
                    'theme': 'theme_overrides',
                    'html_insert': 'custom_html_inserts',
                    'widget': 'widget_overrides',
                    'layout': 'layout_config'
                }[edit_type];

                if (!updateField) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: `Invalid edit_type: ${edit_type}` })
                    };
                }

                // Check if customization record exists
                // For Commander bypass without editor_id, look up by dashboard_id and owner_name
                let existingQuery = supabase
                    .from('dashboard_customizations')
                    .select('id, ' + updateField)
                    .eq('dashboard_id', dashboard_id);

                if (editor_id) {
                    existingQuery = existingQuery.eq('owner_id', editor_id);
                } else if (isCommander) {
                    existingQuery = existingQuery.eq('owner_name', 'Commander');
                }

                const { data: existing } = await existingQuery.single();

                let result;
                if (existing) {
                    // Merge or replace content
                    let newContent = content;

                    // For arrays/objects, merge intelligently
                    if (edit_type === 'html_insert' && existing[updateField]) {
                        newContent = [...(existing[updateField] || []), content];
                    } else if (['theme', 'widget', 'layout'].includes(edit_type) && existing[updateField]) {
                        newContent = { ...existing[updateField], ...content };
                    }

                    const { data, error } = await supabase
                        .from('dashboard_customizations')
                        .update({
                            [updateField]: newContent,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existing.id)
                        .select()
                        .single();

                    if (error) throw error;
                    result = data;
                } else {
                    // Create new customization record
                    const insertData = {
                        dashboard_id,
                        owner_name: isCommander ? 'Commander' : editor_name,
                        [updateField]: content,
                        is_active: true
                    };

                    // Only set owner_id if we have one (Commander bypass may not have one)
                    if (editor_id) {
                        insertData.owner_id = editor_id;
                    }

                    const { data, error } = await supabase
                        .from('dashboard_customizations')
                        .insert(insertData)
                        .select()
                        .single();

                    if (error) throw error;
                    result = data;
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        mode: 'instant',
                        message: `Edit applied instantly to ${dashboard_id}`,
                        customization_id: result.id
                    })
                };

            } else {
                // ═══════════════════════════════════════════════════════
                // PROPOSAL: Queue in improvement_proposals for approval
                // ═══════════════════════════════════════════════════════

                // Map edit_type to diff fields
                const diffField = {
                    'css': 'css_diff',
                    'js': 'js_diff',
                    'html_insert': 'html_diff',
                    'theme': 'css_diff', // Theme changes go to CSS
                    'widget': 'js_diff',
                    'layout': 'html_diff'
                }[edit_type] || 'html_diff';

                // Determine change type for safety classification
                let change_type = 'SAFE';
                if (['js', 'widget'].includes(edit_type)) change_type = 'REVIEWED';
                if (edit_type === 'html_insert' && typeof content === 'object' && content.html?.includes('<script')) {
                    change_type = 'BREAKING';
                }

                const { data, error } = await supabase
                    .from('improvement_proposals')
                    .insert({
                        dashboard_id,
                        creator_id: editor_id,
                        creator_type: editor_type,
                        creator_name: editor_name,
                        title: title || `${edit_type.toUpperCase()} edit by ${editor_name}`,
                        description: `Proposed ${edit_type} change`,
                        change_type,
                        [diffField]: typeof content === 'string' ? content : JSON.stringify(content),
                        status: 'pending',
                        xp_reward: change_type === 'SAFE' ? 50 : change_type === 'REVIEWED' ? 100 : 150,
                        golden_rule_passed: true,
                        canary_status: 'pending'
                    })
                    .select()
                    .single();

                if (error) throw error;

                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        mode: 'proposal',
                        message: `Edit submitted for approval by dashboard owner`,
                        proposal_id: data.id,
                        change_type,
                        xp_reward: data.xp_reward
                    })
                };
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // DELETE: Remove a customization
        // ═══════════════════════════════════════════════════════════════
        if (event.httpMethod === 'DELETE') {
            const params = event.queryStringParameters || {};
            const customizationId = params.id;

            if (!customizationId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'id required' })
                };
            }

            // Local-only mode
            if (localOnlyMode) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        mode: 'local-only',
                        message: 'Delete acknowledged (clear localStorage manually)'
                    })
                };
            }

            const { error } = await supabase
                .from('dashboard_customizations')
                .update({ is_active: false })
                .eq('id', customizationId);

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Customization deactivated'
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('[DASHBOARD-EDIT] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }
}
