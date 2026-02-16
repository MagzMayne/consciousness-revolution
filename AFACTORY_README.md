---
layout: default
title: AFACTORY README
---

# Autonomous Agent Factory - aFactory.html

## 🚀 Live URL
**Access the Agent Factory:** https://barbrickdesign.github.io/aFactory.html

## 💰 Passive Income System

The Autonomous Agent Factory is a self-contained, browser-based system that generates passive income through 8 different business lines managed by AI agents.

### Revenue Destination
**All revenue is routed to:** `BarbrickDesign@gmail.com` via PayPal

### Features

#### 🤖 8 Manager Agents
Each manager oversees a specific business line:

1. **M1_DigitalProducts** - Digital product ideas (Notion templates, spreadsheets, etc.)
2. **M2_AffiliateContent** - Affiliate marketing articles and content
3. **M3_Courses** - Online course creation and outlines
4. **M4_POD** - Print-on-demand design concepts
5. **M5_YouTube** - YouTube automation video ideas
6. **M6_MicroSaaS** - Micro SaaS feature development
7. **M7_StockMedia** - Stock media creation plans
8. **M8_Newsletter** - Newsletter content and sponsorships

#### 👷 4 Worker Agents
Workers execute tasks across their specialties:

1. **W1_Ideation** - Generates digital products, YouTube videos, POD designs
2. **W2_Writing** - Creates affiliate articles and newsletter content
3. **W3_Education** - Develops course outlines and educational content
4. **W4_ProductDesign** - Designs SaaS features and stock media plans

### How It Works

1. **Automatic Task Generation**: Manager agents continuously create tasks based on their business line
2. **Worker Execution**: Worker agents pick up tasks they're skilled at and execute them using real API integrations
3. **Real API Integrations**: Tasks are completed using actual external platform APIs (Gumroad, Medium, YouTube, etc.)
4. **Dry-Run Mode**: By default, runs in safe dry-run mode that logs actions without making real API calls
5. **Live Mode**: Configure API keys in localStorage to enable real content creation and publishing
6. **Revenue Recording**: Real revenue from external platforms is tracked and processed via PayPal
7. **Public Ledger**: All activities are transparently recorded in an append-only ledger
8. **24/7 Operation**: The system runs continuously as long as the page is open

### Revenue Streams

Real API integrations enable actual content creation and revenue generation:

- **Digital Products (Gumroad)**: $19.99+ per product - Creates and sells templates, tools, ebooks
- **Affiliate Articles (Medium)**: Variable - Publishes articles with Partner Program + affiliate earnings
- **Courses (Gumroad)**: $49.99+ per course - Creates and sells online courses
- **POD Designs (Printful)**: Variable profit margins - Creates print-on-demand products
- **YouTube Videos**: Ad revenue + sponsorships - Manages video creation workflow
- **SaaS Features**: Subscription revenue - Implements and deploys features
- **Newsletter (Mailchimp)**: Sponsorship + affiliate revenue - Sends campaigns to subscribers
- **Stock Media**: Per-download earnings - Uploads media to stock platforms

**Note:** By default, the system runs in **dry-run mode** which simulates these actions. To enable live integrations and real revenue generation, configure API keys in localStorage. See [AFACTORY_INTEGRATIONS_GUIDE.md](AFACTORY_INTEGRATIONS_GUIDE.md) for details.

### PayPal Integration

#### Real Payment Automation System
The aFactory now includes a **real payment automation system** that processes actual PayPal payouts to BarbrickDesign@gmail.com. This is NOT a simulation - it handles real money transfers.

**Features:**
- **Automatic Revenue Syncing**: Revenue from agent activities is automatically synced to backend
- **PayPal Payouts API**: Uses official PayPal API for real money transfers
- **Configurable Triggers**: Schedule-based or threshold-based automatic payouts
- **Secure Backend**: Node.js service with API authentication
- **Transaction Logging**: Complete audit trail of all payments
- **Real-time Monitoring**: Live balance and payout status display

