# Business Plan — Barbrick Design Digital Products

**Version:** 1.0  
**Date:** 2026-03-10  
**Author:** Ryan Barbrick · BarbrickDesign@gmail.com

---

## Chosen MVP: Digital Design Asset Store

### Why this idea?

- **Immediate**: No ongoing fulfilment cost — assets are delivered as a static zip download.
- **Reuses infrastructure**: PayPal Checkout + existing Railway backend + GitHub Pages dashboard.
- **Scalable**: Same pipeline supports subscriptions and API products with minor additions.

---

## Target User & Problem

| Attribute | Detail |
|-----------|--------|
| **Target user** | Indie developers, startup founders, small agencies |
| **Problem** | Need polished UI kits, icon packs, and code templates fast; don't want to maintain a subscription |
| **Solution** | One-time payment → instant download of high-quality, reusable design assets |

---

## Product Catalog

### Tier 1 — Design Asset Pack ($29)
- 200+ UI components (buttons, cards, modals)
- Icon set (SVG + PNG)
- 3 landing-page HTML templates
- License: unlimited personal & commercial use

### Tier 2 — Developer Toolkit ($49)
- Everything in Tier 1
- 5 production-ready Node.js microservice starters
- GitHub Actions workflow templates
- RootIB provenance integration example

### Tier 3 — API Dashboard Access ($9/month)
- Access to the Barbrick Design hosted API dashboard
- Endpoints: RootIB verification, provenance scanning, valuation
- Auto-provisioned API key on payment
- Cancel anytime

---

## Pricing Rationale

| Product | Price | Justification |
|---------|-------|---------------|
| Design Asset Pack | $29 | Impulse-buy range; comparable to Envato Market |
| Developer Toolkit | $49 | 2× upgrade; high perceived value |
| API Dashboard (monthly) | $9 | Below $10 "mental ceiling"; sticky subscription |

---

## Delivery Mechanism After Payment

```
1. Buyer completes PayPal Checkout on dashboard.html (Shop tab)
2. PayPal fires PAYMENT.CAPTURE.COMPLETED webhook → backend /api/shop/webhook
3. Backend verifies PayPal signature, marks order as fulfilled
4. Backend generates a time-limited secure download URL (HMAC-signed, 48 h expiry)
5. Backend sends JSON response with download URL to frontend via polling endpoint
6. Buyer sees "Your download is ready" in dashboard with link
7. Outbound webhook fires to notify automation platform (Zapier/Make/custom)
```

---

## Required Backend Changes

- [x] `backend/routes/shop.js` — product catalog, order creation, capture, webhook, stats
- [x] Register shop router in `backend/server-main.js`

## Required Frontend Changes

- [x] New **Shop** tab in `dashboard.html` with product cards and PayPal Checkout buttons
- [x] Live activity feed via WebSocket showing recent purchases
- [x] Order status polling (`GET /api/shop/order/:id`)

---

## Success Metrics

| Metric | Target (30 days) |
|--------|-----------------|
| Shop visits | 100 |
| Add-to-cart clicks | 20 |
| Completed purchases | 5 |
| Monthly recurring revenue (API) | $27 (3 subscribers) |
