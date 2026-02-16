# Zero Trust Security - Developer Guide

## Quick Start: Securing Your Function

This guide helps you quickly apply zero trust security controls to Netlify serverless functions.

---

## Step 1: Import Security Utilities

At the top of your function file:

```javascript
import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    validateInput,
    anonymizeIP,
    secureLog,
    successResponse,
    errorResponse,
    validateAuthToken  // If authentication required
} from './utils/security.mjs';
```

---

## Step 2: Basic Function Structure

Replace your existing function structure with this secure template:

```javascript
export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';
    
    // 1. Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }
    
    // 2. Method validation
    if (event.httpMethod !== 'POST') {  // Change to your method
        return errorResponse('Method not allowed', origin, 405);
    }
    
    // 3. Rate limiting
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const rateLimitCheck = checkRateLimit(
        `function-name_${anonymizeIP(clientIP)}`,
        100,  // max requests
        60000 // per 60 seconds
    );
    
    if (!rateLimitCheck.allowed) {
        secureLog('Rate limit exceeded', { 
            ip: anonymizeIP(clientIP),
            function: 'function-name'
        });
        return errorResponse(
            'Too many requests. Please try again later.',
            origin,
            429
        );
    }
    
    // 4. Authentication (if required)
    const auth = validateAuthToken(event.headers);
    if (!auth.valid) {
        secureLog('Authentication failed', { error: auth.error });
        return errorResponse(auth.error, origin, 401);
    }
    
    try {
        // 5. Parse and validate input
        const data = JSON.parse(event.body || '{}');
        const validation = validateInput(data, {
            // Define your schema here
            field1: {
                type: 'string',
                required: true,
                maxLength: 100
            },
            field2: {
                type: 'email',
                required: false
            }
        });
        
        if (!validation.valid) {
            return errorResponse(
                validation.errors.join(', '),
                origin,
                400
            );
        }
        
        // 6. Process with validated data
        const result = await yourProcessingFunction(validation.sanitized);
        
        secureLog('Operation successful', { 
            userId: auth.userId,  // if authenticated
            operation: 'your-operation'
        });
        
        return successResponse(result, origin);
        
    } catch (error) {
        secureLog('Operation failed', { error: error.message });
        return errorResponse('Server error', origin, 500);
    }
}
```

---

## Step 3: Update CORS Headers

**BEFORE (Insecure):**
```javascript
const headers = {
    'Access-Control-Allow-Origin': '*',  // ❌ INSECURE
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};
```

**AFTER (Secure):**
```javascript
// Just use the security utilities - they handle everything
return successResponse(data, origin);
// or
return errorResponse(message, origin, statusCode);
```

The security utilities automatically:
- Validate origin against whitelist
- Add all required security headers
- Set appropriate CORS headers
- Include HSTS, CSP, and other protections

---

## Step 4: Replace console.log with secureLog

**BEFORE (Logs Sensitive Data):**
```javascript
console.log('User login:', { email, password, token });  // ❌ INSECURE
```

**AFTER (Redacts Sensitive Data):**
```javascript
secureLog('User login', { email, userId });  // ✅ SECURE
// Automatically redacts: password, token, secret, key, authorization
```

---

## Step 5: Input Validation Schemas

### Common Validation Types

```javascript
// Email validation
email: {
    type: 'email',
    required: true
}

// String with length limits
name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
}

// Number with range
age: {
    type: 'number',
    required: false,
    min: 0,
    max: 150
}

// UUID
userId: {
    type: 'uuid',
    required: true
}

// Boolean
isActive: {
    type: 'boolean',
    required: false
}

// Array with item limit
tags: {
    type: 'array',
    required: false,
    maxItems: 10
}

// Custom validator
password: {
    type: 'string',
    required: true,
    minLength: 8,
    maxLength: 128,
    validator: (pwd) => {
        if (!/\d/.test(pwd) || !/[a-zA-Z]/.test(pwd)) {
            return 'Password must contain letters and numbers';
        }
        return null;  // Valid
    }
}
```

---

## Rate Limiting Guidelines

Choose appropriate rate limits based on function type:

