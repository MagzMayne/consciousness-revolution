# 🏭 AI Warehouse Inventory Scanner

Complete AI-powered inventory management system for computer recycling warehouses with automatic identification, valuation, and location tracking.

## 📋 Overview

The AI Warehouse Inventory Scanner is a mobile-first web application that enables warehouse workers to quickly scan, identify, and track electronics inventory using their phone camera. It features:

- **AI-Powered Object Detection** - Automatically identifies computers, printers, monitors, and electronics
- **Barcode/QR Code Scanning** - Quick identification using existing labels
- **Auto-Valuation Engine** - Estimates market value based on type, condition, and specifications
- **Warehouse Mapping** - Visual tracking of item locations with 3-tier pallet support
- **Real-time Inventory** - Live updates and editing capabilities
- **AI Assistant** - Intelligent guidance and suggestions throughout scanning
- **Offline Support** - Works without internet connection using local storage

## 🚀 Quick Start

1. **Access the Scanner**
   - Open `warehouse-inventory-scanner.html` on your mobile device
   - Grant camera permissions when prompted

2. **Configure Auto Features** (Optional but Recommended)
   - Tap the ⚙️ Settings icon
   - Enable/disable Auto-Capture, Auto-Identify, and Auto-Value
   - Adjust confidence threshold for auto-capture (60-95%)
   - Save settings

3. **Start Scanning**
   - Tap "Start Scanning" to activate the camera
   - Point camera at electronics items
   - **With Auto Features Enabled:**
     - AI automatically identifies items in real-time (Auto-Identify 🔍)
     - Items are automatically captured when confidence is high (Auto-Capture 📸)
     - Values are automatically estimated (Auto-Value 💰)
   - **Manual Mode:**
     - View detection results
     - Tap "Capture Item" to manually add items
   
4. **View Inventory**
   - Switch to "Inventory" tab to see all scanned items
   - Use search and filters to find specific items
   - View warehouse map showing item locations
   - See value analysis and top items

## 📱 Features

### 🛡️ Duplicate Detection (NEW!)

**Visual ID Technology**
- Generates unique visual fingerprint for each scanned item
- Combines detection class, bounding box, and image hash
- Identifies same physical item across multiple scans
- Prevents duplicate inventory entries automatically

**Smart Duplicate Prevention**
- Checks visual ID, barcode, and serial number before adding
- Shows warning when duplicate detected
- Maintains accurate inventory counts
- Logs all duplicate prevention events

**Location Tracking**
- Tracks item movement across warehouse
- Maintains complete location history with timestamps
- Updates location when item moves
- Shows "last seen" timestamp for each item
- Displays location history in item details

**Duplicate Handling**
- Same location: Updates last-seen time only
- Different location: Updates location and logs to history
- Visual feedback: Toast notifications for duplicates
- Detailed logging: Console logs with Visual IDs and timestamps

### 🤖 Auto Features

**Auto-Capture**
- Automatically captures items when detected with high confidence
- Configurable confidence threshold (60-95%)
- Visual feedback with capture indicator
- Prevents duplicate captures with delay timer (2 seconds)
- Can be toggled on/off in settings

**Auto-Identify**
- Continuous real-time identification during scan
- No manual intervention required
- Visual indicators show auto-identified items
- Works with both object detection and barcode modes
- Provides confidence scores for each detection

**Auto-Value**
- Automatic value estimation for all detected items
- Uses comprehensive valuation database
- Factors in category, type, brand, and model
- Shows estimated value immediately upon capture
- Can be disabled for manual valuation workflows

**Configuration**
- Access all auto features in Settings (⚙️ icon)
- Independent toggles for each feature
- Confidence threshold slider for auto-capture
- Real-time status display during scanning
- Settings persist across sessions

### Camera-Based Scanning

**Object Detection Mode**
- Uses TensorFlow.js COCO-SSD model for real-time object detection
- Identifies computers, laptops, printers, monitors, and electronics
- Visual bounding boxes show detected items
- Confidence scoring for accuracy assessment

**Barcode Scanning Mode**
- Uses ZXing library for barcode/QR code reading
- Supports multiple barcode formats (UPC, EAN, Code128, QR, etc.)
- Instant lookup of product information
- Toggle between modes with one tap

### Automatic Identification

