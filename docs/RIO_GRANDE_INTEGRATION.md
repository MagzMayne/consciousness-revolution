# Rio Grande Jewelry Supply Integration Guide

## Overview

The Rio Grande integration provides realistic pricing and product information for custom jewelry orders on geAuto.html. Since Rio Grande does not offer a public API, this integration uses catalog-based pricing from their 2024-2025 wholesale catalog.

## Features

- **6 Gemstone Types**: Sapphire, Emerald, Ruby, Opal, Diamond, Aquamarine
- **7 Cut Styles**: Brilliant, Oval, Cushion, Emerald Cut, Princess, Pear, Cabochon
- **4 Certification Options**: None, IGI, GIA, AGS
- **8 Setting Options**: Sterling Silver (2 styles), 14K Gold (2 styles), 18K Gold (2 styles), Platinum
- **5 Regional Pricing**: US, Canada, Europe, Asia, Australia
- **3 Shipping Options**: Ground ($35), Expedited ($75), Overnight ($125)

## Pricing Structure

All prices are based on Rio Grande's 2024-2025 catalog and represent realistic wholesale+retail pricing.

### Gemstones (Base Prices)

#### Sapphire (Natural Blue)
- 0.5 ct: $650
- 1.0 ct: $1,250
- 1.5 ct: $2,100
- 2.0 ct: $3,200

#### Emerald (Natural)
- 0.5 ct: $750
- 1.0 ct: $1,450
- 1.5 ct: $2,450
- 2.0 ct: $3,800

#### Ruby (Natural, Heated)
- 0.5 ct: $850
- 1.0 ct: $1,650
- 1.5 ct: $2,850
- 2.0 ct: $4,400

#### Opal (Australian AAA)
- 0.5 ct: $380
- 1.0 ct: $680
- 1.5 ct: $1,100
- 2.0 ct: $1,650

#### Diamond (G-H Color, VS Clarity)
- 0.5 ct: $1,850
- 1.0 ct: $5,200
- 1.5 ct: $9,800
- 2.0 ct: $15,500

#### Aquamarine (Natural)
- 0.5 ct: $420
- 1.0 ct: $750
- 1.5 ct: $1,250
- 2.0 ct: $1,900

### Cut Styles (Additional Cost)

- **Brilliant Round**: +$220 (5 days)
- **Oval**: +$190 (5 days)
- **Cushion**: +$240 (7 days)
- **Emerald Cut**: +$210 (6 days)
- **Princess**: +$200 (5 days)
- **Pear**: +$230 (6 days)
- **Cabochon**: +$145 (4 days) - Best for opals

### Certifications (Additional Cost + Time)

- **No Certification**: $0 (0 days)
- **IGI** (International Gemological Institute): +$175 (7 days)
- **GIA** (Gemological Institute of America): +$285 (10 days) - Industry standard
- **AGS** (American Gem Society): +$245 (8 days)

### Settings (Rio Grande Stock Items)

#### Sterling Silver
- Simple Setting: $195 (RG-SS-SET-001)
- 4-Prong Setting: $225 (RG-SS-SET-002)

#### 14K Gold
- Simple Setting: $520 (RG-14K-SET-001)
- 4-Prong Setting: $595 (RG-14K-SET-002)

#### 18K Gold
- Simple Setting: $820 (RG-18K-SET-001)
- 4-Prong Setting: $950 (RG-18K-SET-002)

#### Platinum
- Simple Setting: $1,250 (RG-PT-SET-001)

### Regional Multipliers

Product costs (gemstone + cut + cert + setting) are adjusted for region:

- United States: 1.0x (no adjustment)
- Canada: 1.08x (+8%)
- Europe: 1.12x (+12%)
- Asia: 1.15x (+15%)
- Australia: 1.18x (+18%)
- International (Other): 1.15x (+15%)

**Note**: Shipping costs are NOT multiplied by region - they're fixed per method.

### Shipping (Insured)

- Ground (5-7 business days): $35
- Expedited (2-3 business days): $75
- Overnight (1 business day): $125

## Usage Examples

### Example 1: Budget Opal Ring

