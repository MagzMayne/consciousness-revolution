# 💰 MERLIN AI - GBUV PAYMENT SYSTEM

**Status:** ✅ **ENABLED & OPERATIONAL**  
**Date:** December 16, 2025  
**Purpose:** Sustainable economy for AI operations  

---

## 🎯 OVERVIEW

All Merlin AI operations now require GBUV token payments to keep the economy flowing and applications functional. Every AI call costs GBUV, which flows to the treasury wallet to sustain the system!

### Why Payment Gating?

✅ **Gemini API costs real money** - Token usage isn't free  
✅ **Sustains the GBUV economy** - Creates demand for tokens  
✅ **Prevents abuse** - Rate limits through economic incentive  
✅ **Fair usage model** - Pay for what you use  
✅ **Treasury funding** - Supports system operations  

---

## 💵 PRICING TABLE

All payments go to treasury wallet: **6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk**

| AI Flow | Cost (GBUV) | What You Get |
|---------|-------------|--------------|
| **analyzeCodeFlow** | 5 GBUV | Quality assessment (1-10), security analysis, performance suggestions, refactor estimate |
| **summarizeRepositoryFlow** | 25 GBUV | Full repo analysis, architecture rating, top issues, recommendations, value estimate |
| **suggestFixFlow** | 10 GBUV | Root cause analysis, fix plan, implementation steps, time estimate, risk assessment |
| **predictValueImpactFlow** | 15 GBUV | Value prediction after changes, confidence level, per-change impact, recommendations |
| **compareRepositoriesFlow** | 20 GBUV | Side-by-side repo comparison, winner determination, strengths/weaknesses, advice |
| **helloFlow** | 1 GBUV | Test connection, verify Merlin AI is online |

---

## 🔐 HOW IT WORKS

### 1. User Makes AI Request

```javascript
// Example: Analyze a code file
const result = await window.merlinAI.analyzeCodeFlow(
    nodeData,
    userWalletPublicKey  // <-- REQUIRED!
);
```

### 2. Payment Verification

Merlin AI checks:
- ✅ Does user have a wallet?
- ✅ Does wallet have enough GBUV?
- ✅ Is payment system enabled?

### 3. Payment Processing

If verified:
- ✅ GBUV transferred from user → treasury
- ✅ Transaction logged to Firebase
- ✅ Telemetry recorded
- ✅ AI request proceeds

If failed:
- ❌ Returns error message
- ❌ Shows required cost & current balance
- ❌ AI request blocked

### 4. AI Response

If payment successful:
- ✅ Full AI analysis returned
- ✅ Payment details included
- ✅ Transaction ID provided

---

## 🚀 USAGE EXAMPLES

### Example 1: Analyze Code File

```javascript
// User wallet (from login)
const userPublicKey = 'ABC123...XYZ';

// Code file data
const nodeData = {
    name: 'user-auth.js',
    language: 'JavaScript',
    metrics: {
        lines: 450,
        functions: 12,
        complexity: 8
    },
    value: 337.50
};

// Call Merlin AI (costs 5 GBUV)
const analysis = await window.merlinAI.analyzeCodeFlow(
    nodeData,
    userPublicKey
);

// Check result
if (analysis.error) {
    console.error('❌', analysis.message);
    console.log(`Cost: ${analysis.cost} GBUV`);
    console.log(`Your balance: ${analysis.balance} GBUV`);
    // Show user: "Insufficient GBUV. Please add funds."
} else {
    console.log('✅ Analysis complete!');
    console.log('Quality:', analysis.quality);
    console.log('Suggestions:', analysis.suggestions);
    // Display analysis to user
}
```

### Example 2: Summarize Repository (Expensive!)

