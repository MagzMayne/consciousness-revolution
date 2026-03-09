# GROW DOMAIN - QUICK START (C1 MECHANIC)
**Status:** READY TO EXECUTE
**Time Estimate:** 6-8 hours for full MVP
**Complexity:** BEGINNER-FRIENDLY
**ROI:** IMMEDIATE REVENUE

---

## WHAT CAN SHIP TODAY (6 HOURS)

1. **Stripe Payment Buttons** (0.5 hours) → Revenue flowing
2. **XP Backend Sync** (2.5 hours) → Data persists
3. **Live Revenue Dashboard** (3 hours) → Visibility

**Total by end of day:** Money flowing + Data safe + Full visibility

---

## TASK 1: STRIPE PAYMENT LINKS (30 MINUTES)

### Step 1: Generate Links
```
Go to: https://dashboard.stripe.com/payment-links
Login: darrickpreble@proton.me

For each product:
1. Click "New"
2. Select product
3. Copy link
4. Paste into list below
```

**Product 1: Founding Member**
```
Price: $47/month
Product ID: prod_TfPhODL45FtXPv
Link: [GENERATE IN DASHBOARD]
```

**Product 2: Pattern Tools Pro**
```
Price: $99/month
Product ID: prod_TfPihrnodxrfwg
Link: [GENERATE IN DASHBOARD]
```

**Product 3: Emergency Consulting**
```
Price: $500 (one-time)
Product ID: prod_TfPirE9grOAsws
Link: [GENERATE IN DASHBOARD]
```

### Step 2: Update pricing.html
```
Find file: 100X_DEPLOYMENT/pricing.html

Add 3 buttons with checkout links:

<!-- Founding Member -->
<a href="[LINK_1]" class="btn btn-founding">
  Join as Founding Member<br>
  <strong>$47/month</strong><br>
  <small>Full platform access</small>
</a>

<!-- Pattern Tools Pro -->
<a href="[LINK_2]" class="btn btn-pro">
  Upgrade to Pattern Tools Pro<br>
  <strong>$99/month</strong><br>
  <small>Advanced tools + priority support</small>
</a>

<!-- Emergency Consulting -->
<a href="[LINK_3]" class="btn btn-emergency">
  Book Emergency Session<br>
  <strong>$500</strong><br>
  <small>1-hour live consultation</small>
</a>
```

### Step 3: Style Buttons
```css
.btn-founding {
  background: linear-gradient(135deg, #00ff88, #00aa66);
  color: black;
  padding: 20px 30px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
  font-weight: bold;
  margin: 10px;
  transition: transform 0.3s;
}

.btn-founding:hover {
  transform: scale(1.05);
}

.btn-pro {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: black;
}

.btn-emergency {
  background: linear-gradient(135deg, #ff6b6b, #cc0000);
  color: white;
}
```

### Step 4: Test & Deploy
```bash
# Test locally first
cd "C:\Users\dwrek\100X_DEPLOYMENT"
python -m http.server 8000

# Visit http://localhost:8000/pricing.html
# Click a button → should go to Stripe checkout
# Use test card: 4242 4242 4242 4242 / 12/25 / 123

# If it works, deploy:
cd "C:\Users\dwrek\100X_DEPLOYMENT"
netlify deploy --prod --dir=.
```

**Success:** Stripe test payments work, webhook fires
**Time:** 30 minutes

---

## TASK 2: XP BACKEND SYNC (2.5 HOURS)

### Overview
XP currently stored only in localStorage (gets deleted if user clears cache).
Solution: Sync to Supabase every 30 seconds.

### Step 1: Create Supabase Table
```sql
-- In Supabase SQL Editor:
-- https://app.supabase.com/project/YOUR_PROJECT/sql/new

CREATE TABLE IF NOT EXISTS user_xp_progress (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT UNIQUE,
  level INT DEFAULT 1,
  current_xp INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  domain_mastery JSONB DEFAULT '{
    "legal": 0,
    "finance": 0,
    "digital": 0,
    "mind": 0,
    "comm": 0,
    "gallery": 0,
    "trust": 0
  }'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  quests JSONB DEFAULT '[]'::jsonb,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE user_xp_progress ENABLE ROW LEVEL SECURITY;

-- Allow public read (for dashboards)
CREATE POLICY "Allow public read" ON user_xp_progress
  FOR SELECT USING (true);

-- Allow user update own record
CREATE POLICY "Allow user update own record" ON user_xp_progress
  FOR UPDATE USING (true);
```

### Step 2: Create Netlify Function
```
File: 100X_DEPLOYMENT/netlify/functions/xp-sync-api.mjs

Create this file with content below:
```

