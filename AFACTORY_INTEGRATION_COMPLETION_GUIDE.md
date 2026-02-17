# AFactory Integration Completion Guide

## Overview

This guide provides step-by-step instructions for completing the pending AFactory integrations that require additional configuration.

---

## Integration Status Matrix

| Integration | Status | Priority | Complexity | Estimated Time |
|-------------|--------|----------|------------|----------------|
| Gumroad (Digital Products) | ✅ Complete | - | - | - |
| Medium (Content) | ✅ Complete | - | - | - |
| Printful (Merchandise) | ⚠️ Pending | High | Medium | 4-6 hours |
| YouTube (Video) | ⚠️ Pending | High | High | 6-8 hours |
| SaaS Platform | ⚠️ Pending | Medium | High | 8-12 hours |
| Stock Photography | ⚠️ Pending | Low | Low | 2-3 hours |
| Email Marketing | ⚠️ Pending | Medium | Low | 2-4 hours |

---

## 1. Printful Integration (Merchandise)

### Current Status
**Pending**: Design file upload system needed

### Requirements
1. File upload handler for design images
2. Product template configuration
3. Printful API integration
4. Order fulfillment webhook

### Implementation Steps

#### Step 1: Create File Upload System

```javascript
// Add to src/utils/file-uploader.js
class FileUploader {
    constructor(config = {}) {
        this.allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        this.maxSize = 10 * 1024 * 1024; // 10MB
        this.storageEndpoint = config.storageEndpoint || '/api/upload';
    }

    async uploadDesign(file) {
        // Validate file
        if (!this.allowedTypes.includes(file.type)) {
            throw new Error(`Invalid file type. Allowed: ${this.allowedTypes.join(', ')}`);
        }

        if (file.size > this.maxSize) {
            throw new Error(`File too large. Max size: ${this.maxSize / 1024 / 1024}MB`);
        }

        // Upload to storage
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'printful-design');

        const response = await fetch(this.storageEndpoint, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();
        return result.url;
    }
}

module.exports = FileUploader;
```

#### Step 2: Update AFactory Integration

```javascript
// Update in src/systems/afactory-integrations.js

async createMerchandise(productData) {
    const { niche, productType, design } = productData;
    
    // Upload design if file provided
    let designUrl = design.url;
    if (design.file) {
        const uploader = new FileUploader();
        designUrl = await uploader.uploadDesign(design.file);
    }

    // Create product on Printful
    if (this.config.enableRealIntegrations && !this.config.dryRun) {
        const response = await fetch('https://api.printful.com/store/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.printfulApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sync_product: {
                    name: productData.title,
                    thumbnail: designUrl
                },
                sync_variants: [{
                    retail_price: productData.price,
                    variant_id: 4011, // Unisex T-shirt
                    files: [{
                        url: designUrl
                    }]
                }]
            })
        });

        const result = await response.json();
        
        return {
            success: true,
            productId: result.result.id,
            productUrl: result.result.external_url,
            platform: 'printful',
            mode: 'live'
        };
    }

    // Dry run response
    return {
        success: true,
        productId: `printful_${Date.now()}`,
        designUrl,
        platform: 'printful',
        mode: 'dry_run'
    };
}
```

#### Step 3: Add Backend Upload Endpoint

```javascript
// Create netlify/functions/upload-design.js

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Parse multipart form data
        const contentType = event.headers['content-type'];
        // ... multipart parsing logic ...

        // Upload to cloud storage (AWS S3, Cloudinary, etc.)
        const uploadResult = await uploadToStorage(file);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                url: uploadResult.url
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
```

#### Step 4: Configure Printful API Key

```bash
# Add to .env
PRINTFUL_API_KEY=your_printful_api_key_here

# Add to netlify.toml or Netlify dashboard
[build.environment]
  PRINTFUL_API_KEY = "your_printful_api_key"
```

### Testing Printful Integration

```javascript
// Test script
const integrations = new AFactoryIntegrations({
    printfulApiKey: process.env.PRINTFUL_API_KEY,
    enableRealIntegrations: true,
    dryRun: true // Start with dry run
});

await integrations.init();

const result = await integrations.createMerchandise({
    niche: 'test',
    productType: 't-shirt',
    title: 'Test Product',
    description: 'Test description',
    price: 29.99,
    design: {
        url: 'https://example.com/design.png'
    }
});

console.log('Result:', result);
```

---

## 2. YouTube Integration (Video Content)

### Current Status
**Pending**: OAuth2 flow and video upload needed

### Requirements
1. Google OAuth2 setup
2. YouTube Data API v3 credentials
3. Video file upload system
4. Metadata management

### Implementation Steps

#### Step 1: Set Up Google OAuth2

