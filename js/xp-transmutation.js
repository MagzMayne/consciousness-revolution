// RootIB: RB-20260323080050-XPTRANS1
/**
 * XP TRANSMUTATION ENGINE
 * Bridges all XP systems to real on-chain crypto tokens.
 *
 * Supported tokens (Solana / pump.fun):
 *   OKK  – Overkill Kulture  : CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump
 *   RootIB – Root Idea Block : 6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump
 *
 * XP Sources aggregated:
 *   1. XP_LEVEL_SYSTEM  (localStorage: cr_game_progress  → state.totalXPEarned)
 *   2. XPRewardSystem   (localStorage: xp-reward-system  → userXP Map)
 *   3. SpiralRewards    (localStorage: spiral_xp_*       → per-forge totals)
 *   4. discord-xp-webhook / sync-user-xp (server-side; fetched via /api/sync-user-xp)
 *
 * Transmutation rates:
 *   OKK   – governance / rewards token:  100 XP → 1 OKK
 *   RootIB – IP protocol token:          500 XP → 1 RootIB
 *
 * Minimum redemption:
 *   OKK   : 1 000 XP  (≥ 10 OKK)
 *   RootIB: 5 000 XP  (≥ 10 RootIB)
 */

'use strict';

/* ─── Token registry ─────────────────────────────────────────────────── */

const XP_TOKENS = {
    OKK: {
        address: 'CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        name: 'Overkill Kulture',
        symbol: 'OKK',
        logo: '🏛️',
        color: '#FFD700',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
        pumpfunUrl: 'https://pump.fun/coin/CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        xpRate: 100,       // 100 XP = 1 OKK
        minXP: 1000,       // minimum 1 000 XP to redeem
        description: 'Main governing token. Investors earn as more developers join the platform.',
        role: 'governance'
    },
    RootIB: {
        address: '6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump',
        name: 'Root Idea Block',
        symbol: 'RootIB',
        logo: '💡',
        color: '#9B30FF',
        gradient: 'linear-gradient(135deg, #9B30FF 0%, #C71585 100%)',
        pumpfunUrl: 'https://pump.fun/coin/6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump',
        xpRate: 500,       // 500 XP = 1 RootIB
        minXP: 5000,       // minimum 5 000 XP to redeem
        description: 'IP protocol for all devs ideas and projects.',
        role: 'channel'
    }
};

const VAULT_WALLET = '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk';
const STORAGE_KEY  = 'cr_xp_transmutation';

/* ─── XP Aggregator ─────────────────────────────────────────────────── */

const XPAggregator = {
    /**
     * Collect XP from every local storage source.
     * Returns an object describing each source and the grand total.
     */
    collectAll() {
        const sources = {};

        // ── Source 1: XP_LEVEL_SYSTEM ──────────────────────────────────
        try {
            const raw = localStorage.getItem('cr_game_progress');
            if (raw) {
                const data = JSON.parse(raw);
                sources.levelSystem = {
                    label: 'Consciousness Level System',
                    xp: data.totalXPEarned || data.currentXP || 0,
                    level: data.level || 1,
                    levelName: data.levelName || ''
                };
            }
        } catch (_) {}

        // ── Source 2: XPRewardSystem (xp-reward-system.js) ────────────
        try {
            const raw = localStorage.getItem('xp-reward-system');
            if (raw) {
                const data = JSON.parse(raw);
                // userXP is stored as an array of [userId, xp] pairs
                if (data.userXP && Array.isArray(data.userXP)) {
                    const total = data.userXP.reduce((sum, [, xp]) => sum + (Number(xp) || 0), 0);
                    sources.rewardSystem = {
                        label: 'Developer Reward System',
                        xp: total
                    };
                }
            }
        } catch (_) {}

        // ── Source 3: Spiral XP ────────────────────────────────────────
        try {
            // spiral-xp-rewards.js stores per-forge XP under spiral_xp_<forge>
            const forges = ['reality', 'creation', 'connection', 'peace', 'abundance', 'wisdom', 'purpose'];
            let spiralTotal = 0;
            for (const forge of forges) {
                const val = localStorage.getItem(`spiral_xp_${forge}`);
                if (val) spiralTotal += parseInt(val, 10) || 0;
            }
            if (spiralTotal > 0) {
                sources.spiral = {
                    label: 'Spiral Forge XP',
                    xp: spiralTotal
                };
            }
        } catch (_) {}

        // ── Source 4: Supabase / server-side XP (cached locally) ───────
        try {
            const raw = localStorage.getItem('cr_server_xp');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.xp) {
                    sources.server = {
                        label: 'Synced Server XP',
                        xp: data.xp,
                        level: data.level_number,
                        levelName: data.level_name
                    };
                }
            }
        } catch (_) {}

        // ── Grand total ────────────────────────────────────────────────
        const total = Object.values(sources).reduce((sum, s) => sum + (s.xp || 0), 0);
        return { sources, total };
    },

    /**
     * Fetch server XP (sync-user-xp endpoint) and cache locally.
     * Returns the cached total regardless (works offline).
     */
    async fetchServerXP(userId) {
        if (!userId) return 0;
        try {
            const res = await fetch('/api/sync-user-xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_profile', user_id: userId })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.profile) {
                    localStorage.setItem('cr_server_xp', JSON.stringify(data.profile));
                    return data.profile.xp || 0;
                }
            }
        } catch (_) {}
        return 0;
    }
};

/* ─── Transmutation Engine ───────────────────────────────────────────── */

