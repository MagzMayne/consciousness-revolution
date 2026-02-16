# NamUs API Backend Proxy Service

Complete documentation moved to main README. This is a reference file.

For full documentation, see: [namus-proxy.js](namus-proxy.js) comments and [../NAMUS_API_SETUP_GUIDE.md](../NAMUS_API_SETUP_GUIDE.md)

## Quick Start

```bash
npm install
npm run namus-proxy
```

## Configuration

Set in `.env`:
- NAMUS_API_KEY
- NAMUS_PROXY_PORT (default: 3020)
- ALLOWED_ORIGIN
- NAMUS_RATE_LIMIT_PER_MINUTE (default: 10)
