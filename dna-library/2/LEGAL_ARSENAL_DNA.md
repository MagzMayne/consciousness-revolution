# LEGAL ARSENAL DNA

## WHAT IS IT
Tools for self-representation (pro se) litigants. Part of the PROTECT domain (Domain 4). Detect manipulation patterns in contracts and emails, organize evidence, build timelines, and prepare court documents. Features AI-powered legal analysis, template generation, attorney referral network, and XP gamification. Codename: "The Fortress."

## STATUS
- Working: **BETA** (core tools work, AI analysis placeholder, evidence vault not implemented)
- Last tested: 2026-03-06
- Current issues: AI analysis not connected to Claude API, evidence storage not implemented, export to PDF not available

## LOCATION
**Primary directory:**
- `~/.legal_arsenal/` - Python backend files (7 files)

**Python Backend:**
- `~/.legal_arsenal/LEGAL_ARSENAL_API.py` - Flask API server (327 lines, port 7777)
- `~/.legal_arsenal/LEGAL_AI_ANALYZER.py` - AI-powered case analysis (420 lines)
- `~/.legal_arsenal/LEGAL_TEMPLATE_LIBRARY.py` - Template generation (15+ templates)
- `~/.legal_arsenal/ATTORNEY_REFERRAL_SYSTEM.py` - Attorney matching
- `~/.legal_arsenal/CONSULTATION_BOOKING_SYSTEM.py` - Booking integration
- `~/.legal_arsenal/CREATE_STRIPE_PAYMENT_LINKS.py` - Payment links
- `~/.legal_arsenal/REVENUE_TRACKER.py` - Revenue tracking

**Templates:**
- `~/.legal_arsenal/templates/` - 10 legal document templates

**HTML Interfaces:**
- `~/100X_DEPLOYMENT/HELP_LEGAL_v1.html` - Help documentation
- `~/100X_DEPLOYMENT/LANDING_LEGAL_ARSENAL.html` - Landing page
- `~/100X_DEPLOYMENT/PITCH_DECK_LEGAL_ARSENAL.html` - Pitch deck

**Dependencies:**
- Flask + Flask-CORS (API server)
- Python 3.10+
- Supabase (evidence vault - planned)
- Claude API (AI analysis - planned)

## HOW IT WORKS

```
                         +------------------+
                         |  LEGAL ARSENAL   |
                         |  "The Fortress"  |
                         +--------+---------+
                                  |
         +------------------------+------------------------+
         |                        |                        |
+--------v--------+    +----------v----------+    +--------v--------+
| Contract        |    | Email Pattern       |    | Timeline        |
| Analyzer        |    | Analyzer            |    | Builder         |
| (Detect traps)  |    | (DARVO, gaslighting)|    | (Visual events) |
+-----------------+    +---------------------+    +-----------------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                         +--------v--------+
                         | Legal Cockpit   |
                         | (Case Command)  |
                         +-----------------+
```

### Core Logic:
1. User uploads contract/email or describes case
2. AI Analyzer detects manipulation patterns (DARVO, gaslighting, unfair clauses)
3. Template Library generates appropriate legal documents
4. Timeline Builder organizes evidence chronologically
5. Attorney Referral matches with relevant lawyers
6. All actions earn XP (gamification)

## KEY FILES BREAKDOWN

### LEGAL_AI_ANALYZER.py (420 lines)
- **Purpose:** Claude-powered case analysis
- **Features:**
  - Case strength assessment (Weak/Moderate/Strong/Excellent)
  - Legal theory identification
  - Evidence checklist generation
  - Battle plan creation
  - Destroyer tactics prediction
  - Cost-benefit analysis
- **Status:** Placeholder analysis (Claude API not connected)