const XPTransmutation = {

    /**
     * Return the amount of the given token the user can get for `xpAmount`.
     * @param {string} tokenKey  – 'OKK' or 'RootIB'
     * @param {number} xpAmount  – XP to spend
     * @returns {{ tokenAmount: number, tokenKey: string, eligible: boolean, reason?: string }}
     */
    quote(tokenKey, xpAmount) {
        const token = XP_TOKENS[tokenKey];
        if (!token) return { eligible: false, reason: `Unknown token: ${tokenKey}` };

        if (xpAmount < token.minXP) {
            return {
                eligible: false,
                tokenKey,
                tokenAmount: 0,
                reason: `Minimum ${token.minXP.toLocaleString()} XP required to redeem ${token.symbol} (you have ${xpAmount.toLocaleString()} XP)`
            };
        }

        const tokenAmount = Math.floor(xpAmount / token.xpRate);
        return { eligible: true, tokenKey, tokenAmount, xpSpent: tokenAmount * token.xpRate };
    },

    /**
     * Get all quotes at once.
     * @param {number} xpAmount
     * @returns {Object}  keyed by tokenKey
     */
    quoteAll(xpAmount) {
        const result = {};
        for (const key of Object.keys(XP_TOKENS)) {
            result[key] = this.quote(key, xpAmount);
        }
        return result;
    },

    /**
     * Submit a transmutation request to the backend.
     * The backend logs the request and returns a pump.fun link for the user to verify.
     *
     * @param {object} params
     * @param {string} params.tokenKey      – 'OKK' | 'RootIB'
     * @param {number} params.xpAmount      – XP the user wishes to spend
     * @param {string} params.walletAddress – User's Solana wallet
     * @param {string} [params.userId]      – Platform user ID / email
     * @returns {Promise<object>}
     */
    async transmute({ tokenKey, xpAmount, walletAddress, userId }) {
        const token = XP_TOKENS[tokenKey];
        if (!token) throw new Error(`Unknown token: ${tokenKey}`);

        const q = this.quote(tokenKey, xpAmount);
        if (!q.eligible) throw new Error(q.reason);

        if (!walletAddress || walletAddress.length < 32) {
            throw new Error('A valid Solana wallet address is required.');
        }

        const payload = {
            tokenKey,
            tokenAddress: token.address,
            tokenSymbol: token.symbol,
            xpSpent: q.xpSpent,
            tokenAmount: q.tokenAmount,
            walletAddress,
            userId: userId || localStorage.getItem('spiralUserId') || localStorage.getItem('userEmail') || 'anonymous',
            timestamp: new Date().toISOString(),
            vaultWallet: VAULT_WALLET,
            pumpfunUrl: token.pumpfunUrl
        };

        try {
            const res = await fetch('/api/xp-transmute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Deduct XP locally across all sources proportionally
                this._deductLocalXP(q.xpSpent);
                // Persist this transmutation in local history
                this._recordTransmutation({ ...payload, txId: data.txId });
                return data;
            }

            throw new Error(data.error || 'Transmutation request failed');
        } catch (err) {
            if (err.message.includes('fetch')) {
                // Offline fallback — record pending request
                const pending = { ...payload, pending: true, id: `pending_${Date.now()}` };
                this._recordTransmutation(pending);
                return {
                    success: true,
                    pending: true,
                    message: 'Request saved offline. It will be processed when you reconnect.',
                    pumpfunUrl: token.pumpfunUrl,
                    tokenAmount: q.tokenAmount,
                    tokenSymbol: token.symbol
                };
            }
            throw err;
        }
    },

    /* ── Private helpers ──────────────────────────────────────────────── */

    _deductLocalXP(amount) {
        // Deduct from XP_LEVEL_SYSTEM first
        try {
            const raw = localStorage.getItem('cr_game_progress');
            if (raw) {
                const data = JSON.parse(raw);
                data.totalXPEarned = Math.max(0, (data.totalXPEarned || 0) - amount);
                // currentXP within the current level is NOT reduced (already spent leveling)
                localStorage.setItem('cr_game_progress', JSON.stringify(data));
                amount = 0; // fully deducted
            }
        } catch (_) {}

        if (amount <= 0) return;

        // Deduct from XPRewardSystem if remaining
        try {
            const raw = localStorage.getItem('xp-reward-system');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.userXP && Array.isArray(data.userXP)) {
                    let remaining = amount;
                    data.userXP = data.userXP.map(([uid, xp]) => {
                        if (remaining <= 0) return [uid, xp];
                        const deduct = Math.min(xp, remaining);
                        remaining -= deduct;
                        return [uid, xp - deduct];
                    });
                    localStorage.setItem('xp-reward-system', JSON.stringify(data));
                    amount = remaining;
                }
            }
        } catch (_) {}
    },

    _recordTransmutation(record) {
        try {
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            existing.unshift(record);
            // Keep last 50
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
        } catch (_) {}
    },

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (_) {
            return [];
        }
    }
};

/* ─── Global exposure ────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
    window.XP_TOKENS        = XP_TOKENS;
    window.XPAggregator     = XPAggregator;
    window.XPTransmutation  = XPTransmutation;
    window.VAULT_WALLET     = window.VAULT_WALLET || VAULT_WALLET;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { XP_TOKENS, XPAggregator, XPTransmutation };
}

console.log('🔄 XP Transmutation Engine ready');
console.log('🏛️ OKK  :', XP_TOKENS.OKK.address);
console.log('💡 RootIB:', XP_TOKENS.RootIB.address);
