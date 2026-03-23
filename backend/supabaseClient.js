// backend/supabaseClient.js
// Supabase admin client for Railway backend services.
//
// Environment variables required:
//   SUPABASE_URL          — Supabase project URL
//   SUPABASE_SERVICE_ROLE — Supabase service-role secret key (full admin access)
//
// This module gives the backend full admin access to:
//   - create users
//   - send password reset emails
//   - verify emails
//   - manage sessions

'use strict';

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

let supabaseAdmin = null;

/**
 * Returns the shared Supabase admin client.
 * Throws if the required environment variables are not set.
 */
function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error(
      'Supabase configuration missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE environment variables.'
    );
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }

  return supabaseAdmin;
}

module.exports = { getSupabaseAdmin };
