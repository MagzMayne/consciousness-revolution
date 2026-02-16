# 🐛 Autonomous Worm Agent System

A sophisticated autonomous agent system that crawls through code line-by-line, analyzes every detail, detects issues, performs repairs, and visualizes agent activity in an interactive 3D environment.

## 🌟 Features

### Worm Agents
- **Line-by-Line Analysis**: Each agent crawls through code examining every single line
- **Data Ingestion**: Collects and stores information about code structure, patterns, and issues
- **Auto-Repair**: Automatically fixes common issues like:
  - Console statements in production code
  - Exposed API keys and secrets
  - Security vulnerabilities
  - Performance bottlenecks
- **Cross-Link Validation**: Verifies imports, exports, and dependencies across files
- **Known Pattern Recognition**: Uses learned patterns from working code

### Autonomous Coordinator
- **Agent Deployment**: Automatically deploys optimal number of worm agents
- **Load Balancing**: Distributes files evenly across agents
- **Real-Time Monitoring**: Tracks agent positions and activities
- **Event System**: Publishes events for visualization and integration
- **Result Aggregation**: Combines data from all agents into comprehensive reports

### 3D Visualization (Vibecraft.sh Style)
- **Interactive 3D Bubble Map**: Files represented as glowing spheres
- **Live Agent Tracking**: Watch worms move through the codebase in real-time
- **Status HUD**: Real-time system statistics and agent information
- **Particle Trails**: Visual trails showing agent movement paths
- **Camera Controls**: Rotate, zoom, and pan to explore the visualization

## 🚀 Quick Start

### 1. Open the Visualization

```bash
# Navigate to the project root
cd /home/runner/work/barbrickdesign.github.io/barbrickdesign.github.io

# Open in browser
open worm-agent-visualization.html
```

Or visit: `https://barbrickdesign.github.io/worm-agent-visualization.html`

### 2. Start the Crawl

1. Click **"🚀 START CRAWL"** button
2. Watch as agents deploy and begin analyzing code
3. Monitor the real-time statistics
4. View agent positions in the 3D map

### 3. Control the Agents

- **Stop**: Click **"🛑 STOP ALL"** to halt all agents
- **Reset**: Click **"🔄 RESET"** to clear and restart
- **Camera**: Drag to rotate, scroll to zoom

## 📋 System Architecture

```
┌─────────────────────────────────────────┐
│     WormAgentSystem (Integration)       │
│  - Initialization                       │
│  - Event Coordination                   │
│  - Health Monitoring                    │
└──────────────┬──────────────────────────┘
               │
               ├──► WormCoordinator
               │    - Agent Deployment
               │    - Load Balancing
               │    - Monitoring
               │
               ├──► WormAgent (Multiple)
               │    - Line Analysis
               │    - Issue Detection
               │    - Auto Repair
               │    - Cross-Linking
               │
               └──► 3D Visualization
                    - Three.js Scene
                    - Real-time Updates
                    - Interactive Controls
```

## 🔧 API Usage

### JavaScript API

```javascript
// Initialize the system
const system = new WormAgentSystem();
await system.initialize();

// Start a crawl
const result = await system.startCrawl();
console.log(result.summary);

// Get real-time status
const status = system.getStatus();

// Configure settings
system.configure({
    maxAgents: 5,
    autoRepair: true
});

// Export results
const json = system.exportResults('json');
const csv = system.exportResults('csv');
const markdown = system.exportResults('markdown');

// Health check
const health = await system.healthCheck();
```

### Direct Coordinator Usage

```javascript
// Create coordinator
const coordinator = new WormCoordinator(logger);
await coordinator.initialize();

// Scan and crawl
const files = await coordinator.scanRepository();
const report = await coordinator.startCrawl(files);

// Monitor in real-time
coordinator.monitorAgents((positions) => {
    console.log('Agent positions:', positions);
}, 100);

// Listen to events
coordinator.on('agentDeployed', (data) => {
    console.log('Agent deployed:', data);
});
```

### Individual Worm Agent

```javascript
// Create agent
const agent = new WormAgent(0, logger);

// Process files
const files = [
    { path: 'file.js', content: '...', type: 'javascript' }
];
const report = await agent.start(files);

// Get position (for visualization)
const position = agent.getPosition();

// Stop agent
agent.stop();
```

## 📊 Analysis Capabilities

### Code Quality Checks
- Function declarations and usage
- Variable scope and usage
- Import/export validation
- Dead code detection
- TODO/FIXME comments

### Security Checks
- Exposed API keys
- Hardcoded passwords
- Insecure HTTP references
- XSS vulnerabilities

