# Business Status — Barbrick Design

**Last Updated:** 2026-03-10  
**Maintainer:** Ryan Barbrick · BarbrickDesign@gmail.com

---

## Current Products & Services

| Product | Price | Delivery | Status |
|---------|-------|----------|--------|
| RootIB Provenance License (1KUIS) | $199 one-time | Encrypted license key + protocol doc | ✅ Live |
| Design Asset Pack (templates, icons, UI kits) | $29 one-time | Secure download link | 🆕 Added |
| API Dashboard Access (monthly) | $9/month | Auto-provisioned API key | 🆕 Added |
| Custom Design Consult Funnel | $99 one-time | Calendly booking confirmation | 🆕 Added |

---

## Current Payment Flows

```
Buyer → PayPal Checkout (dashboard.html / product page)
      → PayPal captures order
      → PayPal fires webhook → backend /api/shop/webhook
      → backend verifies signature
      → backend writes purchase record (in-process store / file)
      → backend sends fulfillment (download link / API key / booking link)
      → buyer sees confirmation
```

**PayPal receiver:** BarbrickDesign@gmail.com  
**Webhook endpoint:** `POST /api/shop/webhook`  
**Webhook events handled:**
- `CHECKOUT.ORDER.APPROVED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.REFUNDED`

---

## Current Automation & Webhooks

| Component | Location | Notes |
|-----------|----------|-------|
| PayPal webhook handler (shop) | `backend/routes/shop.js` | Signature-verified, idempotent |
| PayPal webhook handler (1KUIS) | `backend/routes/onekuis.js` | Existing license flow |
| Legacy webhook handler | `backend/paypal-webhook-handler.js` | AutoBots legacy |
| Outbound webhook relay | `POST /api/shop/notify-outbound` | Zapier/Make integration |
| Income orchestrator | `backend/services/income-orchestrator-api.js` | Autonomous income engine |

---

## Revenue Summary (tracking enabled)

Revenue tracking is provided by the `/api/shop/stats` endpoint which is surfaced
live in the **Shop** tab of `dashboard.html`.

---

## Next Steps

- Connect real PayPal credentials via Railway env vars (`PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_WEBHOOK_ID`)
- Add real product download files to `backend/data/products/`
- Configure outbound webhook to Zapier/Make for email automation
- Expand product catalog with additional digital assets
