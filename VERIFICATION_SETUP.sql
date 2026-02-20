-- ARAYA Web Verification - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Create verification_records table
CREATE TABLE IF NOT EXISTS verification_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discord_username TEXT NOT NULL,
    question_1 TEXT NOT NULL,  -- Pattern noticed in life
    question_2 TEXT NOT NULL,  -- What to build/protect
    question_3 TEXT NOT NULL,  -- AI comfort level
    consciousness_score INTEGER NOT NULL DEFAULT 50,
    builder_count INTEGER DEFAULT 0,
    destroyer_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('approved', 'pending_review', 'rejected')),
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by TEXT,
    review_notes TEXT,
    source TEXT DEFAULT 'araya_web',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add bergmal fields to user_profiles if not exists
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS bergmal_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bergmal_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_source TEXT,
ADD COLUMN IF NOT EXISTS discord_username TEXT UNIQUE;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_verification_discord ON verification_records(discord_username);
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_records(status);
CREATE INDEX IF NOT EXISTS idx_verification_score ON verification_records(consciousness_score);

-- RLS Policies for verification_records
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON verification_records
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read approved records (for community transparency)
CREATE POLICY "Read approved verifications" ON verification_records
    FOR SELECT USING (status = 'approved');

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS verification_records_updated_at ON verification_records;
CREATE TRIGGER verification_records_updated_at
    BEFORE UPDATE ON verification_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- View for verification dashboard
CREATE OR REPLACE VIEW verification_dashboard AS
SELECT
    discord_username,
    consciousness_score,
    status,
    builder_count,
    destroyer_count,
    source,
    verified_at,
    CASE
        WHEN consciousness_score >= 70 THEN 'High Alignment'
        WHEN consciousness_score >= 40 THEN 'Builder Aligned'
        ELSE 'Needs Review'
    END as alignment_level
FROM verification_records
ORDER BY verified_at DESC;

-- Grant access to the view
GRANT SELECT ON verification_dashboard TO authenticated;
GRANT SELECT ON verification_dashboard TO anon;
