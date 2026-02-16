/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: peaceai-auth-manager.js
 * Declaration ID: IP-78C5CBB8-MLL28ZVK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * PeaceAI Authentication & Authorization Manager
 * Manages user authentication, admin approvals, and role-based access control
 * 
 * Features:
 * - User authentication via Google OAuth
 * - Admin approval workflow
 * - Role-based permissions (guest, user, steward, admin)
 * - Secure storage of user profiles and approval status
 */

(function() {
    'use strict';

    // User roles with permissions
    const ROLES = {
        guest: {
            level: 0,
            permissions: []
        },
        user: {
            level: 1,
            permissions: ['view_cameras', 'view_events']
        },
        steward: {
            level: 2,
            permissions: ['view_cameras', 'view_events', 'configure_alerts', 'test_alerts', 'view_automations']
        },
        admin: {
            level: 3,
            permissions: ['view_cameras', 'view_events', 'configure_alerts', 'test_alerts', 'view_automations', 
                         'lock_doors', 'unlock_doors', 'manage_devices', 'approve_users', 'manage_users']
        }
    };

    // Storage keys
    const STORAGE_KEYS = {
        USER_PROFILE: 'peaceai_user_profile',
        APPROVAL_STATUS: 'peaceai_approval_status',
        APPROVED_USERS: 'peaceai_approved_users' // Admin only
    };

    window.PeaceAIAuthManager = {
        currentUser: null,
        approvedUsers: {},
        initialized: false,

        /**
         * Initialize the auth manager
         */
        async init() {
            if (this.initialized) {
                console.log('⚠️ PeaceAI Auth Manager already initialized');
                return;
            }

            console.log('🔐 Initializing PeaceAI Auth Manager...');

            // Load approved users list (admin only)
            this.loadApprovedUsers();

            // Try to restore previous session
            this.currentUser = this.loadUserProfile();

            this.initialized = true;
            console.log('✅ PeaceAI Auth Manager initialized');
        },

        /**
         * Authenticate user with email/password (Google OAuth)
         */
        async loginWithEmail(email, googleId) {
            const userProfile = {
                id: googleId || email,
                email: email,
                authMethod: 'email',
                loginTime: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            };

            // Check if user is approved
            const approvalStatus = this.checkApprovalStatus(userProfile.id);
            userProfile.approved = approvalStatus.approved;
            userProfile.role = approvalStatus.role;

            this.currentUser = userProfile;
            this.saveUserProfile(userProfile);

            console.log('✅ User authenticated:', email);
            return { success: true, user: userProfile };
        },

        /**
         * Logout current user
         */
        logout() {
            if (this.currentUser) {
                console.log('👋 Logging out:', this.currentUser.email);

                this.currentUser = null;
                localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
                localStorage.removeItem(STORAGE_KEYS.APPROVAL_STATUS);
            }
        },

        /**
         * Check if user is authenticated
         */
        isAuthenticated() {
            return this.currentUser !== null;
        },

        /**
         * Check if user is approved by admin
         */
        isApproved() {
            return this.currentUser && this.currentUser.approved === true;
        },

        /**
         * Get current user
         */
        getCurrentUser() {
            return this.currentUser;
        },

        /**
         * Check if user has specific permission
         */
        hasPermission(permission) {
            if (!this.currentUser || !this.currentUser.approved) {
                return false;
            }

            const role = this.currentUser.role || 'guest';
            const roleConfig = ROLES[role];
            
            if (!roleConfig) {
                return false;
            }

            return roleConfig.permissions.includes(permission);
        },

        /**
         * Check if user has role at or above specified level
         */
        hasRole(requiredRole) {
            if (!this.currentUser || !this.currentUser.approved) {
                return false;
            }

            const userRole = this.currentUser.role || 'guest';
            const requiredLevel = ROLES[requiredRole]?.level || 0;
            const userLevel = ROLES[userRole]?.level || 0;

            return userLevel >= requiredLevel;
        },

        /**
         * Check approval status for a user ID
         */
        checkApprovalStatus(userId) {
            // Check if user is in approved list
            if (this.approvedUsers[userId]) {
                return {
                    approved: true,
                    role: this.approvedUsers[userId].role || 'user',
                    approvedBy: this.approvedUsers[userId].approvedBy,
                    approvedAt: this.approvedUsers[userId].approvedAt
                };
            }

            // Default: not approved
            return {
                approved: false,
                role: 'guest',
                message: 'Waiting for admin approval'
            };
        },

        /**
         * Approve a user (admin only)
         */
        approveUser(userId, role = 'user', adminId = null) {
            if (!this.hasPermission('approve_users')) {
                throw new Error('Insufficient permissions to approve users');
            }

            this.approvedUsers[userId] = {
                role: role,
                approvedBy: adminId || this.currentUser.id,
                approvedAt: new Date().toISOString()
            };

            this.saveApprovedUsers();
            
            console.log('✅ User approved:', userId, 'as', role);
            return true;
        },

        /**
         * Revoke user approval (admin only)
         */
        revokeApproval(userId) {
            if (!this.hasPermission('approve_users')) {
                throw new Error('Insufficient permissions to revoke approvals');
            }

            delete this.approvedUsers[userId];
            this.saveApprovedUsers();
            
            console.log('❌ User approval revoked:', userId);
            return true;
        },

        /**
         * Get all approved users (admin only)
         */
        getApprovedUsers() {
            if (!this.hasPermission('approve_users')) {
                throw new Error('Insufficient permissions to view approved users');
            }

            return this.approvedUsers;
        },

        /**
         * Save user profile to localStorage
         */
        saveUserProfile(profile) {
            try {
                localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify({
                    data: profile,
                    timestamp: Date.now()
                }));
            } catch (err) {
                console.error('Failed to save user profile:', err);
            }
        },

        /**
         * Load user profile from localStorage
         */
        loadUserProfile() {
            try {
                const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
                if (!stored) return null;

                const { data, timestamp } = JSON.parse(stored);
                
                // Check if session expired (24 hours)
                const age = Date.now() - timestamp;
                if (age > 24 * 60 * 60 * 1000) {
                    console.log('⏰ Session expired');
                    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
                    return null;
                }

                // Recheck approval status on load
                const approvalStatus = this.checkApprovalStatus(data.id);
                data.approved = approvalStatus.approved;
                data.role = approvalStatus.role;

                return data;
            } catch (err) {
                console.error('Failed to load user profile:', err);
                return null;
            }
        },

        /**
         * Save approved users list (admin only)
         */
        saveApprovedUsers() {
            try {
                localStorage.setItem(STORAGE_KEYS.APPROVED_USERS, JSON.stringify(this.approvedUsers));
            } catch (err) {
                console.error('Failed to save approved users:', err);
            }
        },

        /**
         * Load approved users list
         */
        loadApprovedUsers() {
            try {
                const stored = localStorage.getItem(STORAGE_KEYS.APPROVED_USERS);
                if (stored) {
                    this.approvedUsers = JSON.parse(stored);
                } else {
                    // Initialize with demo admin user for testing
                    this.approvedUsers = {
                        // Demo admin - in production, this would be set by backend
                        'demo-admin': {
                            role: 'admin',
                            approvedBy: 'system',
                            approvedAt: new Date().toISOString()
                        }
                    };
                    this.saveApprovedUsers();
                }
            } catch (err) {
                console.error('Failed to load approved users:', err);
                this.approvedUsers = {};
            }
        },

        /**
         * Update last activity timestamp
         */
        updateActivity() {
            if (this.currentUser) {
                this.currentUser.lastActivity = new Date().toISOString();
                this.saveUserProfile(this.currentUser);
            }
        },

        /**
         * Get permission description
         */
        getPermissionDescription(permission) {
            const descriptions = {
                'view_cameras': 'View camera feeds',
                'view_events': 'View security events',
                'configure_alerts': 'Configure alert routing',
                'test_alerts': 'Send test alerts',
                'view_automations': 'View automations',
                'lock_doors': 'Lock doors remotely',
                'unlock_doors': 'Unlock doors remotely',
                'manage_devices': 'Manage devices',
                'approve_users': 'Approve new users',
                'manage_users': 'Manage user permissions'
            };
            return descriptions[permission] || permission;
        },

        /**
         * Get role description
         */
        getRoleDescription(role) {
            const descriptions = {
                'guest': 'Guest - No access',
                'user': 'User - View only',
                'steward': 'Steward - View and configure alerts',
                'admin': 'Admin - Full control'
            };
            return descriptions[role] || role;
        }
    };

    console.log('✅ PeaceAI Auth Manager loaded');
})();
