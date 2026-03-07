# BUILD DOMAIN - QUICK REFERENCE CARD
## Creator Economy Architecture (One-Page)

**Deployment:** Netlify + Supabase + Stripe | **Scale:** 10-10k creators | **Status:** Architecture Ready

---

## URL ROUTES (One Click Away)

```
/build/                    → Dashboard
/build/projects            → My Projects (list)
/build/projects/new        → New Project Wizard
/build/projects/{id}       → Project Detail
/build/sprints/{id}        → Sprint Kanban
/build/creations           → My Creations
/build/creations/new       → Creation Editor
/build/marketplace         → Public Marketplace
/build/earnings            → Revenue Dashboard
/build/analytics           → Analytics & XP
```

---

## WEB COMPONENTS (Drop-in Reusable)

| Component | Usage | Props |
|-----------|-------|-------|
| `<cr-project-card>` | Display single project | project-id, title, status, progress |
| `<cr-sprint-tracker>` | Kanban board | project-id, sprint-id, view="kanban\|timeline" |
| `<cr-creation-editor>` | WYSIWYG editor | creation-id, type, auto-save="true" |
| `<cr-marketplace-card>` | Marketplace listing | creation-id, price-cents, rating, sales |
| `<cr-earnings-widget>` | Revenue display | foundation-id, period="month\|year" |
| `<cr-activity-feed>` | Real-time updates | project-id, type, max-items=20 |

---

## API ENDPOINTS (Backend Functions)

### Projects
```
GET    /api/build/projects?page=1&filter=active
POST   /api/build/projects
PATCH  /api/build/projects/:id
DELETE /api/build/projects/:id
```

### Sprints & Tasks
```
GET    /api/build/projects/:id/sprints
POST   /api/build/projects/:id/sprints
PATCH  /api/build/sprints/:id/tasks/:taskId
POST   /api/build/sprints/:id/tasks/:taskId/update
```

### Creations
```
GET    /api/build/creations?visibility=marketplace
POST   /api/build/creations/:id/publish
GET    /api/build/marketplace/search?q=query&category=type
```

### Creator Economy
```
GET    /api/build/earnings?period=month
POST   /api/build/earnings/payout
GET    /api/build/xp/:foundationId/summary
POST   /api/build/xp/:foundationId/award
```

---

## DATABASE TABLES (Core Schema)

```sql
builder_projects           -- Collaborative workspaces
project_sprints           -- Time-boxed cycles
sprint_tasks              -- Work items (Kanban)
project_collaborators     -- Team memberships
creation_projects         -- Creation ↔ Project link
creator_xp_events         -- Gamification
creator_levels            -- Player progression

-- EXISTING (already working):
builder_creations         -- What creators make
revenue_events            -- Money movements
builder_balances          -- Creator accounts
downstream_revenue        -- Passive income tracking
```

---

## CREATOR TIERS & REWARDS

| Tier | Level | XP | Revenue % | Downstream % | Featured Slots |
|------|-------|----|---------  |--------------|----------------|
| Bronze | 1 | 0 | 80% | 10% | 0 |
| Silver | 5 | 5k | 85% | 15% | 1 |
| Gold | 10 | 25k | 90% | 20% | 3 |
| Platinum | 15 | 100k | 95% | 30% | 10 |

### XP Earning Triggers
- Publish creation: 100 XP
- First sale: 500 XP
- Join team: 50 XP
- Ship team creation: 250 XP
- Downstream milestone: 200-5000 XP
- Stream 4+ hours: 25 XP/day

---

## SCALABILITY PATH

| Phase | Timeline | Additions | Creators |
|-------|----------|-----------|----------|
| 1 | Now | Core tables, APIs, components | 10-50 |
| 2 | Week 2 | Real-time collaboration, sprints | 50-200 |
| 3 | Week 4 | XP system, featured marketplace | 200-1k |
| 4 | Week 6 | Analytics, leaderboards, forums | 1k-5k |
| 5 | Week 12 | Events, academy, partnerships | 5k-10k+ |

---

## KEY FILES

```
C:\Users\dwrek\100X_DEPLOYMENT\

Database:
  supabase/migrations/005_builder_projects.sql
  supabase/migrations/006_creator_xp_system.sql

Backend:
  netlify/functions/build/*.js (17 functions)

Frontend:
  src/components/build/*.js (6 components)
  src/pages/build/*.html (9 pages)
  src/api/build.js (API client)
  src/utils/build-helpers.js (utilities)

Documentation:
  C2_BUILD_DOMAIN_ARCHITECTURE_BLUEPRINT.md (this file)
  BUILD_DOMAIN_QUICK_REFERENCE.md (this file)
```

---

## TESTING CHECKLIST

- [ ] Create project
- [ ] Add collaborator
- [ ] Create sprint
- [ ] Add tasks to sprint
- [ ] Move task status
- [ ] Real-time updates visible
- [ ] Publish creation to marketplace
- [ ] Purchase creation
- [ ] Revenue reflected in earnings
- [ ] XP earned from actions
- [ ] Level up detected
- [ ] Downstream income calculated

---

## PERFORMANCE TARGETS

- Project load: <500ms
- Real-time task update: <300ms
- Marketplace search: <1s
- Earnings calculation: <2s
- Payout processing: <10s

---

## SECURITY

- RLS on all tables (row-level security)
- Stripe webhook verification
- JWT auth on all APIs
- HTTPS only
- CORS restricted to own domain
- API rate limiting: 1000 req/min per user

---

## NEXT STEPS FOR C1 (Mechanic)

1. Deploy SQL migrations (005, 006, 007)
2. Create 17 netlify functions in `/api/build/*`
3. Test database constraints & indexes
4. Validate RLS policies
5. Set up Stripe webhooks
6. Connect to Supabase Realtime

---

## NEXT STEPS FOR C3 (Oracle)

1. Review CREATE statements for optimization
2. Validate 3→7→13 pattern compliance
3. Test scalability with 10k+ creator simulation
4. Identify potential bottlenecks
5. Recommend caching strategy
6. Audit cost implications

---

**Document Version:** 2.0
**Last Updated:** March 6, 2026
**Architecture Status:** READY FOR IMPLEMENTATION
**Estimated Build Time:** 3-4 weeks (collaborative)

