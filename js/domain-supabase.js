// RootIB: RB-20260319142113-1F905F3B
/**
 * DOMAIN SUPABASE MODULE
 * Trinity Architecture - Shared data layer for all 7 domain dashboards
 *
 * Features:
 * - Supabase client initialization
 * - Connection status management
 * - Service status lights
 * - 30-second polling cycle
 * - Domain-specific data loading
 *
 * Usage: Include this script in any PERSONAL_DOMAIN_*.html dashboard
 * <script src="js/domain-supabase.js"></script>
 *
 * Created: 2026-02-22
 * Pattern: 3 → 7 → 13 → ∞
 */

// ═══════════════════════════════════════════════════════════════
// SUPABASE CONFIGURATION
// Project: iadptixzmckbetwpoycq
// Credentials loaded at runtime from /api/supabase-config relay.
// ═══════════════════════════════════════════════════════════════

// Resolved at runtime via initDomainSupabase() → window.getSupabaseClient()
// Do NOT hard-code project credentials here.
let _domainSupabaseUrl = null;
let _domainSupabaseAnonKey = null;

let supabaseClient = null;
let isConnected = false;
let currentDomain = null;

// Domain to table mapping
const DOMAIN_CONFIG = {
    '1_COMMAND': { color: '#ff4444', tables: ['task_queue', 'node_messages'], node: 'COMMAND' },
    '2_BUILD': { color: '#ff8800', tables: ['task_queue', 'project_progress'], node: 'BUILD' },
    '3_CONNECT': { color: '#ffdd00', tables: ['team_roster', 'node_messages'], node: 'CONNECT' },
    '4_PROTECT': { color: '#00ff88', tables: ['legal_cases', 'evidence'], node: 'PROTECT' },
    '5_GROW': { color: '#00aaff', tables: ['revenue_metrics', 'conversions'], node: 'GROW' },
    '6_LEARN': { color: '#8844ff', tables: ['courses', 'progress'], node: 'LEARN' },
    '7_TRANSCEND': { color: '#ff44ff', tables: ['consciousness_metrics', 'patterns'], node: 'TRANSCEND' }
};

// ═══════════════════════════════════════════════════════════════
// CONNECTION STATUS
// ═══════════════════════════════════════════════════════════════

function updateConnectionStatus(status) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');

    if (!dot || !text) return;

    dot.classList.remove('connected', 'connecting', 'offline');

    if (status === 'connected') {
        dot.classList.add('connected');
        text.textContent = 'Live';
        isConnected = true;
    } else if (status === 'connecting') {
        dot.classList.add('connecting');
        text.textContent = 'Connecting...';
    } else {
        text.textContent = 'Offline';
        isConnected = false;
    }
}

// ═══════════════════════════════════════════════════════════════
// SERVICE STATUS LIGHTS
// ═══════════════════════════════════════════════════════════════

function setServiceStatus(serviceId, status) {
    const light = document.querySelector(`#service-${serviceId} .light`);
    if (light) {
        light.classList.remove('online', 'offline', 'checking');
        light.classList.add(status);
    }
}

async function checkServiceStatus() {
    // Supabase check
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient.from('atoms').select('id').limit(1);
            setServiceStatus('supabase', error ? 'offline' : 'online');
        }
    } catch (e) {
        setServiceStatus('supabase', 'offline');
    }

    // Netlify check
    try {
        const response = await fetch('/.netlify/functions/trinity-status', { method: 'GET' });
        setServiceStatus('netlify', response.ok ? 'online' : 'offline');
    } catch (e) {
        setServiceStatus('netlify', 'offline');
    }

    // GitHub API check
    try {
        const response = await fetch('https://api.github.com/repos/overkillkulture/consciousness-revolution/commits?per_page=1');
        setServiceStatus('github', response.ok ? 'online' : 'offline');
    } catch (e) {
        setServiceStatus('github', 'offline');
    }

    // Brain check
    setServiceStatus('brain', 'online');

    // Update timestamp
    const refreshEl = document.getElementById('lastRefresh');
    if (refreshEl) {
        refreshEl.textContent = 'Last: ' + new Date().toLocaleTimeString();
    }
}

