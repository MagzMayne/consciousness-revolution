# AI Filter Social Media Platform Support

## Overview

The AI Filter (`aiFilter.html`) is a comprehensive client-side tool designed to detect and filter AI-generated content across all major social media platforms. It works as a bookmarklet or can be injected directly into any webpage.

## Supported Platforms

The filter includes optimized platform-specific detection for:

### 1. **Twitter/X** 🐦
- **Domains**: `twitter.com`, `x.com`
- **Detects**: Tweet photos, videos, profile images
- **Selectors**: Tweet containers, video players, article images
- **Features**: Real-time timeline scanning, retweet detection

### 2. **Facebook** 👥
- **Domains**: `facebook.com`, `fb.com`
- **Detects**: Post images, videos, shared media
- **Selectors**: Visual completion images, video containers, role-based images
- **Features**: Infinite scroll support, dynamic feed updates

### 3. **Instagram** 📸
- **Domains**: `instagram.com`
- **Detects**: Feed posts, stories, reels, profile pictures
- **Selectors**: Article images/videos, inline videos
- **Features**: Story detection, reel scanning

### 4. **TikTok** 🎵
- **Domains**: `tiktok.com`
- **Detects**: Video content, thumbnails
- **Selectors**: Video containers, inline videos
- **Features**: For You page scanning, profile video detection

### 5. **YouTube** 📺
- **Domains**: `youtube.com`, `youtu.be`
- **Detects**: Video thumbnails, Shorts, main video player
- **Selectors**: Thumbnail images, HTML5 video, Shorts player
- **Features**: Recommendation scanning, sidebar detection

### 6. **LinkedIn** 💼
- **Domains**: `linkedin.com`
- **Detects**: Post images, articles, profile pictures
- **Selectors**: Delayed URL images, video content
- **Features**: Feed scanning, article image detection

### 7. **Reddit** 🤖
- **Domains**: `reddit.com`
- **Detects**: Post images, videos, thumbnails
- **Selectors**: Post images, media elements, Shreddit player
- **Features**: Old and new Reddit support, infinite scroll

### 8. **Pinterest** 📌
- **Domains**: `pinterest.com`, `pin.it`
- **Detects**: Pin images, board content
- **Selectors**: Pin test images, video players
- **Features**: Grid layout scanning, lazy loading support

### 9. **Threads** 🧵
- **Domains**: `threads.net`
- **Detects**: Post images, videos
- **Selectors**: Article containers, inline videos
- **Features**: Feed scanning, reply detection

### 10. **Snapchat** 👻
- **Domains**: `snapchat.com`
- **Detects**: Profile pictures, web content
- **Selectors**: Profile images, video content
- **Features**: Web interface support

## How It Works

### Platform Detection
The filter automatically detects which platform you're on by analyzing the current domain:

```javascript
// Example: Detected on Twitter
Platform: Twitter/X
Using optimized selectors for tweets and media
```

### Detection Methods

1. **Metadata Analysis**
   - Checks EXIF data for AI model information
   - Scans for Content Credentials (C2PA)
   - Looks for XMP/IPTC metadata hints

2. **Keyword Detection**
   - Scans alt text, titles, and descriptions
   - Detects mentions of: Midjourney, DALL-E, Stable Diffusion, etc.
   - Context-aware: checks surrounding text

3. **Content Credentials**
   - Adobe Content Credentials support
   - C2PA provenance markers
   - Digital watermark detection

4. **Heuristic Analysis**
   - File header scanning
   - Pattern recognition in metadata
   - Aggressive mode for comprehensive detection

### Dynamic Content Handling

- **Infinite Scroll**: Automatically detects new content as you scroll
- **Lazy Loading**: Waits for images to load before scanning
- **MutationObserver**: Monitors DOM changes in real-time
- **Performance Optimized**: Processes content efficiently without slowing down pages

## Usage

### As a Bookmarklet

1. Visit https://barbrickdesign.github.io/aiFilter.html
2. Configure your filter settings (Tag, Hide, or Allow)
3. Set strictness level (Permissive, Moderate, Strict)
4. Click "📥 Show Bookmarklet"
5. Copy and save as a browser bookmark
6. Visit any social media site
7. Click your bookmark to activate the filter

