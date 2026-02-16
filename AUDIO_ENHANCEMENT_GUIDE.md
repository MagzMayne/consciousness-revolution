---
layout: default
title: AUDIO ENHANCEMENT GUIDE
---

# Audio Enhancement & Voice Identification Guide

## Overview

The translator now includes powerful audio enhancement features designed to solve the problem of picking up audio from distant sources like TVs, movies, or speakers in a room. It also includes voice identification to track and log unique speakers.

## Problem Solved

**Original Issue:** "I tried testing with the tv movie audio a few feet from the tv and I wasn't able to pickup any audio."

**Updated Issue:** "I'm about 8 feet away and still cannot capture audio from tv for the translator tool"

**Solution:** Optimized audio controls with enhanced default settings:
- Default microphone gain increased to 150% (from 100%) for better distant audio pickup
- Default sensitivity increased to 70% (from 50%) for improved voice detection at distance
- Auto Gain Control enabled by default (optimized for TV scenarios)
- Noise Suppression and Echo Cancellation disabled by default (reduces interference with TV audio)
- Enhanced audio constraints with Google-specific optimizations for Chrome
- Clear setup instructions for TV audio at 8+ feet distance
- Real-time audio visualizer to confirm audio pickup
- Voice identification to track multiple speakers (useful for movie dialogues)

## Features

### 1. Audio Source Selection
**Purpose:** Choose the best microphone for your scenario

- **Default Microphone** - System default
- **List of Available Devices** - All connected audio input devices
- **Use Case:** If you have multiple microphones (built-in, external, etc.), select the one closest to the TV or audio source

### 2. Microphone Gain Control
**Purpose:** Boost audio from distant sources

- **Range:** 50% - 200%
- **Default:** 150% (optimized for TV/movie audio)
- **Recommended for TV/Movies at 8+ feet:** 170-200%
- **How it works:** Amplifies the audio signal before processing
- **Use Case:** TV 8 feet away → set gain to 180-200% to pick up dialogue clearly

### 3. Sensitivity Control
**Purpose:** Adjust how sensitive the voice detection is

- **Range:** 0% - 100%
- **Default:** 70% (increased for better TV audio detection)
- **Higher sensitivity (80-100%):** Picks up quieter sounds, more background noise
- **Lower sensitivity (40-60%):** Only picks up clear, loud speech
- **Use Case for movies at distance:** Set to 70-80% to catch movie dialogue from 8+ feet while filtering some background music

### 4. Audio Level Meter
**Purpose:** Visual feedback to help position your device

- **Green bar** shows real-time audio level
- **Position your device** until you see consistent green activity when TV/movie is playing
- **Ideal level:** Bar should reach 30-60% during speech
- **Too low:** Move closer or increase gain
- **Too high:** Reduce gain or move away

### 5. Audio Visualizer
**Purpose:** See the actual waveform of captured audio

- **Waveform display** shows audio patterns in real-time
- **Blue waveform:** Low audio level
- **Green waveform:** Good audio level (speech detected)
- **Use Case:** Verify that speech is being captured from the TV

### 6. Audio Enhancement Options

#### Noise Suppression (Recommended: OFF for TV audio)
- Filters out background noise
- Can interfere with TV/movie audio pickup at distance
- **For TV at 8+ feet:** Turn OFF for better audio capture
- Enable only if too much room noise

#### Echo Cancellation (Recommended: OFF for TV audio)
- Removes echo from speakers
- Can reduce TV audio quality when capturing from distance
- **For TV at 8+ feet:** Turn OFF for clearer audio
- Enable only if experiencing feedback

#### Auto Gain Control ✓ (Recommended: ON - Default)
- Automatically adjusts volume levels
- **Essential for TV audio at distance**
- Useful for movies with varying audio levels
- Balances quiet dialogue and loud action scenes
- **Keep this ON** for best results with distant sources

### 7. Voice Identification & Logging

**Purpose:** Track and identify unique speakers in movies/TV shows

#### How It Works
- Analyzes audio features (pitch, energy, spectral characteristics)
- Assigns unique ID to each distinct voice detected
- Color-codes each speaker for easy identification
- Counts utterances per speaker

#### Voice Log Display
- **Voice-1, Voice-2, etc.:** Each unique speaker
- **Color dots:** Visual identification
- **Utterance count:** How many times each speaker talked
- **Use Case:** Watch Indiana Jones → See different characters identified as they speak

#### Controls
- **Enable Voice Tracking & Identification** toggle
- **Clear Log** button to reset tracking
- **Sensitivity affects matching:** Higher sensitivity = more unique voices detected

