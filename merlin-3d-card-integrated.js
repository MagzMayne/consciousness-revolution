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
 * File: merlin-3d-card-integrated.js
 * Declaration ID: IP-5612B5AD-MLL28ZVH
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Merlin AI 3D Card - Integrated Reference Design
 * Meshes reference design (index.html) structure with GemBot API functions
 */

class MerlinAICardIntegrated {
    constructor() {
        this.card = null;
        this.canvasState = {
            t: 0,
            mouseX: 0,
            mouseY: 0,
            tiltX: 0,
            tiltY: 0,
            bob: 0,
            gem: {
                x: 0.7,
                y: 0.62,
                targetX: 0.7,
                targetY: 0.62,
                drag: false
            },
            img: null
        };
        this.state = {
            isMinimized: false,
            isFlipped: false,
            position: { x: window.innerWidth - 420, y: 100 },
            isDragging: false,
            dragOffset: { x: 0, y: 0 },
            messages: [],
            currentLevel: 1,
            currentXP: 0,
            maxXP: 100,
            userName: 'Guest',
            heartProgress: 0,
            starProgress: 0
        };
        this.currentContext = { topic: '', keywords: [], suggestions: [] };
        this.init();
    }

    init() {
        this.createCard();
        this.attachEventListeners();
        this.initCanvas3D();
        // Don't call updatePosition on init - let CSS handle default positioning
        
        // Auto-connect to existing user profile if available
        if (window.merlin && window.merlin.userProfile) {
            this.updateLevel(
                window.merlin.userProfile.level || 1,
                window.merlin.userProfile.currentXP || 0,
                window.merlin.userProfile.maxXP || 100,
                window.merlin.userProfile.name || 'Guest'
            );
        }
    }