The system automatically identifies:
- **Computers** - Dell, HP, Lenovo, Apple desktops
- **Laptops** - All major brands and models
- **Printers** - Laser, inkjet, multifunction units
- **Monitors** - Various sizes and resolutions
- **Servers** - Rack-mounted and tower servers
- **Tablets & Electronics** - Mobile devices and components

### Auto-Valuation Engine

Estimates market value based on:
- **Device Type** - Category-specific pricing
- **Brand & Model** - Manufacturer and series identification
- **Condition** - Excellent, good, fair, poor, for-parts
- **Age** - Depreciation calculation (15% per year)
- **Specifications** - RAM, storage, CPU, GPU bonuses
- **Market Data** - Simulated eBay/market price ranges

**Condition Multipliers:**
- Excellent: 90% of base value
- Good: 70% of base value
- Fair: 50% of base value
- Poor: 30% of base value
- For-Parts: 10% of base value

### Warehouse Management

**Location Tracking**
- 40-cell warehouse grid (A1-E8)
- Visual status indicators (scanned, pending, high-value)
- Click any location to see items and total value
- Customizable location naming

**Multi-Tier Support**
- Tracks items stacked up to 3 tiers high
- Identifies quantity of identical items
- Pallet-level valuation
- Optimal scanning path suggestions

**Inventory Management**
- Add, edit, delete items
- Search by name, model, manufacturer
- Filter by category, location, status
- Sort by value, time, location
- Bulk export/import (JSON format)

### AI Helper System

**Real-Time Guidance**
- Scanning tips and best practices
- Item identification assistance
- Lighting and positioning feedback
- Error correction suggestions

**Voice Commands**
- "Start scan" - Begin scanning
- "Stop scan" - End session
- "Capture" - Manually capture item
- "Show inventory" - Switch to inventory view
- "Help" - Display help information

**Smart Suggestions**
- Identifies unscanned locations
- Flags low-value items for review
- Highlights high-value clusters
- Recommends optimal workflow

### Data Management

**Local Storage**
- IndexedDB for robust offline storage
- Automatic backup and sync
- No server required
- Privacy-focused (data stays on device)

**Export Options**
- JSON format with full data
- CSV for spreadsheet import
- Include item images
- Session reports

**Import Capabilities**
- Restore from backup
- Merge multiple sessions
- Update existing items
- Validation and error handling

## 🛠️ Technical Architecture

### Frontend Technologies

```
HTML5 + CSS3 + Vanilla JavaScript
├── TensorFlow.js 4.11.0 (AI object detection)
├── COCO-SSD 2.2.3 (pre-trained model)
├── ZXing 0.20.0 (barcode scanning)
└── IndexedDB (local storage)
```

### JavaScript Modules

**warehouse-inventory-db.js**
- Database management using IndexedDB
- CRUD operations for items
- Session tracking
- Statistics and analytics

**warehouse-valuation-engine.js**
- Comprehensive valuation database
- Condition and age depreciation
- Specification bonuses
- Market price estimation

**warehouse-scanner-ai.js**
- Camera initialization and control
- TensorFlow.js object detection
- ZXing barcode scanning
- Frame capture and processing
- Visual ID generation for duplicate detection

**warehouse-ai-helper.js**
- Contextual help system
- Voice synthesis
- Smart suggestions
- Efficiency analysis

**warehouse-scanner-ui.js**
- Main application controller
- UI event handling
- View management
- Data visualization
- Duplicate detection handling

### Database Schema

**Items Store**
```javascript
{
  id: auto-increment,
  name: string,
  category: string,
  type: string,
  model: string,
  manufacturer: string,
  condition: string,
  quantity: number,
  value: number,
  estimatedValue: number,
  location: string,
  zone: string,
  tier: number,
  barcode: string,
  serialNumber: string,
  notes: string,
  imageData: base64,
  visualId: string,              // NEW: Unique visual fingerprint
  scannedAt: timestamp,
  lastSeenAt: timestamp,          // NEW: Last time item was detected
  status: string,
  tags: array,
  locationHistory: array          // NEW: [{location, timestamp}, ...]
}
  tags: array
}
```

**Locations Store**
```javascript
{
  id: string,
  zone: string,
  scanned: boolean,
  itemCount: number,
  totalValue: number
}
```

