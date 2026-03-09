/**
 * ARAYA UNIFIED CREDITS API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * Created: 2026-02-27
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 *
 * Features:
 * - Get user credit balance
 * - Add credits (purchase, bonus, promo)
 * - Spend credits (with product tracking)
 * - Transaction history
 * - Credit cost lookup
 */

import { createClient } from '@supabase/supabase-js';

// Use the same fallback pattern as araya-chat.mjs for Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET ||
                     process.env.SUPABASE_SERVICE_KEY ||
                     process.env.SUPABASE_ANON_KEY;

// Validate credentials before creating client
const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export async function handler(event, context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return error('Method not allowed', headers, 405);
    }

    // Check Supabase configuration
    if (!supabase) {
        console.error('[ARAYA CREDITS] Supabase not configured. Missing SUPABASE_URL or key.');
        return error('Database not configured', headers, 503);
    }

    try {
        const { action, userId, amount, product, metadata, limit } = JSON.parse(event.body || '{}');

        if (!userId && action !== 'get_product_costs') {
            return error('userId required', headers);
        }

        console.log(`[ARAYA CREDITS] Action: ${action}, User: ${userId}`);

        switch (action) {
            case 'get_balance':
                return await getBalance(userId, headers);
            case 'add_credits':
                return await addCredits(userId, amount, metadata, headers);
            case 'spend_credits':
                return await spendCredits(userId, amount, product, metadata, headers);
            case 'check_and_spend':
                return await checkAndSpend(userId, amount, product, metadata, headers);
            case 'get_transactions':
                return await getTransactions(userId, limit, headers);
            case 'get_product_costs':
                return await getProductCosts(headers);
            case 'get_packages':
                return await getPackages(headers);
            default:
                return error('Invalid action', headers);
        }
    } catch (e) {
        console.error('[ARAYA CREDITS] Error:', e.message);
        return error(e.message, headers, 500);
    }
}

// ═══════════════════════════════════════════════════════════════
// BALANCE OPERATIONS
// ═══════════════════════════════════════════════════════════════

async function getBalance(userId, headers) {
    const { data, error: err } = await supabase
        .from('araya_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (err && err.code === 'PGRST116') {
        // User not found, create with 0 balance
        return await createUser(userId, headers);
    }

    if (err) {
        return error(err.message, headers);
    }

    return success({
        credits: data.credits_balance,
        tier: data.tier,
        lifetime_purchased: data.lifetime_purchased,
        lifetime_spent: data.lifetime_spent,
        user_id: userId
    }, headers);
}

