# ARAYA LANGUAGE ENGINE DNA

## WHAT IS IT
Universal Language Layer for the ARAYA platform - real-time translation, speech recognition, and pronunciation coaching that flows across all 7 domains. NOT a standalone product but horizontal infrastructure that enables any domain to speak/hear/read any language.

## STATUS
- Working: **MVP WORKING**
- Last tested: 2026-03-15
- Current state: Core endpoints live, needs UI and expansion

## LOCATION
**Primary files:**
- `~/100X_DEPLOYMENT/netlify/functions/araya-translate.mjs` - Translation engine
- `~/100X_DEPLOYMENT/netlify/functions/araya-speech.mjs` - Speech recognition (Whisper)
- `~/100X_DEPLOYMENT/netlify/functions/araya-pronunciation.mjs` - Pronunciation coaching
- `~/100X_DEPLOYMENT/netlify/functions/araya-phrases.mjs` - Phrase library (100 EN/ES)

**Architecture docs:**
- `~/Desktop/1_COMMAND/ARCH_C2_ARAYA_LANGUAGE_BRIDGE_BLUEPRINT_v1.md`
- `~/Desktop/1_COMMAND/ARCH_C2_ARAYA_UNIVERSAL_LANGUAGE_LAYER_v1.md`
- `~/Desktop/1_COMMAND/TECH_C1_ARAYA_LANGUAGE_ENGINE_STACK_v1.md`

## HOW IT WORKS

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT                                    │
│  Text / Audio (base64) / Microphone stream                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 ARAYA LANGUAGE ENGINE                       │
├─────────────────────────────────────────────────────────────┤
│  1. PHRASE CACHE CHECK (2ms)                                │
│     - 100 common phrases instant lookup                     │
│     - If match: return immediately                          │
│                                                             │
│  2. NEURAL TRANSLATION (3s)                                 │
│     - Claude Sonnet for semantic understanding              │
│     - Domain-aware (legal, medical, emergency, etc.)        │
│     - Meaning-based, not word-for-word                      │
│                                                             │
│  3. PRONUNCIATION COACHING                                  │
│     - Whisper transcribes user speech                       │
│     - Compare to target phrase                              │
│     - Claude generates friendly feedback                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    OUTPUT                                   │
│  Translation / Score / Feedback / Audio (future)            │
└─────────────────────────────────────────────────────────────┘
```

## API REFERENCE

### Translation
```bash
POST /api/araya-translate
{
  "text": "Where is the bathroom?",
  "source": "en",        # or "auto" for detection
  "target": "es",
  "domain": "general",   # legal, medical, emergency, travel, etc.
  "understand": true     # optional: get semantic analysis
}

# Response:
{
  "original": "Where is the bathroom?",
  "translation": "¿dónde está el baño?",
  "method": "phrase_cache",  # or "neural"
  "confidence": 0.99,
  "latencyMs": 2
}
```

### Speech Recognition
```bash
POST /api/araya-speech
Content-Type: multipart/form-data
- audio: [audio file]
- language: "es" (optional)

# OR JSON with base64:
{
  "audio": "data:audio/webm;base64,..."
  "language": "es"
}

# Response:
{
  "text": "Hola como estas",
  "language": "es",
  "duration": 2.5,
  "segments": [...],
  "words": [...]
}
```

### Pronunciation Coaching
```bash
POST /api/araya-pronunciation
{
  "target": "Buenos días",
  "userSaid": "Bwenos deas",  # or "audio": base64
  "language": "es"
}

# Response:
{
  "score": 82,
  "feedback": "Great job! For 'días,' try 'dee-ahs'...",
  "problems": [{"expected": "días", "got": "deas"}],
  "passed": true
}
```

### Phrase Library
```bash
# List categories
GET /api/araya-phrases?action=categories

# Get phrases by category
GET /api/araya-phrases?action=list&category=emergency

# Random phrase for practice
GET /api/araya-phrases?action=random

