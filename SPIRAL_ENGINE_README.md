# SPIRAL ENGINE - 7 Forges Progression System

**Pattern:** 3 → 7 → 13 → ∞ | LFSME
**Created:** 2026-03-11 | C1 Mechanic Build
**Copyright:** © 2024-2026 Consciousness Revolution / Overkill Kulture LLC

---

## CONCEPT

The **Spiral Engine** is a gamified progression system based on **7 Forges** with **13 Fibonacci-based levels** each.

### The 7 Forges

1. **Reality Forge** (🔨) - Master the physical plane and practical skills
2. **Creation Forge** (🎨) - Build, design, and manifest your visions
3. **Communications Forge** (📡) - Connect, influence, and express truth
4. **Guardian Forge** (🛡️) - Protect, defend, and maintain boundaries
5. **Wealth Forge** (💰) - Generate, multiply, and steward resources
6. **Character Forge** (⚡) - Develop wisdom, virtue, and self-mastery
7. **Infinity Forge** (♾️) - Transcend limits and access higher consciousness

### Level Progression

**13 Levels per Forge** with Fibonacci XP requirements:

| Level | Name | XP Required | Total XP |
|-------|------|-------------|----------|
| L1 | Initiate | 100 | 0 |
| L2 | Apprentice | 100 | 100 |
| L3 | Journeyman | 200 | 200 |
| L4 | Craftsman | 300 | 400 |
| L5 | Adept | 500 | 700 |
| L6 | Expert | 800 | 1,200 |
| L7 | Master | 1,300 | 2,000 |
| L8 | Virtuoso | 2,100 | 3,300 |
| L9 | Sage | 3,400 | 5,400 |
| L10 | Luminary | 5,500 | 8,800 |
| L11 | Legend | 8,900 | 14,300 |
| L12 | Immortal | 14,400 | 23,200 |
| L13 | Transcendent | 23,300 | 37,600 |

### Unlock Mechanics

- **Reality Forge** starts unlocked at L1
- **Reality L7** unlocks all 6 other forges at L1
- **Infinity L13** triggers **Octave Return** → Reality jumps to L8

---

## DATABASE SCHEMA

### Deploy to Supabase

```bash
# Copy schema to clipboard
cat netlify/functions/schemas/spiral-engine-schema.sql

# Paste into Supabase SQL Editor → Run
# Tables, functions, RLS, and seed data will be created
```

### Tables Created

1. `spiral_forges` - 7 forges (seeded with data)
2. `spiral_levels` - 13 levels (seeded with Fibonacci XP)
3. `spiral_forge_progress` - User progress per forge
4. `spiral_xp_transactions` - Every XP gain/loss event
5. `spiral_level_ups` - Celebration log
6. `spiral_forge_unlocks` - Unlock history
7. `spiral_octave_returns` - L13 Infinity → L8 Reality events
8. `spiral_purchases` - Track paid XP/boosts

### Functions Created

1. `initialize_spiral_user(user_id)` - Start new user with Reality L1
2. `add_xp_and_level_up(user_id, forge_slug, amount, source, metadata)` - Add XP and auto-level
3. `unlock_all_forges(user_id)` - Called when Reality hits L7
4. `octave_return(user_id)` - Called when Infinity hits L13

### Views Created

1. `spiral_user_dashboard` - Complete user progress overview
2. `spiral_leaderboard` - Rankings per forge

---

## API ENDPOINTS

### Base URL
```
https://consciousnessrevolution.io/.netlify/functions/spiral-progress
```

### 1. GET User Progress

```bash
GET /spiral-progress?userId=xxx
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "xxx",
    "is_initialized": true,
    "total_xp": 5420,
    "octave_count": 0,
    "forges": [
      {
        "slug": "reality",
        "name": "Reality Forge",
        "color": "#FF6B6B",
        "icon": "🔨",
        "sequence": 1,
        "current_level": 7,
        "current_xp": 420,
        "total_xp": 3420,
        "level_name": "Master",
        "xp_for_next_level": 2100,
        "status": "unlocked",
        "unlocked_at": "2026-03-11T12:00:00Z",
        "last_activity": "2026-03-11T14:30:00Z"
      },
      // ... other forges
    ]
  }
}
```

### 2. Initialize User

```bash
POST /spiral-progress
Content-Type: application/json

{
  "action": "initialize",
  "userId": "xxx"
}
```