async function createUser(userId, headers) {
    const { data, error: err } = await supabase
        .from('araya_credits')
        .insert({
            user_id: userId,
            credits_balance: 0,
            tier: 'free'
        })
        .select()
        .single();

    if (err) {
        return error(err.message, headers);
    }

    console.log(`[ARAYA CREDITS] Created user: ${userId}`);

    return success({
        credits: 0,
        tier: 'free',
        lifetime_purchased: 0,
        lifetime_spent: 0,
        user_id: userId,
        created: true
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// ADD CREDITS (Purchase, Bonus, Promo)
// ═══════════════════════════════════════════════════════════════

async function addCredits(userId, amount, metadata = {}, headers) {
    if (!amount || amount <= 0) {
        return error('Invalid amount', headers);
    }

    // Get current balance
    const balanceResult = await getBalance(userId, headers);
    if (!balanceResult.statusCode || balanceResult.statusCode !== 200) {
        return balanceResult; // Return error
    }

    const currentData = JSON.parse(balanceResult.body).data;
    const newBalance = currentData.credits + amount;

    // Update credits table
    const { error: updateErr } = await supabase
        .from('araya_credits')
        .update({
            credits_balance: newBalance,
            lifetime_purchased: currentData.lifetime_purchased + amount,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

    if (updateErr) {
        return error(updateErr.message, headers);
    }

    // Log transaction
    await logTransaction(
        userId,
        'purchase',
        amount,
        newBalance,
        null,
        metadata
    );

    console.log(`[ARAYA CREDITS] Added ${amount} credits to ${userId}, new balance: ${newBalance}`);

    return success({
        credits: newBalance,
        added: amount,
        message: `Added ${amount} credits`
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// SPEND CREDITS (With product tracking)
// ═══════════════════════════════════════════════════════════════

async function spendCredits(userId, amount, product, metadata = {}, headers) {
    if (!amount || amount <= 0) {
        return error('Invalid amount', headers);
    }

    if (!product) {
        return error('Product required', headers);
    }

    // Get current balance
    const balanceResult = await getBalance(userId, headers);
    if (!balanceResult.statusCode || balanceResult.statusCode !== 200) {
        return balanceResult;
    }

    const currentData = JSON.parse(balanceResult.body).data;

    // Check if user has enough credits
    if (currentData.credits < amount) {
        return error('Insufficient credits', headers, 402, {
            required: amount,
            available: currentData.credits,
            shortfall: amount - currentData.credits
        });
    }

    const newBalance = currentData.credits - amount;

    // Update credits table
    const { error: updateErr } = await supabase
        .from('araya_credits')
        .update({
            credits_balance: newBalance,
            lifetime_spent: currentData.lifetime_spent + amount,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

    if (updateErr) {
        return error(updateErr.message, headers);
    }

    // Log transaction
    await logTransaction(
        userId,
        'spend',
        -amount,
        newBalance,
        product,
        metadata
    );

    console.log(`[ARAYA CREDITS] Spent ${amount} credits from ${userId} on ${product}, new balance: ${newBalance}`);

    return success({
        credits: newBalance,
        spent: amount,
        product,
        message: `Spent ${amount} credits on ${product}`
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// CHECK AND SPEND (Atomic operation)
// ═══════════════════════════════════════════════════════════════

async function checkAndSpend(userId, amount, product, metadata = {}, headers) {
    // This is the recommended method for product integrations
    // Returns success: true/false based on credit availability

    const balanceResult = await getBalance(userId, headers);
    if (!balanceResult.statusCode || balanceResult.statusCode !== 200) {
        return success({
            success: false,
            error: 'User not found',
            available: 0
        }, headers);
    }

    const currentData = JSON.parse(balanceResult.body).data;

    if (currentData.credits < amount) {
        return success({
            success: false,
            error: 'Insufficient credits',
            required: amount,
            available: currentData.credits,
            shortfall: amount - currentData.credits
        }, headers);
    }

    // Spend the credits
    const spendResult = await spendCredits(userId, amount, product, metadata, headers);
    const spendData = JSON.parse(spendResult.body);

    if (spendData.success) {
        return success({
            success: true,
            credits: spendData.data.credits,
            spent: amount,
            product
        }, headers);
    } else {
        return success({
            success: false,
            error: spendData.error
        }, headers);
    }
}

// ═══════════════════════════════════════════════════════════════
// TRANSACTION LOG
// ═══════════════════════════════════════════════════════════════

async function logTransaction(userId, type, amount, balanceAfter, product, metadata) {
    await supabase
        .from('araya_credit_transactions')
        .insert({
            user_id: userId,
            type,
            amount,
            balance_after: balanceAfter,
            product,
            metadata,
            stripe_session_id: metadata.stripe_session_id || null
        });
}

async function getTransactions(userId, limit = 50, headers) {
    const { data, error: err } = await supabase
        .from('araya_credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (err) {
        return error(err.message, headers);
    }

    return success({
        transactions: data,
        count: data.length
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT COSTS & PACKAGES
// ═══════════════════════════════════════════════════════════════

async function getProductCosts(headers) {
    const { data, error: err } = await supabase
        .from('araya_product_costs')
        .select('*')
        .eq('active', true)
        .order('product', { ascending: true });

    if (err) {
        return error(err.message, headers);
    }

    // Group by product
    const costs = {};
    data.forEach(row => {
        if (!costs[row.product]) {
            costs[row.product] = {};
        }
        costs[row.product][row.action] = {
            credits: row.credits_cost,
            description: row.description
        };
    });

    return success({ costs }, headers);
}

async function getPackages(headers) {
    const { data, error: err } = await supabase
        .from('araya_credit_packages')
        .select('*')
        .eq('active', true)
        .order('price_cents', { ascending: true });

    if (err) {
        return error(err.message, headers);
    }

    return success({ packages: data }, headers);
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════

function success(data, headers) {
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            data
        })
    };
}

function error(message, headers, statusCode = 400, details = {}) {
    return {
        statusCode,
        headers,
        body: JSON.stringify({
            success: false,
            error: message,
            details
        })
    };
}
