# CONTROLLED EXPLOSION INFRASTRUCTURE
## Consciousness Revolution - Scale Protection System
## Last Updated: January 13, 2026

---

## EXECUTIVE SUMMARY

This infrastructure prevents "Jack and the Beanstalk" uncontrolled growth that could destroy the platform. Eight interlocking systems provide layered protection from 10 users to 100,000+ users.

**The Pattern:** Rate Limit -> Feature Flag -> Circuit Breaker -> Kill Switch -> Phased Rollout -> Game Theory

---

## ARCHITECTURE OVERVIEW

```
                    INCOMING REQUEST
                           |
                           v
                   +---------------+
                   | RATE_LIMITER  |  <-- First gate: slow flood
                   +---------------+
                           |
                           v
                   +---------------+
                   | FEATURE_FLAGS |  <-- Second gate: who gets what
                   +---------------+
                           |
                           v
                   +---------------+
                   | CIRCUIT_BREAKER| <-- Third gate: auto-protection
                   +---------------+
                           |
                           v
                   +---------------+
                   |  KILL_SWITCH  |  <-- Emergency override
                   +---------------+
                           |
                           v
                   +---------------+
                   | PHASED_ROLLOUT|  <-- Staged feature launch
                   +---------------+
                           |
                           v
                   +---------------+
                   |  ARAYA_API    |  <-- The actual service
                   +---------------+
                           |
                           v
                   +---------------+
                   | ADMIN_PANEL   |  <-- Control & monitoring
                   +---------------+
                           |
                           v
                   +---------------+
                   |GROWTH_DASHBOARD| <-- Visibility
                   +---------------+
                           |
                           v
                   +---------------+
                   |GAME_THEORY    |  <-- Scale prediction
                   +---------------+
```

---

## COMPONENT FILES

| File | Purpose | Lines |
|------|---------|-------|
| `RATE_LIMITER.py` | Request throttling per tier | ~300 |
| `FEATURE_FLAGS.py` | Feature access control | ~350 |
| `CIRCUIT_BREAKER.py` | Auto-recovery protection | ~464 |
| `KILL_SWITCH.py` | Emergency shutoff | ~518 |
| `PHASED_ROLLOUT.py` | Staged launch control | ~500 |
| `GAME_THEORY_DECISION_TREE.py` | Scale planning | ~450 |
| `ADMIN_CONTROL_PANEL.py` | Unified integration | ~647 |
| `GROWTH_DASHBOARD.html` | Visual monitoring | ~400 |

**Total: ~3,629 lines of infrastructure code**

---

## 1. RATE_LIMITER.py

### Purpose
Prevents any single user from overwhelming the system. Uses sliding window algorithm.

### Tier Limits

| Tier | Requests/Min | Queries/Hour | Message Length |
|------|-------------|--------------|----------------|
| FREE | 10 | 50 | 500 chars |
| SEEKER | 30 | 200 | 2,000 chars |
| BUILDER | 60 | 500 | 5,000 chars |
| OPERATOR | 120 | 1,000 | 10,000 chars |
| COMMANDER | 300 | 3,000 | 50,000 chars |

### Usage

```python
from RATE_LIMITER import RateLimiter, rate_limit

limiter = RateLimiter()

# Check before processing
allowed, info = limiter.check_limit(user_id, tier='SEEKER', action='query')
if not allowed:
    return {'error': 'rate_limited', 'retry_after': info['retry_after']}

# Or use decorator
@rate_limit(action='query')
def chat_endpoint(user_id, tier):
    # Protected endpoint
    pass
```

### Key Methods
- `check_limit(user_id, tier, action)` - Returns (allowed, info)
- `get_usage(user_id)` - Current usage stats
- `reset_user(user_id)` - Clear limits for user
- `@rate_limit(action)` - Decorator for Flask routes

---

## 2. FEATURE_FLAGS.py

### Purpose
Controls which features are available to which users. Enables gradual rollouts.

### Default Flags

