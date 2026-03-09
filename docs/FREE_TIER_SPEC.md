# FREE TIER SPECIFICATION
## Collaborative Dev Game Credit System

**Last Updated:** March 6, 2026
**Status:** Phase 1 Implementation Ready

---

## FREE TIER BASELINE

**Every user starts with: 1,000 credits (= $1,000 value)**

### Included Features (Free Forever)
- ✅ Community Discord access
- ✅ 7 Domain Zone exploration
- ✅ Basic dashboard access (read-only)
- ✅ Submit feedback/bug reports (earn XP)
- ✅ Participate in discussions
- ✅ Access public documentation
- ✅ View leaderboards

### Credit-Based Features (Spend to Use)
| Feature | Cost per Use | Notes |
|---------|--------------|-------|
| ARAYA Vision API | 10 credits | Per image analyzed |
| Dashboard Builder | 50 credits | Per new dashboard created |
| Custom Builder Bridge | 100 credits | Per page deployment |
| AI Conversation (basic) | 1 credit | Per message (ARAYA chat) |
| AI Conversation (vision) | 5 credits | With image analysis |
| Code Review API | 25 credits | Per PR review |
| Pattern Detection | 15 credits | Per analysis run |

---

## EARNING CREDITS (XP → CREDITS)

**Formula:** 1000 XP = 1 Credit = $1

### Ways to Earn

| Action | XP Earned | Credits Earned |
|--------|-----------|----------------|
| Submit bug report | 1,000 XP | 1 credit |
| Submit feedback | 500 XP | 0.5 credits |
| Bug accepted & fixed | 5,000 XP | 5 credits |
| Feature suggestion implemented | 10,000 XP | 10 credits |
| Write documentation | 2,000 XP | 2 credits |
| Help another user (verified) | 1,000 XP | 1 credit |
| Daily login streak (7 days) | 700 XP | 0.7 credits |
| Complete tutorial | 500 XP | 0.5 credits |
| Test beta feature | 2,000 XP | 2 credits |
| Contribute code (merged PR) | 20,000 XP | 20 credits |

---

## FOUNDER STATUS

**Requirements to EARN Founder (3/6 slots remaining):**
- Total XP: 10,000+ (accumulated over time)
- Feedback submissions: 10+ accepted items
- Bug reports: 5+ validated reports
- Active days: 30+ days in ecosystem
- Quality score: 7.0/10.0 or higher

**Founder Perks:**
- ✨ 10,000 bonus credits (one-time)
- ✨ Unlimited free tier forever
- ✨ 50% discount on all credit purchases
- ✨ Priority support
- ✨ Special Discord role & channels
- ✨ Early access to new features
- ✨ Revenue sharing on ecosystem growth

**Current Founders (EARNED):**
1. Tiger - EARNED
2. Nero - EARNED
3. Agent R - EARNED
4. [OPEN - 3 slots remaining]

**Candidates (Waiting to Earn):**
- Josh
- Toby
- William B
- Dean
- William V
- Rutherford

---

## HARDHITTER APPROVAL PROCESS

### Application Review Criteria

**System Size Categories:**
- **Small** (< 10k lines): 5,000 credits approved
- **Medium** (10k-50k lines): 15,000 credits approved
- **Large** (50k-200k lines): 50,000 credits approved
- **Massive** (> 200k lines): 100,000+ credits (case-by-case)

**Multipliers:**
| Factor | Multiplier |
|--------|------------|
| Open source | 2x |
| Active users (100+) | 1.5x |
| Production system | 1.5x |
| Educational/nonprofit | 2x |
| Commercial (profitable) | 0.5x (pay-to-play tier) |

**Review Timeline:**
- Submit application via form
- Review within 48 hours
- Approval/rejection/info request
- Credits added to account immediately upon approval

**Anti-Abuse Measures:**
- One hardhitter application per email
- Repo verification (if provided)
- Usage monitoring (if exceeds 2x approved credits/month → review)
- Quality gates (feedback required after 30 days)

---

## RATE LIMITS (Free Tier)

**To prevent abuse:**

