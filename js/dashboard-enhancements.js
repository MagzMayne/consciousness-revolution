// RootIB: RB-20260319142113-FC703236
/**
 * dashboard-enhancements.js — Consciousness Revolution
 * ══════════════════════════════════════════════════════════════
 * Applies the standard dashboard.html enhancements to every
 * dashboard page that includes this script:
 *
 *  1. Full-page loading screen with spinner (hidden after auth).
 *  2. Auth check via /.netlify/functions/auth-me; redirect to
 *     /auth.html when the session is missing or invalid.
 *  3. Populates user display slots (id="user-display", "user-name",
 *     "user-email", "user-tier", "user-score", "contrib-tier",
 *     "member-since") when those elements exist.
 *  4. Injects a compact user-info + logout strip into the page
 *     header if no user controls are already present.
 *  5. Wires the logout function (window.dashboardLogout).
 *  6. Handles Stripe return params (?success=true / ?cancelled=true).
 *
 * Usage:
 *   <script src="/js/dashboard-enhancements.js" defer></script>
 * ══════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    /* ── Config ─────────────────────────────────────────────── */
    const AUTH_ME_URL   = '/.netlify/functions/auth-me';
    const LOGOUT_URL    = '/.netlify/functions/auth-logout';
    const AUTH_PAGE     = '/auth.html';
    const LOADING_ID    = 'cr-dash-loading';
    const USER_STRIP_ID = 'cr-dash-user-strip';

    /* ── 1. Inject loading-screen CSS ───────────────────────── */
    function injectStyles() {
        if (document.getElementById('cr-dash-styles')) return;
        const style = document.createElement('style');
        style.id = 'cr-dash-styles';
        style.textContent = `
/* ── CR Dashboard Enhancements ── */
#${LOADING_ID} {
    position: fixed;
    inset: 0;
    background: #0a0a0f;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    transition: opacity 0.4s ease;
}
#${LOADING_ID}.cr-hidden {
    opacity: 0;
    pointer-events: none;
}
.cr-dash-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #333;
    border-top-color: #7b2cbf;
    border-radius: 50%;
    animation: cr-spin 1s linear infinite;
}
@keyframes cr-spin { to { transform: rotate(360deg); } }

/* User strip injected into header */
#${USER_STRIP_ID} {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    font-family: 'Segoe UI', system-ui, sans-serif;
}
.cr-dash-user-email {
    color: #888;
    font-size: 0.9rem;
}
.cr-dash-logout-btn {
    padding: 8px 18px;
    background: transparent;
    border: 1px solid #7b2cbf;
    border-radius: 8px;
    color: #7b2cbf;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
}
.cr-dash-logout-btn:hover {
    background: #7b2cbf;
    color: #fff;
}
`;
        document.head.appendChild(style);
    }

    /* ── 2. Inject loading-screen HTML ──────────────────────── */
    function injectLoadingScreen() {
        if (document.getElementById(LOADING_ID)) return;
        const el = document.createElement('div');
        el.id = LOADING_ID;
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-label', 'Loading…');
        el.innerHTML = '<div class="cr-dash-spinner"></div>';
        // Prepend as first child so it sits above everything
        document.body.insertBefore(el, document.body.firstChild);
    }

    /* ── 3. Hide loading screen ─────────────────────────────── */
    function hideLoading() {
        const el = document.getElementById(LOADING_ID);
        if (!el) return;
        el.classList.add('cr-hidden');
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
    }

    /* ── Helper: safe display name from user object ─────────── */
    function getDisplayName(user) {
        if (!user) return 'User';
        if (user.full_name && user.full_name.trim()) return user.full_name.trim();
        if (user.email) return user.email.split('@')[0];
        return 'User';
    }

    /* ── 4. Populate known user-display slots ───────────────── */
    function populateUserSlots(user) {
        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el && value !== undefined && value !== null) el.textContent = value;
        };

        set('user-display', user.email || '');
        set('user-name',    getDisplayName(user));
        set('user-email',   user.email || '');
        set('user-tier',    user.account_tier || 'explorer');
        set('user-score',   user.contribution_score ?? '0');
        set('contrib-tier', user.contribution_tier || 'newcomer');

        if (user.created_at) {
            const date = new Date(user.created_at);
            set('member-since', date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        }
    }

    /* ── 5. Inject user strip into the page header ──────────── */
    function injectUserStrip(user) {
        if (document.getElementById(USER_STRIP_ID)) return;

        // Only inject if there's a <header> element and it doesn't
        // already contain a logout button or user-display element.
        const header = document.querySelector('header');
        if (!header) return;
        if (header.querySelector('[id*="user"], [class*="logout"], [class*="user-menu"]')) return;

        const strip = document.createElement('div');
        strip.id = USER_STRIP_ID;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'cr-dash-user-email';
        nameSpan.setAttribute('aria-label', 'Logged in as ' + (user.email || 'user'));
        nameSpan.textContent = getDisplayName(user);

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'cr-dash-logout-btn';
        logoutBtn.setAttribute('aria-label', 'Logout');
        logoutBtn.textContent = 'Logout';
        logoutBtn.addEventListener('click', function () { window.dashboardLogout(); });

        strip.appendChild(nameSpan);
        strip.appendChild(logoutBtn);
        header.appendChild(strip);
    }

    /* ── 6. Logout function ─────────────────────────────────── */
    window.dashboardLogout = async function () {
        try {
            await fetch(LOGOUT_URL, { method: 'POST', credentials: 'include' });
        } catch (err) {
            console.warn('[dashboard-enhancements] Logout request failed (continuing):', err.message);
        }
        window.location.href = AUTH_PAGE;
    };

    /* ── 7. Handle Stripe return params ─────────────────────── */
    function handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            // Clean URL silently
            window.history.replaceState({}, '', window.location.pathname);
            // Show a brief success message if there's a notification helper
            if (typeof showNotification === 'function') {
                showNotification('Payment successful! Thank you.', 'success');
            }
        }
        if (params.get('cancelled') === 'true') {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }

    /* ── 8. Auth check ──────────────────────────────────────── */
    async function loadUser() {
        try {
            const res = await fetch(AUTH_ME_URL, { credentials: 'include' });
            if (!res.ok) {
                window.location.href = AUTH_PAGE;
                return;
            }
            const data = await res.json();
            const user = data.user || data;
            if (!user || !user.email) {
                window.location.href = AUTH_PAGE;
                return;
            }

            populateUserSlots(user);
            injectUserStrip(user);
            hideLoading();
        } catch (err) {
            console.error('[dashboard-enhancements] Auth check failed:', err);
            window.location.href = AUTH_PAGE;
        }
    }

    /* ── Bootstrap ──────────────────────────────────────────── */
    function init() {
        injectStyles();
        injectLoadingScreen();
        handleUrlParams();
        loadUser();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
