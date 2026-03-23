// RootIB: RB-20260323062118-PFCREATE1
/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * PUMPFUN CREATOR REWARDS SYSTEM
 * Automated developer coin creation & creator rewards integration for Pump.Fun
 *
 * Key tokens & addresses:
 *   Governing / rewards token : CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump
 *   Crypto channel token      : 6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump
 *   Vault wallet              : 6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk
 *   Platform                  : https://pump.fun
 *
 * This module is the **final stage** of the project-creation mechanism:
 *   1. Developer submits a project via the dashboard
 *   2. Creator Rewards system auto-generates a Pump.Fun launch link for the idea
 *   3. Developer signs & launches the coin through Pump.Fun
 *   4. Creator rewards begin flowing back to the vault & governing token holders
 *
 * @aul-enabled
 * ════════════════════════════════════════════════════════════════════════════════
 */

'use strict';

/* ─── Constants ─────────────────────────────────────────────────────────── */

const CREATOR_REWARDS = {
    /** Main governing token — core of all reward distributions */
    GOVERNING_TOKEN: {
        address: 'CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        symbol: 'OKK',
        name: 'Overkill Kulture',
        pumpfunUrl: 'https://pump.fun/coin/CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        logo: '🏛️',
        description: 'Main governing token. Investors earn as more developers use this platform.'
    },
    /** Crypto-channel community token */
    CHANNEL_TOKEN: {
        address: '6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump',
        symbol: 'CRCC',
        name: 'CR Crypto Channel',
        pumpfunUrl: 'https://pump.fun/coin/6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump',
        logo: '📡',
        description: 'Token for the consciousness-revolution crypto community channel.'
    },
    /** Primary vault — receives all platform revenue */
    VAULT_WALLET: '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk',
    /** Platform */
    PLATFORM_URL: 'https://pump.fun',
    CREATE_URL: 'https://pump.fun/create',
    /** Discord community channels */
    DISCORD: {
        CRYPTO: 'https://discord.com/channels/1458000070862573805/1458298393964187783',
        REVENUE: 'https://discord.com/channels/1458000070862573805/1458298404764651633'
    }
};

/* ─── PumpFunCreatorRewards class ────────────────────────────────────────── */

class PumpFunCreatorRewards {
    /**
     * @param {object} [opts]
     * @param {HTMLElement|null} [opts.container] - Element to render status into
     */
    constructor(opts = {}) {
        this.container = opts.container || null;
        this.launchedCoins = this._loadLaunched();
        console.log('🏛️ PumpFun Creator Rewards system initialised');
    }

    /* ── Local persistence ────────────────────────────────────────────── */

    _loadLaunched() {
        try {
            return JSON.parse(localStorage.getItem('cr_launched_coins') || '[]');
        } catch (_) {
            return [];
        }
    }

    _saveLaunched() {
        try {
            localStorage.setItem('cr_launched_coins', JSON.stringify(this.launchedCoins));
        } catch (_) {}
    }

    /* ── Core helpers ─────────────────────────────────────────────────── */

    /**
     * Build a Pump.Fun pre-filled URL for a dev project idea.
     * Pump.fun's /create page accepts the following query params:
     *   name, symbol, description, twitter, telegram, website
     *
     * @param {object} project
     * @param {string} project.name        - Project / idea name
     * @param {string} project.description - Short description (≤200 chars)
     * @param {string} [project.symbol]    - Token ticker (auto-derived if omitted)
     * @param {string} [project.url]       - Live URL to embed as website link
     * @param {string} [project.tags]      - Comma-separated tags
     * @returns {string} Full pump.fun create URL
     */
    buildLaunchUrl(project) {
        const { name, description, url, symbol } = project;

        const ticker = symbol || this._deriveTicker(name);
        // Keep the total description under Pump.Fun's 500-char limit.
        // The suffix adds ~60 chars; leave the rest for the user's text.
        const suffix = ` | CR | Rewards: ${CREATOR_REWARDS.GOVERNING_TOKEN.address}`;
        const maxDesc = 500 - suffix.length;
        const desc   = `${(description || '').slice(0, maxDesc)}${suffix}`;

        const params = new URLSearchParams({
            name:        name   || 'My CR Project',
            symbol:      ticker,
            description: desc,
            website:     url || 'https://consciousnessrevolution.io',
            twitter:     '',
            telegram:    CREATOR_REWARDS.DISCORD.CRYPTO
        });

        return `${CREATOR_REWARDS.CREATE_URL}?${params.toString()}`;
    }

