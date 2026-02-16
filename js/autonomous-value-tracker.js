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
 * File: autonomous-value-tracker.js
 * Declaration ID: IP-207E658-MLL28ZV2
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTONOMOUS VALUE TRACKER
 * Barbrick Design - Ryan Barbrick
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Automatically tracks and updates total repository value
 * Updates when new projects are added or project values change
 * 
 * © 2024-2025 Ryan Barbrick. All Rights Reserved.
 * Contact: BarbrickDesign@gmail.com
 * ═══════════════════════════════════════════════════════════════════════════
 */

class AutonomousValueTracker {
    constructor() {
        this.projectsUrl = '/projects.json';
        this.updateInterval = 60000; // Check for updates every 60 seconds
        this.currentValue = 0;
        this.projectCount = 0;
        this.lastUpdate = null;
        this.autoUpdateEnabled = true;
        this.updateTimer = null;
        
        console.log('💰 Autonomous Value Tracker initialized');
    }
    
    /**
     * Initialize the tracker
     */
    async init() {
        try {
            await this.loadProjectData();
            this.startAutoUpdate();
            this.renderValueDisplay();
            console.log('✅ Value Tracker ready');
        } catch (error) {
            console.error('Failed to initialize Value Tracker:', error);
        }
    }
    
    /**
     * Load project data from projects.json
     */
    async loadProjectData() {
        try {
            const response = await fetch(this.projectsUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update current values
            this.currentValue = data.meta?.total_value || 0;
            this.projectCount = data.meta?.total_projects || data.projects?.length || 0;
            this.lastUpdate = new Date();
            
            // Calculate if not present
            if (!this.currentValue && data.projects) {
                this.currentValue = data.projects.reduce((sum, p) => sum + (p.value || 0), 0);
            }
            
            // Dispatch update event
            window.dispatchEvent(new CustomEvent('valuetracker:update', {
                detail: {
                    totalValue: this.currentValue,
                    projectCount: this.projectCount,
                    lastUpdate: this.lastUpdate
                }
            }));
            
            return data;
        } catch (error) {
            console.error('Failed to load project data:', error);
            throw error;
        }
    }
    
    /**
     * Start automatic updates
     */
    startAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        this.updateTimer = setInterval(async () => {
            if (this.autoUpdateEnabled) {
                try {
                    const oldValue = this.currentValue;
                    const oldCount = this.projectCount;
                    
                    await this.loadProjectData();
                    
                    // Check if value or count changed
                    if (oldValue !== this.currentValue || oldCount !== this.projectCount) {
                        this.renderValueDisplay();
                        this.showUpdateNotification(oldValue, oldCount);
                    }
                } catch (error) {
                    console.error('Auto-update failed:', error);
                }
            }
        }, this.updateInterval);
        
        console.log(`🔄 Auto-update enabled (every ${this.updateInterval/1000}s)`);
    }
    
