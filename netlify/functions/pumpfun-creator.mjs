/**
 * PUMP.FUN CREATOR REWARDS — NETLIFY FUNCTION
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | AgentR R3
 *
 * Final stage of the completion pipeline: when a dev finishes an idea they
 * announce it as a Pump.Fun coin, earn creator rewards, and it gets auto-
 * posted to Discord #crypto-launch and #revenue-streams.
 *
 * Routes:
 *   GET  /api/pumpfun-creator                         – list recent launches
 *   POST /api/pumpfun-creator                         – announce a coin launch
 *        body: { name, symbol, description, mintAddress?,
 *                pumpfunUrl?, creator, discordUser?,
 *                rootibTag?, projectUrl?, key }
 *   GET  /api/pumpfun-creator?action=tokens            – get platform tokens
 *   GET  /api/pumpfun-creator?action=price&mint=<addr> – DexScreener price
 *
 * Environment variables:
 *   DISCORD_BOT_TOKEN   – Bot token
 *   ADMIN_EXPORT_KEY    – Admin auth (default: consciousness137)
 *   SUPABASE_URL / SUPABASE_ANON_KEY (optional, for persistence)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ── Platform token registry ──────────────────────────────────────────────────
const PLATFORM_TOKENS = {
    governing: {
        name:     'Consciousness Revolution',
        symbol:   'CORE',
        mint:     'CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        url:      'https://pump.fun/coin/CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        role:     'Governing token — invest to earn platform rewards as adoption grows',
        emoji:    '👑',
        color:    0xFFD700
    },
    rootib: {
        name:     'RootIB',
        symbol:   'ROOTIB',
        mint:     '6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump',
        url:      'https://pump.fun/coin/6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump',
        role:     'Idea provenance token — stamps every creator\'s idea with proof of origin',
        emoji:    '🔖',
        color:    0x00D9FF
    }
};

const VAULT_WALLET  = '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk';
const PUMPFUN_BASE  = 'https://pump.fun/coin/';
const PUMPFUN_CREATE = 'https://pump.fun/create';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const ADMIN_KEY         = process.env.ADMIN_EXPORT_KEY || 'consciousness137';
const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_KEY      = process.env.SUPABASE_ANON_KEY;

// Channel IDs
const CH = {
    cryptoLaunch:   '1458298393964187783',  // #crypto-launch
    revenueStreams: '1458298404764651633',  // #revenue-streams
    completed:      '1458298435974336573',  // #completed
    alerts:         '1458298272228835413'   // #alerts
};

// ── CORS ──────────────────────────────────────────────────────────────────────
const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type':                 'application/json'
};

// ── Discord helper ────────────────────────────────────────────────────────────
async function discordPost(channelId, embeds, content = '') {
    if (!DISCORD_BOT_TOKEN) throw new Error('DISCORD_BOT_TOKEN not configured');
    const body = { embeds };
    if (content) body.content = content;
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method:  'POST',
        headers: {
            Authorization:  `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Discord ${channelId}: ${res.status} — ${err}`);
    }
    return res.json();
}

// ── Supabase helper (optional) ────────────────────────────────────────────────
async function supabaseInsert(table, row) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method:  'POST',
        headers: {
            apikey:          SUPABASE_KEY,
            Authorization:   `Bearer ${SUPABASE_KEY}`,
            'Content-Type':  'application/json',
            Prefer:          'return=representation'
        },
        body: JSON.stringify(row)
    });
    if (!res.ok) return null;
    return res.json();
}

async function supabaseSelect(table, query = '') {
    if (!SUPABASE_URL || !SUPABASE_KEY) return [];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
        headers: {
            apikey:        SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) return [];
    return res.json();
}

// ── DexScreener price lookup ───────────────────────────────────────────────────
async function getDexPrice(mint) {
    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
            headers: { 'User-Agent': 'consciousness-revolution/1.0' }
        });
        if (!res.ok) return null;
        const d = await res.json();
        if (!d.pairs?.length) return null;
        const p = d.pairs[0];
        return {
            priceUsd:   parseFloat(p.priceUsd) || 0,
            change24h:  parseFloat(p.priceChange?.h24) || 0,
            volume24h:  parseFloat(p.volume?.h24) || 0,
            marketCap:  parseFloat(p.fdv) || 0,
            liquidity:  parseFloat(p.liquidity?.usd) || 0,
            txns24h:    (p.txns?.h24?.buys || 0) + (p.txns?.h24?.sells || 0)
        };
    } catch {
        return null;
    }
}

// ── Build launch embeds ────────────────────────────────────────────────────────
function buildLaunchEmbeds(coin) {
    const pumpUrl  = coin.pumpfunUrl || (coin.mintAddress ? `${PUMPFUN_BASE}${coin.mintAddress}` : PUMPFUN_CREATE);
    const hasRootib = Boolean(coin.rootibTag);
    const ts = new Date().toISOString();

    const mainEmbed = {
        title:       `🚀 NEW COIN LAUNCHED: ${coin.symbol || '???'} — ${coin.name}`,
        description: [
            coin.description || '*No description provided.*',
            '',
            `**Creator:** ${coin.creator || 'Anonymous'}${coin.discordUser ? ` (${coin.discordUser})` : ''}`,
            coin.rootibTag   ? `**RootIB Tag:** \`${coin.rootibTag}\`` : '',
            coin.projectUrl  ? `**Project:** ${coin.projectUrl}` : '',
            '',
            `[🔥 View on Pump.Fun](${pumpUrl})`,
            `[👑 Buy CORE (Governing Token)](${PLATFORM_TOKENS.governing.url})`,
            `[🔖 Get RootIB Token](${PLATFORM_TOKENS.rootib.url})`
        ].filter(Boolean).join('\n'),
        color:  0xFF6B00,
        fields: [
            {
                name:   '🔑 Mint Address',
                value:  coin.mintAddress ? `\`${coin.mintAddress}\`` : '*Pending — launch on Pump.Fun first*',
                inline: true
            },
            {
                name:   '🔖 RootIB Protected',
                value:  hasRootib ? `✅ \`${coin.rootibTag}\`` : '⚠️ No RootIB tag',
                inline: true
            },
            {
                name:   '💰 Creator Rewards',
                value:  'Automatically enrolled in profit-share\nHold CORE token to multiply rewards',
                inline: false
            },
            {
                name:   '🏦 Vault Wallet',
                value:  `\`${VAULT_WALLET}\`\nSend SOL/tokens here to fund rewards pool`,
                inline: false
            }
        ],
        footer:    { text: 'Consciousness Revolution · AgentR R3 · consciousnessrevolution.io' },
        timestamp: ts
    };

    // Revenue-streams embed (shorter, revenue-focused)
    const revenueEmbed = {
        title:       `💰 NEW REVENUE STREAM: ${coin.name} (${coin.symbol || '???'})`,
        description: [
            `A new coin has been launched on Pump.Fun by **${coin.creator || 'the team'}**.`,
            '',
            `Holding **CORE** (the governing token) entitles you to a share of creator rewards`,
            `generated as this platform grows. Every coin launched here feeds the ecosystem.`,
            '',
            `**How to participate:**`,
            `1. Buy CORE → [pump.fun](${PLATFORM_TOKENS.governing.url})`,
            `2. Invest in new coins like this one → [${coin.symbol || 'this coin'}](${pumpUrl})`,
            `3. Build your own idea → launch it → earn creator rewards`,
            `4. Contribute to the repo → earn XP → tier up → bigger rewards`
        ].join('\n'),
        color:  0x57F287,
        fields: [
            { name: '🚀 Pump.Fun Link', value: `[Trade ${coin.symbol || 'Coin'}](${pumpUrl})`, inline: true },
            { name: '👑 Governing Token', value: `[Buy CORE](${PLATFORM_TOKENS.governing.url})`, inline: true }
        ],
        footer:    { text: 'Revenue Streams · Consciousness Revolution' },
        timestamp: ts
    };

    return { mainEmbed, revenueEmbed };
}

// ── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(req, context) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }

    const url    = new URL(req.url);
    const action = url.searchParams.get('action');

    // ── GET /api/pumpfun-creator?action=tokens ─────────────────────────────
    if (req.method === 'GET' && action === 'tokens') {
        const govPrice    = await getDexPrice(PLATFORM_TOKENS.governing.mint);
        const rootibPrice = await getDexPrice(PLATFORM_TOKENS.rootib.mint);
        return new Response(JSON.stringify({
            success: true,
            tokens: {
                governing: { ...PLATFORM_TOKENS.governing, price: govPrice },
                rootib:    { ...PLATFORM_TOKENS.rootib,    price: rootibPrice }
            },
            vaultWallet: VAULT_WALLET,
            pumpfunCreate: PUMPFUN_CREATE
        }), { status: 200, headers: CORS });
    }

    // ── GET /api/pumpfun-creator?action=price&mint=xxx ────────────────────
    if (req.method === 'GET' && action === 'price') {
        const mint = url.searchParams.get('mint');
        if (!mint) return new Response(JSON.stringify({ error: 'mint required' }), { status: 400, headers: CORS });
        const price = await getDexPrice(mint);
        return new Response(JSON.stringify({ success: true, mint, price }), { status: 200, headers: CORS });
    }

    // ── GET /api/pumpfun-creator — list recent launches ───────────────────
    if (req.method === 'GET') {
        const launches = await supabaseSelect(
            'coin_launches',
            '?select=*&order=launched_at.desc&limit=20'
        );
        return new Response(JSON.stringify({
            success: true,
            launches,
            tokens: PLATFORM_TOKENS,
            vaultWallet: VAULT_WALLET
        }), { status: 200, headers: CORS });
    }

    // ── POST /api/pumpfun-creator — announce a coin launch ────────────────
    if (req.method === 'POST') {
        let body = {};
        try { body = await req.json(); } catch { /* empty */ }

        // Auth
        const key = body.key || url.searchParams.get('key');
        if (key !== ADMIN_KEY) {
            return new Response(JSON.stringify({ error: 'Unauthorized — provide admin key' }), {
                status: 401, headers: CORS
            });
        }

        const { name, symbol, description, mintAddress, pumpfunUrl, creator,
                discordUser, rootibTag, projectUrl } = body;

        if (!name) {
            return new Response(JSON.stringify({ error: 'name is required' }), {
                status: 400, headers: CORS
            });
        }

        const coin = { name, symbol, description, mintAddress, pumpfunUrl,
                       creator, discordUser, rootibTag, projectUrl };
        const { mainEmbed, revenueEmbed } = buildLaunchEmbeds(coin);

        const results = { discord: {}, supabase: null, errors: [] };

        // Post to #crypto-launch
        try {
            results.discord.cryptoLaunch = await discordPost(
                CH.cryptoLaunch, [mainEmbed],
                `@everyone 🚀 New coin launched! **${name}** (${symbol || '???'})`
            );
        } catch (e) {
            results.errors.push({ channel: 'cryptoLaunch', error: e.message });
        }

        // Post to #revenue-streams (rate-limit gap)
        await new Promise(r => setTimeout(r, 800));
        try {
            results.discord.revenueStreams = await discordPost(
                CH.revenueStreams, [revenueEmbed]
            );
        } catch (e) {
            results.errors.push({ channel: 'revenueStreams', error: e.message });
        }

        // Persist to Supabase (optional)
        const row = {
            name, symbol, description,
            mint_address:  mintAddress  || null,
            pumpfun_url:   pumpfunUrl   || (mintAddress ? `${PUMPFUN_BASE}${mintAddress}` : null),
            creator:       creator      || 'Anonymous',
            discord_user:  discordUser  || null,
            rootib_tag:    rootibTag    || null,
            project_url:   projectUrl   || null,
            launched_at:   new Date().toISOString()
        };
        try {
            results.supabase = await supabaseInsert('coin_launches', row);
        } catch (e) {
            results.errors.push({ store: 'supabase', error: e.message });
        }

        const status = results.discord.cryptoLaunch ? 200 : 207;
        return new Response(JSON.stringify({
            success: Boolean(results.discord.cryptoLaunch),
            coin,
            results,
            pumpfunUrl: coin.pumpfunUrl || (mintAddress ? `${PUMPFUN_BASE}${mintAddress}` : PUMPFUN_CREATE),
            hint: results.errors.length
                ? 'Some channels failed — check DISCORD_BOT_TOKEN'
                : null
        }), { status, headers: CORS });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: CORS
    });
}

export const config = { path: '/api/pumpfun-creator' };