    /**
     * Derive a 4-6 character ticker from a project name.
     * @param {string} name
     * @returns {string}
     */
    _deriveTicker(name) {
        if (!name) return 'COIN';
        // Use initials of words, or first 4 uppercase chars
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) {
            return words.map(w => w[0].toUpperCase()).join('').slice(0, 6);
        }
        return name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5) || 'COIN';
    }

    /**
     * Record a launched coin in localStorage and broadcast via CRSync.
     * @param {object} project
     * @param {string} [coinAddress] - The deployed coin address (if known)
     */
    recordLaunch(project, coinAddress = null) {
        const entry = {
            id:          `coin-${Date.now()}`,
            project:     project.name,
            ticker:      project.symbol || this._deriveTicker(project.name),
            description: project.description,
            coinAddress,
            launchUrl:   this.buildLaunchUrl(project),
            pumpfunUrl:  coinAddress ? `${CREATOR_REWARDS.PLATFORM_URL}/coin/${coinAddress}` : null,
            vaultWallet: CREATOR_REWARDS.VAULT_WALLET,
            governToken: CREATOR_REWARDS.GOVERNING_TOKEN.address,
            launchedAt:  new Date().toISOString()
        };

        this.launchedCoins.unshift(entry);
        this._saveLaunched();

        // Broadcast to CRSync if available
        if (window.CRSync && typeof CRSync.broadcast === 'function') {
            try {
                CRSync.broadcast({ type: 'coin_launched', ...entry });
            } catch (_) {}
        }

        console.log('🚀 Coin launch recorded:', entry);
        return entry;
    }

    /**
     * Open Pump.Fun create page for a project.
     * Records the intent and opens a new tab.
     * @param {object} project
     */
    launchOnPumpFun(project) {
        const url   = this.buildLaunchUrl(project);
        const entry = this.recordLaunch(project, null);
        window.open(url, '_blank', 'noopener,noreferrer');
        return { launchUrl: url, entry };
    }

    /* ── Token price helpers ──────────────────────────────────────────── */

    /**
     * Fetch live price data for a token via DexScreener.
     * @param {string} address - Solana token mint address
     */
    async fetchTokenData(address) {
        try {
            const res = await fetch(
                `https://api.dexscreener.com/latest/dex/tokens/${address}`
            );
            if (!res.ok) throw new Error('DexScreener request failed');
            const json = await res.json();
            const pair = (json.pairs || [])[0];
            if (!pair) return null;
            return {
                price:     parseFloat(pair.priceUsd) || 0,
                change24h: parseFloat(pair.priceChange?.h24) || 0,
                volume24h: parseFloat(pair.volume?.h24) || 0,
                mcap:      parseFloat(pair.fdv) || 0,
                liquidity: parseFloat(pair.liquidity?.usd) || 0
            };
        } catch (_) {
            return null;
        }
    }

    /* ── UI helpers ───────────────────────────────────────────────────── */

    /**
     * Render a compact "Launch on Pump.Fun" button + governing-token card
     * into a container element.
     * @param {object} project - Project metadata
     * @param {HTMLElement} [el] - Target element (defaults to this.container)
     */
    renderLaunchCard(project, el) {
        const target = el || this.container;
        if (!target) return;

        const g = CREATOR_REWARDS.GOVERNING_TOKEN;
        const launchUrl = this.buildLaunchUrl(project);

        target.innerHTML = `
          <div class="pfcr-launch-card" style="
              background: linear-gradient(135deg,#0f0f23 0%,#1a0f3e 100%);
              border: 1px solid #9B30FF;
              border-radius: 12px;
              padding: 20px;
              color: #e5e7eb;
              font-family: system-ui, sans-serif;
              box-shadow: 0 0 24px rgba(155,48,255,0.25);
          ">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <span style="font-size:28px;">🚀</span>
              <div>
                <div style="font-weight:700;font-size:16px;color:#FFD700;">Final Stage: Launch Your Coin</div>
                <div style="font-size:12px;color:#9ca3af;">Powered by Pump.Fun · Creator Rewards Active</div>
              </div>
            </div>

            <div style="background:rgba(155,48,255,0.1);border-radius:8px;padding:12px;margin-bottom:14px;font-size:13px;">
              <div style="color:#c4b5fd;margin-bottom:4px;">Project: <strong style="color:#fff;">${this._escape(project.name)}</strong></div>
              <div style="color:#c4b5fd;">Token ticker: <strong style="color:#FFD700;">${this._escape(this._deriveTicker(project.name))}</strong></div>
            </div>

            <div style="background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:12px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                <span>${g.logo}</span>
                <span style="color:#FFD700;font-weight:600;">Governing Token (${g.symbol})</span>
              </div>
              <div style="color:#9ca3af;word-break:break-all;">${g.address}</div>
              <div style="color:#a3a3a3;margin-top:4px;">${g.description}</div>
              <a href="${g.pumpfunUrl}" target="_blank" rel="noopener noreferrer"
                 style="display:inline-block;margin-top:6px;color:#FFD700;font-size:11px;text-decoration:none;">
                 View on Pump.Fun ↗
              </a>
            </div>

            <a href="${this._escape(launchUrl)}" target="_blank" rel="noopener noreferrer"
               onclick="if(window.__pfcr)window.__pfcr.launchOnPumpFun(${JSON.stringify(project)});return true;"
               style="
                 display:flex;align-items:center;justify-content:center;gap:8px;
                 width:100%;padding:14px;
                 background:linear-gradient(135deg,#9B30FF 0%,#C71585 100%);
                 color:#fff;font-weight:700;font-size:15px;
                 border-radius:10px;text-decoration:none;
                 box-shadow:0 4px 14px rgba(155,48,255,0.4);
                 transition:opacity .2s;
               "
               onmouseover="this.style.opacity='.85'"
               onmouseout="this.style.opacity='1'"
            >
              🔥 Launch Coin on Pump.Fun
            </a>

            <div style="margin-top:12px;text-align:center;font-size:11px;color:#6b7280;">
              Vault wallet (revenue): <span style="color:#9ca3af;word-break:break-all;">${CREATOR_REWARDS.VAULT_WALLET}</span>
            </div>
          </div>
        `;
    }

    _escape(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, c => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
        }[c]));
    }

    /* ── Static getters ───────────────────────────────────────────────── */

    static get GOVERNING_TOKEN() { return CREATOR_REWARDS.GOVERNING_TOKEN; }
    static get CHANNEL_TOKEN()   { return CREATOR_REWARDS.CHANNEL_TOKEN;   }
    static get VAULT_WALLET()    { return CREATOR_REWARDS.VAULT_WALLET;    }
    static get DISCORD()         { return CREATOR_REWARDS.DISCORD;         }
    static get CONSTANTS()       { return CREATOR_REWARDS;                 }
}

/* ─── Expose globally ────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
    window.PumpFunCreatorRewards = PumpFunCreatorRewards;
    window.CREATOR_REWARDS       = CREATOR_REWARDS;

    // Shared singleton — accessible as window.__pfcr
    window.__pfcr = new PumpFunCreatorRewards();

    console.log('🏛️ PumpFun Creator Rewards ready');
    console.log('  Governing token :', CREATOR_REWARDS.GOVERNING_TOKEN.address);
    console.log('  Channel token   :', CREATOR_REWARDS.CHANNEL_TOKEN.address);
    console.log('  Vault wallet    :', CREATOR_REWARDS.VAULT_WALLET);
}
