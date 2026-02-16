# Ultrasound AI Enhanced - Quick Start Guide

## 🚀 Instant Start (Browser Only)

1. Open `ultraSound.html` in Chrome/Firefox/Safari
2. Grant camera permissions
3. Select camera device from dropdown
4. Click "Start Stream" → "Start Recording"
5. Click "🤖 Run AI Analysis" button

**No installation needed!** Works entirely in browser.

## 🔧 Full Setup (with Python Backend)

### Dependencies

```bash
npm install                    # Node.js packages
pip install numpy pillow opencv-python  # Python packages
```

### Start Backend

```bash
npm run backend   # Starts on port 3000
```

### Open Application

Navigate to `ultraSound.html` in browser. Python features auto-enable when backend detected.

## ✅ Feature Tests

| Test | Steps | Expected Result |
|------|-------|----------------|
| **Basic AI** | Stream → Record → AI Analysis | Results modal with findings |
| **Cancer Detection** | Enable checkbox → Select organ → Analyze | Organ-specific tumor detection |
| **Python Analysis** | Run with backend active | Console shows "🐍 Python Analysis" |
| **Export** | Record 10s → Stop → Export | CSV/JSON download |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| AI not working | Reload page, check `console.log(typeof tf)` |
| No camera | Grant permissions, close other apps |
| Python fails | Verify `npm run backend` is running |
| Slow performance | Close tabs, lower resolution |

## 📊 What to Expect

**Good ultrasound image**: Quality 60-90, detailed findings  
**Webcam on screen**: Quality 20-40, basic analysis  
**Medical probe**: Quality 70-100, professional insights

## 🆘 Support

- **Technical**: GitHub issues
- **Medical**: Healthcare provider
- **Contact**: BarbrickDesign@gmail.com

---

⚠️ **EDUCATIONAL TOOL ONLY** - Professional medical review required for all findings.

See `ULTRASOUND_AI_README.md` for complete documentation.
