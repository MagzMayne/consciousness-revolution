// RootIB: RB-20260319142113-AF8E93E2
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
 * File: warehouse-inventory-db.js
 * Declaration ID: IP-342D7E02-MLL28ZVC
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Warehouse Inventory Database Manager
 * Handles all data storage and retrieval using IndexedDB
 */

class WarehouseInventoryDB {
    constructor() {
        this.db = null;
        this.dbName = 'WarehouseInventoryDB';
        this.dbVersion = 2; // Incremented for schema update
        this.initialized = false;
    }

    /**
     * Initialize the IndexedDB database
     */
    async init() {
        if (this.initialized) return true;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Database failed to open:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.initialized = true;
                console.log('✅ Database initialized successfully');
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const oldVersion = event.oldVersion;

                // Inventory Items Store
                if (!db.objectStoreNames.contains('items')) {
                    const itemStore = db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
                    itemStore.createIndex('category', 'category', { unique: false });
                    itemStore.createIndex('location', 'location', { unique: false });
                    itemStore.createIndex('scannedAt', 'scannedAt', { unique: false });
                    itemStore.createIndex('value', 'value', { unique: false });
                    itemStore.createIndex('status', 'status', { unique: false });
                    itemStore.createIndex('visualId', 'visualId', { unique: false });
                } else if (oldVersion < 2) {
                    // Upgrade from v1 to v2 - add visualId index
                    const transaction = event.target.transaction;
                    const itemStore = transaction.objectStore('items');
                    if (!itemStore.indexNames.contains('visualId')) {
                        itemStore.createIndex('visualId', 'visualId', { unique: false });
                    }
                }

                // Warehouse Locations Store
                if (!db.objectStoreNames.contains('locations')) {
                    const locationStore = db.createObjectStore('locations', { keyPath: 'id' });
                    locationStore.createIndex('zone', 'zone', { unique: false });
                }

                // Scan Sessions Store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                    sessionStore.createIndex('startTime', 'startTime', { unique: false });
                }

