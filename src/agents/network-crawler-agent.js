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
 * File: network-crawler-agent.js
 * Declaration ID: IP-65A6DED6-MLL28ZW0
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

/** SIGNED BY MeRLynn - ID: MERLYNN-20bb5425 - TIMESTAMP: 2025-12-19T05:53:06.534Z - HASH: 1904deed */
/** SIGNED BY AGentR - ID: AGENTR-44940272 - TIMESTAMP: 2025-12-19T05:53:06.534Z - HASH: 1904deed */

/**
 * NETWORK CRAWLER AGENT
 * =====================
 * Crawls networks and interwebs to gather links and signatures
 * 
 * PURPOSE: Deploy agents to discover and catalog usage of signed scripts
 * FEATURES:
 * - Crawl local repository files
 * - Discover all links (internal and external)
 * - Find and catalog all signatures
 * - Generate comprehensive reports
 * - Track signature usage patterns
 */

class NetworkCrawlerAgent {
    constructor(logger, signatureSystem) {
        this.name = 'NetworkCrawlerAgent';
        this.version = '1.0.0';
        this.logger = logger || (typeof window !== 'undefined' ? window.AgentLogger : console);
        this.signatureSystem = signatureSystem || (typeof window !== 'undefined' ? new window.SignatureSystem() : null);
        
        this.crawlResults = {
            filesScanned: 0,
            linksFound: [],
            signaturesFound: [],
            internalLinks: [],
            externalLinks: [],
            signedFiles: [],
            unsignedFiles: [],
            statistics: {}
        };
    }

    /**
     * Start network crawl operation
     * @param {array} files - Array of file objects to crawl
     * @returns {object} Crawl results
     */
    async crawl(files = []) {
        this.log('info', 'Starting network crawl operation', { fileCount: files.length });
        
        try {
            this.resetResults();
            
            for (const file of files) {
                await this.scanFile(file);
            }
            
            this.generateStatistics();
            this.log('success', 'Network crawl completed', this.crawlResults.statistics);
            
            return this.crawlResults;
        } catch (error) {
            this.log('error', 'Crawl operation failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Scan a single file for links and signatures
     * @param {object} file - File object with name and content
     */
    async scanFile(file) {
        if (!file || !file.content) {
            return;
        }

        this.crawlResults.filesScanned++;
        
        // Extract links
        const links = this.extractLinks(file.content, file.name);
        this.crawlResults.linksFound.push(...links);
        
        // Extract signatures
        if (this.signatureSystem) {
            const signatures = this.signatureSystem.extractSignatures(file.content);
            
            if (signatures.length > 0) {
                this.crawlResults.signaturesFound.push(...signatures.map(sig => ({
                    ...sig,
                    file: file.name,
                    fileType: this.getFileType(file.name)
                })));
                this.crawlResults.signedFiles.push(file.name);
            } else {
                this.crawlResults.unsignedFiles.push(file.name);
            }
        }
        
        // Categorize links
        for (const link of links) {
            if (this.isInternalLink(link.url)) {
                this.crawlResults.internalLinks.push(link);
            } else {
                this.crawlResults.externalLinks.push(link);
            }
        }
    }

    /**
     * Extract all links from content
     * @param {string} content - File content
     * @param {string} fileName - Name of the file
     * @returns {array} Array of link objects
     */
    extractLinks(content, fileName) {
        const links = [];
        const seenUrls = new Set();
        
        // HTML/JavaScript link patterns
        const patterns = [
            // href attributes
            /href=["']([^"']+)["']/gi,
            // src attributes
            /src=["']([^"']+)["']/gi,
            // URL in comments or strings
            /https?:\/\/[^\s<>"']+/gi,
            // Import statements
            /import\s+.*from\s+["']([^"']+)["']/gi,
            // require statements
            /require\(["']([^"']+)["']\)/gi
        ];
        
        for (const pattern of patterns) {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                const url = match[1] || match[0];
                
                // Clean up URL
                const cleanUrl = url.trim().replace(/[,;]$/, '');
                
                if (!seenUrls.has(cleanUrl) && this.isValidUrl(cleanUrl)) {
                    seenUrls.add(cleanUrl);
                    links.push({
                        url: cleanUrl,
                        sourceFile: fileName,
                        type: this.classifyLink(cleanUrl),
                        foundAt: new Date().toISOString()
                    });
                }
            }
        }
        
        return links;
    }

    /**
     * Check if URL is valid
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid
     */
    isValidUrl(url) {
        if (!url || url.length < 3) return false;
        if (url.startsWith('#')) return false;
        if (url.startsWith('javascript:')) return false;
        if (url.startsWith('data:')) return false;
        if (url.includes('{{') || url.includes('}}')) return false; // Template variables
        return true;
    }

    /**
     * Classify link type
     * @param {string} url - URL to classify
     * @returns {string} Link type
     */
    classifyLink(url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return 'external';
        }
        if (url.endsWith('.html') || url.endsWith('.htm')) {
            return 'html';
        }
        if (url.endsWith('.js')) {
            return 'javascript';
        }
        if (url.endsWith('.css')) {
            return 'stylesheet';
        }
        if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
            return 'image';
        }
        if (url.match(/\.(mp4|webm|ogg|mp3|wav)$/i)) {
            return 'media';
        }
        return 'other';
    }

    /**
     * Check if link is internal
     * @param {string} url - URL to check
     * @returns {boolean} True if internal
     */
    isInternalLink(url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url.includes('barbrickdesign.github.io') || 
                   url.includes('localhost') ||
                   url.includes('127.0.0.1');
        }
        return true; // Relative URLs are internal
    }

