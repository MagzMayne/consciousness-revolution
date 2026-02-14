-- ============================================================
-- R3-D3 ADMIN ACCESS CONTROL
-- Adds admin role system for R3-D3 Robot Assistant access
-- Created: 2026-02-14
-- ============================================================

-- Add admin-related columns to user_foundations
ALTER TABLE user_foundations 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS r3d3_access_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS r3d3_access_granted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS r3d3_access_granted_by UUID REFERENCES user_foundations(id);

-- Create R3-D3 access log table
CREATE TABLE IF NOT EXISTS r3d3_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE CASCADE NOT NULL,
    
    -- Access Details
    action TEXT NOT NULL CHECK (action IN (
        'enable_editing', 'disable_editing', 'edit_page', 'fix_error'
    )),
    target_file TEXT,
    change_description TEXT,
    
    -- Result
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create R3-D3 error fixes table (for non-admin real-time fixes)
CREATE TABLE IF NOT EXISTS r3d3_error_fixes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Error Details
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    page_url TEXT NOT NULL,
    
    -- Fix Details
    fix_applied BOOLEAN DEFAULT FALSE,
    fix_description TEXT,
    files_modified TEXT[],
    
    -- User Context (can be null for anonymous)
    foundation_id UUID REFERENCES user_foundations(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'applied'
    )),
    reviewed_by UUID REFERENCES user_foundations(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_r3d3_access_log_foundation ON r3d3_access_log(foundation_id);
CREATE INDEX IF NOT EXISTS idx_r3d3_access_log_created ON r3d3_access_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_r3d3_error_fixes_status ON r3d3_error_fixes(status);
CREATE INDEX IF NOT EXISTS idx_r3d3_error_fixes_created ON r3d3_error_fixes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_foundations_r3d3_access ON user_foundations(r3d3_access_enabled) WHERE r3d3_access_enabled = TRUE;

-- Grant initial admin access to BarbrickDesign@gmail.com
-- This will be executed when the email exists in the system
DO $$
BEGIN
    UPDATE user_foundations 
    SET 
        is_admin = TRUE,
        r3d3_access_enabled = TRUE,
        r3d3_access_granted_at = NOW(),
        r3d3_access_granted_by = id
    WHERE LOWER(email) = 'barbrickdesign@gmail.com';
    
    -- Log if no user found (expected on first run)
    IF NOT FOUND THEN
        RAISE NOTICE 'BarbrickDesign@gmail.com not yet registered. Admin access will be granted on first login.';
    END IF;
END $$;

-- Function to auto-grant admin access to BarbrickDesign@gmail.com on signup/login
CREATE OR REPLACE FUNCTION grant_initial_admin_access()
RETURNS TRIGGER AS $$
BEGIN
    IF LOWER(NEW.email) = 'barbrickdesign@gmail.com' THEN
        NEW.is_admin := TRUE;
        NEW.r3d3_access_enabled := TRUE;
        NEW.r3d3_access_granted_at := NOW();
        NEW.r3d3_access_granted_by := NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-grant admin access
DROP TRIGGER IF EXISTS trigger_grant_initial_admin_access ON user_foundations;
CREATE TRIGGER trigger_grant_initial_admin_access
    BEFORE INSERT OR UPDATE ON user_foundations
    FOR EACH ROW
    EXECUTE FUNCTION grant_initial_admin_access();

-- Updated_at trigger for error_fixes table
CREATE OR REPLACE FUNCTION update_r3d3_error_fixes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_r3d3_error_fixes_updated_at ON r3d3_error_fixes;
CREATE TRIGGER trigger_update_r3d3_error_fixes_updated_at
    BEFORE UPDATE ON r3d3_error_fixes
    FOR EACH ROW
    EXECUTE FUNCTION update_r3d3_error_fixes_updated_at();

-- Comments for documentation
COMMENT ON COLUMN user_foundations.is_admin IS 'Global admin flag - grants full system access';
COMMENT ON COLUMN user_foundations.r3d3_access_enabled IS 'Can use R3-D3 Robot Assistant autonomous editing';
COMMENT ON TABLE r3d3_access_log IS 'Audit log for all R3-D3 Robot Assistant actions';
COMMENT ON TABLE r3d3_error_fixes IS 'Real-time error fixes suggested by R3-D3 for site visitors';
