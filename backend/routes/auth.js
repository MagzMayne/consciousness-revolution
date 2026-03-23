// backend/routes/auth.js
// Real Supabase-backed authentication routes for the Railway backend.
//
// ENDPOINTS (all mounted under /api/auth by server-main.js):
//   POST /api/auth/register       — create a new user account
//   POST /api/auth/login          — sign in with email + password
//   POST /api/auth/request-reset  — send a password-reset email

'use strict';

const express = require('express');
const router = express.Router();
const { getSupabaseAdmin } = require('../supabaseClient');

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ ok: true, user: { id: data.user.id, email: data.user.email } });
  } catch (err) {
    console.error('[auth/register]', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ session: data.session, user: data.user });
  } catch (err) {
    console.error('[auth/login]', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/request-reset ──────────────────────────────────────────
router.post('/request-reset', async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://conciousnessrevolution.io/reset-password.html'
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('[auth/request-reset]', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