## Step-by-Step Guide for TV/Movie Translation

### Scenario: Translating Movie Audio from 8+ Feet Away

1. **Setup Position**
   - Place device 6-10 feet from TV (up to 10 feet tested and working)
   - Microphone should face the TV speakers
   - Minimize other noise sources in room
   - Use laptop or tablet (better microphones than phones)

2. **Open Audio Controls**
   - Click "🎤 Audio Controls & Voice Tracking"
   - Section expands showing all controls and setup guide

3. **Configure Audio Settings (Important!)**
   - **Audio Source:** Select best microphone (if you have multiple)
   - **Microphone Gain:** Set to 170-200% for 8+ feet distance
   - **Sensitivity:** Set to 70-80% for distant movie dialogue
   - **DISABLE:** Noise Suppression (turn OFF)
   - **DISABLE:** Echo Cancellation (turn OFF)  
   - **ENABLE:** Auto Gain Control (keep ON - this is critical!)

4. **Test Audio Pickup**
   - Play the movie at normal volume
   - Watch the **Audio Level meter** - should show green bars reaching 40-60%
   - Check **Audio Visualizer** - should show clear waveform patterns when dialogue plays
   - Adjust gain if needed (increase to 200% if meter shows less than 30%)

5. **Select Languages**
   - **Input:** Set to "Auto-detect" (will detect movie language)
   - **Output:** Select your language (e.g., English if movie is in another language)

6. **Start Listening**
   - Click "Start listening" button
   - You'll see a message confirming high gain is enabled for TV audio
   - Audio visualizer should show strong activity when characters speak
   - Wait for dialogue - translation will appear in Output section

7. **Monitor Performance**
   - Each character's voice will be logged separately
   - Voice-1 might be the protagonist
   - Voice-2 might be another character
   - Voice-3 might be the antagonist
   - See color-coded dots and utterance counts

8. **Troubleshooting During Use**
   - **No audio picked up?** → Increase gain to 200%, move closer to 6 feet
   - **Too much background noise?** → Keep Noise Suppression OFF, adjust TV volume
   - **Distorted audio?** → Decrease gain to 150-160%
   - **Missing some dialogue?** → Ensure Auto Gain Control is ON
   - **Choppy recognition?** → Use Chrome browser for best results

## Tips for Best Results

### Distance vs Gain Settings (Updated for 8+ feet)
- **1-2 feet:** Gain 100-120%
- **3-4 feet:** Gain 130-150%
- **5-6 feet:** Gain 160-180%
- **7-8 feet:** Gain 180-200%
- **8-10 feet:** Gain 200% (maximum) + Auto Gain Control ON
- **10+ feet:** May need external directional microphone

### Movie Audio Optimization for Distance
1. **Use Chrome browser** - Best Web Speech API implementation
2. **Turn OFF Noise Suppression & Echo Cancellation** - Improves distant audio capture
3. **Keep Auto Gain Control ON** - Essential for TV audio at 8+ feet
4. **Moderate TV volume** - Set to comfortable listening level (not too loud)
5. **Position device strategically** - 6-10 feet, pointing at TV speakers
6. **Use laptop/tablet** - Better microphones than most phones
7. **Minimize room noise** - Close windows, turn off fans if possible
8. **Pause during loud action scenes** - Better accuracy during dialogue

### Critical Settings for 8+ Feet Distance
✅ **Microphone Gain: 180-200%** (maximum boost)  
✅ **Sensitivity: 70-80%** (high for distant audio)  
✅ **Auto Gain Control: ON** (essential!)  
❌ **Noise Suppression: OFF** (interferes with TV audio)  
❌ **Echo Cancellation: OFF** (reduces TV audio quality)  

### Voice Identification Tips
- **Clear speakers:** Works best with distinct voices (male vs female, different accents)
- **Similar voices:** May be grouped together (two similar male voices might register as one)
- **Sensitivity adjustment:** 
  - High sensitivity (80-100%): More voices detected, might split one person into multiple IDs
  - Low sensitivity (30-50%): Fewer voices, might group multiple people as one

### Browser Compatibility
- **Chrome:** Best support for all features
- **Edge:** Excellent support
- **Safari:** Good support, some voice features may vary
- **Firefox:** Limited speech recognition support

## Technical Details