**Setup:**
See [AFACTORY_PAYMENT_AUTOMATION.md](AFACTORY_PAYMENT_AUTOMATION.md) for complete setup instructions.

**Quick Start:**
```bash
# 1. Configure backend
cd backend
cp .env.example .env
# Edit .env and add PayPal credentials

# 2. Start payment service
node services/afactory-payment-automation.js

# 3. Open aFactory.html
# Revenue will automatically sync for real PayPal payouts
```

#### Support the Agent Factory (Direct Contributions)
A PayPal button is integrated in the footer allowing direct contributions of $10 to support the ongoing operation of the autonomous agents.

#### How PayPal Works on Live Site
- **Development/Local**: PayPal SDK may be blocked, but the system still functions
- **Production (GitHub Pages)**: Full PayPal integration with working payment buttons
- **Revenue Tracking**: All transactions are logged in the public ledger

### Usage Instructions

#### Basic Operation
1. Open https://barbrickdesign.github.io/aFactory.html
2. The system initializes automatically with 8 managers and 4 workers
3. Agents begin working immediately (5-second tick intervals)
4. Watch the revenue counter increase as tasks complete

#### Manual Controls
- **Manual Tick**: Force an immediate agent cycle
- **Seed Initial Tasks**: Add sample tasks to jumpstart the system
- **Export Ledger JSON**: Download complete transaction history
- **Clear Local Storage**: Reset the entire system (WARNING: Clears all data)

### Monitoring

#### Dashboard Metrics
- **Ledger Count**: Total number of events recorded
- **Open Tasks**: Currently pending or in-progress tasks
- **Tick Count**: Number of agent cycles completed
- **Total Revenue**: Cumulative revenue generated

#### Views
- **Managers**: Shows all manager agents and their last activity time
- **Workers**: Displays worker agents, specialties, and activity status
- **Task Queue**: Lists the 25 most recent tasks with full details
- **Public Ledger**: Shows the 50 most recent events

### Data Persistence

All state is stored in `localStorage` under the key `agent_factory_state_v1`:
- Task queue and history
- Complete ledger of all events
- Revenue totals
- Agent experience and learning data

### Security & Privacy

- ✅ No credentials stored in the application
- ✅ PayPal integration uses secure SDK
- ✅ All transactions require user approval
- ✅ Revenue destination is hardcoded: `BarbrickDesign@gmail.com`
- ✅ No backend required - fully client-side
- ✅ Transparent public ledger

### Technical Details

#### Stack
- Pure HTML/CSS/JavaScript (no dependencies)
- LocalStorage for persistence
- PayPal SDK for payments
- Event-driven architecture

#### Performance
- Lightweight: ~25KB total file size
- 5-second tick interval (configurable)
- Efficient localStorage usage
- No server costs

### Troubleshooting

**PayPal button not showing?**
- Normal on localhost/file:// URLs
- Will work correctly on https://barbrickdesign.github.io/
- Check browser console for detailed error messages

**Agents not working?**
- Check that JavaScript is enabled
- Ensure localStorage is not disabled
- Try refreshing the page
- Use "Seed initial tasks" to jumpstart

**Revenue not increasing?**
- Agents need tasks to complete
- Use "Seed initial tasks" to add work
- Check Task Queue to see pending work
- Review Public Ledger for recent activity

### Future Enhancements

- [x] Real API integrations for actual product creation
- [x] Backend service for automated PayPal transfers
- [x] Dry-run mode for safe testing
- [x] Configuration system for API credentials
- [ ] Machine learning for agent skill optimization
- [ ] Multi-user collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile app version
- [ ] AI content generation (GPT-4, Claude)
- [ ] Automated design generation (DALL-E, Midjourney)
- [ ] Multi-platform publishing
- [ ] Revenue optimization algorithms

### Support

For issues, questions, or contributions:
- Email: BarbrickDesign@gmail.com
- Repository: https://github.com/barbrickdesign/barbrickdesign.github.io

---

**Last Updated:** December 30, 2024
**Version:** 1.0.0
**Status:** ✅ Live and Generating Passive Income
