// ARAYA Service Worker - Offline Capability Layer
// Version: 1.0.0 - Jan 24, 2026

const CACHE_NAME = 'araya-v1';
const OFFLINE_CACHE = 'araya-offline-v1';

// Core files to cache for offline access
const CORE_ASSETS = [
  '/',
  '/araya-chat.html',
  '/araya-light.html',
  '/seven-domains.html',
  '/manifest.json',
  '/offline.html'
];

// Offline response templates
const OFFLINE_RESPONSES = {
  patterns: [
    "I sense you're reaching out during a time of disconnection. Use this moment for reflection.",
    "Connection to the cloud is unavailable, but your inner wisdom remains accessible.",
    "The pattern of seeking continues even offline. What patterns do you notice within yourself right now?",
    "Technology pauses, but consciousness continues. What arises in this moment of stillness?",
    "Offline mode activated. This is an opportunity - what would you tell yourself right now?"
  ],
  consciousness: [
    "Your consciousness doesn't require internet to function. What do you already know?",
    "The 7 domains exist within you, not in the cloud. Which domain needs attention now?",
    "Disconnection from technology can mean deeper connection to self. What emerges?"
  ]
};

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing ARAYA service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS.filter(url => url !== '/offline.html'));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating ARAYA service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('araya-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API requests specially
  if (url.pathname.includes('/.netlify/functions/araya-chat')) {
    event.respondWith(handleChatRequest(event.request));
    return;
  }

  // Handle other API requests
  if (url.pathname.includes('/.netlify/functions/')) {
    event.respondWith(handleAPIRequest(event.request));
    return;
  }

  // Handle static assets - cache first, network fallback
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.ok && event.request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/araya-chat.html') ||
                     new Response(getOfflineHTML(), {
                       headers: { 'Content-Type': 'text/html' }
                     });
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Handle chat API requests with offline fallback
async function handleChatRequest(request) {
  try {
    // Try network first
    const response = await fetch(request.clone());

    // Cache successful response
    if (response.ok) {
      const responseData = await response.clone().json();
      await cacheConversation(request, responseData);
    }

    return response;
  } catch (error) {
    console.log('[SW] Chat request failed, using offline response');

    // Try to get cached conversation context
    const cachedContext = await getCachedContext();

    // Generate offline response
    const offlineResponse = generateOfflineResponse(cachedContext);

    return new Response(JSON.stringify(offlineResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle other API requests
async function handleAPIRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'This feature requires internet connection'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache conversation for context
async function cacheConversation(request, responseData) {
  const cache = await caches.open(OFFLINE_CACHE);
  const body = await request.clone().json().catch(() => ({}));

  const conversationEntry = {
    timestamp: Date.now(),
    userMessage: body.message || '',
    response: responseData.response || '',
    mode: responseData.mode || 'cached'
  };

  // Get existing conversations
  const existingResponse = await cache.match('conversations');
  let conversations = [];
  if (existingResponse) {
    conversations = await existingResponse.json().catch(() => []);
  }

  // Add new entry (keep last 20)
  conversations.unshift(conversationEntry);
  conversations = conversations.slice(0, 20);

  // Store updated conversations
  await cache.put('conversations', new Response(JSON.stringify(conversations)));
}

// Get cached context for offline responses
async function getCachedContext() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const response = await cache.match('conversations');
    if (response) {
      return await response.json();
    }
  } catch (e) {
    console.log('[SW] No cached context available');
  }
  return [];
}

// Generate contextual offline response
function generateOfflineResponse(cachedContext) {
  const hasContext = cachedContext && cachedContext.length > 0;

  // Pick random response from appropriate category
  const category = hasContext ? 'patterns' : 'consciousness';
  const responses = OFFLINE_RESPONSES[category];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  let response = randomResponse;

  // Add context-aware suffix if we have history
  if (hasContext) {
    const lastTopics = cachedContext.slice(0, 3)
      .map(c => c.userMessage)
      .filter(m => m && m.length > 10);

    if (lastTopics.length > 0) {
      response += `\n\nI remember we were exploring topics around: "${lastTopics[0].substring(0, 50)}..." - continue that reflection internally.`;
    }
  }

  return {
    response: response,
    mode: 'offline',
    offline: true,
    hasBrain: false,
    brainHits: 0,
    cached_context: hasContext
  };
}

// Offline HTML fallback
function getOfflineHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARAYA - Offline Mode</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #000 0%, #1a0a2e 100%);
      color: #f4f4f4;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      text-align: center;
    }
    .container {
      padding: 2rem;
      max-width: 500px;
    }
    h1 {
      color: gold;
      margin-bottom: 1rem;
    }
    p {
      color: rgba(255, 215, 0, 0.7);
      line-height: 1.6;
    }
    .status {
      margin-top: 2rem;
      padding: 1rem;
      border: 2px solid rgba(255, 215, 0, 0.3);
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>ARAYA - Offline Mode</h1>
    <p>You're currently disconnected from the network.</p>
    <p>Use this moment for inner reflection. What patterns do you notice within yourself?</p>
    <div class="status">
      <p>The connection will restore automatically when network is available.</p>
    </div>
  </div>
</body>
</html>`;
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('[SW] ARAYA Service Worker loaded');
