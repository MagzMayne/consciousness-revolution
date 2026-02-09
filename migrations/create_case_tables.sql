-- ARAYA Case Builder Migration
-- Creates case management tables for legal case building
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lgibygzcbvrrykfaxvbg/sql

-- Supabase table: user_cases
CREATE TABLE IF NOT EXISTS user_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    case_name TEXT NOT NULL,
    case_number TEXT,                  -- Court case number
    case_type TEXT,                    -- divorce, custody, civil, criminal, etc
    opposing_party TEXT,
    court_name TEXT,
    status TEXT DEFAULT 'active',      -- active, won, lost, settled
    summary TEXT,                      -- AI-generated summary
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supabase table: case_events (timeline)
CREATE TABLE IF NOT EXISTS case_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES user_cases(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    event_date DATE,
    event_type TEXT,                   -- hearing, filing, incident, discovery, etc
    title TEXT,
    description TEXT,
    evidence_ids UUID[],               -- Links to images/documents
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supabase table: case_documents
CREATE TABLE IF NOT EXISTS case_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES user_cases(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    doc_type TEXT,                     -- motion, order, transcript, email, evidence
    doc_name TEXT,
    content TEXT,                      -- OCR or pasted text
    file_url TEXT,                     -- Supabase Storage
    ai_summary TEXT,                   -- Claude summary
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_cases_user_id ON user_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cases_status ON user_cases(status);
CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_date ON case_events(event_date);
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_type ON case_documents(doc_type);

-- Row Level Security (RLS) - Users only see their own data
ALTER TABLE user_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

-- Policies for user_cases
CREATE POLICY "Users can read own cases" ON user_cases
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can insert own cases" ON user_cases
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update own cases" ON user_cases
    FOR UPDATE USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Service role full access on cases" ON user_cases
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for case_events
CREATE POLICY "Users can read own events" ON case_events
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can insert own events" ON case_events
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Service role full access on events" ON case_events
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for case_documents
CREATE POLICY "Users can read own documents" ON case_documents
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can insert own documents" ON case_documents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Service role full access on documents" ON case_documents
    FOR ALL USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE user_cases IS 'ARAYA Case Builder - Legal cases per user';
COMMENT ON TABLE case_events IS 'Timeline events for each case';
COMMENT ON TABLE case_documents IS 'Documents and evidence for each case';
