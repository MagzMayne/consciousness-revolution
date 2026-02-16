# 📊 MERLIN AI - FIREBASE TELEMETRY SYSTEM

**Status:** ✅ **COMPLETE & OPERATIONAL**  
**Date:** December 16, 2025  
**Purpose:** Comprehensive metrics tracking for Merlin AI  

---

## 🎯 OVERVIEW

Since this is a **browser-based application**, we can't use npm or `@genkit-ai/firebase`. Instead, I've implemented a **custom browser-compatible telemetry system** that logs all Merlin AI activity to Firebase!

### What Gets Tracked:

✅ **Every AI request** (duration, success/failure, tokens used)  
✅ **Flow-specific metrics** (which flows are used most)  
✅ **Performance data** (response times, error rates)  
✅ **Usage patterns** (files analyzed, repositories summarized)  
✅ **Session tracking** (unique session IDs per user)  

---

## 🔥 FIREBASE COLLECTION

### New Collection: `merlin_telemetry`

Every AI call logs:

```javascript
{
  sessionId: "session_1734336000_abc123",
  flowName: "analyzeCodeFlow",
  model: "gemini-1.5-flash",
  duration: 3420,                    // milliseconds
  success: true,
  timestamp: "2025-12-16T10:30:00Z",
  serverTimestamp: Firestore.serverTimestamp(),
  
  // Flow-specific metadata
  fileName: "user-auth.js",
  language: "JavaScript",
  quality: 8,
  linesOfCode: 450,
  tokens: 1234
}
```

---

## 📊 METRICS TRACKED

### For All Flows:
- **Session ID** - Unique identifier per user session
- **Flow Name** - Which AI flow was used
- **Model** - Which Gemini model (gemini-1.5-flash)
- **Duration** - Time in milliseconds
- **Success** - True/false based on API response
- **Timestamp** - ISO 8601 format
- **Server Timestamp** - Firestore server time

### For analyzeCodeFlow:
- File name
- Programming language
- Quality score (1-10)
- Lines of code
- Token count

### For summarizeRepositoryFlow:
- Repository name
- Total value
- Node count
- Complexity average

### For suggestFixFlow:
- Issue type
- File name

### For generate (base function):
- Prompt length
- Response length
- Token count

---

## 🚀 HOW TO USE

### Automatic Tracking (No Code Changes Needed)

Telemetry is **automatically enabled** for all AI calls:

```javascript
// This code already logs telemetry automatically
const analysis = await window.merlinAI.analyzeCodeFlow(nodeData);
```

### View Session Summary

```javascript
// Get summary of current session
const summary = window.merlinAI.getTelemetrySummary();
console.log(summary);

/*
Output:
{
  sessionId: "session_1734336000_abc123",
  totalCalls: 42,
  successfulCalls: 40,
  failedCalls: 2,
  averageDuration: 3250,
  totalTokens: 48650,
  flowBreakdown: {
    analyzeCodeFlow: { count: 25, successCount: 25, avgDuration: 3400 },
    summarizeRepositoryFlow: { count: 5, successCount: 5, avgDuration: 5200 },
    helloFlow: { count: 12, successCount: 10, avgDuration: 2100 }
  },
  recentMetrics: [...]
}
*/
```

### Export Telemetry Data

```javascript
// Export all metrics as JSON
const telemetryJSON = window.merlinAI.exportTelemetry();
console.log(telemetryJSON);

// Download as file
const blob = new Blob([telemetryJSON], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `merlin-telemetry-${Date.now()}.json`;
a.click();
```

### Disable Telemetry (If Needed)

```javascript
// Disable telemetry
window.merlinAI.telemetry.enabled = false;

// Re-enable
window.merlinAI.telemetry.enabled = true;
```

---

## 📈 VIEWING METRICS IN FIREBASE

### Method 1: Firestore Console

1. Open Firebase Console: https://console.firebase.google.com
2. Select project: **gem-bot-57068**
3. Go to **Firestore Database**
4. Find collection: **merlin_telemetry**
5. View all logged metrics

### Method 2: Query from Code

```javascript
// Get all telemetry for current session
const { collection, query, where, getDocs } = window.firestoreUtils;
const telemetryRef = collection(window.firebaseDb, 'merlin_telemetry');
const q = query(
  telemetryRef,
  where('sessionId', '==', window.merlinAI.telemetry.sessionId)
);

const snapshot = await getDocs(q);
snapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});
```

