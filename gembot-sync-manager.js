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
 * File: gembot-sync-manager.js
 * Declaration ID: IP-387669E7-MLL28ZUY
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GEMBOT SYNC MANAGER - PROPRIETARY SOFTWARE
 * © 2024-2025 Ryan Barbrick / Barbrick Design - ALL RIGHTS RESERVED
 * Creator: Ryan Barbrick | Contact: BarbrickDesign@gmail.com
 * Signature: GBOT-RB-2025-7X9K2M4P | Unauthorized use: $5,000,000+ damages
 * ═══════════════════════════════════════════════════════════════════════════════
 * GemBot Multi-Device Synchronization System
 * Handles bidirectional sync between mobile, desktop, and physical hardware
 * 
 * Architecture:
 * - WebSocket for real-time communication
 * - Local storage for offline mode
 * - IndexedDB for large media (video streams)
 * - Message queuing for reliability
 */

// [RB-SIG:gembot-sync-manager:2025]
class GemBotSyncManager {
    constructor() {
        this.deviceId = this.generateDeviceId();
        this.deviceType = this.detectDeviceType();
        this.isConnected = false;
        this.linkedDevices = new Map();
        this.dataQueue = [];
        this.syncInterval = 100; // milliseconds between sync attempts
        
        // Connection to physical hardware
        this.hardwareConnection = {
            status: 'disconnected',
            lastUpdate: null,
            machineState: null
        };
        
        // Video stream management
        this.videoStreams = new Map();
        this.activeVideoSource = null;
        
        // Data streams
        this.dataStreams = {
            motorPosition: { x: 0, y: 0, index: 0, angle: 0 },
            sensorData: {},
            calibrationData: {},
            cutParameters: {}
        };
        
        // Sync tracking
        this.lastSyncTimestamp = 0;
        this.syncBuffer = [];
        this.conflictResolution = 'latest-write-wins'; // or 'hardware-priority'
        
        this.init();
    }
    
