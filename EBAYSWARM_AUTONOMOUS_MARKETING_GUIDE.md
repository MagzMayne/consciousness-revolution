# eBay Swarm Autonomous Marketing System - User Guide

## Overview

The eBay Swarm Autonomous Marketing System enables fully automated marketing operations for your eBay store. Once configured, the system will automatically:

- **Fetch listings** from your eBay store on a schedule
- **Generate marketing content** for social media platforms
- **Optimize listings** with AI-powered recommendations
- **Create promotional campaigns** automatically
- **Build social proof** through automated messaging

## Quick Start

### 1. Enable Autonomous Mode

1. Open [ebaySwarm.html](https://barbrickdesign.github.io/ebaySwarm.html)
2. Navigate to the **Autonomous** tab
3. Click **"Enable Autonomous Mode"** button
4. The system will automatically start monitoring and executing marketing tasks

### 2. Configure Schedule

**Default Settings** (recommended for most users):
- Listing Fetch Interval: 24 hours
- Marketing Run Interval: 6 hours

**To Customize**:
1. Go to **Autonomous** tab
2. Adjust **Listing Fetch Interval** (1-168 hours)
3. Adjust **Marketing Run Interval** (1-72 hours)
4. Click **Save Schedule**

### 3. Select Marketing Agents

Choose which marketing agents run automatically:

- ✅ **Traffic Engine** (Social Media Content) - Recommended
- ✅ **Listing Optimizer** - Recommended
- ✅ **Promo & Pricing** - Recommended
- ☐ **Social Proof** - Optional

Click **Save Schedule** after making changes.

## Features

### Autonomous Mode

When enabled, the system runs in the background and performs tasks automatically according to your schedule.

**Status Indicators**:
- 🟢 **Green**: Autonomous mode active
- ⚪ **Gray**: Autonomous mode disabled

### Automatic Listing Fetch

The system automatically checks for new listings from your eBay store.

**How it Works**:
1. Every X hours (configurable), the system fetches your store's RSS feed
2. New listings are automatically discovered and added
3. Existing listings are updated with current information
4. You'll see a notification in the autonomous log

**Configuration**:
- **Interval**: 1-168 hours (default: 24 hours)
- **Recommendation**: 24 hours for active stores, 48-72 hours for stable inventories

### Automatic Marketing Campaigns

The system automatically runs selected marketing agents for your listings.

**What Gets Automated**:

1. **Traffic Engine**
   - Generates social media content for TikTok, Instagram, Twitter, Reddit
   - Creates platform-specific posts with hooks and CTAs
   - Rotates through different platforms automatically

2. **Listing Optimizer**
   - Analyzes listing titles and descriptions
   - Provides keyword optimization recommendations
   - Suggests image improvements

3. **Promo & Pricing**
   - Creates promotional campaigns
   - Develops pricing strategies
   - Generates urgency and scarcity tactics

4. **Social Proof**
   - Creates post-purchase follow-up messages
   - Generates review request templates
   - Builds trust-building content

**How it Works**:
1. Every X hours (configurable), the system runs a marketing cycle
2. It processes up to 3 listings per cycle (to avoid API rate limits)
3. Selected agents run for each listing
4. Results are saved and can be viewed in the Results tab
5. Progress is logged in the autonomous activity log

**Configuration**:
- **Interval**: 1-72 hours (default: 6 hours)
- **Recommendation**: 6-12 hours for active marketing, 24 hours for maintenance

### Activity Monitoring

**Autonomous Activity Log**:
- Shows all automated actions
- Color-coded by result type (success, error, info)
- Keeps last 100 entries
- Updates in real-time

**Statistics Dashboard**:
- **Last Listing Check**: When listings were last fetched
- **Last Marketing Run**: When marketing cycle last executed
- **Autonomous Actions Today**: Count of all automated actions today
- **Marketing Content Generated**: Total marketing pieces created

## Manual Controls

### Force Marketing Cycle

Even with autonomous mode enabled, you can manually trigger a marketing cycle:

1. Go to **Autonomous** tab
2. Click **"Run Marketing Cycle Now"**
3. The system will immediately process your listings

This is useful for:
- Testing your configuration
- Generating content on demand
- Responding to urgent needs

### Disable Autonomous Mode

To temporarily stop autonomous operations:

1. Go to **Autonomous** tab
2. Click **"Disable Autonomous Mode"**
3. The system stops all automatic tasks
4. You can still run agents manually from the Agents tab

Your configuration is saved and will be restored when you re-enable.

## Best Practices

### Scheduling Recommendations

**New Store (0-10 listings)**:
- Listing Fetch: 12 hours
- Marketing Run: 12 hours
- Agents: Traffic, Optimizer

**Active Store (10-50 listings)**:
- Listing Fetch: 24 hours
- Marketing Run: 6 hours
- Agents: Traffic, Optimizer, Promo

**Established Store (50+ listings)**:
- Listing Fetch: 48 hours
- Marketing Run: 12 hours
- Agents: All enabled

### API Rate Limiting

The system includes built-in rate limiting:
- **2-second delay** between agent calls
- **3 listings** processed per marketing cycle
- **Hourly checks** prevent excessive API usage

**Groq API Limits**:
- Free tier: 14,400 requests/day
- Each marketing cycle uses approximately 3-12 requests
- With default settings (6-hour intervals), you'll use ~48-192 requests/day

### Content Review

While the system generates content automatically, you should:

1. **Review Results** in the Results tab regularly
2. **Customize Content** before posting to social media
3. **Track Performance** of different agent outputs
4. **Adjust Configuration** based on what works best

## Troubleshooting

### Autonomous Mode Won't Start

**Symptoms**: Enable button doesn't work, status stays gray

**Solutions**:
1. Check browser console for errors (F12)
2. Verify Groq API key is configured (Configuration tab)
3. Clear localStorage and reload page
4. Ensure you have listings (click "Refresh Listings" first)

### No Marketing Content Generated

**Symptoms**: Autonomous log shows marketing cycles, but no results

**Solutions**:
1. Check if listings were successfully fetched
2. Verify at least one agent is selected (checkboxes)
3. Test API connection (Dashboard → Test API Connection)
4. Check Results tab for error messages
5. Review API rate limits on Groq console

### Marketing Cycle Taking Too Long

**Symptoms**: Marketing cycle runs for extended period

**Solutions**:
1. This is normal - each agent takes 5-15 seconds
2. With 3 agents × 3 listings × 2s delay = ~2-5 minutes
3. Reduce number of enabled agents if needed
4. The cycle won't block other operations

### Listings Not Updating

**Symptoms**: Store has new items, but they don't appear

**Solutions**:
1. Check Last Listing Check time in Autonomous tab
2. Manually click "Refresh Listings" to test
3. Verify store URL in Configuration tab
4. Check autonomous log for fetch errors
5. Ensure autonomous mode is enabled

## Advanced Configuration

### Persistent Storage

All settings are saved to browser localStorage:
- `ebaySwarmAutonomous`: Autonomous mode configuration
- `ebaySwarmAutonomousLog`: Activity log (last 100 entries)
- `ebayStoreListings`: Fetched listings
- `ebaySwarmResults`: Generated marketing content

**To Reset**:
```javascript
// Open browser console (F12) and run:
localStorage.removeItem('ebaySwarmAutonomous');
localStorage.removeItem('ebaySwarmAutonomousLog');
location.reload();
```

### Timing Calculations

**Listing Fetch**:
- System checks every hour if fetch interval has passed
- If `(current_time - last_check) >= fetch_interval`, fetch runs
- Example: 24-hour interval means listings update once per day

**Marketing Cycle**:
- System checks every hour if marketing interval has passed
- If `(current_time - last_run) >= marketing_interval`, cycle runs
- Example: 6-hour interval means marketing runs 4 times per day

### API Usage Estimation

**Per Marketing Cycle**:
- 3 listings × 3 agents = 9 API calls
- Plus 2-second delays = ~30 seconds total

**Daily Usage (6-hour interval)**:
- 4 cycles/day × 9 calls = 36 API calls
- Well within Groq's 14,400/day free limit

**Maximum Usage**:
- Even with 1-hour intervals: 24 cycles × 9 = 216 calls/day
- Still only ~1.5% of free tier limit

## Security & Privacy

### Data Storage

- All data stored locally in your browser
- No data sent to external servers (except Groq API)
- API key stored in browser localStorage
- Listings and results stored locally

### API Key Security

- Your Groq API key is stored locally
- Never shared with third parties
- Only sent to Groq API endpoints
- Displayed as password field in UI

### Recommendations

1. Use a **dedicated API key** for autonomous operations
2. **Monitor usage** on Groq console regularly
3. **Disable autonomous mode** when not actively using the store
4. **Review logs** for any suspicious activity

## FAQ

### Q: Will this post to social media automatically?

**A**: No. The system generates ready-to-use content, but you must manually post it. This gives you control over what gets published.

### Q: How many listings are processed per cycle?

**A**: 3 listings per cycle to avoid API rate limits. If you have more listings, they'll be processed in subsequent cycles.

### Q: Can I run multiple agents simultaneously?

**A**: No. Agents run sequentially to avoid rate limiting and ensure quality results.

### Q: What happens if my computer is off?

**A**: Autonomous operations only run when the browser tab is open. Close the tab to pause operations.

### Q: Can I use this on mobile?

**A**: Yes, but keep in mind:
- Tab must remain active (not in background)
- Battery usage may increase
- Recommend using on desktop for extended autonomous operations

### Q: How do I stop getting so many notifications?

**A**: Autonomous mode logs actions but doesn't create browser notifications. Activity only appears in the Autonomous tab.

### Q: Is my API key safe?

**A**: Yes, it's stored locally in your browser and only sent to Groq's secure API endpoints.

### Q: What if I want different schedules for different listings?

**A**: Current version uses one schedule for all listings. You can manually run agents for specific listings in the Agents tab.

## Support

### Getting Help

1. **Documentation**: Check this guide and other docs in the repository
2. **Browser Console**: Open DevTools (F12) to see detailed error messages
3. **Activity Log**: Review autonomous log for operation details
4. **GitHub Issues**: Report bugs or request features

### Reporting Issues

When reporting issues, include:
- Browser and version
- Autonomous mode configuration
- Last few entries from autonomous log
- Any error messages from browser console
- Steps to reproduce

## Version History

### v1.0 (Current)
- Initial release of autonomous marketing system
- Configurable scheduling
- Multiple agent support
- Activity logging and statistics
- Manual override controls

## Roadmap

Future enhancements may include:
- Per-listing schedules
- A/B testing of marketing content
- Performance analytics
- Integration with more platforms
- Advanced targeting options
- Webhook notifications

---

**Last Updated**: February 8, 2026  
**Author**: Barbrick Design  
**Contact**: BarbrickDesign@gmail.com  
**Live Demo**: https://barbrickdesign.github.io/ebaySwarm.html
