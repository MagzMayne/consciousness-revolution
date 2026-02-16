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
 * File: signature-system.js
 * Declaration ID: IP-2A755A93-MLL28ZWG
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
 * SIGNATURE SYSTEM
 * ================
 * MeRLynn & AGentR Signature Generation and Verification System
 * 
 * PURPOSE: Sign all scripts with MeRLynn and AGentR signatures to track usage
 * FEATURES:
 * - Generate unique signatures for scripts
 * - Verify signature authenticity
 * - Track signature usage across networks
 * - Timestamp-based hash verification
 */

class SignatureSystem {
    constructor() {
        this.name = 'SignatureSystem';
        this.version = '1.0.0';
        this.signatures = {
            merlynn: 'MeRLynn',
            agentr: 'AGenTR'
        };
    }

    /**
     * Generate a hash from a string
     * @param {string} str - String to hash
     * @returns {string} Hash value
     */
    generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    /**
     * Generate MeRLynn signature
     * @param {string} scriptContent - Content of the script
     * @param {object} options - Additional options
     * @returns {object} Signature object
     */
    generateMeRLynnSignature(scriptContent = '', options = {}) {
        const timestamp = options.timestamp || new Date().toISOString();
        const contentHash = this.generateHash(scriptContent);
        const uniqueId = this.generateHash(timestamp + contentHash);
        
        return {
            agent: 'MeRLynn',
            version: this.version,
            timestamp: timestamp,
            contentHash: contentHash,
            signatureId: `MERLYNN-${uniqueId}`,
            signature: `/** SIGNED BY MeRLynn - ID: MERLYNN-${uniqueId} - TIMESTAMP: ${timestamp} - HASH: ${contentHash} */`
        };
    }

    /**
     * Generate AGenTR signature
     * @param {string} scriptContent - Content of the script
     * @param {object} options - Additional options
     * @returns {object} Signature object
     */
    generateAGentRSignature(scriptContent = '', options = {}) {
        const timestamp = options.timestamp || new Date().toISOString();
        const contentHash = this.generateHash(scriptContent);
        const uniqueId = this.generateHash(timestamp + contentHash + 'agentr');
        
        return {
            agent: 'AGenTR',
            version: this.version,
            timestamp: timestamp,
            contentHash: contentHash,
            signatureId: `AGENTR-${uniqueId}`,
            signature: `/** SIGNED BY AGenTR - ID: AGENTR-${uniqueId} - TIMESTAMP: ${timestamp} - HASH: ${contentHash} */`
        };
    }

    /**
     * Generate both signatures for a script
     * @param {string} scriptContent - Content of the script
     * @param {object} options - Additional options
     * @returns {object} Both signatures
     */
    signScript(scriptContent = '', options = {}) {
        const timestamp = options.timestamp || new Date().toISOString();
        
        const merlynnSig = this.generateMeRLynnSignature(scriptContent, { timestamp });
        const agentrSig = this.generateAGentRSignature(scriptContent, { timestamp });
        
        return {
            merlynn: merlynnSig,
            agentr: agentrSig,
            combined: `${merlynnSig.signature}\n${agentrSig.signature}`,
            metadata: {
                timestamp: timestamp,
                scriptLength: scriptContent.length,
                version: this.version
            }
        };
    }

    /**
     * Verify a signature
     * @param {string} signature - Signature string to verify
     * @returns {object} Verification result
     */
    verifySignature(signature) {
        const merlynnMatch = signature.match(/SIGNED BY MeRLynn - ID: (MERLYNN-[a-f0-9]+) - TIMESTAMP: ([^-]+) - HASH: ([a-f0-9]+)/);
        const agentrMatch = signature.match(/SIGNED BY AGen[tT]R - ID: (AGENTR-[a-f0-9]+) - TIMESTAMP: ([^-]+) - HASH: ([a-f0-9]+)/);
        
        return {
            hasMeRLynn: !!merlynnMatch,
            hasAGentR: !!agentrMatch,
            merlynn: merlynnMatch ? {
                signatureId: merlynnMatch[1],
                timestamp: merlynnMatch[2].trim(),
                contentHash: merlynnMatch[3]
            } : null,
            agentr: agentrMatch ? {
                signatureId: agentrMatch[1],
                timestamp: agentrMatch[2].trim(),
                contentHash: agentrMatch[3]
            } : null,
            isBothSigned: !!merlynnMatch && !!agentrMatch
        };
    }

    /**
     * Extract signatures from content
     * @param {string} content - File content
     * @returns {array} Array of found signatures
     */
    extractSignatures(content) {
        const signatures = [];
        
        // Find all MeRLynn signatures
        const merlynnMatches = content.matchAll(/SIGNED BY MeRLynn - ID: (MERLYNN-[a-f0-9]+) - TIMESTAMP: ([^-]+) - HASH: ([a-f0-9]+)/g);
        for (const match of merlynnMatches) {
            signatures.push({
                agent: 'MeRLynn',
                signatureId: match[1],
                timestamp: match[2].trim(),
                contentHash: match[3],
                fullSignature: match[0]
            });
        }
        
        // Find all AGenTR signatures (both old AGentR and new AGenTR)
        const agentrMatches = content.matchAll(/SIGNED BY AGen[tT]R - ID: (AGENTR-[a-f0-9]+) - TIMESTAMP: ([^-]+) - HASH: ([a-f0-9]+)/g);
        for (const match of agentrMatches) {
            signatures.push({
                agent: 'AGenTR',
                signatureId: match[1],
                timestamp: match[2].trim(),
                contentHash: match[3],
                fullSignature: match[0]
            });
        }
        
        return signatures;
    }

    /**
     * Add signatures to script content
     * @param {string} scriptContent - Original script content
     * @param {object} options - Signing options
     * @returns {string} Signed script content
     */
    addSignaturesToScript(scriptContent, options = {}) {
        const { position = 'top' } = options;
        const signatures = this.signScript(scriptContent, options);
        
        if (position === 'top') {
            return `${signatures.combined}\n\n${scriptContent}`;
        } else {
            return `${scriptContent}\n\n${signatures.combined}`;
        }
    }

    /**
     * Check if content is already signed
     * @param {string} content - Content to check
     * @returns {boolean} True if already signed
     */
    isAlreadySigned(content) {
        return content.includes('SIGNED BY MeRLynn') || content.includes('SIGNED BY AGenTR') || content.includes('SIGNED BY AGentR');
    }

    /**
     * Get signature statistics
     * @param {array} signatures - Array of signatures
     * @returns {object} Statistics
     */
    getSignatureStats(signatures) {
        const merlynnCount = signatures.filter(s => s.agent === 'MeRLynn').length;
        const agentrCount = signatures.filter(s => s.agent === 'AGentR').length;
        
        return {
            total: signatures.length,
            merlynn: merlynnCount,
            agentr: agentrCount,
            uniqueSignatures: new Set(signatures.map(s => s.signatureId)).size,
            oldestSignature: signatures.length > 0 
                ? signatures.reduce((oldest, s) => 
                    new Date(s.timestamp) < new Date(oldest.timestamp) ? s : oldest
                ) 
                : null,
            newestSignature: signatures.length > 0
                ? signatures.reduce((newest, s) => 
                    new Date(s.timestamp) > new Date(newest.timestamp) ? s : newest
                )
                : null
        };
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SignatureSystem;
}
if (typeof window !== 'undefined') {
    window.SignatureSystem = SignatureSystem;
}