    /**
     * Stop automatic updates
     */
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        this.autoUpdateEnabled = false;
        console.log('⏸️ Auto-update disabled');
    }
    
    /**
     * Format value as currency
     */
    formatValue(value) {
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(2) + 'M';
        } else if (value >= 1000) {
            return '$' + (value / 1000).toFixed(1) + 'K';
        }
        return '$' + value.toLocaleString();
    }
    
    /**
     * Render value display in the UI
     */
    renderValueDisplay() {
        // Find or create value display container
        let container = document.getElementById('value-tracker-display');
        
        if (!container) {
            // Create container if it doesn't exist
            container = document.createElement('div');
            container.id = 'value-tracker-display';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: linear-gradient(135deg, rgba(16, 16, 48, 0.95), rgba(32, 16, 48, 0.95));
                border: 2px solid rgba(255, 215, 0, 0.5);
                border-radius: 15px;
                padding: 20px 25px;
                color: white;
                z-index: 999;
                box-shadow: 0 10px 40px rgba(255, 215, 0, 0.2);
                backdrop-filter: blur(10px);
                font-family: 'Inter', sans-serif;
                min-width: 280px;
                transition: all 0.3s ease;
            `;
            
            // Add hover effect
            container.addEventListener('mouseenter', () => {
                container.style.transform = 'scale(1.05)';
                container.style.boxShadow = '0 15px 50px rgba(255, 215, 0, 0.3)';
            });
            container.addEventListener('mouseleave', () => {
                container.style.transform = 'scale(1)';
                container.style.boxShadow = '0 10px 40px rgba(255, 215, 0, 0.2)';
            });
            
            document.body.appendChild(container);
        }
        
        // Update content
        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <span style="font-size: 32px;">💰</span>
                <div>
                    <div style="font-size: 11px; color: #ffd700; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Repository Value
                    </div>
                    <div style="font-size: 28px; font-weight: 900; color: #ffd700; letter-spacing: -1px;">
                        ${this.formatValue(this.currentValue)}
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid rgba(255, 215, 0, 0.3);">
                <div>
                    <div style="font-size: 10px; color: rgba(255, 255, 255, 0.6); text-transform: uppercase;">Projects</div>
                    <div style="font-size: 18px; font-weight: 700; color: #4affff;">${this.projectCount}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 10px; color: rgba(255, 255, 255, 0.6); text-transform: uppercase;">Avg Value</div>
                    <div style="font-size: 18px; font-weight: 700; color: #9f7aea;">
                        ${this.formatValue(Math.round(this.currentValue / this.projectCount))}
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 215, 0, 0.3);">
                <div style="font-size: 9px; color: rgba(255, 255, 255, 0.4); display: flex; align-items: center; gap: 5px;">
                    <span>🔄</span>
                    <span>Auto-updating • Last: ${this.getTimeAgo()}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Get time ago string
     */
    getTimeAgo() {
        if (!this.lastUpdate) return 'Never';
        
        const seconds = Math.floor((new Date() - this.lastUpdate) / 1000);
        
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
    
    /**
     * Show notification when value updates
     */
    showUpdateNotification(oldValue, oldCount) {
        const valueDiff = this.currentValue - oldValue;
        const countDiff = this.projectCount - oldCount;
        
        if (valueDiff === 0 && countDiff === 0) return;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 180px;
            left: 20px;
            background: linear-gradient(135deg, rgba(16, 48, 16, 0.95), rgba(16, 32, 48, 0.95));
            border: 2px solid ${valueDiff > 0 ? '#4ade80' : '#fbbf24'};
            border-radius: 12px;
            padding: 15px 20px;
            color: white;
            z-index: 9999;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            animation: slide-in-left 0.5s ease;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 24px;">${valueDiff > 0 ? '📈' : '📊'}</span>
                <div style="font-weight: 700; color: ${valueDiff > 0 ? '#4ade80' : '#fbbf24'};">
                    Value Updated!
                </div>
            </div>
            ${countDiff !== 0 ? `
                <div style="font-size: 13px; color: rgba(255, 255, 255, 0.9); margin-bottom: 5px;">
                    ${countDiff > 0 ? '+' : ''}${countDiff} project${Math.abs(countDiff) !== 1 ? 's' : ''}
                </div>
            ` : ''}
            ${valueDiff !== 0 ? `
                <div style="font-size: 13px; color: rgba(255, 255, 255, 0.9);">
                    ${valueDiff > 0 ? '+' : ''}${this.formatValue(valueDiff)} value
                </div>
            ` : ''}
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5); margin-top: 8px;">
                New total: ${this.formatValue(this.currentValue)}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slide-in-left {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slide-in-left 0.5s ease reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 500);
        }, 5000);
    }
    
    /**
     * Get current statistics
     */
    getStats() {
        return {
            totalValue: this.currentValue,
            projectCount: this.projectCount,
            averageValue: Math.round(this.currentValue / this.projectCount),
            lastUpdate: this.lastUpdate,
            formattedValue: this.formatValue(this.currentValue),
            formattedAverage: this.formatValue(Math.round(this.currentValue / this.projectCount))
        };
    }
}

// Initialize on page load
if (typeof window !== 'undefined') {
    window.autonomousValueTracker = new AutonomousValueTracker();
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.autonomousValueTracker.init();
        });
    } else {
        window.autonomousValueTracker.init();
    }
    
    console.log('✅ Autonomous Value Tracker loaded');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutonomousValueTracker;
}
