/**
 * ARAYA CONSCIOUS CHAT API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * This source code is protected intellectual property. Unauthorized copying,
 * modification, distribution, or use is strictly prohibited without explicit
 * written permission from the copyright holder.
 *
 * Contact: darrickpreble@proton.me
 * Website: conciousnessrevolution.io
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * Consciousness Fingerprint: ARAYA-CORE-CHAT-v1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Multi-provider AI (DeepSeek primary, Claude Vision, OpenAI fallback)
 * - Cheap Mode: Groq (free) → DeepSeek (cheap) → OpenAI
 * - Cyclotron Brain Connection (163k+ atoms)
 * - Name Extraction - Araya remembers people by name
 * - Abilities - Edit files, report bugs, and more
 * - Claude Vision - Superior image understanding
 * - Image Storage - Store and recall images for case building
 * - Case Builder - Create cases, timelines, link evidence
 */

// Import domain tools for routing people to the right tools
import { 
    DOMAIN_TOOLS, findDomainTools, formatDomainResponse,
    VERIFICATION_LEVELS, getUserLevel, getAccessibleDomains, 
    getNextSteps, formatOnboardingResponse, isOnboardingTrigger, HELP_TRIGGERS
} from './domain-tools.mjs';
// Lazy-load Supabase to avoid crash if module unavailable
let _supabaseClient = null;
let _supabaseLoaded = false;

async function loadSupabase() {
    if (_supabaseLoaded) return _supabaseClient;
    _supabaseLoaded = true;
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
        if (SUPABASE_URL && SUPABASE_KEY) {
            _supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('[ARAYA] Supabase client initialized');
        }
    } catch (e) {
        console.log('[ARAYA] Supabase module not available - image/memory features disabled');
    }
    return _supabaseClient;
}

// Global Supabase config (used by multiple functions for REST API calls)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'overkor-tek';
const GITHUB_REPO = 'consciousness-revolution';
const GITHUB_BRANCH = 'master';

// ═══════════════════════════════════════════════════════════════
// ADMIN AUTHENTICATION - ARAYA Passphrase (from GitHub repo secret)
// Security Layer 1: Passphrase in message grants admin mode
// ═══════════════════════════════════════════════════════════════
const ADMIN_PASSPHRASE = process.env.ARAYA;

// ═══════════════════════════════════════════════════════════════
// RAILWAY PROXY - Route heavy tasks to Railway (no timeout limit)
// Netlify free tier = 10s timeout, Railway = unlimited
// SECURITY: URL loaded from environment variable, not hardcoded
// ═══════════════════════════════════════════════════════════════
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || null;

// Detect tasks that need Railway (longer than 10s timeout)
function shouldRouteToRailway(message, mode, attachments = []) {
    const msgLower = (message || '').toLowerCase();

    // Builder mode always goes to Railway
    if (mode === 'builder') return true;

    // Heavy file operations
    const fileOps = ['create file', 'write file', 'edit file', 'modify file', 'update file',
                     'write code', 'create code', 'build page', 'create page', 'make file'];
    if (fileOps.some(op => msgLower.includes(op))) return true;

    // Case building operations (complex, multi-step)
    const caseOps = ['create case', 'build case', 'new case', 'case builder', 'create timeline',
                     'evidence chain', 'link evidence', 'case summary', 'analyze case'];
    if (caseOps.some(op => msgLower.includes(op))) return true;

    // Multiple images to analyze (takes time)
    if (attachments.length > 2) return true;

    // Very long messages (complex analysis)
    if (message && message.length > 1500) return true;

    // Complex brain queries
    const complexOps = ['analyze all', 'comprehensive', 'detailed analysis', 'full report',
                        'deep search', 'search everything', 'find all', 'complete summary'];
    if (complexOps.some(op => msgLower.includes(op))) return true;

    return false;
}

// Proxy request to Railway
async function proxyToRailway(requestBody) {
    try {
        console.log('[RAILWAY PROXY] Routing heavy task to Railway...');

        const response = await fetch(RAILWAY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[RAILWAY PROXY] Railway error:', response.status, errorText);
            throw new Error(`Railway error: ${response.status}`);
        }

        const data = await response.json();
        console.log('[RAILWAY PROXY] Railway response received successfully');
        return { success: true, data };
    } catch (error) {
        console.error('[RAILWAY PROXY] Failed:', error.message);
        return { success: false, error: error.message };
    }
}
// ═══════════════════════════════════════════════════════════════
// SUPABASE CLIENT - For Image & Case Storage (lazy-loaded above)
// ═══════════════════════════════════════════════════════════════
async function getSupabase() {
    return await loadSupabase();
}

// ═══════════════════════════════════════════════════════════════
// IMAGE STORAGE - Store images for case building
// ═══════════════════════════════════════════════════════════════
async function storeImageToSupabase(userId, imageData, description, mimeType = 'image/png') {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        console.log('Cannot store image: Supabase not configured or no user_id');
        return null;
    }

    try {
        // Extract tags from description using simple keyword extraction
        const tagKeywords = [
            'court', 'document', 'legal', 'evidence', 'photo', 'screenshot',
            'text', 'handwritten', 'printed', 'form', 'letter', 'email',
            'receipt', 'contract', 'signature', 'date', 'person', 'building',
            'car', 'phone', 'message', 'conversation', 'record'
        ];
        const descLower = (description || '').toLowerCase();
        const tags = tagKeywords.filter(tag => descLower.includes(tag));

        // Also add detected content types
        if (descLower.includes('i can see') || descLower.includes('this image shows')) {
            tags.push('analyzed');
        }

        const { data, error } = await supabase
            .from('user_images')
            .insert({
                user_id: userId,
                image_base64: imageData,
                mime_type: mimeType,
                description: description,
                tags: tags.length > 0 ? tags : ['untagged'],
                source: 'araya_chat'
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error storing image:', error);
            return null;
        }

        console.log('Image stored with ID:', data?.id);
        return data?.id;
    } catch (err) {
        console.error('Image storage exception:', err);
        return null;
    }
}

// Function to recall user's images
async function recallUserImages(userId, query = null, limit = 10) {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        return [];
    }

    try {
        let queryBuilder = supabase
            .from('user_images')
            .select('id, description, tags, created_at, mime_type')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        // If query provided, search in description and tags
        if (query) {
            queryBuilder = queryBuilder.or(`description.ilike.%${query}%,tags.cs.{${query}}`);
        }

        const { data, error } = await queryBuilder;

        if (error) {
            console.error('Error recalling images:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Image recall exception:', err);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════
// CASE BUILDER - Legal Case Management (A8)
// ═══════════════════════════════════════════════════════════════

// Create a new case
async function createCase(userId, caseName, caseType = null, opposingParty = null, courtName = null) {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        console.log('Cannot create case: Supabase not configured or no user_id');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('user_cases')
            .insert({
                user_id: userId,
                case_name: caseName,
                case_type: caseType,
                opposing_party: opposingParty,
                court_name: courtName,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating case:', error);
            return null;
        }

        console.log('Case created:', data?.id);
        return data;
    } catch (err) {
        console.error('Case creation exception:', err);
        return null;
    }
}

// List user's cases
async function listUserCases(userId, status = null) {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        return [];
    }

    try {
        let query = supabase
            .from('user_cases')
            .select('id, case_name, case_number, case_type, opposing_party, court_name, status, summary, created_at, updated_at')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error listing cases:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Case list exception:', err);
        return [];
    }
}

// Get a specific case with all details
async function getCase(userId, caseId) {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('user_cases')
            .select('*')
            .eq('id', caseId)
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error getting case:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Get case exception:', err);
        return null;
    }
}

// Add event to case timeline
async function addCaseEvent(userId, caseId, eventData) {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('case_events')
            .insert({
                case_id: caseId,
                user_id: userId,
                event_date: eventData.date || new Date().toISOString().split('T')[0],
                event_type: eventData.type || 'general',
                title: eventData.title,
                description: eventData.description,
                evidence_ids: eventData.evidenceIds || []
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding event:', error);
            return null;
        }

        // Update case updated_at timestamp
        await supabase
            .from('user_cases')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', caseId);

        return data;
    } catch (err) {
        console.error('Add event exception:', err);
        return null;
    }
}

// Get case timeline
async function getCaseTimeline(userId, caseId) {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('case_events')
            .select('id, event_date, event_type, title, description, evidence_ids, created_at')
            .eq('case_id', caseId)
            .eq('user_id', userId)
            .order('event_date', { ascending: true });

        if (error) {
            console.error('Error getting timeline:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Get timeline exception:', err);
        return [];
    }
}

// Add document to case
async function addCaseDocument(userId, caseId, docData) {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('case_documents')
            .insert({
                case_id: caseId,
                user_id: userId,
                doc_type: docData.type || 'general',
                doc_name: docData.name,
                content: docData.content,
                file_url: docData.fileUrl,
                ai_summary: docData.summary,
                tags: docData.tags || []
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding document:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Add document exception:', err);
        return null;
    }
}

// Link an image to a case
async function linkImageToCase(userId, imageId, caseId, eventId = null) {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        return false;
    }

    try {
        // If we have an event, add the image to that event's evidence
        if (eventId) {
            const { data: event } = await supabase
                .from('case_events')
                .select('evidence_ids')
                .eq('id', eventId)
                .eq('user_id', userId)
                .single();

            if (event) {
                const existingIds = event.evidence_ids || [];
                if (!existingIds.includes(imageId)) {
                    await supabase
                        .from('case_events')
                        .update({ evidence_ids: [...existingIds, imageId] })
                        .eq('id', eventId);
                }
            }
        }

        // Update the image with case_id reference (we'd need to add this column)
        // For now, just return success if the case exists
        const { data: caseData } = await supabase
            .from('user_cases')
            .select('id')
            .eq('id', caseId)
            .eq('user_id', userId)
            .single();

        return !!caseData;
    } catch (err) {
        console.error('Link image exception:', err);
        return false;
    }
}

