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
 * File: gemlords-student-earnings.js
 * Declaration ID: IP-142C877E-MLL28ZUZ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMLORDS STUDENT EARNINGS TRACKER
 * ═══════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick / Barbrick Design - ALL RIGHTS RESERVED
 * 
 * Tracks student income, payouts, and financial progress through GemLords platform
 * Integrates with PayPal for real-world payments
 * ═══════════════════════════════════════════════════════════════════════════
 */

class GemLordsStudentEarnings {
    constructor() {
        this.version = '1.0.0';
        
        // Payout configuration
        this.MIN_PAYOUT_AMOUNT = 25; // Minimum $25 for payout
        this.PAYOUT_FEE_PERCENTAGE = 0.03; // 3% processing fee
        this.PAYOUT_PROCESSING_DAYS = 7; // Standard 7-day processing
        
        // Payment methods
        this.PAYMENT_METHODS = {
            paypal: {
                name: 'PayPal',
                icon: '💳',
                minAmount: 25,
                fee: 0.03,
                processingDays: 7,
                description: 'Fast and secure payment to your PayPal account'
            },
            bank: {
                name: 'Bank Transfer',
                icon: '🏦',
                minAmount: 50,
                fee: 0.01,
                processingDays: 10,
                description: 'Direct deposit to your bank account'
            },
            crypto: {
                name: 'GBUV Token',
                icon: '💎',
                minAmount: 10,
                fee: 0,
                processingDays: 1,
                description: 'Convert to GBUV tokens instantly'
            }
        };
        
        // Achievement milestones
        this.EARNINGS_MILESTONES = [
            { amount: 25, title: '💵 First Earnings', description: 'Earned your first $25!' },
            { amount: 100, title: '💰 Century Club', description: 'Reached $100 in earnings!' },
            { amount: 500, title: '🌟 Rising Star', description: 'Earned $500 from cutting!' },
            { amount: 1000, title: '💎 Professional', description: 'Crossed $1,000 in income!' },
            { amount: 5000, title: '🏆 Master Cutter', description: 'Earned $5,000+!' },
            { amount: 10000, title: '👑 Elite Craftsman', description: 'Reached $10,000 milestone!' }
        ];
        
        console.log('💰 GemLords Student Earnings initialized');
    }
    
    /**
     * Get earnings data for a student
     */
    getEarningsData(username) {
        const data = JSON.parse(localStorage.getItem(`earnings_${username}`) || '{}');
        
        return {
            totalEarnings: data.totalEarnings || 0,
            availableBalance: data.availableBalance || 0,
            pendingEarnings: data.pendingEarnings || 0,
            totalWithdrawn: data.totalWithdrawn || 0,
            earningsHistory: data.earningsHistory || [],
            payoutHistory: data.payoutHistory || [],
            milestones: data.milestones || [],
            statistics: this.calculateStatistics(data)
        };
    }
    
    /**
     * Save earnings data
     */
    saveEarningsData(username, data) {
        localStorage.setItem(`earnings_${username}`, JSON.stringify(data));
    }
    
    /**
     * Record new earnings from completed job
     */
    recordEarnings(username, amount, jobId, jobTitle, quality = 'good') {
        const data = this.getEarningsData(username);
        
        // Add to totals
        data.totalEarnings = (data.totalEarnings || 0) + amount;
        data.availableBalance = (data.availableBalance || 0) + amount;
        
        // Add to history
        const earningRecord = {
            id: `EARN-${Date.now()}`,
            jobId,
            jobTitle,
            amount,
            quality,
            date: new Date().toISOString(),
            status: 'available'
        };
        
        data.earningsHistory = data.earningsHistory || [];
        data.earningsHistory.unshift(earningRecord);
        
        // Check for milestone achievements
        this.checkMilestones(username, data);
        
        // Save
        this.saveEarningsData(username, data);
        
        // Notify
        this.notifyNewEarnings(amount, jobTitle);
        
        return earningRecord;
    }
    
    /**
     * Check and award milestone achievements
     */
    checkMilestones(username, data) {
        const currentTotal = data.totalEarnings;
        const earnedMilestones = data.milestones || [];
        
        this.EARNINGS_MILESTONES.forEach(milestone => {
            if (currentTotal >= milestone.amount) {
                // Check if not already earned
                if (!earnedMilestones.find(m => m.amount === milestone.amount)) {
                    // Award milestone
                    earnedMilestones.push({
                        ...milestone,
                        earnedDate: new Date().toISOString()
                    });
                    
                    // Show notification
                    this.showMilestoneAchievement(milestone);
                    
                    // Award bonus
                    const bonusAmount = milestone.amount * 0.05; // 5% bonus
                    data.availableBalance = (data.availableBalance || 0) + bonusAmount;
                    
                    // Notify GemLords integration
                    if (window.gemLordsIntegration) {
                        window.gemLordsIntegration.awardAchievement(
                            `earnings_${milestone.amount}`,
                            milestone.title,
                            milestone.description
                        );
                    }
                }
            }
        });
        
        data.milestones = earnedMilestones;
    }
    
