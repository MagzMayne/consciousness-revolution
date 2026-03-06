# Database Schema - Consciousness Revolution

**Last Updated:** 2026-03-06
**Database:** Supabase PostgreSQL
**Total Tables:** 45+

---

## Core Authentication & User Tables

### `user_foundations`
Primary user profile table with consciousness metrics.
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | FK to Supabase Auth users |
| email | text | User email |
| full_name | text | Display name |
| consciousness_level | float | 0-1 scale |
| manipulation_immunity | float | 0-1 scale |
| truth_recognition | float | 0-1 scale |
| pattern_recognition | float | 0-1 scale |
| account_tier | text | free/beta/pro/enterprise |
| account_status | text | active/suspended/deleted |
| is_admin | boolean | Admin access flag |
| r3d3_access_enabled | boolean | R3D3 access flag |

**Used by:** auth-login, auth-signup, r3d3-*, sync-user-xp

### `user_sessions`
Active user session tracking.
| Column | Type | Description |
|--------|------|-------------|
| foundation_id | uuid | FK to user_foundations |
| session_token | text | Secure session ID |
| device_type | text | mobile/desktop |
| ip_address | text | Client IP |
| user_agent | text | Browser UA string |
| is_active | boolean | Session status |
| started_at | timestamp | Session start |
| last_activity_at | timestamp | Last activity |
| ended_at | timestamp | Session end |

**Used by:** auth-login, auth-logout

### `security_events`
Security audit log for rate limits, failed logins, suspicious activity.
| Column | Type | Description |
|--------|------|-------------|
| event_type | text | rate_limit_exceeded/failed_login/etc |
| severity | text | low/medium/high/critical |
| ip_address_anonymized | text | Hashed IP |
| description | text | Event details |
| metadata | jsonb | Additional context |

**Used by:** auth-login

### `audit_log`
General audit trail for all user actions.
| Column | Type | Description |
|--------|------|-------------|
| foundation_id | uuid | FK to user_foundations |
| event_type | text | user_login/user_logout/user_signup |
| event_category | text | auth/data/admin |
| action | text | create/read/update/delete |
| ip_address | text | Client IP |
| user_agent | text | Browser UA string |
| metadata | jsonb | Additional context |

**Used by:** auth-login, auth-logout, auth-signup

---

## ARAYA Energy System

### `araya_accounts`
User energy/credit accounts.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| foundation_id | uuid | FK to user_foundations |
| email | text | User email |
| tier | text | flow/stream/ocean/infinite |
| energy_balance | integer | Current balance |
| monthly_allocation | integer | Monthly quota |
| subscription_status | text | free/active/cancelled |

**Used by:** araya-energy, auth-signup

### `araya_transactions`
Energy transaction history.
| Column | Type | Description |
|--------|------|-------------|
| account_id | uuid | FK to araya_accounts |
| transaction_type | text | signup_bonus/usage/purchase/refund |
| amount | integer | Transaction amount (+/-) |
| balance_after | integer | Balance post-transaction |
| description | text | Human-readable description |
| metadata | jsonb | Additional context |

**Used by:** araya-energy, auth-signup

### `araya_costs`
Energy costs for different operations.
| Column | Type | Description |
|--------|------|-------------|
| operation | text | Operation identifier |
| base_cost | integer | Base energy cost |
| multiplier | float | Dynamic multiplier |

**Used by:** araya-energy

### `araya_packages`
Energy purchase packages.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Package name |
| energy_amount | integer | Energy included |
| price_cents | integer | Price in cents |
| stripe_price_id | text | Stripe integration |

**Used by:** araya-energy

### `araya_credits` / `araya_credit_transactions` / `araya_credit_packages`
Legacy credits system (being migrated to Energy).

---

## Builder Network

### `builder_network_status`
Network tier and contribution tracking.
| Column | Type | Description |
|--------|------|-------------|
| foundation_id | uuid | FK to user_foundations |
| contribution_score | integer | Accumulated points |
| contribution_tier | text | GHOST/SEEDLING/BUILDER/ARCHITECT/TITAN/FOUNDER |