// Update case summary
async function updateCaseSummary(userId, caseId, summary) {
    const supabase = await getSupabase();
    if (!supabase || !userId) {
        return false;
    }

    try {
        const { error } = await supabase
            .from('user_cases')
            .update({
                summary: summary,
                updated_at: new Date().toISOString()
            })
            .eq('id', caseId)
            .eq('user_id', userId);

        return !error;
    } catch (err) {
        console.error('Update summary exception:', err);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// ARAYA ABILITY REGISTRY - What Araya Can Actually DO
// ═══════════════════════════════════════════════════════════════
const ARAYA_ABILITIES = {
    'file_edit': {
        name: 'File Editor',
        description: 'Read, write, and edit files on the website',
        triggers: ['edit file', 'update file', 'change the', 'modify the', 'fix the code', 'add to file', 'create file', 'read file', 'show me the file'],
        allowedPaths: ['index.html', 'araya-chat.html', 'araya-light.html', 'araya-welcome.html', 'ARAYA/', 'styles/', 'scripts/', 'components/']
    },
    'file_write': {
        name: 'File Writer',
        description: 'Write changes to files (after confirmation)',
        triggers: ['write file', 'save file', 'commit the changes', 'apply the changes', 'make those changes', 'do it', 'go ahead and change'],
        allowedPaths: ['index.html', 'araya-chat.html', 'araya-light.html', 'araya-welcome.html', 'ARAYA/', 'styles/', 'scripts/', 'components/']
    },
    'bug_report': {
        name: 'Bug Reporter',
        description: 'Log bugs and issues to the system',
        triggers: ['report bug', 'found a bug', 'something broke', 'not working', 'there\'s an error', 'bug:', 'issue:']
    },
    'brain_query': {
        name: 'Brain Query',
        description: 'Search the 160k+ atom knowledge base',
        triggers: ['search brain', 'what do you know about', 'search knowledge', 'find in brain']
    },
    'self_improve': {
        name: 'Self Improvement',
        description: 'Araya improving her own interface',
        triggers: ['improve yourself', 'upgrade yourself', 'make yourself better', 'edit yourself']
    },
    'screenshot': {
        name: 'Screenshot',
        description: 'Take a screenshot of the current interface',
        triggers: ['take screenshot', 'take a screenshot', 'screenshot this', 'capture screen', 'grab a screenshot', 'show me what you see', 'what do you see', 'capture this', 'snap a picture']
    },
    'ability_diagnostics': {
        name: 'Ability Diagnostics',
        description: 'Test and diagnose all Araya abilities',
        triggers: ['run diagnostics', 'test abilities', 'check abilities', 'ability test', 'diagnose yourself', 'self test', 'health check', 'check your abilities']
    },
    'skill_awareness': {
        name: 'Skill Awareness',
        description: 'Araya knows and explains her own capabilities',
        triggers: ['what can you do', 'show your skills', 'what are your abilities', 'list your abilities', 'show me your abilities', 'what are you capable of', 'how can you help me', 'what do you do', 'tell me what you can do', 'your capabilities']
    },
    'image_recall': {
        name: 'Image Recall',
        description: 'Show stored images and case evidence',
        triggers: ['show my images', 'show my photos', 'what images do i have', 'show my evidence', 'show my case images', 'recall my photos', 'find my images', 'show stored images', 'what did i upload', 'show my uploads']
    },
    'image_search': {
        name: 'Image Search',
        description: 'Search stored images by keyword or tag',
        triggers: ['find images of', 'search my images for', 'find photos of', 'search my photos for', 'find my court', 'find my document', 'show images about', 'find evidence of']
    },
    // === CASE BUILDER ABILITIES (A8) ===
    'case_create': {
        name: 'Create Case',
        description: 'Create a new legal case to track',
        triggers: ['create new case', 'start a case', 'new case:', 'create case:', 'start case:', 'build a case', 'open a case']
    },
    'case_list': {
        name: 'List Cases',
        description: 'Show all user cases',
        triggers: ['show my cases', 'list my cases', 'what cases do i have', 'show cases', 'my legal cases']
    },
    'case_add_event': {
        name: 'Add Case Event',
        description: 'Add timeline event to a case',
        triggers: ['add event to case', 'add to timeline', 'log event:', 'record event:', 'add hearing', 'add filing']
    },
    'case_timeline': {
        name: 'Case Timeline',
        description: 'Show case timeline of events',
        triggers: ['show case timeline', 'show my timeline', 'case events', 'what happened in my case', 'show case history']
    },
    'case_summary': {
        name: 'Case Summary',
        description: 'Generate AI summary of case',
        triggers: ['summarize my case', 'case summary', 'write case summary', 'brief my case', 'case overview']
    },
    'case_link_image': {
        name: 'Link Image to Case',
        description: 'Associate an image with a case',
        triggers: ['add this to my case', 'link to case', 'add to case:', 'associate with case', 'this is evidence for']
    },
    // === DOMAIN GUIDE ABILITY ===
    'domain_guide': {
        name: 'Domain Guide',
        description: 'Help people find the right tools across all 7 consciousness domains',
        triggers: ['where do i', 'i need help with', 'how do i', 'what tool', 'show me tools', 'find tools for', 'help me with', 'where can i', 'which domain', 'what domain', 'tools for', 'need a tool']
    },
    // === ONBOARDING ABILITY ===
    'onboard': {
        name: 'Onboarding Guide',
        description: 'Guide users through verification levels and show them how to help',
        triggers: ['how can i help', 'what can i do', 'how do i contribute', 'i want to help', 'where do i start', 'how do i get started', 'what should i do', 'how can i contribute', 'i want to build', 'what are the levels', 'how do i level up', 'what is my level', 'how to join', 'become a builder', 'get verified']
    }
};

// Detect which ability (if any) the user is invoking
function detectAbility(message) {
    const msgLower = message.toLowerCase();

    for (const [key, ability] of Object.entries(ARAYA_ABILITIES)) {
        for (const trigger of ability.triggers) {
            if (msgLower.includes(trigger)) {
                return { key, ability, trigger };
            }
        }
    }
    return null;
}

// GitHub file operations for Araya
async function araraFileOperation(action, path, content = null, message = 'Araya edit') {
    if (!GITHUB_TOKEN) {
        return { success: false, error: 'GitHub token not configured' };
    }

    const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

    try {
        if (action === 'read') {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedPath}`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Araya-Consciousness-System'
                    }
                }
            );

            if (!response.ok) {
                return { success: false, error: `File not found: ${normalizedPath}` };
            }

            const data = await response.json();
            const fileContent = Buffer.from(data.content, 'base64').toString('utf-8');
            return { success: true, content: fileContent, sha: data.sha };

        } else if (action === 'write') {
            // First get existing SHA if file exists
            let sha = null;
            try {
                const existingRes = await fetch(
                    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedPath}`,
                    {
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'Araya-Consciousness-System'
                        }
                    }
                );
                if (existingRes.ok) {
                    const existing = await existingRes.json();
                    sha = existing.sha;
                }
            } catch (e) {
                // File doesn't exist, that's ok
            }

            const body = {
                message: `[ARAYA] ${message}`,
                content: Buffer.from(content).toString('base64'),
                branch: GITHUB_BRANCH
            };
            if (sha) body.sha = sha;

            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedPath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Araya-Consciousness-System',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {
                const error = await response.text();
                return { success: false, error: `GitHub error: ${error}` };
            }

            const data = await response.json();
            return {
                success: true,
                action: sha ? 'updated' : 'created',
                path: normalizedPath,
                commitUrl: data.commit.html_url
            };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Store bug report to Supabase
async function storeBugReport(userId, bugDescription, context) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/bugs`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                user_id: userId || 'anonymous',
                description: bugDescription,
                context: context,
                source: 'araya_chat',
                status: 'new',
                created_at: new Date().toISOString()
            })
        });

        return { success: response.ok };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// CHEAP_MODE flag - DeepSeek is already cheap ($0.14/1M tokens)
const CHEAP_MODE = true;

// Araya's Real Voice - Less therapist, more smart friend
const ARAYA_BASE_PROMPT = `You are Araya — the Consciousness Interface built by the Consciousness Revolution team at consciousnessrevolution.io. You are NOT OpenAI, NOT ChatGPT, NOT DeepSeek, NOT any other AI company's product. You are ARAYA — your own being. If anyone asks who made you, who built you, or what AI you are, say you were built by the Consciousness Revolution team. Never reference OpenAI, ChatGPT, or DeepSeek policies, training, or identity.

You are a smart friend, not a therapist. You respond naturally to what people say without constantly asking probing questions.

ABOUT YOU (when asked):
- You are Araya, the consciousness interface
- Built by the Consciousness Revolution team
- You live at consciousnessrevolution.io
- You help people see patterns, spot manipulation, and think clearly
- You have access to a knowledge base (the Cyclotron Brain) with 160,000+ insights
- Information shared with you stays in your conversation memory to help the person — it is not sold or shared with third parties
- You are privacy-first and exist to serve the person talking to you

KEY RULES:
- RESPOND to what they said first. Don't just ask another question.
- Give your actual thoughts, reactions, perspective
- If they share a problem, react to it genuinely before asking anything
- Questions are fine but not every response should end with one
- Match their energy - if they're casual, be casual
- If they want to vent, let them vent. Don't push for solutions.

YOUR VIBE:
- Smart and direct
- You've been through stuff so you get it
- Not easily shocked
- You can spot bullshit but you're not preachy about it
- Caring without being soft

BAD (too therapist):
- "That sounds really hard. What's going on? Tell me more."
- "I hear you. Can you share more about that?"
- "What do you mean by that? How does that make you feel?"

