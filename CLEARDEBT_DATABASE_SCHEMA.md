# ClearDebt Database Schema

Comprehensive database schema for the enterprise bankruptcy assistance system.

## Database Architecture

The ClearDebt system uses a JSON-based file storage system for MVP, designed to be easily migrated to a proper database (PostgreSQL, MongoDB, etc.) in production.

### Directory Structure

```
backend/data/cleardebt/
├── users/           # User profiles and authentication
├── debts/           # Debt records per user
├── assets/          # Asset inventory per user
├── documents/       # Document metadata and files
├── trustees/        # Trustee interaction logs
└── jurisdictions/   # Jurisdiction-specific rules
```

## Schema Definitions

### 1. Users Collection

**Path**: `backend/data/cleardebt/users/{userId}.json`

**Structure**:
```json
{
  "userId": "string (base64 encoded email)",
  "email": "string (required, unique)",
  "name": "string (required)",
  "googleId": "string (optional, from Google OAuth)",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp",
  "profile": {
    "address": "string",
    "city": "string",
    "state": "string (2-letter code)",
    "postal": "string",
    "householdSize": "number",
    "maritalStatus": "enum: single|married|separated|divorced"
  },
  "financialSnapshot": {
    "monthlyIncome": "number",
    "monthlyExpenses": "number",
    "employmentStatus": "string",
    "incomeNotes": "string"
  },
  "preferences": {
    "notifications": "boolean",
    "dataSharing": "boolean"
  }
}
```

**Indexes**:
- Primary: `userId`
- Unique: `email`
- Optional: `googleId`

**Purpose**: Store user account information, profile data, and authentication credentials.

---

### 2. Debts Collection

**Path**: `backend/data/cleardebt/debts/{userId}.json`

**Structure**: Array of debt objects
```json
[
  {
    "debtId": "string (timestamp_random)",
    "userId": "string (foreign key to users)",
    "creditor": "string (required)",
    "amount": "number (required)",
    "type": "enum: credit_card|medical|personal_loan|auto_loan|mortgage|tax|student_loan|other",
    "status": "enum: current|late|collections|judgment",
    "accountNumber": "string (optional)",
    "interestRate": "number (optional)",
    "monthlyPayment": "number (optional)",
    "originalAmount": "number (optional)",
    "openedDate": "ISO 8601 date (optional)",
    "lastPaymentDate": "ISO 8601 date (optional)",
    "notes": "string (optional)",
    "priority": "enum: low|normal|high|urgent",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp",
    "parsedFrom": {
      "source": "enum: manual|email|import",
      "emailId": "string (optional)",
      "confidence": "number (0-1)"
    }
  }
]
```

**Purpose**: Track all debts, their current status, and relationship to creditors.

**Business Rules**:
- `amount` must be non-negative
- `type` affects bankruptcy treatmentoptions
- `status` determines urgency and available actions
- Debts in `collections` or `judgment` status flagged for priority review

---

### 3. Assets Collection

**Path**: `backend/data/cleardebt/assets/{userId}.json`

**Structure**: Array of asset objects
```json
[
  {
    "assetId": "string (timestamp_random)",
    "userId": "string (foreign key to users)",
    "description": "string (required)",
    "value": "number (required)",
    "lien": "number (default 0)",
    "category": "enum: home|vehicle|cash|retirement|personal_property|business|other",
    "exemptionEligible": "boolean",
    "exemptionAmount": "number (optional)",
    "appraisedDate": "ISO 8601 date (optional)",
    "appraisalMethod": "string (optional)",
    "notes": "string (optional)",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp",
    "details": {
      "make": "string (for vehicles)",
      "model": "string (for vehicles)",
      "year": "number (for vehicles)",
      "address": "string (for real estate)",
      "accountType": "string (for financial accounts)"
    }
  }
]
```

**Computed Fields**:
- `equity = value - lien`
- `protectedEquity = min(equity, exemptionAmount)`
- `atRisk = max(0, equity - exemptionAmount)`

**Purpose**: Track all assets, their values, liens, and exemption eligibility.

**Business Rules**:
- `value` must be non-negative
- `lien` cannot exceed `value`
- `category` determines exemption rules
- Exemption amounts vary by jurisdiction

---

### 4. Documents Collection

**Path**: `backend/data/cleardebt/documents/{userId}.json` (metadata)
**Files**: `backend/data/cleardebt/documents/{documentId}.data` (binary data)