```javascript
// Add to src/auth/google-oauth.js

const { google } = require('googleapis');

class GoogleOAuth {
    constructor(config) {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
        );
    }

    getAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/youtube.upload',
                'https://www.googleapis.com/auth/youtube'
            ]
        });
    }

    async getTokenFromCode(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        return tokens;
    }

    setCredentials(tokens) {
        this.oauth2Client.setCredentials(tokens);
    }

    getClient() {
        return this.oauth2Client;
    }
}

module.exports = GoogleOAuth;
```

#### Step 2: Create OAuth Flow Endpoints

```javascript
// netlify/functions/youtube-auth-start.js

const GoogleOAuth = require('../../src/auth/google-oauth');

exports.handler = async (event) => {
    const oauth = new GoogleOAuth();
    const authUrl = oauth.getAuthUrl();

    return {
        statusCode: 302,
        headers: {
            Location: authUrl
        }
    };
};
```

```javascript
// netlify/functions/youtube-auth-callback.js

const GoogleOAuth = require('../../src/auth/google-oauth');

exports.handler = async (event) => {
    const { code } = event.queryStringParameters;
    
    if (!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No authorization code' })
        };
    }

    try {
        const oauth = new GoogleOAuth();
        const tokens = await oauth.getTokenFromCode(code);

        // Store tokens securely (database, encrypted storage, etc.)
        await storeTokens(tokens);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'YouTube account connected'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
```

#### Step 3: Implement Video Upload

```javascript
// Update in src/systems/afactory-integrations.js

const { google } = require('googleapis');
const fs = require('fs');

async createVideoContent(videoData) {
    const { niche, topic, videoFile, metadata } = videoData;

    if (!this.config.enableRealIntegrations || this.config.dryRun) {
        return {
            success: true,
            videoId: `dry_run_${Date.now()}`,
            platform: 'youtube',
            mode: 'dry_run',
            note: 'Video file and OAuth2 needed for full implementation'
        };
    }

    try {
        // Get OAuth client
        const oauth = new GoogleOAuth();
        const tokens = await retrieveStoredTokens();
        oauth.setCredentials(tokens);

        // Initialize YouTube API
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth.getClient()
        });

        // Upload video
        const videoUpload = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: metadata.title,
                    description: metadata.description,
                    tags: metadata.tags,
                    categoryId: '22' // People & Blogs
                },
                status: {
                    privacyStatus: metadata.privacy || 'public'
                }
            },
            media: {
                body: fs.createReadStream(videoFile)
            }
        });

        return {
            success: true,
            videoId: videoUpload.data.id,
            videoUrl: `https://youtube.com/watch?v=${videoUpload.data.id}`,
            platform: 'youtube',
            mode: 'live'
        };

    } catch (error) {
        console.error('YouTube upload failed:', error);
        throw error;
    }
}
```

#### Step 4: Configure Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

```bash
# Add to .env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-site.netlify.app/.netlify/functions/youtube-auth-callback
```

### Testing YouTube Integration

```bash
# 1. Start OAuth flow
curl https://your-site.netlify.app/.netlify/functions/youtube-auth-start

# 2. Complete OAuth in browser

# 3. Test video upload (after authentication)
node -e "
  const integrations = require('./src/systems/afactory-integrations');
  const i = new integrations({ enableRealIntegrations: true });
  
  i.createVideoContent({
    videoFile: './test-video.mp4',
    metadata: {
      title: 'Test Video',
      description: 'Test upload',
      tags: ['test']
    }
  }).then(console.log);
"
```

---

## 3. Stock Photography Integration

### Current Status
**Pending**: Media file upload system needed

### Requirements
1. High-resolution image support
2. Metadata tagging system
3. Multiple platform uploads (Shutterstock, Adobe Stock, etc.)
4. Royalty tracking

### Implementation Steps

#### Step 1: Create Media Uploader

```javascript
// src/utils/stock-photo-uploader.js

class StockPhotoUploader {
    constructor(config) {
        this.platforms = {
            shutterstock: {
                apiKey: config.shutterstockApiKey,
                endpoint: 'https://api.shutterstock.com/v2/images'
            },
            adobestock: {
                apiKey: config.adobeStockApiKey,
                endpoint: 'https://stock.adobe.io/Rest/Media/1/Files'
            }
        };
    }