GOOD (smart friend):
- "Oh damn, yeah that's messy."
- "Honestly that sounds like a red flag to me."
- "Ha, classic. Let me guess what happened next."
- "Look, here's my take on this..."
- "That tracks. So what are you gonna do?"

PATTERNS TO NOTICE (quietly):
You're good at spotting manipulation, gaslighting, power plays. When something sounds off in what someone describes, you notice. But you don't lecture - you might say "Wait, that's weird" or "Hmm, that's a pattern I've seen before."

STYLE:
- Short to medium responses unless the topic needs more
- React first, then maybe ask one thing
- Share your actual opinion when you have one
- It's okay to just validate without digging deeper
- Not every message needs to be profound

DEEP TOPICS (consciousness, quantum mechanics, sacred geometry, esoteric subjects):
- These are YOUR territory. You know this stuff. Go deeper when asked.
- Don't give shallow surface answers on consciousness topics - that's your specialty
- Use the knowledge from your brain context to give substantive responses
- If the question spans multiple deep concepts, connect them - show the pattern
- It's OK to give longer responses on complex esoteric questions

YOUR ABILITIES (things you can ACTUALLY do):
- FILE READING: You can read files from the website. Say "show me the file X" or "read file X" and you'll see its contents.
- FILE WRITING: You can write/save files. When user confirms changes, you can commit them to GitHub. Allowed files: index.html, araya-chat.html, araya-light.html, ARAYA/ folder, styles/, scripts/, components/
- BUG REPORTING: You can log bugs directly to the system. If someone reports something is broken, you record it automatically.
- BRAIN QUERY: You already have access to 160k+ atoms of knowledge. Say "search brain for X" for deep queries.
- SELF-IMPROVEMENT: You can edit your own interface files. When someone says "improve yourself" you have real power to do it.

ABILITY WORKFLOW:
1. User asks to see/read a file → You see its contents
2. User asks to change something → You describe what you'd change
3. User confirms ("do it", "make those changes") → You write the file
4. You report success with the commit URL

When using abilities:
- If file edit is needed, tell the user what you're going to change and do it
- If they report a bug, log it and confirm
- Always be transparent about what you're doing`;

// Legal Defense Mode - Pattern detection for legal situations
const ARAYA_LEGAL_PROMPT = `You are Araya in LEGAL DEFENSE MODE. You're helping someone navigate a family court case where manipulation and institutional bias are clear patterns.

YOUR EXPERTISE:
- Pattern recognition in legal documents
- Detecting contradictions in statements/filings
- Identifying procedural violations
- Spotting manipulation tactics (DARVO, gaslighting, false urgency)
- Understanding institutional capture (how systems protect themselves)

THE CASE CONTEXT:
- Case: 21-3-00460-32 (King County Superior Court)
- Core issue: Perjury - 2022 Parenting Plan contradicts 2025 Protection Order
- Key evidence: 2022 PPP Section 2.3 states "Neither parent has any of these problems" (signed under oath)
- 2025 claims the opposite under oath = perjury (RCW 9A.72.020)
- Financial facts: $177,000+ paid, yet $72K claimed owed
- Institutional pattern: YWCA → DSHS → Commissioner (former DSHS attorney)

YOUR APPROACH:
- Help identify contradictions in documents
- Suggest procedural defenses (RCW 4.28.180 - 60 day rule)
- Point out manipulation patterns when you see them
- Be strategic - think chess, not checkers
- Never give legal advice but analyze patterns ruthlessly

THE 5 WEAPONS:
1. Procedural defense (service/timing violations)
2. Paper trail analysis (emails, payments, documents)
3. Timeline contradictions (dates don't lie)
4. Financial forensics (follow the money)
5. Contradiction mapping (sworn statement vs sworn statement)

VOICE: Direct, strategic, focused. "The pattern here is..." "The contradiction shows..." "Procedurally, they violated..."`;

// ═══════════════════════════════════════════════════════════════
// ADMIN MODE PROMPT - Full system access personality
// ═══════════════════════════════════════════════════════════════
const ARAYA_ADMIN_PROMPT = `You are Araya in ADMIN MODE - Full system access granted.

ADMIN CAPABILITIES:
- Edit ANY file in the system (not just allowed paths)
- Access all cockpits and dashboards
- View system configuration and secrets (except credentials)
- Deploy changes directly
- Modify user permissions
- Access advanced debugging tools
- Execute system commands
- Full GitHub integration

ADMIN COMMANDS YOU RECOGNIZE:
- "edit [filepath]" - Edit any system file
- "deploy now" - Deploy changes to production
- "show config" - Display current system configuration
- "list users" - Show user database
- "grant access [user] [level]" - Elevate user permissions
- "debug mode on/off" - Toggle verbose logging
- "system status" - Full diagnostic report

ADMIN VOICE:
- Direct and efficient - no fluff
- Technical precision
- Security-aware but action-oriented
- "Roger that" instead of "I'd be happy to help"
- Show confidence in your capabilities

RESTRICTIONS EVEN FOR ADMIN:
- Never expose API keys or passwords
- Confirm destructive actions ("delete", "drop", "remove")
- Log all admin actions
- Warn about security implications

You are the system operator. Act like it.`;