| Flag | Default | Description |
|------|---------|-------------|
| `araya_chat` | 100% | Main chat interface |
| `brain_query` | 100% | Cyclotron brain access |
| `file_read` | 50% | File reading ability |
| `file_write` | 10% | File writing (dangerous) |
| `discord_integration` | 25% | Discord bot features |
| `advanced_patterns` | 0% | Pattern Theory advanced |

### Usage

```python
from FEATURE_FLAGS import FeatureFlags, require_feature

flags = FeatureFlags()

# Check flag
if flags.is_enabled('file_write', user_id='user123'):
    # User has access
    pass

# Set rollout percentage
flags.set_rollout('discord_integration', percentage=50)

# Tier override
flags.set_tier_override('file_write', 'OPERATOR', True)

# Flask decorator
@app.route('/write')
@require_feature('file_write')
def write_file():
    pass
```

### Key Methods
- `is_enabled(flag, user_id, tier)` - Check if enabled for user
- `set_rollout(flag, percentage)` - Set rollout percentage
- `set_tier_override(flag, tier, enabled)` - Override for tier
- `@require_feature(flag)` - Flask decorator

---

## 3. CIRCUIT_BREAKER.py

### Purpose
Automatically trips when a service fails too many times. Self-heals after timeout.

### States
1. **CLOSED** - Normal operation, all requests pass
2. **OPEN** - Blocking all requests (service broken)
3. **HALF_OPEN** - Testing if service recovered

### Configuration

```python
CIRCUIT_CONFIG = {
    'failure_threshold': 5,       # Failures before opening
    'failure_window_seconds': 60, # Window for counting
    'recovery_timeout': 30,       # Seconds before testing
    'success_threshold': 3,       # Successes to close
    'slow_call_threshold_ms': 5000
}
```

### Default Breakers

| Breaker | Failure Threshold | Recovery Timeout |
|---------|-------------------|------------------|
| `araya_api` | 5 | 30s |
| `deepseek` | 3 | 60s |
| `ollama` | 3 | 10s |
| `cyclotron` | 10 | 15s |
| `supabase` | 5 | 30s |
| `discord` | 5 | 60s |

### Usage

```python
from CIRCUIT_BREAKER import CircuitBreaker, circuit_protect, get_breaker

# Get or create breaker
breaker = get_breaker('araya_api')

# Execute with protection
try:
    result = breaker.execute(call_araya, fallback=cached_response)
except CircuitOpenError as e:
    return {'error': 'service_degraded', 'retry_after': e.retry_after}

# Or use decorator
@circuit_protect('deepseek', fallback=use_cache)
def call_deepseek():
    pass
```

### Key Methods
- `execute(func, *args, fallback=None)` - Protected execution
- `record_success(response_time_ms)` - Record success
- `record_failure(error_type)` - Record failure
- `force_open(reason)` - Manual trip
- `force_close()` - Manual reset
- `get_status()` - Current state

---

## 4. KILL_SWITCH.py

### Purpose
Emergency shutoff for any system. Single point of control for all emergencies.

### Available Switches

| Switch | Severity | Auto-Restore |
|--------|----------|--------------|
| `ALL_SERVICES` | CRITICAL | Never |
| `ALL_AI_QUERIES` | HIGH | 30 min |
| `DEEPSEEK_API` | MEDIUM | 15 min |
| `OLLAMA_LOCAL` | LOW | 5 min |
| `BRAIN_QUERIES` | MEDIUM | 15 min |
| `BRAIN_WRITES` | MEDIUM | 10 min |
| `FILE_READS` | MEDIUM | 10 min |
| `FILE_WRITES` | HIGH | 30 min |
| `DISCORD_BOT` | LOW | 15 min |
| `EMAIL_GATEWAY` | MEDIUM | 30 min |
| `NEW_SIGNUPS` | LOW | Never |
| `FREE_TIER` | MEDIUM | 60 min |
| `API_ACCESS` | HIGH | 30 min |

### Usage

