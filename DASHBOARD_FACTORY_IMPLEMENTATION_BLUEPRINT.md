# DASHBOARD FACTORY - IMPLEMENTATION BLUEPRINT
## C2 Architect: Executable Roadmap
**Pattern:** 3 → 7 → 13 → ∞

---

## WHAT TO BUILD (3 Components)

### 1. Backend Factory API
**File:** `netlify/functions/dashboard-factory.mjs`
**Time:** 2 days

### 2. Template Library
**Files:** `templates/*.template.html` (3 templates)
**Time:** 1 day

### 3. DNA Validator
**File:** `js/dashboard-dna-validator.js`
**Time:** 1 day

**Total:** 4 days to MVP

---

## COMPONENT 1: BACKEND FACTORY API

### Endpoint Design

```javascript
// netlify/functions/dashboard-factory.mjs

import fs from 'fs';
import path from 'path';

const TEMPLATES = {
  'cockpit': 'templates/cockpit.template.html',
  '8-domain': 'templates/8-domain-set.template.html',
  'single-domain': 'templates/single-domain.template.html'
};

export const handler = async (event) => {
  const action = JSON.parse(event.body).action;

  switch(action) {
    case 'create':
      return createDashboard(JSON.parse(event.body));
    case 'validate':
      return validateDNA(JSON.parse(event.body));
    case 'list-templates':
      return listTemplates();
    default:
      return { statusCode: 400, body: 'Invalid action' };
  }
};

// CREATE DASHBOARD
async function createDashboard(params) {
  const { template, owner, realName, domain, features } = params;

  // 1. Load template
  const templatePath = TEMPLATES[template];
  let html = fs.readFileSync(templatePath, 'utf8');

  // 2. Generate DNA
  const dna = generateDNA({
    name: `${owner} - ${getDomainName(domain)}`,
    owner,
    realName,
    domain,
    features,
    created: new Date().toISOString().split('T')[0]
  });

  // 3. Inject DNA into template
  html = html.replace('{{DNA_BLOCK}}', JSON.stringify(dna, null, 2));

  // 4. Replace variables
  html = replacePlaceholders(html, {
    OWNER: owner,
    REAL_NAME: realName,
    DOMAIN_ID: domain,
    DOMAIN_NAME: getDomainName(domain),
    CREATED_DATE: dna.created
  });

  // 5. Generate filename
  const filename = `${owner.toUpperCase()}_DOMAIN_${domain}.html`;

  // 6. Save file
  fs.writeFileSync(`100X_DEPLOYMENT/${filename}`, html);

  // 7. Register in DASHBOARD_REGISTRY.json
  registerDashboard(filename, dna);

  // 8. Return result
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      filename,
      dna,
      url: `https://consciousnessrevolution.io/${filename}`
    })
  };
}

// GENERATE DNA OBJECT
function generateDNA(params) {
  return {
    name: params.name,
    version: "1.0.0",
    purpose: `${params.owner}'s ${params.domain} domain dashboard`,
    owner: params.owner,
    realName: params.realName || params.owner,
    domain: params.domain,
    sphere: getSphere(params.domain),
    created: params.created,
    updated: params.created,
    status: "LIVE",
    features: params.features || [],
    trinity: {
      c1_built: params.created,
      c2_reviewed: null,
      c3_validated: null
    },
    lfsme: {
      lighter: 8,
      faster: 8,
      stronger: 8,
      elegant: 8,
      less_expensive: 10,
      average: 8.4
    }
  };
}

// HELPER: Get sphere from domain
function getSphere(domain) {
  const spheres = {
    '1_COMMAND': 'COMMAND',
    '2_BUILD': 'BUILD',
    '3_CONNECT': 'CONNECT',
    '4_PROTECT': 'PROTECT',
    '5_GROW': 'GROW',
    '6_LEARN': 'LEARN',
    '7_TRANSCEND': 'TRANSCEND',
    '8_BLUEPRINT': 'BLUEPRINT'
  };
  return spheres[domain] || 'COMMAND';
}

