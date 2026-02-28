/**
 * ARAYA Energy API
 * ================
 * Unified credit system across all ARAYA products
 *
 * Endpoints:
 *   GET  /energy/balance     - Check user's Energy
 *   POST /energy/spend       - Deduct Energy (with product tracking)
 *   POST /energy/purchase    - Create Stripe checkout
 *   GET  /energy/history     - Transaction history
 *   GET  /energy/costs       - Per-action pricing
 *   POST /energy/webhook     - Stripe webhook handler
 *   POST /energy/sync        - Sync offline transactions (CLI)
 *
 * Created: 2026-02-27
 * Version: 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Clerk-User-Id, X-Idempotency-Key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Helper: Get user from Clerk ID
async function getAccount(clerkId) {
  const { data, error } = await supabase
    .from('araya_accounts')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
}

// Helper: Create new account
async function createAccount(clerkId, email) {
  const { data, error } = await supabase
    .from('araya_accounts')
    .insert({
      user_id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clerk_id: clerkId,
      email: email,
      current_balance: 100, // Free tier starting balance
      tier: 'flow',
      monthly_allocation: 100
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper: Response builder
function respond(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
}

// ============================================================
// ENDPOINT HANDLERS
// ============================================================

/**
 * GET /energy/balance
 * Returns user's current Energy balance and account info
 */
async function handleBalance(clerkId) {
  let account = await getAccount(clerkId);

  if (!account) {
    return respond(404, { error: 'Account not found', code: 'NO_ACCOUNT' });
  }

  return respond(200, {
    success: true,
    data: {
      balance: account.current_balance,
      tier: account.tier,
      monthly_allocation: account.monthly_allocation,
      lifetime_consumed: account.lifetime_consumed,
      subscription_status: account.subscription_status,
      subscription_period_end: account.subscription_period_end
    }
  });
}

/**
 * POST /energy/spend
 * Deduct Energy for a product action
 * Body: { product, action, amount?, idempotency_key? }
 */
async function handleSpend(clerkId, body) {
  const { product, action, amount, idempotency_key } = body;

  if (!product || !action) {
    return respond(400, { error: 'Missing product or action', code: 'INVALID_REQUEST' });
  }

  // Get account
  const account = await getAccount(clerkId);
  if (!account) {
    return respond(404, { error: 'Account not found', code: 'NO_ACCOUNT' });
  }

  // Get action cost (or use provided amount)
  let energyCost = amount;
  if (!energyCost) {
    const { data: costData } = await supabase
      .from('araya_costs')
      .select('energy_cost')
      .eq('product', product)
      .eq('action', action)
      .eq('active', true)
      .single();

    energyCost = costData?.energy_cost || 1; // Default to 1 if not found
  }

  // Free actions (cost = 0)
  if (energyCost === 0) {
    return respond(200, {
      success: true,
      data: {
        spent: 0,
        balance: account.current_balance,
        message: 'Free action - no Energy consumed'
      }
    });
  }

  // Scale tier = unlimited
  if (account.tier === 'scale') {
    // Log but don't deduct
    await supabase.from('araya_transactions').insert({
      account_id: account.id,
      amount: 0,
      balance_after: account.current_balance,
      transaction_type: 'consume',
      product_source: product,
      action_type: action,
      idempotency_key: idempotency_key || `${clerkId}_${Date.now()}`,
      metadata: { actual_cost: energyCost, tier_unlimited: true }
    });

    return respond(200, {
      success: true,
      data: {
        spent: 0,
        balance: account.current_balance,
        message: 'Scale tier - unlimited Energy'
      }
    });
  }

  // Use stored procedure for atomic operation
  const { data, error } = await supabase.rpc('spend_energy', {
    p_account_id: account.id,
    p_amount: energyCost,
    p_product: product,
    p_action: action,
    p_idempotency_key: idempotency_key || `${clerkId}_${product}_${action}_${Date.now()}`
  });

  if (error) {
    console.error('Spend energy error:', error);
    return respond(500, { error: 'Failed to process', code: 'INTERNAL_ERROR' });
  }

  const result = data[0];

  if (!result.success) {
    if (result.message === 'Insufficient Energy') {
      return respond(402, {
        error: 'Insufficient Energy',
        code: 'INSUFFICIENT_ENERGY',
        data: {
          required: energyCost,
          available: result.new_balance
        }
      });
    }
    return respond(400, { error: result.message, code: 'SPEND_FAILED' });
  }

  return respond(200, {
    success: true,
    data: {
      spent: energyCost,
      balance: result.new_balance,
      product,
      action
    }
  });
}

/**
 * POST /energy/purchase
 * Create Stripe checkout session for Energy purchase
 * Body: { package_id, success_url, cancel_url }
 */
