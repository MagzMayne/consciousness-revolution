# Document Processor API

## Overview
Universal document upload and analysis API for all Seven Domains tools. Provides secure file upload, text extraction, and AI-powered pattern analysis.

## Features
- **Multi-format Support**: PDF, DOC, DOCX, TXT, RTF, EML, MSG, CSV, XLSX
- **Security**: File validation, size limits (50MB), sanitization
- **Pattern Analysis**: Domain-specific analysis for legal, business, communication patterns
- **Manipulation Detection**: Identifies gaslighting, pressure tactics, red flags
- **Organized Storage**: Files stored by domain and tool
- **Metadata Tracking**: Full audit trail of uploads and analysis

## Installation

### 1. Install Dependencies
```bash
pip install -r requirements-document-processor.txt
```

### 2. Start the Server
```bash
# Windows
START_DOCUMENT_PROCESSOR.bat

# Linux/Mac
python DOCUMENT_PROCESSOR.py
```

The API will be available at `http://localhost:5555`

## API Endpoints

### Health Check
```http
GET /api/health
```
Returns service status and version.

### Upload Document
```http
POST /api/upload
Content-Type: multipart/form-data

Parameters:
- file: The file to upload (required)
- domain: Domain name (legal, business, communication, etc.)
- tool: Tool name (CONTRACT_ANALYZER, EMAIL_ANALYZER, etc.)
- analysis_type: Type of analysis (optional)
```

**Response:**
```json
{
  "success": true,
  "file_info": {
    "original_name": "contract.pdf",
    "saved_name": "20260212_abc123_contract.pdf",
    "size_kb": 245.6,
    "type": "pdf",
    "hash": "sha256hash...",
    "uploaded_at": "2026-02-12T10:30:00",
    "domain": "legal",
    "tool": "CONTRACT_ANALYZER"
  },
  "extracted_text": "Full text content...",
  "text_length": 5432,
  "analysis": {
    "word_count": 1234,
    "risk_score": 45,
    "risk_level": "medium",
    "patterns_detected": [...],
    "risk_indicators": [...],
    "recommendations": [...]
  }
}
```

### Analyze Text
```http
POST /api/analyze-text
Content-Type: application/json

{
  "text": "Text to analyze",
  "domain": "legal",
  "tool": "CONTRACT_ANALYZER"
}
```

### List Domains
```http
GET /api/domains
```
Returns supported domains and file types.

### List Uploaded Files
```http
GET /api/files/<domain>/<tool>
```
Lists all files uploaded for a specific domain/tool combination.

## Supported Domains

### 1. Legal Domain
**Tools**: CONTRACT_ANALYZER, EMAIL_ANALYZER, ARGUMENT_MAPPER, TIMELINE_PROJECTOR
**Detects**: 
- Legal red flags (non-negotiable terms, unlimited liability)
- Arbitration clauses
- IP assignment issues
- Termination clauses
- Data rights problems

### 2. Business Domain
**Tools**: NEGOTIATION_ANALYZER, SALES_PITCH_DETECTOR, FINANCIAL_DECISION_CHECKER
**Detects**:
- High-pressure sales tactics
- Limited time offers
- Unrealistic guarantees
- Risk-free claims
- Hidden costs

### 3. Communication Domain
**Tools**: MEETING_ANALYZER, CONVERSATION_ANALYZER, GASLIGHTING_DETECTOR
**Detects**:
- Manipulation patterns
- Gaslighting language
- Emotional manipulation
- Passive-aggressive behavior
- Stonewalling

### 4. Digital Domain
**Tools**: SYSTEM_HEALTH_MONITOR, ARCHITECTURE_SIMULATOR

### 5. Healthcare Domain
**Tools**: MEDICAL_RECORD_ANALYZER, TREATMENT_PLAN_ANALYZER

### 6. Showcase Domain
**Tools**: PATTERN_LIBRARY

### 7. Transparency Domain
**Tools**: SOURCE_VERIFIER, TRUTH_SIGNAL_FINDER

## File Storage Structure
```
uploads/
├── legal/
│   ├── CONTRACT_ANALYZER/
│   │   ├── 20260212_abc123_contract.pdf
│   │   └── 20260212_abc123_contract.pdf.meta.json
│   └── EMAIL_ANALYZER/
├── business/
│   └── NEGOTIATION_ANALYZER/
└── communication/
    └── MEETING_ANALYZER/
```

## Security Features
1. **File Validation**: Only allowed file types accepted
2. **Size Limits**: 50MB maximum file size
3. **Filename Sanitization**: Prevents directory traversal attacks
4. **Content Hashing**: SHA256 checksums for integrity
5. **Metadata Storage**: Full audit trail
6. **CORS Enabled**: For web integration

## Pattern Analysis

### Legal Red Flags
- Non-negotiable terms
- Unlimited liability
- Perpetual licenses
- Broad indemnification
- Waive all claims
- At sole discretion

### Manipulation Patterns
- "You always/never..."
- "If you really loved..."
- "After all I've done..."
- "You're too sensitive"
- "That never happened"
- "You're remembering wrong"

### Business Pressure Tactics
- Limited time offer
- Act now
- Guaranteed results
- Risk-free
- Once in a lifetime
- Exclusive opportunity

## Integration with Tools

Each enhanced tool now includes:
1. **Upload Button**: Choose file interface
2. **File Status Display**: Upload progress and confirmation
3. **Backend Integration**: Automatic API calls when available
4. **Client-side Fallback**: Works even if API is offline
5. **Seamless Experience**: Extracted text appears in textarea

### Example: CONTRACT_ANALYZER.html
```javascript
async function handleFileUpload(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('domain', 'legal');
    formData.append('tool', 'CONTRACT_ANALYZER');
    
    const response = await fetch('http://localhost:5555/api/upload', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    document.getElementById('contract').value = result.extracted_text;
}
```

## Troubleshooting

### "Backend not available" Error
- Ensure DOCUMENT_PROCESSOR.py is running
- Check port 5555 is not in use
- Verify firewall allows localhost connections
- Tools will fallback to client-side processing (TXT files only)

### Import Errors
```bash
# Install missing dependencies
pip install PyPDF2 python-docx pandas openpyxl
```

### File Upload Fails
- Check file size < 50MB
- Verify file extension is supported
- Ensure uploads/ directory has write permissions

## Future Enhancements
- [ ] OCR for scanned documents
- [ ] Audio transcription for meeting recordings
- [ ] Advanced NLP analysis with transformers
- [ ] Multi-language support
- [ ] Sentiment analysis
- [ ] Entity extraction (names, dates, amounts)
- [ ] Document comparison/diff
- [ ] Batch processing

## Support
For issues or questions:
- Check TOOLS_LIST.md for tool documentation
- Review SEVEN_DOMAINS_DASHBOARD_GUIDE.md
- File issue on GitHub

---
**Version**: 1.0.0  
**Author**: Commander  
**Domain**: Digital Infrastructure  
**Status**: LIVE
