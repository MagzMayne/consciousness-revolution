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
 * File: course-payment-system.js
 * Declaration ID: IP-E80E6D1-MLL28ZUP
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COURSE PAYMENT & MEMBERSHIP SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Pooled IGS Membership ($1 per user via PayPal to barbrickdesign@gmail.com)
 * - Individual Course Access ($0.50 via PayPal)
 * - $1 GBUV Reward on Course Completion
 * - Integration with gemsociety.org courses
 * - Real gemstone education content
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const CoursePaymentSystem = {
    version: '1.0.0',
    initialized: false,
    
    // Configuration
    config: {
        paypalEmail: 'barbrickdesign@gmail.com',
        
        // Pricing
        membershipFee: 1.00,      // $1 for pooled IGS membership
        courseFee: 0.50,          // $0.50 per individual course
        courseCompletionReward: 1.00, // $1 worth of GBUV (20 GBUV)
        
        // IGS Membership Tiers
        igsEnthusiastYearly: 97,
        igsEnthusiastMonthly: 12,
        igsProfessionalYearly: 227,
        igsProfessionalMonthly: 24,
        
        // Our pooled access
        pooledMembershipActive: false,
        pooledMembershipTier: 'professional' // We'll get Professional for all users
    },
    
    // User state
    currentUser: null,
    userCourses: {
        purchased: [],
        completed: [],
        inProgress: []
    },
    
    // Available courses from gemsociety.org
    courses: {
        'gem-identification-basics': {
            id: 'gem-identification-basics',
            title: 'Gemstone Identification Basics',
            description: 'Learn to identify gemstones using professional techniques',
            source: 'IGS',
            duration: '2 hours',
            lessons: 8,
            price: 0.50,
            rewardGBUV: 20,
            thumbnail: '💎',
            topics: [
                'Visual Inspection Techniques',
                'Using the 10x Loupe',
                'Refractive Index Testing',
                'Specific Gravity Measurement',
                'Hardness Testing (Mohs Scale)',
                'Dichroscope Usage',
                'UV Light Testing',
                'Identifying Common Gemstones'
            ],
            content: {
                type: 'igs_integration',
                url: 'https://www.gemsociety.org/article/gem-identification/'
            }
        },
        'faceting-fundamentals': {
            id: 'faceting-fundamentals',
            title: 'Faceting Fundamentals',
            description: 'Master the art of precision gemstone faceting',
            source: 'IGS',
            duration: '3 hours',
            lessons: 12,
            price: 0.50,
            rewardGBUV: 20,
            thumbnail: '✂️',
            topics: [
                'Faceting Machine Setup',
                'Angle and Index Basics',
                'Pavilion Cutting',
                'Crown Faceting',
                'Meet Point Precision',
                'Polishing Techniques',
                'Standard Round Brilliant',
                'Troubleshooting Common Issues'
            ],
            content: {
                type: 'igs_integration',
                url: 'https://www.gemsociety.org/article/faceting-techniques/'
            }
        },
        'gem-pricing-valuation': {
            id: 'gem-pricing-valuation',
            title: 'Gem Pricing & Valuation',
            description: 'Understand gemstone pricing and market valuation',
            source: 'IGS',
            duration: '1.5 hours',
            lessons: 6,
            price: 0.50,
            rewardGBUV: 20,
            thumbnail: '💰',
            topics: [
                'Pricing Factors (4Cs)',
                'Market Trends',
                'Rarity vs. Demand',
                'Wholesale vs. Retail',
                'Certification Impact',
                'Investment Grade Gems'
            ],
            content: {
                type: 'igs_integration',
                url: 'https://www.gemsociety.org/price-guide/'
            }
        },
        'colored-gemstones': {
            id: 'colored-gemstones',
            title: 'Colored Gemstone Encyclopedia',
            description: 'Comprehensive guide to colored gemstones',
            source: 'IGS',
            duration: '4 hours',
            lessons: 15,
            price: 0.50,
            rewardGBUV: 20,
            thumbnail: '🌈',
            topics: [
                'Ruby & Sapphire',
                'Emerald & Aquamarine',
                'Tourmaline Varieties',
                'Garnet Species',
                'Topaz Colors',
                'Spinel & Zircon',
                'Rare Gemstones',
                'Treatments & Enhancements'
            ],
            content: {
                type: 'igs_integration',
                url: 'https://www.gemsociety.org/gemstone-encyclopedia/'
            }
        },
        'jewelry-design-basics': {
            id: 'jewelry-design-basics',
            title: 'Jewelry Design Basics',
            description: 'Create beautiful jewelry designs',
            source: 'IGS',
            duration: '2.5 hours',
            lessons: 10,
            price: 0.50,
            rewardGBUV: 20,
            thumbnail: '💍',
            topics: [
                'Design Principles',
                'Stone Setting Styles',
                'Metal Selection',
                'CAD Design Basics',
                'Proportions & Balance',
                'Wearability Considerations',
                'Custom Design Process',
                'Portfolio Building'
            ],
            content: {
                type: 'igs_integration',
                url: 'https://www.gemsociety.org/article/jewelry-design/'
            }
        }
    },
    
    // Membership pool tracking
    membershipPool: {
        totalContributions: 0,
        activeMembers: 0,
        poolBalance: 0,
        membershipRenewDate: null,
        tier: 'none'
    },
    
    /**
     * Initialize the course payment system
     */
    async init() {
        console.log('📚 Initializing Course Payment System...');
        
        // Load user data
        await this.loadUserData();
        
        // Check membership pool status
        await this.checkMembershipPool();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('✅ Course Payment System initialized');
        
        return this;
    },
    
    /**
     * Load user course data
     */
    async loadUserData() {
        // Check for Firebase auth
        if (window.firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || user.email?.split('@')[0]
                    };
                    this.loadUserCourses();
                }
            });
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('course_payment_user_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.userCourses = data.courses || this.userCourses;
                this.currentUser = data.user || null;
            } catch (e) {}
        }
    },
    
    /**
     * Load user's purchased/completed courses
     */
    async loadUserCourses() {
        if (!this.currentUser) return;
        
        // Try Firebase first
        if (window.firebase && firebase.firestore) {
            try {
                const db = firebase.firestore();
                const doc = await db.collection('user_courses').doc(this.currentUser.uid).get();
                if (doc.exists) {
                    this.userCourses = doc.data();
                }
            } catch (e) {
                console.warn('Could not load from Firestore:', e);
            }
        }
    },
    
    /**
     * Save user course data
     */
    async saveUserData() {
        // Save to localStorage
        localStorage.setItem('course_payment_user_data', JSON.stringify({
            user: this.currentUser,
            courses: this.userCourses
        }));
        
        // Save to Firebase if available
        if (this.currentUser && window.firebase && firebase.firestore) {
            try {
                const db = firebase.firestore();
                await db.collection('user_courses').doc(this.currentUser.uid).set(this.userCourses);
            } catch (e) {
                console.warn('Could not save to Firestore:', e);
            }
        }
    },
    
    /**
     * Check membership pool status
     */
    async checkMembershipPool() {
        // Try to load from Firebase
        if (window.firebase && firebase.firestore) {
            try {
                const db = firebase.firestore();
                const doc = await db.collection('system_config').doc('membership_pool').get();
                if (doc.exists) {
                    this.membershipPool = doc.data();
                    this.config.pooledMembershipActive = this.membershipPool.tier !== 'none';
                }
            } catch (e) {
                console.warn('Could not load membership pool:', e);
            }
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('membership_pool_data');
        if (saved) {
            try {
                this.membershipPool = JSON.parse(saved);
                this.config.pooledMembershipActive = this.membershipPool.tier !== 'none';
            } catch (e) {}
        }
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for course completion events
        window.addEventListener('courseCompleted', (e) => {
            this.handleCourseCompletion(e.detail);
        });
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // MEMBERSHIP SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Show pooled membership purchase modal
     */
    showMembershipPurchaseModal() {
        const modal = document.createElement('div');
        modal.id = 'membership-purchase-modal';
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.closest('.payment-modal').remove()">×</button>
                
                <div class="modal-header">
                    <h2>🎓 Premium Gemstone Education</h2>
                    <p>Join our pooled IGS Professional membership</p>
                </div>
                
                <div class="membership-info">
                    <div class="tier-comparison">
                        <div class="tier-card">
                            <h3>IGS Professional</h3>
                            <div class="tier-price">$227/year</div>
                            <div class="tier-features">
                                ✅ Complete Gemstone Buying Guides<br>
                                ✅ Professional Gem Identification<br>
                                ✅ Accurate Price Guide Database<br>
                                ✅ 20+ Years Article Archive<br>
                                ✅ Complete Forum Access<br>
                                ✅ Advanced Gem Gallery Filters<br>
                                ✅ All Mini Courses Included<br>
                                ✅ Professional Certification Programs<br>
                                ✅ Free Business Listing
                            </div>
                        </div>
                    </div>
                    
                    <div class="pooled-offer">
                        <div class="offer-badge">🎁 POOLED ACCESS</div>
                        <h3>Your Share: Only $1.00</h3>
                        <p>We pool contributions from all users to maintain one Professional membership that grants everyone full access to IGS resources.</p>
                        
                        <div class="pool-stats">
                            <div class="stat">
                                <span class="stat-value">${this.membershipPool.activeMembers}</span>
                                <span class="stat-label">Active Members</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">$${this.membershipPool.poolBalance.toFixed(2)}</span>
                                <span class="stat-label">Pool Balance</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${this.membershipPool.tier === 'professional' ? '✅ Active' : '⏳ Funding'}</span>
                                <span class="stat-label">Status</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-section">
                        <h3>💳 One-Time Payment</h3>
                        <p>Pay $1.00 via PayPal to unlock all IGS content</p>
                        
                        <button class="paypal-btn" onclick="CoursePaymentSystem.initiateMembers hipPayment()">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.773.773 0 0 1 .762-.66h6.636c2.808 0 4.72 1.684 4.72 4.157 0 3.105-2.396 5.298-5.97 5.298H8.367l-.926 5.168a.641.641 0 0 1-.633.74h-1.732zM15.31 21.337h-4.606a.641.641 0 0 1-.633-.74l1.82-10.147a.773.773 0 0 1 .762-.66h4.606c2.808 0 4.72 1.684 4.72 4.157 0 3.105-2.396 5.298-5.97 5.298h-2.727l-.926 5.168a.641.641 0 0 1-.633.74h-1.032z"/>
                            </svg>
                            Pay $1.00 with PayPal
                        </button>
                        
                        <div class="payment-note">
                            <small>Payment goes to: ${this.config.paypalEmail}</small><br>
                            <small>Access granted immediately after payment confirmation</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    /**
     * Initiate membership payment via PayPal
     */
    initiateMembershipPayment() {
        if (!this.currentUser) {
            alert('Please log in first to purchase membership');
            return;
        }
        
        const paymentData = {
            type: 'membership',
            amount: this.config.membershipFee,
            userId: this.currentUser.uid || this.currentUser.email,
            userEmail: this.currentUser.email,
            timestamp: new Date().toISOString()
        };
        
        // Create PayPal payment URL
        const paypalUrl = `https://www.paypal.com/paypalme/barbrickdesign/${this.config.membershipFee}`;
        
        // Store pending payment
        this.storePendingPayment(paymentData);
        
        // Open PayPal in new window
        const paymentWindow = window.open(paypalUrl, '_blank', 'width=800,height=600');
        
        // Show confirmation dialog
        setTimeout(() => {
            if (confirm('Have you completed the PayPal payment?\n\nClick OK once payment is sent.\n\nPayment will be verified and access granted within 24 hours.')) {
                this.confirmMembershipPayment(paymentData);
            }
        }, 3000);
    },
    
    /**
     * Store pending payment
     */
    async storePendingPayment(paymentData) {
        // Store locally
        const pending = JSON.parse(localStorage.getItem('pending_payments') || '[]');
        pending.push(paymentData);
        localStorage.setItem('pending_payments', JSON.stringify(pending));
        
        // Store in Firebase
        if (window.firebase && firebase.firestore) {
            try {
                await firebase.firestore()
                    .collection('pending_payments')
                    .add(paymentData);
            } catch (e) {
                console.warn('Could not store payment in Firestore:', e);
            }
        }
    },
    
    /**
     * Confirm membership payment
     */
    async confirmMembershipPayment(paymentData) {
        // Update local state
        this.membershipPool.totalContributions += paymentData.amount;
        this.membershipPool.activeMembers += 1;
        this.membershipPool.poolBalance += paymentData.amount;
        
        // Grant access
        this.grantMembershipAccess();
        
        // Save
        await this.saveMembershipPool();
        
        // Close modal
        document.getElementById('membership-purchase-modal')?.remove();
        
        // Show success
        this.showNotification('🎉 Membership Activated!', 
            'You now have full access to all IGS Professional content!');
    },
    
    /**
     * Grant membership access to user
     */
    grantMembershipAccess() {
        // Mark all courses as accessible
        const courseIds = Object.keys(this.courses);
        courseIds.forEach(id => {
            if (!this.userCourses.purchased.includes(id)) {
                this.userCourses.purchased.push(id);
            }
        });
        
        this.saveUserData();
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('membershipGranted', {
            detail: { tier: 'professional' }
        }));
    },
    
    /**
     * Save membership pool data
     */
    async saveMembershipPool() {
        // Save to localStorage
        localStorage.setItem('membership_pool_data', JSON.stringify(this.membershipPool));
        
        // Save to Firebase
        if (window.firebase && firebase.firestore) {
            try {
                await firebase.firestore()
                    .collection('system_config')
                    .doc('membership_pool')
                    .set(this.membershipPool);
            } catch (e) {
                console.warn('Could not save pool to Firestore:', e);
            }
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // INDIVIDUAL COURSE PURCHASE
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Show course purchase modal
     */
    showCoursePurchaseModal(courseId) {
        const course = this.courses[courseId];
        if (!course) return;
        
        const modal = document.createElement('div');
        modal.id = 'course-purchase-modal';
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.closest('.payment-modal').remove()">×</button>
                
                <div class="modal-header">
                    <h2>${course.thumbnail} ${course.title}</h2>
                    <p>${course.description}</p>
                </div>
                
                <div class="course-details">
                    <div class="detail-row">
                        <span>📚 Lessons:</span>
                        <span>${course.lessons}</span>
                    </div>
                    <div class="detail-row">
                        <span>⏱️ Duration:</span>
                        <span>${course.duration}</span>
                    </div>
                    <div class="detail-row">
                        <span>📖 Source:</span>
                        <span>${course.source}</span>
                    </div>
                    <div class="detail-row reward">
                        <span>🎁 Completion Reward:</span>
                        <span>${course.rewardGBUV} GBUV ($${this.config.courseCompletionReward})</span>
                    </div>
                </div>
                
                <div class="course-topics">
                    <h3>What You'll Learn:</h3>
                    <ul>
                        ${course.topics.map(topic => `<li>✓ ${topic}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="payment-section">
                    <div class="price-display">
                        <span class="price-label">Course Price:</span>
                        <span class="price-value">$${course.price.toFixed(2)}</span>
                    </div>
                    
                    <button class="paypal-btn" onclick="CoursePaymentSystem.initiateCoursePayment('${courseId}')">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.773.773 0 0 1 .762-.66h6.636c2.808 0 4.72 1.684 4.72 4.157 0 3.105-2.396 5.298-5.97 5.298H8.367l-.926 5.168a.641.641 0 0 1-.633.74h-1.732zM15.31 21.337h-4.606a.641.641 0 0 1-.633-.74l1.82-10.147a.773.773 0 0 1 .762-.66h4.606c2.808 0 4.72 1.684 4.72 4.157 0 3.105-2.396 5.298-5.97 5.298h-2.727l-.926 5.168a.641.641 0 0 1-.633.74h-1.032z"/>
                        </svg>
                        Purchase Course
                    </button>
                    
                    <div class="payment-note">
                        <small>✅ Instant access after payment</small><br>
                        <small>💎 Earn ${course.rewardGBUV} GBUV on completion</small><br>
                        <small>📧 Payment to: ${this.config.paypalEmail}</small>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    /**
     * Initiate course payment via PayPal
     */
    initiateCoursePayment(courseId) {
        const course = this.courses[courseId];
        if (!course || !this.currentUser) {
            alert('Please log in to purchase courses');
            return;
        }
        
        const paymentData = {
            type: 'course',
            courseId: courseId,
            amount: course.price,
            userId: this.currentUser.uid || this.currentUser.email,
            userEmail: this.currentUser.email,
            timestamp: new Date().toISOString()
        };
        
        // Create PayPal payment URL
        const paypalUrl = `https://www.paypal.com/paypalme/barbrickdesign/${course.price}`;
        
        // Store pending payment
        this.storePendingPayment(paymentData);
        
        // Open PayPal
        window.open(paypalUrl, '_blank', 'width=800,height=600');
        
        // Confirmation
        setTimeout(() => {
            if (confirm(`Have you completed the $${course.price} PayPal payment?\n\nClick OK to confirm and access your course.`)) {
                this.confirmCoursePayment(paymentData);
            }
        }, 3000);
    },
    
    /**
     * Confirm course payment
     */
    async confirmCoursePayment(paymentData) {
        const courseId = paymentData.courseId;
        
        // Grant access
        if (!this.userCourses.purchased.includes(courseId)) {
            this.userCourses.purchased.push(courseId);
        }
        
        // Save
        await this.saveUserData();
        
        // Close modal
        document.getElementById('course-purchase-modal')?.remove();
        
        // Show success and launch course
        this.showNotification('✅ Course Unlocked!', 
            `You now have access to ${this.courses[courseId].title}`);
        
        // Auto-start course
        setTimeout(() => {
            this.startCourse(courseId);
        }, 1000);
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // COURSE ACCESS & COMPLETION
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Check if user has access to course
     */
    hasCourseAccess(courseId) {
        return this.userCourses.purchased.includes(courseId) || 
               this.config.pooledMembershipActive;
    },
    
    /**
     * Start a course
     */
    startCourse(courseId) {
        const course = this.courses[courseId];
        if (!course) return;
        
        if (!this.hasCourseAccess(courseId)) {
            this.showCoursePurchaseModal(courseId);
            return;
        }
        
        // Mark as in progress
        if (!this.userCourses.inProgress.includes(courseId)) {
            this.userCourses.inProgress.push(courseId);
            this.saveUserData();
        }
        
        // Open course content
        this.openCourseContent(course);
    },
    
    /**
     * Open course content (IGS integration or internal)
     */
    openCourseContent(course) {
        if (course.content.type === 'igs_integration') {
            // Open IGS content in modal iframe
            this.showCourseContentModal(course);
        }
    },
    
    /**
     * Show course content in modal with iframe
     */
    showCourseContentModal(course) {
        const modal = document.createElement('div');
        modal.id = 'course-content-modal';
        modal.className = 'course-modal fullscreen';
        modal.innerHTML = `
            <div class="course-header">
                <h2>${course.thumbnail} ${course.title}</h2>
                <div class="course-controls">
                    <button onclick="CoursePaymentSystem.markCourseComplete('${course.id}')" class="complete-btn">
                        ✅ Mark Complete
                    </button>
                    <button onclick="this.closest('.course-modal').remove()" class="close-btn">
                        ✕ Close
                    </button>
                </div>
            </div>
            <div class="course-content-frame">
                <iframe src="${course.content.url}" 
                        frameborder="0" 
                        style="width:100%;height:100%;"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms">
                </iframe>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    /**
     * Mark course as complete and grant reward
     */
    async markCourseComplete(courseId) {
        const course = this.courses[courseId];
        if (!course) return;
        
        if (this.userCourses.completed.includes(courseId)) {
            alert('You have already completed this course!');
            return;
        }
        
        // Confirm completion
        if (!confirm(`Mark "${course.title}" as complete?\n\nYou will receive ${course.rewardGBUV} GBUV as a reward!`)) {
            return;
        }
        
        // Mark complete
        this.userCourses.completed.push(courseId);
        this.userCourses.inProgress = this.userCourses.inProgress.filter(id => id !== courseId);
        await this.saveUserData();
        
        // Grant GBUV reward
        this.grantCourseReward(courseId, course.rewardGBUV);
        
        // Close modal
        document.getElementById('course-content-modal')?.remove();
        
        // Show celebration
        this.showCompletionCelebration(course);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('courseCompleted', {
            detail: { courseId, course, reward: course.rewardGBUV }
        }));
    },
    
    /**
     * Grant course completion reward
     */
    grantCourseReward(courseId, gbuvAmount) {
        // Dispatch to unified rewards system
        window.dispatchEvent(new CustomEvent('contributionReward', {
            detail: { gbuv: gbuvAmount, source: 'course_completion', courseId }
        }));
        
        console.log(`🎁 Course reward granted: ${gbuvAmount} GBUV`);
    },
    
    /**
     * Show completion celebration
     */
    showCompletionCelebration(course) {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-modal';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <h2>Course Complete!</h2>
                <h3>${course.title}</h3>
                <div class="reward-display">
                    <span class="reward-label">You Earned:</span>
                    <span class="reward-amount">${course.rewardGBUV} GBUV</span>
                    <span class="reward-usd">($${this.config.courseCompletionReward})</span>
                </div>
                <p>Knowledge gained + tokens earned = winning combination!</p>
                <button onclick="this.closest('.celebration-modal').remove()" class="continue-btn">
                    Continue Learning
                </button>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Auto-remove after 5 seconds
        setTimeout(() => celebration.remove(), 5000);
    },
    
    /**
     * Handle course completion event
     */
    handleCourseCompletion(detail) {
        const { courseId, completed } = detail;
        if (completed && !this.userCourses.completed.includes(courseId)) {
            this.markCourseComplete(courseId);
        }
    },
    
    /**
     * Get user course progress
     */
    getUserProgress() {
        return {
            totalCourses: Object.keys(this.courses).length,
            purchased: this.userCourses.purchased.length,
            inProgress: this.userCourses.inProgress.length,
            completed: this.userCourses.completed.length,
            hasMembership: this.config.pooledMembershipActive,
            totalRewardsEarned: this.userCourses.completed.length * 20 // 20 GBUV per course
        };
    },
    
    /**
     * Show notification
     */
    showNotification(title, message) {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(title, message);
        } else {
            alert(`${title}\n\n${message}`);
        }
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CoursePaymentSystem.init());
} else {
    CoursePaymentSystem.init();
}

// Export to window
window.CoursePaymentSystem = CoursePaymentSystem;
