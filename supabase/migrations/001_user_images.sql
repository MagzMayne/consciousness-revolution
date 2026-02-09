-- ARAYA Image Storage Schema
-- Created: 2026-02-08
-- Purpose: Store user images with auto-tagging for recall by Araya

-- Create the user_images table
CREATE TABLE IF NOT EXISTS user_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_base64 TEXT NOT NULL,
    mime_type TEXT DEFAULT 'image/png',
    description TEXT,
    tags TEXT[] DEFAULT ARRAY['untagged'],
    source TEXT DEFAULT 'araya_chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);

-- Index for tag searches (GIN for array containment)
CREATE INDEX IF NOT EXISTS idx_user_images_tags ON user_images USING GIN(tags);

-- Index for description text search
CREATE INDEX IF NOT EXISTS idx_user_images_description ON user_images USING GIN(to_tsvector('english', COALESCE(description, '')));

-- Index for timestamp ordering
CREATE INDEX IF NOT EXISTS idx_user_images_created ON user_images(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own images
CREATE POLICY "Users can view own images" ON user_images
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Service role can do everything (for Araya backend)
CREATE POLICY "Service role full access" ON user_images
    FOR ALL USING (auth.role() = 'service_role');

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_user_images_updated_at ON user_images;
CREATE TRIGGER update_user_images_updated_at
    BEFORE UPDATE ON user_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comment the table
COMMENT ON TABLE user_images IS 'Stores user images uploaded through Araya chat with auto-tagging';
COMMENT ON COLUMN user_images.user_id IS 'User identifier (from session or auth)';
COMMENT ON COLUMN user_images.image_base64 IS 'Base64 encoded image data';
COMMENT ON COLUMN user_images.tags IS 'Auto-extracted tags: court, document, legal, evidence, photo, screenshot, family, work, medical, financial, property, vehicle, receipt, contract, letter, text, handwritten, diagram, map, person, building';
COMMENT ON COLUMN user_images.source IS 'Where image came from: araya_chat, upload, screenshot';
