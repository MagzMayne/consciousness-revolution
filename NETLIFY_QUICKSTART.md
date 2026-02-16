# Netlify Quick Start Guide

## 🚀 Deploy in 3 Steps

### Step 1: Go to Netlify
Visit https://app.netlify.com/ and sign up/login

### Step 2: Import Repository
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **GitHub**
3. Select `barbrickdesign/barbrickdesign.github.io`

### Step 3: Deploy
Click **"Deploy site"** - that's it! 

Netlify will automatically use the settings from `netlify.toml`

## ✅ What Gets Deployed

- ✅ All 529+ web projects
- ✅ HTML, CSS, JavaScript files
- ✅ Images and assets
- ✅ Backend services (as serverless functions)
- ✅ API endpoints via `/api/*`

## 🔧 Pre-configured Settings

Everything is already configured! The repository includes:

- **`netlify.toml`** - Build and deployment settings
- **`_redirects`** - URL routing rules
- **`_headers`** - Security and caching headers
- **`netlify/functions/`** - Serverless backend functions

## 🧪 Test Before Deploy

```bash
# Validate configuration
npm run netlify:validate

# Test build
npm run build

# Check Node version
node --version  # Should be 16+ (18 recommended)
```

## 🌐 After Deployment

Your site will be live at: `https://your-site-name.netlify.app`

You can:
- ✅ View deployment logs
- ✅ Set up custom domain
- ✅ Configure environment variables
- ✅ Enable form submissions
- ✅ View analytics

## 🔐 Environment Variables

If your site uses backend services, add these in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Add required variables (see `.env.example`)

Common variables:
```
NODE_VERSION=18
NODE_ENV=production
PAYPAL_CLIENT_ID=your_client_id
API_KEY=your_api_key
```

## 🔄 Continuous Deployment

Every time you push to GitHub:
- ✅ Netlify automatically builds and deploys
- ✅ Pull requests get preview deployments
- ✅ Failed builds don't affect production

## 📊 Monitoring

After deployment, check:
- **Functions logs** - `/functions` in Netlify dashboard
- **Deploy logs** - See build output and errors
- **Analytics** - Site traffic and performance

## 🆘 Common Issues

### Build Failed?
- Check Node.js version (must be 16+)
- Verify `package.json` has all dependencies
- Review deploy logs in Netlify dashboard

### 404 Errors?
- Ensure `_redirects` file exists
- Check `netlify.toml` redirect configuration

### Functions Not Working?
- Verify functions are in `netlify/functions/`
- Check function exports `handler`
- Review function logs in dashboard

## 📚 Full Documentation

- **[Complete Guide](NETLIFY_DEPLOYMENT.md)** - Detailed instructions
- **[Functions Guide](netlify/functions/README.md)** - Serverless functions docs
- **[Netlify Docs](https://docs.netlify.com/)** - Official documentation

## 🆘 Need Help?

Contact: BarbrickDesign@gmail.com

---

**© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.**
