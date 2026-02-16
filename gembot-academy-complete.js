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
 * File: gembot-academy-complete.js
 * Declaration ID: IP-39A7D478-MLL28ZUU
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GEMBOT ACADEMY COMPLETE - Professional Lapidary Certification System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 13-Tier Professional Certification Program with:
 * - Month-long courses per tier
 * - Real lapidary resources (Sinkankas, Hannam, IGS, USFG)
 * - Quiz validation system (anti-cheat)
 * - GBUV certification payments with score-based discounts
 * - Burn/Lock mechanics for token value
 * - Real-world benefits and discounts
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const GemBotAcademyComplete = {
    version: '3.0.0',
    initialized: false,

    // ═══════════════════════════════════════════════════════════════════════════
    // PROFESSIONAL RESOURCE LIBRARY
    // ═══════════════════════════════════════════════════════════════════════════
    
    resources: {
        // Primary Textbooks
        textbooks: [
            {
                id: 'sinkankas_manual',
                title: 'Gem Cutting: A Lapidary\'s Manual',
                author: 'John Sinkankas',
                description: 'The "bible" of lapidary - comprehensive guide from basics to advanced',
                url: 'https://archive.org/details/gemcuttinglapida00sink',
                type: 'primary',
                tier: 1
            },
            {
                id: 'hannam_faceting',
                title: 'Faceting Made Easy',
                author: 'Trevor Hannam',
                description: 'Beginner-friendly guide simplifying faceting math',
                url: 'https://www.gemsociety.org/article/faceting-made-easy/',
                type: 'primary',
                tier: 1
            },
            {
                id: 'walter_gemcutting',
                title: 'Gem Cutting is Easy',
                author: 'Martin Walter',
                description: 'Foundational text for beginners',
                url: 'https://archive.org/details/gemcuttingiseasy0000walt',
                type: 'primary',
                tier: 1
            },
            {
                id: 'baxter_metalcraft',
                title: 'Jewelry Gem Cutting and Metalcraft',
                author: 'William T. Baxter',
                description: 'Historical and practical perspective on lapidary',
                url: 'https://archive.org/details/jewelrygemcuttin00baxt',
                type: 'supplementary',
                tier: 2
            },
            {
                id: 'claremont_craft',
                title: 'The Gem-Cutter\'s Craft',
                author: 'Leopold Claremont',
                description: 'Historical reference (1906) on diamond and Oriental gem cutting',
                url: 'https://gemologyonline.com/gill-library/',
                type: 'historical',
                tier: 5
            }
        ],

        // eBooks & Guides
        ebooks: [
            {
                id: 'first_twelve',
                title: 'Faceting Your First Twelve Gemstones',
                author: 'Andrew Brown & Mark Oros',
                description: '12 optimized designs of increasing difficulty',
                url: 'https://ultratec-facet.com/learning/',
                type: 'practical',
                tier: 2
            },
            {
                id: 'complete_lapidary',
                title: 'The Complete Lapidary Experience',
                author: 'Interweave',
                description: 'Covers rough hunting, trim saws, grinding, and polishing',
                url: 'https://www.interweave.com/',
                type: 'comprehensive',
                tier: 1
            }
        ],

        // Online Libraries
        libraries: [
            {
                id: 'gill_library',
                name: 'Joseph Gill Gemologist Library',
                url: 'https://gemologyonline.com/gill-library/',
                description: 'Massive collection of rare and out-of-print gemology books'
            },
            {
                id: 'usfg',
                name: 'US Faceters Guild',
                url: 'https://usfacetersguild.org/',
                description: 'Free PDFs, faceting diagrams, and educational articles'
            },
            {
                id: 'gemology_project',
                name: 'The Gemology Project',
                url: 'https://www.gemologyproject.com/',
                description: 'Thousands of gem-cutting diagrams searchable by material and RI'
            },
            {
                id: 'igs',
                name: 'International Gem Society',
                url: 'https://www.gemsociety.org/',
                description: 'Comprehensive gemology education and resources'
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 13-TIER CERTIFICATION PROGRAM
    // ═══════════════════════════════════════════════════════════════════════════
    
    certificationTiers: [
        // TIER 1: FOUNDATIONS (Month 1)
        {
            tier: 1,
            name: 'Lapidary Foundations',
            icon: '🔰',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 500, currency: 'GBUV' },  // ~$25 at base rate
            prerequisites: [],
            benefits: {
                discount: 5,  // 5% off rough stones
                badge: 'Foundation Graduate',
                gbuvBonus: 100,
                realWorldPerks: ['5% discount on mineral rough at partner stores']
            },
            description: 'Master the fundamentals of gemstone identification, safety, and basic equipment operation.',
            weeklyStructure: [
                {
                    week: 1,
                    theme: 'Introduction to Gemology',
                    days: [
                        { day: 1, title: 'Welcome to Lapidary', type: 'lecture', duration: 45, quiz: true },
                        { day: 2, title: 'Gemstone Classification', type: 'interactive', duration: 60, quiz: true },
                        { day: 3, title: 'The Mohs Hardness Scale', type: 'practical', duration: 45, quiz: true },
                        { day: 4, title: 'Crystal Systems Overview', type: 'lecture', duration: 50, quiz: true },
                        { day: 5, title: 'Optical Properties of Gems', type: 'interactive', duration: 55, quiz: true },
                        { day: 6, title: 'Week 1 Lab: Gem Identification', type: 'lab', duration: 90, quiz: false },
                        { day: 7, title: 'Week 1 Assessment', type: 'exam', duration: 60, quiz: true, minScore: 70 }
                    ]
                },
                {
                    week: 2,
                    theme: 'Safety & Equipment',
                    days: [
                        { day: 8, title: 'Workshop Safety Essentials', type: 'lecture', duration: 45, quiz: true },
                        { day: 9, title: 'Personal Protective Equipment', type: 'practical', duration: 40, quiz: true },
                        { day: 10, title: 'Understanding Your GemBot', type: 'interactive', duration: 60, quiz: true },
                        { day: 11, title: 'Lap Types & Selection', type: 'lecture', duration: 50, quiz: true },
                        { day: 12, title: 'Dop Sticks & Waxes', type: 'practical', duration: 45, quiz: true },
                        { day: 13, title: 'Week 2 Lab: Equipment Setup', type: 'lab', duration: 90, quiz: false },
                        { day: 14, title: 'Week 2 Assessment', type: 'exam', duration: 60, quiz: true, minScore: 70 }
                    ]
                },
                {
                    week: 3,
                    theme: 'Basic Cutting Theory',
                    days: [
                        { day: 15, title: 'Light & Refraction in Gems', type: 'lecture', duration: 55, quiz: true },
                        { day: 16, title: 'Critical Angle Explained', type: 'interactive', duration: 60, quiz: true },
                        { day: 17, title: 'Basic Facet Geometry', type: 'lecture', duration: 50, quiz: true },
                        { day: 18, title: 'Reading Faceting Diagrams', type: 'practical', duration: 60, quiz: true },
                        { day: 19, title: 'Index Gear Mathematics', type: 'interactive', duration: 55, quiz: true },
                        { day: 20, title: 'Week 3 Lab: Diagram Practice', type: 'lab', duration: 90, quiz: false },
                        { day: 21, title: 'Week 3 Assessment', type: 'exam', duration: 60, quiz: true, minScore: 70 }
                    ]
                },
                {
                    week: 4,
                    theme: 'Your First Cut',
                    days: [
                        { day: 22, title: 'Selecting Your First Stone', type: 'lecture', duration: 45, quiz: true },
                        { day: 23, title: 'Dopping Techniques', type: 'practical', duration: 60, quiz: true },
                        { day: 24, title: 'Cutting Your First Facets', type: 'interactive', duration: 75, quiz: true },
                        { day: 25, title: 'Meet Point Control', type: 'practical', duration: 60, quiz: true },
                        { day: 26, title: 'Basic Polishing Principles', type: 'lecture', duration: 50, quiz: true },
                        { day: 27, title: 'Final Lab: Complete Simple Cut', type: 'lab', duration: 120, quiz: false },
                        { day: 28, title: 'Practical Skills Evaluation', type: 'practical_exam', duration: 90, quiz: true, minScore: 75 },
                        { day: 29, title: 'Written Final Exam', type: 'exam', duration: 90, quiz: true, minScore: 70 },
                        { day: 30, title: 'Certification Review & Graduation', type: 'review', duration: 60, quiz: false }
                    ]
                }
            ]
        },

        // TIER 2: CABOCHON SPECIALIST
        {
            tier: 2,
            name: 'Cabochon Specialist',
            icon: '🥚',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 750, currency: 'GBUV' },
            prerequisites: [1],
            benefits: {
                discount: 8,
                badge: 'Cabochon Artisan',
                gbuvBonus: 200,
                realWorldPerks: ['8% discount on cabbing rough', 'Free shipping on orders over $50']
            },
            description: 'Master the art of cabochon cutting - domed gems for jewelry settings.'
        },

        // TIER 3: STANDARD BRILLIANT CUTTER
        {
            tier: 3,
            name: 'Standard Brilliant Cutter',
            icon: '💎',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 1000, currency: 'GBUV' },
            prerequisites: [1],
            benefits: {
                discount: 10,
                badge: 'Brilliant Cut Specialist',
                gbuvBonus: 300,
                realWorldPerks: ['10% discount on faceting rough', 'Access to premium rough selections']
            },
            description: 'Learn to cut the classic Standard Round Brilliant - 57 facets of perfection.'
        },

        // TIER 4: QUARTZ MASTER
        {
            tier: 4,
            name: 'Quartz Master',
            icon: '🔮',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 1250, currency: 'GBUV' },
            prerequisites: [2, 3],
            benefits: {
                discount: 12,
                badge: 'Quartz Virtuoso',
                gbuvBonus: 400,
                realWorldPerks: ['12% discount on quartz varieties', 'Exclusive quartz rough bundles']
            },
            description: 'Specialize in the vast quartz family - amethyst, citrine, smoky, rose, and more.'
        },

        // TIER 5: BERYL SPECIALIST
        {
            tier: 5,
            name: 'Beryl Specialist',
            icon: '💚',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 1500, currency: 'GBUV' },
            prerequisites: [3, 4],
            benefits: {
                discount: 15,
                badge: 'Beryl Expert',
                gbuvBonus: 500,
                realWorldPerks: ['15% discount on beryl rough', 'Priority access to emerald/aquamarine']
            },
            description: 'Master cutting emerald, aquamarine, morganite, and heliodor.'
        },

        // TIER 6: CORUNDUM CUTTER
        {
            tier: 6,
            name: 'Corundum Cutter',
            icon: '❤️',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 2000, currency: 'GBUV' },
            prerequisites: [5],
            benefits: {
                discount: 18,
                badge: 'Sapphire & Ruby Specialist',
                gbuvBonus: 750,
                realWorldPerks: ['18% off corundum rough', 'Access to Ceylon sapphire parcels']
            },
            description: 'Handle the challenge of sapphires and rubies - hardness 9 cutting techniques.'
        },

        // TIER 7: FANCY SHAPE DESIGNER
        {
            tier: 7,
            name: 'Fancy Shape Designer',
            icon: '✨',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 2500, currency: 'GBUV' },
            prerequisites: [3, 6],
            benefits: {
                discount: 20,
                badge: 'Shape Innovator',
                gbuvBonus: 1000,
                realWorldPerks: ['20% off all rough', 'Custom rough selection service']
            },
            description: 'Hearts, marquise, pear, cushion, and other fancy shapes.'
        },

        // TIER 8: PRECISION TECHNICIAN
        {
            tier: 8,
            name: 'Precision Technician',
            icon: '🎯',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 3000, currency: 'GBUV' },
            prerequisites: [7],
            benefits: {
                discount: 22,
                badge: 'Precision Master',
                gbuvBonus: 1250,
                realWorldPerks: ['22% off premium rough', '$50 credit for GemBot accessories']
            },
            description: 'Achieve competition-level precision - tolerances within 0.01mm.'
        },

        // TIER 9: CONCAVE CUTTING SPECIALIST
        {
            tier: 9,
            name: 'Concave Cutting Specialist',
            icon: '🌀',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 3500, currency: 'GBUV' },
            prerequisites: [8],
            benefits: {
                discount: 25,
                badge: 'Concave Artist',
                gbuvBonus: 1500,
                realWorldPerks: ['25% off all purchases', 'Free concave cutting tools']
            },
            description: 'Master the art of concave faceting for unique optical effects.'
        },

        // TIER 10: FANTASY CUT ARTIST
        {
            tier: 10,
            name: 'Fantasy Cut Artist',
            icon: '🎨',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 4000, currency: 'GBUV' },
            prerequisites: [9],
            benefits: {
                discount: 28,
                badge: 'Fantasy Virtuoso',
                gbuvBonus: 2000,
                realWorldPerks: ['28% off all products', 'Featured artist showcase']
            },
            description: 'Create sculptural fantasy cuts that blur the line between gem and art.'
        },

        // TIER 11: COMPETITION CUTTER
        {
            tier: 11,
            name: 'Competition Cutter',
            icon: '🏆',
            duration: '30 days',
            lessons: 30,
            certCost: { base: 5000, currency: 'GBUV' },
            prerequisites: [8, 10],
            benefits: {
                discount: 30,
                badge: 'Competition Champion',
                gbuvBonus: 2500,
                realWorldPerks: ['30% off everything', 'Entry fee coverage for USFG competitions']
            },
            description: 'Prepare for professional gem cutting competitions with judging criteria.'
        },

        // TIER 12: MASTER LAPIDARY
        {
            tier: 12,
            name: 'Master Lapidary',
            icon: '👑',
            duration: '45 days',
            lessons: 45,
            certCost: { base: 7500, currency: 'GBUV' },
            prerequisites: [11],
            benefits: {
                discount: 35,
                badge: 'Master Lapidary',
                gbuvBonus: 5000,
                realWorldPerks: ['35% lifetime discount', '$200 credit for GemBot machines', 'Instructor eligibility']
            },
            description: 'The comprehensive master certification covering all techniques and materials.'
        },

        // TIER 13: GRAND MASTER ARTISAN
        {
            tier: 13,
            name: 'Grand Master Artisan',
            icon: '🌟',
            duration: '60 days',
            lessons: 60,
            certCost: { base: 10000, currency: 'GBUV' },
            prerequisites: [12],
            benefits: {
                discount: 50,
                badge: 'Grand Master',
                gbuvBonus: 10000,
                realWorldPerks: [
                    '50% lifetime discount on all products',
                    'Free GemBot Micro machine',
                    'VIP access to Austin Moore jewelry collections',
                    'Teaching certification',
                    'Revenue share on courses created'
                ]
            },
            description: 'The pinnacle of lapidary achievement. Create original designs and teach others.'
        }
    ],

    // ═══════════════════════════════════════════════════════════════════════════
    // QUIZ & ANTI-CHEAT SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    quizSystem: {
        // Question pools by tier and topic
        questionPools: {},
        
        // Anti-cheat measures
        antiCheat: {
            minTimePerQuestion: 8000,      // Min 8 seconds per question
            maxTimePerQuestion: 300000,    // Max 5 minutes per question
            tabSwitchPenalty: 10,          // -10% per tab switch
            maxTabSwitches: 3,             // More than 3 = auto-fail
            randomizeQuestions: true,
            randomizeAnswers: true,
            preventCopyPaste: true,
            requireWebcam: false,          // Optional for higher tiers
            ipTracking: true,
            deviceFingerprinting: true
        },

        // Generate quiz from pool
        generateQuiz(tier, topic, numQuestions = 10) {
            const pool = this.questionPools[`tier${tier}_${topic}`] || [];
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, numQuestions).map(q => ({
                ...q,
                answers: q.randomizeAnswers !== false 
                    ? [...q.answers].sort(() => Math.random() - 0.5)
                    : q.answers,
                startTime: null,
                answered: false
            }));
        },

        // Validate answer with anti-cheat
        validateAnswer(question, answerIndex, timeSpent, tabSwitches) {
            const result = {
                correct: false,
                penalty: 0,
                cheatingDetected: false,
                message: ''
            };

            // Time checks
            if (timeSpent < this.antiCheat.minTimePerQuestion) {
                result.penalty += 20;
                result.cheatingDetected = true;
                result.message = 'Answer submitted too quickly - possible cheating detected';
            }

            // Tab switch penalty
            if (tabSwitches > 0) {
                result.penalty += tabSwitches * this.antiCheat.tabSwitchPenalty;
                if (tabSwitches > this.antiCheat.maxTabSwitches) {
                    result.cheatingDetected = true;
                    result.message = 'Excessive tab switching detected - quiz invalidated';
                }
            }

            // Check answer
            const correctIndex = question.answers.findIndex(a => a.correct);
            result.correct = answerIndex === correctIndex;

            return result;
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CERTIFICATION PAYMENT SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    certification: {
        // Calculate cert cost based on performance
        calculateCertCost(tier, averageScore, perfectQuizzes, completionTime) {
            const tierInfo = GemBotAcademyComplete.certificationTiers[tier - 1];
            let cost = tierInfo.certCost.base;

            // Score-based discounts
            if (averageScore >= 95) {
                cost *= 0.10;  // 90% discount for near-perfect
            } else if (averageScore >= 90) {
                cost *= 0.25;  // 75% discount
            } else if (averageScore >= 85) {
                cost *= 0.40;  // 60% discount
            } else if (averageScore >= 80) {
                cost *= 0.60;  // 40% discount
            } else if (averageScore >= 75) {
                cost *= 0.80;  // 20% discount
            }

            // Bonus discounts
            if (perfectQuizzes > 5) {
                cost *= 0.90;  // Extra 10% off for 5+ perfect quizzes
            }

            // Fast completion bonus
            const expectedDays = tierInfo.duration.replace(' days', '');
            if (completionTime < expectedDays * 0.8) {
                cost *= 0.95;  // 5% off for early completion
            }

            return Math.max(Math.floor(cost), 50);  // Minimum 50 GBUV (~$2.50)
        },

        // Process certification payment
        async processCertification(userId, tier, paymentMethod = 'gbuv') {
            const tierInfo = GemBotAcademyComplete.certificationTiers[tier - 1];
            const userProgress = await this.getUserProgress(userId, tier);
            
            if (!userProgress.completed) {
                throw new Error('Course not completed');
            }

            const cost = this.calculateCertCost(
                tier,
                userProgress.averageScore,
                userProgress.perfectQuizzes,
                userProgress.completionDays
            );

            // Create certificate
            const certificate = {
                id: `CERT-${tier}-${userId}-${Date.now()}`,
                userId,
                tier,
                tierName: tierInfo.name,
                issuedAt: new Date().toISOString(),
                averageScore: userProgress.averageScore,
                completionDays: userProgress.completionDays,
                benefits: tierInfo.benefits,
                signature: this.generateSignature(userId, tier),
                nftMintable: true  // Can mint as NFT on Solana
            };

            // Dispatch payment event
            window.dispatchEvent(new CustomEvent('certificationPayment', {
                detail: { userId, tier, cost, certificate }
            }));

            return certificate;
        },

        generateSignature(userId, tier) {
            const data = `${userId}-${tier}-${Date.now()}-GEMBOT-ACADEMY`;
            return btoa(data);
        },

        async getUserProgress(userId, tier) {
            // Load from Firebase or localStorage
            const saved = localStorage.getItem(`academy_progress_${userId}_tier${tier}`);
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                completed: false,
                averageScore: 0,
                perfectQuizzes: 0,
                completionDays: 0
            };
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // GBUV BURN/LOCK MECHANICS
    // ═══════════════════════════════════════════════════════════════════════════

    tokenMechanics: {
        // Burn tokens permanently (increases scarcity)
        async burnTokens(userId, amount, reason = 'voluntary_burn') {
            if (amount <= 0) throw new Error('Invalid burn amount');

            const burnRecord = {
                id: `BURN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId,
                amount,
                reason,
                timestamp: new Date().toISOString(),
                txHash: null  // Will be filled with Solana tx hash
            };

            // Calculate value impact
            const impactEstimate = this.calculateBurnImpact(amount);

            // Dispatch burn event
            window.dispatchEvent(new CustomEvent('gbuvBurn', {
                detail: { ...burnRecord, impactEstimate }
            }));

            console.log(`🔥 Burned ${amount} GBUV for user ${userId}`);
            return burnRecord;
        },

        // Lock tokens for a period (increases locked supply)
        async lockTokens(userId, amount, lockPeriod = '30_days') {
            if (amount <= 0) throw new Error('Invalid lock amount');

            const lockPeriods = {
                '30_days': { days: 30, bonusMultiplier: 1.05 },
                '90_days': { days: 90, bonusMultiplier: 1.15 },
                '180_days': { days: 180, bonusMultiplier: 1.30 },
                '365_days': { days: 365, bonusMultiplier: 1.50 },
                'permanent': { days: -1, bonusMultiplier: 2.00 }
            };

            const periodInfo = lockPeriods[lockPeriod];
            const unlockDate = periodInfo.days > 0 
                ? new Date(Date.now() + periodInfo.days * 24 * 60 * 60 * 1000)
                : null;

            const lockRecord = {
                id: `LOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId,
                amount,
                lockPeriod,
                lockedAt: new Date().toISOString(),
                unlockAt: unlockDate ? unlockDate.toISOString() : 'permanent',
                bonusMultiplier: periodInfo.bonusMultiplier,
                bonusEarned: Math.floor(amount * (periodInfo.bonusMultiplier - 1)),
                status: 'locked'
            };

            // Dispatch lock event
            window.dispatchEvent(new CustomEvent('gbuvLock', {
                detail: lockRecord
            }));

            console.log(`🔒 Locked ${amount} GBUV for ${lockPeriod}`);
            return lockRecord;
        },

        // Calculate burn impact on token value
        calculateBurnImpact(burnAmount) {
            // Simplified model - actual impact depends on total supply
            const totalSupply = 1000000000;  // 1 billion total
            const burnPercentage = (burnAmount / totalSupply) * 100;
            const valueImpact = burnPercentage * 1.5;  // 1.5x leverage on value

            return {
                burnPercentage: burnPercentage.toFixed(8),
                estimatedValueIncrease: `${valueImpact.toFixed(4)}%`,
                message: `Burning ${burnAmount} GBUV reduces supply by ${burnPercentage.toFixed(8)}%`
            };
        },

        // Get user's locked tokens
        async getLockedTokens(userId) {
            const saved = localStorage.getItem(`gbuv_locks_${userId}`);
            return saved ? JSON.parse(saved) : [];
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // REAL-WORLD BENEFITS SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    benefits: {
        // Partner stores
        partners: [
            {
                id: 'earthartgems',
                name: 'Earth Art Gems',
                website: 'https://earthartgems.com',
                discountCode: 'GEMBOT',
                categories: ['rough', 'cabbing', 'faceting']
            },
            {
                id: 'austin_moore_jewelry',
                name: 'Austin Moore Jewelry',
                website: 'https://austinmoorejewelry.com',
                discountCode: 'GEMBOTACADEMY',
                categories: ['jewelry', 'custom', 'gemstones']
            },
            {
                id: 'gembot_machines',
                name: 'GemBot Machines',
                website: 'https://barbrickdesign.github.io/GemBotAiWebControl/',
                discountCode: 'CERTIFIED',
                categories: ['machines', 'accessories', 'parts']
            }
        ],

        // Generate discount code for user based on certification
        generateDiscountCode(userId, tierLevel) {
            const tierInfo = GemBotAcademyComplete.certificationTiers[tierLevel - 1];
            const code = `GEMBOT${tierLevel}-${userId.substr(0, 6).toUpperCase()}-${tierInfo.benefits.discount}OFF`;
            
            return {
                code,
                discount: tierInfo.benefits.discount,
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                applicableTo: this.partners.map(p => p.name)
            };
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    async init() {
        console.log('🎓 GemBot Academy Complete v3.0 initializing...');

        // Load question pools
        await this.loadQuestionPools();

        // Setup event listeners
        this.setupEventListeners();

        // Create UI
        this.createUI();

        this.initialized = true;
        console.log('✅ GemBot Academy Complete ready!');
        console.log(`📚 ${this.certificationTiers.length} certification tiers available`);
        console.log(`📖 ${this.resources.textbooks.length} professional textbooks integrated`);

        return this;
    },

    async loadQuestionPools() {
        // Generate comprehensive question pools for each tier
        this.quizSystem.questionPools = {
            tier1_gemology: this.generateTier1GemologyQuestions(),
            tier1_safety: this.generateTier1SafetyQuestions(),
            tier1_equipment: this.generateTier1EquipmentQuestions(),
            tier1_theory: this.generateTier1TheoryQuestions()
        };
    },

    generateTier1GemologyQuestions() {
        return [
            {
                id: 'g1_01',
                question: 'What scale is used to measure mineral hardness?',
                answers: [
                    { text: 'Mohs Scale', correct: true },
                    { text: 'Richter Scale', correct: false },
                    { text: 'Vickers Scale', correct: false },
                    { text: 'Brinell Scale', correct: false }
                ],
                explanation: 'The Mohs Scale, developed by Friedrich Mohs in 1812, ranks minerals 1-10 based on scratch resistance.',
                resource: 'sinkankas_manual',
                chapter: 2
            },
            {
                id: 'g1_02',
                question: 'What is the hardness of diamond on the Mohs scale?',
                answers: [
                    { text: '10', correct: true },
                    { text: '9', correct: false },
                    { text: '8', correct: false },
                    { text: '7', correct: false }
                ],
                explanation: 'Diamond is the hardest natural material at Mohs 10.',
                resource: 'sinkankas_manual',
                chapter: 2
            },
            {
                id: 'g1_03',
                question: 'Which property describes how light bends when entering a gemstone?',
                answers: [
                    { text: 'Refraction', correct: true },
                    { text: 'Reflection', correct: false },
                    { text: 'Dispersion', correct: false },
                    { text: 'Absorption', correct: false }
                ],
                explanation: 'Refraction is the bending of light as it passes from one medium to another.',
                resource: 'hannam_faceting',
                chapter: 3
            },
            {
                id: 'g1_04',
                question: 'What crystal system does quartz belong to?',
                answers: [
                    { text: 'Hexagonal/Trigonal', correct: true },
                    { text: 'Cubic', correct: false },
                    { text: 'Orthorhombic', correct: false },
                    { text: 'Monoclinic', correct: false }
                ],
                explanation: 'Quartz crystallizes in the hexagonal/trigonal crystal system.',
                resource: 'sinkankas_manual',
                chapter: 4
            },
            {
                id: 'g1_05',
                question: 'What causes the play of colors in opal?',
                answers: [
                    { text: 'Diffraction of light through silica spheres', correct: true },
                    { text: 'Chemical impurities', correct: false },
                    { text: 'Crystal structure', correct: false },
                    { text: 'Surface coating', correct: false }
                ],
                explanation: 'Opal\'s play of color comes from diffraction of light through its internal structure of silica spheres.',
                resource: 'sinkankas_manual',
                chapter: 6
            },
            {
                id: 'g1_06',
                question: 'What mineral family includes ruby and sapphire?',
                answers: [
                    { text: 'Corundum', correct: true },
                    { text: 'Beryl', correct: false },
                    { text: 'Quartz', correct: false },
                    { text: 'Feldspar', correct: false }
                ],
                explanation: 'Ruby and sapphire are both varieties of corundum (Al2O3).',
                resource: 'sinkankas_manual',
                chapter: 5
            },
            {
                id: 'g1_07',
                question: 'What is the refractive index (RI) of quartz approximately?',
                answers: [
                    { text: '1.54-1.55', correct: true },
                    { text: '1.76-1.77', correct: false },
                    { text: '2.42', correct: false },
                    { text: '1.33', correct: false }
                ],
                explanation: 'Quartz has an RI of approximately 1.544-1.553.',
                resource: 'hannam_faceting',
                chapter: 4
            },
            {
                id: 'g1_08',
                question: 'What causes the green color in emerald?',
                answers: [
                    { text: 'Chromium and/or vanadium', correct: true },
                    { text: 'Iron', correct: false },
                    { text: 'Manganese', correct: false },
                    { text: 'Copper', correct: false }
                ],
                explanation: 'Emerald\'s green color is caused by trace amounts of chromium and/or vanadium.',
                resource: 'sinkankas_manual',
                chapter: 7
            },
            {
                id: 'g1_09',
                question: 'What is cleavage in gemology?',
                answers: [
                    { text: 'The tendency to break along specific crystallographic planes', correct: true },
                    { text: 'The way light reflects', correct: false },
                    { text: 'A type of fracture', correct: false },
                    { text: 'Color zoning', correct: false }
                ],
                explanation: 'Cleavage is the tendency of minerals to break along planes of weak atomic bonding.',
                resource: 'sinkankas_manual',
                chapter: 3
            },
            {
                id: 'g1_10',
                question: 'Which gem has the highest refractive index of these options?',
                answers: [
                    { text: 'Diamond (2.42)', correct: true },
                    { text: 'Sapphire (1.77)', correct: false },
                    { text: 'Topaz (1.62)', correct: false },
                    { text: 'Quartz (1.54)', correct: false }
                ],
                explanation: 'Diamond has an RI of 2.417, giving it exceptional brilliance.',
                resource: 'hannam_faceting',
                chapter: 5
            }
        ];
    },

    generateTier1SafetyQuestions() {
        return [
            {
                id: 's1_01',
                question: 'What is the MOST important safety equipment when faceting?',
                answers: [
                    { text: 'Safety glasses/goggles', correct: true },
                    { text: 'Gloves', correct: false },
                    { text: 'Apron', correct: false },
                    { text: 'Face shield', correct: false }
                ],
                explanation: 'Safety glasses protect your eyes from flying particles and splashing coolant.',
                resource: 'sinkankas_manual',
                chapter: 1
            },
            {
                id: 's1_02',
                question: 'Why is proper ventilation important in a lapidary workshop?',
                answers: [
                    { text: 'To remove harmful dust particles', correct: true },
                    { text: 'To keep cool', correct: false },
                    { text: 'To reduce noise', correct: false },
                    { text: 'To dry stones faster', correct: false }
                ],
                explanation: 'Silica dust from cutting can cause serious respiratory issues including silicosis.',
                resource: 'sinkankas_manual',
                chapter: 1
            },
            {
                id: 's1_03',
                question: 'What should you do before starting any cutting operation?',
                answers: [
                    { text: 'Inspect all equipment and ensure emergency stop is accessible', correct: true },
                    { text: 'Turn off the lights', correct: false },
                    { text: 'Remove safety guards', correct: false },
                    { text: 'Increase lap speed to maximum', correct: false }
                ],
                explanation: 'Always verify equipment condition and know where emergency controls are.',
                resource: 'walter_gemcutting',
                chapter: 2
            },
            {
                id: 's1_04',
                question: 'Which of these materials requires special handling due to toxicity?',
                answers: [
                    { text: 'Malachite (copper carbonate)', correct: true },
                    { text: 'Quartz', correct: false },
                    { text: 'Topaz', correct: false },
                    { text: 'Garnet', correct: false }
                ],
                explanation: 'Malachite dust contains copper compounds that are toxic if inhaled or ingested.',
                resource: 'sinkankas_manual',
                chapter: 1
            },
            {
                id: 's1_05',
                question: 'What is the proper way to clean up lapidary dust?',
                answers: [
                    { text: 'Wet wipe or HEPA vacuum', correct: true },
                    { text: 'Dry sweep with broom', correct: false },
                    { text: 'Blow with compressed air', correct: false },
                    { text: 'Leave it for later', correct: false }
                ],
                explanation: 'Wet cleaning or HEPA vacuums prevent dust from becoming airborne.',
                resource: 'sinkankas_manual',
                chapter: 1
            }
        ];
    },

    generateTier1EquipmentQuestions() {
        return [
            {
                id: 'e1_01',
                question: 'What is a dop stick used for?',
                answers: [
                    { text: 'Holding the gemstone during cutting', correct: true },
                    { text: 'Measuring angles', correct: false },
                    { text: 'Applying polish', correct: false },
                    { text: 'Cleaning the lap', correct: false }
                ],
                explanation: 'Dop sticks hold gemstones securely for faceting operations.',
                resource: 'hannam_faceting',
                chapter: 2
            },
            {
                id: 'e1_02',
                question: 'What does the index gear on a faceting machine control?',
                answers: [
                    { text: 'The rotational position of the stone', correct: true },
                    { text: 'The cutting speed', correct: false },
                    { text: 'The depth of cut', correct: false },
                    { text: 'The polish type', correct: false }
                ],
                explanation: 'The index gear divides the rotation into precise increments for facet placement.',
                resource: 'hannam_faceting',
                chapter: 3
            },
            {
                id: 'e1_03',
                question: 'What grit range is typically used for initial rough grinding?',
                answers: [
                    { text: '180-325 grit', correct: true },
                    { text: '1200-3000 grit', correct: false },
                    { text: '8000-14000 grit', correct: false },
                    { text: '50000+ grit', correct: false }
                ],
                explanation: 'Coarse grits (180-325) remove material quickly for initial shaping.',
                resource: 'sinkankas_manual',
                chapter: 8
            },
            {
                id: 'e1_04',
                question: 'What is the mast/quill on a faceting machine?',
                answers: [
                    { text: 'The vertical post that holds the handpiece', correct: true },
                    { text: 'The spinning lap', correct: false },
                    { text: 'The motor housing', correct: false },
                    { text: 'The splash guard', correct: false }
                ],
                explanation: 'The mast provides the vertical axis and angle measurement for faceting.',
                resource: 'hannam_faceting',
                chapter: 2
            },
            {
                id: 'e1_05',
                question: 'What type of lap is commonly used for polishing quartz?',
                answers: [
                    { text: 'Ceramic or oxide lap with cerium oxide', correct: true },
                    { text: 'Cast iron lap', correct: false },
                    { text: 'Steel cutting lap', correct: false },
                    { text: 'Copper lap with diamond', correct: false }
                ],
                explanation: 'Quartz polishes well on ceramic laps with cerium oxide compound.',
                resource: 'sinkankas_manual',
                chapter: 9
            }
        ];
    },

    generateTier1TheoryQuestions() {
        return [
            {
                id: 't1_01',
                question: 'What is the critical angle in gem cutting?',
                answers: [
                    { text: 'The angle at which light is totally internally reflected', correct: true },
                    { text: 'The maximum cutting angle', correct: false },
                    { text: 'The angle of the table facet', correct: false },
                    { text: 'The girdle thickness', correct: false }
                ],
                explanation: 'Below the critical angle, light is reflected back into the stone rather than escaping.',
                resource: 'hannam_faceting',
                chapter: 4
            },
            {
                id: 't1_02',
                question: 'What happens if pavilion angles are too shallow?',
                answers: [
                    { text: 'Light leaks out the bottom (windowing/fish-eye)', correct: true },
                    { text: 'The stone appears brighter', correct: false },
                    { text: 'Colors become more saturated', correct: false },
                    { text: 'The stone becomes harder', correct: false }
                ],
                explanation: 'Shallow pavilion angles cause light to leak through instead of reflecting.',
                resource: 'hannam_faceting',
                chapter: 5
            },
            {
                id: 't1_03',
                question: 'What is the typical pavilion angle for a standard round brilliant in quartz?',
                answers: [
                    { text: '42-43 degrees', correct: true },
                    { text: '30 degrees', correct: false },
                    { text: '55 degrees', correct: false },
                    { text: '90 degrees', correct: false }
                ],
                explanation: 'Quartz with RI ~1.54 typically uses 42-43° pavilion angles for good light return.',
                resource: 'hannam_faceting',
                chapter: 5
            },
            {
                id: 't1_04',
                question: 'What does "meet point" refer to in faceting?',
                answers: [
                    { text: 'Where multiple facet edges converge at a single point', correct: true },
                    { text: 'The center of the table', correct: false },
                    { text: 'Where the crown meets the pavilion', correct: false },
                    { text: 'The culet location', correct: false }
                ],
                explanation: 'Meet points are critical for precision - facets must meet exactly at points.',
                resource: 'sinkankas_manual',
                chapter: 10
            },
            {
                id: 't1_05',
                question: 'What is dispersion (fire) in gemstones?',
                answers: [
                    { text: 'The splitting of white light into spectral colors', correct: true },
                    { text: 'The total light reflection', correct: false },
                    { text: 'The gem\'s hardness', correct: false },
                    { text: 'Internal flaws', correct: false }
                ],
                explanation: 'Dispersion separates white light into rainbow colors, creating "fire".',
                resource: 'hannam_faceting',
                chapter: 4
            }
        ];
    },

    setupEventListeners() {
        // Listen for course completion
        window.addEventListener('lessonComplete', (e) => this.handleLessonComplete(e.detail));
        window.addEventListener('quizComplete', (e) => this.handleQuizComplete(e.detail));
        window.addEventListener('courseComplete', (e) => this.handleCourseComplete(e.detail));
    },

    handleLessonComplete(detail) {
        console.log('📖 Lesson completed:', detail);
        // Award XP and track progress
    },

    handleQuizComplete(detail) {
        console.log('📝 Quiz completed:', detail);
        // Validate score and update progress
    },

    handleCourseComplete(detail) {
        console.log('🎓 Course completed:', detail);
        // Check certification eligibility
    },

    createUI() {
        // Create academy UI elements
        console.log('🎨 Academy UI created');
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GemBotAcademyComplete.init());
} else {
    GemBotAcademyComplete.init();
}

// Export
window.GemBotAcademyComplete = GemBotAcademyComplete;
