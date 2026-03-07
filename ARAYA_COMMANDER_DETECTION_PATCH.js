// ═══════════════════════════════════════════════════════════════
// ARAYA COMMANDER DETECTION - 4-Layer Bypass System
// Built: March 6, 2026 by C1 Mechanic
// ═══════════════════════════════════════════════════════════════
// INSERT THIS CODE INTO: netlify/functions/araya-chat.mjs
// LOCATION: BEFORE line 1826 (before isCommander check)
// ═══════════════════════════════════════════════════════════════

/**
 * Multi-layer Commander detection system
 * Ensures Commander always bypasses paywall regardless of login state
 *
 * @param {string} user_id - User ID from frontend (email or UUID)
 * @param {object} headers - Request headers from Netlify event
 * @param {string} ip - Client IP address
 * @param {object} metadata - Message metadata from frontend
 * @returns {boolean} - True if Commander detected
 */
function detectCommander(user_id, headers, ip, metadata = {}) {
    const COMMANDER_EMAILS = ['darrickpreble@proton.me', 'darrickpreble@gmail.com'];

    // Add your home/office IP prefixes here (check whatismyip.com)
    const COMMANDER_IP_PREFIXES = [
        '192.168',    // Local network
        '10.0',       // Private network
        '127.0.0.1',  // Localhost
        // Add your actual public IP first 2 octets: '123.45'
    ];

    // VPN network identifiers (if you use Tailscale/ZeroTier)
    const COMMANDER_NETWORKS = ['Tailscale', 'ZeroTier'];

    // ──────────────────────────────────────────────────────────────
    // LAYER 1: Email Match (Existing Logic)
    // ──────────────────────────────────────────────────────────────
    if (user_id && COMMANDER_EMAILS.includes(user_id.toLowerCase())) {
        console.log('[COMMANDER] ✓ Detected via email:', user_id);
        return true;
    }

    // ──────────────────────────────────────────────────────────────
    // LAYER 2: IP Prefix Match (Local Network Detection)
    // ──────────────────────────────────────────────────────────────
    const clientIp = headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     headers['x-real-ip'] ||
                     ip;

    if (clientIp) {
        const isLocalNetwork = COMMANDER_IP_PREFIXES.some(prefix =>
            clientIp.startsWith(prefix)
        );

        if (isLocalNetwork) {
            console.log('[COMMANDER] ✓ Detected via local network IP:', clientIp);
            return true;
        }
    }

    // ──────────────────────────────────────────────────────────────
    // LAYER 3: Custom Header (Browser Extension/Bookmarklet)
    // ──────────────────────────────────────────────────────────────
    const commanderHeader = headers['x-commander-key'];
    const expectedKey = process.env.COMMANDER_SECRET;

    if (commanderHeader && expectedKey && commanderHeader === expectedKey) {
        console.log('[COMMANDER] ✓ Detected via custom header');
        return true;
    }

    // ──────────────────────────────────────────────────────────────
    // LAYER 4: Emergency Bypass Token (URL Parameter)
    // ──────────────────────────────────────────────────────────────
    // This comes from frontend via message metadata
    if (metadata?.commander_bypass && expectedKey) {
        if (metadata.commander_bypass === expectedKey) {
            console.log('[COMMANDER] ✓ Detected via emergency bypass token');
            return true;
        }
    }

    // ──────────────────────────────────────────────────────────────
    // LAYER 5: VPN Network Detection (Optional)
    // ──────────────────────────────────────────────────────────────
    const userAgent = headers['user-agent'] || '';
    const hasVPN = COMMANDER_NETWORKS.some(network =>
        userAgent.includes(network)
    );

    if (hasVPN) {
        console.log('[COMMANDER] ✓ Detected via VPN network:', userAgent);
        return true;
    }

    // Not detected as Commander
    return false;
}

// ═══════════════════════════════════════════════════════════════
// INTEGRATION INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════

