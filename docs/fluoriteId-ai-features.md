# Fluorite ID - Advanced AI Features & Video Upload Support

## Overview

The Fluorite Specimen Identifier now features advanced AI modeling using TensorFlow.js and MobileNet for deep learning-powered crystal analysis. The tool supports both photo and video uploads, with automatic frame extraction from videos.

## Advanced AI Modeling Features

### TensorFlow.js Integration

The Fluorite Identifier now uses advanced machine learning models for enhanced analysis:

**Neural Network Models:**
- **MobileNet**: Pre-trained image classification model for feature extraction
- **Custom Analysis**: Crystal-specific feature detection from neural embeddings

**AI-Powered Features:**

1. **Crystal Habit Detection**
   - Automatic classification: Cubic (octahedral faces), Cubic (well-formed), Cubic (modified), or Massive/irregular
   - Based on symmetry analysis and region detection
   - 70-98% confidence scoring

2. **Crystallinity Analysis**
   - Quantitative crystallinity score (0-100%)
   - Measures crystal quality and formation
   - Combines symmetry and texture complexity

3. **Texture Complexity**
   - Analyzes surface patterns and zoning
   - Detects growth patterns and etching
   - Normalized 0-1 scale

4. **Symmetry Scoring**
   - Important for crystal classification
   - Higher scores indicate well-formed crystals
   - Used in habit determination

5. **Multi-Region Detection**
   - K-means clustering identifies distinct zones
   - Detects color zoning and phantoms
   - 3-10 distinct regions typical

6. **Enhanced Locality Matching**
   - Combines color analysis with AI features
   - Neural network-based scoring
   - 30% color + 30% AI features + 40% user input

**How AI Analysis Works:**

1. **Model Loading** (automatic on first analysis)
   - TensorFlow.js loads from CDN
   - MobileNet model (~16MB) cached in browser
   - Takes 2-5 seconds on first use

2. **Feature Extraction**
   - Image processed through MobileNet layers
   - 1000+ features extracted per image
   - Features analyzed for crystal characteristics

3. **Crystal Analysis**
   - K-means clustering for region detection
   - Symmetry calculations for habit classification
   - Texture analysis for surface characteristics
   - Crystallinity scoring from combined features

4. **Enhanced Predictions**
   - AI features boost locality confidence
   - Habit automatically classified
   - Detailed explanations with AI insights

**AI Results Display:**

When AI analysis completes, you'll see:
- 🧠 Status: "AI-enhanced with TensorFlow.js"
- Tag: "🧠 AI-enhanced analysis"
- Crystal habit: e.g., "Cubic (octahedral faces)"
- Crystallinity percentage in pocket details
- MobileNet predictions in explanation tags
- Enhanced confidence scores

**Performance:**

- **First analysis**: 3-8 seconds (model loading + analysis)
- **Subsequent analyses**: 1-2 seconds (model cached)
- **Browser requirements**: Modern browser with JavaScript enabled
- **No server upload**: All processing happens in your browser

## How It Works - Video Upload

### Uploading a Video

1. Click on any of the four capture buttons:
   - Front-lit overview
   - Angled / zoning
   - Macro of faces
   - UV response (optional)

2. Select a video file from your device (MP4, MOV, WebM, AVI, etc.)

3. The tool will:
   - Show "🎥 Processing video..." message
   - Extract a frame from the middle of the video
   - Convert it to a JPEG image
   - Analyze the image quality (blur, lighting, resolution)
   - Add it to your specimen analysis

### Benefits of Video Upload

- **Easier to capture**: Record a video while slowly rotating your specimen
- **Better frame selection**: The tool extracts from the middle of the video where lighting is usually stable
- **Mobile-friendly**: Most phones make it easier to record video than take perfect photos
- **Same quality analysis**: Extracted frames go through the same quality checks as photos

### Technical Details

**Supported Video Formats:**
- MP4 (video/mp4)
- MOV (video/quicktime)  
- WebM (video/webm)
- AVI (video/x-msvideo)
- Any format your browser supports

**File Size Limits:**
- Photos: 10MB maximum
- Videos: 50MB maximum

**Frame Extraction:**
- Extracts frame from the middle of the video (duration / 2)
- Converts to JPEG format with 95% quality
- Maintains original resolution
- Automatically cleaned up after processing

### Tips for Best Results

**For Videos:**
1. Record in good lighting
2. Keep the camera steady or move slowly
3. Record for at least 3-5 seconds
4. Fill the frame with your specimen
5. Use a neutral background (grey or white)

**For Photos:**
1. Use natural or diffused lighting
2. Hold camera steady or use a tripod
3. Focus carefully on the specimen
4. Avoid extreme close-ups that blur the image
5. Use a neutral background

### Quality Analysis

Both photos and extracted video frames are analyzed for:
- **Sharpness**: Blur detection using Laplacian variance
- **Lighting**: Checks for proper brightness (not too dark or overexposed)
- **Resolution**: Verifies image size is adequate for analysis
- **Contrast**: Ensures sufficient contrast for feature detection

You'll receive feedback like:
- ✓ "Front-lit video frame added (1920x1080, good quality)"
- ⚠️ "Angled image may be blurry. Try retaking with better focus."
- 💡 "Macro image is dark. Try better lighting for best results."

### Browser Compatibility

Video upload and frame extraction works in all modern browsers:
- ✅ Chrome/Edge (Chromium-based)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ✅ Samsung Internet
- ✅ Opera

No additional plugins or software required.

### Troubleshooting

**"Failed to process video"**
- Video file may be corrupted
- Video format may not be supported by your browser
- Try converting to MP4 format
- Try recording a new video

**"Video too large"**
- Reduce video length (shorter is better)
- Use lower resolution settings on your camera
- Compress the video using a video editor
- Maximum size is 50MB

**"Video frame is blurry"**
- Record video with better lighting
- Keep camera more steady
- Move more slowly when recording
- Try taking a regular photo instead

**Frame extraction seems stuck**
- Wait a few seconds (can take 2-5 seconds for large videos)
- Check browser console for errors
- Try refreshing the page
- Try a different video file

### Privacy & Data

- Videos are processed entirely in your browser (client-side)
- No videos are uploaded to any server
- Only the extracted frame is stored temporarily for analysis
- All data is cleared when you close the page
- Your specimens and images are never shared without consent

### Future Enhancements

Planned improvements for video support:
- [ ] Extract multiple frames from video for better analysis
- [ ] Allow user to select which frame to use
- [ ] Support for analyzing UV video recordings
- [ ] Automatic best-frame selection using quality scoring
- [ ] Frame interpolation for smoother captures

## Questions?

Contact: BarbrickDesign@gmail.com

---

*Last updated: 2026-02-07*
