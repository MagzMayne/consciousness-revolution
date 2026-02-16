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
 * File: immigration-ai-knowledge.js
 * Declaration ID: IP-5C2FCD9B-MLL28ZV3
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Immigration AI Knowledge System
 * Attorney-level immigration law knowledge and guidance
 * 
 * This module provides comprehensive immigration law knowledge including:
 * - Visa categories and requirements
 * - Green card pathways and processes
 * - Form instructions and checklists
 * - Common pitfalls and red flags
 * - Case law references
 * - Timeline estimates
 * - Cost estimates
 * 
 * @author Barbrick Design
 * @version 1.0.0
 */

class ImmigrationAIKnowledge {
    constructor() {
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.aiOrchestrator = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the knowledge base with comprehensive immigration data
     */
    initializeKnowledgeBase() {
        return {
            visaCategories: {
                familyBased: {
                    'IR1': {
                        name: 'Immediate Relative - Spouse of US Citizen',
                        description: 'For spouses of US citizens',
                        requirements: [
                            'Valid marriage to US citizen',
                            'Proof of bona fide relationship',
                            'Financial support (I-864)',
                            'Medical examination',
                            'Police certificates'
                        ],
                        forms: ['I-130', 'I-485 (if in US)', 'DS-260 (if abroad)'],
                        timeline: '10-13 months (if in US), 12-18 months (if abroad)',
                        cost: '$1,760 - $2,500',
                        priority: 'Immediate (no wait time)'
                    },
                    'IR2': {
                        name: 'Immediate Relative - Child of US Citizen',
                        description: 'For unmarried children under 21 of US citizens',
                        requirements: [
                            'Proof of parent-child relationship',
                            'Child must be under 21 and unmarried',
                            'Birth certificate',
                            'Financial support',
                            'Medical examination'
                        ],
                        forms: ['I-130', 'I-485 or DS-260'],
                        timeline: '10-15 months',
                        cost: '$1,760 - $2,500',
                        priority: 'Immediate (no wait time)'
                    },
                    'F1': {
                        name: 'Family First Preference',
                        description: 'Unmarried sons/daughters of US citizens (21+)',
                        requirements: [
                            'Proof of parent-child relationship',
                            'Child must be unmarried and over 21',
                            'Financial support',
                            'Medical examination'
                        ],
                        forms: ['I-130', 'I-485 or DS-260'],
                        timeline: '7-10 years (priority date wait)',
                        cost: '$1,760 - $2,500',
                        priority: 'F1 - subject to annual quotas'
                    },
                    'F2A': {
                        name: 'Family Second Preference A',
                        description: 'Spouses and children of permanent residents',
                        requirements: [
                            'Petitioner must be LPR (green card holder)',
                            'Proof of relationship',
                            'Financial support',
                            'Medical examination'
                        ],
                        forms: ['I-130', 'I-485 or DS-260'],
                        timeline: '2-3 years',
                        cost: '$1,760 - $2,500',
                        priority: 'F2A - subject to annual quotas'
                    },
                    'K1': {
                        name: 'Fiancé(e) Visa',
                        description: 'For foreign fiancé(e) of US citizen',
                        requirements: [
                            'Met in person within last 2 years',
                            'Intent to marry within 90 days of arrival',
                            'Both parties free to marry',
                            'Financial support',
                            'Police certificates'
                        ],
                        forms: ['I-129F', 'DS-160'],
                        timeline: '6-12 months',
                        cost: '$2,025',
                        priority: 'Faster than marriage-based immigrant visa'
                    }
                },
                employmentBased: {
                    'EB1A': {
                        name: 'EB-1A Extraordinary Ability',
                        description: 'For individuals with extraordinary ability in sciences, arts, education, business, or athletics',
                        requirements: [
                            'Evidence of sustained national or international acclaim',
                            'Meet 3 of 10 criteria: awards, membership, published material, judging, original contributions, scholarly articles, exhibitions, leadership, high salary, commercial success',
                            'Self-petition possible (no employer needed)',
                            'Labor certification not required'
                        ],
                        forms: ['I-140', 'I-485'],
                        timeline: '8-12 months with premium processing',
                        cost: '$700 - $2,500 + legal fees ($5,000-$15,000)',
                        priority: 'Highest - current, no backlog'
                    },
                    'EB1B': {
                        name: 'EB-1B Outstanding Researcher/Professor',
                        description: 'For outstanding researchers and professors',
                        requirements: [
                            'At least 3 years experience in teaching or research',
                            'International recognition',
                            'Offer of tenure-track or permanent research position',
                            'Meet 2 of 6 criteria'
                        ],
                        forms: ['I-140', 'I-485'],
                        timeline: '8-12 months',
                        cost: '$700 - $2,500 + legal fees',
                        priority: 'Highest - current, no backlog'
                    },
                    'EB1C': {
                        name: 'EB-1C Multinational Manager/Executive',
                        description: 'For executives and managers transferred to US',
                        requirements: [
                            'Worked for foreign branch for 1 of last 3 years',
                            'Coming to US to work in managerial/executive capacity',
                            'US employer must have qualifying relationship with foreign employer',
                            'Employer petition required'
                        ],
                        forms: ['I-140', 'I-485'],
                        timeline: '8-15 months',
                        cost: '$700 - $2,500 + legal fees',
                        priority: 'Highest - current, minimal backlog'
                    },
                    'EB2-NIW': {
                        name: 'EB-2 National Interest Waiver',
                        description: 'For advanced degree holders whose work benefits US national interest',
                        requirements: [
                            'Advanced degree (Master\'s or Bachelor\'s + 5 years experience)',
                            'Proposed endeavor has substantial merit and national importance',
                            'You are well positioned to advance the endeavor',
                            'Would be beneficial to waive labor certification',
                            'Self-petition possible'
                        ],
                        forms: ['I-140', 'I-485'],
                        timeline: '12-18 months',
                        cost: '$700 - $2,500 + legal fees ($5,000-$10,000)',
                        priority: 'High - 2-3 year wait for India/China nationals'
                    },
                    'EB3': {
                        name: 'EB-3 Skilled Workers',
                        description: 'For skilled workers, professionals, and other workers',
                        requirements: [
                            'Job offer from US employer',
                            'PERM labor certification',
                            'At least 2 years training or experience',
                            'Or Bachelor\'s degree',
                            'Or unskilled worker (other workers category)'
                        ],
                        forms: ['PERM', 'I-140', 'I-485'],
                        timeline: '2-5 years depending on country',
                        cost: '$700 - $2,500 + legal fees + recruitment costs',
                        priority: 'Medium - significant backlogs for India/China'
                    }
                },
                humanitarian: {
                    'ASYLUM': {
                        name: 'Asylum',
                        description: 'For those fleeing persecution based on race, religion, nationality, political opinion, or membership in particular social group',
                        requirements: [
                            'Must apply within 1 year of arrival (with some exceptions)',
                            'Well-founded fear of persecution',
                            'Persecution by government or group government cannot control',
                            'Detailed personal statement',
                            'Country conditions evidence',
                            'Corroborating evidence'
                        ],
                        forms: ['I-589'],
                        timeline: '6 months - several years (varies by location)',
                        cost: 'No filing fee + legal fees ($3,000-$10,000+)',
                        priority: 'Protection-based, no quota limits'
                    },
                    'VAWA': {
                        name: 'Violence Against Women Act',
                        description: 'For victims of domestic violence by US citizen or LPR',
                        requirements: [
                            'Married to or child of US citizen or LPR abuser',
                            'Evidence of abuse (police reports, medical records, etc.)',
                            'Good moral character',
                            'Self-petition (abuser doesn\'t need to know)',
                            'Confidential process'
                        ],
                        forms: ['I-360', 'I-485'],
                        timeline: '16-24 months',
                        cost: 'No filing fees for VAWA petitions',
                        priority: 'Protection-based, expedited processing available'
                    },
                    'U-VISA': {
                        name: 'U Visa',
                        description: 'For victims of certain crimes who assist law enforcement',
                        requirements: [
                            'Victim of qualifying crime (domestic violence, sexual assault, trafficking, etc.)',
                            'Suffered substantial physical or mental abuse',
                            'Have information about the crime',
                            'Helped or willing to help law enforcement',
                            'Law enforcement certification required'
                        ],
                        forms: ['I-918', 'I-918 Supplement B (law enforcement certification)'],
                        timeline: '4-6 years (10,000 annual cap)',
                        cost: 'No filing fees',
                        priority: 'Protection-based, long waitlist'
                    },
                    'T-VISA': {
                        name: 'T Visa',
                        description: 'For victims of human trafficking',
                        requirements: [
                            'Victim of severe form of trafficking',
                            'In US due to trafficking',
                            'Comply with reasonable requests from law enforcement',
                            'Would suffer extreme hardship if removed',
                            'Evidence of trafficking'
                        ],
                        forms: ['I-914'],
                        timeline: '12-24 months',
                        cost: 'No filing fees',
                        priority: 'Protection-based, 5,000 annual cap'
                    }
                }
            },
            
            commonPitfalls: {
                'unlawful-presence': {
                    title: 'Unlawful Presence and 3/10 Year Bars',
                    description: 'Accruing unlawful presence can trigger bars to reentry',
                    details: [
                        '180-364 days unlawful presence = 3-year bar upon departure',
                        '365+ days unlawful presence = 10-year bar upon departure',
                        'Bars apply only if you leave the US',
                        'Adjustment of status avoids the bars',
                        'Waivers available (I-601A) but difficult to obtain'
                    ],
                    severity: 'Critical',
                    mitigation: 'Consult attorney before leaving US if you\'ve overstayed'
                },
                'public-charge': {
                    title: 'Public Charge Inadmissibility',
                    description: 'Using certain government benefits can affect immigration',
                    details: [
                        'USCIS considers: age, health, family status, assets, education, skills',
                        'Benefits that matter: SSI, TANF, SNAP, Medicaid (with exceptions), housing assistance',
                        'Benefits that don\'t matter: emergency Medicaid, CHIP, WIC, school lunch',
                        'Need to show you won\'t become dependent on government',
                        'Affidavit of Support (I-864) can overcome concern'
                    ],
                    severity: 'High',
                    mitigation: 'Strong financial support, avoid public benefits if possible'
                },
                'criminal-history': {
                    title: 'Criminal Inadmissibility',
                    description: 'Certain crimes can bar immigration benefits',
                    details: [
                        'Crimes of moral turpitude (fraud, theft, violence)',
                        'Aggravated felonies (very serious crimes)',
                        'Controlled substance violations (except single marijuana <30g)',
                        'Multiple criminal convictions (2+ crimes, 5+ years aggregate sentence)',
                        'Even minor crimes can be problematic',
                        'Expunged records still count for immigration purposes'
                    ],
                    severity: 'Critical',
                    mitigation: 'Consult immigration attorney immediately if you have criminal history'
                },
                'misrepresentation': {
                    title: 'Fraud or Misrepresentation',
                    description: 'Lying to immigration officials is a permanent bar',
                    details: [
                        'Any material false statement to obtain immigration benefit',
                        'Using false documents',
                        'Claiming to be US citizen when not',
                        'Fraudulent marriage',
                        'Can result in permanent inadmissibility',
                        'Very difficult to overcome (waiver rarely granted)'
                    ],
                    severity: 'Critical',
                    mitigation: 'Always be truthful with USCIS. Never lie or use fake documents.'
                },
                'employment-authorization': {
                    title: 'Working Without Authorization',
                    description: 'Working without permission can jeopardize future applications',
                    details: [
                        'Can trigger bars to adjustment of status',
                        'Can affect credibility',
                        'Some employment violations forgiven for immediate relatives',
                        'Document all employment authorization carefully',
                        'Include EAD cards, I-9 forms, pay stubs in case file'
                    ],
                    severity: 'Medium-High',
                    mitigation: 'Only work with valid authorization. Keep copies of all EADs.'
                }
            },
            
            formInstructions: {
                'I-130': {
                    name: 'Petition for Alien Relative',
                    purpose: 'US citizen or LPR petitions for family member',
                    processingTime: '10-35 months depending on relationship and USCIS center',
                    fee: '$535',
                    commonMistakes: [
                        'Incomplete biographic information',
                        'Missing signatures',
                        'Insufficient proof of relationship',
                        'Not providing certified translations',
                        'Wrong USCIS address'
                    ],
                    requiredEvidence: [
                        'Proof of petitioner\'s status (birth certificate, passport, naturalization certificate)',
                        'Proof of relationship (marriage certificate, birth certificates)',
                        'Photos together',
                        'Affidavits from family/friends',
                        'Joint financial documents (for spouses)'
                    ]
                },
                'I-485': {
                    name: 'Application to Register Permanent Residence or Adjust Status',
                    purpose: 'Apply for green card while in the US',
                    processingTime: '8-24 months depending on location and category',
                    fee: '$1,140 (+ $85 biometrics)',
                    commonMistakes: [
                        'Applying before priority date is current',
                        'Missing medical examination (I-693)',
                        'Incomplete employment history',
                        'Not disclosing all travel',
                        'Not including all required forms (I-944, etc.)'
                    ],
                    requiredEvidence: [
                        'Copy of I-130 or I-140 approval (or filed concurrently)',
                        'Medical examination (I-693) from civil surgeon',
                        'Proof of lawful entry (I-94, visa)',
                        'Passport photos',
                        'Birth certificate',
                        'Affidavit of Support (I-864)'
                    ]
                },
                'I-765': {
                    name: 'Application for Employment Authorization',
                    purpose: 'Request work permit (EAD)',
                    processingTime: '3-8 months',
                    fee: '$410 (free for some categories)',
                    commonMistakes: [
                        'Wrong eligibility category code',
                        'Applying before 90 days prior to current EAD expiry',
                        'Missing passport photos',
                        'Wrong fee (some categories are free)'
                    ],
                    requiredEvidence: [
                        'Copy of I-94',
                        'Proof of pending adjustment (I-485 receipt)',
                        'Passport photos',
                        'Copy of current EAD (if renewing)'
                    ]
                },
                'I-131': {
                    name: 'Application for Travel Document',
                    purpose: 'Get Advance Parole or Refugee Travel Document',
                    processingTime: '3-10 months',
                    fee: '$575',
                    commonMistakes: [
                        'Leaving before advance parole approved (can abandon I-485)',
                        'Not indicating correct travel document type',
                        'Missing passport photos'
                    ],
                    requiredEvidence: [
                        'Explanation of need to travel',
                        'Proof of pending adjustment',
                        'Passport photos',
                        'Copy of I-94'
                    ]
                },
                'I-864': {
                    name: 'Affidavit of Support',
                    purpose: 'Sponsor promises to support immigrant financially',
                    processingTime: 'Submitted with I-485 or at interview',
                    fee: 'No fee',
                    commonMistakes: [
                        'Not meeting 125% of poverty guideline',
                        'Not including joint sponsor when needed',
                        'Missing tax returns or W-2s',
                        'Not including current employment letter',
                        'Missing sponsor\'s proof of status'
                    ],
                    requiredEvidence: [
                        'Most recent tax return (IRS transcript preferred)',
                        'W-2s for most recent year',
                        'Current employment letter with salary',
                        'Proof of sponsor\'s status (passport, birth certificate)',
                        'Joint sponsor form if primary sponsor doesn\'t qualify'
                    ]
                },
                'N-400': {
                    name: 'Application for Naturalization',
                    purpose: 'Apply for US citizenship',
                    processingTime: '8-14 months',
                    fee: '$640 (+ $85 biometrics)',
                    commonMistakes: [
                        'Applying before meeting residency requirement',
                        'Not disclosing all absences from US',
                        'Missing selective service registration (males 18-26)',
                        'Not disclosing all arrests (even if dismissed)',
                        'Poor preparation for civics test'
                    ],
                    requiredEvidence: [
                        'Green card (copy)',
                        'Marriage certificate (if applicable)',
                        'Divorce decrees (all previous marriages)',
                        'Tax returns (5 years)',
                        'Selective service registration confirmation'
                    ]
                }
            },
            
            timelineEstimates: {
                'marriage-based-inside-us': {
                    pathway: 'Marriage to US Citizen (Already in US)',
                    steps: [
                        { step: 'File I-130 + I-485 concurrently', time: '0 months' },
                        { step: 'Receive receipt notices', time: '2-4 weeks' },
                        { step: 'Biometrics appointment', time: '1-2 months' },
                        { step: 'Request for Evidence (if needed)', time: '3-6 months' },
                        { step: 'Interview scheduled', time: '8-12 months' },
                        { step: 'Green card approval', time: '10-13 months' }
                    ],
                    totalTime: '10-13 months',
                    variability: 'High - depends on USCIS office, case complexity'
                },
                'marriage-based-outside-us': {
                    pathway: 'Marriage to US Citizen (Outside US)',
                    steps: [
                        { step: 'File I-130', time: '0 months' },
                        { step: 'I-130 approval', time: '10-14 months' },
                        { step: 'NVC processing', time: '2-3 months' },
                        { step: 'Embassy interview', time: '1-2 months' },
                        { step: 'Visa issuance', time: '1-4 weeks' },
                        { step: 'Travel to US', time: 'Within 6 months of medical exam' },
                        { step: 'Green card arrives', time: '2-4 weeks after entry' }
                    ],
                    totalTime: '12-18 months',
                    variability: 'High - depends on country, embassy wait times'
                },
                'employment-eb2-niw': {
                    pathway: 'Employment-Based EB-2 NIW',
                    steps: [
                        { step: 'Prepare petition with evidence', time: '0-3 months' },
                        { step: 'File I-140', time: '3 months' },
                        { step: 'I-140 approval (premium processing)', time: '4-6 months' },
                        { step: 'Priority date becomes current', time: 'Immediate to 3 years depending on country' },
                        { step: 'File I-485', time: 'When priority date current' },
                        { step: 'Biometrics and interview', time: '6-12 months' },
                        { step: 'Green card approval', time: '12-24 months from I-140' }
                    ],
                    totalTime: '12-48 months depending on country',
                    variability: 'Very High - retrogression for India/China can add years'
                }
            }
        };
    }

    /**
     * Initialize AI orchestrator for intelligent responses
     */
    async init() {
        try {
            // Check if multi-provider orchestrator is available
            if (typeof MultiProviderAIOrchestrator !== 'undefined') {
                this.aiOrchestrator = new MultiProviderAIOrchestrator();
                console.log('✅ Immigration AI Knowledge initialized with AI orchestration');
            } else {
                console.log('⚠️ AI Orchestrator not available - using knowledge base only');
            }
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing Immigration AI:', error);
        }
    }

    /**
     * Analyze user's immigration case and provide recommendations
     */
    async analyzeCase(userData) {
        const analysis = {
            eligiblePathways: [],
            recommendedPath: null,
            warnings: [],
            nextSteps: [],
            estimatedCost: null,
            estimatedTimeline: null,
            requiredForms: [],
            riskFactors: []
        };

        // Analyze family-based options
        if (userData.hasSpouse === 'usc') {
            analysis.eligiblePathways.push({
                category: 'Family-Based',
                type: 'IR-1',
                name: 'Immediate Relative (Spouse of US Citizen)',
                priority: 'High',
                timeline: this.knowledgeBase.visaCategories.familyBased.IR1.timeline,
                cost: this.knowledgeBase.visaCategories.familyBased.IR1.cost,
                description: 'Fastest family-based option with no wait time for visa number'
            });
        }

        if (userData.hasSpouse === 'lpr') {
            analysis.eligiblePathways.push({
                category: 'Family-Based',
                type: 'F2A',
                name: 'Family Second Preference',
                priority: 'Medium',
                timeline: this.knowledgeBase.visaCategories.familyBased.F2A.timeline,
                cost: this.knowledgeBase.visaCategories.familyBased.F2A.cost,
                description: 'Subject to annual quotas, typically 2-3 year wait'
            });
        }

        if (userData.engagedUSC === 'yes') {
            analysis.eligiblePathways.push({
                category: 'Family-Based',
                type: 'K-1',
                name: 'Fiancé(e) Visa',
                priority: 'High',
                timeline: this.knowledgeBase.visaCategories.familyBased.K1.timeline,
                cost: this.knowledgeBase.visaCategories.familyBased.K1.cost,
                description: 'Must marry within 90 days of arrival and adjust status'
            });
        }

        // Analyze employment-based options
        if (userData.extraordinary === 'yes' && userData.educationLevel !== 'less-hs') {
            analysis.eligiblePathways.push({
                category: 'Employment-Based',
                type: 'EB-1A',
                name: 'Extraordinary Ability',
                priority: 'Very High',
                timeline: this.knowledgeBase.visaCategories.employmentBased.EB1A.timeline,
                cost: this.knowledgeBase.visaCategories.employmentBased.EB1A.cost,
                description: 'No employer or labor certification needed, fastest employment route'
            });
        }

        if (userData.usEmployer === 'yes' && (userData.educationLevel === 'master' || userData.educationLevel === 'phd')) {
            analysis.eligiblePathways.push({
                category: 'Employment-Based',
                type: 'EB-2',
                name: 'Advanced Degree Professional',
                priority: 'High',
                timeline: '12-18 months + priority date wait',
                cost: '$700 - $2,500 + legal fees',
                description: 'Requires labor certification unless NIW approved'
            });

            analysis.eligiblePathways.push({
                category: 'Employment-Based',
                type: 'EB-2 NIW',
                name: 'National Interest Waiver',
                priority: 'High',
                timeline: this.knowledgeBase.visaCategories.employmentBased['EB2-NIW'].timeline,
                cost: this.knowledgeBase.visaCategories.employmentBased['EB2-NIW'].cost,
                description: 'Can self-petition without employer or labor certification'
            });
        }

        if (userData.usEmployer === 'yes' && userData.educationLevel === 'bachelor') {
            analysis.eligiblePathways.push({
                category: 'Employment-Based',
                type: 'EB-3',
                name: 'Skilled Worker',
                priority: 'Medium',
                timeline: this.knowledgeBase.visaCategories.employmentBased.EB3.timeline,
                cost: this.knowledgeBase.visaCategories.employmentBased.EB3.cost,
                description: 'Requires labor certification and employer sponsorship'
            });
        }

        // Analyze humanitarian options
        if (userData.fearReturn === 'yes') {
            analysis.eligiblePathways.push({
                category: 'Humanitarian',
                type: 'ASYLUM',
                name: 'Asylum',
                priority: 'High',
                timeline: this.knowledgeBase.visaCategories.humanitarian.ASYLUM.timeline,
                cost: this.knowledgeBase.visaCategories.humanitarian.ASYLUM.cost,
                description: 'Must apply within 1 year of arrival (with exceptions)'
            });
        }

        // Check for risk factors
        if (userData.riskCriminal) {
            analysis.riskFactors.push(this.knowledgeBase.commonPitfalls['criminal-history']);
            analysis.warnings.push('🚨 CRITICAL: Criminal history can seriously affect eligibility. Consult an immigration attorney immediately before applying.');
        }

        if (userData.riskDeport) {
            analysis.warnings.push('🚨 CRITICAL: Prior deportation creates significant complications. You likely need a waiver. Consult an attorney before proceeding.');
        }

        if (userData.riskOverstay && userData.currentStatus !== 'none') {
            analysis.riskFactors.push(this.knowledgeBase.commonPitfalls['unlawful-presence']);
            analysis.warnings.push('⚠️ WARNING: Unlawful presence can trigger 3 or 10-year bars if you leave the US. Do not leave before consulting an attorney.');
        }

        if (userData.riskFraud) {
            analysis.riskFactors.push(this.knowledgeBase.commonPitfalls['misrepresentation']);
            analysis.warnings.push('🚨 CRITICAL: Fraud or misrepresentation is extremely serious. You may be permanently barred. Consult an attorney immediately.');
        }

        // Determine recommended path
        if (analysis.eligiblePathways.length > 0) {
            // Sort by priority
            const priorityOrder = { 'Very High': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
            analysis.eligiblePathways.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            analysis.recommendedPath = analysis.eligiblePathways[0];
        }

        // Generate next steps
        if (analysis.recommendedPath) {
            analysis.nextSteps = this.generateNextSteps(analysis.recommendedPath, userData);
        }

        return analysis;
    }

    /**
     * Generate specific next steps based on recommended pathway
     */
    generateNextSteps(pathway, userData) {
        const steps = [];

        if (pathway.type === 'IR-1' || pathway.type === 'F2A') {
            steps.push({
                step: 1,
                action: 'Gather Documents',
                description: 'Collect marriage certificate, birth certificates, passports, photos together',
                time: '1-2 weeks'
            });
            steps.push({
                step: 2,
                action: 'File Form I-130',
                description: 'US citizen/LPR spouse files petition with USCIS',
                time: '1 day to prepare, submit online or by mail'
            });
            if (userData.currentStatus !== 'none' && userData.currentStatus !== 'undocumented') {
                steps.push({
                    step: 3,
                    action: 'File Form I-485 Concurrently (if in US legally)',
                    description: 'Adjust status while in the US to avoid consular processing',
                    time: '1-2 weeks to prepare'
                });
            }
            steps.push({
                step: 4,
                action: 'Attend Biometrics Appointment',
                description: 'USCIS will schedule fingerprints and photos',
                time: '1-2 months after filing'
            });
            steps.push({
                step: 5,
                action: 'Prepare for Interview',
                description: 'Practice common questions, bring all original documents',
                time: '8-12 months after filing'
            });
        } else if (pathway.type === 'EB-1A' || pathway.type === 'EB-2 NIW') {
            steps.push({
                step: 1,
                action: 'Gather Evidence of Achievements',
                description: 'Awards, publications, citations, media coverage, letters of recommendation, proof of impact',
                time: '2-4 weeks'
            });
            steps.push({
                step: 2,
                action: 'Prepare Detailed Petition',
                description: 'Draft strong petition letter demonstrating extraordinary ability or national interest',
                time: '2-4 weeks (consider hiring immigration attorney)'
            });
            steps.push({
                step: 3,
                action: 'File Form I-140',
                description: 'Submit petition with all evidence to USCIS',
                time: '1-2 weeks to finalize'
            });
            steps.push({
                step: 4,
                action: 'Wait for Priority Date',
                description: 'Check visa bulletin monthly. EB-1A typically current, EB-2 may have wait for India/China',
                time: 'Varies by country'
            });
            steps.push({
                step: 5,
                action: 'File I-485 When Current',
                description: 'Apply for green card when priority date is current',
                time: 'When visa available'
            });
        } else if (pathway.type === 'ASYLUM') {
            steps.push({
                step: 1,
                action: 'File Form I-589 Within 1 Year',
                description: 'Must apply within 1 year of arrival (exceptions exist)',
                time: 'URGENT - check your arrival date'
            });
            steps.push({
                step: 2,
                action: 'Gather Evidence',
                description: 'Detailed personal statement, country conditions reports, corroborating evidence',
                time: '2-4 weeks'
            });
            steps.push({
                step: 3,
                action: 'Submit Application',
                description: 'Mail to appropriate USCIS service center',
                time: '1 week'
            });
            steps.push({
                step: 4,
                action: 'Attend Asylum Interview',
                description: 'Credible fear or asylum interview with asylum officer',
                time: '6 months - several years depending on backlog'
            });
        }

        // Add universal final step
        steps.push({
            step: steps.length + 1,
            action: '💡 Consider Consulting an Immigration Attorney',
            description: 'While this tool provides guidance, an attorney can review your specific situation and catch issues early. Many offer free consultations.',
            time: 'Recommended before filing'
        });

        return steps;
    }

    /**
     * Get AI-powered answer to user question
     */
    async getAIAnswer(question, userData = null) {
        if (!this.aiOrchestrator) {
            return this.getFallbackAnswer(question);
        }

        try {
            // Build context-aware prompt
            const context = userData ? `User Profile: ${JSON.stringify(userData, null, 2)}\n\n` : '';
            const systemPrompt = `You are an expert immigration attorney with 20+ years of experience. You provide accurate, detailed, and practical advice on US immigration law. Always cite specific forms, laws, and procedures. Warn about pitfalls and risks. Be encouraging but realistic.

IMPORTANT DISCLAIMER: Always include a disclaimer that this is educational information only and not legal advice. Remind users that immigration law is complex and they should consult a licensed immigration attorney for personalized legal advice.`;
            
            // Format messages for chat completion
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `${context}Question: ${question}\n\nProvide a detailed, educational answer (not legal advice):` }
            ];

            const response = await this.aiOrchestrator.chatCompletion(messages, {
                model: 'llama-3.3-70b-versatile', // Groq's best free model
                temperature: 0.3, // Lower for more factual answers
                maxTokens: 2000
            });

            // Extract content from response
            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                return response.choices[0].message.content;
            }

            return this.getFallbackAnswer(question);
        } catch (error) {
            console.error('AI answer error:', error);
            return this.getFallbackAnswer(question);
        }
    }

    /**
     * Fallback answer when AI is not available
     */
    getFallbackAnswer(question) {
        const lowercaseQ = question.toLowerCase();
        
        // Pattern matching for common questions
        if (lowercaseQ.includes('how long') || lowercaseQ.includes('timeline')) {
            return 'Timeline varies significantly based on your specific pathway:\n\n' +
                   '• Marriage to US Citizen (in US): 10-13 months\n' +
                   '• Marriage to US Citizen (outside US): 12-18 months\n' +
                   '• Employment EB-2/EB-3: 2-5 years depending on country\n' +
                   '• Asylum: 6 months to several years\n\n' +
                   'Use the form above to analyze your specific case for a detailed timeline.';
        }
        
        if (lowercaseQ.includes('cost') || lowercaseQ.includes('fee') || lowercaseQ.includes('price')) {
            return 'Immigration costs vary by pathway:\n\n' +
                   '• Government filing fees: $1,760 - $2,500 (average)\n' +
                   '• Medical examination: $200 - $500\n' +
                   '• Attorney fees: $3,000 - $15,000 (optional but recommended)\n' +
                   '• Translation/document costs: $100 - $500\n\n' +
                   'Total typical cost: $5,000 - $18,000\n\n' +
                   'This tool is FREE and can save you thousands in unnecessary attorney consultations.';
        }
        
        if (lowercaseQ.includes('attorney') || lowercaseQ.includes('lawyer')) {
            return 'While this tool provides attorney-level knowledge, you should consult a licensed immigration attorney if:\n\n' +
                   '• You have criminal history\n' +
                   '• You were previously deported\n' +
                   '• You used fraud or misrepresentation\n' +
                   '• Your case is complex or unusual\n' +
                   '• You want someone to represent you\n\n' +
                   'Use this tool first to understand your options and save on consultation fees. Come prepared with specific questions.';
        }

        return 'I can provide detailed information about US immigration pathways, requirements, timelines, and costs. Please complete the intake form above to get a personalized analysis of your case, or ask specific questions about:\n\n' +
               '• Visa categories and eligibility\n' +
               '• Green card processes\n' +
               '• Required forms and documents\n' +
               '• Common pitfalls and how to avoid them\n' +
               '• Timeline and cost estimates\n\n' +
               'This free tool provides knowledge that would cost thousands of dollars at an attorney\'s office.';
    }

    /**
     * Get form-specific guidance
     */
    getFormGuidance(formNumber) {
        return this.knowledgeBase.formInstructions[formNumber] || null;
    }

    /**
     * Check for common pitfalls based on user data
     */
    checkPitfalls(userData) {
        const applicablePitfalls = [];

        if (userData.riskOverstay) {
            applicablePitfalls.push(this.knowledgeBase.commonPitfalls['unlawful-presence']);
        }
        if (userData.riskCriminal) {
            applicablePitfalls.push(this.knowledgeBase.commonPitfalls['criminal-history']);
        }
        if (userData.riskFraud) {
            applicablePitfalls.push(this.knowledgeBase.commonPitfalls['misrepresentation']);
        }

        return applicablePitfalls;
    }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
    window.ImmigrationAIKnowledge = ImmigrationAIKnowledge;
    console.log('✅ Immigration AI Knowledge System loaded');
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImmigrationAIKnowledge;
}
