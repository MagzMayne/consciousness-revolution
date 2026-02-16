# igGems.html User Guide

## Quick Start Guide

### What is igGems?
A tool to analyze Instagram gemstone listings and compare them with eBay sold prices to find profitable arbitrage opportunities.

**No Instagram API required** - manually collect data from Instagram posts.

---

## How to Use

### Step 1: Add Gemstones

Choose one of three methods:

#### Option A: Manual Entry
1. Click **"Manual Entry"** button
2. Fill in the form:
   - **Stone Name** (required): e.g., "Tourmaline", "Spinel", "Sapphire"
   - **Price USD** (required): Instagram listing price
   - **Weight carats** (required): Stone weight
   - **Instagram Username** (required): e.g., "@gemdealer"
   - **Post URL** (optional): Direct link to Instagram post
   - **Caption** (optional): Notes or full caption
3. Click **"Add Stone to List"**
4. Repeat for multiple stones

#### Option B: CSV Import
1. Click **"Import CSV"** button
2. Prepare CSV file with columns:
   ```
   stone_name, price_value, weight_ct, source, caption, permalink
   ```
   Example:
   ```csv
   stone_name,price_value,weight_ct,source,caption,permalink
   Tourmaline,150,2.5,@gemdealer,Beautiful pink tourmaline,https://instagram.com/p/xyz
   Spinel,300,1.8,@gems4sale,Rare blue spinel for sale,
   ```
3. Upload CSV file
4. All stones imported automatically

#### Option C: JSON Paste
1. Click **"Paste JSON"** button
2. Paste JSON array:
   ```json
   [
     {
       "stone_name": "Tourmaline",
       "price_value": 150,
       "weight_ct": 2.5,
       "source": "@gemdealer",
       "caption": "Beautiful pink tourmaline",
       "permalink": "https://instagram.com/p/xyz"
     },
     {
       "stone_name": "Spinel",
       "price_value": 300,
       "weight_ct": 1.8,
       "source": "@gems4sale",
       "caption": "Rare blue spinel",
       "permalink": ""
     }
   ]
   ```
3. Click **"Import JSON"**

### Step 2: Analyze Stones

1. Click **"Analyze Stones & Get eBay Comps"**
2. Wait while the tool:
   - Fetches eBay sold listings for each stone
   - Calculates average eBay prices
   - Computes profit potential
   - Determines ROI percentage
   - Scores confidence level
3. View results in the table

### Step 3: Review Results

The table shows:

| Column | Description |
|--------|-------------|
| **Source** | Instagram username or import method |
| **Stone Name** | Type of gemstone |
| **IG Price** | Instagram listing price |
| **Weight (ct)** | Weight in carats |
| **eBay Avg** | Average eBay sold price (calculated) |
| **Potential Profit** | eBay Avg - IG Price (green = profit, red = loss) |
| **ROI %** | Return on Investment percentage |
| **Confidence** | Reliability of eBay data (based on # of comps) |
| **Caption** | Notes or description |
| **Link** | Link to Instagram post |

#### Color Coding

**Profit:**
- 🟢 Green = Positive profit (good deal)
- 🔴 Red = Negative profit (overpriced)

**ROI:**
- 🟢 Green = ≥50% ROI (excellent flip)
- 🟠 Orange = 20-49% ROI (good flip)
- ⚪ Gray = <20% ROI (marginal)

**Confidence:**
- 🟢 Green = ≥70% (many comps, reliable)
- 🟠 Orange = 50-69% (moderate comps)
- 🔴 Red = <50% (few comps, less reliable)

### Step 4: Export Results

1. Click **"Download CSV"**
2. Get timestamped CSV file with all data
3. Open in Excel/Google Sheets for further analysis

---

## Understanding the Analysis

### How eBay Data is Fetched

1. **Query:** Creates search like "Tourmaline gemstone 2.5ct"
2. **Fetch:** Searches eBay sold listings
3. **Parse:** Extracts prices from sold items
4. **Calculate:** Computes average price per carat

### Statistical Method

- **Median calculation:** Middle value of sold prices
- **IQR (Interquartile Range):** Removes outliers
- **Trimmed mean:** Average excluding top/bottom 10%
- **Confidence score:** Based on:
  - Number of comparable sales (more = higher)
  - Price variance (lower = higher)
  - Range: 30% to 95%

### ROI Calculation

```
Profit = eBay Average - Instagram Price
ROI % = (Profit / Instagram Price) × 100
```

**Example:**
- IG Price: $100
- eBay Avg: $150
- Profit: $50
- ROI: 50%

---

## Data Storage

### LocalStorage
- All entered gems saved to browser's LocalStorage
- Data persists even after closing browser
- Automatic save after each entry
- Load saved data on page reload

### Clear Data
- Click **"Clear All Data"** button
- Confirmation dialog appears
- All stored gems deleted
- **Cannot be undone!**

---

## Tips for Best Results

### Finding Good Deals
1. **High ROI** (>50%): Excellent flip opportunities
2. **High Confidence** (>70%): Reliable eBay data
3. **Positive Profit**: Good deal on Instagram

### Instagram Data Collection
1. Look for posts with:
   - Clear pricing
   - Weight in carats
   - Stone type mentioned
   - "For sale" or "Available" tags
2. Copy price, weight, and stone name
3. Note the Instagram username
4. Optional: Copy post URL for reference

### Bulk Import
- Use CSV for large datasets (10+ stones)
- Use JSON for programmatic imports
- Manual entry for 1-10 stones

---

## Troubleshooting

### No eBay Data Found
**Cause:** Stone name too generic or uncommon
**Solution:** Try different search terms or add more details

### Low Confidence Score
**Cause:** Few comparable sales on eBay
**Solution:** Treat results with caution, seek more comps manually

### Import Errors
**CSV:**
- Check column names match exactly
- Ensure no missing required fields (stone_name, price_value, weight_ct)

**JSON:**
- Validate JSON format (use JSONLint.com)
- Ensure it's an array of objects `[{...}, {...}]`

### Data Not Saving
**Cause:** Browser privacy mode or storage disabled
**Solution:** 
- Check browser settings
- Allow localStorage
- Exit private/incognito mode

---

## Example Workflow

### Scenario: Instagram Gem Shopping

1. **Browse Instagram** for gemstone dealers
2. **Find 5 stones** that look interesting
3. **Record data** in igGems:
   - Stone 1: Tourmaline, $150, 2.5ct, @dealer1
   - Stone 2: Spinel, $200, 1.8ct, @dealer2
   - Stone 3: Sapphire, $400, 3.2ct, @dealer3
   - (continue...)
4. **Analyze**: Click "Analyze Stones"
5. **Review results**:
   - Tourmaline: $180 eBay avg, $30 profit, 20% ROI, 75% confidence ✅
   - Spinel: $180 eBay avg, -$20 loss, -10% ROI, 80% confidence ❌
   - Sapphire: $600 eBay avg, $200 profit, 50% ROI, 90% confidence ✅✅
6. **Decision**: Buy Tourmaline and Sapphire, skip Spinel
7. **Export**: Download CSV for records

---

## Advanced Features

### Batch Analysis
- Import 50+ stones via CSV
- Analyze all at once
- Export complete dataset
- Filter by ROI in Excel

### Confidence Scoring Details
```
Base: 50%
+ (# of comps / 100): More sales = higher confidence
- (IQR / median) / 8: Lower variance = higher confidence
Range: 30% - 95%
```

### Custom Queries
The tool searches eBay with:
```
"[Stone Name] gemstone [Weight]ct"
```
Example: "Tourmaline gemstone 2.5ct"

---

## Privacy & Security

- ✅ **No Instagram login required**
- ✅ **No API keys needed**
- ✅ **All processing client-side**
- ✅ **Data stored locally only**
- ✅ **No server uploads**
- ✅ **No tracking**

---

## Browser Compatibility

✅ **Supported:**
- Chrome/Edge (recommended)
- Firefox
- Safari
- Brave

⚠️ **Requirements:**
- JavaScript enabled
- LocalStorage enabled
- Internet connection (for eBay fetching)

---

## Limitations

1. **eBay Data:** Dependent on eBay's sold listings availability
2. **CORS Proxy:** May occasionally be slow or unavailable
3. **Rate Limiting:** Small delay (0.5s) between eBay fetches
4. **Storage Limit:** Browser LocalStorage ~5-10MB (thousands of stones)
5. **Statistical Accuracy:** Requires 3+ comparable sales for reliable results

---

## FAQ

**Q: Do I need an Instagram API key?**  
A: No! Manual data entry only.

**Q: Is my data secure?**  
A: Yes, all data stays in your browser's LocalStorage.

**Q: Can I use this for other platforms?**  
A: Yes! Change "Source" field to any platform (Etsy, Facebook, etc.)

**Q: How accurate is the eBay pricing?**  
A: Depends on # of comps. 70%+ confidence = very reliable.

**Q: Can I edit existing entries?**  
A: Currently no, but you can clear and re-add.

**Q: What if eBay blocks me?**  
A: We use CORS proxy + Jina Reader fallback, unlikely to be blocked.

**Q: How many stones can I analyze at once?**  
A: No hard limit, but recommend batches of 20-50 for performance.

---

## Support & Updates

- **File:** `igGems.html`
- **Location:** GitHub Pages repository
- **Version:** Enhanced with eBay Revenue Analysis
- **Last Updated:** 2025-02-05

For issues or feature requests, contact repository maintainer.

---

## Change Log

### v2.0 (2025-02-05) - eBay Revenue Analysis
- ✅ Added manual data entry
- ✅ Added CSV import
- ✅ Added JSON import
- ✅ Added LocalStorage persistence
- ✅ Integrated eBay sold listings API
- ✅ Added profit/ROI calculations
- ✅ Added confidence scoring
- ✅ Color-coded results
- ✅ CSV export enhanced

### v1.0 (Original)
- Instagram Graph API integration
- Basic extraction
- CSV export

---

**Happy Gem Hunting! 💎**
