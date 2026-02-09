/**
 * API CLIENT MODULE
 * Unified HTTP Client with Resilience
 *
 * Features:
 * - Automatic retries with exponential backoff
 * - Request/response interceptors
 * - Offline queue with sync
 * - Rate limiting
 * - Auth header injection
 *
 * Location: 100X_DEPLOYMENT/modules/
 * Created: 2026-02-08
 * Connects: ARCHITECTURE_GUIDELINES_DNA.md, data-layer.js
 */

// Default configuration
const DEFAULT_CONFIG = {
  baseUrl: '',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  rateLimit: 60, // requests per minute
  headers: {
    'Content-Type': 'application/json'
  }
};

// Active configuration
let config = { ...DEFAULT_CONFIG };

// Request queue for rate limiting
let requestQueue = [];
let isProcessingQueue = false;

// Offline queue
let offlineQueue = [];
const OFFLINE_QUEUE_KEY = 'overkill_api_offline_queue';

// Request count for rate limiting
let requestCount = 0;
let rateLimitResetTime = Date.now() + 60000;

// Interceptors
const interceptors = {
  request: [],
  response: [],
  error: []
};

/**
 * Initialize the API client
 * @param {Object} options - Configuration options
 */
export function init(options = {}) {
  config = { ...DEFAULT_CONFIG, ...options };

  // Load offline queue from storage
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (stored) {
      offlineQueue = JSON.parse(stored);
    }
  } catch (e) {
    offlineQueue = [];
  }

  // Process offline queue when online
  if (typeof window !== 'undefined') {
    window.addEventListener('online', processOfflineQueue);
  }

  return config;
}

/**
 * Set auth token
 * @param {string} token - Bearer token
 */
export function setAuthToken(token) {
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete config.headers['Authorization'];
  }
}

/**
 * Add request interceptor
 * @param {Function} fn - Interceptor function
 */
export function addRequestInterceptor(fn) {
  interceptors.request.push(fn);
  return () => {
    const index = interceptors.request.indexOf(fn);
    if (index > -1) interceptors.request.splice(index, 1);
  };
}

/**
 * Add response interceptor
 * @param {Function} fn - Interceptor function
 */
export function addResponseInterceptor(fn) {
  interceptors.response.push(fn);
  return () => {
    const index = interceptors.response.indexOf(fn);
    if (index > -1) interceptors.response.splice(index, 1);
  };
}

/**
 * Add error interceptor
 * @param {Function} fn - Interceptor function
 */
export function addErrorInterceptor(fn) {
  interceptors.error.push(fn);
  return () => {
    const index = interceptors.error.indexOf(fn);
    if (index > -1) interceptors.error.splice(index, 1);
  };
}

/**
 * Check rate limit
 */