| Limit Type | Free Tier | Founder | Paid |
|------------|-----------|---------|------|
| API calls/day | 100 | 1,000 | Unlimited |
| Dashboard builds/week | 5 | 50 | Unlimited |
| ARAYA conversations/day | 20 | 200 | Unlimited |
| Storage (MB) | 100 | 1,000 | Unlimited |
| Concurrent sessions | 1 | 3 | Unlimited |

**Soft Limits (warning before block):**
- Email sent at 80% of daily limit
- Dashboard notification at 90%
- Hard block at 100% (resets at midnight UTC)

---

## CREDIT PURCHASE TIERS

**For users who run out of free credits:**

| Tier | Credits | Price | Bonus | Value |
|------|---------|-------|-------|-------|
| Starter | 1,000 | $10 | +100 (10%) | $1.10 value |
| Builder | 5,000 | $40 | +750 (15%) | $5.75 value |
| Pro | 20,000 | $150 | +4,000 (20%) | $24 value |
| Team | 100,000 | $600 | +25,000 (25%) | $125 value |

**Founder Discount:** 50% off all tiers

**Subscription Option (Coming Soon):**
- $29/month: 5,000 credits/month + 10% bonus
- $99/month: 20,000 credits/month + 20% bonus
- $299/month: 100,000 credits/month + 30% bonus

---

## UPGRADE GATES

**User triggers when they hit a limit:**

```
🚫 OUT OF CREDITS

You've used 1,000 / 1,000 credits.

Options:
1. EARN MORE - Submit feedback, report bugs, help community
2. BUY CREDITS - $10 for 1,100 credits (instant)
3. APPLY FOR HARDHITTER - Large system? Get up to 100k free credits

[View Ways to Earn] [Buy Credits] [Apply for Hardhitter]
```

---

## IMPLEMENTATION TIMELINE

### ✅ Phase 1: Foundation (THIS WEEK)
- [x] Database schema (create_credit_system.sql)
- [x] Credit Manager API (credit-manager.mjs)
- [x] Hardhitter submission form (hardhitter-apply.html)
- [x] Admin review dashboard (admin/hardhitter-review.html)
- [ ] Run SQL migration in Supabase
- [ ] Deploy API to Netlify
- [ ] Test end-to-end flow

### 🔄 Phase 2: Integration (NEXT WEEK)
- [ ] Wire ARAYA to credit system (deduct 1 credit per message)
- [ ] Wire Builder Bridge to credit system (50 credits per build)
- [ ] Wire Vision API to credit system (10 credits per image)
- [ ] Add credit balance widget to all dashboards
- [ ] Add "Out of Credits" gate UI
- [ ] Add credit purchase flow (Stripe integration)

### 📈 Phase 3: Founder Mechanics (WEEK 3)
- [ ] Auto-track XP from Discord bot
- [ ] Auto-award credits when XP milestones hit
- [ ] Build Founder Progress Dashboard
- [ ] Add notification system (email + Discord)
- [ ] Add quality score algorithm
- [ ] Add founder badge to community.html

### 🚀 Phase 4: Launch (WEEK 4)
- [ ] Beta test with 6 candidates
- [ ] Announce to Discord community
- [ ] Public launch blog post
- [ ] Monitor usage patterns
- [ ] Adjust rates based on real data

---

## SUCCESS METRICS

**Week 1 Goals:**
- 10+ hardhitter applications received
- 5+ approved and using system
- 0 abuse cases detected
- 100% uptime on credit API

**Month 1 Goals:**
- 100+ active credit users
- 50+ earned credits (feedback/bugs)
- 10+ credit purchases
- 1-2 new founders earned status

**Month 3 Goals:**
- 500+ users in ecosystem
- All 6 founder slots filled (earned)
- $500+ revenue from credit purchases
- Self-sustaining credit economy

---

## OPEN QUESTIONS FOR COMMANDER

1. **Founder Revenue Share:** What % of ecosystem growth?
2. **Commercial Hardhitters:** Flat rejection or paid tier?
3. **Credit Expiration:** Should free credits expire? (suggest: no)
4. **Referral System:** Credits for inviting users?
5. **Bulk Discounts:** Team pricing for orgs with 5+ hardhitters?

---

**Next Step:** Review this spec → Give go-ahead → Deploy Phase 1 THIS WEEK
