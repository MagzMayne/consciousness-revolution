# Seven Domains Testing & Verification Guide

## Quick Verification Checklist

### 🎯 Phase 1: Dashboard Core Functionality
- [ ] Open `SEVEN_DOMAINS_DASHBOARD.html` in browser
- [ ] Verify all 7 domain cards display correctly
- [ ] Check consciousness score displays at top
- [ ] Test "Analyze" button on any domain (scrolls to Quick Analysis)
- [ ] Test "View" button on any domain (navigates to domain page)
- [ ] Verify Quick Analysis tool at bottom works

### 📄 Phase 2: Document Upload (Backend Required)
Start backend: `python DOCUMENT_PROCESSOR.py` or `START_DOCUMENT_PROCESSOR.bat`

#### Test Contract Analyzer
1. Open `CONTRACT_ANALYZER.html`
2. Click "Choose File (PDF, DOC, TXT)"
3. Upload a test contract (create test.txt with sample contract text)
4. Verify file uploads successfully
5. Check extracted text appears in textarea
6. Click "Analyze Contract" button
7. Verify red flags are detected

#### Test Email Analyzer
1. Open `EMAIL_ANALYZER.html`
2. Click "Choose Email File (.eml, .msg, .txt)"
3. Upload a test email file
4. Verify upload status shows success
5. Check email content extracted
6. Analyze for manipulation patterns

#### Test Meeting Analyzer
1. Open `MEETING_ANALYZER.html`
2. Click "Upload Transcript"
3. Upload meeting notes (TXT/DOC)
4. Verify transcript loads
5. Analyze meeting dynamics

#### Test Conversation Analyzer
1. Open `CONVERSATION_ANALYZER.html`
2. Click "Upload Chat Log"
3. Upload conversation (TXT/JSON)
4. Verify chat loads correctly
5. Analyze for patterns

#### Test Gaslighting Detector
1. Open `GASLIGHTING_DETECTOR.html`
2. Click "Upload Context Document"
3. Upload conversation context
4. Verify extraction works
5. Analyze for gaslighting

#### Test Negotiation Analyzer
1. Open `NEGOTIATION_ANALYZER.html`
2. Click "Upload Document"
3. Upload negotiation transcript
4. Verify loading
5. Analyze tactics

#### Test Sales Pitch Detector
1. Open `SALES_PITCH_DETECTOR.html`
2. Click "Upload Sales Document"
3. Upload sales materials
4. Verify extraction
5. Detect pressure tactics

### 🔄 Phase 3: Client-Side Fallback (No Backend)
Stop backend server, then:

1. Open any analyzer tool
2. Try uploading a TXT file
3. Verify "Backend not available" message
4. Confirm text still loads (client-side)
5. Verify analysis still works

### 🌐 Phase 4: Domain Pages
Verify each domain page opens and links work:

#### Legal Domain
- [ ] `/seven-domains/legal/index.html` opens
- [ ] Links to Contract Analyzer work
- [ ] Links to Email Analyzer work
- [ ] Links to Argument Mapper work
- [ ] Links to Timeline Projector work

#### Business Domain
- [ ] `/seven-domains/business/index.html` opens
- [ ] Links to Negotiation Analyzer work
- [ ] Links to Sales Pitch Detector work
- [ ] Links to Financial Decision Checker work

#### Digital Domain
- [ ] `/seven-domains/digital/index.html` opens
- [ ] Links to technical tools work
- [ ] System monitoring tools accessible

#### Communication Domain
- [ ] `/seven-domains/communication/index.html` opens
- [ ] All communication tools accessible
- [ ] Links properly formatted

#### Showcase Domain
- [ ] `/seven-domains/showcase/index.html` opens
- [ ] GitHub link works
- [ ] Pattern Library link works
- [ ] Architecture docs accessible

#### Transparency Domain
- [ ] `/seven-domains/transparency/index.html` opens
- [ ] Source Verifier accessible
- [ ] Truth Signal Finder accessible
- [ ] Documentation links work

### 🔧 Phase 5: Backend API Testing

With backend running (`http://localhost:5555`):

