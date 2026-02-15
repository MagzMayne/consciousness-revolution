# R3-D3 Interactive Robot - Technical Reference

## Overview

R3-D3 is an advanced autonomous 3D robot assistant that provides interactive guidance, autonomous site navigation, error detection, self-healing, and developer assistance. Connected with ARAYA's knowledge base, R3-D3 knows everything about the repository and can help with any task. This is a modern evolution of the classic office assistant, powered by consciousness and AI.

## ✨ New Features (Enhanced Version)

### Interactive Button Menu
Click on R3-D3 to reveal a popup menu with powerful capabilities:

- **🚀 Tour Site** - Autonomous navigation through the entire site with element descriptions
- **💡 Help Me** - Context-aware developer assistance and Q&A
- **🔍 Check Errors** - Comprehensive page error detection (broken links, missing images, accessibility issues)
- **🔧 Fix Issues** - Automatic fixing of detected problems
- **📚 Knowledge Base** - Interactive documentation browser
- **⚙️ Settings** - Customize R3-D3's behavior and personality

## Robot Identity

- **Name**: r3-d3
- **Personality**: Professional, helpful, autonomous
- **Visual**: 3D animated robot with emoji head (🤖)
- **Session Persistence**: State persists across page navigation via localStorage

## Core Features

### 1. Robot Identity API

```javascript
// Get robot name
const name = RobotAssistant.getName(); // Returns: "r3-d3"

// Check editing status
const isEditing = RobotAssistant.isEditing(); // Returns: boolean

// Get full state
const state = RobotAssistant.getState();
// Returns: {
//   robotName: 'r3-d3',
//   position: { x, y },
//   animationState: 'idle' | 'walking' | 'thinking' | 'speaking' | 'editing',
//   canEditPages: boolean,
//   isEditing: boolean,
//   ...
// }
```

### 2. Autonomous Page Editing

```javascript
// Enable autonomous editing (required before editing)
RobotAssistantLoader.enableAutonomousEditing(true);

// Edit a page with natural language
const result = await RobotAssistantLoader.editPage(
    'homepage', // or 'index.html'
    'make the background darker'
);

// Result: { success: boolean, result?: any, error?: string }
```

#### File Path Shortcuts

The robot understands common shortcuts:
- `homepage` → `index.html`
- `landing` → `landing.html`
- `araya chat` → `ARAYA/1_INTERFACE/araya-chat.html`
- `welcome` → `WELCOME.html`
- `login` → `login.html`
- `signup` → `signup.html`

### 3. Animation States

R3-D3 has five distinct animation states:

1. **idle**: Gentle bobbing, occasional head rotation
2. **walking**: Leg movement, arm swing, forward motion
3. **thinking**: Head rotation, thoughtful pose
4. **speaking**: Head bob, arm gestures, eye pulse
5. **editing**: Rapid arm movements, tilted head, focused eye pulse ⭐ NEW

```javascript
// Manually set animation state
RobotAssistant.setAnimationState('editing');
```

### 4. Visual Feedback System

R3-D3 provides real-time feedback through color-coded notifications:

- **Info** (cyan): General information
- **Success** (green): Successful operations
- **Error** (red): Failures or warnings

Notifications automatically:
- Slide in from the right
- Stay visible for 5 seconds
- Slide out with smooth animation
- Stack vertically if multiple appear

### 5. Movement & Navigation

```javascript
// Move robot to specific position
RobotAssistantLoader.moveTo(x, y);

// Set current action message
RobotAssistantLoader.setAction('Analyzing code...');
```

## Architecture Integration

### ARAYA Services Required

R3-D3's autonomous editing requires two ARAYA services:

1. **ARAYA Bridge** (Port 5002)
   - Parses natural language edit requests
   - Uses Claude API for intent understanding
   - Returns structured edit instructions
   - File: `ARAYA_BRIDGE.py`

2. **ARAYA File Writer** (Port 5001)
   - Executes file modifications
   - Security: Only writes within allowed domains
   - Supports multi-domain architecture
   - File: `ARAYA_FILE_WRITER.py`

### Edit Flow

```
User Request
    ↓
editPage() function
    ↓
ARAYA Bridge (5002)
    ↓
Claude API (parse intent)
    ↓
ARAYA File Writer (5001)
    ↓
File System
    ↓
Success Notification
```

### Graceful Degradation

R3-D3 gracefully handles service unavailability:
- If ARAYA services aren't running, editing functions return error
- Robot continues to function for navigation and tours
- Clear error notifications inform users of service status
- No breaking changes to existing functionality

