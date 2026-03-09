// CREDIT MANAGER API
// Handles all credit operations for Collaborative Dev Game

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Service role for admin operations
);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, user_id, amount, transaction_type, metadata } = body;

    switch(action) {
      case 'get_balance':
        return await getBalance(user_id, headers);

      case 'spend_credits':
        return await spendCredits(user_id, amount, transaction_type, metadata, headers);

      case 'earn_credits':
        return await earnCredits(user_id, amount, transaction_type, metadata, headers);

      case 'check_can_afford':
        return await checkCanAfford(user_id, amount, headers);

      case 'submit_hardhitter':
        return await submitHardhitter(body, headers);

      case 'get_founder_progress':
        return await getFounderProgress(user_id, headers);

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Credit manager error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// GET BALANCE
async function getBalance(user_id, headers) {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (error && error.code === 'PGRST116') {
    // User doesn't exist - create with 1000 free credits
    const { data: newUser, error: createError } = await supabase
      .from('user_credits')
      .insert({
        user_id,
        total_credits: 1000,
        free_tier_credits: 1000,
        tier: 'free'
      })
      .select()
      .single();

    if (createError) throw createError;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(newUser)
    };
  }

  if (error) throw error;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data)
  };
}

// SPEND CREDITS
async function spendCredits(user_id, amount, transaction_type, metadata, headers) {
  // Check balance first
  const { data: credits } = await supabase
    .from('user_credits')
    .select('total_credits')
    .eq('user_id', user_id)
    .single();

  if (!credits || credits.total_credits < amount) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        error: 'Insufficient credits',
        available: credits?.total_credits || 0,
        needed: amount
      })
    };
  }

  // Deduct credits
  const { data: updated, error: updateError } = await supabase
    .from('user_credits')
    .update({
      total_credits: credits.total_credits - amount,
      spent_credits: supabase.rpc('increment', { x: amount }),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user_id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Log transaction
  await supabase.from('credit_transactions').insert({
    user_id,
    amount: -amount,
    transaction_type,
    description: `Spent ${amount} credits on ${transaction_type}`,
    metadata
  });

  // Log usage
  await supabase.from('system_usage').insert({
    user_id,
    system_type: metadata?.system_type || transaction_type,
    credits_spent: amount,
    metadata
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      new_balance: updated.total_credits,
      amount_spent: amount
    })
  };
}

// EARN CREDITS
async function earnCredits(user_id, amount, transaction_type, metadata, headers) {
  // Get current balance
  const { data: credits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!credits) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'User not found' })
    };
  }

  // Add credits
  const { data: updated, error: updateError } = await supabase
    .from('user_credits')
    .update({
      total_credits: credits.total_credits + amount,
      earned_credits: credits.earned_credits + amount,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user_id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Log transaction
  await supabase.from('credit_transactions').insert({
    user_id,
    amount,
    transaction_type,
    description: `Earned ${amount} credits from ${transaction_type}`,
    metadata
  });

  // Update founder progress if XP-related
  if (transaction_type === 'xp_earn') {
    await updateFounderProgress(user_id, metadata);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      new_balance: updated.total_credits,
      amount_earned: amount
    })
  };
}

// CHECK IF USER CAN AFFORD
async function checkCanAfford(user_id, amount, headers) {
  const { data } = await supabase
    .from('user_credits')
    .select('total_credits, tier')
    .eq('user_id', user_id)
    .single();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      can_afford: data ? data.total_credits >= amount : false,
      available: data?.total_credits || 0,
      tier: data?.tier || 'free'
    })
  };
}

// SUBMIT HARDHITTER APPLICATION
async function submitHardhitter(data, headers) {
  const { user_id, email, system_name, system_description, repo_url, system_size, estimated_monthly_usage, use_case } = data;

  const { data: submission, error } = await supabase
    .from('hardhitter_submissions')
    .insert({
      user_id,
      email,
      system_name,
      system_description,
      repo_url,
      system_size,
      estimated_monthly_usage,
      use_case,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  // Send notification to Discord webhook
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🚀 **NEW HARDHITTER SUBMISSION**\n\nSystem: ${system_name}\nSize: ${system_size}\nEstimated Usage: ${estimated_monthly_usage}/month\nEmail: ${email}\n\nReview at: consciousnessrevolution.io/admin/hardhitter-review.html?id=${submission.id}`
    })
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      submission_id: submission.id,
      message: 'Hardhitter application submitted! You\'ll hear back within 48 hours.'
    })
  };
}

// UPDATE FOUNDER PROGRESS
async function updateFounderProgress(user_id, metadata) {
  const xp_amount = metadata?.xp_amount || 0;

  // Upsert founder progress
  await supabase
    .from('founder_progress')
    .upsert({
      user_id,
      total_xp: supabase.rpc('increment', { x: xp_amount }),
      days_active: supabase.rpc('increment', { x: 1 })
    }, {
      onConflict: 'user_id'
    });

  // Check if user qualifies for founder status
  const { data: progress } = await supabase
    .from('founder_progress')
    .select('*')
    .eq('user_id', user_id)
    .single();

  // FOUNDER CRITERIA: 10,000 XP + 10 feedback items + 5 bug reports
  if (progress && progress.total_xp >= 10000 && progress.feedback_count >= 10 && progress.bug_reports >= 5 && progress.founder_status === 'candidate') {
    await supabase
      .from('founder_progress')
      .update({
        founder_status: 'earned',
        earned_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    // Award 10,000 bonus credits
    await earnCredits(user_id, 10000, 'founder_bonus', { reason: 'Earned Founder status' }, {});

    // Send notification
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🏆 **NEW FOUNDER EARNED!** 🏆\n\nUser ${user_id} just earned Founder status!\n\nStats:\n- Total XP: ${progress.total_xp}\n- Feedback: ${progress.feedback_count}\n- Bug Reports: ${progress.bug_reports}`
      })
    });
  }
}

// GET FOUNDER PROGRESS
async function getFounderProgress(user_id, headers) {
  const { data, error } = await supabase
    .from('founder_progress')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (error && error.code === 'PGRST116') {
    // Create initial progress record
    const { data: newProgress, error: createError } = await supabase
      .from('founder_progress')
      .insert({ user_id, founder_status: 'candidate' })
      .select()
      .single();

    if (createError) throw createError;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(newProgress)
    };
  }

  if (error) throw error;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data)
  };
}
