# Scripts Directory

This directory contains utility scripts for managing and maintaining the Barbrick Design repository.

## Available Scripts

### Branch Management (`branch-management.js`)

Tool for analyzing and managing the 715+ branches in the repository.

**Usage:**
```bash
node scripts/branch-management.js [command]
```

**Commands:**
- `analyze` - Generate comprehensive branch analysis report
- `stale` - List branches older than 90 days
- `merged` - List branches already merged into main
- `help` - Show usage information

**Output Files:**
- `branch-analysis-report.json` - Complete branch analysis
- `stale-branches-report.json` - List of stale branches
- `merged-branches-report.json` - List of merged branches

**Example:**
```bash
# Check for merged branches
node scripts/branch-management.js merged

# Find stale branches
node scripts/branch-management.js stale

# Full analysis
node scripts/branch-management.js analyze
```

**See Also:**
- [Branch Management Guide](../docs/BRANCH_MANAGEMENT_GUIDE.md)
- [Quick Reference](../docs/BRANCH_MANAGEMENT_QUICK_REFERENCE.md)

## Other Scripts

Many other utility scripts are available in the repository root. Some notable ones:

### Backend Management
- `backend-health-checker.js` - Check backend service health
- `backend-monitor.js` - Monitor backend services
- `start-banksky.js` - Start BankSky platform

### Testing & Analysis
- `test-banksky.js` - Test BankSky functionality
- `test-api-connections.js` - Test API connections
- `sql-analyzer-cli.js` - Analyze SQL usage

### Deployment
- `deploy-banksky.js` - Deploy BankSky
- `deploy-paypal-integration.js` - Deploy PayPal integration

### Security
- `sign-repository-files.js` - Sign files with digital signatures
- `test-autonomous-api-keys.html` - Test API key management

## NPM Scripts

The repository includes many npm scripts defined in `package.json`:

```bash
# Start development server
npm run dev

# Run tests
npm test
npm run test:api

# Health checks
npm run health

# Backend services
npm run backend
npm run kas

# Deployment
npm run deploy
```

See `package.json` for the complete list of available scripts.

## Contributing

When adding new scripts to this directory:

1. **Follow naming conventions**: Use kebab-case (e.g., `branch-management.js`)
2. **Add documentation**: Update this README
3. **Include help text**: Add `--help` or `help` command
4. **Error handling**: Handle errors gracefully
5. **Exit codes**: Use proper exit codes (0 for success, non-zero for errors)
6. **Permissions**: Set executable permission if needed (`chmod +x`)

## Testing Scripts

Before committing new scripts:

```bash
# Test basic functionality
node scripts/your-script.js --help

# Test error cases
node scripts/your-script.js invalid-input

# Check exit codes
node scripts/your-script.js && echo "Success" || echo "Failed"
```

## Troubleshooting

### Script won't run
```bash
# Check Node.js version
node --version  # Should be >= 16.0.0

# Check script permissions
ls -l scripts/branch-management.js

# Make executable if needed
chmod +x scripts/branch-management.js
```

### Missing dependencies
```bash
# Install all dependencies
npm install

# Or install specific package
npm install package-name
```

### Script errors
```bash
# Run with verbose output
NODE_DEBUG=* node scripts/your-script.js

# Check for syntax errors
node --check scripts/your-script.js
```

## Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Scripts Documentation](https://docs.npmjs.com/cli/v8/using-npm/scripts)
- [Repository README](../README.md)

---

*Last Updated: February 8, 2026*
