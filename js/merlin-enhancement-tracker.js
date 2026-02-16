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
 * File: merlin-enhancement-tracker.js
 * Declaration ID: IP-66905736-MLL28ZV5
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
 * Merlin's Minions - Enhancement Tracker
 * Tracks before/after changes and logs enhancements with screenshots
 */

class MerlinEnhancementTracker {
    constructor() {
        this.STORAGE_KEY = 'merlin_enhancements';
        this.SCREENSHOT_KEY = 'merlin_screenshots';
        this.enhancements = [];
        
        this.loadEnhancements();
    }
    
    /**
     * Load enhancements from localStorage
     */
    loadEnhancements() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            this.enhancements = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Could not load enhancements:', e);
            this.enhancements = [];
        }
    }
    
    /**
     * Save enhancements to localStorage
     */
    saveEnhancements() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.enhancements));
        } catch (e) {
            console.warn('Could not save enhancements:', e);
        }
    }
    
    /**
     * Log a new enhancement
     */
    logEnhancement(enhancement) {
        const entry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            type: enhancement.type || 'general',
            description: enhancement.description,
            before: enhancement.before || null,
            after: enhancement.after || null,
            valueAdded: enhancement.valueAdded || 0,
            agent: enhancement.agent || 'manual',
            metadata: enhancement.metadata || {}
        };
        
        this.enhancements.push(entry);
        this.saveEnhancements();
        
        return entry;
    }
    
    /**
     * Capture before state
     */
    captureBeforeState() {
        const state = {
            timestamp: new Date().toISOString(),
            html: document.documentElement.outerHTML.length,
            scripts: document.querySelectorAll('script').length,
            styles: document.querySelectorAll('style, link[rel="stylesheet"]').length,
            elements: document.querySelectorAll('*').length,
            screenshot: this.captureScreenshotMetadata()
        };
        
        return state;
    }
    
    /**
     * Capture after state
     */
    captureAfterState() {
        return this.captureBeforeState(); // Same method, different timing
    }
    
    /**
     * Capture screenshot metadata
     */
    captureScreenshotMetadata() {
        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            scrollPosition: {
                x: window.scrollX,
                y: window.scrollY
            },
            documentSize: {
                width: document.documentElement.scrollWidth,
                height: document.documentElement.scrollHeight
            }
        };
    }
    
    /**
     * Start tracking an enhancement
     */
    startTracking(taskDescription) {
        const before = this.captureBeforeState();
        
        const trackingId = this.generateId();
        const trackingData = {
            id: trackingId,
            task: taskDescription,
            before: before,
            startTime: new Date().toISOString()
        };
        
        // Store in session storage for current session
        sessionStorage.setItem('merlin_current_tracking', JSON.stringify(trackingData));
        
        console.log('🧙 Merlin tracking started:', taskDescription);
        return trackingId;
    }
    
    /**
     * Complete tracking and log enhancement
     */
    completeTracking(notes = '') {
        try {
            const trackingData = JSON.parse(sessionStorage.getItem('merlin_current_tracking'));
            
            if (!trackingData) {
                console.warn('No active tracking session found');
                return null;
            }
            
            const after = this.captureAfterState();
            const endTime = new Date().toISOString();
            
            // Calculate changes
            const changes = {
                htmlSizeChange: after.html - trackingData.before.html,
                scriptsAdded: after.scripts - trackingData.before.scripts,
                stylesAdded: after.styles - trackingData.before.styles,
                elementsAdded: after.elements - trackingData.before.elements
            };
            
            // Calculate value added (simple heuristic)
            const valueAdded = this.calculateValueAdded(changes);
            
            const enhancement = {
                type: 'enhancement',
                description: trackingData.task,
                before: trackingData.before,
                after: after,
                changes: changes,
                valueAdded: valueAdded,
                duration: new Date(endTime) - new Date(trackingData.startTime),
                notes: notes,
                agent: 'merlin-enhancement-tracker'
            };
            
            const entry = this.logEnhancement(enhancement);
            
            // Clear session tracking
            sessionStorage.removeItem('merlin_current_tracking');
            
            console.log('✅ Enhancement tracked:', entry);
            return entry;
            
        } catch (e) {
            console.error('Error completing tracking:', e);
            return null;
        }
    }
    
    /**
     * Calculate value added based on changes
     */
    calculateValueAdded(changes) {
        // Simple heuristic: $10 per 100 lines of code (assuming ~50 chars per line)
        const estimatedLines = changes.htmlSizeChange / 50;
        const baseValue = (estimatedLines / 100) * 10;
        
        // Bonus for added functionality
        const functionalityBonus = (changes.scriptsAdded * 50) + (changes.stylesAdded * 20);
        
        return Math.max(0, baseValue + functionalityBonus);
    }
    
    /**
     * Generate unique ID
     */
    generateId() {
        return 'merlin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Get all enhancements
     */
    getEnhancements(filter = {}) {
        let filtered = [...this.enhancements];
        
        if (filter.page) {
            filtered = filtered.filter(e => e.page === filter.page);
        }
        
        if (filter.type) {
            filtered = filtered.filter(e => e.type === filter.type);
        }
        
        if (filter.agent) {
            filtered = filtered.filter(e => e.agent === filter.agent);
        }
        
        return filtered;
    }
    
    /**
     * Get enhancement statistics
     */
    getStats() {
        const totalEnhancements = this.enhancements.length;
        const totalValue = this.enhancements.reduce((sum, e) => sum + (e.valueAdded || 0), 0);
        
        const byPage = {};
        const byType = {};
        const byAgent = {};
        
        this.enhancements.forEach(e => {
            // By page
            byPage[e.page] = (byPage[e.page] || 0) + 1;
            
            // By type
            byType[e.type] = (byType[e.type] || 0) + 1;
            
            // By agent
            byAgent[e.agent] = (byAgent[e.agent] || 0) + 1;
        });
        
        return {
            totalEnhancements,
            totalValue,
            byPage,
            byType,
            byAgent,
            averageValue: totalEnhancements > 0 ? totalValue / totalEnhancements : 0
        };
    }
    
    /**
     * Export enhancements as JSON
     */
    exportEnhancements() {
        const stats = this.getStats();
        
        const exportData = {
            generated: new Date().toISOString(),
            repository: 'barbrickdesign.github.io',
            statistics: stats,
            enhancements: this.enhancements,
            metadata: {
                system: 'Merlin\'s Minions Enhancement Tracker v1.0',
                contact: 'barbrickdesign@gmail.com'
            }
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    /**
     * Create visual report of enhancements
     */
    generateVisualReport() {
        const stats = this.getStats();
        
        const reportHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 20px auto; padding: 20px; background: #f5f5f5;">
                <h1 style="color: #1a237e;">🧙 Merlin's Minions Enhancement Report</h1>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 20px 0;">
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 10px 0; color: #666;">Total Enhancements</h3>
                        <p style="font-size: 32px; font-weight: bold; margin: 0; color: #4CAF50;">${stats.totalEnhancements}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 10px 0; color: #666;">Total Value Added</h3>
                        <p style="font-size: 32px; font-weight: bold; margin: 0; color: #2196F3;">$${stats.totalValue.toFixed(2)}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 10px 0; color: #666;">Average Value</h3>
                        <p style="font-size: 32px; font-weight: bold; margin: 0; color: #FF9800;">$${stats.averageValue.toFixed(2)}</p>
                    </div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2>Recent Enhancements</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f5f5f5; text-align: left;">
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Date</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Page</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Description</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Value</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Agent</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.enhancements.slice(-10).reverse().map(e => `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(e.timestamp).toLocaleDateString()}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${e.page}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${e.description}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; color: #4CAF50; font-weight: bold;">$${(e.valueAdded || 0).toFixed(2)}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${e.agent}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0;">
                        💳 <strong>License these scripts:</strong> Contact barbrickdesign@gmail.com via PayPal to license scripts for your AI or workspace
                    </p>
                </div>
            </div>
        `;
        
        return reportHTML;
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    window.MerlinEnhancementTracker = MerlinEnhancementTracker;
    window.merlinEnhancementTracker = new MerlinEnhancementTracker();
    
    // Add console helper methods
    window.merlinTrackStart = (description) => window.merlinEnhancementTracker.startTracking(description);
    window.merlinTrackEnd = (notes) => window.merlinEnhancementTracker.completeTracking(notes);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MerlinEnhancementTracker;
}