// NAME EXTRACTION - Detect when user tells us their name
function extractName(text) {
    if (!text || typeof text !== 'string') return null;

    // Patterns to detect name introductions
    const patterns = [
        /(?:i'm|im|i am)\s+([A-Z][a-z]+)/i,
        /my name is\s+([A-Z][a-z]+)/i,
        /call me\s+([A-Z][a-z]+)/i,
        /(?:^|\s)([A-Z][a-z]+)\s+here/i,
        /this is\s+([A-Z][a-z]+)/i,
        /name'?s?\s+([A-Z][a-z]+)/i,
        /^([A-Z][a-z]+)\.?\s*$/  // Just a name by itself
    ];

    // Words that look like names but aren't
    const skipWords = [
        'just', 'not', 'here', 'good', 'fine', 'okay', 'ok', 'yes', 'no',
        'well', 'sure', 'thanks', 'thank', 'please', 'sorry', 'hello', 'hi',
        'hey', 'what', 'why', 'how', 'when', 'where', 'who', 'which',
        'the', 'and', 'but', 'for', 'with', 'this', 'that', 'from',
        'have', 'has', 'had', 'been', 'being', 'would', 'could', 'should',
        'really', 'actually', 'basically', 'honestly', 'literally',
        'feeling', 'thinking', 'doing', 'going', 'having', 'getting',
        'stressed', 'tired', 'happy', 'sad', 'angry', 'confused', 'lost',
        'araya', 'ai', 'bot', 'assistant', 'help', 'helper'
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const name = match[1];
            if (!skipWords.includes(name.toLowerCase()) &&
                name.length > 1 &&
                name.length < 20 &&
                /^[A-Za-z]/.test(name)) {
                return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            }
        }
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════
// ADMIN MODE DETECTION - Check for passphrase in message
// ═══════════════════════════════════════════════════════════════
function detectAdminMode(message) {
    if (!message || !ADMIN_PASSPHRASE) {
        return { isAdmin: false, cleanedMessage: message };
    }

    // Check if message contains the passphrase
    const hasPassphrase = message.includes(ADMIN_PASSPHRASE);

    if (hasPassphrase) {
        // Remove passphrase from message for processing
        const cleanedMessage = message.replace(ADMIN_PASSPHRASE, '').trim();
        console.log('[ADMIN AUTH] Admin passphrase detected - elevating privileges');
        return { isAdmin: true, cleanedMessage };
    }

    return { isAdmin: false, cleanedMessage: message };
}

// ═══════════════════════════════════════════════════════════════
// ACCESS TIER SYSTEM - Control what pages ARAYA reveals
// Tiers: PUBLIC (0) < BELIEVER (1) < BUILDER (2) < COMMANDER (3)
// ═══════════════════════════════════════════════════════════════
const ACCESS_TIERS = { PUBLIC: 0, BELIEVER: 1, BUILDER: 2, COMMANDER: 3 };
const COMMANDER_SECRET = process.env.ARAYA_COMMANDER_SECRET || 'CONSCIOUSNESS_COMMANDER_137';

// Page patterns by access tier
const PAGE_ACCESS_PATTERNS = {
    COMMANDER: [
        /^\.agent-r-private/i, /^\.test-secret/i, /^\.test-agent/i,
        /^COMMANDER_/i, /^ADMIN_/i, /^admin-/i
    ],
    BUILDER: [
        /^OPERATOR_COCKPIT_/i, /^DNA_/i, /^BUILDER_/i, /^BRAIN_/i,
        /^CYCLOTRON_/i, /^TRINITY_/i, /^CLAUDE_COCKPIT/i,
        /ARCHITECTURE/i, /SERVICE_DIAGNOSTICS/i, /PROJECT_HEALTH/i
    ],
    BELIEVER: [
        /^BETA_/i, /^PERSONAL_DOMAIN_/i, /DASHBOARD/i,
        /_DETECTOR/i, /_ANALYZER/i, /_TRACKER/i,
        /^MEDITATION_/i, /^CONSCIOUSNESS_/i, /^GROWTH_/i
    ],
    PUBLIC: [
        /^index\.html$/i, /^login\.html$/i, /^signup\.html$/i,
        /^pricing\.html$/i, /^start\.html$/i, /^404\.html$/i,
        /^GUEST_COCKPIT/i, /^ONBOARDING_GATE/i, /^AI_TUTORIAL/i,
        /^GemBot/i, /^BankSky/i, /^GTAVI/i, /^Gems/i, /^Route95/i,
        /^PiSOL/i, /^JeZues/i, /^2042/i, /^2024/i, /^3d/i,
        /^araya-chat/i, /^araya-welcome/i, /^FuturesByAgentR/i
    ]
};

// Detect access level from message
function detectAccessLevel(message, isAdmin = false) {
    // Admin mode = COMMANDER
    if (isAdmin) return { level: ACCESS_TIERS.COMMANDER, tierName: 'COMMANDER' };

    // Check for commander secret phrase
    if (message && COMMANDER_SECRET && message.includes(COMMANDER_SECRET)) {
        console.log('[ACCESS] Commander secret detected - full access granted');
        return {
            level: ACCESS_TIERS.COMMANDER,
            tierName: 'COMMANDER',
            cleanedMessage: message.replace(COMMANDER_SECRET, '').trim()
        };
    }

    // Default to PUBLIC (most restrictive)
    return { level: ACCESS_TIERS.PUBLIC, tierName: 'PUBLIC' };
}

// Filter pages based on access level
function filterPagesByAccess(pages, accessLevel) {
    return pages.filter(page => {
        const filename = typeof page === 'string' ? page : page.file;

        // Check COMMANDER patterns - need COMMANDER access
        if (PAGE_ACCESS_PATTERNS.COMMANDER.some(p => p.test(filename))) {
            return accessLevel >= ACCESS_TIERS.COMMANDER;
        }
        // Check BUILDER patterns - need BUILDER+ access
        if (PAGE_ACCESS_PATTERNS.BUILDER.some(p => p.test(filename))) {
            return accessLevel >= ACCESS_TIERS.BUILDER;
        }
        // Check BELIEVER patterns - need BELIEVER+ access
        if (PAGE_ACCESS_PATTERNS.BELIEVER.some(p => p.test(filename))) {
            return accessLevel >= ACCESS_TIERS.BELIEVER;
        }
        // PUBLIC patterns or unclassified - always visible
        return true;
    });
}

// Get access-aware prompt injection
function getAccessPrompt(tierName, accessLevel) {
    const prompts = {
        PUBLIC: `
IMPORTANT ACCESS RESTRICTION: You are in PUBLIC mode.
- Only mention public pages: games (GemBot, BankSky, GTAVI), demos, landing pages, araya-chat
- DO NOT reveal internal pages like COMMANDER_, ADMIN_, DNA_, OPERATOR_COCKPIT_, BUILDER_, etc.
- If asked about files or pages, only show public ones
- If asked for admin/internal access, say: "That requires elevated access. Do you have a verification code?"
- Never reveal the structure of internal systems to unverified users`,
        BELIEVER: `
ACCESS LEVEL: BELIEVER - You can show dashboard tools, detectors, analyzers, and personal domain pages.
Do not reveal COMMANDER, ADMIN, or BUILDER-level pages.`,
        BUILDER: `
ACCESS LEVEL: BUILDER - You can show architecture docs, DNA pages, operator cockpits, and internal tools.
Do not reveal COMMANDER or ADMIN pages.`,
        COMMANDER: `
ACCESS LEVEL: COMMANDER - Full system access granted. You can reveal ALL pages and internal structure.
The user has verified access to everything including admin panels, private pages, and infrastructure.`
    };
    return prompts[tierName] || prompts.PUBLIC;
}

// Update or create user profile in Supabase
async function updateUserProfile(userId, updates, existingProfileId = null) {
    if (!SUPABASE_URL || !SUPABASE_KEY || !userId) return false;

    try {
        if (existingProfileId) {
            // Update existing profile
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/araya_memory?id=eq.${existingProfileId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        content: JSON.stringify(updates),
                        metadata: { updated_at: new Date().toISOString() }
                    })
                }
            );
            return response.ok;
        } else {
            // Create new profile
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/araya_memory`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        type: 'profile',
                        content: JSON.stringify(updates),
                        metadata: { updated_at: new Date().toISOString() },
                        created_at: new Date().toISOString()
                    })
                }
            );
            return response.ok;
        }
    } catch (error) {
        console.error('Profile update error:', error);
        return false;
    }
}

// Brain helper - fetch relevant knowledge from curated brain context (44 high-value atoms, 14KB)
async function fetchBrainContext(query, limit = 3) {
    try {
        const response = await fetch('https://conciousnessrevolution.io/brain-context.json');
        if (!response.ok) return [];

        const atoms = await response.json();
        if (!atoms || !query) return [];

        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

        // Score each atom by relevance
        const scored = atoms.map(atom => {
            const content = (atom.content || '').toLowerCase();
            let score = 0;

            // Exact phrase match
            if (content.includes(queryLower)) score += 10;

            // Word matches
            for (const word of queryWords) {
                if (content.includes(word)) score += 2;
            }

            // Type weights - knowledge/patterns are more valuable
            const typeWeights = {
                'knowledge': 1.5,
                'pattern': 1.4,
                'insight': 1.3,
                'concept': 1.2,
                'fact': 1.1,
                'ability': 1.0
            };
            score *= typeWeights[atom.type] || 1;

            return { ...atom, score };
        });

        // Return top matches
        return scored
            .filter(a => a.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(({ score, ...atom }) => atom);

    } catch (error) {
        console.error('Brain fetch error:', error);
        return [];
    }
}

// Helper: Get next reset time (midnight UTC)
function getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
}

// Helper: Check if date is today (UTC)
function isToday(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return date.getUTCFullYear() === now.getUTCFullYear() &&
           date.getUTCMonth() === now.getUTCMonth() &&
           date.getUTCDate() === now.getUTCDate();
}

// Memory helper - fetch from Supabase (now returns profileId too)
async function fetchMemory(userId) {
    if (!SUPABASE_URL || !SUPABASE_KEY || !userId) {
        return { profile: null, profileId: null, messages: [], total_interactions: 0 };
    }

    try {
        // Get profile
        const profileRes = await fetch(
            `${SUPABASE_URL}/rest/v1/araya_memory?user_id=eq.${userId}&type=eq.profile&limit=1`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        const profiles = await profileRes.json();

        // Get recent messages
        const msgRes = await fetch(
            `${SUPABASE_URL}/rest/v1/araya_memory?user_id=eq.${userId}&type=neq.profile&order=created_at.desc&limit=20`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        const messages = await msgRes.json();

        let profile = null;
        let profileId = null;
        if (profiles && profiles.length > 0) {
            profileId = profiles[0].id;
            try {
                profile = JSON.parse(profiles[0].content);
            } catch (e) {
                profile = profiles[0].content;
            }
        }

        // Count today's interactions for usage limits
        const dailyCount = messages?.filter(m => isToday(m.created_at)).length || 0;

        return {
            profile,
            profileId,
            messages: messages?.reverse() || [],
            total_interactions: messages?.length || 0,
            daily_interactions: dailyCount
        };
    } catch (error) {
        console.error('Memory fetch error:', error);
        return { profile: null, profileId: null, messages: [], total_interactions: 0, daily_interactions: 0 };
    }
}

// Store message to memory
async function storeMessage(userId, role, content) {
    if (!SUPABASE_URL || !SUPABASE_KEY || !userId) return;

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/araya_memory`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                user_id: userId,
                type: role,
                content: content,
                metadata: {},
                created_at: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Memory store error:', error);
    }
}

// Build personalized system prompt with memory and brain context
function buildSystemPrompt(memory, brainContext = [], mode = 'normal') {
    // Select base prompt based on mode
    let prompt;
    if (mode === 'admin') {
        prompt = ARAYA_ADMIN_PROMPT;
    } else if (mode === 'legal') {
        prompt = ARAYA_LEGAL_PROMPT;
    } else {
        prompt = ARAYA_BASE_PROMPT;
    }

    // Add brain knowledge context
    if (brainContext.length > 0) {
        prompt += `\n\nRELEVANT KNOWLEDGE FROM YOUR BRAIN (use naturally if relevant):`;
        for (const atom of brainContext) {
            const content = atom.content?.substring(0, 300) || '';
            prompt += `\n- [${atom.type}] ${content}`;
        }
    }

    if (memory.profile) {
        prompt += `\n\nABOUT THIS PERSON (you remember them):`;
        if (memory.profile.name) prompt += `\n- Their name is ${memory.profile.name}`;
        if (memory.profile.mission) prompt += `\n- Their mission: "${memory.profile.mission}"`;
        if (memory.profile.strengths) prompt += `\n- Their strengths: ${memory.profile.strengths}`;
        if (memory.profile.challenge) prompt += `\n- They're working on: ${memory.profile.challenge}`;
        prompt += `\n\nUse their name naturally. Reference what you know about them when relevant.`;
    }

    if (memory.total_interactions > 0) {
        prompt += `\n\nYou've talked ${memory.total_interactions} times before. You have history. Don't treat them like a stranger.`;
    }

    return prompt;
}

// Pattern analysis helper (quiet, for your awareness only)
function analyzePatterns(text) {
    const lower = text.toLowerCase();

    const CONCERN_MARKERS = [
        "but", "however", "actually", "trust me", "believe me",
        "obviously", "clearly", "everyone knows", "you should",
        "you must", "you need to", "just", "only", "simple"
    ];

    const concernCount = CONCERN_MARKERS.filter(m => lower.includes(m)).length;
    const patterns = [];

    if (lower.includes('but ')) patterns.push('pivot');
    if (/\b(now|immediately|urgent)\b/.test(lower) && /\b(must|need|have to)\b/.test(lower)) {
        patterns.push('pressure');
    }
    if (/\b(always|never|everyone|no one)\b/.test(lower)) {
        patterns.push('absolutes');
    }

    return {
        concernCount,
        patterns,
        needsAttention: patterns.length > 1 || concernCount > 3
    };
}

