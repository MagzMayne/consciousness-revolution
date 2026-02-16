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
 * File: merlin-value-tracker.js
 * Declaration ID: IP-36BBE1CF-MLL28ZV5
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
 * Merlin's Minions - Value Tracking System
 * Tracks development value across all pages and repositories
 * Contact: barbrickdesign@gmail.com (PayPal for licensing)
 */

class MerlinValueTracker {
    constructor() {
        this.HOURLY_RATE = 100; // Base developer hourly rate in USD
        this.TYPING_SPEED_WPM = 40; // Average typing speed
        this.CHARS_PER_WORD = 5;
        this.CODE_COMPLEXITY_MULTIPLIER = 2.5; // Code requires thinking time, not just typing
        this.LOCAL_STORAGE_KEY = 'merlin_value_logs';
        this.GLOBAL_STORAGE_KEY = 'merlin_global_value';
        
        this.currentPageValue = 0;
        this.totalValue = 0;
        
        this.init();
    }
    
    init() {
        // Calculate current page value on load
        this.calculatePageValue();
        
        // Load global value from storage
        this.loadGlobalValue();
        
        // Display value tally
        this.displayValueTally();
        
        // Log page view
        this.logPageView();
    }
    
    /**
     * Calculate the development value of the current page
     */
    calculatePageValue() {
        const htmlContent = document.documentElement.outerHTML;
        const scripts = this.extractScripts();
        
        let totalChars = htmlContent.length;
        let totalLines = htmlContent.split('\n').length;
        
        // Add script content
        scripts.forEach(script => {
            totalChars += script.content.length;
            totalLines += script.content.split('\n').length;
        });
        
        // Calculate development time
        const typingTimeMinutes = (totalChars / this.CHARS_PER_WORD) / this.TYPING_SPEED_WPM;
        const developmentTimeMinutes = typingTimeMinutes * this.CODE_COMPLEXITY_MULTIPLIER;
        const developmentTimeHours = developmentTimeMinutes / 60;
        
        // Calculate value
        this.currentPageValue = developmentTimeHours * this.HOURLY_RATE;
        
        return {
            value: this.currentPageValue,
            lines: totalLines,
            chars: totalChars,
            developmentHours: developmentTimeHours
        };
    }
    
    /**
     * Extract all scripts from the page
     */
    extractScripts() {
        const scripts = [];
        
        // Inline scripts
        document.querySelectorAll('script:not([src])').forEach(script => {
            if (script.textContent.trim()) {
                scripts.push({
                    type: 'inline',
                    content: script.textContent
                });
            }
        });
        
        // External scripts (estimate from src)
        document.querySelectorAll('script[src]').forEach(script => {
            scripts.push({
                type: 'external',
                src: script.src,
                content: '' // Would need fetch for actual content
            });
        });
        
        return scripts;
    }
    
    /**
     * Load global value from localStorage
     */
    loadGlobalValue() {
        try {
            const stored = localStorage.getItem(this.GLOBAL_STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                this.totalValue = data.totalValue || 0;
            }
        } catch (e) {
            console.warn('Could not load global value:', e);
        }
    }
    
    /**
     * Save global value to localStorage
     */
    saveGlobalValue() {
        try {
            const data = {
                totalValue: this.totalValue,
                lastUpdated: new Date().toISOString(),
                pagesTracked: this.getTrackedPagesCount()
            };
            localStorage.setItem(this.GLOBAL_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save global value:', e);
        }
    }
    
    /**
     * Log current page view and update global value
     */
    logPageView() {
        try {
            const logs = this.getValueLogs();
            const currentPage = window.location.pathname;
            const timestamp = new Date().toISOString();
            
            // Find or create log entry for this page
            const existingIndex = logs.findIndex(log => log.page === currentPage);
            const pageData = {
                page: currentPage,
                value: this.currentPageValue,
                lastViewed: timestamp,
                viewCount: 1,
                stats: this.calculatePageValue()
            };
            
            if (existingIndex >= 0) {
                logs[existingIndex].viewCount++;
                logs[existingIndex].lastViewed = timestamp;
                logs[existingIndex].value = this.currentPageValue;
                logs[existingIndex].stats = pageData.stats;
            } else {
                logs.push(pageData);
            }
            
            // Update total value
            this.totalValue = logs.reduce((sum, log) => sum + log.value, 0);
            
            // Save logs
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(logs));
            this.saveGlobalValue();
            
        } catch (e) {
            console.warn('Could not log page view:', e);
        }
    }
    
