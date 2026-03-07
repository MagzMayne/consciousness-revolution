# BUILD DOMAIN - ARCHITECTURE VISUAL REFERENCE
## System Design Flowcharts & Diagrams

---

## 1. USER JOURNEY MAP

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATOR ONBOARDING FLOW                       │
└─────────────────────────────────────────────────────────────────┘

NEW CREATOR
    │
    ├──> Sign up / Foundation created
    │
    ├──> Dashboard home (/build/)
    │         │
    │         ├──> Browse marketplace (optional)
    │         └──> Create first project
    │
    ├──> Project Detail (/build/projects/:id)
    │         │
    │         ├──> Create sprint
    │         ├──> Add tasks
    │         └──> Invite collaborators
    │
    ├──> Create first creation (/build/creations/new)
    │         │
    │         ├──> Choose type (ability/module/template/workflow)
    │         ├──> Edit in cr-creation-editor
    │         └──> Publish to marketplace
    │                   │
    │                   └──> GAIN 100 XP
    │
    ├──> Monitor earnings (/build/earnings)
    │         │
    │         ├──> View revenue chart
    │         ├──> Track downstream income
    │         └──> Request payout
    │                   │
    │                   └──> First payout completes
    │
    └──> Team collaboration
            │
            ├──> Create shared project
            ├──> Invite teammates
            ├──> Build together
            └──> Ship team creation
                    │
                    └──> GAIN 250 XP + revenue split

```

---

## 2. DATA FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                     CREATION LIFECYCLE                           │
└─────────────────────────────────────────────────────────────────┘

                         IDEA
                          │
                          ├─ Stored in builder_projects
                          │
                    ┌─────┴─────┐
                    │           │
                DRAFT      IN PROGRESS
                    │           │
                    ├─ Collaborate via sprint_tasks
                    │
                REVIEW
                    │
                    ├─ Validation checks
                    │
                PUBLISH ──────────> marketplace_creations (view)
                    │
                    ├─ Stored in builder_creations (visibility='marketplace')
                    │
                ┌───┴───┐
                │       │
            ACTIVE   ARCHIVED
                │       │
                │   RETIREMENT
                │
              SOLD ──────────> revenue_events (record)
                │
                ├─ builder_balances (credit)
                │
                ├─ downstream_revenue (if built from existing)
                │
                └─> XP_EVENTS (gamification)

```

---

## 3. DATABASE RELATIONSHIP DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                           │
└──────────────────────────────────────────────────────────────────┘

user_foundations (Core Identity)
    │
    ├─1:N────────> builder_projects (Workspaces)
    │                  │
    │                  ├─1:N──> project_sprints (Cycles)
    │                  │            │
    │                  │            └─1:N──> sprint_tasks (Work Items)
    │                  │
    │                  ├─1:N──> project_collaborators
    │                  │            │
    │                  │            └─N:1──> user_foundations
    │                  │
    │                  └─N:M──> creation_projects ──> builder_creations
    │
    ├─1:1────────> builder_balances (Account)
    │                  │
    │                  └─1:N──> payout_history
    │
    ├─1:N────────> builder_creations (What I Made)
    │                  │
    │                  ├─N:M──> creation_projects (In Which Projects)
    │                  │
    │                  ├─1:N──> revenue_events (Sales)
    │                  │
    │                  ├─1:N──> creation_reviews (Ratings)
    │                  │
    │                  └─1:N──> creation_lineage (Child)
    │
    ├─1:N────────> creation_lineage (Parent)
    │
    ├─1:N────────> revenue_events (Sales I Made)
    │
    ├─1:N────────> downstream_revenue (Passive Income From Derivations)
    │
    └─1:1────────> creator_levels (XP Progress)
            │
            └─1:N──> creator_xp_events (Achievements)

```

---

## 4. API REQUEST/RESPONSE FLOW

```
┌──────────────────────────────────────────────────────────────────┐
│              TYPICAL API CALL SEQUENCE                            │
└──────────────────────────────────────────────────────────────────┘

