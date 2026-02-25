-- =====================================================
-- OVERKORE License System - Supabase Migration
-- Created: 2026-02-25
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. LICENSES TABLE - Core license storage
-- =====================================================
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Key identification (never store plain key!)
    key_hash TEXT UNIQUE NOT NULL,
    key_prefix TEXT NOT NULL, -- First 8 chars for lookup (OVRK-XXXX)

    -- Owner info
    email TEXT NOT NULL,
    name TEXT,
    organization TEXT,

    -- License details
    tier TEXT NOT NULL CHECK (tier IN ('FREE', 'PRO', 'ENT', 'DEV')),
    product TEXT NOT NULL DEFAULT 'araya',

    -- Validity
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_reason TEXT,

    -- Device management
    max_devices INT DEFAULT 3,

    -- Stripe integration (optional)
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    notes TEXT,

    -- Tracking
    created_by TEXT DEFAULT 'system',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_licenses_key_prefix ON licenses(key_prefix);
CREATE INDEX idx_licenses_email ON licenses(email);
CREATE INDEX idx_licenses_tier ON licenses(tier);
CREATE INDEX idx_licenses_product ON licenses(product);
CREATE INDEX idx_licenses_stripe_customer ON licenses(stripe_customer_id);

-- =====================================================
-- 2. ACTIVATIONS TABLE - Device activations
-- =====================================================
CREATE TABLE IF NOT EXISTS license_activations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,

    -- Device identification
    hardware_id TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT, -- 'desktop', 'browser', 'mobile'
    os_info TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    last_seen TIMESTAMPTZ DEFAULT NOW(),

    -- Client info
    client_version TEXT,
    client_ip INET,
    user_agent TEXT,

    -- Unique constraint: one license per device
    UNIQUE(license_id, hardware_id)
);

CREATE INDEX idx_activations_license ON license_activations(license_id);
CREATE INDEX idx_activations_hardware ON license_activations(hardware_id);
CREATE INDEX idx_activations_last_seen ON license_activations(last_seen);

-- =====================================================
-- 3. LICENSE_VALIDATIONS TABLE - Audit log
-- =====================================================
CREATE TABLE IF NOT EXISTS license_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID REFERENCES licenses(id),

    -- Request info
    key_prefix TEXT NOT NULL,
    hardware_id TEXT,
    client_ip INET,
    user_agent TEXT,

    -- Result
    is_valid BOOLEAN NOT NULL,
    failure_reason TEXT,
    tier_returned TEXT,

    -- Timestamp
    validated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_validations_license ON license_validations(license_id);
CREATE INDEX idx_validations_time ON license_validations(validated_at);
CREATE INDEX idx_validations_ip ON license_validations(client_ip);

-- =====================================================
-- 4. PRODUCTS TABLE - Product catalog
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,

    -- Versioning
    current_version TEXT NOT NULL DEFAULT '1.0.0',
    min_supported_version TEXT DEFAULT '1.0.0',

    -- Update channels
    stable_version TEXT,
    beta_version TEXT,
    canary_version TEXT,

    -- URLs
    download_url TEXT,
    changelog_url TEXT,
    docs_url TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default products
INSERT INTO products (id, name, description, current_version) VALUES
    ('araya', 'Araya AI Assistant', 'Consciousness-aware AI chat interface', '2.4.0'),
    ('overkore', 'OVERKORE CLI', 'Command-line orchestrator for AI systems', '1.0.0'),
    ('araya-extension', 'Araya Browser Extension', 'Chrome/Brave extension for Araya', '1.2.0')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. RELEASES TABLE - Version history
-- =====================================================
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES products(id),

    -- Version info
    version TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('stable', 'beta', 'canary')),

    -- Release details
    release_notes TEXT,
    changelog_url TEXT,
    download_url TEXT,
    file_hash TEXT, -- SHA256
    file_size_bytes BIGINT,

    -- Flags
    is_critical BOOLEAN DEFAULT FALSE,
    min_upgrade_from TEXT, -- Minimum version that can upgrade

    -- Dates
    released_at TIMESTAMPTZ DEFAULT NOW(),
    deprecated_at TIMESTAMPTZ,

    -- Unique version per product/channel
    UNIQUE(product_id, version, channel)
);

CREATE INDEX idx_releases_product ON releases(product_id);
CREATE INDEX idx_releases_channel ON releases(channel);
CREATE INDEX idx_releases_date ON releases(released_at);

-- =====================================================
-- 6. ANNOUNCEMENTS TABLE - In-app announcements
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'critical', 'promo')),

    -- Targeting
    target_products TEXT[] DEFAULT ARRAY['araya'],
    target_tiers TEXT[], -- NULL = all tiers
    target_versions TEXT[], -- NULL = all versions

    -- Actions
    action_text TEXT,
    action_url TEXT,

    -- Scheduling
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,

    -- Tracking
    view_count INT DEFAULT 0,
    dismiss_count INT DEFAULT 0,
    click_count INT DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);

