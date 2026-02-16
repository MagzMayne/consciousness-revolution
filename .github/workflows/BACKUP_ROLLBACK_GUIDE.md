# Backup and Rollback System Documentation

## Overview

The Backup and Rollback System provides automated protection for deployment workflows by:
- Creating backups of working scripts before deployments
- Running tests to validate deployments
- Automatically rolling back to previous state on failures
- Logging all operations comprehensively
- Notifying maintainers when manual intervention is required

## Architecture

### Components

1. **Backup-Rollback Utility** (`.github/scripts/backup-rollback.js`)
   - Core Node.js script for backup and rollback operations
   - Maintains backup manifest and logs
   - Supports backup creation, restoration, listing, and cleanup

2. **Backup-Rollback Workflow** (`.github/workflows/backup-rollback.yml`)
   - Reusable GitHub Actions workflow
   - Can be called from other workflows
   - Provides backup, rollback, list, and clean actions

3. **Safe Deployment Workflow** (`.github/workflows/safe-deployment.yml`)
   - End-to-end deployment with integrated backup and rollback
   - Supports multiple deployment types (PayPal, BankSky, aFactory, Merlin, custom)
   - Runs tests and rolls back automatically on failures

4. **Updated Legacy Workflows**
   - Enhanced `deploy-paypal-integration.yml` with backup support
   - Maintains backward compatibility

## Usage

### Using Safe Deployment Workflow (Recommended)

This is the primary way to deploy with automatic backup and rollback protection:

1. Navigate to GitHub Actions → Safe Deployment with Backup & Rollback
2. Click "Run workflow"
3. Select deployment type (paypal-integration, banksky, etc.)
4. Choose whether to run tests (recommended: true)
5. Enable dry-run mode for testing (optional)
6. Click "Run workflow"

**What happens:**
1. ✅ Creates backup of relevant files
2. 🚀 Executes deployment
3. 🧪 Runs tests (if enabled)
4. ↩️ Automatically rolls back if tests fail
5. 📧 Creates issue for manual intervention if needed

### Using Backup-Rollback Workflow Directly

For manual backup and rollback operations:

#### Create a Backup
```yaml
jobs:
  my-backup:
    uses: ./.github/workflows/backup-rollback.yml
    with:
      action: backup
      files: file1.js,file2.html,folder/file3.js
      label: my-deployment
      description: Backup before my deployment
```

#### Rollback to a Backup
```yaml
jobs:
  my-rollback:
    uses: ./.github/workflows/backup-rollback.yml
    with:
      action: rollback
      label: my-deployment
```

#### List All Backups
```yaml
jobs:
  list-backups:
    uses: ./.github/workflows/backup-rollback.yml
    with:
      action: list
```

#### Clean Old Backups
```yaml
jobs:
  cleanup:
    uses: ./.github/workflows/backup-rollback.yml
    with:
      action: clean
      older_than_days: 30
```

### Using Backup-Rollback Script Locally

The backup-rollback utility can also be run locally:

```bash
# Create a backup
node .github/scripts/backup-rollback.js backup \
  --files=file1.js,file2.js \
  --label=my-backup \
  --description="Manual backup"

# List all backups
node .github/scripts/backup-rollback.js list

# Rollback to a backup
node .github/scripts/backup-rollback.js rollback --label=my-backup

# Clean old backups (older than 30 days)
node .github/scripts/backup-rollback.js clean --older-than=30
```

## Integration Examples

### Adding Backup to Existing Workflow