// HELPER: Get domain name
function getDomainName(domain) {
  const names = {
    '1_COMMAND': 'Command Center',
    '2_BUILD': 'Build Workshop',
    '3_CONNECT': 'Connection Hub',
    '4_PROTECT': 'Defense Grid',
    '5_GROW': 'Growth Engine',
    '6_LEARN': 'Learning Lab',
    '7_TRANSCEND': 'Transcendence Portal',
    '8_BLUEPRINT': 'Blueprint Archive'
  };
  return names[domain] || 'Dashboard';
}

// REPLACE PLACEHOLDERS
function replacePlaceholders(html, vars) {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

// REGISTER IN DASHBOARD_REGISTRY.json
function registerDashboard(filename, dna) {
  const registryPath = '100X_DEPLOYMENT/DASHBOARD_REGISTRY.json';
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  // Add to multi-index
  if (!registry.multi_index.by_role[dna.owner.toLowerCase()]) {
    registry.multi_index.by_role[dna.owner.toLowerCase()] = [];
  }
  registry.multi_index.by_role[dna.owner.toLowerCase()].push(filename);

  if (!registry.multi_index.by_domain[dna.domain]) {
    registry.multi_index.by_domain[dna.domain] = [];
  }
  registry.multi_index.by_domain[dna.domain].push(filename);

  // Write back
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}
```

---

## COMPONENT 2: TEMPLATE LIBRARY

### Template: cockpit.template.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{OWNER}} Cockpit | {{DOMAIN_NAME}}</title>

<!-- DASHBOARD DNA -->
<script type="application/json" id="dashboard-dna">
{{DNA_BLOCK}}
</script>

<style>
:root {
  --bg: #0a0a0a;
  --surface: #111;
  --border: #222;
  --text: #fff;
  --text-dim: #888;
  --accent: #ffd700;
  --accent-dim: rgba(255, 215, 0, 0.1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding: 20px;
}

.header {
  text-align: center;
  padding: 30px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 2em;
  color: var(--accent);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.card h2 {
  color: var(--accent);
  margin-bottom: 15px;
}
</style>
</head>
<body>
  <div class="header">
    <h1>{{OWNER}} Cockpit</h1>
    <p>{{DOMAIN_NAME}}</p>
  </div>

  <div class="grid">
    <div class="card">
      <h2>Status</h2>
      <p>System online</p>
    </div>

    <div class="card">
      <h2>Quick Actions</h2>
      <p>Add your custom actions here</p>
    </div>

    <div class="card">
      <h2>Recent Activity</h2>
      <p>Activity feed coming soon</p>
    </div>
  </div>

  <script>
    // Load Dashboard DNA
    const dna = JSON.parse(document.getElementById('dashboard-dna').textContent);
    console.log('Dashboard DNA loaded:', dna.name);
  </script>
</body>
</html>
```

### Template: 8-domain-set.template.html

**Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Same header as cockpit -->
  <!-- 8-domain navigation added -->
</head>
<body>
  <nav class="domain-nav">
    <a href="{{OWNER}}_DOMAIN_1_COMMAND.html">1 COMMAND</a>
    <a href="{{OWNER}}_DOMAIN_2_BUILD.html">2 BUILD</a>
    <a href="{{OWNER}}_DOMAIN_3_CONNECT.html">3 CONNECT</a>
    <a href="{{OWNER}}_DOMAIN_4_PROTECT.html">4 PROTECT</a>
    <a href="{{OWNER}}_DOMAIN_5_GROW.html">5 GROW</a>
    <a href="{{OWNER}}_DOMAIN_6_LEARN.html">6 LEARN</a>
    <a href="{{OWNER}}_DOMAIN_7_TRANSCEND.html">7 TRANSCEND</a>
    <a href="{{OWNER}}_DOMAIN_8_BLUEPRINT.html">8 BLUEPRINT</a>
  </nav>

  <div class="content">
    <!-- Domain-specific content -->
  </div>

  <!-- ARAYA embed (optional) -->
  <div id="araya-container"></div>
</body>
</html>
```

### Template: single-domain.template.html

**Minimal single-purpose dashboard, no navigation**

---

## COMPONENT 3: DNA VALIDATOR

```javascript
// js/dashboard-dna-validator.js

const REQUIRED_FIELDS = [
  'name',
  'version',
  'purpose',
  'domain',
  'sphere',
  'created',
  'status'
];

const VALID_DOMAINS = [
  '1_COMMAND',
  '2_BUILD',
  '3_CONNECT',
  '4_PROTECT',
  '5_GROW',
  '6_LEARN',
  '7_TRANSCEND',
  '8_BLUEPRINT'
];

const VALID_SPHERES = [
  'COMMAND',
  'BUILD',
  'CONNECT',
  'PROTECT',
  'GROW',
  'LEARN',
  'TRANSCEND',
  'BLUEPRINT'
];

function validateDNA(dna) {
  const errors = [];
  const warnings = [];

  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!dna[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate domain
  if (dna.domain && !VALID_DOMAINS.includes(dna.domain)) {
    errors.push(`Invalid domain: ${dna.domain}. Must be one of: ${VALID_DOMAINS.join(', ')}`);
  }

  // Validate sphere
  if (dna.sphere && !VALID_SPHERES.includes(dna.sphere)) {
    errors.push(`Invalid sphere: ${dna.sphere}. Must be one of: ${VALID_SPHERES.join(', ')}`);
  }

  // Validate version format (semver)
  if (dna.version && !/^\d+\.\d+\.\d+$/.test(dna.version)) {
    errors.push(`Invalid version format: ${dna.version}. Must be semver (e.g., 1.0.0)`);
  }

  // Check trinity dates
  if (!dna.trinity?.c1_built) {
    errors.push('Missing trinity.c1_built date');
  }

  // Check LFSME score
  if (!dna.lfsme?.average) {
    errors.push('Missing lfsme.average score');
  } else if (dna.lfsme.average < 1 || dna.lfsme.average > 10) {
    errors.push(`Invalid lfsme.average: ${dna.lfsme.average}. Must be between 1-10`);
  }

  // Warnings for recommended fields
  if (!dna.owner) warnings.push('Recommended: Add owner field');
  if (!dna.changelog) warnings.push('Recommended: Add changelog array');
  if (!dna.connects_to) warnings.push('Recommended: Add connects_to array');

  // Calculate compliance score
  const requiredScore = (REQUIRED_FIELDS.length - errors.length) / REQUIRED_FIELDS.length;
  const recommendedFields = ['owner', 'realName', 'changelog', 'connects_to', 'identitySync'];
  const recommendedScore = recommendedFields.filter(f => dna[f]).length / recommendedFields.length;
  const trinityScore = [dna.trinity?.c1_built, dna.trinity?.c2_reviewed, dna.trinity?.c3_validated]
    .filter(Boolean).length / 3;

  const overallScore = (requiredScore * 0.5) + (recommendedScore * 0.3) + (trinityScore * 0.2);

  let tier = 'BRONZE';
  if (errors.length === 0 && warnings.length === 0 && trinityScore === 1) tier = 'GOLD';
  else if (errors.length === 0) tier = 'SILVER';

  return {
    valid: errors.length === 0,
    tier,
    errors,
    warnings,
    score: Math.round(overallScore * 100),
    requiredScore,
    recommendedScore,
    trinityScore
  };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateDNA };
}
if (typeof window !== 'undefined') {
  window.DNAValidator = { validateDNA };
}
```

---

## USAGE EXAMPLES

### Example 1: Create Josh's 8-Domain Set

```bash
curl -X POST https://consciousnessrevolution.io/.netlify/functions/dashboard-factory \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "template": "8-domain",
    "owner": "Josh",
    "realName": "Josh Smith",
    "domain": "1_COMMAND",
    "features": ["araya-embed", "8-domain-nav", "supabase"]
  }'