## Usage Examples

### Basic Setup

```html
<!-- Include robot loader in any page -->
<script src="/js/robot-assistant-loader.js"></script>
```

The robot automatically:
- Loads Three.js dependency
- Initializes 3D rendering
- Restores previous state
- Starts autonomous behavior
- Shows interactive button menu on click

### Using the Button Menu

Simply click on the R3-D3 robot to open the interactive menu. Each button provides different functionality:

```javascript
// Programmatically open the menu
window.RobotAI.toggleButtonMenu();

// Start an enhanced tour
window.RobotAI.startEnhancedTour();

// Get developer help
window.RobotAI.provideDeveloperHelp();

// Check for errors
window.RobotAI.checkForErrors();

// Auto-fix issues (must run checkForErrors first)
window.RobotAI.autoFixIssues();

// Show knowledge base
window.RobotAI.showKnowledgeBase();

// Show settings
window.RobotAI.showSettings();
```

### Enabling Editing

```javascript
// Enable editing capability
RobotAssistantLoader.enableAutonomousEditing(true);

// Robot will show notification: "🤖 R3-D3: Autonomous editing enabled"
```

### Making Edits

```javascript
// Simple background change
await RobotAssistantLoader.editPage('homepage', 'make background blue');

// Add content
await RobotAssistantLoader.editPage('index.html', 'add a welcome message at the top');

// Modify styling
await RobotAssistantLoader.editPage('landing', 'increase font size of headings');
```

### Using Developer Help

The help system provides context-aware assistance:

```javascript
// Activate developer help mode
window.RobotAI.provideDeveloperHelp();

// The system will:
// 1. Analyze the current page
// 2. Determine page type (dashboard, admin, auth, etc.)
// 3. Provide relevant suggestions
// 4. Open Q&A interface for questions
```

### Error Detection and Auto-Fix

```javascript
// Check for errors
window.RobotAI.checkForErrors();
// Returns report of:
// - Broken links
// - Missing images
// - Accessibility issues
// - Performance warnings

// Auto-fix detected issues
window.RobotAI.autoFixIssues();
// Attempts to fix:
// - Broken anchor links
// - Missing alt text
// - Missing ARIA labels
// - Failed image loading
```

### Disabling Editing

```javascript
RobotAssistantLoader.enableAutonomousEditing(false);
// Robot will show notification: "🤖 R3-D3: Autonomous editing disabled"
```

## State Persistence

R3-D3 saves state to localStorage every second:

```javascript
{
  robotName: 'r3-d3',
  position: { x: 100, y: 500 },
  animationState: 'idle',
  facing: 'right',
  currentAction: 'Waiting for interactions...',
  canEditPages: true,
  sessionId: 'user_uuid',
  timestamp: 1707930602942
}
```

State is restored if:
- Page reload occurs
- User navigates between pages
- Timestamp is less than 1 hour old

## Events & Integration

### ARAYA Chat Integration

R3-D3 automatically responds to ARAYA chat events:

```javascript
// Automatically handled by robot
window.addEventListener('araya-message-sent', ...);
window.addEventListener('araya-message-received', ...);
```

### Custom Events

Trigger robot behaviors:

```javascript
// Custom action
window.RobotAssistant.setAction('Custom action message');
window.RobotAssistant.setAnimationState('thinking');
```

## Configuration

Default configuration (in robot-assistant.js):

```javascript
const CONFIG = {
    robotSize: 80,           // Base size in pixels
    moveSpeed: 0.5,          // Pixels per frame
    animationSpeed: 0.05,    // Animation speed multiplier
    boundaryPadding: 50,     // Stay away from edges
    stateUpdateInterval: 1000, // Save state every second
    idleTimeout: 3000,       // Start wandering after 3s
    storageKey: 'araya_robot_state',
    enabled: true
};
```

## Browser Compatibility

- Modern browsers with WebGL support
- CSS fallback for older browsers
- Mobile-responsive design
- Touch-friendly interactions

## Security Considerations

1. **File System Access**: Only through ARAYA services with domain restrictions
2. **API Keys**: Claude API key required for ARAYA Bridge
3. **CORS**: Properly configured for localhost services
4. **State Storage**: localStorage for non-sensitive state data
5. **User Control**: Editing must be explicitly enabled

## Performance

- Lightweight 3D rendering with Three.js
- Efficient animation loops
- State saves throttled to 1/second
- Graceful degradation on low-end devices

