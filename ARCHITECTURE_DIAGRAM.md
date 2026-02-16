# Project Organization Architecture Diagram

## Hub and Spoke Model Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│         MAIN HUB: barbrickdesign.github.io                     │
│         (Central Repository - Source of Truth)                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Source Code:                                            │  │
│  │  • /js/          - 35+ shared JavaScript libraries       │  │
│  │  • /css/         - Shared stylesheets                    │  │
│  │  • /src/         - Utilities, agents, systems            │  │
│  │  • /backend/     - Microservices                         │  │
│  │  • *.html        - 280+ project files                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Configuration:                                          │  │
│  │  • projects.json - Project catalog                       │  │
│  │  • package.json  - Dependencies                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────┬────────────────────────────────────┬──────────────┘
             │                                    │
             │  Daily Sync (2 AM UTC)             │
             │  via GitHub Actions                │
             │                                    │
     ┌───────▼────────┐                  ┌────────▼───────┐
     │                │                  │                │
┌────▼─────┐    ┌────▼─────┐      ┌────▼─────┐    ┌────▼─────┐
│ Project  │    │ Project  │      │ Project  │    │ Project  │
│  Repo 1  │    │  Repo 2  │ ...  │  Repo N  │    │  Repo M  │
│          │    │          │      │          │    │          │
│ oasis    │    │ gembot   │      │ grants   │    │ agent-   │
│          │    │ -ai      │      │ -portal  │    │ mgmt     │
└──────────┘    └──────────┘      └──────────┘    └──────────┘
     │               │                  │              │
     │               │                  │              │
     └───────────────┴──────────────────┴──────────────┘
                           │
                    GitHub Pages
                           │
                           ▼
              https://barbrickdesign.github.io/
                      [project-name]/
```

---

## Project Repository Structure

```
project-name/
│
├── index.html              ◄─── Main project file (from hub)
│
├── README.md               ◄─── Project documentation
│
├── LICENSE                 ◄─── Copyright notice
│
├── package.json            ◄─── Dependencies
│
├── .gitignore              ◄─── Ignore patterns
│
├── shared/                 ◄─── Synced from main hub
│   ├── js/                 
│   │   ├── library-1.js    ◄─── From hub /js/
│   │   └── library-2.js    
│   │
│   ├── css/                
│   │   └── styles.css      ◄─── From hub /css/
│   │
│   └── utils/              
│       └── helpers.js      ◄─── From hub /src/utils/
│
├── project-specific/       ◄─── Unique to this project
│   ├── assets/
│   ├── scripts/
│   └── styles/
│
└── .github/
    └── workflows/
        ├── deploy-pages.yml      ◄─── Deploy to GitHub Pages
        └── sync-from-hub.yml     ◄─── Pull updates from hub
```

---

## Synchronization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              MAIN HUB REPOSITORY                            │
│              (Source of Truth)                              │
│                                                             │
│   Changed: /js/payment-handler.js                           │
│                                                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Git push to main branch
                        │
                        ▼
              ┌─────────────────────┐
              │  GitHub Actions     │
              │  Webhook Trigger    │
              └──────────┬──────────┘
                         │
                         │ Triggers sync workflows in
                         │ all project repositories
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Project 1   │  │  Project 2   │  │  Project 3   │
│  Sync Job    │  │  Sync Job    │  │  Sync Job    │
│              │  │              │  │              │
│  1. Fetch    │  │  1. Fetch    │  │  1. Fetch    │
│  2. Copy     │  │  2. Copy     │  │  2. Copy     │
│  3. Test     │  │  3. Test     │  │  3. Test     │
│  4. Commit   │  │  4. Commit   │  │  4. Commit   │
│  5. Deploy   │  │  5. Deploy   │  │  5. Deploy   │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Project Categorization

```
                     All Projects (961 HTML files)
                              │
                 ─────────────┴─────────────
                │                           │
         Analysis Phase              Category Assignment
                │                           │
    ┌───────────┼───────────┐              │
    │           │           │              │
Complexity   Revenue   Dependencies        │
  Score      Critical     Count            │
    │           │           │              │
    └───────────┴───────────┘              │
                │                           │
                ▼                           │
    ┌───────────────────────┐              │
    │  Scoring Algorithm    │              │
    │                       │              │
    │  High:    20+ points  │              │
    │  Medium:  10-20 pts   │              │
    │  Low:     <10 points  │              │
    └───────────┬───────────┘              │
                │                           │
                └───────────────────────────┘
                              │
                 ─────────────┴─────────────
                │              │             │
                ▼              ▼             ▼
         ┌──────────┐   ┌──────────┐  ┌──────────┐
         │ TIER 1   │   │ TIER 2   │  │ TIER 3   │
         │ (HIGH)   │   │ (MEDIUM) │  │ (LOW)    │
         │          │   │          │  │          │
         │ 11 proj  │   │ 14 proj  │  │ 200+ proj│
         │          │   │          │  │          │
         │ Immediate│   │ Phased   │  │ Stay in  │
         │ repos    │   │ rollout  │  │ hub      │
         └──────────┘   └──────────┘  └──────────┘
