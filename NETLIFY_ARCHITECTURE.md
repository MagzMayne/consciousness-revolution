# Netlify Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                        │
│                 barbrickdesign/barbrickdesign.github.io         │
│                                                                  │
│  📁 Repository Contents:                                        │
│  ├── 529+ HTML files (web projects)                            │
│  ├── CSS, JavaScript, Images                                   │
│  ├── netlify.toml (configuration)                              │
│  ├── _redirects (URL routing)                                  │
│  ├── _headers (security & caching)                             │
│  └── netlify/functions/ (serverless backend)                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ git push
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                          Netlify Platform                        │
│                      https://app.netlify.com                     │
│                                                                  │
│  🔄 Automatic Build Process:                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 1. Detect git push                                      │   │
│  │ 2. Clone repository                                     │   │
│  │ 3. Install dependencies (npm install)                  │   │
│  │ 4. Run build command (npm run build)                   │   │
│  │ 5. Deploy to CDN                                        │   │
│  │ 6. Deploy serverless functions                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  📦 Deployed Components:                                        │
│  ├── Static Files → Global CDN                                 │
│  ├── Functions → AWS Lambda                                    │
│  ├── Redirects → Edge Network                                  │
│  └── Headers → Edge Network                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Live Production Site                      │
│                  https://your-site.netlify.app                  │
│                                                                  │
│  🌐 Request Flow:                                               │
│                                                                  │
│  User Browser                                                   │
│       │                                                          │
│       │ https://your-site.netlify.app/                         │
│       ↓                                                          │
│  ┌─────────────────┐                                           │
│  │  Netlify CDN    │ ← Serves static files (HTML/CSS/JS)      │
│  │  (Global Edge)  │   with caching & security headers        │
│  └────────┬────────┘                                           │
│           │                                                     │
│           │ /api/health                                        │
│           ↓                                                     │
│  ┌─────────────────┐                                           │
│  │  Functions API  │ ← Serverless backend on AWS Lambda       │
│  │  /.netlify/     │   Handles dynamic requests                │
│  │  functions/     │                                            │
│  └─────────────────┘                                           │
│                                                                  │
│  🔒 Security Features:                                          │
│  ✅ HTTPS/SSL (automatic)                                      │
│  ✅ Security headers (CSP, XSS, Frame Options)                 │
│  ✅ DDoS protection                                             │
│  ✅ CDN caching                                                 │
│                                                                  │
│  ⚡ Performance:                                                │
│  ✅ Global CDN (150+ locations)                                │
│  ✅ Asset optimization                                          │
│  ✅ Instant cache invalidation                                 │
│  ✅ HTTP/2 & HTTP/3                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Deployment Environments                      │
│                                                                  │
│  Production:                                                     │
│  ├── Branch: main                                               │
│  ├── URL: https://your-site.netlify.app                        │
│  └── Auto-deploy: On push to main                              │
│                                                                  │
│  Preview:                                                        │
│  ├── Trigger: Pull Request                                     │
│  ├── URL: https://deploy-preview-{pr-number}--your-site...    │
│  └── Auto-deploy: On PR creation/update                        │
│                                                                  │
│  Branch Deploy:                                                  │
│  ├── Branch: Any branch                                         │
│  ├── URL: https://{branch}--your-site.netlify.app             │
│  └── Auto-deploy: Configurable                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Configuration Files                         │
│                                                                  │
│  netlify.toml:                                                   │
│  ├── Build settings (command, publish dir)                     │
│  ├── Environment variables (NODE_VERSION, etc)                 │
│  ├── Redirect rules                                             │
│  ├── Header configuration                                       │
│  └── Deploy contexts (production, preview)                     │
│                                                                  │
│  _redirects:                                                     │
│  ├── /api/* → /.netlify/functions/:splat                       │
│  └── /* → /index.html (SPA fallback)                           │
│                                                                  │
│  _headers:                                                       │
│  ├── Security headers (all routes)                             │
│  ├── Cache headers (static assets)                             │
│  └── CORS headers (API routes)                                 │
│                                                                  │
│  netlify/functions/:                                            │
│  ├── health.js (health check endpoint)                         │
│  ├── api-proxy.js (API proxy example)                          │
│  └── [your-functions].js (custom serverless functions)         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Monitoring & Analytics                      │
│                                                                  │
│  Netlify Dashboard:                                              │
│  ├── 📊 Site analytics (traffic, bandwidth)                    │
│  ├── 📝 Deploy logs (build output, errors)                     │
│  ├── ⚡ Function logs (execution, errors)                       │
│  ├── 📧 Form submissions (if enabled)                           │
│  └── 🔔 Build notifications (email, webhook)                   │
└─────────────────────────────────────────────────────────────────┘

Key Benefits:
✅ One-click deployment from GitHub
✅ Automatic HTTPS/SSL certificates
✅ Global CDN for fast loading
✅ Serverless functions for backend
✅ Preview deployments for PRs
✅ Zero-downtime deployments
✅ Automatic builds on git push
✅ Built-in security features
✅ Custom domain support
✅ Free tier available
```

## How It Works

1. **Push to GitHub** - Commit and push code changes
2. **Netlify Detects** - Webhook triggers build
3. **Build Process** - Installs deps, runs build command
4. **Deploy to CDN** - Static files distributed globally
5. **Functions Deploy** - Backend services to AWS Lambda
6. **Live Site** - Available at your Netlify URL

## URL Structure

```
Production:     https://your-site.netlify.app/
                https://your-site.netlify.app/index.html
                https://your-site.netlify.app/dashboard.html

API Endpoints:  https://your-site.netlify.app/api/health
                https://your-site.netlify.app/api/proxy

Functions:      https://your-site.netlify.app/.netlify/functions/health
```

## Cost Estimate

**Free Tier Includes:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- HTTPS/SSL included
- Basic analytics

**Perfect for this repository!** 529 projects fit well within free tier limits.

---

For more details, see [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md)
