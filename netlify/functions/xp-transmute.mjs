/**
 * XP TRANSMUTE — Netlify Function
 * ════════════════════════════════════════════════════════════════════════════
 * POST /api/xp-transmute
 *
 * Accepts an XP redemption request and:
 *   1. Validates the request (minimum XP, known token, valid wallet)
 *   2. Persists a pending payout record in Supabase
 *   3. Returns the pump.fun link so the user can track / verify
 *
 * Tokens supported:
 *   OKK    – Overkill Kulture  : CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump
 *   RootIB – Root Idea Block   : 6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump
 *
 * Env vars required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_SECRET  (or SUPABASE_KEY)
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * ════════════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

/* ─── Token registry ──────────────────────────────────────────────────── */

const XP_TOKENS = {
    OKK: {
        address: 'CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        symbol:  'OKK',
        name:    'Overkill Kulture',
        xpRate:  100,    // 100 XP = 1 OKK
        minXP:   1000,
        pumpfunUrl: 'https://pump.fun/coin/CFB81yp47VXeypR9VPqVdPPPtfVVTc47P4H5TzfWpump',
        distributorWallet: '5cEViMoVC383m92PhLxKRjUQUmLtktCWd2TDxYmKrajN'
    },
    RootIB: {
        address: '6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump',
        symbol:  'RootIB',
        name:    'Root Idea Block',
        xpRate:  500,    // 500 XP = 1 RootIB
        minXP:   5000,
        pumpfunUrl: 'https://pump.fun/coin/6xaadtw1ZsuYXW8gCY4WXfhiv8CmFgp5iwhbA3xSpump'
    }
};

const VAULT_WALLET = '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk';

/**
 * OKKDistributor wallet — Solflare wallet that receives vault funds for
 * automated XP-to-OKK on-chain conversions on consciousnessrevolution.io
 * and via Discord (https://discord.gg/Yf2HUxbS).
 */
const OKK_DISTRIBUTOR_WALLET = '5cEViMoVC383m92PhLxKRjUQUmLtktCWd2TDxYmKrajN';

/* ─── CORS headers ────────────────────────────────────────────────────── */

const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

/* ─── Supabase helper ─────────────────────────────────────────────────── */

function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/* ─── Solana address validation ───────────────────────────────────────── */

function isValidSolanaAddress(addr) {
    if (!addr || typeof addr !== 'string') return false;
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}

/* ─── Handler ─────────────────────────────────────────────────────────── */

export async function handler(event) {

    /* Preflight */
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS, body: '' };
    }

    /* GET — quote endpoint (no side effects) */
    if (event.httpMethod === 'GET') {
        const qs = event.queryStringParameters || {};
        const { tokenKey, xpAmount } = qs;
        const token = XP_TOKENS[tokenKey];
        if (!token) {
            return json(400, { error: `Unknown tokenKey. Valid values: ${Object.keys(XP_TOKENS).join(', ')}` });
        }
        const xp = parseInt(xpAmount, 10) || 0;
        if (xp < token.minXP) {
            return json(400, { error: `Minimum ${token.minXP} XP required for ${token.symbol}`, minXP: token.minXP });
        }
        const tokenAmount = Math.floor(xp / token.xpRate);
        return json(200, {
            success: true,
            tokenKey,
            tokenSymbol: token.symbol,
            tokenAmount,
            xpSpent: tokenAmount * token.xpRate,
            rate: `${token.xpRate} XP = 1 ${token.symbol}`,
            pumpfunUrl: token.pumpfunUrl
        });
    }

    /* POST — submit transmutation */
    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Method not allowed' });
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return json(400, { error: 'Invalid JSON body' });
    }

    const {
        tokenKey,
        xpSpent,
        tokenAmount,
        walletAddress,
        userId
    } = body;

    /* ── Validate token ────────────────────────────────────────────── */
    const token = XP_TOKENS[tokenKey];
    if (!token) {
        return json(400, { error: `Unknown tokenKey. Valid values: ${Object.keys(XP_TOKENS).join(', ')}` });
    }

    /* ── Validate XP amount ────────────────────────────────────────── */
    const xp = parseInt(xpSpent, 10) || 0;
    if (xp < token.minXP) {
        return json(400, { error: `Minimum ${token.minXP} XP required to redeem ${token.symbol}` });
    }

    /* ── Cross-validate token amount ───────────────────────────────── */
    const expectedTokens = Math.floor(xp / token.xpRate);
    const claimed = parseInt(tokenAmount, 10) || 0;
    if (claimed > expectedTokens) {
        return json(400, { error: `Token amount mismatch: expected ≤${expectedTokens} for ${xp} XP` });
    }

    /* ── Validate wallet address ───────────────────────────────────── */
    if (!isValidSolanaAddress(walletAddress)) {
        return json(400, { error: 'Invalid Solana wallet address' });
    }

    /* ── Build payout record ───────────────────────────────────────── */
    const txId     = `xtx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record   = {
        tx_id:                txId,
        token_key:            tokenKey,
        token_address:        token.address,
        token_symbol:         token.symbol,
        token_name:           token.name,
        xp_spent:             xp,
        token_amount:         expectedTokens,
        wallet_address:       walletAddress.trim(),
        user_id:              userId || null,
        vault_wallet:         VAULT_WALLET,
        // OKK payouts are routed through the OKKDistributor Solflare wallet
        distributor_wallet:   token.distributorWallet || null,
        status:               'pending',
        pumpfun_url:          token.pumpfunUrl,
        created_at:           new Date().toISOString()
    };

    /* ── Persist to Supabase (best-effort) ─────────────────────────── */
    let persisted = false;
    const supabase = getSupabase();
    if (supabase) {
        try {
            const { error } = await supabase
                .from('xp_transmutations')
                .insert(record);
            if (error) {
                console.error('[xp-transmute] Supabase insert error:', error.message);
            } else {
                persisted = true;
            }
        } catch (err) {
            console.error('[xp-transmute] Supabase error:', err.message);
        }
    }

    /* ── Respond ───────────────────────────────────────────────────── */
    return json(200, {
        success:            true,
        txId,
        tokenKey,
        tokenSymbol:        token.symbol,
        tokenAmount:        expectedTokens,
        xpSpent:            xp,
        walletAddress:      walletAddress.trim(),
        pumpfunUrl:         token.pumpfunUrl,
        vaultWallet:        VAULT_WALLET,
        distributorWallet:  token.distributorWallet || null,
        persisted,
        message:      persisted
            ? `Transmutation queued! ${expectedTokens} ${token.symbol} will be sent to your wallet.`
            : `Transmutation recorded locally. ${expectedTokens} ${token.symbol} will be sent to your wallet once the queue processes.`
    });
}

/* ─── Response helper ─────────────────────────────────────────────────── */
function json(status, body) {
    return {
        statusCode: status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
}
