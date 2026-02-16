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
 * File: agent-vetting-system.js
 * Declaration ID: IP-99A889A-MLL28ZUG
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AGENT VETTING SYSTEM
 * BarbrickDesign AgentHub - Comprehensive Skill Assessment
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Advanced vetting and assessment system for evaluating agent capabilities
 * across futuristic remote job skills. Tracks contributions, donations, and
 * provides real-time scoring against Agent R's benchmark profile.
 * 
 * © 2024-2026 Ryan Barbrick. All Rights Reserved.
 * Contact: BarbrickDesign@gmail.com
 * Creator: Agent R - The Hub Architect
 * ═══════════════════════════════════════════════════════════════════════════
 */

class AgentVettingSystem {
    constructor() {
        this.version = '1.0.0';
        this.creatorSignature = 'BarbrickDesign@gmail.com';
        this.creatorAgent = 'Agent R';
        
        // Comprehensive futuristic remote job skill categories
        this.SKILL_CATEGORIES = {
            // AI & Machine Learning
            AI_ENGINEERING: {
                name: 'AI & ML Engineering',
                description: 'Advanced AI model development, training, and deployment',
                skills: [
                    'Large Language Model (LLM) Fine-tuning',
                    'Neural Network Architecture Design',
                    'Deep Learning Model Optimization',
                    'Reinforcement Learning Implementation',
                    'Computer Vision Systems',
                    'Natural Language Processing (NLP)',
                    'AI Ethics & Bias Mitigation',
                    'Model Deployment & MLOps',
                    'Transformer Architecture',
                    'Generative AI Development',
                    'AI Agent Orchestration',
                    'Prompt Engineering & Optimization',
                    'Multi-modal AI Systems',
                    'AI Security & Adversarial Defense',
                    'Edge AI & Model Compression'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // Blockchain & Web3
            BLOCKCHAIN_DEVELOPMENT: {
                name: 'Blockchain & Web3 Development',
                description: 'Decentralized systems, smart contracts, and crypto infrastructure',
                skills: [
                    'Smart Contract Development (Solidity, Rust)',
                    'DeFi Protocol Architecture',
                    'NFT Marketplace Development',
                    'Layer 2 Scaling Solutions',
                    'Cross-chain Bridge Development',
                    'DAO Governance Systems',
                    'Tokenomics Design',
                    'Web3 Frontend Integration',
                    'Blockchain Security Auditing',
                    'Cryptocurrency Wallet Development',
                    'Decentralized Storage (IPFS, Arweave)',
                    'Zero-Knowledge Proof Implementation',
                    'MEV (Maximal Extractable Value) Strategies',
                    'On-chain Analytics',
                    'Crypto Payment Gateway Integration'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // Quantum Computing
            QUANTUM_COMPUTING: {
                name: 'Quantum Computing',
                description: 'Quantum algorithms, quantum-safe cryptography, and quantum programming',
                skills: [
                    'Quantum Algorithm Development',
                    'Qiskit/Cirq Programming',
                    'Quantum Error Correction',
                    'Quantum Machine Learning',
                    'Post-Quantum Cryptography',
                    'Quantum Simulation',
                    'Variational Quantum Algorithms',
                    'Quantum Annealing',
                    'Quantum Networking',
                    'Hybrid Classical-Quantum Systems',
                    'Quantum Optimization',
                    'Quantum Chemistry Simulations',
                    'Quantum Key Distribution',
                    'Quantum Sensing Applications',
                    'Quantum Hardware Integration'
                ],
                futureRelevance: 'emerging',
                remoteViability: 'good'
            },
            
            // Extended Reality (XR)
            XR_DEVELOPMENT: {
                name: 'Extended Reality (XR) Development',
                description: 'VR, AR, MR, and metaverse application development',
                skills: [
                    'Virtual Reality (VR) Development',
                    'Augmented Reality (AR) Systems',
                    'Mixed Reality (MR) Applications',
                    'Metaverse Platform Development',
                    'Spatial Computing',
                    '3D Modeling & Animation',
                    'Real-time Rendering Optimization',
                    'Hand & Eye Tracking Systems',
                    'Haptic Feedback Integration',
                    'WebXR Development',
                    'Unity/Unreal Engine Expertise',
                    'Avatar System Development',
                    'Virtual World Economics',
                    'Social VR Platforms',
                    'XR Accessibility Design'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // Autonomous Systems
            AUTONOMOUS_SYSTEMS: {
                name: 'Autonomous Systems Engineering',
                description: 'Robotics, autonomous vehicles, drones, and intelligent automation',
                skills: [
                    'Autonomous Vehicle Systems',
                    'Drone Navigation & Control',
                    'Robot Operating System (ROS)',
                    'Computer Vision for Robotics',
                    'SLAM (Simultaneous Localization and Mapping)',
                    'Path Planning Algorithms',
                    'Sensor Fusion',
                    'Edge Computing for Robotics',
                    'Digital Twin Development',
                    'Swarm Robotics',
                    'Human-Robot Interaction',
                    'Predictive Maintenance Systems',
                    'Industrial Automation',
                    'Soft Robotics',
                    'Robot Safety Protocols'
                ],
                futureRelevance: 'critical',
                remoteViability: 'moderate'
            },
            
            // Cybersecurity & Privacy
            CYBERSECURITY: {
                name: 'Advanced Cybersecurity',
                description: 'Zero-trust security, privacy engineering, and threat intelligence',
                skills: [
                    'Zero-Trust Architecture',
                    'Penetration Testing & Ethical Hacking',
                    'Security Operations Center (SOC) Management',
                    'Threat Intelligence Analysis',
                    'Incident Response & Forensics',
                    'Privacy-Preserving Technologies',
                    'Homomorphic Encryption',
                    'Secure Multi-Party Computation',
                    'Blockchain Security',
                    'AI Security & Adversarial ML',
                    'Cloud Security Architecture',
                    'DevSecOps Implementation',
                    'Supply Chain Security',
                    'IoT Security',
                    'Bug Bounty Hunting'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // Biotech & Health Tech
            BIOTECH_HEALTHTECH: {
                name: 'BioTech & HealthTech',
                description: 'Digital health, bioinformatics, and medical AI',
                skills: [
                    'Bioinformatics & Genomic Analysis',
                    'Medical AI & Diagnostics',
                    'Telemedicine Platform Development',
                    'Health Data Analytics',
                    'FHIR & HL7 Standards',
                    'Wearable Health Tech Integration',
                    'Clinical Trial Data Management',
                    'Drug Discovery Algorithms',
                    'Digital Therapeutics',
                    'Brain-Computer Interfaces',
                    'Personalized Medicine Systems',
                    'Medical Imaging AI',
                    'Remote Patient Monitoring',
                    'Healthcare Blockchain',
                    'Synthetic Biology Programming'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // Climate Tech & Sustainability
            CLIMATE_TECH: {
                name: 'Climate Tech & Sustainability',
                description: 'Green technology, carbon tracking, and environmental AI',
                skills: [
                    'Carbon Footprint Analysis',
                    'Renewable Energy Systems',
                    'Environmental Data Science',
                    'Climate Modeling & Simulation',
                    'Smart Grid Development',
                    'Circular Economy Platforms',
                    'Satellite Data Analysis',
                    'IoT for Agriculture (AgTech)',
                    'Water Management Systems',
                    'Biodiversity Monitoring AI',
                    'Energy Storage Optimization',
                    'Green Building Technology',
                    'Carbon Credit Trading Systems',
                    'Sustainable Supply Chain',
                    'Climate Risk Assessment'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // Space Technology
            SPACE_TECH: {
                name: 'Space Technology',
                description: 'Satellite systems, space exploration, and orbital computing',
                skills: [
                    'Satellite Communication Systems',
                    'Orbital Mechanics Simulation',
                    'Space Data Analysis',
                    'Ground Station Software',
                    'CubeSat Development',
                    'Space Debris Tracking',
                    'Planetary Exploration Systems',
                    'Astrobiology Data Processing',
                    'Space Weather Forecasting',
                    'Satellite Imagery Analysis',
                    'Rocket Telemetry Systems',
                    'Space-based IoT Networks',
                    'Lunar/Mars Habitat Systems',
                    'Space Resource Extraction',
                    'Interplanetary Network Protocols'
                ],
                futureRelevance: 'emerging',
                remoteViability: 'excellent'
            },
            
            // Advanced Data Science
            DATA_SCIENCE: {
                name: 'Advanced Data Science',
                description: 'Big data, real-time analytics, and predictive modeling',
                skills: [
                    'Big Data Architecture (Spark, Hadoop)',
                    'Real-time Stream Processing',
                    'Predictive Analytics',
                    'Time Series Forecasting',
                    'Causal Inference',
                    'Experimental Design & A/B Testing',
                    'Feature Engineering',
                    'Data Pipeline Orchestration',
                    'MLOps & Model Monitoring',
                    'Data Visualization Storytelling',
                    'Distributed Computing',
                    'Graph Analytics',
                    'Recommendation Systems',
                    'Anomaly Detection',
                    'AutoML Implementation'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // Cloud & Edge Computing
            CLOUD_EDGE: {
                name: 'Cloud & Edge Computing',
                description: 'Cloud architecture, serverless, and edge computing',
                skills: [
                    'Cloud Architecture (AWS, Azure, GCP)',
                    'Kubernetes & Container Orchestration',
                    'Serverless Computing',
                    'Edge Computing Infrastructure',
                    'Multi-cloud Strategy',
                    'Cloud Cost Optimization',
                    'Infrastructure as Code (Terraform, Pulumi)',
                    'Service Mesh Architecture',
                    'Cloud-Native Development',
                    'Microservices Architecture',
                    'Event-Driven Architecture',
                    'Distributed Systems Design',
                    'Cloud Security',
                    'Observability & Monitoring',
                    'Disaster Recovery Planning'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // Digital Twin Technology
            DIGITAL_TWINS: {
                name: 'Digital Twin Technology',
                description: 'Virtual replicas, simulation, and predictive modeling',
                skills: [
                    'Digital Twin Modeling',
                    'Real-time Simulation',
                    'IoT Sensor Integration',
                    'Predictive Maintenance',
                    'Physics-based Modeling',
                    '3D Visualization',
                    'Time-series Analysis',
                    'Manufacturing Process Simulation',
                    'Urban Planning Digital Twins',
                    'Supply Chain Digital Twins',
                    'Energy Grid Simulation',
                    'Vehicle Fleet Management',
                    'Building Information Modeling (BIM)',
                    'Healthcare Digital Twins',
                    'Environmental Simulation'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // DevOps & Platform Engineering
            DEVOPS_PLATFORM: {
                name: 'DevOps & Platform Engineering',
                description: 'CI/CD, automation, and platform reliability',
                skills: [
                    'CI/CD Pipeline Design',
                    'GitOps Implementation',
                    'Platform Engineering',
                    'Site Reliability Engineering (SRE)',
                    'Chaos Engineering',
                    'Automated Testing Frameworks',
                    'Release Management',
                    'Configuration Management',
                    'Monitoring & Alerting',
                    'Log Aggregation & Analysis',
                    'Performance Optimization',
                    'Capacity Planning',
                    'Incident Management',
                    'Infrastructure Automation',
                    'Developer Experience (DevX)'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // Creator Economy & Digital Content
            CREATOR_ECONOMY: {
                name: 'Creator Economy Technology',
                description: 'Content platforms, monetization, and creator tools',
                skills: [
                    'Content Management Systems',
                    'Video Streaming Infrastructure',
                    'Creator Monetization Platforms',
                    'Social Media API Integration',
                    'Content Recommendation Engines',
                    'NFT Marketplaces for Creators',
                    'Live Streaming Technology',
                    'Subscription Platform Development',
                    'Content Delivery Networks (CDN)',
                    'Analytics for Creators',
                    'Copyright & Rights Management',
                    'Multi-platform Publishing',
                    'Audience Engagement Tools',
                    'Brand Partnership Platforms',
                    'Creator DAO Systems'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            },
            
            // No-Code/Low-Code Development
            NOCODE_LOWCODE: {
                name: 'No-Code/Low-Code Platform Development',
                description: 'Visual development, workflow automation, and citizen development',
                skills: [
                    'No-Code Platform Architecture',
                    'Visual Workflow Builders',
                    'Drag-and-Drop UI Frameworks',
                    'Zapier/Make Integration',
                    'Airtable/Notion Automation',
                    'Business Process Automation',
                    'API Integration Platforms',
                    'Database Visual Builders',
                    'Mobile App Builders',
                    'Landing Page Builders',
                    'E-commerce No-Code Solutions',
                    'AI Model Deployment Platforms',
                    'Form & Survey Builders',
                    'Chatbot Builders',
                    'Workflow Orchestration'
                ],
                futureRelevance: 'critical',
                remoteViability: 'excellent'
            }
        };
        
        // Skill proficiency levels
        this.PROFICIENCY_LEVELS = {
            NOVICE: { value: 1, label: 'Novice', description: 'Basic understanding, learning' },
            INTERMEDIATE: { value: 2, label: 'Intermediate', description: 'Can apply with guidance' },
            ADVANCED: { value: 3, label: 'Advanced', description: 'Independent execution' },
            EXPERT: { value: 4, label: 'Expert', description: 'Can teach and innovate' },
            MASTER: { value: 5, label: 'Master', description: 'Industry leader, innovator' }
        };
        
        // Agent R's benchmark profile (creator profile)
        this.AGENT_R_PROFILE = {
            agentId: 'AGENT_R',
            name: 'Agent R',
            email: 'BarbrickDesign@gmail.com',
            title: 'Creator & Supreme Authority',
            role: 'System Architect & Hub Creator',
            clearanceLevel: 999,
            verified: true,
            creationDate: '2024-01-01',
            totalContributions: Infinity,
            totalDonations: 0, // Creator, not contributor
            skillScores: this.generateAgentRSkillProfile(),
            achievements: [
                'Hub Creator',
                'System Architect',
                'Repository Knowledge Base Owner',
                'Supreme Authority',
                'All Systems Access',
                'Protocol Designer',
                'Agent Orchestrator',
                'Blockchain Master',
                'AI Systems Master',
                'Full-Stack Master'
            ],
            knowledgeBase: {
                repository: 'barbrickdesign.github.io',
                projects: ['Mandem.OS', 'Null.OS', 'Gem Bot Universe', 'BankSky', 'Merlin Hive'],
                expertise: 'All categories at Master level'
            }
        };
        
        // Storage keys
        this.STORAGE_KEYS = {
            AGENTS: 'agenthub_agents_v1',
            VETTING: 'agenthub_vetting_v1',
            CONTRIBUTIONS: 'agenthub_contributions_v1',
            DONATIONS: 'agenthub_donations_v1'
        };
        
        // Initialize storage
        this.agents = this.loadAgents();
        this.vettingData = this.loadVettingData();
        
        console.log('🎯 Agent Vetting System initialized by', this.creatorAgent);
        console.log('📧 Creator Contact:', this.creatorSignature);
        console.log('📊 Skill Categories:', Object.keys(this.SKILL_CATEGORIES).length);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // AGENT R BENCHMARK PROFILE
    // ═══════════════════════════════════════════════════════════════════════════
    
    generateAgentRSkillProfile() {
        const profile = {};
        
        // Agent R has master level in all categories (benchmark for others)
        Object.keys(this.SKILL_CATEGORIES).forEach(categoryKey => {
            const category = this.SKILL_CATEGORIES[categoryKey];
            profile[categoryKey] = {
                categoryName: category.name,
                overallScore: 100, // Perfect score
                proficiency: 'MASTER',
                skills: {}
            };
            
            // Master level in all skills
            category.skills.forEach(skill => {
                profile[categoryKey].skills[skill] = {
                    level: 'MASTER',
                    score: 100,
                    verified: true,
                    yearsExperience: 10,
                    projects: ['All BarbrickDesign Projects']
                };
            });
        });
        
        return profile;
    }
    
    getAgentRProfile() {
        return this.AGENT_R_PROFILE;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // AGENT REGISTRATION & VETTING
    // ═══════════════════════════════════════════════════════════════════════════
    
    registerAgent(agentData) {
        const agentId = this.generateAgentId();
        const timestamp = new Date().toISOString();
        
        const agent = {
            agentId,
            name: agentData.name || 'Anonymous Agent',
            email: agentData.email || '',
            registrationDate: timestamp,
            verified: false,
            clearanceLevel: 1, // Start at level 1
            skillProfile: {},
            contributions: [],
            donations: [],
            totalValue: 0,
            vettingStatus: 'pending',
            comparisonToAgentR: 0 // Percentage comparison
        };
        
        this.agents[agentId] = agent;
        this.saveAgents();
        
        return agent;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SKILL ASSESSMENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    assessSkill(agentId, categoryKey, skillName, proficiencyLevel, evidence = {}) {
        if (!this.agents[agentId]) {
            throw new Error('Agent not found');
        }
        
        if (!this.SKILL_CATEGORIES[categoryKey]) {
            throw new Error('Invalid skill category');
        }
        
        const agent = this.agents[agentId];
        
        if (!agent.skillProfile[categoryKey]) {
            agent.skillProfile[categoryKey] = {
                categoryName: this.SKILL_CATEGORIES[categoryKey].name,
                overallScore: 0,
                proficiency: 'NOVICE',
                skills: {}
            };
        }
        
        const proficiency = this.PROFICIENCY_LEVELS[proficiencyLevel];
        const score = (proficiency.value / 5) * 100; // Convert to 0-100 scale
        
        agent.skillProfile[categoryKey].skills[skillName] = {
            level: proficiencyLevel,
            score: score,
            verified: evidence.verified || false,
            yearsExperience: evidence.yearsExperience || 0,
            projects: evidence.projects || [],
            certifications: evidence.certifications || [],
            assessmentDate: new Date().toISOString()
        };
        
        // Recalculate category overall score
        this.recalculateCategoryScore(agentId, categoryKey);
        
        // Update comparison to Agent R
        this.updateAgentRComparison(agentId);
        
        this.saveAgents();
        
        return agent.skillProfile[categoryKey];
    }
    
    recalculateCategoryScore(agentId, categoryKey) {
        const agent = this.agents[agentId];
        const category = agent.skillProfile[categoryKey];
        
        if (!category || !category.skills) return;
        
        const skills = Object.values(category.skills);
        if (skills.length === 0) return;
        
        // Calculate average score
        const totalScore = skills.reduce((sum, skill) => sum + skill.score, 0);
        category.overallScore = Math.round(totalScore / skills.length);
        
        // Determine proficiency based on score
        if (category.overallScore >= 90) category.proficiency = 'MASTER';
        else if (category.overallScore >= 75) category.proficiency = 'EXPERT';
        else if (category.overallScore >= 60) category.proficiency = 'ADVANCED';
        else if (category.overallScore >= 40) category.proficiency = 'INTERMEDIATE';
        else category.proficiency = 'NOVICE';
    }
    
    updateAgentRComparison(agentId) {
        const agent = this.agents[agentId];
        const agentRProfile = this.AGENT_R_PROFILE.skillScores;
        
        let totalAgentScore = 0;
        let totalAgentRScore = 0;
        let categoriesCount = 0;
        
        Object.keys(this.SKILL_CATEGORIES).forEach(categoryKey => {
            const agentCategory = agent.skillProfile[categoryKey];
            const agentRCategory = agentRProfile[categoryKey];
            
            if (agentCategory && agentRCategory) {
                totalAgentScore += agentCategory.overallScore || 0;
                totalAgentRScore += agentRCategory.overallScore;
                categoriesCount++;
            }
        });
        
        if (categoriesCount > 0) {
            const agentAvg = totalAgentScore / categoriesCount;
            const agentRAvg = totalAgentRScore / categoriesCount;
            agent.comparisonToAgentR = Math.round((agentAvg / agentRAvg) * 100);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CONTRIBUTION & DONATION TRACKING
    // ═══════════════════════════════════════════════════════════════════════════
    
    logContribution(agentId, contributionData) {
        if (!this.agents[agentId]) {
            throw new Error('Agent not found');
        }
        
        const contribution = {
            id: this.generateId(),
            type: contributionData.type,
            description: contributionData.description,
            value: contributionData.value || 0,
            timestamp: new Date().toISOString(),
            verified: contributionData.verified || false
        };
        
        this.agents[agentId].contributions.push(contribution);
        this.agents[agentId].totalValue += contribution.value;
        
        // Update clearance level based on contributions
        this.updateClearanceLevel(agentId);
        
        this.saveAgents();
        
        return contribution;
    }
    
    logDonation(agentId, donationData) {
        if (!this.agents[agentId]) {
            throw new Error('Agent not found');
        }
        
        const donation = {
            id: this.generateId(),
            amount: donationData.amount,
            currency: donationData.currency || 'USD',
            timestamp: new Date().toISOString(),
            transactionId: donationData.transactionId || '',
            verified: donationData.verified || false
        };
        
        this.agents[agentId].donations.push(donation);
        this.agents[agentId].totalValue += donation.amount;
        
        // Update clearance level based on donations
        this.updateClearanceLevel(agentId);
        
        this.saveAgents();
        
        return donation;
    }
    
    updateClearanceLevel(agentId) {
        const agent = this.agents[agentId];
        
        // Calculate clearance level based on:
        // - Total value (contributions + donations)
        // - Skill proficiency
        // - Number of verified skills
        
        let clearanceScore = 1;
        
        // Value contribution (max +50)
        clearanceScore += Math.min(Math.floor(agent.totalValue / 100), 50);
        
        // Skill proficiency (max +30)
        const skillCategories = Object.values(agent.skillProfile);
        const avgSkillScore = skillCategories.length > 0
            ? skillCategories.reduce((sum, cat) => sum + (cat.overallScore || 0), 0) / skillCategories.length
            : 0;
        clearanceScore += Math.floor(avgSkillScore * 0.3);
        
        // Verified skills bonus (max +20)
        let verifiedSkillsCount = 0;
        skillCategories.forEach(category => {
            if (category.skills) {
                Object.values(category.skills).forEach(skill => {
                    if (skill.verified) verifiedSkillsCount++;
                });
            }
        });
        clearanceScore += Math.min(verifiedSkillsCount * 2, 20);
        
        agent.clearanceLevel = Math.min(clearanceScore, 100); // Cap at 100 (Agent R is 999)
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // AGENT COMPARISON & LEADERBOARD
    // ═══════════════════════════════════════════════════════════════════════════
    
    getAgentComparison(agentId) {
        const agent = this.agents[agentId];
        if (!agent) throw new Error('Agent not found');
        
        const agentRProfile = this.AGENT_R_PROFILE;
        
        const comparison = {
            agent: {
                id: agent.agentId,
                name: agent.name,
                clearanceLevel: agent.clearanceLevel,
                totalValue: agent.totalValue,
                comparisonScore: agent.comparisonToAgentR
            },
            agentR: {
                id: agentRProfile.agentId,
                name: agentRProfile.name,
                clearanceLevel: agentRProfile.clearanceLevel,
                totalValue: 'Infinite (Creator)',
                comparisonScore: 100
            },
            categoryComparisons: {}
        };
        
        Object.keys(this.SKILL_CATEGORIES).forEach(categoryKey => {
            const agentCategory = agent.skillProfile[categoryKey];
            const agentRCategory = agentRProfile.skillScores[categoryKey];
            
            comparison.categoryComparisons[categoryKey] = {
                categoryName: this.SKILL_CATEGORIES[categoryKey].name,
                agentScore: agentCategory ? agentCategory.overallScore : 0,
                agentRScore: agentRCategory ? agentRCategory.overallScore : 100,
                gap: agentRCategory ? (agentRCategory.overallScore - (agentCategory ? agentCategory.overallScore : 0)) : 100
            };
        });
        
        return comparison;
    }
    
    getLeaderboard(limit = 10) {
        const agentList = Object.values(this.agents);
        
        // Sort by total value (contributions + donations)
        agentList.sort((a, b) => b.totalValue - a.totalValue);
        
        // Always show Agent R at the top
        const leaderboard = [this.AGENT_R_PROFILE, ...agentList.slice(0, limit)];
        
        return leaderboard.map((agent, index) => ({
            rank: index,
            agentId: agent.agentId,
            name: agent.name,
            clearanceLevel: agent.clearanceLevel,
            totalValue: agent.totalValue === Infinity ? 'Infinite (Creator)' : agent.totalValue,
            comparisonToAgentR: agent.comparisonToAgentR || 100,
            verified: agent.verified
        }));
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SKILL CATEGORIES & INFO
    // ═══════════════════════════════════════════════════════════════════════════
    
    getAllSkillCategories() {
        return this.SKILL_CATEGORIES;
    }
    
    getSkillCategory(categoryKey) {
        return this.SKILL_CATEGORIES[categoryKey];
    }
    
    searchSkills(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        Object.entries(this.SKILL_CATEGORIES).forEach(([key, category]) => {
            category.skills.forEach(skill => {
                if (skill.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        categoryKey: key,
                        categoryName: category.name,
                        skill: skill
                    });
                }
            });
        });
        
        return results;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STORAGE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    loadAgents() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.AGENTS);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading agents:', error);
            return {};
        }
    }
    
    saveAgents() {
        try {
            localStorage.setItem(this.STORAGE_KEYS.AGENTS, JSON.stringify(this.agents));
        } catch (error) {
            console.error('Error saving agents:', error);
        }
    }
    
    loadVettingData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.VETTING);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading vetting data:', error);
            return {};
        }
    }
    
    saveVettingData() {
        try {
            localStorage.setItem(this.STORAGE_KEYS.VETTING, JSON.stringify(this.vettingData));
        } catch (error) {
            console.error('Error saving vetting data:', error);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    generateAgentId() {
        return 'AGENT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getAgent(agentId) {
        return this.agents[agentId];
    }
    
    getAllAgents() {
        return this.agents;
    }
    
    exportAgentProfile(agentId) {
        const agent = this.agents[agentId];
        if (!agent) throw new Error('Agent not found');
        
        return JSON.stringify(agent, null, 2);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    window.AgentVettingSystem = AgentVettingSystem;
    console.log('✅ Agent Vetting System loaded - Created by Agent R (BarbrickDesign@gmail.com)');
}
