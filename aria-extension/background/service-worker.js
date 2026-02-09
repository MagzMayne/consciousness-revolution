// ARIA Service Worker - Background Script
// Handles message passing and storage coordination

const ARIA_VERSION = '1.0.0';

// Storage keys
const STORAGE_KEYS = {
  CAPTURED_BLOCKS: 'aria_captured_blocks',
  SETTINGS: 'aria_settings',
  STATS: 'aria_stats'
};

// Default settings
const DEFAULT_SETTINGS = {
  autoCapture: true,
  showNotifications: true,
  theme: 'chi', // cyan/magenta aesthetic
  exportFormat: 'zip'
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[ARIA] Extension installed/updated:', details.reason);

  // Initialize storage
  const existing = await chrome.storage.local.get([STORAGE_KEYS.SETTINGS, STORAGE_KEYS.STATS]);

  if (!existing[STORAGE_KEYS.SETTINGS]) {
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });
  }

  if (!existing[STORAGE_KEYS.STATS]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.STATS]: {
        totalCaptured: 0,
        byPlatform: {},
        byLanguage: {},
        lastCapture: null
      }
    });
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[ARIA] Message received:', message.type);

  switch (message.type) {
    case 'CAPTURE_BLOCK':
      handleCaptureBlock(message.data, sender.tab)
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.message }));
      return true; // Async response

    case 'GET_CAPTURED':
      getCapturedBlocks()
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'CLEAR_CAPTURED':
      clearCapturedBlocks()
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_STATS':
      getStats()
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_SETTINGS':
      getSettings()
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'UPDATE_SETTINGS':
      updateSettings(message.data)
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.message }));
      return true;
  }
});

async function handleCaptureBlock(block, tab) {
  const stored = await chrome.storage.local.get([STORAGE_KEYS.CAPTURED_BLOCKS, STORAGE_KEYS.STATS]);
  const blocks = stored[STORAGE_KEYS.CAPTURED_BLOCKS] || [];
  const stats = stored[STORAGE_KEYS.STATS] || { totalCaptured: 0, byPlatform: {}, byLanguage: {} };

  // Add metadata
  const capturedBlock = {
    ...block,
    id: `aria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    capturedAt: new Date().toISOString(),
    sourceUrl: tab?.url || 'unknown',
    platform: detectPlatform(tab?.url)
  };

  blocks.push(capturedBlock);

  // Update stats
  stats.totalCaptured++;
  stats.byPlatform[capturedBlock.platform] = (stats.byPlatform[capturedBlock.platform] || 0) + 1;
  if (block.language) {
    stats.byLanguage[block.language] = (stats.byLanguage[block.language] || 0) + 1;
  }
  stats.lastCapture = capturedBlock.capturedAt;

  await chrome.storage.local.set({
    [STORAGE_KEYS.CAPTURED_BLOCKS]: blocks,
    [STORAGE_KEYS.STATS]: stats
  });

  console.log('[ARIA] Block captured:', capturedBlock.id);
  return { success: true, id: capturedBlock.id, total: blocks.length };
}

function detectPlatform(url) {
  if (!url) return 'unknown';
  if (url.includes('claude.ai')) return 'claude';
  if (url.includes('openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
  if (url.includes('deepseek.com')) return 'deepseek';
  if (url.includes('gemini.google.com')) return 'gemini';
  if (url.includes('copilot.microsoft.com')) return 'copilot';
  return 'other';
}

async function getCapturedBlocks() {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.CAPTURED_BLOCKS);
  return stored[STORAGE_KEYS.CAPTURED_BLOCKS] || [];
}

async function clearCapturedBlocks() {
  await chrome.storage.local.set({ [STORAGE_KEYS.CAPTURED_BLOCKS]: [] });
  return { success: true };
}

async function getStats() {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.STATS);
  return stored[STORAGE_KEYS.STATS] || { totalCaptured: 0, byPlatform: {}, byLanguage: {} };
}

async function getSettings() {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return stored[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
}

async function updateSettings(newSettings) {
  const current = await getSettings();
  const updated = { ...current, ...newSettings };
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
  return updated;
}

console.log(`[ARIA] Service worker initialized v${ARIA_VERSION}`);