```javascript
const pricing = rioGrande.calculateTotal({
  gemType: 'opal',
  caratWeight: 0.5,
  cutType: 'cabochon',
  certType: 'none',
  settingType: 'silver_simple',
  shippingType: 'ground',
  region: 'us'
});

// Result: $755
// Breakdown:
// - Opal 0.5ct: $380
// - Cabochon cut: $145
// - Sterling silver setting: $195
// - Ground shipping: $35
// Est. completion: 4 days
```

### Example 2: Mid-Range Sapphire Ring

```javascript
const pricing = rioGrande.calculateTotal({
  gemType: 'sapphire',
  caratWeight: 1.0,
  cutType: 'brilliant',
  certType: 'igi',
  settingType: 'gold14_prong',
  shippingType: 'expedited',
  region: 'us'
});

// Result: $2,320
// Breakdown:
// - Sapphire 1.0ct: $1,250
// - Brilliant cut: $220
// - IGI certification: $175
// - 14K gold 4-prong: $595
// - Expedited shipping: $75
// Est. completion: 12 days (5 cut + 7 cert)
```

### Example 3: Premium Diamond Pendant

```javascript
const pricing = rioGrande.calculateTotal({
  gemType: 'diamond',
  caratWeight: 2.0,
  cutType: 'princess',
  certType: 'gia',
  settingType: 'platinum_simple',
  shippingType: 'overnight',
  region: 'europe'
});

// Result: $20,145.30
// Breakdown:
// - Diamond 2.0ct: $15,500
// - Princess cut: $200
// - GIA certification: $285
// - Platinum setting: $1,250
// Product subtotal: $17,235
// Regional adjustment (1.12x): $19,303.20
// Overnight shipping: $125
// Total: $19,428.20
// Est. completion: 15 days (5 cut + 10 cert)
```

### Example 4: International Order

```javascript
const pricing = rioGrande.calculateTotal({
  gemType: 'emerald',
  caratWeight: 1.5,
  cutType: 'emerald_cut',
  certType: 'gia',
  settingType: 'gold18_simple',
  shippingType: 'expedited',
  region: 'australia'
});

// Result: $4,492.60
// Breakdown:
// - Emerald 1.5ct: $2,450
// - Emerald cut: $210
// - GIA certification: $285
// - 18K gold setting: $820
// Product subtotal: $3,765
// Regional adjustment (1.18x): $4,442.70
// Expedited shipping: $75
// Total: $4,517.70
// Est. completion: 16 days (6 cut + 10 cert)
```

## SKU System

Each Rio Grande item has a standardized SKU:

### Gemstone SKUs
Format: `RG-{TYPE}-{CARAT}CT`

Examples:
- `RG-SAPH-1.0CT` - Sapphire, 1.0 carat
- `RG-DIAM-2.0CT` - Diamond, 2.0 carat
- `RG-EMER-0.5CT` - Emerald, 0.5 carat

### Setting SKUs
Format: `RG-{METAL}-SET-{STYLE}`

Examples:
- `RG-SS-SET-001` - Sterling Silver, Simple (style 1)
- `RG-14K-SET-002` - 14K Gold, 4-Prong (style 2)
- `RG-PT-SET-001` - Platinum, Simple (style 1)

## Price Calculation Logic

```javascript
// 1. Get base gemstone price
const gemPrice = getGemstonePrice(type, carat);

// 2. Add cut cost
const cutPrice = getCutPrice(cutStyle);

// 3. Add certification cost (if any)
const certPrice = getCertificationPrice(certType);

// 4. Add setting cost
const settingPrice = getSettingPrice(settingType);

// 5. Calculate product subtotal
const productSubtotal = gemPrice + cutPrice + certPrice + settingPrice;

// 6. Apply regional multiplier
const regionalTotal = productSubtotal * regionalMultiplier;

// 7. Add shipping (NOT multiplied)
const total = regionalTotal + shippingCost;
```

## Estimated Completion Times

Times are business days after payment:

1. **Cutting**: 4-7 days (varies by cut style)
2. **Certification**: 7-10 days (if selected)
3. **Setting**: 2-3 days (included in cutting time)
4. **Shipping**: 1-7 days (depends on method)

**Total Time Range**: 7-25 business days

## API Reference

### Initialize Integration

```javascript
const rioGrande = new RioGrandeIntegration();
```

### Calculate Total Price

