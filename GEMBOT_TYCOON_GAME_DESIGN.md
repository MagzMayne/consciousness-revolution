---
layout: default
title: GEMBOT TYCOON GAME DESIGN
---

# 🎮 GemBot Tycoon - Complete Game Design Document

**Version:** 2.0  
**Author:** Ryan Barbrick / Barbrick Design  
**Date:** December 2025  

---

## 🎯 Core Game Loop

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GEMBOT TYCOON GAME LOOP                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ⛏️ MINING          →    📦 ROUGH INVENTORY    →    🔧 PREP STATION   │
│   (3D World)              (Table Display)            (Clean & Prep)     │
│   Costs GBUV              Limited Slots              Ready for Dopping  │
│   Random Finds            Trade/Sell Here                               │
│                                                                         │
│         ↓                                                               │
│                                                                         │
│   🕯️ DOPPING         →    🪵 DOP HOLDER         →    💎 GEMBOT CUTTING │
│   (Glue to Dop)           (Wood Block w/Holes)       (Machine Work)     │
│   Wax/Epoxy Choice        Ready Queue                Auto + Manual      │
│                           Sell as Prepped            Realistic Timing   │
│                                                                         │
│         ↓                                                               │
│                                                                         │
│   ✨ FINISHED GEM     →    🏪 MARKETPLACE        →    💰 PROFIT         │
│   (Quality Graded)        (Sell/Trade)               (GBUV Tokens)      │
│   Certificate Ready       Austin's Forge             Reinvest/Withdraw  │
│                           Fantasy Cuts                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏠 Workshop Environment (Main Game Area)

### Table Layout
```
┌───────────────────────────────────────────────────────────────────┐
│                         WORKSHOP TABLE                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐   ┌──────────────────┐   ┌──────────────────────┐  │
│  │  ROUGH   │   │   PREP STATION   │   │    DOP HOLDER        │  │
│  │  PILE    │   │                  │   │    (Wood Block)      │  │
│  │          │   │  [Clean Stone]   │   │                      │  │
│  │  🪨 🪨 🪨 │   │  [Orient]        │   │  ○ ○ ○ ○ ○ ○ ○ ○   │  │
│  │  🪨 🪨    │   │  [Mark Facets]   │   │  ○ ○ ○ ○ ○ ○ ○ ○   │  │
│  │          │   │  [Apply Wax]     │   │  (Ready for cutting) │  │
│  │  Slots:  │   │  [Mount on Dop]  │   │                      │  │
│  │  5/8     │   │                  │   │  Slots: 16 (upgr.)   │  │
│  └──────────┘   └──────────────────┘   └──────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    GEMBOT MACHINES                          │   │
│  │   [GemBot #1]    [GemBot #2]    [GemBot #3]                │   │
│  │   Cutting...     Idle           Polishing...               │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### Rough Inventory System
- **Starting Slots:** 5 rough stones
- **Upgradeable:** 5 → 8 → 12 → 20 → 50 slots
- **Upgrade Costs:** 100 → 500 → 2,000 → 10,000 GBUV
- **Visual:** Actual 3D stones on table, clickable
- **Actions:** 
  - Click stone → View details (type, quality estimate, size)
  - Drag to Prep Station → Start preparation
  - Drag to Trade → List for sale

### Dop Stick Holder
- **Visual:** Wooden block with holes (like a pen holder)
- **Starting Slots:** 8 dop positions
- **Upgradeable:** 8 → 16 → 32 → 64 slots
- **States:**
  - Empty hole: ○
  - Dopped stone ready: ●
  - Currently cutting: 🔵 (blue glow)

---

## ⛏️ Mining World System

### 3D Mining Environment
Players can explore a 3D world to set up mining operations.

### Mining Post Types
| Post Type | Cost (GBUV) | Daily Op Cost | Find Rate | Quality Range |
|-----------|-------------|---------------|-----------|---------------|
| Surface Dig | 500 | 10/day | 1-3/day | Common 80% |
| Shallow Mine | 2,000 | 50/day | 3-6/day | Common 60%, Rare 30% |
| Deep Mine | 10,000 | 200/day | 5-10/day | Rare 50%, Epic 20% |
| Crystal Cavern | 50,000 | 500/day | 8-15/day | Epic 40%, Legendary 10% |

### Random Findings Table
```javascript
const miningFindings = {
    common: {
        weight: 0.60,
        stones: ['quartz', 'agate', 'jasper', 'obsidian', 'tiger_eye'],
        sizeRange: [0.5, 5], // carats
        qualityRange: [40, 70]
    },
    rare: {
        weight: 0.25,
        stones: ['amethyst', 'citrine', 'garnet', 'peridot', 'topaz'],
        sizeRange: [0.3, 3],
        qualityRange: [50, 85]
    },
    epic: {
        weight: 0.12,
        stones: ['emerald', 'ruby', 'sapphire', 'aquamarine'],
        sizeRange: [0.2, 2],
        qualityRange: [60, 95]
    },
    legendary: {
        weight: 0.03,
        stones: ['diamond', 'alexandrite', 'tanzanite', 'paraiba_tourmaline'],
        sizeRange: [0.1, 1.5],
        qualityRange: [70, 100]
    }
};
```

---

## 🔧 Preparation Workflow

### Step 1: Clean the Rough
- Remove dirt and debris
- Estimate clarity
- **Time:** 30 seconds (game time)

### Step 2: Orient the Stone
- Examine crystal axes
- Determine best cut orientation
- **Affects:** Final yield and quality
- **Skill Check:** Higher skill = better orientation

### Step 3: Mark Facets
- Choose cut design (from library)
- Mark initial facet positions
- **Options:** Simple (auto) or Manual (bonus XP)

### Step 4: Dop the Stone
- Apply dopping wax (heated)
- Mount on dop stick
- Align for first facet
- **Resources Used:** Wax (consumable)
- **Time:** 1-2 minutes

### Step 5: Transfer to Holder
- Place dopped stone in holder
- Ready for GemBot processing
- Can sell at this stage (prepped rough market)

---

## 💱 Trading System

### Rough Stone Trading
- List rough stones for sale (set price in GBUV)
- Browse other players' rough
- Auction system for rare finds
- **Fees:** 5% marketplace fee

### Prepped Stone Trading
- Higher value than raw rough
- Includes prep work done
- Ready to cut immediately

### Finished Gem Trading
- Full marketplace with certificates
- Quality grades affect price
- Fantasy cuts premium pricing

### P2P Trading
- Direct trades between players
- Escrow system for security
- Trade rough for finished, etc.

---

## 🧙‍♂️ Merlin AI Tutorial System

### Tutorial Stages

**Stage 1: Welcome to GemBot Farm**
```
🧙‍♂️ "Welcome, young gem cutter! I am Merlin, your guide to the 
     mystical art of gemstone faceting. Let me show you around 
     your new workshop..."