CREATE INDEX idx_announcements_active ON announcements(is_active, starts_at, expires_at);
CREATE INDEX idx_announcements_products ON announcements USING GIN(target_products);

-- =====================================================
-- 7. ANNOUNCEMENT_DISMISSALS TABLE - Track user dismissals
-- =====================================================
CREATE TABLE IF NOT EXISTS announcement_dismissals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,

    -- User identification
    license_id UUID REFERENCES licenses(id),
    hardware_id TEXT,
    client_ip INET,

    dismissed_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(announcement_id, COALESCE(license_id, uuid_generate_v4()), COALESCE(hardware_id, ''))
);

-- =====================================================
-- 8. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to licenses
CREATE TRIGGER licenses_updated_at
    BEFORE UPDATE ON licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Apply to products
CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to validate license
CREATE OR REPLACE FUNCTION validate_license(
    p_key_hash TEXT,
    p_hardware_id TEXT DEFAULT NULL,
    p_client_ip INET DEFAULT NULL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    tier TEXT,
    expires_at TIMESTAMPTZ,
    features JSONB,
    error_message TEXT
) AS $$
DECLARE
    v_license RECORD;
    v_activation_count INT;
BEGIN
    -- Find license by hash
    SELECT * INTO v_license
    FROM licenses
    WHERE key_hash = p_key_hash;

    -- Check if license exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::JSONB, 'Invalid license key';
        RETURN;
    END IF;

    -- Check if revoked
    IF v_license.is_revoked THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::JSONB, 'License has been revoked';
        RETURN;
    END IF;

    -- Check if active
    IF NOT v_license.is_active THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::JSONB, 'License is inactive';
        RETURN;
    END IF;

    -- Check expiration
    IF v_license.expires_at IS NOT NULL AND v_license.expires_at < NOW() THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::JSONB, 'License has expired';
        RETURN;
    END IF;

    -- Check device limit if hardware_id provided
    IF p_hardware_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_activation_count
        FROM license_activations
        WHERE license_id = v_license.id
          AND is_active = TRUE
          AND hardware_id != p_hardware_id;

        IF v_activation_count >= v_license.max_devices THEN
            RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::JSONB, 'Device limit exceeded';
            RETURN;
        END IF;

        -- Upsert activation
        INSERT INTO license_activations (license_id, hardware_id, client_ip, last_seen)
        VALUES (v_license.id, p_hardware_id, p_client_ip, NOW())
        ON CONFLICT (license_id, hardware_id)
        DO UPDATE SET last_seen = NOW(), client_ip = EXCLUDED.client_ip;
    END IF;

    -- Log validation
    INSERT INTO license_validations (license_id, key_prefix, hardware_id, client_ip, is_valid, tier_returned)
    VALUES (v_license.id, v_license.key_prefix, p_hardware_id, p_client_ip, TRUE, v_license.tier);

    -- Return success with features based on tier
    RETURN QUERY SELECT
        TRUE,
        v_license.tier,
        v_license.expires_at,
        CASE v_license.tier
            WHEN 'FREE' THEN '{"max_messages": 100, "domains": ["1_command"]}'::JSONB
            WHEN 'PRO' THEN '{"max_messages": -1, "domains": "all", "api_access": false}'::JSONB
            WHEN 'ENT' THEN '{"max_messages": -1, "domains": "all", "api_access": true, "team_seats": 10}'::JSONB
            WHEN 'DEV' THEN '{"max_messages": -1, "domains": "all", "api_access": true, "white_label": true}'::JSONB
            ELSE '{}'::JSONB
        END,
        NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest version for product
CREATE OR REPLACE FUNCTION get_latest_version(
    p_product_id TEXT,
    p_channel TEXT DEFAULT 'stable'
)
RETURNS TABLE (
    version TEXT,
    download_url TEXT,
    changelog_url TEXT,
    is_critical BOOLEAN,
    released_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.version, r.download_url, r.changelog_url, r.is_critical, r.released_at
    FROM releases r
    WHERE r.product_id = p_product_id
      AND r.channel = p_channel
      AND r.deprecated_at IS NULL
    ORDER BY r.released_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_validations ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access to licenses"
    ON licenses FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to activations"
    ON license_activations FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to validations"
    ON license_validations FOR ALL
    USING (auth.role() = 'service_role');

-- Public can read products and releases
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Anyone can read releases"
    ON releases FOR SELECT
    USING (true);

CREATE POLICY "Anyone can read active announcements"
    ON announcements FOR SELECT
    USING (is_active = TRUE AND starts_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW()));

-- =====================================================
-- 10. SAMPLE DATA (Optional - Remove in production)
-- =====================================================

-- Insert a sample FREE license for testing
-- Key: OVRK-TEST-FREE-0001-FREE (hash this before storing)
-- INSERT INTO licenses (key_hash, key_prefix, email, tier, product)
-- VALUES (
--     encode(sha256('OVRK-TEST-FREE-0001-FREE'::bytea), 'hex'),
--     'OVRK-TEST',
--     'test@example.com',
--     'FREE',
--     'araya'
-- );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
