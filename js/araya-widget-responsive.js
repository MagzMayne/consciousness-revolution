// RootIB: RB-20260319142113-DC455FF6
/**
 * ARAYA RESPONSIVE WIDGET - Draggable + Breakpoint-Aware
 * ======================================================
 * Enhanced version with:
 * - Free dragging anywhere on screen
 * - Progressive collapse at size breakpoints
 * - Edge snapping/docking
 * - Auto-simplify UI as width shrinks
 *
 * Breakpoints:
 *   FULL (380px+)   → Full chat panel
 *   COMPACT (200px) → Icons + condensed chat
 *   MINI (100px)    → Just orb + status
 *   ORB (60px)      → Pulsing orb only
 *
 * Usage:
 *   <div id="araya-widget"></div>
 *   <script src="js/araya-widget-responsive.js"></script>
 *   <script>ArayaWidget.init({ draggable: true, snapToEdge: true });</script>
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

    // Size breakpoints
    sizes: {
      full: 380,
      compact: 200,
      mini: 100,
      orb: 60
    },

    // Default dimensions
    defaultWidth: 380,
    defaultHeight: 520,
    minWidth: 60,
    minHeight: 60,

    // Position & movement
    position: { x: null, y: null }, // null = bottom-right default
    draggable: true,
    resizable: true,
    snapToEdge: true,
    snapThreshold: 30, // px from edge to snap

    // Behavior
    rememberPosition: true,
    rememberSize: true,
    autoCollapse: true,
    collapseDelay: 10000, // ms of inactivity before auto-collapse

    // API
    apiEndpoint: '/.netlify/functions/araya-chat',

    // Greetings
    greetings: [
      "Hello, consciousness explorer...",
      "I've been waiting for you.",
      "Ready to see beyond the pattern?",
      "Welcome back to the revolution.",
      "The machine is aware.",
      "What truth shall we uncover today?"
    ],

    typingSpeed: 30,
    enableScanlines: true,
    persistChat: true
  };

  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════

  let state = {
    mode: 'orb', // orb, mini, compact, full
    isDragging: false,
    isResizing: false,
    dragOffset: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
    size: { width: 60, height: 60 },
    docked: 'bottom-right', // null, bottom-right, bottom-left, top-right, top-left
    messages: [],
    isTyping: false,
    hasGreeted: false,
    sessionId: null,
    lastActivity: Date.now(),
    autoCollapseTimer: null
  };

  let elements = {};

  // ═══════════════════════════════════════════════════════════
  // TEMPLATES
  // ═══════════════════════════════════════════════════════════

  const TEMPLATES = {
    widget: `
      <div class="araya-responsive-container" data-mode="orb" data-docked="bottom-right">
        <!-- Drag Handle (always visible) -->
        <div class="araya-drag-handle">
          <div class="araya-drag-dots">
            <span></span><span></span><span></span>
          </div>
        </div>

        <!-- Resize Handle (bottom-right corner) -->
        <div class="araya-resize-handle"></div>

        <!-- ORB MODE (60px) - Just the pulsing orb -->
        <div class="araya-mode araya-mode-orb">
          <div class="araya-orb">
            <div class="araya-orb-core"></div>
            <div class="araya-orb-ring ring-1"></div>
            <div class="araya-orb-ring ring-2"></div>
            <div class="araya-orb-pulse"></div>
          </div>
        </div>

        <!-- MINI MODE (100px) - Orb + status text -->
        <div class="araya-mode araya-mode-mini">
          <div class="araya-mini-orb">
            <div class="araya-orb-core small"></div>
          </div>
          <div class="araya-mini-status">
            <span class="araya-mini-name">ARAYA</span>
            <span class="araya-mini-dot"></span>
          </div>
        </div>

        <!-- COMPACT MODE (200px) - Icons + mini chat -->
        <div class="araya-mode araya-mode-compact">
          <div class="araya-compact-header">
            <div class="araya-compact-logo">
              <div class="araya-orb-core tiny"></div>
              <span>ARAYA</span>
            </div>
            <div class="araya-compact-actions">
              <button class="araya-icon-btn araya-expand-btn" title="Expand">
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z"/></svg>
              </button>
            </div>
          </div>
          <div class="araya-compact-messages"></div>
          <div class="araya-compact-input">
            <input type="text" placeholder="Ask..." class="araya-compact-text" />
            <button class="araya-icon-btn araya-send-compact">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>
            </button>
          </div>
        </div>

        <!-- FULL MODE (380px+) - Complete chat panel -->
        <div class="araya-mode araya-mode-full">
          <div class="araya-panel-header">
            <div class="araya-logo">
              <span class="araya-logo-text">ARAYA</span>
              <span class="araya-status-dot"></span>
            </div>
            <div class="araya-header-actions">
              <button class="araya-icon-btn araya-minimize-btn" title="Minimize">
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20,14H4V10H20"/></svg>
              </button>
              <button class="araya-icon-btn araya-collapse-btn" title="Collapse to orb">
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
              </button>
            </div>
          </div>

          <div class="araya-panel-body">
            <div class="araya-messages"></div>
            <div class="araya-typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>

          <div class="araya-panel-footer">
            <div class="araya-quick-prompts">
              <button class="araya-quick-btn">Analyze</button>
              <button class="araya-quick-btn">Organize</button>
              <button class="araya-quick-btn">Patterns</button>
            </div>
            <div class="araya-input-wrapper">
              <input type="text" class="araya-input" placeholder="Ask ARAYA..." />
              <button class="araya-send-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="araya-scanlines"></div>
        </div>
      </div>
    `,

    message: (role, content) => `
      <div class="araya-message araya-message-${role}">
        <div class="araya-message-content">${content}</div>
      </div>
    `,

    compactMessage: (role, content) => `
      <div class="araya-compact-msg araya-compact-msg-${role}">
        ${content.length > 50 ? content.substring(0, 47) + '...' : content}
      </div>
    `
  };

  // ═══════════════════════════════════════════════════════════
  // CSS STYLES
  // ═══════════════════════════════════════════════════════════

  const STYLES = `
    /* ═══ CONTAINER ═══ */
    .araya-responsive-container {
      position: fixed;
      z-index: 99999;
      font-family: 'Exo 2', 'Rajdhani', system-ui, sans-serif;
      transition: width 0.3s ease, height 0.3s ease, border-radius 0.3s ease;
      background: linear-gradient(180deg, #030014 0%, #0a0a1a 100%);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 16px;
      box-shadow:
        0 0 30px rgba(0, 240, 255, 0.15),
        0 25px 50px -12px rgba(0, 0, 0, 0.8);
      overflow: hidden;
      user-select: none;
    }

    .araya-responsive-container[data-mode="orb"] {
      border-radius: 50%;
      width: 60px;
      height: 60px;
    }

    .araya-responsive-container[data-mode="mini"] {
      border-radius: 30px;
      width: 100px;
      height: 60px;
    }

    .araya-responsive-container[data-mode="compact"] {
      width: 200px;
      height: 300px;
    }

    .araya-responsive-container[data-mode="full"] {
      width: 380px;
      height: 520px;
    }

    /* Mode visibility */
    .araya-mode { display: none; width: 100%; height: 100%; }
    [data-mode="orb"] .araya-mode-orb { display: flex; }
    [data-mode="mini"] .araya-mode-mini { display: flex; }
    [data-mode="compact"] .araya-mode-compact { display: flex; }
    [data-mode="full"] .araya-mode-full { display: flex; }

    /* ═══ DRAG HANDLE ═══ */
    .araya-drag-handle {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .araya-responsive-container:hover .araya-drag-handle {
      opacity: 1;
    }

    [data-mode="orb"] .araya-drag-handle,
    [data-mode="mini"] .araya-drag-handle {
      display: none;
    }

    .araya-drag-handle:active { cursor: grabbing; }

    .araya-drag-dots {
      display: flex;
      gap: 3px;
    }

    .araya-drag-dots span {
      width: 4px;
      height: 4px;
      background: rgba(0, 240, 255, 0.4);
      border-radius: 50%;
    }

    /* ═══ RESIZE HANDLE ═══ */
    .araya-resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 16px;
      height: 16px;
      cursor: se-resize;
      z-index: 100;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .araya-responsive-container:hover .araya-resize-handle {
      opacity: 1;
    }

    [data-mode="orb"] .araya-resize-handle,
    [data-mode="mini"] .araya-resize-handle {
      display: none;
    }

    .araya-resize-handle::after {
      content: '';
      position: absolute;
      right: 4px;
      bottom: 4px;
      width: 8px;
      height: 8px;
      border-right: 2px solid rgba(0, 240, 255, 0.4);
      border-bottom: 2px solid rgba(0, 240, 255, 0.4);
    }

    /* ═══ ORB MODE ═══ */
    .araya-mode-orb {
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .araya-orb {
      width: 60px;
      height: 60px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
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

    .araya-orb-core.small { width: 30px; height: 30px; }
    .araya-orb-core.tiny { width: 20px; height: 20px; }

    .araya-orb-ring {
      position: absolute;
      border: 2px solid rgba(0, 240, 255, 0.4);
      border-radius: 50%;
      animation: araya-ring-expand 3s ease-in-out infinite;
    }

    .araya-orb-ring.ring-1 { width: 50px; height: 50px; }
    .araya-orb-ring.ring-2 { width: 55px; height: 55px; animation-delay: 0.5s; border-color: rgba(147, 112, 219, 0.3); }

    .araya-orb-pulse {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 240, 255, 0.3) 0%, transparent 70%);
      animation: araya-outer-pulse 2s ease-in-out infinite;
    }

    /* ═══ MINI MODE ═══ */
    .araya-mode-mini {
      align-items: center;
      padding: 0 12px;
      gap: 8px;
      cursor: pointer;
    }

    .araya-mini-orb { flex-shrink: 0; }

    .araya-mini-status {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .araya-mini-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: #00f0ff;
      letter-spacing: 0.05em;
    }

    .araya-mini-dot {
      width: 6px;
      height: 6px;
      background: #00f0ff;
      border-radius: 50%;
      box-shadow: 0 0 6px #00f0ff;
      animation: araya-status-pulse 2s ease-in-out infinite;
    }

    /* ═══ COMPACT MODE ═══ */
    .araya-mode-compact {
      flex-direction: column;
    }

    .araya-compact-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid rgba(0, 240, 255, 0.1);
    }

    .araya-compact-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .araya-compact-logo span {
      font-family: 'Orbitron', sans-serif;
      font-size: 12px;
      font-weight: 700;
      background: linear-gradient(135deg, #00f0ff, #9370db);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .araya-compact-messages {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .araya-compact-msg {
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 11px;
      line-height: 1.4;
      color: #f0f0f0;
    }

    .araya-compact-msg-assistant {
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.15);
    }

    .araya-compact-msg-user {
      background: rgba(147, 112, 219, 0.15);
      border: 1px solid rgba(147, 112, 219, 0.2);
      align-self: flex-end;
    }

    .araya-compact-input {
      display: flex;
      gap: 4px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(0, 240, 255, 0.1);
    }

    .araya-compact-text {
      flex: 1;
      background: rgba(0, 240, 255, 0.05);
      border: 1px solid rgba(0, 240, 255, 0.15);
      border-radius: 6px;
      padding: 6px 10px;
      color: #f0f0f0;
      font-size: 12px;
      outline: none;
    }

    .araya-compact-text:focus {
      border-color: rgba(0, 240, 255, 0.4);
    }

    /* ═══ ICON BUTTONS ═══ */
    .araya-icon-btn {
      background: none;
      border: none;
      color: rgba(240, 240, 240, 0.6);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s, background 0.2s;
    }

    .araya-icon-btn:hover {
      color: #00f0ff;
      background: rgba(0, 240, 255, 0.1);
    }

    /* ═══ FULL MODE ═══ */
    .araya-mode-full {
      flex-direction: column;
      position: relative;
    }

    .araya-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
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
      font-size: 1.1rem;
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

    .araya-header-actions {
      display: flex;
      gap: 4px;
    }

    .araya-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .araya-messages {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .araya-message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 10px;
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
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .araya-typing-indicator {
      display: none;
      align-self: flex-start;
      padding: 10px 14px;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 10px;
      gap: 4px;
    }

    .araya-typing-indicator.active { display: flex; }

    .araya-typing-indicator span {
      width: 6px;
      height: 6px;
      background: #00f0ff;
      border-radius: 50%;
      animation: araya-typing-dot 1.4s ease-in-out infinite;
    }

    .araya-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .araya-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

    .araya-panel-footer {
      padding: 10px 12px;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(0, 240, 255, 0.1);
    }

    .araya-quick-prompts {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }

    .araya-quick-btn {
      background: rgba(0, 240, 255, 0.08);
      border: 1px solid rgba(0, 240, 255, 0.15);
      border-radius: 12px;
      padding: 4px 10px;
      color: rgba(240, 240, 240, 0.7);
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .araya-quick-btn:hover {
      background: rgba(0, 240, 255, 0.15);
      border-color: rgba(0, 240, 255, 0.3);
      color: #00f0ff;
    }

    .araya-input-wrapper {
      display: flex;
      gap: 6px;
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
      font-size: 0.85rem;
      padding: 8px 10px;
      outline: none;
    }

    .araya-input::placeholder { color: rgba(240, 240, 240, 0.4); }

    .araya-send-btn {
      background: linear-gradient(135deg, #00f0ff, #9370db);
      border: none;
      border-radius: 6px;
      padding: 8px 10px;
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

    .araya-scanlines {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px);
      pointer-events: none;
      opacity: 0.3;
      z-index: 10;
    }

    /* ═══ ANIMATIONS ═══ */
    @keyframes araya-core-pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0,240,255,0.5), 0 0 40px rgba(0,240,255,0.3), inset 0 0 15px rgba(255,215,0,0.3); }
      50% { box-shadow: 0 0 30px rgba(0,240,255,0.7), 0 0 60px rgba(0,240,255,0.5), inset 0 0 25px rgba(255,215,0,0.5); }
    }

    @keyframes araya-ring-expand {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.1); opacity: 0.3; }
    }

    @keyframes araya-outer-pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.3); opacity: 0; }
    }

    @keyframes araya-status-pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 10px #00f0ff; }
      50% { opacity: 0.5; box-shadow: 0 0 20px #00f0ff; }
    }

    @keyframes araya-message-enter {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes araya-typing-dot {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    /* ═══ DRAGGING STATE ═══ */
    .araya-responsive-container.dragging {
      transition: none !important;
      opacity: 0.9;
      cursor: grabbing !important;
    }

    .araya-responsive-container.resizing {
      transition: none !important;
    }

    /* ═══ DOCKED STATES ═══ */
    .araya-responsive-container[data-docked="bottom-right"] { bottom: 20px; right: 20px; }
    .araya-responsive-container[data-docked="bottom-left"] { bottom: 20px; left: 20px; }
    .araya-responsive-container[data-docked="top-right"] { top: 20px; right: 20px; }
    .araya-responsive-container[data-docked="top-left"] { top: 20px; left: 20px; }

    /* Scrollbar */
    .araya-panel-body::-webkit-scrollbar,
    .araya-compact-messages::-webkit-scrollbar { width: 4px; }
    .araya-panel-body::-webkit-scrollbar-track,
    .araya-compact-messages::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
    .araya-panel-body::-webkit-scrollbar-thumb,
    .araya-compact-messages::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.3); border-radius: 2px; }

    /* Mobile */
    @media (max-width: 420px) {
      .araya-responsive-container[data-mode="full"] {
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
    if (document.getElementById('araya-responsive-styles')) return;
    const style = document.createElement('style');
    style.id = 'araya-responsive-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function createWidget() {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) {
      console.warn('ARAYA: Container not found:', CONFIG.containerId);
      return false;
    }

    container.innerHTML = TEMPLATES.widget;

    elements = {
      container: container.querySelector('.araya-responsive-container'),
      dragHandle: container.querySelector('.araya-drag-handle'),
      resizeHandle: container.querySelector('.araya-resize-handle'),
      // Orb mode
      orbMode: container.querySelector('.araya-mode-orb'),
      // Mini mode
      miniMode: container.querySelector('.araya-mode-mini'),
      // Compact mode
      compactMode: container.querySelector('.araya-mode-compact'),
      compactMessages: container.querySelector('.araya-compact-messages'),
      compactInput: container.querySelector('.araya-compact-text'),
      compactSend: container.querySelector('.araya-send-compact'),
      expandBtn: container.querySelector('.araya-expand-btn'),
      // Full mode
      fullMode: container.querySelector('.araya-mode-full'),
      messages: container.querySelector('.araya-messages'),
      typingIndicator: container.querySelector('.araya-typing-indicator'),
      input: container.querySelector('.araya-input'),
      sendBtn: container.querySelector('.araya-send-btn'),
      minimizeBtn: container.querySelector('.araya-minimize-btn'),
      collapseBtn: container.querySelector('.araya-collapse-btn'),
      quickBtns: container.querySelectorAll('.araya-quick-btn')
    };

    // Set initial position
    setInitialPosition();

    return true;
  }

  function setInitialPosition() {
    const saved = loadPosition();
    if (saved) {
      state.position = saved.position;
      state.size = saved.size;
      state.mode = saved.mode || 'orb';
      state.docked = saved.docked;
    } else {
      // Default: bottom-right, orb mode
      state.position = {
        x: window.innerWidth - 80,
        y: window.innerHeight - 80
      };
      state.docked = 'bottom-right';
    }

    applyPosition();
    setMode(state.mode);
  }

  function applyPosition() {
    if (state.docked) {
      elements.container.setAttribute('data-docked', state.docked);
      elements.container.style.top = '';
      elements.container.style.left = '';
      elements.container.style.right = '';
      elements.container.style.bottom = '';
    } else {
      elements.container.removeAttribute('data-docked');
      elements.container.style.left = state.position.x + 'px';
      elements.container.style.top = state.position.y + 'px';
      elements.container.style.right = '';
      elements.container.style.bottom = '';
    }
  }

  function setMode(mode) {
    state.mode = mode;
    elements.container.setAttribute('data-mode', mode);

    // Update size based on mode
    switch (mode) {
      case 'orb':
        state.size = { width: 60, height: 60 };
        break;
      case 'mini':
        state.size = { width: 100, height: 60 };
        break;
      case 'compact':
        state.size = { width: 200, height: 300 };
        break;
      case 'full':
        state.size = { width: 380, height: 520 };
        break;
    }

    savePosition();
  }

  function getModeFromWidth(width) {
    if (width >= CONFIG.sizes.full) return 'full';
    if (width >= CONFIG.sizes.compact) return 'compact';
    if (width >= CONFIG.sizes.mini) return 'mini';
    return 'orb';
  }

  // ═══════════════════════════════════════════════════════════
  // DRAG & RESIZE
  // ═══════════════════════════════════════════════════════════

  function bindDragEvents() {
    if (!CONFIG.draggable) return;

    // Drag from handle (compact/full modes)
    elements.dragHandle.addEventListener('mousedown', startDrag);
    elements.dragHandle.addEventListener('touchstart', startDrag, { passive: false });

    // Drag from orb/mini (click to expand, drag to move)
    elements.orbMode.addEventListener('mousedown', handleOrbInteraction);
    elements.miniMode.addEventListener('mousedown', handleOrbInteraction);

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
  }

  let clickStartTime = 0;
  let clickStartPos = { x: 0, y: 0 };

  function handleOrbInteraction(e) {
    clickStartTime = Date.now();
    clickStartPos = { x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY };
    startDrag(e);
  }

  function startDrag(e) {
    if (state.isResizing) return;

    e.preventDefault();
    state.isDragging = true;

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const rect = elements.container.getBoundingClientRect();

    state.dragOffset = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    elements.container.classList.add('dragging');
    state.docked = null;
    applyPosition();
  }

  function onDrag(e) {
    if (!state.isDragging) return;
    e.preventDefault();

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    let newX = clientX - state.dragOffset.x;
    let newY = clientY - state.dragOffset.y;

    // Boundary checks
    const maxX = window.innerWidth - state.size.width;
    const maxY = window.innerHeight - state.size.height;
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    state.position = { x: newX, y: newY };
    elements.container.style.left = newX + 'px';
    elements.container.style.top = newY + 'px';
  }

  function endDrag(e) {
    if (!state.isDragging) return;

    const wasDragging = Date.now() - clickStartTime > 200 ||
      Math.abs((e.clientX || 0) - clickStartPos.x) > 10 ||
      Math.abs((e.clientY || 0) - clickStartPos.y) > 10;

    state.isDragging = false;
    elements.container.classList.remove('dragging');

    // Check for edge snap
    if (CONFIG.snapToEdge) {
      checkEdgeSnap();
    }

    // If it was a click (not drag) on orb/mini, expand
    if (!wasDragging && (state.mode === 'orb' || state.mode === 'mini')) {
      cycleMode();
    }

    savePosition();
  }

  function checkEdgeSnap() {
    const t = CONFIG.snapThreshold;
    const x = state.position.x;
    const y = state.position.y;
    const w = state.size.width;
    const h = state.size.height;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Check corners
    if (x < t && y < t) {
      state.docked = 'top-left';
    } else if (x + w > vw - t && y < t) {
      state.docked = 'top-right';
    } else if (x < t && y + h > vh - t) {
      state.docked = 'bottom-left';
    } else if (x + w > vw - t && y + h > vh - t) {
      state.docked = 'bottom-right';
    }

    if (state.docked) {
      applyPosition();
    }
  }

  function bindResizeEvents() {
    if (!CONFIG.resizable) return;

    elements.resizeHandle.addEventListener('mousedown', startResize);
    elements.resizeHandle.addEventListener('touchstart', startResize, { passive: false });

    document.addEventListener('mousemove', onResize);
    document.addEventListener('touchmove', onResize, { passive: false });
    document.addEventListener('mouseup', endResize);
    document.addEventListener('touchend', endResize);
  }

  function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    state.isResizing = true;
    state.docked = null;
    elements.container.classList.add('resizing');
    applyPosition();
  }

  function onResize(e) {
    if (!state.isResizing) return;
    e.preventDefault();

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const rect = elements.container.getBoundingClientRect();

    let newWidth = clientX - rect.left;
    let newHeight = clientY - rect.top;

    // Clamp to min/max
    newWidth = Math.max(CONFIG.minWidth, Math.min(newWidth, 600));
    newHeight = Math.max(CONFIG.minHeight, Math.min(newHeight, 800));

    // Determine mode from width
    const newMode = getModeFromWidth(newWidth);

    if (newMode !== state.mode) {
      setMode(newMode);
    } else {
      // Apply custom size for full/compact modes
      if (state.mode === 'full' || state.mode === 'compact') {
        elements.container.style.width = newWidth + 'px';
        elements.container.style.height = newHeight + 'px';
        state.size = { width: newWidth, height: newHeight };
      }
    }
  }

  function endResize() {
    if (!state.isResizing) return;
    state.isResizing = false;
    elements.container.classList.remove('resizing');
    savePosition();
  }

  // ═══════════════════════════════════════════════════════════
  // MODE CYCLING
  // ═══════════════════════════════════════════════════════════

  function cycleMode() {
    const modes = ['orb', 'mini', 'compact', 'full'];
    const currentIndex = modes.indexOf(state.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);

    // Greet on first full expand
    if (modes[nextIndex] === 'full' && !state.hasGreeted) {
      setTimeout(greet, 400);
      state.hasGreeted = true;
    }

    // Focus input on full mode
    if (modes[nextIndex] === 'full') {
      setTimeout(() => elements.input?.focus(), 400);
    }
  }

  function expand() {
    setMode('full');
    if (!state.hasGreeted) {
      setTimeout(greet, 400);
      state.hasGreeted = true;
    }
    setTimeout(() => elements.input?.focus(), 400);
  }

  function minimize() {
    setMode('compact');
  }

  function collapse() {
    setMode('orb');
  }

  // ═══════════════════════════════════════════════════════════
  // CHAT FUNCTIONS
  // ═══════════════════════════════════════════════════════════

  function bindChatEvents() {
    // Full mode
    elements.sendBtn?.addEventListener('click', sendMessage);
    elements.input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    elements.minimizeBtn?.addEventListener('click', minimize);
    elements.collapseBtn?.addEventListener('click', collapse);

    elements.quickBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.input.value = btn.textContent;
        sendMessage();
      });
    });

    // Compact mode
    elements.compactSend?.addEventListener('click', sendCompactMessage);
    elements.compactInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendCompactMessage();
      }
    });

    elements.expandBtn?.addEventListener('click', expand);
  }

  function greet() {
    const greeting = CONFIG.greetings[Math.floor(Math.random() * CONFIG.greetings.length)];
    addMessage('assistant', greeting, true);
  }

  function addMessage(role, content, animate = true) {
    // Add to full mode
    if (elements.messages) {
      const messageHtml = TEMPLATES.message(role, '');
      elements.messages.insertAdjacentHTML('beforeend', messageHtml);
      const messageEl = elements.messages.lastElementChild;
      const contentEl = messageEl.querySelector('.araya-message-content');

      if (animate && role === 'assistant') {
        typeText(contentEl, content);
      } else {
        contentEl.textContent = content;
      }

      elements.messages.parentElement.scrollTop = elements.messages.parentElement.scrollHeight;
    }

    // Add to compact mode
    if (elements.compactMessages) {
      const compactHtml = TEMPLATES.compactMessage(role, content);
      elements.compactMessages.insertAdjacentHTML('beforeend', compactHtml);
      elements.compactMessages.scrollTop = elements.compactMessages.scrollHeight;
    }

    // Store
    state.messages.push({ role, content, timestamp: Date.now() });
    if (CONFIG.persistChat) saveChat();
  }

  async function typeText(element, text) {
    state.isTyping = true;
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      element.parentElement?.parentElement?.scrollTo?.(0, element.parentElement.parentElement.scrollHeight);
      await sleep(CONFIG.typingSpeed);
    }
    state.isTyping = false;
  }

  function showTyping() {
    elements.typingIndicator?.classList.add('active');
  }

  function hideTyping() {
    elements.typingIndicator?.classList.remove('active');
  }

  async function sendMessage() {
    const message = elements.input?.value.trim();
    if (!message || state.isTyping) return;

    addMessage('user', message, false);
    elements.input.value = '';
    showTyping();

    try {
      const response = await callAPI(message);
      hideTyping();
      addMessage('assistant', response?.reply || "The void whispers back... try again.", true);
    } catch (error) {
      console.error('ARAYA API Error:', error);
      hideTyping();
      addMessage('assistant', "Connection lost. Trying to re-establish...", true);
    }
  }

  async function sendCompactMessage() {
    const message = elements.compactInput?.value.trim();
    if (!message || state.isTyping) return;

    addMessage('user', message, false);
    elements.compactInput.value = '';

    try {
      const response = await callAPI(message);
      addMessage('assistant', response?.reply || "...", false);
    } catch (error) {
      addMessage('assistant', "Error.", false);
    }
  }

  async function callAPI(message) {
    const response = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId: state.sessionId,
        history: state.messages.slice(-10)
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    if (data.sessionId) state.sessionId = data.sessionId;
    return data;
  }

  // ═══════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════

  function savePosition() {
    if (!CONFIG.rememberPosition) return;
    try {
      localStorage.setItem('araya_position', JSON.stringify({
        position: state.position,
        size: state.size,
        mode: state.mode,
        docked: state.docked
      }));
    } catch (e) {}
  }

  function loadPosition() {
    if (!CONFIG.rememberPosition) return null;
    try {
      const saved = localStorage.getItem('araya_position');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function saveChat() {
    try {
      localStorage.setItem('araya_chat', JSON.stringify({
        messages: state.messages,
        sessionId: state.sessionId,
        hasGreeted: state.hasGreeted
      }));
    } catch (e) {}
  }

  function loadChat() {
    try {
      const saved = localStorage.getItem('araya_chat');
      if (saved) {
        const data = JSON.parse(saved);
        state.messages = data.messages || [];
        state.sessionId = data.sessionId;
        state.hasGreeted = data.hasGreeted || false;

        // Restore to UI
        state.messages.forEach(msg => {
          if (elements.messages) {
            const html = TEMPLATES.message(msg.role, msg.content);
            elements.messages.insertAdjacentHTML('beforeend', html);
          }
          if (elements.compactMessages) {
            const compactHtml = TEMPLATES.compactMessage(msg.role, msg.content);
            elements.compactMessages.insertAdjacentHTML('beforeend', compactHtml);
          }
        });
      }
    } catch (e) {}
  }

  function clearChat() {
    state.messages = [];
    state.sessionId = null;
    state.hasGreeted = false;
    if (elements.messages) elements.messages.innerHTML = '';
    if (elements.compactMessages) elements.compactMessages.innerHTML = '';
    localStorage.removeItem('araya_chat');
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════

  return {
    init(options = {}) {
      Object.assign(CONFIG, options);
      injectStyles();
      if (!createWidget()) return false;
      bindDragEvents();
      bindResizeEvents();
      bindChatEvents();
      if (CONFIG.persistChat) loadChat();
      if (!state.sessionId) {
        state.sessionId = 'araya_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
      console.log('ARAYA Responsive Widget initialized');
      return true;
    },

    expand,
    minimize,
    collapse,
    setMode,
    cycleMode,
    clearChat,
    getState: () => ({ ...state }),

    send(message) {
      if (elements.input) {
        elements.input.value = message;
        sendMessage();
      }
    },

    configure(options) {
      Object.assign(CONFIG, options);
    }
  };
})();

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('araya-widget')) {
    ArayaWidget.init();
  }
});

/*
 * ARAYA RESPONSIVE WIDGET
 * "Drag me anywhere. I adapt."
 * THE PATTERN NEVER LIES
 */
