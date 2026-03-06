# API Dependency Map - Consciousness Revolution

**Last Updated:** 2026-03-06
**Platform:** Netlify Functions (Serverless)
**Total Endpoints:** 90 functions

---

## External Service Dependencies

### Supabase (Primary Database)
**All** functions use Supabase for database operations.
- **URL:** `SUPABASE_URL`
- **Keys:** `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_SECRET`

### Anthropic (AI/Claude)
Functions that use Claude for AI responses:
| Function | Purpose |
|----------|---------|
| `araya-chat.mjs` | Main ARAYA assistant |
| `cheap-chat.mjs` | Budget AI responses |
| `discord-verification.mjs` | AI-powered verification |

### Stripe (Payments)
Functions that process payments:
| Function | Purpose |
|----------|---------|
| `stripe-webhook.mjs` | Legacy webhook handler |
| `stripe-webhook-v2.mjs` | Current webhook handler |
| `create-checkout.mjs` | Create payment checkout |
| `create-checkout-session.mjs` | Session-based checkout |
| `create-connect-account.mjs` | Builder Stripe Connect |
| `create-uhos-checkout.mjs` | UHOS course checkout |
| `marketplace-checkout.mjs` | Marketplace purchases |
| `araya-energy.mjs` | Energy package purchases |
| `builder-webhook.mjs` | Builder revenue events |

### GitHub
Functions that interact with GitHub:
| Function | Purpose |
|----------|---------|
| `github-commit.mjs` | Commit file changes |
| `github-token.mjs` | Token management |
| `get-github-issues.mjs` | Fetch issues |
| `get-all-bugs.mjs` | Bug tracker integration |
| `submit-bug.mjs` | Create bug reports |
| `github-contribution-webhook.mjs` | Track contributions |
| `sync-contributions.mjs` | Sync contribution scores |
| `project-registry.mjs` | Project management |
| `araya-file.mjs` | File operations |
| `araya-edit-cockpit.mjs` | Dashboard editing |
| `araya-chat-admin-patch.mjs` | Admin patches |

### Discord
Functions for Discord integration:
| Function | Purpose |
|----------|---------|
| `discord-verify.mjs` | User verification |
| `discord-verification.mjs` | Verification flows |
| `discord-admin.mjs` | Admin operations |
| `discord-xp-webhook.mjs` | XP tracking |
| `discord-community-api.mjs` | Community features |
| `sync-user-xp.mjs` | XP synchronization |
| `verify-identity.mjs` | Identity verification |
| `araya-dna.mjs` | DNA system |
| `araya-verify.mjs` | ARAYA verification |
| `domain-tools.mjs` | Domain management |
| `radio-in.mjs` | Radio communication |

### PayPal
Functions for PayPal payments:
| Function | Purpose |
|----------|---------|
| `paypal-donation-webhook.mjs` | Process donations |
| `repopilot-paypal-webhook.mjs` | RepoPilot payments |

---

## Function Categories

### Authentication (4 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `auth-login.mjs` | user_foundations, user_sessions, builder_network_status, security_events, audit_log | Supabase Auth |
| `auth-logout.mjs` | user_sessions, audit_log | Supabase Auth |
| `auth-signup.mjs` | user_foundations, builder_network_status, araya_accounts, araya_transactions, audit_log | Supabase Auth |
| `auth-signup-new.mjs` | user_foundations, builder_network_status, audit_log | Supabase Auth |

### ARAYA System (12 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `araya-chat.mjs` | user_images, user_cases, case_events, case_documents | Anthropic, GitHub |
| `araya-energy.mjs` | araya_accounts, araya_transactions, araya_costs, araya_packages | Stripe |
| `araya-credits.mjs` | araya_credits, araya_credit_transactions, araya_product_costs, araya_credit_packages | - |
| `araya-verify.mjs` | verification_records, user_profiles | Discord |
| `araya-analytics.mjs` | - | - |
| `araya-context.mjs` | - | - |
| `araya-dna.mjs` | - | Discord |
| `araya-edit-cockpit.mjs` | - | GitHub |
| `araya-feedback.mjs` | - | - |
| `araya-file.mjs` | - | GitHub |
| `araya-memory.mjs` | - | - |
| `araya-skills.mjs` | - | - |

### Builder Network (6 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `builder-dashboard-api.mjs` | builder_balances, builder_creations, revenue_events, downstream_revenue | - |
| `builder-webhook.mjs` | revenue_events, creation_lineage, builder_creations, downstream_revenue, builder_balances | Stripe |
| `builder-document-submit.mjs` | - | - |
| `create-connect-account.mjs` | builder_balances | Stripe |
| `update-contribution.mjs` | - | - |
| `network-feature-gate.mjs` | - | - |

### Certifications (5 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `certifications-browse.mjs` | certification_templates | - |
| `certifications-issue.mjs` | certification_templates, certification_progress, user_certifications, user_foundations | - |
| `certifications-progress.mjs` | certification_progress | - |
| `certifications-recommend.mjs` | certification_templates, career_pathways | - |
| `certifications-verify.mjs` | user_certifications, certification_verifications | - |

### Dashboard System (8 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `dashboard-edit.mjs` | dashboard_customizations, improvement_proposals | - |
| `dashboard-commit.mjs` | - | - |
| `dashboard-config.mjs` | - | - |
| `dashboard-diff.mjs` | - | - |
| `dashboard-factory.mjs` | - | - |
| `dashboard-index.mjs` | dashboard_index | - |
| `dashboard-merge.mjs` | - | - |
| `dashboard-readouts.mjs` | dashboard_readouts | - |
| `apply-widget-to-all.mjs` | widget_governance, dashboard_features | - |
| `widget-marketplace.mjs` | - | - |

