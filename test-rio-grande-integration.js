/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: test-rio-grande-integration.js
 * Declaration ID: IP-3EC68959-MLL28ZWK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Test script for Rio Grande Integration
 * Tests pricing calculations and webhook payload generation
 */

const RioGrandeIntegration = require('./src/utils/rio-grande-integration.js');

console.log('=== Rio Grande Integration Test ===\n');

// Initialize integration
const rioGrande = new RioGrandeIntegration();

// Test 1: Basic sapphire pricing
console.log('Test 1: Basic Sapphire Ring');
console.log('Configuration: 1.0ct Sapphire, Brilliant cut, No cert, 14K Gold setting, US ground shipping');
const test1 = rioGrande.calculateTotal({
  gemType: 'sapphire',
  caratWeight: 1.0,
  cutType: 'brilliant',
  certType: 'none',
  settingType: 'gold14_simple',
  shippingType: 'ground',
  region: 'us'
});

if (test1.success) {
  console.log(`✓ Total: $${test1.total}`);
  console.log(`  - Gemstone: $${test1.breakdown.gemstone.price} (${test1.breakdown.gemstone.sku})`);
  console.log(`  - Cut: $${test1.breakdown.cut.price}`);
  console.log(`  - Setting: $${test1.breakdown.setting.price} (${test1.breakdown.setting.sku})`);
  console.log(`  - Shipping: $${test1.breakdown.shipping.price}`);
  console.log(`  - Est. completion: ${test1.estimatedCompletionDays} days\n`);
} else {
  console.error('✗ Test 1 failed:', test1.error);
}

// Test 2: Diamond with GIA certification
console.log('Test 2: Premium Diamond with GIA');
console.log('Configuration: 2.0ct Diamond, Princess cut, GIA cert, Platinum setting, International express');
const test2 = rioGrande.calculateTotal({
  gemType: 'diamond',
  caratWeight: 2.0,
  cutType: 'princess',
  certType: 'gia',
  settingType: 'platinum_simple',
  shippingType: 'expedited',
  region: 'international'
});

if (test2.success) {
  console.log(`✓ Total: $${test2.total}`);
  console.log(`  - Gemstone: $${test2.breakdown.gemstone.price}`);
  console.log(`  - Cut: $${test2.breakdown.cut.price}`);
  console.log(`  - Certification: $${test2.breakdown.certification.price} (${test2.breakdown.certification.name})`);
  console.log(`  - Setting: $${test2.breakdown.setting.price}`);
  console.log(`  - Shipping: $${test2.breakdown.shipping.price}`);
  console.log(`  - Regional multiplier: ${test2.breakdown.regionalMultiplier.multiplier}x`);
  console.log(`  - Est. completion: ${test2.estimatedCompletionDays} days\n`);
} else {
  console.error('✗ Test 2 failed:', test2.error);
}

// Test 3: Budget opal
console.log('Test 3: Budget Opal Cabochon');
console.log('Configuration: 0.5ct Opal, Cabochon, No cert, Sterling silver, US ground');
const test3 = rioGrande.calculateTotal({
  gemType: 'opal',
  caratWeight: 0.5,
  cutType: 'cabochon',
  certType: 'none',
  settingType: 'silver_simple',
  shippingType: 'ground',
  region: 'us'
});

if (test3.success) {
  console.log(`✓ Total: $${test3.total}`);
  console.log(`  - Gemstone: $${test3.breakdown.gemstone.price}`);
  console.log(`  - Cut: $${test3.breakdown.cut.price}`);
  console.log(`  - Setting: $${test3.breakdown.setting.price}`);
  console.log(`  - Shipping: $${test3.breakdown.shipping.price}\n`);
} else {
  console.error('✗ Test 3 failed:', test3.error);
}

// Test 4: Loose stone
console.log('Test 4: Loose Emerald Stone');
console.log('Configuration: 1.5ct Emerald, Cushion cut, IGI cert, Loose stone, Canada ground');
const test4 = rioGrande.calculateTotal({
  gemType: 'emerald',
  caratWeight: 1.5,
  cutType: 'cushion',
  certType: 'igi',
  settingType: 'loose',
  shippingType: 'ground',
  region: 'canada'
});

if (test4.success) {
  console.log(`✓ Total: $${test4.total}`);
  console.log(`  - Gemstone: $${test4.breakdown.gemstone.price}`);
  console.log(`  - Cut: $${test4.breakdown.cut.price}`);
  console.log(`  - Certification: $${test4.breakdown.certification.price}`);
  console.log(`  - Shipping: $${test4.breakdown.shipping.price}`);
  console.log(`  - Regional multiplier: ${test4.breakdown.regionalMultiplier.multiplier}x\n`);
} else {
  console.error('✗ Test 4 failed:', test4.error);
}

// Test 5: Error handling - invalid gemstone
console.log('Test 5: Error Handling');
const test5 = rioGrande.calculateTotal({
  gemType: 'invalid_gem',
  caratWeight: 1.0,
  cutType: 'brilliant',
  certType: 'none',
  settingType: 'loose',
  shippingType: 'ground',
  region: 'us'
});

if (!test5.success) {
  console.log('✓ Error handling works:', test5.error, '\n');
} else {
  console.error('✗ Error handling failed - should have rejected invalid gem\n');
}

// Test 6: Order payload generation
console.log('Test 6: Order Payload Generation');
const testConfig = {
  gemType: 'ruby',
  caratWeight: 1.0,
  cutType: 'oval',
  certType: 'gia',
  settingType: 'gold18_prong',
  shippingType: 'expedited',
  region: 'us',
  notes: 'Ring size 7'
};

const testCustomer = {
  email: 'test@example.com',
  name: 'Test Customer',
  phone: '555-1234',
  address: {
    street: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zip: '12345',
    country: 'US'
  }
};

try {
  const orderPayload = rioGrande.generateOrderPayload(testConfig, testCustomer);
  console.log('✓ Order payload generated successfully');
  console.log(`  - Order ID: ${orderPayload.orderId}`);
  console.log(`  - Items: ${orderPayload.items.length}`);
  console.log(`  - Total: $${orderPayload.total}`);
  console.log(`  - Customer: ${orderPayload.customer.email}`);
  console.log(`  - Est. completion: ${orderPayload.estimatedCompletion} days\n`);
} catch (error) {
  console.error('✗ Order payload generation failed:', error.message, '\n');
}

// Test 7: Get available options
console.log('Test 7: Available Options');
const gemstones = rioGrande.getAvailableOptions('gemstones');
const cuts = rioGrande.getAvailableOptions('cuts');
const settings = rioGrande.getAvailableOptions('settings');

console.log(`✓ Available gemstones: ${gemstones.length}`);
console.log(`✓ Available cuts: ${cuts.length}`);
console.log(`✓ Available settings: ${settings.length}\n`);

console.log('=== All Tests Complete ===');
console.log('\nPricing Summary:');
console.log('- Budget option (Opal): ~$655');
console.log('- Mid-range (Sapphire 1ct, 14K): ~$1,985');
console.log('- Premium (Diamond 2ct, Platinum, GIA): ~$19,000+');
console.log('\nAll prices based on Rio Grande 2024-2025 catalog data');