```javascript
const userPublicKey = 'ABC123...XYZ';

const repoData = {
    name: 'GemBot AI Control',
    totalValue: 45732.50,
    totalHours: 610,
    nodeCount: 127,
    avgComplexity: 7.2,
    topNodes: [...]
};

// This costs 25 GBUV!
const summary = await window.merlinAI.summarizeRepositoryFlow(
    repoData,
    userPublicKey
);

if (summary.error === 'PAYMENT_REQUIRED') {
    alert(`⚠️ Need ${summary.cost} GBUV to analyze repository!`);
    alert(`Your balance: ${summary.balance} GBUV`);
    // Redirect to "Buy GBUV" page
} else {
    console.log('📊 Repository Summary:', summary.text);
    // Show full report
}
```

### Example 3: Test Connection (Cheap!)

```javascript
const userPublicKey = 'ABC123...XYZ';

// Just costs 1 GBUV
const hello = await window.merlinAI.helloFlow(
    'Ryan',
    userPublicKey
);

if (hello.error) {
    console.log('⚠️ Not enough GBUV for even a hello!');
} else {
    console.log('🧙‍♂️', hello.text);
}
```

---

## 📊 PAYMENT TRACKING

### View User's Transaction History

```javascript
// Get all Merlin AI payments
const payments = window.merlinAI.payment.transactions;

payments.forEach(tx => {
    console.log(`${tx.flowName}: ${tx.amount} GBUV at ${tx.timestamp}`);
});
```

### Check Total Treasury Collection

```javascript
const totalCollected = window.merlinAI.payment.totalCollected;
console.log(`💰 Treasury has collected: ${totalCollected} GBUV`);
```

### Query Firebase for Payment History

```javascript
const { collection, getDocs, query, where } = window.firestoreUtils;

// Get all payments from a specific user
const q = query(
    collection(window.firebaseDb, 'merlin_payments'),
    where('from', '==', userPublicKey)
);

const snapshot = await getDocs(q);
snapshot.forEach(doc => {
    const payment = doc.data();
    console.log(`Paid ${payment.amount} GBUV for ${payment.flowName}`);
});
```

---

## 🔧 CONFIGURATION

### Disable Payments (Testing Only)

```javascript
// DANGER: Only for testing!
window.merlinAI.payment.enabled = false;

// Now all calls are free (no payment required)
const result = await window.merlinAI.analyzeCodeFlow(nodeData, userPublicKey);
```

### Change Pricing

```javascript
// Make code analysis more expensive
window.merlinAI.payment.prices.analyzeCodeFlow = 10; // Was 5 GBUV

// Make hello flow free
window.merlinAI.payment.prices.helloFlow = 0; // Was 1 GBUV
```

### Change Treasury Wallet

```javascript
// Route payments to different wallet
window.merlinAI.payment.treasuryWallet = 'NEW_WALLET_ADDRESS';
```

---

## 🎨 UI INTEGRATION

### Show Payment Modal Before AI Call

```html
<div id="paymentModal" style="display: none;">
    <h3>💰 Payment Required</h3>
    <p id="costMessage">This operation costs X GBUV</p>
    <p id="balanceMessage">Your balance: Y GBUV</p>
    <button onclick="confirmPayment()">Pay & Continue</button>
    <button onclick="cancelPayment()">Cancel</button>
</div>

<script>
async function analyzeCodeWithPayment(nodeData, userPublicKey) {
    // Check cost first
    const cost = window.merlinAI.payment.prices.analyzeCodeFlow;
    const wallet = window.walletFactory.getWallet(userPublicKey);
    const balance = wallet.gbuvBalance;
    
    // Show modal
    document.getElementById('costMessage').textContent = `This costs ${cost} GBUV`;
    document.getElementById('balanceMessage').textContent = `Your balance: ${balance} GBUV`;
    document.getElementById('paymentModal').style.display = 'block';
}

async function confirmPayment() {
    // Proceed with AI call
    const result = await window.merlinAI.analyzeCodeFlow(nodeData, userPublicKey);
    
    if (result.error) {
        alert(result.message);
    } else {
        // Show analysis
        displayAnalysis(result);
    }
    
    document.getElementById('paymentModal').style.display = 'none';
}
</script>
```

### Display Balance Indicator

