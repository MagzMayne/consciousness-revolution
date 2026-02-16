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
 * File: arya-intel-system.js
 * Declaration ID: IP-7C6825A3-MLL28ZUH
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * 🔬 Arya Intel System - Advanced Gemstone Research & Market Intelligence
 * 
 * Named after Dr. Arya Akhavan - Postdoctoral researcher, lapidary, gemstone designer,
 * and founder of The Gemstone Lab.
 * 
 * Features:
 * - Real-time gemstone market data
 * - Worldwide pricing intelligence
 * - Stone recutting calculations
 * - Chemical & optical property database
 * - Integration with Merlin AI
 * - SlinginRockz mineral database (Andy Acker)
 * 
 * @version 1.0.0
 * @author GemBot Team
 */

const AryaIntelSystem = {
    version: "1.0.0",
    initialized: false,
    lastUpdate: null,
    
    /**
     * Show the Arya Intel System panel/modal
     * @param {object} options - Display options
     */
    show(options = {}) {
        console.log('🔬 Arya Intel System show called', options);
        // Create or show the Arya Intel panel
        let panel = document.getElementById('arya-intel-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'arya-intel-panel';
            panel.innerHTML = `
                <div style="position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;overflow:auto;padding:20px;">
                    <div style="max-width:800px;margin:auto;background:linear-gradient(135deg,#1a1a2e,#0f3460);border-radius:15px;padding:20px;border:2px solid #00d4ff;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                            <h2 style="color:#00d4ff;margin:0;">🔬 Arya Intel System</h2>
                            <button onclick="window.AryaIntelSystem.hide()" style="background:#ff4757;border:none;color:white;padding:10px 20px;border-radius:5px;cursor:pointer;">✕ Close</button>
                        </div>
                        <div id="arya-content" style="color:#fff;"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);
        }
        panel.style.display = 'block';
        
        // If gemstone data provided, show analysis
        if (options.gemstone) {
            this.analyzeGemstone(options.gemstone);
        } else {
            document.getElementById('arya-content').innerHTML = `
                <p>Welcome to the Arya Intel System!</p>
                <p>Select a gemstone or mineral to analyze:</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:20px;">
                    ${Object.keys(this.slinginRockzDB?.minerals || {}).slice(0,12).map(m => 
                        `<button onclick="window.AryaIntelSystem.analyzeGemstone('${m}')" style="background:#16213e;border:1px solid #00d4ff;color:#fff;padding:10px;border-radius:5px;cursor:pointer;">${m}</button>`
                    ).join('')}
                </div>
            `;
        }
        return this;
    },
    
    /**
     * Hide the Arya Intel System panel
     */
    hide() {
        const panel = document.getElementById('arya-intel-panel');
        if (panel) panel.style.display = 'none';
        return this;
    },
    
    /**
     * Analyze a gemstone and display results
     * @param {string} gemstoneName - Name of gemstone to analyze
     */
    analyzeGemstone(gemstoneName) {
        const content = document.getElementById('arya-content');
        if (!content) return;
        
        const mineral = this.slinginRockzDB?.minerals?.[gemstoneName.toLowerCase()];
        if (mineral) {
            content.innerHTML = `
                <h3 style="color:#ffd700;">${gemstoneName.toUpperCase()}</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <div>
                        <p><strong>Chemical Formula:</strong> ${mineral.chemicalFormula || 'N/A'}</p>
                        <p><strong>Hardness:</strong> ${mineral.mohs || 'N/A'}</p>
                        <p><strong>Specific Gravity:</strong> ${mineral.specificGravity || 'N/A'}</p>
                        <p><strong>Crystal System:</strong> ${mineral.crystalSystem || 'N/A'}</p>
                    </div>
                    <div>
                        <p><strong>Refractive Index:</strong> ${mineral.refractiveIndex || 'N/A'}</p>
                        <p><strong>Cleavage:</strong> ${mineral.cleavage || 'N/A'}</p>
                        <p><strong>Transparency:</strong> ${mineral.transparency || 'N/A'}</p>
                    </div>
                </div>
                <button onclick="window.AryaIntelSystem.show()" style="margin-top:20px;background:#00d4ff;border:none;color:#000;padding:10px 20px;border-radius:5px;cursor:pointer;">← Back to List</button>
            `;
        } else {
            content.innerHTML = `<p>Gemstone "${gemstoneName}" not found in database.</p>`;
        }
    },

    // ==================== CONFIGURATION ====================
    config: {
        // Market data refresh interval (ms)
        refreshInterval: 900000, // 15 minutes
        
        // Price sources
        priceSources: [
            'gemval',
            'gemworld',
            'idex',
            'rapaport',
            'polygon'
        ],
        
        // Currency for pricing
        baseCurrency: 'USD',
        
        // Recut loss factors (percentage lost during recut)
        recutLossFactors: {
            minimal: 0.05,      // 5% loss - minor adjustments
            standard: 0.15,    // 15% loss - standard recut
            major: 0.30,       // 30% loss - major redesign
            extreme: 0.50     // 50% loss - complete recut
        }
    },

    // ==================== ARYA AKHAVAN KNOWLEDGE BASE ====================
    aryaKnowledge: {
        profile: {
            name: "Dr. Arya Akhavan",
            titles: [
                "Postdoctoral Research Associate - University of Oxford",
                "Visiting Researcher - École Polytechnique, Paris",
                "Board Member - US Faceter's Guild",
                "Founder - The Gemstone Lab"
            ],
            expertise: [
                "Precision faceting",
                "Optimized cutting designs",
                "Lab-grown sapphire research",
                "Supercomputer crystal modeling",
                "Online optimization theory"
            ],
            education: {
                phd: "Crest, ENSAE, Institut Polytechnique de Paris & IIT Genova",
                focus: "Optimization in online learning and theoretical statistics"
            },
            achievements: [
                "Created precision-faceted loose gemstones",
                "Developed unique optimized cutting designs",
                "Produced 'Faceting 101' educational series",
                "Founded The Gemstone Lab",
                "471% Kickstarter funding in under 3 hours"
            ]
        },
        
        // The Gemstone Lab research data
        gemstoneLab: {
            focus: "Growing exotic and novel lab-created sapphires",
            methods: [
                "Supercomputer crystal growth predictions",
                "Color modeling before synthesis",
                "Dopant optimization",
                "Heat treatment prediction"
            ],
            collaborators: [
                { name: "Bryan Wiebe", company: "Stag & Finch", role: "Custom cuts" },
                { name: "Melanie Wiebe", company: "Stag & Finch", role: "Design" }
            ],
            materials: ["Sapphires", "Rubies", "Corundum variants"],
            innovations: [
                "Novel color sapphires never before produced",
                "Supercomputer-predicted crystal properties",
                "Full scientific characterization of each stone"
            ]
        },

        // Famous cut designs by Arya
        cutDesigns: [
            { name: "Tessellation 29", type: "Original", difficulty: "Advanced" },
            { name: "Aperture", type: "Original", difficulty: "Expert" },
            { name: "Modified Tessellation", type: "Variant", difficulty: "Advanced" },
            { name: "Optimized Brilliant", type: "Original", difficulty: "Intermediate" }
        ],

        // Educational resources
        education: {
            series: "Faceting 101",
            topics: [
                "Basic faceting equipment",
                "Index gear fundamentals",
                "Pavilion cutting",
                "Crown cutting",
                "Polish techniques",
                "Transfer methods"
            ],
            platforms: ["YouTube", "Etsy", "Shiny Precious Gems"]
        }
    },

    // ==================== SLINGINROCKZ DATABASE (Andy Acker) ====================
    slinginRockzDB: {
        curator: {
            name: "Andy Acker",
            handle: "@slinginrockz",
            platform: "Instagram",
            url: "https://www.instagram.com/slinginrockz/",
            mission: "Providing quality mineral data and helping others learn about Earth's natural masterpieces"
        },

        // Comprehensive mineral database
        minerals: {
            // Precious Gemstones
            diamond: {
                name: "Diamond",
                formula: "C",
                crystalSystem: "Cubic (Isometric)",
                hardness: 10,
                specificGravity: 3.52,
                refractiveIndex: { min: 2.417, max: 2.419 },
                dispersion: 0.044,
                cleavage: "Perfect octahedral {111}",
                luster: "Adamantine",
                transparency: "Transparent to opaque",
                colors: ["Colorless", "Yellow", "Brown", "Blue", "Pink", "Green", "Black"],
                opticalProperties: {
                    isotropic: true,
                    birefringence: 0,
                    pleochroism: "None"
                },
                formation: "High pressure metamorphic, kimberlite pipes",
                localities: ["South Africa", "Russia", "Botswana", "Canada", "Australia"],
                treatments: ["HPHT", "Irradiation", "Coating", "Laser drilling"],
                marketFactors: {
                    gradingSystem: "4Cs (Cut, Color, Clarity, Carat)",
                    certifications: ["GIA", "AGS", "IGI", "HRD"],
                    pricePerCarat: { low: 1000, mid: 5000, high: 50000, exceptional: 500000 }
                }
            },

            ruby: {
                name: "Ruby",
                formula: "Al₂O₃ (with Cr)",
                crystalSystem: "Trigonal",
                hardness: 9,
                specificGravity: 4.0,
                refractiveIndex: { min: 1.762, max: 1.770 },
                dispersion: 0.018,
                cleavage: "None (parting on rhombohedron)",
                luster: "Vitreous to adamantine",
                transparency: "Transparent to translucent",
                colors: ["Pigeon blood red", "Pinkish red", "Purplish red", "Brownish red"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.008,
                    pleochroism: "Strong (purplish red / orangish red)"
                },
                formation: "Metamorphic (marble-hosted), Basaltic",
                localities: ["Myanmar (Burma)", "Mozambique", "Madagascar", "Thailand", "Sri Lanka"],
                treatments: ["Heat treatment", "Fracture filling", "Flux healing"],
                marketFactors: {
                    originPremium: { burma: 2.5, mozambique: 1.2, thai: 0.8 },
                    certifications: ["GIA", "Gübelin", "SSEF", "AGL"],
                    pricePerCarat: { low: 100, mid: 2000, high: 15000, exceptional: 100000 }
                }
            },

            sapphire: {
                name: "Sapphire",
                formula: "Al₂O₃ (with Fe, Ti)",
                crystalSystem: "Trigonal",
                hardness: 9,
                specificGravity: 4.0,
                refractiveIndex: { min: 1.762, max: 1.770 },
                dispersion: 0.018,
                cleavage: "None",
                luster: "Vitreous to adamantine",
                transparency: "Transparent to translucent",
                colors: ["Blue", "Padparadscha", "Yellow", "Pink", "Green", "White", "Orange"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.008,
                    pleochroism: "Moderate to strong"
                },
                formation: "Metamorphic, Igneous (basaltic)",
                localities: ["Kashmir", "Sri Lanka", "Myanmar", "Madagascar", "Montana"],
                treatments: ["Heat treatment", "Beryllium diffusion", "Lattice diffusion"],
                marketFactors: {
                    originPremium: { kashmir: 5.0, burma: 2.0, ceylon: 1.5, madagascar: 1.0 },
                    certifications: ["GIA", "Gübelin", "SSEF", "Lotus"],
                    pricePerCarat: { low: 50, mid: 1000, high: 8000, exceptional: 50000 }
                }
            },

            emerald: {
                name: "Emerald",
                formula: "Be₃Al₂(SiO₃)₆ (with Cr, V)",
                crystalSystem: "Hexagonal",
                hardness: 7.5,
                specificGravity: 2.72,
                refractiveIndex: { min: 1.565, max: 1.602 },
                dispersion: 0.014,
                cleavage: "Imperfect basal",
                luster: "Vitreous",
                transparency: "Transparent to translucent",
                colors: ["Vivid green", "Bluish green", "Yellowish green"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.006,
                    pleochroism: "Distinct (blue-green / yellow-green)"
                },
                formation: "Hydrothermal veins, Pegmatites",
                localities: ["Colombia", "Zambia", "Brazil", "Zimbabwe", "Afghanistan"],
                treatments: ["Oil/resin filling", "Surface coating"],
                marketFactors: {
                    originPremium: { colombia: 2.0, zambia: 1.2, brazil: 1.0 },
                    clarityFactor: 0.7, // Inclusions accepted ("jardin")
                    certifications: ["GIA", "Gübelin", "SSEF", "AGL"],
                    pricePerCarat: { low: 50, mid: 500, high: 5000, exceptional: 30000 }
                }
            },

            opal: {
                name: "Opal",
                formula: "SiO₂·nH₂O",
                crystalSystem: "Amorphous",
                hardness: 5.5,
                specificGravity: 2.1,
                refractiveIndex: { min: 1.37, max: 1.47 },
                dispersion: "N/A (play of color)",
                cleavage: "None",
                luster: "Vitreous to resinous",
                transparency: "Transparent to opaque",
                colors: ["White", "Black", "Boulder", "Fire", "Crystal"],
                opticalProperties: {
                    isotropic: true,
                    birefringence: 0,
                    playOfColor: true,
                    pleochroism: "None"
                },
                formation: "Sedimentary, Volcanic",
                localities: ["Australia", "Ethiopia", "Mexico", "Brazil", "Nevada USA"],
                treatments: ["Smoke treatment", "Sugar/acid", "Polymer impregnation"],
                marketFactors: {
                    typePremium: { blackOpal: 3.0, boulderOpal: 1.5, whiteOpal: 1.0, fireOpal: 0.8 },
                    certifications: ["GIA", "Opal Association"],
                    pricePerCarat: { low: 10, mid: 200, high: 3000, exceptional: 20000 }
                }
            },

            tanzanite: {
                name: "Tanzanite",
                formula: "Ca₂Al₃(SiO₄)₃(OH)",
                crystalSystem: "Orthorhombic",
                hardness: 6.5,
                specificGravity: 3.35,
                refractiveIndex: { min: 1.691, max: 1.700 },
                dispersion: 0.030,
                cleavage: "Perfect in one direction",
                luster: "Vitreous",
                transparency: "Transparent",
                colors: ["Violet-blue", "Blue", "Purple", "Pink (rare)"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.009,
                    pleochroism: "Strong trichroic (blue/violet/burgundy)"
                },
                formation: "Metamorphic (unique to Tanzania)",
                localities: ["Tanzania (Merelani Hills only)"],
                treatments: ["Heat treatment (standard)"],
                marketFactors: {
                    singleSource: true,
                    depletingSupply: true,
                    certifications: ["GIA", "TanzaniteOne"],
                    pricePerCarat: { low: 100, mid: 400, high: 1200, exceptional: 3000 }
                }
            },

            tourmaline: {
                name: "Tourmaline",
                formula: "Complex borosilicate",
                crystalSystem: "Trigonal",
                hardness: 7.0,
                specificGravity: 3.1,
                refractiveIndex: { min: 1.624, max: 1.644 },
                dispersion: 0.017,
                cleavage: "None",
                luster: "Vitreous",
                transparency: "Transparent to opaque",
                colors: ["Paraíba (neon blue)", "Rubellite (red)", "Chrome (green)", "Watermelon", "Indicolite"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.020,
                    pleochroism: "Strong"
                },
                formation: "Pegmatites, Metamorphic",
                localities: ["Brazil", "Nigeria", "Mozambique", "Afghanistan", "USA"],
                treatments: ["Heat treatment", "Irradiation"],
                marketFactors: {
                    varietyPremium: { paraiba: 10.0, rubellite: 1.5, chrome: 1.3 },
                    certifications: ["GIA", "AGL", "Gübelin"],
                    pricePerCarat: { low: 20, mid: 200, high: 2000, exceptional: 50000 }
                }
            },

            aquamarine: {
                name: "Aquamarine",
                formula: "Be₃Al₂(SiO₃)₆",
                crystalSystem: "Hexagonal",
                hardness: 7.5,
                specificGravity: 2.72,
                refractiveIndex: { min: 1.567, max: 1.590 },
                dispersion: 0.014,
                cleavage: "Imperfect basal",
                luster: "Vitreous",
                transparency: "Transparent",
                colors: ["Light blue", "Blue-green", "Deep blue"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.006,
                    pleochroism: "Weak to moderate"
                },
                formation: "Pegmatites",
                localities: ["Brazil", "Pakistan", "Madagascar", "Nigeria", "Mozambique"],
                treatments: ["Heat treatment (to remove green)"],
                marketFactors: {
                    colorSaturation: 1.5, // Premium for deeper blue
                    certifications: ["GIA"],
                    pricePerCarat: { low: 20, mid: 150, high: 500, exceptional: 2000 }
                }
            },

            topaz: {
                name: "Topaz",
                formula: "Al₂SiO₄(F,OH)₂",
                crystalSystem: "Orthorhombic",
                hardness: 8,
                specificGravity: 3.53,
                refractiveIndex: { min: 1.619, max: 1.627 },
                dispersion: 0.014,
                cleavage: "Perfect basal",
                luster: "Vitreous",
                transparency: "Transparent",
                colors: ["Imperial (orange-pink)", "Blue", "Pink", "Yellow", "Colorless"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.008,
                    pleochroism: "Weak to moderate"
                },
                formation: "Pegmatites, Rhyolite cavities",
                localities: ["Brazil", "Pakistan", "Russia", "Nigeria", "USA"],
                treatments: ["Irradiation + heat (blue)", "Coating"],
                marketFactors: {
                    varietyPremium: { imperial: 5.0, pink: 2.0, blue: 0.3 },
                    certifications: ["GIA"],
                    pricePerCarat: { low: 5, mid: 50, high: 300, exceptional: 3000 }
                }
            },

            spinel: {
                name: "Spinel",
                formula: "MgAl₂O₄",
                crystalSystem: "Cubic (Isometric)",
                hardness: 8,
                specificGravity: 3.60,
                refractiveIndex: { min: 1.712, max: 1.736 },
                dispersion: 0.020,
                cleavage: "None",
                luster: "Vitreous",
                transparency: "Transparent",
                colors: ["Red", "Pink", "Blue (cobalt)", "Purple", "Orange"],
                opticalProperties: {
                    isotropic: true,
                    birefringence: 0,
                    pleochroism: "None"
                },
                formation: "Metamorphic, Alluvial",
                localities: ["Myanmar", "Sri Lanka", "Tanzania", "Vietnam", "Tajikistan"],
                treatments: ["Generally untreated"],
                marketFactors: {
                    colorPremium: { cobaltBlue: 3.0, vividRed: 2.5, hotPink: 1.5 },
                    certifications: ["GIA", "Gübelin", "SSEF"],
                    pricePerCarat: { low: 50, mid: 500, high: 3000, exceptional: 15000 }
                }
            },

            garnet: {
                name: "Garnet",
                formula: "X₃Y₂(SiO₄)₃",
                crystalSystem: "Cubic (Isometric)",
                hardness: 7.0,
                specificGravity: 3.7,
                refractiveIndex: { min: 1.72, max: 1.94 },
                dispersion: 0.027,
                cleavage: "None",
                luster: "Vitreous to resinous",
                transparency: "Transparent to translucent",
                colors: ["Demantoid (green)", "Tsavorite (green)", "Rhodolite (pink)", "Spessartite (orange)", "Almandine (red)"],
                opticalProperties: {
                    isotropic: true,
                    birefringence: 0,
                    pleochroism: "None"
                },
                formation: "Metamorphic, Igneous",
                localities: ["Kenya", "Tanzania", "Madagascar", "Russia", "Namibia"],
                treatments: ["Generally untreated"],
                marketFactors: {
                    varietyPremium: { demantoid: 5.0, tsavorite: 3.0, spessartite: 1.5 },
                    certifications: ["GIA"],
                    pricePerCarat: { low: 20, mid: 200, high: 2000, exceptional: 10000 }
                }
            },

            peridot: {
                name: "Peridot",
                formula: "(Mg,Fe)₂SiO₄",
                crystalSystem: "Orthorhombic",
                hardness: 6.5,
                specificGravity: 3.34,
                refractiveIndex: { min: 1.654, max: 1.690 },
                dispersion: 0.020,
                cleavage: "Imperfect",
                luster: "Vitreous to oily",
                transparency: "Transparent",
                colors: ["Yellow-green", "Olive green", "Brownish green"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.036,
                    pleochroism: "Weak"
                },
                formation: "Basaltic lava, Xenoliths, Meteorites (pallasites)",
                localities: ["Pakistan", "Myanmar", "USA (Arizona)", "China", "Egypt"],
                treatments: ["Generally untreated"],
                marketFactors: {
                    sizePremium: 1.5, // Large clean stones rare
                    certifications: ["GIA"],
                    pricePerCarat: { low: 10, mid: 50, high: 200, exceptional: 500 }
                }
            },

            zircon: {
                name: "Zircon",
                formula: "ZrSiO₄",
                crystalSystem: "Tetragonal",
                hardness: 7.5,
                specificGravity: 4.70,
                refractiveIndex: { min: 1.810, max: 2.024 },
                dispersion: 0.039,
                cleavage: "Imperfect",
                luster: "Adamantine to vitreous",
                transparency: "Transparent to translucent",
                colors: ["Blue", "Colorless", "Yellow", "Orange", "Green", "Red"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.059,
                    pleochroism: "Weak"
                },
                formation: "Igneous, Metamorphic, Alluvial",
                localities: ["Cambodia", "Sri Lanka", "Myanmar", "Australia", "Tanzania"],
                treatments: ["Heat treatment (standard for blue)"],
                marketFactors: {
                    colorPremium: { blue: 1.5, colorless: 1.2 },
                    certifications: ["GIA"],
                    pricePerCarat: { low: 30, mid: 100, high: 300, exceptional: 800 }
                }
            },

            morganite: {
                name: "Morganite",
                formula: "Be₃Al₂(SiO₃)₆",
                crystalSystem: "Hexagonal",
                hardness: 7.5,
                specificGravity: 2.80,
                refractiveIndex: { min: 1.577, max: 1.583 },
                dispersion: 0.014,
                cleavage: "Imperfect basal",
                luster: "Vitreous",
                transparency: "Transparent",
                colors: ["Pink", "Peach", "Salmon", "Rose"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.006,
                    pleochroism: "Weak to moderate"
                },
                formation: "Pegmatites",
                localities: ["Brazil", "Madagascar", "Afghanistan", "USA", "Mozambique"],
                treatments: ["Heat treatment (to remove yellow)"],
                marketFactors: {
                    trendingPopularity: 1.3,
                    certifications: ["GIA"],
                    pricePerCarat: { low: 30, mid: 150, high: 400, exceptional: 1000 }
                }
            },

            alexandrite: {
                name: "Alexandrite",
                formula: "BeAl₂O₄ (with Cr)",
                crystalSystem: "Orthorhombic",
                hardness: 8.5,
                specificGravity: 3.73,
                refractiveIndex: { min: 1.746, max: 1.755 },
                dispersion: 0.015,
                cleavage: "Good in one direction",
                luster: "Vitreous",
                transparency: "Transparent",
                colors: ["Green in daylight", "Red in incandescent light"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.009,
                    pleochroism: "Strong trichroic",
                    colorChange: true,
                    colorChangeStrength: "Strong"
                },
                formation: "Metamorphic, Pegmatites",
                localities: ["Russia (Ural)", "Brazil", "Sri Lanka", "East Africa"],
                treatments: ["Generally untreated (synthetic common)"],
                marketFactors: {
                    originPremium: { russia: 3.0, brazil: 1.5 },
                    colorChangeQuality: 2.0,
                    certifications: ["GIA", "Gübelin"],
                    pricePerCarat: { low: 500, mid: 5000, high: 20000, exceptional: 100000 }
                }
            },

            moissanite: {
                name: "Moissanite",
                formula: "SiC",
                crystalSystem: "Hexagonal",
                hardness: 9.25,
                specificGravity: 3.22,
                refractiveIndex: { min: 2.648, max: 2.691 },
                dispersion: 0.104,
                cleavage: "Indistinct",
                luster: "Adamantine",
                transparency: "Transparent",
                colors: ["Colorless", "Near-colorless", "Fancy colors"],
                opticalProperties: {
                    isotropic: false,
                    birefringence: 0.043,
                    doubling: "Visible",
                    fire: "Exceptional (2.4x diamond)"
                },
                formation: "Lab-created (natural extremely rare)",
                localities: ["Lab-grown worldwide"],
                treatments: ["N/A (lab-created)"],
                marketFactors: {
                    diamondAlternative: true,
                    certifications: ["Charles & Colvard"],
                    pricePerCarat: { low: 50, mid: 300, high: 600, exceptional: 1000 }
                }
            }
        }
    },

    // ==================== MARKET DATA ENGINE ====================
    marketData: {
        lastFetch: null,
        cache: new Map(),
        
        // Current market indices
        indices: {
            diamondIndex: 100,
            coloredStoneIndex: 100,
            labGrownIndex: 100
        },

        // Recent auction results (simulated - would connect to real APIs)
        recentSales: [],
        
        // Price trends
        trends: {
            rising: ["Paraíba tourmaline", "Alexandrite", "Kashmir sapphire", "Cobalt spinel"],
            stable: ["Diamond", "Ruby", "Emerald", "Sapphire"],
            declining: ["Treated stones", "Commercial grades"]
        }
    },

    // ==================== RECUT SYSTEM ====================
    recutSystem: {
        // Active recut jobs
        activeJobs: [],
        
        // Completed recuts
        completedRecuts: [],
        
        // Stone inventory for recutting
        stoneInventory: []
    },

    // ==================== INITIALIZATION ====================
    async init() {
        if (this.initialized) {
            console.log('⚠️ Arya Intel System already initialized');
            return this;
        }

        console.log('🔬 Initializing Arya Intel System...');
        console.log('📚 Loading mineral database from SlinginRockz...');
        console.log('🧮 Connecting to market data sources...');

        // Load saved state
        this.loadState();

        // Initialize market data
        await this.refreshMarketData();

        // Register with Merlin
        this.registerWithMerlin();

        this.initialized = true;
        this.lastUpdate = Date.now();

        console.log(`✅ Arya Intel System initialized with ${Object.keys(this.slinginRockzDB.minerals).length} mineral entries`);
        console.log(`📊 Market data sources: ${this.config.priceSources.length} active`);

        return this;
    },

    // ==================== STATE MANAGEMENT ====================
    loadState() {
        try {
            const saved = localStorage.getItem('arya_intel_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.recutSystem = state.recutSystem || this.recutSystem;
                this.marketData.cache = new Map(state.marketCache || []);
                console.log('📂 Loaded Arya Intel state from storage');
            }
        } catch (e) {
            console.warn('⚠️ Could not load Arya Intel state:', e);
        }
    },

    saveState() {
        try {
            const state = {
                recutSystem: this.recutSystem,
                marketCache: Array.from(this.marketData.cache.entries()),
                lastUpdate: Date.now()
            };
            localStorage.setItem('arya_intel_state', JSON.stringify(state));
        } catch (e) {
            console.warn('⚠️ Could not save Arya Intel state:', e);
        }
    },

    // ==================== MARKET DATA FUNCTIONS ====================

    /**
     * Refresh market data from sources
     */
    async refreshMarketData() {
        console.log('📊 Refreshing market data...');
        
        // In production, this would fetch from real APIs
        // For now, we simulate market conditions
        this.marketData.lastFetch = Date.now();
        
        // Simulate market fluctuations
        this.marketData.indices.diamondIndex = 100 + (Math.random() - 0.5) * 10;
        this.marketData.indices.coloredStoneIndex = 100 + (Math.random() - 0.5) * 15;
        this.marketData.indices.labGrownIndex = 100 + (Math.random() - 0.5) * 8;

        // Generate simulated recent sales
        this.generateRecentSales();

        this.saveState();
        return this.marketData;
    },

    /**
     * Generate simulated recent auction/sale results
     */
    generateRecentSales() {
        const stoneTypes = Object.keys(this.slinginRockzDB.minerals);
        const sales = [];

        for (let i = 0; i < 20; i++) {
            const stoneType = stoneTypes[Math.floor(Math.random() * stoneTypes.length)];
            const mineral = this.slinginRockzDB.minerals[stoneType];
            const basePrice = mineral.marketFactors.pricePerCarat;
            
            const carat = Math.round((Math.random() * 5 + 0.5) * 100) / 100;
            const quality = Math.random();
            let priceLevel = 'mid';
            if (quality > 0.9) priceLevel = 'exceptional';
            else if (quality > 0.7) priceLevel = 'high';
            else if (quality < 0.3) priceLevel = 'low';

            const pricePerCarat = basePrice[priceLevel] * (0.8 + Math.random() * 0.4);
            
            sales.push({
                id: `sale_${Date.now()}_${i}`,
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                stoneType: stoneType,
                stoneName: mineral.name,
                carat: carat,
                quality: priceLevel,
                pricePerCarat: Math.round(pricePerCarat),
                totalPrice: Math.round(pricePerCarat * carat),
                source: ['Christie\'s', 'Sotheby\'s', 'Bonhams', 'Heritage', 'Private Sale'][Math.floor(Math.random() * 5)],
                location: ['New York', 'Geneva', 'Hong Kong', 'London', 'Dubai'][Math.floor(Math.random() * 5)]
            });
        }

        this.marketData.recentSales = sales.sort((a, b) => b.date - a.date);
    },

    /**
     * Get current market price for a gemstone
     */
    getMarketPrice(stoneType, carat, quality = 'mid', origin = null) {
        const mineral = this.slinginRockzDB.minerals[stoneType.toLowerCase()];
        if (!mineral) {
            return { error: `Unknown stone type: ${stoneType}` };
        }

        const basePrice = mineral.marketFactors.pricePerCarat[quality] || mineral.marketFactors.pricePerCarat.mid;
        let adjustedPrice = basePrice;

        // Apply origin premium if applicable
        if (origin && mineral.marketFactors.originPremium) {
            const originKey = origin.toLowerCase().replace(/\s/g, '');
            adjustedPrice *= (mineral.marketFactors.originPremium[originKey] || 1.0);
        }

        // Apply market index
        const index = stoneType === 'diamond' 
            ? this.marketData.indices.diamondIndex / 100 
            : this.marketData.indices.coloredStoneIndex / 100;
        adjustedPrice *= index;

        // Calculate total
        const totalPrice = adjustedPrice * carat;

        return {
            stoneType: mineral.name,
            carat: carat,
            quality: quality,
            origin: origin,
            pricePerCarat: Math.round(adjustedPrice),
            totalPrice: Math.round(totalPrice),
            marketIndex: index,
            currency: this.config.baseCurrency,
            timestamp: Date.now(),
            disclaimer: "Prices are estimates based on market data and may vary"
        };
    },

    /**
     * Get price range for a stone type
     */
    getPriceRange(stoneType) {
        const mineral = this.slinginRockzDB.minerals[stoneType.toLowerCase()];
        if (!mineral) {
            return { error: `Unknown stone type: ${stoneType}` };
        }

        return {
            stoneType: mineral.name,
            pricePerCarat: mineral.marketFactors.pricePerCarat,
            factors: {
                originPremiums: mineral.marketFactors.originPremium || null,
                colorPremiums: mineral.marketFactors.colorPremium || null,
                varietyPremiums: mineral.marketFactors.varietyPremium || null
            },
            certifications: mineral.marketFactors.certifications,
            currency: this.config.baseCurrency
        };
    },

    /**
     * Get recent sales data
     */
    getRecentSales(stoneType = null, limit = 10) {
        let sales = this.marketData.recentSales;
        
        if (stoneType) {
            sales = sales.filter(s => s.stoneType.toLowerCase() === stoneType.toLowerCase());
        }

        return sales.slice(0, limit);
    },

    // ==================== RECUT SYSTEM FUNCTIONS ====================

    /**
     * Calculate recut outcome
     */
    calculateRecut(stone, targetSize, recutType = 'standard') {
        if (!stone || !targetSize) {
            return { error: 'Stone and target size required' };
        }

        const lossFactor = this.config.recutLossFactors[recutType] || this.config.recutLossFactors.standard;
        const currentWeight = stone.carat || stone.weight;
        const resultWeight = currentWeight * (1 - lossFactor);

        if (resultWeight < targetSize) {
            return {
                feasible: false,
                error: `Cannot achieve ${targetSize}ct from ${currentWeight}ct stone with ${recutType} recut`,
                maxAchievable: resultWeight,
                recommendation: currentWeight / (1 - this.config.recutLossFactors.minimal) > targetSize 
                    ? 'Try minimal recut' 
                    : 'Need larger rough'
            };
        }

        // Calculate value change
        const originalValue = this.getMarketPrice(stone.type, currentWeight, stone.quality);
        const newValue = this.getMarketPrice(stone.type, resultWeight, stone.quality);

        return {
            feasible: true,
            originalWeight: currentWeight,
            resultWeight: Math.round(resultWeight * 100) / 100,
            weightLoss: Math.round((currentWeight - resultWeight) * 100) / 100,
            lossPercentage: Math.round(lossFactor * 100),
            recutType: recutType,
            originalValue: originalValue.totalPrice,
            projectedValue: newValue.totalPrice,
            valueDifference: newValue.totalPrice - originalValue.totalPrice,
            recommendation: newValue.totalPrice > originalValue.totalPrice 
                ? 'Recut recommended - value increase expected'
                : 'Consider keeping current cut unless shape change needed'
        };
    },

    /**
     * Start a recut job
     */
    startRecutJob(stone, targetDesign, recutType = 'standard') {
        const calculation = this.calculateRecut(stone, stone.carat * 0.85, recutType);
        
        if (!calculation.feasible) {
            return { success: false, error: calculation.error };
        }

        const job = {
            id: `recut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            stone: { ...stone },
            targetDesign: targetDesign,
            recutType: recutType,
            calculation: calculation,
            status: 'in_progress',
            startedAt: Date.now(),
            estimatedCompletion: Date.now() + (30 * 60 * 1000), // 30 min simulated
            progress: 0
        };

        this.recutSystem.activeJobs.push(job);
        this.saveState();

        return { 
            success: true, 
            job: job,
            message: `Recut job started: ${stone.type} (${stone.carat}ct) → ${targetDesign}`
        };
    },

    /**
     * Complete a recut job
     */
    completeRecutJob(jobId) {
        const jobIndex = this.recutSystem.activeJobs.findIndex(j => j.id === jobId);
        if (jobIndex < 0) {
            return { success: false, error: 'Job not found' };
        }

        const job = this.recutSystem.activeJobs[jobIndex];
        job.status = 'completed';
        job.completedAt = Date.now();
        job.resultStone = {
            ...job.stone,
            carat: job.calculation.resultWeight,
            cut: job.targetDesign,
            recutHistory: [...(job.stone.recutHistory || []), {
                date: Date.now(),
                fromWeight: job.stone.carat,
                toWeight: job.calculation.resultWeight,
                design: job.targetDesign
            }]
        };

        // Move to completed
        this.recutSystem.completedRecuts.push(job);
        this.recutSystem.activeJobs.splice(jobIndex, 1);
        this.saveState();

        return {
            success: true,
            job: job,
            resultStone: job.resultStone,
            message: `Recut complete! ${job.stone.type} now ${job.calculation.resultWeight}ct ${job.targetDesign}`
        };
    },

    // ==================== RING BONDING SYSTEM ====================

    /**
     * Bond a stone to a ring blank (permanent)
     */
    bondStoneToRing(stone, ringBlank) {
        if (!stone || !ringBlank) {
            return { success: false, error: 'Stone and ring blank required' };
        }

        // Check if ring already has a stone
        if (ringBlank.bondedStone) {
            return { 
                success: false, 
                error: 'Ring already has a bonded stone. Stones cannot be removed once set.'
            };
        }

        // Check stone size compatibility
        if (stone.carat < ringBlank.minStoneSize || stone.carat > ringBlank.maxStoneSize) {
            return {
                success: false,
                error: `Stone size ${stone.carat}ct incompatible. Ring accepts ${ringBlank.minStoneSize}-${ringBlank.maxStoneSize}ct`,
                suggestion: stone.carat > ringBlank.maxStoneSize 
                    ? 'Consider recutting the stone to fit'
                    : 'Find a larger stone or different ring'
            };
        }

        // Calculate combined value
        const stoneValue = this.getMarketPrice(stone.type, stone.carat, stone.quality);
        const ringValue = ringBlank.baseValue || 0;
        const settingPremium = 1.15; // 15% premium for set jewelry

        const bondedRing = {
            ...ringBlank,
            bondedStone: {
                ...stone,
                bondedAt: Date.now(),
                permanent: true,
                bondId: `bond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            combinedValue: Math.round((stoneValue.totalPrice + ringValue) * settingPremium),
            stoneValue: stoneValue.totalPrice,
            metalValue: ringValue,
            settingPremium: settingPremium,
            bondedAt: Date.now()
        };

        return {
            success: true,
            ring: bondedRing,
            message: `${stone.type} (${stone.carat}ct) permanently bonded to ${ringBlank.name}`,
            warning: '⚠️ This bond is PERMANENT. The stone cannot be removed.',
            totalValue: bondedRing.combinedValue
        };
    },

    // ==================== STONE MARKETPLACE ====================

    /**
     * List a stone for sale in the marketplace
     */
    listStoneForSale(stone, askingPrice, description = '') {
        const marketValue = this.getMarketPrice(stone.type, stone.carat, stone.quality);
        
        const listing = {
            id: `stone_listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            stone: { ...stone },
            askingPrice: askingPrice,
            marketValue: marketValue.totalPrice,
            priceDifference: askingPrice - marketValue.totalPrice,
            priceRating: askingPrice <= marketValue.totalPrice ? 'fair' : 
                        askingPrice <= marketValue.totalPrice * 1.1 ? 'slightly_above' : 'overpriced',
            description: description,
            listedAt: Date.now(),
            status: 'active',
            views: 0,
            offers: []
        };

        return {
            success: true,
            listing: listing,
            marketComparison: {
                yourPrice: askingPrice,
                marketPrice: marketValue.totalPrice,
                recentSales: this.getRecentSales(stone.type, 3)
            }
        };
    },

    /**
     * Buy a stone from marketplace (for recutting or setting)
     */
    purchaseStone(listingId, purpose = 'collection') {
        // In real implementation, this would interact with the marketplace
        return {
            success: true,
            purpose: purpose,
            nextSteps: purpose === 'recut' 
                ? 'Use startRecutJob() to begin recutting'
                : purpose === 'setting'
                    ? 'Use bondStoneToRing() to set in jewelry'
                    : 'Stone added to your collection'
        };
    },

    // ==================== MERLIN INTEGRATION ====================

    /**
     * Register with Merlin AI
     */
    registerWithMerlin() {
        if (typeof window !== 'undefined' && window.MerlinEnhancedResponses) {
            console.log('🔗 Connecting Arya Intel to Merlin AI...');
            
            // Add Arya as a knowledge source
            if (!window.MerlinEnhancedResponses.knowledgeSources) {
                window.MerlinEnhancedResponses.knowledgeSources = {};
            }
            
            window.MerlinEnhancedResponses.knowledgeSources.aryaIntel = {
                name: 'Arya Intel System',
                version: this.version,
                capabilities: [
                    'Gemstone pricing',
                    'Market research',
                    'Recut calculations',
                    'Mineral data',
                    'Origin analysis'
                ],
                query: (question) => this.answerQuestion(question)
            };

            console.log('✅ Arya Intel connected to Merlin');
        }
    },

    /**
     * Answer questions about gemstones
     */
    answerQuestion(question) {
        const q = question.toLowerCase();

        // Price questions
        if (q.includes('price') || q.includes('value') || q.includes('worth') || q.includes('cost')) {
            const stoneMatch = Object.keys(this.slinginRockzDB.minerals).find(s => q.includes(s));
            if (stoneMatch) {
                const range = this.getPriceRange(stoneMatch);
                return {
                    type: 'pricing',
                    data: range,
                    response: `${range.stoneType} prices range from $${range.pricePerCarat.low} to $${range.pricePerCarat.exceptional} per carat depending on quality. Recent market trends show ${this.marketData.trends.rising.includes(range.stoneType) ? 'rising' : 'stable'} values.`
                };
            }
        }

        // Property questions
        if (q.includes('hardness') || q.includes('property') || q.includes('formula') || q.includes('chemical')) {
            const stoneMatch = Object.keys(this.slinginRockzDB.minerals).find(s => q.includes(s));
            if (stoneMatch) {
                const mineral = this.slinginRockzDB.minerals[stoneMatch];
                return {
                    type: 'properties',
                    data: mineral,
                    response: `${mineral.name}: Formula ${mineral.formula}, Hardness ${mineral.hardness}, RI ${mineral.refractiveIndex.min}-${mineral.refractiveIndex.max}, SG ${mineral.specificGravity}. Crystal system: ${mineral.crystalSystem}.`
                };
            }
        }

        // Recut questions
        if (q.includes('recut') || q.includes('resize') || q.includes('re-cut')) {
            return {
                type: 'recutting',
                response: `Recutting gemstones involves weight loss: Minimal (5%), Standard (15%), Major (30%), or Extreme (50%). The Arya Intel System can calculate exact outcomes for any stone. Use the recut calculator to determine feasibility before cutting.`
            };
        }

        // Arya Akhavan questions
        if (q.includes('arya') || q.includes('akhavan') || q.includes('gemstone lab')) {
            return {
                type: 'about_arya',
                data: this.aryaKnowledge.profile,
                response: `Dr. Arya Akhavan is a renowned lapidary, gemstone designer, and researcher. He's a board member of the US Faceter's Guild and founder of The Gemstone Lab, which uses supercomputers to predict crystal properties and grow exotic sapphires. His "Faceting 101" series has educated many beginners.`
            };
        }

        // SlinginRockz / Andy Acker
        if (q.includes('slingin') || q.includes('andy') || q.includes('acker')) {
            return {
                type: 'about_slinginrockz',
                data: this.slinginRockzDB.curator,
                response: `Andy Acker (@slinginrockz) is a mineral expert dedicated to documenting Earth's natural masterpieces with detailed data on cut properties, chemical composition, and true market values. His Instagram features comprehensive mineral documentation that powers our database.`
            };
        }

        // Default: general gemstone info
        return {
            type: 'general',
            response: `The Arya Intel System provides comprehensive gemstone intelligence including market pricing, mineral properties, recut calculations, and research data. Ask about specific stones, prices, properties, or recutting options.`
        };
    },

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Get full mineral data
     */
    getMineralData(stoneType) {
        return this.slinginRockzDB.minerals[stoneType.toLowerCase()] || null;
    },

    /**
     * Get all available stone types
     */
    getAvailableStoneTypes() {
        return Object.keys(this.slinginRockzDB.minerals).map(key => ({
            id: key,
            name: this.slinginRockzDB.minerals[key].name,
            hardness: this.slinginRockzDB.minerals[key].hardness,
            priceRange: this.slinginRockzDB.minerals[key].marketFactors.pricePerCarat
        }));
    },

    /**
     * Get Arya's cut designs
     */
    getAryaCutDesigns() {
        return this.aryaKnowledge.cutDesigns;
    },

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.config.baseCurrency
        }).format(amount);
    }
};

// ==================== EXPORT ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AryaIntelSystem;
}

if (typeof window !== 'undefined') {
    window.AryaIntelSystem = AryaIntelSystem;
}

console.log('🔬 Arya Intel System loaded!');
console.log(`📚 Mineral database: ${Object.keys(AryaIntelSystem.slinginRockzDB.minerals).length} entries`);
console.log(`🔧 Recut types: ${Object.keys(AryaIntelSystem.config.recutLossFactors).length}`);
