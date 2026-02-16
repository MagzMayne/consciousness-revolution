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
 * File: service-worker.js
 * Declaration ID: IP-18B258A1-MLL28ZVV
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/** SIGNED BY MeRLynn - ID: MERLYNN-6f81d816 - TIMESTAMP: 2025-12-19T05:53:06.531Z - HASH: 103e52f2 */
/** SIGNED BY AGentR - ID: AGENTR-7c15f25d - TIMESTAMP: 2025-12-19T05:53:06.531Z - HASH: 103e52f2 */

/**
 * SERVICE WORKER - Offline Support & Sync
 * Enables all projects to work offline and sync when back online
 */

const CACHE_NAME = 'barbrickdesign-v9-performance';
const OFFLINE_URL = 'offline.html';

// Files to cache for offline access - only essential working files
const CACHE_URLS = [
    '/',
    '/index.html',
    '/css/mobile-enhanced.css',
    '/src/core/universal-wallet-auth.js',
    '/src/core/auth-integration.js',
    '/src/utils/shared-utilities.js',
    '/src/utils/shared-wallet-system.js',
    '/src/ui/wallet-button.js',
    '/src/ui/wallet-button.css'
];

// Cache strategies
const CACHE_STRATEGIES = {
    // Cache first, fallback to network (for static assets)
    cacheFirst: ['css', 'js', 'woff2', 'woff', 'ttf'],
    // Network first, fallback to cache (for HTML)
    networkFirst: ['html'],
    // Network only (for API calls)
    networkOnly: ['api']
};

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing v8...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching essential files only');
                return cache.addAll(CACHE_URLS.map(url => new Request(url, {cache: 'reload'})));
            })
            .catch((error) => {
                console.error('[Service Worker] Cache install failed:', error);
                // Don't fail the install if caching fails - let it activate anyway
            })
    );

    // Force immediate activation - skip waiting
    console.log('[Service Worker] Skipping waiting for immediate activation');
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
    // Skip chrome extensions and non-http requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // Bypass caching for complex pages that load external resources
    const bypassCacheUrls = [
        '/mandem.os/workspace/index.html',
        '/ember-terminal/app.html',
        '/classified-contracts.html',
        '/grand-exchange.html'
    ];

    const shouldBypassCache = bypassCacheUrls.some(url =>
        event.request.url.includes(url)
    );

    if (shouldBypassCache) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Get file extension
    const url = new URL(event.request.url);
    const extension = url.pathname.split('.').pop();

    // Apply cache strategy based on file type
    if (CACHE_STRATEGIES.cacheFirst.includes(extension)) {
        // Cache first for static assets
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((response) => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                });
            })
        );
    } else if (CACHE_STRATEGIES.networkFirst.includes(extension)) {
        // Network first for HTML
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then((response) => {
                        return response || caches.match(OFFLINE_URL);
                    });
                })
        );
    } else {
        // Default strategy - network with cache fallback
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200 && event.request.method === 'GET') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then((response) => {
                        return response || new Response('Offline - Content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
                })
        );
    }
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
    
    if (event.tag === 'sync-time-entries') {
        event.waitUntil(syncTimeEntries());
    }
    
    if (event.tag === 'sync-wallet-state') {
        event.waitUntil(syncWalletState());
    }
});

// Sync functions
async function syncData() {
    try {
        console.log('[Service Worker] Syncing data...');
        
        // Get pending data from IndexedDB
        const pendingData = await getPendingData();
        
        if (pendingData && pendingData.length > 0) {
            for (const item of pendingData) {
                try {
                    // Send to server/blockchain
                    await fetch('/api/sync', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(item)
                    });
                    
                    // Mark as synced
                    await markAsSynced(item.id);
                } catch (error) {
                    console.error('[Service Worker] Sync failed for item:', item.id, error);
                }
            }
        }
        
        console.log('[Service Worker] Data sync complete');
    } catch (error) {
        console.error('[Service Worker] Sync error:', error);
        throw error;
    }
}

async function syncTimeEntries() {
    try {
        console.log('[Service Worker] Syncing time entries...');
        
        // Sync compensation calculator time entries
        const timeEntries = await getStoredTimeEntries();
        
        if (timeEntries && timeEntries.length > 0) {
            // Backup to cloud/blockchain when online
            console.log(`[Service Worker] Found ${timeEntries.length} time entries to sync`);
        }
        
        return true;
    } catch (error) {
        console.error('[Service Worker] Time entry sync error:', error);
        throw error;
    }
}

async function syncWalletState() {
    try {
        console.log('[Service Worker] Syncing wallet state...');
        
        // Restore wallet connections when back online
        const walletState = await getStoredWalletState();
        
        if (walletState) {
            console.log('[Service Worker] Wallet state ready for restoration');
        }
        
        return true;
    } catch (error) {
        console.error('[Service Worker] Wallet sync error:', error);
        throw error;
    }
}

// Helper functions for IndexedDB operations
async function getPendingData() {
    // This would interface with IndexedDB
    // For now, return empty array
    return [];
}

async function markAsSynced(id) {
    // Mark item as synced in IndexedDB
    console.log('[Service Worker] Marked as synced:', id);
}

async function getStoredTimeEntries() {
    // Get time entries from localStorage/IndexedDB
    try {
        const entries = localStorage.getItem('timeEntries');
        return entries ? JSON.parse(entries) : [];
    } catch {
        return [];
    }
}

async function getStoredWalletState() {
    // Get wallet state from localStorage
    try {
        const state = localStorage.getItem('walletState');
        return state ? JSON.parse(state) : null;
    } catch {
        return null;
    }
}

// Message handling
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[Service Worker] Skipping waiting, activating immediately');
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

console.log('[Service Worker] Loaded and ready');