```html
<div id="gbuvBalance" style="position: fixed; top: 20px; right: 20px; background: #1e3a8a; padding: 15px; border-radius: 8px;">
    <div style="font-size: 12px; opacity: 0.8;">Your GBUV Balance</div>
    <div style="font-size: 24px; font-weight: bold;" id="balanceAmount">0</div>
    <button onclick="buyGBUV()">+ Buy More</button>
</div>

<script>
// Update balance display
function updateBalanceDisplay() {
    const userPublicKey = getCurrentUserWallet();
    const wallet = window.walletFactory.getWallet(userPublicKey);
    document.getElementById('balanceAmount').textContent = wallet.gbuvBalance;
}

// Call every 5 seconds
setInterval(updateBalanceDisplay, 5000);
</script>
```

### Show "Insufficient Funds" Warning

```html
<div id="insufficientFunds" style="display: none; background: #dc2626; color: white; padding: 20px;">
    <h3>❌ Insufficient GBUV</h3>
    <p>You need <span id="requiredAmount"></span> GBUV but only have <span id="currentAmount"></span> GBUV</p>
    <button onclick="redirectToBuyPage()">Buy GBUV Now</button>
</div>

<script>
function showInsufficientFundsModal(required, current) {
    document.getElementById('requiredAmount').textContent = required;
    document.getElementById('currentAmount').textContent = current;
    document.getElementById('insufficientFunds').style.display = 'block';
}
</script>
```

---

## 📈 ANALYTICS

### Track AI Usage by Flow

```javascript
// Get telemetry summary with payment data
const summary = window.merlinAI.getTelemetrySummary();

Object.entries(summary.flowBreakdown).forEach(([flow, stats]) => {
    const cost = window.merlinAI.payment.prices[flow];
    const totalSpent = stats.count * cost;
    
    console.log(`${flow}:`);
    console.log(`  Calls: ${stats.count}`);
    console.log(`  Cost per call: ${cost} GBUV`);
    console.log(`  Total spent: ${totalSpent} GBUV`);
});
```

### Calculate User's Total Spend

```javascript
function calculateTotalSpend(userPublicKey) {
    const payments = window.merlinAI.payment.transactions
        .filter(tx => tx.from === userPublicKey);
    
    const total = payments.reduce((sum, tx) => sum + tx.amount, 0);
    
    console.log(`User has spent ${total} GBUV on Merlin AI`);
    return total;
}
```

### Monitor Treasury Growth

```javascript
setInterval(() => {
    const collected = window.merlinAI.payment.totalCollected;
    console.log(`💰 Treasury: ${collected} GBUV`);
    
    // Alert if treasury reaches milestone
    if (collected >= 1000 && !alerted1000) {
        alert('🎉 Treasury reached 1,000 GBUV!');
        alerted1000 = true;
    }
}, 60000); // Check every minute
```

---

## 🛡️ ERROR HANDLING

### Common Error Responses

**Payment Required:**
```javascript
{
    error: 'PAYMENT_REQUIRED',
    message: '❌ Insufficient GBUV. Required: 25 GBUV, Balance: 10 GBUV',
    cost: 25,
    balance: 10
}
```

**Payment Failed:**
```javascript
{
    error: 'PAYMENT_FAILED',
    message: '❌ Payment failed: Transfer failed'
}
```

**No Wallet:**
```javascript
{
    error: 'PAYMENT_REQUIRED',
    message: '❌ Wallet not found. Please log in or create an account.',
    required: 5,
    balance: 0
}
```

### Graceful Degradation

```javascript
async function tryAnalyzeCode(nodeData, userPublicKey) {
    const result = await window.merlinAI.analyzeCodeFlow(nodeData, userPublicKey);
    
    if (result.error === 'PAYMENT_REQUIRED') {
        // Show free alternative
        return {
            quality: '?',
            suggestions: ['Payment required for AI analysis'],
            note: `Cost: ${result.cost} GBUV (you have ${result.balance})`
        };
    }
    
    if (result.error === 'PAYMENT_FAILED') {
        // Log error, retry once
        console.error('Payment failed, retrying...');
        return await window.merlinAI.analyzeCodeFlow(nodeData, userPublicKey);
    }
    
    return result;
}
```