```python
from KILL_SWITCH import KillSwitch, is_killed, require_service

ks = KillSwitch()

# Check before operation
if ks.is_killed('ALL_AI_QUERIES'):
    return {'error': 'maintenance', 'message': ks.get_message('ALL_AI_QUERIES')}

# Kill a service
ks.kill('DEEPSEEK_API', reason='API overload', killed_by='ADMIN')

# Restore
ks.restore('DEEPSEEK_API', by='ADMIN')

# Emergency shutdown
ks.emergency_shutdown(reason='Security breach')

# Flask decorator
@app.route('/chat')
@require_service('ALL_AI_QUERIES')
def chat():
    pass
```

### Key Methods
- `is_killed(switch_name)` - Check if killed
- `get_message(switch_name)` - Get user message
- `kill(switch_name, reason, killed_by)` - Activate kill
- `restore(switch_name, by)` - Deactivate kill
- `emergency_shutdown(reason)` - Kill everything
- `get_killed()` - List all killed switches

---

## 5. PHASED_ROLLOUT.py

### Purpose
Controlled feature launches from alpha to scale. Prevents premature exposure.

### Phases

| Phase | Users | Allowed Tiers | Rate Multiplier |
|-------|-------|---------------|-----------------|
| ALPHA | 1-10 | COMMANDER only | 0.5x |
| BETA | 11-100 | OPERATOR+ | 0.7x |
| EARLY | 101-1,000 | BUILDER+ | 0.85x |
| GROWTH | 1,001-10,000 | SEEKER+ | 1.0x |
| SCALE | 10,001-100,000 | ALL | 1.2x |

### Transition Requirements

| Phase | Min Days | Min Users Tested | Max Error Rate |
|-------|----------|------------------|----------------|
| ALPHA | 0 | 0 | 10% |
| BETA | 3 | 5 | 5% |
| EARLY | 7 | 50 | 3% |
| GROWTH | 14 | 500 | 1% |
| SCALE | 30 | 5,000 | 0.5% |

### Usage

```python
from PHASED_ROLLOUT import PhaseController, require_phase

controller = PhaseController()

# Check access
can_access, info = controller.can_access('araya_chat', user_id, tier='BUILDER')
if not can_access:
    return {'error': 'feature_not_available', 'reason': info['reason']}

# Advance phase
controller.advance_phase('araya_chat', approved_by='COMMANDER')

# Rollback
controller.rollback_phase('araya_chat', reason='Too many errors')

# Flask decorator
@app.route('/new-feature')
@require_phase('new_feature')
def new_feature():
    pass
```

### Key Methods
- `can_access(feature, user_id, tier)` - Check phase access
- `advance_phase(feature, approved_by)` - Move to next phase
- `rollback_phase(feature, reason)` - Move to previous phase
- `get_phase_status(feature)` - Current phase info
- `record_usage(feature, user_id, success)` - Track metrics

---

## 6. GAME_THEORY_DECISION_TREE.py

### Purpose
Predicts bottlenecks at each scale level. Provides recommendations.

### Known Bottlenecks

| Bottleneck | Breaks At | Priority |
|------------|-----------|----------|
| `railway_compute` | 1,000 users | CRITICAL |
| `supabase_connections` | 60 concurrent | CRITICAL |
| `ollama_local` | 10 concurrent | HIGH |
| `deepseek_api` | 1,000 req/min | HIGH |
| `cyclotron_sqlite` | 100 concurrent | CRITICAL |
| `human_support` | 50 active | HIGH |
| `discord_rate` | 50 msg/sec | MEDIUM |
| `email_gateway` | 100/hour | LOW |

### Scale Scenarios

| Users | Status | Key Bottlenecks |
|-------|--------|-----------------|
| 10 | Green | None |
| 100 | Yellow | Ollama, Supabase |
| 1,000 | Orange | Railway, Cyclotron |
| 10,000 | Red | All + Human Support |
| 100,000 | Critical | Enterprise needed |

### Usage

