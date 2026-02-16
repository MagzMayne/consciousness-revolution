# 💳 MERLIN AI - QUICK PAYMENT REFERENCE

**Treasury:** `6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk`

---

## 💰 PRICING

| Operation | Cost |
|-----------|------|
| Hello | 1 GBUV |
| Code Analysis | 5 GBUV |
| Fix Suggestion | 10 GBUV |
| Value Prediction | 15 GBUV |
| Repo Comparison | 20 GBUV |
| Repo Summary | 25 GBUV |

---

## 📝 USAGE

```javascript
// REQUIRED: Pass user's wallet public key
const userWallet = 'ABC123...XYZ';

// Example: Code analysis (5 GBUV)
const result = await window.merlinAI.analyzeCodeFlow(
    nodeData,
    userWallet  // <-- Required!
);

// Check for payment errors
if (result.error === 'PAYMENT_REQUIRED') {
    alert(`Need ${result.cost} GBUV (you have ${result.balance})`);
} else {
    // Use AI result
    console.log(result.quality);
}
```

---

## 🔍 CHECK BALANCE

```javascript
const wallet = window.walletFactory.getWallet(userWallet);
console.log(`Balance: ${wallet.gbuvBalance} GBUV`);
```

---

## 📊 VIEW TREASURY

```javascript
console.log(`Collected: ${window.merlinAI.payment.totalCollected} GBUV`);
```

---

## 🔧 ADMIN CONTROLS

```javascript
// Disable payments (testing only)
window.merlinAI.payment.enabled = false;

// Adjust pricing
window.merlinAI.payment.prices.analyzeCodeFlow = 10;

// Change treasury
window.merlinAI.payment.treasuryWallet = 'NEW_ADDRESS';
```

---

## 📖 FULL DOCS

- [MERLIN_AI_PAYMENT_SYSTEM.md](MERLIN_AI_PAYMENT_SYSTEM.md)
- [MERLIN_AI_PAYMENT_IMPLEMENTATION_COMPLETE.md](MERLIN_AI_PAYMENT_IMPLEMENTATION_COMPLETE.md)