## Troubleshooting

### Robot not appearing
- Check browser console for errors
- Verify Three.js loaded correctly
- CSS fallback should activate automatically

### Editing not working
1. Verify ARAYA services are running (ports 5001, 5002)
2. Check if editing is enabled: `RobotAssistant.getState().canEditPages`
3. Review browser console for API errors
4. Ensure Claude API key is configured in ARAYA Bridge

### Animation performance issues
- Reduce `CONFIG.robotSize` for better performance
- Check device WebGL capabilities
- Consider using CSS fallback version

## API Reference Summary

### RobotAssistant (window.RobotAssistant)
Core robot control functions:
- `getName()` → string - Returns 'r3-d3'
- `isEditing()` → boolean - Check if currently editing
- `getState()` → object - Get full robot state
- `moveTo(x, y)` → void - Move robot to position
- `setAnimationState(state)` → void - Set animation ('idle', 'walking', 'thinking', 'speaking', 'editing')
- `setAction(action)` → void - Set action message
- `editPage(path, description)` → Promise<{success, result?, error?}> - Edit page autonomously
- `enableAutonomousEditing(enabled)` → void - Enable/disable editing

### RobotAssistantLoader (window.RobotAssistantLoader)
Safe wrapper around RobotAssistant with same methods. Always checks if robot is loaded before calling functions.

### RobotAI (window.RobotAI)
Advanced AI and interaction functions:
- `init()` → void - Initialize AI brain
- `speak(message, duration)` → void - Show speech bubble
- `toggleButtonMenu()` → void - Toggle interactive button menu
- `startTour()` → void - Start basic tour
- `startEnhancedTour()` → void - Start enhanced autonomous tour
- `dismissTour()` → void - Dismiss tour offer
- `provideDeveloperHelp()` → void - Activate context-aware help
- `provideContextualHelp()` → void - Provide help based on page
- `checkForErrors()` → void - Scan page for errors
- `autoFixIssues()` → void - Automatically fix detected issues
- `showKnowledgeBase()` → void - Open knowledge base interface
- `showSettings()` → void - Open settings panel
- `answerQuestion()` → void - Answer user question from Q&A interface
- `saveSettings()` → void - Save robot settings
- `getExplorationScore()` → number - Get user's exploration score
- `getVisitedPages()` → Array<string> - Get list of visited pages
- `getAllPages()` → Array<string> - Get all discovered pages
- `brain` → object - Direct access to brain state (advanced)

## Enhanced Features Implementation

### Autonomous Site Tour
R3-D3 can now autonomously navigate through your site:
- Detects all interactive elements (buttons, links, forms)
- Describes each element's functionality
- Navigates between pages
- Provides real-time narration
- Limited to 10 elements per page for performance

### Error Detection System
Comprehensive error checking includes:
- **Broken Links**: Detects internal anchor links pointing to non-existent elements
- **Missing Images**: Identifies images that failed to load
- **Accessibility Issues**: Finds missing alt text, unlabeled inputs, and interactive elements without labels
- **Performance Warnings**: Alerts about excessive script loading

### Self-Healing Capabilities
R3-D3 can automatically fix:
- Broken anchor links (redirects to top)
- Missing alt text on images (generates from filename)
- Missing ARIA labels on buttons
- Hides failed images

### Developer Help System
Context-aware assistance that:
- Analyzes the current page type (dashboard, admin, auth, testing, etc.)
- Provides relevant help based on page context
- Offers Q&A interface for specific questions
- Understands project architecture and patterns

### Knowledge Base Integration
Quick access to:
- Seven Domains framework documentation
- Pattern Recognition tools overview
- ARAYA system architecture
- Development guidelines
- Direct links to key pages

## Future Enhancements

- ✅ Interactive button menu (COMPLETED)
- ✅ Autonomous site tour (COMPLETED)
- ✅ Error detection and auto-fix (COMPLETED)
- ✅ Developer help system (COMPLETED)
- ✅ Knowledge base browser (COMPLETED)
- 🔄 Voice interaction capability (IN PROGRESS)
- 🔄 Deep ARAYA integration for repository knowledge (IN PROGRESS)
- Multi-robot coordination
- Advanced AI personalities
- Custom animation sequences
- Performance monitoring
- Security scanning integration

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Verify ARAYA services status
3. Review this documentation
4. Check `/robot-docs.html` for interactive guide

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Production Ready  