### Performance Checks
- Blocking operations
- Synchronous calls
- Alert/prompt/confirm usage

### Best Practices
- Strict mode usage
- Documentation comments
- Error handling

## 📈 Visualization Details

### 3D Elements

**File Bubbles**
- Each file is represented as a glowing sphere
- Size indicates file importance/size
- Color indicates file type
- Pulsing animation shows activity

**Worm Agents**
- Small moving spheres (magenta/pink)
- Leave particle trails as they move
- Position corresponds to current file being analyzed

**Environment**
- Grid floor for spatial reference
- Ambient and point lighting
- Fog effect for depth

### HUD Elements

**Status HUD** (Top Left)
- Coordinator status
- Active agent count
- Files mapped

**Agents HUD** (Top Right)
- List of all agents
- Current file and line for each
- Active/idle status

**Stats HUD** (Bottom Left)
- Lines processed
- Issues found
- Repairs made
- Success rate

**Controls HUD** (Bottom Right)
- Start/Stop/Reset buttons

## 🧪 Testing

Run the comprehensive test suite:

```bash
node test-worm-agent-system.js
```

Or in browser:
```html
<script src="test-worm-agent-system.js"></script>
```

**Test Coverage**: 16 tests covering:
- Agent creation and initialization
- Pattern recognition
- Code analysis
- Security detection
- Coordinator operations
- System integration
- Report generation
- Export functionality

## 📁 File Structure

```
src/
├── agents/
│   ├── worm-agent.js           # Individual worm agent
│   ├── worm-coordinator.js     # Autonomous coordinator
│   └── agent-logger.js         # Logging system
├── systems/
│   └── worm-agent-system.js    # Integration layer
worm-agent-visualization.html   # 3D visualization interface
test-worm-agent-system.js       # Test suite
WORM_AGENT_SYSTEM_README.md     # This file
```

## 🎯 Use Cases

1. **Code Quality Audits**: Automatically scan entire codebase for issues
2. **Security Reviews**: Detect exposed secrets and vulnerabilities
3. **Pre-Deployment Checks**: Verify code quality before releases
4. **Technical Debt Tracking**: Monitor and fix technical debt over time
5. **Onboarding**: Visualize codebase structure for new developers
6. **Live Monitoring**: Real-time code quality dashboard

## ⚙️ Configuration Options

```javascript
{
    maxAgents: 10,              // Maximum number of worm agents
    autoRepair: true,           // Enable automatic repairs
    realTimeUpdates: true,      // Enable real-time monitoring
    visualizationEnabled: true  // Enable 3D visualization
}
```

## 🔒 Security Considerations

- Automatically detects and flags exposed API keys
- Can auto-replace secrets with environment variables
- Identifies hardcoded passwords
- Checks for insecure HTTP references
- No external data transmission
- All processing done locally

## 🚀 Performance

- Parallel processing with multiple agents
- Efficient line-by-line analysis
- Smart caching of known patterns
- Minimal memory footprint
- Optimized 3D rendering

## 🐛 Known Limitations

- Browser environment requires simulated file system
- Large codebases may require longer processing time
- Auto-repair is conservative to avoid breaking code
- 3D visualization performance depends on GPU

## 🔮 Future Enhancements

- [ ] Machine learning for pattern recognition
- [ ] Historical trend analysis
- [ ] Integration with CI/CD pipelines
- [ ] Custom rule definitions
- [ ] Multi-language support expansion
- [ ] Collaborative agent communication
- [ ] Advanced repair strategies

## 📚 Documentation

### Agent Communication Protocol

Agents communicate through events:
- `agent:deployed` - New agent deployed
- `agent:started` - Agent begins crawling
- `results:aggregated` - Final results compiled
- `agents:stopped` - All agents halted

### Data Structures

**Agent Report**
```javascript
{
    agentId: number,
    statistics: {
        filesScanned: number,
        linesProcessed: number,
        issuesFound: number,
        repairsMade: number
    },
    issues: Array<Issue>,
    repairs: Array<Repair>
}
```

**Issue Object**
```javascript
{
    type: string,        // 'console', 'security', 'performance'
    file: string,
    line: number,
    message: string,
    severity: string,    // 'low', 'medium', 'high', 'critical'
    autoFix: boolean
}
```

## 🤝 Contributing

This system is part of the BarbrickDesign ecosystem. Contributions welcome!

## 📄 License

MIT License - See repository for details

## 🙏 Credits

- Inspired by vibecraft.sh visualization style
- Built on Three.js for 3D rendering
- Part of the BarbrickDesign autonomous agent ecosystem

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: January 2026

For support or questions, see the main repository documentation.