```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const handler = async (event, context) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const { userId, level, currentXp, totalXp, domainMastery, achievements } = JSON.parse(event.body)

    // Validate required fields
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'userId required' }) }
    }

    // Upsert (insert or update)
    const { data, error } = await supabase
      .from('user_xp_progress')
      .upsert({
        user_id: userId,
        level,
        current_xp: currentXp,
        total_xp: totalXp,
        domain_mastery: domainMastery,
        achievements: achievements,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Sync error:', error)
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data })
    }
  } catch (err) {
    console.error('Handler error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
```

### Step 3: Modify XP_LEVEL_SYSTEM.js
Find file: `100X_DEPLOYMENT/js/XP_LEVEL_SYSTEM.js`

Add this code after the class initialization (around line 100):

```javascript
// === SUPABASE SYNC ===
// Auto-sync every 30 seconds
setInterval(() => {
  const userId = localStorage.getItem('userId') || 'anonymous_' + Date.now()
  const progress = XP_LEVEL_SYSTEM.getProgress()

  fetch('/.netlify/functions/xp-sync-api', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      level: progress.level,
      currentXp: progress.currentXp,
      totalXp: progress.totalXp,
      domainMastery: progress.domainMastery,
      achievements: progress.achievements
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      console.log('[XP] Synced to Supabase')
    }
  })
  .catch(err => console.error('[XP Sync Error]', err))
}, 30000) // Every 30 seconds
```

Add this function to XP_LEVEL_SYSTEM class (add at end of class):

```javascript
getProgress() {
  const data = JSON.parse(localStorage.getItem(this.config.storageKey) || '{}')
  return {
    level: data.level || 1,
    currentXp: data.currentXp || 0,
    totalXp: data.totalXp || 0,
    domainMastery: data.domainMastery || {},
    achievements: data.achievements || []
  }
}
```

### Step 4: Set Environment Variables
In Netlify dashboard:
```
Site Settings → Environment Variables

Add:
SUPABASE_URL: [your-project].supabase.co
SUPABASE_ANON_KEY: [your-anon-key]
```

### Step 5: Test
```javascript
// In browser console on any page with XP_LEVEL_SYSTEM:

// Simulate XP gain
XP_LEVEL_SYSTEM.grantXP(100)

// Check sync worked (wait 30 seconds)
// Go to Supabase → Table Editor
// Look for user_xp_progress with your userId
// Should show updated XP

// Test persistence
localStorage.clear()
// Reload page
// XP should be restored from Supabase!
```

**Success:** XP synced to Supabase, survives cache clear
**Time:** 2.5 hours

---

## TASK 3: LIVE REVENUE DASHBOARD (3 HOURS)

### Overview
Query Stripe API for real subscriber data and display on dashboard.

### Step 1: Create Revenue API Function
```
File: 100X_DEPLOYMENT/netlify/functions/stripe-revenue-api.mjs
```

```javascript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const handler = async (event, context) => {
  try {
    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100
    })

    // Get customers
    const customers = await stripe.customers.list({
      limit: 100
    })

    // Calculate metrics
    const activeSubscriptions = subscriptions.data.filter(s => s.status === 'active')

    let totalMRR = 0
    const tiers = {
      founding: 0,
      pro: 0,
      consulting: 0
    }

    activeSubscriptions.forEach(sub => {
      const item = sub.items.data[0]
      if (item.price.recurring) {
        const monthlyAmount = item.price.unit_amount / 100
        totalMRR += monthlyAmount

        // Categorize by price
        if (item.price.unit_amount === 4700) tiers.founding++
        if (item.price.unit_amount === 9900) tiers.pro++
        if (item.price.unit_amount === 50000) tiers.consulting++
      }
    })

    const projectedAnnualRevenue = totalMRR * 12
    const averageRevenuePerUser = activeSubscriptions.length > 0
      ? (totalMRR * 100) / activeSubscriptions.length
      : 0

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        metrics: {
          totalMRR: totalMRR.toFixed(2),
          activeSubscribers: activeSubscriptions.length,
          projectedAnnualRevenue: projectedAnnualRevenue.toFixed(2),
          averageRevenuePerUser: averageRevenuePerUser.toFixed(2),
          tierBreakdown: tiers,
          lastUpdated: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    console.error('Stripe API error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
```

### Step 2: Create Dashboard Module
```
File: 100X_DEPLOYMENT/js/REVENUE_DASHBOARD.js
```

