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
 * File: live-activity-feed.js
 * Declaration ID: IP-56115664-MLL28ZVE
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Live Activity Feed - Real-Time Site Activity Display
 * Shows agent actions, user interactions, errors, and system events
 * Visible to all players for transparency and engagement
 * 
 * Features:
 * - Real-time activity logging
 * - Agent action tracking
 * - User interaction display
 * - Error visibility
 * - Auto-scroll and fade
 * - Color-coded messages
 * - Timestamp display
 * 
 * @author Ryan Barbrick / Barbrick Design
 */

class LiveActivityFeed {
    constructor() {
        this.activities = [];
        this.maxActivities = 100;
        this.displayCount = 10;
        this.feedElement = null;
        this.updateInterval = null;
        this.autoScroll = true;
        
        this.colors = {
            'USER': '#4affff',      // Cyan - User actions
            'AGENT': '#ffd700',     // Gold - Agent actions
            'MERLIN': '#9f7aea',    // Purple - Merlin AI
            'SYSTEM': '#4ade80',    // Green - System events
            'ERROR': '#ff6b6b',     // Red - Errors
            'TRADE': '#fbbf24',     // Amber - Trading
            'LEVEL': '#a78bfa',     // Light purple - Level ups
            'GAME': '#60a5fa',      // Blue - Game events
            'WALLET': '#34d399',    // Emerald - Wallet transactions
            'ACHIEVEMENT': '#fb923c' // Orange - Achievements
        };
        
        this.init();
    }
    
    init() {
        this.createFeedUI();
        this.startUpdateCycle();
        console.log('📡 Live Activity Feed initialized');
        
        // Welcome message
        this.log('SYSTEM', 'Live Activity Feed initialized - Showing real-time site activity');
        
        // Connect to existing systems
        this.connectToAgentLogger();
        this.connectToErrorHandler();
        
        // Global access
        window.liveActivityFeed = this;
    }
    
    createFeedUI() {
        // Create floating feed panel
        const feedContainer = document.createElement('div');
        feedContainer.id = 'live-activity-feed';
        feedContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 350px;
            min-width: 250px;
            max-width: 500px;
            height: 300px;
            min-height: 150px;
            max-height: 500px;
            background: rgba(26, 31, 58, 0.95);
            border: 2px solid rgba(74, 255, 255, 0.5);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            z-index: 50000;
            font-family: 'Courier New', monospace;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
            resize: both;
            display: flex;
            flex-direction: column;
        `;
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(159, 122, 234, 0.8));
            padding: 10px 15px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #fff;
            border-bottom: 1px solid rgba(74, 255, 255, 0.3);
        `;
        header.innerHTML = `
            <span>📡 Live Activity</span>
            <div style="display: flex; gap: 8px;">
                <button id="activityFeedToggleScroll" style="background: none; border: none; color: #4affff; cursor: pointer; font-size: 14px;" title="Toggle Auto-Scroll">
                    📜
                </button>
                <button id="activityFeedClear" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 14px;" title="Clear Feed">
                    🗑️
                </button>
                <button id="activityFeedMinimize" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 16px;" title="Minimize">
                    _
                </button>
            </div>
        `;
        
        // Feed content
        const content = document.createElement('div');
        content.id = 'activity-feed-content';
        content.style.cssText = `
            padding: 10px;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            font-size: 11px;
            line-height: 1.4;
        `;
        
        // Custom scrollbar
        content.innerHTML = `
            <style>
                #activity-feed-content::-webkit-scrollbar {
                    width: 8px;
                }
                #activity-feed-content::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 4px;
                }
                #activity-feed-content::-webkit-scrollbar-thumb {
                    background: rgba(74, 255, 255, 0.5);
                    border-radius: 4px;
                }
                #activity-feed-content::-webkit-scrollbar-thumb:hover {
                    background: rgba(74, 255, 255, 0.7);
                }
                .activity-item {
                    margin-bottom: 8px;
                    padding: 6px 8px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 6px;
                    border-left: 3px solid;
                    animation: slideIn 0.3s ease;
                    opacity: 0.9;
                    transition: opacity 0.3s;
                }
                .activity-item:hover {
                    opacity: 1;
                    background: rgba(0, 0, 0, 0.5);
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 0.9;
                    }
                }
                .activity-timestamp {
                    font-size: 9px;
                    opacity: 0.6;
                    margin-right: 6px;
                }
                .activity-type {
                    font-weight: bold;
                    margin-right: 6px;
                }
                .activity-message {
                    color: #ddd;
                }
                #live-activity-feed.minimized {
                    max-height: 50px;
                }
                #live-activity-feed.minimized #activity-feed-content {
                    display: none;
                }
            </style>
        `;
        
        feedContainer.appendChild(header);
        feedContainer.appendChild(content);
        document.body.appendChild(feedContainer);
        
        this.feedElement = content;
        
        // Event listeners
        document.getElementById('activityFeedMinimize').addEventListener('click', () => {
            feedContainer.classList.toggle('minimized');
            const btn = document.getElementById('activityFeedMinimize');
            btn.textContent = feedContainer.classList.contains('minimized') ? '□' : '_';
        });
        
        document.getElementById('activityFeedClear').addEventListener('click', () => {
            this.clearFeed();
        });
        
        document.getElementById('activityFeedToggleScroll').addEventListener('click', () => {
            this.autoScroll = !this.autoScroll;
            const btn = document.getElementById('activityFeedToggleScroll');
            btn.style.opacity = this.autoScroll ? '1' : '0.5';
        });
    }
    