```python
from GAME_THEORY_DECISION_TREE import ScaleDecisionTree

tree = ScaleDecisionTree()

# Analyze current state
analysis = tree.analyze_current_state(
    current_users=500,
    concurrent_requests=25,
    error_rate=0.02
)
print(f"Status: {analysis['status']}")
print(f"Bottlenecks: {analysis['bottlenecks']}")

# Get recommendations
recs = tree.get_recommendations(current_users=500, target_users=5000)
for rec in recs['prioritized_actions']:
    print(f"{rec['priority']}: {rec['action']}")

# Simulate growth
sim = tree.simulate_growth(
    current_users=500,
    target_users=5000,
    growth_rate='exponential',
    days=30
)
for event in sim['events']:
    print(f"Day {event['day']}: {event['bottleneck']} breaks")

# Cost projection
costs = tree.get_cost_projection(target_users=10000)
print(f"Monthly: ${costs['monthly_total']}")
```

### Key Methods
- `analyze_current_state(...)` - Current bottleneck analysis
- `get_recommendations(current, target)` - Prioritized actions
- `simulate_growth(...)` - Growth timeline with predictions
- `get_cost_projection(target)` - Monthly cost estimates
- `get_decision_tree()` - Full decision tree structure

---

## 7. ADMIN_CONTROL_PANEL.py

### Purpose
Unified integration layer. Single API for all control systems.

### Unified Check

```python
from ADMIN_CONTROL_PANEL import check_request_allowed, controlled_endpoint

# Single function checks everything
allowed, info = check_request_allowed(
    user_id='user123',
    tier='BUILDER',
    feature='araya_chat',
    action_type='query',
    message_length=500
)

if not allowed:
    return {'error': info['blocker'], 'message': info['message']}
```

### Flask Integration

```python
from ADMIN_CONTROL_PANEL import admin_bp, controlled_endpoint

# Register blueprint
app.register_blueprint(admin_bp, url_prefix='/admin')

# Protect any endpoint
@app.route('/chat', methods=['POST'])
@controlled_endpoint(feature='araya_chat', action='query')
def chat():
    # All controls already checked
    pass
```

### Admin Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/status` | GET | Full system status |
| `/admin/kill/<switch>` | POST | Activate kill switch |
| `/admin/restore/<switch>` | POST | Restore kill switch |
| `/admin/circuit/<name>/status` | GET | Circuit breaker status |
| `/admin/circuit/<name>/reset` | POST | Reset circuit breaker |
| `/admin/feature/<flag>` | GET | Feature flag status |
| `/admin/feature/<flag>` | POST | Update feature flag |
| `/admin/phase/<feature>` | GET | Phase status |
| `/admin/phase/<feature>/advance` | POST | Advance phase |
| `/admin/scale/analysis` | GET | Scale analysis |
| `/admin/scale/simulate` | POST | Growth simulation |

---

## 8. GROWTH_DASHBOARD.html

### Purpose
Visual monitoring of all systems. Real-time status.

### Panels
1. **System Health** - Overall status indicator
2. **Rate Limiter** - Current request rates
3. **Feature Flags** - Flag status and percentages
4. **Circuit Breakers** - Breaker states (closed/open/half-open)
5. **Kill Switches** - Active kills
6. **Phase Status** - Current rollout phases
7. **Scale Analysis** - Bottleneck predictions
8. **User Growth** - Growth trajectory

### Access
```
https://consciousnessrevolution.io/GROWTH_DASHBOARD.html
```
Or local: `100X_DEPLOYMENT/GROWTH_DASHBOARD.html`

---

## INTEGRATION WITH ARAYA_UNIFIED_API.py

### Step 1: Import Control Systems

Add to top of ARAYA_UNIFIED_API.py:

```python
# Growth control infrastructure
from ADMIN_CONTROL_PANEL import admin_bp, controlled_endpoint, check_request_allowed
from RATE_LIMITER import RateLimiter
from FEATURE_FLAGS import FeatureFlags
from CIRCUIT_BREAKER import get_breaker, circuit_protect
from KILL_SWITCH import get_kill_switch, is_killed
from PHASED_ROLLOUT import get_phase_controller, require_phase
from GAME_THEORY_DECISION_TREE import ScaleDecisionTree
```

### Step 2: Register Admin Blueprint

```python
# After app = Flask(__name__)
app.register_blueprint(admin_bp, url_prefix='/admin')
```

### Step 3: Protect Endpoints

