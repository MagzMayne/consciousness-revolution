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
 * File: gemlords-marketplace-embed.js
 * Declaration ID: IP-D16969E-MLL28ZUZ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMLORDS MARKETPLACE EMBED
 * ═══════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick / Barbrick Design - ALL RIGHTS RESERVED
 * 
 * Embedded version of GemLords marketplace for seamless integration
 * into the GemBot interface
 * ═══════════════════════════════════════════════════════════════════════════
 */

class GemLordsMarketplaceEmbed {
    constructor() {
        this.version = '1.0.0';
        this.gemLordsUrl = 'https://barbrickdesign.github.io/gemLords.html';
        
        // Sample job listings (in production, these would come from API)
        this.jobListings = [
            {
                id: 'GL-001',
                title: 'Sapphire Rough Parcel - 106ct',
                stoneType: 'Sapphire',
                roughCarats: 106,
                costUSD: 30,
                difficulty: 'intermediate',
                skills: ['Faceted Round', 'High Polish'],
                estimatedYield: 38,
                estimatedStones: 48,
                projectedRevenue: 10560,
                projectedProfit: 8650,
                roiPercent: 288,
                timeline: 23,
                studentShare: 0.15, // 15% of profit for student cutter
                estimatedPay: 1297,
                image: 'https://i.ebayimg.com/images/g/abc/s-l1600.jpg',
                ebayUrl: 'https://www.ebay.com/itm/156701720293',
                location: 'Sri Lanka',
                seller: 'roughgem_trader'
            },
            {
                id: 'GL-002',
                title: 'Natural Amethyst Rough - 50ct',
                stoneType: 'Quartz (Amethyst)',
                roughCarats: 50,
                costUSD: 15,
                difficulty: 'beginner',
                skills: ['Cabochon', 'Basic Polish'],
                estimatedYield: 35,
                estimatedStones: 8,
                projectedRevenue: 320,
                projectedProfit: 180,
                roiPercent: 129,
                timeline: 14,
                studentShare: 0.20, // 20% for beginner jobs (training rate)
                estimatedPay: 36,
                image: 'https://i.ebayimg.com/images/g/xyz/s-l1600.jpg',
                ebayUrl: 'https://www.ebay.com/itm/example',
                location: 'Brazil',
                seller: 'gemstone_direct'
            },
            {
                id: 'GL-003',
                title: 'Emerald Rough Lot - 200ct Colombia',
                stoneType: 'Emerald',
                roughCarats: 200,
                costUSD: 250,
                difficulty: 'advanced',
                skills: ['Step Cut', 'Premium Stone Finishing'],
                estimatedYield: 32,
                estimatedStones: 50,
                projectedRevenue: 16000,
                projectedProfit: 12500,
                roiPercent: 500,
                timeline: 35,
                studentShare: 0.12, // 12% for advanced work
                estimatedPay: 1500,
                image: 'https://i.ebayimg.com/images/g/emerald/s-l1600.jpg',
                ebayUrl: 'https://www.ebay.com/itm/emerald',
                location: 'Colombia',
                seller: 'andes_gems'
            },
            {
                id: 'GL-004',
                title: 'Fancy Tourmaline Custom Cut - 8ct',
                stoneType: 'Tourmaline',
                roughCarats: 8,
                costUSD: 45,
                difficulty: 'professional',
                skills: ['Custom Facets', 'Fantasy Cuts'],
                estimatedYield: 40,
                estimatedStones: 1,
                projectedRevenue: 850,
                projectedProfit: 650,
                roiPercent: 433,
                timeline: 16,
                studentShare: 0.25, // 25% for custom work
                estimatedPay: 163,
                image: 'https://i.ebayimg.com/images/g/tour/s-l1600.jpg',
                ebayUrl: 'https://www.ebay.com/itm/tourmaline',
                location: 'USA',
                seller: 'custom_cuts_pro'
            }
        ];
    }
    