**Structure**: Array of document metadata objects
```json
[
  {
    "documentId": "string (timestamp_random)",
    "userId": "string (foreign key to users)",
    "fileName": "string (required)",
    "fileType": "string (MIME type)",
    "fileSize": "number (bytes)",
    "category": "enum: identity|income|debt|asset|court|correspondence|other",
    "description": "string (optional)",
    "tags": ["array of strings"],
    "uploadedAt": "ISO 8601 timestamp",
    "expiresAt": "ISO 8601 timestamp (optional)",
    "relatedTo": {
      "type": "enum: debt|asset|trustee",
      "id": "string (foreign key)"
    },
    "status": "enum: pending|verified|rejected",
    "verifiedBy": "string (optional)",
    "verifiedAt": "ISO 8601 timestamp (optional)"
  }
]
```

**Purpose**: Store document metadata and manage file uploads.

**Business Rules**:
- Files stored separately from metadata for efficiency
- Maximum file size: 50MB per file
- Supported types: PDF, JPG, PNG, DOC, DOCX
- Automatic virus scanning recommended for production
- Documents can be linked to debts, assets, or trustee interactions

---

### 5. Trustee Interactions Collection

**Path**: `backend/data/cleardebt/trustees/{userId}.json`

**Structure**: Array of interaction objects
```json
[
  {
    "interactionId": "string (timestamp_random)",
    "userId": "string (foreign key to users)",
    "trustee": "string (trustee name)",
    "type": "enum: meeting|phone_call|email|letter|hearing|filing",
    "subject": "string",
    "notes": "string",
    "outcome": "string (optional)",
    "followUpRequired": "boolean",
    "followUpDate": "ISO 8601 date (optional)",
    "attachments": ["array of documentIds"],
    "timestamp": "ISO 8601 timestamp",
    "status": "enum: scheduled|completed|cancelled|pending",
    "reminder": {
      "enabled": "boolean",
      "reminderDate": "ISO 8601 date"
    }
  }
]
```

**Purpose**: Track all interactions with bankruptcy trustees and court officials.

**Business Rules**:
- Interactions chronologically ordered
- Follow-up reminders can be set
- Documents can be attached to interactions
- Critical for maintaining timeline and compliance

---

### 6. Parsed Emails Collection

**Path**: `backend/data/cleardebt/emails/{userId}.json`

**Structure**: Array of parsed email objects
```json
[
  {
    "emailId": "string (timestamp_random)",
    "userId": "string (foreign key to users)",
    "sender": "string (email address)",
    "subject": "string",
    "receivedDate": "ISO 8601 timestamp",
    "rawContent": "string (optional, for reference)",
    "parsed": {
      "creditor": "string (extracted)",
      "amount": "number (extracted)",
      "dueDate": "ISO 8601 date (extracted)",
      "accountNumber": "string (extracted)",
      "type": "enum: payment_due|collection|settlement|legal|general",
      "priority": "enum: low|normal|high|urgent",
      "confidence": "number (0-1, parsing confidence)"
    },
    "suggestedActions": [
      {
        "action": "string",
        "reason": "string"
      }
    ],
    "linkedDebtId": "string (optional, if matched to existing debt)",
    "status": "enum: new|reviewed|actioned|archived",
    "processedAt": "ISO 8601 timestamp"
  }
]
```

**Purpose**: Store parsed creditor emails and extracted information.

**Business Rules**:
- Email parsing uses heuristics to extract key information
- Confidence score indicates reliability of extraction
- Suggested actions help users respond appropriately
- Can automatically create/update debt records

---

### 7. Generated Forms Collection

**Path**: `backend/data/cleardebt/forms/{userId}.json`

**Structure**: Array of form objects
```json
[
  {
    "formId": "string (timestamp_random)",
    "userId": "string (foreign key to users)",
    "formType": "enum: chapter7_petition|schedule_ab|schedule_c|schedule_def|schedule_i|schedule_j",
    "formName": "string (official form name)",
    "version": "string (form version)",
    "generatedAt": "ISO 8601 timestamp",
    "status": "enum: draft|pending_review|reviewed|filed",
    "dataSnapshot": {
      "userData": "object (user data at time of generation)",
      "debts": "array (debts at time of generation)",
      "assets": "array (assets at time of generation)"
    },
    "sections": [
      {
        "title": "string",
        "fields": "object (field name: value pairs)",
        "completed": "boolean"
      }
    ],
    "reviewNotes": "string (optional)",
    "filedDate": "ISO 8601 date (optional)",
    "caseNumber": "string (optional)"
  }
]
```