    /**
     * Get file type from filename
     * @param {string} fileName - File name
     * @returns {string} File type
     */
    getFileType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'js': 'JavaScript',
            'html': 'HTML',
            'htm': 'HTML',
            'css': 'CSS',
            'json': 'JSON',
            'md': 'Markdown'
        };
        return typeMap[ext] || ext.toUpperCase();
    }

    /**
     * Generate statistics from crawl results
     */
    generateStatistics() {
        const stats = {
            totalFilesScanned: this.crawlResults.filesScanned,
            totalLinksFound: this.crawlResults.linksFound.length,
            totalSignaturesFound: this.crawlResults.signaturesFound.length,
            internalLinksCount: this.crawlResults.internalLinks.length,
            externalLinksCount: this.crawlResults.externalLinks.length,
            signedFilesCount: this.crawlResults.signedFiles.length,
            unsignedFilesCount: this.crawlResults.unsignedFiles.length,
            signaturePercentage: this.crawlResults.filesScanned > 0
                ? ((this.crawlResults.signedFiles.length / this.crawlResults.filesScanned) * 100).toFixed(2)
                : 0
        };
        
        // Signature breakdown
        if (this.signatureSystem && this.crawlResults.signaturesFound.length > 0) {
            const sigStats = this.signatureSystem.getSignatureStats(this.crawlResults.signaturesFound);
            stats.signatureBreakdown = sigStats;
        }
        
        // Link type breakdown
        const linkTypes = {};
        for (const link of this.crawlResults.linksFound) {
            linkTypes[link.type] = (linkTypes[link.type] || 0) + 1;
        }
        stats.linkTypeBreakdown = linkTypes;
        
        // Top external domains
        const domains = {};
        for (const link of this.crawlResults.externalLinks) {
            try {
                const url = new URL(link.url);
                domains[url.hostname] = (domains[url.hostname] || 0) + 1;
            } catch (e) {
                // Invalid URL, skip
            }
        }
        stats.topExternalDomains = Object.entries(domains)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([domain, count]) => ({ domain, count }));
        
        this.crawlResults.statistics = stats;
    }

    /**
     * Generate crawl report
     * @returns {object} Formatted report
     */
    generateReport() {
        return {
            title: 'Network Crawl Report',
            timestamp: new Date().toISOString(),
            agent: this.name,
            version: this.version,
            summary: this.crawlResults.statistics,
            details: {
                signedFiles: this.crawlResults.signedFiles,
                unsignedFiles: this.crawlResults.unsignedFiles,
                signatures: this.crawlResults.signaturesFound,
                internalLinks: this.crawlResults.internalLinks,
                externalLinks: this.crawlResults.externalLinks
            }
        };
    }

    /**
     * Reset crawl results
     */
    resetResults() {
        this.crawlResults = {
            filesScanned: 0,
            linksFound: [],
            signaturesFound: [],
            internalLinks: [],
            externalLinks: [],
            signedFiles: [],
            unsignedFiles: [],
            statistics: {}
        };
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
    module.exports = NetworkCrawlerAgent;
}
if (typeof window !== 'undefined') {
    window.NetworkCrawlerAgent = NetworkCrawlerAgent;
}
