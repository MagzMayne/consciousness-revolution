# Deployment Guide — Barbrick Design

**Version:** 1.0  
**Date:** 2026-03-10

---

## 1. GitHub Pages (Frontend)

The frontend (`dashboard.html`, `index.html`, all static assets) is served automatically
by GitHub Pages from the `main` branch.

**No extra deployment steps are needed for the frontend.**

Workflow: `push to main` → GitHub Pages rebuilds → live at `https://barbrickdesign.github.io`

---

## 2. Railway Backend

### 2a. First-time Setup

1. Sign in at [railway.app](https://railway.app)
2. Create a new project → **Deploy from GitHub repo**
3. Select `barbrickdesign/barbrickdesign.github.io`
4. Set the **Root Directory** to `backend/`
5. Railway detects `railway.toml` and uses `node server-main.js` as the start command

### 2b. Environment Variables

Set the following in **Railway → Settings → Variables**:

| Variable | Required | Example |
|----------|----------|---------|
| `PORT` | No | `8080` (Railway sets automatically) |
| `PAYPAL_CLIENT_ID` | Yes | `AeXYZ...` |
| `PAYPAL_SECRET` | Yes | `ELabc...` |
| `PAYPAL_WEBHOOK_ID` | Yes | `1234567890` |
| `PAYPAL_MODE` | No | `production` |
| `PAYPAL_EMAIL` | No | `BarbrickDesign@gmail.com` |
| `SHOP_HMAC_SECRET` | Yes | any 32+ char random string |
| `OUTBOUND_WEBHOOK_URLS` | No | `https://hooks.zapier.com/...` |
| `AGENTR` | No | GitHub PAT for RootIB scanner |
| `AGENT_PASSCODE` | No | Admin dashboard passcode |
| `XAI_API_KEY` | No | xAI / Grok API key |

### 2c. Deploy on Push

A GitHub Actions workflow (`.github/workflows/deploy-backend.yml`) automatically
triggers a Railway deployment whenever code in `backend/` is pushed to `main`.

Railway also supports automatic deploys from the Railway dashboard:
**Settings → Source → Auto Deploy: enabled**

### 2d. Health Check

Railway pings `GET /health` every 30 seconds. The endpoint returns:

```json
{
  "status": "ok",
  "uptime": 12345,
  "services": { ... }
}
```

---

## 3. PayPal Webhook Registration

See [PAYPAL_WEBHOOKS.md](./PAYPAL_WEBHOOKS.md) for detailed webhook setup.

Quick summary:
1. Add webhook URL in PayPal Developer Dashboard
2. Copy Webhook ID → set `PAYPAL_WEBHOOK_ID` in Railway
3. Test with PayPal's **Simulate webhook** feature

---

## 4. CI Workflow

The CI workflow (`.github/workflows/ci.yml`) runs on every push and PR:

1. Install Node.js dependencies
2. Validate `package.json`
3. Check critical files exist (`index.html`, `package.json`, `projects.json`)
4. Validate `projects.json`
5. Validate workflow YAML files
6. Check `backend/server-main.js` syntax
7. Run canonical field audit (`node test-canonical-fields.js`)

All steps must pass before merging to `main`.

---

## 5. Local Development

```bash
# Frontend: serve from repo root
npx serve .
# or open dashboard.html directly in browser

# Backend
cd backend
npm install
cp .env.example .env   # fill in your test credentials
node server-main.js
# → listening on http://localhost:8080
```

### backend/.env.example

```env
PORT=8080
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_SECRET=your_sandbox_secret
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_MODE=sandbox
PAYPAL_EMAIL=BarbrickDesign@gmail.com
SHOP_HMAC_SECRET=change_me_to_a_random_secret
OUTBOUND_WEBHOOK_URLS=
```

---

## 6. Rollback

To roll back the backend to a previous deployment:
- Railway Dashboard → **Deployments** → select previous deploy → **Rollback**

To roll back the frontend:
- `git revert <commit>` and push to `main`
