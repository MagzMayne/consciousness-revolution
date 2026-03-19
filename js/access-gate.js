// RootIB: RB-20260319142113-F617C473
/**
 * ACCESS GATE - Client-side 3-Layer Security Enforcement
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pattern: PERSONAL → TEAM → PUBLIC | 3 → 7 → 13 → ∞
 *
 * Usage: Include in <head> of protected pages
 * <script src="/js/access-gate.js" data-tier="TEAM"></script>
 *
 * Data Attributes:
 * - data-tier: "PERSONAL" | "TEAM" | "PUBLIC"
 * - data-skip-badge: "true" (optional - hide level badge)
 *
 * Flow:
 * 1. Get user session from localStorage
 * 2. Call check-access.mjs API
 * 3. If denied → Show access denied screen + redirect
 * 4. If granted → Show level badge (optional) + allow page load
 */

(async function AccessGate() {
    // Get configuration from script tag
    const scriptTag = document.currentScript;
    const tier = scriptTag.getAttribute('data-tier') || 'PUBLIC';
    const skipBadge = scriptTag.getAttribute('data-skip-badge') === 'true';

    console.log(`[ACCESS-GATE] Checking access for tier: ${tier}`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Get user from localStorage
    // ═══════════════════════════════════════════════════════════════
    const userData = localStorage.getItem('cr_user_session');

    if (!userData) {
        console.log('[ACCESS-GATE] No user session found - redirecting to login');
        redirectToLogin();
        return;
    }

    let user;
    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error('[ACCESS-GATE] Invalid session data:', error);
        redirectToLogin();
        return;
    }

    // Validate user object has required fields
    if (!user.discord_user_id) {
        console.error('[ACCESS-GATE] Invalid user session - missing discord_user_id');
        redirectToLogin();
        return;
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Check access via API
    // ═══════════════════════════════════════════════════════════════
    const currentPath = window.location.pathname;

    try {
        const response = await fetch('/.netlify/functions/check-access', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user.discord_user_id,
                resource_path: currentPath,
                resource_tier: tier
            })
        });

        const result = await response.json();

        // ═══════════════════════════════════════════════════════════════
        // STEP 3: Handle response
        // ═══════════════════════════════════════════════════════════════
        if (!result.allowed) {
            console.log('[ACCESS-GATE] Access denied:', result.reason);
            showAccessDenied(result);
            return;
        }

        // ✅ ACCESS GRANTED
        console.log(`[ACCESS-GATE] ✅ Access granted: ${tier} tier (Level ${result.user.level})`);

        // Show level badge (unless disabled)
        if (!skipBadge) {
            showLevelBadge(result.user);
        }

        // Store access permission for page scripts
        window.ACCESS_GRANTED = {
            tier,
            user: result.user,
            timestamp: Date.now()
        };

        // Emit event for page to respond to
        window.dispatchEvent(new CustomEvent('access-granted', {
            detail: window.ACCESS_GRANTED
        }));

    } catch (error) {
        console.error('[ACCESS-GATE] API error:', error);
        showError('Connection error. Please try again.');
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function redirectToLogin() {
        const redirectUrl = encodeURIComponent(window.location.href);
        window.location.href = `/login.html?redirect=${redirectUrl}`;
    }

    function showAccessDenied(result) {
        // Replace page content with access denied screen
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #000000 0%, #1a0033 100%);
                color: #ffffff;
                font-family: 'Courier New', monospace;
                padding: 2rem;
            ">
                <div style="
                    text-align: center;
                    max-width: 600px;
                    padding: 3rem;
                    background: rgba(0, 0, 0, 0.8);
                    border: 3px solid #ff0066;
                    border-radius: 15px;
                    box-shadow: 0 0 30px rgba(255, 0, 102, 0.5);
                ">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🚫</div>
                    <h1 style="
                        font-size: 2.5rem;
                        margin: 0 0 1rem 0;
                        color: #ff0066;
                        text-shadow: 0 0 10px rgba(255, 0, 102, 0.5);
                    ">ACCESS DENIED</h1>

                    <p style="
                        font-size: 1.2rem;
                        margin: 1rem 0;
                        color: #00ff88;
                    ">${escapeHtml(result.reason)}</p>

                    ${result.current_level ? `
                        <div style="
                            margin: 2rem 0;
                            padding: 1rem;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 10px;
                        ">
                            <div style="color: #888; font-size: 0.9rem;">Current Level</div>
                            <div style="font-size: 1.5rem; color: #00ffff; margin: 0.5rem 0;">
                                ${result.current_level}
                            </div>
                            ${result.current_xp !== undefined ? `
                                <div style="color: #00ff88; font-size: 1.1rem;">
                                    ${result.current_xp} / ${result.needed_xp} XP
                                </div>
                            ` : ''}
                        </div>

                        <div style="
                            margin: 2rem 0;
                            padding: 1rem;
                            background: rgba(0, 255, 136, 0.1);
                            border: 2px solid #00ff88;
                            border-radius: 10px;
                        ">
                            <div style="color: #00ff88; font-size: 0.9rem;">Required Level</div>
                            <div style="font-size: 1.5rem; color: #ffffff; margin: 0.5rem 0;">
                                ${result.required_level}
                            </div>
                        </div>
                    ` : ''}

                    ${result.action ? `
                        <p style="
                            margin: 2rem 0 1rem 0;
                            color: #ffffff;
                            font-size: 1rem;
                        ">${escapeHtml(result.action)}</p>
                    ` : ''}

                    ${result.redirect ? `
                        <a href="${escapeHtml(result.redirect)}" style="
                            display: inline-block;
                            margin: 1rem 0;
                            padding: 1rem 2rem;
                            background: linear-gradient(135deg, #00ff88 0%, #00ffff 100%);
                            color: #000000;
                            text-decoration: none;
                            font-weight: bold;
                            font-size: 1.1rem;
                            border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            🚀 UNLOCK ACCESS
                        </a>
                    ` : ''}

                    <div style="margin-top: 2rem;">
                        <a href="/" style="color: #888; text-decoration: none; font-size: 0.9rem;">
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    function showLevelBadge(user) {
        // Create fixed badge in top-right corner
        const badge = document.createElement('div');
        badge.id = 'access-level-badge';
        badge.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff88;
            padding: 0.75rem 1.5rem;
            border: 2px solid #00ff88;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            z-index: 999999;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            backdrop-filter: blur(10px);
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        badge.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 0.8rem; color: #888; margin-bottom: 0.25rem;">
                    ${tier} ACCESS
                </div>
                <div style="font-size: 1.1rem; font-weight: bold;">
                    LVL ${user.level_number}: ${user.level}
                </div>
                <div style="font-size: 0.85rem; color: #00ffff; margin-top: 0.25rem;">
                    ${user.xp} XP
                </div>
            </div>
        `;

        // Click to expand
        badge.addEventListener('click', () => {
            badge.style.transform = badge.style.transform === 'scale(1.1)' ? 'scale(1)' : 'scale(1.1)';
        });

        // Hover effect
        badge.addEventListener('mouseenter', () => {
            badge.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.6)';
        });
        badge.addEventListener('mouseleave', () => {
            badge.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
        });

        document.body.appendChild(badge);
    }

    function showError(message) {
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;font-family:monospace;">
                <div style="text-align:center;max-width:500px;padding:2rem;border:2px solid #ffaa00;">
                    <h1 style="color:#ffaa00;">⚠️ ERROR</h1>
                    <p>${escapeHtml(message)}</p>
                    <button onclick="location.reload()" style="margin-top:1rem;padding:0.5rem 1rem;background:#ffaa00;border:none;color:#000;cursor:pointer;font-family:monospace;">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

})();

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT FOR TESTING
// ═══════════════════════════════════════════════════════════════════════════
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessGate };
}
