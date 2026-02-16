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
 * File: gembot-gemlords-integration.js
 * Declaration ID: IP-1EF7B84C-MLL28ZUW
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMBOT GEMLORDS INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick / Barbrick Design - ALL RIGHTS RESERVED
 * 
 * Connects the GemBot Universe (Academy + Farm Game) with the GemLords
 * real-world gemstone investment platform to enable students to earn income
 * from their learned skills.
 * 
 * Features:
 * - Real-world job marketplace for trained students
 * - Learning progress → professional certification
 * - Virtual practice → real job qualifications
 * - Income tracking and PayPal payouts
 * - Portfolio building system
 * ═══════════════════════════════════════════════════════════════════════════
 */

class GemBotGemLordsIntegration {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        
        // GemLords API endpoint (embedded iframe or direct integration)
        this.gemLordsBaseUrl = 'https://barbrickdesign.github.io/gemLords.html';
        this.paypalEmail = 'barbrickdesign@gmail.com';
        
        // Student status levels
        this.STUDENT_LEVELS = {
            beginner: { minLessons: 0, maxJobValue: 50, discount: 0.3 },
            intermediate: { minLessons: 5, maxJobValue: 200, discount: 0.2 },
            advanced: { minLessons: 10, maxJobValue: 500, discount: 0.1 },
            professional: { minLessons: 20, maxJobValue: Infinity, discount: 0 }
        };
        
        // Job categories matched to academy courses
        this.JOB_CATEGORIES = {
            'basics': ['Cabochon', 'Simple Round', 'Basic Polish'],
            'cutting_fundamentals': ['Faceted Round', 'Oval', 'Step Cut'],
            'polishing_mastery': ['High Polish', 'Mirror Finish', 'Premium Stones'],
            'advanced_designs': ['Custom Facets', 'Fantasy Cuts', 'Precision Work']
        };
        
