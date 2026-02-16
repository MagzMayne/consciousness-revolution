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
 * File: add-project-values.js
 * Declaration ID: IP-5309FA4B-MLL28ZVU
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Script to add dollar values to all projects in projects.json
 */

const fs = require('fs');
const path = require('path');

// Import the value calculator
const ProjectValueCalculator = require('../js/project-value-calculator.js');

// Read projects.json
const projectsPath = path.join(__dirname, '../projects.json');
const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

console.log('📊 Adding values to projects...');
console.log(`Found ${projectsData.projects.length} projects\n`);

// Initialize calculator
const calculator = new ProjectValueCalculator();

// Calculate values for all projects
const updatedProjects = calculator.calculateAllProjectValues(projectsData.projects);

// Calculate statistics
const stats = calculator.getValueStats(updatedProjects);
const categoryBreakdown = calculator.getValueByCategory(updatedProjects);

console.log('💰 Value Statistics:');
console.log(`   Total Repository Value: ${calculator.formatValue(stats.totalValue)}`);
console.log(`   Average per Project: ${calculator.formatValue(stats.averageValue)}`);
console.log(`   Median Value: ${calculator.formatValue(stats.medianValue)}`);
console.log(`   Highest Value: ${calculator.formatValue(stats.highestValue)}`);
console.log(`   Lowest Value: ${calculator.formatValue(stats.lowestValue)}`);
console.log(`   Project Count: ${stats.projectCount}\n`);

console.log('📊 Top 5 Categories by Value:');
categoryBreakdown.slice(0, 5).forEach((cat, i) => {
    console.log(`   ${i + 1}. ${cat.category}: ${calculator.formatValue(cat.totalValue)} (${cat.projectCount} projects)`);
});
console.log('');

// Update projects.json with values
projectsData.projects = updatedProjects;
projectsData.meta.total_value = stats.totalValue;
projectsData.meta.average_value = stats.averageValue;
projectsData.meta.last_valued = new Date().toISOString();
projectsData.value_stats = stats;
projectsData.category_values = categoryBreakdown.map(c => ({
    category: c.category,
    totalValue: c.totalValue,
    projectCount: c.projectCount,
    averageValue: c.averageValue
}));

// Write back to projects.json
fs.writeFileSync(projectsPath, JSON.stringify(projectsData, null, 2));

console.log('✅ Successfully updated projects.json with values!');
console.log(`📝 Total repository value: ${calculator.formatValue(stats.totalValue)}`);