#### Health Check
```bash
curl http://localhost:5555/api/health
```
Expected: `{"status": "healthy", "service": "DOCUMENT_PROCESSOR", ...}`

#### List Domains
```bash
curl http://localhost:5555/api/domains
```
Expected: JSON with all 7 domains and supported file types

#### Upload Test
```bash
curl -X POST http://localhost:5555/api/upload \
  -F "file=@test.txt" \
  -F "domain=legal" \
  -F "tool=CONTRACT_ANALYZER"
```
Expected: JSON with file_info, extracted_text, and analysis

#### Analyze Text
```bash
curl -X POST http://localhost:5555/api/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a test contract","domain":"legal","tool":"CONTRACT_ANALYZER"}'
```
Expected: JSON with analysis results

### 📊 Phase 6: Pattern Detection Accuracy

Test each analyzer with known patterns:

#### Contract Red Flags
Paste this into CONTRACT_ANALYZER:
```
The company may change these terms at any time at our sole discretion.
This agreement automatically renews unless cancelled.
You agree to indemnify and hold harmless the company.
All disputes must go through binding arbitration.
You assign all intellectual property to the company.
```
Expected: Detect 5+ red flags, HIGH RISK rating

#### Gaslighting Patterns
Paste this into GASLIGHTING_DETECTOR:
```
You always exaggerate everything.
That never happened, you're remembering wrong.
You're being too sensitive.
After all I've done for you, this is how you treat me?
If you really loved me, you wouldn't question this.
```
Expected: Detect 5 gaslighting patterns, HIGH RISK

#### Sales Pressure
Paste this into SALES_PITCH_DETECTOR:
```
This is a limited time offer - only 3 spots left!
Act now or miss out forever.
This is 100% guaranteed to work.
Risk-free trial with no obligations.
Once in a lifetime opportunity.
```
Expected: Detect 5+ pressure tactics, HIGH RISK

### 🔒 Phase 7: Security Testing

#### File Validation
1. Try uploading a 100MB file → Should reject (50MB limit)
2. Try uploading a .exe file → Should reject (not allowed)
3. Try uploading with path traversal (../../etc/passwd) → Should sanitize
4. Verify uploaded files stored in correct folders

#### Input Sanitization
1. Paste script tags in analyzer → Should not execute
2. Paste SQL injection patterns → Should not affect storage
3. Verify no XSS vulnerabilities

### 📱 Phase 8: Responsive Design

Test on different screen sizes:
- [ ] Desktop (1920x1080) - Full layout
- [ ] Tablet (768x1024) - Grid adapts
- [ ] Mobile (375x667) - Single column
- [ ] Verify buttons are tappable
- [ ] Check text is readable

### ⚡ Phase 9: Performance Testing

#### Load Time
- [ ] Dashboard loads in < 3 seconds
- [ ] Domain pages load in < 2 seconds
- [ ] Tools load in < 1 second

#### File Processing
- [ ] Small file (< 1MB) processes in < 1 second
- [ ] Medium file (1-10MB) processes in < 5 seconds
- [ ] Large file (10-50MB) processes in < 15 seconds

#### Memory Usage
- [ ] No memory leaks after 10 uploads
- [ ] Browser doesn't freeze during processing
- [ ] Multiple tools can be open simultaneously

### 🎨 Phase 10: UI/UX Verification

#### Visual Elements
- [ ] All icons display correctly (📄 📧 📝 💬 📋 📊)
- [ ] Colors are consistent across tools
- [ ] Hover effects work on buttons
- [ ] Upload status updates in real-time
- [ ] Success/error messages are clear

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Button labels are descriptive
- [ ] Color contrast meets WCAG standards
- [ ] Screen reader compatible (test with tool)

### 📝 Phase 11: Documentation Verification

- [ ] `DOCUMENT_PROCESSOR_README.md` is complete
- [ ] `SEVEN_DOMAINS_DASHBOARD_GUIDE.md` is updated
- [ ] All API endpoints documented
- [ ] Installation instructions are clear
- [ ] Troubleshooting section is helpful

## Test Data Creation

### Create Test Files

