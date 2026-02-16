---
applyTo: ".github/workflows/*.yml"
---

## GitHub Actions Workflow Requirements

Workflows automate CI/CD, testing, security scanning, and deployment. These must be reliable and efficient.

### Workflow Structure Standards

All workflows should follow this basic structure:

```yaml
name: Descriptive Workflow Name

on:
  # Trigger conditions
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # Daily at midnight
  workflow_dispatch: # Manual trigger

permissions:
  contents: read
  pull-requests: write
  issues: write

env:
  NODE_VERSION: '18'

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
```

### Critical Workflows

#### 1. Auto Review PR

This workflow reviews pull requests automatically:

```yaml
name: Auto Review PR

on:
  pull_request:
    types: [opened, synchronize, reopened]
  pull_request_review_comment:
    types: [created]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Review PR Changes
        uses: actions/github-script@v7
        with:
          script: |
            // Get changed files
            const { data: files } = await github.rest.pulls.listFiles({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            });
            
            // Check for revenue-critical files
            const criticalFiles = [
              'contributor-registration',
              'paypal-integration',
              'government-grants-portal'
            ];
            
            const hasCriticalChanges = files.some(f => 
              criticalFiles.some(cf => f.filename.includes(cf))
            );
            
            if (hasCriticalChanges) {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: '⚠️ **CRITICAL**: This PR modifies revenue-critical files. Extra review required.'
              });
            }
      
      - name: Check for security issues
        run: |
          npm audit --audit-level=moderate
          if [ $? -ne 0 ]; then
            echo "::warning::Security vulnerabilities detected"
          fi
```

#### 2. Payment Integration Deployment

Revenue-critical deployment workflow:

```yaml
name: Deploy PayPal Integration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - sandbox
          - production

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate PayPal Credentials
        env:
          PAYPAL_CLIENT_ID: ${{ secrets.PAYPAL_CLIENT_ID }}
          PAYPAL_API: ${{ secrets.PAYPAL_API }}
        run: |
          if [ -z "$PAYPAL_CLIENT_ID" ] || [ -z "$PAYPAL_API" ]; then
            echo "::error::PayPal credentials not configured"
            exit 1
          fi
      
      - name: Test PayPal Integration
        run: npm run test:paypal-integration
      
      - name: Deploy to ${{ github.event.inputs.environment }}
        run: |
          node deploy-paypal-integration.js --env=${{ github.event.inputs.environment }}
      
      - name: Verify Deployment
        run: |
          node verify-paypal-integration.js --env=${{ github.event.inputs.environment }}
      
      - name: Notify on Failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 PayPal Deployment Failed',
              body: 'PayPal integration deployment failed. Immediate attention required.',
              labels: ['critical', 'bug', 'revenue-impact']
            });
```

#### 3. Security Scanning

Enhanced security workflow:

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday

permissions:
  contents: read
  security-events: write
  actions: read

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Dependency Security Audit
        run: |
          npm audit --audit-level=high --json > audit-report.json
          
          # Check for critical vulnerabilities
          if ! command -v jq &> /dev/null; then
            echo "::error::jq is not installed. Please install jq to parse audit results."
            exit 1
          fi
          
          if ! CRITICAL=$(jq '.metadata.vulnerabilities.critical' audit-report.json 2>/dev/null); then
            echo "::error::Failed to parse audit report. Invalid JSON format."
            exit 1
          fi
          
          if ! HIGH=$(jq '.metadata.vulnerabilities.high' audit-report.json 2>/dev/null); then
            echo "::error::Failed to parse audit report. Invalid JSON format."
            exit 1
          fi
          
          if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
            echo "::error::Found $CRITICAL critical and $HIGH high severity vulnerabilities"
            exit 1
          fi
      
      - name: Check for Exposed Secrets
        run: |
          # Check for common secret patterns
          if grep -r "sk_live_" . --exclude-dir=node_modules; then
            echo "::error::Potential API key found in code"
            exit 1
          fi
          
          if grep -r "PRIVATE KEY" . --exclude-dir=node_modules; then
            echo "::error::Potential private key found in code"
            exit 1
          fi
      
      - name: SAST Scanning
        uses: github/codeql-action/analyze@v3
        with:
          languages: javascript
      
      - name: Create Security Report
        if: always()
        run: |
          echo "## Security Scan Results" > security-report.md
          echo "Scan Date: $(date)" >> security-report.md
          cat audit-report.json | jq '.' >> security-report.md
      
      - name: Upload Security Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: security-report.md
```

#### 4. Issue Automation

Automated issue management:

```yaml
name: Issue Lifecycle Manager