### Method 3: Build Dashboard

```javascript
// Get metrics grouped by flow
const { collection, getDocs } = window.firestoreUtils;
const telemetryRef = collection(window.firebaseDb, 'merlin_telemetry');
const snapshot = await getDocs(telemetryRef);

const metrics = {};
snapshot.forEach(doc => {
  const data = doc.data();
  if (!metrics[data.flowName]) {
    metrics[data.flowName] = { count: 0, totalDuration: 0 };
  }
  metrics[data.flowName].count++;
  metrics[data.flowName].totalDuration += data.duration;
});

Object.keys(metrics).forEach(flow => {
  metrics[flow].avgDuration = metrics[flow].totalDuration / metrics[flow].count;
  console.log(`${flow}: ${metrics[flow].count} calls, avg ${metrics[flow].avgDuration}ms`);
});
```

---

## 🎨 EXAMPLE TELEMETRY DASHBOARD

Add this to your admin dashboard:

```html
<div id="telemetryDashboard" style="padding: 20px; background: #0f1419; margin: 20px;">
  <h2>📊 Merlin AI Telemetry</h2>
  <div id="telemetryStats"></div>
  <button onclick="refreshTelemetry()">🔄 Refresh</button>
  <button onclick="exportTelemetry()">💾 Export JSON</button>
</div>

<script>
async function refreshTelemetry() {
  const summary = window.merlinAI.getTelemetrySummary();
  
  document.getElementById('telemetryStats').innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
      <div style="background: #1e3a8a; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold;">${summary.totalCalls}</div>
        <div style="opacity: 0.8;">Total Calls</div>
      </div>
      <div style="background: #047857; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold;">${summary.successfulCalls}</div>
        <div style="opacity: 0.8;">Successful</div>
      </div>
      <div style="background: #dc2626; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold;">${summary.failedCalls}</div>
        <div style="opacity: 0.8;">Failed</div>
      </div>
      <div style="background: #7c3aed; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold;">${summary.averageDuration.toFixed(0)}ms</div>
        <div style="opacity: 0.8;">Avg Duration</div>
      </div>
      <div style="background: #db2777; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold;">${summary.totalTokens.toLocaleString()}</div>
        <div style="opacity: 0.8;">Total Tokens</div>
      </div>
      <div style="background: #ea580c; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold;">${Object.keys(summary.flowBreakdown).length}</div>
        <div style="opacity: 0.8;">Unique Flows</div>
      </div>
    </div>
    
    <h3 style="margin-top: 20px;">Flow Breakdown:</h3>
    <div style="margin-top: 10px;">
      ${Object.entries(summary.flowBreakdown).map(([flow, stats]) => `
        <div style="background: #1f2937; padding: 10px; margin: 5px 0; border-radius: 6px;">
          <strong>${flow}</strong>: ${stats.count} calls 
          (${stats.successCount} success, ${stats.failCount} fail, 
          avg ${stats.avgDuration.toFixed(0)}ms)
        </div>
      `).join('')}
    </div>
  `;
}

function exportTelemetry() {
  const data = window.merlinAI.exportTelemetry();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `merlin-telemetry-${Date.now()}.json`;
  a.click();
  alert('✅ Telemetry exported!');
}

// Auto-refresh every 30 seconds
setInterval(refreshTelemetry, 30000);
</script>
```

---

## 📊 METRICS YOU'LL SEE

### After 1 Hour of Use:

```
📊 Merlin AI Telemetry

Total Calls:         127
Successful:          124 (97.6%)
Failed:              3 (2.4%)
Avg Duration:        3,250ms
Total Tokens:        156,420
Unique Flows:        5

Flow Breakdown:
- analyzeCodeFlow: 68 calls (68 success, 0 fail, avg 3,400ms)
- summarizeRepositoryFlow: 12 calls (11 success, 1 fail, avg 5,200ms)
- suggestFixFlow: 24 calls (24 success, 0 fail, avg 4,100ms)
- predictValueImpactFlow: 15 calls (13 success, 2 fail, avg 4,800ms)
- helloFlow: 8 calls (8 success, 0 fail, avg 2,100ms)
```

---

## 🔍 ADVANCED QUERIES

### Get Today's Metrics:

```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const { collection, query, where, getDocs } = window.firestoreUtils;
const q = query(
  collection(window.firebaseDb, 'merlin_telemetry'),
  where('timestamp', '>=', today.toISOString())
);