### LEGAL_ARSENAL_API.py (327 lines)
- **Purpose:** Flask REST API backend
- **Port:** 7777
- **Endpoints:**
  - `GET /health` - Health check
  - `POST /api/generate/demand-letter` - Generate demand letter
  - `POST /api/generate/criminal-complaint` - Generate criminal complaint
  - `POST /api/referral/create` - Create attorney referral
  - `GET /api/attorneys/list` - List attorney network
  - `POST /api/analyze/case` - AI legal analysis

### LEGAL_TEMPLATE_LIBRARY.py
- **Purpose:** Generate legal documents from templates
- **Templates (10):**
  1. Corporate extortion demand
  2. Breach of contract demand
  3. Landlord/tenant demand
  4. Insurance bad faith demand
  5. FBI complaint (extortion)
  6. Local DA complaint
  7. Small claims complaint
  8. Cease & desist (harassment)
  9. Cease & desist (IP)
  10. Builder services agreement

### Evidence Templates (in ~/.legal_arsenal/templates/)
- Pre-written legal document formats
- Fill-in-the-blank structure
- Deadline calculation built-in

## DEPENDENCIES

**Required:**
- Python 3.10+
- Flask, Flask-CORS

**Optional:**
- Claude API (for AI analysis - not yet connected)
- Supabase (for evidence vault - not yet implemented)
- Stripe (for payments - not yet implemented)

## HOW TO RUN

**Start API Server:**
```bash
cd ~/.legal_arsenal
python LEGAL_ARSENAL_API.py
# Runs on http://localhost:7777
```

**Run AI Analysis (standalone):**
```bash
python LEGAL_AI_ANALYZER.py
# Analyzes test case, generates battle plan
```

**Web Access:**
```bash
# Help documentation
https://conciousnessrevolution.io/HELP_LEGAL_v1.html

# Landing page
https://conciousnessrevolution.io/LANDING_LEGAL_ARSENAL.html
```

## HOW TO BUILD

**No build required** - Python scripts + HTML interfaces.

## HOW TO DEPLOY

```bash
# Backend: Run on server with Python
python LEGAL_ARSENAL_API.py

# Frontend: Deploy with Netlify
cd ~/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

## CRITICAL KNOWLEDGE

### Manipulation Patterns Detected:

| Pattern | Description |
|---------|-------------|
| DARVO | Deny, Attack, Reverse Victim and Offender |
| Gaslighting | Making someone question their reality |
| Unfair clauses | One-sided contract terms, hidden fees |
| Blame-shifting | Redirecting responsibility |
| Timeline gaps | Missing events, altered records |

### Case Analysis Output:

| Field | Description |
|-------|-------------|
| Case Strength | Weak/Moderate/Strong/Excellent |
| Legal Theories | Applicable laws and claims |
| Evidence Needed | Documentation checklist |
| Success Probability | 0-100% |
| Destroyer Tactics | Expected counter-moves |
| Builder Advantages | Leverage points |
| Battle Plan | Phase-by-phase action guide |

### XP Rewards:

| Action | XP Reward |
|--------|-----------|
| Analyze contract | +15 XP |
| Analyze email patterns | +15 XP |
| Create timeline | +20 XP |
| Complete quest | +50-75 XP |
| Unlock achievement | Badge + bonus |

### Important Quirks:
- Part of PROTECT domain (Domain 4)
- "Builder vs Destroyer" framework for legal analysis
- Pro se (self-representation) focused
- Criminal exposure threats are leverage for settlement
- Documents designed for court presentation

### Known Issues:
- AI analysis shows placeholder results (not connected to Claude)
- Evidence Vault not implemented (no Supabase storage)
- PDF export not implemented
- Timeline Builder UI not complete

## CONFIGURATION

**API Server (LEGAL_ARSENAL_API.py):**
```python
app.run(host='0.0.0.0', port=7777, debug=False)
```

**AI Analyzer Environment:**
```bash
# Required for real AI analysis (not yet implemented)
ANTHROPIC_API_KEY=...
```

**Analysis Output Directory:**
```
C:/.legal_arsenal/analyses/
C:/.legal_arsenal/generated/
```

## API REFERENCE

**POST /api/generate/demand-letter**
```json
{
  "type": "corporate_extortion",
  "name": "John Builder",
  "company": "Evil Corp",
  "amount": "5000",
  "facts": "Description of what happened"
}
// Response: { "success": true, "letter": "...", "filename": "..." }
```

**POST /api/analyze/case**
```json
{
  "case_description": "U-Haul kept my property...",
  "case_type": "Consumer Protection / Extortion",
  "amount_disputed": "2760",
  "state": "Montana"
}
// Response: analysis object with strength, theories, next steps
```

**GET /api/attorneys/list?state=Montana&practice_area=Consumer**
```json
{
  "success": true,
  "count": 3,
  "attorneys": [...]
}
```

## EXAMPLES

### Example 1: Generate Demand Letter
```bash
curl -X POST http://localhost:7777/api/generate/demand-letter \
  -H "Content-Type: application/json" \
  -d '{"type": "corporate_extortion", "name": "John", "company": "U-Haul", "amount": "2760", "facts": "They kept my stuff"}'