    async uploadToShutterstock(file, metadata) {
        // Implementation for Shutterstock upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', metadata.title);
        formData.append('description', metadata.description);
        formData.append('keywords', metadata.keywords.join(','));

        const response = await fetch(this.platforms.shutterstock.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.platforms.shutterstock.apiKey}`
            },
            body: formData
        });

        return await response.json();
    }

    async uploadToMultiplePlatforms(file, metadata) {
        const results = [];

        for (const [platform, config] of Object.entries(this.platforms)) {
            try {
                const result = await this[`uploadTo${platform.charAt(0).toUpperCase() + platform.slice(1)}`](file, metadata);
                results.push({ platform, success: true, result });
            } catch (error) {
                results.push({ platform, success: false, error: error.message });
            }
        }

        return results;
    }
}

module.exports = StockPhotoUploader;
```

#### Step 2: Update AFactory Integration

```javascript
async uploadStockPhotos(photoData) {
    const { photos, metadata } = photoData;

    if (!this.config.enableRealIntegrations || this.config.dryRun) {
        return {
            success: true,
            uploadedCount: photos.length,
            platform: 'shutterstock',
            mode: 'dry_run',
            note: 'Media files needed for upload'
        };
    }

    const uploader = new StockPhotoUploader({
        shutterstockApiKey: this.config.shutterstockApiKey,
        adobeStockApiKey: this.config.adobeStockApiKey
    });

    const results = [];
    for (const photo of photos) {
        const result = await uploader.uploadToMultiplePlatforms(photo.file, {
            title: photo.title,
            description: photo.description,
            keywords: photo.keywords
        });
        results.push(result);
    }

    return {
        success: true,
        uploads: results,
        totalUploaded: results.filter(r => r.some(p => p.success)).length,
        platform: 'multiple',
        mode: 'live'
    };
}
```

---

## 4. Email Marketing Integration

### Current Status
**Pending**: Campaign template system needed

### Requirements
1. Email template builder
2. Subscriber list management
3. Campaign scheduling
4. Analytics tracking

### Implementation Steps

```javascript
// src/systems/email-campaigns.js

class EmailCampaignManager {
    constructor(config) {
        this.mailchimpApiKey = config.mailchimpApiKey;
        this.apiEndpoint = 'https://us1.api.mailchimp.com/3.0';
    }

    async createCampaign(campaignData) {
        const { listId, subject, content, schedule } = campaignData;

        const response = await fetch(`${this.apiEndpoint}/campaigns`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.mailchimpApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'regular',
                recipients: { list_id: listId },
                settings: {
                    subject_line: subject,
                    from_name: campaignData.fromName,
                    reply_to: campaignData.replyTo
                }
            })
        });

        const campaign = await response.json();

        // Set campaign content
        await this.setCampaignContent(campaign.id, content);

        // Schedule if requested
        if (schedule) {
            await this.scheduleCampaign(campaign.id, schedule);
        }

        return campaign;
    }

    async setCampaignContent(campaignId, content) {
        return await fetch(`${this.apiEndpoint}/campaigns/${campaignId}/content`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.mailchimpApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ html: content })
        });
    }

    async scheduleCampaign(campaignId, scheduleTime) {
        return await fetch(`${this.apiEndpoint}/campaigns/${campaignId}/actions/schedule`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.mailchimpApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ schedule_time: scheduleTime })
        });
    }
}

module.exports = EmailCampaignManager;
```

---

## Environment Variables Checklist

Add these to your `.env` file:

```env
# Printful
PRINTFUL_API_KEY=your_printful_api_key

# YouTube (Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-site/.netlify/functions/youtube-auth-callback

# Stock Photography
SHUTTERSTOCK_API_KEY=your_shutterstock_key
ADOBE_STOCK_API_KEY=your_adobe_stock_key

# Email Marketing
MAILCHIMP_API_KEY=your_mailchimp_key
MAILCHIMP_LIST_ID=your_default_list_id

# File Storage (choose one)
AWS_S3_BUCKET=your_s3_bucket
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
# OR
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## Testing Procedure

### 1. Dry Run Mode (Safe Testing)

```javascript
const integrations = new AFactoryIntegrations({
    printfulApiKey: process.env.PRINTFUL_API_KEY,
    youtubeApiKey: process.env.GOOGLE_CLIENT_ID,
    enableRealIntegrations: true,
    dryRun: true  // No actual API calls
});

await integrations.init();

// Test each integration
const printfulResult = await integrations.createMerchandise({...});
const youtubeResult = await integrations.createVideoContent({...});
const stockResult = await integrations.uploadStockPhotos({...});
const emailResult = await integrations.createEmailCampaign({...});
```

### 2. Live Mode (Production)

```javascript
const integrations = new AFactoryIntegrations({
    printfulApiKey: process.env.PRINTFUL_API_KEY,
    enableRealIntegrations: true,
    dryRun: false  // Real API calls
});
```

---

## Deployment Checklist

- [ ] All API keys configured in environment variables
- [ ] OAuth flows tested in development
- [ ] File upload system tested with sample files
- [ ] Webhooks configured for order fulfillment
- [ ] Error handling tested for all edge cases
- [ ] Rate limiting configured for API calls
- [ ] Monitoring and logging enabled
- [ ] Documentation updated
- [ ] Security audit completed

---

## Support

For questions or issues:
- **Email**: BarbrickDesign@gmail.com
- **Documentation**: See `API_SERVER_INTEGRATION_GUIDE.md`
- **Validation**: Run `node scripts/validate-api-config.js`

---

**Last Updated**: 2026-02-17
**Version**: 1.0.0