```

---

## Deployment Pipeline

```
Developer makes change
        │
        ▼
Local git commit
        │
        ▼
Push to main hub
        │
        ├─────────────────────────────┐
        │                             │
        ▼                             ▼
Main hub deploys              Sync workflows trigger
   (GitHub Pages)              in project repos
        │                             │
        │                             ▼
        │                     Fetch latest from hub
        │                             │
        │                             ▼
        │                     Copy shared resources
        │                             │
        │                             ▼
        │                     Run tests
        │                             │
        │                        ┌────┴────┐
        │                        │         │
        │                    Pass│         │Fail
        │                        │         │
        │                        ▼         ▼
        │                   Commit &    Rollback
        │                   Deploy      & Alert
        │                        │         │
        │                        ▼         ▼
        │                   Live on    Notify
        │                   GH Pages   admin
        │                        │         │
        └────────────────────────┴─────────┘
                                 │
                                 ▼
                        Users see update
```

---

## Data Flow: User Request

```
User visits:
https://barbrickdesign.github.io/oasis/
        │
        ▼
┌──────────────────┐
│  GitHub Pages    │
│  CDN Network     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  index.html      │
│  (Project file)  │
└────────┬─────────┘
         │
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  shared/js/      │      │  shared/css/     │
│  Libraries       │      │  Stylesheets     │
└────────┬─────────┘      └────────┬─────────┘
         │                         │
         └───────────┬─────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │  External Resources    │
         │  (CDN, APIs, etc.)     │
         └───────────┬────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │  Rendered Page         │
         │  in Browser            │
         └────────────────────────┘
```

---

## Project Lifecycle

```
New Project Idea
       │
       ▼
Built in main hub
       │
       ▼
Tested locally
       │
       ▼
Deployed to hub
       │
       ▼
Gains traction
       │
       ▼
Added to Tier 1/2 list
       │
       ▼
Repository created
  (using scripts)
       │
       ▼
Sync workflow configured
       │
       ▼
GitHub Pages enabled
       │
       ▼
Link updated in hub
       │
       ▼
Monitoring begins
       │
       ├─────────────┬─────────────┐
       │             │             │
       ▼             ▼             ▼
  Updates       Bug fixes      Features
  via sync      via sync       via sync
       │             │             │
       └─────────────┴─────────────┘
                     │
                     ▼
           Continuous improvement
```

---

## Security Model

```
┌────────────────────────────────────────────────────────┐
│             MAIN HUB (Private Repo Optional)           │
│                                                        │
│  • API Keys (secrets)                                  │
│  • Payment credentials                                 │
│  • Backend services                                    │
│  • Database connections                                │
│                                                        │
└──────────────┬─────────────────────────────────────────┘
               │
               │ Only public code synced
               │ Secrets stay in hub
               │
               ▼
┌────────────────────────────────────────────────────────┐
│         PROJECT REPOSITORIES (Public)                  │
│                                                        │
│  • Public HTML/JS/CSS only                             │
│  • No secrets or credentials                           │
│  • Client-side code only                               │
│  • References to hub APIs                              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Growth Path

```
Current State:
    280 projects in single repo
              │
              ▼
Week 1-2: Pilot (3 projects)
    Test process, fix issues
              │
              ▼
Week 3-4: Tier 1 (11 projects)
    Revenue-critical & complex
              │
              ▼
Week 5-8: Tier 2 (14 projects)
    Significant standalone value
              │
              ▼
Week 9+: Optimization
    Monitoring, automation, improvements
              │
              ▼
Future State:
    25+ organized project repos
    Main hub as central command
    Automated sync & deployment
    Scalable architecture
```

---

## Success Metrics Dashboard (Conceptual)

```
┌─────────────────────────────────────────────────────┐
│  Project Organization Dashboard                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Total Projects:              280                   │
│  Organized into Repos:        25 / 25 (100%)       │
│  Active Sync Workflows:       25 / 25 (100%)       │
│  Failed Syncs (24h):          0                     │
│  Avg Sync Time:               45 seconds            │
│                                                     │
│  ┌──────────────────────────────────────────┐      │
│  │  Sync Status:                            │      │
│  │  ████████████████████████░░  96% Success │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│  GitHub Pages Status:                               │
│  • All sites live:            ✅                    │
│  • No 404 errors:             ✅                    │
│  • Avg load time:             2.1s ✅              │
│                                                     │
│  Revenue Systems:                                   │
│  • Payment flows:             ✅ Operational        │
│  • Grant portal:              ✅ Operational        │
│  • Contributors:              ✅ Active (15)        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Centralized code management
- ✅ Distributed project deployment  
- ✅ Automated synchronization
- ✅ Scalable growth path
- ✅ Independent project visibility
- ✅ Maintained functionality