**Tier Thresholds:** GHOST(0), SEEDLING(10), BUILDER(100), ARCHITECT(500), TITAN(1000), FOUNDER(5000)

**Used by:** auth-login, auth-signup, network-feature-gate, update-contribution

### `builder_balances`
Financial balances for builders.
| Column | Type | Description |
|--------|------|-------------|
| foundation_id | uuid | FK to user_foundations |
| available_balance | integer | Withdrawable amount (cents) |
| pending_balance | integer | Pending payouts |
| stripe_connect_id | text | Stripe Connect account |

**Used by:** builder-dashboard-api, create-connect-account

### `builder_creations`
Content/products created by builders.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| creator_id | uuid | FK to user_foundations |
| title | text | Creation title |
| type | text | template/tool/course/etc |
| price_cents | integer | Price |
| sales_count | integer | Total sales |

**Used by:** builder-webhook, marketplace-checkout

### `revenue_events`
Revenue tracking for builder earnings.
| Column | Type | Description |
|--------|------|-------------|
| creation_id | uuid | FK to builder_creations |
| amount_cents | integer | Revenue amount |
| event_type | text | sale/refund/payout |
| processed | boolean | Processing status |

**Used by:** builder-webhook

### `network_feature_access`
Granted feature access per user.
| Column | Type | Description |
|--------|------|-------------|
| foundation_id | uuid | FK to user_foundations |
| feature_id | text | Feature identifier |
| granted_at | timestamp | Grant time |

**Used by:** ability-access, network-feature-gate

---

## Dashboard System

### `dashboard_customizations`
User dashboard preferences.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| foundation_id | uuid | FK to user_foundations |
| layout | jsonb | Widget layout config |
| theme | text | Theme preference |
| widgets_enabled | jsonb | Enabled widgets |

**Used by:** dashboard-edit

### `dashboard_features`
Dashboard feature flags.
| Column | Type | Description |
|--------|------|-------------|
| feature_id | text | Feature identifier |
| enabled | boolean | Global enable flag |
| tier_required | text | Minimum tier |

**Used by:** apply-widget-to-all

### `widget_governance`
Widget approval workflow.
| Column | Type | Description |
|--------|------|-------------|
| widget_id | text | Widget identifier |
| status | text | pending/approved/rejected |
| approver_id | uuid | Admin who approved |

**Used by:** apply-widget-to-all

### `improvement_proposals`
Feature improvement proposals.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| submitter_id | uuid | FK to user_foundations |
| title | text | Proposal title |
| description | text | Full description |
| status | text | submitted/reviewing/approved/rejected |
| votes | integer | Community votes |

**Used by:** dashboard-commit, dashboard-edit

---

## Case Management (ARAYA Legal)

### `user_cases`
Legal cases tracked by ARAYA.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| foundation_id | uuid | FK to user_foundations |
| case_type | text | custody/divorce/etc |
| title | text | Case title |
| status | text | active/pending/closed |
| priority | text | low/medium/high/urgent |

**Used by:** araya-chat

### `case_events`
Timeline of case activities.
| Column | Type | Description |
|--------|------|-------------|
| case_id | uuid | FK to user_cases |
| event_type | text | hearing/filing/meeting |
| event_date | timestamp | Scheduled date |
| description | text | Event details |

**Used by:** araya-chat

### `case_documents`
Documents attached to cases.
| Column | Type | Description |
|--------|------|-------------|
| case_id | uuid | FK to user_cases |
| file_name | text | Document name |
| file_url | text | Storage URL |
| document_type | text | court_order/evidence/etc |

**Used by:** araya-chat

### `user_images`
Images uploaded by users.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| foundation_id | uuid | FK to user_foundations |
| image_url | text | Storage URL |
| description | text | Image description |
| analysis | jsonb | AI analysis results |

