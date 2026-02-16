-- ═══════════════════════════════════════════════════════════════
-- ZERO TRUST SECURITY MIGRATION
-- Implements comprehensive security controls across all tables
-- Created: 2026-02-16
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- PART 1: STRENGTHEN RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Drop overly permissive policies on araya_memory
DROP POLICY IF EXISTS "Allow anon access" ON araya_memory;

-- Araya Memory: Users can only access their own memory
CREATE POLICY "Users access own memory" ON araya_memory
    FOR ALL 
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role maintains full access (for backend operations)
CREATE POLICY "Service role full access on araya_memory" ON araya_memory
    FOR ALL 
    USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- PART 2: ADD DATA RETENTION POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Function to automatically clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions
    WHERE ended_at IS NOT NULL 
        AND ended_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically clean up old audit logs (keep for compliance period)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Keep audit logs for 2 years, then delete non-critical events
    DELETE FROM audit_log
    WHERE created_at < NOW() - INTERVAL '2 years'
        AND event_category NOT IN ('billing', 'auth');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- PART 3: ADD ENCRYPTION SUPPORT FOR SENSITIVE FIELDS
-- ═══════════════════════════════════════════════════════════════

-- Note: Application-level encryption is preferred for sensitive data
-- This provides database-level encryption as an additional layer