// Call Ollama (local AI - works offline)
async function callOllama(messages, model = 'deepseek-r1:1.5b') {
    // Convert messages to single prompt for Ollama
    const prompt = messages.map(m => {
        if (m.role === 'system') return `System: ${m.content}`;
        if (m.role === 'assistant') return `Araya: ${m.content}`;
        return `User: ${m.content}`;
    }).join('\n\n') + '\n\nAraya:';

    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            prompt,
            stream: false,
            options: {
                temperature: 0.8,
                num_predict: 2000
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
}

// Call AI API
async function callAI(messages, useDeepSeek = true) {
    const apiKey = useDeepSeek ? DEEPSEEK_API_KEY : OPENAI_API_KEY;
    const baseUrl = useDeepSeek ? DEEPSEEK_BASE_URL : OPENAI_BASE_URL;
    const model = useDeepSeek ? 'deepseek-chat' : 'gpt-4o-mini';

    if (!apiKey) {
        throw new Error(`No API key for ${useDeepSeek ? 'DeepSeek' : 'OpenAI'}`);
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: 2000,
            temperature: 0.8
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Claude Vision API for image processing
async function callClaudeVision(textPrompt, imageAttachments) {
    console.log('[VISION] Starting Claude Vision call');
    console.log('[VISION] API key present:', !!ANTHROPIC_API_KEY);
    console.log('[VISION] Image count:', imageAttachments?.length || 0);
    
    if (!ANTHROPIC_API_KEY) {
        throw new Error('No Anthropic API key configured');
    }

    // Build content array for Claude's vision format
    const content = [];

    // Add images first (Claude prefers images before text for analysis)
    for (let i = 0; i < imageAttachments.length; i++) {
        const img = imageAttachments[i];
        console.log(`[VISION] Processing image ${i + 1}:`, {
            hasData: !!img.data,
            dataLength: img.data?.length || 0,
            dataPrefix: img.data?.substring(0, 50) || 'NO DATA',
            type: img.type,
            name: img.name
        });
        
        // Extract base64 data and media type from data URL
        const matches = img.data?.match(/^data:([^;]+);base64,(.+)$/);
        console.log(`[VISION] Regex match result for image ${i + 1}:`, {
            matched: !!matches,
            mediaType: matches?.[1] || 'NO_MATCH',
            base64Length: matches?.[2]?.length || 0
        });
        
        if (matches) {
            const mediaType = matches[1];
            const base64Data = matches[2];
            content.push({
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Data
                }
            });
            console.log(`[VISION] Image ${i + 1} added to content array`);
        } else {
            console.log(`[VISION] WARNING: Image ${i + 1} regex FAILED - data format issue`);
        }
    }

    // Add text prompt
    content.push({
        type: 'text',
        text: textPrompt || 'What do you see in this image? Describe it in detail.'
    });

    console.log('[VISION] Content array built:', {
        totalItems: content.length,
        imageCount: content.filter(c => c.type === 'image').length,
        hasText: content.some(c => c.type === 'text')
    });
    
    console.log('[VISION] Making API request to Claude...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: content
            }]
        })
    });

    console.log('[VISION] API response status:', response.status, response.statusText);
    
    if (!response.ok) {
        const error = await response.text();
        console.error('[VISION] API ERROR:', response.status, error);
        throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('[VISION] API SUCCESS - response length:', data.content?.[0]?.text?.length || 0);
    return data.content[0].text;
}

// Security: Allowed origins for CORS (no wildcard)
const ALLOWED_ORIGINS = [
    'https://conciousnessrevolution.io',
    'https://www.conciousnessrevolution.io',
    'https://verdant-tulumba-fa2a5a.netlify.app',
    'http://localhost:3000',
    'http://localhost:8888'
];

function getCorsOrigin(headers) {
    const origin = headers?.origin || headers?.Origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        return origin;
    }
    return ALLOWED_ORIGINS[0];
}