### Direct Injection

```javascript
// Include the filter script
<script src="https://barbrickdesign.github.io/aiFilter.html"></script>

// Boot the filter
window.__aiFilterBoot();
```

### Settings

#### Display Modes
- **Allow All**: No filtering, just detection
- **Tag AI Content**: Shows a visible "AI-generated" label
- **Hide AI Content**: Replaces AI content with a placeholder

#### Strictness Levels
- **Permissive**: Minimal filtering, only confirmed AI
- **Moderate**: Balanced approach (recommended)
- **Strict**: Maximum filtering, may have false positives

#### Additional Options
- **Aggressive Detection**: Enables more sensitive detection (may flag non-AI content)
- **Parental Controls**: PIN-protected settings with activity logging

## Features

### ✅ Fully Functional Features

- ✅ Platform-specific optimized selectors
- ✅ Real-time content scanning
- ✅ Infinite scroll support
- ✅ Lazy loading detection
- ✅ Dynamic content observer
- ✅ Platform badge display
- ✅ Activity logging
- ✅ Parental controls with PIN
- ✅ Privacy-focused (all client-side)
- ✅ Mobile responsive design
- ✅ Bookmarklet support
- ✅ Generic fallback for unsupported sites

### Privacy & Security

- **100% Client-Side**: All processing happens in your browser
- **No Data Upload**: Images are never sent to any server
- **No Tracking**: No analytics or user tracking
- **Open Source**: Code is transparent and auditable
- **Parental Controls**: PIN-protected settings for family use

## Performance

- **Lightweight**: <50KB total size
- **Fast Scanning**: Processes media in milliseconds
- **Non-Blocking**: Doesn't slow down page load
- **Memory Efficient**: Minimal memory footprint
- **Optimized Selectors**: Platform-specific queries reduce overhead

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Brave
- ✅ Opera
- ⚠️ Mobile browsers (bookmarklets may be limited)

## Testing

Run the comprehensive test suite:
```
https://barbrickdesign.github.io/test-aifilter-platforms.html
```

Tests include:
- Platform detection verification
- Media scanning accuracy
- Dynamic content observer
- Performance benchmarks

## Limitations

1. **Accuracy**: Detection is not 100% accurate and depends on metadata availability
2. **False Positives**: Aggressive mode may flag non-AI content
3. **False Negatives**: Some AI content without metadata may not be detected
4. **Platform Changes**: Social media platforms update frequently; selectors may need updates
5. **CSP Restrictions**: Some sites with strict Content Security Policies may block bookmarklets

## Future Enhancements

- [ ] Machine learning-based visual detection
- [ ] Blockchain verification integration
- [ ] Browser extension version
- [ ] API for developers
- [ ] Batch processing mode
- [ ] Advanced reporting dashboard

## Support

- **Creator**: Ryan Barbrick (BarbrickDesign)
- **Email**: BarbrickDesign@gmail.com
- **Website**: https://barbrickdesign.github.io
- **GitHub**: https://github.com/barbrickdesign/barbrickdesign.github.io

## Contributing

Found a bug or want to add support for another platform?
- Open an issue on GitHub
- Submit a pull request
- Contact BarbrickDesign@gmail.com

## Donations

If you find this tool useful, consider supporting its development:
- **PayPal**: BarbrickDesign@gmail.com
- **Crypto**: 5hSWosj58ki4A6hSfQrvteQU5QvyCWmhHn4AuqgaQzqr (Solana)

## License

© 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.

This tool is provided as-is for personal use. Commercial use requires permission.

## Changelog

### v2.0 (2026-02-18)
- ✅ Added support for 10 major social media platforms
- ✅ Platform-specific optimized selectors
- ✅ Infinite scroll detection
- ✅ Lazy loading support
- ✅ Platform detection badge
- ✅ Enhanced performance
- ✅ Comprehensive test suite
- ✅ Mobile responsive improvements

### v1.0 (2025)
- Initial release
- Generic media detection
- Bookmarklet support
- Parental controls
