# CasinoAI System Integration Guide

## 🔗 Overview
This guide provides comprehensive information for integrating CasinoAI with various casino management systems, point-of-sale systems, and other infrastructure. The system is designed to be dynamic and compatible with all major platforms.

---

## 📋 Table of Contents
1. [Integration Architecture](#integration-architecture)
2. [Supported Systems](#supported-systems)
3. [API Documentation](#api-documentation)
4. [Integration Examples](#integration-examples)
5. [Configuration Guide](#configuration-guide)
6. [Testing & Validation](#testing--validation)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Integration Architecture

### System Design
CasinoAI uses a modular architecture that allows it to integrate with any casino system through:
- **REST APIs**: Standard HTTP/HTTPS endpoints
- **WebSocket Connections**: Real-time data streaming
- **Database Connectors**: Direct database integration
- **Message Queues**: Asynchronous event processing
- **File-Based Integration**: CSV/JSON import/export

### Integration Layers
```
┌─────────────────────────────────────────┐
│         CasinoAI Core System            │
│  (AI Processing, Analytics, Storage)    │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │   Integration Layer       │
    │   (APIs, Connectors)      │
    └─────────────┬─────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
┌───┴────┐  ┌────┴────┐  ┌────┴────┐
│  CMS   │  │   POS   │  │ Player  │
│Systems │  │ Systems │  │Tracking │
└────────┘  └─────────┘  └─────────┘
```

### Security Model
- **TLS/SSL Encryption**: All communications encrypted
- **API Key Authentication**: Secure token-based auth
- **Role-Based Access Control**: Granular permissions
- **Audit Logging**: Complete activity tracking
- **Data Isolation**: Tenant-specific data separation

---

## 🎰 Supported Systems

### Casino Management Systems (CMS)

#### IGT Systems
- **Advantage CMS**: Full integration via REST API
- **IGT S2000**: Database connector and API
- **IGT Resort**: Real-time integration
- **Configuration**: XML-based config files
- **Documentation**: [IGT Integration Guide](docs/igt-integration.md)

#### Konami Gaming
- **Synkros CMS**: Native API integration
- **KAMS**: Real-time event streaming
- **Configuration**: JSON config with OAuth
- **Documentation**: [Konami Integration Guide](docs/konami-integration.md)

#### Aristocrat Technologies
- **Oasis 360**: REST API and WebSocket
- **ACSC**: Database-level integration
- **Configuration**: YAML configuration
- **Documentation**: [Aristocrat Integration Guide](docs/aristocrat-integration.md)

#### Bally Technologies
- **Bally CMS**: API and database connector
- **Elite Bonusing**: Real-time integration
- **Configuration**: JSON with API keys
- **Documentation**: [Bally Integration Guide](docs/bally-integration.md)

#### Scientific Games
- **SG Universe**: Full API integration
- **SG Elite**: Real-time data streaming
- **Configuration**: XML-based setup
- **Documentation**: [SG Integration Guide](docs/sg-integration.md)

### Point of Sale (POS) Systems

#### Micros POS (Oracle)
- **Integration Type**: REST API
- **Real-Time Support**: Yes
- **Transaction Sync**: Bidirectional
- **Setup Time**: 2-4 hours

#### Aloha POS
- **Integration Type**: Database connector
- **Real-Time Support**: Yes
- **Transaction Sync**: Real-time polling
- **Setup Time**: 1-2 hours

#### Square POS
- **Integration Type**: REST API (OAuth)
- **Real-Time Support**: Yes
- **Transaction Sync**: Webhook-based
- **Setup Time**: 1 hour

#### Toast POS
- **Integration Type**: REST API
- **Real-Time Support**: Yes
- **Transaction Sync**: Real-time events
- **Setup Time**: 1-2 hours

### Player Tracking Systems

#### NRT Technology
- **Integration Type**: REST API
- **Data Sync**: Player activity, rewards
- **Real-Time**: Yes
- **Setup Time**: 2-3 hours

#### Acres Manufacturing
- **Integration Type**: Database and API
- **Data Sync**: Player points, activity
- **Real-Time**: Yes
- **Setup Time**: 3-4 hours

#### Custom Loyalty Systems
- **Integration Type**: Custom API adapters
- **Data Sync**: Configurable
- **Real-Time**: Yes
- **Setup Time**: Varies (4-8 hours)

### Table Management Systems

#### Tangam Systems
- **Integration Type**: REST API
- **Features**: Table tracking, player ratings
- **Real-Time**: Yes
- **Setup Time**: 2-3 hours

#### DEQ Systems
- **Integration Type**: Database connector
- **Features**: Pit boss tools, table stats
- **Real-Time**: Yes
- **Setup Time**: 2-4 hours

### Surveillance Systems

#### All Major CCTV Brands
- **Supported Protocols**: RTSP, ONVIF, HTTP
- **Brands**: Axis, Hikvision, Dahua, Bosch, Genetec, Milestone
- **Integration**: Automatic discovery
- **Setup Time**: 1-2 hours

---

## 🔌 API Documentation

### Authentication

#### API Key Authentication
```bash
# Include API key in header
curl -H "X-API-Key: your-api-key-here" \
     https://api.casinoai.com/v1/transactions
```

#### OAuth 2.0 Authentication
```bash
# Get access token
curl -X POST https://api.casinoai.com/oauth/token \
  -d "grant_type=client_credentials" \
  -d "client_id=your-client-id" \
  -d "client_secret=your-client-secret"
```

### Core Endpoints

#### Transaction Monitoring

**Submit Transaction**
```http
POST /api/v1/transactions
Content-Type: application/json
X-API-Key: your-api-key

{
  "transaction_id": "TXN123456",
  "timestamp": "2026-01-23T15:30:00Z",
  "type": "chip_exchange",
  "amount": 500.00,
  "worker_id": "EMP789",
  "location": "TABLE_7",
  "chips_in": 20,
  "chips_out": 0,
  "cash_in": 0,
  "cash_out": 500.00
}
```

**Response**
```json
{
  "status": "verified",
  "transaction_id": "TXN123456",
  "ai_verification": {
    "chip_count_match": true,
    "cash_count_match": true,
    "confidence": 0.98,
    "anomalies": []
  },
  "timestamp_processed": "2026-01-23T15:30:01Z"
}
```

**Get Transaction Status**
```http
GET /api/v1/transactions/{transaction_id}
X-API-Key: your-api-key
```

#### Alert Management

**Get Alerts**
```http
GET /api/v1/alerts?status=active&limit=50
X-API-Key: your-api-key
```

**Response**
```json
{
  "alerts": [
    {
      "alert_id": "ALT78901",
      "timestamp": "2026-01-23T15:25:00Z",
      "type": "count_discrepancy",
      "severity": "warning",
      "location": "TABLE_12",
      "description": "Chip count mismatch detected",
      "details": {
        "expected": 50,
        "counted": 52,
        "difference": 2
      },
      "status": "active"
    }
  ],
  "total": 1,
  "page": 1
}
```

**Update Alert Status**
```http
PUT /api/v1/alerts/{alert_id}
Content-Type: application/json
X-API-Key: your-api-key

{
  "status": "resolved",
  "resolution": "Manual recount confirmed discrepancy, corrective action taken",
  "resolved_by": "SEC123"
}
```

#### Statistics & Analytics

**Get Loss Statistics**
```http
GET /api/v1/statistics/losses?period=daily&start_date=2026-01-01
X-API-Key: your-api-key
```

**Response**
```json
{
  "period": "daily",
  "data": [
    {
      "date": "2026-01-23",
      "errors_detected": 4,
      "errors_prevented": 3,
      "potential_loss": 625.00,
      "actual_loss": 125.00,
      "savings": 500.00,
      "prevention_rate": 0.96
    }
  ],
  "summary": {
    "total_errors_detected": 120,
    "total_savings": 15000.00,
    "average_daily_savings": 500.00
  }
}
```

**Get Worker Performance**
```http
GET /api/v1/statistics/workers?worker_id=EMP789&period=monthly
X-API-Key: your-api-key
```

#### Camera Management

**List Cameras**
```http
GET /api/v1/cameras
X-API-Key: your-api-key
```

**Get Camera Feed**
```http
GET /api/v1/cameras/{camera_id}/stream
X-API-Key: your-api-key
```

### WebSocket API

#### Real-Time Alerts
```javascript
const ws = new WebSocket('wss://api.casinoai.com/ws/alerts');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'authenticate',
    api_key: 'your-api-key'
  }));
});

ws.on('message', (data) => {
  const alert = JSON.parse(data);
  console.log('New alert:', alert);
  // Handle alert in your system
});
```

#### Live Transaction Stream
```javascript
const ws = new WebSocket('wss://api.casinoai.com/ws/transactions');

ws.on('message', (data) => {
  const transaction = JSON.parse(data);
  // Process transaction in real-time
});
```

---

## 💻 Integration Examples

### Example 1: IGT Advantage Integration

**Configuration File (config/igt-advantage.json)**
```json
{
  "system": "igt_advantage",
  "connection": {
    "type": "rest_api",
    "base_url": "https://casino-cms.example.com/api",
    "api_key": "${IGT_API_KEY}",
    "timeout": 30
  },
  "sync": {
    "transactions": {
      "enabled": true,
      "interval": 5,
      "endpoint": "/transactions/recent"
    },
    "players": {
      "enabled": true,
      "interval": 60,
      "endpoint": "/players/active"
    }
  },
  "mappings": {
    "transaction_type": {
      "chip_purchase": "BUY_IN",
      "chip_redemption": "CASH_OUT",
      "bill_exchange": "EXCHANGE"
    }
  }
}
```

**Integration Code (Node.js)**
```javascript
const CasinoAI = require('@casinoai/sdk');
const IGTAdapter = require('@casinoai/adapters-igt');

// Initialize CasinoAI client
const casinoai = new CasinoAI({
  apiKey: process.env.CASINOAI_API_KEY
});

// Setup IGT adapter
const igt = new IGTAdapter({
  baseUrl: 'https://casino-cms.example.com/api',
  apiKey: process.env.IGT_API_KEY
});

// Sync transactions every 5 seconds
setInterval(async () => {
  // Get recent transactions from IGT
  const transactions = await igt.getRecentTransactions();
  
  // Send to CasinoAI for verification
  for (const txn of transactions) {
    const result = await casinoai.verifyTransaction({
      transaction_id: txn.id,
      type: txn.type,
      amount: txn.amount,
      timestamp: txn.timestamp,
      location: txn.location
    });
    
    // Handle verification result
    if (!result.verified) {
      console.warn('Transaction verification failed:', result);
      await igt.flagTransaction(txn.id, result.reason);
    }
  }
}, 5000);

// Subscribe to CasinoAI alerts
casinoai.on('alert', async (alert) => {
  console.log('New alert:', alert);
  
  // Send alert to IGT system
  await igt.createNotification({
    type: 'security_alert',
    severity: alert.severity,
    message: alert.description,
    location: alert.location
  });
});
```

### Example 2: Database Integration

**Configuration File (config/database.json)**
```json
{
  "database": {
    "type": "postgresql",
    "host": "casino-db.example.com",
    "port": 5432,
    "database": "casino_cms",
    "username": "${DB_USERNAME}",
    "password": "${DB_PASSWORD}",
    "ssl": true
  },
  "tables": {
    "transactions": {
      "table_name": "gaming_transactions",
      "columns": {
        "id": "transaction_id",
        "timestamp": "created_at",
        "type": "transaction_type",
        "amount": "amount",
        "location": "table_number"
      }
    }
  },
  "polling": {
    "interval": 10,
    "batch_size": 100
  }
}
```

**Integration Code (Python)**
```python
from casinoai import CasinoAIClient
from casinoai.adapters import DatabaseAdapter
import os

# Initialize clients
casinoai = CasinoAIClient(api_key=os.getenv('CASINOAI_API_KEY'))

db_adapter = DatabaseAdapter(
    type='postgresql',
    host='casino-db.example.com',
    database='casino_cms',
    username=os.getenv('DB_USERNAME'),
    password=os.getenv('DB_PASSWORD')
)

# Poll for new transactions
def sync_transactions():
    # Get new transactions from database
    transactions = db_adapter.query("""
        SELECT transaction_id, created_at, transaction_type, 
               amount, table_number, employee_id
        FROM gaming_transactions
        WHERE created_at > NOW() - INTERVAL '1 minute'
        ORDER BY created_at DESC
    """)
    
    # Verify each transaction with CasinoAI
    for txn in transactions:
        result = casinoai.verify_transaction(
            transaction_id=txn['transaction_id'],
            timestamp=txn['created_at'],
            type=txn['transaction_type'],
            amount=txn['amount'],
            location=txn['table_number'],
            worker_id=txn['employee_id']
        )
        
        # Update transaction with AI verification
        db_adapter.execute("""
            UPDATE gaming_transactions
            SET ai_verified = %s, ai_confidence = %s, ai_notes = %s
            WHERE transaction_id = %s
        """, (
            result['verified'],
            result['confidence'],
            result.get('notes', ''),
            txn['transaction_id']
        ))

# Run continuously
import schedule
schedule.every(10).seconds.do(sync_transactions)

while True:
    schedule.run_pending()
    time.sleep(1)
```

### Example 3: Player Tracking Integration

**Integration Code (C#)**
```csharp
using CasinoAI.SDK;
using System;
using System.Threading.Tasks;

public class PlayerTrackingIntegration
{
    private readonly CasinoAIClient _casinoAI;
    private readonly PlayerTrackingSystem _playerSystem;
    
    public PlayerTrackingIntegration(string apiKey)
    {
        _casinoAI = new CasinoAIClient(apiKey);
        _playerSystem = new PlayerTrackingSystem();
    }
    
    public async Task SyncPlayerActivity()
    {
        // Get active players from tracking system
        var activePlayers = await _playerSystem.GetActivePlayers();
        
        foreach (var player in activePlayers)
        {
            // Get player activity from CasinoAI
            var activity = await _casinoAI.GetPlayerActivity(player.Id);
            
            // Update player points based on verified activity
            if (activity.Verified)
            {
                await _playerSystem.UpdatePlayerPoints(
                    playerId: player.Id,
                    points: activity.PointsEarned,
                    source: "CasinoAI-Verified"
                );
            }
        }
    }
    
    public async Task HandleSecurityAlert(Alert alert)
    {
        // If alert involves a player, update their profile
        if (alert.PlayerId != null)
        {
            await _playerSystem.AddPlayerNote(
                playerId: alert.PlayerId,
                note: $"Security Alert: {alert.Description}",
                severity: alert.Severity,
                timestamp: alert.Timestamp
            );
            
            // For high-severity alerts, flag for review
            if (alert.Severity == "critical")
            {
                await _playerSystem.FlagForReview(alert.PlayerId);
            }
        }
    }
}
```

---

## ⚙️ Configuration Guide

### Environment Variables
```bash
# CasinoAI Configuration
CASINOAI_API_KEY=your-api-key-here
CASINOAI_API_URL=https://api.casinoai.com/v1
CASINOAI_WS_URL=wss://api.casinoai.com/ws

# CMS Integration
CMS_TYPE=igt_advantage
CMS_API_KEY=your-cms-api-key
CMS_BASE_URL=https://casino-cms.example.com

# Database Configuration
DB_TYPE=postgresql
DB_HOST=casino-db.example.com
DB_PORT=5432
DB_NAME=casino_cms
DB_USER=casinoai_user
DB_PASSWORD=secure-password

# Security Settings
TLS_ENABLED=true
TLS_CERT_PATH=/path/to/cert.pem
TLS_KEY_PATH=/path/to/key.pem

# Logging
LOG_LEVEL=info
LOG_PATH=/var/log/casinoai
```

### System Configuration

**Main Config (config/system.yaml)**
```yaml
casinoai:
  environment: production
  region: us-west
  timezone: America/Los_Angeles

integration:
  cms:
    enabled: true
    type: igt_advantage
    sync_interval: 5
    
  pos:
    enabled: true
    type: micros
    sync_interval: 10
    
  player_tracking:
    enabled: true
    type: nrt
    sync_interval: 60
    
  surveillance:
    enabled: true
    auto_discover: true
    protocols:
      - rtsp
      - onvif

monitoring:
  alerts:
    enabled: true
    channels:
      - email
      - sms
      - dashboard
      - webhook
      
  statistics:
    collection_interval: 60
    retention_days: 365
    
security:
  encryption: aes-256
  tls_version: 1.3
  api_rate_limit: 1000
  session_timeout: 3600

performance:
  max_concurrent_streams: 50
  processing_threads: 8
  cache_size_mb: 2048
```

---

## 🧪 Testing & Validation

### Integration Testing Checklist

#### Pre-Integration Testing
- [ ] Verify network connectivity
- [ ] Test API credentials
- [ ] Confirm data format compatibility
- [ ] Review security requirements
- [ ] Backup existing data

#### Basic Integration Testing
- [ ] Test authentication
- [ ] Verify data read operations
- [ ] Verify data write operations
- [ ] Test error handling
- [ ] Validate data mapping

#### Advanced Integration Testing
- [ ] Load testing (100+ transactions/min)
- [ ] Failover and redundancy testing
- [ ] Data consistency validation
- [ ] Alert notification testing
- [ ] Performance benchmarking

#### Security Testing
- [ ] Encryption verification
- [ ] Access control testing
- [ ] Audit logging validation
- [ ] Penetration testing
- [ ] Compliance verification

### Test Transaction Script

```python
# test_integration.py
from casinoai import CasinoAIClient
import random

client = CasinoAIClient(api_key='test-api-key')

def test_transaction_verification():
    """Test transaction verification"""
    test_txn = {
        'transaction_id': f'TEST{random.randint(1000, 9999)}',
        'timestamp': '2026-01-23T15:30:00Z',
        'type': 'chip_exchange',
        'amount': 100.00,
        'location': 'TABLE_1',
        'worker_id': 'TEST_EMP'
    }
    
    result = client.verify_transaction(**test_txn)
    
    assert result['status'] in ['verified', 'flagged']
    assert 'confidence' in result
    print(f"✓ Transaction verification test passed: {result}")

def test_alert_creation():
    """Test alert system"""
    alerts = client.get_alerts(status='active')
    print(f"✓ Alert retrieval test passed: {len(alerts)} alerts")

def test_statistics():
    """Test statistics API"""
    stats = client.get_statistics(period='daily')
    assert 'total_transactions' in stats
    print(f"✓ Statistics test passed: {stats}")

if __name__ == '__main__':
    test_transaction_verification()
    test_alert_creation()
    test_statistics()
    print("\n✅ All integration tests passed!")
```

---

## 🔧 Troubleshooting

### Common Integration Issues

#### Authentication Failures
**Problem:** API key not recognized
- Verify API key is correct
- Check key hasn't expired
- Ensure proper header format: `X-API-Key: your-key`
- Contact support for new key if needed

#### Connection Timeouts
**Problem:** Requests timing out
- Check network connectivity
- Verify firewall allows outbound HTTPS
- Increase timeout value in config
- Test with curl/ping to API endpoint

#### Data Format Mismatches
**Problem:** Data not mapping correctly
- Review API documentation for expected format
- Check column/field mappings in config
- Validate data types match expectations
- Use transform functions if needed

#### Rate Limiting
**Problem:** Too many requests error
- Implement exponential backoff
- Reduce polling frequency
- Use WebSocket for real-time data
- Contact support for limit increase

### Debug Mode

Enable debug logging:
```yaml
# config/system.yaml
logging:
  level: debug
  output: /var/log/casinoai/debug.log
  include_api_requests: true
  include_responses: true
```

### Support Resources
- **Technical Support**: integration-support@barbrickdesign.com
- **Documentation**: https://docs.barbrickdesign.com/integration
- **API Status**: https://status.casinoai.com
- **Developer Forum**: https://community.barbrickdesign.com

---

## 📝 Integration Checklist

### Pre-Launch
- [ ] All systems tested individually
- [ ] Integration testing completed
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Staff trained on integrated system
- [ ] Rollback plan documented
- [ ] Support contacts confirmed

### Launch Day
- [ ] Enable monitoring
- [ ] Verify all connections
- [ ] Test alert notifications
- [ ] Monitor system performance
- [ ] Document any issues
- [ ] Have support on standby

### Post-Launch
- [ ] Daily monitoring for 1 week
- [ ] Weekly performance reviews
- [ ] Gather user feedback
- [ ] Optimize configurations
- [ ] Update documentation

---

## 🔄 Version History

**Version 1.1** - 2026-01-23
- Added Good Deeds Rewarding System
- Environment happiness, liveliness, and safety tracking
- Automatic tier value adjustments based on positive visitor contributions
- Good deeds categories: Helping others, cleanup, safety, positive behavior, community enhancement

**Version 1.0** - 2026-01-23
- Initial release
- Support for major CMS platforms
- REST API and WebSocket support
- Database integration support

---

## ✨ Good Deeds Rewarding System

### Overview
The Good Deeds Rewarding System tracks and rewards casino visitors who contribute to creating a happy, lively, and safe environment. The system uses AI vision to automatically detect and track positive behaviors, which are then integrated into the casino's tier system to provide additional value.

### Good Deeds Categories

#### 👥 Helping Others (50-200 points)
- Assisting lost or confused visitors
- Helping elderly or disabled patrons
- Guiding new players through games
- Translating or interpreting for others
- Providing directions and information

#### 🧹 Environment Cleanup (30-150 points)
- Picking up litter and maintaining cleanliness
- Organizing public spaces
- Reporting spills or hazards to staff
- Cleaning up after personal use
- Contributing to overall tidiness

#### 🛡️ Safety Contributions (100-300 points)
- Reporting safety concerns to security
- De-escalating potential conflicts
- Assisting during emergencies
- Following and promoting safety protocols
- Identifying and reporting suspicious activity

#### 😊 Positive Behavior (20-100 points)
- Friendly and courteous interactions
- Patience with staff and other visitors
- Encouraging good sportsmanship
- Creating welcoming atmosphere
- Positive social engagement

#### 🎯 Community Enhancement (50-250 points)
- Organizing or participating in social activities
- Mentoring new visitors
- Promoting responsible gaming practices
- Contributing to community spirit
- Enhancing overall visitor experience

### Tier Value Additions

The Good Deeds system automatically adds value to casino tier packages based on the collective positive contributions of visitors:

| Tier | Base Price | Good Deeds Value Added | Weekly Points Required | Total Value |
|------|-----------|------------------------|----------------------|-------------|
| 🥉 Basic | $2,999/mo | +$500/month | 100+ points/week | $3,499/mo |
| 🥈 Professional | $6,999/mo | +$1,200/month | 250+ points/week | $8,199/mo |
| 🥇 Enterprise | $14,999/mo | +$2,500/month | 500+ points/week | $17,499/mo |

### Environment Metrics

The system tracks three key environmental metrics:

1. **Environment Happiness Score** - Measures positive interactions, smiles, and overall visitor satisfaction
2. **Liveliness Score** - Tracks social engagement, community activities, and positive energy
3. **Safety Index** - Monitors safety contributions, hazard reports, and conflict prevention

### API Integration

#### Get Good Deeds Statistics
```http
GET /api/v1/good-deeds/statistics
X-API-Key: your-api-key
```

**Response**
```json
{
  "environment_metrics": {
    "happiness_score": 94.7,
    "liveliness_score": 91.2,
    "safety_index": 98.4
  },
  "today_activity": {
    "helping_others": 342,
    "cleanup_actions": 187,
    "safety_reports": 89,
    "positive_acts": 521
  },
  "tier_values": {
    "basic": 500,
    "professional": 1200,
    "enterprise": 2500
  }
}
```

#### Track Good Deed Event
```http
POST /api/v1/good-deeds/track
Content-Type: application/json
X-API-Key: your-api-key

{
  "visitor_id": "A2847",
  "category": "helping_others",
  "action": "assisted_elderly_visitor",
  "points": 150,
  "location": "LOBBY",
  "timestamp": "2026-01-23T15:30:00Z"
}
```

#### Get Top Contributors
```http
GET /api/v1/good-deeds/leaderboard?period=weekly&limit=10
X-API-Key: your-api-key
```

### Benefits

✅ **Automatic AI Detection** - No manual tracking required
✅ **Real-time Point Accumulation** - Instant reward notifications
✅ **Tier Status Upgrades** - Automatic value additions based on community contributions
✅ **Community Leaderboards** - Recognition for top contributors
✅ **Enhanced Casino Experience** - Creates positive, safe, and welcoming environment
✅ **Increased Visitor Satisfaction** - Rewards positive behavior and community spirit

---

**For additional integration support or custom integrations, contact:**
- Email: integration-support@barbrickdesign.com
- Phone: [Support Number]
- Portal: https://support.barbrickdesign.com

*This document is regularly updated. Check for the latest version at: https://docs.barbrickdesign.com/integration*
