# Netlify Onboarding - Step by Step

## Status: Check Your Dashboard Light
- **GREEN** = Deploy access confirmed
- **RED** = Follow steps below

---

## Step 1: Check Your Email

Look for an email from **Netlify** with subject:
> "You've been invited to join a team on Netlify"

**Sender:** team@netlify.com

---

## Step 2: Accept the Invite

1. Click **"Accept invitation"** in the email
2. Create a Netlify account if you don't have one
3. You'll be added to the **verdant-tulumba** team
4. You should see the team dashboard

---

## Step 3: Get Your Deploy Hook (No Seat Needed)

**Option A: Use the shared deploy hook**
Ask Commander for the deploy hook URL - looks like:
```
https://api.netlify.com/build_hooks/[unique-id]
```

**Option B: Use GitHub auto-deploy**
Just push to GitHub - Netlify auto-deploys from main branch

---

## Step 4: Return to Dashboard

1. Go back to your Operator Cockpit
2. Paste your Netlify Site ID or use "auto"
3. Click **"Verify"**
4. Your light should turn **GREEN**

---

## Troubleshooting

### "I don't see the email"
- Check spam/junk folder
- Search for "netlify" or "team invitation"
- Ask Commander to resend

### "Getting charged for seat?"
Use deploy hooks instead - no seat purchase needed:
1. Get the shared hook URL from Commander
2. Use it to trigger deploys without team membership

### "Deploy failed"
- Check if you pushed to correct branch (main)
- Look at Netlify dashboard for build logs
- Most common: missing dependency in package.json

---

## Why Netlify?

- **Hosting** - Where conciousnessrevolution.io lives
- **Functions** - Serverless backend (APIs)
- **Forms** - Bug reports and contact forms
- **Auto-SSL** - Free HTTPS certificates

---

## Mobile Quick Check

From your phone, visit:
```
https://app.netlify.com/teams/verdant-tulumba/sites
```

If you can see the sites list, you're in!

---

## Deploy Without Netlify Account

```bash
# Trigger deploy with curl (works from phone too!)
curl -X POST https://api.netlify.com/build_hooks/[YOUR-HOOK-ID]
```

---

*Last Updated: February 2026*