    /**
     * Create embedded marketplace panel
     */
    createMarketplace(containerId = 'gemlords-marketplace-container') {
        let container = document.getElementById(containerId);
        
        if (!container) {
            // Create container if it doesn't exist
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'gemlords-marketplace';
            document.body.appendChild(container);
        }
        
        container.innerHTML = `
            <div class="marketplace-header">
                <h2>💎 GemLords Marketplace</h2>
                <div class="marketplace-subtitle">Real-world gemstone cutting jobs for trained students</div>
                <div class="marketplace-filters">
                    <select id="gemlords-difficulty-filter">
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="professional">Professional</option>
                    </select>
                    <select id="gemlords-stone-filter">
                        <option value="all">All Stones</option>
                        <option value="Sapphire">Sapphire</option>
                        <option value="Emerald">Emerald</option>
                        <option value="Quartz">Quartz</option>
                        <option value="Tourmaline">Tourmaline</option>
                    </select>
                    <button onclick="gemLordsMarketplaceEmbed.refreshListings()" class="btn-refresh">
                        🔄 Refresh
                    </button>
                </div>
            </div>
            <div class="marketplace-stats">
                <div class="stat-box">
                    <div class="stat-label">Available Jobs</div>
                    <div class="stat-value" id="available-jobs-count">0</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Potential Earnings</div>
                    <div class="stat-value" id="potential-earnings">$0</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Avg Timeline</div>
                    <div class="stat-value" id="avg-timeline">0 days</div>
                </div>
            </div>
            <div id="marketplace-listings" class="marketplace-listings"></div>
            <div class="marketplace-footer">
                <a href="${this.gemLordsUrl}" target="_blank" class="btn-external">
                    🌐 Open Full GemLords Platform
                </a>
                <div class="marketplace-info">
                    💳 Payments via PayPal • 🔒 Secure & Insured • ⭐ Rate jobs for quality
                </div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render
        this.renderListings();
        
        return container;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const difficultyFilter = document.getElementById('gemlords-difficulty-filter');
        const stoneFilter = document.getElementById('gemlords-stone-filter');
        
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => this.renderListings());
        }
        
        if (stoneFilter) {
            stoneFilter.addEventListener('change', () => this.renderListings());
        }
    }
    
    /**
     * Get filtered listings
     */
    getFilteredListings() {
        const difficultyFilter = document.getElementById('gemlords-difficulty-filter')?.value || 'all';
        const stoneFilter = document.getElementById('gemlords-stone-filter')?.value || 'all';
        
        // Get student level to filter appropriate jobs
        let studentLevel = 'beginner';
        if (window.gemLordsIntegration) {
            studentLevel = window.gemLordsIntegration.getStudentLevel();
        }
        
        // Filter jobs
        let filtered = this.jobListings.filter(job => {
            // Difficulty filter
            if (difficultyFilter !== 'all' && job.difficulty !== difficultyFilter) {
                return false;
            }
            
            // Stone filter
            if (stoneFilter !== 'all' && !job.stoneType.includes(stoneFilter)) {
                return false;
            }
            
            // Student level filter (don't show jobs too advanced)
            const levelHierarchy = ['beginner', 'intermediate', 'advanced', 'professional'];
            const jobLevel = levelHierarchy.indexOf(job.difficulty);
            const userLevel = levelHierarchy.indexOf(studentLevel);
            
            // Show jobs at or below user level, plus one level above
            if (jobLevel > userLevel + 1) {
                return false;
            }
            
            return true;
        });
        
        return filtered;
    }
    
    /**
     * Render job listings
     */
    renderListings() {
        const listings = this.getFilteredListings();
        const container = document.getElementById('marketplace-listings');
        
        if (!container) return;
        
        // Update stats
        this.updateStats(listings);
        
        if (listings.length === 0) {
            container.innerHTML = `
                <div class="no-jobs">
                    <div class="no-jobs-icon">🔍</div>
                    <h3>No Jobs Match Your Filters</h3>
                    <p>Try adjusting your filters or complete more academy lessons to unlock higher-level jobs</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = listings.map(job => this.createJobCard(job)).join('');
    }
    