```javascript
// Authentication endpoints (stricter)
checkRateLimit(`auth_${ip}`, 5, 3600000);  // 5 per hour

// Public API endpoints (moderate)
checkRateLimit(`api_${ip}`, 100, 60000);  // 100 per minute

// Authenticated user endpoints (generous)
checkRateLimit(`user_${userId}`, 1000, 60000);  // 1000 per minute

// File uploads (strict)
checkRateLimit(`upload_${userId}`, 10, 3600000);  // 10 per hour

// Heavy operations (strict)
checkRateLimit(`heavy_${userId}`, 20, 3600000);  // 20 per hour
```

---

## Authentication Patterns

### Public Endpoint (No Auth Required)
```javascript
// Skip authentication - just validate and process
```

### Optional Authentication
```javascript
const auth = validateAuthToken(event.headers);
const userId = auth.valid ? auth.userId : null;

// Process with or without user context
const result = await processData(data, userId);
```

### Required Authentication
```javascript
const auth = validateAuthToken(event.headers);
if (!auth.valid) {
    return errorResponse(auth.error, origin, 401);
}

// Proceed with authenticated user
const result = await processData(data, auth.userId);
```

### Admin-Only Endpoint
```javascript
const auth = validateAuthToken(event.headers);
if (!auth.valid) {
    return errorResponse(auth.error, origin, 401);
}

// Check admin status (you'll need to fetch from database)
const supabase = getSupabaseAdmin();
const { data: user } = await supabase
    .from('user_foundations')
    .select('is_admin')
    .eq('user_id', auth.userId)
    .single();

if (!user?.is_admin) {
    return errorResponse('Admin access required', origin, 403);
}
```

---

## Database Operations with RLS

When querying Supabase, RLS policies automatically protect data:

```javascript
// User can only see their own data
const { data, error } = await supabase
    .from('user_images')
    .select('*')
    .eq('user_id', userId);  // RLS enforces this

// If using service role (bypasses RLS), be explicit
const { data, error } = await supabaseAdmin
    .from('user_images')
    .select('*')
    .eq('user_id', userId);  // Manually filter for security
```

---

## Logging Best Practices

### DO Log:
```javascript
secureLog('Function invoked', { 
    function: 'my-function',
    userId: auth.userId,
    operation: 'create',
    ip: anonymizeIP(clientIP)
});

secureLog('Validation failed', { 
    errors: validation.errors 
});

secureLog('Database operation', { 
    table: 'users',
    operation: 'update',
    affected: 1
});
```

### DON'T Log:
```javascript
// ❌ Never log these
console.log({ password, token, apiKey, secret });
console.log({ fullIP: clientIP });  // Use anonymizeIP()
console.log({ creditCard, ssn, sensitive });
console.log(error.stack);  // Don't expose stack traces
```

---

## Error Handling

### User-Facing Errors (Safe)
```javascript
return errorResponse('Invalid email format', origin, 400);
return errorResponse('Resource not found', origin, 404);
return errorResponse('Unauthorized', origin, 401);
```

### Internal Errors (Logged, Not Exposed)
```javascript
try {
    await riskyOperation();
} catch (error) {
    secureLog('Operation failed', { 
        error: error.message,
        operation: 'risky-op'
    });
    // Don't expose internal details
    return errorResponse('Server error', origin, 500);
}
```

---

## Testing Your Secured Function

### 1. Test Rate Limiting
```bash
# Should succeed first time, fail after limit
for i in {1..10}; do
    curl -X POST https://your-domain/.netlify/functions/your-function \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}'
    echo ""
done
```

### 2. Test CORS
```bash
# Should reject requests from unauthorized origins
curl -X POST https://your-domain/.netlify/functions/your-function \
    -H "Origin: https://evil-site.com" \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}' \
    -v
```

### 3. Test Input Validation
```bash
# Should reject invalid inputs
curl -X POST https://your-domain/.netlify/functions/your-function \
    -H "Content-Type: application/json" \
    -d '{"email": "not-an-email", "password": "short"}'
```

### 4. Test Authentication
```bash
# Should reject without token
curl -X POST https://your-domain/.netlify/functions/your-function \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'

# Should succeed with valid token
curl -X POST https://your-domain/.netlify/functions/your-function \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'
```