FRONTEND (Browser)
    │
    └──> buildAPI.createProject({ name, description })
            │
            ├──> HTTP POST /.netlify/functions/build/project-create
            │        │
            │        ├──> Validate JWT token
            │        │
            │        ├──> Get user's foundation_id
            │        │
            │        ├──> Validate input
            │        │
            │        ├──> INSERT INTO builder_projects
            │        │        (RLS: foundation_id must match user)
            │        │
            │        └──> Return { id, name, url, created_at }
            │
            └──> Update UI with new project
                    │
                    ├──> Add <cr-project-card> to DOM
                    │
                    └──> Increment project count

THEN (seconds later)...

REALTIME UPDATE
    │
    ├──> Supabase Realtime broadcasts INSERT event
    │
    ├──> Subscriber 2's dashboard receives update
    │
    └──> Their <cr-activity-feed> shows "Creator 1 created project"

```

---

## 5. SCALING ARCHITECTURE (Horizontal)

```
┌──────────────────────────────────────────────────────────────────┐
│             HANDLING 10 TO 10,000 CREATORS                        │
└──────────────────────────────────────────────────────────────────┘

USERS: 10 creators
    │
    └──> Netlify (single instance)
            │
            └──> Supabase (single-region)
                    │
                    └──> 10-50 concurrent connections

USERS: 100 creators
    │
    └──> Netlify (auto-scaling functions)
            │
            ├──> Caching layer (Netlify Cache)
            │
            └──> Supabase (connection pooling + read replicas)
                    │
                    ├──> Main write connection
                    │
                    └──> 1-2 read replicas for analytics

USERS: 1,000 creators
    │
    └──> CDN (for static assets)
            │
            ├──> Component assets (cached)
            │
            └──> Images/thumbnails (cached)
    │
    └──> Netlify (Functions auto-scaling + Edge)
            │
            ├──> Regional deployments
            │
            └──> Function-level caching
    │
    └──> Supabase (Multi-region + optimization)
            │
            ├──> Read replica per region
            │
            ├──> Materialized views for analytics
            │
            └──> Partitioned tables by date

USERS: 10,000+ creators
    │
    └──> Distributed global infrastructure
            │
            ├──> Multi-region Supabase
            │
            ├──> Elasticsearch for marketplace search
            │
            ├──> Redis cache layer (Upstash)
            │
            ├──> Background job queue (Bull/RabbitMQ)
            │
            └──> Event streaming (Kafka)
                    │
                    └──> Real-time analytics & projections

```

---

## 6. REVENUE FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│         MONEY FLOW (Creator Sells Creation)                       │
└──────────────────────────────────────────────────────────────────┘

BUYER PURCHASES CREATION
    │
    └──> Stripe Payment Processing
            │
            ├──> Captures payment
            │    Amount: $49.99 (5,000 cents)
            │
            └──> Webhook: charge.succeeded
                    │
                    ├──> Create revenue_event (5,000 cents)
                    │
                    ├──> Calculate split:
                    │    ├─ Creator gets: 4,000 cents (80% revenue share)
                    │    │
                    │    └─ Platform gets: 1,000 cents (20%)
                    │
                    └──> Check for downstream
                            │
                            └──> If created from another's creation:
                                    │
                                    ├─ Original creator gets: 500 cents (10% downstream)
                                    │
                                    └─ Record in downstream_revenue
                                            │
                                            └─ Update original_creator's balance


CREATOR'S BALANCE UPDATES
    │
    ├──> builder_balances.available_balance_cents += 4,000
    │
    ├──> builder_balances.lifetime_earnings_cents += 4,000
    │
    └──> Creator can see in /build/earnings dashboard
            │
            ├──> Available balance: $40.00
            │
            ├──> Lifetime earnings: $450.00
            │
            └──> Request payout when available_balance > minimum_payout (default $10)


PAYOUT PROCESSING
    │
    └──> creator clicks "Request Payout"
            │
            ├──> Create payout_history record (pending)
            │
            └──> Stripe Payout API
                    │
                    ├──> Schedule payout via Stripe Connect
                    │
                    ├──> Wait 1-3 days for bank transfer
                    │
                    └──> Update payout_history (completed)
                            │
                            └──> Notify creator via email
                                    │
                                    └─ "$40.00 has been sent to your bank account"

```