    /**
     * Create job card HTML
     */
    createJobCard(job) {
        const difficultyColors = {
            beginner: '#38ef7d',
            intermediate: '#4facfe',
            advanced: '#f093fb',
            professional: '#FFD700'
        };
        
        const difficultyColor = difficultyColors[job.difficulty] || '#888';
        
        // Check if student is qualified
        const isQualified = this.checkJobQualification(job);
        const qualificationBadge = isQualified 
            ? '<span class="qualified-badge">✅ Qualified</span>'
            : '<span class="not-qualified-badge">🔒 Unlock via Academy</span>';
        
        return `
            <div class="job-card ${!isQualified ? 'locked' : ''}" data-job-id="${job.id}">
                <div class="job-image" style="background-image: url('${job.image}');">
                    <div class="job-difficulty" style="background: ${difficultyColor};">
                        ${job.difficulty.toUpperCase()}
                    </div>
                </div>
                <div class="job-content">
                    <h3 class="job-title">${job.title}</h3>
                    <div class="job-location">📍 ${job.location} • ${job.seller}</div>
                    
                    <div class="job-details">
                        <div class="detail-item">
                            <span class="detail-label">💎 Stone</span>
                            <span class="detail-value">${job.stoneType}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">⚖️ Rough</span>
                            <span class="detail-value">${job.roughCarats}ct</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">💰 Your Pay</span>
                            <span class="detail-value pay-highlight">$${job.estimatedPay}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">⏱️ Timeline</span>
                            <span class="detail-value">${job.timeline} days</span>
                        </div>
                    </div>
                    
                    <div class="job-skills">
                        <span class="skills-label">Required Skills:</span>
                        ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                    
                    <div class="job-economics">
                        <div class="econ-item">
                            <span>💵 Cost: $${job.costUSD}</span>
                        </div>
                        <div class="econ-item">
                            <span>📈 Revenue: $${job.projectedRevenue.toLocaleString()}</span>
                        </div>
                        <div class="econ-item">
                            <span>💹 ROI: ${job.roiPercent}%</span>
                        </div>
                        <div class="econ-item">
                            <span>✂️ ${job.estimatedStones} stones @ ${job.estimatedYield}% yield</span>
                        </div>
                    </div>
                    
                    <div class="job-qualification">
                        ${qualificationBadge}
                    </div>
                    
                    <div class="job-actions">
                        ${isQualified ? `
                            <button onclick="gemLordsMarketplaceEmbed.viewJobDetails('${job.id}')" class="btn-details">
                                📋 View Details
                            </button>
                            <button onclick="gemLordsMarketplaceEmbed.applyForJob('${job.id}')" class="btn-apply">
                                ✅ Apply Now
                            </button>
                        ` : `
                            <button onclick="gemLordsMarketplaceEmbed.showRequirements('${job.id}')" class="btn-requirements">
                                📚 View Requirements
                            </button>
                        `}
                        <a href="${job.ebayUrl}" target="_blank" class="btn-source">
                            🔗 Source
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Check if student is qualified for job
     */
    checkJobQualification(job) {
        if (!window.gemLordsAcademyBridge) return false;
        
        const username = window.gemLordsIntegration?.getCurrentUsername() || 'Guest';
        
        // Check if student has required skills
        return job.skills.every(skill => {
            const unlockedTypes = window.gemLordsAcademyBridge.getUnlockedJobTypes(username);
            return unlockedTypes.includes(skill);
        });
    }
    
    /**
     * Update marketplace stats
     */
    updateStats(listings) {
        const countEl = document.getElementById('available-jobs-count');
        const earningsEl = document.getElementById('potential-earnings');
        const timelineEl = document.getElementById('avg-timeline');
        
        if (countEl) countEl.textContent = listings.length;
        
        if (earningsEl && listings.length > 0) {
            const totalPay = listings.reduce((sum, job) => sum + job.estimatedPay, 0);
            earningsEl.textContent = `$${totalPay.toLocaleString()}`;
        }
        
        if (timelineEl && listings.length > 0) {
            const avgTime = listings.reduce((sum, job) => sum + job.timeline, 0) / listings.length;
            timelineEl.textContent = `${Math.round(avgTime)} days`;
        }
    }
    
    /**
     * View job details
     */
    viewJobDetails(jobId) {
        const job = this.jobListings.find(j => j.id === jobId);
        if (!job) return;
        
        // Create detailed modal
        const modal = document.createElement('div');
        modal.className = 'job-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${job.title}</h2>
                    <button onclick="this.closest('.job-modal').remove()" class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <img src="${job.image}" alt="${job.title}" class="modal-image">
                    
                    <div class="modal-section">
                        <h3>📊 Job Overview</h3>
                        <div class="overview-grid">
                            <div><strong>Stone Type:</strong> ${job.stoneType}</div>
                            <div><strong>Rough Weight:</strong> ${job.roughCarats}ct</div>
                            <div><strong>Difficulty:</strong> ${job.difficulty}</div>
                            <div><strong>Timeline:</strong> ${job.timeline} days</div>
                            <div><strong>Location:</strong> ${job.location}</div>
                            <div><strong>Seller:</strong> ${job.seller}</div>
                        </div>
                    </div>
                    
                    <div class="modal-section">
                        <h3>💰 Financial Details</h3>
                        <table class="financial-table">
                            <tr>
                                <td>Rough Cost:</td>
                                <td>$${job.costUSD}</td>
                            </tr>
                            <tr>
                                <td>Projected Revenue:</td>
                                <td>$${job.projectedRevenue.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Projected Profit:</td>
                                <td>$${job.projectedProfit.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>ROI:</td>
                                <td>${job.roiPercent}%</td>
                            </tr>
                            <tr class="highlight-row">
                                <td><strong>Your Share (${job.studentShare * 100}%):</strong></td>
                                <td><strong>$${job.estimatedPay}</strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="modal-section">
                        <h3>🎯 Production Details</h3>
                        <ul>
                            <li>Expected yield: ${job.estimatedYield}%</li>
                            <li>Estimated stones: ${job.estimatedStones}</li>
                            <li>Required skills: ${job.skills.join(', ')}</li>
                        </ul>
                    </div>
                    
                    <div class="modal-section">
                        <h3>📋 Process</h3>
                        <ol>
                            <li>Apply for the job through GemBot platform</li>
                            <li>Job provider ships rough stone to you (insured)</li>
                            <li>Cut and polish according to specifications</li>
                            <li>Ship completed stones back (insured)</li>
                            <li>Quality review and payment processing</li>
                            <li>Receive payment within 7 days of approval</li>
                        </ol>
                    </div>
                </div>
                <div class="modal-footer">
                    <a href="${job.ebayUrl}" target="_blank" class="btn-secondary">View Original Listing</a>
                    <button onclick="gemLordsMarketplaceEmbed.applyForJob('${job.id}')" class="btn-primary">
                        Apply for This Job
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    /**
     * Apply for job
     */
    async applyForJob(jobId) {
        if (!window.gemLordsIntegration) {
            alert('GemLords integration not loaded');
            return;
        }
        
        const job = this.jobListings.find(j => j.id === jobId);
        if (!job) return;
        
        // Check qualification
        if (!this.checkJobQualification(job)) {
            this.showRequirements(jobId);
            return;
        }
        
        // Apply through integration
        const success = await window.gemLordsIntegration.applyForJob(jobId);
        
        if (success) {
            // Close any open modals
            document.querySelectorAll('.job-modal').forEach(m => m.remove());
        }
    }
    
    /**
     * Show requirements for locked job
     */
    showRequirements(jobId) {
        const job = this.jobListings.find(j => j.id === jobId);
        if (!job) return;
        
        const modal = document.createElement('div');
        modal.className = 'job-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔒 Requirements for ${job.title}</h2>
                    <button onclick="this.closest('.job-modal').remove()" class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="requirements-section">
                        <h3>📚 Required Skills</h3>
                        <ul class="requirements-list">
                            ${job.skills.map(skill => {
                                const hasSkill = window.gemLordsAcademyBridge?.isReadyForJobType(
                                    window.gemLordsIntegration?.getCurrentUsername() || 'Guest',
                                    skill
                                );
                                return `<li class="${hasSkill ? 'completed' : 'incomplete'}">
                                    ${hasSkill ? '✅' : '⬜'} ${skill}
                                </li>`;
                            }).join('')}
                        </ul>
                    </div>
                    
                    <div class="requirements-section">
                        <h3>🎓 How to Unlock</h3>
                        <p>Complete relevant academy courses to earn certifications and unlock these job types:</p>
                        <ol>
                            <li>Navigate to Academy panel in GemBot interface</li>
                            <li>Complete lessons in required courses</li>
                            <li>Earn certification badges</li>
                            <li>Return here when certified</li>
                        </ol>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.job-modal').remove()" class="btn-secondary">
                        Close
                    </button>
                    <button onclick="gemLordsMarketplaceEmbed.goToAcademy()" class="btn-primary">
                        Go to Academy
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    /**
     * Navigate to academy
     */
    goToAcademy() {
        // Close modals
        document.querySelectorAll('.job-modal').forEach(m => m.remove());
        
        // Try to open academy panel
        if (window.GemBotAcademy && window.GemBotAcademy.showAcademy) {
            window.GemBotAcademy.showAcademy();
        } else {
            alert('Academy panel will open when you access the GemBot interface');
        }
    }
    
    /**
     * Refresh listings (in production would fetch from API)
     */
    refreshListings() {
        this.renderListings();
        
        // Show refresh notification
        const notification = document.createElement('div');
        notification.className = 'refresh-notification';
        notification.textContent = '✅ Listings refreshed';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }
    
    /**
     * Add CSS styles
     */
    addStyles() {
        if (document.getElementById('gemlords-marketplace-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gemlords-marketplace-styles';
        style.textContent = `
            .gemlords-marketplace {
                background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
                border-radius: 16px;
                padding: 24px;
                max-width: 1200px;
                margin: 20px auto;
            }
            
            .marketplace-header {
                margin-bottom: 24px;
            }
            
            .marketplace-header h2 {
                color: #0ff;
                font-size: 28px;
                margin: 0 0 8px 0;
                text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            }
            
            .marketplace-subtitle {
                color: #888;
                font-size: 14px;
                margin-bottom: 16px;
            }
            
            .marketplace-filters {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .marketplace-filters select,
            .marketplace-filters button {
                padding: 8px 16px;
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #fff;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .marketplace-filters select:hover,
            .marketplace-filters button:hover {
                background: rgba(0, 255, 255, 0.2);
                border-color: #0ff;
            }
            
            .marketplace-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .stat-box {
                background: rgba(0, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
            }
            
            .stat-label {
                color: #888;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 8px;
            }
            
            .stat-value {
                color: #0ff;
                font-size: 24px;
                font-weight: bold;
            }
            
            .marketplace-listings {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
                margin-bottom: 24px;
            }
            
            .job-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s;
            }
            
            .job-card:hover {
                transform: translateY(-4px);
                border-color: #0ff;
                box-shadow: 0 8px 32px rgba(0, 255, 255, 0.3);
            }
            
            .job-card.locked {
                opacity: 0.6;
            }
            
            .job-card.locked:hover {
                transform: none;
            }
            
            .job-image {
                height: 200px;
                background-size: cover;
                background-position: center;
                position: relative;
            }
            
            .job-difficulty {
                position: absolute;
                top: 12px;
                right: 12px;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: bold;
                color: #000;
            }
            
            .job-content {
                padding: 16px;
            }
            
            .job-title {
                color: #fff;
                font-size: 18px;
                margin: 0 0 8px 0;
            }
            
            .job-location {
                color: #888;
                font-size: 12px;
                margin-bottom: 12px;
            }
            
            .job-details {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .detail-label {
                color: #888;
                font-size: 11px;
            }
            
            .detail-value {
                color: #fff;
                font-weight: 600;
            }
            
            .pay-highlight {
                color: #38ef7d;
                font-size: 18px;
            }
            
            .job-skills {
                margin: 12px 0;
            }
            
            .skills-label {
                color: #888;
                font-size: 11px;
                display: block;
                margin-bottom: 6px;
            }
            
            .skill-tag {
                display: inline-block;
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                color: #0ff;
                margin-right: 6px;
                margin-bottom: 6px;
            }
            
            .job-economics {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                padding: 12px;
                margin: 12px 0;
            }
            
            .econ-item {
                color: #888;
                font-size: 11px;
                margin-bottom: 4px;
            }
            
            .econ-item:last-child {
                margin-bottom: 0;
            }
            
            .job-qualification {
                margin: 12px 0;
            }
            
            .qualified-badge {
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
            }
            
            .not-qualified-badge {
                background: rgba(255, 255, 255, 0.1);
                color: #888;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                display: inline-block;
            }
            
            .job-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            .job-actions button,
            .job-actions a {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                text-align: center;
                text-decoration: none;
                font-size: 12px;
                transition: all 0.3s;
            }
            
            .btn-details {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid #0ff;
                color: #0ff;
            }
            
            .btn-apply {
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                color: white;
            }
            
            .btn-requirements {
                background: rgba(255, 255, 255, 0.1);
                color: #888;
            }
            
            .btn-source {
                background: rgba(0, 255, 255, 0.05);
                color: #0ff;
                border: 1px solid rgba(0, 255, 255, 0.2);
            }
            
            .marketplace-footer {
                text-align: center;
                padding-top: 24px;
                border-top: 1px solid rgba(0, 255, 255, 0.2);
            }
            
            .btn-external {
                display: inline-block;
                padding: 12px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-bottom: 12px;
                transition: all 0.3s;
            }
            
            .btn-external:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .marketplace-info {
                color: #888;
                font-size: 12px;
            }
            
            .no-jobs {
                text-align: center;
                padding: 60px 20px;
            }
            
            .no-jobs-icon {
                font-size: 64px;
                margin-bottom: 16px;
            }
            
            .no-jobs h3 {
                color: #fff;
                margin: 0 0 8px 0;
            }
            
            .no-jobs p {
                color: #888;
                font-size: 14px;
            }
            
            /* Modal Styles */
            .job-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .modal-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #0ff;
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid rgba(0, 255, 255, 0.2);
            }
            
            .modal-header h2 {
                color: #0ff;
                margin: 0;
                font-size: 24px;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
            }
            
            .modal-close:hover {
                color: #fff;
            }
            
            .modal-body {
                padding: 24px;
            }
            
            .modal-image {
                width: 100%;
                height: 300px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 24px;
            }
            
            .modal-section {
                margin-bottom: 24px;
            }
            
            .modal-section h3 {
                color: #0ff;
                font-size: 18px;
                margin: 0 0 12px 0;
            }
            
            .overview-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                color: #888;
            }
            
            .overview-grid div {
                padding: 8px;
                background: rgba(0, 255, 255, 0.05);
                border-radius: 6px;
            }
            
            .overview-grid strong {
                color: #fff;
            }
            
            .financial-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .financial-table td {
                padding: 8px;
                border-bottom: 1px solid rgba(0, 255, 255, 0.1);
                color: #888;
            }
            
            .financial-table td:last-child {
                text-align: right;
                color: #fff;
            }
            
            .highlight-row {
                background: rgba(56, 239, 125, 0.1);
            }
            
            .highlight-row td {
                color: #38ef7d !important;
                font-size: 18px;
            }
            
            .modal-section ul,
            .modal-section ol {
                color: #888;
                padding-left: 24px;
            }
            
            .modal-section li {
                margin-bottom: 8px;
            }
            
            .modal-footer {
                display: flex;
                gap: 12px;
                padding: 24px;
                border-top: 1px solid rgba(0, 255, 255, 0.2);
            }
            
            .btn-primary,
            .btn-secondary {
                flex: 1;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                color: white;
            }
            
            .btn-secondary {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid #0ff;
                color: #0ff;
            }
            
            .btn-primary:hover,
            .btn-secondary:hover {
                transform: translateY(-2px);
            }
            
            .requirements-list {
                list-style: none;
                padding: 0;
            }
            
            .requirements-list li {
                padding: 12px;
                background: rgba(0, 255, 255, 0.05);
                border-radius: 6px;
                margin-bottom: 8px;
            }
            
            .requirements-list li.completed {
                background: rgba(56, 239, 125, 0.1);
                color: #38ef7d;
            }
            
            .requirements-list li.incomplete {
                color: #888;
            }
            
            .refresh-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #38ef7d;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10001;
                animation: fadeInOut 2s;
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; }
                10%, 90% { opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .marketplace-listings {
                    grid-template-columns: 1fr;
                }
                
                .marketplace-stats {
                    grid-template-columns: 1fr;
                }
                
                .job-details {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize global instance
window.gemLordsMarketplaceEmbed = new GemLordsMarketplaceEmbed();

console.log('💎 GemLords Marketplace Embed loaded');
