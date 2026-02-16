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
 * File: simplify-project-descriptions.js
 * Declaration ID: IP-F659B28-MLL28ZVW
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node
/**
 * Script to simplify project descriptions in projects.json
 * Makes technical terms more understandable for everyone
 */

const fs = require('fs');
const path = require('path');

// Simplification mappings
const simplifications = {
    // Technical terms to simple terms
    'API integration': 'connects to external services',
    'ML integration': 'machine learning features',
    'TensorFlow.js': 'AI processing',
    'Babylon.js': '3D graphics',
    'Three.js': '3D graphics',
    'WebSocket': 'real-time updates',
    'SPL token': 'Solana token',
    'ERC-1155': 'Ethereum collectible',
    'NFT': 'digital collectible',
    'Web3': 'blockchain',
    'DApp': 'blockchain app',
    'smart contract': 'automated agreement',
    'deployment portal': 'launch dashboard',
    'management interface': 'control panel',
    'automation': 'works automatically',
    'simulation environment': 'practice environment',
    'visualization tool': 'visual display tool',
    'enhanced': 'improved',
    'advanced': 'powerful',
    'sophisticated': 'advanced',
    'mechanism': 'system',
    'implementation': 'version',
    'infrastructure': 'system',
    'architecture': 'structure',
    'framework': 'system',
    'ecosystem': 'collection',
};

// Category-specific simple descriptions
const categoryDescriptions = {
    'game': 'Play this game in your browser',
    'tool': 'Use this tool to help with tasks',
    'experiment': 'Try this experimental feature',
    'learning': 'Learn with this educational app',
};

function simplifyText(text) {
    if (!text) return text;
    
    let simplified = text;
    
    // Replace technical terms with simpler ones
    for (const [technical, simple] of Object.entries(simplifications)) {
        const regex = new RegExp(technical, 'gi');
        simplified = simplified.replace(regex, simple);
    }
    
    return simplified;
}

function addSimpleDescription(project) {
    // If no description or empty, add one based on type
    if (!project.description || project.description.trim() === '') {
        if (project.type && categoryDescriptions[project.type]) {
            project.description = categoryDescriptions[project.type];
            project.simple_description = project.description;
            return project;
        }
    }
    
    // Simplify existing description
    const simplified = simplifyText(project.description);
    
    // Add simple_description field
    project.simple_description = simplified;
    
    // Also simplify title if needed
    if (project.title) {
        project.simple_title = simplifyText(project.title);
    }
    
    return project;
}

function main() {
    const projectsPath = path.join(__dirname, 'projects.json');
    
    console.log('Reading projects.json...');
    const data = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    
    console.log(`Processing ${data.repositories.length} repositories...`);
    data.repositories = data.repositories.map(addSimpleDescription);
    
    console.log(`Processing ${data.html_projects.length} HTML projects...`);
    data.html_projects = data.html_projects.map(addSimpleDescription);
    
    // Add metadata about simplification
    data.meta.last_simplified = new Date().toISOString();
    data.meta.simplification_version = '1.0';
    
    // Save with pretty printing
    console.log('Writing simplified projects.json...');
    fs.writeFileSync(
        projectsPath,
        JSON.stringify(data, null, 2),
        'utf8'
    );
    
    console.log('✓ Done! Projects simplified successfully.');
    console.log(`  - ${data.repositories.length} repositories updated`);
    console.log(`  - ${data.html_projects.length} HTML projects updated`);
}

if (require.main === module) {
    main();
}

module.exports = { simplifyText, addSimpleDescription };