```yaml
name: My Custom Deployment

on:
  workflow_dispatch:

jobs:
  # Step 1: Create backup
  backup:
    uses: ./.github/workflows/backup-rollback.yml
    with:
      action: backup
      files: my-script.js,config.json
      label: my-custom-deployment
      description: Pre-deployment backup

  # Step 2: Deploy
  deploy:
    needs: backup
    runs-on: ubuntu-latest
    outputs:
      deployment_status: ${{ steps.deploy.outcome }}
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        id: deploy
        continue-on-error: true
        run: |
          # Your deployment commands
          node my-deployment-script.js

  # Step 3: Run tests
  test:
    needs: deploy
    runs-on: ubuntu-latest
    outputs:
      tests_passed: ${{ steps.test.outcome == 'success' }}
    steps:
      - uses: actions/checkout@v4
      - name: Test
        id: test
        continue-on-error: true
        run: |
          # Your test commands
          npm test

  # Step 4: Rollback on failure
  rollback:
    needs: [backup, deploy, test]
    if: |
      always() && 
      needs.backup.result == 'success' &&
      (needs.deploy.outputs.deployment_status == 'failure' || 
       needs.test.outputs.tests_passed == 'false')
    uses: ./.github/workflows/backup-rollback.yml
    with:
      action: rollback
      label: my-custom-deployment
```

## Backup Storage

### Location
Backups are stored in `.github/backups/` directory:
- Each backup is in a timestamped subdirectory
- Maintains original directory structure
- Includes metadata.json with backup information
- manifest.json tracks all backups

### Structure
```
.github/backups/
├── manifest.json                           # Central backup registry
├── backup-rollback.log                     # Operation logs
├── my-deployment_2025-01-06T10-00-00/     # Backup directory
│   ├── metadata.json                       # Backup metadata
│   ├── file1.js                           # Backed up files
│   ├── folder/
│   │   └── file2.js
│   └── ...
└── .gitkeep                               # Keeps directory in git
```

### Retention
- Backups are stored indefinitely by default
- Use `clean` action to remove old backups
- Workflow artifacts are kept for 30-90 days
- Consider running cleanup regularly (weekly/monthly)

## Logs and Artifacts

### Logs
All operations are logged to `.github/backups/backup-rollback.log`:
- Timestamped entries
- Success/failure status
- File operations
- Error messages

### Artifacts
Each workflow run creates artifacts:
- **backup-manifest**: Current backup registry (90 days)
- **backup-rollback-log**: Operation logs (30 days)
- **deployment-log**: Deployment output (30 days)
- **test-results**: Test execution output (30 days)

## Notifications

### Automatic Issues
When deployment fails and rollback occurs, an issue is automatically created with:
- Deployment details
- Failure reason
- Rollback status
- Links to logs
- Next steps for manual intervention
- Labels: `deployment`, `failed`, `manual-intervention-required`

### Manual Intervention Required
Issues are created when:
- Deployment fails and is rolled back
- Tests fail after deployment
- Rollback operation fails

## Best Practices

### 1. Always Enable Backups
```yaml
# DO: Enable backups for production deployments
enable_backup: true

# DON'T: Disable backups in production
enable_backup: false  # Only for testing!
```

### 2. Test Before Deploying
```yaml
# DO: Test in dry-run mode first
dry_run: true
run_tests: true

# THEN: Deploy for real
dry_run: false
run_tests: true
```

### 3. Include All Critical Files
```yaml
# DO: Include all files that will be modified
files: script.js,config.json,index.html,lib/helper.js

# DON'T: Forget dependent files
files: script.js  # Missing config.json that script modifies!
```

### 4. Use Descriptive Labels
```yaml
# DO: Use clear, searchable labels
label: paypal-integration-v2.1
description: "Upgrade to PayPal SDK v2.1 with refund support"

# DON'T: Use vague labels
label: backup1
description: ""
```

### 5. Clean Old Backups Regularly
```bash
# Schedule cleanup (e.g., monthly)
node .github/scripts/backup-rollback.js clean --older-than=30
```

### 6. Verify Backups
```bash
# List backups periodically to ensure they exist
node .github/scripts/backup-rollback.js list
```

## Troubleshooting

### Backup Creation Fails
**Problem**: Backup fails with "File not found"
**Solution**: Verify file paths are relative to repository root
```bash
# Correct
--files=deploy-script.js,src/config.js

# Incorrect
--files=/home/user/repo/deploy-script.js
```

