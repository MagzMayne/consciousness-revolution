// RootIB: RB-20260319142113-ED9CD27C
/**
 * TEAM COMMS WIDGET
 * Embeddable communications for any dashboard
 *
 * Storage Layers:
 * - COMMANDER: Private (only Commander sees)
 * - SHARED: Everyone sees
 * - PERSONAL: Per-user private
 */

const TEAM_COMMS = {
    supabase: null,
    currentUser: null,

    // Initialize with Supabase
    async init() {
        const SUPABASE_URL = 'https://krvwfmblyfkaxqpxpwqm.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydndmbWJseWZrYXhxcHhwd3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzOTE0MjMsImV4cCI6MjA1MTk2NzQyM30.8IFY7vWWF2jXzOvyEJIWid8kh9gOx3h7x-5n7fQgrfQ';

        // Check for supabase
        if (typeof supabase !== 'undefined') {
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }

        // Detect current user
        this.currentUser = this.detectUser();
        console.log('Team Comms initialized for:', this.currentUser);

        return this;
    },

    detectUser() {
        // Check localStorage for identity
        if (localStorage.getItem('araya_commander') === 'true') {
            return { name: 'Commander', role: 'commander', color: '#00ff88' };
        }

        const stored = localStorage.getItem('team_user');
        if (stored) return JSON.parse(stored);

        return { name: 'Guest', role: 'guest', color: '#888' };
    },

    setUser(name, role) {
        const user = { name, role, color: this.roleColors[role] || '#888' };
        localStorage.setItem('team_user', JSON.stringify(user));
        this.currentUser = user;
        return user;
    },

    roleColors: {
        commander: '#00ff88',
        tiger: '#ffa500',
        maggie: '#ff69b4',
        josh: '#00d4ff',
        guest: '#888'
    },

    // Storage Layers
    storage: {
        // Commander-only storage
        async setCommanderOnly(key, value) {
            if (TEAM_COMMS.currentUser?.role !== 'commander') {
                console.warn('Commander-only storage');
                return false;
            }
            localStorage.setItem(`commander_${key}`, JSON.stringify(value));
            return true;
        },

        async getCommanderOnly(key) {
            if (TEAM_COMMS.currentUser?.role !== 'commander') return null;
            const val = localStorage.getItem(`commander_${key}`);
            return val ? JSON.parse(val) : null;
        },

        // Shared storage (everyone)
        async setShared(key, value) {
            // Use Supabase for real shared storage
            if (TEAM_COMMS.supabase) {
                try {
                    await TEAM_COMMS.supabase
                        .from('shared_storage')
                        .upsert({ key, value: JSON.stringify(value), updated_by: TEAM_COMMS.currentUser?.name });
                } catch (e) {
                    console.warn('Supabase unavailable, using localStorage');
                }
            }
            localStorage.setItem(`shared_${key}`, JSON.stringify(value));
            return true;
        },

        async getShared(key) {
            // Try Supabase first
            if (TEAM_COMMS.supabase) {
                try {
                    const { data } = await TEAM_COMMS.supabase
                        .from('shared_storage')
                        .select('value')
                        .eq('key', key)
                        .single();
                    if (data) return JSON.parse(data.value);
                } catch (e) {}
            }
            const val = localStorage.getItem(`shared_${key}`);
            return val ? JSON.parse(val) : null;
        },

        // Personal storage
        async setPersonal(key, value) {
            const userKey = TEAM_COMMS.currentUser?.name || 'guest';
            localStorage.setItem(`personal_${userKey}_${key}`, JSON.stringify(value));
            return true;
        },

        async getPersonal(key) {
            const userKey = TEAM_COMMS.currentUser?.name || 'guest';
            const val = localStorage.getItem(`personal_${userKey}_${key}`);
            return val ? JSON.parse(val) : null;
        }
    },

    // Messages
    messages: [],

    async sendMessage(text, channel = 'general') {
        const msg = {
            id: Date.now(),
            from: this.currentUser?.name || 'Guest',
            text,
            channel,
            timestamp: new Date().toISOString(),
            color: this.currentUser?.color || '#888'
        };

        // Get existing messages
        let messages = await this.storage.getShared(`messages_${channel}`) || [];
        messages.push(msg);

        // Keep last 100
        if (messages.length > 100) messages = messages.slice(-100);

        await this.storage.setShared(`messages_${channel}`, messages);
        this.messages = messages;

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('team-message', { detail: msg }));

        return msg;
    },

    async getMessages(channel = 'general') {
        this.messages = await this.storage.getShared(`messages_${channel}`) || [];
        return this.messages;
    },

    // File sharing
    files: {
        async share(file, visibility = 'shared') {
            // For now, just track metadata
            // Real file upload would go to Supabase Storage
            const fileMeta = {
                id: Date.now(),
                name: file.name,
                size: file.size,
                type: file.type,
                sharedBy: TEAM_COMMS.currentUser?.name,
                visibility,
                timestamp: new Date().toISOString()
            };

            let files = await TEAM_COMMS.storage.getShared('shared_files') || [];
            files.push(fileMeta);
            await TEAM_COMMS.storage.setShared('shared_files', files);

            return fileMeta;
        },

        async list() {
            return await TEAM_COMMS.storage.getShared('shared_files') || [];
        }
    },

    // Render chat widget
    renderWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="background:#1a1a2e;border-radius:12px;padding:15px;border:1px solid #333;font-family:system-ui;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <span style="font-weight:bold;color:#00ff88;">💬 Team Chat</span>
                    <span style="color:#888;font-size:0.8em;">${this.currentUser?.name || 'Guest'}</span>
                </div>
                <div id="tc-messages" style="height:200px;overflow-y:auto;background:#0a0a0a;border-radius:8px;padding:10px;margin-bottom:10px;">
                    <div style="color:#555;text-align:center;">Loading messages...</div>
                </div>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="tc-input" placeholder="Type a message..."
                        style="flex:1;padding:10px;border-radius:6px;border:1px solid #333;background:#0a0a0a;color:#fff;">
                    <button onclick="TEAM_COMMS.sendFromInput()"
                        style="padding:10px 20px;background:#00ff88;color:#000;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">
                        Send
                    </button>
                </div>
            </div>
        `;

        // Load messages
        this.refreshMessages();

        // Enter key to send
        document.getElementById('tc-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendFromInput();
        });

        // Auto-refresh every 5 seconds
        setInterval(() => this.refreshMessages(), 5000);
    },

    async sendFromInput() {
        const input = document.getElementById('tc-input');
        if (!input.value.trim()) return;

        await this.sendMessage(input.value.trim());
        input.value = '';
        this.refreshMessages();
    },

    async refreshMessages() {
        const messages = await this.getMessages();
        const container = document.getElementById('tc-messages');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = '<div style="color:#555;text-align:center;">No messages yet. Say something!</div>';
            return;
        }

        container.innerHTML = messages.slice(-20).map(m => `
            <div style="margin-bottom:8px;">
                <span style="color:${m.color};font-weight:bold;">${m.from}:</span>
                <span style="color:#e0e0e0;">${m.text}</span>
                <span style="color:#555;font-size:0.7em;margin-left:5px;">${new Date(m.timestamp).toLocaleTimeString()}</span>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }
};

// Auto-init when loaded
document.addEventListener('DOMContentLoaded', () => TEAM_COMMS.init());

// Export for module use
if (typeof module !== 'undefined') module.exports = TEAM_COMMS;
