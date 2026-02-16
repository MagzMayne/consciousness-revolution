# Netlify Deployment Guide

This repository is configured for deployment on **Netlify** (https://app.netlify.com/).

## 🚀 Quick Deployment

### Option 1: Deploy to Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/barbrickdesign/barbrickdesign.github.io)

### Option 2: Manual Deployment

1. **Sign up/Login to Netlify**
   - Go to https://app.netlify.com/
   - Sign up for a free account or login

2. **Connect your repository**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select `barbrickdesign/barbrickdesign.github.io` repository

3. **Configure build settings**
   - Build command: `npm install && npm run build`
   - Publish directory: `.` (entire repository)
   - The settings are already configured in `netlify.toml`

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

## ⚙️ Configuration

### Files

- **`netlify.toml`** - Main Netlify configuration file with build settings, redirects, and headers
- **`_redirects`** - Additional redirect rules (alternative to netlify.toml)
- **`_headers`** - Additional header configuration for security and caching
- **`netlify/functions/`** - Serverless functions directory

### Environment Variables

To configure environment variables in Netlify:

1. Go to your site in Netlify dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

#### Required Variables

```
NODE_VERSION=18
NPM_VERSION=9
NODE_ENV=production
```

#### Optional Variables (if using backend services)

```
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_API=your_paypal_api_key
API_KEY=your_api_key
```

See `.env.example` for complete list of environment variables.

## 🔧 Netlify Functions

Serverless functions are located in `netlify/functions/` directory.

### Available Functions

- **`/api/health`** - Health check endpoint

### Creating New Functions

1. Create a new file in `netlify/functions/`
2. Export a handler function:

```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' })
  };
};
```

3. Access at `/.netlify/functions/your-function-name` or `/api/your-function-name`

## 🔄 Continuous Deployment

Netlify automatically deploys your site when you push to GitHub:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests automatically get preview deployments
- **Branch deploys**: Other branches can be configured for deployment

## 🧪 Testing Locally

Test your Netlify site locally before deploying:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Start local dev server
netlify dev
```

This will run your site at `http://localhost:8888` with Netlify functions available.

## 📊 Monitoring

After deployment, you can monitor your site in Netlify dashboard:

- **Analytics**: Site traffic and performance
- **Functions**: Serverless function logs and usage
- **Deploy logs**: Build and deploy history
- **Forms**: Form submissions (if using Netlify forms)

## 🔒 Security

The site is configured with security headers:

- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content Security Policy
- HSTS (Strict-Transport-Security)

## 🚀 Performance

Static assets are cached with long expiration times:
- CSS/JS/Images: 1 year
- HTML: 1 hour
- Service worker: No cache

## 📝 Custom Domain

To use a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow the instructions to configure DNS

## 🆘 Troubleshooting

### Build Failures

1. Check the deploy log in Netlify dashboard
2. Verify Node.js version matches (18.x)
3. Ensure all dependencies are in `package.json`
4. Test build locally: `npm run build`

### Function Errors

1. Check function logs in Netlify dashboard
2. Test functions locally: `netlify functions:invoke health`
3. Verify environment variables are set

### 404 Errors

- Make sure `_redirects` file is in the root directory
- Check that `netlify.toml` has proper redirect configuration
- Verify publish directory is set to `.`

## 📚 Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Environment Variables](https://docs.netlify.com/environment-variables/overview/)

## 🤝 Support

For issues or questions:
- Email: BarbrickDesign@gmail.com
- GitHub Issues: https://github.com/barbrickdesign/barbrickdesign.github.io/issues

---

**© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.**
