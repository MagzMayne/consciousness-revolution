/**
 * OVERKORE Update Check Endpoint
 * ==============================
 * Check for available updates and announcements.
 *
 * POST /api/check-update
 * Body: {
 *   product: "araya",
 *   channel: "stable" | "beta" | "canary",
 *   current_version: "2.3.0",
 *   license_key: "OVRK-XXXX-XXXX-XXXX-PRO" (optional)
 * }
 *
 * Response: {
 *   update_available: true,
 *   current_version: "2.3.0",
 *   latest_version: "2.4.0",
 *   download_url: "https://...",
 *   changelog_url: "https://...",
 *   is_critical: false,
 *   announcement: { ... } | null
 * }
 */

import { createClient } from '@supabase/supabase-js';

// Version comparison (semver-lite)
function compareVersions(v1, v2) {
    const parts1 = v1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const parts2 = v2.replace(/[^0-9.]/g, '').split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
}

// Version manifest (fallback if Supabase unavailable)
const VERSION_MANIFEST = {
    araya: {
        stable: {
            version: "2.4.0",
            released: "2026-02-25",
            download_url: "https://conciousnessrevolution.io/releases/araya-2.4.0.zip",
            changelog_url: "https://conciousnessrevolution.io/changelog#2.4.0",
            is_critical: false,
            min_upgrade_from: "2.0.0"
        },
        beta: {
            version: "2.5.0-beta.1",
            released: "2026-02-24",
            download_url: "https://conciousnessrevolution.io/releases/araya-2.5.0-beta.1.zip",
            changelog_url: "https://conciousnessrevolution.io/changelog#2.5.0-beta.1",
            is_critical: false
        },
        canary: {
            version: "2.5.0-canary.5",
            released: "2026-02-25",
            download_url: null,
            changelog_url: null,
            is_critical: false
        }
    },
    overkore: {
        stable: {
            version: "1.0.0",
            released: "2026-02-20",
            download_url: "https://conciousnessrevolution.io/releases/overkore-1.0.0.zip",
            changelog_url: "https://conciousnessrevolution.io/changelog/overkore#1.0.0",
            is_critical: false
        }
    },
    "araya-extension": {
        stable: {
            version: "1.2.0",
            released: "2026-02-15",
            download_url: "https://conciousnessrevolution.io/releases/araya-extension-1.2.0.zip",
            changelog_url: "https://conciousnessrevolution.io/changelog/extension#1.2.0",
            is_critical: false
        }
    }
};

// Static announcements (fallback)
const ANNOUNCEMENTS = [
    {
        id: "license-system-launch",
        type: "info",
        title: "License System Now Available",
        message: "Upgrade to PRO for unlimited messages and all 7 domains.",
        action_text: "Learn More",
        action_url: "https://conciousnessrevolution.io/pricing",
        target_tiers: ["FREE"],
        expires: "2026-03-31"
    }
];

export default async (request, context) => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();
        const {
            product = 'araya',
            channel = 'stable',
            current_version,
            license_key,
            hardware_id
        } = body;

        if (!current_version) {
            return new Response(JSON.stringify({
                error: 'current_version is required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Try to get version from Supabase first
        let latestVersion = null;
        let announcement = null;
        let userTier = 'FREE';

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);

            // Get latest version from releases table
            const { data: releaseData } = await supabase
                .from('releases')
                .select('version, download_url, changelog_url, is_critical, released_at')
                .eq('product_id', product)
                .eq('channel', channel)
                .is('deprecated_at', null)
                .order('released_at', { ascending: false })
                .limit(1)
                .single();

            if (releaseData) {
                latestVersion = releaseData;
            }

            // If license provided, validate and get tier
            if (license_key) {
                const keyHash = await hashKey(license_key);
                const { data: licenseData } = await supabase
                    .from('licenses')
                    .select('tier, is_active, expires_at')
                    .eq('key_hash', keyHash)
                    .single();

                if (licenseData?.is_active) {
                    userTier = licenseData.tier;
                }
            }

            // Get active announcements
            const { data: announcements } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .lte('starts_at', new Date().toISOString())
                .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
                .contains('target_products', [product])
                .limit(1);

            if (announcements?.length > 0) {
                const ann = announcements[0];
                // Filter by tier if specified
                if (!ann.target_tiers || ann.target_tiers.includes(userTier)) {
                    announcement = {
                        id: ann.id,
                        type: ann.type,
                        title: ann.title,
                        message: ann.message,
                        action_text: ann.action_text,
                        action_url: ann.action_url
                    };
                }
            }
        }

        // Fallback to static manifest
        if (!latestVersion) {
            const productManifest = VERSION_MANIFEST[product];
            if (productManifest && productManifest[channel]) {
                latestVersion = productManifest[channel];
            }
        }

        // Fallback to static announcements
        if (!announcement) {
            const staticAnn = ANNOUNCEMENTS.find(a => {
                const notExpired = !a.expires || new Date(a.expires) > new Date();
                const tierMatch = !a.target_tiers || a.target_tiers.includes(userTier);
                return notExpired && tierMatch;
            });
            if (staticAnn) {
                announcement = staticAnn;
            }
        }

        // Build response
        const response = {
            update_available: false,
            current_version,
            latest_version: latestVersion?.version || current_version,
            download_url: null,
            changelog_url: null,
            is_critical: false,
            announcement: announcement || null,
            checked_at: new Date().toISOString()
        };

        if (latestVersion && compareVersions(latestVersion.version, current_version) > 0) {
            response.update_available = true;
            response.download_url = latestVersion.download_url;
            response.changelog_url = latestVersion.changelog_url;
            response.is_critical = latestVersion.is_critical || false;
        }

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });

    } catch (error) {
        console.error('Check update error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};

// Helper: Hash license key
async function hashKey(key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(key.toUpperCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const config = {
    path: "/api/check-update"
};
