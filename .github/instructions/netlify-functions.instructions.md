---
applyTo: "netlify/functions/**/*.{js,mjs,ts}"
---

## Netlify Functions Guidelines

Netlify Functions are serverless API endpoints that handle backend logic for the Consciousness Revolution platform. Follow these standards when creating or modifying functions.

### Function Structure

Each function should be a single-purpose endpoint:

```javascript
// netlify/functions/example-function.js

exports.handler = async (event, context) => {
    // Parse request
    const { httpMethod, body, headers, queryStringParameters } = event;
    
    // Set CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };
    
    // Handle OPTIONS for CORS preflight
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }
    
    try {
        // Function logic
        const result = await processRequest(body);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify(result)
        };
        
    } catch (error) {
        console.error('Function error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
```

### CORS Configuration

Always include CORS headers for browser access:

```javascript
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Or specific domain in production
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Always handle OPTIONS requests
if (event.httpMethod === 'OPTIONS') {
    return {
        statusCode: 204,
        headers: CORS_HEADERS,
        body: ''
    };
}
```

### Request Handling

1. **Parse request body** safely:
   ```javascript
   let requestData;
   try {
       requestData = JSON.parse(event.body || '{}');
   } catch (error) {
       return {
           statusCode: 400,
           body: JSON.stringify({ error: 'Invalid JSON in request body' })
       };
   }
   ```

2. **Validate inputs**:
   ```javascript
   function validateInput(data) {
       const errors = [];
       
       if (!data.email || !isValidEmail(data.email)) {
           errors.push('Valid email is required');
       }
       
       if (!data.name || data.name.trim().length === 0) {
           errors.push('Name is required');
       }
       
       return errors;
   }
   
   const errors = validateInput(requestData);
   if (errors.length > 0) {
       return {
           statusCode: 400,
           body: JSON.stringify({ errors })
       };
   }
   ```

3. **Extract query parameters**:
   ```javascript
   const { id, filter, limit = '10' } = event.queryStringParameters || {};
   const limitNum = parseInt(limit, 10);
   ```

### Environment Variables

Use environment variables for sensitive data:

```javascript
// Access environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

// Validate required env vars
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing required environment variables');
}
```

### Database Operations

When using Supabase:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Query with error handling
async function fetchUserData(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to fetch user data');
    }
    
    return data;
}
```

### API Integrations

For external API calls (Stripe, email, etc.):

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount, currency = 'usd') {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency,
            metadata: {
                source: 'consciousness-revolution'
            }
        });
        
        return paymentIntent;
        
    } catch (error) {
        console.error('Stripe error:', error);
        throw new Error('Payment processing failed');
    }
}
```

### Response Formats

Return consistent response structures:

**Success response:**
```javascript
{
    statusCode: 200,
    headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
    },
    body: JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
    })
}
```

**Error response:**
```javascript
{
    statusCode: 400, // or 401, 404, 500, etc.
    headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
    },
    body: JSON.stringify({
        success: false,
        error: 'Error description',
        code: 'ERROR_CODE',
        timestamp: new Date().toISOString()
    })
}
```

### HTTP Status Codes

Use appropriate status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (for OPTIONS)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Authentication

For protected endpoints:

```javascript
function verifyAuth(event) {
    const authHeader = event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'Missing authorization header' };
    }
    
    const token = authHeader.substring(7);
    
    try {
        // Verify token (e.g., JWT verification)
        const decoded = verifyToken(token);
        return { valid: true, user: decoded };
    } catch (error) {
        return { valid: false, error: 'Invalid token' };
    }
}

// In handler
const auth = verifyAuth(event);
if (!auth.valid) {
    return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: auth.error })
    };
}
```

### Rate Limiting

Implement basic rate limiting for public endpoints:

```javascript
const rateLimit = new Map();

function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const userRequests = rateLimit.get(identifier) || [];
    
    // Filter requests within time window
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
        return { allowed: false, retryAfter: windowMs / 1000 };
    }
    
    recentRequests.push(now);
    rateLimit.set(identifier, recentRequests);
    
    return { allowed: true };
}

// In handler
const clientId = event.headers['x-forwarded-for'] || 'unknown';
const rateLimitCheck = checkRateLimit(clientId);

if (!rateLimitCheck.allowed) {
    return {
        statusCode: 429,
        headers: {
            ...CORS_HEADERS,
            'Retry-After': rateLimitCheck.retryAfter
        },
        body: JSON.stringify({ error: 'Too many requests' })
    };
}
```