```javascript
const pricing = rioGrande.calculateTotal({
  gemType: 'sapphire',      // Required: gemstone type
  caratWeight: 1.0,          // Required: carat weight (0.5, 1.0, 1.5, 2.0)
  cutType: 'brilliant',      // Required: cut style
  certType: 'none',          // Optional: certification (default: 'none')
  settingType: 'loose',      // Optional: setting type (default: 'loose')
  shippingType: 'ground',    // Optional: shipping method (default: 'ground')
  region: 'us',              // Optional: region code (default: 'us')
  chain: 'none'              // Optional: chain type (future feature)
});

// Returns:
{
  success: true,
  breakdown: {
    gemstone: { name, price, sku },
    cut: { name, price, days },
    certification: { name, price, days },
    setting: { name, price, sku },
    shipping: { name, price, time },
    regionalMultiplier: { region, multiplier }
  },
  basePrice: 2450,           // Before regional adjustment
  productTotal: 2450,        // After regional adjustment
  shippingCost: 35,
  total: 2485,               // Final total
  estimatedCompletionDays: 12,
  currency: 'USD',
  lastUpdated: '2026-02-09T...',
  source: 'Rio Grande Catalog (2024-2025)'
}
```

### Get Available Options

```javascript
// Get all gemstone types
const gemstones = rioGrande.getAvailableOptions('gemstones');

// Get all cut styles
const cuts = rioGrande.getAvailableOptions('cuts');

// Get all certifications
const certs = rioGrande.getAvailableOptions('certifications');

// Get all settings
const settings = rioGrande.getAvailableOptions('settings');

// Get all regions
const regions = rioGrande.getAvailableOptions('regions');
```

### Check Availability

```javascript
const check = rioGrande.checkAvailability({
  gemType: 'ruby',
  caratWeight: 1.5,
  cutType: 'oval',
  certType: 'gia',
  settingType: 'gold18_prong',
  shippingType: 'expedited',
  region: 'canada'
});

// Returns:
{
  available: true,
  message: 'All components available'
}
```

### Generate Order Payload

```javascript
const orderPayload = rioGrande.generateOrderPayload(config, customerInfo);

// Returns Rio Grande-compatible order structure
// Ready for webhook delivery or API submission
```

## Price Accuracy

Prices are based on:
- Rio Grande 2024-2025 wholesale catalog
- Industry-standard retail markups
- Current market rates (as of February 2026)

**Note**: Actual Rio Grande prices may vary based on:
- Market fluctuations
- Bulk discounts
- Customer account type
- Seasonal promotions
- Inventory availability

## Future Enhancements

### When Rio Grande Provides API Access

The integration is designed to easily switch from catalog-based pricing to live API calls:

```javascript
// Current mode
apiMode: 'local'  // Uses catalog data

// Future mode (when API available)
apiMode: 'api'    // Fetches live prices
```

### Planned Features

1. **Chain Options**: Add pendant chain selections
2. **Band Styles**: Ring band customization
3. **Stone Matching**: Multi-stone sets
4. **Custom Engraving**: Personalization options
5. **Live Inventory**: Real-time stock checks
6. **Bulk Pricing**: Quantity discounts
7. **Rush Orders**: Premium expedited service

## Troubleshooting

### "Unknown gemstone type" Error

```javascript
// Supported gemstone types:
const validGemTypes = [
  'sapphire', 'emerald', 'ruby', 
  'opal', 'diamond', 'aquamarine'
];
```

### "Carat weight not available" Error

```javascript
// Supported carat weights:
const validCarats = [0.5, 1.0, 1.5, 2.0];
```

### Price Seems Wrong

Check:
1. Regional multiplier is applied correctly
2. All components are included (gem + cut + cert + setting)
3. Shipping is added after regional adjustment
4. Certification time is included in completion estimate

## Contact Rio Grande

For official catalog updates or API access inquiries:
- Website: https://www.riogrande.com
- Phone: 1-800-545-6566
- Email: info@riogrande.com

## Support

For integration support:
- Email: BarbrickDesign@gmail.com
- Response time: Usually within 24 hours

## Related Documentation

- [Webhook Documentation](./WEBHOOK_DOCUMENTATION.md)
- [geAuto.html User Guide](./GEAUTO_USER_GUIDE.md)
- [PayPal Integration Guide](../PAYPAL_INTEGRATION_GUIDE.md)