# Search phrases
GET /api/araya-phrases?action=search&q=help
```

## SUPPORTED LANGUAGES (Current)
- English (en) ↔ Spanish (es) - **FULLY WORKING**
- Auto-detection for: zh, ar, ja, ko, fr, de

## PHRASE CATEGORIES
| Category | Count | Examples |
|----------|-------|----------|
| greeting | 10 | Hello, Good morning, Nice to meet you |
| courtesy | 10 | Thank you, Please, Excuse me |
| navigation | 15 | Where is...?, Turn left, I am lost |
| commerce | 15 | How much?, Credit cards?, The check please |
| emergency | 15 | Help!, Call police, I need a doctor |
| health | 15 | I'm allergic to..., Headache, Prescription |
| social | 10 | Where are you from?, Do you speak English? |
| travel | 10 | Reservation, WiFi password, Luggage lost |

## DEPENDENCIES
```bash
# Required API Keys (in Netlify env)
ANTHROPIC_API_KEY=sk-ant-...   # Claude for translation/feedback
OPENAI_API_KEY=sk-...          # Whisper for speech recognition
SUPABASE_URL=https://...       # For phrase storage (optional)
SUPABASE_SERVICE_KEY=eyJ...
```

## HOW TO TEST
```bash
# Translation (phrase cache)
curl -X POST "https://conciousnessrevolution.io/api/araya-translate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Thank you", "source": "en", "target": "es"}'

# Translation (neural)
curl -X POST "https://conciousnessrevolution.io/api/araya-translate" \
  -H "Content-Type: application/json" \
  -d '{"text": "I need legal advice about my immigration case", "source": "en", "target": "es", "domain": "legal"}'

# Pronunciation test
curl -X POST "https://conciousnessrevolution.io/api/araya-pronunciation" \
  -H "Content-Type: application/json" \
  -d '{"target": "Gracias", "userSaid": "Grasias", "language": "es"}'

# Get random phrase
curl "https://conciousnessrevolution.io/api/araya-phrases?action=random"
```

## WHAT'S DONE
- [x] Translation endpoint with phrase cache + neural fallback
- [x] Speech recognition via Whisper
- [x] Pronunciation coaching with Claude feedback
- [x] 100 core EN/ES phrases in 8 categories
- [x] Domain-aware translation (legal, medical, emergency)
- [x] Auto language detection
- [x] All endpoints deployed and tested

## WHAT'S NEEDED (Build Guild Tasks)

### Priority 1: Web UI
- [ ] Language practice interface (hear phrase → repeat → get score)
- [ ] Translation widget for dashboards
- [ ] Phrase browser with audio playback

### Priority 2: More Languages
- [ ] Add Mandarin (zh) phrases
- [ ] Add Arabic (ar) phrases
- [ ] Add French (fr) phrases
- [ ] Add Tagalog (tl) phrases
- [ ] Add Vietnamese (vi) phrases

### Priority 3: Audio Output
- [ ] Text-to-speech for translations (native voice)
- [ ] Audio files for all phrases
- [ ] Playback in earbuds

### Priority 4: Database
- [ ] Create `language_phrases` table in Supabase
- [ ] Create `translation_logs` table for analytics
- [ ] User progress tracking

### Priority 5: Hardware Integration
- [ ] Earbud SDK (BLE protocol)
- [ ] Smart glasses AR overlay
- [ ] Mobile app shell

## DOMAIN INTEGRATION
The Language Layer should integrate with all 7 domains:

| Domain | Use Case |
|--------|----------|
| COMMAND | Legal transcripts, court translation |
| BUILD | Medical terminology, patient intake |
| CONNECT | Classroom captions, multilingual education |
| PROTECT | Emergency response, crisis communication |
| GROW | Business negotiations, contracts |
| LEARN | Media translation, podcasts |
| TRANSCEND | Tourism, cultural exchange |

## COST ESTIMATE
| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Whisper | 100 hrs audio | $36 |
| Claude | 1M tokens | $15 |
| Supabase | Pro | $25 |
| **Total** | | **~$76** |

## ARCHITECTURE VISION
```
Language is NOT a standalone product.
Language is a HORIZONTAL LAYER that flows through ALL domains.

Think of it like the circulatory system:
- Every domain can speak any language
- Every domain can hear any language
- Every domain can teach any language
- Same infrastructure, domain-specific vocabulary
```

## RELATED DNAS
- [ARAYA_DNA.md] - Main ARAYA chat system
- [NETLIFY_DEPLOY_DNA.md] - Deployment infrastructure

## TAGS
#language #translation #speech #pronunciation #multilingual #accessibility #infrastructure

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2026-03-15
- **Version:** 1.0 MVP
- **Status:** Working - Needs UI & Expansion
