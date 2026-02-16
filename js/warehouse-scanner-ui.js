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
 * File: warehouse-scanner-ui.js
 * Declaration ID: IP-552A9F36-MLL28ZVD
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Warehouse Scanner UI Controller
 * Main application controller coordinating all components
 */

const WarehouseScannerUI = {
    // State
    currentView: 'camera',
    isScanning: false,
    currentSession: null,
    sessionStartTime: null,
    sessionTimer: null,
    
    // Map state
    map: null,
    userMarker: null,
    userLocation: null,
    lastGPSAccuracy: null,
    inventoryMarkers: [],
    watchId: null,
    
    // Auto features state
    autoCapture: true,
    autoIdentify: true,
    autoValuation: true,
    confidenceThreshold: 80,
    lastAutoCapture: 0,
    autoCaptureDelay: 2000, // 2 seconds between auto-captures

    // Elements
    elements: {},

    /**
     * Initialize the application
     */
    async init() {
        console.log('🏭 Initializing Warehouse Scanner UI...');

        // Cache DOM elements
        this.cacheElements();

        // Initialize database
        try {
            await warehouseDB.init();
            console.log('✅ Database initialized');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            // Delay error toast to avoid popup overlap (500ms delay)
            setTimeout(() => {
                this.showToast('Database initialization failed', 'error');
            }, 500);
        }

        // Initialize AI scanner
        try {
            await scannerAI.init(this.elements.cameraVideo, this.elements.overlayCanvas);
            console.log('✅ AI Scanner initialized');
        } catch (error) {
            console.error('❌ AI Scanner initialization failed:', error);
            // Delay error toast to avoid popup overlap (1000ms delay)
            setTimeout(() => {
                this.showToast('AI Scanner initialization failed', 'error');
            }, 1000);
        }

        // Initialize Leaflet Map
        this.initializeMap();

        // Setup event listeners
        this.setupEventListeners();

        // Load saved settings
        this.loadSettings();

        // Show welcome message with delay to avoid overlap with other popups (1500ms delay)
        setTimeout(() => {
            aiHelper.help("Welcome to the AI Warehouse Scanner! Tap 'Start Scanning' to begin.", {
                type: 'info',
                priority: 'high'
            });
        }, 1500);

        // Hide loading overlay
        this.hideLoading();

        // Update inventory view
        await this.updateInventoryView();

        console.log('✅ Warehouse Scanner initialized successfully');
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Camera elements
            cameraVideo: document.getElementById('cameraVideo'),
            overlayCanvas: document.getElementById('overlayCanvas'),
            cameraSection: document.getElementById('cameraSection'),
            
            // Buttons
            startScanBtn: document.getElementById('startScanBtn'),
            centerPlayBtn: document.getElementById('centerPlayBtn'),
            captureBtn: document.getElementById('captureBtn'),
            stopScanBtn: document.getElementById('stopScanBtn'),
            toggleMode: document.getElementById('toggleMode'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Stats
            scannedCount: document.getElementById('scannedCount'),
            totalValue: document.getElementById('totalValue'),
            sessionTime: document.getElementById('sessionTime'),
            
            // Inventory
            inventorySection: document.getElementById('inventorySection'),
            warehouseMap: document.getElementById('warehouseMap'),
            inventoryItems: document.getElementById('inventoryItems'),
            searchInventory: document.getElementById('searchInventory'),
            filterCategory: document.getElementById('filterCategory'),
            sortBy: document.getElementById('sortBy'),
            topValueItems: document.getElementById('topValueItems'),
            
            // Modals
            itemModal: document.getElementById('itemModal'),
            settingsModal: document.getElementById('settingsModal'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            
            // AI Helper
            aiHelper: document.getElementById('aiHelper'),
            
            // Toast
            toastContainer: document.getElementById('toastContainer'),
            
            // Scan status
            scanStatus: document.getElementById('scanStatus'),
            detectionInfo: document.getElementById('detectionInfo')
        };
    },

    /**
     * Initialize Leaflet Map with Geolocation
     */
    initializeMap() {
        if (!this.elements.warehouseMap) {
            console.warn('Map container not found');
            return;
        }

        try {
            // Initialize map centered on default location (will be updated with user location)
            this.map = L.map(this.elements.warehouseMap).setView([37.7749, -122.4194], 13);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(this.map);

            // Request user location
            this.startGeolocation();

            console.log('✅ Map initialized with Leaflet');
        } catch (error) {
            console.error('❌ Map initialization failed:', error);
            // Delay error toast to avoid popup overlap (2000ms delay)
            setTimeout(() => {
                this.showToast('Map initialization failed', 'error');
            }, 2000);
        }
    },

    /**
     * Start geolocation tracking
     */
    startGeolocation() {
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser');
            // Delay warning toast to avoid popup overlap (2500ms delay)
            setTimeout(() => {
                this.showToast('Geolocation not supported', 'warning');
            }, 2500);
            return;
        }

        // Watch user position for real-time tracking
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                this.userLocation = { lat: latitude, lng: longitude };
                this.lastGPSAccuracy = accuracy;
                
                console.log(`📍 GPS Update: (${latitude.toFixed(6)}, ${longitude.toFixed(6)}) ±${accuracy.toFixed(1)}m`);
                
                // Update or create user marker
                if (this.userMarker) {
                    this.userMarker.setLatLng([latitude, longitude]);
                } else {
                    // Create custom icon with 📍 emoji
                    const userIcon = L.divIcon({
                        html: '<div style="font-size: 24px;">📍</div>',
                        className: 'user-marker-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    this.userMarker = L.marker([latitude, longitude], { icon: userIcon })
                        .addTo(this.map)
                        .bindPopup(`📍 Your Location<br><small>Accuracy: ±${accuracy.toFixed(1)}m</small>`)
                        .openPopup();
                }

                // Auto-center map on user location (first time only)
                if (!this.mapCentered) {
                    this.map.setView([latitude, longitude], 16);
                    this.mapCentered = true;
                    console.log('✅ Map centered on user location:', latitude, longitude);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                // Delay error toast to avoid popup overlap (3000ms delay)
                setTimeout(() => {
                    this.showToast('Unable to get your location', 'warning');
                }, 3000);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    },

    /**
     * Stop geolocation tracking
     */
    stopGeolocation() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Camera controls
        this.elements.startScanBtn.addEventListener('click', () => this.startScanning());
        this.elements.centerPlayBtn.addEventListener('click', () => this.startScanning());
        this.elements.captureBtn.addEventListener('click', () => this.captureItem());
        this.elements.stopScanBtn.addEventListener('click', () => this.stopScanning());
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.currentTarget.dataset.view));
        });

        // Modal controls
        document.querySelectorAll('.close-btn, .close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // Settings
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Inventory controls
        this.elements.searchInventory.addEventListener('input', () => this.filterInventory());
        this.elements.filterCategory.addEventListener('change', () => this.filterInventory());
        this.elements.sortBy.addEventListener('change', () => this.filterInventory());

        // Export/Import
        document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn')?.addEventListener('click', () => this.importData());

        // Toggle detection mode
        this.elements.toggleMode.addEventListener('click', () => this.toggleDetectionMode());
    },

    /**
     * Start scanning session
     */
    async startScanning() {
        try {
            this.showLoading('Initializing camera...');

            // Start camera
            await scannerAI.startCamera();

            // Start scan session in database
            this.currentSession = await warehouseDB.startSession({
                warehouseId: localStorage.getItem('warehouseId') || 'WH-001'
            });

            // Update UI
            this.elements.startScanBtn.classList.add('hidden');
            this.elements.centerPlayBtn.classList.add('hidden');
            this.elements.captureBtn.classList.remove('hidden');
            this.elements.stopScanBtn.classList.remove('hidden');

            // Start scanning loop
            scannerAI.startScanning((detection) => this.handleDetection(detection));

            // Start session timer
            this.sessionStartTime = Date.now();
            this.startSessionTimer();

            this.isScanning = true;

            // Update status with active auto features
            const activeFeatures = [];
            if (this.autoCapture) activeFeatures.push('📸 Auto-Capture');
            if (this.autoIdentify) activeFeatures.push('🔍 Auto-Identify');
            if (this.autoValuation) activeFeatures.push('💰 Auto-Value');
            
            const statusText = activeFeatures.length > 0 
                ? `Scanning... (${activeFeatures.join(', ')})` 
                : 'Scanning...';
            
            this.elements.scanStatus.textContent = statusText;
            
            aiHelper.provideContextualHelp({ 
                situation: 'starting_scan',
                autoFeatures: {
                    capture: this.autoCapture,
                    identify: this.autoIdentify,
                    value: this.autoValuation,
                    threshold: this.confidenceThreshold
                }
            });

            this.hideLoading();
            this.showToast('Scanning started with auto features enabled', 'success');

        } catch (error) {
            console.error('Error starting scan:', error);
            this.showToast('Failed to start camera: ' + error.message, 'error');
            this.hideLoading();
        }
    },

    /**
     * Stop scanning session
     */
    async stopScanning() {
        scannerAI.stopScanning();
        scannerAI.stopCamera();

        // Stop session timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }

        // End session in database
        if (this.currentSession) {
            const stats = await warehouseDB.getStats();
            await warehouseDB.endSession(this.currentSession.id, {
                itemsScanned: stats.totalItems,
                totalValue: stats.totalValue
            });

            aiHelper.provideContextualHelp({ 
                situation: 'session_complete',
                stats: { count: stats.totalItems, value: stats.totalValue }
            });
        }

        // Reset UI
        this.elements.startScanBtn.classList.remove('hidden');
        this.elements.centerPlayBtn.classList.remove('hidden');
        this.elements.captureBtn.classList.add('hidden');
        this.elements.stopScanBtn.classList.add('hidden');
        this.elements.scanStatus.textContent = 'Ready to scan';
        this.elements.detectionInfo.textContent = '';

        this.isScanning = false;

        this.showToast('Scanning stopped', 'info');

        // Update inventory view
        await this.updateInventoryView();
    },

    /**
     * Handle AI detection
     */
    async handleDetection(detection) {
        console.log('🔍 Detection:', detection);

        // Update detection info with auto-identify indicators
        const autoIndicator = this.autoIdentify ? '🤖 AUTO-IDENTIFY: ' : '';
        this.elements.detectionInfo.textContent = `${autoIndicator}${detection.name} (${detection.confidence}% confidence)`;

        // Check confidence against threshold
        if (detection.confidence < this.confidenceThreshold) {
            aiHelper.provideContextualHelp({ 
                situation: 'low_confidence',
                confidence: detection.confidence,
                threshold: this.confidenceThreshold
            });
            return;
        }

        // Auto-capture if enabled and enough time has passed since last capture
        const now = Date.now();
        const timeSinceLastCapture = now - this.lastAutoCapture;
        
        if (this.autoCapture && timeSinceLastCapture > this.autoCaptureDelay) {
            this.lastAutoCapture = now;
            
            // Visual feedback for auto-capture
            this.showAutoCaptureIndicator();
            
            // Add item automatically
            await this.addDetectedItem(detection);
            
            aiHelper.help('✅ Auto-captured!', { type: 'success', duration: 1500 });
        } else if (!this.autoCapture && detection.confidence > 80) {
            // If auto-capture is disabled, just notify user
            aiHelper.help('Item detected. Tap Capture to add it.', { type: 'info' });
        }
    },

    /**
     * Capture current item
     */
    async captureItem() {
        const imageData = scannerAI.captureFrame();
        
        if (!imageData) {
            this.showToast('Failed to capture image', 'error');
            return;
        }

        // Create item with captured image
        const item = {
            name: 'Manually Captured Item',
            category: 'electronics',
            imageData: imageData,
            location: localStorage.getItem('defaultLocation') || 'Unknown'
        };

        await this.addDetectedItem(item);
    },

    /**
     * Add detected item to inventory
     */
    async addDetectedItem(detection) {
        try {
            // Check for duplicate first
            const duplicateCheck = await warehouseDB.checkForDuplicate(detection);
            
            if (duplicateCheck.isDuplicate) {
                const existingItem = duplicateCheck.existingItem;
                const currentLocation = localStorage.getItem('defaultLocation') || 'Unknown';
                
                // Item already exists - update location if changed
                if (existingItem.location !== currentLocation) {
                    await warehouseDB.updateItemLocation(existingItem.id, currentLocation);
                    
                    this.showToast(
                        `📦 Item already in inventory! Location updated: ${existingItem.location} → ${currentLocation}`,
                        'warning'
                    );
                    
                    console.log(`📍 Item moved: "${existingItem.name}" (ID: ${existingItem.id})`);
                    console.log(`   Visual ID: ${existingItem.visualId}`);
                    console.log(`   Old Location: ${existingItem.location}`);
                    console.log(`   New Location: ${currentLocation}`);
                    console.log(`   Match Type: ${duplicateCheck.matchType}`);
                    
                    aiHelper.help(
                        `This ${existingItem.name} was already scanned. Location updated to ${currentLocation}.`,
                        { type: 'warning', duration: 3000 }
                    );
                } else {
                    // Same location - just update last seen time
                    await warehouseDB.updateItemLocation(existingItem.id, currentLocation);
                    
                    this.showToast(
                        `⚠️ Already scanned: ${existingItem.name} (preventing duplicate)`,
                        'info'
                    );
                    
                    console.log(`ℹ️ Item already scanned in same location: "${existingItem.name}" (ID: ${existingItem.id})`);
                    console.log(`   Visual ID: ${existingItem.visualId}`);
                    console.log(`   Location: ${existingItem.location}`);
                    console.log(`   Original Scan: ${existingItem.scannedAt}`);
                    console.log(`   Last Seen: ${existingItem.lastSeenAt}`);
                    
                    aiHelper.help(
                        `This ${existingItem.name} is already in inventory at ${existingItem.location}. Skipping duplicate.`,
                        { type: 'info', duration: 3000 }
                    );
                }
                
                // Don't add duplicate - just update stats
                await this.updateStats();
                return;
            }
            
            // Not a duplicate - proceed with adding new item
            let value = 0;
            
            // Auto-valuation if enabled
            if (this.autoValuation) {
                value = valuationEngine.estimateValue({
                    category: detection.category || 'electronics',
                    type: detection.type || 'unknown',
                    condition: 'unknown',
                    name: detection.name
                });
                
                // Visual feedback for auto-valuation
                if (value > 0) {
                    console.log('💰 AUTO-VALUE: $' + value.toLocaleString());
                }
            } else {
                // If auto-valuation is disabled, use default value
                value = 100;
            }

            // Create item with precise GPS coordinates
            const item = {
                ...detection,
                value: value,
                estimatedValue: value,
                location: localStorage.getItem('defaultLocation') || 'Unknown',
                quantity: 1,
                autoDetected: true,
                autoValued: this.autoValuation,
                // Add precise GPS coordinates from current user location
                latitude: this.userLocation ? this.userLocation.lat : null,
                longitude: this.userLocation ? this.userLocation.lng : null,
                gpsAccuracy: this.lastGPSAccuracy || null
            };

            // Add to database
            const savedItem = await warehouseDB.addItem(item);
            
            console.log(`✅ New item added: "${savedItem.name}" (ID: ${savedItem.id})`);
            console.log(`   Visual ID: ${savedItem.visualId}`);
            console.log(`   Location: ${savedItem.location}`);
            console.log(`   Value: $${savedItem.value}`);

            // Update UI
            await this.updateStats();
            
            // Show success with auto-indicators
            const autoIndicators = [];
            if (this.autoCapture) autoIndicators.push('📸 Auto-Captured');
            if (this.autoIdentify) autoIndicators.push('🔍 Auto-Identified');
            if (this.autoValuation) autoIndicators.push('💰 Auto-Valued');
            
            const message = `Item added: ${savedItem.name}${autoIndicators.length > 0 ? ' (' + autoIndicators.join(', ') + ')' : ''}`;
            this.showToast(message, 'success');
            
            aiHelper.provideContextualHelp({ 
                situation: 'item_added',
                value: value,
                autoFeatures: {
                    capture: this.autoCapture,
                    identify: this.autoIdentify,
                    value: this.autoValuation
                }
            });

            // Check if high value
            if (value > 1000) {
                aiHelper.provideContextualHelp({ situation: 'high_value_item' });
            }

        } catch (error) {
            console.error('Error adding item:', error);
            this.showToast('Failed to add item', 'error');
        }
    },

    /**
     * Update statistics display
     */
    async updateStats() {
        const stats = await warehouseDB.getStats();
        
        this.elements.scannedCount.textContent = stats.totalItems;
        this.elements.totalValue.textContent = '$' + stats.totalValue.toLocaleString();
    },

    /**
     * Start session timer
     */
    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            if (this.sessionStartTime) {
                const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.elements.sessionTime.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    },

    /**
     * Update navigation button states
     */
    updateNavigationState(activeView) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === activeView);
        });
    },

    /**
     * Show inventory view
     */
    showInventoryView() {
        this.elements.cameraSection.classList.add('hidden');
        this.elements.inventorySection.classList.remove('hidden');
        this.updateInventoryView();
    },

    /**
     * Switch view
     */
    switchView(view) {
        // Update navigation
        this.updateNavigationState(view);

        // Update sections
        if (view === 'camera') {
            this.elements.cameraSection.classList.remove('hidden');
            this.elements.inventorySection.classList.add('hidden');
        } else if (view === 'inventory') {
            this.showInventoryView();
        } else if (view === 'reports') {
            // Show reports - redirect to inventory view with analytics focus
            this.showInventoryView();
            this.showToast('Reports view - showing inventory analytics', 'info');
        } else if (view === 'settings') {
            // Open settings modal
            this.openSettings();
            // Keep current view active in navigation
            this.updateNavigationState(this.currentView);
            return; // Exit early to prevent currentView update
        }

        this.currentView = view;
    },

    /**
     * Update inventory view
     */
    async updateInventoryView() {
        await this.updateStats();
        await this.updateWarehouseMap();
        await this.filterInventory();
        await this.updateValueAnalysis();
    },

    /**
     * Update warehouse map with inventory markers
     */
    async updateWarehouseMap() {
        if (!this.map) {
            console.warn('Map not initialized');
            return;
        }

        const items = await warehouseDB.getAllItems();
        
        // Clear existing inventory markers
        this.inventoryMarkers.forEach(marker => marker.remove());
        this.inventoryMarkers = [];

        // Group items by location and add markers
        const locationGroups = {};
        items.forEach(item => {
            // Use stored GPS coordinates if available (from when item was scanned)
            if (!item.latitude || !item.longitude) {
                // Only generate coordinates if not already stored
                if (this.userLocation) {
                    // Use current user location as fallback
                    item.latitude = this.userLocation.lat;
                    item.longitude = this.userLocation.lng;
                } else {
                    // Default location if no user location
                    item.latitude = 37.7749;
                    item.longitude = -122.4194;
                }
            }

            // Round to 6 decimal places (~0.1 meter precision) for grouping
            const lat = parseFloat(item.latitude.toFixed(6));
            const lng = parseFloat(item.longitude.toFixed(6));
            const key = `${lat},${lng}`;
            
            if (!locationGroups[key]) {
                locationGroups[key] = [];
            }
            locationGroups[key].push(item);
        });

        // Create markers for each location
        Object.entries(locationGroups).forEach(([coords, locationItems]) => {
            const [lat, lng] = coords.split(',').map(Number);
            
            // Calculate total value for this location
            const totalValue = locationItems.reduce((sum, item) => sum + (item.value * item.quantity), 0);
            const itemCount = locationItems.reduce((sum, item) => sum + item.quantity, 0);

            // Determine marker icon based on value
            let emoji = '📦'; // Standard
            let className = 'standard-marker';
            
            if (totalValue >= 1000) {
                emoji = '💎'; // High value
                className = 'high-value-marker';
            } else if (totalValue >= 500) {
                emoji = '⭐'; // Medium value
                className = 'medium-value-marker';
            }

            // Create custom marker icon
            const markerIcon = L.divIcon({
                html: `<div style="font-size: 24px;">${emoji}</div>`,
                className: `inventory-marker ${className}`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });

            // Create marker
            const marker = L.marker([lat, lng], { icon: markerIcon });

            // Create popup content
            const popupContent = `
                <div style="min-width: 200px;">
                    <h4 style="margin: 0 0 10px 0;">${emoji} ${locationItems[0].location || 'Location'}</h4>
                    <p style="margin: 5px 0;"><strong>Items:</strong> ${itemCount}</p>
                    <p style="margin: 5px 0;"><strong>Total Value:</strong> $${totalValue.toLocaleString()}</p>
                    ${locationItems[0].gpsAccuracy ? `<p style="margin: 5px 0; font-size: 0.85em; color: #666;"><strong>GPS Accuracy:</strong> ±${locationItems[0].gpsAccuracy.toFixed(1)}m</p>` : ''}
                    <div style="margin-top: 10px; font-size: 0.9em;">
                        ${locationItems.map(item => `
                            <div style="padding: 5px 0; border-top: 1px solid #eee;">
                                <strong>${item.name}</strong><br>
                                Qty: ${item.quantity} | Value: $${(item.value * item.quantity).toLocaleString()}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.addTo(this.map);
            
            this.inventoryMarkers.push(marker);
        });

        console.log(`✅ Added ${this.inventoryMarkers.length} inventory markers to map`);
    },

    /**
     * Filter and display inventory items
     */
    async filterInventory() {
        const search = this.elements.searchInventory.value;
        const category = this.elements.filterCategory.value;
        const sortBy = this.elements.sortBy.value;

        const filters = {
            search: search,
            category: category || undefined
        };

        let items = await warehouseDB.getAllItems(filters);

        // Sort items
        switch (sortBy) {
            case 'value-desc':
                items.sort((a, b) => (b.value * b.quantity) - (a.value * a.quantity));
                break;
            case 'value-asc':
                items.sort((a, b) => (a.value * a.quantity) - (b.value * b.quantity));
                break;
            case 'location':
                items.sort((a, b) => a.location.localeCompare(b.location));
                break;
            case 'time':
            default:
                items.sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));
        }

        // Display items
        this.displayInventoryItems(items);
    },

    /**
     * Display inventory items
     */
    displayInventoryItems(items) {
        const container = this.elements.inventoryItems;
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #9ca3af;">No items found</div>';
            return;
        }

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.dataset.itemId = item.id;
            
            // Create wrapper for swipe functionality
            const itemWrapper = document.createElement('div');
            itemWrapper.className = 'item-swipeable';
            
            itemWrapper.innerHTML = `
                <div class="item-content">
                    <div class="item-icon">${this.getCategoryIcon(item.category)}</div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-meta">
                            <span>📍 ${item.location}</span>
                            <span>📦 Qty: ${item.quantity}</span>
                            ${item.status === 'sold' ? '<span class="status-badge sold">Sold</span>' : ''}
                            <span>🕒 ${this.formatDate(item.scannedAt)}</span>
                        </div>
                    </div>
                    <div class="item-value">$${(item.value * item.quantity).toLocaleString()}</div>
                </div>
                <div class="item-actions">
                    <button class="item-action-btn edit-btn" data-action="edit">✏️ Edit</button>
                    <button class="item-action-btn delete-btn" data-action="delete">🗑️ Delete</button>
                </div>
            `;
            
            itemEl.appendChild(itemWrapper);
            
            // Add gesture support
            this.addItemGestures(itemEl, item);
            
            container.appendChild(itemEl);
        });
    },
    
    /**
     * Add touch gestures to inventory item
     */
    addItemGestures(itemEl, item) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let moveX = 0;
        let isSwiping = false;
        let swipeRevealed = false;
        let longPressTimer = null;
        const content = itemEl.querySelector('.item-content');
        
        // Touch start
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            currentX = startX;
            
            // Start long press timer
            longPressTimer = setTimeout(() => {
                this.openEditModal(item);
                navigator.vibrate && navigator.vibrate(50); // Haptic feedback
            }, 500);
        };
        
        // Touch move
        const handleTouchMove = (e) => {
            if (!startX) return;
            
            const touch = e.touches[0];
            currentX = touch.clientX;
            const diffY = Math.abs(touch.clientY - startY);
            moveX = currentX - startX;
            
            // Clear long press if moved
            if (longPressTimer && (Math.abs(moveX) > 10 || diffY > 10)) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            // If horizontal swipe
            if (Math.abs(moveX) > 10 && diffY < 30) {
                isSwiping = true;
                e.preventDefault();
                
                // Only allow left swipe (or right swipe to close)
                const constrainedMove = swipeRevealed ? 
                    Math.min(Math.max(moveX - 150, -150), 0) : 
                    Math.max(Math.min(moveX, 0), -150);
                content.style.transform = `translateX(${constrainedMove}px)`;
                content.style.transition = 'none';
            }
        };
        
        // Touch end
        const handleTouchEnd = () => {
            clearTimeout(longPressTimer);
            const wasLongPress = longPressTimer !== null;
            longPressTimer = null;
            
            if (isSwiping) {
                content.style.transition = 'transform 0.3s ease';
                
                // If swiped far enough, show actions
                if (swipeRevealed) {
                    // Already revealed, check if swiping back
                    if (moveX > 50) {
                        content.style.transform = 'translateX(0)';
                        swipeRevealed = false;
                    } else {
                        content.style.transform = 'translateX(-150px)';
                    }
                } else {
                    // Not revealed, check if swiping left
                    if (moveX < -80) {
                        content.style.transform = 'translateX(-150px)';
                        swipeRevealed = true;
                    } else {
                        content.style.transform = 'translateX(0)';
                    }
                }
                
                isSwiping = false;
            } else if (!wasLongPress && Math.abs(moveX) < 10) {
                // Regular click (only if no long press was started and minimal movement)
                if (swipeRevealed) {
                    // If actions are revealed, close them on tap
                    content.style.transition = 'transform 0.3s ease';
                    content.style.transform = 'translateX(0)';
                    swipeRevealed = false;
                } else {
                    this.showItemDetails(item);
                }
            }
            
            startX = 0;
            startY = 0;
            currentX = 0;
            moveX = 0;
        };
        
        // Mouse events for desktop
        const handleMouseDown = (e) => {
            startX = e.clientX;
            startY = e.clientY;
            
            // Long press for desktop (right-click prevention)
            longPressTimer = setTimeout(() => {
                this.openEditModal(item);
            }, 500);
        };
        
        const handleMouseMove = (e) => {
            if (longPressTimer && startX) {
                const diffX = Math.abs(e.clientX - startX);
                const diffY = Math.abs(e.clientY - startY);
                if (diffX > 10 || diffY > 10) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
        };
        
        const handleMouseUp = () => {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        };
        
        // Add event listeners
        content.addEventListener('touchstart', handleTouchStart, { passive: false });
        content.addEventListener('touchmove', handleTouchMove, { passive: false });
        content.addEventListener('touchend', handleTouchEnd);
        content.addEventListener('touchcancel', handleTouchEnd);
        
        content.addEventListener('mousedown', handleMouseDown);
        content.addEventListener('mousemove', handleMouseMove);
        content.addEventListener('mouseup', handleMouseUp);
        content.addEventListener('mouseleave', handleMouseUp);
        
        // Action buttons
        itemEl.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(item);
        });
        
        itemEl.querySelector('.delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.deleteItemWithConfirmation(item.id);
        });
    },

    /**
     * Update value analysis
     */
    async updateValueAnalysis() {
        const stats = await warehouseDB.getStats();
        const topItems = stats.topValueItems.slice(0, 5);

        const container = this.elements.topValueItems;
        container.innerHTML = '';

        topItems.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.innerHTML = `
                <div class="item-icon">${index + 1}</div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-meta">
                        <span>📍 ${item.location}</span>
                    </div>
                </div>
                <div class="item-value">$${item.value.toLocaleString()}</div>
            `;
            container.appendChild(itemEl);
        });
    },

    /**
     * Show item details modal
     */
    showItemDetails(item) {
        const modal = this.elements.itemModal;
        const detailsEl = modal.querySelector('#itemDetails');
        
        // Build location history HTML
        let locationHistoryHtml = '';
        if (item.locationHistory && item.locationHistory.length > 0) {
            locationHistoryHtml = `
                <div style="margin-bottom: 1rem;">
                    <strong>Location History:</strong>
                    <div style="margin-left: 1rem; margin-top: 0.5rem; font-size: 0.9rem;">
                        ${item.locationHistory.map((entry, index) => `
                            <div style="margin-bottom: 0.25rem; ${index === item.locationHistory.length - 1 ? 'color: #22c55e; font-weight: bold;' : 'color: #6b7280;'}">
                                📍 ${entry.location} - ${this.formatDate(entry.timestamp)}
                                ${index === item.locationHistory.length - 1 ? ' (Current)' : ''}
                            </div>
                        `).reverse().join('')}
                    </div>
                </div>
            `;
        }
        
        // Build visual ID HTML if available
        let visualIdHtml = '';
        if (item.visualId) {
            visualIdHtml = `
                <div style="margin-bottom: 1rem;">
                    <strong>Visual ID:</strong> 
                    <code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">${item.visualId}</code>
                </div>
            `;
        }
        
        // Last seen info
        let lastSeenHtml = '';
        if (item.lastSeenAt) {
            lastSeenHtml = `
                <div style="margin-bottom: 1rem;">
                    <strong>Last Seen:</strong> ${this.formatDate(item.lastSeenAt)}
                </div>
            `;
        }
        
        detailsEl.innerHTML = `
            ${item.imageData ? `<img src="${item.imageData}" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">` : ''}
            <div style="margin-bottom: 1rem;">
                <strong>Name:</strong> ${item.name}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Category:</strong> ${item.category}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Current Location:</strong> ${item.location}
            </div>
            ${locationHistoryHtml}
            <div style="margin-bottom: 1rem;">
                <strong>Quantity:</strong> ${item.quantity}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Value:</strong> $${item.value.toLocaleString()} per unit
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Total Value:</strong> $${(item.value * item.quantity).toLocaleString()}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>First Scanned:</strong> ${this.formatDate(item.scannedAt)}
            </div>
            ${lastSeenHtml}
            ${visualIdHtml}
        `;

        modal.classList.remove('hidden');
    },

    /**
     * Show location details
     */
    async showLocationDetails(locationId) {
        const items = await warehouseDB.getAllItems({ location: locationId });
        
        if (items.length === 0) {
            this.showToast(`No items in location ${locationId}`, 'info');
            return;
        }

        const totalValue = items.reduce((sum, item) => sum + item.value * item.quantity, 0);

        alert(`Location ${locationId}\n\nItems: ${items.length}\nTotal Value: $${totalValue.toLocaleString()}`);
    },

    /**
     * Toggle detection mode
     */
    toggleDetectionMode() {
        const currentMode = scannerAI.detectionMode;
        const newMode = currentMode === 'object' ? 'barcode' : 'object';
        scannerAI.setDetectionMode(newMode);
        
        this.elements.toggleMode.textContent = newMode === 'object' ? '📸' : '🔲';
        this.showToast(`Mode: ${newMode === 'object' ? 'Object Detection' : 'Barcode Scanning'}`, 'info');
    },

    /**
     * Open settings modal
     */
    openSettings() {
        this.elements.settingsModal.classList.remove('hidden');
    },

    /**
     * Close modal
     */
    closeModal(modal) {
        modal.classList.add('hidden');
    },

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        // Load auto-features settings
        this.autoCapture = localStorage.getItem('autoCapture') !== 'false';
        this.autoIdentify = localStorage.getItem('autoIdentify') !== 'false';
        this.autoValuation = localStorage.getItem('autoValuation') !== 'false';
        this.confidenceThreshold = parseInt(localStorage.getItem('confidenceThreshold') || '80');
        
        // Update checkboxes
        document.getElementById('autoCapture').checked = this.autoCapture;
        document.getElementById('autoIdentify').checked = this.autoIdentify;
        document.getElementById('autoValuation').checked = this.autoValuation;
        document.getElementById('confidenceThreshold').value = this.confidenceThreshold;
        document.getElementById('confidenceThresholdValue').textContent = this.confidenceThreshold;
        
        // Load other settings
        document.getElementById('voiceCommands').checked = 
            localStorage.getItem('voiceCommands') !== 'false';
        document.getElementById('aiHelper').checked = 
            localStorage.getItem('aiHelperEnabled') !== 'false';
        document.getElementById('warehouseId').value = 
            localStorage.getItem('warehouseId') || '';
        document.getElementById('defaultLocation').value = 
            localStorage.getItem('defaultLocation') || '';
            
        // Setup confidence threshold slider
        const thresholdSlider = document.getElementById('confidenceThreshold');
        thresholdSlider.addEventListener('input', (e) => {
            document.getElementById('confidenceThresholdValue').textContent = e.target.value;
        });
    },

    /**
     * Save settings
     */
    saveSettings() {
        // Save auto-features settings
        this.autoCapture = document.getElementById('autoCapture').checked;
        this.autoIdentify = document.getElementById('autoIdentify').checked;
        this.autoValuation = document.getElementById('autoValuation').checked;
        this.confidenceThreshold = parseInt(document.getElementById('confidenceThreshold').value);
        
        localStorage.setItem('autoCapture', this.autoCapture);
        localStorage.setItem('autoIdentify', this.autoIdentify);
        localStorage.setItem('autoValuation', this.autoValuation);
        localStorage.setItem('confidenceThreshold', this.confidenceThreshold);
        
        // Save other settings
        localStorage.setItem('voiceCommands', 
            document.getElementById('voiceCommands').checked);
        localStorage.setItem('aiHelperEnabled', 
            document.getElementById('aiHelper').checked);
        localStorage.setItem('warehouseId', 
            document.getElementById('warehouseId').value);
        localStorage.setItem('defaultLocation', 
            document.getElementById('defaultLocation').value);

        aiHelper.setVoiceEnabled(document.getElementById('voiceCommands').checked);

        // Show confirmation with auto-features status
        const activeFeatures = [];
        if (this.autoCapture) activeFeatures.push('Auto-Capture');
        if (this.autoIdentify) activeFeatures.push('Auto-Identify');
        if (this.autoValuation) activeFeatures.push('Auto-Value');
        
        const message = activeFeatures.length > 0 
            ? `Settings saved! Active: ${activeFeatures.join(', ')}` 
            : 'Settings saved';
            
        this.showToast(message, 'success');
    },

    /**
     * Export data
     */
    async exportData() {
        try {
            const data = await warehouseDB.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `warehouse-inventory-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showToast('Data exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Export failed', 'error');
        }
    },

    /**
     * Import data
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const text = await file.text();
                const data = JSON.parse(text);
                await warehouseDB.importData(data);
                await this.updateInventoryView();
                this.showToast('Data imported successfully', 'success');
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Import failed', 'error');
            }
        };
        input.click();
    },

    /**
     * Show AI helper message
     */
    showAIHelper(message) {
        const helper = this.elements.aiHelper;
        const messageEl = helper.querySelector('.ai-helper-message');
        
        messageEl.textContent = message.text;
        helper.classList.remove('hidden');
    },

    /**
     * Hide AI helper
     */
    hideAIHelper() {
        this.elements.aiHelper.classList.add('hidden');
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    },
    
    /**
     * Show auto-capture visual indicator
     */
    showAutoCaptureIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'auto-capture-indicator';
        indicator.innerHTML = '📸 AUTO-CAPTURED';
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(34, 197, 94, 0.95);
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: bold;
            font-size: 1.25rem;
            z-index: 10000;
            animation: captureFlash 0.5s ease-out;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 1000);
    },

    /**
     * Show loading overlay
     */
    showLoading(text = 'Loading...') {
        this.elements.loadingOverlay.querySelector('.loading-text').textContent = text;
        this.elements.loadingOverlay.classList.remove('hidden');
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    },

    /**
     * Open edit modal for item
     */
    openEditModal(item) {
        const modal = this.elements.editModal || this.createEditModal();
        const form = modal.querySelector('#editItemForm');
        
        // Populate form with item data
        form.querySelector('#editItemId').value = item.id;
        form.querySelector('#editItemName').value = item.name;
        form.querySelector('#editItemCategory').value = item.category;
        form.querySelector('#editItemQuantity').value = item.quantity;
        form.querySelector('#editItemValue').value = item.value;
        form.querySelector('#editItemLocation').value = item.location;
        form.querySelector('#editItemCondition').value = item.condition || 'unknown';
        form.querySelector('#editItemNotes').value = item.notes || '';
        form.querySelector('#editItemStatus').value = item.status || 'scanned';
        
        modal.classList.remove('hidden');
    },
    
    /**
     * Create edit modal if it doesn't exist
     */
    createEditModal() {
        const modal = document.createElement('div');
        modal.id = 'editModal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ Edit Item</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editItemForm" class="edit-form">
                        <input type="hidden" id="editItemId">
                        
                        <div class="form-group">
                            <label for="editItemName">Item Name *</label>
                            <input type="text" id="editItemName" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editItemCategory">Category</label>
                                <select id="editItemCategory">
                                    <option value="computer">Computer</option>
                                    <option value="laptop">Laptop</option>
                                    <option value="printer">Printer</option>
                                    <option value="monitor">Monitor</option>
                                    <option value="server">Server</option>
                                    <option value="tablet">Tablet</option>
                                    <option value="network">Network</option>
                                    <option value="electronics">Electronics</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="editItemCondition">Condition</label>
                                <select id="editItemCondition">
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                    <option value="unknown">Unknown</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editItemQuantity">Quantity *</label>
                                <input type="number" id="editItemQuantity" min="0" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editItemValue">Value per Unit ($) *</label>
                                <input type="number" id="editItemValue" min="0" step="0.01" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editItemLocation">Location</label>
                                <input type="text" id="editItemLocation" placeholder="e.g., A1">
                            </div>
                            
                            <div class="form-group">
                                <label for="editItemStatus">Status</label>
                                <select id="editItemStatus">
                                    <option value="scanned">In Stock</option>
                                    <option value="sold">Sold</option>
                                    <option value="reserved">Reserved</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="editItemNotes">Notes</label>
                            <textarea id="editItemNotes" rows="3" placeholder="Additional notes..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button id="cancelEditBtn" class="btn-secondary">Cancel</button>
                    <button id="saveEditBtn" class="btn-primary">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.elements.editModal = modal;
        
        // Add event listeners
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        modal.querySelector('#cancelEditBtn').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        modal.querySelector('#saveEditBtn').addEventListener('click', async () => {
            await this.saveItemEdit();
        });
        
        return modal;
    },
    
    /**
     * Save item edit
     */
    async saveItemEdit() {
        const form = document.getElementById('editItemForm');
        const itemId = parseInt(form.querySelector('#editItemId').value);
        
        const updates = {
            name: form.querySelector('#editItemName').value,
            category: form.querySelector('#editItemCategory').value,
            quantity: parseInt(form.querySelector('#editItemQuantity').value),
            value: parseFloat(form.querySelector('#editItemValue').value),
            location: form.querySelector('#editItemLocation').value,
            condition: form.querySelector('#editItemCondition').value,
            notes: form.querySelector('#editItemNotes').value,
            status: form.querySelector('#editItemStatus').value
        };
        
        try {
            await warehouseDB.updateItem(itemId, updates);
            this.showToast('Item updated successfully', 'success');
            this.elements.editModal.classList.add('hidden');
            await this.updateInventoryView();
        } catch (error) {
            console.error('Error updating item:', error);
            this.showToast('Failed to update item', 'error');
        }
    },
    
    /**
     * Delete item with confirmation
     */
    async deleteItemWithConfirmation(itemId) {
        const item = await warehouseDB.getItem(itemId);
        if (!item) return;
        
        const confirmed = confirm(`Delete "${item.name}"?\n\nThis action cannot be undone.`);
        if (!confirmed) return;
        
        try {
            await warehouseDB.deleteItem(itemId);
            this.showToast('Item deleted successfully', 'success');
            await this.updateInventoryView();
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showToast('Failed to delete item', 'error');
        }
    },

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            computer: '🖥️',
            laptop: '💻',
            printer: '🖨️',
            monitor: '🖥️',
            server: '🗄️',
            tablet: '📱',
            network: '🌐',
            electronics: '⚡'
        };
        return icons[category] || '📦';
    },

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    }
};

// Expose to window for HTML onclick handlers
window.WarehouseScannerUI = WarehouseScannerUI;
