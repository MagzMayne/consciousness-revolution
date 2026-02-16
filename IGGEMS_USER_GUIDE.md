# igGems User Guide - Automated Gem Investment Analysis

## Overview

igGems is an automated tool that helps you discover profitable gemstone investment opportunities by:
- 🔍 **Scraping Instagram** for gemstone listings
- 💰 **Analyzing eBay prices** to calculate profit potential
- 📊 **Ranking opportunities** by ROI and confidence
- 🤖 **Automating the entire process** from discovery to recommendation

## Quick Start

### Option 1: Automated Mode (Recommended)

1. Open `igGems_enhanced.html` in your browser
2. Click **"🤖 Automated Discovery"** mode
3. Add Instagram sources:
   - Enter usernames like `@gems_infinity`, `@precisiongemcutters`
   - Enter hashtags like `#gemsforsale`, `#loosegems`
   - Or use quick presets for popular sources
4. Click **"🚀 Start Automated Discovery"**
5. Wait for the system to scan and analyze
6. Review ranked opportunities in the results table

### Option 2: Manual Mode

1. Open `igGems.html` or `igGems_enhanced.html`
2. Choose **"📝 Manual Entry"** mode
3. Add gems manually:
   - Enter stone name, price, weight, Instagram username
   - Or import via CSV/JSON
4. Click **"🔍 Analyze Stones & Get eBay Comps"**
5. Review profit calculations

## Features

### Automated Instagram Scraping

The system automatically:
- Scrapes Instagram user posts and hashtag searches
- Extracts gemstone information from captions
- Identifies stone name, price (USD), and weight (carats)
- Filters out non-gem posts

**Supported formats:**
```
"Beautiful 2.5ct Tourmaline for sale! $150"
"Stunning 3.8 carats Spinel - Price: 420 USD"
"Natural Sapphire 1.2ct - $890"
```

### eBay Price Analysis

For each stone found, the system:
- Searches eBay sold listings
- Calculates average, median, min, max prices
- Removes outliers using IQR method
- Estimates per-carat pricing
- Accounts for eBay fees (13%)

### Profit Calculation

Automatic calculation of:
- **Potential Profit** = (eBay Average - eBay Fees) - Instagram Price
- **ROI %** = (Profit / Instagram Price) × 100
- **Confidence Score** = Based on number of eBay samples and price variance

### Investment Recommendations

| Symbol | Recommendation | Criteria | Meaning |
|--------|---------------|----------|---------|
| 🔥 | **STRONG BUY** | ROI ≥ 50% + High confidence | Excellent opportunity |
| ✅ | **BUY** | ROI ≥ 25% + Good confidence | Good investment |
| 🤔 | **CONSIDER** | ROI ≥ 10% | Marginal profit, review carefully |
| ⏸️ | **HOLD** | ROI < 10% | Low profit, wait for better deals |
| ❌ | **AVOID** | ROI < 0% | Likely to lose money |

## Instagram Sources

### Popular Gem Dealers (Usernames)

- `@gems_infinity` - Wide variety of gemstones
- `@precisiongemcutters` - High-quality cut stones
- `@thegemtrader` - Wholesale and retail
- `@palagems` - Natural gemstones
- `@coloradogems` - US-based dealer
- `@gemrockauctions` - Auction listings

### Popular Hashtags

- `#gemsforsale` - General gemstone sales
- `#gemstoneforsale` - Alternative spelling
- `#loosegems` - Unmounted stones
- `#naturalgemstones` - Natural (not synthetic)
- `#finegemstones` - High-quality stones
- `#gemstonewholesale` - Wholesale pricing

## Understanding Results

### Results Table Columns

1. **Source** - Instagram username or hashtag
2. **Stone** - Type of gemstone (e.g., Tourmaline, Sapphire)
3. **IG Price** - Purchase price from Instagram
4. **Weight** - Weight in carats
5. **eBay Avg** - Average sold price on eBay
6. **Profit** - Estimated profit after fees
7. **ROI %** - Return on investment percentage
8. **Recommendation** - AI-powered buy/hold/avoid recommendation
9. **Confidence** - How reliable the data is (0-100%)
10. **Samples** - Number of eBay sold listings analyzed
11. **Link** - Link to original Instagram post

### Confidence Score Explained

- **90-100%** (Green): Very reliable - many sales, low variance
- **70-89%** (Green): Reliable - good number of samples
- **50-69%** (Yellow): Moderate - fewer samples, some variance
- **30-49%** (Red): Low - very few samples
- **0-29%** (Red): Unreliable - insufficient data

## Tips for Success

### Finding Profitable Stones

1. **Monitor multiple sources** - Don't rely on just one dealer
2. **Check regularly** - New opportunities appear daily
3. **Act fast** - Good deals sell quickly on Instagram
4. **Verify condition** - Always check photos and descriptions
5. **Build relationships** - Follow and engage with dealers

### Maximizing ROI

1. **Look for underpriced stones** - New sellers, urgent sales
2. **Focus on popular stones** - Sapphire, Ruby, Tourmaline
3. **Unusual sizes** - Odd weights (2.3ct vs 2.0ct) can be deals
4. **Natural vs Treated** - Natural stones typically have better resale
5. **Certification matters** - Certified stones sell for more

## Backend Setup (Optional)

For full automation, you can run the backend service. See `GEM_SCRAPER_README.md` for details.

## Support

- **Documentation**: `GEM_SCRAPER_README.md`
- **Email**: BarbrickDesign@gmail.com
- **GitHub**: https://github.com/barbrickdesign/barbrickdesign.github.io

---

**Happy Gem Hunting! 💎✨**