**Sessions Store**
```javascript
{
  id: auto-increment,
  startTime: timestamp,
  endTime: timestamp,
  warehouseId: string,
  operator: string,
  itemsScanned: number,
  totalValue: number,
  status: string
}
```

## 📊 Valuation Database

### Base Values by Category

**Desktop Computers**
- Dell OptiPlex: $150-350
- HP EliteDesk: $200-400
- Lenovo ThinkCentre: $150-350
- Apple iMac: $400-1,200
- Gaming PC: $800+
- Workstation: $1,000+

**Laptops**
- Dell Latitude: $200-500
- HP EliteBook: $300-400
- Lenovo ThinkPad: $250-600
- MacBook Pro: $700-1,500
- MacBook Air: $600
- Gaming Laptop: $700+
- Chromebook: $150

**Printers**
- HP LaserJet: $100-300
- HP OfficeJet: $80-150
- Canon ImageClass: $120-200
- Brother HL-Series: $100-150
- Multifunction: $150+

**Monitors**
- Dell UltraSharp: $150-400
- HP EliteDisplay: $140-190
- LG UltraFine: $250-500
- Samsung: $120-300

**Servers**
- Dell PowerEdge: $300-800
- HP ProLiant: $600-800

**Tablets**
- iPad: $300-700
- Microsoft Surface: $300-500

## 🎯 Use Cases

### Computer Recycling Warehouse

1. **Receiving Dock**
   - Scan incoming pallets
   - Quick item identification
   - Auto-assign locations
   - Generate receiving reports

2. **Warehouse Floor**
   - Walk-through inventory
   - Update locations
   - Track multi-tier stacks
   - Identify high-value items

3. **Quality Check**
   - Assess condition
   - Update valuations
   - Flag issues
   - Photo documentation

4. **Outbound Processing**
   - Pick items by value
   - Generate pick lists
   - Track removals
   - Update inventory

### E-Waste Management

- Track hazardous materials
- Document disposal
- Compliance reporting
- Value recovery analysis

### Asset Liquidation

- Quick valuation
- Lot management
- Auction preparation
- Sales tracking

### IT Asset Disposition (ITAD)

- Device intake
- Data sanitization tracking
- Certification documentation
- Value reporting

## 🔧 Configuration

### Settings

Access settings via the ⚙️ icon:

**Auto-Valuation**
- Enable/disable automatic value estimation
- Useful for manual valuation workflows

**Voice Commands**
- Enable/disable voice recognition
- Adjust for noisy environments

**AI Helper**
- Enable/disable contextual help
- Customize help frequency

**Warehouse ID**
- Set unique warehouse identifier
- Used for multi-location tracking

**Default Location**
- Set starting location for new scans
- Speeds up data entry

### Advanced Configuration

**Detection Settings** (in code):
```javascript
// Frame rate (frames per second)
this.frameRate = 10;

// Detection buffer size (consistency check)
this.bufferSize = 3;

// Camera resolution
constraints: {
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  }
}
```

**Valuation Adjustments**:
```javascript
// Age depreciation rate (15% per year)
this.ageDepreciationRate = 0.15;

// Condition multipliers
this.conditionMultipliers = {
  'excellent': 0.9,
  'good': 0.7,
  'fair': 0.5,
  'poor': 0.3,
  'for-parts': 0.1
}
```

## 📈 Performance Optimization

### Mobile Performance

- Lazy loading of AI models
- Frame rate limiting (10 FPS)
- Detection buffering (reduces false positives)
- Canvas optimization
- Image compression (JPEG 80% quality)

### Battery Optimization

- Stop camera when not in use
- Reduce frame processing rate
- Disable voice synthesis when not needed
- Minimize background operations

### Storage Optimization

- IndexedDB for efficient storage
- Image compression
- Automatic cleanup of old sessions
- Export/archive old data

## 🔒 Privacy & Security

- **No Server Communication** - All data stays on device
- **No Cloud Storage** - IndexedDB is local only
- **Camera Access** - Only when scanning, not background
- **Export Control** - User controls data export
- **No Tracking** - No analytics or telemetry

## 🐛 Troubleshooting

### Camera Issues

**Camera won't start:**
- Check browser permissions
- Try HTTPS connection
- Restart browser
- Check other apps aren't using camera

