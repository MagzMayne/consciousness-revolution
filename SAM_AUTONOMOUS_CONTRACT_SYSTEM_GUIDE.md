# SAM.html Autonomous Contract System - Complete Guide

## 🎯 Purpose

**Mission**: Generate core income for the team through peaceful government contracts that help all people and contribute to the betterment of mankind.

This system enables autonomous discovery and application for government contracts through AI agents that work 24/7 to find opportunities, generate proposals, and streamline the application process.

---

## 🚀 Quick Start

### 1. Get SAM.gov API Key

1. Visit [https://open.gsa.gov/api/sam-entity-api/](https://open.gsa.gov/api/sam-entity-api/)
2. Register for a free API key
3. Save your API key securely

### 2. Open SAM.html

```
https://barbrickdesign.github.io/sam.html
```

### 3. Set Up Your Profile

1. **Enter API Key**: Paste your SAM.gov API key and click "Verify key & load NAICS"
2. **Select Profile Type**: Choose your organization type (Individual, Business, Nonprofit, Contractor, Consultant)
3. **Answer Questionnaire**: Complete the adaptive questionnaire about your capabilities
4. **Run Inference**: Click "Run NAICS inference now" to identify matching codes

### 4. Start AI Agents

1. **Start Agent**: Click "🚀 Start Agent" in the AI Contract Discovery section
2. **Review Opportunities**: Browse discovered contract opportunities
3. **Generate Proposals**: Click "📝 Generate Proposal" on any opportunity
4. **Track Progress**: Monitor agent metrics at the bottom

---

## 🤖 AI Agent System

### Contract Seeker Agent

**Purpose**: Autonomous discovery of government contract opportunities

**Capabilities**:
- Searches SAM.gov for active opportunities
- Analyzes FPDS historical contracts
- Filters for peaceful applications only
- Scores opportunities by match quality
- Tracks deadlines and urgency
- Learns from past successes

**Configuration**:
```javascript
contractSeekerAgent = new ContractSeekerAgent({
    enabled: true,
    checkInterval: 3600000, // 1 hour
    peacefulOnly: true, // Only peaceful contracts
    apiKey: 'your-api-key'
});
```

**Peaceful Filtering**:
- ❌ Excludes: weapons, missiles, warfare, combat, surveillance
- ✅ Includes: education, health, infrastructure, environment, research

### Proposal Generator Agent

**Purpose**: Automated proposal writing for government contracts

**Capabilities**:
- Extracts requirements from RFPs
- Generates 6 proposal sections:
  1. Executive Summary
  2. Technical Approach
  3. Management Plan
  4. Past Performance
  5. Cost Proposal
  6. Compliance Matrix
- Quality scoring (0-100)
- Customizable templates
- Learning from successful proposals

**Generated Proposal Structure**:
```
Executive Summary
├── Opening statement
├── Understanding of requirements
├── Company qualifications
└── Value proposition

Technical Approach
├── Overview
├── Methodology (6 phases)
└── Project phases with deliverables

Management Plan
├── Management approach
├── Team structure
└── Communication plan

Past Performance
├── Representative projects
└── Outcomes and metrics

Cost Proposal
├── Labor costs
├── Materials and equipment
├── Travel and ODCs
└── Overhead and profit

Compliance Matrix
├── Requirements mapping
└── Compliance status
```

---

## 📊 Features

### 1. NAICS Classification

- **600+ NAICS codes** loaded from SAM.gov
- **Adaptive questionnaire** based on profile type
- **Keyword extraction** with stopword filtering
- **Profile-weighted scoring** (individual/business/nonprofit/contractor)
- **Real-time ranking** with confidence percentages

### 2. Contract Discovery

- **SAM.gov integration** - Active opportunities
- **FPDS integration** - Historical contracts
- **Multi-criteria search** - NAICS codes + keywords
- **Duplicate removal** - Unique opportunities only
- **Deadline tracking** - Days until deadline

### 3. Opportunity Scoring

Opportunities scored 0-100 based on:
- **NAICS match** (40 points) - Direct code match
- **Deadline urgency** (30 points) - 2-4 weeks optimal
- **Contract value** (20 points) - $100K-$1M sweet spot
- **Set-aside type** (10 points) - Small business preference

Priority levels:
- 🔴 **High**: Score ≥ 80
- 🟡 **Medium**: Score 60-79
- ⚪ **Low**: Score < 60

### 4. Knowledge Base

Agent learns from:
- Successful NAICS codes
- Winning keywords
- Preferred agencies
- Past performance data

Stored locally in browser (localStorage) for continuous improvement.

---

## 🛠️ Technical Architecture

### Files Structure

```
/sam.html                                  # Main UI
/src/agents/contract-seeker-agent.js      # Contract discovery
/src/agents/proposal-generator-agent.js   # Proposal generation
/src/utils/samgov-integration.js          # SAM.gov API wrapper
/src/utils/fpds-contract-schema.js        # FPDS parser
```

### Data Flow

```
User Profile → NAICS Classification → Top Codes
                                          ↓
                              Contract Seeker Agent
                                          ↓
                     SAM.gov + FPDS Search → Opportunities
                                          ↓
                              Filter (Peaceful Only)
                                          ↓
                              Score & Rank (0-100)
                                          ↓
                              Display Opportunities
                                          ↓
                     User Selects → Proposal Generator
                                          ↓
                              Generate 6 Sections
                                          ↓
                              Quality Score (0-100)
                                          ↓
                              Review & Submit
```

### API Integrations

**SAM.gov API**:
- Endpoint: `https://api.sam.gov/prod/opportunities/v2/search`
- Authentication: API key (query parameter or header)
- Rate limit: 1000 requests/day (free tier)

**FPDS API**:
- Endpoint: `https://www.fpds.gov/ezsearch/FEEDS/ATOM`
- Alternative: `https://api.usaspending.gov/api/v2/search/spending_by_award/`
- Authentication: None required (public data)
- Historical contracts from 2000-present

---

## 🎓 Usage Scenarios

### Scenario 1: Small Business IT Contractor

**Profile**: Federal Contractor, IT Services

**Answers**:
- Services: Cloud infrastructure, cybersecurity, DevOps
- Customers: Federal agencies, Department of Defense
- Tools: AWS, Azure, Kubernetes, Terraform

**Result**: 
- Top NAICS: 541512, 541513, 518210
- Found 23 opportunities
- 5 high priority matches
- Generated 3 proposals

### Scenario 2: Nonprofit Educational Organization

**Profile**: Nonprofit, Education

**Answers**:
- Services: STEM education, curriculum development, teacher training
- Customers: Schools, community centers, youth programs
- Certifications: 501(c)(3), State education licenses

**Result**:
- Top NAICS: 611710, 611430, 624110
- Found 15 opportunities
- 3 high priority matches
- Generated 2 proposals

### Scenario 3: Construction Contractor

**Profile**: Business Entity, Contractor

**Answers**:
- Services: Commercial construction, renovation, project management
- Work: New construction and repairs, commercial/industrial
- Certifications: Licensed general contractor, bonded and insured

**Result**:
- Top NAICS: 236220, 238220, 238990
- Found 31 opportunities
- 8 high priority matches
- Generated 5 proposals

---

## 📈 Metrics & Analytics

### Agent Metrics

Displayed at bottom of AI section:
- **Searches**: Total search operations
- **Opportunities**: Total opportunities discovered
- **High Priority**: High-scoring matches

### Health Status

Check agent health:
```javascript
const health = contractSeekerAgent.getHealth();
console.log(health);
// {
//   isActive: true,
//   metrics: { totalSearches: 12, opportunitiesFound: 45, ... },
//   opportunitiesCount: 45,
//   knowledgeBaseSize: 8,
//   status: 'healthy'
// }
```

### Quality Scoring

Proposal quality (0-100):
- 15 points: Executive Summary
- 25 points: Technical Approach
- 15 points: Management Plan
- 15 points: Past Performance
- 20 points: Cost Proposal
- 10 points: Compliance Matrix

---

## 🔐 Security & Privacy

### Data Storage

- **API Key**: Session storage only (not persisted)
- **Questionnaire answers**: Local browser state (not sent to server)
- **Knowledge base**: Local storage (stays on your device)
- **Proposals**: Generated in-browser (not stored automatically)

### API Key Security

```javascript
// GOOD: Session storage (cleared on browser close)
sessionStorage.setItem('samgov_api_key', apiKey);

// AVOID: Local storage (persists indefinitely)
// localStorage.setItem('samgov_api_key', apiKey);
```

### Peaceful-Only Filtering

Hard-coded exclusion list prevents harmful applications:
```javascript
const excludeKeywords = [
    'weapon', 'missile', 'bomb', 'warfare', 'combat',
    'surveillance', 'espionage', 'attack', 'destruction'
];
```

---

## 🚧 Limitations & Future Work

### Current Limitations

1. **No automatic submission** - Requires manual review and submission
2. **Basic proposal templates** - Could be more sophisticated
3. **No real-time monitoring** - Runs on demand, not continuously
4. **Limited learning** - Knowledge base is simple key-value store

### Roadmap

**Phase 2** (Next 2-4 weeks):
- [ ] Application Submission Agent
- [ ] Integration with zMerlinHive orchestration
- [ ] Enhanced knowledge base with AI learning

**Phase 3** (4-6 weeks):
- [ ] Daily monitoring service
- [ ] Email notifications for matches
- [ ] Approval workflow system
- [ ] Contract tracking dashboard

**Phase 4** (2-3 months):
- [ ] Win rate analytics
- [ ] Competitor analysis
- [ ] Revenue forecasting
- [ ] Full automation with human oversight

---

## 🆘 Troubleshooting

### Issue: "Agents not initialized"

**Solution**: 
1. Verify API key is entered correctly
2. Click "Verify key & load NAICS"
3. Wait for NAICS data to load
4. Check browser console for errors

### Issue: "No opportunities found"

**Solution**:
1. Run NAICS inference first
2. Ensure you have answered questionnaire
3. Try broadening your answers (more keywords)
4. Check SAM.gov API status

### Issue: "Proposal generation failed"

**Solution**:
1. Ensure opportunity has required fields (title, description)
2. Check browser console for errors
3. Try generating for different opportunity
4. Refresh page and retry

### Issue: "SAM.gov Integration not loaded"

**Solution**:
1. Check internet connection
2. Verify `/src/utils/samgov-integration.js` exists
3. Check browser console for 404 errors
4. Try hard refresh (Ctrl+Shift+R)

---

## 💡 Best Practices

### 1. Complete Profile Thoroughly

- Answer all questionnaire questions
- Use specific keywords (not vague descriptions)
- Include certifications and capabilities
- Mention tools and technologies

### 2. Review Before Applying

- Read full opportunity description
- Verify your qualifications match
- Check deadline (allow time for preparation)
- Assess contract value vs. capabilities

### 3. Customize Generated Proposals

- Edit executive summary for specific opportunity
- Add recent projects to past performance
- Adjust cost proposal to actual estimates
- Include specific compliance details

### 4. Track Your Success

- Note which NAICS codes work best
- Record winning keywords
- Document successful proposal elements
- Build knowledge base over time

---

## 📞 Support & Contact

**Creator**: Ryan Barbrick  
**Email**: BarbrickDesign@gmail.com  
**Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io

**Issues**: [Report bugs on GitHub](https://github.com/barbrickdesign/barbrickdesign.github.io/issues)  
**Documentation**: [Full docs in repository](https://github.com/barbrickdesign/barbrickdesign.github.io)

---

## 📄 License & Terms

This system is part of Barbrick Design's open-source repository. Use responsibly and ethically.

**Key Principles**:
- 🕊️ **Peaceful applications only** - No weapons, warfare, or harmful uses
- 🤝 **Help all people** - Focus on beneficial government services
- 🌍 **Betterment of mankind** - Contribute to positive societal outcomes
- 💰 **Fair revenue sharing** - 10-20% for contributors to successful grants

---

## 🎉 Success Stories

*Coming soon: Real examples of contracts discovered and won using this system*

**Target**: First contract win within 90 days of deployment

---

**Last Updated**: February 10, 2026  
**Version**: 1.0.0  
**Status**: ✅ Phase 1 Complete - Fully Functional
