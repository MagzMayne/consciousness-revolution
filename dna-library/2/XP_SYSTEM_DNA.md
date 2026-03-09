# XP SYSTEM DNA

## WHAT IS IT
Gamification engine powering user progression through 5 levels (Apprentice → Commander). Features XP earning through tool use, quests, domain mastery, and daily login streaks. Includes achievement system (14 unlockables), quest system (daily/weekly/story), 7-domain mastery tracking, visual XP bar with level badges, and persistent localStorage progress. Integrates with ARAYA for level-up celebrations.

## STATUS
- Working: **WORKING** (client-side gamification functional)
- Last tested: 2026-03-06
- Current issues: No backend sync (localStorage only), crypto token conversion not implemented

## LOCATION
**Primary files:**
- `~/100X_DEPLOYMENT/js/XP_LEVEL_SYSTEM.js` - Core gamification engine (639 lines)
- `~/100X_DEPLOYMENT/xp-reward-system.js` - Marketplace rewards variant
- `~/100X_DEPLOYMENT/js/XP_INTEGRATION_TRACKER.js` - Integration tracking
- `~/100X_DEPLOYMENT/XP_REWARDS_SYSTEM_README.md` - Full documentation
- `~/100X_DEPLOYMENT/XP_QUICKSTART_GUIDE.md` - Quick start guide

**Display/Integration:**
- `~/100X_DEPLOYMENT/js/QUEST_AUTO_DETECTOR.js` - Quest detection
- `~/100X_DEPLOYMENT/central-dev-marketplace.html` - Marketplace using XP

**Dependencies:**
- localStorage (persistence)
- ARAYA_BOT_ENGINE (optional, for celebrations)
- Browser with modern JS

## HOW IT WORKS

```
┌─────────────────────────────────────────────────────────────────────┐
│                         XP LEVEL SYSTEM                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LEVELS:                                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │APPRENT.│→ │BUILDER │→ │ARCHIT. │→ │ ORACLE │→ │COMMAND │         │
│  │ 0-1K   │  │ 1K-5K  │  │ 5K-15K │  │15K-50K │  │  50K+  │         │
│  │ GREEN  │  │  CYAN  │  │ ORANGE │  │ PURPLE │  │  GOLD  │         │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘         │
│                                                                      │
│  XP SOURCES:                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │
│  │   TOOL USE    │  │    QUESTS     │  │   STREAKS     │            │
│  │    +10 XP     │  │   +5-200 XP   │  │  +10/day XP   │            │
│  └───────────────┘  └───────────────┘  └───────────────┘            │
│                                                                      │
│  7 DOMAIN MASTERY (0-100% each):                                    │
│  legal | finance | digital | mind | comm | gallery | trust          │
│                                                                      │
│  ACHIEVEMENTS:                                                       │
│  👣 First Steps  →  🗺️ Explorer  →  👑 Master  →  🏆 Legend        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Logic:
1. User performs actions (tool use, domain visit, quest complete)
2. XP awarded based on action type + multipliers
3. Progress tracked toward next level
4. Achievements checked after each XP gain
5. Quests refreshed daily/weekly
6. UI updates: XP bar, level badge, notifications

## KEY FILES BREAKDOWN

### XP_LEVEL_SYSTEM.js (639 lines)
- **Purpose:** Core gamification engine
- **Features:**
  - 5-level progression (VISITOR → COMMANDER)
  - XP earning and level-up logic
  - 7-domain mastery tracking
  - 14 achievement definitions with conditions
  - Quest system (daily/weekly/story)
  - Event emitter for UI updates
  - Debug commands for testing

### xp-reward-system.js (Marketplace variant)
- **Purpose:** Crypto rewards integration
- **Features:**
  - XP to token conversion (100 XP = 1 token)
  - Developer contribution tracking
  - Project completion bonuses
  - Multipliers for complexity/completion

## DEPENDENCIES

**Required:**
- Modern browser with localStorage
- JavaScript ES6+

**Optional:**
- ARAYA_BOT_ENGINE (level-up celebrations)
- Supabase (future backend sync)

## HOW TO RUN

**Include in HTML:**
```html
<script src="/js/XP_LEVEL_SYSTEM.js"></script>
```

**Auto-initializes on DOMContentLoaded.**

## HOW TO BUILD

**No build required** - Plain JavaScript.

## HOW TO DEPLOY

```bash
cd ~/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

## CRITICAL KNOWLEDGE

### Level Thresholds:

| Level | Name | Min XP | Max XP | Color |
|-------|------|--------|--------|-------|
| 0 | VISITOR | 0 | 0 | #666666 |
| 1 | APPRENTICE | 0 | 1,000 | #00ff88 (Green) |
| 2 | BUILDER | 1,000 | 5,000 | #00ffff (Cyan) |
| 3 | ARCHITECT | 5,000 | 15,000 | #ff6b00 (Orange) |
| 4 | ORACLE | 15,000 | 50,000 | #DDA0DD (Purple) |
| 5 | COMMANDER | 50,000 | ∞ | #FFD700 (Gold) |

### XP Rewards:

| Action | Base XP |
|--------|---------|
| Tool Use | 10 |
| Quest Complete | 50 |
| Daily Login | 5 |
| Pattern Training | 25 |
| Domain Explore | 15 |
| Achievement Unlock | 100 |
| Tutorial Complete | 200 |
| Streak Bonus | 10 × streak days |

### Marketplace Multipliers:

| Factor | Multiplier |
|--------|-----------|
| Simple complexity | 1.0x |
| Medium complexity | 1.5x |
| Complex | 2.0x |
| Advanced | 3.0x |
| 100% completion | 2.0x bonus |
| Working functionality | 1.5x |