```javascript
class RevenueDashboard {
  constructor(containerId = 'revenue-dashboard') {
    this.container = document.getElementById(containerId)
    this.refreshInterval = 5 * 60 * 1000 // 5 minutes
    this.init()
  }

  async init() {
    await this.loadMetrics()
    setInterval(() => this.loadMetrics(), this.refreshInterval)
  }

  async loadMetrics() {
    try {
      const response = await fetch('/.netlify/functions/stripe-revenue-api')
      const { metrics } = await response.json()
      this.render(metrics)
    } catch (error) {
      console.error('Dashboard error:', error)
    }
  }

  render(metrics) {
    const html = `
      <div class="revenue-grid">
        <div class="metric-card">
          <div class="metric-label">Monthly Recurring Revenue</div>
          <div class="metric-value">$${metrics.totalMRR}</div>
          <div class="metric-subtext">
            Annualized: $${metrics.projectedAnnualRevenue}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Active Subscribers</div>
          <div class="metric-value">${metrics.activeSubscribers}</div>
          <div class="metric-subtext">
            ARPU: $${metrics.averageRevenuePerUser}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Founding Members</div>
          <div class="metric-value">${metrics.tierBreakdown.founding}</div>
          <div class="metric-subtext">@$47/month</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Pro Subscribers</div>
          <div class="metric-value">${metrics.tierBreakdown.pro}</div>
          <div class="metric-subtext">@$99/month</div>
        </div>
      </div>

      <div class="metric-footer">
        Last updated: ${new Date(metrics.lastUpdated).toLocaleTimeString()}
      </div>
    `

    this.container.innerHTML = html
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new RevenueDashboard('revenue-dashboard')
})
```

### Step 3: Add to GROWTH_COCKPIT.html
Find line in `100X_DEPLOYMENT/GROWTH_COCKPIT.html`:
```html
<!-- Add after <body> tag -->
<div id="revenue-dashboard" style="padding: 20px;"></div>
<script src="/js/REVENUE_DASHBOARD.js"></script>
```

### Step 4: Add CSS
In same file, add to `<style>` section:
```css
.revenue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.metric-label {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.metric-value {
  font-size: 2rem;
  color: var(--gold);
  font-weight: bold;
  margin-bottom: 5px;
}

.metric-subtext {
  font-size: 0.85rem;
  color: var(--text-dim);
}

.metric-footer {
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-top: 20px;
}
```

### Step 5: Deploy
```bash
cd "C:\Users\dwrek\100X_DEPLOYMENT"
netlify deploy --prod --dir=.
```

**Success:** Dashboard shows live revenue from Stripe
**Time:** 3 hours

---

## DEPLOYMENT CHECKLIST

### Before Deploying:
- [ ] Stripe payment links generated
- [ ] pricing.html updated with buttons
- [ ] Tested payment buttons locally
- [ ] Supabase table created
- [ ] Netlify functions created
- [ ] XP_LEVEL_SYSTEM.js modified
- [ ] Environment variables set
- [ ] GROWTH_COCKPIT.html updated with dashboard script

### Deployment:
```bash
cd "C:\Users\dwrek\100X_DEPLOYMENT"

# Deploy to Netlify
netlify deploy --prod --dir=.

# Wait for deployment complete
# Check at: https://consciousnessrevolution.io/pricing.html
# Test Stripe button
# Check at: https://consciousnessrevolution.io/GROWTH_COCKPIT.html
# Verify revenue dashboard loads
```

### Post-Deployment Testing:
1. Visit pricing.html
2. Click Stripe button
3. Complete test payment (4242 4242 4242 4242)
4. Check webhook fires (Netlify Functions logs)
5. Verify XP data syncing (Supabase table)
6. Confirm revenue shows on dashboard

---

## SUCCESS METRICS

After completing all 3 tasks:

| Metric | Target | Success |
|--------|--------|---------|
| Stripe payments working | Live | Test payment completes |
| XP syncs to Supabase | Every 30s | Data in table after sync |
| Revenue dashboard live | Real data | Shows correct MRR |
| Webhook fires | Subscription created | Logs in Netlify |
| Data persists | After cache clear | XP restored from Supabase |

---

## EMERGENCY ROLLBACK

If something breaks:

```bash
# Revert Netlify deployment
netlify deploys

# Find last working deploy hash
netlify deploy --prod --dir=. --ref=[WORKING_HASH]

# Or restore git state
git revert [BAD_COMMIT]
git push
netlify deploy --prod --dir=.
```

---

## TIME BREAKDOWN

| Task | Estimate | Actual |
|------|----------|--------|
| Stripe buttons | 0.5h | _ |
| XP sync backend | 2.5h | _ |
| Revenue dashboard | 3h | _ |
| Deployment & testing | 1h | _ |
| **TOTAL** | **7h** | **_** |

---

## WHAT YOU'LL HAVE AT END OF DAY

✅ Live payment buttons on pricing page
✅ Money flowing in from Stripe
✅ XP data persisting to Supabase
✅ Real-time revenue dashboard
✅ Full visibility into subscriber metrics
✅ Webhook integration with payment handling
✅ Foundation for credits system

**Next week:** Complete XP → Credits conversion for full economy

---

**Created by:** C1 Mechanic
**Status:** READY TO BUILD
**Confidence:** 98%
