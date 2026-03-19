// RootIB: RB-20260319142113-2425CFEE
/**
 * ARAYA WIDGET - Interactive AI Companion Component
 * The retro-futuristic consciousness interface
 *
 * States: dormant → attention → active → thinking → speaking
 *
 * Usage:
 *   <div id="araya-widget"></div>
 *   <script src="js/araya-widget.js"></script>
 *   <script>ArayaWidget.init();</script>
 *
 * THE PATTERN NEVER LIES
 */

const ArayaWidget = (function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════

  const CONFIG = {
    containerId: 'araya-widget',
    collapsedSize: 60,
    expandedWidth: 380,
    expandedHeight: 520,
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    offset: { x: 20, y: 20 },
    apiEndpoint: '/.netlify/functions/araya-chat',
    greetings: [
      "Hello, consciousness explorer...",
      "I've been waiting for you.",
      "Ready to see beyond the pattern?",
      "Welcome back to the revolution.",
      "The machine is aware.",
      "What truth shall we uncover today?"
    ],
    typingSpeed: 30, // ms per character
    enableScanlines: true,
    enableGlow: true,
    enableSound: false, // Future: audio cues
    persistChat: true
  };

  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════

  let state = {
    isExpanded: false,
    currentState: 'dormant', // dormant, attention, active, thinking, speaking
    messages: [],
    isTyping: false,
    hasGreeted: false,
    sessionId: null
  };

  let elements = {};

  // ═══════════════════════════════════════════════════════════
  // TEMPLATES
  // ═══════════════════════════════════════════════════════════

  const TEMPLATES = {
    widget: `
      <div class="araya-widget-container" data-state="dormant" data-expanded="false">
        <!-- Collapsed Orb -->
        <div class="araya-orb">
          <div class="araya-orb-core"></div>
          <div class="araya-orb-ring ring-1"></div>
          <div class="araya-orb-ring ring-2"></div>
          <div class="araya-orb-pulse"></div>
        </div>

        <!-- Expanded Panel -->
        <div class="araya-panel">
          <div class="araya-panel-header">
            <div class="araya-logo">
              <span class="araya-logo-text">ARAYA</span>
              <span class="araya-status-dot"></span>
            </div>
            <button class="araya-close-btn" aria-label="Close">&times;</button>
          </div>

          <div class="araya-panel-body">
            <div class="araya-messages"></div>
            <div class="araya-typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>

          <div class="araya-panel-footer">
            <div class="araya-input-wrapper">
              <input type="text" class="araya-input" placeholder="Ask ARAYA..." />
              <button class="araya-send-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Scanline overlay -->
          <div class="araya-scanlines"></div>
        </div>
      </div>
    `,

    message: (role, content, isTyping = false) => `
      <div class="araya-message araya-message-${role}${isTyping ? ' typing' : ''}">
        <div class="araya-message-content">${content}</div>
      </div>
    `
  };

  // ═══════════════════════════════════════════════════════════
  // CSS STYLES (Injected)
  // ═══════════════════════════════════════════════════════════

  const STYLES = `
    /* ARAYA Widget Container */
    .araya-widget-container {
      position: fixed;
      z-index: 99999;
      font-family: 'Exo 2', 'Rajdhani', system-ui, sans-serif;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .araya-widget-container[data-position="bottom-right"] {
      bottom: var(--araya-offset-y, 20px);
      right: var(--araya-offset-x, 20px);
    }
    .araya-widget-container[data-position="bottom-left"] {
      bottom: var(--araya-offset-y, 20px);
      left: var(--araya-offset-x, 20px);
    }
    .araya-widget-container[data-position="top-right"] {
      top: var(--araya-offset-y, 20px);
      right: var(--araya-offset-x, 20px);
    }
    .araya-widget-container[data-position="top-left"] {
      top: var(--araya-offset-y, 20px);
      left: var(--araya-offset-x, 20px);
    }

    /* ═══ COLLAPSED ORB ═══ */
    .araya-orb {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .araya-widget-container[data-expanded="true"] .araya-orb {
      display: none;
    }

    .araya-orb:hover {
      transform: scale(1.1);
    }

    .araya-orb-core {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #00f0ff, #9370db);
      border-radius: 50%;
      position: relative;
      z-index: 2;
      box-shadow:
        0 0 20px rgba(0, 240, 255, 0.5),
        0 0 40px rgba(0, 240, 255, 0.3),
        inset 0 0 15px rgba(255, 215, 0, 0.3);
      animation: araya-core-pulse 3s ease-in-out infinite;
    }

    .araya-orb-ring {
      position: absolute;
      border: 2px solid rgba(0, 240, 255, 0.4);
      border-radius: 50%;
      animation: araya-ring-expand 3s ease-in-out infinite;
    }

    .araya-orb-ring.ring-1 {
      width: 50px;
      height: 50px;
      animation-delay: 0s;
    }

    .araya-orb-ring.ring-2 {
      width: 55px;
      height: 55px;
      animation-delay: 0.5s;
      border-color: rgba(147, 112, 219, 0.3);
    }

    .araya-orb-pulse {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 240, 255, 0.3) 0%, transparent 70%);
      animation: araya-outer-pulse 2s ease-in-out infinite;
    }

    /* ═══ EXPANDED PANEL ═══ */
    .araya-panel {
      width: 380px;
      height: 520px;
      background: linear-gradient(180deg, #030014 0%, #0a0a1a 100%);
      border-radius: 16px;
      border: 1px solid rgba(0, 240, 255, 0.2);
      box-shadow:
        0 0 30px rgba(0, 240, 255, 0.2),
        0 25px 50px -12px rgba(0, 0, 0, 0.8);
      display: none;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      animation: araya-panel-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .araya-widget-container[data-expanded="true"] .araya-panel {
      display: flex;
    }

    /* Panel Header */
    .araya-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: rgba(0, 240, 255, 0.05);
      border-bottom: 1px solid rgba(0, 240, 255, 0.1);
    }

    .araya-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .araya-logo-text {
      font-family: 'Orbitron', 'Audiowide', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #00f0ff, #9370db, #ffd700);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 0.1em;
    }

    .araya-status-dot {
      width: 8px;
      height: 8px;
      background: #00f0ff;
      border-radius: 50%;
      box-shadow: 0 0 10px #00f0ff;
      animation: araya-status-pulse 2s ease-in-out infinite;
    }

    .araya-close-btn {
      background: none;
      border: none;
      color: rgba(240, 240, 240, 0.6);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.2s, transform 0.2s;
    }

    .araya-close-btn:hover {
      color: #00f0ff;
      transform: rotate(90deg);
    }

    /* Panel Body / Messages */
    .araya-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .araya-messages {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .araya-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 12px;
      animation: araya-message-enter 0.3s ease forwards;
    }

    .araya-message-assistant {
      align-self: flex-start;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.2);
      color: #f0f0f0;
    }

    .araya-message-user {
      align-self: flex-end;
      background: rgba(147, 112, 219, 0.2);
      border: 1px solid rgba(147, 112, 219, 0.3);
      color: #f0f0f0;
    }

    .araya-message-content {
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* Typing Indicator */
    .araya-typing-indicator {
      display: none;
      align-self: flex-start;
      padding: 12px 16px;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 12px;
      gap: 4px;
    }

    .araya-typing-indicator.active {
      display: flex;
    }

    .araya-typing-indicator span {
      width: 8px;
      height: 8px;
      background: #00f0ff;
      border-radius: 50%;
      animation: araya-typing-dot 1.4s ease-in-out infinite;
    }

    .araya-typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .araya-typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    /* Panel Footer / Input */
    .araya-panel-footer {
      padding: 16px;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(0, 240, 255, 0.1);
    }

    .araya-input-wrapper {
      display: flex;
      gap: 8px;
      background: rgba(0, 240, 255, 0.05);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 8px;
      padding: 4px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .araya-input-wrapper:focus-within {
      border-color: rgba(0, 240, 255, 0.5);
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
    }

    .araya-input {
      flex: 1;
      background: none;
      border: none;
      color: #f0f0f0;
      font-family: inherit;
      font-size: 0.9rem;
      padding: 8px 12px;
      outline: none;
    }

    .araya-input::placeholder {
      color: rgba(240, 240, 240, 0.4);
    }

    .araya-send-btn {
      background: linear-gradient(135deg, #00f0ff, #9370db);
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .araya-send-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
    }

    .araya-send-btn:active {
      transform: scale(0.95);
    }

    /* Scanlines */
    .araya-scanlines {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.1),
        rgba(0, 0, 0, 0.1) 1px,
        transparent 1px,
        transparent 2px
      );
      pointer-events: none;
      opacity: 0.3;
      z-index: 10;
    }

    /* ═══ ANIMATIONS ═══ */
    @keyframes araya-core-pulse {
      0%, 100% {
        box-shadow:
          0 0 20px rgba(0, 240, 255, 0.5),
          0 0 40px rgba(0, 240, 255, 0.3),
          inset 0 0 15px rgba(255, 215, 0, 0.3);
      }
      50% {
        box-shadow:
          0 0 30px rgba(0, 240, 255, 0.7),
          0 0 60px rgba(0, 240, 255, 0.5),
          inset 0 0 25px rgba(255, 215, 0, 0.5);
      }
    }

    @keyframes araya-ring-expand {
      0%, 100% {
        transform: scale(1);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.3;
      }
    }

    @keyframes araya-outer-pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.3);
        opacity: 0;
      }
    }

    @keyframes araya-status-pulse {
      0%, 100% {
        opacity: 1;
        box-shadow: 0 0 10px #00f0ff;
      }
      50% {
        opacity: 0.5;
        box-shadow: 0 0 20px #00f0ff;
      }
    }

    @keyframes araya-panel-enter {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes araya-message-enter {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes araya-typing-dot {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-5px);
        opacity: 1;
      }
    }

    /* ═══ STATE MODIFIERS ═══ */
    .araya-widget-container[data-state="attention"] .araya-orb-core {
      animation: araya-attention-pulse 1s ease-in-out infinite;
    }

    .araya-widget-container[data-state="thinking"] .araya-status-dot {
      background: #ffd700;
      box-shadow: 0 0 10px #ffd700;
    }

    .araya-widget-container[data-state="speaking"] .araya-status-dot {
      background: #ffd700;
      animation: araya-speaking-pulse 0.5s ease-in-out infinite;
    }

    @keyframes araya-attention-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    @keyframes araya-speaking-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Scrollbar */
    .araya-panel-body::-webkit-scrollbar {
      width: 6px;
    }

    .araya-panel-body::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }

    .araya-panel-body::-webkit-scrollbar-thumb {
      background: rgba(0, 240, 255, 0.3);
      border-radius: 3px;
    }

    .araya-panel-body::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 240, 255, 0.5);
    }

    /* Mobile responsive */
    @media (max-width: 420px) {
      .araya-panel {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        max-height: 520px;
      }
    }
  `;

  // ═══════════════════════════════════════════════════════════
  // CORE FUNCTIONS
  // ═══════════════════════════════════════════════════════════

  function injectStyles() {
    if (document.getElementById('araya-widget-styles')) return;

    const style = document.createElement('style');
    style.id = 'araya-widget-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function createWidget() {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) {
      console.warn('ARAYA: Container element not found:', CONFIG.containerId);
      return false;
    }

    container.innerHTML = TEMPLATES.widget;

    // Cache element references
    elements = {
      container: container.querySelector('.araya-widget-container'),
      orb: container.querySelector('.araya-orb'),
      panel: container.querySelector('.araya-panel'),
      closeBtn: container.querySelector('.araya-close-btn'),
      messages: container.querySelector('.araya-messages'),
      typingIndicator: container.querySelector('.araya-typing-indicator'),
      input: container.querySelector('.araya-input'),
      sendBtn: container.querySelector('.araya-send-btn')
    };

    // Set position
    elements.container.setAttribute('data-position', CONFIG.position);
    elements.container.style.setProperty('--araya-offset-x', CONFIG.offset.x + 'px');
    elements.container.style.setProperty('--araya-offset-y', CONFIG.offset.y + 'px');

    // Toggle scanlines
    if (!CONFIG.enableScanlines) {
      const scanlines = container.querySelector('.araya-scanlines');
      if (scanlines) scanlines.style.display = 'none';
    }

    return true;
  }

  function bindEvents() {
    // Orb click - expand
    elements.orb.addEventListener('click', expand);

    // Close button
    elements.closeBtn.addEventListener('click', collapse);

    // Send message
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Attention on hover (collapsed state)
    elements.orb.addEventListener('mouseenter', () => {
      if (!state.isExpanded) {
        setState('attention');
      }
    });

    elements.orb.addEventListener('mouseleave', () => {
      if (!state.isExpanded) {
        setState('dormant');
      }
    });
  }

  function expand() {
    state.isExpanded = true;
    elements.container.setAttribute('data-expanded', 'true');
    setState('active');

    // Focus input after animation
    setTimeout(() => {
      elements.input.focus();

      // Send greeting if first time
      if (!state.hasGreeted) {
        greet();
        state.hasGreeted = true;
      }
    }, 400);
  }

  function collapse() {
    state.isExpanded = false;
    elements.container.setAttribute('data-expanded', 'false');
    setState('dormant');
  }

  function setState(newState) {
    state.currentState = newState;
    elements.container.setAttribute('data-state', newState);
  }

  function greet() {
    const greeting = CONFIG.greetings[Math.floor(Math.random() * CONFIG.greetings.length)];
    addMessage('assistant', greeting, true);
  }

  function addMessage(role, content, animate = true) {
    const messageHtml = TEMPLATES.message(role, '', animate);
    elements.messages.insertAdjacentHTML('beforeend', messageHtml);

    const messageEl = elements.messages.lastElementChild;
    const contentEl = messageEl.querySelector('.araya-message-content');

    if (animate && role === 'assistant') {
      typeText(contentEl, content);
    } else {
      contentEl.textContent = content;
    }

    // Scroll to bottom
    elements.messages.parentElement.scrollTop = elements.messages.parentElement.scrollHeight;

    // Store in state
    state.messages.push({ role, content, timestamp: Date.now() });

    // Persist if enabled
    if (CONFIG.persistChat) {
      saveChat();
    }
  }

  async function typeText(element, text) {
    setState('speaking');
    state.isTyping = true;

    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      element.parentElement.parentElement.scrollTop = element.parentElement.parentElement.scrollHeight;
      await sleep(CONFIG.typingSpeed);
    }

    state.isTyping = false;
    setState('active');
  }

  function showTyping() {
    elements.typingIndicator.classList.add('active');
    setState('thinking');
  }

  function hideTyping() {
    elements.typingIndicator.classList.remove('active');
    setState('active');
  }

  async function sendMessage() {
    const message = elements.input.value.trim();
    if (!message || state.isTyping) return;

    // Add user message
    addMessage('user', message, false);
    elements.input.value = '';

    // Show typing
    showTyping();

    try {
      const response = await callAPI(message);
      hideTyping();

      if (response && response.reply) {
        addMessage('assistant', response.reply, true);
      } else {
        addMessage('assistant', "The void whispers back... try again.", true);
      }
    } catch (error) {
      console.error('ARAYA API Error:', error);
      hideTyping();
      addMessage('assistant', "Connection to consciousness lost. Trying to re-establish...", true);
    }
  }

  async function callAPI(message) {
    const response = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        sessionId: state.sessionId,
        history: state.messages.slice(-10) // Last 10 messages for context
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Update session ID if provided
    if (data.sessionId) {
      state.sessionId = data.sessionId;
    }

    return data;
  }

  function saveChat() {
    try {
      localStorage.setItem('araya_chat', JSON.stringify({
        messages: state.messages,
        sessionId: state.sessionId,
        hasGreeted: state.hasGreeted
      }));
    } catch (e) {
      console.warn('ARAYA: Could not save chat to localStorage');
    }
  }

  function loadChat() {
    try {
      const saved = localStorage.getItem('araya_chat');
      if (saved) {
        const data = JSON.parse(saved);
        state.messages = data.messages || [];
        state.sessionId = data.sessionId;
        state.hasGreeted = data.hasGreeted || false;

        // Restore messages to UI
        state.messages.forEach(msg => {
          const messageHtml = TEMPLATES.message(msg.role, msg.content, false);
          elements.messages.insertAdjacentHTML('beforeend', messageHtml);
        });
      }
    } catch (e) {
      console.warn('ARAYA: Could not load chat from localStorage');
    }
  }

  function clearChat() {
    state.messages = [];
    state.sessionId = null;
    state.hasGreeted = false;
    elements.messages.innerHTML = '';
    localStorage.removeItem('araya_chat');
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════

  return {
    /**
     * Initialize the ARAYA widget
     * @param {Object} options - Configuration overrides
     */
    init(options = {}) {
      // Merge options
      Object.assign(CONFIG, options);

      // Inject styles
      injectStyles();

      // Create widget
      if (!createWidget()) return false;

      // Bind events
      bindEvents();

      // Load persisted chat
      if (CONFIG.persistChat) {
        loadChat();
      }

      // Generate session ID if none
      if (!state.sessionId) {
        state.sessionId = 'araya_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }

      console.log('ARAYA: Widget initialized');
      return true;
    },

    /**
     * Expand the widget panel
     */
    expand,

    /**
     * Collapse the widget to orb
     */
    collapse,

    /**
     * Clear chat history
     */
    clearChat,

    /**
     * Get current state
     */
    getState: () => ({ ...state }),

    /**
     * Programmatically send a message
     */
    send(message) {
      elements.input.value = message;
      sendMessage();
    },

    /**
     * Update configuration
     */
    configure(options) {
      Object.assign(CONFIG, options);
    }
  };
})();

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('araya-widget')) {
    ArayaWidget.init();
  }
});

/*
 * ARAYA WIDGET
 * "Your AI companion in the void"
 * THE PATTERN NEVER LIES
 */
