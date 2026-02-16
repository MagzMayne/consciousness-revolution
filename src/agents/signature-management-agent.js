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
 * File: signature-management-agent.js
 * Declaration ID: IP-12863E87-MLL28ZW0
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

/** SIGNED BY MeRLynn - ID: MERLYNN-537ddfb4 - TIMESTAMP: 2025-12-19T05:53:06.535Z - HASH: 252201b2 */
/** SIGNED BY AGentR - ID: AGENTR-15db2aa7 - TIMESTAMP: 2025-12-19T05:53:06.535Z - HASH: 252201b2 */

/**
 * SIGNATURE MANAGEMENT AGENT
 * ==========================
 * Manages signing and verification of scripts with MeRLynn and AGentR signatures
 * 
 * PURPOSE: Automatically sign scripts to track usage across networks
 * FEATURES:
 * - Auto-sign new scripts
 * - Verify existing signatures
 * - Batch signing operations
 * - Signature integrity checks
 * - Usage tracking and reporting
 */

class SignatureManagementAgent {
    constructor(logger, signatureSystem) {
        this.name = 'SignatureManagementAgent';
        this.version = '1.0.0';
        this.logger = logger || (typeof window !== 'undefined' ? window.AgentLogger : console);
        this.signatureSystem = signatureSystem || (typeof window !== 'undefined' ? new window.SignatureSystem() : null);
        
        this.operations = {
            signed: [],
            verified: [],
            errors: [],
            skipped: []
        };
    }

