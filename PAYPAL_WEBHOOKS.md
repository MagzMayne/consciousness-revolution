# PayPal Webhooks — Barbrick Design Shop

**Version:** 1.0  
**Date:** 2026-03-10

---

## Overview

The Barbrick Design shop backend listens for PayPal webhooks at:

```
POST https://barbrickdesigngithubio-production.up.railway.app/api/shop/webhook
```

All incoming webhooks are **signature-verified** before processing.

---

## Setup Steps (PayPal Dashboard)

1. Log in to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Go to **Apps & Credentials** → select your app (or create one)
3. Under **Webhooks**, click **Add Webhook**
4. Enter the endpoint URL: `https://barbrickdesigngithubio-production.up.railway.app/api/shop/webhook`
5. Subscribe to the following events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.REFUNDED`
6. Save — PayPal gives you a **Webhook ID**
7. Copy the Webhook ID and set it as the `PAYPAL_WEBHOOK_ID` Railway environment variable

---

## Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `PAYPAL_CLIENT_ID` | `AeXYZ...` | From PayPal app |
| `PAYPAL_SECRET` | `ELabc...` | From PayPal app |
| `PAYPAL_WEBHOOK_ID` | `1234567890` | From webhook setup |
| `PAYPAL_MODE` | `sandbox` or `production` | Default: `sandbox` |
| `PAYPAL_EMAIL` | `BarbrickDesign@gmail.com` | Receiver email |
| `SHOP_HMAC_SECRET` | any random string | Signs download URLs |

---

## Events Handled

### `PAYMENT.CAPTURE.COMPLETED`

Fired when a buyer completes checkout and payment is captured.

**Handler actions:**
1. Verify PayPal signature (via `/v1/notifications/verify-webhook-signature`)
2. Look up order by internal order ID
3. Mark order `status = "completed"`
4. Generate HMAC-signed download URL (48 h expiry) or provision API key
5. Record `fulfilled_at` timestamp
6. Fire outbound webhook relay to notify automation platform

### `CHECKOUT.ORDER.APPROVED`

Fired when buyer approves the order before capture.  
Used only for logging; actual fulfillment happens on `PAYMENT.CAPTURE.COMPLETED`.

### `PAYMENT.CAPTURE.REFUNDED`

Fired when a refund is issued.

**Handler actions:**
1. Verify PayPal signature
2. Look up order by capture ID
3. Mark order `status = "refunded"`
4. Revoke download URL / API key

---

## Signature Verification

The backend calls PayPal's verification API before processing any webhook:

```
POST https://api-m.paypal.com/v1/notifications/verify-webhook-signature
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "auth_algo": "<PayPal-Auth-Algo header>",
  "cert_url": "<PayPal-Cert-Url header>",
  "transmission_id": "<PayPal-Transmission-Id header>",
  "transmission_sig": "<PayPal-Transmission-Sig header>",
  "transmission_time": "<PayPal-Transmission-Time header>",
  "webhook_id": "<PAYPAL_WEBHOOK_ID env var>",
  "webhook_event": <raw body as object>
}
```

Expected response: `{ "verification_status": "SUCCESS" }`

---

## Testing with Sandbox

1. Set `PAYPAL_MODE=sandbox` and use sandbox credentials
2. In PayPal sandbox, trigger a test webhook via **Webhooks → Simulate**
3. Check Railway logs for: `[SHOP] Webhook verified and processed`

---

## Outbound Webhook Relay

After fulfillment, the backend fires an outbound webhook to any URLs registered
in the `OUTBOUND_WEBHOOK_URLS` environment variable (comma-separated):

```json
{
  "event": "purchase_completed",
  "order_id": "ord_...",
  "product_id": "design-asset-pack",
  "buyer_email": "buyer@example.com",
  "amount": "29.00",
  "currency": "USD",
  "download_url": "https://...",
  "timestamp": "2026-03-10T18:34:20.580Z"
}
```

This enables Zapier/Make automation for email follow-ups, CRM updates, etc.
