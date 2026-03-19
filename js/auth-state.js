// RootIB: RB-20260319142113-9EFC68FF
/**
 * auth-state.js — Consciousness Revolution
 * ════════════════════════════════════════════════════════════════
 * Client-side authentication state manager.
 *
 * Responsibilities:
 *  1. On page load, call /api/auth-me to check the live session.
 *  2. Cache the user profile in memory (and a non-sensitive copy in
 *     localStorage for fast first-paint).
 *  3. Dispatch the custom `crAuthReady` event so any page can react.
 *  4. Inject a lightweight auth widget into pages that include this
 *     script (shows the logged-in user or sign-in/sign-up links).
 *
 * Usage:
 *   <script src="/js/auth-state.js"></script>
 *
 * After load:
 *   window.CRAuth.user          → null | { id, email, full_name, ... }
 *   window.CRAuth.isLoggedIn()  → boolean
 *   window.CRAuth.logout()      → Promise<void>
 *   window.CRAuth.redirectToLogin(returnUrl?) → void
 *
 * DOM hook (optional):
 *   Any element with [data-cr-auth-show="loggedIn"]  is shown when authenticated.
 *   Any element with [data-cr-auth-show="loggedOut"] is shown when unauthenticated.
 *   Any element with [data-cr-user-name]             gets the user's display name.
 * ════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ── Constants ────────────────────────────────────────────────
    const AUTH_ME_URL = '/api/auth-me';
    const LOGOUT_URL  = '/api/auth-logout';
    const LOGIN_PAGE  = '/login.html';
    const DASHBOARD_PAGE = '/SEVEN_DOMAINS_HUB.html';
    const LS_KEY = 'cr_user_cache'; // localStorage key for fast-paint cache

    // ── State ────────────────────────────────────────────────────
    let _user = null;
    let _ready = false;

    // ── Public API ───────────────────────────────────────────────
    window.CRAuth = {
        get user() { return _user; },
        isLoggedIn() { return !!_user; },
        async logout() {
            try {
                await fetch(LOGOUT_URL, { method: 'POST', credentials: 'include' });
            } catch (e) { /* best effort */ }
            _user = null;
            localStorage.removeItem(LS_KEY);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            window.location.href = LOGIN_PAGE;
        },
        redirectToLogin(returnUrl) {
            localStorage.setItem('authRedirect', returnUrl || window.location.href);
            window.location.href = LOGIN_PAGE;
        }
    };

    // ── Helpers ──────────────────────────────────────────────────

    /** Display name: prefer full_name, fall back to email prefix */
    function displayName(user) {
        if (!user) return '';
        if (user.full_name && user.full_name.trim()) return user.full_name.trim();
        return user.email ? user.email.split('@')[0] : 'User';
    }

    /** Escape HTML to prevent XSS when inserting user-supplied content */
    function esc(str) {
        const d = document.createElement('div');
        d.textContent = String(str || '');
        return d.innerHTML;
    }

    // ── DOM Updates ──────────────────────────────────────────────

    function applyAuthState() {
        const loggedIn = !!_user;

        // Show / hide elements by data attribute
        document.querySelectorAll('[data-cr-auth-show]').forEach(el => {
            const target = el.getAttribute('data-cr-auth-show');
            el.style.display =
                (target === 'loggedIn'  &&  loggedIn) ? '' :
                (target === 'loggedOut' && !loggedIn) ? '' :
                'none';
        });

        // Fill display-name placeholders
        document.querySelectorAll('[data-cr-user-name]').forEach(el => {
            el.textContent = loggedIn ? displayName(_user) : '';
        });

        // Update the injected widget (if present)
        updateWidget();
    }

    // ── Auth Widget ──────────────────────────────────────────────

    /**
     * Inject a fixed-position auth badge into the page.
     * Only adds the widget once; subsequent calls refresh it.
     */
    function injectWidget() {
        if (document.getElementById('cr-auth-widget')) return; // already present

        const widget = document.createElement('div');
        widget.id = 'cr-auth-widget';
        widget.setAttribute('role', 'region');
        widget.setAttribute('aria-label', 'Account');
        widget.innerHTML = widgetHTML();
        document.body.appendChild(widget);

        // Inject scoped styles once
        if (!document.getElementById('cr-auth-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'cr-auth-widget-styles';
            style.textContent = widgetCSS();
            document.head.appendChild(style);
        }

        // Wire up dropdown toggle and actions
        wireWidgetEvents();
    }

    function widgetHTML() {
        if (_user) {
            const name = esc(displayName(_user));
            const tier = esc(_user.contribution_tier || 'GHOST');
            const initials = name.slice(0, 2).toUpperCase();
            const avatar = _user.avatar_url
                ? `<img src="${esc(_user.avatar_url)}" alt="${name}" class="cr-auth-avatar-img">`
                : `<span class="cr-auth-initials">${initials}</span>`;
            return `
<div class="cr-auth-inner" id="cr-auth-inner">
  <button class="cr-auth-trigger" id="cr-auth-trigger" aria-haspopup="true" aria-expanded="false"
          aria-label="Account menu for ${name}">
    <span class="cr-auth-avatar">${avatar}</span>
    <span class="cr-auth-name">${name}</span>
    <span class="cr-auth-caret">▾</span>
  </button>
  <div class="cr-auth-dropdown" id="cr-auth-dropdown" role="menu" aria-hidden="true">
    <div class="cr-auth-info">
      <span class="cr-auth-email">${esc(_user.email)}</span>
      <span class="cr-auth-tier">${tier}</span>
    </div>
    <hr class="cr-auth-divider">
    <a href="${DASHBOARD_PAGE}" class="cr-auth-item" role="menuitem">🌀 My Dashboard</a>
    <a href="/profile.html"     class="cr-auth-item" role="menuitem">👤 Profile</a>
    <button class="cr-auth-item cr-auth-logout" id="cr-auth-logout" role="menuitem">⏻ Sign Out</button>
  </div>
</div>`;
        }
        // Not logged in
        return `
<div class="cr-auth-inner" id="cr-auth-inner">
  <a href="${LOGIN_PAGE}" class="cr-auth-signin-btn">Sign In</a>
  <a href="/signup.html"  class="cr-auth-signup-btn">Get Started</a>
</div>`;
    }

    function widgetCSS() {
        return `
#cr-auth-widget {
  position: fixed;
  top: 12px;
  right: 16px;
  z-index: 9999;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  font-size: 0.78rem;
}
.cr-auth-inner { display: flex; align-items: center; gap: 8px; }

/* Trigger button */
.cr-auth-trigger {
  display: flex; align-items: center; gap: 8px;
  background: rgba(10,10,12,0.82);
  border: 1px solid rgba(15,245,224,0.35);
  border-radius: 24px;
  color: rgba(15,245,224,0.9);
  padding: 5px 12px 5px 6px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.cr-auth-trigger:hover, .cr-auth-trigger:focus-visible {
  border-color: rgba(15,245,224,0.75);
  box-shadow: 0 0 10px rgba(15,245,224,0.25);
  outline: none;
}
.cr-auth-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(15,245,224,0.15);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
}
.cr-auth-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.cr-auth-initials { font-size: 0.7rem; color: #0ff5e0; font-weight: 700; }
.cr-auth-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cr-auth-caret { font-size: 0.65rem; opacity: 0.7; transition: transform 0.2s; }
.cr-auth-trigger[aria-expanded="true"] .cr-auth-caret { transform: rotate(180deg); }

/* Dropdown */
.cr-auth-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 200px;
  background: rgba(12,12,16,0.96);
  border: 1px solid rgba(15,245,224,0.3);
  border-radius: 10px;
  padding: 8px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.cr-auth-dropdown.open { display: block; }
.cr-auth-info { padding: 4px 8px 8px; }
.cr-auth-email { display: block; color: rgba(200,200,200,0.7); font-size: 0.72rem; overflow: hidden; text-overflow: ellipsis; }
.cr-auth-tier  { display: inline-block; margin-top: 4px; font-size: 0.65rem; color: #0ff5e0;
                  border: 1px solid rgba(15,245,224,0.4); border-radius: 4px; padding: 1px 6px; }
.cr-auth-divider { border: none; border-top: 1px solid rgba(15,245,224,0.15); margin: 4px 0; }
.cr-auth-item {
  display: block; width: 100%;
  padding: 8px 10px; border-radius: 6px;
  color: rgba(200,200,200,0.85); font-family: inherit; font-size: 0.78rem;
  text-decoration: none; text-align: left;
  background: transparent; border: none; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.cr-auth-item:hover, .cr-auth-item:focus-visible {
  background: rgba(15,245,224,0.1); color: #0ff5e0; outline: none;
}
.cr-auth-logout { color: rgba(255,100,100,0.85); }
.cr-auth-logout:hover, .cr-auth-logout:focus-visible { background: rgba(255,80,80,0.12); color: #ff6464; }

/* Sign-in / get-started buttons (logged-out state) */
.cr-auth-signin-btn,
.cr-auth-signup-btn {
  padding: 6px 14px; border-radius: 20px;
  font-family: inherit; font-size: 0.78rem; font-weight: 600;
  text-decoration: none; text-transform: uppercase; letter-spacing: 0.04em;
  transition: all 0.2s;
}
.cr-auth-signin-btn {
  color: rgba(15,245,224,0.85);
  border: 1px solid rgba(15,245,224,0.35);
  background: rgba(10,10,12,0.75);
  backdrop-filter: blur(6px);
}
.cr-auth-signin-btn:hover, .cr-auth-signin-btn:focus-visible {
  border-color: rgba(15,245,224,0.75); color: #0ff5e0;
  box-shadow: 0 0 8px rgba(15,245,224,0.25); outline: none;
}
.cr-auth-signup-btn {
  color: #0a0a0c;
  background: linear-gradient(135deg, #0ff5e0 0%, #39ff14 100%);
  border: none;
}
.cr-auth-signup-btn:hover, .cr-auth-signup-btn:focus-visible {
  box-shadow: 0 0 12px rgba(15,245,224,0.45); outline: none; opacity: 0.9;
}
@media (max-width: 480px) {
  #cr-auth-widget { top: 8px; right: 8px; }
  .cr-auth-name { display: none; }
  .cr-auth-signin-btn { display: none; }
}`;
    }

    // Track whether document-level listeners have been registered
    let _docListenersAttached = false;

    function updateWidget() {
        const widget = document.getElementById('cr-auth-widget');
        if (!widget) return;
        // Use innerHTML (not outerHTML) so the container element is preserved
        widget.innerHTML = widgetHTML();
        // Wire element-level listeners; document listeners are set up once
        wireWidgetEvents();
    }

    function wireWidgetEvents() {
        const trigger   = document.getElementById('cr-auth-trigger');
        const dropdown  = document.getElementById('cr-auth-dropdown');
        const logoutBtn = document.getElementById('cr-auth-logout');

        if (trigger && dropdown) {
            // Button-level listener (safe to re-add because the element is new)
            trigger.addEventListener('click', () => {
                const isOpen = dropdown.classList.toggle('open');
                trigger.setAttribute('aria-expanded', String(isOpen));
                dropdown.setAttribute('aria-hidden', String(!isOpen));
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => window.CRAuth.logout());
        }

        // Register document-level listeners only once ever
        if (!_docListenersAttached) {
            _docListenersAttached = true;

            // Close dropdown on outside click
            document.addEventListener('click', function (e) {
                const t = document.getElementById('cr-auth-trigger');
                const d = document.getElementById('cr-auth-dropdown');
                if (t && d && !t.contains(e.target) && !d.contains(e.target)) {
                    d.classList.remove('open');
                    t.setAttribute('aria-expanded', 'false');
                    d.setAttribute('aria-hidden', 'true');
                }
            }, { passive: true });

            // Close dropdown on Escape
            document.addEventListener('keydown', function (e) {
                if (e.key !== 'Escape') return;
                const t = document.getElementById('cr-auth-trigger');
                const d = document.getElementById('cr-auth-dropdown');
                if (d && d.classList.contains('open')) {
                    d.classList.remove('open');
                    d.setAttribute('aria-hidden', 'true');
                    if (t) { t.setAttribute('aria-expanded', 'false'); t.focus(); }
                }
            });
        }
    }

    // ── Session Check ─────────────────────────────────────────────

    /**
     * Load a previously-cached non-sensitive profile for fast first-paint.
     * Returns null if nothing cached or cache is stale (>5 min).
     */
    function loadCache() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return null;
            const { user, ts } = JSON.parse(raw);
            // Invalidate if older than 5 minutes
            if (Date.now() - ts > 5 * 60 * 1000) {
                localStorage.removeItem(LS_KEY);
                return null;
            }
            return user || null;
        } catch (e) { return null; }
    }

    function saveCache(user) {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify({ user, ts: Date.now() }));
            // Keep legacy keys in sync for src/auth.js compatibility
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isLoggedIn', 'true');
        } catch (e) { /* storage might be full */ }
    }

    function clearCache() {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
    }

    async function checkSession() {
        try {
            const res = await fetch(AUTH_ME_URL, {
                method: 'GET',
                credentials: 'include'  // send the HttpOnly cookie
            });
            const data = await res.json();
            if (data.success && data.user) {
                return data.user;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    // ── Bootstrap ─────────────────────────────────────────────────

    async function init() {
        // Fast path: paint from cache immediately
        const cached = loadCache();
        if (cached) {
            _user = cached;
            applyAuthState();
        }

        // Verify against server (always, to respect logout / expiry)
        const serverUser = await checkSession();

        if (serverUser) {
            _user = serverUser;
            saveCache(serverUser);
        } else {
            _user = null;
            clearCache();
        }

        _ready = true;
        applyAuthState();

        // Dispatch event so pages can react
        document.dispatchEvent(new CustomEvent('crAuthReady', {
            detail: { user: _user, isLoggedIn: !!_user }
        }));
    }

    // Inject widget as soon as DOM is ready, init session check immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectWidget();
            init();
        });
    } else {
        injectWidget();
        init();
    }

})();
