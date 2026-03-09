# Knowledge Base System - Quick Start

## What Is It?

A centralized system that allows all tools, agents, and scripts in the repository to discover and reuse existing working solutions. Instead of reinventing the wheel, query the knowledge base to find proven implementations.

## 30-Second Start

### In Browser (Recommended)

```html
<!-- Load the system -->
<script src="/src/core/tool-registry.js"></script>
<script src="/src/core/knowledge-base-manager.js"></script>
<script src="/src/utils/tool-discovery-helper.js"></script>

<script>
    // Find payment tools
    async function findPaymentTools() {
        const tools = await window.ToolDiscovery.findToolsFor('payment processing');
        console.log('Found tools:', tools);
    }
</script>
```

### In Node.js

```javascript
const { findToolsFor } = require('./src/utils/tool-discovery-helper.js');

// Find tools for your task
const tools = await findToolsFor('blockchain wallet integration');
console.log(`Found ${tools.length} tools`);
```

## Common Tasks

### 1. Find Tools for Your Task

```javascript
const tools = await findToolsFor('payment processing', { limit: 5 });
```

### 2. Get Usage Examples

```javascript
const example = await getUsageExample('paypal-integration.js');
console.log('Usage:', example.usage);
console.log('Examples:', example.examples);
```

### 3. Find Similar Tools

```javascript
const similar = await discoverSimilarTools('wallet-system.js', 3);
```

### 4. Get Creation Context

```javascript
const context = await getCreationContext({
    task: 'Create a blockchain wallet connector',
    capabilities: ['wallet-integration', 'blockchain-query']
});
```

## Current Catalog

- **146 Tools** total
- **32 Agents** - Autonomous task executors
- **39 Utilities** - Helper functions
- **21 Services** - Backend services  
- **40 Systems** - Core components
- **14 AI Modules** - AI/ML systems

Average Reusability: **7.73/10**  
Tools with Tests: **72.6%**

## Try It Live

🎮 **[Interactive Demo](knowledge-base-demo.html)**

Test all features in your browser:
- Check system status
- Find tools by task
- Browse by capability
- Get usage examples
- Discover similar tools

## Available Capabilities

- `payment-processing` - PayPal, Stripe, payments
- `wallet-integration` - Blockchain wallets
- `ai-orchestration` - LLM/AI management
- `deployment` - Deployment automation
- `monitoring` - Health checks
- `self-healing` - Auto error recovery
- `api-integration` - REST APIs
- `database-operations` - Database access
- `email-sending` - Email services
- `blockchain-query` - Blockchain interactions
- `data-scraping` - Web scraping
- `authentication` - Auth systems
- `file-operations` - File I/O
- `trading` - Trading automation
- `knowledge-base` - KB systems

## Rebuild Catalog

When tools change:

```bash
node scripts/build-tool-catalog.js
```

## Full Documentation

📖 **[Complete Guide](docs/KNOWLEDGE_BASE_USAGE.md)**

## Integration with Merlin Hive

Automatically available in Merlin Hive agents:
- `window.kbManager` - Knowledge Base Manager
- `window.toolRegistry` - Tool Registry

Initialized during Merlin Hive startup.

## Support

- 📧 Email: BarbrickDesign@gmail.com
- 📚 Docs: [KNOWLEDGE_BASE_USAGE.md](docs/KNOWLEDGE_BASE_USAGE.md)
- 💻 Examples: [examples/knowledge-base-agent-example.js](examples/knowledge-base-agent-example.js)
