# FORGE STORE - QUICK TEST GUIDE
## 60-Second Verification Protocol

---

## INSTANT TEST

### 1. Open Store Page
```
https://consciousnessrevolution.io/forge-store.html?forge=reality
```

### 2. Verify Display
- ✅ Reality Forge header with 🔥 icon
- ✅ 3 product cards visible:
  - Starter Pack ($47, +500 XP)
  - Mastery Course ($197, +2,500 XP)
  - Master Bundle ($997, +20,000 XP) with gold border

### 3. Test Purchase Flow
```
1. Click "Buy Now" on Starter Pack
2. Enter email: test@example.com
3. Should redirect to Stripe checkout
4. Use test card: 4242 4242 4242 4242
5. Complete payment
6. Should return to store with success banner
```

---

## TEST ALL 7 FORGES

| Forge | Test URL |
|-------|----------|
| Reality | `/forge-store.html?forge=reality` |
| Creation | `/forge-store.html?forge=creation` |
| Communications | `/forge-store.html?forge=communications` |
| Guardian | `/forge-store.html?forge=guardian` |
| Wealth | `/forge-store.html?forge=wealth` |
| Character | `/forge-store.html?forge=character` |
| Infinity | `/forge-store.html?forge=infinity` |

Each should show:
- Unique Forge icon
- Forge-specific color gradient
- Same 3 product tiers with Forge-specific product IDs

---

## STRIPE TEST MODE

### Test Cards:
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient: 4000 0000 0000 9995
```

### Required Fields:
- **Email:** Any valid email
- **Card:** Test card number above
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

---

## VERIFY API FUNCTION

### Manual API Test:
```bash
curl -X POST https://consciousnessrevolution.io/.netlify/functions/stripe-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "reality-starter",
    "email": "test@example.com",
    "success_url": "https://consciousnessrevolution.io/forge-store.html?success=true&xp=500",
    "cancel_url": "https://consciousnessrevolution.io/forge-store.html"
  }'
```

Expected response:
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "session_id": "cs_test_..."
}
```

---

## MOBILE TEST

Test on mobile:
1. Viewport should stack cards vertically
2. Buttons remain full-width
3. Text remains readable
4. No horizontal scrolling

---

## SUCCESS STATE TEST

Manually trigger success banner:
```
/forge-store.html?forge=reality&success=true&xp=500
```

Should show:
- Green glowing success banner at top
- "+500 XP" in large gold text
- Animated pulse effect

---

## TROUBLESHOOTING

### Store page doesn't load:
- Check `forge-data.js` exists
- Verify `getForgeBySlug()` function

### "Buy Now" button does nothing:
- Open browser console
- Check for JavaScript errors
- Verify Netlify function is deployed

### Stripe checkout fails:
- Verify `STRIPE_SECRET_KEY` env var is set
- Check Netlify function logs
- Ensure using test mode keys (sk_test_...)

### Success banner doesn't show:
- Check URL has `?success=true` parameter
- Verify JavaScript console for errors

---

## DEPLOYMENT CHECKLIST

Before going live:

- [ ] Test all 7 Forge URLs
- [ ] Complete test purchase with test card
- [ ] Verify success redirect works
- [ ] Test mobile responsive layout
- [ ] Check API function logs (no errors)
- [ ] Swap test keys for live keys
- [ ] Test one live purchase with real card ($1 test)
- [ ] Verify webhook captures payment (check stripe-webhook-v2.mjs)
- [ ] Confirm XP is awarded to user in database

---

## QUICK FIXES

### Change product price:
Edit `netlify/functions/stripe-checkout.mjs`:
```javascript
'reality-starter': {
  price: 4700, // Change this (in cents)
  xp: 500
}
```

### Change XP award:
Same file, update `xp` value:
```javascript
'reality-starter': {
  price: 4700,
  xp: 500 // Change this
}
```

### Update product description:
Edit `forge-store.html` → `PRODUCTS` object → `description` field

---

## METRICS TO TRACK

After launch:
- Checkout sessions created (Stripe Dashboard)
- Successful payments (Stripe Dashboard)
- Conversion rate (sessions → payments)
- Average order value
- Most popular Forge
- Bundle vs individual course sales

---

**STORE STATUS: READY FOR TESTING**

Test mode active. Switch to live keys when ready for production.

---

*Test Protocol v1*
*March 11, 2026*
