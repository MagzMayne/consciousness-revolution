// RootIB: RB-20260319142113-F515B190
// ═══════════════════════════════════════════════════════════════
// TEAM MESSAGE WIDGET
// Drop this into any dashboard to receive Commander messages
// Usage: <script src="/js/team-message-widget.js" data-user="josh_serrano"></script>
// Created: 2026-02-18
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';

    // Get user ID from script tag
    const scriptTag = document.currentScript || document.querySelector('script[data-user]');
    const userId = scriptTag?.getAttribute('data-user') || 'unknown';
    const pollInterval = parseInt(scriptTag?.getAttribute('data-poll') || '60000'); // Default: 1 min
    const showNotification = scriptTag?.getAttribute('data-notify') !== 'false';

    const API_BASE = '/.netlify/functions/team-messages';

    // ═══════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════

    const styles = `
        .team-msg-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .team-msg-bell {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .team-msg-bell:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .team-msg-bell svg {
            width: 24px;
            height: 24px;
            fill: white;
        }

        .team-msg-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff4757;
            color: white;
            font-size: 12px;
            font-weight: bold;
            min-width: 20px;
            height: 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: team-msg-pulse 2s infinite;
        }

        @keyframes team-msg-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        .team-msg-dropdown {
            position: absolute;
            top: 60px;
            right: 0;
            width: 350px;
            max-height: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            display: none;
        }

        .team-msg-dropdown.open {
            display: block;
            animation: team-msg-slideIn 0.2s ease-out;
        }

        @keyframes team-msg-slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .team-msg-header {
            padding: 15px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .team-msg-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .team-msg-item {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
        }

        .team-msg-item:hover {
            background: #f8f9fa;
        }

        .team-msg-item.unread {
            background: #f0f4ff;
            border-left: 3px solid #667eea;
        }

        .team-msg-item.priority-urgent {
            border-left: 3px solid #ff4757;
        }

        .team-msg-item.priority-high {
            border-left: 3px solid #ffa502;
        }

        .team-msg-sender {
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }

        .team-msg-time {
            font-size: 11px;
            color: #999;
            margin-left: 10px;
        }

        .team-msg-text {
            color: #555;
            font-size: 13px;
            margin-top: 5px;
            line-height: 1.4;
        }

        .team-msg-empty {
            padding: 40px 20px;
            text-align: center;
            color: #999;
        }

        .team-msg-mark-read {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
        }

        .team-msg-mark-read:hover {
            color: white;
        }
    `;

    // ═══════════════════════════════════════════════════════════════
    // CREATE WIDGET
    // ═══════════════════════════════════════════════════════════════

    function createWidget() {
        // Add styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Create container
        const container = document.createElement('div');
        container.className = 'team-msg-container';
        container.innerHTML = `
            <div class="team-msg-bell" id="teamMsgBell">
                <svg viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                </svg>
                <div class="team-msg-badge" id="teamMsgBadge" style="display: none;">0</div>
            </div>
            <div class="team-msg-dropdown" id="teamMsgDropdown">
                <div class="team-msg-header">
                    <span>Messages</span>
                    <span class="team-msg-mark-read" id="teamMsgMarkRead">Mark all read</span>
                </div>
                <div class="team-msg-list" id="teamMsgList">
                    <div class="team-msg-empty">No messages</div>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Event handlers
        document.getElementById('teamMsgBell').addEventListener('click', toggleDropdown);
        document.getElementById('teamMsgMarkRead').addEventListener('click', markAllRead);

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                document.getElementById('teamMsgDropdown').classList.remove('open');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // FETCH MESSAGES
    // ═══════════════════════════════════════════════════════════════

    let messages = [];

    async function fetchMessages() {
        try {
            const response = await fetch(`${API_BASE}?user=${userId}&unread=false`);
            const data = await response.json();

            if (data.success && data.data) {
                const prevUnread = messages.filter(m => !m.read).length;
                messages = data.data.messages || [];
                const newUnread = messages.filter(m => !m.read).length;

                updateBadge(newUnread);
                renderMessages();

                // Show notification for new messages
                if (showNotification && newUnread > prevUnread) {
                    showNotificationPopup(messages.find(m => !m.read));
                }
            }
        } catch (error) {
            console.error('Failed to fetch team messages:', error);
        }
    }

    function updateBadge(count) {
        const badge = document.getElementById('teamMsgBadge');
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    function renderMessages() {
        const list = document.getElementById('teamMsgList');

        if (messages.length === 0) {
            list.innerHTML = '<div class="team-msg-empty">No messages</div>';
            return;
        }

        list.innerHTML = messages.map(msg => `
            <div class="team-msg-item ${msg.read ? '' : 'unread'} priority-${msg.priority || 'normal'}" data-id="${msg.id}">
                <div>
                    <span class="team-msg-sender">${escapeHtml(msg.sender)}</span>
                    <span class="team-msg-time">${formatTime(msg.created_at)}</span>
                </div>
                <div class="team-msg-text">${escapeHtml(msg.message)}</div>
            </div>
        `).join('');
    }

    // ═══════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════

    function toggleDropdown() {
        const dropdown = document.getElementById('teamMsgDropdown');
        dropdown.classList.toggle('open');

        if (dropdown.classList.contains('open')) {
            fetchMessages(); // Refresh when opening
        }
    }

    async function markAllRead() {
        try {
            await fetch(`${API_BASE}?user=${userId}&mark_read=true`);
            messages.forEach(m => m.read = true);
            updateBadge(0);
            renderMessages();
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    }

    function showNotificationPopup(message) {
        if (!message) return;

        // Browser notification if permitted
        if (Notification.permission === 'granted') {
            new Notification(`Message from ${message.sender}`, {
                body: message.message.substring(0, 100),
                icon: '/favicon.ico'
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    // ═══════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════

    function init() {
        createWidget();
        fetchMessages();

        // Poll for new messages
        setInterval(fetchMessages, pollInterval);

        // Request notification permission
        if (showNotification && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        console.log(`[Team Messages] Widget initialized for: ${userId}`);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