### Discord Integration (6 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `discord-verify.mjs` | - | Discord |
| `discord-verification.mjs` | - | Discord, Anthropic |
| `discord-admin.mjs` | - | Discord, GitHub |
| `discord-xp-webhook.mjs` | discord_users_v2, discord_xp_ledger | - |
| `discord-community-api.mjs` | - | Discord |
| `sync-user-xp.mjs` | - | Discord |

### R3D3 System (3 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `r3d3-access-check.mjs` | - | - |
| `r3d3-grant-access.mjs` | - | - |
| `r3d3-log-action.mjs` | r3d3_access_log | - |

### Payment Processing (9 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `stripe-webhook.mjs` | - | Stripe |
| `stripe-webhook-v2.mjs` | - | Stripe |
| `create-checkout.mjs` | - | Stripe |
| `create-checkout-session.mjs` | - | Stripe |
| `create-uhos-checkout.mjs` | - | Stripe |
| `marketplace-checkout.mjs` | - | Stripe |
| `paypal-donation-webhook.mjs` | - | PayPal |
| `repopilot-paypal-webhook.mjs` | - | PayPal |
| `repopilot-delivery-notification.mjs` | - | - |

### GitHub Integration (8 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `github-commit.mjs` | - | GitHub |
| `github-token.mjs` | - | GitHub |
| `get-github-issues.mjs` | - | GitHub |
| `get-all-bugs.mjs` | - | GitHub |
| `submit-bug.mjs` | - | GitHub |
| `github-contribution-webhook.mjs` | - | GitHub |
| `sync-contributions.mjs` | - | GitHub |
| `project-registry.mjs` | - | GitHub |

### Communication (5 functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `sms-webhook.mjs` | sms_inbox | Twilio |
| `radio-in.mjs` | - | Discord |
| `radio-out.mjs` | - | - |
| `team-messages.mjs` | team_messages | - |
| `send-welcome-email.mjs` | - | Email |
| `send-course-welcome-email.mjs` | - | Email |
| `send-repopilot-welcome.mjs` | - | Email |

### Utility Functions (10+ functions)
| Function | Tables Used | External APIs |
|----------|-------------|---------------|
| `check-access.mjs` | users | - |
| `check-update.mjs` | - | - |
| `verify-beta-access.mjs` | - | - |
| `save-beta-signup.mjs` | - | - |
| `verify-identity.mjs` | - | Discord |
| `export-members.mjs` | - | - |
| `user-images.mjs` | user_images | - |
| `ability-access.mjs` | builder_network_status, ability_access_control, network_feature_access | - |
| `brain-api.mjs` | atoms | - |
| `brain-query.mjs` | atoms | - |
| `merlin-agent-api.mjs` | merlin_agents, merlin_jobs | - |
| `trinity-status.mjs` | trinity_hub | - |
| `cheap-chat.mjs` | - | Anthropic |
| `domain-tools.mjs` | - | Discord |
| `evidence-upload.mjs` | - | - |
| `file-upload.mjs` | - | - |
| `sam-gov-token.mjs` | - | SAM.gov |
| `gemini-screen-control.mjs` | - | Google |

---

## Shared Utilities

### `/utils/security.mjs`
Core security utilities used by most functions:
- `getSecureCORSHeaders()` - CORS configuration
- `handlePreflight()` - OPTIONS request handler
- `checkRateLimit()` - In-memory rate limiting
- `validateInput()` - Input sanitization
- `anonymizeIP()` - IP hashing for privacy
- `secureLog()` - Safe logging
- `successResponse()` / `errorResponse()` - Response helpers

### `/utils/middleware.mjs`
Shared middleware for:
- Authentication verification
- Request parsing
- Error handling

---

## API Endpoint Patterns

### Public Endpoints (no auth required)
- `auth-login` - User login
- `auth-signup` - User registration
- `check-update` - Version checking
- Webhook endpoints (have their own verification)

### Protected Endpoints (require auth)
- All dashboard functions
- All ARAYA functions (except public chat)
- All builder functions
- R3D3 functions
- Admin functions

### Webhook Endpoints (external verification)
- `stripe-webhook-v2` - Stripe signature verification
- `discord-xp-webhook` - Discord verification
- `github-contribution-webhook` - GitHub webhook signature
- `paypal-*-webhook` - PayPal verification

---

## Environment Variables Required

### Core
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_SECRET`

### AI/LLM
- `ANTHROPIC_API_KEY`

### Payments
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

### GitHub
- `GITHUB_TOKEN`
- `GITHUB_WEBHOOK_SECRET`

### Discord
- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`

### Security
- `ANONYMIZATION_SALT`
- `NODE_ENV`

---

## Dependency Graph (Critical Paths)

```
User Signup Flow:
auth-signup → user_foundations → builder_network_status → araya_accounts

User Login Flow:
auth-login → user_foundations → builder_network_status → user_sessions

ARAYA Chat Flow:
araya-chat → araya-energy (check balance) → Anthropic API → user_cases

Payment Flow:
create-checkout → Stripe → stripe-webhook-v2 → araya_accounts/builder_balances

Builder Revenue Flow:
marketplace-checkout → Stripe → builder-webhook → revenue_events → builder_balances
```

---

## Health Check Endpoints

- `/.netlify/functions/health` - Basic health check
- `/.netlify/functions/trinity-status` - Trinity system status
- `/.netlify/functions/supabase-debug` - Database connectivity

---

*Generated from function analysis on 2026-03-06*