on:
  issues:
    types: [opened, labeled, closed]
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours

permissions:
  issues: write
  contents: read

jobs:
  manage-issues:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Auto-label Issues
        uses: actions/github-script@v7
        if: github.event_name == 'issues' && github.event.action == 'opened'
        with:
          script: |
            const issue = context.payload.issue;
            const labels = [];
            
            // Auto-label based on content
            if (issue.title.toLowerCase().includes('payment') || 
                issue.body.toLowerCase().includes('paypal')) {
              labels.push('payment', 'revenue-critical');
            }
            
            if (issue.title.toLowerCase().includes('bug')) {
              labels.push('bug');
            }
            
            if (issue.title.toLowerCase().includes('agent') ||
                issue.body.toLowerCase().includes('agent')) {
              labels.push('agent-system');
            }
            
            if (labels.length > 0) {
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issue.number,
                labels
              });
            }
      
      - name: Close Stale Issues
        if: github.event_name == 'schedule'
        uses: actions/github-script@v7
        with:
          script: |
            const staleDate = new Date();
            staleDate.setDate(staleDate.getDate() - 30); // 30 days
            
            const { data: issues } = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              labels: 'stale'
            });
            
            for (const issue of issues) {
              const updatedAt = new Date(issue.updated_at);
              
              if (updatedAt < staleDate) {
                await github.rest.issues.update({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  issue_number: issue.number,
                  state: 'closed'
                });
                
                await github.rest.issues.createComment({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  issue_number: issue.number,
                  body: 'This issue has been automatically closed due to inactivity.'
                });
              }
            }
```

### Best Practices

1. **Use secrets for sensitive data**
```yaml
env:
  PAYPAL_CLIENT_ID: ${{ secrets.PAYPAL_CLIENT_ID }}
  API_KEY: ${{ secrets.API_KEY }}
```

2. **Add proper error handling**
```yaml
- name: Deploy with fallback
  run: |
    npm run deploy || {
      echo "::error::Deployment failed, rolling back"
      npm run rollback
      exit 1
    }
```

3. **Use artifacts for debugging**
```yaml
- name: Upload logs
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: build-logs
    path: logs/
```

4. **Cache dependencies**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
```

5. **Conditional execution**
```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: npm run deploy:production
```

### Testing Requirements

Before deploying workflow changes:

- [ ] Test workflow in feature branch
- [ ] Verify secrets are configured
- [ ] Check permissions are minimal
- [ ] Test failure scenarios
- [ ] Verify notifications work
- [ ] Check resource usage (costs)

### Security Checklist

- [ ] Use secrets for all credentials
- [ ] Set minimal permissions
- [ ] Pin action versions (@v4, not @latest)
- [ ] No secrets in logs
- [ ] Validate external inputs
- [ ] Use trusted actions only

### Common Mistakes to Avoid

1. ❌ Using `@latest` for actions (use specific versions)
2. ❌ Exposing secrets in logs
3. ❌ Too broad permissions
4. ❌ Not handling failures
5. ❌ Missing timeout settings
6. ❌ Not testing in non-production first
7. ❌ Hard-coding values (use env/secrets)
8. ❌ No notification on critical failures

### Revenue-Critical Workflows

Workflows that affect revenue must:

1. **Have approval gates**
```yaml
environment:
  name: production
  url: https://barbrickdesign.github.io
```

2. **Include rollback mechanism**
```yaml
- name: Rollback on failure
  if: failure()
  run: npm run rollback
```

3. **Notify on failures**
```yaml
- name: Notify team
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -d '{"text":"🚨 Payment system deployment failed!"}'
```

4. **Test in sandbox first**
```yaml
- name: Test in sandbox
  run: npm run test:sandbox
  
- name: Deploy to production
  if: success()
  run: npm run deploy:production
```

### Documentation Requirements

Each workflow should include:

```yaml
# Workflow Name
# 
# Purpose: Brief description of what this workflow does
# Triggers: When this workflow runs
# Dependencies: What this workflow depends on
# Critical: Yes/No - Is this revenue-critical?
# Contact: BarbrickDesign@gmail.com
# 
# Example:
# This workflow deploys PayPal integration changes
# Triggers: Manual dispatch only
# Dependencies: PayPal API credentials
# Critical: YES - Affects payment processing
```

### Remember

- **Test workflows before merging** - Use feature branches
- **Revenue-critical workflows** - Extra caution and approvals
- **Security first** - Never expose secrets
- **Fail gracefully** - Always handle errors
- **Monitor costs** - GitHub Actions usage has limits
- **Document everything** - Help future maintainers