---

## 7. COLLABORATION IN ACTION

```
┌──────────────────────────────────────────────────────────────────┐
│           REAL-TIME TEAM COLLABORATION                            │
└──────────────────────────────────────────────────────────────────┘

CREATOR 1 (Owner) → Browser 1
CREATOR 2 (Contributor) → Browser 2
CREATOR 3 (Viewer) → Browser 3

                    ┌─────────────────┐
                    │  Shared Project │
                    │  (Sprint Board) │
                    └────────┬────────┘
                             │
                Supabase Realtime WebSocket
                             │
                 ┌───────────┼───────────┐
                 │           │           │
            Browser 1    Browser 2    Browser 3
            (Owner)      (Contributor) (Viewer)
                │           │           │
                │           │           │
         [Kanban Board]  [Kanban Board] [Read-Only View]
                │           │           │
                │           │           │
         Task 1 (To-Do)     │           │
         Task 2 (In Progress) ──(drag)──> Task 2 (In Progress)
         Task 3 (To-Do)     │           │
                │           │           │
                │           ├──> Move "Task 2" to "In Progress"
                │           │
                │           └──> sprint_tasks UPDATE triggered
                │                   │
                │                   ├──> Broadcast to all subscribers
                │                   │
                │           ┌───────┴────────┐
                │           │                │
            Browser 1    Browser 2    Browser 3
            receives     receives     receives
            update       update       update
                │           │           │
                │           │           │
         Re-render:    Task updated!  Task updated!
         Task 2       Auto-saved     (read-only)
         moved!       ✓ In Progress
                              │
                    creator_xp_events INSERT
                              │
                    "Creator 2 completed task"
                              │
                    GAIN 25 XP

LATENCY: < 500ms from drag to all screens updated

```

---

## 8. CREATOR PROGRESSION SYSTEM

```
┌──────────────────────────────────────────────────────────────────┐
│            XP & LEVEL PROGRESSION TREE                            │
└──────────────────────────────────────────────────────────────────┘

BRONZE LEVEL (0 XP)
├─ Publish first creation
│  └─ +100 XP ──┐
│               │
├─ Get first sale
│  └─ +500 XP ──┤ → Total: 600 XP
│               │
├─ Receive review
│  └─ +50 XP ───┘

                    │
                    │ [UNLOCK: Silver tier features]
                    ▼

SILVER LEVEL (5,000 XP)
├─ Join team project
│  └─ +50 XP each
│
├─ Featured in marketplace (admin award)
│  └─ +100 XP
│
├─ Build derivation (composition)
│  └─ +200 XP ──┐
│               │
├─ 1st downstream earning
│  └─ +150 XP ──┤ → Total: 15,000 XP
│               │
└─ Community contribution
   └─ +75 XP ───┘

                    │
                    │ [UNLOCK: Gold tier, higher revenue share]
                    ▼

GOLD LEVEL (25,000 XP)
├─ Team ship creation
│  └─ +250 XP per team member
│
├─ Downstream milestone (1k earnings)
│  └─ +500 XP ──┐
│               │
├─ Creator review (help others)
│  └─ +75 XP ───┤ → Total: 50,000 XP
│               │
└─ Stream 4+ hours
   └─ +25 XP/day ┘

                    │
                    │ [UNLOCK: Platinum tier, featured spots, higher downstream %]
                    ▼

PLATINUM LEVEL (100,000 XP)
├─ Recognized creator
│  └─ Badge: ⭐ Platinum Creator
│
├─ Special marketplace placement
│
├─ Access to creator economy tools
│
└─ Invited to partnerships

BENEFITS BY LEVEL:
┌──────────┬──────────┬──────────┬──────────┐
│ Bronze   │ Silver   │ Gold     │ Platinum │
├──────────┼──────────┼──────────┼──────────┤
│ 80% rev  │ 85% rev  │ 90% rev  │ 95% rev  │
│ 10% down │ 15% down │ 20% down │ 30% down │
│ 0 slots  │ 1 slot   │ 3 slots  │ 10 slots │
│ 10 works │ 50 works │ 500 wrks │ Unlimited│
└──────────┴──────────┴──────────┴──────────┘

```

