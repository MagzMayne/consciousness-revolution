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
 * File: grid-control-sw.js
 * Declaration ID: IP-48AD6A5C-MLL28ZV0
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Grid Control Service Worker
 * ============================
 * Ensures the application is always online and reachable
 * Implements offline caching and background sync
 */

const CACHE_NAME = 'grid-control-v1';
const RUNTIME_CACHE = 'grid-control-runtime-v1';

// Assets to cache for offline use
const ASSETS_TO_CACHE = [
  '/aiGridLink.html',
  '/self-healing.js',
  '/anti-nuke-safety.js',
  '/ethical-safeguards.js',
  '/fibonacci-vehicle-safety.js',
  '/wake-on-lan.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching assets');
        return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, {cache: 'reload'})));
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Cache install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests differently (network-first)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Handle static assets (cache-first)
  event.respondWith(cacheFirst(request));
});

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached version and update in background
    fetchAndCache(request);
    return cached;
  }
  
  // Not in cache, fetch from network
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    
    // Return offline page if available
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Return a basic error response
    return new Response('Offline - Grid Control System unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Network-first strategy (for API calls)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.warn('[Service Worker] Network request failed, trying cache:', error);
    
    // Try to serve from cache
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return error response
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      offline: true
    }), {
      status: 503,
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}

// Background fetch and cache update
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// Background sync for queued operations
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-grid-data') {
    event.waitUntil(syncGridData());
  }
  
  if (event.tag === 'sync-pulse-modulation') {
    event.waitUntil(syncPulseModulation());
  }
});

// Sync grid data when back online
async function syncGridData() {
  try {
    console.log('[Service Worker] Syncing grid data...');
    
    // Get pending operations from IndexedDB or localStorage
    // Send them to the backend
    
    const response = await fetch('/api/grid/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        type: 'background-sync'
      })
    });
    
    if (response.ok) {
      console.log('[Service Worker] Grid data synced successfully');
    }
  } catch (error) {
    console.error('[Service Worker] Grid data sync failed:', error);
    throw error; // Will retry
  }
}

// Sync pulse modulation data
async function syncPulseModulation() {
  try {
    console.log('[Service Worker] Syncing pulse modulation data...');
    
    // Send queued pulse data
    const response = await fetch('/api/modulation/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        type: 'pulse-sync'
      })
    });
    
    if (response.ok) {
      console.log('[Service Worker] Pulse modulation synced successfully');
    }
  } catch (error) {
    console.error('[Service Worker] Pulse modulation sync failed:', error);
    throw error; // Will retry
  }
}

// Push notifications for grid alerts
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'Grid Alert';
  const options = {
    body: data.body || 'Grid system notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'grid-alert',
    data: data,
    requireInteraction: data.priority === 'high'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/aiGridLink.html')
  );
});

// Message handler for communication with clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache());
  }
});

// Update cache on demand
async function updateCache() {
  const cache = await caches.open(CACHE_NAME);
  
  for (const asset of ASSETS_TO_CACHE) {
    try {
      const response = await fetch(asset);
      if (response.ok) {
        await cache.put(asset, response);
      }
    } catch (error) {
      console.error('[Service Worker] Failed to update cache for:', asset);
    }
  }
}

console.log('[Service Worker] Loaded - Grid Control System Always Online');