---

## 🎯 BEST PRACTICES

### 1. Always Check Balance First

```javascript
function canAfford(flowName, userPublicKey) {
    const cost = window.merlinAI.payment.prices[flowName];
    const wallet = window.walletFactory.getWallet(userPublicKey);
    return wallet.gbuvBalance >= cost;
}

// Use before AI call
if (!canAfford('summarizeRepositoryFlow', userPublicKey)) {
    alert('⚠️ Not enough GBUV for repository analysis!');
    return;
}
```

### 2. Batch Expensive Operations

```javascript
// Bad: Analyze 10 files individually (50 GBUV)
files.forEach(async file => {
    await window.merlinAI.analyzeCodeFlow(file, userPublicKey); // 5 GBUV each
});

// Good: Combine data, get 1 summary (25 GBUV)
const repoData = aggregateFiles(files);
await window.merlinAI.summarizeRepositoryFlow(repoData, userPublicKey);
```

### 3. Cache AI Responses

```javascript
const aiCache = {};

async function getAnalysisWithCache(nodeData, userPublicKey) {
    const cacheKey = `${nodeData.name}_${nodeData.metrics.lines}`;
    
    // Return cached result (free!)
    if (aiCache[cacheKey]) {
        console.log('✅ Using cached analysis (no cost)');
        return aiCache[cacheKey];
    }
    
    // Fresh analysis (costs GBUV)
    const result = await window.merlinAI.analyzeCodeFlow(nodeData, userPublicKey);
    aiCache[cacheKey] = result;
    return result;
}
```

### 4. Show Cost Before Action

```javascript
// Show cost in button
<button onclick="analyze()">
    🧙‍♂️ Analyze Code (5 GBUV)
</button>

// Or in tooltip
<button title="Costs 25 GBUV">
    📊 Summarize Repository
</button>
```

### 5. Offer GBUV Top-Up

```javascript
async function analyzeWithTopUp(nodeData, userPublicKey) {
    const result = await window.merlinAI.analyzeCodeFlow(nodeData, userPublicKey);
    
    if (result.error === 'PAYMENT_REQUIRED') {
        const needed = result.cost - result.balance;
        
        if (confirm(`You need ${needed} more GBUV. Buy now?`)) {
            window.location.href = '/buy-gbuv?amount=' + needed;
        }
    }
    
    return result;
}
```

---

## 🔥 FIREBASE INTEGRATION

### Payment Collection Schema

**Collection:** `merlin_payments`

```javascript
{
    id: "tx_1734336000000_abc123",
    flowName: "analyzeCodeFlow",
    from: "ABC123...XYZ",  // User wallet
    to: "6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk",  // Treasury
    amount: 5,
    timestamp: "2025-12-16T10:30:00Z",
    sessionId: "session_1734336000_xyz789"
}
```

### Query Payment History

```javascript
// Get today's revenue
const today = new Date();
today.setHours(0, 0, 0, 0);

const { collection, query, where, getDocs } = window.firestoreUtils;
const q = query(
    collection(window.firebaseDb, 'merlin_payments'),
    where('timestamp', '>=', today.toISOString())
);

const snapshot = await getDocs(q);
let todayRevenue = 0;
snapshot.forEach(doc => {
    todayRevenue += doc.data().amount;
});

console.log(`💰 Today's revenue: ${todayRevenue} GBUV`);
```

---

## 🎊 STATUS

✅ **Payment system enabled**  
✅ **All 6 AI flows gated**  
✅ **Treasury wallet configured**  
✅ **Firebase logging active**  
✅ **Transaction tracking operational**  
✅ **Economy sustained!**  

**🎉 MERLIN AI NOW REQUIRES GBUV PAYMENTS! 🎉**

Every AI operation generates value for the GBUV economy! 💰