    /**
     * Get all value logs
     */
    getValueLogs() {
        try {
            const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }
    
    /**
     * Get count of tracked pages
     */
    getTrackedPagesCount() {
        return this.getValueLogs().length;
    }
    
    /**
     * Display value tally on the page
     */
    displayValueTally() {
        const tallyHTML = `
            <div id="merlin-value-tally" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: #fff;
                padding: 8px 16px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                z-index: 999999;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                border-bottom: 2px solid #4CAF50;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
            ">
                <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                    <div style="font-weight: bold; color: #4CAF50;">
                        🧙 Merlin's Minions Value Tracker
                    </div>
                    <div style="display: flex; gap: 16px; font-size: 11px;">
                        <span title="Current Page Value">
                            📄 This Page: <strong style="color: #64B5F6;">$${this.formatCurrency(this.currentPageValue)}</strong>
                        </span>
                        <span title="Total Repository Value">
                            💎 Total Value: <strong style="color: #81C784;">$${this.formatCurrency(this.totalValue)}</strong>
                        </span>
                        <span title="Pages Tracked">
                            📊 Pages: <strong>${this.getTrackedPagesCount()}</strong>
                        </span>
                    </div>
                </div>
                <div style="font-size: 10px; color: #B0BEC5;">
                    <span>💳 License scripts via PayPal: </span>
                    <a href="https://paypal.me/barbrickdesign" target="_blank" style="color: #FFD700; text-decoration: none; font-weight: bold;">
                        barbrickdesign@gmail.com
                    </a>
                </div>
            </div>
        `;
        
        // Insert at the beginning of body
        if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', tallyHTML);
            
            // Add padding to body to prevent content from being hidden
            document.body.style.paddingTop = '50px';
        } else {
            // If body is not ready, wait for DOMContentLoaded
            document.addEventListener('DOMContentLoaded', () => {
                document.body.insertAdjacentHTML('afterbegin', tallyHTML);
                document.body.style.paddingTop = '50px';
            });
        }
    }
    
    /**
     * Format currency with thousands separators
     */
    formatCurrency(amount) {
        return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    /**
     * Export value logs as JSON
     */
    exportLogs() {
        const logs = this.getValueLogs();
        const exportData = {
            generated: new Date().toISOString(),
            repository: 'barbrickdesign.github.io',
            totalValue: this.totalValue,
            pagesTracked: logs.length,
            pages: logs,
            metadata: {
                hourlyRate: this.HOURLY_RATE,
                complexityMultiplier: this.CODE_COMPLEXITY_MULTIPLIER,
                system: 'Merlin\'s Minions v1.0'
            }
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    /**
     * Generate a detailed value report
     */
    generateReport() {
        const logs = this.getValueLogs();
        const stats = this.calculatePageValue();
        
        return {
            currentPage: {
                path: window.location.pathname,
                value: this.currentPageValue,
                lines: stats.lines,
                chars: stats.chars,
                developmentHours: stats.developmentHours
            },
            repository: {
                totalValue: this.totalValue,
                pagesTracked: logs.length,
                averagePageValue: logs.length > 0 ? this.totalValue / logs.length : 0
            },
            topPages: logs
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)
                .map(log => ({
                    page: log.page,
                    value: log.value,
                    viewCount: log.viewCount
                }))
        };
    }
    
    /**
     * Take screenshot of current page (browser API)
     */
    async captureScreenshot() {
        try {
            // This would use browser screenshot APIs or libraries
            // For now, we'll log the intent
            console.log('📸 Screenshot captured for value tracking');
            
            const screenshotData = {
                timestamp: new Date().toISOString(),
                page: window.location.pathname,
                value: this.currentPageValue,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };
            
            return screenshotData;
        } catch (e) {
            console.warn('Could not capture screenshot:', e);
            return null;
        }
    }
}

// Auto-initialize on page load
if (typeof window !== 'undefined') {
    window.MerlinValueTracker = MerlinValueTracker;
    
    // Initialize tracker
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.merlinTracker = new MerlinValueTracker();
        });
    } else {
        window.merlinTracker = new MerlinValueTracker();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MerlinValueTracker;
}