```

**Stage 2: Your First Rough Stone**
```
🧙‍♂️ "See those rough stones on your table? Each one holds 
     hidden beauty waiting to be revealed. Click on one to 
     examine it..."
```

**Stage 3: Preparation**
```
🧙‍♂️ "Before we can cut, we must prepare! Drag your stone to 
     the Prep Station. First, we clean it. Then we orient it 
     to find the best angle for cutting..."
```

**Stage 4: Dopping**
```
🧙‍♂️ "Now for a crucial step - dopping! We use warm wax to 
     attach the stone to a dop stick. This gives us something 
     to hold while the machine works its magic..."
```

**Stage 5: Your GemBot**
```
🧙‍♂️ "Behold, the GemBot! This magical machine will cut facets 
     with precision. Place your dopped stone in the holder, 
     then drag it to the machine..."
```

**Stage 6: Cutting Process**
```
🧙‍♂️ "The GemBot needs your attention! Watch for alerts - 
     you'll need to change laps, add water, and approve each 
     stage. This is NOT a fully idle game - your skill matters!"
```

**Stage 7: Finishing**
```
🧙‍♂️ "Excellent work! Your first gem is complete. Now you can 
     sell it, trade it, or keep it in your collection. 
     As you level up, you'll unlock better stones and machines!"
```

**Stage 8: Mining Introduction**
```
🧙‍♂️ "Want more rough stones? You'll need to venture into the 
     mining world! Set up mining posts, but beware - operations 
     cost GBUV to run. The deeper you dig, the better the finds..."
```

---

## 💰 Economy & GBUV Integration

### Token Uses
- Mining operation costs
- Upgrade purchases
- Marketplace transactions
- Premium supplies
- Academy courses
- Certification fees

### Earning GBUV
- Sell finished gems
- Trade rough/prepped stones
- Complete achievements
- Academy certifications
- Real GemBot connection bonus

### PayPal Top-Up
- Direct GBUV purchase
- Minimum: $5 = 500 GBUV
- Packages: $10, $25, $50, $100
- 10% bonus on $50+

---

## 🎓 GemBot Academy

### Course Structure
1. **Beginner Faceting** - Basic cuts, equipment
2. **Intermediate Cuts** - Standard brilliant, step cuts
3. **Advanced Faceting** - Complex designs, fantasy cuts
4. **Master Class** - Original designs, competition prep

### Anti-Cheat System
- Timed assessments
- Video verification for practicals
- Randomized question pools
- Proctored final exams (webcam)
- Practical demos required

### Certifications
- Digital certificate (NFT option)
- Verifiable on blockchain
- Industry recognized
- Portfolio building
- Job board access

---

## 📋 Implementation Priority

### Phase 1 (Core Gameplay)
1. ✅ Merlin Tutorial System
2. ✅ Rough material table display
3. ✅ Dop stick holder UI
4. ✅ Preparation workflow
5. ✅ Updated cutting integration

### Phase 2 (Economy)
1. Trading marketplace
2. GBUV wallet integration
3. PayPal top-up flow
4. Transaction history

### Phase 3 (World)
1. 3D mining environment
2. Mining post system
3. Exploration mechanics
4. Resource spawning

### Phase 4 (Academy)
1. Course platform
2. Quiz system
3. Certification workflow
4. Job board

---

*Document maintained by Ryan Barbrick / Barbrick Design*
*Contact: BarbrickDesign@gmail.com*