                console.log('✅ Database schema created/updated');
            };
        });
    }

    /**
     * Add a new inventory item
     */
    async addItem(itemData) {
        if (!this.db) await this.init();

        const item = {
            name: itemData.name || 'Unknown Item',
            category: itemData.category || 'electronics',
            type: itemData.type || 'unknown',
            model: itemData.model || '',
            manufacturer: itemData.manufacturer || '',
            condition: itemData.condition || 'unknown',
            quantity: itemData.quantity || 1,
            value: itemData.value || 0,
            estimatedValue: itemData.estimatedValue || 0,
            location: itemData.location || 'Unknown',
            zone: itemData.zone || 'A',
            tier: itemData.tier || 1,
            barcode: itemData.barcode || '',
            serialNumber: itemData.serialNumber || '',
            notes: itemData.notes || '',
            imageData: itemData.imageData || null,
            visualId: itemData.visualId || null,
            // Store precise GPS coordinates if provided
            latitude: itemData.latitude || null,
            longitude: itemData.longitude || null,
            gpsAccuracy: itemData.gpsAccuracy || null,
            scannedAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            status: itemData.status || 'scanned',
            tags: itemData.tags || [],
            locationHistory: itemData.locationHistory || [{
                location: itemData.location || 'Unknown',
                timestamp: new Date().toISOString()
            }]
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.add(item);

            request.onsuccess = () => {
                console.log('✅ Item added to database:', request.result);
                resolve({ ...item, id: request.result });
            };

            request.onerror = () => {
                console.error('❌ Error adding item:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Find item by visual ID (checks for duplicates)
     */
    async findItemByVisualId(visualId) {
        if (!this.db) await this.init();
        if (!visualId) return null;

        const items = await this.getAllItems();
        return items.find(item => item.visualId === visualId);
    }

    /**
     * Update item location and log to history
     */
    async updateItemLocation(itemId, newLocation) {
        if (!this.db) await this.init();

        const item = await this.getItem(itemId);
        if (!item) {
            throw new Error('Item not found');
        }

        // Check if location actually changed
        if (item.location === newLocation) {
            // Just update last seen time
            item.lastSeenAt = new Date().toISOString();
        } else {
            // Location changed - update and log
            item.location = newLocation;
            item.lastSeenAt = new Date().toISOString();
            
            // Add to location history
            if (!item.locationHistory) {
                item.locationHistory = [];
            }
            item.locationHistory.push({
                location: newLocation,
                timestamp: new Date().toISOString()
            });

            console.log(`📍 Item ${itemId} moved to ${newLocation}`);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.put(item);

            request.onsuccess = () => {
                console.log('✅ Item location updated:', itemId);
                resolve(item);
            };

            request.onerror = () => {
                console.error('❌ Error updating item location:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Check if item is already in inventory (by visual ID or barcode)
     * Returns existing item if found, null otherwise
     */
    async checkForDuplicate(itemData) {
        if (!this.db) await this.init();

        // Check by visual ID first (most reliable for same physical item)
        if (itemData.visualId) {
            const existingItem = await this.findItemByVisualId(itemData.visualId);
            if (existingItem) {
                return {
                    isDuplicate: true,
                    existingItem,
                    matchType: 'visualId'
                };
            }
        }

        // Check by barcode if available
        if (itemData.barcode) {
            const items = await this.getAllItems();
            const barcodeMatch = items.find(item => item.barcode === itemData.barcode);
            if (barcodeMatch) {
                return {
                    isDuplicate: true,
                    existingItem: barcodeMatch,
                    matchType: 'barcode'
                };
            }
        }

        // Check by serial number if available
        if (itemData.serialNumber) {
            const items = await this.getAllItems();
            const serialMatch = items.find(item => item.serialNumber === itemData.serialNumber);
            if (serialMatch) {
                return {
                    isDuplicate: true,
                    existingItem: serialMatch,
                    matchType: 'serialNumber'
                };
            }
        }

        return {
            isDuplicate: false,
            existingItem: null,
            matchType: null
        };
    }

    /**
     * Get all items from inventory
     */
    async getAllItems(filters = {}) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readonly');
            const store = transaction.objectStore('items');
            const request = store.getAll();

            request.onsuccess = () => {
                let items = request.result;

                // Apply filters
                if (filters.category) {
                    items = items.filter(item => item.category === filters.category);
                }
                if (filters.location) {
                    items = items.filter(item => item.location === filters.location);
                }
                if (filters.status) {
                    items = items.filter(item => item.status === filters.status);
                }
                if (filters.minValue) {
                    items = items.filter(item => item.value >= filters.minValue);
                }
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    items = items.filter(item => 
                        item.name.toLowerCase().includes(searchLower) ||
                        item.model.toLowerCase().includes(searchLower) ||
                        item.manufacturer.toLowerCase().includes(searchLower)
                    );
                }

                resolve(items);
            };

            request.onerror = () => {
                console.error('❌ Error getting items:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get item by ID
     */
    async getItem(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readonly');
            const store = transaction.objectStore('items');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update an existing item
     */
    async updateItem(id, updates) {
        if (!this.db) await this.init();

        const item = await this.getItem(id);
        if (!item) {
            throw new Error('Item not found');
        }

        const updatedItem = { ...item, ...updates };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.put(updatedItem);

            request.onsuccess = () => {
                console.log('✅ Item updated:', id);
                resolve(updatedItem);
            };

            request.onerror = () => {
                console.error('❌ Error updating item:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Delete an item
     */
    async deleteItem(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('✅ Item deleted:', id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('❌ Error deleting item:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get inventory statistics
     */
    async getStats() {
        const items = await this.getAllItems();

        const stats = {
            totalItems: items.length,
            totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
            totalValue: items.reduce((sum, item) => sum + (item.value * item.quantity), 0),
            scannedToday: items.filter(item => {
                const scannedDate = new Date(item.scannedAt);
                const today = new Date();
                return scannedDate.toDateString() === today.toDateString();
            }).length,
            byCategory: {},
            byLocation: {},
            byCondition: {},
            topValueItems: []
        };

        // Group by category
        items.forEach(item => {
            if (!stats.byCategory[item.category]) {
                stats.byCategory[item.category] = { count: 0, value: 0 };
            }
            stats.byCategory[item.category].count += item.quantity;
            stats.byCategory[item.category].value += item.value * item.quantity;
        });

        // Group by location
        items.forEach(item => {
            if (!stats.byLocation[item.location]) {
                stats.byLocation[item.location] = { count: 0, value: 0 };
            }
            stats.byLocation[item.location].count += item.quantity;
            stats.byLocation[item.location].value += item.value * item.quantity;
        });

        // Group by condition
        items.forEach(item => {
            if (!stats.byCondition[item.condition]) {
                stats.byCondition[item.condition] = 0;
            }
            stats.byCondition[item.condition] += item.quantity;
        });

        // Top value items
        stats.topValueItems = items
            .sort((a, b) => (b.value * b.quantity) - (a.value * a.quantity))
            .slice(0, 10)
            .map(item => ({
                id: item.id,
                name: item.name,
                value: item.value * item.quantity,
                location: item.location
            }));

        return stats;
    }

    /**
     * Export all data
     */
    async exportData() {
        const items = await this.getAllItems();
        const stats = await this.getStats();

        return {
            exportDate: new Date().toISOString(),
            version: this.dbVersion,
            items,
            stats
        };
    }

    /**
     * Import data
     */
    async importData(data) {
        if (!data || !data.items) {
            throw new Error('Invalid import data');
        }

        const imported = [];
        for (const item of data.items) {
            try {
                const newItem = await this.addItem(item);
                imported.push(newItem);
            } catch (error) {
                console.error('Error importing item:', error);
            }
        }

        return imported;
    }

    /**
     * Clear all data
     */
    async clearAll() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.clear();

            request.onsuccess = () => {
                console.log('✅ All data cleared');
                resolve(true);
            };

            request.onerror = () => {
                console.error('❌ Error clearing data:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Start a new scan session
     */
    async startSession(sessionData = {}) {
        if (!this.db) await this.init();

        const session = {
            startTime: new Date().toISOString(),
            warehouseId: sessionData.warehouseId || 'default',
            operator: sessionData.operator || 'unknown',
            itemsScanned: 0,
            totalValue: 0,
            status: 'active'
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const request = store.add(session);

            request.onsuccess = () => {
                console.log('✅ Session started:', request.result);
                resolve({ ...session, id: request.result });
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * End a scan session
     */
    async endSession(sessionId, finalData = {}) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(sessionId);

            getRequest.onsuccess = () => {
                const session = getRequest.result;
                if (!session) {
                    reject(new Error('Session not found'));
                    return;
                }

                session.endTime = new Date().toISOString();
                session.status = 'completed';
                session.itemsScanned = finalData.itemsScanned || session.itemsScanned;
                session.totalValue = finalData.totalValue || session.totalValue;

                const putRequest = store.put(session);
                putRequest.onsuccess = () => resolve(session);
                putRequest.onerror = () => reject(putRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }
}

// Create global instance
const warehouseDB = new WarehouseInventoryDB();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WarehouseInventoryDB;
}