**Used by:** araya-chat, user-images

---

## Certifications

### `certification_templates`
Available certification definitions.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Certification name |
| description | text | Full description |
| requirements | jsonb | Completion requirements |
| tier_required | text | Minimum network tier |

**Used by:** certifications-browse, certifications-recommend, certifications-issue

### `certification_progress`
User progress toward certifications.
| Column | Type | Description |
|--------|------|-------------|
| foundation_id | uuid | FK to user_foundations |
| certification_id | uuid | FK to certification_templates |
| progress_percent | integer | 0-100 |
| requirements_met | jsonb | Completed requirements |

**Used by:** certifications-progress, certifications-issue

### `user_certifications`
Issued certifications.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| foundation_id | uuid | FK to user_foundations |
| certification_id | uuid | FK to certification_templates |
| issued_at | timestamp | Issue date |
| certificate_hash | text | Verification hash |
| valid_until | timestamp | Expiration date |

**Used by:** certifications-issue, certifications-verify

---

## Discord Integration

### `discord_users_v2`
Discord member data.
| Column | Type | Description |
|--------|------|-------------|
| discord_id | text | Discord user ID |
| username | text | Discord username |
| xp | integer | Total XP |
| level | integer | Current level |
| tier | text | Network tier |

**Used by:** discord-xp-webhook

### `discord_xp_ledger`
XP transaction history.
| Column | Type | Description |
|--------|------|-------------|
| discord_id | text | Discord user ID |
| amount | integer | XP amount |
| reason | text | XP source |

**Used by:** discord-xp-webhook

---

## Merlin Agent System

### `merlin_agents`
Autonomous agent definitions.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Agent name |
| type | text | Agent type |
| config | jsonb | Configuration |
| status | text | active/paused/error |

**Used by:** merlin-agent-api

### `merlin_jobs`
Agent job queue.
| Column | Type | Description |
|--------|------|-------------|
| agent_id | uuid | FK to merlin_agents |
| job_type | text | Job type |
| status | text | pending/running/complete/failed |
| result | jsonb | Job output |

**Used by:** merlin-agent-api

---

## Other Tables

### `rate_limits`
Distributed rate limiting.
| Column | Type | Description |
|--------|------|-------------|
| key | text | Rate limit key |
| count | integer | Request count |
| window_start | timestamp | Window start time |

**Used by:** utils/security.mjs

### `team_messages`
Internal team communications.

### `trinity_hub` / `consciousness_metrics` / `atoms`
Trinity coordination and knowledge system.

### `verified_members`
Identity verification records.

### `sms_inbox`
Incoming SMS messages.

### `r3d3_access_log`
R3D3 feature access logging.

---

## Table Relationships

```
user_foundations (central hub)
├── user_sessions (1:many)
├── araya_accounts (1:1)
│   └── araya_transactions (1:many)
├── builder_network_status (1:1)
├── builder_balances (1:1)
├── builder_creations (1:many)
│   └── revenue_events (1:many)
├── user_cases (1:many)
│   ├── case_events (1:many)
│   └── case_documents (1:many)
├── user_images (1:many)
├── certification_progress (1:many)
├── user_certifications (1:many)
├── dashboard_customizations (1:1)
├── improvement_proposals (1:many)
├── network_feature_access (1:many)
└── audit_log (1:many)
```

---

## Key Indexes (Recommended)

- `user_foundations(user_id)` - Primary lookup
- `user_sessions(foundation_id, is_active)` - Active session lookup
- `araya_accounts(foundation_id)` - Energy account lookup
- `builder_network_status(foundation_id)` - Network tier lookup
- `audit_log(foundation_id, created_at)` - Audit queries
- `security_events(created_at, event_type)` - Security monitoring

---

## RLS Policies

All tables should have Row Level Security (RLS) enabled with policies:
- Users can only read/write their own data
- Admins can read all data
- Service role bypasses RLS for backend operations

---

*Generated from function analysis on 2026-03-06*