    log(type, message, data = {}) {
        const activity = {
            type: type.toUpperCase(),
            message,
            data,
            timestamp: Date.now(),
            displayTime: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: false 
            })
        };
        
        this.activities.unshift(activity);
        
        // Limit activities
        if (this.activities.length > this.maxActivities) {
            this.activities = this.activities.slice(0, this.maxActivities);
        }
        
        // Update display
        this.updateDisplay();
        
        // Also log to console for debugging
        const color = this.colors[activity.type] || '#fff';
        console.log(`%c[${activity.displayTime}] ${activity.type}: ${message}`, `color: ${color}`);
        
        return activity;
    }
    
    updateDisplay() {
        if (!this.feedElement) return;
        
        const displayActivities = this.activities.slice(0, this.displayCount);
        
        this.feedElement.innerHTML = displayActivities.map(activity => {
            const color = this.colors[activity.type] || '#fff';
            return `
                <div class="activity-item" style="border-left-color: ${color};">
                    <span class="activity-timestamp">${activity.displayTime}</span>
                    <span class="activity-type" style="color: ${color};">[${activity.type}]</span>
                    <span class="activity-message">${this.escapeHtml(activity.message)}</span>
                </div>
            `;
        }).join('');
        
        // Auto-scroll to top
        if (this.autoScroll) {
            this.feedElement.scrollTop = 0;
        }
    }
    
    clearFeed() {
        this.activities = [];
        this.updateDisplay();
        this.log('SYSTEM', 'Activity feed cleared');
    }
    
    startUpdateCycle() {
        // Update display every 5 seconds to show relative times
        this.updateInterval = setInterval(() => {
            // Clean old activities (older than 1 hour)
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            this.activities = this.activities.filter(a => a.timestamp > oneHourAgo);
        }, 5000);
    }
    
    connectToAgentLogger() {
        // Connect to AI agent logger if available (check both naming conventions)
        const logger = window.AIAgentLogger || window.aiAgentLogger;
        if (logger) {
            const originalLog = logger.log.bind(logger);
            logger.log = (agentId, entry) => {
                originalLog(agentId, entry);
                
                // Show in live feed
                if (entry.action && entry.action !== 'idle') {
                    const agentName = window.aiAgentPlayers?.agents?.find(a => a.id === agentId)?.name || `Agent ${agentId}`;
                    this.log('AGENT', `${agentName}: ${entry.action}`, { agentId, entry });
                }
            };
        }
    }
    
    connectToErrorHandler() {
        // Connect to global error handler
        const originalOnError = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
            if (originalOnError) {
                originalOnError(message, source, lineno, colno, error);
            }
            
            // Show error in feed
            const errorMsg = typeof message === 'string' ? message : String(message);
            const shortMsg = errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg;
            this.log('ERROR', shortMsg, { source, lineno, colno });
            
            return false;
        };
        
        // Also catch promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason?.message || String(event.reason);
            const shortMsg = reason.length > 100 ? reason.substring(0, 100) + '...' : reason;
            this.log('ERROR', `Promise: ${shortMsg}`);
        });
    }
    
    // Helper methods for different activity types
    logUserAction(action, details = '') {
        this.log('USER', `${action}${details ? ': ' + details : ''}`);
    }
    
    logAgentAction(agentName, action) {
        this.log('AGENT', `${agentName}: ${action}`);
    }
    
    logTrade(details) {
        this.log('TRADE', details);
    }
    
    logLevelUp(playerName, level) {
        this.log('LEVEL', `${playerName} reached Level ${level}! 🎉`);
    }
    
    logGameEvent(event) {
        this.log('GAME', event);
    }
    
    logWalletActivity(activity) {
        this.log('WALLET', activity);
    }
    
    logAchievement(playerName, achievement) {
        this.log('ACHIEVEMENT', `${playerName} earned: ${achievement} 🏆`);
    }
    
    logError(error) {
        const errorMsg = typeof error === 'string' ? error : (error.message || String(error));
        this.log('ERROR', errorMsg);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        const element = document.getElementById('live-activity-feed');
        if (element) {
            element.remove();
        }
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LiveActivityFeed();
    });
} else {
    new LiveActivityFeed();
}

// Test activities for demonstration
setTimeout(() => {
    if (window.liveActivityFeed) {
        window.liveActivityFeed.log('SYSTEM', 'All systems operational');
        
        // Simulate some activities every few minutes
        setInterval(() => {
            const activities = [
                { type: 'AGENT', msg: 'AI Agent scanning marketplace...' },
                { type: 'SYSTEM', msg: 'Performance check: 98% optimal' },
                { type: 'GAME', msg: 'New gem discovered: Mystic Sapphire' }
            ];
            
            const activity = activities[Math.floor(Math.random() * activities.length)];
            window.liveActivityFeed.log(activity.type, activity.msg);
        }, 120000); // Every 2 minutes
    }
}, 2000);
