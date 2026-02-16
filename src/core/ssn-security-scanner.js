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
 * File: ssn-security-scanner.js
 * Declaration ID: IP-6BA21E59-MLL28ZW4
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * SSN-BASED SECURITY CLEARANCE SCANNER
 * Validates Social Security Numbers and determines security clearance levels
 * Implements proper masking and secure handling of sensitive data
 */

class SSNSecurityScanner {
    constructor() {
        // Security clearance database (in production, this would be a secure API)
        this.clearanceDatabase = new Map();
        
        // Security levels by numeric value
        this.securityLevels = {
            'PUBLIC': { level: 0, color: '#cccccc', description: 'No clearance - Public access only' },
            'CONFIDENTIAL': { level: 1, color: '#ffff00', description: 'Confidential - Basic government work' },
            'SECRET': { level: 2, color: '#ffa500', description: 'Secret - Classified information access' },
            'TOP_SECRET': { level: 3, color: '#ff4500', description: 'Top Secret - Highly sensitive information' },
            'TS_SCI': { level: 4, color: '#ff0000', description: 'TS/SCI - Special Compartmented Information' },
            'SUPREME': { level: 999, color: '#00ff00', description: 'Supreme - System Architect Authority' }
        };
        
        // Initialize with test data (simulated clearance records)
        this.initializeTestData();
        
        // Audit log for security events
        this.auditLog = [];
    }

    /**
     * Initialize test clearance data (simulated)
     * In production, this would connect to DoD clearance database
     */
    initializeTestData() {
        // Note: These are FICTIONAL SSNs for testing purposes only
        // Format: Last 4 digits mapped to clearance levels
        this.clearanceTestMappings = {
            // Pattern-based clearance assignment for demo
            '0000-0999': 'PUBLIC',
            '1000-2999': 'CONFIDENTIAL',
            '3000-4999': 'SECRET',
            '5000-6999': 'TOP_SECRET',
            '7000-8999': 'TS_SCI'
        };
    }

    /**
     * Validate SSN format
     * Format: XXX-XX-XXXX
     */
    validateSSNFormat(ssn) {
        // Remove any spaces or extra characters
        const cleaned = ssn.replace(/[\s-]/g, '');
        
        // Check length
        if (cleaned.length !== 9) {
            return {
                valid: false,
                error: 'SSN must be 9 digits'
            };
        }
        
        // Check if all digits
        if (!/^\d{9}$/.test(cleaned)) {
            return {
                valid: false,
                error: 'SSN must contain only digits'
            };
        }
        
        // Check for invalid patterns
        const invalidPatterns = [
            /^000/,     // Cannot start with 000
            /^666/,     // Cannot start with 666
            /^9/,       // Cannot start with 9
            /^\d{3}00/, // Middle section cannot be 00
            /0{4}$/     // Last 4 cannot be 0000
        ];
        
        for (const pattern of invalidPatterns) {
            if (pattern.test(cleaned)) {
                return {
                    valid: false,
                    error: 'Invalid SSN pattern detected'
                };
            }
        }
        
        return {
            valid: true,
            formatted: this.formatSSN(cleaned),
            masked: this.maskSSN(cleaned)
        };
    }