---

## 9. COMPONENT HIERARCHY

```
┌──────────────────────────────────────────────────────────────────┐
│           WEB COMPONENTS ORGANIZATION                             │
└──────────────────────────────────────────────────────────────────┘

<html>
├─ <head>
│  └─ <script type="module" src="components/build/index.js">
│      ├─ cr-project-card
│      ├─ cr-sprint-tracker
│      ├─ cr-creation-editor
│      ├─ cr-marketplace-card
│      ├─ cr-earnings-widget
│      ├─ cr-activity-feed
│      ├─ cr-collaborator-invite
│      └─ cr-real-time-indicator
│
└─ <body>
   │
   ├─ DASHBOARD PAGE (/build/)
   │  │
   │  └─ <div id="projects">
   │     ├─ <cr-project-card> (Repeating)
   │     ├─ <cr-project-card>
   │     └─ <cr-project-card>
   │
   ├─ PROJECT DETAIL PAGE (/build/projects/:id)
   │  │
   │  ├─ <h1>Project Name</h1>
   │  │
   │  ├─ <div class="tabs">
   │  │  ├─ [Overview] [Sprints] [Collaborators] [Activity]
   │  │  │
   │  │  └─ <cr-sprint-tracker>
   │  │  │  (Kanban board)
   │  │  │
   │  │  └─ <div id="collaborators">
   │  │     └─ <cr-collaborator-invite>
   │  │
   │  └─ <cr-activity-feed>
   │     (Real-time updates)
   │
   ├─ CREATIONS PAGE (/build/creations)
   │  │
   │  └─ <cr-creation-editor>
   │     (WYSIWYG editor)
   │
   ├─ MARKETPLACE PAGE (/build/marketplace)
   │  │
   │  └─ <div id="marketplace">
   │     ├─ <cr-marketplace-card> (Repeating)
   │     ├─ <cr-marketplace-card>
   │     └─ <cr-marketplace-card>
   │
   └─ EARNINGS PAGE (/build/earnings)
      │
      ├─ <cr-earnings-widget>
      │  (Revenue chart)
      │
      ├─ <div id="transactions">
      │  └─ (Revenue history table)
      │
      └─ <div id="payout">
         └─ [Request Payout Button]

```

---

## 10. DEPLOYMENT PIPELINE

```
┌──────────────────────────────────────────────────────────────────┐
│            CI/CD DEPLOYMENT FLOW                                  │
└──────────────────────────────────────────────────────────────────┘

DEVELOPER COMMITS CODE
    │
    └─> GitHub Push
            │
            ├─> GitHub Actions Triggered
            │
            └─> BUILD STAGE
                    │
                    ├─ npm install
                    │
                    ├─ npm run lint
                    │
                    ├─ npm run test
                    │
                    └─ npm run build
                            │
                            ├─ Bundles components
                            │
                            ├─ Minifies CSS/JS
                            │
                            └─ Optimizes images


            ├─> TEST STAGE
            │    │
            │    ├─ npm run test:unit
            │    │
            │    ├─ npm run test:integration
            │    │
            │    ├─ npm run test:e2e (Playwright)
            │    │
            │    └─ npm run lighthouse
            │            │
            │            └─ Performance > 90? → PASS
            │

            └─> DEPLOY STAGE
                    │
                    ├─ STAGING
                    │  │
                    │  ├─ Deploy to staging.consciousnessrevolution.io
                    │  │
                    │  └─ Smoke tests
                    │
                    └─> PRODUCTION
                       │
                       ├─ netlify deploy --prod --dir=.
                       │
                       ├─ supabase db push (if migrations)
                       │
                       ├─ Rollout to 10% of users (canary)
                       │
                       ├─ Monitor error rates (Sentry)
                       │
                       └─ If < 1% error rate after 30min
                           │
                           └─> Full rollout to 100%


PRODUCTION LIVE
    │
    └─> Monitoring Dashboards
            │
            ├─ Netlify Analytics
            │
            ├─ Supabase Metrics
            │
            ├─ Sentry Error Tracking
            │
            ├─ Datadog Performance
            │
            └─ PagerDuty Alerts (on-call)

```