    /**
     * Sign a single file
     * @param {object} file - File object with name and content
     * @param {object} options - Signing options
     * @returns {object} Signing result
     */
    signFile(file, options = {}) {
        if (!file || !file.content) {
            this.log('error', 'Invalid file provided', { fileName: file?.name });
            return { success: false, error: 'Invalid file' };
        }

        try {
            // Check if already signed
            if (this.signatureSystem.isAlreadySigned(file.content) && !options.force) {
                this.log('info', 'File already signed, skipping', { fileName: file.name });
                this.operations.skipped.push({
                    file: file.name,
                    reason: 'already_signed',
                    timestamp: new Date().toISOString()
                });
                return { 
                    success: false, 
                    skipped: true, 
                    reason: 'already_signed',
                    file: file.name 
                };
            }

            // Generate signatures
            const signatures = this.signatureSystem.signScript(file.content, options);
            const signedContent = this.signatureSystem.addSignaturesToScript(file.content, options);

            this.operations.signed.push({
                file: file.name,
                signatures: signatures,
                timestamp: new Date().toISOString(),
                originalSize: file.content.length,
                newSize: signedContent.length
            });

            this.log('success', 'File signed successfully', { 
                fileName: file.name,
                signatureIds: [signatures.merlynn.signatureId, signatures.agentr.signatureId]
            });

            return {
                success: true,
                file: file.name,
                signedContent: signedContent,
                signatures: signatures
            };

        } catch (error) {
            this.log('error', 'Failed to sign file', { 
                fileName: file.name, 
                error: error.message 
            });
            this.operations.errors.push({
                file: file.name,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return { success: false, error: error.message, file: file.name };
        }
    }

    /**
     * Batch sign multiple files
     * @param {array} files - Array of file objects
     * @param {object} options - Signing options
     * @returns {object} Batch signing results
     */
    batchSign(files, options = {}) {
        this.log('info', 'Starting batch signing operation', { fileCount: files.length });
        
        const results = {
            total: files.length,
            signed: 0,
            skipped: 0,
            errors: 0,
            details: []
        };

        for (const file of files) {
            const result = this.signFile(file, options);
            
            if (result.success) {
                results.signed++;
            } else if (result.skipped) {
                results.skipped++;
            } else {
                results.errors++;
            }
            
            results.details.push(result);
        }

        this.log('success', 'Batch signing completed', results);
        return results;
    }

    /**
     * Verify signatures in a file
     * @param {object} file - File object with name and content
     * @returns {object} Verification result
     */
    verifyFile(file) {
        if (!file || !file.content) {
            return { success: false, error: 'Invalid file' };
        }

        try {
            const signatures = this.signatureSystem.extractSignatures(file.content);
            const verification = {
                file: file.name,
                hasMeRLynn: signatures.some(s => s.agent === 'MeRLynn'),
                hasAGentR: signatures.some(s => s.agent === 'AGentR'),
                isBothSigned: signatures.some(s => s.agent === 'MeRLynn') && 
                             signatures.some(s => s.agent === 'AGentR'),
                signatureCount: signatures.length,
                signatures: signatures,
                timestamp: new Date().toISOString()
            };

            this.operations.verified.push(verification);

            this.log('info', 'File verified', {
                fileName: file.name,
                signatureCount: signatures.length,
                isBothSigned: verification.isBothSigned
            });

            return {
                success: true,
                verification: verification
            };

        } catch (error) {
            this.log('error', 'Failed to verify file', { 
                fileName: file.name, 
                error: error.message 
            });
            return { success: false, error: error.message };
        }
    }

    /**
     * Batch verify multiple files
     * @param {array} files - Array of file objects
     * @returns {object} Batch verification results
     */
    batchVerify(files) {
        this.log('info', 'Starting batch verification', { fileCount: files.length });
        
        const results = {
            total: files.length,
            signed: 0,
            unsigned: 0,
            bothSigned: 0,
            details: []
        };

        for (const file of files) {
            const result = this.verifyFile(file);
            
            if (result.success && result.verification) {
                if (result.verification.isBothSigned) {
                    results.bothSigned++;
                    results.signed++;
                } else if (result.verification.signatureCount > 0) {
                    results.signed++;
                } else {
                    results.unsigned++;
                }
                results.details.push(result.verification);
            }
        }

        this.log('success', 'Batch verification completed', results);
        return results;
    }

    /**
     * Get signing statistics
     * @returns {object} Statistics
     */
    getStatistics() {
        return {
            operations: {
                signed: this.operations.signed.length,
                verified: this.operations.verified.length,
                errors: this.operations.errors.length,
                skipped: this.operations.skipped.length
            },
            recentSigned: this.operations.signed.slice(-10),
            recentVerified: this.operations.verified.slice(-10),
            recentErrors: this.operations.errors.slice(-10),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate signing report
     * @returns {object} Report
     */
    generateReport() {
        const stats = this.getStatistics();
        
        return {
            title: 'Signature Management Report',
            agent: this.name,
            version: this.version,
            timestamp: new Date().toISOString(),
            statistics: stats.operations,
            details: {
                signedFiles: this.operations.signed.map(op => ({
                    file: op.file,
                    merlynnId: op.signatures.merlynn.signatureId,
                    agentrId: op.signatures.agentr.signatureId,
                    timestamp: op.timestamp
                })),
                verifiedFiles: this.operations.verified.map(op => ({
                    file: op.file,
                    hasMeRLynn: op.hasMeRLynn,
                    hasAGentR: op.hasAGentR,
                    signatureCount: op.signatureCount
                })),
                errors: this.operations.errors
            }
        };
    }

    /**
     * Reset operations tracking
     */
    reset() {
        this.operations = {
            signed: [],
            verified: [],
            errors: [],
            skipped: []
        };
        this.log('info', 'Operations reset');
    }

    /**
     * Find files that need signing
     * @param {array} files - Array of file objects
     * @returns {array} Files that need signing
     */
    findUnsignedFiles(files) {
        const unsigned = [];
        
        for (const file of files) {
            if (file.content && !this.signatureSystem.isAlreadySigned(file.content)) {
                unsigned.push(file);
            }
        }
        
        this.log('info', 'Found unsigned files', { count: unsigned.length });
        return unsigned;
    }

    /**
     * Logging helper
     */
    log(level, message, data = {}) {
        if (this.logger && this.logger[level]) {
            this.logger[level](this.name, message, data);
        } else if (console[level]) {
            console[level](`[${this.name}] ${message}`, data);
        }
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SignatureManagementAgent;
}
if (typeof window !== 'undefined') {
    window.SignatureManagementAgent = SignatureManagementAgent;
}