// ═══════════════════════════════════════════════════════════════
// SUPABASE INITIALIZATION
// ═══════════════════════════════════════════════════════════════

async function initDomainSupabase(domainId) {
    currentDomain = domainId;

    try {
        updateConnectionStatus('connecting');

        // Prefer the centralised client (supabase-client.js) when available
        if (typeof window.getSupabaseClient === 'function') {
            supabaseClient = await window.getSupabaseClient();
        } else if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            // Fallback: load credentials from the secure relay
            const cfgRes = await fetch('/api/supabase-config');
            const cfg = cfgRes.ok ? await cfgRes.json() : {};
            if (cfg.auth && cfg.url && cfg.anonKey) {
                _domainSupabaseUrl     = cfg.url;
                _domainSupabaseAnonKey = cfg.anonKey;
                supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
            }
        }

        if (!supabaseClient) {
            console.warn('[DomainSupabase] Supabase client unavailable, using fallback');
            updateConnectionStatus('offline');
            loadFallbackData(domainId);
            return;
        }

        // Test connection
        const { data, error } = await supabaseClient.from('atoms').select('id').limit(1);
        if (error) throw error;

        updateConnectionStatus('connected');
        await loadDomainData(domainId);
    } catch (error) {
        console.error('[DomainSupabase] Init error:', error);
        updateConnectionStatus('offline');
        loadFallbackData(domainId);
    }
}

// ═══════════════════════════════════════════════════════════════
// LOAD DOMAIN DATA
// ═══════════════════════════════════════════════════════════════

async function loadDomainData(domainId) {
    if (!supabaseClient) return;

    const config = DOMAIN_CONFIG[domainId];
    if (!config) return;

    try {
        // Load task queue for this domain
        const { data: tasks } = await supabaseClient
            .from('task_queue')
            .select('*')
            .eq('domain', domainId)
            .order('priority', { ascending: false })
            .limit(10);

        // Load node messages
        const { data: messages } = await supabaseClient
            .from('node_messages')
            .select('*')
            .eq('to_node', config.node)
            .order('created_at', { ascending: false })
            .limit(5);

        // Update readouts
        updateReadouts(tasks, messages, domainId);

        // Update brain status
        const { count } = await supabaseClient.from('atoms').select('id', { count: 'exact', head: true });
        const brainEl = document.getElementById('brainStatus');
        if (brainEl && count) {
            brainEl.textContent = count.toLocaleString() + ' atoms ready';
        }

    } catch (error) {
        console.error('Error loading domain data:', error);
    }
}

function updateReadouts(tasks, messages, domainId) {
    // BLACK SWAN (#1)
    if (tasks && tasks.length > 0) {
        const highPriority = tasks.find(t => t.priority === 'high' || t.priority === 1);
        if (highPriority) {
            const bsValue = document.getElementById('blackSwanValue');
            const bsImpact = document.getElementById('blackSwanImpact');
            if (bsValue) bsValue.textContent = highPriority.title || highPriority.content;
            if (bsImpact) bsImpact.textContent = highPriority.impact || 'High priority task';
        }

        const nextEl = document.getElementById('readoutNext');
        if (nextEl) nextEl.textContent = tasks[0]?.title || 'Check tasks';
    }

    // INBOX (#2)
    if (messages) {
        const inboxEl = document.getElementById('readoutInbox');
        if (inboxEl) inboxEl.textContent = messages.length + ' new';
    }
}

function loadFallbackData(domainId) {
    const domainNames = {
        '1_COMMAND': 'Command operations',
        '2_BUILD': 'Project development',
        '3_CONNECT': 'Team communications',
        '4_PROTECT': 'Security protocols',
        '5_GROW': 'Growth metrics',
        '6_LEARN': 'Knowledge expansion',
        '7_TRANSCEND': 'Consciousness evolution'
    };

    const bsValue = document.getElementById('blackSwanValue');
    const bsImpact = document.getElementById('blackSwanImpact');
    const inboxEl = document.getElementById('readoutInbox');
    const nextEl = document.getElementById('readoutNext');

    if (bsValue) bsValue.textContent = domainNames[domainId] || 'Loading...';
    if (bsImpact) bsImpact.textContent = 'Connect to Supabase for real-time data';
    if (inboxEl) inboxEl.textContent = '-- ';
    if (nextEl) nextEl.textContent = 'Connect to view';
}