---

## Migration Checklist

For each function you're securing:

- [ ] Import security utilities
- [ ] Replace CORS headers with `getSecureCORSHeaders(origin)`
- [ ] Add rate limiting with `checkRateLimit()`
- [ ] Add input validation with `validateInput()`
- [ ] Replace `console.log()` with `secureLog()`
- [ ] Use `successResponse()` and `errorResponse()`
- [ ] Add authentication if required
- [ ] Test rate limiting
- [ ] Test CORS protection
- [ ] Test input validation
- [ ] Test authentication
- [ ] Update function documentation

---

## Quick Reference

### Security Functions

| Function | Purpose | Usage |
|----------|---------|-------|
| `getSecureCORSHeaders(origin)` | Validate origin, return secure headers | Auto-included in response helpers |
| `handlePreflight(origin)` | Handle OPTIONS requests | `if (method === 'OPTIONS') return handlePreflight(origin)` |
| `checkRateLimit(id, max, window)` | Rate limiting | `checkRateLimit('func_' + ip, 100, 60000)` |
| `validateInput(data, schema)` | Input validation | `validateInput(data, { email: { type: 'email', required: true }})` |
| `sanitizeString(str, maxLen)` | XSS prevention | Auto-called by validateInput |
| `anonymizeIP(ip)` | Anonymize IP to /24 | `anonymizeIP('192.168.1.123')` → `'192.168.1.0'` |
| `pseudonymize(id, salt)` | One-way hash | `pseudonymize(userId, salt)` |
| `encrypt(data)` | AES-256-GCM encryption | `encrypt(sensitiveData)` |
| `decrypt(encrypted)` | Decrypt data | `decrypt(encryptedData)` |
| `secureLog(msg, data)` | PII-redacted logging | `secureLog('Event', { userId, action })` |
| `successResponse(data, origin)` | Secure success response | `return successResponse({ result }, origin)` |
| `errorResponse(msg, origin, code)` | Secure error response | `return errorResponse('Error', origin, 400)` |
| `validateAuthToken(headers)` | JWT validation | `const auth = validateAuthToken(event.headers)` |

---

## Common Patterns

### Simple Public API
```javascript
export async function handler(event, context) {
    const origin = event.headers.origin || '';
    if (event.httpMethod === 'OPTIONS') return handlePreflight(origin);
    
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0];
    const rateCheck = checkRateLimit(`api_${anonymizeIP(clientIP)}`, 100, 60000);
    if (!rateCheck.allowed) return errorResponse('Rate limit', origin, 429);
    
    try {
        const result = await processRequest();
        return successResponse(result, origin);
    } catch (error) {
        secureLog('Error', { error: error.message });
        return errorResponse('Server error', origin, 500);
    }
}
```

### Authenticated User Endpoint
```javascript
export async function handler(event, context) {
    const origin = event.headers.origin || '';
    if (event.httpMethod === 'OPTIONS') return handlePreflight(origin);
    
    const auth = validateAuthToken(event.headers);
    if (!auth.valid) return errorResponse(auth.error, origin, 401);
    
    const rateCheck = checkRateLimit(`user_${auth.userId}`, 1000, 60000);
    if (!rateCheck.allowed) return errorResponse('Rate limit', origin, 429);
    
    try {
        const data = JSON.parse(event.body || '{}');
        const validation = validateInput(data, schema);
        if (!validation.valid) {
            return errorResponse(validation.errors.join(', '), origin, 400);
        }
        
        const result = await processWithAuth(validation.sanitized, auth.userId);
        return successResponse(result, origin);
    } catch (error) {
        secureLog('Error', { error: error.message, userId: auth.userId });
        return errorResponse('Server error', origin, 500);
    }
}
```

---

## Need Help?

- **Security Documentation**: See `ZERO_TRUST_SECURITY.md`
- **Examples**: Check `auth-signup.mjs` and `auth-login.mjs`
- **Run Audit**: `./security-audit.sh` to check your progress
- **Report Issues**: Open an issue or contact security@consciousnessrevolution.io

---

**Remember:** Security is not optional. Every function must be secured before deployment.
