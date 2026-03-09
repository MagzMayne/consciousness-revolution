-- COLLABORATIVE DEV GAME CREDIT SYSTEM
-- Run at: https://supabase.com/dashboard/project/lgibygzcbvrrykfaxvbg/sql/new

-- Core Credits Table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  discord_id TEXT,
  email TEXT,
  total_credits INTEGER DEFAULT 0,
  free_tier_credits INTEGER DEFAULT 1000, -- Starting free credits
  earned_credits INTEGER DEFAULT 0,
  purchased_credits INTEGER DEFAULT 0,
  spent_credits INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'free', -- free, founder, paid
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit Transactions Log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_credits(user_id),
  amount INTEGER NOT NULL, -- positive = earn, negative = spend
  transaction_type TEXT NOT NULL, -- xp_earn, bug_report, purchase, system_use, founder_bonus
  description TEXT,
  metadata JSONB, -- flexible data (xp amount, bug #, system name, etc)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hardhitter Submissions
CREATE TABLE IF NOT EXISTS hardhitter_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  system_name TEXT NOT NULL,
  system_description TEXT,
  repo_url TEXT,
  system_size TEXT, -- small (<10k lines), medium (10k-50k), large (50k-200k), massive (>200k)
  estimated_monthly_usage INTEGER, -- API calls/month estimate
  use_case TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, needs_info
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  approved_credits INTEGER, -- How many free credits approved
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- Founder Progress Tracking
CREATE TABLE IF NOT EXISTS founder_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_credits(user_id),
  total_xp INTEGER DEFAULT 0,
  feedback_count INTEGER DEFAULT 0,
  bug_reports INTEGER DEFAULT 0,
  quality_score DECIMAL(3,1) DEFAULT 0.0, -- 0.0 to 10.0
  days_active INTEGER DEFAULT 0,
  founder_status TEXT DEFAULT 'candidate', -- candidate, earned, founder
  earned_at TIMESTAMP,
  UNIQUE(user_id)
);

-- System Usage Tracking (for rate limits)
CREATE TABLE IF NOT EXISTS system_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_credits(user_id),
  system_type TEXT NOT NULL, -- araya_vision, dashboard_build, api_call, etc
  credits_spent INTEGER DEFAULT 1,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_hardhitter_status ON hardhitter_submissions(status);
CREATE INDEX idx_system_usage_user_time ON system_usage(user_id, timestamp);

-- Enable Row Level Security
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardhitter_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_usage ENABLE ROW LEVEL SECURITY;

-- Policies (users can read their own data)
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit hardhitter apps" ON hardhitter_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own submissions" ON hardhitter_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own founder progress" ON founder_progress
  FOR SELECT USING (auth.uid() = user_id);
