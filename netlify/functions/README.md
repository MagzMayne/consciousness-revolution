# Netlify Functions

This directory contains serverless functions that run on Netlify's infrastructure.

## Overview

Netlify Functions are serverless functions that run on AWS Lambda. They allow you to run server-side code without managing servers.

## Available Functions

### Health Check (`health.js`)

**Endpoint**: `/api/health` or `/.netlify/functions/health`

Simple health check to verify the functions are working.

**Example request**:
```bash
curl https://your-site.netlify.app/api/health
```

**Example response**:
```json
{
  "status": "healthy",
  "message": "Netlify functions are operational",
  "timestamp": "2026-02-11T17:36:00.000Z",
  "environment": "production",
  "repository": "barbrickdesign.github.io",
  "version": "1.0.0"
}
```

## Creating New Functions

### Basic Function Template

```javascript
exports.handler = async (event, context) => {
  // Your code here
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ message: 'Success' })
  };
};
```

### Function with Parameters

```javascript
exports.handler = async (event, context) => {
  // Access query parameters
  const { name } = event.queryStringParameters || {};
  
  // Access POST body
  const body = event.body ? JSON.parse(event.body) : {};
  
  // Access headers
  const userAgent = event.headers['user-agent'];
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      greeting: `Hello, ${name || 'World'}!`,
      body,
      userAgent
    })
  };
};
```

### Async Operations

```javascript
exports.handler = async (event, context) => {
  try {
    // Async operation (API call, database query, etc.)
    const data = await fetchSomeData();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ data })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## Environment Variables

Access environment variables in your functions:

```javascript
exports.handler = async (event, context) => {
  const apiKey = process.env.API_KEY;
  const environment = process.env.CONTEXT; // production, deploy-preview, branch-deploy
  
  // Use environment variables
  const response = await callAPI(apiKey);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ response })
  };
};
```

## Event Object

The `event` object contains:

- **`httpMethod`**: GET, POST, PUT, DELETE, etc.
- **`headers`**: Request headers
- **`queryStringParameters`**: Query string parameters
- **`body`**: Request body (as string)
- **`path`**: Request path
- **`isBase64Encoded`**: Whether body is base64 encoded

## Context Object

The `context` object contains:

- **`callbackWaitsForEmptyEventLoop`**: Control callback behavior
- **`functionName`**: Name of the function
- **`functionVersion`**: Version of the function
- **`invokedFunctionArn`**: ARN of the invoked function
- **`memoryLimitInMB`**: Memory limit
- **`awsRequestId`**: AWS request ID
- **`logGroupName`**: CloudWatch log group name
- **`logStreamName`**: CloudWatch log stream name

## Testing Locally

### Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start dev server
netlify dev

# Invoke a function directly
netlify functions:invoke health
```

### Using curl

```bash
# Test health endpoint
curl http://localhost:8888/api/health

# Test with parameters
curl "http://localhost:8888/api/your-function?param=value"

# Test with POST data
curl -X POST http://localhost:8888/api/your-function \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

## Migrating Backend Services

To migrate existing backend services to Netlify Functions:

1. **Create a new function file** in this directory
2. **Port your Express.js routes** to the handler function
3. **Handle HTTP methods** using `event.httpMethod`
4. **Parse request body** from `event.body`
5. **Return proper response** with statusCode and body

Example migration from Express:

```javascript
// Before (Express)
app.get('/api/users/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  res.json({ user });
});

// After (Netlify Function)
exports.handler = async (event, context) => {
  const id = event.path.split('/').pop();
  const user = await getUser(id);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ user })
  };
};
```

## Limitations

- **Execution time**: 10 seconds (can be increased with paid plans)
- **Memory**: 1024 MB (can be increased with paid plans)
- **Payload size**: 6 MB for synchronous functions
- **Cold starts**: Functions may take longer on first invocation

## Best Practices

1. **Keep functions small** - One function per endpoint
2. **Use environment variables** - Never hardcode secrets
3. **Handle errors gracefully** - Always catch and return proper error responses
4. **Set CORS headers** - Allow cross-origin requests when needed
5. **Optimize cold starts** - Minimize dependencies and initialization code
6. **Use async/await** - Cleaner code for async operations
7. **Log appropriately** - Use console.log for debugging (appears in function logs)

## Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Function Examples](https://functions.netlify.com/examples/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)

---

**Need help?** Contact BarbrickDesign@gmail.com
