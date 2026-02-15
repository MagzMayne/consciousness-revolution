/**
 * FILE TRANSFER MODULE - Send Anything, Any Size
 * Works via: Direct upload, Supabase Storage, or P2P WebRTC
 * Creates inbox notifications for recipients
 *
 * Usage:
 *   FileTransfer.send(file, { to: 'tiger', from: 'commander' })
 *   FileTransfer.checkInbox('commander')
 */

const FileTransfer = {
    // Configuration
    config: {
        supabaseUrl: null,
        supabaseKey: null,
        maxDirectSize: 50 * 1024 * 1024, // 50MB for direct transfer
        chunkSize: 5 * 1024 * 1024, // 5MB chunks
        storageBackend: 'supabase', // 'supabase', 'file.io', 'local'
    },

    // Initialize with Supabase credentials
    init(supabaseUrl, supabaseKey) {
        this.config.supabaseUrl = supabaseUrl;
        this.config.supabaseKey = supabaseKey;
        console.log('FileTransfer initialized');
        return this;
    },

    // Send a file to a recipient
    async send(file, options = {}) {
        const {
            to = 'commander',
            from = 'anonymous',
            message = '',
            priority = 'normal',
            onProgress = null
        } = options;

        const transfer = {
            id: this.generateId(),
            filename: file.name,
            size: file.size,
            type: file.type,
            from,
            to,
            message,
            priority,
            status: 'uploading',
            progress: 0,
            createdAt: new Date().toISOString(),
            url: null,
            expiresAt: null
        };

        console.log(`Sending ${file.name} (${this.formatSize(file.size)}) to ${to}...`);

        try {
            // Choose backend based on file size and config
            if (file.size > this.config.maxDirectSize) {
                // Large file - use chunked upload to Supabase
                transfer.url = await this.uploadChunked(file, transfer.id, onProgress);
            } else if (this.config.supabaseUrl) {
                // Medium file - direct to Supabase
                transfer.url = await this.uploadToSupabase(file, transfer.id, onProgress);
            } else {
                // Fallback to file.io (temporary hosting)
                transfer.url = await this.uploadToFileIO(file, onProgress);
                transfer.expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days
            }

            transfer.status = 'complete';
            transfer.progress = 100;

            // Create inbox notification for recipient
            await this.createInboxEntry(transfer);

            console.log(`Transfer complete: ${transfer.url}`);
            return transfer;

        } catch (error) {
            transfer.status = 'failed';
            transfer.error = error.message;
            console.error('Transfer failed:', error);
            throw error;
        }
    },

    // Upload to Supabase Storage
    async uploadToSupabase(file, transferId, onProgress) {
        if (!this.config.supabaseUrl || !this.config.supabaseKey) {
            throw new Error('Supabase not configured');
        }

        const path = `transfers/${transferId}/${file.name}`;
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
            `${this.config.supabaseUrl}/storage/v1/object/file-transfers/${path}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.supabaseKey}`,
                },
                body: file
            }
        );

        if (!response.ok) {
            throw new Error(`Supabase upload failed: ${response.statusText}`);
        }

        // Return public URL
        return `${this.config.supabaseUrl}/storage/v1/object/public/file-transfers/${path}`;
    },

    // Chunked upload for large files
    async uploadChunked(file, transferId, onProgress) {
        const chunks = Math.ceil(file.size / this.config.chunkSize);
        const uploadedChunks = [];

        for (let i = 0; i < chunks; i++) {
            const start = i * this.config.chunkSize;
            const end = Math.min(start + this.config.chunkSize, file.size);
            const chunk = file.slice(start, end);

            const chunkBlob = new Blob([chunk], { type: file.type });
            const chunkFile = new File([chunkBlob], `${file.name}.part${i}`, { type: file.type });

            // Upload chunk
            const chunkPath = `transfers/${transferId}/chunks/${i}`;
            await this.uploadToSupabase(chunkFile, `${transferId}/chunk_${i}`, null);

            uploadedChunks.push(chunkPath);

            const progress = Math.round(((i + 1) / chunks) * 100);
            if (onProgress) onProgress(progress);
        }

        // Create manifest file
        const manifest = {
            filename: file.name,
            totalSize: file.size,
            type: file.type,
            chunks: uploadedChunks,
            createdAt: new Date().toISOString()
        };

        // Store manifest
        const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
        const manifestFile = new File([manifestBlob], 'manifest.json', { type: 'application/json' });
        await this.uploadToSupabase(manifestFile, `${transferId}/manifest`, null);

        return `${this.config.supabaseUrl}/storage/v1/object/public/file-transfers/transfers/${transferId}/manifest.json`;
    },

    // Fallback: Upload to file.io (no account needed)
    async uploadToFileIO(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://file.io/?expires=14d', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('file.io upload failed');
        }

        const data = await response.json();
        if (onProgress) onProgress(100);

        return data.link;
    },

    // Create inbox entry for recipient
    async createInboxEntry(transfer) {
        const entry = {
            id: transfer.id,
            type: 'file_transfer',
            from: transfer.from,
            to: transfer.to,
            subject: `File: ${transfer.filename}`,
            message: transfer.message || `${transfer.from} sent you a file`,
            url: transfer.url,
            size: transfer.size,
            filename: transfer.filename,
            priority: transfer.priority,
            read: false,
            createdAt: transfer.createdAt,
            expiresAt: transfer.expiresAt
        };

        // Store in localStorage for now (will be Supabase later)
        const inboxKey = `inbox_${transfer.to}`;
        const inbox = JSON.parse(localStorage.getItem(inboxKey) || '[]');
        inbox.unshift(entry);
        localStorage.setItem(inboxKey, JSON.stringify(inbox));

        // If Supabase is configured, also store there
        if (this.config.supabaseUrl) {
            try {
                await fetch(`${this.config.supabaseUrl}/rest/v1/inbox`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(entry)
                });
            } catch (e) {
                console.warn('Failed to store in Supabase inbox:', e);
            }
        }

        // Dispatch event for real-time UI updates
        window.dispatchEvent(new CustomEvent('inbox-update', { detail: entry }));

        return entry;
    },

    // Check inbox for a user
    checkInbox(userId) {
        const inboxKey = `inbox_${userId}`;
        const inbox = JSON.parse(localStorage.getItem(inboxKey) || '[]');
        return inbox;
    },

    // Get unread count
    getUnreadCount(userId) {
        const inbox = this.checkInbox(userId);
        return inbox.filter(item => !item.read).length;
    },

    // Mark item as read
    markRead(userId, itemId) {
        const inboxKey = `inbox_${userId}`;
        const inbox = JSON.parse(localStorage.getItem(inboxKey) || '[]');
        const item = inbox.find(i => i.id === itemId);
        if (item) {
            item.read = true;
            localStorage.setItem(inboxKey, JSON.stringify(inbox));
        }
        return item;
    },

    // Download a file from inbox
    async download(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            // Check if it's a manifest (chunked file)
            if (url.endsWith('manifest.json')) {
                const manifest = JSON.parse(await blob.text());
                return await this.downloadChunked(manifest);
            }

            // Direct download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);

            return true;
        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    },

    // Download and reassemble chunked file
    async downloadChunked(manifest) {
        const chunks = [];

        for (const chunkPath of manifest.chunks) {
            const response = await fetch(`${this.config.supabaseUrl}/storage/v1/object/public/file-transfers/${chunkPath}`);
            const chunk = await response.blob();
            chunks.push(chunk);
        }

        // Reassemble
        const blob = new Blob(chunks, { type: manifest.type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = manifest.filename;
        link.click();
        URL.revokeObjectURL(link.href);

        return true;
    },

    // Utility functions
    generateId() {
        return 'ft_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return bytes.toFixed(1) + ' ' + units[i];
    }
};

// Inbox Widget Component
class InboxWidget {
    constructor(userId, containerId) {
        this.userId = userId;
        this.container = document.getElementById(containerId);
        this.render();

        // Listen for updates
        window.addEventListener('inbox-update', () => this.render());
    }

    render() {
        const inbox = FileTransfer.checkInbox(this.userId);
        const unread = inbox.filter(i => !i.read).length;

        this.container.innerHTML = `
            <div style="padding: 12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="color:#0ff; font-weight:600;">📥 INBOX</span>
                    ${unread > 0 ? `<span style="background:#f00; color:#fff; padding:2px 8px; border-radius:10px; font-size:0.8em;">${unread}</span>` : ''}
                </div>
                <div style="max-height:300px; overflow-y:auto;">
                    ${inbox.length === 0 ? '<div style="color:#666; text-align:center;">No messages</div>' : ''}
                    ${inbox.slice(0, 10).map(item => `
                        <div class="inbox-item" data-id="${item.id}" style="
                            padding: 10px;
                            margin-bottom: 8px;
                            background: ${item.read ? 'rgba(0,0,0,0.3)' : 'rgba(0,255,255,0.1)'};
                            border: 1px solid ${item.read ? '#333' : '#0ff'};
                            border-radius: 8px;
                            cursor: pointer;
                        ">
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#fff; font-weight:${item.read ? '400' : '600'};">${item.subject}</span>
                                <span style="color:#666; font-size:0.8em;">${this.timeAgo(item.createdAt)}</span>
                            </div>
                            <div style="color:#888; font-size:0.85em; margin-top:4px;">
                                From: ${item.from} ${item.size ? `• ${FileTransfer.formatSize(item.size)}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Click handlers
        this.container.querySelectorAll('.inbox-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                const item = inbox.find(i => i.id === id);
                if (item) {
                    FileTransfer.markRead(this.userId, id);
                    if (item.type === 'file_transfer') {
                        FileTransfer.download(item.url, item.filename);
                    }
                    this.render();
                }
            });
        });
    }

    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        return Math.floor(seconds / 86400) + 'd ago';
    }
}

// File Send UI Component
class FileSendUI {
    constructor(fromUser, containerId) {
        this.fromUser = fromUser;
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div style="padding: 16px;">
                <h3 style="color:#0ff; margin:0 0 16px 0;">📤 SEND FILE</h3>

                <div style="margin-bottom:12px;">
                    <label style="color:#888; font-size:0.9em;">To:</label>
                    <select id="send-to" style="
                        width: 100%;
                        padding: 10px;
                        background: rgba(0,0,0,0.5);
                        border: 1px solid #0ff;
                        border-radius: 8px;
                        color: #fff;
                        margin-top: 4px;
                    ">
                        <option value="commander">Commander</option>
                        <option value="tiger">Tiger</option>
                        <option value="teddy">Teddy</option>
                        <option value="maggie">Maggie</option>
                        <option value="josh">Josh</option>
                    </select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="color:#888; font-size:0.9em;">Message (optional):</label>
                    <input type="text" id="send-message" placeholder="Add a note..." style="
                        width: 100%;
                        padding: 10px;
                        background: rgba(0,0,0,0.5);
                        border: 1px solid #333;
                        border-radius: 8px;
                        color: #fff;
                        margin-top: 4px;
                        box-sizing: border-box;
                    ">
                </div>

                <div id="drop-zone" style="
                    border: 2px dashed #0ff;
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-bottom: 12px;
                ">
                    <div style="font-size: 3em; margin-bottom: 8px;">📁</div>
                    <div style="color: #0ff;">Drop files here or click to browse</div>
                    <div style="color: #666; font-size: 0.9em; margin-top: 4px;">Any size supported</div>
                    <input type="file" id="file-input" multiple style="display: none;">
                </div>

                <div id="upload-progress" style="display: none;">
                    <div style="background: #333; border-radius: 4px; height: 8px; overflow: hidden;">
                        <div id="progress-bar" style="background: #0ff; height: 100%; width: 0%; transition: width 0.3s;"></div>
                    </div>
                    <div id="progress-text" style="color: #888; font-size: 0.9em; text-align: center; margin-top: 8px;"></div>
                </div>

                <div id="send-result" style="margin-top: 12px;"></div>
            </div>
        `;

        const dropZone = this.container.querySelector('#drop-zone');
        const fileInput = this.container.querySelector('#file-input');

        // Click to browse
        dropZone.addEventListener('click', () => fileInput.click());

        // File selected
        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#0f0';
            dropZone.style.background = 'rgba(0,255,0,0.1)';
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '#0ff';
            dropZone.style.background = 'none';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#0ff';
            dropZone.style.background = 'none';
            this.handleFiles(e.dataTransfer.files);
        });
    }

    async handleFiles(files) {
        const to = this.container.querySelector('#send-to').value;
        const message = this.container.querySelector('#send-message').value;
        const progressDiv = this.container.querySelector('#upload-progress');
        const progressBar = this.container.querySelector('#progress-bar');
        const progressText = this.container.querySelector('#progress-text');
        const resultDiv = this.container.querySelector('#send-result');

        progressDiv.style.display = 'block';
        resultDiv.innerHTML = '';

        for (const file of files) {
            progressText.textContent = `Uploading ${file.name}...`;
            progressBar.style.width = '0%';

            try {
                const result = await FileTransfer.send(file, {
                    to,
                    from: this.fromUser,
                    message,
                    onProgress: (pct) => {
                        progressBar.style.width = pct + '%';
                        progressText.textContent = `Uploading ${file.name}... ${pct}%`;
                    }
                });

                resultDiv.innerHTML += `
                    <div style="color:#0f0; padding:8px; background:rgba(0,255,0,0.1); border-radius:8px; margin-bottom:8px;">
                        ✓ Sent ${file.name} to ${to}
                    </div>
                `;
            } catch (error) {
                resultDiv.innerHTML += `
                    <div style="color:#f00; padding:8px; background:rgba(255,0,0,0.1); border-radius:8px; margin-bottom:8px;">
                        ✗ Failed: ${error.message}
                    </div>
                `;
            }
        }

        progressDiv.style.display = 'none';
    }
}

// Export
window.FileTransfer = FileTransfer;
window.InboxWidget = InboxWidget;
window.FileSendUI = FileSendUI;
