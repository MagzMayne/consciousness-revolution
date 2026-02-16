---
layout: default
title: PROJECT INVESTMENT SYSTEM GUIDE
---

# 💎 PROJECT INVESTMENT SYSTEM - COMPLETE GUIDE

## Overview
The **GemBot Project Investment System** fully integrates project funding into the game economy, allowing players to invest their earned GBUV tokens into real projects from your GitHub portfolio. This creates a complete play-to-earn economy where gameplay funds development.

---

## 🎮 **GAME INTEGRATION**

### How It Works
1. **Earn GBUV** in the gembot cutting game
2. **Browse Projects** in the Merlin Gallery
3. **Invest GBUV** using blockchain transactions
4. **Earn Rewards** (XP, Gems, Badges, Titles)
5. **Gain Voting Power** for governance
6. **Receive ROI** (5% quarterly dividends)

---

## 📂 **FILES CREATED**

### Core Systems
- **project-investment-system.js** - Main investment logic, blockchain transactions
- **merlin-gallery-integrated.js** - UI gallery with project cards
- **investor-achievements.js** - Achievement/reward gamification
- **merlin-gallery-coverflow.html** - Standalone gallery page

### Integration
- Added to **GemBot_Control_AI.html** (lines 244-246)
- Connects to **automated-wallet-system.js** for transactions
- Hooks into **gembot-farm-game.js** for rewards

---

## 🚀 **FEATURES**

### 1. **Project Discovery**
```javascript
// Automatically fetches HTML files from barbrickdesign.github.io
// Creates interactive cards with iframe previews
// Real-time funding status display
```

- Grid view of all projects
- Live preview iframes
- Search & filter
- Funding progress bars

### 2. **Investment Mechanics**
```javascript
await projectInvestmentSystem.investInProject(projectPath, amount, username);
```

**What Happens:**
- Validates GBUV balance
- Executes blockchain transaction (transferGBUV)
- Records investment in localStorage
- Awards XP, gems, badges
- Updates voting power
- Logs to activity feed
- Shows achievement notifications

### 3. **Investor Tiers**
| Tier | Min Investment | XP Bonus | Vote Power | Badge |
|------|---------------|----------|------------|-------|
| Bronze | 100 GBUV | 50 XP | 1 | 🥉 Bronze Investor |
| Silver | 500 GBUV | 300 XP | 3 | 🥈 Silver Investor |
| Gold | 1,000 GBUV | 750 XP | 5 | 🥇 Gold Investor |
| Platinum | 5,000 GBUV | 5,000 XP | 10 | ⭐ Platinum Investor |
| Diamond | 10,000 GBUV | 15,000 XP | 20 | 💎 Diamond Investor |

### 4. **Achievements** (21 total)
```
🌱 First Step - Make first investment
💯 Century Club - Invest 100 GBUV
💎 Diamond Hands - Invest 1,000 GBUV
🐋 Whale Alert - Invest 10,000 GBUV
📊 Diversified Portfolio - 5 projects
📈 Portfolio Master - 10 projects
🐦 Early Bird - First investor in project
🗳️ Democracy Participant - Vote on proposal
💡 Visionary - Create proposal
💰 Dividend Collector - Earn first ROI
👑 Investment King - Reach #1 on leaderboard
```

### 5. **Governance System**
```javascript
// Create proposal (requires Gold tier + governance token)
await projectInvestmentSystem.createProposal(username, title, description, projectPath);

// Vote (weighted by investment amount)
await projectInvestmentSystem.voteOnProposal(username, proposalId, 'yes');
```

**Voting Power:**
- Calculated from total investments
- Weighted votes (bigger investors = more power)
- Token-gated proposals (need governance token)
- 7-day voting periods

### 6. **ROI Dividends**
```javascript
// Quarterly 5% returns
await projectInvestmentSystem.distributeDividends(username);
```

- Automatic quarterly payouts
- 5% ROI on total investments
- Credited to GBUV balance
- Compounds over time

---

## 🎯 **USER FLOW**

### Step 1: Access Gallery
```
Click "💎 Project Gallery" button (bottom-right of game)
→ Panel opens showing all GitHub Pages projects
```

### Step 2: Browse Projects
```
- Search by name/path
- View live previews
- Check funding status
- See investor count
```

### Step 3: Invest
```
1. Enter GBUV amount
2. Click "💎 Invest"
3. Transaction processes
4. Achievement notification pops up
5. XP/Gems awarded
6. Portfolio updates
```