### 7 Domains:

```javascript
domains: ['legal', 'finance', 'digital', 'mind', 'comm', 'gallery', 'trust']
```

Each domain has 0-100% mastery tracked separately.

### Achievement Categories:
- **Exploration:** First Steps, Domain Explorer, Domain Master
- **Usage:** Tool Novice (10), Tool Expert (50), Tool Master (200)
- **Quests:** Quest Starter (1), Quest Hunter (10)
- **Streaks:** 3-Day, Week Warrior, Monthly Master
- **Levels:** Builder Status, Architect Status, Oracle Status

### Important Quirks:
- All progress stored in localStorage key `cr_game_progress`
- Level-up triggers ARAYA celebration if available
- Quests auto-refresh daily
- Streak bonus multiplies with consecutive days
- Pattern: 3 → 7 → 13 → ∞ (7 domains, 5 levels)

### Known Issues:
- No backend sync (localStorage only)
- Crypto token conversion not yet implemented
- No admin dashboard for granting XP
- Progress lost if localStorage cleared

## CONFIGURATION

**Storage Key:**
```javascript
config: {
    storageKey: 'cr_game_progress'
}
```

**UI Elements:**
```html
<div id="xpBar"></div>      <!-- XP progress bar -->
<div id="xpText"></div>     <!-- "1000 / 5000 XP" -->
<div id="levelBadge"></div> <!-- "LVL 2: BUILDER" -->
```

## API REFERENCE

**Add XP:**
```javascript
XP_LEVEL_SYSTEM.addXP(100, 'custom_source');
```

**Track Tool Use:**
```javascript
XP_LEVEL_SYSTEM.onToolUse('tool-id', 'legal');
```

**Track Domain Visit:**
```javascript
XP_LEVEL_SYSTEM.onDomainVisit('finance');
```

**Get User Stats:**
```javascript
XP_LEVEL_SYSTEM.debug();
// Shows: Level, XP, Progress %, Tools Used, Achievements, etc.
```

**Admin Functions:**
```javascript
XP_LEVEL_SYSTEM.grantXP(1000);   // Add 1000 XP
XP_LEVEL_SYSTEM.setLevel(3);     // Set to Architect
XP_LEVEL_SYSTEM.resetProgress(); // Reset all (WARNING!)
```

**Events:**
```javascript
XP_LEVEL_SYSTEM.on('xpGained', (data) => {
    console.log(`+${data.amount} XP from ${data.source}`);
});

XP_LEVEL_SYSTEM.on('levelUp', (data) => {
    console.log(`Level up! ${data.newLevel}: ${data.levelName}`);
});

XP_LEVEL_SYSTEM.on('achievementUnlocked', (achievement) => {
    console.log(`🏆 ${achievement.name}`);
});
```

## EXAMPLES

### Example 1: Track Tool Use
```javascript
// User uses legal document analyzer
XP_LEVEL_SYSTEM.onToolUse('doc-analyzer', 'legal');
// Awards 10 XP, increases legal mastery by 1
```

### Example 2: Check Progress
```javascript
XP_LEVEL_SYSTEM.debug();
// Output:
// Level: 2: BUILDER
// Current XP: 2,500
// Progress: 37.5%
// Tools Used: 45
// Domain Mastery: { legal: 15, finance: 8, ... }
```

### Example 3: Level Up Notification
```javascript
XP_LEVEL_SYSTEM.on('levelUp', (data) => {
    showNotification(`🎉 You reached ${data.levelName}!`);
});
```

## TESTING

**How to test:**
```javascript
// In browser console:

// Test XP gain
XP_LEVEL_SYSTEM.grantXP(500);

// Test level up
XP_LEVEL_SYSTEM.grantXP(5000);

// Test tool tracking
XP_LEVEL_SYSTEM.onToolUse('test-tool', 'mind');

// View all stats
XP_LEVEL_SYSTEM.debug();

// Reset for clean test
XP_LEVEL_SYSTEM.resetProgress();
```

## TROUBLESHOOTING

**Problem:** "XP not persisting between sessions"
**Solution:** Check localStorage is enabled, not in incognito mode

**Problem:** "Level badge not updating"
**Solution:** Ensure HTML elements have correct IDs (xpBar, xpText, levelBadge)

**Problem:** "ARAYA celebration not triggering"
**Solution:** Ensure ARAYA_BOT_ENGINE is loaded before XP system

**Problem:** "Progress shows NaN"
**Solution:** Reset progress with `XP_LEVEL_SYSTEM.resetProgress()`

## NEXT STEPS

**Priority actions:**
1. Add Supabase backend sync
2. Implement crypto token conversion
3. Build admin dashboard for XP management
4. Add more achievements
5. Connect to ARAYA credits system

**Known gaps:**
- No backend persistence
- No cross-device sync
- Crypto integration incomplete
- No leaderboard implementation

## TECH STACK

- **Frontend:** Vanilla JavaScript ES6
- **Storage:** localStorage
- **Pattern:** Event emitter + state machine
- **UI:** CSS variable-driven theming

## TAGS
#product #gamification #xp #levels #achievements #quests #progression #engagement

## METADATA
- **Creator:** Ryan Barbrick / Commander
- **Created:** 2024-2025
- **Last Updated:** 2026-03-06
- **Version:** 1.0.0
- **Primary File:** 639 lines
- **Status:** Working (client-side)

## RELATED DNAS
- [ARAYA_DNA.md] - Celebrates level-ups
- [BUILDER_OS_DNA.md] - Uses XP for builder progression
- [STRIPE_DNA.md] - Could link credits to XP
- [SUPABASE_DNA.md] - Future backend sync