async function handlePurchase(clerkId, body) {
  const { package_id, success_url, cancel_url } = body;

  if (!package_id) {
    return respond(400, { error: 'Missing package_id', code: 'INVALID_REQUEST' });
  }

  // Get account (or create)
  let account = await getAccount(clerkId);
  if (!account) {
    account = await createAccount(clerkId, body.email);
  }

  // Get package
  const { data: pkg, error: pkgError } = await supabase
    .from('araya_packages')
    .select('*')
    .eq('id', package_id)
    .eq('active', true)
    .single();

  if (pkgError || !pkg) {
    return respond(404, { error: 'Package not found', code: 'INVALID_PACKAGE' });
  }

  // Ensure Stripe customer exists
  let stripeCustomerId = account.stripe_customer_id;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: account.email,
      metadata: {
        clerk_id: clerkId,
        account_id: account.id
      }
    });
    stripeCustomerId = customer.id;

    await supabase
      .from('araya_accounts')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', account.id);
  }

  // Create checkout session
  const sessionConfig = {
    customer: stripeCustomerId,
    line_items: [{
      price: pkg.stripe_price_id,
      quantity: 1
    }],
    mode: pkg.package_type === 'subscription' ? 'subscription' : 'payment',
    success_url: success_url || 'https://consciousnessrevolution.io/energy/success',
    cancel_url: cancel_url || 'https://consciousnessrevolution.io/energy/cancel',
    metadata: {
      account_id: account.id,
      package_id: pkg.id,
      energy_amount: pkg.energy_amount,
      bonus_energy: pkg.bonus_energy
    }
  };

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return respond(200, {
    success: true,
    data: {
      checkout_url: session.url,
      session_id: session.id
    }
  });
}

/**
 * GET /energy/history
 * Returns transaction history with pagination
 * Query: ?limit=20&offset=0&type=consume
 */
async function handleHistory(clerkId, queryParams) {
  const limit = Math.min(parseInt(queryParams.limit) || 20, 100);
  const offset = parseInt(queryParams.offset) || 0;
  const type = queryParams.type;

  const account = await getAccount(clerkId);
  if (!account) {
    return respond(404, { error: 'Account not found', code: 'NO_ACCOUNT' });
  }

  let query = supabase
    .from('araya_transactions')
    .select('*', { count: 'exact' })
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq('transaction_type', type);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('History error:', error);
    return respond(500, { error: 'Failed to fetch history', code: 'INTERNAL_ERROR' });
  }

  return respond(200, {
    success: true,
    data: {
      transactions: data,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: offset + limit < count
      }
    }
  });
}

/**
 * GET /energy/costs
 * Returns all action costs for all products
 * Query: ?product=voice (optional filter)
 */
async function handleCosts(queryParams) {
  let query = supabase
    .from('araya_costs')
    .select('product, action, display_name, description, energy_cost, requires_tier')
    .eq('active', true)
    .order('product')
    .order('energy_cost');

  if (queryParams.product) {
    query = query.eq('product', queryParams.product);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Costs error:', error);
    return respond(500, { error: 'Failed to fetch costs', code: 'INTERNAL_ERROR' });
  }

  // Group by product
  const grouped = data.reduce((acc, cost) => {
    if (!acc[cost.product]) {
      acc[cost.product] = [];
    }
    acc[cost.product].push(cost);
    return acc;
  }, {});

  return respond(200, {
    success: true,
    data: {
      costs: grouped,
      summary: {
        products: Object.keys(grouped).length,
        total_actions: data.length
      }
    }
  });
}

/**
 * POST /energy/webhook
 * Stripe webhook handler for payment events
 */
