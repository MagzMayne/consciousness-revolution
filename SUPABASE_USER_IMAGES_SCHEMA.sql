-- USER IMAGES TABLE FOR ARAYA
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lgibygzcbvrrykfaxvbg/sql

CREATE TABLE IF NOT EXISTS user_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_url TEXT,
    image_base64 TEXT,
    mime_type TEXT DEFAULT 'image/png',
    description TEXT,
    tags TEXT[],
    case_id UUID,
    source TEXT DEFAULT 'araya_chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);

-- Index for case lookups (if linking to legal cases)
CREATE INDEX IF NOT EXISTS idx_user_images_case_id ON user_images(case_id);

-- Row Level Security (optional but recommended)
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own images
CREATE POLICY "Users can view own images" ON user_images
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own images
CREATE POLICY "Users can insert own images" ON user_images
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Service role can do anything (for Netlify functions)
CREATE POLICY "Service role full access" ON user_images
    FOR ALL USING (auth.role() = 'service_role');
