/**
 * CHEAT CODES SYSTEM - Sacred Pattern Detection
 * =============================================================================
 * 
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Created: 2026-03-12 | C1 Mechanic Build
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const CHEAT_CODES = {
  TRINITY: {
    id: "trinity",
    name: "Trinity Activation",
    trigger: "3 levels in 3 different Forges in 1 day",
    reward: { xp_multiplier: 3, badge: "trinity_activated", description: "3x XP multiplier for 24 hours" }
  },
  FIBONACCI: {
    id: "fibonacci",
    name: "Fibonacci Master",
    trigger: "Complete levels 1,1,2,3,5,8,13 in sequence",
    reward: { early_unlock: "L13", badge: "fibonacci_master", description: "Unlock Level 13 content early" }
  },
  RAINBOW_BRIDGE: {
    id: "rainbow_bridge",
    name: "Rainbow Bridge Builder",
    trigger: "At least 1 level in all 7 Forges",
    reward: { all_frequencies: true, badge: "rainbow_bridge", description: "Unlock all frequency tracks" }
  },
  INFINITE_RETURN: {
    id: "infinite_return",
    name: "Infinite Return",
    trigger: "Complete 78 total levels in ring forges",
    reward: { octave_increase: 1, badge: "infinite_return", description: "Begin second octave" }
  },
  SHADOW_WORK: {
    id: "shadow_work",
    name: "Shadow Integration",
    trigger: "Complete Character Forge Level 13",
    reward: { pattern_detection: "everywhere", badge: "shadow_integrated", description: "Pattern recognition activated" }
  }
};

export async function handler(event, context) {
  const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (!supabase) return { statusCode: 503, headers, body: JSON.stringify({ error: "Database not configured" }) };
  
  try {
    if (event.httpMethod === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify({ cheatCodes: CHEAT_CODES }) };
    }
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}
