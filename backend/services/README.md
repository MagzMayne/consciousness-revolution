# ClearDebt Backend Setup

## Quick Setup

```bash
# From repository root
npm install

# Start the backend service
cd backend/services
node cleardebt-service.js
```

Expected output:
```
✅ ClearDebt Service started on port 3010
📍 API Base URL: http://localhost:3010
💾 Database Path: /path/to/backend/data/cleardebt
```

## Dependencies

The following dependencies are already in `package.json`:
- express
- cors
- dotenv

If you see `MODULE_NOT_FOUND` errors, run:
```bash
npm install
```

## Testing the API

```bash
# Health check
curl http://localhost:3010/health

# Should return:
# {"success":true,"service":"cleardebt","version":"1.0.0","timestamp":"..."}
```

## Environment Variables (Optional)

Create `.env` file in repository root:
```
CLEARDEBT_PORT=3010
CLEARDEBT_DB_PATH=./backend/data/cleardebt
GOOGLE_CLIENT_ID=your_google_client_id_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3010
lsof -i :3010

# Kill the process
kill -9 <PID>

# Or use different port
CLEARDEBT_PORT=3011 node cleardebt-service.js
```

### Permission Denied
```bash
# Make sure data directory exists
mkdir -p backend/data/cleardebt

# Check permissions
ls -la backend/data/
```

## Production Deployment

See `CLEARDEBT_IMPLEMENTATION_GUIDE.md` for detailed deployment instructions.
