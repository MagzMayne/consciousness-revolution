# Jewelry Order Webhook Documentation

## Overview

The jewelry order webhook system automatically sends order data to external endpoints for automation and fulfillment. This enables integration with Rio Grande ordering systems, inventory management, customer relationship management (CRM), and other business automation tools.

## Quick Start

### 1. Configure Webhook URL

In `geAuto.html`, set your webhook endpoint:

```javascript
const AUTO_WEBHOOK_URL = "https://your-endpoint.com/webhook"; // Your webhook URL
const WEBHOOK_SECRET = "your-secret-key"; // Optional: for signature validation
```

### 2. Popular Webhook Services

#### Zapier
```javascript
const AUTO_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/YOUR_ACCOUNT/YOUR_WEBHOOK/";
```

#### Make.com (formerly Integromat)
```javascript
const AUTO_WEBHOOK_URL = "https://hook.integromat.com/YOUR_WEBHOOK_ID";
```

#### Custom API
```javascript
const AUTO_WEBHOOK_URL = "https://api.yourcompany.com/jewelry/orders";
const WEBHOOK_SECRET = "your-shared-secret"; // For HMAC signature validation
```

## Webhook Stages

The system sends webhooks at different stages of the order lifecycle:

### 1. Intent (Optional)
Sent when customer initiates PayPal checkout (before payment)
```json
{
  "event": "jewelry.order",
  "stage": "intent",
  "timestamp": "2026-02-09T15:30:00.000Z",
  "order": { ... }
}
```

### 2. Paid (Primary)
Sent after successful payment completion
```json
{
  "event": "jewelry.order",
  "stage": "paid",
  "timestamp": "2026-02-09T15:31:00.000Z",
  "order": { ... }
}
```

### 3. Completed (Future)
Sent when order is fulfilled
```json
{
  "event": "jewelry.order",
  "stage": "completed",
  "timestamp": "2026-02-23T10:00:00.000Z",
  "order": { ... }
}
```

### 4. Shipped (Future)
Sent when order ships
```json
{
  "event": "jewelry.order",
  "stage": "shipped",
  "timestamp": "2026-02-24T14:00:00.000Z",
  "order": { ... }
}
```

## Webhook Payload Structure

### Complete Payload Example

```json
{
  "event": "jewelry.order",
  "stage": "paid",
  "timestamp": "2026-02-09T15:31:00.000Z",
  "order": {
    "id": "ORDER-ABC123",
    "createdAt": "2026-02-09T15:30:00.000Z",
    "customer": {
      "email": "customer@example.com",
      "name": "John Doe",
      "phone": "555-1234",
      "address": {
        "street": "123 Main St",
        "city": "Denver",
        "state": "CO",
        "zip": "80202",
        "country": "US"
      }
    },
    "items": [
      {
        "type": "gemstone",
        "sku": "RG-SAPH-1.0CT",
        "description": "Natural Sapphire - 1 carat",
        "quantity": 1,
        "unitPrice": 1250
      },
      {
        "type": "cutting",
        "description": "Brilliant Round cut",
        "quantity": 1,
        "unitPrice": 220
      },
      {
        "type": "certification",
        "description": "GIA (Gemological Institute of America)",
        "quantity": 1,
        "unitPrice": 285
      },
      {
        "type": "setting",
        "sku": "RG-14K-SET-001",
        "description": "14K Gold - Simple Setting",
        "quantity": 1,
        "unitPrice": 520
      },
      {
        "type": "shipping",
        "description": "Ground Shipping (Insured) - 5-7 business days",
        "quantity": 1,
        "unitPrice": 35
      }
    ],
    "pricing": {
      "subtotal": 2275,
      "shipping": 35,
      "tax": 0,
      "total": 2310,
      "currency": "USD"
    },
    "jewelry": {
      "gemType": "sapphire",
      "carat": 1.0,
      "cut": "brilliant",
      "certification": "gia",
      "setting": "gold14_simple",
      "notes": "Ring size 7"
    },
    "fulfillment": {
      "shippingMethod": "ground",
      "region": "us",
      "estimatedDays": 15
    },
    "payment": {
      "method": "paypal",
      "status": "completed",
      "transactionId": "PAYPAL-TXN-123456",
      "details": { ... }
    },
    "metadata": {
      "source": "geAuto.html",
      "userAgent": "Mozilla/5.0...",
      "referrer": "https://example.com/"
    }
  },
  "signature": "a3f8d9c2e1b0..."
}
```

## Retry Logic

The webhook handler automatically retries failed deliveries:

- **Max Retries**: 3 attempts
- **Backoff**: Exponential (2s, 4s, 6s)
- **Timeout**: 10 seconds per request
- **Success Codes**: 200-299

### Retry Example

```
Attempt 1: Failed (timeout) → Wait 2 seconds
Attempt 2: Failed (500 error) → Wait 4 seconds
Attempt 3: Success (200 OK)
```

## Security

### Webhook Signatures

If you set `WEBHOOK_SECRET`, webhooks will include an HMAC signature:

```http
POST /your-endpoint HTTP/1.1
Content-Type: application/json
X-Webhook-Signature: a3f8d9c2e1b0...
X-Webhook-Attempt: 1
X-Webhook-Source: geAuto-jewelry
X-Webhook-Timestamp: 1707489060000

{
  "event": "jewelry.order",
  "signature": "a3f8d9c2e1b0...",
  ...
}
```