```

### Example 2: Run AI Case Analysis
```python
from LEGAL_AI_ANALYZER import LegalAIAnalyzer

analyzer = LegalAIAnalyzer()
analysis = analyzer.analyze_case(
    case_description="Company extorted me",
    case_type="Extortion",
    amount_disputed="5000",
    state="Montana"
)
battle_plan = analyzer.generate_battle_plan(analysis)
print(battle_plan)
```

### Example 3: Create Attorney Referral
```bash
curl -X POST http://localhost:7777/api/referral/create \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "case_type": "Extortion", "case_description": "...", "state": "Montana"}'
```

## TESTING

**How to test:**
```bash
# Test API health
curl http://localhost:7777/health

# Test demand letter generation
curl -X POST http://localhost:7777/api/generate/demand-letter \
  -d '{"type":"corporate_extortion","name":"Test","company":"Test Corp","amount":"1000","facts":"Test facts"}'

# Test AI analyzer
python LEGAL_AI_ANALYZER.py
# Outputs battle plan to C:/.legal_arsenal/analyses/

# Test web interfaces
# Visit https://conciousnessrevolution.io/HELP_LEGAL_v1.html
```

## TROUBLESHOOTING

**Problem:** "API not responding"
**Solution:** Start API with `python LEGAL_ARSENAL_API.py`, check port 7777 not in use

**Problem:** "Analysis returns placeholder"
**Solution:** Expected - Claude API not connected yet

**Problem:** "Template generation fails"
**Solution:** Check LEGAL_TEMPLATE_LIBRARY.py imported, verify template type exists

**Problem:** "Attorney referral returns empty"
**Solution:** Attorney network is sample data - needs real attorneys added

## NEXT STEPS

**Priority actions:**
1. Connect AI Analyzer to Claude API for real analysis
2. Implement Evidence Vault with Supabase Storage
3. Add PDF export for documents
4. Complete Timeline Builder UI
5. Build Contract Analyzer wizard
6. Add email pattern detection

**Known gaps:**
- No real AI analysis (placeholder only)
- No evidence storage/timestamping
- No PDF generation
- Attorney network is sample data

## LEGAL DISCLAIMER

Tools generate templates and analysis for educational purposes. Not legal advice. Consult an attorney for specific legal matters. User responsible for accuracy of generated documents.

## TAGS
#product #legal #protect #pro-se #litigation #templates #ai-analysis #contracts #evidence

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2025
- **Last Updated:** 2026-03-06
- **Version:** 0.9 (Beta)
- **Python Files:** 7
- **Templates:** 10
- **Status:** Beta

## RELATED DNAS
- [ARAYA_DNA.md] - AI assistance (powers legal analysis)
- [SUPABASE_DNA.md] - Evidence vault storage (future)
- [NETLIFY_DEPLOY_DNA.md] - Web interface hosting
- [XP_SYSTEM_DNA.md] - Gamification (future)
