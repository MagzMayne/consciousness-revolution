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
 * File: gembot-academy-13tier-system.js
 * Declaration ID: IP-4A56C2B5-MLL28ZUU
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GEMBOT ACADEMY 13-TIER CERTIFICATION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive lapidary education from beginner to master level
 * Month-long courses with quizzes, testing, and certifications
 * GBUV pricing with score-based discounts
 * 
 * RESOURCES INTEGRATED:
 * - Gem Cutting: A Lapidary's Manual by John Sinkankas (Internet Archive)
 * - Faceting Made Easy by Trevor Hannam (IGS)
 * - Gem Cutting is Easy by Martin Walter (Internet Archive)
 * - Faceting Your First Twelve Gemstones (Ultra Tec)
 * - GemologyOnline (Joseph Gill Library)
 * - US Faceters Guild (USFG)
 * - The Gemology Project
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 * ═══════════════════════════════════════════════════════════════════════════════
 */

window.GemBotAcademy13Tier = {
    version: '1.0.0',
    initialized: false,

    // ═══════════════════════════════════════════════════════════════════════════
    // TIER SYSTEM - 13 Levels from Beginner to Grand Master
    // ═══════════════════════════════════════════════════════════════════════════
    
    tiers: {
        // TIER 1-3: BEGINNER (Free)
        1: {
            id: 1,
            name: '🌱 Stone Seeker',
            level: 'Beginner',
            description: 'Your journey into the world of gemstones begins here',
            duration: '4 weeks',
            lessonCount: 20,
            requirements: { level: 1, previousTier: null },
            courseCost: { gbuv: 0, usd: 0 }, // FREE
            certificationCost: { gbuv: 50, usd: 2.50 },
            discountThresholds: { score90: 100, score80: 50, score70: 25 }, // % discount
            rewards: { xp: 500, gbuv: 100, badge: 'stone_seeker' },
            realWorldBenefits: ['10% off first gem rough purchase', 'Access to beginner forum'],
            topics: [
                'Introduction to Gemstones',
                'Types of Gem Materials', 
                'Basic Gem Identification',
                'The Mohs Hardness Scale',
                'Tools of the Trade Overview'
            ],
            resources: [
                { title: 'Gem Cutting is Easy - Martin Walter', url: 'https://archive.org/details/gemcuttingiseasy00walt', type: 'book' },
                { title: 'IGS - Getting Started', url: 'https://www.gemsociety.org/article/getting-started/', type: 'article' }
            ]
        },
        
        2: {
            id: 2,
            name: '🔍 Crystal Observer',
            level: 'Beginner+',
            description: 'Learn to see the hidden beauty within rough stones',
            duration: '4 weeks',
            lessonCount: 24,
            requirements: { level: 3, previousTier: 1 },
            courseCost: { gbuv: 0, usd: 0 }, // FREE
            certificationCost: { gbuv: 75, usd: 3.75 },
            discountThresholds: { score90: 100, score80: 50, score70: 25 },
            rewards: { xp: 750, gbuv: 150, badge: 'crystal_observer' },
            realWorldBenefits: ['15% off loupe purchase', 'Rough grading guide'],
            topics: [
                'Crystal Systems & Structures',
                'Light & Color in Gems',
                'Inclusions - Friends or Foes?',
                'Reading Rough for Potential',
                'Basic Gem Testing Methods'
            ],
            resources: [
                { title: 'The Gemology Project', url: 'https://gemologyproject.com/', type: 'wiki' },
                { title: 'GemologyOnline - Joseph Gill Library', url: 'https://gemologyonline.com/', type: 'library' }
            ]
        },
        
        3: {
            id: 3,
            name: '⚙️ Machine Apprentice',
            level: 'Beginner++',
            description: 'Master the basics of faceting machine operation',
            duration: '4 weeks',
            lessonCount: 28,
            requirements: { level: 5, previousTier: 2 },
            courseCost: { gbuv: 100, usd: 5 },
            certificationCost: { gbuv: 100, usd: 5 },
            discountThresholds: { score90: 100, score80: 50, score70: 25 },
            rewards: { xp: 1000, gbuv: 200, badge: 'machine_apprentice' },
            realWorldBenefits: ['Free machine manual PDF', 'Access to support forums'],
            topics: [
                'Faceting Machine Components',
                'GemBot CNC Operation Basics',
                'Setting Up Your Workspace',
                'Safety First - Best Practices',
                'Dopping Fundamentals',
                'Index Gears Explained'
            ],
            resources: [
                { title: 'Ultra Tec - Machine Setup', url: 'https://www.ultratec-facet.com/support/', type: 'manual' },
                { title: 'USFG - Getting Started', url: 'https://usfacetersguild.org/', type: 'guild' }
            ]
        },
        
        // TIER 4-6: INTERMEDIATE
        4: {
            id: 4,
            name: '✂️ First Faceter',
            level: 'Intermediate',
            description: 'Cut your first gemstones with confidence',
            duration: '5 weeks',
            lessonCount: 35,
            requirements: { level: 8, previousTier: 3 },
            courseCost: { gbuv: 200, usd: 10 },
            certificationCost: { gbuv: 150, usd: 7.50 },
            discountThresholds: { score90: 100, score80: 60, score70: 30 },
            rewards: { xp: 1500, gbuv: 300, badge: 'first_faceter' },
            realWorldBenefits: ['20% off practice rough', 'Pattern library access'],
            topics: [
                'Your First Standard Round Brilliant',
                'Understanding Pavilion & Crown',
                'Meet Point Technique',
                'Polishing Fundamentals',
                'Troubleshooting Common Issues',
                'Quality Self-Assessment'
            ],
            resources: [
                { title: 'Faceting Made Easy - Trevor Hannam (IGS)', url: 'https://www.gemsociety.org/faceting-made-easy/', type: 'book' },
                { title: 'Faceting Your First Twelve Gemstones - Ultra Tec', url: 'https://www.ultratec-facet.com/twelve-gemstones/', type: 'guide' }
            ]
        },
        
        5: {
            id: 5,
            name: '💎 Gem Shaper',
            level: 'Intermediate+',
            description: 'Expand your design repertoire beyond the basics',
            duration: '5 weeks',
            lessonCount: 40,
            requirements: { level: 12, previousTier: 4 },
            courseCost: { gbuv: 300, usd: 15 },
            certificationCost: { gbuv: 200, usd: 10 },
            discountThresholds: { score90: 100, score80: 60, score70: 30 },
            rewards: { xp: 2000, gbuv: 400, badge: 'gem_shaper' },
            realWorldBenefits: ['25% off lap supplies', 'Advanced pattern pack'],
            topics: [
                'Oval & Cushion Cuts',
                'Princess & Emerald Cuts',
                'Brilliant Variations',
                'Step Cut Mastery',
                'Mixed Cut Techniques',
                'Material-Specific Approaches'
            ],
            resources: [
                { title: 'Gem Cutting: A Lapidary\'s Manual - John Sinkankas', url: 'https://archive.org/details/gemcuttinglapida0000sink', type: 'book' },
                { title: 'IGS - Cut Catalog', url: 'https://www.gemsociety.org/article/faceting-designs/', type: 'catalog' }
            ]
        },
        
        6: {
            id: 6,
            name: '🔬 Precision Technician',
            level: 'Intermediate++',
            description: 'Achieve competition-level precision',
            duration: '6 weeks',
            lessonCount: 45,
            requirements: { level: 16, previousTier: 5 },
            courseCost: { gbuv: 400, usd: 20 },
            certificationCost: { gbuv: 250, usd: 12.50 },
            discountThresholds: { score90: 100, score80: 60, score70: 30 },
            rewards: { xp: 2500, gbuv: 500, badge: 'precision_tech' },
            realWorldBenefits: ['Competition entry discount', 'Judge feedback access'],
            topics: [
                'Meet Point Perfection',
                'Surface Quality Standards',
                'Girdle Uniformity',
                'Polish Grade Achievement',
                'Competition Judging Criteria',
                'USFG Competition Prep'
            ],
            resources: [
                { title: 'USFG Competition Guidelines', url: 'https://usfacetersguild.org/competitions/', type: 'guide' },
                { title: 'Australian Faceters Guild Standards', url: 'https://afg.org.au/', type: 'standards' }
            ]
        },
        
        // TIER 7-9: ADVANCED
        7: {
            id: 7,
            name: '⭐ Stone Artist',
            level: 'Advanced',
            description: 'Create artistic and complex designs',
            duration: '6 weeks',
            lessonCount: 50,
            requirements: { level: 20, previousTier: 6 },
            courseCost: { gbuv: 500, usd: 25 },
            certificationCost: { gbuv: 300, usd: 15 },
            discountThresholds: { score90: 100, score80: 70, score70: 35 },
            rewards: { xp: 3000, gbuv: 600, badge: 'stone_artist' },
            realWorldBenefits: ['Design submission rights', '30% off specialty laps'],
            topics: [
                'Fantasy Cut Fundamentals',
                'Concave Faceting Intro',
                'Barion Cut Mastery',
                'Portuguese Cuts',
                'Creating Optical Patterns',
                'Multi-Color Stone Planning'
            ],
            resources: [
                { title: 'Concave Cutting Techniques', url: 'https://gemologyproject.com/wiki/index.php?title=Concave_cutting', type: 'article' },
                { title: 'Fantasy Cut Designs - Various Artists', url: 'https://www.gemsociety.org/article/fantasy-cuts/', type: 'gallery' }
            ]
        },
        
        8: {
            id: 8,
            name: '🔥 Forge Master',
            level: 'Advanced+',
            description: 'Master difficult materials and challenging cuts',
            duration: '7 weeks',
            lessonCount: 55,
            requirements: { level: 25, previousTier: 7 },
            courseCost: { gbuv: 600, usd: 30 },
            certificationCost: { gbuv: 350, usd: 17.50 },
            discountThresholds: { score90: 100, score80: 70, score70: 35 },
            rewards: { xp: 4000, gbuv: 800, badge: 'forge_master' },
            realWorldBenefits: ['Rare material sourcing access', 'Priority rough selection'],
            topics: [
                'Cutting Sapphire & Ruby',
                'Emerald & Aquamarine Techniques',
                'Soft Stone Handling',
                'Heat Sensitive Materials',
                'Working with Cleavage Planes',
                'Handling Valuable Rough'
            ],
            resources: [
                { title: 'Corundum Cutting Guide', url: 'https://gemologyproject.com/wiki/index.php?title=Corundum', type: 'wiki' },
                { title: 'Material-Specific Techniques - IGS', url: 'https://www.gemsociety.org/faceting-tips/', type: 'tips' }
            ]
        },
        
        9: {
            id: 9,
            name: '💍 Ring Crafter',
            level: 'Advanced++',
            description: 'Create gems that fit perfectly in settings',
            duration: '7 weeks',
            lessonCount: 55,
            requirements: { level: 30, previousTier: 8 },
            courseCost: { gbuv: 700, usd: 35 },
            certificationCost: { gbuv: 400, usd: 20 },
            discountThresholds: { score90: 100, score80: 70, score70: 35 },
            rewards: { xp: 5000, gbuv: 1000, badge: 'ring_crafter' },
            realWorldBenefits: ['Jeweler partnership program', 'Setting material discounts'],
            topics: [
                'Cutting to Calibrated Sizes',
                'Custom Setting Specifications',
                'Re-cutting for Settings',
                'Matched Pairs & Sets',
                'CAD Integration',
                'Working with Jewelers'
            ],
            resources: [
                { title: 'Calibrated Stones Guide', url: 'https://www.gemsociety.org/article/calibrated-gems/', type: 'guide' },
                { title: 'Austin Moore Jewelry Collaboration', url: 'https://instagram.com/austinmoorejewelry', type: 'partner' }
            ]
        },
        
        // TIER 10-12: EXPERT
        10: {
            id: 10,
            name: '🌟 Light Master',
            level: 'Expert',
            description: 'Achieve optimal light performance in every cut',
            duration: '8 weeks',
            lessonCount: 60,
            requirements: { level: 35, previousTier: 9 },
            courseCost: { gbuv: 800, usd: 40 },
            certificationCost: { gbuv: 500, usd: 25 },
            discountThresholds: { score90: 100, score80: 75, score70: 40 },
            rewards: { xp: 6000, gbuv: 1200, badge: 'light_master' },
            realWorldBenefits: ['Premium valuation discount', 'Light analysis software'],
            topics: [
                'Ray Tracing Theory',
                'Critical Angle Optimization',
                'Brilliance vs Fire Balance',
                'Scintillation Patterns',
                'Computer-Aided Design Analysis',
                'GemRay & DiamCalc Mastery'
            ],
            resources: [
                { title: 'Light Performance Science', url: 'https://gemologyproject.com/wiki/index.php?title=Light_return', type: 'science' },
                { title: 'Optical Properties of Gemstones', url: 'https://www.gemsociety.org/article/optical-properties/', type: 'article' }
            ]
        },
        
        11: {
            id: 11,
            name: '📐 Design Engineer',
            level: 'Expert+',
            description: 'Create original designs that push boundaries',
            duration: '8 weeks',
            lessonCount: 60,
            requirements: { level: 40, previousTier: 10 },
            courseCost: { gbuv: 900, usd: 45 },
            certificationCost: { gbuv: 600, usd: 30 },
            discountThresholds: { score90: 100, score80: 75, score70: 40 },
            rewards: { xp: 8000, gbuv: 1600, badge: 'design_engineer' },
            realWorldBenefits: ['Design publication rights', 'Pattern royalties'],
            topics: [
                'Creating Original Designs',
                'GemCAD Mastery',
                'Mathematical Pattern Development',
                'Symmetry Groups in Design',
                'Publishing Your Designs',
                'Design Intellectual Property'
            ],
            resources: [
                { title: 'GemCAD Software', url: 'https://www.gemcad.com/', type: 'software' },
                { title: 'Design Theory - Jeff Graham', url: 'https://www.faceters.com/', type: 'designs' }
            ]
        },
        
        12: {
            id: 12,
            name: '🏆 Competition Champion',
            level: 'Expert++',
            description: 'Compete and win at the highest levels',
            duration: '8 weeks',
            lessonCount: 60,
            requirements: { level: 45, previousTier: 11 },
            courseCost: { gbuv: 1000, usd: 50 },
            certificationCost: { gbuv: 750, usd: 37.50 },
            discountThresholds: { score90: 100, score80: 75, score70: 40 },
            rewards: { xp: 10000, gbuv: 2000, badge: 'champion' },
            realWorldBenefits: ['Competition sponsorship', 'Industry recognition'],
            topics: [
                'International Competition Standards',
                'USFG Single Stone & Novice',
                'Australian Faceters Guild Events',
                'IFC Competition Prep',
                'Stone Selection Strategy',
                'Mental Game & Consistency'
            ],
            resources: [
                { title: 'USFG Competition Archive', url: 'https://usfacetersguild.org/', type: 'archive' },
                { title: 'IFC - International Faceting Challenge', url: 'https://www.faceters.com/ifc/', type: 'competition' }
            ]
        },
        
        // TIER 13: GRAND MASTER
        13: {
            id: 13,
            name: '👑 Grand Master',
            level: 'Grand Master',
            description: 'The pinnacle of gemstone artistry',
            duration: '12 weeks',
            lessonCount: 100,
            requirements: { level: 50, previousTier: 12, competitionWins: 1 },
            courseCost: { gbuv: 2000, usd: 100 },
            certificationCost: { gbuv: 1000, usd: 50 },
            discountThresholds: { score90: 100, score85: 75, score80: 50 },
            rewards: { xp: 20000, gbuv: 5000, badge: 'grand_master', title: 'GemBot Grand Master' },
            realWorldBenefits: [
                'Free lifetime academy access',
                'Teaching authorization',
                'Design partnership program',
                '50% discount on GemBot machines',
                'Austin Moore Jewelry collaboration',
                'Industry speaker invitations'
            ],
            topics: [
                'Advanced Concave Mastery',
                'Extreme Fantasy Cuts',
                'Museum-Quality Finishing',
                'Teaching & Mentorship',
                'Business of Faceting',
                'Legacy & Recognition',
                'Judging & Certification',
                'Industry Leadership'
            ],
            resources: [
                { title: 'Master Faceter Archives', url: 'https://gemologyproject.com/', type: 'archive' },
                { title: 'Industry Connections Network', url: 'https://www.gemsociety.org/professional/', type: 'network' }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // FREE LAPIDARY RESOURCES LIBRARY
    // ═══════════════════════════════════════════════════════════════════════════
    
    freeResources: {
        books: [
            {
                id: 'sinkankas',
                title: 'Gem Cutting: A Lapidary\'s Manual',
                author: 'John Sinkankas',
                url: 'https://archive.org/details/gemcuttinglapida0000sink',
                description: 'The definitive guide to gem cutting, considered the bible of lapidary',
                year: 1962,
                pages: 297,
                level: 'All Levels'
            },
            {
                id: 'hannam',
                title: 'Faceting Made Easy',
                author: 'Trevor Hannam',
                url: 'https://www.gemsociety.org/faceting-made-easy/',
                description: 'Step-by-step guide for beginners from IGS',
                year: 2015,
                pages: 120,
                level: 'Beginner'
            },
            {
                id: 'walter',
                title: 'Gem Cutting is Easy',
                author: 'Martin Walter',
                url: 'https://archive.org/details/gemcuttingiseasy00walt',
                description: 'Classic beginner-friendly introduction to lapidary',
                year: 1960,
                pages: 145,
                level: 'Beginner'
            },
            {
                id: 'ultratec12',
                title: 'Faceting Your First Twelve Gemstones',
                author: 'Ultra Tec',
                url: 'https://www.ultratec-facet.com/twelve-gemstones/',
                description: 'Practical project-based learning guide',
                year: 2020,
                pages: 85,
                level: 'Beginner'
            }
        ],
        websites: [
            {
                id: 'igs',
                title: 'International Gem Society (IGS)',
                url: 'https://www.gemsociety.org/',
                description: 'Comprehensive gem education with free articles',
                features: ['Gem Encyclopedia', 'Faceting Articles', 'Price Guides', 'Forum']
            },
            {
                id: 'usfg',
                title: 'US Faceters Guild',
                url: 'https://usfacetersguild.org/',
                description: 'Guild resources, competitions, patterns',
                features: ['Free Patterns', 'Competition Info', 'Newsletter', 'Member Forums']
            },
            {
                id: 'gemologyproject',
                title: 'The Gemology Project',
                url: 'https://gemologyproject.com/',
                description: 'Wiki-style gemology knowledge base',
                features: ['Gem Database', 'Cut Designs', 'Material Guides', 'Tools']
            },
            {
                id: 'gemologyonline',
                title: 'GemologyOnline - Joseph Gill Library',
                url: 'https://gemologyonline.com/',
                description: 'Extensive forums and library resources',
                features: ['Forums', 'Library', 'Identification Help', 'Trading']
            },
            {
                id: 'faceters',
                title: 'Faceters.com - Jeff Graham',
                url: 'https://www.faceters.com/',
                description: 'Thousands of free faceting designs',
                features: ['Design Library', 'Tutorials', 'Tool Reviews', 'Tips']
            }
        ],
        videoChannels: [
            {
                id: 'youtube_lapidary',
                title: 'Lapidary Education YouTube',
                url: 'https://www.youtube.com/results?search_query=lapidary+faceting',
                description: 'Various free video tutorials',
                features: ['Beginner Tutorials', 'Machine Reviews', 'Technique Demos']
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CERTIFICATION SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════
    
    certifications: {
        /**
         * Calculate certification cost based on quiz score
         * Higher scores = bigger discounts (up to 100% free!)
         */
        calculateCertCost(tierId, quizScore) {
            const tier = window.GemBotAcademy13Tier.tiers[tierId];
            if (!tier) return null;
            
            const baseCost = tier.certificationCost;
            let discount = 0;
            
            if (quizScore >= 90) {
                discount = tier.discountThresholds.score90;
            } else if (quizScore >= 80) {
                discount = tier.discountThresholds.score80;
            } else if (quizScore >= 70) {
                discount = tier.discountThresholds.score70;
            }
            
            const finalGBUV = Math.round(baseCost.gbuv * (1 - discount / 100));
            const finalUSD = (baseCost.usd * (1 - discount / 100)).toFixed(2);
            
            return {
                baseCost: baseCost,
                discount: discount,
                quizScore: quizScore,
                finalCost: {
                    gbuv: finalGBUV,
                    usd: parseFloat(finalUSD)
                },
                isFree: finalGBUV === 0
            };
        },
        
        /**
         * Issue a certification
         */
        async issueCertification(userId, tierId, quizScore) {
            const cost = this.calculateCertCost(tierId, quizScore);
            const tier = window.GemBotAcademy13Tier.tiers[tierId];
            
            const certification = {
                id: `GBOT-CERT-${tierId}-${Date.now()}`,
                userId: userId,
                tierId: tierId,
                tierName: tier.name,
                level: tier.level,
                quizScore: quizScore,
                costPaid: cost.finalCost,
                discount: cost.discount,
                issuedDate: new Date().toISOString(),
                expiresDate: null, // Never expires
                realWorldBenefits: tier.realWorldBenefits,
                badge: tier.rewards.badge,
                verified: true,
                signature: `GBOT-${Date.now().toString(36).toUpperCase()}`
            };
            
            // Save to Firebase/localStorage
            this.saveCertification(certification);
            
            return certification;
        },
        
        /**
         * Save certification
         */
        saveCertification(cert) {
            const certs = JSON.parse(localStorage.getItem('gembot_certifications') || '[]');
            certs.push(cert);
            localStorage.setItem('gembot_certifications', JSON.stringify(certs));
            
            // Also save to Firebase if available
            if (window.firebaseDb && window.firebaseDbFunctions) {
                try {
                    const docRef = window.firebaseDbFunctions.doc('certifications', cert.id);
                    window.firebaseDbFunctions.setDoc(docRef, cert);
                } catch (e) {
                    console.warn('Firebase save failed:', e);
                }
            }
            
            console.log(`🎓 Certification issued: ${cert.tierName} - ${cert.id}`);
            return cert;
        },
        
        /**
         * Get user's certifications
         */
        getUserCertifications(userId) {
            const certs = JSON.parse(localStorage.getItem('gembot_certifications') || '[]');
            return certs.filter(c => c.userId === userId);
        },
        
        /**
         * Verify a certification
         */
        verifyCertification(certId) {
            const certs = JSON.parse(localStorage.getItem('gembot_certifications') || '[]');
            return certs.find(c => c.id === certId) || null;
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // QUIZ & TESTING SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════
    
    quizzes: {
        /**
         * Generate quiz for a tier
         */
        generateQuiz(tierId) {
            const tier = window.GemBotAcademy13Tier.tiers[tierId];
            if (!tier) return null;
            
            // Get topic-relevant questions
            const questions = this.getQuestionsForTier(tierId);
            
            return {
                tierId: tierId,
                tierName: tier.name,
                questionCount: 20,
                passingScore: 70,
                timeLimit: 30 * 60, // 30 minutes
                questions: questions.slice(0, 20)
            };
        },
        
        /**
         * Get questions for a specific tier
         */
        getQuestionsForTier(tierId) {
            // Base question bank - extend as needed
            const allQuestions = [
                // Tier 1 Questions
                { tierId: 1, question: 'What scale measures gemstone hardness?', options: ['Mohs Scale', 'Richter Scale', 'Kelvin Scale', 'pH Scale'], answer: 0 },
                { tierId: 1, question: 'What is the hardest natural gemstone?', options: ['Ruby', 'Sapphire', 'Diamond', 'Emerald'], answer: 2 },
                { tierId: 1, question: 'Which tool magnifies gemstones for inspection?', options: ['Loupe', 'Compass', 'Caliper', 'Level'], answer: 0 },
                { tierId: 1, question: 'What is rough material before cutting called?', options: ['Polished', 'Cabochon', 'Rough', 'Faceted'], answer: 2 },
                { tierId: 1, question: 'What determines a gem\'s color?', options: ['Weight', 'Chemical composition', 'Age', 'Size'], answer: 1 },
                
                // Tier 2 Questions
                { tierId: 2, question: 'How many crystal systems are there?', options: ['5', '6', '7', '8'], answer: 2 },
                { tierId: 2, question: 'What is an inclusion?', options: ['External flaw', 'Internal feature', 'Surface scratch', 'Color zoning'], answer: 1 },
                { tierId: 2, question: 'What causes the play of color in opal?', options: ['Crystal structure', 'Silica spheres', 'Inclusions', 'Heat treatment'], answer: 1 },
                
                // Tier 3 Questions
                { tierId: 3, question: 'What attaches the gem to the dop?', options: ['Glue', 'Wax', 'Epoxy', 'All of these'], answer: 3 },
                { tierId: 3, question: 'What is the purpose of an index gear?', options: ['Cut angles', 'Set positions', 'Measure depth', 'Control speed'], answer: 1 },
                
                // Tier 4 Questions
                { tierId: 4, question: 'What is the ideal pavilion angle for a round brilliant?', options: ['35°', '40.75°', '45°', '50°'], answer: 1 },
                { tierId: 4, question: 'What does "meet point" mean?', options: ['Where facets meet precisely', 'The girdle edge', 'The table center', 'The culet'], answer: 0 },
                
                // Tier 5 Questions
                { tierId: 5, question: 'What characterizes an emerald cut?', options: ['Round shape', 'Step facets', 'Brilliant facets', 'No girdle'], answer: 1 },
                
                // Continue for all tiers...
                { tierId: 6, question: 'What is the minimum surface quality for competition?', options: ['80%', '90%', '95%', '98%'], answer: 2 },
                { tierId: 7, question: 'What creates a "flower" pattern in fantasy cuts?', options: ['Deep grooves', 'Concave facets', 'Multiple levels', 'All of these'], answer: 3 },
                { tierId: 8, question: 'What precaution is needed for emerald cutting?', options: ['High speed', 'No water', 'Low pressure', 'High heat'], answer: 2 },
                { tierId: 9, question: 'What is calibrated size?', options: ['Random size', 'Standard setting size', 'Maximum size', 'Minimum size'], answer: 1 },
                { tierId: 10, question: 'What is the critical angle?', options: ['Cut angle', 'Total internal reflection angle', 'Girdle angle', 'Table angle'], answer: 1 },
                { tierId: 11, question: 'What software is used for gem design?', options: ['Photoshop', 'GemCAD', 'AutoCAD', 'Excel'], answer: 1 },
                { tierId: 12, question: 'How are competition stones judged?', options: ['Weight only', 'Color only', 'Meet points, polish, symmetry', 'Speed'], answer: 2 },
                { tierId: 13, question: 'What qualifies a Grand Master?', options: ['10 years experience', 'Competition wins', 'Published designs', 'All of these'], answer: 3 }
            ];
            
            return allQuestions.filter(q => q.tierId <= tierId);
        },
        
        /**
         * Score a completed quiz
         */
        scoreQuiz(tierId, answers, questions) {
            let correct = 0;
            questions.forEach((q, i) => {
                if (answers[i] === q.answer) correct++;
            });
            
            const score = Math.round((correct / questions.length) * 100);
            
            return {
                tierId: tierId,
                totalQuestions: questions.length,
                correctAnswers: correct,
                score: score,
                passed: score >= 70,
                timestamp: new Date().toISOString()
            };
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOKEN BURN/LOCK MECHANICS
    // ═══════════════════════════════════════════════════════════════════════════
    
    tokenMechanics: {
        /**
         * Burn tokens for permanent benefits
         */
        burnForBenefit(userId, amount, benefitType) {
            const benefits = {
                'title_upgrade': { cost: 500, description: 'Upgrade display title' },
                'badge_special': { cost: 1000, description: 'Special badge unlock' },
                'course_unlock': { cost: 2000, description: 'Unlock locked course' },
                'mentor_access': { cost: 5000, description: 'Access to mentor program' }
            };
            
            const benefit = benefits[benefitType];
            if (!benefit || amount < benefit.cost) return null;
            
            // Record burn
            const burnRecord = {
                id: `BURN-${Date.now()}`,
                userId: userId,
                amount: amount,
                benefitType: benefitType,
                timestamp: new Date().toISOString()
            };
            
            console.log(`🔥 Burned ${amount} GBUV for ${benefitType}`);
            return burnRecord;
        },
        
        /**
         * Lock tokens for time-based rewards
         */
        lockTokens(userId, amount, lockDays) {
            const lockTiers = {
                30: { bonusRate: 5 },    // 5% bonus after 30 days
                90: { bonusRate: 15 },   // 15% bonus after 90 days
                180: { bonusRate: 35 },  // 35% bonus after 180 days
                365: { bonusRate: 75 }   // 75% bonus after 1 year
            };
            
            const tier = lockTiers[lockDays];
            if (!tier) return null;
            
            const bonus = Math.round(amount * (tier.bonusRate / 100));
            
            const lockRecord = {
                id: `LOCK-${Date.now()}`,
                userId: userId,
                amount: amount,
                lockDays: lockDays,
                expectedBonus: bonus,
                lockedAt: new Date().toISOString(),
                unlocksAt: new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000).toISOString()
            };
            
            console.log(`🔒 Locked ${amount} GBUV for ${lockDays} days, expected bonus: ${bonus}`);
            return lockRecord;
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // UI GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Generate tier progression UI
     */
    generateTierUI(currentTier = 1) {
        let html = '<div class="tier-progression">';
        
        for (let i = 1; i <= 13; i++) {
            const tier = this.tiers[i];
            const isUnlocked = i <= currentTier;
            const isCurrent = i === currentTier;
            
            html += `
                <div class="tier-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}"
                     data-tier="${i}">
                    <div class="tier-header">
                        <span class="tier-icon">${tier.name.split(' ')[0]}</span>
                        <h3>${tier.name.split(' ').slice(1).join(' ')}</h3>
                        <span class="tier-level">${tier.level}</span>
                    </div>
                    <p class="tier-desc">${tier.description}</p>
                    <div class="tier-details">
                        <span>📅 ${tier.duration}</span>
                        <span>📚 ${tier.lessonCount} lessons</span>
                    </div>
                    <div class="tier-costs">
                        <span class="course-cost">Course: ${tier.courseCost.gbuv > 0 ? tier.courseCost.gbuv + ' GBUV' : 'FREE'}</span>
                        <span class="cert-cost">Cert: ${tier.certificationCost.gbuv} GBUV</span>
                    </div>
                    ${!isUnlocked ? `<div class="lock-overlay">🔒 Complete Tier ${i-1}</div>` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },
    
    /**
     * Generate resources library UI
     */
    generateResourcesUI() {
        let html = '<div class="resources-library">';
        
        // Books section
        html += '<section class="resource-section"><h2>📚 Free Books</h2><div class="resource-grid">';
        this.freeResources.books.forEach(book => {
            html += `
                <div class="resource-card book">
                    <h3>${book.title}</h3>
                    <p class="author">By ${book.author}</p>
                    <p class="description">${book.description}</p>
                    <div class="meta">
                        <span>📖 ${book.pages} pages</span>
                        <span>🎯 ${book.level}</span>
                    </div>
                    <a href="${book.url}" target="_blank" class="resource-link">Read Free →</a>
                </div>
            `;
        });
        html += '</div></section>';
        
        // Websites section
        html += '<section class="resource-section"><h2>🌐 Free Websites</h2><div class="resource-grid">';
        this.freeResources.websites.forEach(site => {
            html += `
                <div class="resource-card website">
                    <h3>${site.title}</h3>
                    <p class="description">${site.description}</p>
                    <div class="features">
                        ${site.features.map(f => `<span class="feature">${f}</span>`).join('')}
                    </div>
                    <a href="${site.url}" target="_blank" class="resource-link">Visit Site →</a>
                </div>
            `;
        });
        html += '</div></section>';
        
        html += '</div>';
        return html;
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    init() {
        console.log('🎓 GemBot Academy 13-Tier System initializing...');
        
        // Integrate with existing academy
        if (window.GemBotAcademy) {
            window.GemBotAcademy.tierSystem = this;
        }
        
        this.initialized = true;
        console.log('✅ 13-Tier Academy System ready with', Object.keys(this.tiers).length, 'tiers');
        console.log('📚 Free resources:', this.freeResources.books.length, 'books,', this.freeResources.websites.length, 'websites');
        
        return this;
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    window.GemBotAcademy13Tier.init();
});

// Also init if DOM already ready
if (document.readyState !== 'loading') {
    window.GemBotAcademy13Tier.init();
}