### Rollback Doesn't Restore File
**Problem**: File is in backup but not restored
**Solution**: Check file permissions and directory structure
```bash
# Ensure parent directories exist
mkdir -p src/utils
```

### Tests Pass Locally But Fail in CI
**Problem**: Tests succeed locally but fail after deployment
**Solution**: 
1. Check environment variables are set
2. Verify dependencies are installed
3. Ensure test data is available
4. Check for timing/race conditions

### Rollback Fails
**Problem**: Rollback operation fails
**Solution**:
1. Check backup manifest exists
2. Verify backup directory is intact
3. Check filesystem permissions
4. Manual rollback may be needed:
```bash
cd .github/backups/
ls -la  # Find backup directory
cp -r backup-id/* ../../  # Manual restore
```

### Can't Find Backup
**Problem**: Backup label not found
**Solution**: List all backups to find correct label
```bash
node .github/scripts/backup-rollback.js list
```

## Security Considerations

### Secrets in Backups
- ⚠️ **Never backup files containing secrets**
- Use environment variables for sensitive data
- Review backup manifests for leaked credentials
- Backups are stored in repository (accessible to maintainers)

### Backup Permissions
- Backups inherit repository permissions
- Limit access to .github/backups/ if needed
- Consider encrypting sensitive backups
- Use GitHub's secret scanning

### Artifact Access
- Workflow artifacts are accessible to repository collaborators
- Set appropriate artifact retention periods
- Clean sensitive data from logs

## Maintenance

### Regular Tasks

#### Weekly
- Review failed deployment issues
- Verify backup system is working
- Check disk usage of backups

#### Monthly
- Clean backups older than 30 days
- Review backup manifest
- Update documentation if needed

#### Quarterly
- Audit backup/rollback procedures
- Test rollback operations
- Review and update retention policies

### Monitoring

Check these indicators:
- ✅ Backup workflows completing successfully
- ✅ Manifest.json is up to date
- ✅ Log file is accessible
- ✅ Artifacts are being uploaded
- ✅ Issues are created for failures

### Updates

When updating the system:
1. Test in a feature branch first
2. Create backup before updating scripts
3. Verify with dry-run deployments
4. Update documentation
5. Notify team of changes

## Advanced Usage

### Custom Test Integration
```yaml
- name: Run custom tests
  id: test
  run: |
    # Your custom test logic
    if ! ./run-integration-tests.sh; then
      echo "tests_passed=false" >> $GITHUB_OUTPUT
      exit 1
    fi
    echo "tests_passed=true" >> $GITHUB_OUTPUT
```

### Multi-Stage Deployments
```yaml
jobs:
  backup:
    # Create backup
  deploy-stage-1:
    # Deploy first component
  test-stage-1:
    # Test first component
  deploy-stage-2:
    # Deploy second component
  test-stage-2:
    # Test second component
  rollback:
    # Rollback if any stage fails
    if: |
      always() && (
        needs.test-stage-1.outputs.tests_passed == 'false' ||
        needs.test-stage-2.outputs.tests_passed == 'false'
      )
```

### Scheduled Cleanup
```yaml
name: Cleanup Old Backups

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM

jobs:
  cleanup:
    uses: ./.github/workflows/backup-rollback.yml
    with:
      action: clean
      older_than_days: 30
```

## Support

### Getting Help
1. Check this documentation
2. Review workflow logs in GitHub Actions
3. Check backup-rollback.log for details
4. Review created issues for guidance
5. Contact repository maintainers

### Reporting Issues
When reporting problems, include:
- Workflow run URL
- Error messages from logs
- Backup label being used
- Steps to reproduce
- Expected vs actual behavior

## Version History

### v1.0.0 (2025-01-06)
- Initial implementation
- Backup and rollback utility script
- Reusable workflow for backup operations
- Safe deployment workflow
- Integration with existing workflows
- Comprehensive documentation
