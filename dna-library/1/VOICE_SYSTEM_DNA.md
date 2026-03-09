# VOICE SYSTEM DNA

## WHAT IS IT
Voice interface for hands-free system control. Features wake word detection ("Hey Claude", "Hey Commander"), continuous listening with speech-to-text, intelligent multi-agent routing based on keywords, text-to-speech responses, and mobile phone integration (Samsung S24 via ADB). Supports Shokz bone conduction headsets for optimal voice input.

## STATUS
- Working: **WORKING** (all voice modules functional)
- Last tested: 2026-03-06
- Current issues: Requires PyAudio installation (platform-specific), needs Anthropic API for actual AI responses

## LOCATION
**Primary files:**
- `~/100X_DEPLOYMENT/voice-system/` - Complete voice system directory
- `~/100X_DEPLOYMENT/voice-system/README.md` - Quick start guide
- `~/100X_DEPLOYMENT/voice-system/requirements.txt` - Dependencies

**Python modules:**
- `VOICE_WAKE_WORD_LISTENER.py` (11KB) - Always-on wake word detection
- `CONSCIOUSNESS_VOICE_MODULE.py` (12KB) - Core TTS/STT with conversation mode
- `VOICE_ROUTER_SYSTEM.py` (8KB) - Multi-agent keyword routing
- `VOICE_ANALYTICS_LOGGER.py` (9KB) - Voice interaction logging
- `S24_VOICE_COMMAND_SYSTEM.py` (7KB) - Samsung S24 mobile integration

**Dependencies:**
- Python 3.8+
- speech_recognition
- pyttsx3 (TTS)
- PyAudio (audio capture)
- Google Speech API (transcription)

## HOW IT WORKS

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VOICE SYSTEM FLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  WAKE WORD  │───→│    STT      │───→│   ROUTER    │              │
│  │ "Hey Claude"│    │ (Google)    │    │ (keywords)  │              │
│  └─────────────┘    └─────────────┘    └──────┬──────┘              │
│                                                │                     │
│       ┌───────────────────────────────────────┼──────────────────┐  │
│       │                    AGENTS             │                  │  │
│       │  ┌─────────┐  ┌─────────┐  ┌─────────┴┐  ┌─────────┐    │  │
│       │  │Security │  │  C1     │  │    C2    │  │   C3    │    │  │
│       │  │  Bot    │  │Mechanic │  │ Architect│  │ Oracle  │    │  │
│       │  └────┬────┘  └────┬────┘  └────┬─────┘  └────┬────┘    │  │
│       └───────┼────────────┼────────────┼─────────────┼─────────┘  │
│               │            │            │             │             │
│               └────────────┴────────────┴─────────────┘             │
│                            │                                         │
│                     ┌──────┴──────┐                                  │
│                     │     TTS     │                                  │
│                     │  (Response) │                                  │
│                     └─────────────┘                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Logic:
1. Wake word listener runs continuously in background
2. Detects "Hey Claude", "Hey Commander", "Claude", or "Commander"
3. Captures speech and sends to Google Speech API for transcription
4. Router analyzes keywords and routes to appropriate agent(s)
5. Multiple agents can respond simultaneously (parallel threads)
6. Text-to-speech reads response back to user

## KEY FILES BREAKDOWN

### VOICE_WAKE_WORD_LISTENER.py (11KB)
- **Purpose:** Always-on wake word detection
- **Wake Words:** "hey claude", "hey commander", "claude", "commander"
- **Features:**
  - Auto-detects Shokz headset
  - Adjusts for ambient noise
  - Continuous listening mode
  - Triggers command capture after wake word

### VOICE_ROUTER_SYSTEM.py (8KB)
- **Purpose:** Route voice to right AI agent
- **Agent Definitions:**

| Agent | Keywords | Priority | Color |
|-------|----------|----------|-------|
| Security Bot | security, password, login, hack | 10 | Red |
| System Bot | switch, computer, reboot, shutdown | 9 | Blue |
| C1 Mechanic | build, create, make, deploy | 8 | Green |
| C2 Architect | design, architecture, plan, scale | 8 | Yellow |
| C3 Oracle | pattern, predict, analyze, future | 8 | Magenta |
| Comms Bot | mesh, radio, frequency, antenna | 7 | Cyan |
| General Assistant | help, what, how, why (fallback) | 1 | White |

