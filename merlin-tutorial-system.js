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
 * File: merlin-tutorial-system.js
 * Declaration ID: IP-339C8B31-MLL28ZVI
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN AI TUTORIAL SYSTEM 🧙‍♂️
 * ═══════════════════════════════════════════════════════════════════════════════
 * Interactive tutorial system that guides new players through the GemBot Farm
 * Merlin teaches gem cutting, machine operation, mining, and trading
 * 
 * Owner: Ryan Barbrick / Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class MerlinTutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.tutorialActive = false;
        this.completedSteps = [];
        this.playerProgress = this.loadProgress();
        
        // Tutorial modules
        this.modules = {
            welcome: {
                id: 'welcome',
                name: 'Welcome to GemBot Farm',
                steps: this.getWelcomeSteps()
            },
            workshop: {
                id: 'workshop',
                name: 'Your Workshop',
                steps: this.getWorkshopSteps()
            },
            rough_material: {
                id: 'rough_material',
                name: 'Rough Material & Prep',
                steps: this.getRoughMaterialSteps()
            },
            gem_cutting: {
                id: 'gem_cutting',
                name: 'Gem Cutting Basics',
                steps: this.getGemCuttingSteps()
            },
            mining: {
                id: 'mining',
                name: 'Mining Operations',
                steps: this.getMiningSteps()
            },
            trading: {
                id: 'trading',
                name: 'Trading & Economy',
                steps: this.getTradingSteps()
            },
            certification: {
                id: 'certification',
                name: 'GemBot Certification',
                steps: this.getCertificationSteps()
            }
        };
        
        console.log('🧙‍♂️ Merlin Tutorial System initialized');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // WELCOME MODULE
    // ═══════════════════════════════════════════════════════════════════════════
    getWelcomeSteps() {
        return [
            {
                id: 'welcome_1',
                title: 'Welcome, Young Gem Cutter! 🧙‍♂️',
                speech: `Greetings, adventurer! I am Merlin, your guide through the mystical world of gem cutting. 
                        You've just arrived at your very own GemBot workshop! 
                        Together, we shall transform rough stones into brilliant treasures.`,
                highlight: null,
                action: 'continue',
                reward: { gbuv: 10, message: 'Welcome bonus!' }
            },
            {
                id: 'welcome_2',
                title: 'Your Journey Begins',
                speech: `In this realm, you'll learn the ancient art of gem cutting using modern GemBot machines.
                        You've been given a Solana wallet - this holds your $GBUV tokens, the currency of our realm.
                        Every gem you cut, every trade you make, and every certification you earn will grow your fortune!`,
                highlight: '.wallet-display',
                action: 'continue',
                checkWallet: true
            },
            {
                id: 'welcome_3',
                title: 'What Awaits You',
                speech: `Here's what you'll master:
                        
                        💎 GEM CUTTING - Transform rough stones into valuable gems
                        ⛏️ MINING - Establish mining posts to find rare materials
                        🔧 WORKSHOP - Prepare your dop sticks and manage inventory
                        💰 TRADING - Buy and sell with other gem cutters
                        📜 CERTIFICATION - Earn real credentials in gemology!
                        
                        Ready to begin? Let me show you around your workshop!`,
                highlight: null,
                action: 'continue'
            }
        ];
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // WORKSHOP MODULE  
    // ═══════════════════════════════════════════════════════════════════════════
    getWorkshopSteps() {
        return [
            {
                id: 'workshop_1',
                title: 'Your Workshop Table 🪵',
                speech: `This is your workshop table - the heart of your operation!
                        
                        See those rough stones? That's your raw material.
                        The wooden board with holes? That's your dop holder - it keeps prepared stones ready for cutting.
                        
                        Let me explain the workflow...`,
                highlight: '#workshopTable',
                action: 'continue'
            },
            {
                id: 'workshop_2', 
                title: 'The Workflow',
                speech: `Here's how gem cutting works:
                        
                        1️⃣ ROUGH STONE → Pick from your inventory
                        2️⃣ EXAMINE → Check quality and plan your cut
                        3️⃣ DOP STICK → Glue the rough to a dop with wax
                        4️⃣ DOP HOLDER → Place prepared dops in the wooden holder
                        5️⃣ GEMBOT MACHINE → Load a dop and start cutting!
                        
                        Each step requires skill - and I'll teach you!`,
                highlight: null,
                action: 'continue'
            },
            {
                id: 'workshop_3',
                title: 'Inventory Limits',
                speech: `Important! Your dop holder has limited slots.
                        
                        🔵 Basic Workshop: 5 dop slots
                        🟡 Upgraded Workshop: 10 dop slots  
                        🟠 Master Workshop: 20 dop slots
                        
                        Upgrade with $GBUV tokens as you progress!
                        
                        You can also sell prepared dops to other players who don't want to do the prep work!`,
                highlight: '#dopHolder',
                action: 'continue'
            }
        ];
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ROUGH MATERIAL MODULE
    // ═══════════════════════════════════════════════════════════════════════════
    getRoughMaterialSteps() {
        return [
            {
                id: 'rough_1',
                title: 'Understanding Rough Material 💎',
                speech: `Rough stones come in many types and qualities:
                        
                        🟢 COMMON: Quartz, Amethyst, Citrine (Easy to cut)
                        🔵 UNCOMMON: Topaz, Garnet, Peridot (Moderate)
                        🟣 RARE: Sapphire, Ruby, Emerald (Challenging)
                        🟡 LEGENDARY: Diamond, Alexandrite (Master level!)
                        
                        Each stone has:
                        • Carat Weight (size)
                        • Clarity (inclusions)
                        • Color Grade
                        • Potential Value`,
                highlight: '#roughInventory',
                action: 'continue'
            },
            {
                id: 'rough_2',
                title: 'Preparing Your Stone',
                speech: `Before cutting, you must prepare your stone:
                        
                        1️⃣ CLICK a rough stone on your table
                        2️⃣ EXAMINE it - I'll help analyze quality
                        3️⃣ CHOOSE a design (cut pattern)
                        4️⃣ SELECT the right dop stick size
                        5️⃣ APPLY wax and mount the stone
                        
                        This is called "dopping" - a critical skill!
                        A bad dop job can ruin a stone during cutting.`,
                highlight: null,
                action: 'try_dopping',
                requirement: { type: 'dop_stone', target: 1 }
            },
            {
                id: 'rough_3',
                title: 'Wax Types',
                speech: `Different stones need different wax:
                        
                        🟤 BROWN WAX (Hard) - For heat-sensitive stones like Emerald
                        🟢 GREEN WAX (Medium) - Standard for most stones
                        🔴 RED WAX (Soft) - For very fragile materials
                        
                        Wrong wax = stone falls off during cutting!
                        
                        I'll always remind you which to use.`,
                highlight: '#waxSelector',
                action: 'continue'
            }
        ];
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // GEM CUTTING MODULE
    // ═══════════════════════════════════════════════════════════════════════════
    getGemCuttingSteps() {
        return [
            {
                id: 'cutting_1',
                title: 'Your GemBot Machine 🔧',
                speech: `Behold! The GemBot Mini - a precision faceting machine!
                        
                        Key Components:
                        🔵 LAP (spinning disc) - Different grits for cutting/polishing
                        🟢 MAST - Holds the cutting arm
                        🟡 INDEX WHEEL - Sets exact facet angles
                        🔴 QUILL - Holds your dopped stone
                        
                        The GemBot does the hard work - but YOU control it!`,
                highlight: '#gembotMachine',
                action: 'continue'
            },
            {
                id: 'cutting_2',
                title: 'Cutting Stages',
                speech: `Gem cutting has 6 stages:
                        
                        1️⃣ PREFORM - Rough shaping
                        2️⃣ CROWN ROUGH - Cut crown facets coarse
                        3️⃣ CROWN FINE - Refine crown with finer lap
                        4️⃣ PAVILION ROUGH - Cut pavilion facets
                        5️⃣ PAVILION FINE - Refine pavilion
                        6️⃣ POLISH - Final brilliant polish!
                        
                        The machine needs YOU at certain points:
                        • Change laps
                        • Adjust angles
                        • Check progress
                        • Refill water`,
                highlight: null,
                action: 'continue'
            },
            {
                id: 'cutting_3',
                title: 'Your First Cut!',
                speech: `Time for your first gem!
                        
                        I've prepared a simple Quartz stone for you.
                        We'll do a classic Round Brilliant cut - 57 facets!
                        
                        Click your GemBot machine to start.
                        Watch for my guidance during cutting!
                        
                        💡 TIP: Keep water flowing and watch temperature!`,
                highlight: '#gembotMachine',
                action: 'start_cutting',
                requirement: { type: 'complete_cut', target: 1 },
                reward: { gbuv: 25, xp: 50, message: 'First gem complete!' }
            }
        ];
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // MINING MODULE
    // ═══════════════════════════════════════════════════════════════════════════
    getMiningSteps() {
        return [
            {
                id: 'mining_1',
                title: 'Mining Operations ⛏️',
                speech: `Where does rough material come from? MINING!
                        
                        In the 3D world outside your workshop, there are mining locations.
                        You can establish MINING POSTS to harvest rough stones automatically!
                        
                        🏔️ Mountain Mines - Sapphires, Rubies
                        🌿 Jungle Sites - Emeralds, Jade
                        🏜️ Desert Digs - Topaz, Garnet
                        💎 Crystal Caves - Quartz, Amethyst
                        
                        Let's explore!`,
                highlight: '#worldMapBtn',
                action: 'open_world_map'
            },
            {
                id: 'mining_2',
                title: 'Establishing a Mining Post',
                speech: `Mining posts cost $GBUV to build and operate:
                        
                        📍 CLAIM A SPOT - 50 GBUV
                        🏗️ BUILD POST - 100 GBUV
                        ⚡ OPERATING COST - 5 GBUV/hour
                        
                        Mining generates random rough stones over time.
                        Better locations = rarer stones!
                        
                        ⚠️ WARNING: Limited spots available!
                        Prime locations get claimed fast!`,
                highlight: '#miningPanel',
                action: 'continue'
            },
            {
                id: 'mining_3',
                title: 'Mining Yields',
                speech: `Each mining post produces rough material:
                        
                        ⏰ Every 30 minutes (real time) you might find:
                        • 60% chance: Common stone
                        • 25% chance: Uncommon stone
                        • 10% chance: Rare stone
                        • 5% chance: LEGENDARY find!
                        
                        Upgrade your posts to improve odds!
                        
                        Check on your posts regularly - storage fills up!`,
                highlight: null,
                action: 'continue',
                requirement: { type: 'establish_mining_post', target: 1 }
            }
        ];
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // TRADING MODULE
    // ═══════════════════════════════════════════════════════════════════════════
    getTradingSteps() {
        return [
            {
                id: 'trading_1',
                title: 'The Marketplace 🏪',
                speech: `Trading is where fortunes are made!
                        
                        In the Fantasy Marketplace, you can:
                        
                        💎 SELL CUT GEMS - Your finished work
                        🪨 SELL ROUGH - Raw material you mined
                        🔧 SELL PREPPED DOPS - Stones ready for cutting
                        🛒 BUY FROM OTHERS - Skip the prep work!
                        
                        All trades use $GBUV tokens.
                        25% transaction fee supports the ecosystem.`,
                highlight: '#marketplaceBtn',
                action: 'open_marketplace'
            },
            {
                id: 'trading_2',
                title: 'Trading Strategies',
                speech: `Smart trading tips:
                        
                        🧠 BUY LOW, SELL HIGH
                        • Rough material prices fluctuate
                        • Buy common rough in bulk when cheap
                        • Sell cut gems during events
                        
                        ⚡ SKIP THE GRIND
                        • Hate dopping? Buy prepped dops!
                        • Someone else did the work
                        • Pay premium for convenience
                        
                        💰 SELL YOUR TIME
                        • Good at prepping? Sell dops!
                        • Master miners sell rare rough
                        • Perfect cutters charge premium`,
                highlight: null,
                action: 'continue'
            },
            {
                id: 'trading_3',
                title: 'Player Economy',
                speech: `Our economy is PLAYER-DRIVEN!
                        
                        🏭 MINERS → Find rough material
                        🔧 PREPPERS → Prepare dops for cutting  
                        💎 CUTTERS → Create valuable gems
                        💰 TRADERS → Buy/sell for profit
                        
                        Find your niche!
                        Some players become mining magnates.
                        Others are master cutters.
                        
                        What will YOU be known for?`,
                highlight: null,
                action: 'continue',
                reward: { gbuv: 15, message: 'Trading knowledge unlocked!' }
            }
        ];
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CERTIFICATION MODULE
    // ═══════════════════════════════════════════════════════════════════════════
    getCertificationSteps() {
        return [
            {
                id: 'cert_1',
                title: 'GemBot Academy 📜',
                speech: `Ready for something REAL?
                        
                        The GemBot Academy offers actual gemology certifications!
                        
                        🎓 Learn real gem cutting skills
                        📚 Interactive courses with me as your guide
                        ✅ Secure testing (no cheating!)
                        📜 Blockchain-verified certificates
                        💼 Job placement assistance
                        
                        Your game skills translate to REAL skills!`,
                highlight: '#academyBtn',
                action: 'continue'
            },
            {
                id: 'cert_2',
                title: 'Certification Levels',
                speech: `Certification path:
                        
                        🥉 APPRENTICE (Free)
                        • Basic gem identification
                        • Simple cuts (Round, Oval)
                        • Safety fundamentals
                        
                        🥈 JOURNEYMAN (500 GBUV)
                        • Intermediate cuts
                        • Stone assessment
                        • Equipment maintenance
                        
                        🥇 MASTER CUTTER (2000 GBUV)
                        • Advanced faceting
                        • Custom designs
                        • Quality grading
                        
                        👑 GUILD MASTER (5000 GBUV)
                        • Expert certification
                        • Teaching credentials
                        • Industry recognition`,
                highlight: null,
                action: 'continue'
            },
            {
                id: 'cert_3',
                title: 'Real World Value',
                speech: `Your certifications are REAL:
                        
                        🔐 Blockchain-verified (cannot be faked)
                        🌐 Industry-recognized standards
                        💼 Resume-ready credentials
                        🤝 Job placement network
                        
                        Many players have turned GemBot skills into:
                        • Remote gem cutting jobs
                        • Jewelry design careers
                        • E-commerce businesses
                        
                        Your time here is an INVESTMENT in yourself!`,
                highlight: null,
                action: 'continue',
                reward: { gbuv: 50, message: 'Tutorial complete! Welcome to GemBot!' }
            }
        ];
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // TUTORIAL CONTROL
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Start the tutorial for a specific module
     */
    async startTutorial(moduleId = 'welcome') {
        const module = this.modules[moduleId];
        if (!module) {
            console.error('Unknown tutorial module:', moduleId);
            return;
        }
        
        this.tutorialActive = true;
        this.currentModule = module;
        this.currentStep = 0;
        
        console.log(`🧙‍♂️ Starting tutorial: ${module.name}`);
        
        // Create tutorial overlay
        this.createTutorialUI();
        
        // Show first step
        await this.showStep(module.steps[0]);
    }
    
    /**
     * Show a tutorial step
     */
    async showStep(step) {
        if (!step) return this.completeTutorial();
        
        // Update UI
        this.updateTutorialUI(step);
        
        // Highlight element if specified
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }
        
        // Have Merlin speak
        if (window.merlin && window.merlin.speak) {
            await window.merlin.speak(step.speech);
        }
        
        // Check for requirements
        if (step.requirement) {
            this.waitForRequirement(step.requirement, step);
        }
    }
    
    /**
     * Advance to next step
     */
    nextStep() {
        this.currentStep++;
        const module = this.currentModule;
        
        if (this.currentStep >= module.steps.length) {
            // Module complete - check for rewards
            const lastStep = module.steps[module.steps.length - 1];
            if (lastStep.reward) {
                this.giveReward(lastStep.reward);
            }
            
            // Mark module complete
            this.playerProgress.completedModules.push(module.id);
            this.saveProgress();
            
            // Check for next module
            this.promptNextModule();
        } else {
            this.showStep(module.steps[this.currentStep]);
        }
    }
    
    /**
     * Skip current tutorial
     */
    skipTutorial() {
        this.tutorialActive = false;
        this.removeTutorialUI();
        
        if (window.merlin && window.merlin.speak) {
            window.merlin.speak("No problem! Come back anytime by clicking '📚 Tutorial' in the menu. I'm always here to help!");
        }
    }
    
    /**
     * Complete current tutorial module
     */
    completeTutorial() {
        const module = this.currentModule;
        
        console.log(`✅ Tutorial complete: ${module.name}`);
        
        this.playerProgress.completedModules.push(module.id);
        this.saveProgress();
        
        this.tutorialActive = false;
        this.removeTutorialUI();
        
        // Show completion message
        if (window.merlin && window.merlin.speak) {
            window.merlin.speak(`Excellent work! You've completed the "${module.name}" tutorial. Your journey continues!`);
        }
        
        // Prompt for next module
        setTimeout(() => this.promptNextModule(), 3000);
    }
    
    /**
     * Prompt player to start next tutorial module
     */
    promptNextModule() {
        const nextModule = this.getNextUncompletedModule();
        
        if (nextModule) {
            this.showModulePrompt(nextModule);
        } else {
            // All tutorials complete!
            if (window.merlin && window.merlin.speak) {
                window.merlin.speak("You've completed all tutorials! You're now a true GemBot master. Go forth and cut brilliant gems!");
            }
        }
    }
    
    /**
     * Get next uncompleted module
     */
    getNextUncompletedModule() {
        const moduleOrder = ['welcome', 'workshop', 'rough_material', 'gem_cutting', 'mining', 'trading', 'certification'];
        
        for (const moduleId of moduleOrder) {
            if (!this.playerProgress.completedModules.includes(moduleId)) {
                return this.modules[moduleId];
            }
        }
        
        return null;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UI MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    createTutorialUI() {
        // Remove existing UI
        this.removeTutorialUI();
        
        const overlay = document.createElement('div');
        overlay.id = 'merlin-tutorial-overlay';
        overlay.innerHTML = `
            <style>
                #merlin-tutorial-overlay {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 100000;
                    pointer-events: none;
                }
                
                .tutorial-panel {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 600px;
                    background: linear-gradient(135deg, #1a1f3a 0%, #2d1f4a 100%);
                    border: 2px solid #9b59b6;
                    border-radius: 15px;
                    padding: 20px;
                    color: #fff;
                    font-family: 'Segoe UI', sans-serif;
                    box-shadow: 0 0 50px rgba(155, 89, 182, 0.5);
                    pointer-events: auto;
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                
                .tutorial-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                
                .tutorial-wizard {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #9b59b6, #8e44ad);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                    animation: wizardPulse 2s infinite;
                }
                
                @keyframes wizardPulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(155, 89, 182, 0.5); }
                    50% { box-shadow: 0 0 40px rgba(155, 89, 182, 0.8); }
                }
                
                .tutorial-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #d4a5ff;
                }
                
                .tutorial-subtitle {
                    font-size: 12px;
                    color: #888;
                }
                
                .tutorial-content {
                    background: rgba(0,0,0,0.3);
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 15px;
                    font-size: 14px;
                    line-height: 1.6;
                    white-space: pre-line;
                    max-height: 200px;
                    overflow-y: auto;
                }
                
                .tutorial-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                
                .tutorial-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s;
                }
                
                .tutorial-btn-primary {
                    background: linear-gradient(135deg, #9b59b6, #8e44ad);
                    color: #fff;
                }
                
                .tutorial-btn-primary:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 20px rgba(155, 89, 182, 0.5);
                }
                
                .tutorial-btn-secondary {
                    background: rgba(255,255,255,0.1);
                    color: #aaa;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .tutorial-btn-secondary:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .tutorial-progress {
                    display: flex;
                    gap: 5px;
                    justify-content: center;
                    margin-top: 15px;
                }
                
                .progress-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                }
                
                .progress-dot.active {
                    background: #9b59b6;
                }
                
                .progress-dot.complete {
                    background: #4ade80;
                }
                
                .tutorial-highlight {
                    position: fixed;
                    border: 3px solid #9b59b6;
                    border-radius: 10px;
                    box-shadow: 0 0 50px rgba(155, 89, 182, 0.5);
                    pointer-events: none;
                    z-index: 99999;
                    animation: highlightPulse 1.5s infinite;
                }
                
                @keyframes highlightPulse {
                    0%, 100% { box-shadow: 0 0 30px rgba(155, 89, 182, 0.5); }
                    50% { box-shadow: 0 0 60px rgba(155, 89, 182, 0.8); }
                }
            </style>
            
            <div class="tutorial-panel" id="tutorialPanel">
                <div class="tutorial-header">
                    <div class="tutorial-wizard">🧙‍♂️</div>
                    <div>
                        <div class="tutorial-title" id="tutorialTitle">Welcome!</div>
                        <div class="tutorial-subtitle" id="tutorialSubtitle">Tutorial Module</div>
                    </div>
                </div>
                <div class="tutorial-content" id="tutorialContent">
                    Loading...
                </div>
                <div class="tutorial-actions">
                    <button class="tutorial-btn tutorial-btn-secondary" onclick="window.merlinTutorial.skipTutorial()">Skip Tutorial</button>
                    <button class="tutorial-btn tutorial-btn-primary" id="tutorialNextBtn" onclick="window.merlinTutorial.nextStep()">Continue →</button>
                </div>
                <div class="tutorial-progress" id="tutorialProgress"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    updateTutorialUI(step) {
        const titleEl = document.getElementById('tutorialTitle');
        const subtitleEl = document.getElementById('tutorialSubtitle');
        const contentEl = document.getElementById('tutorialContent');
        const nextBtn = document.getElementById('tutorialNextBtn');
        const progressEl = document.getElementById('tutorialProgress');
        
        if (titleEl) titleEl.textContent = step.title;
        if (subtitleEl) subtitleEl.textContent = this.currentModule?.name || 'Tutorial';
        if (contentEl) contentEl.textContent = step.speech;
        
        // Update button text based on action
        if (nextBtn) {
            if (step.action === 'continue') {
                nextBtn.textContent = 'Continue →';
                nextBtn.disabled = false;
            } else if (step.requirement) {
                nextBtn.textContent = 'Complete Task to Continue';
                nextBtn.disabled = true;
            } else {
                nextBtn.textContent = 'Continue →';
                nextBtn.disabled = false;
            }
        }
        
        // Update progress dots
        if (progressEl && this.currentModule) {
            const steps = this.currentModule.steps;
            let dotsHtml = '';
            steps.forEach((s, i) => {
                let className = 'progress-dot';
                if (i < this.currentStep) className += ' complete';
                else if (i === this.currentStep) className += ' active';
                dotsHtml += `<div class="${className}"></div>`;
            });
            progressEl.innerHTML = dotsHtml;
        }
    }
    
    removeTutorialUI() {
        const overlay = document.getElementById('merlin-tutorial-overlay');
        if (overlay) overlay.remove();
        
        const highlight = document.querySelector('.tutorial-highlight');
        if (highlight) highlight.remove();
    }
    
    highlightElement(selector) {
        // Remove existing highlight
        const existing = document.querySelector('.tutorial-highlight');
        if (existing) existing.remove();
        
        const element = document.querySelector(selector);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        highlight.style.cssText = `
            top: ${rect.top - 5}px;
            left: ${rect.left - 5}px;
            width: ${rect.width + 10}px;
            height: ${rect.height + 10}px;
        `;
        
        document.body.appendChild(highlight);
    }
    
    showModulePrompt(module) {
        const prompt = document.createElement('div');
        prompt.id = 'module-prompt';
        prompt.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1f3a 0%, #2d1f4a 100%);
            border: 2px solid #9b59b6;
            border-radius: 15px;
            padding: 30px;
            color: #fff;
            text-align: center;
            z-index: 100001;
            box-shadow: 0 0 50px rgba(155, 89, 182, 0.5);
        `;
        
        prompt.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 15px;">🧙‍♂️</div>
            <h3 style="color: #d4a5ff; margin-bottom: 10px;">Ready for More?</h3>
            <p style="margin-bottom: 20px;">Next: <strong>${module.name}</strong></p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="document.getElementById('module-prompt').remove()" 
                    style="padding: 10px 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #aaa; cursor: pointer;">
                    Later
                </button>
                <button onclick="document.getElementById('module-prompt').remove(); window.merlinTutorial.startTutorial('${module.id}')" 
                    style="padding: 10px 20px; background: linear-gradient(135deg, #9b59b6, #8e44ad); border: none; border-radius: 8px; color: #fff; cursor: pointer; font-weight: bold;">
                    Start →
                </button>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (document.getElementById('module-prompt')) {
                document.getElementById('module-prompt').remove();
            }
        }, 10000);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PROGRESS & REWARDS
    // ═══════════════════════════════════════════════════════════════════════════
    
    loadProgress() {
        const saved = localStorage.getItem('merlin_tutorial_progress');
        return saved ? JSON.parse(saved) : {
            completedModules: [],
            totalRewardsEarned: 0,
            tutorialStarted: false
        };
    }
    
    saveProgress() {
        localStorage.setItem('merlin_tutorial_progress', JSON.stringify(this.playerProgress));
    }
    
    giveReward(reward) {
        if (reward.gbuv && window.gameFarm) {
            window.gameFarm.state.player.gems += reward.gbuv;
            this.playerProgress.totalRewardsEarned += reward.gbuv;
        }
        
        if (reward.xp && window.gameFarm) {
            window.gameFarm.state.player.xp += reward.xp;
        }
        
        if (reward.message) {
            if (window.liveActivityFeed) {
                window.liveActivityFeed.log('ACHIEVEMENT', `🎁 ${reward.message} (+${reward.gbuv || 0} GBUV)`);
            }
        }
        
        this.saveProgress();
    }
    
    waitForRequirement(requirement, step) {
        // Set up listener for requirement completion
        const checkInterval = setInterval(() => {
            let completed = false;
            
            switch (requirement.type) {
                case 'dop_stone':
                    completed = window.gameFarm?.state?.dopHolder?.length >= requirement.target;
                    break;
                case 'complete_cut':
                    completed = window.gameFarm?.state?.stats?.totalCuts >= requirement.target;
                    break;
                case 'establish_mining_post':
                    completed = window.gameFarm?.state?.miningPosts?.length >= requirement.target;
                    break;
            }
            
            if (completed) {
                clearInterval(checkInterval);
                
                // Enable next button
                const nextBtn = document.getElementById('tutorialNextBtn');
                if (nextBtn) {
                    nextBtn.textContent = 'Continue →';
                    nextBtn.disabled = false;
                }
                
                // Give step reward if any
                if (step.reward) {
                    this.giveReward(step.reward);
                }
            }
        }, 1000);
        
        // Timeout after 5 minutes
        setTimeout(() => clearInterval(checkInterval), 300000);
    }
    
    /**
     * Check if new player should see tutorial
     */
    shouldShowTutorial() {
        return !this.playerProgress.tutorialStarted;
    }
    
    /**
     * Mark tutorial as started
     */
    markTutorialStarted() {
        this.playerProgress.tutorialStarted = true;
        this.saveProgress();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZE
// ═══════════════════════════════════════════════════════════════════════════════
window.merlinTutorial = new MerlinTutorialSystem();

// Auto-start for new players
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.merlinTutorial.shouldShowTutorial()) {
            // Show welcome prompt
            const showTutorial = confirm('🧙‍♂️ Welcome to GemBot Farm!\n\nWould you like Merlin to guide you through the basics?');
            
            if (showTutorial) {
                window.merlinTutorial.markTutorialStarted();
                window.merlinTutorial.startTutorial('welcome');
            } else {
                window.merlinTutorial.markTutorialStarted();
            }
        }
    }, 5000); // Wait 5 seconds after page load
});

console.log('🧙‍♂️ Merlin Tutorial System loaded - use window.merlinTutorial.startTutorial() to begin');
