# Error Handling Patterns - Consciousness Revolution

**Last Updated:** 2026-03-06
**Status:** Implementation Guide

---

## Overview

This document defines standardized error handling patterns for the platform.

---

## Security Utility Functions

Located in `/netlify/functions/utils/security.mjs`

### Response Helpers

```javascript
import {
    successResponse,
    errorResponse,
    getSecureCORSHeaders
} from './utils/security.mjs';

// Success response
return successResponse({ user: userData }, origin, 200);

// Error response
return errorResponse('Invalid credentials', origin, 401, 'AUTH_FAILED');
```

### Functions Using Security Utils (11/90)

- `auth-login.mjs`
- `auth-logout.mjs`
- `auth-signup.mjs`
- `auth-signup-new.mjs`
- `create-checkout.mjs`
- `create-checkout-session.mjs`
- `marketplace-checkout.mjs`
- `sms-webhook.mjs`
- `team-messages.mjs`
- `verify-beta-access.mjs`
- `verify-identity.mjs`

---

## Error Response Format

### Standard Error Response
```json
{
    "success": false,
    "error": "Human-readable error message",
    "code": "ERROR_CODE"
}
```

### Standard Success Response
```json
{
    "success": true,
    "data": { ... }
}
```

---

## Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `AUTH_FAILED` | 401 | Invalid credentials |
| `NOT_AUTHORIZED` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `SERVER_ERROR` | 500 | Internal error |
| `DB_ERROR` | 500 | Database error |
| `STRIPE_ERROR` | 400 | Payment error |

---

## Error Handling Patterns

### Pattern 1: Try-Catch with Logging
```javascript
export async function handler(event) {
    const origin = event.headers.origin || '';

    try {
        // Main logic
        const result = await doSomething();
        return successResponse({ result }, origin, 200);

    } catch (error) {
        console.error('Function error:', error.message);
        return errorResponse(
            'Something went wrong. Please try again.',
            origin,
            500,
            'SERVER_ERROR'
        );
    }
}
```

### Pattern 2: Non-Blocking Errors
```javascript
// Log to database but don't fail the main operation
try {
    await supabase.from('audit_log').insert({
        event_type: 'user_action',
        metadata: { ... }
    });
} catch (e) {
    // Non-blocking - don't fail if logging fails
    console.warn('Audit log failed:', e.message);
}
```

### Pattern 3: Validation Before Processing
```javascript
const validation = validateInput({ email, password }, {
    email: { type: 'email', required: true },
    password: { type: 'string', required: true, minLength: 8 }
});

if (!validation.valid) {
    return errorResponse('Invalid input', origin, 400, 'VALIDATION_ERROR');
}

// Continue with validated data
const { email, password } = validation.sanitized;
```

### Pattern 4: Graceful Degradation
```javascript
// Try primary, fall back to default
let userData;
try {
    const { data } = await supabase.from('users').select('*').eq('id', userId);
    userData = data;
} catch (e) {
    console.warn('DB unavailable, using cache');
    userData = getCachedUser(userId);
}
```

### Pattern 5: Webhook Error Handling
```javascript
// Webhooks should return 200 to prevent retries
export async function handler(event) {
    try {
        // Process webhook
        await processWebhook(event);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };

    } catch (error) {
        console.error('Webhook error:', error);
        // Return 200 but log the error
        // This prevents Stripe/external services from retrying
        return { statusCode: 200, body: JSON.stringify({ received: true, error: error.message }) };
    }
}
```

---

## Frontend Error Handling

### Fetch with Error Handling
```javascript
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`/.netlify/functions/${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'API error');
        }

        return data;

    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        // Show user-friendly message
        showNotification('Something went wrong. Please try again.', 'error');
        throw error;
    }
}
```

### Widget Error States
```javascript
async function loadWidget(containerId, fetchFn) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const data = await fetchFn();
        container.innerHTML = renderWidget(data);
    } catch (error) {
        container.innerHTML = `
            <div class="widget-error">
                <span class="error-icon">!</span>
                <span>Unable to load data</span>
            </div>
        `;
    }
}
```

---

## Priority Improvements

### HIGH - Add Security Utils
Functions that handle sensitive data should use security.mjs:
- `araya-chat.mjs` - AI conversations
- `araya-energy.mjs` - Credits/payments
- `stripe-webhook-v2.mjs` - Payment processing
- `builder-webhook.mjs` - Revenue events

### MEDIUM - Standardize Responses
Ensure all functions return consistent error format.

### LOW - Add Error Telemetry
Consider adding error tracking service (Sentry, etc).

---

*Generated from error handling analysis on 2026-03-06*