const snapshot = await getDocs(q);
console.log(`Today's calls: ${snapshot.size}`);
```

### Get Failed Requests:

```javascript
const { collection, query, where, getDocs } = window.firestoreUtils;
const q = query(
  collection(window.firebaseDb, 'merlin_telemetry'),
  where('success', '==', false)
);

const snapshot = await getDocs(q);
snapshot.forEach(doc => {
  const data = doc.data();
  console.log(`Failed: ${data.flowName} at ${data.timestamp}`);
  console.log(`Error:`, data.error);
});
```

### Calculate Cost:

```javascript
// Gemini 1.5 Flash pricing: $0.075 per 1M input tokens, $0.30 per 1M output tokens
const summary = window.merlinAI.getTelemetrySummary();
const estimatedCost = (summary.totalTokens / 1000000) * 0.1875; // Average of input/output
console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);
```

---

## 🎯 WHAT THIS REPLACES

Instead of npm-based `@genkit-ai/firebase`:

```javascript
// ❌ Can't do this in browser:
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
enableFirebaseTelemetry();
```

You get this:

```javascript
// ✅ Browser-compatible telemetry:
window.merlinAI.telemetry.enabled = true;
// Automatically logs to Firebase Firestore
// All metrics tracked per session
// Export/analyze anytime
```

---

## 🎉 BENEFITS

✅ **No npm/Node.js required** - Works in browser  
✅ **Automatic logging** - Every AI call tracked  
✅ **Firebase integration** - Data persists in Firestore  
✅ **Session tracking** - Group metrics by session  
✅ **Real-time monitoring** - View metrics as they happen  
✅ **Export capability** - Download JSON anytime  
✅ **Cost tracking** - Calculate Gemini API costs  
✅ **Error tracking** - See what failed and why  

---

## 🚀 NEXT STEPS

### Immediate:
1. ✅ **Telemetry is already enabled** - No action needed
2. 🧪 **Test it**: Run MERLIN_AI_TEST_DEMO.html
3. 🔥 **Check Firebase**: View merlin_telemetry collection
4. 📊 **Get summary**: `console.log(window.merlinAI.getTelemetrySummary())`

### Short-Term:
5. 📈 **Build dashboard**: Add telemetry panel to admin dashboard
6. 📧 **Set alerts**: Notify on high failure rates
7. 💰 **Track costs**: Monitor token usage and costs
8. 📊 **Analyze patterns**: See which flows are used most

### Long-Term:
9. 🎯 **Optimize**: Reduce duration for slow flows
10. 🔄 **A/B test**: Compare different prompts
11. 📈 **Scale**: Monitor as usage grows
12. 🤖 **Automate**: Auto-retry failed requests

---

## 📞 SUPPORT

**Project:** GemBot AI Control System  
**Feature:** Merlin AI Telemetry  
**Owner:** Ryan Barbrick / Barbrick Design  
**Email:** BarbrickDesign@gmail.com  
**Firebase Collection:** `merlin_telemetry`  

---

## 🎊 STATUS

✅ **Telemetry system implemented**  
✅ **Firebase logging configured**  
✅ **Session tracking enabled**  
✅ **Export functionality ready**  
✅ **All flows instrumented**  
✅ **Browser-compatible (no npm needed)**  
✅ **GBUV payment system integrated**  

**🎉 TELEMETRY IS OPERATIONAL! 🎉**

Every Merlin AI call is now tracked and logged to Firebase! 📊

---

## 💰 NEW: PAYMENT TRACKING

All AI operations now require GBUV tokens! Telemetry tracks both usage AND payments.

### Payment Metrics:
- Cost per flow
- Total GBUV collected
- Payment success/failure rates
- User spending patterns

See [MERLIN_AI_PAYMENT_SYSTEM.md](MERLIN_AI_PAYMENT_SYSTEM.md) for complete payment documentation.

**Treasury Wallet:** `6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk`