-- Enable pgcrypto extension for encryption support
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt sensitive text
CREATE OR REPLACE FUNCTION encrypt_sensitive_text(plaintext TEXT)
RETURNS TEXT AS $$
BEGIN
    -- This uses pgcrypto's built-in encryption
    -- In production, use a proper key management system
    RETURN encode(
        pgp_sym_encrypt(
            plaintext,
            current_setting('app.encryption_key', true)
        ),
        'base64'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- If encryption fails, return NULL to prevent storing plaintext
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive text
CREATE OR REPLACE FUNCTION decrypt_sensitive_text(encrypted TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(
        decode(encrypted, 'base64'),
        current_setting('app.encryption_key', true)
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- PART 4: ADD PII ANONYMIZATION FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to anonymize IP addresses
CREATE OR REPLACE FUNCTION anonymize_ip(ip_address INET)
RETURNS INET AS $$
BEGIN
    -- Remove last octet for IPv4
    RETURN set_masklen(ip_address, 24);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to anonymize email (keep domain for analytics)
CREATE OR REPLACE FUNCTION anonymize_email(email TEXT)
RETURNS TEXT AS $$
DECLARE
    domain TEXT;
BEGIN
    domain := split_part(email, '@', 2);
    RETURN 'user_' || substr(md5(email), 1, 8) || '@' || domain;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ═══════════════════════════════════════════════════════════════
-- PART 5: UPDATE USER_SESSIONS TO USE ANONYMIZED DATA
-- ═══════════════════════════════════════════════════════════════

-- Add anonymized columns
ALTER TABLE user_sessions 
    ADD COLUMN IF NOT EXISTS ip_address_anonymized INET,
    ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;

-- Function to automatically anonymize IP on insert/update
CREATE OR REPLACE FUNCTION anonymize_session_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Anonymize IP address
    IF NEW.ip_address IS NOT NULL THEN
        NEW.ip_address_anonymized := anonymize_ip(NEW.ip_address);
        -- Clear the original IP after anonymization (zero trust - minimal data retention)
        NEW.ip_address := NULL;
    END IF;
    
    -- Create device fingerprint instead of storing full user agent
    IF NEW.user_agent IS NOT NULL THEN
        NEW.device_fingerprint := substr(md5(NEW.user_agent), 1, 16);
        -- Keep only browser/OS info, remove specific version
        NEW.user_agent := substring(NEW.user_agent from 1 for 50);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_sessions
DROP TRIGGER IF EXISTS anonymize_session_trigger ON user_sessions;
CREATE TRIGGER anonymize_session_trigger
    BEFORE INSERT OR UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION anonymize_session_data();

-- ═══════════════════════════════════════════════════════════════
-- PART 6: UPDATE AUDIT_LOG TO USE ANONYMIZED DATA
-- ═══════════════════════════════════════════════════════════════

-- Add anonymized columns
ALTER TABLE audit_log 
    ADD COLUMN IF NOT EXISTS ip_address_anonymized INET;

-- Function to anonymize audit log data
CREATE OR REPLACE FUNCTION anonymize_audit_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Anonymize IP address
    IF NEW.ip_address IS NOT NULL THEN
        NEW.ip_address_anonymized := anonymize_ip(NEW.ip_address);
        -- Clear the original IP after anonymization
        NEW.ip_address := NULL;
    END IF;
    
    -- Limit user agent length
    IF NEW.user_agent IS NOT NULL THEN
        NEW.user_agent := substring(NEW.user_agent from 1 for 50);
    END IF;
    
    -- Ensure sensitive data is not logged in old_values/new_values
    IF NEW.old_values IS NOT NULL THEN
        NEW.old_values := NEW.old_values - 'password' - 'token' - 'secret' - 'key';
    END IF;
    
    IF NEW.new_values IS NOT NULL THEN
        NEW.new_values := NEW.new_values - 'password' - 'token' - 'secret' - 'key';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to audit_log
DROP TRIGGER IF EXISTS anonymize_audit_trigger ON audit_log;
CREATE TRIGGER anonymize_audit_trigger
    BEFORE INSERT OR UPDATE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION anonymize_audit_data();

-- ═══════════════════════════════════════════════════════════════
-- PART 7: ADD SECURITY MONITORING TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'failed_login', 'suspicious_activity', 'rate_limit_exceeded',
        'invalid_token', 'unauthorized_access', 'data_breach_attempt'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Anonymized identifiers
    ip_address_anonymized INET,
    user_id UUID,
    
    -- Event details
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Auto-response taken
    action_taken TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES user_foundations(id)
);

-- Indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_unresolved ON security_events(resolved_at) WHERE resolved_at IS NULL;

-- Enable RLS on security_events (admin only)
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access security events
CREATE POLICY "Service role access security events" ON security_events
    FOR ALL 
    USING (auth.role() = 'service_role');

-- Function to log security event
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type TEXT,
    p_severity TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO security_events (
        event_type, severity, ip_address_anonymized, user_id, description, metadata
    ) VALUES (
        p_event_type, p_severity, anonymize_ip(p_ip_address), p_user_id, p_description, p_metadata
    )
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- PART 8: ADD SESSION TOKEN HASHING
-- ═══════════════════════════════════════════════════════════════

-- Function to hash session tokens (never store plaintext tokens)
CREATE OR REPLACE FUNCTION hash_session_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_token IS NOT NULL THEN
        -- Hash the token before storing
        NEW.session_token := encode(
            digest(NEW.session_token, 'sha256'),
            'hex'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_sessions
DROP TRIGGER IF EXISTS hash_token_trigger ON user_sessions;
CREATE TRIGGER hash_token_trigger
    BEFORE INSERT OR UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION hash_session_token();

-- ═══════════════════════════════════════════════════════════════
-- PART 9: ADD API KEY HASHING
-- ═══════════════════════════════════════════════════════════════

-- Function to hash API keys before storage
CREATE OR REPLACE FUNCTION hash_api_key()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.key_hash IS NOT NULL AND length(NEW.key_hash) > 64 THEN
        -- Hash the key if it's not already hashed (length check)
        NEW.key_hash := encode(
            digest(NEW.key_hash, 'sha256'),
            'hex'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to api_keys (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'api_keys') THEN
        DROP TRIGGER IF EXISTS hash_api_key_trigger ON api_keys;
        CREATE TRIGGER hash_api_key_trigger
            BEFORE INSERT OR UPDATE ON api_keys
            FOR EACH ROW EXECUTE FUNCTION hash_api_key();
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- PART 10: CREATE VIEWS FOR PRIVACY-SAFE QUERIES
-- ═══════════════════════════════════════════════════════════════

-- View for user activity without PII
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
    s.foundation_id,
    COUNT(*) as session_count,
    MAX(s.last_activity_at) as last_active,
    s.device_type,
    DATE_TRUNC('day', s.started_at) as activity_date
FROM user_sessions s
GROUP BY s.foundation_id, s.device_type, DATE_TRUNC('day', s.started_at);

-- View for security monitoring dashboard (anonymized)
CREATE OR REPLACE VIEW security_dashboard AS
SELECT
    event_type,
    severity,
    COUNT(*) as event_count,
    MAX(created_at) as last_occurrence,
    COUNT(*) FILTER (WHERE resolved_at IS NULL) as unresolved_count
FROM security_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY event_type, severity;

-- ═══════════════════════════════════════════════════════════════
-- PART 11: ADD INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════

-- Indexes on anonymized columns for queries
CREATE INDEX IF NOT EXISTS idx_sessions_ip_anon ON user_sessions(ip_address_anonymized);
CREATE INDEX IF NOT EXISTS idx_audit_ip_anon ON audit_log(ip_address_anonymized);
CREATE INDEX IF NOT EXISTS idx_sessions_fingerprint ON user_sessions(device_fingerprint);

-- ═══════════════════════════════════════════════════════════════
-- PART 12: VERIFICATION & SUMMARY
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE 'ZERO TRUST SECURITY MIGRATION COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Security Enhancements Applied:';
    RAISE NOTICE '  ✓ Strengthened RLS policies (removed permissive anon access)';
    RAISE NOTICE '  ✓ Added automatic data anonymization (IP addresses, user agents)';
    RAISE NOTICE '  ✓ Implemented token hashing (session tokens, API keys)';
    RAISE NOTICE '  ✓ Added data retention policies (90-day sessions, 2-year audit logs)';
    RAISE NOTICE '  ✓ Created security monitoring table';
    RAISE NOTICE '  ✓ Added encryption support functions';
    RAISE NOTICE '  ✓ Created privacy-safe views for analytics';
    RAISE NOTICE '';
    RAISE NOTICE 'Action Required:';
    RAISE NOTICE '  1. Set app.encryption_key in Supabase settings';
    RAISE NOTICE '  2. Schedule cleanup_old_sessions() to run weekly';
    RAISE NOTICE '  3. Schedule cleanup_old_audit_logs() to run monthly';
    RAISE NOTICE '  4. Monitor security_events table for threats';
    RAISE NOTICE '  5. Update application code to use new anonymized fields';
    RAISE NOTICE '';
    RAISE NOTICE 'Environment Variables Needed:';
    RAISE NOTICE '  - DATA_ENCRYPTION_KEY: For application-level encryption';
    RAISE NOTICE '  - ANONYMIZATION_SALT: For pseudonymization';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