### Validating Signatures (Server-Side)

```javascript
// Node.js example
const crypto = require('crypto');

function validateWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Webhook Logging

All webhook activity is logged to browser localStorage for debugging:

```javascript
// Get webhook logs
const logs = webhookHandler.getLogs();
console.log(logs);

// Clear logs
webhookHandler.clearLogs();
```

### Log Entry Structure

```json
{
  "timestamp": "2026-02-09T15:31:00.000Z",
  "level": "success",
  "message": "Webhook delivered successfully on attempt 1",
  "stage": "paid",
  "orderId": "ORDER-ABC123"
}
```

## Testing Webhooks

### Test Endpoint

```javascript
// Test webhook configuration
const result = await webhookHandler.testWebhook();
console.log(result);
// { success: true, status: 200, statusText: "OK" }
```

### Test Payload

The test sends a minimal payload:

```json
{
  "event": "jewelry.order.test",
  "timestamp": "2026-02-09T15:31:00.000Z",
  "test": true,
  "message": "This is a test webhook from geAuto.html jewelry configurator"
}
```

### Using RequestBin/Webhook.site

For testing, use a webhook inspector:

```javascript
const AUTO_WEBHOOK_URL = "https://webhook.site/YOUR-UNIQUE-ID";
```

Then visit https://webhook.site/YOUR-UNIQUE-ID to see incoming webhooks.

## Integration Examples

### Zapier Integration

1. Create a new Zap in Zapier
2. Trigger: Webhooks by Zapier → Catch Hook
3. Copy the webhook URL
4. Set `AUTO_WEBHOOK_URL` in geAuto.html
5. Add actions:
   - Send email notification
   - Create Google Sheet row
   - Add to CRM
   - Notify Slack channel

### Make.com Integration

1. Create a new scenario in Make.com
2. Add Webhooks → Custom webhook module
3. Copy the webhook URL
4. Set `AUTO_WEBHOOK_URL` in geAuto.html
5. Add modules:
   - Parse JSON
   - Create order in database
   - Send SMS notification
   - Update inventory

### Custom API Integration

```javascript
// Express.js endpoint example
app.post('/jewelry/orders', express.json(), async (req, res) => {
  const { event, stage, order, signature } = req.body;
  
  // Validate signature
  if (WEBHOOK_SECRET && !validateSignature(order, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process order
  if (stage === 'paid') {
    await processRioGrandeOrder(order);
    await sendCustomerConfirmation(order.customer.email, order);
    await notifyFulfillmentTeam(order);
  }
  
  res.status(200).json({ received: true, orderId: order.id });
});
```

## Rio Grande Integration

### Automated Ordering

Use webhooks to automatically place orders with Rio Grande:

```javascript
async function processRioGrandeOrder(order) {
  // Extract Rio Grande SKUs from order items
  const rioGrandeItems = order.items
    .filter(item => item.sku && item.sku.startsWith('RG-'))
    .map(item => ({
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }));
  
  // Submit to Rio Grande ordering system
  const rioGrandeOrder = await submitToRioGrande({
    customer: order.customer,
    items: rioGrandeItems,
    shippingMethod: order.fulfillment.shippingMethod,
    notes: order.jewelry.notes
  });
  
  return rioGrandeOrder;
}
```

## Troubleshooting

### Webhook Not Firing

1. Check `AUTO_WEBHOOK_URL` is set
2. Verify `webhookHandler.enabled` is true
3. Check browser console for errors
4. Review logs: `webhookHandler.getLogs()`

### Webhook Timing Out

1. Increase timeout: `webhookHandler.updateConfig({ timeout: 30000 })`
2. Check endpoint response time
3. Verify network connectivity

### Webhook Failing

1. Check endpoint URL is correct
2. Verify endpoint accepts POST requests
3. Ensure endpoint returns 200-299 status
4. Review error logs in localStorage

### Debugging

Enable debug mode:

```javascript
const webhookHandler = new JewelryWebhookHandler({
  webhookUrl: AUTO_WEBHOOK_URL,
  debug: true // Enables verbose logging
});
```

## Configuration Options

```javascript
const webhookHandler = new JewelryWebhookHandler({
  webhookUrl: 'https://your-endpoint.com/webhook',
  secret: 'your-secret-key',
  maxRetries: 3,        // Number of retry attempts
  retryDelay: 2000,     // Initial retry delay (ms)
  timeout: 10000,       // Request timeout (ms)
  enabled: true,        // Enable/disable webhooks
  debug: false          // Enable debug logging
});
```

## Best Practices

1. **Always validate signatures** when using `WEBHOOK_SECRET`
2. **Return 200 OK quickly** - process asynchronously
3. **Log all webhook events** for audit trail
4. **Handle idempotency** - orders may be sent multiple times
5. **Monitor webhook failures** and set up alerts
6. **Test with webhook.site** before production
7. **Use HTTPS endpoints** for security
8. **Set appropriate timeouts** based on your processing time

## Support

For webhook integration support, contact:
- Email: BarbrickDesign@gmail.com
- Response time: Usually within 24 hours

## Related Documentation

- [Rio Grande Integration Guide](./RIO_GRANDE_INTEGRATION.md)
- [geAuto.html User Guide](./GEAUTO_USER_GUIDE.md)
- [PayPal Integration Guide](../PAYPAL_INTEGRATION_GUIDE.md)
