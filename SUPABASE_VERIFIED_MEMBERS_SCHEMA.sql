-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFIED MEMBERS TABLE - Consciousness Revolution
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
--
-- Purpose: Store Stage 2 identity verification submissions
-- Created: 2026-02-25
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the verified_members table
CREATE TABLE IF NOT EXISTS verified_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Core identity
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,

    -- Address (optional)
    address_city TEXT,
    address_state TEXT,
    address_country TEXT DEFAULT 'USA',

    -- Social verification
    discord_username TEXT NOT NULL UNIQUE,
    instagram_handle TEXT,
    other_social TEXT,

    -- Photo verification (OPTIONAL - stored in Supabase Storage)
    id_photo_url TEXT,
    selfie_url TEXT,

    -- Builder info
    how_found_us TEXT,
    what_building TEXT,

    -- Agreements
    agreement_signed BOOLEAN DEFAULT FALSE,
    agreement_signed_at TIMESTAMPTZ,

    -- Verification status
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'flagged')),
    verification_track TEXT DEFAULT 'standard' CHECK (verification_track IN ('standard', 'priority', 'premium')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    -- Tier system
    current_tier TEXT DEFAULT 'SEED' CHECK (current_tier IN ('SEED', 'SEEDLING', 'SAPLING', 'TREE', 'GROVE', 'FOREST', 'ELDER')),
    xp_total INTEGER DEFAULT 0,

    -- Payment tracking (for priority/premium tracks)
    stripe_payment_id TEXT,
    payment_amount INTEGER,
    payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_verified_members_email ON verified_members(email);
CREATE INDEX IF NOT EXISTS idx_verified_members_discord ON verified_members(discord_username);
CREATE INDEX IF NOT EXISTS idx_verified_members_status ON verified_members(verification_status);
CREATE INDEX IF NOT EXISTS idx_verified_members_created ON verified_members(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE verified_members ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for backend functions)
CREATE POLICY "Service role full access" ON verified_members
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can view their own record
CREATE POLICY "Users can view own record" ON verified_members
    FOR SELECT
    TO authenticated
    USING (email = auth.jwt() ->> 'email');

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_verified_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_verified_members_updated_at ON verified_members;
CREATE TRIGGER trigger_verified_members_updated_at
    BEFORE UPDATE ON verified_members
    FOR EACH ROW
    EXECUTE FUNCTION update_verified_members_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- AFTER RUNNING THIS SQL:
-- 1. Go to Storage → Create bucket "verification-images" (private, 10MB limit)
-- 2. Set allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- 3. Test by visiting /verify-identity.html
-- ═══════════════════════════════════════════════════════════════════════════
