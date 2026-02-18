# Railway Onboarding - Step by Step

## Status: Check Your Dashboard Light
- **GREEN** = Railway project access confirmed
- **RED** = Follow steps below

---

## Step 1: Check Your Email

Look for an email from **Railway** with subject:
> "You've been invited to join a project on Railway"

**Sender:** noreply@railway.app

---

## Step 2: Accept the Invite

1. Click the invitation link in the email
2. Create a Railway account if needed (GitHub login works)
3. Accept the project invitation
4. You should see the consciousness-revolution project

---

## Step 3: Get Your API Token

1. Go to: https://railway.app/account/tokens
2. Click **"Create Token"**
3. Name it: `operator-[your-name]`
4. Copy the token (starts with `railway_`)

**IMPORTANT:** Save this token! It won't show again.

---

## Step 4: Return to Dashboard

1. Go back to your Operator Cockpit
2. Paste your Railway API token
3. Click **"Verify"**
4. Your light should turn **GREEN**

---

## Troubleshooting

### "I don't see the email"
- Check spam/junk folder
- Search for "railway" or "project invitation"
- Ask Commander to resend

### "Can't create token"
- Make sure you accepted the project invite first
- Try logging out and back in
- Check if you're on the right Railway account

### "Service is down"
Railway services can be checked at:
```
railway status
```
Or via dashboard: https://railway.app/project/[project-id]

---

## Why Railway?

- **Backend Services** - ARAYA API lives here
- **Databases** - PostgreSQL, Redis
- **Logs** - Real-time service monitoring
- **Deploys** - Git-triggered deployments

---

## Mobile Quick Check

From your phone:
1. Install Railway app (iOS/Android)
2. Or visit: https://railway.app/dashboard

If you can see the project, you're connected!

---

## Quick Commands (Once Connected)

```bash
# Check service status
railway status

# View logs
railway logs

# Deploy update
railway up
```

---

## Current Services on Railway

| Service | Purpose |
|---------|---------|
| araya-api | Main AI chat backend |
| consciousness-db | PostgreSQL database |
| redis-cache | Session caching |

---

*Last Updated: February 2026*