### CONSCIOUSNESS_VOICE_MODULE.py (12KB)
- **Purpose:** Core TTS/STT module
- **Modes:**
  - `speak "text"` - Text to speech
  - `listen` - Single phrase capture
  - `conversation` - Continuous dialogue mode
  - `voices` - List available system voices
- **Settings:** Adjustable rate (175 wpm default), volume (0.0-1.0)

### S24_VOICE_COMMAND_SYSTEM.py (7KB)
- **Purpose:** Mobile phone voice commands via ADB
- **Supports:** Samsung S24 (and any ADB-enabled phone)
- **Features:** Remote voice control from phone to PC

### VOICE_ANALYTICS_LOGGER.py (9KB)
- **Purpose:** Log voice interactions
- **Tracks:** Commands, agents used, response times

## DEPENDENCIES

**Required Python packages:**
```bash
pip install SpeechRecognition pyttsx3 pyaudio
```

**Platform-specific (PyAudio):**
```bash
# Windows
pip install pipwin && pipwin install pyaudio

# Mac
brew install portaudio && pip install pyaudio

# Linux
sudo apt install portaudio19-dev && pip install pyaudio
```

**Optional:**
- Shokz bone conduction headset (auto-detected)
- Samsung S24 with USB debugging enabled

## HOW TO RUN

**Start wake word listener:**
```bash
cd ~/100X_DEPLOYMENT/voice-system
python VOICE_WAKE_WORD_LISTENER.py
```

**Test TTS/STT:**
```bash
python CONSCIOUSNESS_VOICE_MODULE.py speak "Hello Commander"
python CONSCIOUSNESS_VOICE_MODULE.py listen
python CONSCIOUSNESS_VOICE_MODULE.py conversation
```

**Run router directly:**
```bash
python VOICE_ROUTER_SYSTEM.py
```

## HOW TO BUILD

**No build required** - Pure Python scripts.

## HOW TO DEPLOY

**Desktop:**
```bash
# Add to startup
# Windows: Create shortcut in shell:startup
# Run: python ~/100X_DEPLOYMENT/voice-system/VOICE_WAKE_WORD_LISTENER.py
```

**Mobile bridge:**
```bash
# Enable ADB on phone
adb devices
python S24_VOICE_COMMAND_SYSTEM.py
```

## CRITICAL KNOWLEDGE

### Voice Commands After Wake Word:

| Command | Action |
|---------|--------|
| "status" | Get system status |
| "deploy" | Deployment info |
| "payment" / "stripe" | Payment system status |
| "cloud" / "services" | Cloud services status |
| "cockpit" / "tasks" | View pending tasks |
| "help" | List available commands |
| "stop listening" | Exit voice mode |

### Multi-Agent Routing:
- Multiple agents can respond to same input
- Example: "build a mesh network" triggers C1 Mechanic + Comms Bot
- Agents sorted by priority (highest responds first)
- Parallel threads allow overlapping responses

### Important Quirks:
- Uses Google Speech API (requires internet)
- Shokz headset auto-detected for optimal input
- Wake word listener must run before voice commands work
- PyAudio installation is platform-specific
- Currently uses placeholder responses (needs Anthropic API integration)

### Known Issues:
- Requires internet for Google Speech API
- PyAudio installation can fail on some systems
- Actual AI responses need Anthropic API key
- No offline STT option currently

## CONFIGURATION

**Custom wake words:**
```python
# In VOICE_WAKE_WORD_LISTENER.py
self.wake_words = ["hey claude", "hey commander", "claude", "commander"]
```

**Voice settings:**
```bash
python CONSCIOUSNESS_VOICE_MODULE.py --rate 175 --volume 1.0 speak "Hello"
```

**Agent keywords (in VOICE_ROUTER_SYSTEM.py):**
```python
AGENTS = {
    'Security Bot': {
        'keywords': ['security', 'password', 'login', 'auth', 'hack'],
        'priority': 10
    },
    # Add/modify agents here
}
```