    /**
     * Initialize sync system
     */
    init() {
        console.log(`🔗 GemBot Sync Manager initialized on ${this.deviceType} (ID: ${this.deviceId})`);
        
        // Setup WebSocket connection
        this.setupWebSocketConnection();
        
        // Setup local storage sync
        this.setupLocalStorageSync();
        
        // Setup IndexedDB for media
        this.setupIndexedDB();
        
        // Start sync loop
        this.startSyncLoop();
        
        // Listen for visibility changes
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.onOnline());
        window.addEventListener('offline', () => this.onOffline());
    }
    
    /**
     * Generate unique device identifier
     */
    generateDeviceId() {
        let deviceId = localStorage.getItem('gembot_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('gembot_device_id', deviceId);
        }
        return deviceId;
    }
    
    /**
     * Detect if running on mobile or desktop
     */
    detectDeviceType() {
        const ua = navigator.userAgent;
        const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        return isMobile ? 'mobile' : 'desktop';
    }
    
    /**
     * Setup WebSocket connection for real-time sync
     */
    setupWebSocketConnection() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/gembot-sync`;

        // If we are served from a static server (python http.server, GitHub pages, file://, etc)
        // there will be no WS endpoint. Avoid a noisy infinite reconnect loop.
        // You can force-enable WS by setting: window.GemBotSyncForceWebSocket = true
        if (window.GemBotSyncForceWebSocket !== true) {
            const isStaticHost = window.location.protocol === 'file:';
            const isGitHubPages = window.location.hostname.includes('github.io');
            const isStaticHost2 = window.location.port === '' && window.location.protocol === 'https:' && !window.location.hostname.includes('localhost');
            
            if (isStaticHost) {
                console.log('ℹ️ Sync Manager: file:// origin detected. Running in local-only sync mode.');
                this.disableWebSocket('file-origin');
                return;
            }
            
            if (isGitHubPages) {
                console.log('ℹ️ Sync Manager: GitHub Pages detected. WebSocket not supported. Using local-only sync mode.');
                this.disableWebSocket('github-pages');
                return;
            }
        }

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('✅ WebSocket connection established');
                this.isConnected = true;
                this._wsDisabledReason = null;
                this.broadcastDeviceInfo();
                this.processSyncQueue();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleIncomingMessage(message);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                // Common when server returns 404/handshake fails.
                // We log once and fall back instead of reconnect-spamming.
                console.warn('⚠️ WebSocket error (falling back to local-only sync):', error);
                this.isConnected = false;
            };

            this.ws.onclose = () => {
                // If we never successfully opened, assume endpoint not present and disable.
                if (!this.isConnected && window.GemBotSyncForceWebSocket !== true) {
                    console.log('ℹ️ WebSocket unavailable (likely no /gembot-sync endpoint). Using fallback sync without reconnect loop.');
                    this.disableWebSocket('endpoint-missing');
                    this.setupFallbackSync();
                    return;
                }

                console.log('⚠️ WebSocket closed, attempting reconnect in 5s...');
                this.isConnected = false;
                setTimeout(() => this.setupWebSocketConnection(), 5000);
            };
        } catch (error) {
            console.warn('⚠️ WebSocket not available, using fallback sync', error);
            this.setupFallbackSync();
        }
    }

    disableWebSocket(reason) {
        this._wsDisabledReason = reason;
        this.isConnected = false;
        if (this.ws) {
            try { this.ws.close(); } catch (_) {}
            this.ws = null;
        }
    }
    
    /**
     * Setup fallback sync without WebSocket (local storage sync only for static hosts)
     */
    setupFallbackSync() {
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isGitHubPages || this._wsDisabledReason === 'github-pages') {
            console.log('ℹ️ Running in local-only sync mode (no server connection needed)');
            // GitHub Pages: Use localStorage events for cross-tab sync only
            window.addEventListener('storage', (e) => {
                if (e.key && e.key.startsWith('gembot_')) {
                    console.log('📦 Cross-tab sync detected:', e.key);
                }
            });
            return;
        }
        
        // For other hosts, try Server-Sent Events first
        try {
            this.eventSource = new EventSource('/gembot-sync-events');
            this.eventSource.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleIncomingMessage(message);
            };
            console.log('✅ Server-Sent Events fallback connected');
        } catch (error) {
            console.warn('⚠️ SSE fallback not available, using local-only sync');
        }
    }
    
    /**
     * Poll server for updates (last resort fallback)
     */
    async pollForUpdates() {
        try {
            const response = await fetch('/gembot-sync-updates?deviceId=' + this.deviceId);
            const messages = await response.json();
            messages.forEach(msg => this.handleIncomingMessage(msg));
        } catch (error) {
            console.warn('Poll failed:', error);
        }
    }
    
    /**
     * Setup local storage synchronization for offline mode
     */
    setupLocalStorageSync() {
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('gembot_')) {
                try {
                    const data = JSON.parse(event.newValue);
                    this.syncLocalStorageChange(event.key, data);
                } catch (error) {
                    console.warn('Storage sync error:', error);
                }
            }
        });
    }
    
    /**
     * Setup IndexedDB for large media and offline storage
     */
    async setupIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('GemBotDB', 1);
            
            request.onerror = () => {
                console.error('❌ IndexedDB initialization failed');
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB initialized');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store for video streams
                if (!db.objectStoreNames.contains('videoStreams')) {
                    db.createObjectStore('videoStreams', { keyPath: 'id', autoIncrement: true });
                }
                
                // Store for sync queue
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                }
                
                // Store for machine state
                if (!db.objectStoreNames.contains('machineState')) {
                    db.createObjectStore('machineState', { keyPath: 'timestamp' });
                }
            };
        });
    }
    
    /**
     * Handle incoming sync messages
     */
    handleIncomingMessage(message) {
        const { type, sourceDeviceId, payload, timestamp } = message;
        
        // Don't process our own messages
        if (sourceDeviceId === this.deviceId) return;
        
        console.log(`📨 Received ${type} from ${sourceDeviceId}`);
        
        switch (type) {
            case 'device-info':
                this.registerLinkedDevice(payload);
                break;
            case 'machine-state-update':
                this.updateMachineState(payload, timestamp, sourceDeviceId);
                break;
            case 'video-stream-start':
                this.startReceivingVideoStream(payload);
                break;
            case 'video-stream-chunk':
                this.receiveVideoChunk(payload);
                break;
            case 'video-stream-end':
                this.finishVideoStream(payload);
                break;
            case 'data-stream':
                this.handleDataStream(payload);
                break;
            case 'hardware-connected':
                this.onHardwareConnected(payload);
                break;
            case 'hardware-disconnected':
                this.onHardwareDisconnected();
                break;
            case 'sync-request':
                this.respondToSyncRequest(sourceDeviceId, payload);
                break;
            case 'cockpit-sync':
                this.handleCockpitSync(message);
                break;
            default:
                console.warn(`Unknown message type: ${type}`);
        }
    }
    
    /**
     * Register a linked device
     */
    registerLinkedDevice(deviceInfo) {
        this.linkedDevices.set(deviceInfo.id, {
            ...deviceInfo,
            lastSeen: Date.now(),
            syncStatus: 'synced'
        });
        console.log(`👥 Device registered: ${deviceInfo.type} (${deviceInfo.id})`);
        
        // Notify UI
        this.dispatchEvent('device-registered', deviceInfo);
    }
    
    /**
     * Update machine state from any source (mobile, desktop, or hardware)
     */
    updateMachineState(newState, timestamp, sourceDeviceId) {
        // Conflict resolution
        if (this.hardwareConnection.status === 'connected') {
            // Hardware takes priority
            console.log('⚠️ Hardware connection active, verifying state against hardware...');
            // TODO: Verify against actual hardware state
        }
        
        // Update local state
        this.dataStreams.motorPosition = {
            ...this.dataStreams.motorPosition,
            ...newState
        };
        
        // Store in IndexedDB for offline access
        if (this.db) {
            const tx = this.db.transaction('machineState', 'readwrite');
            tx.objectStore('machineState').put({
                ...newState,
                timestamp,
                sourceDeviceId
            });
        }
        
        // Sync to UI
        this.updateUI(newState);
        
        // Broadcast to other devices
        this.broadcastToLinkedDevices({
            type: 'machine-state-update',
            payload: newState
        });
        
        this.dispatchEvent('machine-state-changed', { state: newState, source: sourceDeviceId });
    }
    
    /**
     * Start receiving video stream from another device
     */
    startReceivingVideoStream(metadata) {
        const streamId = metadata.streamId;
        this.videoStreams.set(streamId, {
            ...metadata,
            chunks: [],
            received: 0,
            status: 'receiving'
        });
        
        console.log(`🎥 Video stream starting: ${streamId} (${metadata.totalSize} bytes)`);
        this.dispatchEvent('video-stream-start', metadata);
    }
    
    /**
     * Receive video stream chunk
     */
    receiveVideoChunk(data) {
        const { streamId, chunkIndex, chunk, chunkSize, totalChunks } = data;
        const stream = this.videoStreams.get(streamId);
        
        if (!stream) {
            console.error(`❌ Stream not found: ${streamId}`);
            return;
        }
        
        stream.chunks[chunkIndex] = chunk;
        stream.received += chunkSize;
        const progress = (stream.received / stream.totalSize) * 100;
        
        console.log(`📥 Video chunk ${chunkIndex + 1}/${totalChunks} (${progress.toFixed(1)}%)`);
        this.dispatchEvent('video-stream-progress', { streamId, progress });
        
        // Store in IndexedDB
        if (this.db) {
            const tx = this.db.transaction('videoStreams', 'readwrite');
            tx.objectStore('videoStreams').put({
                streamId,
                chunkIndex,
                data: chunk
            });
        }
    }
    
    /**
     * Finalize video stream
     */
    finishVideoStream(metadata) {
        const { streamId } = metadata;
        const stream = this.videoStreams.get(streamId);
        
        if (!stream) return;
        
        // Reconstruct video blob
        const blob = new Blob(stream.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        stream.status = 'complete';
        stream.url = url;
        
        console.log(`✅ Video stream complete: ${streamId}`);
        this.dispatchEvent('video-stream-complete', { streamId, url });
        
        // Display on UI
        this.displayVideoStream(url);
    }
    
    /**
     * Handle incoming data stream
     */
    handleDataStream(payload) {
        const { category, data } = payload;
        this.dataStreams[category] = { ...this.dataStreams[category], ...data };
        this.dispatchEvent('data-stream-updated', { category, data });
    }
    
    /**
     * Broadcast current device info to all connected devices
     */
    broadcastDeviceInfo() {
        this.send({
            type: 'device-info',
            payload: {
                id: this.deviceId,
                type: this.deviceType,
                name: this.getDeviceName(),
                capabilities: this.getDeviceCapabilities(),
                timestamp: Date.now()
            }
        });
    }
    
    /**
     * Get human-readable device name
     */
    getDeviceName() {
        const ua = navigator.userAgent;
        if (/iPhone/.test(ua)) return 'iPhone';
        if (/iPad/.test(ua)) return 'iPad';
        if (/Android/.test(ua)) return 'Android Device';
        return 'Desktop';
    }
    
    /**
     * Get device capabilities
     */
    getDeviceCapabilities() {
        return {
            hasCamera: true, // checked asynchronously separately
            hasGPS: 'geolocation' in navigator,
            hasAccelerometer: 'DeviceMotionEvent' in window,
            storage: navigator.storage ? 'available' : 'unavailable',
            isTouchDevice: this.isTouchDevice(),
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
    
    /**
     * Check if device has camera
     */
    async hasCamera() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.some(device => device.kind === 'videoinput');
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Check if device supports touch
     */
    isTouchDevice() {
        return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
    }
    
    /**
     * Send video stream from this device to others
     */
    async sendVideoStream(videoElement) {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        const ctx = canvas.getContext('2d');
        const streamId = 'video_' + Date.now();
        const CHUNK_SIZE = 64 * 1024; // 64KB chunks
        
        // Encode video stream in chunks
        const chunks = [];
        const encodeStream = async () => {
            return new Promise(resolve => {
                const frames = [];
                const encoder = new MediaRecorder(canvas.captureStream());
                
                encoder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        // Split into chunks
                        for (let i = 0; i < event.data.size; i += CHUNK_SIZE) {
                            chunks.push(event.data.slice(i, i + CHUNK_SIZE));
                        }
                    }
                };
                
                encoder.onstop = () => resolve(chunks);
                encoder.start();
                
                // Record for 5 seconds
                setTimeout(() => encoder.stop(), 5000);
            });
        };
        
        const videoChunks = await encodeStream();
        
        // Send start signal
        this.send({
            type: 'video-stream-start',
            payload: {
                streamId,
                totalSize: videoChunks.reduce((sum, chunk) => sum + chunk.size, 0),
                resolution: { width: canvas.width, height: canvas.height },
                timestamp: Date.now()
            }
        });
        
        // Send chunks
        let totalSent = 0;
        videoChunks.forEach((chunk, index) => {
            // Convert chunk to base64 or ArrayBuffer
            const reader = new FileReader();
            reader.onload = () => {
                this.send({
                    type: 'video-stream-chunk',
                    payload: {
                        streamId,
                        chunkIndex: index,
                        chunk: reader.result,
                        chunkSize: chunk.size,
                        totalChunks: videoChunks.length
                    }
                }, { large: true } // Flag for large message handling
                );
            };
            reader.readAsArrayBuffer(chunk);
        });
        
        // Send completion signal
        setTimeout(() => {
            this.send({
                type: 'video-stream-end',
                payload: { streamId, totalChunks: videoChunks.length }
            });
        }, videoChunks.length * 100);
    }
    
    /**
     * Broadcast machine state to all linked devices
     */
    broadcastMachineState(state) {
        this.send({
            type: 'machine-state-update',
            payload: state,
            timestamp: Date.now()
        });
        
        // Also broadcast to hardware if connected
        if (this.hardwareConnection.status === 'connected') {
            this.sendToHardware(state);
        }
    }
    
    /**
     * Send data to physical hardware
     */
    sendToHardware(data) {
        console.log('📤 Sending to hardware:', data);
        // Implementation depends on hardware connection method
        // (USB, Serial, WebUSB, or network)
        this.dispatchEvent('hardware-send', data);
    }
    
    /**
     * Handle hardware connection event
     */
    onHardwareConnected(hardwareInfo) {
        this.hardwareConnection.status = 'connected';
        this.hardwareConnection.lastUpdate = Date.now();
        this.hardwareConnection.info = hardwareInfo;
        
        console.log('🔗 Hardware connected:', hardwareInfo);
        
        // Broadcast to all linked devices
        this.broadcastToLinkedDevices({
            type: 'hardware-connected',
            payload: hardwareInfo
        });
        
        this.dispatchEvent('hardware-connected', hardwareInfo);
    }
    
    /**
     * Handle hardware disconnection
     */
    onHardwareDisconnected() {
        console.log('⚠️ Hardware disconnected');
        this.hardwareConnection.status = 'disconnected';
        
        // Broadcast to all linked devices
        this.broadcastToLinkedDevices({
            type: 'hardware-disconnected',
            payload: {}
        });
        
        this.dispatchEvent('hardware-disconnected', {});
    }
    
    /**
     * Broadcast message to all linked devices
     */
    broadcastToLinkedDevices(message) {
        this.linkedDevices.forEach((device, deviceId) => {
            this.send({
                ...message,
                targetDeviceId: deviceId
            });
        });
    }
    
    /**
     * Send message via WebSocket or fallback
     */
    send(message, options = {}) {
        const fullMessage = {
            ...message,
            sourceDeviceId: this.deviceId,
            timestamp: Date.now()
        };
        
        if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            // Handle large messages
            if (options.large) {
                // For large payloads, might need chunking at transport level
                const maxSize = 16 * 1024 * 1024; // 16MB
                const msgStr = JSON.stringify(fullMessage);
                if (msgStr.length > maxSize) {
                    console.warn('⚠️ Message too large, queuing for retry');
                    this.dataQueue.push(fullMessage);
                    return;
                }
            }
            
            try {
                this.ws.send(JSON.stringify(fullMessage));
            } catch (error) {
                console.error('❌ Failed to send message:', error);
                this.dataQueue.push(fullMessage);
            }
        } else {
            // Queue for later
            this.dataQueue.push(fullMessage);
        }
    }
    
    /**
     * Process queued messages when connection restored
     */
    processSyncQueue() {
        while (this.dataQueue.length > 0) {
            const message = this.dataQueue.shift();
            this.send(message);
        }
    }
    
    /**
     * Start sync loop
     */
    startSyncLoop() {
        setInterval(() => {
            // Sync with other devices
            this.linkedDevices.forEach((device, deviceId) => {
                if (Date.now() - device.lastSeen > 30000) {
                    // Device hasn't checked in, mark as offline
                    console.log(`⚠️ Device offline: ${deviceId}`);
                    this.linkedDevices.delete(deviceId);
                }
            });
            
            // Send heartbeat
            this.send({
                type: 'heartbeat',
                payload: { deviceId: this.deviceId }
            });
        }, this.syncInterval);
    }
    
    /**
     * Handle visibility change (tab/app in background)
     */
    onVisibilityChange() {
        if (document.hidden) {
            console.log('👁️ App backgrounded');
            // Reduce sync frequency
            this.syncInterval = 5000;
        } else {
            console.log('👁️ App foregrounded');
            // Resume normal sync
            this.syncInterval = 100;
        }
    }
    
    /**
     * Handle online event
     */
    onOnline() {
        console.log('📡 Back online');
        this.processSyncQueue();
        this.broadcastDeviceInfo();
    }
    
    /**
     * Handle offline event
     */
    onOffline() {
        console.log('📡 Offline');
        // Switch to local-only mode
        this.isConnected = false;
    }
    
    /**
     * Update UI with new data
     */
    updateUI(newState) {
        // Dispatch custom event for UI update
        this.dispatchEvent('state-changed', newState);
    }
    
    /**
     * Display video stream on UI
     */
    displayVideoStream(url) {
        // Find video element and update it
        const videoElement = document.getElementById('remoteVideoFeed');
        if (videoElement) {
            videoElement.src = url;
            videoElement.play();
        }
    }
    
    /**
     * Sync local storage change to other devices
     */
    syncLocalStorageChange(key, data) {
        this.send({
            type: 'storage-sync',
            payload: { key, data }
        });
    }
    
    /**
     * Respond to sync request from another device
     */
    respondToSyncRequest(sourceDeviceId, request) {
        const response = {
            type: 'sync-response',
            targetDeviceId: sourceDeviceId,
            payload: {
                machineState: this.dataStreams.motorPosition,
                timestamp: Date.now()
            }
        };
        this.send(response);
    }
    
    /**
     * Get all linked devices
     */
    getLinkedDevices() {
        return Array.from(this.linkedDevices.values());
    }
    
    /**
     * Get sync status
     */
    getSyncStatus() {
        return {
            deviceId: this.deviceId,
            deviceType: this.deviceType,
            isConnected: this.isConnected,
            linkedDevices: this.getLinkedDevices().length,
            hardwareStatus: this.hardwareConnection.status,
            queueLength: this.dataQueue.length,
            videoStreamsActive: this.videoStreams.size
        };
    }
    
    /**
     * Dispatch custom event
     */
    dispatchEvent(eventName, detail) {
        document.dispatchEvent(new CustomEvent(`gembot-${eventName}`, {
            detail,
            bubbles: true
        }));
    }
    
    /**
     * Listen for sync events
     */
    on(eventName, callback) {
        document.addEventListener(`gembot-${eventName}`, (e) => callback(e.detail));
    }
    
    /**
     * Cockpit Identity Synchronization
     * Ensures data stays in sync between Ryan and Agent R cockpits
     */
    syncCockpitIdentity(userIdentifier) {
        // Import agent name normalizer if available
        const normalizer = window.agentNameNormalizer;
        if (!normalizer) {
            console.warn('⚠️ Agent name normalizer not loaded, cockpit identity sync disabled');
            return;
        }
        
        // Get canonical name (Ryan is the canonical name for Agent R, Commander, etc.)
        const canonicalName = normalizer.getCanonicalName(userIdentifier);
        
        if (canonicalName === 'ryan') {
            console.log('✅ Cockpit Identity Sync: Detected Ryan/Agent R/Commander identity');
            
            // List all cockpits for this user
            const cockpits = [
                'OPERATOR_COCKPIT_AGENT_R',
                'COMMANDER_COCKPIT'
            ];
            
            // Sync data across all cockpits
            cockpits.forEach(cockpit => {
                const key = `cockpit_data_${cockpit}`;
                const data = localStorage.getItem(key);
                if (data) {
                    // Broadcast to other cockpits
                    this.send({
                        type: 'cockpit-sync',
                        payload: {
                            cockpit,
                            canonicalName,
                            data: JSON.parse(data),
                            timestamp: Date.now()
                        }
                    });
                }
            });
            
            return canonicalName;
        }
        
        return null;
    }
    
    /**
     * Handle cockpit sync messages
     */
    handleCockpitSync(message) {
        const { cockpit, canonicalName, data, timestamp } = message.payload;
        
        // Check if this is for the current user
        const normalizer = window.agentNameNormalizer;
        if (!normalizer) return;
        
        const currentUser = normalizer.getCanonicalName(
            localStorage.getItem('currentUser') || 'unknown'
        );
        
        if (currentUser === canonicalName) {
            console.log(`🔄 Syncing data to ${cockpit} cockpit`);
            
            // Update local storage for this cockpit
            const key = `cockpit_data_${cockpit}`;
            const existing = localStorage.getItem(key);
            
            if (existing) {
                const existingData = JSON.parse(existing);
                const existingTimestamp = existingData.timestamp || 0;
                
                // Use latest-write-wins strategy
                if (timestamp > existingTimestamp) {
                    localStorage.setItem(key, JSON.stringify(data));
                    this.dispatchEvent('cockpit-synced', { cockpit, data });
                }
            } else {
                localStorage.setItem(key, JSON.stringify(data));
                this.dispatchEvent('cockpit-synced', { cockpit, data });
            }
        }
    }
}

// Initialize on page load
let gembotSync = null;

function initGembotSync() {
    // Deterministic boot: allow HTML/bootstrap to control initialization
    if (typeof window !== 'undefined' && window.GemBotAutoInit === false) {
        console.log('ℹ️ GemBotSyncManager: auto-init disabled (GemBotAutoInit=false). Waiting for GemBotApp/bootstrap.');
        return;
    }

    gembotSync = new GemBotSyncManager();
    window.gembotSync = gembotSync; // Update window reference after creation
    console.log('✅ GemBot Sync Manager ready');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGembotSync);
} else {
    initGembotSync();
}

// Export class for use in other modules
window.GemBotSyncManager = GemBotSyncManager;

// Also expose an explicit initializer for deterministic boot.
// GemBotApp/bootstrap calls this.
window.initGembotSync = function initGembotSync(options) {
    if (!window.gembotSync) {
        window.gembotSync = new GemBotSyncManager(options);
    } else if (typeof window.gembotSync.init === 'function' && !window.gembotSync.__gembotInitialized) {
        window.gembotSync.__gembotInitialized = true;
        window.gembotSync.init();
    }
    return window.gembotSync;
};