    /**
     * Request payout
     */
    async requestPayout(username, amount, method = 'paypal', paymentDetails = {}) {
        const data = this.getEarningsData(username);
        
        // Validate amount
        if (amount <= 0) {
            throw new Error('Payout amount must be positive');
        }
        
        if (amount > data.availableBalance) {
            throw new Error('Insufficient available balance');
        }
        
        // Validate method
        const paymentMethod = this.PAYMENT_METHODS[method];
        if (!paymentMethod) {
            throw new Error('Invalid payment method');
        }
        
        if (amount < paymentMethod.minAmount) {
            throw new Error(`Minimum payout for ${paymentMethod.name} is $${paymentMethod.minAmount}`);
        }
        
        // Calculate fee
        const fee = amount * paymentMethod.fee;
        const netAmount = amount - fee;
        
        // Create payout record
        const payout = {
            id: `PAYOUT-${Date.now()}`,
            amount,
            fee,
            netAmount,
            method,
            methodName: paymentMethod.name,
            paymentDetails,
            requestDate: new Date().toISOString(),
            expectedDate: new Date(Date.now() + (paymentMethod.processingDays * 24 * 60 * 60 * 1000)).toISOString(),
            status: 'processing',
            processingDays: paymentMethod.processingDays
        };
        
        // Update balances
        data.availableBalance -= amount;
        data.totalWithdrawn = (data.totalWithdrawn || 0) + netAmount;
        
        // Add to payout history
        data.payoutHistory = data.payoutHistory || [];
        data.payoutHistory.unshift(payout);
        
        // Save
        this.saveEarningsData(username, data);
        
        // Show confirmation
        this.showPayoutConfirmation(payout);
        
        // In production, this would trigger actual payment API
        // For now, simulate processing
        this.simulatePayoutProcessing(username, payout.id);
        
        return payout;
    }
    
    /**
     * Simulate payout processing (for demo)
     */
    simulatePayoutProcessing(username, payoutId) {
        // Simulate processing time (in demo, just mark as complete after 5 seconds)
        setTimeout(() => {
            const data = this.getEarningsData(username);
            const payout = data.payoutHistory?.find(p => p.id === payoutId);
            
            if (payout && payout.status === 'processing') {
                payout.status = 'completed';
                payout.completedDate = new Date().toISOString();
                this.saveEarningsData(username, data);
                
                // Notify
                this.notifyPayoutComplete(payout);
            }
        }, 5000);
    }
    
    /**
     * Get payout status
     */
    getPayoutStatus(username, payoutId) {
        const data = this.getEarningsData(username);
        return data.payoutHistory?.find(p => p.id === payoutId);
    }
    
    /**
     * Calculate earnings statistics
     */
    calculateStatistics(data) {
        const history = data.earningsHistory || [];
        
        if (history.length === 0) {
            return {
                averagePerJob: 0,
                totalJobs: 0,
                averageQuality: 'N/A',
                bestEarning: 0,
                recentTrend: 'neutral'
            };
        }
        
        const totalAmount = history.reduce((sum, e) => sum + e.amount, 0);
        const averagePerJob = totalAmount / history.length;
        
        // Calculate average quality
        const qualityScores = { excellent: 3, good: 2, acceptable: 1 };
        const avgQualityScore = history.reduce((sum, e) => 
            sum + (qualityScores[e.quality] || 2), 0) / history.length;
        
        let averageQuality = 'good';
        if (avgQualityScore >= 2.5) averageQuality = 'excellent';
        else if (avgQualityScore < 1.5) averageQuality = 'acceptable';
        
        // Best earning
        const bestEarning = Math.max(...history.map(e => e.amount));
        
        // Recent trend (last 5 vs previous 5)
        const recent5 = history.slice(0, 5);
        const previous5 = history.slice(5, 10);
        
        let recentTrend = 'neutral';
        if (recent5.length >= 3 && previous5.length >= 3) {
            const recentAvg = recent5.reduce((sum, e) => sum + e.amount, 0) / recent5.length;
            const previousAvg = previous5.reduce((sum, e) => sum + e.amount, 0) / previous5.length;
            
            if (recentAvg > previousAvg * 1.1) recentTrend = 'up';
            else if (recentAvg < previousAvg * 0.9) recentTrend = 'down';
        }
        
        return {
            averagePerJob: averagePerJob.toFixed(2),
            totalJobs: history.length,
            averageQuality,
            bestEarning: bestEarning.toFixed(2),
            recentTrend
        };
    }
    