async function handleWebhook(body, signature) {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return respond(400, { error: 'Invalid signature' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { account_id, energy_amount, bonus_energy } = session.metadata;

      if (account_id && energy_amount) {
        const totalEnergy = parseInt(energy_amount) + parseInt(bonus_energy || 0);

        // Add Energy to account
        await supabase.rpc('add_energy', {
          p_account_id: account_id,
          p_amount: totalEnergy,
          p_transaction_type: session.mode === 'subscription' ? 'subscription' : 'purchase',
          p_stripe_payment_id: session.payment_intent,
          p_idempotency_key: `stripe_${session.id}`
        });

        console.log(`Added ${totalEnergy} Energy to account ${account_id}`);
      }
      break;
    }

    case 'invoice.paid': {
      // Recurring subscription payment
      const invoice = event.data.object;
      const customerId = invoice.customer;

      // Find account by Stripe customer ID
      const { data: account } = await supabase
        .from('araya_accounts')
        .select('id, monthly_allocation')
        .eq('stripe_customer_id', customerId)
        .single();

      if (account) {
        await supabase.rpc('add_energy', {
          p_account_id: account.id,
          p_amount: account.monthly_allocation,
          p_transaction_type: 'subscription',
          p_stripe_payment_id: invoice.payment_intent,
          p_idempotency_key: `stripe_invoice_${invoice.id}`
        });

        console.log(`Subscription renewal: Added ${account.monthly_allocation} Energy to account ${account.id}`);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Update subscription status
      await supabase
        .from('araya_accounts')
        .update({
          subscription_status: subscription.status,
          subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Downgrade to free tier
      await supabase
        .from('araya_accounts')
        .update({
          tier: 'flow',
          subscription_status: 'canceled',
          monthly_allocation: 100
        })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }

  return respond(200, { received: true });
}

/**
 * POST /energy/sync
 * Sync offline transactions from CLI
 * Body: { transactions: [{ action, product, amount, timestamp }] }
 */
async function handleSync(clerkId, body) {
  const { transactions } = body;

  if (!transactions || !Array.isArray(transactions)) {
    return respond(400, { error: 'Missing transactions array', code: 'INVALID_REQUEST' });
  }

  const account = await getAccount(clerkId);
  if (!account) {
    return respond(404, { error: 'Account not found', code: 'NO_ACCOUNT' });
  }

  const results = [];
  let totalDeducted = 0;

  for (const tx of transactions) {
    const idempotencyKey = `sync_${clerkId}_${tx.timestamp}_${tx.action}`;

    const { data, error } = await supabase.rpc('spend_energy', {
      p_account_id: account.id,
      p_amount: tx.amount || 1,
      p_product: tx.product || 'terminal',
      p_action: tx.action,
      p_idempotency_key: idempotencyKey
    });

    if (error) {
      results.push({ ...tx, synced: false, error: error.message });
    } else {
      const result = data[0];
      results.push({
        ...tx,
        synced: result.success,
        balance_after: result.new_balance,
        message: result.message
      });
      if (result.success) {
        totalDeducted += tx.amount || 1;
      }
    }
  }

  // Get final balance
  const { data: finalAccount } = await supabase
    .from('araya_accounts')
    .select('current_balance')
    .eq('id', account.id)
    .single();

  return respond(200, {
    success: true,
    data: {
      synced_count: results.filter(r => r.synced).length,
      failed_count: results.filter(r => !r.synced).length,
      total_deducted: totalDeducted,
      final_balance: finalAccount?.current_balance || 0,
      results
    }
  });
}

// ============================================================
// MAIN HANDLER
// ============================================================

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, {});
  }

  const path = event.path.replace('/.netlify/functions/araya-energy', '').replace('/energy', '');
  const method = event.httpMethod;
  const clerkId = event.headers['x-clerk-user-id'];
  const queryParams = event.queryStringParameters || {};

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    // Body might be raw for webhooks
    body = event.body;
  }

  try {
    // Route requests
    switch (true) {
      // GET /energy/balance
      case method === 'GET' && path === '/balance':
        if (!clerkId) return respond(401, { error: 'Unauthorized', code: 'NO_AUTH' });
        return await handleBalance(clerkId);

      // POST /energy/spend
      case method === 'POST' && path === '/spend':
        if (!clerkId) return respond(401, { error: 'Unauthorized', code: 'NO_AUTH' });
        return await handleSpend(clerkId, body);

      // POST /energy/purchase
      case method === 'POST' && path === '/purchase':
        if (!clerkId) return respond(401, { error: 'Unauthorized', code: 'NO_AUTH' });
        return await handlePurchase(clerkId, body);

      // GET /energy/history
      case method === 'GET' && path === '/history':
        if (!clerkId) return respond(401, { error: 'Unauthorized', code: 'NO_AUTH' });
        return await handleHistory(clerkId, queryParams);

      // GET /energy/costs
      case method === 'GET' && path === '/costs':
        return await handleCosts(queryParams);

      // POST /energy/webhook
      case method === 'POST' && path === '/webhook':
        const signature = event.headers['stripe-signature'];
        return await handleWebhook(body, signature);

      // POST /energy/sync
      case method === 'POST' && path === '/sync':
        if (!clerkId) return respond(401, { error: 'Unauthorized', code: 'NO_AUTH' });
        return await handleSync(clerkId, body);

      // Account creation/lookup
      case method === 'POST' && path === '/account':
        if (!clerkId) return respond(401, { error: 'Unauthorized', code: 'NO_AUTH' });
        let account = await getAccount(clerkId);
        if (!account) {
          account = await createAccount(clerkId, body.email);
        }
        return respond(200, { success: true, data: account });

      default:
        return respond(404, {
          error: 'Endpoint not found',
          code: 'NOT_FOUND',
          available_endpoints: [
            'GET /energy/balance',
            'POST /energy/spend',
            'POST /energy/purchase',
            'GET /energy/history',
            'GET /energy/costs',
            'POST /energy/webhook',
            'POST /energy/sync',
            'POST /energy/account'
          ]
        });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return respond(500, {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
}