    createCard() {
        this.card = document.createElement('div');
        this.card.id = 'merlin-ai-card-integrated';
        this.card.className = 'merlin-card-container';
        
        // Reference design HTML structure
        this.card.innerHTML = `
            <div class="magical-bg"></div>
            <div class="card-container ${this.state.isFlipped ? 'flipped' : ''}">
                <div class="card-flip-inner">
                    <!-- FRONT SIDE -->
                    <div class="card-front">
                        <div class="glass-blocker"></div>
                        <div class="card-glow"></div>
                        
                        <div class="card-frame">
                            <!-- User Info Header -->
                            <div id="merlin-user-info" style="display:flex;align-items:center;justify-content:space-between;padding:8px 18px 0 18px;">
                                <span id="merlin-user-name" style="font-weight:bold;font-size:1.1em;">${this.state.userName}</span>
                                <span id="merlin-user-level" style="font-size:1.1em;">Lv${this.state.currentLevel}</span>
                            </div>
                            
                            <!-- Level XP Progress Bar -->
                            <div class="level-xp-bar">
                                <div class="level-section">
                                    <span class="level-number" id="merlinLevelNum">Lv${this.state.currentLevel}</span>
                                </div>
                                <div class="xp-section">
                                    <div class="xp-fill" id="merlinXpFill" style="width: 0%"></div>
                                    <div class="xp-text">
                                        <span class="xp-text-full" id="merlinXpFull">${this.state.currentXP} / ${this.state.maxXP} XP</span>
                                        <span class="xp-text-short" id="merlinXpShort">${this.formatXP(this.state.currentXP)}/${this.formatXP(this.state.maxXP)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Card Art with 3D Canvas -->
                            <div class="card-art">
                                <canvas id="merlin3dCanvas"></canvas>
                                <div id="merlinGem" class="merlin-gem-draggable">
                                    <svg class="merlin-gemstone" id="merlinGemstone" viewBox="0 0 100 100" width="60" height="60">
                                        <defs>
                                            <filter id="gemGlow">
                                                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur"/>
                                                    <feMergeNode in="SourceGraphic"/>
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <polygon points="50,10 70,35 60,70 40,70 30,35" 
                                                 fill="var(--gem-color, #a855f7)" 
                                                 stroke="#fff" 
                                                 stroke-width="2" 
                                                 filter="url(#gemGlow)"/>
                                    </svg>
                                </div>
                            </div>
                            
                            <!-- Card Name / Title -->
                            <div class="card-name">
                                <h2>Merlin AI Assistant</h2>
                                <div class="merlin-status">
                                    <span class="status-dot"></span>
                                    <span class="status-text">Ready</span>
                                </div>
                            </div>
                            
                            <!-- Progress Indicators -->
                            <div class="merlin-progress-section">
                                <div class="progress-stat heart">
                                    <div class="progress-icon">❤️</div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill heart-fill" id="merlinHeartFill" style="width: 0%"></div>
                                        <div class="progress-bar-text" id="merlinHeartText">0%</div>
                                    </div>
                                </div>
                                <div class="progress-stat star">
                                    <div class="progress-icon">⭐</div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill star-fill" id="merlinStarFill" style="width: 0%"></div>
                                        <div class="progress-bar-text" id="merlinStarText">0%</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Chat Messages -->
                            <div class="merlin-chat-messages" id="merlinMessages"></div>
                            
                            <!-- Quick Actions Bar -->
                            <div class="merlin-quick-actions" id="merlinQuickActions">
                                <button class="quick-action-btn" data-action="help" title="Help">❓</button>
                                <button class="quick-action-btn" data-action="tutorial" title="Tutorial">📚</button>
                                <button class="quick-action-btn" data-action="tips" title="Tips">💡</button>
                                <button class="quick-action-btn" data-action="achievement" title="Achievements">🏆</button>
                            </div>
                            
                            <!-- Context Tooltips (Dynamic suggestions) -->
                            <div class="merlin-tooltips" id="merlinTooltips"></div>
                            
                            <!-- Chat Input -->
                            <div class="merlin-input-container">
                                <textarea class="merlin-input" id="merlinInput" placeholder="Ask Merlin anything..." rows="2"></textarea>
                                <button class="merlin-voice-btn" id="merlinVoiceBtn" title="Voice Input">🎤</button>
                                <button class="merlin-send-btn" id="merlinSendBtn">Send</button>
                            </div>
                            
                            <!-- Voice Status Indicator -->
                            <div class="voice-status" id="merlinVoiceStatus" style="display:none;">
                                <span class="voice-indicator">🔊</span>
                                <span class="voice-text">Listening...</span>
                            </div>
                            
                            <!-- Speaking Indicator -->
                            <div class="merlin-speaking-indicator" id="merlinSpeakingIndicator" style="display:none;">
                                <div class="speaking-wave"></div>
                                <span>Merlin is speaking...</span>
                            </div>
                            
                            <!-- Card Controls -->
                            <div class="card-controls">
                                <button class="card-btn minimize-btn" id="merlinMinimize" title="Minimize">_</button>
                                <button class="card-btn flip-btn" id="merlinFlip" title="Flip Card">⚙️</button>
                            </div>
                            
                            <!-- Border Decorations -->
                            <div class="border-decoration top"></div>
                            <div class="border-decoration bottom"></div>
                            <div class="border-decoration left"></div>
                            <div class="border-decoration right"></div>
                        </div>
                    </div>
                    
                    <!-- BACK SIDE - Control Panel -->
                    <div class="card-back">
                        <div class="glass-blocker"></div>
                        <div class="card-glow"></div>
                        
                        <div class="card-frame">
                            <div class="card-name">
                                <h2>🎮 GemBot Controls</h2>
                            </div>
                            
                            <!-- Merlin's Advice Banner -->
                            <div class="merlin-advice-banner" id="merlinAdvice">
                                <div class="advice-icon">🧙‍♂️</div>
                                <div class="advice-text" id="adviceText">Select the highlighted action below...</div>
                            </div>
                            
                            <!-- Control Panel Grid -->
                            <div class="control-panel-grid">
                                <!-- Gem Bot Farm Controls -->
                                <div class="control-section">
                                    <h3>🤖 Gem Bot Farm</h3>
                                    <button class="control-btn" data-action="deploy" id="btn-deploy">
                                        <span class="btn-icon">🚀</span>
                                        <span class="btn-label">Deploy Machine</span>
                                    </button>
                                    <button class="control-btn" data-action="monitor" id="btn-monitor">
                                        <span class="btn-icon">📊</span>
                                        <span class="btn-label">Monitor Production</span>
                                    </button>
                                    <button class="control-btn" data-action="upgrade-automation" id="btn-upgrade-automation">
                                        <span class="btn-icon">⚡</span>
                                        <span class="btn-label">Upgrade Automation</span>
                                    </button>
                                </div>
                                
                                <!-- Forge Controls -->
                                <div class="control-section">
                                    <h3>🔨 Forge</h3>
                                    <button class="control-btn" data-action="craft" id="btn-craft">
                                        <span class="btn-icon">⚒️</span>
                                        <span class="btn-label">Craft Item</span>
                                    </button>
                                    <button class="control-btn" data-action="repair" id="btn-repair">
                                        <span class="btn-icon">🔧</span>
                                        <span class="btn-label">Repair</span>
                                    </button>
                                    <button class="control-btn" data-action="enhance" id="btn-enhance">
                                        <span class="btn-icon">✨</span>
                                        <span class="btn-label">Enhance</span>
                                    </button>
                                </div>
                                
                                <!-- Machine Controls -->
                                <div class="control-section">
                                    <h3>🤖 Machine</h3>
                                    <button class="control-btn" data-action="scan" id="btn-scan">
                                        <span class="btn-icon">🔍</span>
                                        <span class="btn-label">Scan Area</span>
                                    </button>
                                    <button class="control-btn" data-action="connect" id="btn-connect">
                                        <span class="btn-icon">🔗</span>
                                        <span class="btn-label">Connect</span>
                                    </button>
                                    <button class="control-btn" data-action="analyze" id="btn-analyze">
                                        <span class="btn-icon">📊</span>
                                        <span class="btn-label">Analyze</span>
                                    </button>
                                </div>
                                
                                <!-- Trading Controls -->
                                <div class="control-section">
                                    <h3>🏪 Trading</h3>
                                    <button class="control-btn" data-action="marketplace" id="btn-marketplace">
                                        <span class="btn-icon">🛒</span>
                                        <span class="btn-label">Marketplace</span>
                                    </button>
                                    <button class="control-btn" data-action="trade" id="btn-trade">
                                        <span class="btn-icon">💰</span>
                                        <span class="btn-label">Trade Gems</span>
                                    </button>
                                    <button class="control-btn" data-action="inventory" id="btn-inventory">
                                        <span class="btn-icon">🎒</span>
                                        <span class="btn-label">Inventory</span>
                                    </button>
                                </div>
                                
                                <!-- Academy Controls -->
                                <div class="control-section">
                                    <h3>📚 Academy</h3>
                                    <button class="control-btn" data-action="learn" id="btn-learn">
                                        <span class="btn-icon">📖</span>
                                        <span class="btn-label">Learn Skill</span>
                                    </button>
                                    <button class="control-btn" data-action="tutorial" id="btn-tutorial">
                                        <span class="btn-icon">🎓</span>
                                        <span class="btn-label">Tutorial</span>
                                    </button>
                                    <button class="control-btn" data-action="guide" id="btn-guide">
                                        <span class="btn-icon">📜</span>
                                        <span class="btn-label">Guide</span>
                                    </button>
                                </div>
                                
                                <!-- System Controls -->
                                <div class="control-section">
                                    <h3>⚙️ System</h3>
                                    <button class="control-btn" data-action="settings" id="btn-settings">
                                        <span class="btn-icon">⚙️</span>
                                        <span class="btn-label">Settings</span>
                                    </button>
                                    <button class="control-btn" data-action="help" id="btn-help">
                                        <span class="btn-icon">❓</span>
                                        <span class="btn-label">Help</span>
                                    </button>
                                    <button class="control-btn" data-action="exit" id="btn-exit">
                                        <span class="btn-icon">🚪</span>
                                        <span class="btn-label">Exit</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button class="card-btn back-btn" id="merlinFlipBack">← Back to Chat</button>
                            
                            <div class="border-decoration top"></div>
                            <div class="border-decoration bottom"></div>
                            <div class="border-decoration left"></div>
                            <div class="border-decoration right"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.card);
    }

    attachEventListeners() {
        // Dragging
        const header = this.card.querySelector('.card-name');
        if (header) {
            header.style.cursor = 'move';
            header.addEventListener('mousedown', (e) => this.startDrag(e));
        }

        // Minimize button
        const minimizeBtn = this.card.querySelector('#merlinMinimize');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.minimize());
        }

        // Flip buttons
        const flipBtn = this.card.querySelector('#merlinFlip');
        const flipBackBtn = this.card.querySelector('#merlinFlipBack');
        if (flipBtn) flipBtn.addEventListener('click', () => this.flip());
        if (flipBackBtn) flipBackBtn.addEventListener('click', () => this.flip());

        // Send message
        const sendBtn = this.card.querySelector('#merlinSendBtn');
        const input = this.card.querySelector('#merlinInput');
        if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Voice input button
        const voiceBtn = this.card.querySelector('#merlinVoiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        }
        
        // Quick action buttons
        const quickActionBtns = this.card.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                this.quickAction(action);
            });
        });
        
        // Initialize voice systems
        this.initVoiceSystems();
        
        // Add welcome message
        this.addWelcomeMessage();

        // Settings
        const gemColorPicker = this.card.querySelector('#gemColorPicker');
        if (gemColorPicker) {
            gemColorPicker.addEventListener('change', (e) => this.updateGemstoneColor(e.target.value));
        }

        // Control panel buttons
        const controlBtns = this.card.querySelectorAll('.control-btn');
        controlBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                this.handleControlAction(action);
            });
        });

        // Gem dragging
        this.setupGemDragging();
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // VOICE INPUT/OUTPUT SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════
    
    initVoiceSystems() {
        // Initialize Speech Recognition (Voice Input)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                const voiceBtn = this.card.querySelector('#merlinVoiceBtn');
                const voiceStatus = this.card.querySelector('#merlinVoiceStatus');
                if (voiceBtn) {
                    voiceBtn.classList.add('listening');
                    voiceBtn.style.background = '#ff6b6b';
                }
                if (voiceStatus) voiceStatus.style.display = 'flex';
                console.log('🎤 Merlin listening...');
            };
            
            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                
                const input = this.card.querySelector('#merlinInput');
                if (input) {
                    input.value = transcript;
                    input.style.opacity = event.results[event.results.length - 1].isFinal ? '1' : '0.6';
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                const voiceBtn = this.card.querySelector('#merlinVoiceBtn');
                const voiceStatus = this.card.querySelector('#merlinVoiceStatus');
                if (voiceBtn) {
                    voiceBtn.classList.remove('listening');
                    voiceBtn.style.background = '';
                }
                if (voiceStatus) voiceStatus.style.display = 'none';
                
                // Auto-send if we have text
                const input = this.card.querySelector('#merlinInput');
                if (input && input.value.trim()) {
                    setTimeout(() => this.sendMessage(), 300);
                }
            };
            
            this.recognition.onerror = (e) => {
                console.error('🎤 Voice error:', e.error);
                this.isListening = false;
                const voiceBtn = this.card.querySelector('#merlinVoiceBtn');
                if (voiceBtn) {
                    voiceBtn.classList.remove('listening');
                    voiceBtn.style.background = '';
                }
            };
            
            console.log('✅ Merlin Voice Input initialized');
        } else {
            console.warn('⚠️ Speech Recognition not supported');
        }
        
        // Initialize Speech Synthesis (Voice Output)
        this.voiceEnabled = true;
        this.selectedVoice = null;
        this.loadVoices();
        
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    }
    
    loadVoices() {
        if (!window.speechSynthesis) return;
        
        const voices = window.speechSynthesis.getVoices();
        
        // PRIORITY ORDER: Prefer deep male voices for wise wizard effect
        // 1. First try to find specifically male/deep voices
        this.selectedVoice = voices.find(v => 
            v.name.toLowerCase().includes('david') ||  // Microsoft David - male
            v.name.toLowerCase().includes('daniel') || // Daniel - UK male
            v.name.toLowerCase().includes('mark') ||   // Male voice
            v.name.toLowerCase().includes('james') ||  // Male voice
            v.name.toLowerCase().includes('alex') ||   // Male voice (macOS)
            v.name.toLowerCase().includes('tom') ||    // Male voice
            v.name.toLowerCase().includes('richard')   // Male voice
        );
        
        // 2. If no specific male voice, try UK/British male
        if (!this.selectedVoice) {
            this.selectedVoice = voices.find(v => 
                (v.lang === 'en-GB' || v.lang === 'en-US') && 
                !v.name.toLowerCase().includes('female') &&
                !v.name.toLowerCase().includes('zira') &&   // Skip Zira (female)
                !v.name.toLowerCase().includes('cortana') && // Skip Cortana (female)
                !v.name.toLowerCase().includes('susan') &&  // Skip Susan (female)
                !v.name.toLowerCase().includes('hazel') &&  // Skip Hazel (female)
                !v.name.toLowerCase().includes('linda') &&  // Skip Linda (female)
                !v.name.toLowerCase().includes('samantha')  // Skip Samantha (female)
            );
        }
        
        // 3. Final fallback to any English voice
        if (!this.selectedVoice) {
            this.selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
        
        if (this.selectedVoice) {
            console.log('🧙 Merlin wizard voice:', this.selectedVoice.name);
        }
    }
    
    toggleVoiceInput() {
        if (!this.recognition) {
            this.addMessage('🎤 Voice input not supported in this browser. Try Chrome or Edge!', 'system');
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (e) {
                console.error('Voice start error:', e);
            }
        }
    }
    
    speak(text) {
        if (!this.voiceEnabled || !window.speechSynthesis) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Clean text for speech
        const cleanText = text
            .replace(/[*_~`#]/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/[^\w\s!?.,\-']/g, '')
            .trim();
        
        if (!cleanText) return;
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = this.selectedVoice;
        utterance.rate = 0.9;  // Slightly slower for wise wizard pacing
        utterance.pitch = 0.7; // Deeper pitch for old wizard effect
        utterance.volume = 0.9;
        
        utterance.onstart = () => {
            this.animateWizard({ intensity: 2, color: '#9333ea' });
            const avatar = this.card.querySelector('.merlin-avatar');
            if (avatar) avatar.classList.add('speaking');
        };
        
        utterance.onend = () => {
            const avatar = this.card.querySelector('.merlin-avatar');
            if (avatar) avatar.classList.remove('speaking');
        };
        
        window.speechSynthesis.speak(utterance);
        console.log('🔊 Merlin speaks:', cleanText.substring(0, 50) + '...');
    }
    
    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        this.addMessage(this.voiceEnabled ? '🔊 Voice output enabled' : '🔇 Voice output disabled', 'system');
    }

    initCanvas3D() {
        const canvas = this.card.querySelector('#merlin3dCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Find wizard image from reference
        const wizardImageBase64 = this.getWizardImage();
        
        const img = new Image();
        img.onload = () => {
            this.canvasState.img = img;
            this.fitCanvas(canvas, ctx);
            this.startCanvasLoop(canvas, ctx);
        };
        img.crossOrigin = 'anonymous';
        img.src = wizardImageBase64 || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzJhMmE0MCIvPjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LXNpemU9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+nmeKAjeKZgjwvdGV4dD48L3N2Zz4=';

        // Mouse tilt tracking
        const cardContainer = this.card.querySelector('.card-container');
        if (cardContainer) {
            cardContainer.addEventListener('mousemove', (e) => {
                const r = cardContainer.getBoundingClientRect();
                this.canvasState.mouseX = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
                this.canvasState.mouseY = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
            });
            cardContainer.addEventListener('mouseleave', () => {
                this.canvasState.mouseX = 0;
                this.canvasState.mouseY = 0;
            });
        }
    }

    getWizardImage() {
        // Use the actual Merlin wizard image
        return './merlin-wizard.png'; // Will use provided image
    }

    fitCanvas(canvas, ctx) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        if (ctx) ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    startCanvasLoop(canvas, ctx) {
        const loop = (now) => {
            this.canvasState.t = (now || performance.now()) / 1000;
            this.updatePhysics();
            this.renderCanvas(canvas, ctx);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    updatePhysics() {
        // Bobbing motion
        const bob = Math.sin(this.canvasState.t * 1.2) * 6;
        this.canvasState.bob = bob;

        // Tilt smoothing
        this.canvasState.tiltX += (this.canvasState.mouseY * 12 - this.canvasState.tiltX) * 0.08;
        this.canvasState.tiltY += (this.canvasState.mouseX * -12 - this.canvasState.tiltY) * 0.08;

        // Gem position smoothing
        this.canvasState.gem.x += (this.canvasState.gem.targetX - this.canvasState.gem.x) * 0.12;
        this.canvasState.gem.y += (this.canvasState.gem.targetY - this.canvasState.gem.y) * 0.12;
    }

    renderCanvas(canvas, ctx) {
        if (!ctx || !this.canvasState.img) return;

        const w = canvas.width / devicePixelRatio;
        const h = canvas.height / devicePixelRatio;

        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2 + this.canvasState.bob;

        // Magical glow background
        const grd = ctx.createRadialGradient(cx, cy - 30, 10, cx, cy, Math.max(w, h));
        grd.addColorStop(0, 'rgba(120,80,200,0.12)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);

        // Draw wizard portrait with tilt (contain within canvas)
        const scale = 1.0 + Math.abs(this.canvasState.tiltX + this.canvasState.tiltY) * 0.002;
        
        // Calculate aspect ratio and fit within canvas
        const imgAspect = this.canvasState.img.width / this.canvasState.img.height;
        const canvasAspect = w / h;
        
        let drawW, drawH;
        if (imgAspect > canvasAspect) {
            // Image is wider - fit to width
            drawW = w * 0.85 * scale;
            drawH = drawW / imgAspect;
        } else {
            // Image is taller - fit to height
            drawH = h * 0.85 * scale;
            drawW = drawH * imgAspect;
        }
        
        const offsetX = this.canvasState.tiltY * 4;
        const offsetY = this.canvasState.tiltX * 4 + this.canvasState.bob;

        ctx.save();
        ctx.translate(cx + offsetX, cy + offsetY);
        ctx.rotate(this.canvasState.tiltY * 0.015);
        ctx.drawImage(this.canvasState.img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Magical aura
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(180,140,255,0.06)';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20, drawW * 0.55, drawH * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Update gem position
        const gemEl = this.card.querySelector('#merlinGem');
        if (gemEl) {
            const gx = this.canvasState.gem.x * w;
            const gy = this.canvasState.gem.y * h;
            gemEl.style.left = gx + 'px';
            gemEl.style.top = gy + 'px';
        }
    }

    setupGemDragging() {
        const gemEl = this.card.querySelector('#merlinGem');
        const canvas = this.card.querySelector('#merlin3dCanvas');
        if (!gemEl || !canvas) return;

        let dragging = false;

        gemEl.addEventListener('mousedown', (e) => {
            e.preventDefault();
            dragging = true;
            gemEl.style.cursor = 'grabbing';
            this.canvasState.gem.drag = true;
        });

        window.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const r = canvas.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width;
            const ny = (e.clientY - r.top) / r.height;
            this.canvasState.gem.targetX = Math.max(0.08, Math.min(0.92, nx));
            this.canvasState.gem.targetY = Math.max(0.08, Math.min(0.92, ny));
        });

        window.addEventListener('mouseup', () => {
            if (dragging) {
                dragging = false;
                gemEl.style.cursor = 'grab';
                this.canvasState.gem.drag = false;
            }
        });
    }

    // ============= PUBLIC API METHODS =============

    /**
     * Update user level and XP progress
     */
    updateLevel(level, currentXP, maxXP, username) {
        this.state.currentLevel = level || 1;
        this.state.currentXP = currentXP || 0;
        this.state.maxXP = maxXP || 100;
        if (username) this.state.userName = username;

        // Update UI
        const userNameEl = this.card.querySelector('#merlin-user-name');
        const userLevelEl = this.card.querySelector('#merlin-user-level');
        const levelNumEl = this.card.querySelector('#merlinLevelNum');
        const xpFillEl = this.card.querySelector('#merlinXpFill');
        const xpFullEl = this.card.querySelector('#merlinXpFull');
        const xpShortEl = this.card.querySelector('#merlinXpShort');

        if (userNameEl) userNameEl.textContent = this.state.userName;
        if (userLevelEl) userLevelEl.textContent = `Lv${level}`;
        if (levelNumEl) levelNumEl.textContent = `Lv${level}`;

        const xpPercent = (currentXP / maxXP) * 100;
        if (xpFillEl) {
            xpFillEl.style.width = `${xpPercent}%`;
            xpFillEl.style.animation = 'xp-flash 0.8s ease-out';
            setTimeout(() => xpFillEl.style.animation = '', 800);
        }

        if (xpFullEl) xpFullEl.textContent = `${currentXP} / ${maxXP} XP`;
        if (xpShortEl) xpShortEl.textContent = `${this.formatXP(currentXP)}/${this.formatXP(maxXP)}`;

        console.log(`[Merlin] Level updated: Lv${level}, XP: ${currentXP}/${maxXP}`);
    }

    /**
     * Update heart (in-game) and star (academy) progress
     */
    updateProgress(heartProgress, starProgress) {
        this.state.heartProgress = Math.max(0, Math.min(100, heartProgress || 0));
        this.state.starProgress = Math.max(0, Math.min(100, starProgress || 0));

        const heartFillEl = this.card.querySelector('#merlinHeartFill');
        const heartTextEl = this.card.querySelector('#merlinHeartText');
        const starFillEl = this.card.querySelector('#merlinStarFill');
        const starTextEl = this.card.querySelector('#merlinStarText');

        if (heartFillEl) heartFillEl.style.width = `${this.state.heartProgress}%`;
        if (heartTextEl) heartTextEl.textContent = `${Math.round(this.state.heartProgress)}%`;
        if (starFillEl) starFillEl.style.width = `${this.state.starProgress}%`;
        if (starTextEl) starTextEl.textContent = `${Math.round(this.state.starProgress)}%`;

        // Glow effect for >75%
        if (this.state.heartProgress > 75) heartFillEl?.classList.add('glowing');
        else heartFillEl?.classList.remove('glowing');

        if (this.state.starProgress > 75) starFillEl?.classList.add('glowing');
        else starFillEl?.classList.remove('glowing');

        console.log(`[Merlin] Progress updated: ❤️${this.state.heartProgress}% ⭐${this.state.starProgress}%`);
    }

    /**
     * Update gemstone color based on context
     */
    updateGemstoneColor(context) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            thinking: '#3b82f6',
            question: '#f59e0b',
            magic: '#a855f7'
        };

        const color = colors[context] || context || '#a855f7';
        
        const gemstone = this.card.querySelector('#merlinGemstone polygon');
        if (gemstone) {
            gemstone.setAttribute('fill', color);
            gemstone.style.animation = 'gem-pulse 0.8s ease-out';
            setTimeout(() => gemstone.style.animation = '', 800);
        }

        this.card.style.setProperty('--gem-color', color);
        console.log(`[Merlin] Gemstone color: ${context || color}`);
    }

    /**
     * Animate wizard with optional pointing
     */
    animateWizard(options = {}) {
        const { pointTo, intensity = 2, color } = options;

        if (pointTo) {
            this.canvasState.gem.targetX = pointTo.x || 0.5;
            this.canvasState.gem.targetY = pointTo.y || 0.6;
        }

        // Pulse gemstone
        const gemEl = this.card.querySelector('#merlinGem');
        if (gemEl) {
            try {
                gemEl.animate([
                    { transform: 'translate(-50%,-50%) scale(1)' },
                    { transform: 'translate(-50%,-50%) scale(1.22)' },
                    { transform: 'translate(-50%,-50%) scale(1)' }
                ], {
                    duration: 900,
                    easing: 'cubic-bezier(.2,.8,.2,1)'
                });
            } catch (e) { }
        }

        // Create magic particles
        this.createMagicParticles(intensity * 6, color);

        console.log(`[Merlin] Wizard animated with intensity ${intensity}`);
    }

    /**
     * Create magic particle effects
     */
    createMagicParticles(count = 12, color = null) {
        const canvas = this.card.querySelector('#merlin3dCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width / devicePixelRatio;
        const h = canvas.height / devicePixelRatio;

        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const r = 8 + Math.random() * 36;
            const px = (this.canvasState.gem.targetX * w) + Math.cos(ang) * r;
            const py = (this.canvasState.gem.targetY * h) + Math.sin(ang) * r;

            if (color) {
                ctx.fillStyle = this.hexToRGBA(color, 0.9 + Math.random() * 0.1);
            } else {
                ctx.fillStyle = `rgba(255,${120 + Math.floor(Math.random() * 120)},${200 + Math.floor(Math.random() * 55)},0.9)`;
            }

            ctx.beginPath();
            ctx.arc(px, py, 1 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        console.log(`[Merlin] Created ${count} magic particles`);
    }

    // ============= HELPER METHODS =============

    formatXP(xp) {
        if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
        return xp.toString();
    }

    hexToRGBA(hex, alpha = 1) {
        if (!hex) return `rgba(255,255,255,${alpha})`;
        try {
            if (hex.startsWith('#')) {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r},${g},${b},${alpha})`;
            }
            if (hex.startsWith('rgb')) {
                return hex.replace('rgb', 'rgba').replace(')', `,${alpha})`);
            }
        } catch (e) { }
        return `rgba(255,200,255,${alpha})`;
    }

    startDrag(e) {
        this.state.isDragging = true;
        this.state.position.wasDragged = true; // Mark as user-positioned
        const rect = this.card.getBoundingClientRect();
        this.state.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        const mouseMoveHandler = (e) => {
            if (!this.state.isDragging) return;
            this.state.position.x = e.clientX - this.state.dragOffset.x;
            this.state.position.y = e.clientY - this.state.dragOffset.y;
            this.updatePosition();
        };

        const mouseUpHandler = () => {
            this.state.isDragging = false;
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
        };

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
    }

    updatePosition() {
        // Only update position if dragging (don't override CSS defaults)
        if (this.state.isDragging || this.state.position.wasDragged) {
            this.card.style.position = 'fixed';
            this.card.style.left = `${this.state.position.x}px`;
            this.card.style.top = `${this.state.position.y}px`;
        }
        // Z-index managed by CSS (500 for proper layering)
    }

    minimize() {
        this.state.isMinimized = !this.state.isMinimized;
        if (this.state.isMinimized) {
            this.card.style.transform = 'scale(0.3)';
            this.card.style.opacity = '0.7';
        } else {
            this.card.style.transform = 'scale(1)';
            this.card.style.opacity = '1';
        }
    }

    flip() {
        this.state.isFlipped = !this.state.isFlipped;
        const container = this.card.querySelector('.card-container');
        if (container) {
            if (this.state.isFlipped) {
                container.classList.add('flipped');
            } else {
                container.classList.remove('flipped');
            }
        }
    }

    sendMessage() {
        const input = this.card.querySelector('#merlinInput');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        this.addMessage('user', message);
        input.value = '';

        // Log to activity feed
        if (window.liveActivityFeed) {
            window.liveActivityFeed.log('USER', `Chat: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
        }

        // Analyze message and guide to control if relevant
        const wasGuided = this.analyzeAndGuide(message);

        if (!wasGuided) {
            // Show typing indicator
            this.addMessage('merlin', '✨ Thinking...');
            
            // Connect to Merlin AI system (window.merlinAI.generate)
            if (window.merlinAI && window.merlinAI.isInitialized && typeof window.merlinAI.generate === 'function') {
                // Use Merlin AI Gemini integration
                const prompt = `You are Merlin, a wise and friendly AI wizard assistant for GemBot - a gemstone faceting automation system. 
                You help users with:
                - Gemstone faceting and cutting techniques
                - GemBot machine controls and calibration
                - The GemBot game, marketplace, and GBUV token economy
                - General questions about gems, minerals, and lapidary
                
                Be helpful, magical, and concise. Add occasional wizard flair (✨🔮⚗️).
                
                User question: ${message}`;
                
                window.merlinAI.generate(prompt, { temperature: 0.8, maxTokens: 500 })
                    .then(result => {
                        // Remove typing indicator
                        this.removeLastMessage();
                        
                        if (result.text) {
                            this.addMessage('merlin', result.text);
                            this.animateWizard({ intensity: 2, color: '#3b82f6' });
                            // Speak the response
                            this.speak(result.text);
                        } else if (result.error) {
                            this.addMessage('merlin', `🔮 My crystal ball is cloudy... ${result.error}`);
                        }
                        
                        if (window.liveActivityFeed) {
                            window.liveActivityFeed.log('MERLIN', `Response sent`);
                        }
                    })
                    .catch(err => {
                        console.error('Merlin AI error:', err);
                        this.removeLastMessage();
                        this.addMessage('merlin', '🔮 My magic is temporarily disrupted. Let me try a simpler response...');
                        setTimeout(() => {
                            const fallbackResponse = this.generateIntelligentResponse(message);
                            this.addMessage('merlin', fallbackResponse);
                            this.speak(fallbackResponse);
                        }, 500);
                    });
            } else if (window.merlin && typeof window.merlin.respond === 'function') {
                // Alternative Merlin connection (legacy)
                this.removeLastMessage();
                const response = window.merlin.respond(message);
                setTimeout(() => {
                    this.addMessage('merlin', response);
                    this.animateWizard({ intensity: 2, color: '#3b82f6' });
                    this.speak(response);
                }, 500);
            } else {
                // Fallback intelligent response
                console.warn('⚠️ Merlin AI not available, using fallback responses');
                this.removeLastMessage();
                setTimeout(() => {
                    const response = this.generateIntelligentResponse(message);
                    this.addMessage('merlin', response);
                    this.animateWizard({ intensity: 2, color: '#3b82f6' });
                    this.speak(response);
                }, 500);
            }
        }
    }
    
    removeLastMessage() {
        const messagesContainer = this.card.querySelector('#merlinMessages');
        if (messagesContainer && messagesContainer.lastChild) {
            messagesContainer.removeChild(messagesContainer.lastChild);
        }
    }
    
    // Response history to ensure no duplicates
    responseHistory = {
        greetings: [],
        tips: [],
        help: [],
        gems: [],
        faceting: [],
        trading: [],
        game: [],
        general: [],
        maxHistory: 100
    };

    /**
     * Get a unique response that hasn't been used recently
     */
    getUniqueResponse(category, options) {
        if (!options || options.length === 0) return null;
        
        const history = this.responseHistory[category] || [];
        const available = options.filter(opt => !history.includes(opt));
        
        // If all options used, clear history and start fresh
        if (available.length === 0) {
            this.responseHistory[category] = [];
            // Return random from full list
            return options[Math.floor(Math.random() * options.length)];
        }
        
        const chosen = available[Math.floor(Math.random() * available.length)];
        
        // Add to history
        if (!this.responseHistory[category]) {
            this.responseHistory[category] = [];
        }
        this.responseHistory[category].push(chosen);
        
        // Trim history if too long
        if (this.responseHistory[category].length > this.responseHistory.maxHistory) {
            this.responseHistory[category].shift();
        }
        
        // Persist history to localStorage
        this.saveResponseHistory();
        
        return chosen;
    }
    
    saveResponseHistory() {
        try {
            localStorage.setItem('merlin_response_history', JSON.stringify(this.responseHistory));
        } catch (e) {
            console.warn('Could not save response history:', e);
        }
    }
    
    loadResponseHistory() {
        try {
            const saved = localStorage.getItem('merlin_response_history');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.responseHistory = { ...this.responseHistory, ...parsed };
            }
        } catch (e) {
            console.warn('Could not load response history:', e);
        }
    }

    generateIntelligentResponse(message) {
        // Load response history on first call
        if (!this._historyLoaded) {
            this.loadResponseHistory();
            this._historyLoaded = true;
        }
        
        const lowerMsg = message.toLowerCase();
        
        // Use MerlinEnhancedResponses if available for maximum variety
        if (window.MerlinEnhancedResponses) {
            try {
                // Determine context
                const isMarketplace = /market|buy|sell|trade|price|shop/.test(lowerMsg);
                const isGemstone = /gem|stone|diamond|ruby|sapphire|emerald|crystal|cut|facet|polish/.test(lowerMsg);
                const isHelp = /help|how|what|where|when|why|can you|explain|guide/.test(lowerMsg);
                const isGame = /game|play|level|xp|score|quest|achievement/.test(lowerMsg);
                
                if (isMarketplace) {
                    const response = window.MerlinEnhancedResponses.answerMarketplaceQuestion(message);
                    if (response && response !== message) return response;
                }
                
                if (isGemstone) {
                    const response = window.MerlinEnhancedResponses.answerGemstoneQuestion(message);
                    if (response && response !== message) return response;
                }
                
                if (isHelp) {
                    const response = window.MerlinEnhancedResponses.generateTip({
                        skillLevel: 'intermediate',
                        currentActivity: 'general'
                    });
                    if (response) return response;
                }
                
                if (isGame) {
                    const response = window.MerlinEnhancedResponses.generateGameIntegration({
                        action: 'playing'
                    });
                    if (response) return response;
                }
            } catch (e) {
                console.warn('MerlinEnhancedResponses error:', e);
            }
        }
        
        // Fallback knowledge base with unique response system
        const responses = {
            help: [
                '✨ I can help you navigate GemBot! Ask me about: faceting, gems, marketplace, controls, or game features.',
                '🧙‍♂️ Need guidance? I specialize in gemstone knowledge, machine operations, trading advice, and game strategies!',
                '🔮 The path to mastery lies before you. Ask about: cutting techniques, gem types, trading tips, or game mechanics.',
                '📚 My knowledge spans many realms! Gemstones, faceting, marketplace trading, crafting, and all GemBot features.',
                '✨ How may I assist your journey? I can explain gems, cutting, trading, crafting, or guide you through any feature.',
                '🌟 Every master was once a beginner. Ask freely about gems, techniques, the marketplace, or game mechanics!',
                '🧠 My centuries of wisdom are at your disposal. What would you like to know about GemBot?',
                '💫 The crystals whisper your question. I can help with gems, faceting, trading, or any adventure ahead!'
            ],
            gems: [
                '💎 Gems are precious treasures! I can help you facet, analyze, or trade gemstones. What interests you?',
                '🔮 Each gemstone holds unique properties. Ask about specific gems, cutting angles, or value assessment!',
                '✨ The world of gems is vast! From diamonds to emeralds, each has secrets to unlock. What would you explore?',
                '💠 Gemstones are my specialty! Would you like to learn about types, cutting techniques, or market values?',
                '🌟 Ah, precious stones! I can teach you about hardness, clarity, color grades, or optimal cutting angles.',
                '💎 Every gem tells a story. Ask about specific stones, their properties, or how to maximize their beauty!',
                '🔷 From rough to brilliant! I can guide you through gem identification, grading, or cutting strategies.',
                '✨ The gem realm is full of wonders. What aspect of gemology shall we explore together?'
            ],
            faceting: [
                '✂️ Faceting requires precision! Flip this card to access machine controls and start your gemstone masterpiece.',
                '🔧 Ready to cut? The faceting machine awaits! Crown angles, pavilion depth, and polish await your mastery.',
                '💫 Each facet is a window to light! Let me guide you through angles, index settings, and cutting sequences.',
                '⚙️ Precision cutting is an art! Ask about specific facet patterns, angles, or use the machine controls behind this card.',
                '✨ The difference between good and great lies in the details. What faceting technique interests you?',
                '🎯 A master cutter knows angles like a friend. Shall I explain crown cuts, pavilion facets, or polish techniques?',
                '💎 From table to culet! I can guide you through standard brilliant, step cuts, or fantasy designs.',
                '🔮 Light is the ultimate judge of your work. Let me share secrets of optimal angle selection!'
            ],
            trading: [
                '🛒 The marketplace is bustling with activity! You can buy, sell, and trade gems and equipment. Check the marketplace button!',
                '💰 Trading wisdom: Buy rough low, sell cut high! The marketplace holds many opportunities for the shrewd.',
                '📈 Market trends favor the prepared! I can help you understand gem values, rarity ratings, and optimal selling times.',
                '🏪 The gem marketplace connects collectors worldwide! Browse rare finds or list your finest cuts for sale.',
                '💎 Every trade is an opportunity! Learn to spot undervalued gems and time your sales for maximum profit.',
                '🤝 Fair trading builds reputation! The marketplace rewards honest dealers with better opportunities.',
                '📊 Market analysis is key! I can help you track gem values, predict trends, and find the best deals.',
                '✨ From raw finds to polished treasures - the marketplace is where value meets appreciation!'
            ],
            game: [
                '🎮 Welcome to GemBot Farm! You can build machines, collect gems, trade, and level up. Need specific help?',
                '⭐ Adventure awaits! Complete quests, earn XP, unlock achievements, and become a legendary gem crafter!',
                '🏆 Your journey is just beginning! Build your gem empire through mining, cutting, crafting, and trading.',
                '🎯 Daily challenges, weekly quests, and special events await! Check the Academy for tasks and rewards.',
                '💪 Level up by completing lessons, cutting gems, and trading successfully. Each action brings mastery!',
                '🌟 The game rewards dedication! Streaks, achievements, and milestones all contribute to your legend.',
                '🚀 From novice to master! Unlock new machines, rare gem types, and special abilities as you progress.',
                '✨ Every gem cut, every trade made, every lesson learned brings you closer to greatness!'
            ],
            general: [
                '🧙‍♂️ Interesting question! I am Merlin, your guide in the GemBot realm. How may I enlighten your path?',
                '🔮 The crystals reflect your curiosity! Ask me about gems, faceting, trading, or the game itself.',
                '✨ Your question intrigues me! I have knowledge of many subjects. What would you like to explore?',
                '💫 Ah, a seeker of knowledge! My expertise covers gemology, crafting, trading, and all things GemBot.',
                '🌟 The wisdom of ages is at your fingertips! Ask about any aspect of the GemBot universe.',
                '📚 Every question leads to discovery! Tell me more about what you seek to understand.',
                '🎭 Curiosity is the spark of mastery! I am here to guide you through any challenge.',
                '⚡ Your words reach my ears! I can assist with gems, machines, markets, or game strategies.'
            ]
        };
        
        // Determine category and get unique response
        let category = 'general';
        
        if (lowerMsg.includes('help') || lowerMsg.includes('?') || lowerMsg.includes('how')) {
            category = 'help';
        } else if (lowerMsg.includes('gem') || lowerMsg.includes('stone') || lowerMsg.includes('crystal')) {
            category = 'gems';
        } else if (lowerMsg.includes('facet') || lowerMsg.includes('cut') || lowerMsg.includes('angle') || lowerMsg.includes('polish')) {
            category = 'faceting';
        } else if (lowerMsg.includes('trade') || lowerMsg.includes('market') || lowerMsg.includes('buy') || lowerMsg.includes('sell')) {
            category = 'trading';
        } else if (lowerMsg.includes('game') || lowerMsg.includes('play') || lowerMsg.includes('level') || lowerMsg.includes('xp')) {
            category = 'game';
        }
        
        return this.getUniqueResponse(category, responses[category]) || 
               `🔮 ${message} - An intriguing thought! Ask me about gems, faceting, trading, or game features for more wisdom.`;
    }

    addMessage(sender, text) {
        const messagesContainer = this.card.querySelector('#merlinMessages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}-message`;
        messageEl.textContent = text;
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Trigger speaking animation for merlin messages
        if (sender === 'merlin') {
            this.triggerSpeakingAnimation();
        }
    }
    
    addWelcomeMessage() {
        setTimeout(() => {
            this.addMessage('merlin', '🧙‍♂️ Greetings, adventurer! I am Merlin, your guide in the GemBot realm. Ask me anything about gems, faceting, trading, or the game!');
        }, 500);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // QUICK ACTIONS & CONTEXT TOOLTIPS
    // ═══════════════════════════════════════════════════════════════════════════
    
    quickAction(type) {
        switch(type) {
            case 'help':
                this.addMessage('merlin', '✨ How can I help you today? Ask me about:\n• 🔮 Connecting your machine\n• 💎 Gem cutting techniques\n• 🛒 Marketplace trading\n• 🎮 Game tips and tutorials');
                this.updateContext('help', ['guide', 'tips'], [
                    { icon: '🔌', text: 'Connect Machine', action: 'connect' },
                    { icon: '🎮', text: 'Game Mode', action: 'game' },
                    { icon: '🛒', text: 'Marketplace', action: 'marketplace' }
                ]);
                break;
            case 'tutorial':
                this.addMessage('merlin', '📚 Welcome to the GemBot Academy! What would you like to learn?\n• 🔌 Machine Setup\n• 💎 Gem Cutting 101\n• 🎮 Game Mechanics');
                this.updateContext('tutorial', ['learning', 'guide'], [
                    { icon: '🔌', text: 'Setup Guide', action: 'connect' },
                    { icon: '💎', text: 'Cutting Tutorial', action: 'craft' },
                    { icon: '🎮', text: 'Game Tutorial', action: 'learn' }
                ]);
                break;
            case 'tips':
                const tips = [
                    '💡 Use CTRL+drag to move panels around. Double-click to reset!',
                    '💡 Higher quality gems sell for more in the marketplace!',
                    '💡 Complete daily quests to earn bonus GBUV tokens!',
                    '💡 Upgrade your automation to increase gem production!',
                    '💡 Check the Neural Dashboard to see project value!'
                ];
                this.addMessage('system', tips[Math.floor(Math.random() * tips.length)]);
                break;
            case 'achievement':
                this.addMessage('merlin', '🏆 Achievement System:\n• Level up by completing tasks\n• Earn badges for milestones\n• Unlock special gems and equipment\n• Compete on the leaderboard!');
                if (typeof leaderboardUI !== 'undefined') {
                    setTimeout(() => leaderboardUI.open(), 500);
                }
                break;
        }
    }
    
    updateContext(topic, keywords = [], suggestions = []) {
        this.currentContext = { topic, keywords, suggestions };
        this.renderTooltips();
    }
    
    renderTooltips() {
        const tooltipsDiv = this.card.querySelector('#merlinTooltips');
        if (!tooltipsDiv || !this.currentContext.suggestions.length) return;
        
        let html = '';
        this.currentContext.suggestions.forEach((suggestion, idx) => {
            html += `
                <button class="merlin-tooltip-btn" 
                        style="animation-delay: ${idx * 0.1}s"
                        data-tooltip-action="${suggestion.action}">
                    ${suggestion.icon} ${suggestion.text}
                </button>
            `;
        });
        
        tooltipsDiv.innerHTML = html;
        
        // Attach click handlers
        tooltipsDiv.querySelectorAll('.merlin-tooltip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-tooltip-action');
                this.executeSuggestion(action);
            });
        });
    }
    
    executeSuggestion(action) {
        console.log('Executing suggestion:', action);
        
        // Clear tooltips
        const tooltipsDiv = this.card.querySelector('#merlinTooltips');
        if (tooltipsDiv) tooltipsDiv.innerHTML = '';
        
        switch(action) {
            case 'connect':
                if (typeof serial !== 'undefined') serial.scanPorts();
                this.addMessage('merlin', '🔌 Scanning for GemBot machines...');
                break;
            case 'marketplace':
                if (typeof marketplaceUI !== 'undefined') marketplaceUI.open();
                this.addMessage('merlin', '🛒 Opening the marketplace...');
                break;
            case 'game':
                if (typeof openGameMode !== 'undefined') openGameMode();
                this.addMessage('merlin', '🎮 Launching game mode...');
                break;
            case 'craft':
                this.flip(); // Show controls
                setTimeout(() => {
                    const craftBtn = this.card.querySelector('#btn-craft');
                    if (craftBtn) craftBtn.classList.add('highlighted');
                }, 300);
                break;
            case 'learn':
                this.flip();
                setTimeout(() => {
                    const learnBtn = this.card.querySelector('#btn-learn');
                    if (learnBtn) learnBtn.classList.add('highlighted');
                }, 300);
                break;
            default:
                this.handleControlAction(action);
        }
    }
    
    triggerSpeakingAnimation() {
        const indicator = this.card.querySelector('#merlinSpeakingIndicator');
        const avatar = this.card.querySelector('.merlin-avatar, .card-art');
        
        if (indicator) {
            indicator.style.display = 'flex';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 2000);
        }
        
        if (avatar) {
            avatar.classList.add('speaking');
            setTimeout(() => {
                avatar.classList.remove('speaking');
            }, 2000);
        }
    }
    
    stopSpeakingAnimation() {
        const indicator = this.card.querySelector('#merlinSpeakingIndicator');
        const avatar = this.card.querySelector('.merlin-avatar, .card-art');
        
        if (indicator) indicator.style.display = 'none';
        if (avatar) avatar.classList.remove('speaking');
    }

    clearChat() {
        const messagesContainer = this.card.querySelector('#merlinMessages');
        if (messagesContainer) messagesContainer.innerHTML = '';
        this.state.messages = [];
    }

    /**
     * Guide user to specific control (flip card + highlight button)
     */
    guideToControl(actionId, advice) {
        // Flip to back to show controls
        if (!this.state.isFlipped) {
            this.flip();
        }

        // Update advice text
        const adviceText = this.card.querySelector('#adviceText');
        if (adviceText) {
            adviceText.textContent = advice || `Press the highlighted button to continue...`;
        }

        // Clear previous highlights
        const allBtns = this.card.querySelectorAll('.control-btn');
        allBtns.forEach(btn => btn.classList.remove('highlighted', 'pulsing'));

        // Highlight target button
        const targetBtn = this.card.querySelector(`#btn-${actionId}`);
        if (targetBtn) {
            targetBtn.classList.add('highlighted', 'pulsing');
            targetBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Animate gemstone to point at the control
        this.updateGemstoneColor('question');
        this.animateWizard({ intensity: 2, color: '#f59e0b' });

        console.log(`[Merlin] Guiding to: ${actionId} - "${advice}"`);
    }

    /**
     * Analyze message context and auto-guide to relevant controls
     */
    analyzeAndGuide(userMessage) {
        const msg = userMessage.toLowerCase();
        
        // Gem Bot Farm keywords (automated cutting machines)
        if (msg.includes('deploy') || (msg.includes('add') && msg.includes('machine')) || (msg.includes('new') && msg.includes('bot'))) {
            this.guideToControl('deploy', '🚀 Press "Deploy Machine" to add a new Gem Bot!');
            return true;
        }
        if (msg.includes('monitor') || msg.includes('production') || msg.includes('output') || msg.includes('status')) {
            this.guideToControl('monitor', '📊 Press "Monitor Production" to track your farm!');
            return true;
        }
        if (msg.includes('automat') || msg.includes('efficiency') || (msg.includes('upgrade') && msg.includes('speed'))) {
            this.guideToControl('upgrade-automation', '⚡ Press "Upgrade Automation" to boost efficiency!');
            return true;
        }
        
        // Forge keywords
        if (msg.includes('craft') || msg.includes('make') || msg.includes('create')) {
            this.guideToControl('craft', '⚒️ Press "Craft Item" to forge something new!');
            return true;
        }
        if (msg.includes('repair') || msg.includes('fix') || msg.includes('broken')) {
            this.guideToControl('repair', '🔧 Press "Repair" to fix damaged items!');
            return true;
        }
        if (msg.includes('enhance') || msg.includes('upgrade') || msg.includes('improve')) {
            this.guideToControl('enhance', '✨ Press "Enhance" to power up your items!');
            return true;
        }
        
        // Machine keywords
        if (msg.includes('scan') || msg.includes('search') || msg.includes('find')) {
            this.guideToControl('scan', '🔍 Press "Scan Area" to discover nearby resources!');
            return true;
        }
        if (msg.includes('connect') || msg.includes('link') || msg.includes('pair')) {
            this.guideToControl('connect', '🔗 Press "Connect" to link your machine!');
            return true;
        }
        if (msg.includes('analyze') || msg.includes('check') || msg.includes('inspect')) {
            this.guideToControl('analyze', '📊 Press "Analyze" to examine the data!');
            return true;
        }
        
        // Trading keywords
        if (msg.includes('buy') || msg.includes('shop') || msg.includes('market')) {
            this.guideToControl('marketplace', '🛒 Press "Marketplace" to browse items!');
            return true;
        }
        if (msg.includes('trade') || msg.includes('sell') || msg.includes('exchange')) {
            this.guideToControl('trade', '💰 Press "Trade Gems" to exchange resources!');
            return true;
        }
        if (msg.includes('inventory') || msg.includes('items') || msg.includes('bag')) {
            this.guideToControl('inventory', '🎒 Press "Inventory" to view your items!');
            return true;
        }
        
        // Academy keywords
        if (msg.includes('learn') || msg.includes('teach') || msg.includes('skill')) {
            this.guideToControl('learn', '📖 Press "Learn Skill" to gain new abilities!');
            return true;
        }
        if (msg.includes('tutorial') || msg.includes('how to') || msg.includes('guide')) {
            this.guideToControl('tutorial', '🎓 Press "Tutorial" to learn the basics!');
            return true;
        }
        
        // Help keywords
        if (msg.includes('help') || msg.includes('stuck') || msg.includes('confused')) {
            this.guideToControl('help', '❓ Press "Help" for detailed assistance!');
            return true;
        }

        return false;
    }

    /**
     * Handle control button press
     */
    handleControlAction(action) {
        console.log(`[Merlin] Control action: ${action}`);
        
        // Remove highlight after press
        const allBtns = this.card.querySelectorAll('.control-btn');
        allBtns.forEach(btn => btn.classList.remove('highlighted', 'pulsing'));
        
        // Execute the action
        this.executeControlAction(action);
        
        // Flip back to chat with action-specific message
        setTimeout(() => {
            if (this.state.isFlipped) {
                this.flip();
            }
        }, 300);

        // Trigger event for main system to handle
        window.dispatchEvent(new CustomEvent('merlinControlAction', {
            detail: { action, timestamp: Date.now() }
        }));
    }
    
    /**
     * Execute control actions - each button does something meaningful
     */
    executeControlAction(action) {
        switch (action) {
            // Gem Bot Farm Controls
            case 'deploy':
                this.addMessage('merlin', '🚀 Deploying new GemBot machine! Check your farm for the new unit.');
                this.animateWizard({ intensity: 3, color: '#10b981' });
                if (window.GemBotFarm) window.GemBotFarm.deployMachine();
                if (window.GameState) window.GameState.deployMachine?.();
                break;
                
            case 'monitor':
                this.addMessage('merlin', '📊 Opening production monitor... Analyzing gem output and efficiency.');
                this.animateWizard({ intensity: 2, color: '#3b82f6' });
                if (window.GemBotFarm) window.GemBotFarm.showMonitor();
                // Open monitor panel if exists
                const monitorPanel = document.querySelector('[data-panel="production-monitor"]');
                if (monitorPanel) monitorPanel.click();
                break;
                
            case 'upgrade-automation':
                this.addMessage('merlin', '⚡ Accessing automation upgrades... Boost your gem production rates!');
                this.animateWizard({ intensity: 2, color: '#fbbf24' });
                if (window.GemBotFarm) window.GemBotFarm.showUpgrades();
                if (window.showUpgradePanel) window.showUpgradePanel();
                break;
            
            // Forge Controls
            case 'craft':
                this.addMessage('merlin', '⚒️ Opening the Forge... What shall we craft today?');
                this.animateWizard({ intensity: 2, color: '#f97316' });
                if (window.openGemForge) window.openGemForge();
                if (window.GemForge) window.GemForge.open();
                if (window.togglePanel) window.togglePanel('gemforge-panel');
                break;
                
            case 'repair':
                this.addMessage('merlin', '🔧 Accessing repair station... Bring your damaged items here for restoration.');
                this.animateWizard({ intensity: 2, color: '#f59e0b' });
                if (window.GemForge) window.GemForge.showRepair();
                break;
                
            case 'enhance':
                this.addMessage('merlin', '✨ Enhancement chamber ready! Boost your gems with magical enhancements.');
                this.animateWizard({ intensity: 3, color: '#a855f7' });
                if (window.GemForge) window.GemForge.showEnhance();
                break;
            
            // Machine Controls
            case 'scan':
                this.addMessage('merlin', '🔍 Scanning area for gem deposits and resources...');
                this.animateWizard({ intensity: 2, color: '#06b6d4' });
                if (window.scanForGems) window.scanForGems();
                if (window.GemScanner) window.GemScanner.scan();
                break;
                
            case 'connect':
                this.addMessage('merlin', '🔗 Initiating machine connection sequence... Open Device Manager for USB setup.');
                this.animateWizard({ intensity: 2, color: '#22c55e' });
                if (window.connectToMachine) window.connectToMachine();
                if (window.SerialConnection) window.SerialConnection.connect();
                // Dispatch connection event
                window.dispatchEvent(new CustomEvent('gembot:connect-machine'));
                break;
                
            case 'analyze':
                this.addMessage('merlin', '📊 Analyzing current gemstone... Calculating optimal cut patterns.');
                this.animateWizard({ intensity: 2, color: '#8b5cf6' });
                if (window.analyzeGem) window.analyzeGem();
                if (window.GemAnalyzer) window.GemAnalyzer.analyze();
                break;
            
            // Trading Controls
            case 'marketplace':
                this.addMessage('merlin', '🛒 Opening the marketplace... Browse gems, equipment, and rare finds!');
                this.animateWizard({ intensity: 2, color: '#ec4899' });
                if (window.openMarketplace) window.openMarketplace();
                if (window.Marketplace) window.Marketplace.open();
                if (window.togglePanel) window.togglePanel('marketplace-panel');
                // Also try clicking marketplace button
                const marketBtn = document.querySelector('[data-action="marketplace"], .marketplace-btn, #marketplaceBtn');
                if (marketBtn) marketBtn.click();
                break;
                
            case 'trade':
                this.addMessage('merlin', '💰 Opening gem trading interface... Buy low, sell high!');
                this.animateWizard({ intensity: 2, color: '#fbbf24' });
                if (window.openTrading) window.openTrading();
                if (window.TradingSystem) window.TradingSystem.open();
                break;
                
            case 'inventory':
                this.addMessage('merlin', '🎒 Opening your inventory... Let\'s see what treasures you\'ve collected!');
                this.animateWizard({ intensity: 2, color: '#6366f1' });
                if (window.openInventory) window.openInventory();
                if (window.Inventory) window.Inventory.open();
                if (window.togglePanel) window.togglePanel('inventory-panel');
                // Grant view reward
                if (window.ContributionRewardsSystem) {
                    window.ContributionRewardsSystem.grantReward('FEATURE_USE', 1, { feature: 'inventory' });
                }
                break;
            
            // Academy Controls
            case 'learn':
                this.addMessage('merlin', '📖 Opening the Academy... Knowledge is the greatest treasure!');
                this.animateWizard({ intensity: 2, color: '#14b8a6' });
                if (window.GemBotAcademy) window.GemBotAcademy.open();
                if (window.openAcademy) window.openAcademy();
                if (window.togglePanel) window.togglePanel('academy-panel');
                break;
                
            case 'tutorial':
                this.addMessage('merlin', '🎓 Starting interactive tutorial... I\'ll guide you step by step.');
                this.animateWizard({ intensity: 2, color: '#0ea5e9' });
                if (window.GemBotAcademy) {
                    window.GemBotAcademy.open();
                    window.GemBotAcademy.showTab('courses');
                }
                if (window.startTutorial) window.startTutorial();
                break;
                
            case 'guide':
                this.addMessage('merlin', '📜 Opening the GemBot Guide... Your comprehensive reference manual.');
                this.animateWizard({ intensity: 2, color: '#84cc16' });
                // Open guide/help modal
                if (window.showGuide) window.showGuide();
                if (window.HelpSystem) window.HelpSystem.open();
                break;
            
            // System Controls
            case 'settings':
                this.addMessage('merlin', '⚙️ Opening settings panel... Customize your GemBot experience.');
                this.animateWizard({ intensity: 1, color: '#64748b' });
                if (window.openSettings) window.openSettings();
                if (window.togglePanel) window.togglePanel('settings-panel');
                break;
                
            case 'help':
                this.addMessage('merlin', '❓ How may I assist you? Ask me anything about GemBot, gems, faceting, or trading!');
                this.animateWizard({ intensity: 2, color: '#22d3ee' });
                this.quickAction('help');
                break;
                
            case 'exit':
                this.addMessage('merlin', '🚪 Safe travels, gem crafter! Your progress has been saved.');
                this.animateWizard({ intensity: 1, color: '#94a3b8' });
                // Save game state
                if (window.saveGameState) window.saveGameState();
                if (window.GameState) window.GameState.save?.();
                // Minimize card
                setTimeout(() => this.minimize(), 1500);
                break;
                
            default:
                this.addMessage('merlin', `✨ Executing ${action}... The magic is at work!`);
                this.animateWizard({ intensity: 2, color: '#9333ea' });
        }
        
        // Update gem color for visual feedback
        this.updateGemstoneColor('success');
        
        // Track action for rewards
        if (window.ContributionRewardsSystem) {
            window.ContributionRewardsSystem.grantReward('FEATURE_USE', 1, { 
                feature: 'merlin_control',
                action: action
            });
        }
    }
}

// Auto-initialize
let MerlinCardIntegrated;
window.addEventListener('load', () => {
    MerlinCardIntegrated = new MerlinAICardIntegrated();
    window.MerlinCardIntegrated = MerlinCardIntegrated;
    console.log('[Merlin Integrated] 3D Card initialized with reference design');
});