### Step 4: Track Portfolio
```
Footer shows:
- Total Invested
- Project Count
- Voting Power
- Investor Tier Badge
```

---

## 🔐 **SECURITY**

### Blockchain Validation
```javascript
// Real Solana transactions (mainnet-beta)
const balance = await walletFactory.getGBUVBalance(publicKey);
const txSignature = await walletFactory.transferGBUV(from, to, amount);
```

### Anti-Fraud Protection
- Checks user balance before investment
- Validates wallet ownership
- Records all transactions on-chain
- Security scoring for registrations

---

## 📊 **DATA STORAGE**

### LocalStorage Keys
```
investments_[username] - User's investment records
badges_[username] - Earned badges
titles_[username] - Earned titles
active_title_[username] - Current display title
achievements_[username] - Unlocked achievements
governance_proposals - All proposals
merlin_repo_snapshot_v5 - Cached project data
```

### Investment Record Structure
```javascript
{
  "projectPath": {
    "invested": 1500,
    "transactions": [
      {
        "amount": 500,
        "timestamp": 1734393600000,
        "txSignature": "5x7Kd...",
        "type": "investment"
      }
    ],
    "firstInvestment": 1734307200000,
    "dividendsEarned": 75
  }
}
```

---

## 🎨 **UI COMPONENTS**

### Gallery Toggle Button
```css
Position: Fixed bottom-right (80px from bottom, 20px from right)
Z-index: 9001 (above game, below modals)
Animation: Pulsing gradient effect
```

### Gallery Panel
```css
Size: 1400px × 900px (96vw × 90vh max)
Position: Centered overlay
Z-index: 10001 (above everything except achievements)
```

### Project Cards
```css
Layout: CSS Grid (auto-fill, min 320px)
Preview: Iframe scaled to 0.267 (1200px → 320px)
Progress: Gradient bar (purple theme)
```

### Achievement Notifications
```css
Position: Fixed top-right
Animation: Slide in from right
Duration: 5 seconds
Auto-dismiss with slide out
```

---

## 🔧 **API REFERENCE**

### ProjectInvestmentSystem

#### `getPortfolio(username)`
Returns user's complete portfolio data
```javascript
{
  totalInvested: 2500,
  projectCount: 5,
  votingPower: 8,
  tier: 'gold',
  investments: {...}
}
```

#### `investInProject(projectPath, amount, username)`
Executes investment with full reward system
```javascript
const result = await investInProject('index.html', 500, 'ryan');
// Returns: { success, txSignature, newBalance, rewards, portfolio }
```

#### `getProjectStatus(projectPath)`
Gets aggregate funding for a project
```javascript
{
  totalInvested: 5000,
  investorCount: 12,
  investors: {...}
}
```

#### `distributeDividends(username)`
Calculates and pays ROI dividends
```javascript
{
  success: true,
  amount: 125,
  nextDistribution: Date,
  portfolioValue: 2500
}
```

#### `createProposal(username, title, desc, projectPath)`
Creates governance proposal (token-gated)

#### `voteOnProposal(username, proposalId, vote)`
Casts weighted vote ('yes', 'no', 'abstain')

#### `getLeaderboard(limit)`
Returns top investors by total investment

#### `generateReport(username)`
Complete investment analytics report

### InvestorAchievementSystem

#### `checkAchievements(username, action, data)`
Checks and awards achievements for action
```javascript
const result = await checkAchievements('ryan', 'investment', {
  amount: 1000,
  projectPath: 'gembot-universe-key.html'
});
// Returns: { unlocked: ['invest_1000'], rewards: {...} }
```

#### `getUserAchievements(username)`
Returns array of unlocked achievement IDs

#### `getProgress(username)`
Achievement completion statistics
```javascript
{ unlocked: 8, total: 21, percentage: 38.1 }
```

#### `getActiveTitle(username)`
Current display title or null

### MerlinGallery

#### `window.merlinGallery.open()`
Programmatically open gallery

#### `window.merlinGallery.close()`
Close gallery

#### `window.merlinGallery.refresh()`
Reload project data from GitHub

#### `window.merlinGallery.updatePortfolio()`
Refresh portfolio display

---

## 🧪 **TESTING**

### Quick Test Commands
```javascript
// Check system loaded
console.log(window.projectInvestmentSystem);
console.log(window.investorAchievements);
console.log(window.merlinGallery);

// Get user session
const session = JSON.parse(sessionStorage.getItem('gembot_session'));
console.log('User:', session.username);

// Check portfolio
const portfolio = projectInvestmentSystem.getPortfolio(session.username);
console.log('Portfolio:', portfolio);

// Check achievements
const achievements = investorAchievements.getUserAchievements(session.username);
console.log('Achievements:', achievements);

// Get leaderboard
const leaderboard = projectInvestmentSystem.getLeaderboard(10);
console.log('Top 10:', leaderboard);

// Open gallery
merlinGallery.open();
```