# Creates:
# - JOSH_DOMAIN_1_COMMAND.html
# - JOSH_DOMAIN_2_BUILD.html
# - JOSH_DOMAIN_3_CONNECT.html
# - ... (8 total files)
# - All auto-registered in DASHBOARD_REGISTRY.json
```

### Example 2: Validate Existing Dashboard

```javascript
// In browser console on any dashboard page
const dna = JSON.parse(document.getElementById('dashboard-dna').textContent);
const result = DNAValidator.validateDNA(dna);

console.log(`Tier: ${result.tier}`);
console.log(`Score: ${result.score}/100`);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

### Example 3: List Available Templates

```bash
curl https://consciousnessrevolution.io/.netlify/functions/dashboard-factory?action=list-templates

# Returns:
{
  "templates": [
    {"id": "cockpit", "name": "Personal Cockpit", "domains": 1},
    {"id": "8-domain", "name": "8-Domain Set", "domains": 8},
    {"id": "single-domain", "name": "Single Domain", "domains": 1}
  ]
}
```

---

## DEPLOYMENT CHECKLIST

### Phase 1: Foundation (Day 1-2)
- [ ] Create `netlify/functions/dashboard-factory.mjs`
- [ ] Create `templates/` directory
- [ ] Build `cockpit.template.html`
- [ ] Test `/create` endpoint locally