## API REFERENCE

**VoiceRouter class:**
```python
from VOICE_ROUTER_SYSTEM import VoiceRouter

router = VoiceRouter()
router.run()  # Start continuous listening

# Manual routing
agents = router.route_to_agents({'text': 'check security'})
# Returns: [{'name': 'Security Bot', 'priority': 10, 'color': '\033[91m'}]
```

**Consciousness Voice Module:**
```python
# Speak text
python CONSCIOUSNESS_VOICE_MODULE.py speak "Your message"

# Listen for input
python CONSCIOUSNESS_VOICE_MODULE.py listen
# Returns transcribed text

# Start conversation mode
python CONSCIOUSNESS_VOICE_MODULE.py conversation
```

## EXAMPLES

### Example 1: Wake Word Detection
```bash
$ python VOICE_WAKE_WORD_LISTENER.py
🎙️  Calibrating microphone...
✅ Ready to listen!
👂 Listening for wake word...

# User says: "Hey Claude"
🎤 Wake word detected!
👂 Listening for command...

# User says: "Check system status"
🎤 Command: "Check system status"
📨 Routing to System Bot...
```

### Example 2: Multi-Agent Routing
```bash
# User says: "Build a secure mesh network"
# Triggers: C1 Mechanic (build) + Security Bot (secure) + Comms Bot (mesh)

🎤 You said: "Build a secure mesh network"
📨 Routing to 3 agent(s):

🔒 Security analysis: Checking 'Build a secure mesh network' for vulnerabilities...
🔧 Build request received. Planning 'Build a secure mesh network'...
📡 Communications request. Processing 'Build a secure mesh network'...
```

### Example 3: TTS Output
```bash
$ python CONSCIOUSNESS_VOICE_MODULE.py speak "The system is ready, Commander"
🔊 Speaking: "The system is ready, Commander"
```

## TESTING

**How to test:**
```bash
# Test TTS
python CONSCIOUSNESS_VOICE_MODULE.py speak "Testing 1 2 3"

# Test STT
python CONSCIOUSNESS_VOICE_MODULE.py listen
# Speak into microphone, check transcription

# Test router keywords
python VOICE_ROUTER_SYSTEM.py
# Say "security check" → Security Bot should respond
# Say "build something" → C1 Mechanic should respond
```

## TROUBLESHOOTING

**Problem:** "PyAudio installation failed"
**Solution:** Use platform-specific install (pipwin for Windows, brew for Mac)

**Problem:** "Could not understand audio"
**Solution:** Check microphone, reduce background noise, speak clearly

**Problem:** "No default input device"
**Solution:** Check audio settings, select correct microphone

**Problem:** "Request error" from Google API
**Solution:** Check internet connection, verify API not rate limited

**Problem:** "Wake word not detected"
**Solution:** Speak clearly, try different wake words, check microphone sensitivity

## NEXT STEPS

**Priority actions:**
1. Integrate Anthropic API for actual Claude responses
2. Add offline STT option (Vosk/Whisper)
3. Build voice-to-Trinity pipeline
4. Add voice command history logging
5. Create mobile app for voice input

**Known gaps:**
- No actual AI integration (placeholder responses)
- No offline mode
- No voice command history UI

## TECH STACK

- **Language:** Python 3.8+
- **STT:** SpeechRecognition + Google Speech API
- **TTS:** pyttsx3 (platform-native voices)
- **Audio:** PyAudio
- **Threading:** Python threading module
- **Mobile:** ADB (Android Debug Bridge)

## TAGS
#foundation #voice #speech #tts #stt #wake-word #multiagent #routing

## METADATA
- **Creator:** Commander
- **Created:** 2025
- **Last Updated:** 2026-03-06
- **Version:** 1.0
- **Total Size:** ~47KB Python
- **Modules:** 5
- **Status:** Working

## RELATED DNAS
- [ARAYA_DNA.md] - Voice could route to ARAYA
- [TRINITY_HUB_DNA.md] - Voice for Trinity communication
- [MCP_SERVERS_DNA.md] - Voice commands could trigger MCP tools
- [AGENT_R_DNA.md] - Voice-enabled domain navigation
