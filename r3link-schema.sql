-- R3Link User Authentication and Data Storage Schema
-- This schema supports the r3Link gamification system with proper security and data integrity

-- Global configuration table for system-wide settings
CREATE TABLE IF NOT EXISTS r3link_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table with proper authentication fields
CREATE TABLE IF NOT EXISTS r3link_users (
    user_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    player_id VARCHAR(100) UNIQUE NOT NULL,
    discord_id VARCHAR(50) UNIQUE,
    github_username VARCHAR(100),
    ethereum_address VARCHAR(42),
    wallet_address VARCHAR(255),
    account_status ENUM('active', 'suspended', 'pending', 'deleted') DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_player_id (player_id),
    INDEX idx_discord_id (discord_id),
    INDEX idx_account_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User profiles with extended information
CREATE TABLE IF NOT EXISTS r3link_user_profiles (
    profile_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    banner_url VARCHAR(500),
    location VARCHAR(100),
    timezone VARCHAR(50),
    website_url VARCHAR(500),
    twitter_handle VARCHAR(50),
    preferences JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES r3link_users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Player gamification state
CREATE TABLE IF NOT EXISTS r3link_player_state (
    state_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    player_id VARCHAR(100) NOT NULL,
    total_points INT UNSIGNED DEFAULT 0,
    level TINYINT UNSIGNED DEFAULT 0,
    total_donations DECIMAL(12,2) DEFAULT 0.00,
    vault_stake DECIMAL(12,2) DEFAULT 0.00,
    achievements JSON,
    session_start BIGINT UNSIGNED,
    last_action BIGINT UNSIGNED,
    stage TINYINT UNSIGNED DEFAULT 0,
    guardian_mode VARCHAR(50) DEFAULT 'dormant_watcher',
    companion_mode VARCHAR(50) DEFAULT 'whisper',
    initialized BOOLEAN DEFAULT TRUE,
    data_version INT UNSIGNED DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES r3link_users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_player (user_id, player_id),
    INDEX idx_user_id (user_id),
    INDEX idx_player_id (player_id),
    INDEX idx_level (level),
    INDEX idx_total_points (total_points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Player actions log
CREATE TABLE IF NOT EXISTS r3link_player_actions (
    action_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    player_id VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    points INT DEFAULT 0,
    metadata JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES r3link_users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_player_id (player_id),
    INDEX idx_action_type (action_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vault donations tracking
CREATE TABLE IF NOT EXISTS r3link_donations (
    donation_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    player_id VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    stake_increase DECIMAL(12,2) DEFAULT 0.00,
    bonus_points INT DEFAULT 0,
    donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES r3link_users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_player_id (player_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_donation_date (donation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Achievements tracking
CREATE TABLE IF NOT EXISTS r3link_achievements (
    achievement_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    achievement_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    points INT DEFAULT 0,
    icon_url VARCHAR(500),
    category VARCHAR(50),
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
    requirements JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_achievement_key (achievement_key),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User achievements (unlocked achievements)
CREATE TABLE IF NOT EXISTS r3link_user_achievements (
    user_achievement_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    achievement_id BIGINT UNSIGNED NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES r3link_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES r3link_achievements(achievement_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_id (achievement_id),
    INDEX idx_unlocked_at (unlocked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table for authentication and session management
CREATE TABLE IF NOT EXISTS r3link_sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES r3link_users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sync queue for local/remote data synchronization
CREATE TABLE IF NOT EXISTS r3link_sync_queue (
    sync_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    operation ENUM('create', 'update', 'delete') NOT NULL,
    data JSON,
    sync_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    client_timestamp BIGINT UNSIGNED NOT NULL,
    server_timestamp BIGINT UNSIGNED,
    retry_count INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES r3link_users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_sync_status (sync_status),
    INDEX idx_entity_type (entity_type),
    INDEX idx_client_timestamp (client_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pattern alerts and guardian logs
CREATE TABLE IF NOT EXISTS r3link_guardian_logs (
    log_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED,
    log_level ENUM('guardian', 'system', 'error', 'warning', 'info') DEFAULT 'info',
    event_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    metadata JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES r3link_users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_log_level (log_level),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OAuth providers for social login
CREATE TABLE IF NOT EXISTS r3link_oauth_providers (
    oauth_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP NULL,
    profile_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES r3link_users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_user (provider, provider_user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_provider (provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default configuration values
INSERT INTO r3link_config (config_key, config_value, config_type, description) VALUES
('pattern_accuracy_min', '0.922', 'number', 'Minimum pattern accuracy standard'),
('verification_min_hours', '24', 'number', 'Minimum verification window in hours'),
('verification_max_hours', '72', 'number', 'Maximum verification window in hours'),
('builder_first_enabled', 'true', 'boolean', 'Builder-first culture enforcement'),
('guardian_mode_default', 'dormant_watcher', 'string', 'Default guardian mode'),
('companion_mode_default', 'whisper', 'string', 'Default companion mode'),
('vault_email', 'barbrickdesign@gmail.com', 'string', 'Vault donation email'),
('paypal_donate_url', 'https://www.paypal.com/donate?business=BarbrickDesign@gmail.com', 'string', 'PayPal donation URL'),
('paypal_me_url', 'https://www.paypal.com/paypalme/barbrickdesign', 'string', 'PayPal.me URL'),
('discord_server_invite', 'https://discord.gg/M4QZyPQq', 'string', 'Discord server invite URL'),
('github_repository_url', 'https://github.com/barbrickdesign/barbrickdesign.github.io', 'string', 'GitHub repository URL'),
('sync_enabled', 'true', 'boolean', 'Enable local/remote sync'),
('session_timeout_minutes', '1440', 'number', 'Session timeout in minutes (24 hours)'),
('max_login_attempts', '5', 'number', 'Maximum login attempts before lockout'),
('lockout_duration_minutes', '30', 'number', 'Account lockout duration in minutes')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert default achievements
INSERT INTO r3link_achievements (achievement_key, name, description, points, category, rarity) VALUES
('first_visit', 'First Step', 'Visit r3Link for the first time', 10, 'milestone', 'common'),
('protocol_reader', 'Protocol Scholar', 'Read the complete protocol', 50, 'learning', 'uncommon'),
('discord_member', 'Sanctuary Member', 'Join the Discord sanctuary', 100, 'community', 'uncommon'),
('first_donation', 'Vault Contributor', 'Make your first vault donation', 500, 'contribution', 'rare'),
('ecosystem_investor', 'Ecosystem Investor', 'Total donations reach $50+', 1000, 'contribution', 'epic')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Create views for common queries
CREATE OR REPLACE VIEW v_user_stats AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.player_id,
    ps.total_points,
    ps.level,
    ps.total_donations,
    ps.vault_stake,
    ps.stage,
    COUNT(DISTINCT ua.achievement_id) as achievements_count,
    u.created_at as member_since,
    u.last_login_at
FROM r3link_users u
LEFT JOIN r3link_player_state ps ON u.user_id = ps.user_id
LEFT JOIN r3link_user_achievements ua ON u.user_id = ua.user_id
WHERE u.account_status = 'active'
GROUP BY u.user_id, u.username, u.email, u.player_id, ps.total_points, ps.level, 
         ps.total_donations, ps.vault_stake, ps.stage, u.created_at, u.last_login_at;

CREATE OR REPLACE VIEW v_leaderboard AS
SELECT 
    u.user_id,
    u.username,
    up.display_name,
    up.avatar_url,
    ps.total_points,
    ps.level,
    ps.vault_stake,
    COUNT(DISTINCT ua.achievement_id) as achievements_count,
    RANK() OVER (ORDER BY ps.total_points DESC) as points_rank,
    RANK() OVER (ORDER BY ps.vault_stake DESC) as stake_rank
FROM r3link_users u
JOIN r3link_player_state ps ON u.user_id = ps.user_id
LEFT JOIN r3link_user_profiles up ON u.user_id = up.user_id
LEFT JOIN r3link_user_achievements ua ON u.user_id = ua.user_id
WHERE u.account_status = 'active'
GROUP BY u.user_id, u.username, up.display_name, up.avatar_url, 
         ps.total_points, ps.level, ps.vault_stake
ORDER BY ps.total_points DESC;

-- Create stored procedures for common operations
DELIMITER //

-- Procedure to create a new user
CREATE PROCEDURE sp_create_user(
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_salt VARCHAR(64),
    IN p_player_id VARCHAR(100),
    OUT p_user_id BIGINT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_user_id = NULL;
    END;
    
    START TRANSACTION;
    
    INSERT INTO r3link_users (username, email, password_hash, salt, player_id)
    VALUES (p_username, p_email, p_password_hash, p_salt, p_player_id);
    
    SET p_user_id = LAST_INSERT_ID();
    
    -- Create default player state
    INSERT INTO r3link_player_state (user_id, player_id, total_points, level)
    VALUES (p_user_id, p_player_id, 0, 0);
    
    -- Create default profile
    INSERT INTO r3link_user_profiles (user_id, display_name)
    VALUES (p_user_id, p_username);
    
    COMMIT;
END //

-- Procedure to record a player action
CREATE PROCEDURE sp_record_action(
    IN p_user_id BIGINT,
    IN p_action_type VARCHAR(50),
    IN p_points INT,
    IN p_metadata JSON
)
BEGIN
    DECLARE v_player_id VARCHAR(100);
    
    -- Get player_id
    SELECT player_id INTO v_player_id FROM r3link_player_state WHERE user_id = p_user_id LIMIT 1;
    
    -- Insert action
    INSERT INTO r3link_player_actions (user_id, player_id, action_type, points, metadata, timestamp)
    VALUES (p_user_id, v_player_id, p_action_type, p_points, p_metadata, UNIX_TIMESTAMP(NOW()) * 1000);
    
    -- Update player state
    UPDATE r3link_player_state 
    SET total_points = total_points + p_points,
        last_action = UNIX_TIMESTAMP(NOW()) * 1000,
        level = CASE
            WHEN total_points + p_points >= 2500 THEN 5
            WHEN total_points + p_points >= 1000 THEN 4
            WHEN total_points + p_points >= 500 THEN 3
            WHEN total_points + p_points >= 200 THEN 2
            WHEN total_points + p_points >= 50 THEN 1
            ELSE 0
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
END //

-- Procedure to record a donation
CREATE PROCEDURE sp_record_donation(
    IN p_user_id BIGINT,
    IN p_amount DECIMAL(12,2),
    IN p_payment_method VARCHAR(50),
    IN p_transaction_id VARCHAR(255)
)
BEGIN
    DECLARE v_player_id VARCHAR(100);
    DECLARE v_level TINYINT;
    DECLARE v_stake_multiplier DECIMAL(4,2);
    DECLARE v_stake_increase DECIMAL(12,2);
    DECLARE v_bonus_points INT;
    
    -- Get player info
    SELECT player_id, level INTO v_player_id, v_level 
    FROM r3link_player_state WHERE user_id = p_user_id LIMIT 1;
    
    -- Calculate stake multiplier based on level
    SET v_stake_multiplier = CASE v_level
        WHEN 5 THEN 0.50
        WHEN 4 THEN 0.20
        WHEN 3 THEN 0.10
        WHEN 2 THEN 0.05
        WHEN 1 THEN 0.02
        ELSE 0.01
    END;
    
    SET v_stake_increase = p_amount * v_stake_multiplier;
    SET v_bonus_points = FLOOR(500 * (p_amount / 10));
    
    -- Insert donation
    INSERT INTO r3link_donations (user_id, player_id, amount, payment_method, transaction_id, 
                                   stake_increase, bonus_points, payment_status)
    VALUES (p_user_id, v_player_id, p_amount, p_payment_method, p_transaction_id, 
            v_stake_increase, v_bonus_points, 'completed');
    
    -- Update player state
    UPDATE r3link_player_state 
    SET total_donations = total_donations + p_amount,
        vault_stake = vault_stake + v_stake_increase,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
    
    -- Record action
    CALL sp_record_action(p_user_id, 'donation', v_bonus_points, 
                          JSON_OBJECT('amount', p_amount, 'stake_increase', v_stake_increase));
END //

DELIMITER ;

-- Create triggers for audit logging
DELIMITER //

CREATE TRIGGER trg_users_after_update
AFTER UPDATE ON r3link_users
FOR EACH ROW
BEGIN
    IF OLD.account_status != NEW.account_status THEN
        INSERT INTO r3link_guardian_logs (user_id, log_level, event_type, message, metadata)
        VALUES (NEW.user_id, 'system', 'account_status_change', 
                CONCAT('Account status changed from ', OLD.account_status, ' to ', NEW.account_status),
                JSON_OBJECT('old_status', OLD.account_status, 'new_status', NEW.account_status));
    END IF;
END //

CREATE TRIGGER trg_donations_after_insert
AFTER INSERT ON r3link_donations
FOR EACH ROW
BEGIN
    INSERT INTO r3link_guardian_logs (user_id, log_level, event_type, message, metadata)
    VALUES (NEW.user_id, 'info', 'donation_received', 
            CONCAT('Donation of $', NEW.amount, ' received'),
            JSON_OBJECT('donation_id', NEW.donation_id, 'amount', NEW.amount, 
                       'stake_increase', NEW.stake_increase, 'bonus_points', NEW.bonus_points));
END //

DELIMITER ;

-- Add indexes for performance optimization
CREATE INDEX idx_player_actions_composite ON r3link_player_actions(user_id, action_type, timestamp);
CREATE INDEX idx_donations_composite ON r3link_donations(user_id, payment_status, donation_date);
CREATE INDEX idx_sessions_composite ON r3link_sessions(user_id, is_active, expires_at);
CREATE INDEX idx_sync_queue_composite ON r3link_sync_queue(user_id, sync_status, entity_type);