        console.log('💎 GemBot-GemLords Integration initialized');
    }
    
    /**
     * Initialize the integration system
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            // Check dependencies
            if (!window.GemBotAcademy) {
                console.warn('⚠️ GemBotAcademy not loaded - some features disabled');
            }
            
            if (!window.GemBotFarmGame) {
                console.warn('⚠️ GemBotFarmGame not loaded - some features disabled');
            }
            
            // Load student data
            this.loadStudentData();
            
            // Initialize UI components
            this.createDashboardPanel();
            
            this.initialized = true;
            console.log('✅ GemBot-GemLords Integration ready');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize GemLords integration:', error);
            return false;
        }
    }
    
    /**
     * Load student progress and earnings data
     */
    loadStudentData() {
        const username = this.getCurrentUsername();
        
        // Load or initialize student profile
        const profile = JSON.parse(localStorage.getItem(`gemlords_profile_${username}`) || '{}');
        
        this.studentProfile = {
            username: username,
            certifications: profile.certifications || [],
            completedJobs: profile.completedJobs || [],
            totalEarnings: profile.totalEarnings || 0,
            pendingPayouts: profile.pendingPayouts || 0,
            portfolio: profile.portfolio || [],
            rating: profile.rating || 0,
            reviews: profile.reviews || [],
            joinedDate: profile.joinedDate || Date.now(),
            ...profile
        };
        
        return this.studentProfile;
    }
    
    /**
     * Save student data
     */
    saveStudentData() {
        const username = this.getCurrentUsername();
        localStorage.setItem(`gemlords_profile_${username}`, JSON.stringify(this.studentProfile));
    }
    
    /**
     * Get current username from system
     */
    getCurrentUsername() {
        // Try multiple sources
        if (window.currentUser && window.currentUser.username) {
            return window.currentUser.username;
        }
        if (window.GemBotFarmGame && window.GemBotFarmGame.state && window.GemBotFarmGame.state.player) {
            return window.GemBotFarmGame.state.player.username || 'Guest';
        }
        return localStorage.getItem('gembot_username') || 'Guest';
    }
    
    /**
     * Get student qualification level based on academy progress
     */
    getStudentLevel(username) {
        if (!window.GemBotAcademy) {
            return 'beginner';
        }
        
        const academy = window.GemBotAcademy;
        const completedLessons = academy.player?.completedLessons?.length || 0;
        
        if (completedLessons >= 20) return 'professional';
        if (completedLessons >= 10) return 'advanced';
        if (completedLessons >= 5) return 'intermediate';
        return 'beginner';
    }
    
    /**
     * Get available jobs for student based on qualifications
     */
    async getAvailableJobs() {
        const level = this.getStudentLevel();
        const levelData = this.STUDENT_LEVELS[level];
        
        // Get qualified job categories
        const qualifiedCategories = [];
        if (window.GemBotAcademy) {
            const unlockedCourses = window.GemBotAcademy.player?.unlockedCourses || ['basics'];
            unlockedCourses.forEach(course => {
                if (this.JOB_CATEGORIES[course]) {
                    qualifiedCategories.push(...this.JOB_CATEGORIES[course]);
                }
            });
        }
        
        // Return filtered jobs
        return {
            level,
            maxJobValue: levelData.maxJobValue,
            discount: levelData.discount,
            qualifiedCategories,
            recommendedJobs: this.getRecommendedJobs(level, qualifiedCategories)
        };
    }
    
    /**
     * Get recommended jobs based on student level
     */
    getRecommendedJobs(level, qualifiedCategories) {
        // Sample jobs - in production this would fetch from GemLords API
        const allJobs = [
            {
                id: 'JOB-001',
                title: 'Polish 5ct Amethyst Cabochon',
                stoneType: 'Quartz (Amethyst)',
                difficulty: 'beginner',
                estimatedPay: 25,
                estimatedHours: 2,
                skills: ['Basic Polish', 'Cabochon'],
                description: 'Simple cabochon polishing, perfect for beginners'
            },
            {
                id: 'JOB-002',
                title: 'Facet 3ct Sapphire - Round Brilliant',
                stoneType: 'Sapphire',
                difficulty: 'intermediate',
                estimatedPay: 120,
                estimatedHours: 8,
                skills: ['Faceted Round', 'High Polish'],
                description: 'Standard round brilliant cut with mirror polish'
            },
            {
                id: 'JOB-003',
                title: 'Custom Fantasy Cut - 8ct Tourmaline',
                stoneType: 'Tourmaline',
                difficulty: 'advanced',
                estimatedPay: 450,
                estimatedHours: 16,
                skills: ['Custom Facets', 'Fantasy Cuts', 'Premium Stones'],
                description: 'Complex custom design requiring precision work'
            }
        ];
        
        // Filter jobs by level and qualifications
        return allJobs.filter(job => {
            const levelMatch = this.jobMatchesLevel(job.difficulty, level);
            const skillMatch = job.skills.some(skill => qualifiedCategories.includes(skill));
            return levelMatch && skillMatch;
        });
    }
    
    /**
     * Check if job difficulty matches student level
     */
    jobMatchesLevel(jobDifficulty, studentLevel) {
        const hierarchy = ['beginner', 'intermediate', 'advanced', 'professional'];
        const jobIndex = hierarchy.indexOf(jobDifficulty);
        const studentIndex = hierarchy.indexOf(studentLevel);
        
        // Students can take jobs at their level or below
        return studentIndex >= jobIndex;
    }
    
    /**
     * Apply for a job
     */
    async applyForJob(jobId) {
        try {
            const level = this.getStudentLevel();
            const jobs = await this.getAvailableJobs();
            const job = jobs.recommendedJobs.find(j => j.id === jobId);
            
            if (!job) {
                throw new Error('Job not found or not qualified');
            }
            
            // Add to pending applications
            this.studentProfile.pendingApplications = this.studentProfile.pendingApplications || [];
            this.studentProfile.pendingApplications.push({
                jobId: job.id,
                jobTitle: job.title,
                appliedDate: Date.now(),
                status: 'pending',
                estimatedPay: job.estimatedPay
            });
            
            this.saveStudentData();
            
            // Show success notification
            this.showNotification('✅ Application Submitted', 
                `You've applied for: ${job.title}. You'll be notified when accepted!`);
            
            return true;
        } catch (error) {
            console.error('Failed to apply for job:', error);
            this.showNotification('❌ Application Failed', error.message);
            return false;
        }
    }
    
    /**
     * Complete a job and record earnings
     */
    async completeJob(jobId, quality = 'good') {
        try {
            // Find the job in pending applications
            const appIndex = this.studentProfile.pendingApplications?.findIndex(a => a.jobId === jobId);
            
            if (appIndex === -1) {
                throw new Error('Job not found in applications');
            }
            
            const application = this.studentProfile.pendingApplications[appIndex];
            
            // Calculate earnings based on quality
            const qualityMultiplier = {
                'excellent': 1.2,
                'good': 1.0,
                'acceptable': 0.8
            };
            
            const earnings = application.estimatedPay * (qualityMultiplier[quality] || 1.0);
            
            // Move to completed jobs
            const completedJob = {
                ...application,
                completedDate: Date.now(),
                actualEarnings: earnings,
                quality,
                status: 'completed'
            };
            
            this.studentProfile.completedJobs.push(completedJob);
            this.studentProfile.totalEarnings += earnings;
            this.studentProfile.pendingPayouts += earnings;
            
            // Remove from pending
            this.studentProfile.pendingApplications.splice(appIndex, 1);
            
            // Add to portfolio
            this.addToPortfolio(completedJob);
            
            // Award achievement if first job
            if (this.studentProfile.completedJobs.length === 1) {
                this.awardAchievement('first_real_job', '🎉 First Real Job!', 'Completed your first paid gemstone cutting job');
            }
            
            this.saveStudentData();
            
            // Show success notification
            this.showNotification('💰 Job Completed!', 
                `Earned $${earnings.toFixed(2)}! Quality: ${quality}`);
            
            // Update UI
            this.updateDashboard();
            
            return earnings;
        } catch (error) {
            console.error('Failed to complete job:', error);
            return 0;
        }
    }
    
    /**
     * Add completed job to portfolio
     */
    addToPortfolio(job) {
        this.studentProfile.portfolio.push({
            id: `PORT-${Date.now()}`,
            jobId: job.jobId,
            title: job.jobTitle,
            date: job.completedDate,
            earnings: job.actualEarnings,
            quality: job.quality,
            images: [] // Could add photos of completed work
        });
    }
    
    /**
     * Request payout
     */
    async requestPayout() {
        if (this.studentProfile.pendingPayouts <= 0) {
            this.showNotification('⚠️ No Pending Payouts', 'You need to complete jobs first!');
            return false;
        }
        
        // In production, this would trigger actual PayPal payout
        // For now, we'll simulate it
        const amount = this.studentProfile.pendingPayouts;
        
        this.studentProfile.payoutHistory = this.studentProfile.payoutHistory || [];
        this.studentProfile.payoutHistory.push({
            id: `PAYOUT-${Date.now()}`,
            amount,
            requestDate: Date.now(),
            status: 'processing',
            paypalEmail: this.paypalEmail,
            expectedDate: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        });
        
        this.studentProfile.pendingPayouts = 0;
        this.saveStudentData();
        
        this.showNotification('✅ Payout Requested', 
            `$${amount.toFixed(2)} will be sent to ${this.paypalEmail} within 7 days`);
        
        this.updateDashboard();
        return true;
    }
    
    /**
     * Award achievement
     */
    awardAchievement(id, title, description) {
        this.studentProfile.achievements = this.studentProfile.achievements || [];
        
        if (!this.studentProfile.achievements.find(a => a.id === id)) {
            this.studentProfile.achievements.push({
                id,
                title,
                description,
                awardedDate: Date.now()
            });
            
            this.saveStudentData();
            this.showNotification('🏆 Achievement Unlocked!', `${title}: ${description}`);
        }
    }
    
    /**
     * Create dashboard panel in main UI
     */
    createDashboardPanel() {
        // Check if panel already exists
        if (document.getElementById('gemlords-dashboard')) {
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = 'gemlords-dashboard';
        panel.className = 'gemlords-panel';
        panel.innerHTML = `
            <div class="gemlords-header">
                <h3>💎 Real Job Marketplace</h3>
                <button class="gemlords-toggle" onclick="gemLordsIntegration.togglePanel()">
                    <span id="gemlords-toggle-icon">▼</span>
                </button>
            </div>
            <div id="gemlords-content" class="gemlords-content">
                <div class="gemlords-stats">
                    <div class="stat-card">
                        <div class="stat-label">Total Earned</div>
                        <div class="stat-value" id="gemlords-total-earned">$0.00</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Pending Payout</div>
                        <div class="stat-value" id="gemlords-pending">$0.00</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Jobs Completed</div>
                        <div class="stat-value" id="gemlords-jobs">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Student Level</div>
                        <div class="stat-value" id="gemlords-level">Beginner</div>
                    </div>
                </div>
                <div class="gemlords-actions">
                    <button onclick="gemLordsIntegration.showJobMarketplace()" class="btn-primary">
                        🔍 Browse Jobs
                    </button>
                    <button onclick="gemLordsIntegration.requestPayout()" class="btn-success">
                        💰 Request Payout
                    </button>
                    <button onclick="gemLordsIntegration.viewPortfolio()" class="btn-info">
                        📁 My Portfolio
                    </button>
                </div>
                <div id="gemlords-jobs-list" class="gemlords-jobs-list"></div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
        
        // Find appropriate container (after profile menu or in sidebar)
        const container = document.querySelector('.profile-menu') || 
                         document.querySelector('#rightPanel') ||
                         document.body;
        
        if (container === document.body) {
            // Create a fixed position panel if no suitable container
            panel.style.position = 'fixed';
            panel.style.bottom = '20px';
            panel.style.right = '20px';
            panel.style.zIndex = '9999';
        }
        
        container.appendChild(panel);
        
        // Initial update
        this.updateDashboard();
    }
    
    /**
     * Add CSS styles for the dashboard
     */
    addStyles() {
        if (document.getElementById('gemlords-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gemlords-styles';
        style.textContent = `
            .gemlords-panel {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #0ff;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 8px 32px rgba(0, 255, 255, 0.2);
                max-width: 450px;
                margin: 12px 0;
            }
            
            .gemlords-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                cursor: pointer;
            }
            
            .gemlords-header h3 {
                margin: 0;
                color: #0ff;
                font-size: 18px;
                text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }
            
            .gemlords-toggle {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid #0ff;
                color: #0ff;
                padding: 4px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .gemlords-toggle:hover {
                background: rgba(0, 255, 255, 0.2);
                transform: scale(1.05);
            }
            
            .gemlords-content {
                transition: max-height 0.3s ease;
                overflow: hidden;
            }
            
            .gemlords-content.collapsed {
                max-height: 0;
            }
            
            .gemlords-stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .stat-card {
                background: rgba(0, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 8px;
                padding: 12px;
                text-align: center;
            }
            
            .stat-label {
                color: #888;
                font-size: 11px;
                text-transform: uppercase;
                margin-bottom: 4px;
            }
            
            .stat-value {
                color: #0ff;
                font-size: 18px;
                font-weight: bold;
            }
            
            .gemlords-actions {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            
            .gemlords-actions button {
                flex: 1;
                padding: 10px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
                min-width: 120px;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .btn-success {
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                color: white;
            }
            
            .btn-info {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
            }
            
            .gemlords-actions button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .gemlords-jobs-list {
                margin-top: 16px;
            }
            
            .job-card {
                background: rgba(0, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
                transition: all 0.3s;
            }
            
            .job-card:hover {
                border-color: #0ff;
                background: rgba(0, 255, 255, 0.1);
                transform: translateX(4px);
            }
            
            .job-title {
                color: #fff;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .job-details {
                color: #888;
                font-size: 12px;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                margin-bottom: 8px;
            }
            
            .job-pay {
                color: #38ef7d;
                font-weight: bold;
            }
            
            .job-actions {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }
            
            .job-actions button {
                flex: 1;
                padding: 6px 12px;
                border: 1px solid #0ff;
                background: rgba(0, 255, 255, 0.1);
                color: #0ff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
            }
            
            .job-actions button:hover {
                background: rgba(0, 255, 255, 0.2);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Toggle panel visibility
     */
    togglePanel() {
        const content = document.getElementById('gemlords-content');
        const icon = document.getElementById('gemlords-toggle-icon');
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            content.style.maxHeight = content.scrollHeight + 'px';
            icon.textContent = '▼';
        } else {
            content.classList.add('collapsed');
            content.style.maxHeight = '0';
            icon.textContent = '▶';
        }
    }
    
    /**
     * Update dashboard with current data
     */
    updateDashboard() {
        const totalEarnedEl = document.getElementById('gemlords-total-earned');
        const pendingEl = document.getElementById('gemlords-pending');
        const jobsEl = document.getElementById('gemlords-jobs');
        const levelEl = document.getElementById('gemlords-level');
        
        if (totalEarnedEl) totalEarnedEl.textContent = `$${this.studentProfile.totalEarnings.toFixed(2)}`;
        if (pendingEl) pendingEl.textContent = `$${this.studentProfile.pendingPayouts.toFixed(2)}`;
        if (jobsEl) jobsEl.textContent = this.studentProfile.completedJobs.length;
        if (levelEl) {
            const level = this.getStudentLevel();
            levelEl.textContent = level.charAt(0).toUpperCase() + level.slice(1);
        }
    }
    
    /**
     * Show job marketplace
     */
    async showJobMarketplace() {
        const jobs = await this.getAvailableJobs();
        const jobsList = document.getElementById('gemlords-jobs-list');
        
        if (!jobsList) return;
        
        if (jobs.recommendedJobs.length === 0) {
            jobsList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #888;">
                    <p>📚 Complete more academy lessons to unlock jobs!</p>
                    <p style="font-size: 12px;">Current level: ${jobs.level}</p>
                </div>
            `;
            return;
        }
        
        jobsList.innerHTML = jobs.recommendedJobs.map(job => `
            <div class="job-card">
                <div class="job-title">${job.title}</div>
                <div class="job-details">
                    <span>💎 ${job.stoneType}</span>
                    <span>⏱️ ${job.estimatedHours}h</span>
                    <span class="job-pay">💰 $${job.estimatedPay}</span>
                    <span>📊 ${job.difficulty}</span>
                </div>
                <div style="font-size: 11px; color: #888; margin-bottom: 8px;">
                    ${job.description}
                </div>
                <div style="font-size: 11px; color: #0ff;">
                    Skills: ${job.skills.join(', ')}
                </div>
                <div class="job-actions">
                    <button onclick="gemLordsIntegration.applyForJob('${job.id}')">
                        ✅ Apply
                    </button>
                    <button onclick="gemLordsIntegration.viewJobDetails('${job.id}')">
                        📋 Details
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * View job details
     */
    viewJobDetails(jobId) {
        this.showNotification('📋 Job Details', 'Opening detailed job information...');
        // In production, this would open a modal with full job details
    }
    
    /**
     * View student portfolio
     */
    viewPortfolio() {
        const portfolio = this.studentProfile.portfolio;
        const jobsList = document.getElementById('gemlords-jobs-list');
        
        if (!jobsList) return;
        
        if (portfolio.length === 0) {
            jobsList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #888;">
                    <p>📁 Your portfolio is empty</p>
                    <p style="font-size: 12px;">Complete jobs to build your professional portfolio!</p>
                </div>
            `;
            return;
        }
        
        jobsList.innerHTML = `
            <div style="margin-bottom: 16px;">
                <h4 style="color: #0ff; margin: 0 0 12px 0;">📁 My Portfolio</h4>
            </div>
        ` + portfolio.map(item => `
            <div class="job-card">
                <div class="job-title">${item.title}</div>
                <div class="job-details">
                    <span>💰 Earned: $${item.earnings.toFixed(2)}</span>
                    <span>⭐ Quality: ${item.quality}</span>
                    <span>📅 ${new Date(item.date).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Show notification
     */
    showNotification(title, message) {
        // Try to use Merlin if available
        if (window.merlinAI && window.merlinAI.speak) {
            window.merlinAI.speak(`${title}: ${message}`);
            return;
        }
        
        // Fallback to alert/console
        console.log(`[GemLords] ${title}: ${message}`);
        
        // Try to show in UI if notification system exists
        if (window.showNotification) {
            window.showNotification(title, message);
        }
    }
}

// Initialize global instance
window.gemLordsIntegration = new GemBotGemLordsIntegration();

// Auto-initialize when dependencies are ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.gemLordsIntegration.initialize(), 2000);
    });
} else {
    setTimeout(() => window.gemLordsIntegration.initialize(), 2000);
}

console.log('💎 GemBot-GemLords Integration loaded');