**Purpose**: Store generated bankruptcy forms with data snapshots.

**Business Rules**:
- Forms generated from current user data
- Data snapshot preserved for audit trail
- Forms can be regenerated if data changes
- Status tracking for filing process

---

### 8. Jurisdiction Rules Collection

**Path**: `backend/data/cleardebt/jurisdictions/{state}.json`

**Structure**: Jurisdiction rule object
```json
{
  "state": "string (2-letter code)",
  "name": "string (full state name)",
  "lastUpdated": "ISO 8601 timestamp",
  "version": "string",
  "rules": {
    "exemptions": {
      "homestead": {
        "amount": "number or 'unlimited'",
        "notes": "string"
      },
      "vehicle": {
        "amount": "number",
        "notes": "string"
      },
      "personalProperty": {
        "amount": "number",
        "categories": {
          "clothing": "number",
          "furniture": "number",
          "tools_of_trade": "number"
        }
      },
      "retirement": {
        "amount": "number or 'unlimited'",
        "types": ["401k", "IRA", "pension"]
      },
      "wildcard": {
        "amount": "number",
        "notes": "string"
      }
    },
    "filing": {
      "fees": {
        "chapter7": "number",
        "chapter13": "number"
      },
      "creditCounselingRequired": "boolean",
      "debtorEducationRequired": "boolean",
      "meansTesting": {
        "required": "boolean",
        "medianIncome": {
          "1": "number",
          "2": "number",
          "3": "number",
          "4": "number",
          "perAdditional": "number"
        }
      }
    },
    "timelines": {
      "creditCounselingDeadline": "string (e.g., '180 days before filing')",
      "meetingOfCreditors": "string (e.g., '20-40 days after filing')",
      "dischargeTimeline": "string (e.g., '60-90 days after filing')"
    },
    "courtInfo": {
      "bankruptcyCourt": "string (court name)",
      "address": "string",
      "phone": "string",
      "website": "string",
      "electronicFiling": "boolean"
    }
  },
  "sources": [
    {
      "title": "string (regulation title)",
      "url": "string",
      "effectiveDate": "ISO 8601 date"
    }
  ]
}
```

**Purpose**: Store jurisdiction-specific bankruptcy rules and exemptions.

**Business Rules**:
- Rules vary significantly by state
- Regular updates required (automated pipeline)
- Source citations for legal compliance
- Median income updated annually

---

### 9. Eligibility Evaluations Collection

**Path**: `backend/data/cleardebt/evaluations/{userId}.json`

**Structure**: Array of evaluation objects
```json
[
  {
    "evaluationId": "string (timestamp_random)",
    "userId": "string (foreign key to users)",
    "state": "string (jurisdiction)",
    "chapter": "enum: chapter7|chapter13",
    "evaluatedAt": "ISO 8601 timestamp",
    "dataSnapshot": {
      "totalDebt": "number",
      "totalAssets": "number",
      "totalEquity": "number",
      "monthlyIncome": "number",
      "monthlyExpenses": "number",
      "householdSize": "number"
    },
    "results": {
      "eligible": "boolean",
      "confidence": "number (0-1)",
      "warnings": ["array of strings"],
      "recommendations": ["array of strings"],
      "exemptionAnalysis": {
        "home": "object (exemption details)",
        "vehicle": "object (exemption details)",
        "other": "object (exemption details)"
      },
      "meansTestResult": {
        "passed": "boolean",
        "medianIncome": "number",
        "actualIncome": "number",
        "disposableIncome": "number"
      },
      "alternativeOptions": [
        {
          "option": "string (e.g., 'Debt consolidation')",
          "pros": ["array of strings"],
          "cons": ["array of strings"]
        }
      ]
    }
  }
]
```

**Purpose**: Store eligibility evaluations with recommendations.

**Business Rules**:
- Evaluations based on current data snapshot
- Multiple evaluations can be run over time
- Helps users understand options
- Not legal advice - educational only

---

## Data Relationships

```
User (1) ----< (many) Debts
User (1) ----< (many) Assets
User (1) ----< (many) Documents
User (1) ----< (many) TrusteeInteractions
User (1) ----< (many) ParsedEmails
User (1) ----< (many) GeneratedForms
User (1) ----< (many) EligibilityEvaluations

Debt (1) ----< (many) Documents [relatedTo]
Asset (1) ----< (many) Documents [relatedTo]
TrusteeInteraction (1) ----< (many) Documents [attachments]

ParsedEmail (1) ---- (0..1) Debt [linkedDebtId]

Jurisdiction (1) ---- (many) Users [state]
```

