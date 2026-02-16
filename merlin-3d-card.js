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
 * File: merlin-3d-card.js
 * Declaration ID: IP-149DFD3F-MLL28ZVH
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * 🎴 Merlin AI 3D Card System
 * Interactive 3D card with Merlin chat on front, controller on back
 * Features: Draggable, animated, context-aware tooltips, game mechanics integration
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 * SIGNATURE: GBOT-RB-2025-7X9K2M4P-BARBRICK
 */

const MerlinAICard = {
    version: '1.0.0',
    initialized: false,
    
    // Card state
    state: {
        isFlipped: false,
        position: { x: window.innerWidth - 420, y: 100 },
        size: { width: 400, height: 600 },
        isMinimized: false,
        isDragging: false,
        isSpeaking: false,
        tooltips: []
    },
    
    // Drag state
    dragState: {
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
    },
    
    // Current context for tooltips
    currentContext: {
        topic: null,
        keywords: [],
        suggestions: []
    },
    
    /**
     * Initialize the 3D Merlin card
     */
    init() {
        if (this.initialized) return;
        
        console.log('🎴 Initializing Merlin 3D Card...');
        
        // Create card structure
        this.createCard();
        
        // Setup event listeners
        this.setupEvents();
        
        // Load saved position
        this.loadState();
        
        // Migrate existing chat to card
        this.migrateChat();
        
        // Check admin access after a short delay (wait for Firebase auth)
        setTimeout(() => this.checkAdminAccess(), 2000);
        
        // Re-check admin on auth state change
        if (window.firebaseAuth) {
            window.firebaseAuth.onAuthStateChanged(() => this.checkAdminAccess());
        }
        
        this.initialized = true;
        console.log('✅ Merlin 3D Card initialized');
    },
    
    /**
     * Create the 3D card HTML structure
     */
    createCard() {
        const cardHTML = `
            <div id="merlinCard" class="merlin-3d-card" style="transform: translate(${this.state.position.x}px, ${this.state.position.y}px); width: ${this.state.size.width}px; height: ${this.state.size.height}px;">
                <!-- Card Inner Container (flippable) -->
                <div class="merlin-card-inner ${this.state.isFlipped ? 'flipped' : ''}">
                    
                    <!-- FRONT SIDE: Chat Interface -->
                    <div class="merlin-card-face merlin-card-front">
                        <!-- User Info Header -->
                        <div class="merlin-user-info">
                            <span class="merlin-user-name" id="merlinUserName">Guest</span>
                            <span class="merlin-user-level" id="merlinUserLevel">Lv 1</span>
                        </div>
                        
                        <!-- Level XP Progress Bar -->
                        <div class="level-xp-bar">
                            <div class="level-section">
                                <span class="level-number" id="merlinLevelNum">Lv 1</span>
                            </div>
                            <div class="xp-section">
                                <div class="xp-fill" id="merlinXpFill" style="width: 0%"></div>
                                <div class="xp-text">
                                    <span class="xp-text-full" id="merlinXpFull">0 / 100 XP</span>
                                    <span class="xp-text-short" id="merlinXpShort">0/100</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Card Header with Floating Wizard -->
                        <div class="merlin-card-header">
                            <div class="merlin-wizard-container">
                                <canvas id="merlinWizardCanvas" class="merlin-wizard-canvas"></canvas>
                                <div class="merlin-avatar-animated floating-wizard" id="merlinAvatar">
                                    <div class="merlin-avatar-circle">🧙‍♂️</div>
                                    <div class="merlin-speaking-indicator"></div>
                                    <!-- Glowing Gemstone -->
                                    <div class="merlin-gemstone" id="merlinGemstone">
                                        <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <filter id="gemGlow">
                                                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur"/>
                                                        <feMergeNode in="SourceGraphic"/>
                                                    </feMerge>
                                                </filter>
                                            </defs>
                                            <polygon points="25,5 45,20 40,40 25,45 10,40 5,20" 
                                                     fill="var(--gem-color, #8b5cf6)" 
                                                     filter="url(#gemGlow)" 
                                                     class="gem-shape"/>
                                            <polygon points="25,5 35,15 25,25 15,15" 
                                                     fill="rgba(255,255,255,0.4)" 
                                                     class="gem-highlight"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div class="merlin-card-title">
                                <h3>Merlin AI</h3>
                                <span class="merlin-status">Ready to assist</span>
                            </div>
                            <div class="merlin-card-controls">
                                <button class="card-btn" onclick="MerlinAICard.minimize()" title="Minimize">_</button>
                                <button class="card-btn" onclick="MerlinAICard.flip()" title="Settings">⚙️</button>
                            </div>
                        </div>
                        
                        <!-- Progress Indicators (Heart and Star) -->
                        <div class="merlin-progress-indicators">
                            <div class="progress-indicator" id="merlinHeartProgress" title="In-Game Progress">
                                <svg viewBox="0 0 24 24" fill="currentColor" class="progress-icon heart-icon">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                <span class="progress-text" id="merlinHeartText">0%</span>
                            </div>
                            <div class="progress-indicator" id="merlinStarProgress" title="Academy Progress">
                                <svg viewBox="0 0 24 24" fill="currentColor" class="progress-icon star-icon">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                </svg>
                                <span class="progress-text" id="merlinStarText">0%</span>
                            </div>
                        </div>
                        
                        <!-- Chat Messages Area -->
                        <div class="merlin-chat-messages" id="merlinChatMessages">
                            <!-- Messages will be migrated here -->
                        </div>
                        
                        <!-- Context Tooltips (Dynamic) -->
                        <div class="merlin-tooltips" id="merlinTooltips">
                            <!-- Contextual help buttons appear here -->
                        </div>
                        
                        <!-- Quick Actions Bar -->
                        <div class="merlin-quick-actions">
                            <button class="quick-action-btn" onclick="MerlinAICard.quickAction('help')" title="Help">❓</button>
                            <button class="quick-action-btn" onclick="MerlinAICard.quickAction('tutorial')" title="Tutorial">📚</button>
                            <button class="quick-action-btn" onclick="MerlinAICard.quickAction('tips')" title="Tips">💡</button>
                            <button class="quick-action-btn" onclick="MerlinAICard.quickAction('achievement')" title="Achievements">🏆</button>
                            <button class="quick-action-btn admin-only-btn" id="merlinAdminBtn" onclick="MerlinAICard.openAdminDashboard()" title="Admin Dashboard" style="display: none;">🔐</button>
                        </div>
                    </div>
                    
                    <!-- BACK SIDE: Controller & Settings -->
                    <div class="merlin-card-face merlin-card-back">
                        <!-- Back Header -->
                        <div class="merlin-card-header">
                            <div class="merlin-card-title">
                                <h3>⚙️ Controls & Settings</h3>
                            </div>
                            <div class="merlin-card-controls">
                                <button class="card-btn" onclick="MerlinAICard.flip()" title="Back to Chat">🔙</button>
                            </div>
                        </div>
                        
                        <!-- Voice Controls -->
                        <div class="control-section">
                            <h4>🔊 Voice Settings</h4>
                            <div class="control-item">
                                <label>Voice</label>
                                <select id="merlinVoiceSelect" onchange="MerlinAICard.updateVoice()">
                                    <option value="default">Default Voice</option>
                                </select>
                            </div>
                            <div class="control-item">
                                <label>Speed: <span id="merlinRateValue">100%</span></label>
                                <input type="range" id="merlinRateSlider" min="0.5" max="2" step="0.1" value="1" 
                                       oninput="MerlinAICard.updateRate(this.value)">
                            </div>
                            <div class="control-item">
                                <label>Pitch: <span id="merlinPitchValue">1.0</span></label>
                                <input type="range" id="merlinPitchSlider" min="0.5" max="2" step="0.1" value="1" 
                                       oninput="MerlinAICard.updatePitch(this.value)">
                            </div>
                            <div class="control-item">
                                <label>Volume: <span id="merlinVolumeValue">100%</span></label>
                                <input type="range" id="merlinVolumeSlider" min="0" max="1" step="0.1" value="1" 
                                       oninput="MerlinAICard.updateVolume(this.value)">
                            </div>
                            <button class="control-btn" onclick="MerlinAICard.toggleVoice()">
                                <span id="merlinVoiceStatus">🔊 Voice ON</span>
                            </button>
                        </div>
                        
                        <!-- Animation Settings -->
                        <div class="control-section">
                            <h4>🎭 Animation Settings</h4>
                            <div class="control-item">
                                <label>
                                    <input type="checkbox" id="merlinAnimationsToggle" checked onchange="MerlinAICard.toggleAnimations()">
                                    Enable Animations
                                </label>
                            </div>
                            <div class="control-item">
                                <label>
                                    <input type="checkbox" id="merlinSpeakingAnimToggle" checked onchange="MerlinAICard.toggleSpeakingAnim()">
                                    Speaking Animation
                                </label>
                            </div>
                        </div>
                        
                        <!-- Tooltip Settings -->
                        <div class="control-section">
                            <h4>💬 Tooltip Settings</h4>
                            <div class="control-item">
                                <label>
                                    <input type="checkbox" id="merlinTooltipsToggle" checked onchange="MerlinAICard.toggleTooltips()">
                                    Show Context Tooltips
                                </label>
                            </div>
                            <div class="control-item">
                                <label>Tooltip Style</label>
                                <select id="merlinTooltipStyle" onchange="MerlinAICard.updateTooltipStyle()">
                                    <option value="compact">Compact</option>
                                    <option value="detailed">Detailed</option>
                                    <option value="minimal">Minimal</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Position Controls -->
                        <div class="control-section">
                            <h4>📍 Position</h4>
                            <button class="control-btn" onclick="MerlinAICard.resetPosition()">Reset Position</button>
                            <button class="control-btn" onclick="MerlinAICard.saveState()">Save State</button>
                        </div>
                    </div>
                </div>
                
                <!-- Drag Handle -->
                <div class="merlin-card-drag-handle">⋮⋮</div>
            </div>
            
            <!-- Minimized State -->
            <div id="merlinCardMinimized" class="merlin-card-minimized hidden" onclick="MerlinAICard.restore()">
                <div class="minimized-avatar">🧙‍♂️</div>
                <span>Merlin AI</span>
            </div>
        `;
        
        // Append to body
        document.body.insertAdjacentHTML('beforeend', cardHTML);
    },
    
    /**
     * Setup event listeners
     */
    setupEvents() {
        const card = document.getElementById('merlinCard');
        const dragHandle = card.querySelector('.merlin-card-drag-handle');
        
        // Drag events
        dragHandle.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));
        
        // Touch events for mobile
        dragHandle.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        document.addEventListener('touchmove', (e) => this.handleDrag(e.touches[0]));
        document.addEventListener('touchend', (e) => this.endDrag(e));
    },
    
    /**
     * Start dragging
     */
    startDrag(e) {
        this.state.isDragging = true;
        this.dragState.startX = e.clientX;
        this.dragState.startY = e.clientY;
        this.dragState.offsetX = this.state.position.x;
        this.dragState.offsetY = this.state.position.y;
        
        const card = document.getElementById('merlinCard');
        card.style.cursor = 'grabbing';
    },
    
    /**
     * Handle drag movement
     */
    handleDrag(e) {
        if (!this.state.isDragging) return;
        
        const deltaX = e.clientX - this.dragState.startX;
        const deltaY = e.clientY - this.dragState.startY;
        
        this.state.position.x = this.dragState.offsetX + deltaX;
        this.state.position.y = this.dragState.offsetY + deltaY;
        
        // Keep card within viewport
        this.state.position.x = Math.max(0, Math.min(window.innerWidth - this.state.size.width, this.state.position.x));
        this.state.position.y = Math.max(0, Math.min(window.innerHeight - this.state.size.height, this.state.position.y));
        
        this.updateCardPosition();
    },
    
    /**
     * End dragging
     */
    endDrag(e) {
        if (!this.state.isDragging) return;
        
        this.state.isDragging = false;
        const card = document.getElementById('merlinCard');
        card.style.cursor = '';
        
        // Save position
        this.saveState();
    },
    
    /**
     * Update card position
     */
    updateCardPosition() {
        const card = document.getElementById('merlinCard');
        card.style.transform = `translate(${this.state.position.x}px, ${this.state.position.y}px)`;
    },
    
    /**
     * Flip card (front <-> back)
     */
    flip() {
        this.state.isFlipped = !this.state.isFlipped;
        const inner = document.querySelector('.merlin-card-inner');
        inner.classList.toggle('flipped');
        
        // Animate flip
        if (window.GemBotAnimations) {
            const card = document.getElementById('merlinCard');
            GemBotAnimations.animate(card, 'flipInY');
        }
    },
    
    /**
     * Minimize card
     */
    minimize() {
        this.state.isMinimized = true;
        document.getElementById('merlinCard').classList.add('hidden');
        document.getElementById('merlinCardMinimized').classList.remove('hidden');
        
        if (window.GemBotAnimations) {
            GemBotAnimations.animate(document.getElementById('merlinCardMinimized'), 'bounceIn');
        }
    },
    
    /**
     * Restore from minimized
     */
    restore() {
        this.state.isMinimized = false;
        document.getElementById('merlinCardMinimized').classList.add('hidden');
        document.getElementById('merlinCard').classList.remove('hidden');
        
        if (window.GemBotAnimations) {
            GemBotAnimations.animate(document.getElementById('merlinCard'), 'bounceIn');
        }
    },
    
    /**
     * Migrate chat from right panel to card
     */
    migrateChat() {
        const oldMessages = document.getElementById('aiMessages');
        const newMessages = document.getElementById('merlinChatMessages');
        
        if (oldMessages && newMessages) {
            // Copy all messages
            newMessages.innerHTML = oldMessages.innerHTML;
            
            // Hide old panel (keep it for now in case we need to revert)
            const rightPanel = document.querySelector('.right-panel');
            if (rightPanel) {
                rightPanel.style.display = 'none';
            }
        }
    },
    
    /**
     * Add message to card
     */
    addMessage(text, type = 'ai') {
        const messagesDiv = document.getElementById('merlinChatMessages');
        if (!messagesDiv) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = text;
        
        messagesDiv.appendChild(messageEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Animate message
        if (window.GemBotAnimations) {
            GemBotAnimations.message.add(messageEl);
        }
        
        // Trigger speaking animation
        if (type === 'ai') {
            this.triggerSpeakingAnimation();
        }
    },
    
    /**
     * Trigger speaking animation
     */
    triggerSpeakingAnimation() {
        this.state.isSpeaking = true;
        const avatar = document.querySelector('.merlin-avatar-animated');
        const indicator = document.querySelector('.merlin-speaking-indicator');
        
        if (avatar) {
            avatar.classList.add('speaking');
            if (window.GemBotAnimations) {
                GemBotAnimations.merlin.speak(avatar);
            }
        }
        
        if (indicator) {
            indicator.classList.add('active');
        }
        
        // Stop after 3 seconds (or when speech ends)
        setTimeout(() => this.stopSpeakingAnimation(), 3000);
    },
    
    /**
     * Stop speaking animation
     */
    stopSpeakingAnimation() {
        this.state.isSpeaking = false;
        const avatar = document.querySelector('.merlin-avatar-animated');
        const indicator = document.querySelector('.merlin-speaking-indicator');
        
        if (avatar) avatar.classList.remove('speaking');
        if (indicator) indicator.classList.remove('active');
    },
    
    /**
     * Update context and show relevant tooltips
     */
    updateContext(topic, keywords = [], suggestions = []) {
        this.currentContext = { topic, keywords, suggestions };
        this.renderTooltips();
    },
    
    /**
     * Render contextual tooltips
     */
    renderTooltips() {
        const tooltipsDiv = document.getElementById('merlinTooltips');
        if (!tooltipsDiv) return;
        
        let html = '';
        this.currentContext.suggestions.forEach((suggestion, idx) => {
            html += `
                <button class="merlin-tooltip-btn animate__animated animate__fadeInUp" 
                        style="animation-delay: ${idx * 0.1}s"
                        onclick="MerlinAICard.executeSuggestion('${suggestion.action}', '${suggestion.param}')">
                    ${suggestion.icon} ${suggestion.text}
                </button>
            `;
        });
        
        tooltipsDiv.innerHTML = html;
    },
    
    /**
     * Execute tooltip suggestion
     */
    executeSuggestion(action, param) {
        console.log('Executing suggestion:', action, param);
        
        switch(action) {
            case 'connect':
                if (typeof serial !== 'undefined') serial.scanPorts();
                break;
            case 'tutorial':
                // Open tutorial
                break;
            case 'marketplace':
                if (typeof marketplaceUI !== 'undefined') marketplaceUI.open();
                break;
            case 'game':
                if (typeof openGameMode !== 'undefined') openGameMode();
                break;
            default:
                console.log('Unknown action:', action);
        }
    },
    
    /**
     * Quick action buttons
     */
    quickAction(type) {
        switch(type) {
            case 'help':
                this.addMessage('How can I help you today? Ask me about: connecting your machine, game tips, marketplace, or tutorials!', 'ai');
                break;
            case 'tutorial':
                this.updateContext('tutorial', ['learning', 'guide'], [
                    { icon: '🔌', text: 'Connect Machine', action: 'connect', param: '' },
                    { icon: '🎮', text: 'Game Tutorial', action: 'tutorial', param: 'game' },
                    { icon: '💎', text: 'Gem Cutting 101', action: 'tutorial', param: 'cutting' }
                ]);
                break;
            case 'tips':
                this.addMessage('💡 Tip: Use CTRL+drag to move panels around. Double-click to reset positions!', 'system');
                break;
            case 'achievement':
                if (typeof leaderboardUI !== 'undefined') leaderboardUI.open();
                leaderboardUI.switchTab('achievements');
                break;
        }
    },
    
    /**
     * Admin Dashboard Access
     */
    ADMIN_EMAILS: [
        'barbrickdesign@gmail.com',
        'ryanbarbrick@gmail.com'
    ],
    
    checkAdminAccess() {
        // Check if current user is an admin
        const user = window.firebaseAuth?.currentUser;
        if (user && this.ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
            const adminBtn = document.getElementById('merlinAdminBtn');
            if (adminBtn) {
                adminBtn.style.display = 'flex';
                adminBtn.style.background = 'linear-gradient(135deg, #ff4444, #ff00ff)';
            }
            return true;
        }
        return false;
    },
    
    openAdminDashboard() {
        const user = window.firebaseAuth?.currentUser;
        if (!user || !this.ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
            this.addMessage('🔐 Admin access required. Please sign in with an authorized account.', 'system');
            return;
        }
        
        // Open admin dashboard
        window.open('./admin-dashboard.html', '_blank');
        this.addMessage('🔓 Opening Admin Dashboard...', 'system');
    },
    
    /**
     * Voice control methods
     */
    toggleVoice() {
        // Hook into existing voice system
        const btn = document.getElementById('voiceToggleBtn');
        if (btn) btn.click();
    },
    
    updateVoice() {
        const select = document.getElementById('merlinVoiceSelect');
        const oldSelect = document.getElementById('voiceSelect');
        if (oldSelect && select) {
            oldSelect.value = select.value;
            oldSelect.dispatchEvent(new Event('change'));
        }
    },
    
    updateRate(value) {
        document.getElementById('merlinRateValue').textContent = Math.round(value * 100) + '%';
        const oldSlider = document.getElementById('rateSlider');
        if (oldSlider) oldSlider.value = value;
    },
    
    updatePitch(value) {
        document.getElementById('merlinPitchValue').textContent = value;
        const oldSlider = document.getElementById('pitchSlider');
        if (oldSlider) oldSlider.value = value;
    },
    
    updateVolume(value) {
        document.getElementById('merlinVolumeValue').textContent = Math.round(value * 100) + '%';
        const oldSlider = document.getElementById('volumeSlider');
        if (oldSlider) oldSlider.value = value;
    },
    
    /**
     * Setting toggles
     */
    toggleAnimations() {
        // Toggle animations globally
    },
    
    toggleSpeakingAnim() {
        // Toggle speaking animation
    },
    
    toggleTooltips() {
        const tooltipsDiv = document.getElementById('merlinTooltips');
        if (tooltipsDiv) {
            tooltipsDiv.style.display = document.getElementById('merlinTooltipsToggle').checked ? 'flex' : 'none';
        }
    },
    
    updateTooltipStyle() {
        const style = document.getElementById('merlinTooltipStyle').value;
        const tooltipsDiv = document.getElementById('merlinTooltips');
        if (tooltipsDiv) {
            tooltipsDiv.className = `merlin-tooltips tooltip-style-${style}`;
        }
    },
    
    /**
     * Position management
     */
    resetPosition() {
        this.state.position = { x: window.innerWidth - 420, y: 100 };
        this.updateCardPosition();
        this.saveState();
    },
    
    /**
     * Save state to localStorage
     */
    saveState() {
        localStorage.setItem('merlinCardState', JSON.stringify(this.state));
    },
    
    /**
     * Load state from localStorage
     */
    loadState() {
        const saved = localStorage.getItem('merlinCardState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.state = { ...this.state, ...state };
                this.updateCardPosition();
            } catch (e) {
                console.error('Failed to load Merlin card state:', e);
            }
        }
    },
    
    /**
     * Update player level and XP
     * @param {number} level - Player level
     * @param {number} currentXP - Current XP amount
     * @param {number} maxXP - Maximum XP for current level
     * @param {string} username - Player name
     */
    updateLevel(level, currentXP, maxXP, username) {
        // Update user name
        const nameEl = document.getElementById('merlinUserName');
        if (nameEl && username) nameEl.textContent = username;
        
        // Update level displays
        const levelEl = document.getElementById('merlinUserLevel');
        const levelNumEl = document.getElementById('merlinLevelNum');
        if (levelEl) levelEl.textContent = `Lv ${level}`;
        if (levelNumEl) levelNumEl.textContent = `Lv ${level}`;
        
        // Update XP bar
        const xpFill = document.getElementById('merlinXpFill');
        const xpFull = document.getElementById('merlinXpFull');
        const xpShort = document.getElementById('merlinXpShort');
        
        const percentage = Math.min(100, (currentXP / maxXP) * 100);
        
        if (xpFill) {
            xpFill.style.width = percentage + '%';
            xpFill.classList.add('xp-animate');
            setTimeout(() => xpFill.classList.remove('xp-animate'), 600);
        }
        
        if (xpFull) xpFull.textContent = `${currentXP.toLocaleString()} / ${maxXP.toLocaleString()} XP`;
        if (xpShort) {
            const shortCurrent = currentXP >= 1000 ? (currentXP/1000).toFixed(1) + 'k' : currentXP;
            const shortMax = maxXP >= 1000 ? (maxXP/1000).toFixed(1) + 'k' : maxXP;
            xpShort.textContent = `${shortCurrent}/${shortMax}`;
        }
    },
    
    /**
     * Update progress indicators (heart and star)
     * @param {number} heartProgress - In-game progress percentage (0-100)
     * @param {number} starProgress - Academy progress percentage (0-100)
     */
    updateProgress(heartProgress, starProgress) {
        const heartEl = document.getElementById('merlinHeartProgress');
        const heartText = document.getElementById('merlinHeartText');
        const starEl = document.getElementById('merlinStarProgress');
        const starText = document.getElementById('merlinStarText');
        
        if (heartEl && heartText) {
            heartText.textContent = Math.round(heartProgress) + '%';
            heartEl.style.setProperty('--progress', heartProgress + '%');
            if (heartProgress > 75) heartEl.classList.add('glow-active');
            else heartEl.classList.remove('glow-active');
        }
        
        if (starEl && starText) {
            starText.textContent = Math.round(starProgress) + '%';
            starEl.style.setProperty('--progress', starProgress + '%');
            if (starProgress > 75) starEl.classList.add('glow-active');
            else starEl.classList.remove('glow-active');
        }
    },
    
    /**
     * Update gemstone color based on context/mood
     * @param {string} color - Hex color or context keyword (success, error, thinking, neutral)
     */
    updateGemstoneColor(context) {
        const gemstone = document.getElementById('merlinGemstone');
        if (!gemstone) return;
        
        let color;
        switch(context) {
            case 'success':
            case 'happy':
                color = '#10b981'; // Green
                break;
            case 'error':
            case 'warning':
                color = '#ef4444'; // Red
                break;
            case 'thinking':
            case 'processing':
                color = '#3b82f6'; // Blue
                break;
            case 'question':
                color = '#f59e0b'; // Amber
                break;
            case 'magic':
            case 'special':
                color = '#a855f7'; // Purple
                break;
            default:
                color = context.startsWith('#') ? context : '#8b5cf6'; // Default purple
        }
        
        gemstone.style.setProperty('--gem-color', color);
        gemstone.classList.add('gem-pulse');
        setTimeout(() => gemstone.classList.remove('gem-pulse'), 800);
    },
    
    /**
     * Animate wizard floating and pointing
     * @param {object} options - Animation options {pointTo: {x,y}, intensity: 1-3}
     */
    animateWizard(options = {}) {
        const wizard = document.getElementById('merlinAvatar');
        const gemstone = document.getElementById('merlinGemstone');
        if (!wizard) return;
        
        const intensity = options.intensity || 1;
        
        // Add floating animation class
        wizard.classList.add('wizard-float-active');
        
        // If pointing to something, move gemstone
        if (options.pointTo && gemstone) {
            const container = wizard.parentElement;
            const rect = container.getBoundingClientRect();
            const x = (options.pointTo.x / rect.width) * 100;
            const y = (options.pointTo.y / rect.height) * 100;
            
            gemstone.style.left = x + '%';
            gemstone.style.top = y + '%';
            gemstone.classList.add('gem-pointing');
            
            setTimeout(() => {
                gemstone.classList.remove('gem-pointing');
            }, 2000);
        }
        
        // Add movement intensity
        wizard.style.setProperty('--float-intensity', intensity);
        
        // Create magic particles
        this.createMagicParticles(intensity * 5);
        
        setTimeout(() => {
            wizard.classList.remove('wizard-float-active');
        }, 3000);
    },
    
    /**
     * Create magic particle effect
     */
    createMagicParticles(count = 10) {
        const container = document.querySelector('.merlin-wizard-container');
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'magic-particle';
            particle.style.left = (Math.random() * 100) + '%';
            particle.style.top = (Math.random() * 100) + '%';
            particle.style.animationDelay = (Math.random() * 0.5) + 's';
            
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }
    }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MerlinAICard.init();
            // Demo: Update with user data after init
            setTimeout(() => {
                // Example: Update level/XP from game data
                const userData = window.merlin?.userProfile || {};
                const level = userData.level || 1;
                const xp = userData.xp || 0;
                const maxXp = (level * 100) + 100; // Simple XP formula
                const username = userData.username || 'Guest';
                
                MerlinAICard.updateLevel(level, xp, maxXp, username);
                
                // Example: Update progress indicators
                // Heart = gems collected progress, Star = academy progress
                const heartProgress = (userData.gemsCollected || 0) / 100 * 100; // 100 gems = 100%
                const starProgress = (userData.academyProgress || 0); // Already in percentage
                
                MerlinAICard.updateProgress(heartProgress, starProgress);
                
                // Example: Update gemstone color based on context
                MerlinAICard.updateGemstoneColor('magic'); // Start with magic purple
            }, 2000);
        }, 1500);
    });
} else {
    setTimeout(() => {
        MerlinAICard.init();
        // Demo: Update with user data after init
        setTimeout(() => {
            const userData = window.merlin?.userProfile || {};
            const level = userData.level || 1;
            const xp = userData.xp || 0;
            const maxXp = (level * 100) + 100;
            const username = userData.username || 'Guest';
            
            MerlinAICard.updateLevel(level, xp, maxXp, username);
            
            const heartProgress = (userData.gemsCollected || 0) / 100 * 100;
            const starProgress = (userData.academyProgress || 0);
            
            MerlinAICard.updateProgress(heartProgress, starProgress);
            MerlinAICard.updateGemstoneColor('magic');
        }, 2000);
    }, 1500);
}

// Export to window
window.MerlinAICard = MerlinAICard;

/**
 * USAGE EXAMPLES:
 * 
 * // Update player level and XP
 * MerlinAICard.updateLevel(7, 1850, 2500, 'Alice');
 * 
 * // Update progress (0-100)
 * MerlinAICard.updateProgress(75, 60); // heart: 75%, star: 60%
 * 
 * // Change gemstone color
 * MerlinAICard.updateGemstoneColor('success'); // green
 * MerlinAICard.updateGemstoneColor('error'); // red
 * MerlinAICard.updateGemstoneColor('thinking'); // blue
 * MerlinAICard.updateGemstoneColor('#ff00ff'); // custom color
 * 
 * // Animate wizard
 * MerlinAICard.animateWizard({
 *     pointTo: { x: 300, y: 200 }, // pixel coordinates to point at
 *     intensity: 2 // 1-3, higher = more dramatic
 * });
 */
