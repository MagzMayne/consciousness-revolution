# Quick Setup: Araya Chat Environment Variables

This is a quick reference for setting up Araya Chat in Netlify. For detailed instructions, see [ARAYA_DEPLOYMENT_GUIDE.md](ARAYA_DEPLOYMENT_GUIDE.md).

## Where to Configure

**Netlify Dashboard:**
1. Go to https://app.netlify.com/
2. Select your site: `consciousness-revolution`
3. Go to: **Site settings > Environment variables**
4. Click "Add a variable" for each item below

## Required Variables (Minimum Setup)

Copy and paste these into Netlify, replacing the placeholder values:

```
DEEPSEEK_API_KEY=your_deepseek_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_SECRET=your_supabase_service_role_key_here
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_OWNER=overkor-tek
GITHUB_REPO=consciousness-revolution
GITHUB_BRANCH=master
```

## Get Your API Keys

### 1. DeepSeek (Primary AI)
- **URL:** https://platform.deepseek.com/
- **Steps:**
  1. Sign up
  2. Go to API Keys
  3. Create new key
  4. Copy and add to Netlify as `DEEPSEEK_API_KEY`

### 2. Anthropic Claude (Image Analysis)
- **URL:** https://console.anthropic.com/
- **Steps:**
  1. Sign up
  2. Go to API Keys
  3. Create new key
  4. Copy and add to Netlify as `ANTHROPIC_API_KEY`

### 3. Supabase (Database)
- **URL:** https://supabase.com/dashboard
- **Steps:**
  1. Create new project
  2. Go to Project Settings > API
  3. Copy **Project URL** → `SUPABASE_URL`
  4. Copy **anon public** key → `SUPABASE_KEY`
  5. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_SECRET`
  6. Run SQL schemas from ARAYA_DEPLOYMENT_GUIDE.md

### 4. GitHub Token (File Operations)
- **URL:** https://github.com/settings/tokens
- **Steps:**
  1. Generate new token (classic)
  2. Select scopes: `repo`, `workflow`
  3. Copy token → `GITHUB_TOKEN`

## After Adding Variables

1. **Redeploy** your Netlify site (it will auto-deploy when you push to master)
2. **Wait** 2-3 minutes for deployment to complete
3. **Test** at: https://consciousnessrevolution.io/araya-chat
4. **Check logs** if it doesn't work: Netlify Dashboard > Functions > araya-chat

## Quick Test

After deployment:
1. Visit https://consciousnessrevolution.io/araya-chat
2. Type: "Hello Araya"
3. You should get a response within a few seconds
4. If you see "CONFIG ERROR" - double-check environment variables

## Troubleshooting

### "CONFIG ERROR" appears
- One or more environment variables are missing or incorrect
- Check Netlify function logs for specific missing variables
- Verify spelling of variable names (case-sensitive!)

### "OFFLINE MODE" appears
- Function might not be deployed yet (wait a few minutes)
- Or there's a different error - check function logs

### No response at all
- Check browser console (F12) for errors
- Verify domain is pointing to Netlify
- Check Netlify function logs

## Cost Estimate

For moderate usage (30 messages/day):
- DeepSeek: ~$3-5/month
- Anthropic: ~$5-10/month
- Supabase: Free tier (sufficient)
- Total: **~$8-15/month**

## Need Help?

- Read full guide: [ARAYA_DEPLOYMENT_GUIDE.md](ARAYA_DEPLOYMENT_GUIDE.md)
- Check function logs: Netlify Dashboard > Functions > araya-chat
- Create an issue: https://github.com/overkor-tek/consciousness-revolution/issues

## Security Warning

⚠️ **Keep API keys secret!**
- Never commit keys to the repository
- Only add them in Netlify dashboard
- Rotate keys if accidentally exposed