### Logging

Log important events for debugging:

```javascript
// Log function invocation
console.log('Function invoked:', {
    method: event.httpMethod,
    path: event.path,
    timestamp: new Date().toISOString()
});

// Log errors with context
console.error('Error processing request:', {
    error: error.message,
    stack: error.stack,
    requestId: context.requestId
});

// Log successful operations
console.log('Operation completed:', {
    operation: 'user_registration',
    userId: user.id,
    duration: Date.now() - startTime
});
```

### Testing Functions Locally

Test functions using Netlify Dev:

```bash
# Start local dev server
netlify dev

# Function available at:
# http://localhost:8888/.netlify/functions/function-name
```

Test with curl:
```bash
curl -X POST \
  http://localhost:8888/.netlify/functions/example \
  -H 'Content-Type: application/json' \
  -d '{"test": "data"}'
```

### Common Patterns

**Email sending:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendEmail(to, subject, html) {
    await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html
    });
}
```

**Webhook handling:**
```javascript
// Verify webhook signature
function verifyWebhookSignature(payload, signature, secret) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    return signature === expectedSignature;
}

// In handler
const signature = event.headers['x-webhook-signature'];
const isValid = verifyWebhookSignature(event.body, signature, process.env.WEBHOOK_SECRET);

if (!isValid) {
    return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' })
    };
}
```

**Background tasks:**
```javascript
// For long-running tasks, return immediately and process async
exports.handler = async (event, context) => {
    // Return response immediately
    const response = {
        statusCode: 202, // Accepted
        body: JSON.stringify({ message: 'Processing started' })
    };
    
    // Process in background (within function timeout)
    processDataAsync(event.body).catch(error => {
        console.error('Background task failed:', error);
    });
    
    return response;
};
```

### Security Best Practices

1. **Never expose secrets** in responses
2. **Validate all inputs** before processing
3. **Use HTTPS only** (automatic on Netlify)
4. **Implement rate limiting** for public endpoints
5. **Sanitize user data** before storing
6. **Use parameterized queries** to prevent SQL injection
7. **Set appropriate CORS** headers (restrict in production)
8. **Log security events** (failed auth attempts, etc.)

### Performance Optimization

1. **Keep functions small** - Single responsibility
2. **Reuse connections** - Database, API clients
3. **Cache responses** when appropriate
4. **Use CDN** for static assets
5. **Implement timeouts** for external calls
6. **Monitor function duration** - Optimize slow functions

### Error Handling

Comprehensive error handling:

```javascript
exports.handler = async (event, context) => {
    try {
        // Input validation
        const data = validateInput(event);
        if (data.errors) {
            return errorResponse(400, 'Validation failed', data.errors);
        }
        
        // Business logic
        const result = await processData(data);
        
        return successResponse(result);
        
    } catch (error) {
        // Log full error internally
        console.error('Function error:', {
            message: error.message,
            stack: error.stack,
            requestId: context.requestId
        });
        
        // Return safe error to client
        if (error.name === 'ValidationError') {
            return errorResponse(400, 'Invalid input', error.details);
        }
        
        return errorResponse(500, 'Internal server error');
    }
};

function successResponse(data, statusCode = 200) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
        },
        body: JSON.stringify({
            success: true,
            data,
            timestamp: new Date().toISOString()
        })
    };
}

function errorResponse(statusCode, message, details = null) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
        },
        body: JSON.stringify({
            success: false,
            error: message,
            ...(details && { details }),
            timestamp: new Date().toISOString()
        })
    };
}
```

### Documentation

Each function should include:

```javascript
/**
 * Netlify Function: User Registration
 * 
 * Handles new user registration and sends welcome email.
 * 
 * Endpoint: /.netlify/functions/register-user
 * Method: POST
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "name": "User Name",
 *   "domain": "Connection"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "userId": "uuid",
 *     "email": "user@example.com"
 *   }
 * }
 * 
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */
exports.handler = async (event, context) => {
    // Implementation
};
```