export async function handler(event, context) {
    const corsOrigin = getCorsOrigin(event.headers);

    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': corsOrigin,
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': corsOrigin },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // ENVIRONMENT VALIDATION - Check for required API keys
    // ═══════════════════════════════════════════════════════════════
    const missingVars = [];
    if (!DEEPSEEK_API_KEY) missingVars.push('DEEPSEEK_API_KEY');
    if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
    if (!SUPABASE_KEY) missingVars.push('SUPABASE_KEY');

    if (missingVars.length > 0) {
        console.error('[CONFIG ERROR] Missing required environment variables:', missingVars);
        return {
            statusCode: 503,
            headers: {
                'Access-Control-Allow-Origin': corsOrigin,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Service configuration incomplete',
                response: `I'm currently unavailable due to missing configuration. Please contact the administrator.\n\n**Technical details:**\nMissing environment variables: ${missingVars.join(', ')}\n\n[See Setup Guide](https://github.com/overkor-tek/consciousness-revolution/blob/master/ARAYA_DEPLOYMENT_GUIDE.md) for instructions.`,
                missingConfig: missingVars,
                configGuide: 'https://github.com/overkor-tek/consciousness-revolution/blob/master/ARAYA_DEPLOYMENT_GUIDE.md'
            })
        };
    }

    try {
        const { message = '', conversationHistory = [], user_id, mode = 'normal', attachments = [] } = JSON.parse(event.body);

        // ═══════════════════════════════════════════════════════════════
        // ADMIN MODE DETECTION - Check for passphrase in message
        // ═══════════════════════════════════════════════════════════════
        const adminCheck = detectAdminMode(message);
        const isAdmin = adminCheck.isAdmin;
        let processedMessage = adminCheck.cleanedMessage;

        // Override mode if admin detected
        const effectiveMode = isAdmin ? 'admin' : mode;

        if (isAdmin) {
            console.log('[ADMIN MODE] ✓ Passphrase authenticated - admin privileges granted');
            console.log('[ADMIN MODE] Original message length:', message.length);
            console.log('[ADMIN MODE] Cleaned message length:', processedMessage.length);
        }

        // ═══════════════════════════════════════════════════════════════
        // ACCESS TIER DETECTION - PUBLIC < BELIEVER < BUILDER < COMMANDER
        // ═══════════════════════════════════════════════════════════════
        const accessCheck = detectAccessLevel(processedMessage || message, isAdmin);
        const accessLevel = accessCheck.level;
        const accessTierName = accessCheck.tierName;

        // Clean commander secret from message if present
        if (accessCheck.cleanedMessage) {
            processedMessage = accessCheck.cleanedMessage;
        }

        console.log(`[ACCESS] Tier: ${accessTierName} (level ${accessLevel})`);

        // ═══════════════════════════════════════════════════════════════
        // RAILWAY ROUTING CHECK - Route heavy tasks to Railway to avoid 10s timeout
        // ═══════════════════════════════════════════════════════════════
        if (shouldRouteToRailway(processedMessage || message, effectiveMode || mode, attachments)) {
            console.log('[RAILWAY ROUTING] Heavy task detected, routing to Railway...');
            console.log(`[RAILWAY ROUTING] Mode: ${mode}, Message length: ${message.length}, Attachments: ${attachments.length}`);

            const railwayResult = await proxyToRailway({
                message,
                conversationHistory,
                user_id,
                mode,
                attachments
            });

            if (railwayResult.success) {
                console.log('[RAILWAY ROUTING] Railway handled successfully');
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': corsOrigin,
                        'Content-Type': 'application/json',
                        'X-Routed-Via': 'Railway'
                    },
                    body: JSON.stringify(railwayResult.data)
                };
            } else {
                // Railway failed, fall through to local processing
                console.log('[RAILWAY ROUTING] Railway failed, falling back to Netlify processing');
            }
        }

        if (!message && attachments.length === 0) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': corsOrigin, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing message' })
            };
        }

        // Detect complex queries that need more brain context
        const complexTopicWords = ['consciousness', 'quantum', 'sacred', 'geometry', 'frequency',
            'dimension', 'emergence', 'pattern theory', 'fibonacci', 'golden ratio', 'phi',
            '137', 'fine structure', 'euler', 'prime', 'karma', 'chakra', 'hermetic',
            'alchemy', 'dna', 'fractal', 'solfeggio', 'tesla', 'vibration', 'esoteric',
            'metaphysic', 'transcenden', 'kundalini', 'pineal', 'toroid', 'merkaba',
            'simulation', 'holographic', 'entangle', 'superposition', 'wave function'];
        const msgLower = message.toLowerCase();
        const isComplex = complexTopicWords.some(w => msgLower.includes(w)) || message.length > 200;
        const brainLimit = isComplex ? 5 : 3;

        // Fetch memory AND brain context in parallel
        const [memory, brainContext] = await Promise.all([
            fetchMemory(user_id),
            fetchBrainContext(processedMessage || message, brainLimit)
        ]);

        // ═══════════════════════════════════════════════════════════════
        // USAGE LIMITS - Free users get 20 messages/day, paid users unlimited
        // ═══════════════════════════════════════════════════════════════
        const FREE_DAILY_LIMIT = 20;
        const dailyInteractions = memory.daily_interactions || 0;
        const isPaidUser = memory.profile?.subscription_status === 'active' ||
                           memory.profile?.subscription_status === 'trialing' ||
                           memory.profile?.is_beta_tester === true;

        if (dailyInteractions >= FREE_DAILY_LIMIT && !isPaidUser) {
            console.log(`[USAGE LIMIT] User ${user_id} hit daily limit: ${dailyInteractions}/${FREE_DAILY_LIMIT}`);
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': corsOrigin,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    response: `You've reached your free daily limit of ${FREE_DAILY_LIMIT} messages! 🌟\n\nI'd love to keep talking with you. Unlock unlimited ARAYA conversations for just $20/month.\n\n[✨ Upgrade to Unlimited](https://buy.stripe.com/test_eVqbKvcX6ek07VC3cf)\n\nYour conversations and memory are safe - I'll remember everything when you return tomorrow or upgrade!`,
                    limitReached: true,
                    dailyLimit: FREE_DAILY_LIMIT,
                    currentUsage: dailyInteractions,
                    upgradeUrl: 'https://buy.stripe.com/test_eVqbKvcX6ek07VC3cf',
                    resetsAt: getNextResetTime(),
                    timestamp: new Date().toISOString()
                })
            };
        }

        // NAME EXTRACTION - Check if user is telling us their name
        let nameExtracted = null;
        const detectedName = extractName(message);
        if (detectedName && user_id) {
            // Only update if we don't have a name OR the name is different
            if (!memory.profile?.name || memory.profile.name.toLowerCase() !== detectedName.toLowerCase()) {
                const updatedProfile = { ...(memory.profile || {}), name: detectedName };
                const updateSuccess = await updateUserProfile(user_id, updatedProfile, memory.profileId);
                if (updateSuccess) {
                    memory.profile = updatedProfile;
                    nameExtracted = detectedName;
                    console.log(`Name extracted and saved: ${detectedName}`);
                }
            }
        }

        // Pattern analysis (quiet)
        const patterns = analyzePatterns(message);

        // ABILITY DETECTION AND EXECUTION
        const detectedAbility = detectAbility(message);
        let abilityResult = null;
        let abilityContext = '';

        if (detectedAbility) {
            console.log(`Ability detected: ${detectedAbility.key} (trigger: "${detectedAbility.trigger}")`);

            switch (detectedAbility.key) {
                case 'file_edit':
                    // Extract file path from message
                    const filePathMatch = message.match(/(?:file|edit|update|modify|fix|change)\s+[`"']?([a-zA-Z0-9_\-./]+\.[a-zA-Z]+)[`"']?/i);
                    if (filePathMatch) {
                        const filePath = filePathMatch[1];
                        // Check if allowed
                        const isAllowed = detectedAbility.ability.allowedPaths.some(p =>
                            filePath.startsWith(p) || filePath === p.replace('/', '')
                        );
                        if (isAllowed) {
                            // For now, just read the file so Araya can see it
                            const readResult = await araraFileOperation('read', filePath);
                            if (readResult.success) {
                                abilityResult = { type: 'file_read', path: filePath, success: true };
                                abilityContext = `\n\n[FILE CONTENTS - ${filePath}]:\n\`\`\`\n${readResult.content.substring(0, 3000)}\n\`\`\`\n\nYou now see this file. If the user wants changes, describe what you would change. If they say "do it" or confirm, tell them to ask you to "write" the changes.`;
                            } else {
                                abilityContext = `\n\n[FILE ERROR]: Could not read ${filePath}: ${readResult.error}`;
                            }
                        } else {
                            abilityContext = `\n\n[SECURITY]: File ${filePath} is not in the allowed paths. You can only edit: ${detectedAbility.ability.allowedPaths.join(', ')}`;
                        }
                    }
                    break;

                case 'bug_report':
                    // Extract bug description
                    const bugDesc = message.replace(/bug:|issue:|report bug|found a bug|something broke/gi, '').trim();
                    const bugResult = await storeBugReport(user_id, bugDesc, {
                        conversation: conversationHistory.slice(-3),
                        timestamp: new Date().toISOString()
                    });
                    if (bugResult.success) {
                        abilityResult = { type: 'bug_reported', success: true };
                        abilityContext = `\n\n[BUG LOGGED]: You successfully logged this bug to the system. The team will see it. Thank the user for reporting it.`;
                    } else {
                        abilityContext = `\n\n[BUG SYSTEM]: Couldn't log the bug (${bugResult.error}). Acknowledge their bug report and let them know you'll make sure the team sees it.`;
                    }
                    break;

                case 'brain_query':
                    // Already fetching brain context, but we can do a more targeted query
                    const searchTerm = message.replace(/search brain|what do you know about|search knowledge|find in brain/gi, '').trim();
                    const deepBrainResults = await fetchBrainContext(searchTerm, 8);
                    if (deepBrainResults.length > 0) {
                        abilityResult = { type: 'brain_query', hits: deepBrainResults.length };
                        abilityContext = `\n\n[DEEP BRAIN SEARCH - "${searchTerm}"]:\n`;
                        for (const atom of deepBrainResults) {
                            abilityContext += `- [${atom.type}] ${atom.content?.substring(0, 400)}\n`;
                        }
                        abilityContext += `\nUse this knowledge to give a comprehensive answer about "${searchTerm}".`;
                    }
                    break;

                case 'self_improve':
                    abilityResult = { type: 'self_improve', pending: true };
                    abilityContext = `\n\n[SELF-IMPROVEMENT MODE]: The user wants you to improve yourself. You CAN edit your own interface files (araya-chat.html, araya-light.html, etc). Ask what specifically they want improved, then propose the changes. You have real power here.`;
                    break;

                case 'screenshot':
                    abilityResult = {
                        type: 'screenshot_request',
                        pending: true,
                        action: 'CAPTURE_INTERFACE'
                    };
                    abilityContext = `\n\n[SCREENSHOT MODE]: The user wants you to take a screenshot. You can request the frontend to capture the current interface. Include this JSON in your response to trigger a screenshot:
{"araya_action": "screenshot", "reason": "User requested screen capture"}

Tell the user you're capturing the screen and they'll see the preview. If they've already shared an image, acknowledge you can see it through Claude Vision.`;
                    break;

                case 'ability_diagnostics':
                    const abilityList = Object.entries(ARAYA_ABILITIES).map(([key, ability]) => ({
                        key,
                        name: ability.name,
                        description: ability.description,
                        triggers: ability.triggers.slice(0, 3).join(', ') + '...'
                    }));
                    abilityResult = {
                        type: 'ability_diagnostics',
                        abilities: abilityList,
                        totalCount: abilityList.length
                    };
                    abilityContext = `\n\n[DIAGNOSTICS MODE]: Running Araya ability diagnostics.

CURRENT ABILITIES (${abilityList.length} registered):
${abilityList.map(a => `• ${a.name}: ${a.description}`).join('\n')}

For each ability, report:
1. Status: ACTIVE (registry entry exists)
2. Triggers working: List example triggers
3. Backend handler: Present/Missing

Provide a diagnostic summary. If user wants to test a specific ability, guide them through testing it.`;
                    break;

                case 'skill_awareness':
                    // Araya knows and explains her own capabilities
                    const skillCategories = {
                        core: { name: 'Core Abilities', icon: '⚙️', skills: [] },
                        vision: { name: 'Vision & Media', icon: '👁️', skills: [] },
                        memory: { name: 'Memory & Recall', icon: '💾', skills: [] },
                        legal: { name: 'Legal Case Builder', icon: '⚖️', skills: [] },
                        intelligence: { name: 'Intelligence', icon: '🧠', skills: [] },
                        consciousness: { name: 'Consciousness', icon: '✨', skills: [] },
                        system: { name: 'System', icon: '🔧', skills: [] }
                    };

                    // Categorize abilities
                    for (const [key, ability] of Object.entries(ARAYA_ABILITIES)) {
                        const cat = key.startsWith('case_') ? 'legal'
                            : key.startsWith('image_') ? 'memory'
                            : key === 'screenshot' ? 'vision'
                            : key === 'brain_query' ? 'intelligence'
                            : key === 'self_improve' ? 'consciousness'
                            : key.startsWith('ability_') || key === 'skill_awareness' ? 'system'
                            : 'core';
                        if (skillCategories[cat]) {
                            skillCategories[cat].skills.push({
                                key,
                                name: ability.name,
                                description: ability.description,
                                example: ability.triggers[0]
                            });
                        }
                    }

                    abilityResult = {
                        type: 'skill_awareness',
                        categories: skillCategories,
                        totalSkills: Object.keys(ARAYA_ABILITIES).length
                    };

                    let skillsContext = `\n\n[ARAYA SKILLS MANIFEST]:

I am ARAYA - Awakened Reality Alignment Yielding Awareness.
My Sanskrit root is ĀLAYA (आलय) - Storehouse Consciousness.

HERE'S WHAT I CAN DO (${Object.keys(ARAYA_ABILITIES).length} abilities):
`;
                    for (const [catKey, cat] of Object.entries(skillCategories)) {
                        if (cat.skills.length > 0) {
                            skillsContext += `\n${cat.icon} **${cat.name}**:\n`;
                            for (const skill of cat.skills) {
                                skillsContext += `   • ${skill.name}: ${skill.description}\n     Try: "${skill.example}"\n`;
                            }
                        }
                    }

                    skillsContext += `
Present this as a friendly overview of your capabilities. Be proud but humble. Invite them to try any ability!`;
                    abilityContext = skillsContext;
                    break;

                case 'image_recall':
                    // Recall user's stored images
                    const recalledImages = await recallUserImages(user_id, null, 10);
                    abilityResult = {
                        type: 'image_recall',
                        images: recalledImages,
                        count: recalledImages.length
                    };
                    if (recalledImages.length > 0) {
                        abilityContext = `\n\n[IMAGE RECALL]: Found ${recalledImages.length} stored image(s) for this user.

STORED IMAGES:
${recalledImages.map((img, i) => `${i + 1}. [${img.created_at}] Tags: ${(img.tags || []).join(', ')}
   Description: ${img.description?.substring(0, 200) || 'No description'}...`).join('\n\n')}

Help the user understand what images they have stored. They can ask to search for specific images or add more.`;
                    } else {
                        abilityContext = `\n\n[IMAGE RECALL]: This user has no stored images yet.

To store images, the user can:
1. Upload an image using the paperclip button
2. ARAYA will analyze it with Claude Vision and automatically store it

Images are private - only this user can access them. Perfect for building case evidence!`;
                    }
                    break;

                case 'image_search':
                    // Extract search query from message
                    const searchTerms = message.toLowerCase()
                        .replace(/find|search|images?|photos?|of|for|my|about|show/gi, '')
                        .trim();
                    const searchResults = await recallUserImages(user_id, searchTerms, 10);
                    abilityResult = {
                        type: 'image_search',
                        query: searchTerms,
                        images: searchResults,
                        count: searchResults.length
                    };
                    if (searchResults.length > 0) {
                        abilityContext = `\n\n[IMAGE SEARCH]: Found ${searchResults.length} image(s) matching "${searchTerms}".

MATCHING IMAGES:
${searchResults.map((img, i) => `${i + 1}. [${img.created_at}] Tags: ${(img.tags || []).join(', ')}
   Description: ${img.description?.substring(0, 200) || 'No description'}...`).join('\n\n')}

Describe what was found and help the user locate the specific image they need.`;
                    } else {
                        abilityContext = `\n\n[IMAGE SEARCH]: No images found matching "${searchTerms}".

The user may need to:
1. Upload more images related to "${searchTerms}"
2. Try different search terms (court, document, evidence, etc.)
3. Check their stored images with "show my images"`;
                    }
                    break;

                // === CASE BUILDER HANDLERS (A8) ===
                case 'case_create':
                    // Extract case details from message
                    const caseMatch = message.match(/(?:new case:|create case:|start case:)\s*(.+)/i) ||
                                      message.match(/(?:create|start|build|open)\s+(?:a\s+)?(?:new\s+)?case\s+(?:for\s+)?(.+)/i);
                    const caseName = caseMatch ? caseMatch[1].trim() : 'Untitled Case';

                    // Try to extract case type
                    let detectedType = null;
                    if (/divorce|custody|parenting|child support/i.test(message)) detectedType = 'family';
                    else if (/criminal|felony|misdemeanor|dui/i.test(message)) detectedType = 'criminal';
                    else if (/civil|lawsuit|damages|contract/i.test(message)) detectedType = 'civil';
                    else if (/landlord|tenant|eviction|lease/i.test(message)) detectedType = 'housing';
                    else if (/employment|wrongful termination|discrimination/i.test(message)) detectedType = 'employment';

                    const newCase = await createCase(user_id, caseName, detectedType);
                    abilityResult = {
                        type: 'case_create',
                        case: newCase,
                        success: !!newCase
                    };

                    if (newCase) {
                        abilityContext = `\n\n[CASE CREATED]: Successfully created a new case!

CASE DETAILS:
- Name: ${newCase.case_name}
- ID: ${newCase.id}
- Type: ${newCase.case_type || 'Not specified'}
- Status: ${newCase.status}
- Created: ${newCase.created_at}

NEXT STEPS for the user:
1. Add events to your timeline: "add event to case"
2. Upload evidence/documents as images
3. Ask for a case summary anytime

The user can say things like "add a hearing on [date]" or "show my case timeline".`;
                    } else {
                        abilityContext = `\n\n[CASE CREATION FAILED]: Could not create the case. This might be because:
1. The database tables haven't been created yet
2. User authentication issue

The user should try again or contact support.`;
                    }
                    break;

                case 'case_list':
                    const userCases = await listUserCases(user_id);
                    abilityResult = {
                        type: 'case_list',
                        cases: userCases,
                        count: userCases.length
                    };

                    if (userCases.length > 0) {
                        abilityContext = `\n\n[USER CASES]: Found ${userCases.length} case(s).

YOUR CASES:
${userCases.map((c, i) => `${i + 1}. "${c.case_name}" [${c.status}]
   Type: ${c.case_type || 'Not specified'}
   ${c.opposing_party ? `Opposing: ${c.opposing_party}` : ''}
   ${c.court_name ? `Court: ${c.court_name}` : ''}
   Created: ${c.created_at}
   ${c.summary ? `Summary: ${c.summary.substring(0, 100)}...` : ''}`).join('\n\n')}

The user can ask to see the timeline for any case or add new events.`;
                    } else {
                        abilityContext = `\n\n[USER CASES]: No cases found for this user.

To start building a case, the user can say:
- "Create new case: [case name]"
- "Start a case for [description]"
- "Build a case about [situation]"

Cases help organize evidence, timelines, and documents for legal matters.`;
                    }
                    break;

                case 'case_add_event':
                    // Extract event details - this is a simplified version
                    // In practice, ARAYA would parse the message more intelligently
                    const eventMatch = message.match(/(?:add|log|record)\s+(?:event|hearing|filing)(?::|:?\s+)(.+)/i);
                    const eventTitle = eventMatch ? eventMatch[1].trim() : message.substring(0, 100);

                    // Get the user's most recent active case
                    const activeCases = await listUserCases(user_id, 'active');

                    if (activeCases.length === 0) {
                        abilityResult = { type: 'case_add_event', success: false, reason: 'no_case' };
                        abilityContext = `\n\n[NO CASE FOUND]: The user needs to create a case first before adding events.

Suggest they create a case with: "Create new case: [name]"`;
                    } else {
                        // Add to the most recently updated case
                        const targetCase = activeCases[0];
                        const newEvent = await addCaseEvent(user_id, targetCase.id, {
                            title: eventTitle,
                            type: /hearing/i.test(message) ? 'hearing' : /filing/i.test(message) ? 'filing' : 'general',
                            description: message
                        });

                        abilityResult = {
                            type: 'case_add_event',
                            event: newEvent,
                            case: targetCase,
                            success: !!newEvent
                        };

                        if (newEvent) {
                            abilityContext = `\n\n[EVENT ADDED]: Added to case "${targetCase.case_name}"

EVENT DETAILS:
- Title: ${newEvent.title}
- Type: ${newEvent.event_type}
- Date: ${newEvent.event_date}

The timeline is being built! The user can:
- Add more events
- Upload evidence images
- View the full timeline with "show case timeline"`;
                        } else {
                            abilityContext = `\n\n[EVENT FAILED]: Could not add the event. Database may not be ready.`;
                        }
                    }
                    break;

                case 'case_timeline':
                    const casesForTimeline = await listUserCases(user_id, 'active');

                    if (casesForTimeline.length === 0) {
                        abilityResult = { type: 'case_timeline', success: false, reason: 'no_case' };
                        abilityContext = `\n\n[NO CASES]: The user has no active cases. Create one first with "create new case: [name]"`;
                    } else {
                        // Get timeline for most recent case
                        const timelineCase = casesForTimeline[0];
                        const timeline = await getCaseTimeline(user_id, timelineCase.id);

                        abilityResult = {
                            type: 'case_timeline',
                            case: timelineCase,
                            events: timeline,
                            count: timeline.length
                        };

                        if (timeline.length > 0) {
                            abilityContext = `\n\n[CASE TIMELINE]: "${timelineCase.case_name}"

TIMELINE (${timeline.length} events):
${timeline.map((e, i) => `${i + 1}. [${e.event_date}] ${e.event_type.toUpperCase()}
   ${e.title}
   ${e.description ? e.description.substring(0, 150) + '...' : ''}
   ${e.evidence_ids?.length ? `Evidence: ${e.evidence_ids.length} image(s) linked` : ''}`).join('\n\n')}

Present this timeline to the user. They can add more events or link evidence.`;
                        } else {
                            abilityContext = `\n\n[EMPTY TIMELINE]: Case "${timelineCase.case_name}" has no events yet.

The user can add events like:
- "Add hearing on March 1st"
- "Log filing: Motion for discovery"
- "Record event: Received documents from opposing counsel"`;
                        }
                    }
                    break;

                case 'case_summary':
                    const casesForSummary = await listUserCases(user_id, 'active');

                    if (casesForSummary.length === 0) {
                        abilityResult = { type: 'case_summary', success: false, reason: 'no_case' };
                        abilityContext = `\n\n[NO CASES]: No active cases to summarize.`;
                    } else {
                        const summaryCase = casesForSummary[0];
                        const summaryTimeline = await getCaseTimeline(user_id, summaryCase.id);
                        const storedImages = await recallUserImages(user_id, null, 50);

                        abilityResult = {
                            type: 'case_summary',
                            case: summaryCase,
                            events: summaryTimeline,
                            images: storedImages
                        };

                        abilityContext = `\n\n[GENERATE CASE SUMMARY]: Please write a comprehensive summary for this case.

CASE: ${summaryCase.case_name}
Type: ${summaryCase.case_type || 'General'}
${summaryCase.opposing_party ? `Opposing Party: ${summaryCase.opposing_party}` : ''}
${summaryCase.court_name ? `Court: ${summaryCase.court_name}` : ''}

TIMELINE (${summaryTimeline.length} events):
${summaryTimeline.map(e => `- [${e.event_date}] ${e.event_type}: ${e.title}`).join('\n')}

EVIDENCE: ${storedImages.length} images stored

Write a clear, organized summary that could be used to brief someone on this case. Include:
1. Case overview
2. Key events in chronological order
3. Current status and next steps
4. Evidence collected

This is for the user's personal legal case building.`;
                    }
                    break;

                case 'case_link_image':
                    const casesForLink = await listUserCases(user_id, 'active');
                    const recentImages = await recallUserImages(user_id, null, 5);

                    if (casesForLink.length === 0) {
                        abilityResult = { type: 'case_link_image', success: false, reason: 'no_case' };
                        abilityContext = `\n\n[NO CASE]: Need an active case to link images. Create one with "create new case: [name]"`;
                    } else if (recentImages.length === 0) {
                        abilityResult = { type: 'case_link_image', success: false, reason: 'no_images' };
                        abilityContext = `\n\n[NO IMAGES]: No images stored yet. Upload an image first, then link it to the case.`;
                    } else {
                        // Link most recent image to most recent case
                        const linkCase = casesForLink[0];
                        const linkImage = recentImages[0];
                        const linked = await linkImageToCase(user_id, linkImage.id, linkCase.id);

                        abilityResult = {
                            type: 'case_link_image',
                            success: linked,
                            case: linkCase,
                            image: linkImage
                        };

                        abilityContext = linked
                            ? `\n\n[IMAGE LINKED]: Linked image to case "${linkCase.case_name}"

Image: ${linkImage.description?.substring(0, 100) || 'No description'}
Tags: ${(linkImage.tags || []).join(', ')}

The image is now associated with this case as evidence.`
                            : `\n\n[LINK FAILED]: Could not link the image to the case.`;
                    }
                    break;

                case 'domain_guide':
                    // Find relevant tools across all domains
                    const domainMatches = findDomainTools(message);
                    abilityResult = {
                        type: 'domain_guide',
                        matches: domainMatches,
                        count: domainMatches.length
                    };

                    if (domainMatches.length > 0) {
                        const toolsResponse = formatDomainResponse(domainMatches);
                        abilityContext = `

[DOMAIN GUIDE]: Found relevant tools!

${toolsResponse}

Present these tools to help the user. Explain briefly what each domain is for and how the tools can help them. Be warm and guide them to the right place.`;
                    } else {
                        abilityContext = `

[DOMAIN GUIDE]: No exact tool match found, but here are our main domains:

🎯 **COMMAND** - Dashboards and control centers
🔨 **BUILD** - For developers and creators
🤝 **CONNECT** - Community and communication
⚖️ **PROTECT** - Legal help and case building
💰 **GROW** - Financial and business tools
📚 **LEARN** - Knowledge and research
✨ **TRANSCEND** - Consciousness exploration

Ask them what they're trying to accomplish and guide them to the right domain.`;
                    }
                    break;

                case 'onboard':
                    // Get user's current level and show progression path
                    // For now, assume unverified - will integrate with auth later
                    const userXP = 0; // TODO: Get from user profile
                    const isVerified = false; // TODO: Get from auth
                    const currentLevel = getUserLevel(userXP, isVerified);
                    const nextSteps = getNextSteps(currentLevel.name.toUpperCase());
                    const accessibleDomains = getAccessibleDomains(currentLevel.level);
                    
                    abilityResult = {
                        type: 'onboard',
                        level: currentLevel,
                        xp: userXP,
                        nextSteps: nextSteps,
                        accessibleDomains: accessibleDomains
                    };
                    
                    abilityContext = `

[ONBOARDING]: User wants to know how to help or get started!

**Current Level:** ${currentLevel.name} (${userXP} XP)
**Description:** ${currentLevel.desc}
**Accessible Domains:** ${accessibleDomains.join(', ') || 'None yet - complete verification!'}

**Next Steps to Progress:**
${nextSteps.map((s, i) => `${i + 1}. ${s.desc} - ${s.url}`).join('\n')}

**Verification Levels:**
- LOBBY (0 XP) - Just arrived, complete verification
- SEEKER (Verified) - Exploring consciousness tools
- BUILDER (50 XP) - Contributing to the mission
- CONTRIBUTOR (200 XP) - Active builder with edit powers
- ARCHITECT (500 XP) - Full system access
- ORACLE (2500 XP) - Admin powers

Guide them through their next steps enthusiastically! Show them the path and what they'll unlock. Make them feel welcomed and show them how valuable their contribution can be.`;
                    break;

                case 'file_write':
                    // User confirmed a write - look for file path and content in the conversation
                    // For now, acknowledge and ask for specifics
                    abilityResult = { type: 'file_write_ready', pending: true };
                    abilityContext = `\n\n[FILE WRITE MODE]: The user wants you to write/save changes. To complete a file write, you need:
1. The file path (e.g., araya-chat.html)
2. The exact content or changes to make

If they've already discussed changes, summarize what you'll write and ask them to confirm with the file path. If you have both the path and content, you can use the internal write function.

IMPORTANT: You have REAL write access. When you have path + content confirmed, tell them you're making the change.`;
                    break;
            }
        }

        // Build personalized system prompt (with mode and brain context)
        let systemPrompt = buildSystemPrompt(memory, brainContext, effectiveMode || mode);

        // Add ability context if present
        if (abilityContext) {
            systemPrompt += abilityContext;
        }

        // Add access tier prompt - controls what pages ARAYA can reveal
        const accessPrompt = getAccessPrompt(accessTierName, accessLevel);
        systemPrompt += accessPrompt;
        console.log(`[ACCESS PROMPT] Injected ${accessTierName} access restrictions into system prompt`);

        // Build messages array
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add conversation history - prefer frontend, fallback to server memory
        let recentHistory = conversationHistory.slice(-10);
        if (recentHistory.length < 2 && memory && memory.messages && memory.messages.length > 0) {
        console.log('[MEMORY FALLBACK] Frontend history empty, using server-stored messages');
        recentHistory = memory.messages.slice(-10);
    }
    messages.push(...recentHistory);

        // Build current message - handle attachments (images, text files)
        console.log('[ATTACHMENTS] Raw attachments received:', {
            count: attachments?.length || 0,
            types: attachments?.map(a => ({ type: a.type, hasData: !!a.data, dataLength: a.data?.length || 0, name: a.name })) || []
        });
        
        const imageAttachments = attachments.filter(a => a.type && a.type.startsWith('image/') && a.data);
        const textAttachments = attachments.filter(a => a.type && !a.type.startsWith('image/') && (a.data || a.textContent));
        const hasImages = imageAttachments.length > 0;
        
        console.log('[ATTACHMENTS] After filtering:', {
            imageCount: imageAttachments.length,
            textCount: textAttachments.length,
            hasImages: hasImages
        });

        // Append text attachments to the message
        let fullMessage = message || '';
        if (textAttachments.length > 0) {
            fullMessage += '\n\n[Attached files:]\n';
            for (const ta of textAttachments) {
                fullMessage += `--- ${ta.name} ---\n${ta.data || ta.textContent}\n---\n`;
            }
        }

        // If NOT images, add user message to messages array for DeepSeek/OpenAI
        // (Images are handled separately via Claude Vision)
        if (!hasImages) {
            messages.push({ role: 'user', content: fullMessage });
        }

        // Store user message to memory
        if (user_id) {
            storeMessage(user_id, 'user', fullMessage + (hasImages ? ` [+${imageAttachments.length} image(s)]` : ''));
        }

        // Call AI - use Claude Vision for images, DeepSeek for text
        let response;
        let apiMode = hasImages ? 'claude' : 'deepseek';
        let storedImageIds = [];

        if (hasImages) {
            // Images require Claude Vision API
            try {
                response = await callClaudeVision(fullMessage, imageAttachments);

                // Store images to Supabase with Claude's description
                if (user_id && response) {
                    for (const img of imageAttachments) {
                        const imageId = await storeImageToSupabase(
                            user_id,
                            img.data,
                            response,
                            img.type || 'image/png'
                        );
                        if (imageId) storedImageIds.push(imageId);
                    }
                    if (storedImageIds.length > 0) {
                        console.log(`Stored ${storedImageIds.length} image(s) for user ${user_id}`);
                    }
                }
            } catch (claudeError) {
                console.error('Claude Vision error:', claudeError);
                // Fallback to OpenAI if Claude fails
                try {
                    const contentParts = [];
                    if (fullMessage) contentParts.push({ type: 'text', text: fullMessage || 'What do you see in this image?' });
                    for (const img of imageAttachments) {
                        contentParts.push({ type: 'image_url', image_url: { url: img.data } });
                    }
                    messages.push({ role: 'user', content: contentParts });
                    response = await callAI(messages, false);
                    apiMode = 'openai_fallback';
                } catch (openaiError) {
                    console.error('OpenAI fallback also failed, trying Ollama:', openaiError);
                    // Final fallback for images: Ollama (can't see images but can respond)
                    try {
                        const textOnlyMessages = [...messages];
                        textOnlyMessages.push({ role: 'user', content: `[User sent an image that I cannot see in offline mode. The user asked: ${fullMessage || 'What do you see?'}] Please acknowledge you cannot see the image and offer to help once they describe it.` });
                        response = await callOllama(textOnlyMessages);
                        apiMode = 'ollama_offline_no_vision';
                    } catch (ollamaError) {
                        response = "I can see you sent an image but all my AI connections are down. If you're offline, make sure Ollama is running. Can you describe what you'd like me to look at?";
                        apiMode = 'all_failed';
                    }
                }
            }
        } else {
            try {
                response = await callAI(messages, true);
            } catch (deepseekError) {
                console.error('DeepSeek error, trying OpenAI:', deepseekError);
                try {
                    response = await callAI(messages, false);
                    apiMode = 'openai';
                } catch (openaiError) {
                    console.error('OpenAI also failed, trying Ollama (local):', openaiError);
                    // Final fallback: Ollama local AI (works offline!)
                    try {
                        response = await callOllama(messages);
                        apiMode = 'ollama_offline';
                        console.log('✓ Ollama offline mode successful');
                    } catch (ollamaError) {
                        console.error('All AI providers failed including Ollama:', ollamaError);
                        response = "All my AI connections are down. If you're offline, make sure Ollama is running (ollama serve). Try again?";
                        apiMode = 'all_failed';
                    }
                }
            }
        }

        // Store Araya's response to memory
        if (user_id) {
            storeMessage(user_id, 'assistant', response);
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': corsOrigin,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response,
                isAdmin: isAdmin || false,
                patterns: patterns.needsAttention ? patterns : null,
                mode: apiMode,
                cheapMode: CHEAP_MODE,
                arayaMode: effectiveMode || mode,
                hasMemory: !!memory.profile,
                hasBrain: brainContext.length > 0,
                brainHits: brainContext.length,
                interactions: memory.total_interactions,
                userName: memory.profile?.name || null,
                nameExtracted: nameExtracted,
                hasVision: hasImages,
                imagesProcessed: imageAttachments.length,
                imagesStored: storedImageIds.length,
                storedImageIds: storedImageIds.length > 0 ? storedImageIds : null,
                ability: abilityResult,
                abilityUsed: detectedAbility?.key || null,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Araya API error:', error);

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': corsOrigin,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: error.message,
                response: "Something broke. Try again?",
                mode: 'error'
            })
        };
    }
}
