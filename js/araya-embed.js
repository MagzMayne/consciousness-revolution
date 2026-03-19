// RootIB: RB-20260319142113-11804AE8
/**
 * ARAYA EMBEDDED - Full Interface Component
 * The Foundation for Infinity
 *
 * Features:
 * - Full chat with conversation history
 * - File viewer panel
 * - Work window with logs
 * - Cross-page memory (sessionStorage)
 * - Backend sync (Supabase)
 *
 * Pattern: 3 → 7 → 13 → ∞
 */

class ArayaEmbedded {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Araya: Container not found:', containerId);
            return;
        }

        this.options = {
            domain: options.domain || 'unknown',
            height: options.height || '500px',
            showFileViewer: options.showFileViewer !== false,
            showWorkWindow: options.showWorkWindow !== false,
            ...options
        };

        this.state = {
            chatHistory: [],
            workLogs: [],
            currentTab: 'files',
            minimized: false
        };

        this.init();
    }

    init() {
        this.loadState();
        this.render();
        this.bindEvents();
        this.startMemorySync();
        console.log(`🤖 Araya Embedded initialized for ${this.options.domain}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STATE MANAGEMENT - Cross-page persistence via sessionStorage
    // ═══════════════════════════════════════════════════════════════

    loadState() {
        try {
            const saved = sessionStorage.getItem('araya_infinity_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state = { ...this.state, ...data };
                console.log(`🧠 Araya: Loaded ${this.state.chatHistory.length} messages from memory`);
            }
        } catch (e) {
            console.error('Araya: Failed to load state:', e);
        }
    }

    saveState() {
        try {
            sessionStorage.setItem('araya_infinity_state', JSON.stringify(this.state));
        } catch (e) {
            console.error('Araya: Failed to save state:', e);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER - Main UI
    // ═══════════════════════════════════════════════════════════════

    render() {
        const minimizedStyle = this.state.minimized ? 'display:none;' : '';

        this.container.innerHTML = `
            <div class="araya-embedded" style="
                background: linear-gradient(135deg, rgba(10,10,20,0.98), rgba(15,15,30,0.95));
                border: 2px solid rgba(0,255,136,0.6);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0,255,136,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
            ">
                <!-- HEADER -->
                <div class="araya-header" style="
                    padding: 12px 20px;
                    background: linear-gradient(90deg, rgba(0,255,136,0.15), rgba(0,200,255,0.1));
                    border-bottom: 1px solid rgba(0,255,136,0.3);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:1.5rem;">🤖</span>
                        <div>
                            <h3 style="
                                margin: 0;
                                font-family: 'Orbitron', 'Segoe UI', sans-serif;
                                font-size: 1.1rem;
                                color: #00ff88;
                                letter-spacing: 0.15em;
                            ">A R A Y A</h3>
                            <span style="font-size:0.7rem;color:#666;">Domain: ${this.options.domain} | ${this.state.chatHistory.length} messages</span>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="window.arayaInstance.clearMemory()" style="
                            padding: 6px 12px;
                            background: rgba(255,100,100,0.2);
                            border: 1px solid rgba(255,100,100,0.4);
                            border-radius: 6px;
                            color: #ff6666;
                            cursor: pointer;
                            font-size: 0.75rem;
                        ">Clear Memory</button>
                        <button onclick="window.arayaInstance.toggleMinimize()" style="
                            padding: 6px 12px;
                            background: rgba(0,255,136,0.2);
                            border: 1px solid rgba(0,255,136,0.4);
                            border-radius: 6px;
                            color: #00ff88;
                            cursor: pointer;
                            font-size: 0.9rem;
                        ">${this.state.minimized ? '▲ Expand' : '▼ Minimize'}</button>
                    </div>
                </div>

                <!-- MAIN CONTENT -->
                <div class="araya-main" style="
                    display: flex;
                    height: ${this.options.height};
                    ${minimizedStyle}
                ">
                    <!-- LEFT: CHAT PANEL -->
                    <div class="araya-chat-panel" style="
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        min-width: 0;
                        border-right: 1px solid rgba(0,255,136,0.2);
                    ">
                        <!-- Messages -->
                        <div id="araya-messages" class="araya-messages" style="
                            flex: 1;
                            overflow-y: auto;
                            padding: 15px;
                            background: rgba(0,0,0,0.2);
                        ">
                            ${this.renderMessages()}
                        </div>

                        <!-- Input -->
                        <div class="araya-input-area" style="
                            padding: 12px;
                            background: rgba(0,0,0,0.3);
                            border-top: 1px solid rgba(0,255,136,0.2);
                        ">
                            <div style="display:flex;gap:10px;">
                                <input
                                    type="text"
                                    id="araya-embed-input"
                                    placeholder="Ask Araya anything... (Enter to send)"
                                    style="
                                        flex: 1;
                                        padding: 12px 16px;
                                        background: rgba(0,0,0,0.5);
                                        border: 1px solid rgba(0,255,136,0.4);
                                        border-radius: 8px;
                                        color: #fff;
                                        font-size: 0.95rem;
                                        outline: none;
                                        transition: border-color 0.3s;
                                    "
                                    onfocus="this.style.borderColor='#00ff88'"
                                    onblur="this.style.borderColor='rgba(0,255,136,0.4)'"
                                />
                                <button
                                    id="araya-embed-send"
                                    style="
                                        padding: 12px 24px;
                                        background: linear-gradient(135deg, #00ff88, #00cc6a);
                                        border: none;
                                        border-radius: 8px;
                                        color: #000;
                                        font-weight: bold;
                                        cursor: pointer;
                                        font-size: 0.9rem;
                                        transition: transform 0.2s, box-shadow 0.2s;
                                    "
                                    onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 15px rgba(0,255,136,0.4)'"
                                    onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none'"
                                >SEND</button>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT: WORK WINDOW -->
                    ${this.options.showWorkWindow ? this.renderWorkWindow() : ''}
                </div>
            </div>
        `;

        // Store instance globally for button onclick handlers
        window.arayaInstance = this;
    }

    renderMessages() {
        if (this.state.chatHistory.length === 0) {
            return `
                <div style="text-align:center;padding:40px 20px;color:#666;">
                    <div style="font-size:2rem;margin-bottom:15px;">🌀</div>
                    <div style="font-size:1rem;color:#888;margin-bottom:8px;">Welcome to <span style="color:#00ff88;">Infinity</span></div>
                    <div style="font-size:0.85rem;">I remember our conversations across all domains.</div>
                    <div style="font-size:0.75rem;margin-top:15px;color:#555;">Currently in: ${this.options.domain}</div>
                </div>
            `;
        }

        return this.state.chatHistory.map(msg => `
            <div class="araya-message" style="
                margin-bottom: 12px;
                padding: 12px 15px;
                border-radius: 10px;
                background: ${msg.role === 'user' ? 'rgba(0,255,136,0.1)' : 'rgba(0,150,255,0.1)'};
                border-left: 3px solid ${msg.role === 'user' ? '#00ff88' : '#00aaff'};
            ">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:0.7rem;color:${msg.role === 'user' ? '#00ff88' : '#00aaff'};font-weight:bold;">
                        ${msg.role === 'user' ? '👤 YOU' : '🤖 ARAYA'}
                    </span>
                    <span style="font-size:0.65rem;color:#555;">
                        ${msg.domain ? msg.domain + ' • ' : ''}${this.formatTime(msg.timestamp)}
                    </span>
                </div>
                <div style="color:#e0e0e0;font-size:0.9rem;line-height:1.5;">${this.formatMessage(msg.content)}</div>
            </div>
        `).join('');
    }

    renderWorkWindow() {
        return `
            <div class="araya-work-window" style="
                width: 320px;
                background: rgba(5,5,15,0.95);
                display: flex;
                flex-direction: column;
            ">
                <!-- Tabs -->
                <div class="work-tabs" style="
                    display: flex;
                    background: rgba(0,0,0,0.4);
                    border-bottom: 1px solid rgba(255,170,0,0.3);
                ">
                    ${['files', 'code', 'logs'].map(tab => `
                        <button class="work-tab" data-tab="${tab}" style="
                            flex: 1;
                            padding: 10px;
                            background: ${this.state.currentTab === tab ? 'rgba(255,170,0,0.15)' : 'none'};
                            border: none;
                            border-bottom: 2px solid ${this.state.currentTab === tab ? '#ffaa00' : 'transparent'};
                            color: ${this.state.currentTab === tab ? '#ffaa00' : '#666'};
                            cursor: pointer;
                            font-size: 0.75rem;
                            font-family: monospace;
                            text-transform: uppercase;
                        ">${tab}</button>
                    `).join('')}
                </div>

                <!-- Content -->
                <div id="araya-work-content" style="
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    font-family: 'Consolas', monospace;
                    font-size: 0.8rem;
                    color: #aaa;
                ">
                    ${this.renderWorkContent(this.state.currentTab)}
                </div>
            </div>
        `;
    }

    renderWorkContent(tab) {
        switch(tab) {
            case 'files':
                return this.renderFileViewer();
            case 'code':
                return `<pre style="color:#00ff88;margin:0;">// Code execution coming soon...\n// Araya will be able to:\n// - Read files\n// - Edit code\n// - Run commands</pre>`;
            case 'logs':
                return this.renderLogs();
            default:
                return '';
        }
    }

    renderFileViewer() {
        const recentFiles = [
            { name: 'FLIGHT_LOG.md', icon: '📋', domain: '1_COMMAND' },
            { name: 'TODO.md', icon: '✅', domain: '1_COMMAND' },
            { name: 'araya-embed.js', icon: '⚡', domain: '2_BUILD' },
            { name: 'AGENT_R_UPGRADES.json', icon: '📦', domain: '2_BUILD' }
        ];

        return `
            <div style="color:#ffaa00;font-size:0.7rem;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;">
                Recent Files
            </div>
            ${recentFiles.map(f => `
                <div class="file-item" style="
                    padding: 10px 12px;
                    margin-bottom: 6px;
                    background: rgba(0,0,0,0.3);
                    border-left: 2px solid #ffaa00;
                    border-radius: 0 6px 6px 0;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(255,170,0,0.15)';this.style.borderLeftWidth='4px'"
                   onmouseout="this.style.background='rgba(0,0,0,0.3)';this.style.borderLeftWidth='2px'">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span>${f.icon}</span>
                        <span style="color:#fff;">${f.name}</span>
                    </div>
                    <div style="font-size:0.65rem;color:#555;margin-top:3px;">${f.domain}</div>
                </div>
            `).join('')}
            <div style="margin-top:15px;padding:10px;background:rgba(0,255,136,0.05);border-radius:6px;border:1px dashed rgba(0,255,136,0.3);">
                <div style="color:#00ff88;font-size:0.7rem;">💡 Coming Soon</div>
                <div style="color:#666;font-size:0.75rem;margin-top:5px;">Ask Araya to view or edit any file</div>
            </div>
        `;
    }

    renderLogs() {
        if (this.state.workLogs.length === 0) {
            return `<div style="color:#555;text-align:center;padding:20px;">No activity yet...</div>`;
        }

        return this.state.workLogs.slice(-20).reverse().map(log => `
            <div style="
                padding: 6px 10px;
                margin-bottom: 4px;
                background: rgba(0,0,0,0.2);
                border-left: 2px solid ${log.level === 'error' ? '#ff4444' : log.level === 'warn' ? '#ffaa00' : '#00ff88'};
                border-radius: 0 4px 4px 0;
                font-size: 0.75rem;
            ">
                <span style="color:#555;">[${this.formatTime(log.timestamp)}]</span>
                <span style="color:${log.level === 'error' ? '#ff4444' : log.level === 'warn' ? '#ffaa00' : '#888'};">
                    ${log.message}
                </span>
            </div>
        `).join('');
    }

    // ═══════════════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═══════════════════════════════════════════════════════════════

    bindEvents() {
        const sendBtn = document.getElementById('araya-embed-send');
        const input = document.getElementById('araya-embed-input');

        sendBtn?.addEventListener('click', () => this.sendMessage());
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Tab switching
        document.querySelectorAll('.work-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    async sendMessage() {
        const input = document.getElementById('araya-embed-input');
        const message = input.value.trim();

        if (!message) return;

        // Clear input immediately
        input.value = '';

        // Add user message
        this.addMessage('user', message);

        // Show thinking indicator
        const messagesDiv = document.getElementById('araya-messages');
        const thinkingId = 'thinking-' + Date.now();
        messagesDiv.innerHTML += `
            <div id="${thinkingId}" style="
                padding: 12px 15px;
                color: #ffaa00;
                font-style: italic;
                display: flex;
                align-items: center;
                gap: 10px;
            ">
                <span class="thinking-dots">●</span>
                <span>Thinking...</span>
            </div>
        `;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Animate thinking dots
        let dots = 1;
        const dotsInterval = setInterval(() => {
            const el = document.querySelector(`#${thinkingId} .thinking-dots`);
            if (el) {
                dots = (dots % 3) + 1;
                el.textContent = '●'.repeat(dots);
            }
        }, 400);

        try {
            const res = await fetch('/.netlify/functions/araya-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    context: {
                        domain: this.options.domain,
                        page: 'agent_r_embedded',
                        historyLength: this.state.chatHistory.length,
                        recentHistory: this.state.chatHistory.slice(-5)
                    }
                })
            });

            clearInterval(dotsInterval);
            document.getElementById(thinkingId)?.remove();

            const data = await res.json();
            const response = data.response || data.reply || data.message || 'I received your message but had trouble responding.';

            this.addMessage('araya', response);
            this.addLog('info', `Responded to: "${message.substring(0, 25)}..."`);

        } catch (err) {
            clearInterval(dotsInterval);
            document.getElementById(thinkingId)?.remove();
            this.addMessage('araya', `Connection error: ${err.message}. I'll remember this conversation for when we reconnect.`);
            this.addLog('error', `Send failed: ${err.message}`);
        }

        this.saveState();
        input.focus();
    }

    addMessage(role, content) {
        this.state.chatHistory.push({
            role,
            content,
            domain: this.options.domain,
            timestamp: Date.now()
        });

        // Keep last 100 messages
        if (this.state.chatHistory.length > 100) {
            this.state.chatHistory = this.state.chatHistory.slice(-100);
        }

        this.refreshMessages();
        this.saveState();
    }

    addLog(level, message) {
        this.state.workLogs.push({
            level,
            message,
            timestamp: Date.now()
        });

        if (this.state.workLogs.length > 50) {
            this.state.workLogs = this.state.workLogs.slice(-50);
        }

        if (this.state.currentTab === 'logs') {
            const content = document.getElementById('araya-work-content');
            if (content) content.innerHTML = this.renderLogs();
        }
    }

    refreshMessages() {
        const messagesDiv = document.getElementById('araya-messages');
        if (messagesDiv) {
            messagesDiv.innerHTML = this.renderMessages();
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }

    switchTab(tabName) {
        this.state.currentTab = tabName;

        document.querySelectorAll('.work-tab').forEach(tab => {
            const isActive = tab.dataset.tab === tabName;
            tab.style.background = isActive ? 'rgba(255,170,0,0.15)' : 'none';
            tab.style.borderBottomColor = isActive ? '#ffaa00' : 'transparent';
            tab.style.color = isActive ? '#ffaa00' : '#666';
        });

        const content = document.getElementById('araya-work-content');
        if (content) content.innerHTML = this.renderWorkContent(tabName);

        this.saveState();
    }

    toggleMinimize() {
        this.state.minimized = !this.state.minimized;
        this.render();
        this.bindEvents();
        this.saveState();
    }

    clearMemory() {
        if (confirm('Clear all conversation memory? This cannot be undone.')) {
            this.state.chatHistory = [];
            this.state.workLogs = [];
            this.saveState();
            this.refreshMessages();
            this.addLog('warn', 'Memory cleared by user');
            console.log('🧠 Araya: Memory cleared');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatMessage(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00ff88;">$1</strong>')
            .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:3px;color:#ffaa00;">$1</code>')
            .replace(/\n/g, '<br>');
    }

    startMemorySync() {
        // Sync to backend every 60 seconds
        setInterval(() => {
            this.syncToBackend();
        }, 60000);
    }

    async syncToBackend() {
        if (this.state.chatHistory.length === 0) return;

        try {
            await fetch('/.netlify/functions/araya-memory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save',
                    domain: this.options.domain,
                    conversationLength: this.state.chatHistory.length,
                    lastMessage: this.state.chatHistory[this.state.chatHistory.length - 1]
                })
            });
            this.addLog('info', 'Memory synced to cloud');
        } catch (err) {
            // Silent fail - local storage still works
        }
    }
}

// Export globally
window.ArayaEmbedded = ArayaEmbedded;
console.log('✨ Araya Embedded module loaded - Foundation for Infinity');