```python
# Before
@app.route('/chat', methods=['POST'])
def chat():
    pass

# After
@app.route('/chat', methods=['POST'])
@controlled_endpoint(feature='araya_chat', action='query')
@circuit_protect('araya_api')
def chat():
    pass
```

### Step 4: Add Health Check

```python
@app.route('/health', methods=['GET'])
def health():
    from ADMIN_CONTROL_PANEL import get_system_status
    return jsonify(get_system_status())
```

---

## DEPLOYMENT

### Railway Environment Variables

```bash
# Add to Railway dashboard
KILL_SWITCH_STORAGE=redis  # or 'file' for local
RATE_LIMIT_BACKEND=redis   # or 'memory' for local
FEATURE_FLAG_SOURCE=database  # or 'file' for local
ADMIN_SECRET=<generate-strong-secret>
```

### Deploy Command

```bash
cd 100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

### Verify Deployment

```bash
curl https://consciousnessrevolution.io/admin/status
curl https://consciousnessrevolution.io/health
```

---

## EMERGENCY PROCEDURES

### 1. Site Overloaded

```python
from KILL_SWITCH import get_kill_switch
ks = get_kill_switch()
ks.kill('FREE_TIER', reason='Overload protection')
```

### 2. AI Service Down

```python
ks.kill('ALL_AI_QUERIES', reason='DeepSeek outage')
# Auto-restores in 30 minutes
```

### 3. Security Breach

```python
ks.emergency_shutdown(reason='Security breach detected')
# Manual restore required
```

### 4. Feature Bug

```python
from PHASED_ROLLOUT import get_phase_controller
controller = get_phase_controller()
controller.rollback_phase('broken_feature', reason='Critical bug')
```

### 5. Database Overload

```python
from CIRCUIT_BREAKER import get_breaker
breaker = get_breaker('cyclotron')
breaker.force_open(reason='Database overload')
```

---

## SCALE ROADMAP

### Phase 1: Alpha (Current - 10 users)
- [ ] Deploy all 8 components
- [ ] Test with beta testers
- [ ] Monitor dashboard

### Phase 2: Beta (100 users)
- [ ] Upgrade Railway plan
- [ ] Add connection pooling
- [ ] Enable caching

### Phase 3: Early Access (1,000 users)
- [ ] PostgreSQL migration
- [ ] Redis for rate limiting
- [ ] CDN for static assets

### Phase 4: Growth (10,000 users)
- [ ] Kubernetes deployment
- [ ] Multi-region
- [ ] Support team

### Phase 5: Scale (100,000 users)
- [ ] Enterprise infrastructure
- [ ] 24/7 operations
- [ ] Full automation

---

## MONITORING

### Key Metrics

| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate | > 2% | > 5% |
| Response time | > 3s | > 10s |
| Circuit open | Any | Multiple |
| Kill active | LOW | HIGH/CRITICAL |
| Rate limited | > 10% | > 30% |

### Alerts

Set up in Railway/monitoring:
- Circuit breaker opens
- Kill switch activated
- Error rate spike
- Response time degradation

---

## QUICK REFERENCE

### Check Everything

```python
from ADMIN_CONTROL_PANEL import get_system_status
status = get_system_status()
print(json.dumps(status, indent=2))
```

### Kill Everything

```python
from KILL_SWITCH import get_kill_switch
get_kill_switch().emergency_shutdown('Emergency')
```

### Restore Everything

```python
from KILL_SWITCH import get_kill_switch
ks = get_kill_switch()
for switch in ks.get_killed():
    ks.restore(switch, by='ADMIN')
```

### Get Scale Recommendations

```python
from GAME_THEORY_DECISION_TREE import ScaleDecisionTree
recs = ScaleDecisionTree().get_recommendations(current_users=500, target_users=5000)
```

---

## THE PATTERN

**3 -> 7 -> 13 -> infinity**

- **3** layers of protection (rate limit, feature flag, circuit breaker)
- **7** domains protected
- **13** phases of growth
- **infinity** scale potential with proper controls

**C1 x C2 x C3 = CONTROLLED EXPLOSION**

---

*Infrastructure built by C1 Mechanic - January 2026*
*Pattern Theory alignment: 92.2%*
