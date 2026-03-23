// RootIB: RB-20260323000000-SUPABASE01
/**
 * supabase-client.js — Consciousness Revolution
 * ══════════════════════════════════════════════════════════════════════════
 * Universal browser-side Supabase client for the Consciousness Revolution
 * platform.
 *
 * Project: iadptixzmckbetwpoycq (https://iadptixzmckbetwpoycq.supabase.co)
 *
 * Credentials are fetched at runtime from the secure server relay at
 * /api/supabase-config so they are NEVER committed to the repository.
 *
 * Usage:
 *   <!-- 1. Load the Supabase JS library -->
 *   <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
 *   <!-- 2. Load this module -->
 *   <script src="/js/supabase-client.js"></script>
 *
 * After the `crSupabaseReady` event fires on `document`:
 *   const client = await window.getSupabaseClient();
 *   const { data } = await client.from('my_table').select('*');
 *
 * window.CR_SUPABASE is also available immediately after init for
 * backward-compat with modules that check for it synchronously.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // Canonical Supabase project for this platform
    const CANONICAL_PROJECT = 'iadptixzmckbetwpoycq';
    const CONFIG_RELAY_URL  = '/api/supabase-config';

    let _client      = null;   // supabase.SupabaseClient singleton
    let _initPromise = null;   // Promise<client | null>
    let _ready       = false;

    /**
     * Initialise the Supabase client by loading credentials from the
     * server-side relay.  Subsequent calls return the cached promise.
     * @returns {Promise<import('@supabase/supabase-js').SupabaseClient | null>}
     */
    async function initSupabaseClient() {
        if (_initPromise) return _initPromise;

        _initPromise = (async () => {
            try {
                const res = await fetch(CONFIG_RELAY_URL);
                if (!res.ok) throw new Error(`Config relay returned ${res.status}`);

                const cfg = await res.json();

                if (!cfg.auth || !cfg.url || !cfg.anonKey) {
                    console.warn(
                        '[CR Supabase] Credentials not configured.',
                        cfg.message || 'Set SUPABASE_URL and SUPABASE_ANON_KEY in Netlify env vars.'
                    );
                    _dispatchReady(null);
                    return null;
                }

                // Validate we're connecting to the expected project
                if (!cfg.url.includes(CANONICAL_PROJECT)) {
                    console.warn(
                        `[CR Supabase] Connected to non-canonical project: ${cfg.url}. ` +
                        `Expected project: ${CANONICAL_PROJECT}`
                    );
                }

                if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
                    console.warn('[CR Supabase] @supabase/supabase-js library not loaded. Include it before supabase-client.js.');
                    _dispatchReady(null);
                    return null;
                }

                _client = window.supabase.createClient(cfg.url, cfg.anonKey);

                // Expose on window for modules that check synchronously
                window.CR_SUPABASE = _client;

                _ready = true;
                _dispatchReady(_client);
                return _client;

            } catch (err) {
                console.error('[CR Supabase] Initialisation failed:', err.message);
                _dispatchReady(null);
                return null;
            }
        })();

        return _initPromise;
    }

    function _dispatchReady(client) {
        document.dispatchEvent(new CustomEvent('crSupabaseReady', { detail: { client } }));
    }

    /**
     * Get the singleton Supabase client.  Awaits initialisation if not yet done.
     * @returns {Promise<import('@supabase/supabase-js').SupabaseClient | null>}
     */
    async function getSupabaseClient() {
        if (_client) return _client;
        return initSupabaseClient();
    }

    // ── Public API ───────────────────────────────────────────────────────────
    window.getSupabaseClient = getSupabaseClient;
    window.CR_SUPABASE       = null; // populated after init

    // Auto-initialise when the library is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabaseClient);
    } else {
        initSupabaseClient();
    }
})();
