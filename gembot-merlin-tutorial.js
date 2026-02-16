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
 * File: gembot-merlin-tutorial.js
 * Declaration ID: IP-3E2F4758-MLL28ZUX
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧙‍♂️ MERLIN TUTORIAL SYSTEM - Interactive Game Guide
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Guides new players through the complete GemBot Farm workflow:
 * Mining → Rough Inventory → Prep → Dop → Cut → Sell/Trade
 * 
 * Features:
 * - Step-by-step interactive tutorial
 * - Voice narration with Merlin AI
 * - Highlighting of UI elements
 * - Progress tracking
 * - Skip option for returning players
 * 
 * COPYRIGHT © 2024-2025 Ryan Barbrick / Barbrick Design
 * Creator: Ryan Barbrick | Contact: BarbrickDesign@gmail.com
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class MerlinTutorial {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.hasCompleted = false;
        this.overlay = null;
        this.highlightElement = null;
        this.merlinPanel = null;
        
        // Tutorial steps
        this.steps = [
            {
                id: 'welcome',
                title: 'Welcome to GemBot Farm!',
                message: `Greetings, young gem cutter! I am Merlin, your mystical guide to the ancient art of gemstone faceting. Together, we shall transform rough stones into brilliant treasures!`,
                action: null,
                highlight: null,
                position: 'center',
                waitFor: 'click'
            },
            {
                id: 'workshop_overview',
                title: 'Your Workshop',
                message: `This is your workshop - the heart of your gem cutting empire! Here you'll prepare rough stones, dop them onto sticks, and feed them to your GemBot machines. Let me show you around...`,
                action: null,
                highlight: '.game-mode-container',
                position: 'center',
                waitFor: 'click'
            },
            {
                id: 'rough_pile',
                title: 'Rough Stone Pile',
                message: `See these rough stones on your table? Each one is a mystery waiting to be revealed! Click on a rough stone to examine it - you'll see its estimated type, size, and quality potential.`,
                action: 'showRoughPile',
                highlight: '#roughStonePile',
                position: 'right',
                waitFor: 'action',
                requiredAction: 'selectRough'
            },
            {
                id: 'examine_rough',
                title: 'Examining Rough',
                message: `Excellent! This stone shows promise. Notice the crystal structure and color - these hint at what lies within. Now drag this stone to the Prep Station to begin preparation.`,
                action: null,
                highlight: '#prepStation',
                position: 'left',
                waitFor: 'action',
                requiredAction: 'startPrep'
            },
            {
                id: 'prep_station',
                title: 'Preparation Station',
                message: `At the Prep Station, we clean the stone, orient it for the best cut, and mark where our facets will go. Watch as I demonstrate the proper technique...`,
                action: 'demonstratePrep',
                highlight: '#prepStation',
                position: 'right',
                waitFor: 'click'
            },
            {
                id: 'dopping',
                title: 'Dopping the Stone',
                message: `Now for a crucial step - DOPPING! We heat special wax and carefully attach the stone to a dop stick. This gives the GemBot something to hold while it cuts. Precision here affects your final result!`,
                action: 'demonstrateDop',
                highlight: '#dopStation',
                position: 'right',
                waitFor: 'action',
                requiredAction: 'dopStone'
            },
            {
                id: 'dop_holder',
                title: 'The Dop Holder',
                message: `This wooden block with holes is your Dop Holder - your ready inventory! Dopped stones wait here until a GemBot is free. You can have ${8} stones ready at first, but this is upgradeable!`,
                action: null,
                highlight: '#dopHolder',
                position: 'left',
                waitFor: 'click'
            },
            {
                id: 'gembot_machine',
                title: 'Meet Your GemBot!',
                message: `Behold - the GemBot Mini! This magnificent machine will cut your facets with superhuman precision. Drag a dopped stone from the holder to the machine to begin cutting!`,
                action: null,
                highlight: '.machine-item',
                position: 'right',
                waitFor: 'action',
                requiredAction: 'loadMachine'
            },
            {
                id: 'cutting_process',
                title: 'The Cutting Process',
                message: `IMPORTANT: This is NOT a fully idle game! Your GemBot needs attention. Watch for alerts - you must change laps, add water, apply polish, and approve each cutting stage. Your skill affects the outcome!`,
                action: null,
                highlight: '#machinesList',
                position: 'center',
                waitFor: 'click'
            },
            {
                id: 'machine_alerts',
                title: 'Machine Alerts',
                message: `When you see a flashing alert, the machine needs YOU! Low water? Click to refill. Lap worn? Click to change it. Each decision you make affects the final quality. Stay engaged!`,
                action: 'demonstrateAlert',
                highlight: '.machine-item',
                position: 'right',
                waitFor: 'click'
            },
            {
                id: 'resources',
                title: 'Managing Resources',
                message: `Keep an eye on your resources! Water, wax, laps, and polish paste are all consumables. You can buy more from the Shop, or trade with other players. Running out mid-cut can ruin a stone!`,
                action: null,
                highlight: '.game-resources-panel',
                position: 'top',
                waitFor: 'click'
            },
            {
                id: 'finished_gem',
                title: 'Your First Gem!',
                message: `Congratulations! When cutting completes, you'll have a finished gemstone! Its quality depends on your stone selection, prep work, and attention during cutting. Better gems = more GBUV!`,
                action: null,
                highlight: '#activityFeed',
                position: 'top',
                waitFor: 'click'
            },
            {
                id: 'marketplace',
                title: 'The Marketplace',
                message: `Ready to profit? The Marketplace lets you sell finished gems, trade rough stones, and even commission Austin's custom jewelry! Click the Shop button to explore.`,
                action: null,
                highlight: '.quick-shop',
                position: 'left',
                waitFor: 'click'
            },
            {
                id: 'mining_intro',
                title: 'Mining for Rough',
                message: `Running low on rough stones? You'll need to venture into the Mining World! Set up mining posts to gather more rough - but operations cost GBUV to run. Deeper mines find better stones!`,
                action: null,
                highlight: null,
                position: 'center',
                waitFor: 'click'
            },
            {
                id: 'upgrades',
                title: 'Upgrades & Progression',
                message: `As you level up and earn GBUV, you can upgrade everything: more rough storage, bigger dop holders, faster machines, better laps, and even unlock new rooms for your workshop!`,
                action: null,
                highlight: '.game-upgrades-panel',
                position: 'left',
                waitFor: 'click'
            },
            {
                id: 'trading',
                title: 'Player Trading',
                message: `The economy thrives on trading! Sell rough you don't need, buy stones other players found, trade prepped stones ready for cutting. The marketplace is your gateway to wealth!`,
                action: null,
                highlight: null,
                position: 'center',
                waitFor: 'click'
            },
            {
                id: 'real_gembot',
                title: 'Real GemBot Bonus!',
                message: `Own a REAL GemBot Mini? Connect it to earn a 50% production bonus! Your virtual and physical worlds unite - cut real gems while your game empire grows!`,
                action: null,
                highlight: '#realMachineBonus',
                position: 'center',
                waitFor: 'click'
            },
            {
                id: 'complete',
                title: 'Tutorial Complete!',
                message: `You're ready to begin your journey, young master! Remember - I'm always here to help. Click the Merlin icon anytime for tips and guidance. Now go forth and cut some gems!`,
                action: 'completeTutorial',
                highlight: null,
                position: 'center',
                waitFor: 'click'
            }
        ];
        
        // Initialize
        this.init();
    }
    
    init() {
        // Check if tutorial was completed before
        const savedProgress = localStorage.getItem('gembot_tutorial_progress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.hasCompleted = progress.completed;
            this.currentStep = progress.currentStep || 0;
        }
        
        // Create tutorial UI elements
        this.createTutorialUI();
        
        // Global access
        window.merlinTutorial = this;
        
        console.log('🧙‍♂️ Merlin Tutorial System initialized');
    }
    
    createTutorialUI() {
        // Tutorial overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'merlin-tutorial-overlay';
        this.overlay.innerHTML = `
            <style>
                #merlin-tutorial-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 100000;
                    display: none;
                    pointer-events: auto;
                }
                
                #merlin-tutorial-overlay.active {
                    display: block;
                }
                
                .tutorial-highlight {
                    position: absolute;
                    border: 3px solid #ffd700;
                    border-radius: 8px;
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3);
                    animation: tutorialPulse 1.5s ease-in-out infinite;
                    pointer-events: none;
                    z-index: 100001;
                }
                
                @keyframes tutorialPulse {
                    0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3); }
                    50% { box-shadow: 0 0 50px rgba(255, 215, 0, 1), inset 0 0 30px rgba(255, 215, 0, 0.5); }
                }
                
                .merlin-panel {
                    position: fixed;
                    background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a1a3e 100%);
                    border: 3px solid #9f7aea;
                    border-radius: 20px;
                    padding: 25px;
                    max-width: 450px;
                    z-index: 100002;
                    box-shadow: 0 10px 50px rgba(159, 122, 234, 0.5);
                    animation: merlinAppear 0.5s ease-out;
                }
                
                @keyframes merlinAppear {
                    from {
                        transform: scale(0.8) translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1) translateY(0);
                        opacity: 1;
                    }
                }
                
                .merlin-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                    border-bottom: 1px solid rgba(159, 122, 234, 0.3);
                    padding-bottom: 15px;
                }
                
                .merlin-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #9f7aea);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                    border: 2px solid #ffd700;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                }
                
                .merlin-title {
                    color: #ffd700;
                    font-size: 18px;
                    font-weight: bold;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                }
                
                .merlin-subtitle {
                    color: #9f7aea;
                    font-size: 12px;
                    margin-top: 4px;
                }
                
                .merlin-message {
                    color: #e0e0e0;
                    font-size: 15px;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                
                .merlin-controls {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                
                .merlin-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .merlin-btn-primary {
                    background: linear-gradient(135deg, #667eea, #9f7aea);
                    color: white;
                }
                
                .merlin-btn-primary:hover {
                    transform: scale(1.05);
                    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.5);
                }
                
                .merlin-btn-secondary {
                    background: transparent;
                    border: 1px solid #9f7aea;
                    color: #9f7aea;
                }
                
                .merlin-btn-secondary:hover {
                    background: rgba(159, 122, 234, 0.2);
                }
                
                .merlin-progress {
                    display: flex;
                    gap: 4px;
                    margin-top: 15px;
                    justify-content: center;
                }
                
                .progress-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(159, 122, 234, 0.3);
                    transition: all 0.3s;
                }
                
                .progress-dot.active {
                    background: #ffd700;
                    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                }
                
                .progress-dot.completed {
                    background: #4ecdc4;
                }
                
                .tutorial-arrow {
                    position: absolute;
                    width: 0;
                    height: 0;
                    border: 15px solid transparent;
                }
                
                .arrow-left { border-right-color: #9f7aea; }
                .arrow-right { border-left-color: #9f7aea; }
                .arrow-top { border-bottom-color: #9f7aea; }
                .arrow-bottom { border-top-color: #9f7aea; }
            </style>
        `;
        
        document.body.appendChild(this.overlay);
    }
    
    /**
     * Start the tutorial
     */
    start(forceRestart = false) {
        if (this.hasCompleted && !forceRestart) {
            // Show quick restart option
            this.showRestartPrompt();
            return;
        }
        
        this.isActive = true;
        this.currentStep = 0;
        this.overlay.classList.add('active');
        this.showStep(0);
        
        console.log('🧙‍♂️ Tutorial started');
    }
    
    showRestartPrompt() {
        const panel = document.createElement('div');
        panel.className = 'merlin-panel';
        panel.style.cssText = 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
        panel.innerHTML = `
            <div class="merlin-header">
                <div class="merlin-avatar">🧙‍♂️</div>
                <div>
                    <h3 class="merlin-title">Welcome Back!</h3>
                    <div class="merlin-subtitle">Merlin AI Guide</div>
                </div>
            </div>
            <div class="merlin-message">
                Ah, I see you've been here before! Would you like to review the tutorial again, or jump straight into your workshop?
            </div>
            <div class="merlin-controls">
                <button class="merlin-btn merlin-btn-secondary" onclick="merlinTutorial.dismissPrompt()">Skip Tutorial</button>
                <button class="merlin-btn merlin-btn-primary" onclick="merlinTutorial.start(true)">Restart Tutorial</button>
            </div>
        `;
        
        this.overlay.classList.add('active');
        this.overlay.appendChild(panel);
        this.merlinPanel = panel;
    }
    
    dismissPrompt() {
        this.overlay.classList.remove('active');
        if (this.merlinPanel) {
            this.merlinPanel.remove();
            this.merlinPanel = null;
        }
    }
    
    /**
     * Show a specific tutorial step
     */
    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.complete();
            return;
        }
        
        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;
        
        // Clear previous
        this.clearStep();
        
        // Highlight target element
        if (step.highlight) {
            this.highlightTarget(step.highlight);
        }
        
        // Create Merlin panel
        this.createMerlinPanel(step);
        
        // Execute step action
        if (step.action && typeof this[step.action] === 'function') {
            this[step.action]();
        }
        
        // Speak the message
        this.speak(step.message);
        
        // Save progress
        this.saveProgress();
    }
    
    highlightTarget(selector) {
        const target = document.querySelector(selector);
        if (!target) return;
        
        const rect = target.getBoundingClientRect();
        
        // Create highlight box
        this.highlightElement = document.createElement('div');
        this.highlightElement.className = 'tutorial-highlight';
        this.highlightElement.style.cssText = `
            top: ${rect.top - 5}px;
            left: ${rect.left - 5}px;
            width: ${rect.width + 10}px;
            height: ${rect.height + 10}px;
        `;
        
        // Cut out the highlight area from overlay
        this.overlay.style.clipPath = `polygon(
            0% 0%, 0% 100%, 
            ${rect.left}px 100%, 
            ${rect.left}px ${rect.top}px, 
            ${rect.right}px ${rect.top}px, 
            ${rect.right}px ${rect.bottom}px, 
            ${rect.left}px ${rect.bottom}px, 
            ${rect.left}px 100%, 
            100% 100%, 100% 0%
        )`;
        
        document.body.appendChild(this.highlightElement);
    }
    
    createMerlinPanel(step) {
        const panel = document.createElement('div');
        panel.className = 'merlin-panel';
        
        // Position based on step settings
        const position = this.calculatePosition(step);
        panel.style.cssText = position;
        
        // Progress dots
        let progressDots = '';
        for (let i = 0; i < this.steps.length; i++) {
            const state = i < this.currentStep ? 'completed' : i === this.currentStep ? 'active' : '';
            progressDots += `<div class="progress-dot ${state}"></div>`;
        }
        
        panel.innerHTML = `
            <div class="merlin-header">
                <div class="merlin-avatar">🧙‍♂️</div>
                <div>
                    <h3 class="merlin-title">${step.title}</h3>
                    <div class="merlin-subtitle">Step ${this.currentStep + 1} of ${this.steps.length}</div>
                </div>
            </div>
            <div class="merlin-message">${step.message}</div>
            <div class="merlin-controls">
                ${this.currentStep > 0 ? '<button class="merlin-btn merlin-btn-secondary" onclick="merlinTutorial.previousStep()">← Back</button>' : ''}
                <button class="merlin-btn merlin-btn-secondary" onclick="merlinTutorial.skipTutorial()">Skip All</button>
                <button class="merlin-btn merlin-btn-primary" onclick="merlinTutorial.nextStep()">
                    ${this.currentStep === this.steps.length - 1 ? 'Finish! 🎉' : 'Next →'}
                </button>
            </div>
            <div class="merlin-progress">${progressDots}</div>
        `;
        
        this.overlay.appendChild(panel);
        this.merlinPanel = panel;
    }
    
    calculatePosition(step) {
        if (!step.highlight) {
            return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
        }
        
        const target = document.querySelector(step.highlight);
        if (!target) {
            return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
        }
        
        const rect = target.getBoundingClientRect();
        const panelWidth = 450;
        const panelHeight = 300;
        const padding = 20;
        
        switch (step.position) {
            case 'right':
                return `top: ${rect.top}px; left: ${rect.right + padding}px;`;
            case 'left':
                return `top: ${rect.top}px; left: ${rect.left - panelWidth - padding}px;`;
            case 'top':
                return `top: ${rect.top - panelHeight - padding}px; left: ${rect.left}px;`;
            case 'bottom':
                return `top: ${rect.bottom + padding}px; left: ${rect.left}px;`;
            default:
                return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
        }
    }
    
    clearStep() {
        if (this.highlightElement) {
            this.highlightElement.remove();
            this.highlightElement = null;
        }
        if (this.merlinPanel) {
            this.merlinPanel.remove();
            this.merlinPanel = null;
        }
        this.overlay.style.clipPath = '';
    }
    
    nextStep() {
        this.showStep(this.currentStep + 1);
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    skipTutorial() {
        this.hasCompleted = true;
        this.isActive = false;
        this.clearStep();
        this.overlay.classList.remove('active');
        this.saveProgress();
        
        // Show quick help reminder
        this.showSkipMessage();
    }
    
    showSkipMessage() {
        if (window.addMessage) {
            window.addMessage('Tutorial skipped. Click the 🧙‍♂️ Merlin icon anytime for help!', 'system');
        }
    }
    
    complete() {
        this.hasCompleted = true;
        this.isActive = false;
        this.clearStep();
        this.overlay.classList.remove('active');
        this.saveProgress();
        
        // Achievement
        if (window.gameFarm) {
            window.gameFarm.unlockAchievement?.('tutorial_complete');
        }
        
        // Celebration
        this.speak('Congratulations, young master! Your journey as a gem cutter begins now. May your facets be flawless and your yields high!');
        
        console.log('🧙‍♂️ Tutorial completed!');
    }
    
    /**
     * Speak with Merlin's voice
     */
    speak(text) {
        // Use existing Merlin voice system if available
        if (window.merlin?.speak) {
            window.merlin.speak(text);
        } else if ('speechSynthesis' in window) {
            // Fallback to basic speech
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Get wizard-like voice
            const voices = speechSynthesis.getVoices();
            const maleVoice = voices.find(v => 
                v.name.toLowerCase().includes('david') ||
                v.name.toLowerCase().includes('james') ||
                v.name.toLowerCase().includes('daniel') ||
                (v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
            ) || voices.find(v => v.lang.startsWith('en'));
            
            if (maleVoice) utterance.voice = maleVoice;
            utterance.pitch = 0.8;
            utterance.rate = 0.9;
            
            speechSynthesis.speak(utterance);
        }
    }
    
    saveProgress() {
        localStorage.setItem('gembot_tutorial_progress', JSON.stringify({
            completed: this.hasCompleted,
            currentStep: this.currentStep,
            timestamp: Date.now()
        }));
    }
    
    /**
     * Reset tutorial progress
     */
    reset() {
        localStorage.removeItem('gembot_tutorial_progress');
        this.hasCompleted = false;
        this.currentStep = 0;
        console.log('🧙‍♂️ Tutorial progress reset');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // TUTORIAL ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    showRoughPile() {
        // Ensure rough pile is visible
        const roughPile = document.getElementById('roughStonePile');
        if (roughPile) {
            roughPile.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    demonstratePrep() {
        // Show prep animation
        console.log('🧙‍♂️ Demonstrating prep station...');
    }
    
    demonstrateDop() {
        // Show dopping animation
        console.log('🧙‍♂️ Demonstrating dopping...');
    }
    
    demonstrateAlert() {
        // Show sample alert
        if (window.gameFarm) {
            window.addGameActivity?.('⚠️ [DEMO] Water level low! Click to refill.');
        }
    }
    
    completeTutorial() {
        // Final celebration
        console.log('🧙‍♂️ Tutorial complete action');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUGH STONE PILE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

class RoughStonePile {
    constructor(container) {
        this.container = container;
        this.stones = [];
        this.maxSlots = 5; // Starting slots
        this.selectedStone = null;
        
        // Stone types with visual properties
        this.stoneTypes = {
            quartz: { color: '#e8e8f0', emoji: '🪨', name: 'Quartz' },
            amethyst: { color: '#9966cc', emoji: '💜', name: 'Amethyst' },
            citrine: { color: '#ffd700', emoji: '💛', name: 'Citrine' },
            garnet: { color: '#8b0000', emoji: '❤️', name: 'Garnet' },
            topaz: { color: '#ffc87c', emoji: '🧡', name: 'Topaz' },
            emerald: { color: '#50c878', emoji: '💚', name: 'Emerald' },
            ruby: { color: '#e0115f', emoji: '❤️‍🔥', name: 'Ruby' },
            sapphire: { color: '#0f52ba', emoji: '💙', name: 'Sapphire' }
        };
        
        this.init();
    }
    
    init() {
        this.loadState();
        this.render();
        
        window.roughStonePile = this;
    }
    
    loadState() {
        const saved = localStorage.getItem('gembot_rough_pile');
        if (saved) {
            const data = JSON.parse(saved);
            this.stones = data.stones || [];
            this.maxSlots = data.maxSlots || 5;
        } else {
            // Start with some free rough
            this.addStarterStones();
        }
    }
    
    addStarterStones() {
        this.stones = [
            this.generateRough('quartz', 'common'),
            this.generateRough('quartz', 'common'),
            this.generateRough('amethyst', 'rare')
        ];
    }
    
    generateRough(type, rarity = 'common') {
        const typeData = this.stoneTypes[type] || this.stoneTypes.quartz;
        
        return {
            id: 'rough_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            type: type,
            name: typeData.name,
            rarity: rarity,
            estimatedCarats: (Math.random() * 4 + 0.5).toFixed(2),
            estimatedQuality: Math.floor(Math.random() * 40 + 40),
            color: typeData.color,
            emoji: typeData.emoji,
            acquired: Date.now()
        };
    }
    
    render() {
        if (!this.container) return;
        
        let html = `
            <div class="rough-pile-header">
                <span>🪨 Rough Stones</span>
                <span class="rough-count">${this.stones.length}/${this.maxSlots}</span>
            </div>
            <div class="rough-stones-grid">
        `;
        
        // Render stones
        this.stones.forEach(stone => {
            html += `
                <div class="rough-stone" 
                     data-id="${stone.id}"
                     onclick="roughStonePile.selectStone('${stone.id}')"
                     draggable="true"
                     ondragstart="roughStonePile.dragStart(event, '${stone.id}')"
                     style="background: ${stone.color}30; border-color: ${stone.color};">
                    <span class="stone-emoji">${stone.emoji}</span>
                    <span class="stone-name">${stone.name}</span>
                    <span class="stone-carats">${stone.estimatedCarats}ct</span>
                </div>
            `;
        });
        
        // Empty slots
        for (let i = this.stones.length; i < this.maxSlots; i++) {
            html += `<div class="rough-slot empty">○</div>`;
        }
        
        html += `</div>`;
        
        // Actions
        if (this.selectedStone) {
            const stone = this.stones.find(s => s.id === this.selectedStone);
            html += `
                <div class="rough-actions">
                    <button class="action-btn prep-btn" onclick="roughStonePile.sendToPrep('${this.selectedStone}')">
                        🔧 Prep
                    </button>
                    <button class="action-btn sell-btn" onclick="roughStonePile.sellRough('${this.selectedStone}')">
                        💰 Sell
                    </button>
                    <button class="action-btn trade-btn" onclick="roughStonePile.listForTrade('${this.selectedStone}')">
                        🔄 Trade
                    </button>
                </div>
                <div class="stone-details">
                    <strong>${stone.name}</strong> (${stone.rarity})
                    <br>Est. ${stone.estimatedCarats} carats | Quality: ${stone.estimatedQuality}%
                </div>
            `;
        }
        
        this.container.innerHTML = html;
    }
    
    selectStone(id) {
        this.selectedStone = this.selectedStone === id ? null : id;
        this.render();
        
        // Trigger tutorial action
        if (window.merlinTutorial?.isActive) {
            window.merlinTutorial.nextStep();
        }
    }
    
    dragStart(event, id) {
        event.dataTransfer.setData('stoneId', id);
        event.dataTransfer.setData('sourceType', 'rough');
    }
    
    addStone(stone) {
        if (this.stones.length >= this.maxSlots) {
            console.log('❌ Rough pile is full!');
            return false;
        }
        
        this.stones.push(stone);
        this.saveState();
        this.render();
        return true;
    }
    
    removeStone(id) {
        const index = this.stones.findIndex(s => s.id === id);
        if (index >= 0) {
            const stone = this.stones.splice(index, 1)[0];
            this.saveState();
            this.render();
            return stone;
        }
        return null;
    }
    
    sendToPrep(id) {
        const stone = this.removeStone(id);
        if (stone && window.prepStation) {
            window.prepStation.receiveStone(stone);
        }
    }
    
    sellRough(id) {
        const stone = this.stones.find(s => s.id === id);
        if (!stone) return;
        
        const value = Math.floor(stone.estimatedCarats * stone.estimatedQuality * 2);
        if (window.gameFarm) {
            window.gameFarm.state.player.gems += value;
        }
        
        this.removeStone(id);
        window.addGameActivity?.(`💰 Sold rough ${stone.name} for ${value} gems`);
    }
    
    listForTrade(id) {
        console.log('📋 Listing stone for trade:', id);
        // TODO: Implement trade listing
    }
    
    upgradeSlots() {
        const costs = [100, 500, 2000, 10000];
        const levels = [8, 12, 20, 50];
        
        const currentLevel = levels.findIndex(l => l > this.maxSlots);
        if (currentLevel < 0) {
            console.log('❌ Max slots reached!');
            return false;
        }
        
        const cost = costs[currentLevel];
        if (window.gameFarm?.state.player.gems >= cost) {
            window.gameFarm.state.player.gems -= cost;
            this.maxSlots = levels[currentLevel];
            this.saveState();
            this.render();
            window.addGameActivity?.(`⬆️ Upgraded rough storage to ${this.maxSlots} slots!`);
            return true;
        }
        
        console.log('❌ Not enough gems for upgrade');
        return false;
    }
    
    saveState() {
        localStorage.setItem('gembot_rough_pile', JSON.stringify({
            stones: this.stones,
            maxSlots: this.maxSlots
        }));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOP STICK HOLDER SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

class DopStickHolder {
    constructor(container) {
        this.container = container;
        this.slots = [];
        this.maxSlots = 8; // Starting slots (2 rows of 4)
        
        this.init();
    }
    
    init() {
        this.loadState();
        this.render();
        
        window.dopHolder = this;
    }
    
    loadState() {
        const saved = localStorage.getItem('gembot_dop_holder');
        if (saved) {
            const data = JSON.parse(saved);
            this.slots = data.slots || [];
            this.maxSlots = data.maxSlots || 8;
        }
    }
    
    render() {
        if (!this.container) return;
        
        const slotsPerRow = Math.min(8, this.maxSlots / 2);
        
        let html = `
            <div class="dop-holder-header">
                <span>🪵 Dop Holder</span>
                <span class="dop-count">${this.slots.length}/${this.maxSlots}</span>
            </div>
            <div class="dop-holder-wood" style="grid-template-columns: repeat(${slotsPerRow}, 1fr);">
        `;
        
        // Render slots
        for (let i = 0; i < this.maxSlots; i++) {
            const slot = this.slots[i];
            
            if (slot) {
                // Filled slot with dopped stone
                const isCutting = slot.currentlyInMachine;
                html += `
                    <div class="dop-slot filled ${isCutting ? 'cutting' : ''}"
                         data-index="${i}"
                         draggable="${!isCutting}"
                         ondragstart="dopHolder.dragStart(event, ${i})"
                         onclick="dopHolder.selectSlot(${i})"
                         title="${slot.stone.name} - ${slot.stone.estimatedCarats}ct">
                        <div class="dop-stick"></div>
                        <div class="dopped-stone" style="background: ${slot.stone.color};">
                            ${slot.stone.emoji}
                        </div>
                        ${isCutting ? '<span class="cutting-indicator">⚙️</span>' : ''}
                    </div>
                `;
            } else {
                // Empty slot (hole in wood)
                html += `
                    <div class="dop-slot empty"
                         data-index="${i}"
                         ondragover="event.preventDefault()"
                         ondrop="dopHolder.handleDrop(event, ${i})">
                        <div class="dop-hole">○</div>
                    </div>
                `;
            }
        }
        
        html += `</div>`;
        
        this.container.innerHTML = html;
    }
    
    addDoppedStone(stone, dopType = 'wax') {
        // Find empty slot
        const emptyIndex = this.findEmptySlot();
        if (emptyIndex < 0) {
            console.log('❌ Dop holder is full!');
            return false;
        }
        
        this.slots[emptyIndex] = {
            id: 'dop_' + Date.now(),
            stone: stone,
            dopType: dopType,
            doppedAt: Date.now(),
            currentlyInMachine: false
        };
        
        this.saveState();
        this.render();
        
        window.addGameActivity?.(`🕯️ Dopped ${stone.name} onto stick #${emptyIndex + 1}`);
        return true;
    }
    
    findEmptySlot() {
        for (let i = 0; i < this.maxSlots; i++) {
            if (!this.slots[i]) return i;
        }
        return -1;
    }
    
    removeFromSlot(index) {
        if (this.slots[index] && !this.slots[index].currentlyInMachine) {
            const item = this.slots[index];
            this.slots[index] = null;
            this.saveState();
            this.render();
            return item;
        }
        return null;
    }
    
    selectSlot(index) {
        const slot = this.slots[index];
        if (!slot) return;
        
        console.log('Selected dop slot:', index, slot);
        
        // If not cutting, allow loading into machine
        if (!slot.currentlyInMachine && window.gameFarm) {
            // Find idle machine
            const idleMachine = window.gameFarm.state.machines.find(m => !m.currentStone);
            if (idleMachine) {
                this.loadIntoMachine(index, idleMachine.id);
            }
        }
    }
    
    loadIntoMachine(slotIndex, machineId) {
        const slot = this.slots[slotIndex];
        if (!slot || slot.currentlyInMachine) return false;
        
        // Mark as in machine
        slot.currentlyInMachine = true;
        slot.machineId = machineId;
        
        // Tell game to start cutting
        if (window.gameFarm) {
            const machine = window.gameFarm.state.machines.find(m => m.id === machineId);
            if (machine) {
                machine.currentStone = {
                    ...slot.stone,
                    dopSlotIndex: slotIndex,
                    currentStage: 'rough_grind',
                    progress: 0
                };
            }
        }
        
        this.saveState();
        this.render();
        
        window.addGameActivity?.(`⚙️ Loaded ${slot.stone.name} into GemBot for cutting`);
        
        // Tutorial trigger
        if (window.merlinTutorial?.isActive) {
            window.merlinTutorial.nextStep();
        }
        
        return true;
    }
    
    finishCutting(slotIndex) {
        if (this.slots[slotIndex]) {
            const item = this.slots[slotIndex];
            this.slots[slotIndex] = null;
            this.saveState();
            this.render();
            return item;
        }
        return null;
    }
    
    dragStart(event, index) {
        event.dataTransfer.setData('dopIndex', index);
        event.dataTransfer.setData('sourceType', 'dop');
    }
    
    handleDrop(event, targetIndex) {
        event.preventDefault();
        const sourceType = event.dataTransfer.getData('sourceType');
        
        if (sourceType === 'prep') {
            // Receiving from prep station
            const stoneData = event.dataTransfer.getData('stoneData');
            if (stoneData) {
                const stone = JSON.parse(stoneData);
                this.addDoppedStone(stone);
            }
        }
    }
    
    upgradeSlots() {
        const costs = [500, 2000, 10000];
        const levels = [16, 32, 64];
        
        const currentLevel = levels.findIndex(l => l > this.maxSlots);
        if (currentLevel < 0) {
            console.log('❌ Max slots reached!');
            return false;
        }
        
        const cost = costs[currentLevel];
        if (window.gameFarm?.state.player.gems >= cost) {
            window.gameFarm.state.player.gems -= cost;
            this.maxSlots = levels[currentLevel];
            this.saveState();
            this.render();
            window.addGameActivity?.(`⬆️ Upgraded dop holder to ${this.maxSlots} slots!`);
            return true;
        }
        
        return false;
    }
    
    saveState() {
        localStorage.setItem('gembot_dop_holder', JSON.stringify({
            slots: this.slots,
            maxSlots: this.maxSlots
        }));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREP STATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

class PrepStation {
    constructor(container) {
        this.container = container;
        this.currentStone = null;
        this.prepStage = 'idle'; // idle, cleaning, orienting, marking, dopping
        this.progress = 0;
        
        this.stages = {
            cleaning: { name: 'Cleaning', duration: 3000, action: 'Clean dirt and debris' },
            orienting: { name: 'Orienting', duration: 5000, action: 'Find best cut angle' },
            marking: { name: 'Marking', duration: 4000, action: 'Mark facet positions' },
            dopping: { name: 'Dopping', duration: 6000, action: 'Apply wax and mount' }
        };
        
        this.init();
    }
    
    init() {
        this.render();
        window.prepStation = this;
    }
    
    render() {
        if (!this.container) return;
        
        let html = `
            <div class="prep-station-header">
                <span>🔧 Prep Station</span>
            </div>
        `;
        
        if (this.currentStone) {
            const stage = this.stages[this.prepStage];
            html += `
                <div class="prep-stone">
                    <div class="stone-preview" style="background: ${this.currentStone.color}30;">
                        ${this.currentStone.emoji} ${this.currentStone.name}
                    </div>
                    <div class="prep-progress">
                        <div class="prep-stage">${stage ? stage.name : 'Ready'}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${this.progress}%"></div>
                        </div>
                        <div class="prep-action">${stage ? stage.action : 'Click to start prep'}</div>
                    </div>
                </div>
                <div class="prep-controls">
                    ${this.prepStage === 'idle' ? `
                        <button class="prep-btn start" onclick="prepStation.startPrep()">
                            ▶️ Start Prep
                        </button>
                    ` : ''}
                    ${this.prepStage === 'complete' ? `
                        <button class="prep-btn finish" onclick="prepStation.sendToDop()">
                            🕯️ Dop Stone
                        </button>
                    ` : ''}
                </div>
            `;
        } else {
            html += `
                <div class="prep-empty"
                     ondragover="event.preventDefault()"
                     ondrop="prepStation.handleDrop(event)">
                    <div class="drop-zone">
                        <span>🪨</span>
                        <p>Drag rough stone here</p>
                    </div>
                </div>
            `;
        }
        
        this.container.innerHTML = html;
    }
    
    receiveStone(stone) {
        if (this.currentStone) {
            console.log('❌ Prep station busy!');
            return false;
        }
        
        this.currentStone = stone;
        this.prepStage = 'idle';
        this.progress = 0;
        this.render();
        
        // Tutorial trigger
        if (window.merlinTutorial?.isActive) {
            window.merlinTutorial.nextStep();
        }
        
        return true;
    }
    
    handleDrop(event) {
        event.preventDefault();
        const stoneId = event.dataTransfer.getData('stoneId');
        const sourceType = event.dataTransfer.getData('sourceType');
        
        if (sourceType === 'rough' && stoneId && window.roughStonePile) {
            const stone = window.roughStonePile.removeStone(stoneId);
            if (stone) {
                this.receiveStone(stone);
            }
        }
    }
    
    startPrep() {
        if (!this.currentStone || this.prepStage !== 'idle') return;
        
        this.prepStage = 'cleaning';
        this.runPrepStage();
    }
    
    runPrepStage() {
        const stage = this.stages[this.prepStage];
        if (!stage) {
            this.prepStage = 'complete';
            this.render();
            window.addGameActivity?.(`✅ ${this.currentStone.name} prep complete! Ready to dop.`);
            return;
        }
        
        this.progress = 0;
        this.render();
        
        const interval = setInterval(() => {
            this.progress += 5;
            this.render();
            
            if (this.progress >= 100) {
                clearInterval(interval);
                this.advanceStage();
            }
        }, stage.duration / 20);
    }
    
    advanceStage() {
        const stages = Object.keys(this.stages);
        const currentIndex = stages.indexOf(this.prepStage);
        
        if (currentIndex < stages.length - 1) {
            this.prepStage = stages[currentIndex + 1];
            this.runPrepStage();
        } else {
            this.prepStage = 'complete';
            this.progress = 100;
            this.render();
            window.addGameActivity?.(`✅ ${this.currentStone.name} fully prepped and dopped!`);
        }
    }
    
    sendToDop() {
        if (!this.currentStone || this.prepStage !== 'complete') return;
        
        // Add prepped attributes
        this.currentStone.prepped = true;
        this.currentStone.preppedAt = Date.now();
        
        if (window.dopHolder) {
            const success = window.dopHolder.addDoppedStone(this.currentStone);
            if (success) {
                this.currentStone = null;
                this.prepStage = 'idle';
                this.progress = 0;
                this.render();
                
                // Tutorial trigger
                if (window.merlinTutorial?.isActive) {
                    window.merlinTutorial.nextStep();
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-INITIALIZE
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Merlin Tutorial
    window.merlinTutorial = new MerlinTutorial();
    
    console.log('🧙‍♂️ Merlin Tutorial & Workshop Systems loaded');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MerlinTutorial, RoughStonePile, DopStickHolder, PrepStation };
}