#### test-contract.txt
```
EMPLOYMENT AGREEMENT

The company reserves the right to modify these terms at any time without notice.
This agreement automatically renews for one year unless either party provides notice.
Employee agrees to indemnify and hold harmless the company from all claims.
Any disputes shall be resolved through binding arbitration only.
All work product and intellectual property created shall be owned exclusively by company.
Company may terminate this agreement at will for any reason or no reason.
```

#### test-email.txt
```
From: sender@example.com
To: recipient@example.com
Subject: Urgent - Need Response Now!

Hi,

This is a limited time offer that expires today at midnight!
You need to act now or you'll miss out forever.
Trust me, this is the best opportunity you'll ever see.
If you don't respond immediately, I'll have to move on to someone else.

Everyone else is already signing up - don't be left behind!
```

#### test-meeting.txt
```
MEETING NOTES - Project Review

- Manager spoke for 45 minutes straight without allowing questions
- When asked about timeline concerns, Manager said "trust me, it'll work"
- Team member suggested alternative approach, Manager responded "we've already decided"
- No written documentation of decisions made
- Manager: "If you can't handle it, maybe you're not right for this team"
- Meeting ended without clear action items
```

#### test-negotiation.txt
```
NEGOTIATION TRANSCRIPT

Them: "This is our final offer, take it or leave it."
Us: "We'd like to discuss terms..."
Them: "There's nothing to discuss. Everyone else accepts these terms."
Us: "Can we review the payment schedule?"
Them: "Look, we have other people lined up. This offer expires in 24 hours."
Us: "We need time to review with counsel..."
Them: "That's not how we do business here. Yes or no?"
```

## Expected Results Summary

### Document Upload
- ✅ All 7 enhanced tools support file upload
- ✅ Multiple file formats accepted per tool
- ✅ Upload status displays progress
- ✅ Extracted text appears in textarea
- ✅ Backend integration works when available
- ✅ Client-side fallback works for TXT files

### Pattern Detection
- ✅ Legal red flags detected (10+ patterns)
- ✅ Manipulation patterns detected (15+ patterns)
- ✅ Sales pressure tactics detected (12+ patterns)
- ✅ Risk scores calculated accurately
- ✅ Recommendations provided
- ✅ Grounding statements offered

### Backend API
- ✅ Runs on port 5555
- ✅ All endpoints respond correctly
- ✅ File storage organized by domain/tool
- ✅ Metadata tracking works
- ✅ Security validation active
- ✅ Error handling graceful

### Overall System
- ✅ All 7 domains accessible
- ✅ 50+ tools functional
- ✅ Document upload in 7 key tools
- ✅ Pattern detection accurate
- ✅ Security measures active
- ✅ Documentation complete

## Troubleshooting Common Issues

### Backend Won't Start
```bash
# Check if port 5555 is in use
netstat -an | grep 5555

# Install missing dependencies
pip install -r requirements-document-processor.txt

# Run with verbose logging
python DOCUMENT_PROCESSOR.py
```

### File Upload Fails
- Check file size < 50MB
- Verify file extension in ALLOWED_EXTENSIONS
- Ensure backend is running
- Check browser console for errors

### Analysis Not Working
- Verify text is in textarea
- Check for JavaScript errors in console
- Try refreshing the page
- Test with smaller text sample

### Links Not Working
- Check file paths are correct
- Verify all domain pages exist
- Ensure web server is serving files
- Check for typos in href attributes

## Performance Benchmarks

### Expected Performance
- Dashboard load: < 3 seconds
- File upload (1MB): < 1 second
- Text extraction: < 2 seconds
- Pattern analysis: < 500ms
- API response: < 200ms

### Optimization Tips
- Use production mode (not debug)
- Enable gzip compression
- Minify JavaScript files
- Cache static assets
- Use CDN for libraries

## Success Criteria

System is 100% functional when:
- ✅ All 7 domain pages accessible
- ✅ All 50+ tools working correctly
- ✅ 7 key tools have document upload
- ✅ Backend API running and responsive
- ✅ Pattern detection accurate
- ✅ Security measures active
- ✅ Client-side fallback working
- ✅ Documentation complete
- ✅ No critical errors in console
- ✅ Responsive on all devices

---

**Testing completed? Great! The Seven Domains system is now 100% functional!** 🎉