    /**
     * Format SSN with dashes
     */
    formatSSN(ssn) {
        const cleaned = ssn.replace(/[\s-]/g, '');
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 5)}-${cleaned.substring(5, 9)}`;
    }

    /**
     * Mask SSN for display (show only last 4 digits)
     */
    maskSSN(ssn) {
        const cleaned = ssn.replace(/[\s-]/g, '');
        return `***-**-${cleaned.substring(5, 9)}`;
    }

    /**
     * Scan SSN and determine security clearance level
     * Returns security level and access permissions
     */
    async scanSSNForClearance(ssn, additionalInfo = {}) {
        try {
            // Log the scan attempt
            this.logAuditEvent('SSN_SCAN_INITIATED', { timestamp: new Date().toISOString() });
            
            // Validate SSN format
            const validation = this.validateSSNFormat(ssn);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // Simulate API delay (database lookup)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Determine clearance level based on SSN
            const clearanceLevel = this.determineClearanceLevel(ssn);
            
            // Generate security profile
            const securityProfile = this.generateSecurityProfile(ssn, clearanceLevel, additionalInfo);
            
            // Log successful scan
            this.logAuditEvent('SSN_SCAN_COMPLETED', {
                masked: validation.masked,
                clearanceLevel: clearanceLevel,
                timestamp: new Date().toISOString()
            });
            
            return {
                success: true,
                clearanceLevel: clearanceLevel,
                securityProfile: securityProfile,
                maskedSSN: validation.masked,
                levelInfo: this.securityLevels[clearanceLevel],
                accessibleContracts: this.getAccessibleContractTypes(clearanceLevel),
                specialAccess: this.determineSpecialAccess(clearanceLevel, additionalInfo),
                verificationDate: new Date().toISOString(),
                expirationDate: this.calculateExpirationDate(clearanceLevel)
            };
            
        } catch (error) {
            this.logAuditEvent('SSN_SCAN_FAILED', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Determine clearance level based on SSN
     * In production, this would query DoD clearance database
     */
    determineClearanceLevel(ssn) {
        const cleaned = ssn.replace(/[\s-]/g, '');
        const last4 = parseInt(cleaned.substring(5, 9));
        
        // Map last 4 digits to clearance level (for demo purposes)
        if (last4 >= 0 && last4 <= 999) return 'PUBLIC';
        if (last4 >= 1000 && last4 <= 2999) return 'CONFIDENTIAL';
        if (last4 >= 3000 && last4 <= 4999) return 'SECRET';
        if (last4 >= 5000 && last4 <= 6999) return 'TOP_SECRET';
        if (last4 >= 7000 && last4 <= 8999) return 'TS_SCI';
        
        // Default to PUBLIC if outside ranges
        return 'PUBLIC';
    }

    /**
     * Generate comprehensive security profile
     */
    generateSecurityProfile(ssn, clearanceLevel, additionalInfo) {
        const levelInfo = this.securityLevels[clearanceLevel];
        
        return {
            clearanceLevel: clearanceLevel,
            clearanceRank: levelInfo.level,
            clearanceDescription: levelInfo.description,
            statusColor: levelInfo.color,
            investigationType: this.getInvestigationType(clearanceLevel),
            polygraphRequired: clearanceLevel === 'TS_SCI',
            backgroundCheckLevel: this.getBackgroundCheckLevel(clearanceLevel),
            adjudicationAuthority: this.getAdjudicationAuthority(clearanceLevel),
            reinvestigationInterval: this.getReinvestigationInterval(clearanceLevel),
            accessLimitations: this.getAccessLimitations(clearanceLevel),
            trainingRequired: this.getRequiredTraining(clearanceLevel)
        };
    }

    /**
     * Get investigation type for clearance level
     */
    getInvestigationType(level) {
        const investigations = {
            'PUBLIC': 'None',
            'CONFIDENTIAL': 'NACLC (National Agency Check with Law and Credit)',
            'SECRET': 'NACLC + Credit Check',
            'TOP_SECRET': 'SSBI (Single Scope Background Investigation)',
            'TS_SCI': 'SSBI + CI Polygraph',
            'SUPREME': 'Full Spectrum Investigation'
        };
        return investigations[level] || 'Unknown';
    }

    /**
     * Get background check level
     */
    getBackgroundCheckLevel(level) {
        const checks = {
            'PUBLIC': 'None',
            'CONFIDENTIAL': 'Basic - 5 years',
            'SECRET': 'Intermediate - 10 years',
            'TOP_SECRET': 'Comprehensive - 15 years',
            'TS_SCI': 'Full Scope - Lifetime',
            'SUPREME': 'Complete - No Restrictions'
        };
        return checks[level] || 'Unknown';
    }

    /**
     * Get adjudication authority
     */
    getAdjudicationAuthority(level) {
        const authorities = {
            'PUBLIC': 'N/A',
            'CONFIDENTIAL': 'Agency Adjudicator',
            'SECRET': 'Senior Agency Adjudicator',
            'TOP_SECRET': 'Central Adjudication Facility',
            'TS_SCI': 'Director of National Intelligence',
            'SUPREME': 'System Architect'
        };
        return authorities[level] || 'Unknown';
    }

    /**
     * Get reinvestigation interval
     */
    getReinvestigationInterval(level) {
        const intervals = {
            'PUBLIC': 'N/A',
            'CONFIDENTIAL': '15 years',
            'SECRET': '10 years',
            'TOP_SECRET': '5 years',
            'TS_SCI': '5 years + continuous evaluation',
            'SUPREME': 'N/A - Permanent'
        };
        return intervals[level] || 'Unknown';
    }

    /**
     * Get access limitations
     */
    getAccessLimitations(level) {
        const limitations = {
            'PUBLIC': ['No classified access', 'Public information only'],
            'CONFIDENTIAL': ['No foreign nationals without proper authorization', 'Controlled areas only'],
            'SECRET': ['Need-to-know basis', 'Restricted areas', 'No foreign disclosure without approval'],
            'TOP_SECRET': ['Strict need-to-know', 'Highly restricted areas', 'NOFORN by default'],
            'TS_SCI': ['Compartmented access only', 'SCIF required', 'Originator control'],
            'SUPREME': ['No limitations', 'Full system access']
        };
        return limitations[level] || [];
    }

    /**
     * Get required training
     */
    getRequiredTraining(level) {
        const training = {
            'PUBLIC': ['General security awareness'],
            'CONFIDENTIAL': ['Security awareness', 'Handling classified information'],
            'SECRET': ['Advanced security', 'Derivative classification', 'OPSEC'],
            'TOP_SECRET': ['All Secret training', 'Counter-intelligence awareness', 'COMSEC'],
            'TS_SCI': ['All TS training', 'Special access programs', 'Polygraph preparation'],
            'SUPREME': ['All training', 'System architecture', 'Full spectrum security']
        };
        return training[level] || [];
    }

    /**
     * Determine special access programs based on clearance
     */
    determineSpecialAccess(clearanceLevel, additionalInfo) {
        const specialAccess = [];
        
        if (clearanceLevel === 'TS_SCI' || clearanceLevel === 'SUPREME') {
            specialAccess.push('SCI');
        }
        
        if (clearanceLevel === 'SUPREME') {
            specialAccess.push('NOFORN', 'NATO', 'FVEY', 'ORCON', 'ARCHITECT');
        }
        
        // Check for additional credentials
        if (additionalInfo.nato) specialAccess.push('NATO');
        if (additionalInfo.fiveEyes) specialAccess.push('FVEY');
        if (additionalInfo.noforn) specialAccess.push('NOFORN');
        
        return specialAccess;
    }

    /**
     * Get accessible contract types for clearance level
     */
    getAccessibleContractTypes(clearanceLevel) {
        const levelRank = this.securityLevels[clearanceLevel].level;
        const contractTypes = [];
        
        if (levelRank >= 0) contractTypes.push('Public contracts');
        if (levelRank >= 1) contractTypes.push('Confidential projects', 'Basic government work');
        if (levelRank >= 2) contractTypes.push('Secret operations', 'Military systems');
        if (levelRank >= 3) contractTypes.push('Top Secret programs', 'Intelligence systems');
        if (levelRank >= 4) contractTypes.push('SCI programs', 'Special access', 'Compartmented projects');
        if (levelRank >= 999) contractTypes.push('All contracts', 'System administration', 'Unrestricted access');
        
        return contractTypes;
    }

    /**
     * Calculate clearance expiration date
     */
    calculateExpirationDate(clearanceLevel) {
        const now = new Date();
        const expirations = {
            'PUBLIC': null, // No expiration for public
            'CONFIDENTIAL': new Date(now.setFullYear(now.getFullYear() + 15)),
            'SECRET': new Date(now.setFullYear(now.getFullYear() + 10)),
            'TOP_SECRET': new Date(now.setFullYear(now.getFullYear() + 5)),
            'TS_SCI': new Date(now.setFullYear(now.getFullYear() + 5)),
            'SUPREME': null // No expiration for system architect
        };
        
        const expDate = expirations[clearanceLevel];
        return expDate ? expDate.toISOString().split('T')[0] : 'N/A';
    }

    /**
     * Verify SSN against existing clearance database
     * In production, this would query real DoD database
     */
    async verifyClearanceInDatabase(ssn, expectedLevel) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate database verification
        const result = this.determineClearanceLevel(ssn);
        
        return {
            verified: result === expectedLevel,
            actualLevel: result,
            expectedLevel: expectedLevel,
            discrepancy: result !== expectedLevel
        };
    }

    /**
     * Log audit event for security compliance
     */
    logAuditEvent(eventType, eventData) {
        const auditEntry = {
            timestamp: new Date().toISOString(),
            eventType: eventType,
            data: eventData,
            ipAddress: 'REDACTED', // Would capture actual IP in production
            clientInfo: 'REDACTED' // User agent redacted for privacy
        };
        
        this.auditLog.push(auditEntry);
        
        // In production, this would send to secure audit logging system
        console.log(`[AUDIT] ${eventType}:`, eventData);
        
        // Keep only last 100 entries in memory
        if (this.auditLog.length > 100) {
            this.auditLog.shift();
        }
    }

    /**
     * Get audit log (admin only)
     */
    getAuditLog() {
        return this.auditLog;
    }

    /**
     * Generate security clearance badge/certificate
     */
    generateClearanceBadge(scanResult) {
        if (!scanResult.success) {
            return null;
        }
        
        return {
            badgeId: this.generateBadgeId(),
            holderSSN: scanResult.maskedSSN,
            clearanceLevel: scanResult.clearanceLevel,
            issuedDate: scanResult.verificationDate,
            expirationDate: scanResult.expirationDate,
            specialAccess: scanResult.specialAccess,
            badgeColor: scanResult.levelInfo.color,
            qrCode: this.generateQRCode(scanResult),
            securityFeatures: {
                hologram: true,
                rfidChip: true,
                biometricData: true,
                blockchainVerified: true
            }
        };
    }

    /**
     * Generate unique badge ID
     */
    generateBadgeId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        return `CLR-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Generate QR code data for badge
     */
    generateQRCode(scanResult) {
        const qrData = {
            badgeId: this.generateBadgeId(),
            clearance: scanResult.clearanceLevel,
            issued: scanResult.verificationDate,
            expires: scanResult.expirationDate
        };
        return btoa(JSON.stringify(qrData));
    }

    /**
     * Compare two clearance levels
     */
    compareClearanceLevels(level1, level2) {
        const rank1 = this.securityLevels[level1]?.level || 0;
        const rank2 = this.securityLevels[level2]?.level || 0;
        
        if (rank1 > rank2) return 1;
        if (rank1 < rank2) return -1;
        return 0;
    }

    /**
     * Check if clearance is sufficient for contract
     */
    hasSufficientClearance(userLevel, requiredLevel) {
        return this.compareClearanceLevels(userLevel, requiredLevel) >= 0;
    }
}

// Create global instance
window.ssnSecurityScanner = new SSNSecurityScanner();

console.log('🔒 SSN Security Scanner System loaded');