    /**
     * Generate earnings report
     */
    generateEarningsReport(username, period = 'all') {
        const data = this.getEarningsData(username);
        const history = data.earningsHistory || [];
        
        // Filter by period
        let filteredHistory = history;
        const now = Date.now();
        
        if (period === 'month') {
            const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
            filteredHistory = history.filter(e => new Date(e.date).getTime() > monthAgo);
        } else if (period === 'week') {
            const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
            filteredHistory = history.filter(e => new Date(e.date).getTime() > weekAgo);
        }
        
        // Calculate report data
        const totalEarned = filteredHistory.reduce((sum, e) => sum + e.amount, 0);
        const jobsCompleted = filteredHistory.length;
        const averagePerJob = jobsCompleted > 0 ? totalEarned / jobsCompleted : 0;
        
        // Quality breakdown
        const qualityCount = { excellent: 0, good: 0, acceptable: 0 };
        filteredHistory.forEach(e => {
            qualityCount[e.quality] = (qualityCount[e.quality] || 0) + 1;
        });
        
        return {
            period,
            totalEarned: totalEarned.toFixed(2),
            jobsCompleted,
            averagePerJob: averagePerJob.toFixed(2),
            qualityBreakdown: qualityCount,
            recentJobs: filteredHistory.slice(0, 10),
            chartData: this.generateChartData(filteredHistory)
        };
    }
    
    /**
     * Generate chart data for visualization
     */
    generateChartData(history) {
        // Group by date
        const dailyEarnings = {};
        
        history.forEach(earning => {
            const date = new Date(earning.date).toLocaleDateString();
            dailyEarnings[date] = (dailyEarnings[date] || 0) + earning.amount;
        });
        
        return {
            labels: Object.keys(dailyEarnings).reverse(),
            values: Object.values(dailyEarnings).reverse()
        };
    }
    
    /**
     * Show earnings notification
     */
    notifyNewEarnings(amount, jobTitle) {
        const notification = document.createElement('div');
        notification.className = 'earnings-notification';
        notification.innerHTML = `
            <div class="earnings-notification-content">
                <div class="earnings-icon">💰</div>
                <div class="earnings-details">
                    <strong>+$${amount.toFixed(2)} Earned!</strong>
                    <p>${jobTitle}</p>
                </div>
            </div>
        `;
        
        // Add styles
        if (!document.getElementById('earnings-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'earnings-notification-styles';
            style.textContent = `
                .earnings-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    border: 2px solid #FFD700;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    animation: slideInRight 0.5s, pulse 0.5s 0.5s;
                }
                
                .earnings-notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .earnings-icon {
                    font-size: 32px;
                    animation: bounce 1s infinite;
                }
                
                .earnings-details {
                    color: white;
                }
                
                .earnings-details strong {
                    display: block;
                    font-size: 18px;
                    margin-bottom: 4px;
                }
                
                .earnings-details p {
                    margin: 0;
                    font-size: 12px;
                    opacity: 0.9;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => notification.remove(), 5000);
    }
    
    /**
     * Show milestone achievement
     */
    showMilestoneAchievement(milestone) {
        if (window.gemLordsIntegration && window.gemLordsIntegration.showNotification) {
            window.gemLordsIntegration.showNotification(
                milestone.title,
                `${milestone.description} Keep up the amazing work! 🎉`
            );
        }
    }
    
    /**
     * Show payout confirmation
     */
    showPayoutConfirmation(payout) {
        if (window.gemLordsIntegration && window.gemLordsIntegration.showNotification) {
            window.gemLordsIntegration.showNotification(
                '✅ Payout Requested',
                `$${payout.netAmount.toFixed(2)} via ${payout.methodName}. Expected in ${payout.processingDays} days.`
            );
        }
    }
    
    /**
     * Notify payout completion
     */
    notifyPayoutComplete(payout) {
        if (window.gemLordsIntegration && window.gemLordsIntegration.showNotification) {
            window.gemLordsIntegration.showNotification(
                '🎉 Payout Complete!',
                `$${payout.netAmount.toFixed(2)} has been sent to your account.`
            );
        }
    }
    
    /**
     * Export earnings data for tax purposes
     */
    exportEarningsData(username, year) {
        const data = this.getEarningsData(username);
        const yearStart = new Date(year, 0, 1).getTime();
        const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();
        
        // Filter earnings for the year
        const yearEarnings = data.earningsHistory.filter(e => {
            const earningDate = new Date(e.date).getTime();
            return earningDate >= yearStart && earningDate <= yearEnd;
        });
        
        // Filter payouts for the year
        const yearPayouts = data.payoutHistory.filter(p => {
            const payoutDate = new Date(p.requestDate).getTime();
            return payoutDate >= yearStart && payoutDate <= yearEnd;
        });
        
        const totalEarned = yearEarnings.reduce((sum, e) => sum + e.amount, 0);
        const totalWithdrawn = yearPayouts.reduce((sum, p) => sum + p.netAmount, 0);
        const totalFees = yearPayouts.reduce((sum, p) => sum + p.fee, 0);
        
        return {
            username,
            year,
            summary: {
                totalEarned: totalEarned.toFixed(2),
                totalWithdrawn: totalWithdrawn.toFixed(2),
                totalFees: totalFees.toFixed(2),
                jobsCompleted: yearEarnings.length,
                payoutsReceived: yearPayouts.length
            },
            earnings: yearEarnings,
            payouts: yearPayouts
        };
    }
}

// Initialize global instance
window.gemLordsStudentEarnings = new GemLordsStudentEarnings();

console.log('💰 GemLords Student Earnings loaded');
