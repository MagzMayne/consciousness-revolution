-- ARAYA Image Storage Migration
-- Creates user_images table for case building
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lgibygzcbvrrykfaxvbg/sql

-- Supabase table: user_images
CREATE TABLE IF NOT EXISTS user_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_url TEXT,                    -- Supabase Storage URL (preferred)
    image_base64 TEXT,                 -- Fallback: inline base64
    mime_type TEXT DEFAULT 'image/png',
    description TEXT,                  -- Claude Vision description
    tags TEXT[],                       -- Auto-extracted tags
    case_id UUID,                      -- Link to case (optional)
    source TEXT DEFAULT 'araya_chat',  -- Where uploaded from
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_images_case_id ON user_images(case_id);
CREATE INDEX IF NOT EXISTS idx_user_images_tags ON user_images USING GIN(tags);

-- Row Level Security (RLS) - Users only see their own images
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own images
CREATE POLICY "Users can read own images" ON user_images
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

-- Policy: Users can insert their own images
CREATE POLICY "Users can insert own images" ON user_images
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

-- Policy: Service role can do anything (for araya-chat.mjs)
CREATE POLICY "Service role full access" ON user_images
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE user_images IS 'ARAYA Image Storage - Stores user images for case building';