### Phase 2: Templates (Day 2-3)
- [ ] Build `8-domain-set.template.html`
- [ ] Build `single-domain.template.html`
- [ ] Add CSS variables per domain
- [ ] Test template variable substitution

### Phase 3: Validation (Day 3-4)
- [ ] Create `js/dashboard-dna-validator.js`
- [ ] Integrate with factory API
- [ ] Add `/validate` endpoint
- [ ] Test validation on existing dashboards

### Phase 4: Registry Integration (Day 4)
- [ ] Update `registerDashboard()` function
- [ ] Test multi-index updates
- [ ] Verify no duplicates
- [ ] Deploy to production

### Phase 5: Testing (Day 4)
- [ ] Create 3 test dashboards via API
- [ ] Verify DNA is correct
- [ ] Verify registry updates
- [ ] Verify files render correctly

---

## SUCCESS METRICS

**Week 1:**
- ✅ Factory API live with 3 endpoints
- ✅ 3 templates created
- ✅ DNA validator functional
- ✅ 5+ dashboards created via factory

**Week 2:**
- ✅ Zero manual DNA edits needed
- ✅ Registry auto-updates working
- ✅ Validation catches all missing fields
- ✅ Templates used for all new dashboards

**Month 1:**
- ✅ 50+ dashboards created via factory
- ✅ All dashboards SILVER tier or higher
- ✅ Factory documentation complete
- ✅ Team trained on factory usage

---

## NEXT ACTIONS

**For C1 (Build):**
1. Create `netlify/functions/dashboard-factory.mjs`
2. Copy COMMANDER_COCKPIT.html → `templates/cockpit.template.html`
3. Add `{{PLACEHOLDER}}` variables
4. Test locally

**For C2 (Review):**
1. Review template variable schema
2. Validate DNA field requirements
3. Approve template designs
4. Document API spec

**For C3 (Validate):**
1. Test factory-generated dashboards
2. Find edge cases
3. Report bugs
4. Approve for production

---

*Blueprint by C2 ARCHITECT | Pattern: 3 → 7 → 13 → ∞*
*Time to MVP: 4 days | Scale: 1-1000 dashboards*
*Trinity: C1 (Build) × C2 (Design) × C3 (Validate) = ∞*
