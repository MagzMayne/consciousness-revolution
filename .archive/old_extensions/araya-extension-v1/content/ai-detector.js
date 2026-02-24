// Araya AI Interface Detector + Memory Cargo System
// Detects which AI you're on, reads conversations, enables context transfer
// THE CARGO PLANE — carries your project between AIs

(function() {
    'use strict';

    // ========================================
    // AI PLATFORM DEFINITIONS
    // ========================================
    const AI_PLATFORMS = {
        chatgpt: {
            name: 'ChatGPT',
            hostMatch: ['chat.openai.com', 'chatgpt.com'],
            inputSelector: '#prompt-textarea, textarea[data-id="root"]',
            messageSelector: '[data-message-author-role]',
            userMsgAttr: { key: 'data-message-author-role', value: 'user' },
            assistantMsgAttr: { key: 'data-message-author-role', value: 'assistant' },
            sendBtnSelector: 'button[data-testid="send-button"], button[aria-label="Send prompt"]',
            freeLimit: 40,
            limitWindow: '3 hours',
            color: '#10a37f',
            icon: 'G'
        },
        claude: {
            name: 'Claude',
            hostMatch: ['claude.ai'],
            inputSelector: 'div[contenteditable="true"].ProseMirror, div[contenteditable="true"]',
            messageSelector: '[data-testid="user-message"], [data-testid="ai-message"]',
            userMsgAttr: { key: 'data-testid', value: 'user-message' },
            assistantMsgAttr: { key: 'data-testid', value: 'ai-message' },
            sendBtnSelector: 'button[aria-label="Send Message"]',
            freeLimit: 30,
            limitWindow: 'daily',
            color: '#d97706',
            icon: 'C'
        },
        gemini: {
            name: 'Gemini',
            hostMatch: ['gemini.google.com'],
            inputSelector: 'rich-textarea .ql-editor, .input-area textarea, div[contenteditable="true"]',
            messageSelector: 'message-content, .message-row',
            userMsgAttr: null, // Uses class-based detection
            assistantMsgAttr: null,
            sendBtnSelector: 'button.send-button, button[aria-label="Send message"]',
            freeLimit: 999, // Very generous
            limitWindow: 'daily',
            color: '#4285f4',
            icon: 'G'
        },
        deepseek: {
            name: 'DeepSeek',
            hostMatch: ['chat.deepseek.com'],
            inputSelector: 'textarea#chat-input, textarea',
            messageSelector: '.msg-content, .message-item',
            userMsgAttr: null,
            assistantMsgAttr: null,
            sendBtnSelector: 'button.send-btn, button[type="submit"]',
            freeLimit: 999,
            limitWindow: 'daily',
            color: '#4d6bfe',
            icon: 'D'
        },
        perplexity: {
            name: 'Perplexity',
            hostMatch: ['perplexity.ai', 'www.perplexity.ai'],
            inputSelector: 'textarea[placeholder*="Ask"]',
            messageSelector: '.prose, .answer-text',
            userMsgAttr: null,
            assistantMsgAttr: null,
            sendBtnSelector: 'button[aria-label="Submit"]',
            freeLimit: 5,
            limitWindow: '4 hours',
            color: '#20b8cd',
            icon: 'P'
        },
        grok: {
            name: 'Grok',
            hostMatch: ['x.com/i/grok', 'grok.x.ai'],
            inputSelector: 'textarea, div[contenteditable="true"]',
            messageSelector: '.message-content',
            userMsgAttr: null,
            assistantMsgAttr: null,
            sendBtnSelector: 'button[type="submit"]',
            freeLimit: 10,
            limitWindow: '2 hours',
            color: '#1da1f2',
            icon: 'X'
        },
        copilot: {
            name: 'Copilot',
            hostMatch: ['copilot.microsoft.com'],
            inputSelector: 'textarea#userInput, textarea',
            messageSelector: '.response-content',
            userMsgAttr: null,
            assistantMsgAttr: null,
            sendBtnSelector: 'button#submit-button',
            freeLimit: 30,
            limitWindow: 'daily',
            color: '#0078d4',
            icon: 'M'
        }
    };

    // ========================================
    // DETECT CURRENT AI PLATFORM
    // ========================================
    let currentPlatform = null;
    const hostname = window.location.hostname;
    const fullUrl = window.location.href;

    for (const [key, platform] of Object.entries(AI_PLATFORMS)) {
        if (platform.hostMatch.some(h => hostname.includes(h) || fullUrl.includes(h))) {
            currentPlatform = { id: key, ...platform };
            break;
        }
    }

    // Not on an AI platform — bail
    if (!currentPlatform) return;

    console.log(`[Araya Cargo] Detected: ${currentPlatform.name}`);

    // ========================================
    // CONVERSATION READER
    // ========================================
    function readConversation() {
        const messages = [];
        const msgElements = document.querySelectorAll(currentPlatform.messageSelector);

        msgElements.forEach(el => {
            let role = 'unknown';
            let text = el.innerText?.trim() || '';

            if (currentPlatform.userMsgAttr) {
                if (el.getAttribute(currentPlatform.userMsgAttr.key) === currentPlatform.userMsgAttr.value) {
                    role = 'user';
                }
            }
            if (currentPlatform.assistantMsgAttr) {
                if (el.getAttribute(currentPlatform.assistantMsgAttr.key) === currentPlatform.assistantMsgAttr.value) {
                    role = 'assistant';
                }
            }

            // Fallback: class-based detection
            if (role === 'unknown') {
                const classes = el.className || '';
                if (classes.includes('user') || classes.includes('human')) role = 'user';
                else if (classes.includes('assistant') || classes.includes('bot') || classes.includes('ai') || classes.includes('model')) role = 'assistant';
            }

            if (text && text.length > 2) {
                messages.push({
                    role,
                    content: text.substring(0, 3000), // Cap at 3k per message
                    platform: currentPlatform.id
                });
            }
        });

        return messages;
    }

    // ========================================
    // CONTEXT PACKAGER — compress to memory packet
    // ========================================
    function packageContext() {
        const conversation = readConversation();
        if (!conversation.length) return null;

        // Extract the project essence
        const userMessages = conversation.filter(m => m.role === 'user');
        const assistantMessages = conversation.filter(m => m.role === 'assistant');

        // Build context summary
        const lastUserMsg = userMessages[userMessages.length - 1]?.content || '';
        const lastAssistantMsg = assistantMessages[assistantMessages.length - 1]?.content || '';

        // Grab first user message as project intent
        const projectIntent = userMessages[0]?.content || '';

        const packet = {
            id: `pkt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            source: currentPlatform.id,
            sourceName: currentPlatform.name,
            projectIntent: projectIntent.substring(0, 500),
            lastExchange: {
                user: lastUserMsg.substring(0, 1000),
                assistant: lastAssistantMsg.substring(0, 2000)
            },
            messageCount: conversation.length,
            fullHistory: conversation.slice(-20), // Last 20 messages
            summary: `Project from ${currentPlatform.name} (${conversation.length} messages). Last topic: ${lastUserMsg.substring(0, 100)}`
        };

        return packet;
    }

    // ========================================
    // MEMORY INJECTOR — paste context into AI input
    // ========================================
    function injectContext(contextPacket) {
        if (!contextPacket) return false;

        const inputEl = document.querySelector(currentPlatform.inputSelector);
        if (!inputEl) {
            console.warn('[Araya Cargo] No input field found on', currentPlatform.name);
            return false;
        }

        const prompt = buildHandoffPrompt(contextPacket);

        // Different injection methods for different input types
        if (inputEl.tagName === 'TEXTAREA') {
            inputEl.value = prompt;
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (inputEl.getAttribute('contenteditable') === 'true') {
            inputEl.innerHTML = `<p>${prompt.replace(/\n/g, '</p><p>')}</p>`;
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Focus the input
        inputEl.focus();

        return true;
    }

    function buildHandoffPrompt(packet) {
        return `[Continuing project from ${packet.sourceName}]

PROJECT CONTEXT:
${packet.projectIntent}

LAST EXCHANGE:
User: ${packet.lastExchange.user}

${packet.sourceName}'s response: ${packet.lastExchange.assistant.substring(0, 1500)}

---
Please continue this project. Pick up where ${packet.sourceName} left off.`;
    }

    // ========================================
    // ROUND-ROBIN TRACKER
    // ========================================
    const USAGE_KEY = 'araya_ai_usage';

    function getUsage() {
        try {
            const raw = localStorage.getItem(USAGE_KEY);
            if (!raw) return {};
            const data = JSON.parse(raw);
            // Clear stale entries (older than 24h)
            const cutoff = Date.now() - 86400000;
            for (const [key, val] of Object.entries(data)) {
                if (val.lastReset < cutoff) {
                    data[key] = { count: 0, lastReset: Date.now() };
                }
            }
            return data;
        } catch { return {}; }
    }

    function trackMessage() {
        const usage = getUsage();
        if (!usage[currentPlatform.id]) {
            usage[currentPlatform.id] = { count: 0, lastReset: Date.now() };
        }
        usage[currentPlatform.id].count++;
        localStorage.setItem(USAGE_KEY, JSON.stringify(usage));

        // Check if approaching limit
        const count = usage[currentPlatform.id].count;
        const limit = currentPlatform.freeLimit;

        if (count >= limit * 0.8) {
            suggestNextAI(count, limit);
        }

        return usage;
    }

    function suggestNextAI(count, limit) {
        const usage = getUsage();
        const remaining = limit - count;

        // Find AI with most remaining capacity
        let bestAI = null;
        let bestCapacity = 0;

        for (const [id, platform] of Object.entries(AI_PLATFORMS)) {
            if (id === currentPlatform.id) continue;
            const used = usage[id]?.count || 0;
            const capacity = platform.freeLimit - used;
            if (capacity > bestCapacity) {
                bestCapacity = capacity;
                bestAI = { id, ...platform };
            }
        }

        if (bestAI) {
            showCargoNotification(
                `${remaining} messages left on ${currentPlatform.name}`,
                `${bestAI.name} has ~${bestCapacity} messages available`,
                bestAI
            );
        }
    }

    function getAIUrl(platformId) {
        const urls = {
            chatgpt: 'https://chat.openai.com/',
            claude: 'https://claude.ai/new',
            gemini: 'https://gemini.google.com/',
            deepseek: 'https://chat.deepseek.com/',
            perplexity: 'https://www.perplexity.ai/',
            grok: 'https://x.com/i/grok',
            copilot: 'https://copilot.microsoft.com/'
        };
        return urls[platformId] || '#';
    }

    // ========================================
    // CARGO UI — floating notification bar
    // ========================================
    function createCargoBar() {
        const bar = document.createElement('div');
        bar.id = 'araya-cargo-bar';
        bar.innerHTML = `
            <div class="acb-inner">
                <div class="acb-logo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    <span class="acb-name">ARAYA</span>
                </div>
                <div class="acb-platform">
                    <span class="acb-dot" style="background:${currentPlatform.color}"></span>
                    <span>${currentPlatform.name}</span>
                    <span class="acb-count" id="acb-msg-count">0</span>
                </div>
                <div class="acb-actions">
                    <button class="acb-btn acb-capture" id="acb-capture" title="Capture conversation">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/></svg>
                    </button>
                    <button class="acb-btn acb-hop" id="acb-hop" title="Hop to next AI">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                        <span>Next AI</span>
                    </button>
                    <button class="acb-btn acb-close" id="acb-close" title="Hide">&times;</button>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #araya-cargo-bar {
                position: fixed; bottom: 10px; left: 50%; transform: translateX(-50%);
                z-index: 99999; font-family: 'Segoe UI', system-ui, sans-serif;
                animation: acb-slide-up 0.3s ease;
            }
            @keyframes acb-slide-up {
                from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            .acb-inner {
                display: flex; align-items: center; gap: 12px;
                background: rgba(15, 10, 30, 0.95); border: 1px solid rgba(155, 89, 182, 0.4);
                border-radius: 12px; padding: 8px 16px;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            }
            .acb-logo { display: flex; align-items: center; gap: 6px; }
            .acb-name { color: #d4a0ff; font-weight: 700; font-size: 12px; letter-spacing: 1px; }
            .acb-platform { display: flex; align-items: center; gap: 6px; color: #aaa; font-size: 12px; }
            .acb-dot { width: 8px; height: 8px; border-radius: 50%; }
            .acb-count {
                background: rgba(155, 89, 182, 0.3); color: #d4a0ff;
                padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;
            }
            .acb-actions { display: flex; align-items: center; gap: 6px; }
            .acb-btn {
                background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
                color: #ccc; border-radius: 8px; padding: 6px 10px; cursor: pointer;
                font-size: 12px; display: flex; align-items: center; gap: 4px;
                transition: all 0.2s;
            }
            .acb-btn:hover { background: rgba(155, 89, 182, 0.3); color: #fff; border-color: rgba(155, 89, 182, 0.5); }
            .acb-hop { background: rgba(155, 89, 182, 0.2); border-color: rgba(155, 89, 182, 0.4); color: #d4a0ff; }
            .acb-hop:hover { background: rgba(155, 89, 182, 0.4); }
            .acb-close { padding: 6px 8px; font-size: 16px; line-height: 1; }
            #araya-cargo-notification {
                position: fixed; bottom: 60px; left: 50%; transform: translateX(-50%);
                z-index: 100000; background: rgba(15, 10, 30, 0.97);
                border: 1px solid rgba(231, 76, 60, 0.5); border-radius: 12px;
                padding: 12px 20px; color: #fff; font-size: 13px;
                font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                animation: acb-slide-up 0.3s ease;
                display: none;
            }
            .acn-title { color: #e74c3c; font-weight: 700; font-size: 12px; margin-bottom: 4px; }
            .acn-msg { color: #aaa; }
            .acn-action { color: #2ecc71; cursor: pointer; text-decoration: underline; margin-top: 6px; display: inline-block; }
        `;

        document.head.appendChild(style);
        document.body.appendChild(bar);

        // Notification element
        const notif = document.createElement('div');
        notif.id = 'araya-cargo-notification';
        document.body.appendChild(notif);

        // Wire up buttons
        document.getElementById('acb-capture').addEventListener('click', captureAndStore);
        document.getElementById('acb-hop').addEventListener('click', hopToNextAI);
        document.getElementById('acb-close').addEventListener('click', () => {
            bar.style.display = 'none';
        });

        // Update message count
        updateMessageCount();
    }

    function updateMessageCount() {
        const el = document.getElementById('acb-msg-count');
        if (!el) return;
        const usage = getUsage();
        const count = usage[currentPlatform.id]?.count || 0;
        el.textContent = `${count}/${currentPlatform.freeLimit}`;
    }

    function showCargoNotification(title, message, targetAI) {
        const notif = document.getElementById('araya-cargo-notification');
        if (!notif) return;

        notif.innerHTML = `
            <div class="acn-title">${title}</div>
            <div class="acn-msg">${message}</div>
            ${targetAI ? `<span class="acn-action" data-ai="${targetAI.id}">Hop to ${targetAI.name} →</span>` : ''}
        `;
        notif.style.display = 'block';

        const action = notif.querySelector('.acn-action');
        if (action) {
            action.addEventListener('click', () => {
                hopToNextAI(targetAI.id);
            });
        }

        setTimeout(() => { notif.style.display = 'none'; }, 8000);
    }

    // ========================================
    // CORE ACTIONS
    // ========================================

    // Capture current conversation and store as memory packet
    async function captureAndStore() {
        const packet = packageContext();
        if (!packet) {
            showCargoNotification('Nothing to capture', 'Start a conversation first.', null);
            return;
        }

        // Store in chrome.storage
        chrome.storage.local.get(['araya_packets'], (result) => {
            const packets = result.araya_packets || [];
            packets.push(packet);
            // Keep last 50 packets
            while (packets.length > 50) packets.shift();
            chrome.storage.local.set({ araya_packets: packets });
        });

        // Also store as latest for quick hop
        chrome.storage.local.set({ araya_latest_packet: packet });

        showCargoNotification(
            'Context captured!',
            `${packet.messageCount} messages from ${packet.sourceName} saved. Ready to hop.`,
            null
        );

        // Notify service worker
        chrome.runtime.sendMessage({
            type: 'CONTEXT_CAPTURED',
            packet: packet
        });
    }

    // Hop to next AI with context
    function hopToNextAI(specificAI) {
        // First capture current context
        const packet = packageContext();
        if (packet) {
            chrome.storage.local.set({ araya_latest_packet: packet });
        }

        const usage = getUsage();

        // Find best next AI
        let targetId = specificAI;
        if (!targetId) {
            let bestCapacity = 0;
            for (const [id, platform] of Object.entries(AI_PLATFORMS)) {
                if (id === currentPlatform.id) continue;
                const used = usage[id]?.count || 0;
                const capacity = platform.freeLimit - used;
                if (capacity > bestCapacity) {
                    bestCapacity = capacity;
                    targetId = id;
                }
            }
        }

        if (!targetId) {
            showCargoNotification('All AIs maxed!', 'Wait for limits to reset, or use Araya offline mode.', null);
            return;
        }

        // Store pending injection flag
        chrome.storage.local.set({
            araya_pending_injection: true,
            araya_injection_target: targetId
        });

        // Open the next AI
        const url = getAIUrl(targetId);
        chrome.runtime.sendMessage({
            type: 'HOP_TO_AI',
            targetId: targetId,
            url: url,
            packet: packet
        });
    }

    // Check if we should inject context (arriving from a hop)
    function checkPendingInjection() {
        chrome.storage.local.get(['araya_pending_injection', 'araya_injection_target', 'araya_latest_packet'], (result) => {
            if (result.araya_pending_injection && result.araya_injection_target === currentPlatform.id) {
                // Clear the flag
                chrome.storage.local.set({ araya_pending_injection: false });

                // Wait for page to fully load, then inject
                setTimeout(() => {
                    const packet = result.araya_latest_packet;
                    if (packet) {
                        const success = injectContext(packet);
                        if (success) {
                            showCargoNotification(
                                `Context loaded from ${packet.sourceName}!`,
                                'Your project is ready. Hit send to continue.',
                                null
                            );
                        }
                    }
                }, 2000); // Give AI interface time to render
            }
        });
    }

    // ========================================
    // WATCH FOR USER MESSAGES (track usage)
    // ========================================
    function watchForMessages() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    // Check if new message appeared
                    if (node.matches?.(currentPlatform.messageSelector) ||
                        node.querySelector?.(currentPlatform.messageSelector)) {
                        trackMessage();
                        updateMessageCount();
                    }
                }
            }
        });

        const chatContainer = document.querySelector('main') || document.body;
        observer.observe(chatContainer, { childList: true, subtree: true });
    }

    // ========================================
    // LISTEN FOR EXTENSION MESSAGES
    // ========================================
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'GET_CONVERSATION') {
            sendResponse({ conversation: readConversation(), platform: currentPlatform.id });
        }

        if (message.type === 'INJECT_CONTEXT') {
            const success = injectContext(message.packet);
            sendResponse({ success });
        }

        if (message.type === 'GET_AI_STATUS') {
            const usage = getUsage();
            sendResponse({
                platform: currentPlatform.id,
                name: currentPlatform.name,
                used: usage[currentPlatform.id]?.count || 0,
                limit: currentPlatform.freeLimit,
                color: currentPlatform.color
            });
        }
    });

    // ========================================
    // INITIALIZE
    // ========================================
    function init() {
        console.log(`[Araya Cargo] Active on ${currentPlatform.name}`);
        createCargoBar();
        watchForMessages();
        checkPendingInjection();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