function checkRateLimit() {
  const now = Date.now();

  // Reset counter if window passed
  if (now > rateLimitResetTime) {
    requestCount = 0;
    rateLimitResetTime = now + 60000;
  }

  if (requestCount >= config.rateLimit) {
    const waitTime = rateLimitResetTime - now;
    return { limited: true, waitTime };
  }

  requestCount++;
  return { limited: false };
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTP request
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 */
async function request(url, options = {}) {
  // Check if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    if (options.method !== 'GET') {
      // Queue non-GET requests for later
      queueOfflineRequest(url, options);
      return { offline: true, queued: true };
    }
    throw new Error('Offline and no cached data');
  }

  // Check rate limit
  const rateCheck = checkRateLimit();
  if (rateCheck.limited) {
    await sleep(rateCheck.waitTime);
  }

  // Build full URL
  const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;

  // Merge headers
  const headers = { ...config.headers, ...options.headers };

  // Build request config
  let requestConfig = {
    ...options,
    headers,
    signal: AbortSignal.timeout?.(config.timeout) || undefined
  };

  // Run request interceptors
  for (const interceptor of interceptors.request) {
    requestConfig = await interceptor(requestConfig);
  }

  // Attempt request with retries
  let lastError;
  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      const response = await fetch(fullUrl, requestConfig);

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Build result
      let result = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      };

      // Run response interceptors
      for (const interceptor of interceptors.response) {
        result = await interceptor(result);
      }

      if (!response.ok) {
        throw new ApiError(result.status, result.statusText, data);
      }

      return result;

    } catch (error) {
      lastError = error;

      // Run error interceptors
      for (const interceptor of interceptors.error) {
        await interceptor(error);
      }

      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403 || error.status === 404) {
        throw error;
      }

      // Wait before retry with exponential backoff
      if (attempt < config.retries) {
        const delay = config.retryDelay * Math.pow(2, attempt);
        console.log(`[API-CLIENT] Retry ${attempt + 1}/${config.retries} in ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(status, statusText, data) {
    super(`${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Queue request for offline processing
 */
function queueOfflineRequest(url, options) {
  offlineQueue.push({
    url,
    options,
    timestamp: Date.now()
  });

  // Save to storage
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
  } catch (e) {
    console.warn('[API-CLIENT] Failed to save offline queue');
  }

  console.log(`[API-CLIENT] Request queued for offline (${offlineQueue.length} pending)`);
}

/**
 * Process offline queue
 */
async function processOfflineQueue() {
  if (offlineQueue.length === 0 || !navigator.onLine) return;

  console.log(`[API-CLIENT] Processing ${offlineQueue.length} offline requests`);

  const pending = [...offlineQueue];
  offlineQueue = [];

  for (const item of pending) {
    try {
      await request(item.url, item.options);
    } catch (error) {
      // Re-queue if still failing
      offlineQueue.push(item);
    }
  }

  // Update storage
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
  } catch (e) {
    // Ignore
  }
}

/**
 * GET request
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 */
export async function get(url, params = {}) {
  // Build query string
  const queryString = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const fullUrl = queryString ? `${url}?${queryString}` : url;

  return request(fullUrl, { method: 'GET' });
}

/**
 * POST request
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 */
export async function post(url, data = {}) {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * PUT request
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 */
export async function put(url, data = {}) {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * PATCH request
 * @param {string} url - Request URL
 * @param {Object} data - Request body
 */
export async function patch(url, data = {}) {
  return request(url, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

/**
 * DELETE request
 * @param {string} url - Request URL
 */
export async function del(url) {
  return request(url, { method: 'DELETE' });
}

/**
 * Create a scoped client for a specific endpoint
 * @param {string} basePath - Base path for all requests
 */
export function createClient(basePath) {
  const scopedPath = (url) => `${basePath}${url}`;

  return {
    get: (url, params) => get(scopedPath(url), params),
    post: (url, data) => post(scopedPath(url), data),
    put: (url, data) => put(scopedPath(url), data),
    patch: (url, data) => patch(scopedPath(url), data),
    delete: (url) => del(scopedPath(url))
  };
}

/**
 * Get client status
 */
export function getStatus() {
  return {
    baseUrl: config.baseUrl,
    hasAuth: !!config.headers['Authorization'],
    requestCount,
    rateLimit: config.rateLimit,
    rateLimitRemaining: Math.max(0, config.rateLimit - requestCount),
    rateLimitResetIn: Math.max(0, rateLimitResetTime - Date.now()),
    offlineQueueLength: offlineQueue.length,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true
  };
}

/**
 * Clear offline queue
 */
export function clearOfflineQueue() {
  offlineQueue = [];
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (e) {
    // Ignore
  }
}

// Export ApiError for instanceof checks
export { ApiError };

export default {
  init,
  setAuthToken,
  addRequestInterceptor,
  addResponseInterceptor,
  addErrorInterceptor,
  get,
  post,
  put,
  patch,
  delete: del,
  createClient,
  getStatus,
  clearOfflineQueue,
  ApiError
};
