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
 * File: warehouse-ai-helper.js
 * Declaration ID: IP-26C4FEEE-MLL28ZVC
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Warehouse AI Helper
 * Provides intelligent assistance for scanning and inventory management
 */

class WarehouseAIHelper {
    constructor() {
        this.enabled = true;
        this.helpQueue = [];
        this.currentHelp = null;
        this.conversationHistory = [];
        
        // Voice synthesis
        this.speechSynthesis = window.speechSynthesis;
        this.voice = null;
        this.voiceEnabled = true;
        
        // Initialize voice
        this.initVoice();
        
        // Scanning tips
        this.scanningTips = [
            "Hold your phone steady for better detection",
            "Ensure good lighting for accurate identification",
            "Scan items one at a time for best results",
            "Barcodes should be centered in the frame",
            "For stacked items, scan each tier separately"
        ];
        
        // Item identification tips
        this.identificationTips = {
            computer: "Look for model stickers on the case (usually on top or side)",
            laptop: "Check the bottom panel for model information",
            printer: "Model numbers are usually on the front or top panel",
            monitor: "Check the back panel for model stickers",
            server: "Look for service tag on front panel or pull-out tab"
        };
    }

    /**
     * Initialize voice synthesis
     */
    initVoice() {
        if (!this.speechSynthesis) {
            console.log('Voice synthesis not supported');
            return;
        }

        // Wait for voices to load
        const setVoice = () => {
            const voices = this.speechSynthesis.getVoices();
            // Prefer English voices
            this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        };

        setVoice();
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = setVoice;
        }
    }

    /**
     * Provide help message
     */
    help(message, options = {}) {
        if (!this.enabled) return;

        const helpMessage = {
            text: message,
            type: options.type || 'info', // info, tip, warning, success
            priority: options.priority || 'normal', // low, normal, high
            duration: options.duration || 5000,
            speak: options.speak !== false,
            timestamp: new Date().toISOString()
        };

        // Add to queue or display immediately based on priority
        if (options.priority === 'high' || !this.currentHelp) {
            this.displayHelp(helpMessage);
        } else {
            this.helpQueue.push(helpMessage);
        }

        // Add to conversation history
        this.conversationHistory.push(helpMessage);
    }

    /**
     * Display help message
     */
    displayHelp(helpMessage) {
        this.currentHelp = helpMessage;

        // Trigger UI update
        if (window.WarehouseScannerUI) {
            window.WarehouseScannerUI.showAIHelper(helpMessage);
        }

        // Speak the message if enabled
        if (helpMessage.speak && this.voiceEnabled) {
            this.speak(helpMessage.text);
        }

        // Auto-hide after duration
        setTimeout(() => {
            this.hideHelp();
            this.showNextHelp();
        }, helpMessage.duration);
    }

    /**
     * Hide current help message
     */
    hideHelp() {
        this.currentHelp = null;
        if (window.WarehouseScannerUI) {
            window.WarehouseScannerUI.hideAIHelper();
        }
    }

    /**
     * Show next queued help message
     */
    showNextHelp() {
        if (this.helpQueue.length > 0 && !this.currentHelp) {
            const nextHelp = this.helpQueue.shift();
            this.displayHelp(nextHelp);
        }
    }

    /**
     * Speak text using voice synthesis
     */
    speak(text) {
        if (!this.speechSynthesis || !this.voiceEnabled) return;

        // Cancel any ongoing speech
        this.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) {
            utterance.voice = this.voice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;

        this.speechSynthesis.speak(utterance);
    }

    /**
     * Provide context-aware help based on situation
     */
    provideContextualHelp(context) {
        switch (context.situation) {
            case 'starting_scan':
                this.help("Ready to scan! Point your camera at an item.", { 
                    type: 'info',
                    priority: 'normal' 
                });
                break;

            case 'no_detection':
                this.help("No items detected. Try adjusting the angle or lighting.", {
                    type: 'tip',
                    priority: 'low'
                });
                break;

            case 'item_detected':
                const category = context.category || 'item';
                const tip = this.identificationTips[category];
                if (tip) {
                    this.help(tip, { type: 'tip', priority: 'normal' });
                }
                break;

            case 'low_confidence':
                this.help("Detection confidence is low. Try getting closer or improving lighting.", {
                    type: 'warning',
                    priority: 'normal'
                });
                break;

            case 'multiple_items':
                this.help("Multiple items detected. Focus on one item at a time for better accuracy.", {
                    type: 'tip',
                    priority: 'normal'
                });
                break;

            case 'item_added':
                const value = context.value || 0;
                this.help(`Item added! Estimated value: $${value.toLocaleString()}`, {
                    type: 'success',
                    priority: 'high'
                });
                break;

            case 'high_value_item':
                this.help("High-value item detected! Double-check details before confirming.", {
                    type: 'warning',
                    priority: 'high'
                });
                break;

            case 'session_complete':
                const stats = context.stats || {};
                this.help(`Session complete! Scanned ${stats.count || 0} items worth $${(stats.value || 0).toLocaleString()}`, {
                    type: 'success',
                    priority: 'high'
                });
                break;
        }
    }

    /**
     * Suggest next action
     */
    suggestNextAction(inventoryState) {
        const suggestions = [];

        // Check for pending locations
        const unscannedLocations = inventoryState.locations?.filter(loc => !loc.scanned) || [];
        if (unscannedLocations.length > 0) {
            suggestions.push({
                action: 'scan_location',
                priority: 'high',
                message: `${unscannedLocations.length} locations still need scanning`,
                data: unscannedLocations[0]
            });
        }

        // Check for low-value items that might need re-evaluation
        const lowValueItems = inventoryState.items?.filter(item => item.value < 50) || [];
        if (lowValueItems.length > 5) {
            suggestions.push({
                action: 'review_valuations',
                priority: 'medium',
                message: `${lowValueItems.length} items have low estimated values. Consider reviewing.`,
                data: lowValueItems.slice(0, 5)
            });
        }

        // Check for items without images
        const noImageItems = inventoryState.items?.filter(item => !item.imageData) || [];
        if (noImageItems.length > 0) {
            suggestions.push({
                action: 'capture_images',
                priority: 'medium',
                message: `${noImageItems.length} items need photos`,
                data: noImageItems[0]
            });
        }

        // Check for high-value clusters
        const highValueLocations = this.findHighValueClusters(inventoryState.items || []);
        if (highValueLocations.length > 0) {
            suggestions.push({
                action: 'secure_high_value',
                priority: 'high',
                message: `Found ${highValueLocations.length} locations with high-value concentrations`,
                data: highValueLocations
            });
        }

        return suggestions.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * Find clusters of high-value items
     */
    findHighValueClusters(items) {
        const locationValues = {};

        items.forEach(item => {
            const location = item.location || 'Unknown';
            if (!locationValues[location]) {
                locationValues[location] = 0;
            }
            locationValues[location] += item.value * (item.quantity || 1);
        });

        return Object.entries(locationValues)
            .filter(([_, value]) => value > 5000)
            .map(([location, value]) => ({ location, value }))
            .sort((a, b) => b.value - a.value);
    }

    /**
     * Provide scanning tips
     */
    getRandomTip() {
        const tips = [
            ...this.scanningTips,
            "Save time by scanning barcodes when available",
            "Group similar items together for faster processing",
            "Take photos of unusual or valuable items for documentation",
            "Update locations in real-time for accurate tracking",
            "Review and edit items before ending your session"
        ];

        return tips[Math.floor(Math.random() * tips.length)];
    }

    /**
     * Analyze scanning efficiency
     */
    analyzeEfficiency(sessionData) {
        const {
            itemsScanned = 0,
            timeElapsed = 0, // in seconds
            errorsEncountered = 0
        } = sessionData;

        const itemsPerMinute = timeElapsed > 0 ? (itemsScanned / (timeElapsed / 60)).toFixed(1) : 0;
        const errorRate = itemsScanned > 0 ? ((errorsEncountered / itemsScanned) * 100).toFixed(1) : 0;

        let efficiency = 'good';
        let suggestions = [];

        if (itemsPerMinute < 5) {
            efficiency = 'needs improvement';
            suggestions.push("Try scanning barcodes when available to speed up the process");
            suggestions.push("Position items in better lighting for faster detection");
        }

        if (errorRate > 10) {
            efficiency = 'needs improvement';
            suggestions.push("High error rate detected. Ensure items are clearly visible");
            suggestions.push("Double-check item details before confirming");
        }

        return {
            efficiency,
            itemsPerMinute,
            errorRate,
            suggestions
        };
    }

    /**
     * Generate inventory insights
     */
    generateInsights(inventoryData) {
        const insights = [];

        // Total value insight
        const totalValue = inventoryData.totalValue || 0;
        if (totalValue > 100000) {
            insights.push({
                type: 'milestone',
                icon: '🎉',
                message: `Warehouse inventory exceeds $${(totalValue / 1000).toFixed(0)}K!`
            });
        }

        // Category distribution
        const categories = inventoryData.byCategory || {};
        const topCategory = Object.entries(categories)
            .sort((a, b) => b[1].value - a[1].value)[0];
        
        if (topCategory) {
            insights.push({
                type: 'info',
                icon: '📊',
                message: `${topCategory[0]}s represent ${((topCategory[1].value / totalValue) * 100).toFixed(0)}% of total value`
            });
        }

        // Condition insights
        const conditions = inventoryData.byCondition || {};
        const excellentCount = conditions.excellent || 0;
        const totalCount = Object.values(conditions).reduce((sum, count) => sum + count, 0);
        
        if (excellentCount / totalCount > 0.5) {
            insights.push({
                type: 'positive',
                icon: '⭐',
                message: `${((excellentCount / totalCount) * 100).toFixed(0)}% of items are in excellent condition`
            });
        }

        return insights;
    }

    /**
     * Voice command parser
     */
    parseVoiceCommand(command) {
        const commandLower = command.toLowerCase();

        const commands = {
            'start scan': { action: 'start_scan' },
            'stop scan': { action: 'stop_scan' },
            'capture': { action: 'capture_item' },
            'show inventory': { action: 'show_inventory' },
            'export data': { action: 'export_data' },
            'help': { action: 'show_help' },
            'next tip': { action: 'show_tip' }
        };

        for (const [phrase, config] of Object.entries(commands)) {
            if (commandLower.includes(phrase)) {
                return config;
            }
        }

        return { action: 'unknown', originalCommand: command };
    }

    /**
     * Enable/disable voice
     */
    setVoiceEnabled(enabled) {
        this.voiceEnabled = enabled;
        if (!enabled && this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Get help statistics
     */
    getStats() {
        return {
            totalHelps: this.conversationHistory.length,
            byType: this.conversationHistory.reduce((acc, help) => {
                acc[help.type] = (acc[help.type] || 0) + 1;
                return acc;
            }, {}),
            queueLength: this.helpQueue.length,
            voiceEnabled: this.voiceEnabled
        };
    }
}

// Create global instance
const aiHelper = new WarehouseAIHelper();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WarehouseAIHelper;
}