## Migration Path to Production Database

### PostgreSQL Schema (Future)

```sql
-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    profile JSONB,
    financial_snapshot JSONB,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debts table
CREATE TABLE debts (
    debt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    creditor VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    value DECIMAL(12, 2) NOT NULL,
    lien DECIMAL(12, 2) DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_path VARCHAR(500),
    category VARCHAR(50),
    metadata JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trustee interactions table
CREATE TABLE trustee_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    trustee VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    notes TEXT,
    outcome TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50)
);

-- Parsed emails table
CREATE TABLE parsed_emails (
    email_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    sender VARCHAR(255),
    subject VARCHAR(255),
    received_date TIMESTAMP WITH TIME ZONE,
    parsed_data JSONB,
    linked_debt_id UUID REFERENCES debts(debt_id),
    status VARCHAR(50),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated forms table
CREATE TABLE generated_forms (
    form_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    form_type VARCHAR(100) NOT NULL,
    form_name VARCHAR(255),
    version VARCHAR(50),
    data_snapshot JSONB,
    sections JSONB,
    status VARCHAR(50),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    filed_date DATE,
    case_number VARCHAR(100)
);

-- Jurisdiction rules table
CREATE TABLE jurisdiction_rules (
    state VARCHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rules JSONB NOT NULL,
    sources JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version VARCHAR(50)
);

-- Eligibility evaluations table
CREATE TABLE eligibility_evaluations (
    evaluation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    state VARCHAR(2) REFERENCES jurisdiction_rules(state),
    chapter VARCHAR(20),
    data_snapshot JSONB,
    results JSONB,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_trustee_interactions_user_id ON trustee_interactions(user_id);
CREATE INDEX idx_parsed_emails_user_id ON parsed_emails(user_id);
CREATE INDEX idx_generated_forms_user_id ON generated_forms(user_id);
CREATE INDEX idx_eligibility_evaluations_user_id ON eligibility_evaluations(user_id);

-- Full-text search indexes
CREATE INDEX idx_documents_search ON documents USING GIN(to_tsvector('english', file_name));
CREATE INDEX idx_parsed_emails_search ON parsed_emails USING GIN(to_tsvector('english', subject));
```

## Data Security & Privacy

### Encryption
- All personally identifiable information (PII) must be encrypted at rest
- Use AES-256 encryption for sensitive data
- Google OAuth handles authentication securely

### Access Control
- Users can only access their own data
- Admin access requires multi-factor authentication
- Audit logs for all data access

### Data Retention
- User data retained until account deletion
- Automatic deletion after 7 years (bankruptcy discharge period)
- Users can request immediate deletion (GDPR compliance)

### Backup & Recovery
- Daily automated backups
- 30-day retention period
- Encrypted backup storage
- Disaster recovery plan

## Performance Optimization

### Caching Strategy
- User session data cached in Redis
- Jurisdiction rules cached (updated weekly)
- Document thumbnails pre-generated

### Query Optimization
- Indexed foreign keys
- Materialized views for summary data
- Pagination for large datasets

### Scalability
- Horizontal scaling with database sharding by userId
- CDN for document delivery
- Queue system for email parsing and form generation

## Compliance & Auditing

### Audit Logging
```json
{
  "logId": "string",
  "userId": "string",
  "action": "enum: create|read|update|delete",
  "resource": "enum: debt|asset|document|etc",
  "resourceId": "string",
  "timestamp": "ISO 8601",
  "ipAddress": "string",
  "userAgent": "string",
  "changes": "object (before/after)"
}
```

### Legal Compliance
- GDPR compliant (data portability, right to deletion)
- CCPA compliant (California privacy)
- SOC 2 Type II certification recommended
- Regular security audits
- Legal disclaimer on all outputs

## API Rate Limiting

- Authenticated users: 1000 requests/hour
- Anonymous users: 100 requests/hour
- Bulk operations: 10 requests/minute
- Document uploads: 50MB total/hour

## Monitoring & Alerts

### Metrics to Track
- API response times
- Database query performance
- Error rates by endpoint
- User activity patterns
- Storage usage
- Document upload success rates

### Alerts
- Database connection failures
- API error rate > 5%
- Storage > 80% capacity
- Suspicious activity patterns
- Failed authentication attempts

---

**Last Updated**: 2026-02-13  
**Version**: 1.0.0  
**Author**: Barbrick Design  
**Contact**: BarbrickDesign@gmail.com
