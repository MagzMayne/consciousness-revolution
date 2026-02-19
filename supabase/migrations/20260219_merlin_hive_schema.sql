-- ════════════════════════════════════════════════════════════════════════════════
-- © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
-- ════════════════════════════════════════════════════════════════════════════════
-- 
-- Merlin Hive Database Schema
-- 
-- PURPOSE: Create tables for autonomous agent system persistence
-- 
-- TABLES:
-- - merlin_agents: Agent state and configuration
-- - merlin_jobs: Job/task history and queue
-- - merlin_audit_logs: Complete audit trail
-- - merlin_knowledge: Learning and insights storage
-- - merlin_enhancements: System improvement tracking
-- 
-- ════════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MERLIN AGENTS TABLE
-- Stores agent state, configuration, and status
-- ============================================================================

CREATE TABLE IF NOT EXISTS merlin_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id VARCHAR(100) UNIQUE NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active',
  capabilities JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merlin_agents_agent_id ON merlin_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_merlin_agents_agent_type ON merlin_agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_merlin_agents_status ON merlin_agents(status);
CREATE INDEX IF NOT EXISTS idx_merlin_agents_last_active ON merlin_agents(last_active);

-- ============================================================================
-- MERLIN JOBS TABLE
-- Stores job history, queue, and execution details
-- ============================================================================

CREATE TABLE IF NOT EXISTS merlin_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id VARCHAR(100) NOT NULL,
  job_type VARCHAR(50) NOT NULL,
  job_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority INTEGER DEFAULT 5,
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merlin_jobs_agent_id ON merlin_jobs(agent_id);
CREATE INDEX IF NOT EXISTS idx_merlin_jobs_job_type ON merlin_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_merlin_jobs_status ON merlin_jobs(status);
CREATE INDEX IF NOT EXISTS idx_merlin_jobs_priority ON merlin_jobs(priority DESC);
CREATE INDEX IF NOT EXISTS idx_merlin_jobs_created_at ON merlin_jobs(created_at DESC);

-- ============================================================================
-- MERLIN AUDIT LOGS TABLE
-- Complete audit trail of all agent activities
-- ============================================================================

CREATE TABLE IF NOT EXISTS merlin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  user_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merlin_audit_logs_agent_id ON merlin_audit_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_merlin_audit_logs_event_type ON merlin_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_merlin_audit_logs_timestamp ON merlin_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_merlin_audit_logs_user_id ON merlin_audit_logs(user_id);

-- ============================================================================
-- MERLIN KNOWLEDGE TABLE
-- Learning engine insights and patterns
-- ============================================================================

CREATE TABLE IF NOT EXISTS merlin_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  source VARCHAR(100),
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  effectiveness_score NUMERIC(3,2),
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merlin_knowledge_type ON merlin_knowledge(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_merlin_knowledge_category ON merlin_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_merlin_knowledge_confidence ON merlin_knowledge(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_merlin_knowledge_usage ON merlin_knowledge(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_merlin_knowledge_created_at ON merlin_knowledge(created_at DESC);

-- Full-text search on knowledge content
CREATE INDEX IF NOT EXISTS idx_merlin_knowledge_content_search 
  ON merlin_knowledge USING gin(to_tsvector('english', title || ' ' || content));

-- ============================================================================
-- MERLIN ENHANCEMENTS TABLE
-- System improvement tracking and application history
-- ============================================================================

CREATE TABLE IF NOT EXISTS merlin_enhancements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enhancement_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  code_change TEXT,
  before_snapshot JSONB,
  after_snapshot JSONB,
  impact_score NUMERIC(3,2),
  applied_by VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  applied_at TIMESTAMPTZ,
  rollback_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merlin_enhancements_type ON merlin_enhancements(enhancement_type);
CREATE INDEX IF NOT EXISTS idx_merlin_enhancements_status ON merlin_enhancements(status);
CREATE INDEX IF NOT EXISTS idx_merlin_enhancements_impact ON merlin_enhancements(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_merlin_enhancements_created_at ON merlin_enhancements(created_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_merlin_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for merlin_agents
CREATE TRIGGER update_merlin_agents_timestamp
  BEFORE UPDATE ON merlin_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_merlin_timestamp();

-- Trigger for merlin_jobs
CREATE TRIGGER update_merlin_jobs_timestamp
  BEFORE UPDATE ON merlin_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_merlin_timestamp();

-- Trigger for merlin_knowledge
CREATE TRIGGER update_merlin_knowledge_timestamp
  BEFORE UPDATE ON merlin_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_merlin_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS for secure access
-- ============================================================================

ALTER TABLE merlin_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE merlin_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merlin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merlin_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE merlin_enhancements ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all records
CREATE POLICY "Allow authenticated read access" ON merlin_agents
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated read access" ON merlin_jobs
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated read access" ON merlin_audit_logs
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated read access" ON merlin_knowledge
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated read access" ON merlin_enhancements
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policy: Allow authenticated users to insert/update records
CREATE POLICY "Allow authenticated write access" ON merlin_agents
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated write access" ON merlin_jobs
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated write access" ON merlin_audit_logs
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated write access" ON merlin_knowledge
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated write access" ON merlin_enhancements
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert default agent configurations
INSERT INTO merlin_agents (agent_id, agent_type, state, config, capabilities) VALUES
  ('seeker-001', 'seeker', '{"initialized": true}'::jsonb, '{"scanInterval": 300}'::jsonb, '["job-search", "opportunity-detection"]'::jsonb),
  ('learner-001', 'learner', '{"initialized": true}'::jsonb, '{"analysisDepth": 3}'::jsonb, '["pattern-analysis", "knowledge-extraction"]'::jsonb),
  ('enhancer-001', 'enhancer', '{"initialized": true}'::jsonb, '{"autoApply": false}'::jsonb, '["code-improvement", "performance-optimization"]'::jsonb)
ON CONFLICT (agent_id) DO NOTHING;

-- Insert sample knowledge entries
INSERT INTO merlin_knowledge (knowledge_type, category, title, content, confidence_score, created_by) VALUES
  ('best-practice', 'job-application', 'Professional Resume Format', 'Use clear headings, bullet points, and action verbs. Keep it concise (1-2 pages).', 0.9, 'learner-001'),
  ('pattern', 'interview', 'Common Interview Question Patterns', 'Most technical interviews follow STAR format: Situation, Task, Action, Result.', 0.85, 'learner-001'),
  ('optimization', 'code', 'Async Operation Best Practices', 'Always use try-catch with async operations and provide user-friendly error messages.', 0.92, 'enhancer-001')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Merlin Hive database schema created successfully!';
  RAISE NOTICE '📊 Tables: merlin_agents, merlin_jobs, merlin_audit_logs, merlin_knowledge, merlin_enhancements';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '🚀 Sample data inserted for testing';
END $$;