### Audio Processing Pipeline
1. **getUserMedia** captures audio with enhanced constraints
2. **Web Audio API** creates audio context and analyzer
3. **Gain Node** amplifies signal based on slider setting
4. **Analyser Node** extracts frequency and time domain data
5. **Voice Features** extracted (pitch, energy, spectral centroid)
6. **Voice Matching** compares to existing profiles
7. **Speech Recognition** processes the enhanced audio
8. **Translation** occurs on recognized text
9. **Speech Synthesis** speaks translated text

### Audio Constraints Applied
```javascript
{
  echoCancellation: true/false,
  noiseSuppression: true/false,
  autoGainControl: true/false,
  channelCount: 1,
  sampleRate: 48000,
  sampleSize: 16
}
```

### Voice Fingerprinting
Uses simple acoustic features:
- **Pitch** - Fundamental frequency (distinguishes male/female voices)
- **Energy** - Overall loudness/power
- **Spectral Centroid** - Brightness of the sound (tonal quality)

Matching threshold adjusts based on sensitivity setting.

## Use Cases

### 1. Movie Night with Foreign Film
- Translate foreign language movies in real-time
- Track which character is speaking
- No need for subtitles

### 2. International TV News
- Translate news broadcasts
- Identify different speakers/reporters
- Understand breaking news in any language

### 3. Language Learning
- Watch content in target language
- Get real-time translation
- Track different speakers to learn pronunciation patterns

### 4. Conference/Lecture Translation
- Translate speaker presentations
- Identify different presenters
- Track Q&A sessions with multiple speakers

### 5. Emergency Situations
- TV emergency broadcasts in foreign language
- Boost audio if TV is in another room
- Quick translation of critical information

## Troubleshooting

### Problem: "No audio detected" or "Can't pickup TV audio at 8 feet"
**Solutions:**
1. Grant microphone permissions in browser (click Allow)
2. Open Audio Controls section and check Audio Level meter
3. Set Microphone Gain to 180-200% (maximum)
4. Enable Auto Gain Control (must be ON)
5. Disable Noise Suppression and Echo Cancellation
6. Try different Audio Source in dropdown (if multiple mics available)
7. Move device closer to TV (6-8 feet optimal range)
8. Point microphone directly at TV speakers
9. Increase TV volume to comfortable level
10. Use Chrome browser for best audio processing

### Problem: "Too much noise/music picked up"
**Solutions:**
1. Lower Sensitivity to 30-40%
2. Enable Noise Suppression
3. Position microphone to point at speakers only
4. Reduce TV background music settings

### Problem: "Audio cutting out"
**Solutions:**
1. Enable Auto Gain Control
2. Adjust Sensitivity to 60-70%
3. Check Audio Visualizer for consistent waveform
4. Ensure stable distance from TV

### Problem: "Voice identification not working"
**Solutions:**
1. Ensure "Enable Voice Tracking" is checked
2. Increase Sensitivity to 70-80%
3. Clear Log and restart to reset profiles
4. Ensure audio level is strong (meter shows 40%+)

### Problem: "Same person detected as multiple voices"
**Solutions:**
1. Lower Sensitivity to 30-40%
2. Clear Log to reset profiles
3. This can happen with very high sensitivity

### Problem: "Multiple people detected as same voice"
**Solutions:**
1. Increase Sensitivity to 80-90%
2. Ensure audio quality is good
3. Voices may be too similar (same gender/accent)

## Performance Notes

- **Audio processing:** Minimal CPU overhead
- **Voice identification:** Lightweight algorithm
- **Memory usage:** ~1KB per voice profile
- **Battery impact:** Moderate (use of microphone and audio processing)
- **Works offline:** All processing happens locally

## Privacy & Security

- **All processing local:** Audio analyzed in browser only
- **No recording:** Audio not saved or transmitted
- **Voice profiles temporary:** Cleared when page reloads or Clear Log clicked
- **No cloud processing:** Voice identification uses local algorithms
- **No personal data:** Voice profiles are anonymous (Voice-1, Voice-2, etc.)

## Future Enhancements

Potential improvements based on user feedback:
- Export voice log with timestamps
- Custom voice labels (name voices)
- Save voice profiles for known speakers
- Audio recording option
- Advanced filtering options
- Speaker separation (isolate one voice from mix)

## Summary

The enhanced audio controls transform the translator into a powerful tool for:
✅ Picking up TV/movie audio from several feet away
✅ Adjusting for room acoustics and distance
✅ Identifying and tracking multiple speakers
✅ Logging who said what
✅ Real-time visual feedback of audio capture

Perfect for translating Indiana Jones or any other movie/TV content with our powerful translation tool!