/*
 * STEP 1: Add function to araya-chat.mjs (around line 1260, after checkSubscriptionStatus)
 *
 * STEP 2: Replace line 1827-1831:
 *
 * FROM:
 *   const isCommander = user_id && COMMANDER_EMAILS.includes(user_id.toLowerCase());
 *
 * TO:
 *   const isCommander = detectCommander(
 *       user_id,
 *       event.headers,
 *       event.requestContext?.identity?.sourceIp,
 *       message_metadata // Pass metadata from frontend
 *   );
 *
 * STEP 3: Extract metadata from frontend message:
 *
 * In araya-chat.mjs, around line 1760 (where message parsing happens):
 *
 *   const message = body.message;
 *   const message_metadata = body.metadata || {}; // ADD THIS LINE
 *
 * STEP 4: Add to Netlify environment variables:
 *
 *   COMMANDER_SECRET=Kill50780630#
 *
 * STEP 5: Frontend changes (araya-chat.html):
 *
 * Add before sendMessage() function:
 *
 *   function getCommanderBypass() {
 *       const urlParams = new URLSearchParams(window.location.search);
 *       const commanderParam = urlParams.get('commander');
 *       const savedBypass = localStorage.getItem('araya_commander_bypass');
 *
 *       if (commanderParam) {
 *           localStorage.setItem('araya_commander_bypass', commanderParam);
 *           return commanderParam;
 *       }
 *
 *       return savedBypass;
 *   }
 *
 * Modify sendMessage() fetch body to include:
 *
 *   body: JSON.stringify({
 *       message: message,
 *       user_id: userId,
 *       metadata: {
 *           commander_bypass: getCommanderBypass(),
 *           user_agent: navigator.userAgent,
 *           timestamp: Date.now()
 *       }
 *   })
 *
 * STEP 6: Test emergency bypass URL:
 *
 *   https://conciousnessrevolution.io/araya-chat.html?commander=Kill50780630#
 *
 * Expected: No paywall, even if not logged in and not on local network
 */

// ═══════════════════════════════════════════════════════════════
// TESTING CHECKLIST
// ═══════════════════════════════════════════════════════════════

/*
 * Test 1: Email Detection
 *   - Login as darrickpreble@proton.me
 *   - Send 10 messages
 *   - Expected: No paywall, logs show "[COMMANDER] ✓ Detected via email"
 *
 * Test 2: Local Network Detection
 *   - Clear cookies/localStorage (logout)
 *   - Access from home network (same WiFi as development machine)
 *   - Send 10 messages
 *   - Expected: No paywall, logs show "[COMMANDER] ✓ Detected via local network IP"
 *
 * Test 3: Emergency Bypass URL
 *   - Clear cookies/localStorage
 *   - Access from different network (mobile hotspot)
 *   - Open: https://conciousnessrevolution.io/araya-chat.html?commander=Kill50780630#
 *   - Send 10 messages
 *   - Expected: No paywall, logs show "[COMMANDER] ✓ Detected via emergency bypass token"
 *
 * Test 4: Custom Header (Advanced)
 *   - Use browser extension or Postman to add header: "X-Commander-Key: Kill50780630#"
 *   - Send message
 *   - Expected: No paywall, logs show "[COMMANDER] ✓ Detected via custom header"
 *
 * Test 5: Normal User (Verification)
 *   - Clear all bypass methods
 *   - Access as anonymous user (no login, different network, no URL param)
 *   - Send 7 messages
 *   - Expected: Paywall shows after message 7
 */

// ═══════════════════════════════════════════════════════════════
// BOOKMARKLET FOR QUICK BYPASS (Optional)
// ═══════════════════════════════════════════════════════════════

/*
 * Create a browser bookmark with this URL:
 *
 * javascript:(function(){const bypass='Kill50780630#';localStorage.setItem('araya_commander_bypass',bypass);alert('Commander bypass enabled!');location.reload();})();
 *
 * Click this bookmark on any ARAYA page to activate bypass without URL parameter
 */

// ═══════════════════════════════════════════════════════════════
// ROLLBACK PLAN
// ═══════════════════════════════════════════════════════════════

/*
 * If Commander detection breaks production:
 *
 * EMERGENCY TEMP FIX (in araya-chat.mjs, line ~1830):
 *
 *   const isPaidUser = true; // TEMP: bypass all paywalls for everyone
 *
 * Then redeploy immediately while you debug the issue.
 *
 * PROPER ROLLBACK:
 *
 *   git checkout HEAD~1 netlify/functions/araya-chat.mjs
 *   netlify deploy --prod --dir=.
 */

// ═══════════════════════════════════════════════════════════════
// END OF PATCH
// ═══════════════════════════════════════════════════════════════