---

## 11. SECURITY LAYERS

```
┌──────────────────────────────────────────────────────────────────┐
│            DEFENSE IN DEPTH                                       │
└──────────────────────────────────────────────────────────────────┘

CLIENT BROWSER
│
├─ HTTPS Only (TLS 1.3)
│  └─ No HTTP
│
├─ Content Security Policy
│  └─ script-src 'self'
│
├─ CORS Restriction
│  └─ Allowed Origins: consciousnessrevolution.io, 100xbuilder.io
│
└─ Secure JWT Token Storage
   └─ HttpOnly cookies (no JS access)


NETLIFY FUNCTIONS LAYER
│
├─ Auth Middleware
│  └─ Verify JWT on every request
│
├─ Input Validation
│  └─ reject if name.length > 100 or < 3
│
├─ Rate Limiting
│  └─ 1000 requests/min per user
│
└─ Secrets Management
   └─ env vars never in code


SUPABASE DATABASE LAYER
│
├─ Row-Level Security (RLS)
│  └─ foundation_id must match auth.uid()
│
├─ Encryption at Rest
│  └─ AES-256
│
├─ Encrypted in Transit
│  └─ TLS 1.3
│
└─ Regular Backups
   └─ 7-day retention


PAYMENT LAYER (Stripe)
│
├─ PCI Compliance (Level 1)
│  └─ Never see card numbers
│
├─ Webhook Signature Verification
│  └─ Verify stripe-signature header
│
├─ Idempotent Keys
│  └─ Prevent double-charging
│
└─ Encrypted Transfers
   └─ Stripe Connect with signatures

```

---

## 12. MONITORING & OBSERVABILITY

```
┌──────────────────────────────────────────────────────────────────┐
│            HEALTH CHECK DASHBOARD                                 │
└──────────────────────────────────────────────────────────────────┘

METRICS
│
├─ REQUEST LATENCY
│  ├─ API response time (p50, p95, p99)
│  └─ Database query time
│
├─ ERROR RATE
│  ├─ 4xx errors (user input)
│  ├─ 5xx errors (server issues)
│  └─ Business logic failures
│
├─ THROUGHPUT
│  ├─ Requests/sec
│  ├─ Database connections
│  └─ Concurrent users
│
├─ RESOURCE USAGE
│  ├─ Function execution time (< 30s limit)
│  ├─ Memory usage
│  └─ Database connections (< 100 limit)
│
└─ BUSINESS METRICS
   ├─ Projects created/day
   ├─ Creations published/day
   ├─ Revenue/day
   ├─ Active creators
   └─ Marketplace searches/day


ALERTS
│
├─ ERROR RATE > 1%
│  └─ CRITICAL: Page creator
│
├─ API Latency p95 > 1s
│  └─ WARNING: Optimize queries
│
├─ Database connections > 80
│  └─ CRITICAL: Connection leak
│
├─ Function timeout (> 25s)
│  └─ CRITICAL: Performance issue
│
└─ Revenue transaction fails
   └─ CRITICAL: Money issue


LOGS
│
├─ Request/Response logs
│  └─ All API calls with metadata
│
├─ Database slow query logs
│  └─ Queries > 1 second
│
├─ Error stack traces
│  └─ Full context for debugging
│
└─ Audit logs
   └─ Who changed what, when

```

---

**Visual Reference Complete**
**Architecture is READY FOR IMPLEMENTATION**
**Next: C1 begins database deployment**

