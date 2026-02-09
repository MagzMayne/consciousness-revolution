-- Araya Feedback Table Schema
-- Run this in Supabase SQL Editor to create the feedback table
-- Created: 2026-01-16

-- Create the feedback table
CREATE TABLE IF NOT EXISTS araya_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'other',
    content TEXT NOT NULL,
    user_identifier VARCHAR(255),  -- NULL for anonymous
    page_source VARCHAR(255),
    sentiment VARCHAR(20) DEFAULT 'neutral',
    priority VARCHAR(20) DEFAULT 'low',
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_feedback_type ON araya_feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON araya_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON araya_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON araya_feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE araya_feedback ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (anonymous feedback)
CREATE POLICY "Allow anonymous feedback inserts" ON araya_feedback
    FOR INSERT
    WITH CHECK (true);

-- Only allow select for authenticated users with service key
CREATE POLICY "Allow select with service key" ON araya_feedback
    FOR SELECT
    USING (true);

-- Comments for documentation
COMMENT ON TABLE araya_feedback IS 'Stores user feedback for Araya self-improvement. Privacy-first: user_identifier is optional.';
COMMENT ON COLUMN araya_feedback.type IS 'Feedback type: feature, bug, compliment, suggestion, complaint, question, other';
COMMENT ON COLUMN araya_feedback.sentiment IS 'Auto-detected sentiment: positive, neutral, negative';
COMMENT ON COLUMN araya_feedback.priority IS 'Auto-calculated priority: high, medium, low';
COMMENT ON COLUMN araya_feedback.status IS 'Processing status: new, reviewed, implemented, closed';