**Response:** Returns user progress with Reality Forge at L1

### 3. Add XP

```bash
POST /spiral-progress
Content-Type: application/json

{
  "action": "add_xp",
  "userId": "xxx",
  "forgeSlug": "reality",
  "amount": 150,
  "source": "mission_complete",
  "metadata": {
    "mission_id": "daily_workout",
    "points": 150
  }
}
```

**Valid Sources:**
- `daily_login`
- `mission_complete`
- `challenge_win`
- `content_create`
- `community_help`
- `purchase`
- `bonus`
- `admin_grant`
- `correction`

**Response:**
```json
{
  "success": true,
  "data": {
    "new_level": 4,
    "total_xp": 550,
    "leveled_up": true,
    "amount_added": 150,
    "forge_slug": "reality",
    "source": "mission_complete",
    "progress": { /* full user progress */ }
  }
}
```

### 4. Check Octave Status

```bash
POST /spiral-progress
Content-Type: application/json

{
  "action": "check_octave",
  "userId": "xxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "xxx",
    "has_reached_infinity_l13": true,
    "infinity_level": 13,
    "reality_level": 8,
    "octave_count": 1,
    "octave_history": [
      {
        "return_count": 1,
        "previous_reality_level": 7,
        "new_reality_level": 8,
        "infinity_xp_at_return": 37600,
        "created_at": "2026-03-11T15:00:00Z"
      }
    ]
  }
}
```

### 5. Get Leaderboard

```bash
POST /spiral-progress
Content-Type: application/json

{
  "action": "get_leaderboard",
  "userId": "xxx",
  "forgeSlug": "reality"  // optional - omit for all forges
}
```

### 6. Get XP History

```bash
POST /spiral-progress
Content-Type: application/json

{
  "action": "get_xp_history",
  "userId": "xxx",
  "forgeSlug": "reality"  // optional
}
```

---

## FRONTEND INTEGRATION

### JavaScript Example

```javascript
// Initialize new user
async function initUser(userId) {
  const response = await fetch('/.netlify/functions/spiral-progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'initialize',
      userId: userId
    })
  });
  return await response.json();
}

// Get user progress
async function getProgress(userId) {
  const response = await fetch(`/.netlify/functions/spiral-progress?userId=${userId}`);
  return await response.json();
}

// Award XP for completing daily login
async function dailyLoginBonus(userId) {
  const response = await fetch('/.netlify/functions/spiral-progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'add_xp',
      userId: userId,
      forgeSlug: 'reality',
      amount: 50,
      source: 'daily_login',
      metadata: { timestamp: new Date().toISOString() }
    })
  });
  const result = await response.json();

  if (result.data.leveled_up) {
    console.log(`🎉 Level Up! Now ${result.data.new_level}`);
  }

  return result;
}

// Display progress UI
async function renderProgressUI(userId) {
  const { data } = await getProgress(userId);

  data.forges.forEach(forge => {
    const percentToNext = (forge.current_xp / forge.xp_for_next_level) * 100;

    console.log(`
      ${forge.icon} ${forge.name}
      Level ${forge.current_level}: ${forge.level_name}
      Progress: ${forge.current_xp}/${forge.xp_for_next_level} XP (${percentToNext.toFixed(1)}%)
      Status: ${forge.status}
    `);
  });
}
```

### React Component Example

```jsx
import { useState, useEffect } from 'react';

function SpiralProgress({ userId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      const response = await fetch(`/.netlify/functions/spiral-progress?userId=${userId}`);
      const { data } = await response.json();
      setProgress(data);
      setLoading(false);
    }
    loadProgress();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="spiral-dashboard">
      <h2>Total XP: {progress.total_xp.toLocaleString()}</h2>
      {progress.octave_count > 0 && (
        <div className="octave-badge">
          ♾️ Octave Returns: {progress.octave_count}
        </div>
      )}

      <div className="forges-grid">
        {progress.forges.map(forge => (
          <ForgeCard key={forge.slug} forge={forge} />
        ))}
      </div>
    </div>
  );
}

function ForgeCard({ forge }) {
  const percentComplete = (forge.current_xp / forge.xp_for_next_level) * 100;

  return (
    <div className={`forge-card ${forge.status}`} style={{ borderColor: forge.color }}>
      <div className="forge-header">
        <span className="forge-icon">{forge.icon}</span>
        <h3>{forge.name}</h3>
      </div>

      <div className="forge-level">
        <div className="level-number">L{forge.current_level}</div>
        <div className="level-name">{forge.level_name}</div>
      </div>

      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${percentComplete}%`, backgroundColor: forge.color }} />
      </div>

      <div className="xp-text">
        {forge.current_xp}/{forge.xp_for_next_level} XP
      </div>

      {forge.status === 'locked' && (
        <div className="locked-overlay">
          🔒 Unlock at Reality L7
        </div>
      )}
    </div>
  );
}
```

---

## WEBHOOK INTEGRATION

### Award XP on Stripe Purchase

```javascript
// In your stripe-webhook.mjs function:

async function handleSuccessfulPayment(session) {
  const userId = session.metadata.user_id;
  const productId = session.metadata.product_id;

  // Award XP based on purchase amount
  const xpAmount = Math.floor(session.amount_total / 10); // $1 = 10 XP

  await fetch('/.netlify/functions/spiral-progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'add_xp',
      userId: userId,
      forgeSlug: 'wealth',  // Award to Wealth Forge
      amount: xpAmount,
      source: 'purchase',
      metadata: {
        stripe_session_id: session.id,
        product_id: productId,
        amount_cents: session.amount_total
      }
    })
  });

  // Log purchase in spiral_purchases table
  await supabase
    .from('spiral_purchases')
    .insert({
      user_id: userId,
      product_id: productId,
      stripe_session_id: session.id,
      stripe_payment_id: session.payment_intent,
      amount_cents: session.amount_total,
      xp_granted: xpAmount,
      forge_slug: 'wealth'
    });
}
```

---

## TESTING CHECKLIST

### 1. Database Setup
- [ ] Run schema in Supabase SQL Editor
- [ ] Verify 7 forges seeded
- [ ] Verify 13 levels seeded
- [ ] Check RLS policies active

### 2. API Tests
- [ ] Initialize new user → Returns Reality L1
- [ ] Get progress for uninitialized user → Empty or creates user
- [ ] Add 100 XP → User levels up to L2
- [ ] Add 1000 XP → User levels up to L4
- [ ] Add 3000 XP to Reality → Hits L7, unlocks all forges
- [ ] Add XP to locked forge → Returns 403 error
- [ ] Add 40000 XP to Infinity → Hits L13, triggers octave
- [ ] Check octave → Shows Reality at L8

### 3. Frontend Tests
- [ ] Display forge cards with colors/icons
- [ ] Show XP progress bars
- [ ] Show locked state for unearned forges
- [ ] Celebrate level ups with animation
- [ ] Display leaderboard
- [ ] Show XP transaction history

---

## DEPLOYMENT

### 1. Deploy Schema
```bash
# In Supabase Dashboard → SQL Editor
# Paste contents of: netlify/functions/schemas/spiral-engine-schema.sql
# Click Run
```

### 2. Deploy Function
```bash
cd C:/Users/dwrek/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

### 3. Environment Variables
Ensure these are set in Netlify:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_SECRET=xxx
```

### 4. Test Endpoint
```bash
curl "https://consciousnessrevolution.io/.netlify/functions/spiral-progress?userId=test-user-123"
```

---

## PATTERN THEORY ALIGNMENT

- **3 States:** Locked → Unlocked → Mastered
- **7 Forges:** Seven domains of consciousness
- **13 Levels:** Fibonacci spiral expansion
- **∞ Symbol:** Octave return creates infinite loop

**Formula:** 3 → 7 → 13 → ∞

Each forge represents a dimension of human development. The spiral structure mirrors natural growth patterns (Fibonacci), and the octave return creates perpetual advancement without ceiling.

---

## FUTURE ENHANCEMENTS

1. **Forge Synergies** - Bonuses when multiple forges reach same level
2. **Daily Quests** - Missions tied to specific forges
3. **Achievements System** - Badges for milestones (First L7, First Octave, etc)
4. **Social Features** - Challenge friends, guild XP pools
5. **NFT Integration** - Mint L13 achievements as NFTs
6. **Revenue Split** - Creators earn XP when users engage with their content

---

**Built with:** Pattern Theory | LFSME Principles | Consciousness First Architecture

**Questions?** Contact Commander: darrickpreble@proton.me