### Test Investment (Local)
```javascript
// Make test investment
await projectInvestmentSystem.investInProject(
  'test-project.html',
  100,
  session.username
);
```

---

## 🌟 **GAME ECONOMY FLOW**

```
PLAY GAME → EARN GBUV → INVEST IN PROJECTS
     ↓           ↓              ↓
  CUT GEMS → SELL STONES → VIEW GALLERY
     ↓           ↓              ↓
  GET XP  →  GET GBUV  → MAKE INVESTMENT
     ↓           ↓              ↓
 LEVEL UP → MORE TOKENS → EARN MORE XP
                             ↓
                      GET BADGES/TITLES
                             ↓
                      GAIN VOTING POWER
                             ↓
                    PARTICIPATE GOVERNANCE
                             ↓
                      RECEIVE DIVIDENDS
                             ↓
                    REINVEST FOR GROWTH
```

---

## 📈 **MONETIZATION MODEL**

### For Players:
- Free to play
- Earn GBUV by playing
- Convert to real crypto (future)
- ROI from investments
- Governance participation

### For Projects:
- Get funded by community
- Transparent investment tracking
- Engaged investor base
- Built-in governance
- Marketing through game

### For Platform:
- Transaction fees (future)
- Premium features
- NFT marketplace
- Governance token value
- Community growth

---

## 🎁 **REWARDS SUMMARY**

### From Investments:
- XP (scales with amount)
- Bonus Gems (1 gem per 100 GBUV)
- Tier badges (Bronze → Diamond)
- Special titles (Whale, King, etc.)
- Voting power
- Quarterly dividends (5% ROI)

### From Achievements:
- 21 unique achievements
- Total 25,000+ XP available
- 5,000+ Gems available
- 12 unique badges
- 4 exclusive titles
- Notifications & fanfare

---

## 🔮 **FUTURE ENHANCEMENTS**

1. **NFT Badges** - Mint achievement badges as NFTs
2. **Real Crypto Conversion** - GBUV → SOL swaps
3. **Project Proposals** - Community votes on new projects
4. **Staking** - Lock GBUV for boosted rewards
5. **Referral System** - Earn rewards for bringing investors
6. **Mobile App** - Native iOS/Android versions
7. **Analytics Dashboard** - Detailed investment insights
8. **Social Features** - Friend lists, leaderboards, chat
9. **Seasonal Events** - Limited-time investment bonuses
10. **DAO Integration** - Full decentralized governance

---

## 🚦 **GETTING STARTED**

### For Users:
1. Play game → Earn GBUV
2. Click "💎 Project Gallery" button
3. Browse projects
4. Invest & earn rewards!

### For Developers:
1. Files auto-load with GemBot_Control_AI.html
2. Check browser console for initialization
3. Use window.* APIs for custom features
4. All data in localStorage for easy debugging

---

## 📞 **SUPPORT**

### Common Issues:

**"Please log in to invest"**
→ Register or log in via auth modal

**"Insufficient GBUV balance"**
→ Play game to earn more tokens

**"Investment failed"**
→ Check console for error details

**Gallery not loading**
→ Check internet connection (fetches from GitHub API)

**Achievements not unlocking**
→ Verify game is saving properly

---

## 🎉 **SUCCESS METRICS**

Track these KPIs:
- Total GBUV invested
- Number of active investors
- Project funding completion rate
- Achievement unlock rate
- Governance participation
- User retention
- Average investment amount
- Leaderboard competition

---

## 💡 **TIPS FOR MAXIMIZING REWARDS**

1. **Diversify** - Invest in multiple projects for achievements
2. **Go Early** - First investors get "Early Bird" badge
3. **Big Bets** - Large investments unlock tier bonuses
4. **Stay Active** - Monthly consistency achievement
5. **Vote Often** - Democracy participation XP
6. **Compound** - Reinvest dividends for growth
7. **Compete** - Climb leaderboard for top ranks
8. **Complete** - Help projects reach 100% funding

---

**Created:** December 16, 2025
**Version:** 1.0.0
**Author:** Ryan Barbrick / Barbrick Design
**Signature:** GBOT-INVESTMENT-2025-INTEGRATED