**Poor detection accuracy:**
- Improve lighting
- Get closer to items
- Hold camera steady
- Clean camera lens

**Slow performance:**
- Close other apps
- Restart browser
- Clear browser cache
- Reduce camera resolution

### AI Detection Issues

**Items not being detected:**
- Ensure item is centered in frame
- Check lighting conditions
- Try different angles
- Switch to barcode mode

**Wrong identification:**
- Manually correct item details
- Update valuation
- Add notes for future reference
- Consider condition factors

### Database Issues

**Data not saving:**
- Check storage quota
- Clear old data
- Export and reimport
- Check browser compatibility

**Slow queries:**
- Reduce item count
- Archive old sessions
- Clear search filters
- Restart application

## 📱 Browser Compatibility

**Fully Supported:**
- Chrome 90+ (Android/iOS)
- Safari 14+ (iOS)
- Edge 90+ (Android)
- Samsung Internet 14+

**Partially Supported:**
- Firefox 88+ (AI features limited)
- Opera 76+ (Some features limited)

**Requirements:**
- Camera access
- JavaScript enabled
- IndexedDB support
- 2GB RAM minimum
- Modern browser (2021+)

## 🎓 Best Practices

### Scanning Workflow

1. **Preparation**
   - Clear workspace
   - Ensure good lighting
   - Organize items by type
   - Set default location

2. **Scanning Session**
   - Start with high-value items
   - Scan one item at a time
   - Verify auto-detection
   - Add manual notes as needed

3. **Review**
   - Check all items scanned
   - Verify valuations
   - Update locations
   - Fix any errors

4. **Export**
   - Export data at end of session
   - Back up to cloud storage
   - Generate reports
   - Clear old data

### Value Accuracy

- Manually verify high-value items
- Check condition carefully
- Research current market prices
- Document unique features
- Take clear photos

### Location Management

- Use consistent naming
- Update locations immediately
- Mark high-value clusters
- Plan efficient scanning paths
- Review warehouse map regularly

## 🔄 Updates & Maintenance

### Data Backup

**Automatic:**
- IndexedDB browser backup
- Session auto-save

**Manual:**
- Export JSON regularly
- Store off-device
- Version control exports

### Model Updates

The AI models are loaded from CDN:
- TensorFlow.js: Auto-updated
- COCO-SSD: Stable version
- ZXing: Latest stable

### Application Updates

Check for updates at:
- GitHub repository
- Release notes
- Changelog

## 📞 Support

**Documentation:**
- This README
- Inline code comments
- JSDoc documentation

**Issues:**
- GitHub Issues
- BarbrickDesign@gmail.com

**Contributing:**
- Fork repository
- Submit pull requests
- Report bugs
- Suggest features

## 📄 License

MIT License - See LICENSE file

## 🙏 Credits

**AI Models:**
- TensorFlow.js Team
- COCO Dataset Team

**Libraries:**
- ZXing Project
- IndexedDB Community

**Developed by:**
- Barbrick Design
- Ryan Barbrick

---

## 🎉 Version History

**v1.2.0** (2026)
- **NEW: Duplicate Detection System** - Prevents same item from being added multiple times
- **NEW: Visual ID Generation** - Creates unique fingerprint for each scanned item
- **NEW: Location Tracking** - Complete history of item movements in warehouse
- **NEW: Last Seen Timestamp** - Tracks when items were last detected
- Added duplicate prevention with visual ID, barcode, and serial number matching
- Enhanced item details view with location history display
- Improved logging for duplicate detection and location changes
- Database schema upgraded to v2 with automatic migration

**v1.1.0** (2025)
- **NEW: Auto-Capture** - Automatically captures items during scanning
- **NEW: Auto-Identify** - Continuous real-time item identification
- **NEW: Auto-Value** - Automatic value estimation for all items
- Added configurable confidence threshold for auto-capture
- Enhanced settings with independent toggles for auto features
- Improved visual feedback with capture indicators
- Better valuation accuracy with name-based matching
- Status display shows active auto features during scan

**v1.0.0** (2024)
- Initial release
- AI object detection
- Barcode scanning
- Auto-valuation
- Warehouse mapping
- AI helper system
- Offline support

---

For questions or support, contact: BarbrickDesign@gmail.com
