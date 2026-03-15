/**
 * AUTH GATE - Tier 2 Password Protection
 * Ultra-simple JavaScript password protection for static sites
 *
 * USAGE:
 * 1. Add to <head>: <script src="/components/auth-gate.js"></script>
 * 2. Add to <head>: <link rel="stylesheet" href="/components/auth-gate.css">
 * 3. Add to <body>: <div id="auth-gate"></div>
 * 4. Add to <body>: <div id="protected-content" class="hidden">YOUR CONTENT</div>
 */

(function() {
    'use strict';

    // ============================================================================
    // CONFIGURATION
    // ============================================================================

    const AUTH_CONFIG = {
        passwords: {
            'AgentR2026': 'agent_r',
            'Beta100X2026': 'beta',
            'Build100X': 'contractor'
        },
        storageKey: '100x_auth_tier',
        sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        maxAttempts: 3,
        lockoutDuration: 5 * 60 * 1000 // 5 minutes
    };

    // ============================================================================
    // CORE FUNCTIONALITY
    // ============================================================================

    class AuthGate {
        constructor() {
            this.initTime = Date.now();
            this.attempts = 0;
            this.init();
        }

        init() {
            // Check if already authenticated
            if (this.isAuthenticated()) {
                this.showContent();
                return;
            }

            // Check if locked out
            if (this.isLockedOut()) {
                this.showLockout();
                return;
            }

            // Show auth gate
            this.renderGate();
        }

        isAuthenticated() {
            const stored = localStorage.getItem(AUTH_CONFIG.storageKey);
            if (!stored) return false;

            try {
                const auth = JSON.parse(stored);
                const now = Date.now();

                // Check if session expired
                if (now - auth.timestamp > AUTH_CONFIG.sessionDuration) {
                    localStorage.removeItem(AUTH_CONFIG.storageKey);
                    return false;
                }

                // Valid session
                return true;
            } catch (e) {
                localStorage.removeItem(AUTH_CONFIG.storageKey);
                return false;
            }
        }

        isLockedOut() {
            const lockout = localStorage.getItem('100x_auth_lockout');
            if (!lockout) return false;

            const lockoutTime = parseInt(lockout, 10);
            const now = Date.now();

            if (now - lockoutTime < AUTH_CONFIG.lockoutDuration) {
                return true;
            }

            // Lockout expired
            localStorage.removeItem('100x_auth_lockout');
            return false;
        }

        authenticate(password) {
            const tier = AUTH_CONFIG.passwords[password];

            if (tier) {
                // Valid password
                const auth = {
                    tier: tier,
                    timestamp: Date.now()
                };
                localStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify(auth));
                this.showContent();
                return true;
            } else {
                // Invalid password
                this.attempts++;

                if (this.attempts >= AUTH_CONFIG.maxAttempts) {
                    localStorage.setItem('100x_auth_lockout', Date.now().toString());
                    this.showLockout();
                } else {
                    this.showError(`Invalid password. ${AUTH_CONFIG.maxAttempts - this.attempts} attempts remaining.`);
                }
                return false;
            }
        }

        showContent() {
            const gate = document.getElementById('auth-gate');
            const content = document.getElementById('protected-content');

            if (gate) gate.style.display = 'none';
            if (content) content.classList.remove('hidden');

            // Dispatch event for other scripts
            window.dispatchEvent(new CustomEvent('authGateUnlocked'));
        }

        showError(message) {
            const errorEl = document.getElementById('auth-gate-error');
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.style.display = 'block';

                // Shake animation
                const form = document.getElementById('auth-gate-form');
                if (form) {
                    form.classList.add('shake');
                    setTimeout(() => form.classList.remove('shake'), 500);
                }
            }
        }

        showLockout() {
            const gate = document.getElementById('auth-gate');
            if (!gate) return;

            const lockout = localStorage.getItem('100x_auth_lockout');
            const lockoutTime = parseInt(lockout, 10);
            const remainingMs = AUTH_CONFIG.lockoutDuration - (Date.now() - lockoutTime);
            const remainingMin = Math.ceil(remainingMs / 60000);

            gate.innerHTML = `
                <div class="auth-gate-container">
                    <div class="auth-gate-lockout">
                        <div class="auth-gate-icon">🔒</div>
                        <h2>Too Many Failed Attempts</h2>
                        <p>Please wait ${remainingMin} minute${remainingMin > 1 ? 's' : ''} before trying again.</p>
                        <div class="auth-gate-timer" id="lockout-timer"></div>
                    </div>
                </div>
            `;

            this.startLockoutTimer(remainingMs);
        }

        startLockoutTimer(remainingMs) {
            const timerEl = document.getElementById('lockout-timer');
            if (!timerEl) return;

            const updateTimer = () => {
                const lockout = localStorage.getItem('100x_auth_lockout');
                if (!lockout) {
                    location.reload();
                    return;
                }

                const lockoutTime = parseInt(lockout, 10);
                const remaining = AUTH_CONFIG.lockoutDuration - (Date.now() - lockoutTime);

                if (remaining <= 0) {
                    localStorage.removeItem('100x_auth_lockout');
                    location.reload();
                    return;
                }

                const seconds = Math.ceil(remaining / 1000);
                const min = Math.floor(seconds / 60);
                const sec = seconds % 60;

                timerEl.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
                setTimeout(updateTimer, 1000);
            };

            updateTimer();
        }

        renderGate() {
            const gate = document.getElementById('auth-gate');
            if (!gate) {
                console.error('AUTH GATE: #auth-gate element not found');
                return;
            }

            gate.innerHTML = `
                <div class="auth-gate-container">
                    <div class="auth-gate-card">
                        <div class="auth-gate-header">
                            <div class="auth-gate-icon">🛡️</div>
                            <h2>Protected Access</h2>
                            <p>Enter your access code to continue</p>
                        </div>

                        <form id="auth-gate-form" class="auth-gate-form">
                            <div class="auth-gate-input-group">
                                <input
                                    type="password"
                                    id="auth-gate-password"
                                    placeholder="Access Code"
                                    autocomplete="off"
                                    required
                                />
                                <button type="submit" class="auth-gate-submit">
                                    Unlock
                                </button>
                            </div>
                            <div id="auth-gate-error" class="auth-gate-error"></div>
                        </form>

                        <div class="auth-gate-footer">
                            <small>Session valid for 7 days</small>
                        </div>
                    </div>
                </div>
            `;

            // Attach event listener
            const form = document.getElementById('auth-gate-form');
            const input = document.getElementById('auth-gate-password');

            if (form && input) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const password = input.value.trim();
                    if (password) {
                        this.authenticate(password);
                        input.value = '';
                    }
                });

                // Auto-focus
                setTimeout(() => input.focus(), 100);
            }
        }

        // Public method to logout
        logout() {
            localStorage.removeItem(AUTH_CONFIG.storageKey);
            location.reload();
        }
    }

    // ============================================================================
    // AUTO-INITIALIZE
    // ============================================================================

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.authGate = new AuthGate();
        });
    } else {
        window.authGate = new AuthGate();
    }

    // Expose logout method globally
    window.authGateLogout = function() {
        if (window.authGate) {
            window.authGate.logout();
        }
    };

})();