// ═══════════════════════════════════════════════════════════════
// 30-SECOND POLLING
// ═══════════════════════════════════════════════════════════════

function startDomainPolling(domainId) {
    // Initial check
    checkServiceStatus();

    // Poll every 30 seconds
    setInterval(() => {
        if (isConnected) {
            loadDomainData(domainId);
        }
        checkServiceStatus();
    }, 30000);
}

// ═══════════════════════════════════════════════════════════════
// AUTO-INIT (Detect domain from page)
// ═══════════════════════════════════════════════════════════════

function autoInitDomain() {
    // Try to detect domain from Dashboard DNA
    const dnaScript = document.getElementById('dashboard-dna');
    if (dnaScript) {
        try {
            const dna = JSON.parse(dnaScript.textContent);
            if (dna.domain) {
                initDomainSupabase(dna.domain);
                startDomainPolling(dna.domain);
                return;
            }
        } catch (e) {
            console.warn('Could not parse dashboard DNA:', e);
        }
    }

    // Fallback: detect from URL
    const path = window.location.pathname;
    const match = path.match(/PERSONAL_DOMAIN_(\d)_/);
    if (match) {
        const domainNum = match[1];
        const domains = ['1_COMMAND', '2_BUILD', '3_CONNECT', '4_PROTECT', '5_GROW', '6_LEARN', '7_TRANSCEND'];
        const domainId = domains[parseInt(domainNum) - 1];
        if (domainId) {
            initDomainSupabase(domainId);
            startDomainPolling(domainId);
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// MOBILE SWIPE GESTURES (Tier Slider)
// ═══════════════════════════════════════════════════════════════

function initSwipeGestures() {
    const tierSlider = document.querySelector('.tier-slider');
    if (!tierSlider) return;

    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50; // Minimum swipe distance in pixels

    const tiers = ['personal', 'team', 'public'];

    function getCurrentTier() {
        if (document.body.classList.contains('view-team')) return 'team';
        if (document.body.classList.contains('view-public')) return 'public';
        return 'personal';
    }

    function setTierBySwipe(direction) {
        const current = getCurrentTier();
        const currentIndex = tiers.indexOf(current);
        let newIndex;

        if (direction === 'left') {
            // Swipe left = go to next tier (personal → team → public)
            newIndex = Math.min(currentIndex + 1, tiers.length - 1);
        } else {
            // Swipe right = go to previous tier (public → team → personal)
            newIndex = Math.max(currentIndex - 1, 0);
        }

        const newTier = tiers[newIndex];
        if (newTier !== current && typeof window.setTier === 'function') {
            window.setTier(newTier);
            // Haptic feedback (if available)
            if (navigator.vibrate) navigator.vibrate(15);
        }
    }

    tierSlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    tierSlider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const distance = touchEndX - touchStartX;

        if (Math.abs(distance) > minSwipeDistance) {
            setTierBySwipe(distance > 0 ? 'right' : 'left');
        }
    }, { passive: true });

    // Add swipe hint animation on mobile
    if ('ontouchstart' in window) {
        const hint = document.createElement('div');
        hint.className = 'swipe-hint';
        hint.innerHTML = '← swipe →';
        hint.style.cssText = 'text-align:center;font-size:0.7rem;color:#555;margin-top:5px;animation:fadeOut 3s forwards;';
        tierSlider.appendChild(hint);

        // Remove hint after first interaction
        tierSlider.addEventListener('touchstart', () => {
            hint.remove();
        }, { once: true });
    }

    console.log('🔄 Mobile swipe gestures initialized');
}

// Export for external use
window.DomainSupabase = {
    init: initDomainSupabase,
    startPolling: startDomainPolling,
    autoInit: autoInitDomain,
    checkServices: checkServiceStatus,
    loadData: loadDomainData,
    getConfig: () => DOMAIN_CONFIG,
    isConnected: () => isConnected,
    initSwipe: initSwipeGestures
};

// Auto-init on DOMContentLoaded if script is included
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        autoInitDomain();
        initSwipeGestures();
    });
} else {
    autoInitDomain();
    initSwipeGestures();
}
