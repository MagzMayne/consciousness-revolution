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
 * File: gembot-academy.js
 * Declaration ID: IP-212867A0-MLL28ZUV
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * GemBot Academy System - Complete Learning & Progression System
 * Daily, Weekly, Monthly tasks with rewards and progress tracking
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 */

const GemBotAcademy = {
    version: '2.0.0',
    initialized: false,
    
    // Player progress state
    player: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        totalXp: 0,
        tokens: 0,
        gems: 0,
        streak: 0,
        lastLoginDate: null,
        completedTasks: [],
        completedLessons: [],
        unlockedCourses: ['basics'],
        achievements: [],
        stats: {
            tasksCompleted: 0,
            lessonsCompleted: 0,
            gemsEarned: 0,
            tokensEarned: 0,
            perfectScores: 0,
            loginStreak: 0,
            maxLoginStreak: 0
        }
    },
    
    // Course definitions
    courses: {
        basics: {
            id: 'basics',
            name: '💎 GemBot Basics',
            description: 'Learn the fundamentals of gemstone cutting',
            icon: '📚',
            requiredLevel: 1,
            lessons: [
                {
                    id: 'intro_gemstones',
                    title: 'Introduction to Gemstones',
                    description: 'Learn about different types of gemstones and their properties',
                    duration: '5 min',
                    xpReward: 25,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'Gemstones are minerals prized for their beauty, durability, and rarity. Each gem has unique properties that affect how it should be cut.' },
                            { type: 'quiz', question: 'What determines a gemstone\'s hardness?', options: ['Color', 'Mohs Scale', 'Size', 'Clarity'], answer: 1 },
                            { type: 'image', src: 'gems_chart.png', caption: 'Common gemstone types' }
                        ]
                    }
                },
                {
                    id: 'machine_overview',
                    title: 'Understanding Your GemBot',
                    description: 'Learn the components and operation of your GemBot machine',
                    duration: '10 min',
                    xpReward: 50,
                    content: {
                        type: 'interactive_3d',
                        model: 'cnc_machine.glb',
                        hotspots: [
                            { position: [0, 1, 0], label: 'Spindle', description: 'Holds and rotates the gemstone' },
                            { position: [1, 0, 0], label: 'X-Axis', description: 'Moves the gem left and right' },
                            { position: [0, 0, 1], label: 'Y-Axis', description: 'Moves the gem forward and back' }
                        ]
                    }
                },
                {
                    id: 'safety_first',
                    title: 'Safety Guidelines',
                    description: 'Essential safety practices for gemstone cutting',
                    duration: '8 min',
                    xpReward: 40,
                    content: {
                        type: 'checklist',
                        items: [
                            'Always wear safety glasses',
                            'Keep work area clean and dry',
                            'Never touch moving parts',
                            'Use proper ventilation',
                            'Keep emergency stop accessible'
                        ]
                    }
                }
            ]
        },
        
        cutting_fundamentals: {
            id: 'cutting_fundamentals',
            name: '✂️ Cutting Fundamentals',
            description: 'Master the basics of gem cutting',
            icon: '✂️',
            requiredLevel: 3,
            lessons: [
                {
                    id: 'angles_depth',
                    title: 'Understanding Angles & Depth',
                    description: 'Learn how angles affect light return',
                    duration: '15 min',
                    xpReward: 75,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'Cutting angles are critical for light performance. The pavilion angle determines how light reflects internally, while the crown angle affects light dispersion.' },
                            { type: 'image', src: 'angle_diagram.png', caption: 'Pavilion and crown angle relationships' },
                            { type: 'text', content: 'For round brilliants, ideal pavilion angles range from 40.6° to 41.0°, while crown angles should be 34.3° to 35.0° for optimal brilliance.' },
                            { type: 'quiz', question: 'What happens if the pavilion angle is too shallow?', options: ['More brilliance', 'Light leakage (fish-eye)', 'Better dispersion', 'Darker appearance'], answer: 1 },
                            { type: 'calculator', tool: 'angle_calculator', description: 'Use this tool to calculate optimal angles for different gem types' }
                        ]
                    }
                },
                {
                    id: 'facet_sequence',
                    title: 'Facet Cutting Sequence',
                    description: 'The proper order for cutting facets',
                    duration: '12 min',
                    xpReward: 60,
                    content: {
                        type: 'step_by_step',
                        steps: [
                            { step: 1, title: 'Pavilion Main Facets', description: 'Cut 8 main pavilion facets first at 41°. These establish the base structure.', image: 'step1_pavilion_mains.png' },
                            { step: 2, title: 'Pavilion Break Facets', description: 'Add 8 break facets between the mains at 43°. These enhance light return.', image: 'step2_pavilion_breaks.png' },
                            { step: 3, title: 'Crown Main Facets', description: 'Cut 8 crown mains at 34.5°. Work from table to girdle.', image: 'step3_crown_mains.png' },
                            { step: 4, title: 'Crown Star Facets', description: 'Add 8 star facets around the table at 15°.', image: 'step4_stars.png' },
                            { step: 5, title: 'Upper Girdle Facets', description: 'Complete with 16 upper girdle facets at 42°.', image: 'step5_upper_girdle.png' },
                            { step: 6, title: 'Final Polish', description: 'Polish all facets in the same sequence for a perfect finish.', image: 'step6_polish.png' }
                        ]
                    }
                },
                {
                    id: 'table_size',
                    title: 'Table Size & Proportions',
                    description: 'Understanding the impact of table percentage',
                    duration: '10 min',
                    xpReward: 50,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'Table size is expressed as a percentage of girdle diameter. It dramatically affects a gem\'s appearance and light performance.' },
                            { type: 'slider', label: 'Table %', min: 50, max: 70, default: 57, callback: 'updateTablePreview' },
                            { type: 'text', content: 'Ideal table percentages: Round Brilliant (53-58%), Princess Cut (65-75%), Emerald Cut (60-70%)' },
                            { type: 'comparison', images: ['table_small.png', 'table_ideal.png', 'table_large.png'], labels: ['Small Table (52%)', 'Ideal Table (57%)', 'Large Table (65%)'] }
                        ]
                    }
                },
                {
                    id: 'girdle_thickness',
                    title: 'Girdle Thickness Control',
                    description: 'Achieving consistent girdle thickness',
                    duration: '8 min',
                    xpReward: 40,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'The girdle is the widest edge of the gemstone. Proper thickness prevents chipping while maximizing carat weight.' },
                            { type: 'quiz', question: 'What is the ideal girdle thickness range?', options: ['Extremely Thin', 'Thin to Slightly Thick', 'Very Thick', 'Variable'], answer: 1 },
                            { type: 'video', src: 'girdle_control.mp4', duration: '3:45' },
                            { type: 'practice', exercise: 'girdle_measurement', description: 'Practice measuring girdle thickness with the virtual caliper tool' }
                        ]
                    }
                }
            ]
        },
        
        polishing_mastery: {
            id: 'polishing_mastery',
            name: '✨ Polishing Mastery',
            description: 'Perfect your finishing techniques',
            icon: '✨',
            requiredLevel: 5,
            lessons: [
                {
                    id: 'polish_compounds',
                    title: 'Polishing Compounds & Grits',
                    description: 'Selecting the right abrasives for each material',
                    duration: '12 min',
                    xpReward: 60,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'Different gemstones require specific polishing compounds based on their hardness (Mohs scale) and composition.' },
                            { type: 'table', headers: ['Gemstone', 'Mohs', 'Compound', 'Grit Progression'], rows: [
                                ['Diamond', '10', 'Diamond powder', '1200 → 3000 → 8000 → 50,000'],
                                ['Sapphire/Ruby', '9', 'Aluminum oxide', '600 → 1200 → 3000 → 14,000'],
                                ['Emerald', '7.5-8', 'Cerium oxide', '400 → 800 → 1500 → 8000'],
                                ['Quartz', '7', 'Tin oxide', '320 → 600 → 1200 → 3000']
                            ]},
                            { type: 'quiz', question: 'Which compound is best for polishing diamonds?', options: ['Cerium oxide', 'Aluminum oxide', 'Diamond powder', 'Tin oxide'], answer: 2 }
                        ]
                    }
                },
                {
                    id: 'lap_speed',
                    title: 'Lap Speed & Pressure',
                    description: 'Optimizing speed and pressure for each stage',
                    duration: '10 min',
                    xpReward: 50,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'Lap speed (RPM) and dop pressure must be balanced. Too fast generates heat, too slow is inefficient. Too much pressure creates scratches, too little wastes time.' },
                            { type: 'chart', data: { labels: ['Coarse Grind', 'Fine Grind', 'Pre-Polish', 'Final Polish'], speeds: [400, 600, 800, 1200], pressures: [8, 6, 4, 2] }, title: 'Recommended Speed & Pressure by Stage' },
                            { type: 'video', src: 'lap_technique.mp4', duration: '4:20' },
                            { type: 'practice', exercise: 'speed_control', description: 'Practice adjusting lap speed for different polishing stages' }
                        ]
                    }
                },
                {
                    id: 'scratch_removal',
                    title: 'Scratch Removal Techniques',
                    description: 'Identifying and removing surface imperfections',
                    duration: '15 min',
                    xpReward: 75,
                    content: {
                        type: 'step_by_step',
                        steps: [
                            { step: 1, title: 'Identify Scratch Depth', description: 'Use 10x loupe to determine if scratches are surface-level or deep. Surface scratches appear as white lines, deep scratches look like grooves.', image: 'scratch_inspection.png' },
                            { step: 2, title: 'Re-cut if Necessary', description: 'Deep scratches require re-cutting the facet. Drop back 2-3 grit levels and re-establish the flat surface.', image: 'recutting_facet.png' },
                            { step: 3, title: 'Progress Through Grits', description: 'Move through grit sequence methodically: 600 → 1200 → 3000 → 8000. Inspect between each stage.', image: 'grit_progression.png' },
                            { step: 4, title: 'Cross-Hatch Pattern', description: 'Polish in a cross-hatch pattern to ensure even material removal and prevent directional scratches.', image: 'crosshatch_pattern.png' },
                            { step: 5, title: 'Final Inspection', description: 'Use loupe and bright light to verify all scratches are removed. Look for residual polishing compound.', image: 'final_inspection.png' }
                        ]
                    }
                },
                {
                    id: 'achieving_mirror',
                    title: 'Achieving Mirror Polish',
                    description: 'The final steps to perfection',
                    duration: '18 min',
                    xpReward: 90,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'A true mirror polish reflects light perfectly without diffusion. This requires flawless technique and patience.' },
                            { type: 'checklist', items: [
                                'All scratches removed (inspect with 10x loupe)',
                                'Lap is perfectly flat and clean',
                                'Fresh polishing compound applied',
                                'Consistent light pressure maintained',
                                'Adequate coolant/lubricant used',
                                'No hesitation marks or uneven spots'
                            ]},
                            { type: 'video', src: 'mirror_polish.mp4', duration: '6:30' },
                            { type: 'comparison', images: ['polish_before.png', 'polish_after.png'], labels: ['Before Final Polish', 'Mirror Polish Achieved'] },
                            { type: 'practice', exercise: 'final_polish', description: 'Practice achieving mirror polish on the virtual gemstone' }
                        ]
                    }
                }
            ]
        },
        
        advanced_designs: {
            id: 'advanced_designs',
            name: '🌟 Advanced Designs',
            description: 'Complex cuts and custom designs',
            icon: '🌟',
            requiredLevel: 10,
            lessons: [
                {
                    id: 'fancy_shapes',
                    title: 'Fancy Shape Cutting',
                    description: 'Hearts, marquise, pear, and other specialty shapes',
                    duration: '20 min',
                    xpReward: 100,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'Fancy shapes require modified cutting angles and sequences to optimize light performance for non-round geometries.' },
                            { type: 'gallery', images: [
                                { src: 'heart_cut.png', title: 'Heart Cut', description: '59 facets, challenging symmetry' },
                                { src: 'marquise_cut.png', title: 'Marquise Cut', description: '58 facets, elongated brilliance' },
                                { src: 'pear_cut.png', title: 'Pear Cut', description: '58 facets, teardrop shape' },
                                { src: 'cushion_cut.png', title: 'Cushion Cut', description: '64 facets, vintage appeal' }
                            ]},
                            { type: 'text', content: 'Each fancy shape has unique challenges: hearts require perfect symmetry, marquise needs careful point protection, pears must balance the head and point.' },
                            { type: 'quiz', question: 'Which fancy shape is most prone to bow-tie effect?', options: ['Heart', 'Marquise', 'Pear', 'Cushion'], answer: 1 }
                        ]
                    }
                },
                {
                    id: 'custom_faceting',
                    title: 'Custom Facet Design',
                    description: 'Creating your own unique patterns',
                    duration: '25 min',
                    xpReward: 125,
                    content: {
                        type: 'step_by_step',
                        steps: [
                            { step: 1, title: 'Design Planning', description: 'Sketch your design. Consider symmetry, light path, and practicality. Use faceting diagram software for precision.', image: 'design_planning.png' },
                            { step: 2, title: 'Calculate Angles', description: 'Use optical principles to calculate pavilion and crown angles. Factor in refractive index of the material.', image: 'angle_calculation.png' },
                            { step: 3, title: 'Index Gear Selection', description: 'Choose the correct index gear (96, 64, or 32) based on your symmetry requirements.', image: 'index_gear.png' },
                            { step: 4, title: 'Preform Shaping', description: 'Shape the rough stone to match your design outline. Leave extra material for adjustments.', image: 'preform.png' },
                            { step: 5, title: 'Test Cut', description: 'Cut a test stone in less valuable material to verify your design works.', image: 'test_cut.png' },
                            { step: 6, title: 'Final Execution', description: 'Execute your design on the actual gemstone, following your proven sequence.', image: 'final_execution.png' }
                        ]
                    }
                },
                {
                    id: 'concave_cutting',
                    title: 'Concave Cutting Techniques',
                    description: 'Creating inward-curved facets for dramatic effect',
                    duration: '22 min',
                    xpReward: 110,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'Concave cutting creates inward-curved facets that produce unique optical effects and dramatic light play. Requires specialized equipment and advanced skills.' },
                            { type: 'video', src: 'concave_cutting.mp4', duration: '8:15' },
                            { type: 'text', content: 'Tools needed: Ultra-thin cutting discs, concave radius laps (various radii), precision depth control, steady hand or automated CNC.' },
                            { type: 'comparison', images: ['flat_facet.png', 'concave_facet.png'], labels: ['Standard Flat Facet', 'Concave Facet'] },
                            { type: 'quiz', question: 'What is the main advantage of concave facets?', options: ['Faster cutting', 'Enhanced light dispersion', 'Easier to polish', 'Less material waste'], answer: 1 },
                            { type: 'practice', exercise: 'concave_practice', description: 'Practice cutting a simple concave facet on the simulator' }
                        ]
                    }
                },
                {
                    id: 'fantasy_cuts',
                    title: 'Fantasy & Sculptural Cuts',
                    description: 'Pushing boundaries with artistic designs',
                    duration: '30 min',
                    xpReward: 150,
                    content: {
                        type: 'interactive',
                        sections: [
                            { type: 'text', content: 'Fantasy cuts combine traditional faceting with sculptural elements, creating wearable art. These cuts prioritize visual impact over traditional brilliance metrics.' },
                            { type: 'gallery', images: [
                                { src: 'flower_cut.png', title: 'Flower Cut', description: 'Petals carved into pavilion' },
                                { src: 'maltese_cross.png', title: 'Maltese Cross', description: 'Geometric pattern throughout' },
                                { src: 'spiral_cut.png', title: 'Spiral Cut', description: 'Hypnotic rotating pattern' },
                                { src: 'starburst.png', title: 'Starburst', description: 'Radiating light pattern' }
                            ]},
                            { type: 'text', content: 'Fantasy cuts require: Deep understanding of light behavior, willingness to experiment, acceptance of material loss, patience for iteration.' },
                            { type: 'checklist', items: [
                                'Sketch design from multiple angles',
                                'Calculate material requirements (often 70-80% loss)',
                                'Plan cutting sequence meticulously',
                                'Test design in practice material',
                                'Document process for reproduction',
                                'Consider setting requirements'
                            ]},
                            { type: 'practice', exercise: 'fantasy_design', description: 'Design and cut your own fantasy gemstone' }
                        ]
                    }
                }
            ]
        }
    },
    
    // Daily tasks - reset every 24 hours
    dailyTasks: {
        lastReset: null,
        tasks: [
            {
                id: 'daily_login',
                name: 'Daily Check-In',
                description: 'Log in to GemBot Academy',
                icon: '📅',
                xpReward: 10,
                gemReward: 5,
                autoComplete: true,
                completed: false
            },
            {
                id: 'complete_lesson',
                name: 'Knowledge Seeker',
                description: 'Complete 1 lesson',
                icon: '📖',
                xpReward: 25,
                gemReward: 10,
                requirement: { type: 'lessons', count: 1 },
                progress: 0,
                completed: false
            },
            {
                id: 'cut_gem',
                name: 'Daily Cut',
                description: 'Cut 1 gemstone (game or real)',
                icon: '💎',
                xpReward: 30,
                gemReward: 15,
                requirement: { type: 'gems_cut', count: 1 },
                progress: 0,
                completed: false
            },
            {
                id: 'practice_mode',
                name: 'Practice Makes Perfect',
                description: 'Spend 5 minutes in practice mode',
                icon: '⏱️',
                xpReward: 20,
                gemReward: 8,
                requirement: { type: 'practice_time', count: 300 },
                progress: 0,
                completed: false
            }
        ]
    },
    
    // Weekly tasks - reset every 7 days
    weeklyTasks: {
        lastReset: null,
        tasks: [
            {
                id: 'weekly_streak',
                name: 'Dedicated Student',
                description: 'Log in 5 days this week',
                icon: '🔥',
                xpReward: 100,
                gemReward: 50,
                tokenReward: 5,
                requirement: { type: 'login_days', count: 5 },
                progress: 0,
                completed: false
            },
            {
                id: 'weekly_lessons',
                name: 'Course Champion',
                description: 'Complete 5 lessons',
                icon: '🎓',
                xpReward: 150,
                gemReward: 75,
                tokenReward: 10,
                requirement: { type: 'lessons', count: 5 },
                progress: 0,
                completed: false
            },
            {
                id: 'weekly_gems',
                name: 'Gem Collector',
                description: 'Cut 10 gemstones',
                icon: '💠',
                xpReward: 200,
                gemReward: 100,
                tokenReward: 15,
                requirement: { type: 'gems_cut', count: 10 },
                progress: 0,
                completed: false
            },
            {
                id: 'weekly_perfect',
                name: 'Perfectionist',
                description: 'Achieve 3 perfect cuts (95%+ quality)',
                icon: '⭐',
                xpReward: 250,
                gemReward: 125,
                tokenReward: 20,
                requirement: { type: 'perfect_cuts', count: 3 },
                progress: 0,
                completed: false
            }
        ]
    },
    
    // Monthly challenges - reset every 30 days
    monthlyTasks: {
        lastReset: null,
        tasks: [
            {
                id: 'monthly_master',
                name: 'Monthly Master',
                description: 'Complete all weekly tasks this month',
                icon: '👑',
                xpReward: 500,
                gemReward: 250,
                tokenReward: 50,
                requirement: { type: 'weekly_completions', count: 4 },
                progress: 0,
                completed: false
            },
            {
                id: 'monthly_carat',
                name: 'Carat King',
                description: 'Cut 100 total carats',
                icon: '💎',
                xpReward: 750,
                gemReward: 400,
                tokenReward: 75,
                requirement: { type: 'total_carats', count: 100 },
                progress: 0,
                completed: false
            },
            {
                id: 'monthly_course',
                name: 'Scholar',
                description: 'Complete an entire course',
                icon: '🎓',
                xpReward: 1000,
                gemReward: 500,
                tokenReward: 100,
                requirement: { type: 'course_complete', count: 1 },
                progress: 0,
                completed: false
            }
        ]
    },
    
    // Achievement definitions
    achievements: {
        first_steps: {
            id: 'first_steps',
            name: 'First Steps',
            description: 'Complete your first lesson',
            icon: '👶',
            xpReward: 50,
            secret: false,
            unlocked: false
        },
        week_warrior: {
            id: 'week_warrior',
            name: 'Week Warrior',
            description: 'Login 7 days in a row',
            icon: '🔥',
            xpReward: 100,
            secret: false,
            unlocked: false
        },
        gem_master: {
            id: 'gem_master',
            name: 'Gem Master',
            description: 'Cut 100 gemstones',
            icon: '💎',
            xpReward: 500,
            secret: false,
            unlocked: false
        },
        perfectionist: {
            id: 'perfectionist',
            name: 'Perfectionist',
            description: 'Achieve 10 perfect cuts',
            icon: '⭐',
            xpReward: 250,
            secret: false,
            unlocked: false
        },
        night_owl: {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Complete a lesson after midnight',
            icon: '🦉',
            xpReward: 75,
            secret: true,
            unlocked: false
        }
    },
    
    /**
     * Initialize the Academy system
     */
    init() {
        if (this.initialized) return;
        
        console.log('🎓 GemBot Academy initializing...');
        
        // Load saved progress
        this.loadProgress();
        
        // Check and reset tasks
        this.checkTaskResets();
        
        // Handle daily login
        this.handleDailyLogin();
        
        this.initialized = true;
        console.log('✅ Academy initialized');
        
        return this;
    },
    
    /**
     * Open the Academy panel - called by Merlin card and other systems
     */
    open() {
        console.log('📚 Opening GemBot Academy...');
        
        // Initialize if not already
        if (!this.initialized) {
            this.init();
        }
        
        // Find or create academy panel
        let academyPanel = document.getElementById('academy-panel');
        
        // If panel doesn't exist, try to create it or find container
        if (!academyPanel) {
            // Check if there's a panel container
            const panelContainer = document.querySelector('.panel-container, .main-content, #main-content');
            if (panelContainer) {
                academyPanel = document.createElement('div');
                academyPanel.id = 'academy-panel';
                academyPanel.className = 'game-panel academy-panel';
                academyPanel.innerHTML = this.renderAcademyPanel();
                panelContainer.appendChild(academyPanel);
            }
        }
        
        // Show the panel
        if (academyPanel) {
            academyPanel.style.display = 'block';
            academyPanel.classList.add('active');
            
            // If panel has content area, update it
            const content = academyPanel.querySelector('#academy-content');
            if (content) {
                this.showTab('tasks');
            }
        }
        
        // Trigger panel via panel manager if available
        if (window.togglePanel) {
            window.togglePanel('academy-panel');
        }
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('academyOpened'));
        
        return this;
    },
    
    /**
     * Load saved progress from localStorage AND Firebase
     * ENHANCED: Syncs from gembot_wallets, gembot_farm_save, AND Firebase Auth/Firestore
     */
    loadProgress() {
        try {
            // 🔄 LOAD REAL USER DATA FROM GEMBOT FARM (localStorage)
            const wallets = JSON.parse(localStorage.getItem('gembot_wallets') || '{}');
            const saveData = JSON.parse(localStorage.getItem('gembot_farm_save_0') || '{}');
            
            // Sync player data from game if available
            if (saveData.player) {
                this.player.level = Math.max(this.player.level, saveData.player.level || 1);
                this.player.gems = saveData.player.gems || this.player.gems;
                this.player.tokens = saveData.player.tokens || this.player.tokens;
                console.log('🔄 Synced data from GemBot Farm:', {
                    level: this.player.level,
                    gems: this.player.gems,
                    tokens: this.player.tokens
                });
            }
            
            // 🔥 FIREBASE INTEGRATION: Sync from Firebase Auth if available
            this.syncFromFirebase();
            
            // Load academy-specific progress from localStorage
            const saved = localStorage.getItem('gembot_academy_progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.player = { ...this.player, ...data.player };
                
                if (data.dailyTasks) {
                    this.dailyTasks.lastReset = data.dailyTasks.lastReset;
                    // Merge task progress
                    data.dailyTasks.tasks?.forEach(savedTask => {
                        const task = this.dailyTasks.tasks.find(t => t.id === savedTask.id);
                        if (task) {
                            task.progress = savedTask.progress || 0;
                            task.completed = savedTask.completed || false;
                        }
                    });
                }
                
                if (data.weeklyTasks) {
                    this.weeklyTasks.lastReset = data.weeklyTasks.lastReset;
                    data.weeklyTasks.tasks?.forEach(savedTask => {
                        const task = this.weeklyTasks.tasks.find(t => t.id === savedTask.id);
                        if (task) {
                            task.progress = savedTask.progress || 0;
                            task.completed = savedTask.completed || false;
                        }
                    });
                }
                
                if (data.monthlyTasks) {
                    this.monthlyTasks.lastReset = data.monthlyTasks.lastReset;
                    data.monthlyTasks.tasks?.forEach(savedTask => {
                        const task = this.monthlyTasks.tasks.find(t => t.id === savedTask.id);
                        if (task) {
                            task.progress = savedTask.progress || 0;
                            task.completed = savedTask.completed || false;
                        }
                    });
                }
                
                if (data.achievements) {
                    Object.entries(data.achievements).forEach(([id, unlocked]) => {
                        if (this.achievements[id]) {
                            this.achievements[id].unlocked = unlocked;
                        }
                    });
                }
                
                console.log('📂 Academy progress loaded from localStorage');
            }
        } catch (e) {
            console.warn('Could not load academy progress:', e);
        }
    },
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            const data = {
                player: this.player,
                dailyTasks: {
                    lastReset: this.dailyTasks.lastReset,
                    tasks: this.dailyTasks.tasks.map(t => ({
                        id: t.id,
                        progress: t.progress,
                        completed: t.completed
                    }))
                },
                weeklyTasks: {
                    lastReset: this.weeklyTasks.lastReset,
                    tasks: this.weeklyTasks.tasks.map(t => ({
                        id: t.id,
                        progress: t.progress,
                        completed: t.completed
                    }))
                },
                monthlyTasks: {
                    lastReset: this.monthlyTasks.lastReset,
                    tasks: this.monthlyTasks.tasks.map(t => ({
                        id: t.id,
                        progress: t.progress,
                        completed: t.completed
                    }))
                },
                achievements: Object.fromEntries(
                    Object.entries(this.achievements).map(([id, a]) => [id, a.unlocked])
                )
            };
            
            localStorage.setItem('gembot_academy_progress', JSON.stringify(data));
            console.log('💾 Academy progress saved to localStorage');
            
            // 🔥 FIREBASE: Also save to Firestore if available
            this.saveToFirebase(data);
        } catch (e) {
            console.warn('Could not save academy progress:', e);
        }
    },
    
    /**
     * Sync player data from Firebase Auth and Firestore
     * Integrates with existing Firebase setup in gembot-utils.js
     */
    async syncFromFirebase() {
        try {
            // Check for Firebase Auth
            const auth = window.firebaseAuth || (window.firebase && window.firebase.auth && window.firebase.auth());
            if (!auth) {
                console.log('📱 Firebase Auth not available - using localStorage only');
                return;
            }
            
            const user = auth.currentUser;
            if (!user) {
                console.log('📱 No Firebase user signed in - using localStorage only');
                return;
            }
            
            console.log('🔥 Firebase user found:', user.email || user.uid);
            
            // Store user identity
            this.firebaseUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            };
            
            // Try to load from Firestore
            const db = window.firebaseDb || (window.firebase && window.firebase.firestore && window.firebase.firestore());
            if (db && window.firestoreUtils) {
                const { doc, getDoc } = window.firestoreUtils;
                const userDocRef = doc(db, 'academy_progress', user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const cloudData = userDoc.data();
                    console.log('☁️ Loaded Academy progress from Firebase:', cloudData);
                    
                    // Merge cloud data with local (prefer higher values)
                    if (cloudData.player) {
                        this.player.level = Math.max(this.player.level, cloudData.player.level || 1);
                        this.player.xp = Math.max(this.player.xp, cloudData.player.xp || 0);
                        this.player.totalXp = Math.max(this.player.totalXp, cloudData.player.totalXp || 0);
                        this.player.streak = Math.max(this.player.streak, cloudData.player.streak || 0);
                        
                        // Merge stats
                        if (cloudData.player.stats) {
                            Object.keys(cloudData.player.stats).forEach(key => {
                                this.player.stats[key] = Math.max(
                                    this.player.stats[key] || 0,
                                    cloudData.player.stats[key] || 0
                                );
                            });
                        }
                        
                        // Merge completed lessons (union)
                        if (cloudData.player.completedLessons) {
                            const localLessons = new Set(this.player.completedLessons);
                            cloudData.player.completedLessons.forEach(l => localLessons.add(l));
                            this.player.completedLessons = Array.from(localLessons);
                        }
                        
                        // Merge unlocked courses (union)
                        if (cloudData.player.unlockedCourses) {
                            const localCourses = new Set(this.player.unlockedCourses);
                            cloudData.player.unlockedCourses.forEach(c => localCourses.add(c));
                            this.player.unlockedCourses = Array.from(localCourses);
                        }
                    }
                    
                    // Dispatch sync event
                    window.dispatchEvent(new CustomEvent('academyFirebaseSync', { 
                        detail: { status: 'success', user: user.uid } 
                    }));
                }
            }
        } catch (error) {
            console.warn('⚠️ Firebase sync failed (will use localStorage):', error.message);
        }
    },
    
    /**
     * Save Academy progress to Firebase Firestore
     */
    async saveToFirebase(data) {
        try {
            if (!this.firebaseUser?.uid) return;
            
            const db = window.firebaseDb || (window.firebase && window.firebase.firestore && window.firebase.firestore());
            if (!db || !window.firestoreUtils) return;
            
            const { doc, setDoc, serverTimestamp } = window.firestoreUtils;
            const userDocRef = doc(db, 'academy_progress', this.firebaseUser.uid);
            
            await setDoc(userDocRef, {
                ...data,
                lastUpdated: serverTimestamp(),
                userEmail: this.firebaseUser.email
            }, { merge: true });
            
            console.log('☁️ Academy progress saved to Firebase');
        } catch (error) {
            console.warn('⚠️ Could not save to Firebase:', error.message);
        }
    },
    
    /**
     * Check if tasks need to be reset
     */
    checkTaskResets() {
        const now = new Date();
        const today = now.toDateString();
        
        // Daily reset
        if (this.dailyTasks.lastReset !== today) {
            this.dailyTasks.tasks.forEach(task => {
                task.progress = 0;
                task.completed = false;
            });
            this.dailyTasks.lastReset = today;
            console.log('🔄 Daily tasks reset');
        }
        
        // Weekly reset (Sunday)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekKey = weekStart.toDateString();
        
        if (this.weeklyTasks.lastReset !== weekKey) {
            this.weeklyTasks.tasks.forEach(task => {
                task.progress = 0;
                task.completed = false;
            });
            this.weeklyTasks.lastReset = weekKey;
            console.log('🔄 Weekly tasks reset');
        }
        
        // Monthly reset (1st of month)
        const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
        if (this.monthlyTasks.lastReset !== monthKey) {
            this.monthlyTasks.tasks.forEach(task => {
                task.progress = 0;
                task.completed = false;
            });
            this.monthlyTasks.lastReset = monthKey;
            console.log('🔄 Monthly tasks reset');
        }
        
        this.saveProgress();
    },
    
    /**
     * Handle daily login
     */
    handleDailyLogin() {
        const today = new Date().toDateString();
        
        if (this.player.lastLoginDate !== today) {
            // Check streak
            const lastLogin = this.player.lastLoginDate ? new Date(this.player.lastLoginDate) : null;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastLogin && lastLogin.toDateString() === yesterday.toDateString()) {
                this.player.streak++;
                this.player.stats.maxLoginStreak = Math.max(this.player.stats.maxLoginStreak, this.player.streak);
            } else if (!lastLogin || lastLogin.toDateString() !== today) {
                this.player.streak = 1;
            }
            
            this.player.lastLoginDate = today;
            this.player.stats.loginStreak = this.player.streak;
            
            // Complete daily login task
            this.updateTaskProgress('daily_login', 1);
            
            // Update weekly login progress
            this.updateTaskProgress('weekly_streak', 1, 'weekly');
            
            // Check achievements
            this.checkAchievements();
            
            this.saveProgress();
        }
    },
    
    /**
     * Add XP and check for level up
     */
    addXP(amount) {
        this.player.xp += amount;
        this.player.totalXp += amount;
        
        while (this.player.xp >= this.player.xpToNext) {
            this.player.xp -= this.player.xpToNext;
            this.player.level++;
            this.player.xpToNext = this.calculateXPForLevel(this.player.level + 1);
            
            console.log(`🎉 Level Up! Now level ${this.player.level}`);
            this.showNotification(`🎉 Level Up! You are now level ${this.player.level}!`, 'levelup');
        }
        
        this.saveProgress();
        this.updateUI();
    },
    
    /**
     * Calculate XP needed for next level
     */
    calculateXPForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },
    
    /**
     * Add gems to player
     */
    addGems(amount) {
        this.player.gems += amount;
        this.player.stats.gemsEarned += amount;
        this.saveProgress();
        this.updateUI();
    },
    
    /**
     * Add tokens to player
     */
    addTokens(amount) {
        this.player.tokens += amount;
        this.player.stats.tokensEarned += amount;
        this.saveProgress();
        this.updateUI();
    },
    
    /**
     * Update task progress
     */
    updateTaskProgress(taskId, amount, taskType = 'daily') {
        let taskList;
        switch (taskType) {
            case 'weekly': taskList = this.weeklyTasks.tasks; break;
            case 'monthly': taskList = this.monthlyTasks.tasks; break;
            default: taskList = this.dailyTasks.tasks;
        }
        
        const task = taskList.find(t => t.id === taskId);
        if (!task || task.completed) return;
        
        if (task.autoComplete) {
            task.completed = true;
        } else if (task.requirement) {
            task.progress = Math.min((task.progress || 0) + amount, task.requirement.count);
            if (task.progress >= task.requirement.count) {
                task.completed = true;
            }
        }
        
        if (task.completed) {
            this.completeTask(task);
        }
        
        this.saveProgress();
        this.updateUI();
    },
    
    /**
     * Complete a task and give rewards
     */
    completeTask(task) {
        console.log(`✅ Task completed: ${task.name}`);
        
        if (task.xpReward) this.addXP(task.xpReward);
        if (task.gemReward) this.addGems(task.gemReward);
        if (task.tokenReward) this.addTokens(task.tokenReward);
        
        this.player.stats.tasksCompleted++;
        
        this.showNotification(`✅ ${task.name} completed! +${task.xpReward} XP`, 'success');
        
        this.checkAchievements();
    },
    
    /**
     * Complete a lesson
     */
    completeLesson(courseId, lessonId) {
        const course = this.courses[courseId];
        if (!course) return { success: false, message: 'Course not found' };
        
        const lesson = course.lessons.find(l => l.id === lessonId);
        if (!lesson) return { success: false, message: 'Lesson not found' };
        
        // Check if already completed
        const completionKey = `${courseId}_${lessonId}`;
        if (this.player.completedLessons.includes(completionKey)) {
            return { success: false, message: 'Lesson already completed' };
        }
        
        // Complete the lesson
        this.player.completedLessons.push(completionKey);
        this.player.stats.lessonsCompleted++;
        
        // Give rewards
        this.addXP(lesson.xpReward);
        
        // Update task progress
        this.updateTaskProgress('complete_lesson', 1);
        this.updateTaskProgress('weekly_lessons', 1, 'weekly');
        
        this.showNotification(`📖 Lesson completed: ${lesson.title}`, 'success');
        
        // Check if course is complete
        const completedInCourse = course.lessons.filter(l => 
            this.player.completedLessons.includes(`${courseId}_${l.id}`)
        ).length;
        
        if (completedInCourse === course.lessons.length) {
            this.completeCourse(courseId);
        }
        
        this.checkAchievements();
        this.saveProgress();
        
        return { success: true, xpGained: lesson.xpReward };
    },
    
    /**
     * Complete a course
     */
    completeCourse(courseId) {
        const course = this.courses[courseId];
        if (!course) return;
        
        console.log(`🎓 Course completed: ${course.name}`);
        
        // Bonus XP for course completion
        const bonusXP = 200;
        this.addXP(bonusXP);
        this.addTokens(25);
        
        // Update monthly task
        this.updateTaskProgress('monthly_course', 1, 'monthly');
        
        // Unlock next course
        const courseOrder = ['basics', 'cutting_fundamentals', 'polishing_mastery', 'advanced_designs'];
        const currentIndex = courseOrder.indexOf(courseId);
        if (currentIndex < courseOrder.length - 1) {
            const nextCourse = courseOrder[currentIndex + 1];
            if (!this.player.unlockedCourses.includes(nextCourse)) {
                this.player.unlockedCourses.push(nextCourse);
                this.showNotification(`🔓 New course unlocked: ${this.courses[nextCourse].name}!`, 'unlock');
            }
        }
        
        this.showNotification(`🎓 Course completed: ${course.name}! +${bonusXP} XP`, 'achievement');
    },
    
    /**
     * Check and unlock achievements
     */
    checkAchievements() {
        // First Steps
        if (!this.achievements.first_steps.unlocked && this.player.stats.lessonsCompleted >= 1) {
            this.unlockAchievement('first_steps');
        }
        
        // Week Warrior
        if (!this.achievements.week_warrior.unlocked && this.player.streak >= 7) {
            this.unlockAchievement('week_warrior');
        }
        
        // Night Owl
        const hour = new Date().getHours();
        if (!this.achievements.night_owl.unlocked && (hour >= 0 && hour < 5)) {
            this.unlockAchievement('night_owl');
        }
    },
    
    /**
     * Unlock an achievement
     */
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        this.player.achievements.push(achievementId);
        
        if (achievement.xpReward) this.addXP(achievement.xpReward);
        
        this.showNotification(`🏆 Achievement unlocked: ${achievement.name}!`, 'achievement');
        this.saveProgress();
    },
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `academy-notification academy-notification-${type}`;
        notification.innerHTML = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '10px',
            background: type === 'success' ? 'linear-gradient(135deg, #00ff88, #00cc66)' :
                        type === 'achievement' ? 'linear-gradient(135deg, #ffd700, #ff8c00)' :
                        type === 'levelup' ? 'linear-gradient(135deg, #667eea, #764ba2)' :
                        type === 'unlock' ? 'linear-gradient(135deg, #00ffff, #0088ff)' :
                        'linear-gradient(135deg, #333, #555)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: '10000',
            animation: 'slideIn 0.3s ease',
            cursor: 'pointer'
        });
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        notification.onclick = () => notification.remove();
    },
    
    /**
     * Update UI elements
     */
    updateUI() {
        // Update level display
        const levelEl = document.getElementById('academy-level');
        if (levelEl) levelEl.textContent = this.player.level;
        
        // Update XP bar
        const xpFill = document.getElementById('academy-xp-fill');
        if (xpFill) {
            const percent = (this.player.xp / this.player.xpToNext) * 100;
            xpFill.style.width = `${percent}%`;
        }
        
        // Update XP text
        const xpText = document.getElementById('academy-xp-text');
        if (xpText) xpText.textContent = `${this.player.xp} / ${this.player.xpToNext} XP`;
        
        // Update gems
        const gemsEl = document.getElementById('academy-gems');
        if (gemsEl) gemsEl.textContent = this.player.gems;
        
        // Update tokens
        const tokensEl = document.getElementById('academy-tokens');
        if (tokensEl) tokensEl.textContent = this.player.tokens;
        
        // Update streak
        const streakEl = document.getElementById('academy-streak');
        if (streakEl) streakEl.textContent = `🔥 ${this.player.streak} day streak`;
    },
    
    /**
     * Render the Academy panel
     */
    renderAcademyPanel() {
        return `
            <div class="academy-container">
                <!-- Header -->
                <div class="academy-header">
                    <div class="academy-player-info">
                        <div class="academy-level-badge">
                            <span class="level-number" id="academy-level">${this.player.level}</span>
                            <span class="level-label">LEVEL</span>
                        </div>
                        <div class="academy-xp-container">
                            <div class="academy-xp-bar">
                                <div class="academy-xp-fill" id="academy-xp-fill" style="width: ${(this.player.xp / this.player.xpToNext) * 100}%"></div>
                            </div>
                            <span class="academy-xp-text" id="academy-xp-text">${this.player.xp} / ${this.player.xpToNext} XP</span>
                        </div>
                    </div>
                    <div class="academy-currencies">
                        <div class="currency-item">💎 <span id="academy-gems">${this.player.gems}</span></div>
                        <div class="currency-item">🪙 <span id="academy-tokens">${this.player.tokens}</span></div>
                        <div class="currency-item" id="academy-streak">🔥 ${this.player.streak} day streak</div>
                    </div>
                </div>
                
                <!-- Tabs -->
                <div class="academy-tabs">
                    <button class="academy-tab active" onclick="GemBotAcademy.showTab('tasks')">📋 Tasks</button>
                    <button class="academy-tab" onclick="GemBotAcademy.showTab('courses')">📚 Courses</button>
                    <button class="academy-tab" onclick="GemBotAcademy.showTab('achievements')">🏆 Achievements</button>
                    <button class="academy-tab" onclick="GemBotAcademy.showTab('stats')">📊 Stats</button>
                </div>
                
                <!-- Content -->
                <div class="academy-content" id="academy-content">
                    ${this.renderTasksTab()}
                </div>
            </div>
        `;
    },
    
    /**
     * Render tasks tab
     */
    renderTasksTab() {
        return `
            <div class="tasks-container">
                <!-- Daily Tasks -->
                <div class="task-section">
                    <h3>📅 Daily Tasks</h3>
                    <div class="task-list">
                        ${this.dailyTasks.tasks.map(task => this.renderTask(task)).join('')}
                    </div>
                </div>
                
                <!-- Weekly Tasks -->
                <div class="task-section">
                    <h3>📆 Weekly Tasks</h3>
                    <div class="task-list">
                        ${this.weeklyTasks.tasks.map(task => this.renderTask(task)).join('')}
                    </div>
                </div>
                
                <!-- Monthly Tasks -->
                <div class="task-section">
                    <h3>🗓️ Monthly Challenges</h3>
                    <div class="task-list">
                        ${this.monthlyTasks.tasks.map(task => this.renderTask(task)).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Render a single task
     */
    renderTask(task) {
        const progressPercent = task.requirement ? (task.progress / task.requirement.count) * 100 : (task.completed ? 100 : 0);
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-icon">${task.icon}</div>
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-desc">${task.description}</div>
                    ${task.requirement ? `
                        <div class="task-progress">
                            <div class="task-progress-bar">
                                <div class="task-progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="task-progress-text">${task.progress || 0}/${task.requirement.count}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="task-rewards">
                    ${task.xpReward ? `<span class="reward-xp">+${task.xpReward} XP</span>` : ''}
                    ${task.gemReward ? `<span class="reward-gem">+${task.gemReward} 💎</span>` : ''}
                    ${task.tokenReward ? `<span class="reward-token">+${task.tokenReward} 🪙</span>` : ''}
                </div>
                ${task.completed ? '<div class="task-check">✅</div>' : ''}
            </div>
        `;
    },
    
    /**
     * Show a specific tab
     */
    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.academy-tab').forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        
        const content = document.getElementById('academy-content');
        if (!content) return;
        
        switch (tabName) {
            case 'tasks':
                content.innerHTML = this.renderTasksTab();
                break;
            case 'courses':
                content.innerHTML = this.renderCoursesTab();
                break;
            case 'achievements':
                content.innerHTML = this.renderAchievementsTab();
                break;
            case 'stats':
                content.innerHTML = this.renderStatsTab();
                break;
        }
    },
    
    /**
     * Render courses tab
     */
    renderCoursesTab() {
        return `
            <div class="courses-container">
                ${Object.values(this.courses).map(course => {
                    const isUnlocked = this.player.unlockedCourses.includes(course.id);
                    const completedLessons = course.lessons.filter(l => 
                        this.player.completedLessons.includes(`${course.id}_${l.id}`)
                    ).length;
                    const progressPercent = course.lessons.length > 0 ? (completedLessons / course.lessons.length) * 100 : 0;
                    
                    return `
                        <div class="course-card ${isUnlocked ? '' : 'locked'}">
                            <div class="course-icon">${course.icon}</div>
                            <div class="course-info">
                                <h4 class="course-name">${course.name}</h4>
                                <p class="course-desc">${course.description}</p>
                                <div class="course-progress">
                                    <div class="course-progress-bar">
                                        <div class="course-progress-fill" style="width: ${progressPercent}%"></div>
                                    </div>
                                    <span>${completedLessons}/${course.lessons.length} lessons</span>
                                </div>
                            </div>
                            ${isUnlocked ? 
                                `<button class="course-btn" onclick="GemBotAcademy.openCourse('${course.id}')">Continue</button>` :
                                `<div class="course-locked">🔒 Level ${course.requiredLevel}</div>`
                            }
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    /**
     * Render achievements tab
     */
    renderAchievementsTab() {
        return `
            <div class="achievements-container">
                ${Object.values(this.achievements).map(achievement => `
                    <div class="achievement-card ${achievement.unlocked ? 'unlocked' : ''} ${achievement.secret && !achievement.unlocked ? 'secret' : ''}">
                        <div class="achievement-icon">${achievement.secret && !achievement.unlocked ? '❓' : achievement.icon}</div>
                        <div class="achievement-info">
                            <h4>${achievement.secret && !achievement.unlocked ? '???' : achievement.name}</h4>
                            <p>${achievement.secret && !achievement.unlocked ? 'Secret achievement' : achievement.description}</p>
                        </div>
                        ${achievement.unlocked ? '<div class="achievement-check">✅</div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Render stats tab
     */
    renderStatsTab() {
        return `
            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-icon">📖</div>
                    <div class="stat-value">${this.player.stats.lessonsCompleted}</div>
                    <div class="stat-label">Lessons Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${this.player.stats.tasksCompleted}</div>
                    <div class="stat-label">Tasks Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💎</div>
                    <div class="stat-value">${this.player.stats.gemsEarned}</div>
                    <div class="stat-label">Total Gems Earned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🪙</div>
                    <div class="stat-value">${this.player.stats.tokensEarned}</div>
                    <div class="stat-label">Total Tokens Earned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-value">${this.player.stats.maxLoginStreak}</div>
                    <div class="stat-label">Best Login Streak</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value">${this.player.stats.perfectScores}</div>
                    <div class="stat-label">Perfect Scores</div>
                </div>
            </div>
        `;
    },
    
    /**
     * Open a course
     */
    openCourse(courseId) {
        const course = this.courses[courseId];
        if (!course) return;
        
        console.log(`📚 Opening course: ${course.name}`);
        
        // Render course lessons
        const content = document.getElementById('academy-content');
        if (content) {
            content.innerHTML = `
                <div class="course-detail">
                    <button class="back-btn" onclick="GemBotAcademy.showTab('courses')">← Back to Courses</button>
                    <h2>${course.icon} ${course.name}</h2>
                    <p>${course.description}</p>
                    
                    <div class="lessons-list">
                        ${course.lessons.map((lesson, index) => {
                            const isCompleted = this.player.completedLessons.includes(`${courseId}_${lesson.id}`);
                            return `
                                <div class="lesson-item ${isCompleted ? 'completed' : ''}">
                                    <div class="lesson-number">${index + 1}</div>
                                    <div class="lesson-info">
                                        <h4>${lesson.title}</h4>
                                        <p>${lesson.description}</p>
                                        <span class="lesson-duration">⏱️ ${lesson.duration}</span>
                                    </div>
                                    <div class="lesson-reward">+${lesson.xpReward} XP</div>
                                    ${isCompleted ? 
                                        '<div class="lesson-check">✅</div>' :
                                        `<button class="lesson-btn" onclick="GemBotAcademy.startLesson('${courseId}', '${lesson.id}')">Start</button>`
                                    }
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
    },
    
    /**
     * Start a lesson - Opens full interactive lesson viewer
     */
    startLesson(courseId, lessonId) {
        const course = this.courses[courseId];
        const lesson = course?.lessons.find(l => l.id === lessonId);
        
        if (!lesson) return;
        
        console.log(`📖 Starting lesson: ${lesson.title}`);
        
        // Store current lesson for tracking
        this.currentLesson = { courseId, lessonId, startTime: Date.now(), currentSection: 0 };
        
        // Open interactive lesson viewer
        this.openLessonViewer(courseId, lesson);
    },
    
    /**
     * Open the interactive lesson viewer
     */
    openLessonViewer(courseId, lesson) {
        const content = document.getElementById('academy-content');
        if (!content) return;
        
        const lessonContent = lesson.content || { type: 'interactive', sections: [] };
        
        content.innerHTML = `
            <div class="lesson-viewer">
                <div class="lesson-header">
                    <button class="back-btn" onclick="GemBotAcademy.exitLesson('${courseId}')">← Exit Lesson</button>
                    <div class="lesson-title-bar">
                        <h2>${lesson.title}</h2>
                        <span class="lesson-duration">⏱️ ${lesson.duration}</span>
                        <span class="lesson-reward">🎁 +${lesson.xpReward} XP</span>
                    </div>
                    <div class="lesson-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="lessonProgressFill" style="width: 0%"></div>
                        </div>
                        <span id="lessonProgressText">Section 1 of ${this.getLessonSectionCount(lesson)}</span>
                    </div>
                </div>
                
                <div class="lesson-body" id="lessonBody">
                    ${this.renderLessonContent(lesson, 0)}
                </div>
                
                <div class="lesson-nav">
                    <button class="nav-btn" id="lessonPrevBtn" onclick="GemBotAcademy.previousSection()" disabled>
                        ← Previous
                    </button>
                    <button class="nav-btn primary" id="lessonNextBtn" onclick="GemBotAcademy.nextSection()">
                        Next →
                    </button>
                </div>
            </div>
        `;
        
        this.injectLessonStyles();
    },
    
    /**
     * Get total section count for a lesson
     */
    getLessonSectionCount(lesson) {
        if (lesson.content?.sections) return lesson.content.sections.length;
        if (lesson.content?.steps) return lesson.content.steps.length;
        if (lesson.content?.items) return lesson.content.items.length;
        return 1;
    },
    
    /**
     * Render lesson content based on section type
     */
    renderLessonContent(lesson, sectionIndex) {
        const content = lesson.content || {};
        const totalSections = this.getLessonSectionCount(lesson);
        
        // Handle different content types
        if (content.type === 'interactive' && content.sections) {
            const section = content.sections[sectionIndex];
            if (!section) return this.renderCompletionScreen(lesson);
            return this.renderSection(section, sectionIndex, totalSections);
        }
        
        if (content.type === 'step_by_step' && content.steps) {
            const step = content.steps[sectionIndex];
            if (!step) return this.renderCompletionScreen(lesson);
            return this.renderStep(step, sectionIndex, totalSections);
        }
        
        if (content.type === 'checklist' && content.items) {
            return this.renderChecklist(content.items, sectionIndex === content.items.length);
        }
        
        if (content.type === 'interactive_3d') {
            return this.render3DContent(content, sectionIndex);
        }
        
        // Default fallback
        return `
            <div class="section-card">
                <div class="section-icon">📚</div>
                <h3>${lesson.title}</h3>
                <p>${lesson.description}</p>
                <p class="section-note">This lesson content is being prepared...</p>
            </div>
        `;
    },
    
    /**
     * Render individual section based on type
     */
    renderSection(section, index, total) {
        switch (section.type) {
            case 'text':
                return `
                    <div class="section-card text-section">
                        <div class="section-number">Section ${index + 1} of ${total}</div>
                        <div class="section-content">
                            <p>${section.content}</p>
                        </div>
                    </div>
                `;
            
            case 'quiz':
                return `
                    <div class="section-card quiz-section">
                        <div class="section-number">Quiz - Section ${index + 1}</div>
                        <div class="quiz-icon">❓</div>
                        <h3 class="quiz-question">${section.question}</h3>
                        <div class="quiz-options" id="quizOptions">
                            ${section.options.map((opt, i) => `
                                <button class="quiz-option" data-index="${i}" onclick="GemBotAcademy.selectQuizOption(${i}, ${section.answer})">
                                    <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                                    <span class="option-text">${opt}</span>
                                </button>
                            `).join('')}
                        </div>
                        <div class="quiz-feedback" id="quizFeedback"></div>
                    </div>
                `;
            
            case 'image':
                return `
                    <div class="section-card image-section">
                        <div class="section-number">Section ${index + 1} of ${total}</div>
                        <div class="image-placeholder">
                            <div class="image-icon">🖼️</div>
                            <p class="image-caption">${section.caption || 'Illustration'}</p>
                        </div>
                        <p class="image-note">Image: ${section.src}</p>
                    </div>
                `;
            
            case 'video':
                return `
                    <div class="section-card video-section">
                        <div class="section-number">Section ${index + 1} of ${total}</div>
                        <div class="video-placeholder">
                            <div class="video-icon">▶️</div>
                            <p>Video Tutorial</p>
                            <span class="video-duration">${section.duration || 'N/A'}</span>
                        </div>
                        <p class="video-note">Video: ${section.src}</p>
                    </div>
                `;
            
            case 'calculator':
            case 'slider':
                return `
                    <div class="section-card tool-section">
                        <div class="section-number">Interactive Tool - Section ${index + 1}</div>
                        <div class="tool-icon">🧮</div>
                        <h3>${section.label || section.tool || 'Interactive Tool'}</h3>
                        <p>${section.description || 'Use this interactive tool to explore the concept.'}</p>
                        ${section.type === 'slider' ? `
                            <div class="tool-slider">
                                <input type="range" min="${section.min || 0}" max="${section.max || 100}" 
                                       value="${section.default || 50}" 
                                       oninput="GemBotAcademy.updateToolValue(this.value)">
                                <span id="sliderValue">${section.default || 50}</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            
            case 'gallery':
                return `
                    <div class="section-card gallery-section">
                        <div class="section-number">Gallery - Section ${index + 1}</div>
                        <div class="gallery-grid">
                            ${(section.images || []).map(img => `
                                <div class="gallery-item">
                                    <div class="gallery-icon">💎</div>
                                    <h4>${img.title || 'Image'}</h4>
                                    <p>${img.description || ''}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            
            case 'comparison':
                return `
                    <div class="section-card comparison-section">
                        <div class="section-number">Comparison - Section ${index + 1}</div>
                        <div class="comparison-grid">
                            ${(section.images || []).map((img, i) => `
                                <div class="comparison-item">
                                    <div class="comparison-icon">${i === 0 ? '❌' : '✅'}</div>
                                    <h4>${(section.labels || [])[i] || `Option ${i + 1}`}</h4>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            
            case 'practice':
                return `
                    <div class="section-card practice-section">
                        <div class="section-number">Practice Exercise - Section ${index + 1}</div>
                        <div class="practice-icon">🎯</div>
                        <h3>Practice Time!</h3>
                        <p>${section.description || 'Complete this practice exercise to reinforce your learning.'}</p>
                        <button class="practice-btn" onclick="GemBotAcademy.startPractice('${section.exercise}')">
                            Start Practice
                        </button>
                    </div>
                `;
            
            default:
                return `
                    <div class="section-card">
                        <div class="section-number">Section ${index + 1} of ${total}</div>
                        <p>${JSON.stringify(section)}</p>
                    </div>
                `;
        }
    },
    
    /**
     * Render step-by-step content
     */
    renderStep(step, index, total) {
        return `
            <div class="section-card step-section">
                <div class="step-header">
                    <div class="step-number">Step ${step.step || index + 1} of ${total}</div>
                    <h3>${step.title}</h3>
                </div>
                <div class="step-content">
                    <div class="step-image-placeholder">
                        <div class="step-icon">📸</div>
                        <span>${step.image || 'Step illustration'}</span>
                    </div>
                    <p class="step-description">${step.description}</p>
                </div>
            </div>
        `;
    },
    
    /**
     * Render checklist content
     */
    renderChecklist(items, isComplete) {
        if (isComplete) {
            return this.renderCompletionScreen({ title: 'Safety Checklist' });
        }
        
        return `
            <div class="section-card checklist-section">
                <div class="checklist-icon">📋</div>
                <h3>Safety Checklist</h3>
                <div class="checklist-items">
                    ${items.map((item, i) => `
                        <label class="checklist-item">
                            <input type="checkbox" id="check-${i}" onchange="GemBotAcademy.updateChecklistProgress()">
                            <span class="checkmark"></span>
                            <span class="checklist-text">${item}</span>
                        </label>
                    `).join('')}
                </div>
                <p class="checklist-note">Check all items to complete this lesson</p>
            </div>
        `;
    },
    
    /**
     * Render 3D interactive content
     */
    render3DContent(content, index) {
        const hotspots = content.hotspots || [];
        
        return `
            <div class="section-card interactive-3d-section">
                <div class="model-viewer">
                    <div class="model-placeholder">
                        <div class="model-icon">🔮</div>
                        <p>3D Model: ${content.model || 'CNC Machine'}</p>
                    </div>
                </div>
                <div class="hotspots-list">
                    <h4>Interactive Points:</h4>
                    ${hotspots.map((hs, i) => `
                        <div class="hotspot-item" onclick="GemBotAcademy.focusHotspot(${i})">
                            <span class="hotspot-marker">${i + 1}</span>
                            <div class="hotspot-info">
                                <strong>${hs.label}</strong>
                                <p>${hs.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Render lesson completion screen
     */
    renderCompletionScreen(lesson) {
        return `
            <div class="section-card completion-section">
                <div class="completion-icon">🎉</div>
                <h2>Lesson Complete!</h2>
                <p>You've finished: <strong>${lesson.title}</strong></p>
                <div class="completion-rewards">
                    <div class="reward-item">
                        <span class="reward-icon">⭐</span>
                        <span class="reward-value">+${lesson.xpReward || 50} XP</span>
                    </div>
                </div>
                <button class="complete-btn" onclick="GemBotAcademy.finishLesson()">
                    Claim Rewards & Continue
                </button>
            </div>
        `;
    },
    
    /**
     * Handle quiz option selection
     */
    selectQuizOption(selectedIndex, correctIndex) {
        const options = document.querySelectorAll('.quiz-option');
        const feedback = document.getElementById('quizFeedback');
        
        options.forEach((opt, i) => {
            opt.disabled = true;
            if (i === correctIndex) {
                opt.classList.add('correct');
            } else if (i === selectedIndex && selectedIndex !== correctIndex) {
                opt.classList.add('incorrect');
            }
        });
        
        if (selectedIndex === correctIndex) {
            feedback.innerHTML = '<div class="feedback-correct">✅ Correct! Well done!</div>';
            this.player.stats.perfectScores++;
        } else {
            feedback.innerHTML = `<div class="feedback-incorrect">❌ Not quite. The correct answer is: ${String.fromCharCode(65 + correctIndex)}</div>`;
        }
        
        // Enable next button
        setTimeout(() => {
            const nextBtn = document.getElementById('lessonNextBtn');
            if (nextBtn) nextBtn.disabled = false;
        }, 1000);
    },
    
    /**
     * Update checklist progress
     */
    updateChecklistProgress() {
        const checkboxes = document.querySelectorAll('.checklist-item input');
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        
        // Update progress bar
        const progressFill = document.getElementById('lessonProgressFill');
        if (progressFill) {
            progressFill.style.width = `${(checked / total) * 100}%`;
        }
        
        // If all checked, enable completion
        if (checked === total) {
            const nextBtn = document.getElementById('lessonNextBtn');
            if (nextBtn) {
                nextBtn.textContent = 'Complete Lesson ✓';
                nextBtn.classList.add('complete');
            }
        }
    },
    
    /**
     * Update slider tool value
     */
    updateToolValue(value) {
        const display = document.getElementById('sliderValue');
        if (display) display.textContent = value;
    },
    
    /**
     * Focus on a hotspot in 3D view
     */
    focusHotspot(index) {
        console.log(`Focusing on hotspot ${index}`);
        this.showNotification(`🔍 Focusing on hotspot ${index + 1}`, 'info');
    },
    
    /**
     * Start practice exercise
     */
    startPractice(exerciseId) {
        console.log(`Starting practice: ${exerciseId}`);
        this.showNotification('🎯 Practice mode starting...', 'info');
        // In full implementation, this would launch an interactive exercise
    },
    
    /**
     * Navigate to next section
     */
    nextSection() {
        if (!this.currentLesson) return;
        
        const course = this.courses[this.currentLesson.courseId];
        const lesson = course?.lessons.find(l => l.id === this.currentLesson.lessonId);
        if (!lesson) return;
        
        this.currentLesson.currentSection++;
        const totalSections = this.getLessonSectionCount(lesson);
        
        // Update progress
        const progress = Math.min(100, ((this.currentLesson.currentSection + 1) / totalSections) * 100);
        const progressFill = document.getElementById('lessonProgressFill');
        const progressText = document.getElementById('lessonProgressText');
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `Section ${Math.min(this.currentLesson.currentSection + 1, totalSections)} of ${totalSections}`;
        
        // Render new content
        const body = document.getElementById('lessonBody');
        if (body) {
            body.innerHTML = this.renderLessonContent(lesson, this.currentLesson.currentSection);
        }
        
        // Update nav buttons
        const prevBtn = document.getElementById('lessonPrevBtn');
        const nextBtn = document.getElementById('lessonNextBtn');
        if (prevBtn) prevBtn.disabled = this.currentLesson.currentSection === 0;
        if (nextBtn && this.currentLesson.currentSection >= totalSections) {
            nextBtn.textContent = 'Complete Lesson ✓';
            nextBtn.onclick = () => this.finishLesson();
        }
    },
    
    /**
     * Navigate to previous section
     */
    previousSection() {
        if (!this.currentLesson || this.currentLesson.currentSection === 0) return;
        
        const course = this.courses[this.currentLesson.courseId];
        const lesson = course?.lessons.find(l => l.id === this.currentLesson.lessonId);
        if (!lesson) return;
        
        this.currentLesson.currentSection--;
        const totalSections = this.getLessonSectionCount(lesson);
        
        // Update progress
        const progress = ((this.currentLesson.currentSection + 1) / totalSections) * 100;
        const progressFill = document.getElementById('lessonProgressFill');
        const progressText = document.getElementById('lessonProgressText');
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `Section ${this.currentLesson.currentSection + 1} of ${totalSections}`;
        
        // Render new content
        const body = document.getElementById('lessonBody');
        if (body) {
            body.innerHTML = this.renderLessonContent(lesson, this.currentLesson.currentSection);
        }
        
        // Update nav buttons
        const prevBtn = document.getElementById('lessonPrevBtn');
        const nextBtn = document.getElementById('lessonNextBtn');
        if (prevBtn) prevBtn.disabled = this.currentLesson.currentSection === 0;
        if (nextBtn) {
            nextBtn.textContent = 'Next →';
            nextBtn.onclick = () => this.nextSection();
        }
    },
    
    /**
     * Exit lesson without completing
     */
    exitLesson(courseId) {
        if (confirm('Are you sure you want to exit? Your progress in this lesson will not be saved.')) {
            this.currentLesson = null;
            this.openCourse(courseId);
        }
    },
    
    /**
     * Finish and complete the lesson
     */
    finishLesson() {
        if (!this.currentLesson) return;
        
        const { courseId, lessonId, startTime } = this.currentLesson;
        const timeSpent = Date.now() - startTime;
        
        console.log(`✅ Lesson completed in ${Math.round(timeSpent / 1000)}s`);
        
        // Complete the lesson and grant rewards
        const result = this.completeLesson(courseId, lessonId);
        
        // Grant contribution rewards if system available
        if (window.ContributionRewardsSystem) {
            window.ContributionRewardsSystem.grantReward('LESSON_COMPLETE', 1, {
                courseId: courseId,
                lessonId: lessonId,
                timeSpent: timeSpent
            });
        }
        
        // Clear current lesson and return to course
        this.currentLesson = null;
        this.openCourse(courseId);
    },
    
    /**
     * Inject lesson viewer styles
     */
    injectLessonStyles() {
        if (document.getElementById('lesson-viewer-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'lesson-viewer-styles';
        styles.textContent = `
            .lesson-viewer {
                background: linear-gradient(135deg, #1a1f3a 0%, #0d1117 100%);
                border-radius: 16px;
                padding: 24px;
                min-height: 500px;
                display: flex;
                flex-direction: column;
            }
            
            .lesson-header {
                margin-bottom: 24px;
            }
            
            .lesson-title-bar {
                display: flex;
                align-items: center;
                gap: 16px;
                margin: 16px 0;
            }
            
            .lesson-title-bar h2 {
                margin: 0;
                color: #fff;
                flex: 1;
            }
            
            .lesson-duration, .lesson-reward {
                background: rgba(100, 255, 218, 0.1);
                padding: 8px 16px;
                border-radius: 20px;
                color: #64ffda;
                font-size: 14px;
            }
            
            .lesson-progress {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .lesson-progress .progress-bar {
                flex: 1;
                height: 8px;
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .lesson-progress .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #64ffda, #9f7aea);
                transition: width 0.3s ease;
            }
            
            .lesson-body {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 24px 0;
            }
            
            .section-card {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(100, 255, 218, 0.2);
                border-radius: 16px;
                padding: 32px;
                max-width: 700px;
                width: 100%;
                text-align: center;
            }
            
            .section-number {
                color: #64ffda;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 16px;
            }
            
            .section-content p {
                color: #e6edf3;
                font-size: 18px;
                line-height: 1.8;
            }
            
            .quiz-icon, .section-icon, .completion-icon, .practice-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            
            .quiz-question {
                color: #fff;
                font-size: 20px;
                margin-bottom: 24px;
            }
            
            .quiz-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .quiz-option {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px 20px;
                background: rgba(255,255,255,0.05);
                border: 2px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                color: #fff;
                cursor: pointer;
                transition: all 0.2s;
                text-align: left;
            }
            
            .quiz-option:hover:not(:disabled) {
                background: rgba(100, 255, 218, 0.1);
                border-color: #64ffda;
            }
            
            .quiz-option.correct {
                background: rgba(16, 185, 129, 0.2);
                border-color: #10b981;
            }
            
            .quiz-option.incorrect {
                background: rgba(239, 68, 68, 0.2);
                border-color: #ef4444;
            }
            
            .option-letter {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(100, 255, 218, 0.2);
                border-radius: 50%;
                font-weight: bold;
                color: #64ffda;
            }
            
            .quiz-feedback {
                margin-top: 16px;
                padding: 16px;
                border-radius: 12px;
            }
            
            .feedback-correct {
                color: #10b981;
                font-size: 18px;
            }
            
            .feedback-incorrect {
                color: #ef4444;
                font-size: 18px;
            }
            
            .lesson-nav {
                display: flex;
                justify-content: space-between;
                padding-top: 24px;
                border-top: 1px solid rgba(255,255,255,0.1);
            }
            
            .nav-btn {
                padding: 12px 32px;
                border-radius: 12px;
                border: 2px solid rgba(100, 255, 218, 0.3);
                background: transparent;
                color: #64ffda;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .nav-btn:hover:not(:disabled) {
                background: rgba(100, 255, 218, 0.1);
            }
            
            .nav-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            
            .nav-btn.primary {
                background: linear-gradient(135deg, #64ffda, #9f7aea);
                color: #1a1f3a;
                border: none;
                font-weight: bold;
            }
            
            .nav-btn.complete {
                background: linear-gradient(135deg, #10b981, #064e3b);
                animation: pulse 1.5s infinite;
            }
            
            .complete-btn {
                padding: 16px 48px;
                background: linear-gradient(135deg, #ffd700, #ffb347);
                border: none;
                border-radius: 12px;
                color: #1a1f3a;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 24px;
                transition: transform 0.2s;
            }
            
            .complete-btn:hover {
                transform: scale(1.05);
            }
            
            .completion-rewards {
                display: flex;
                justify-content: center;
                gap: 24px;
                margin: 24px 0;
            }
            
            .reward-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 24px;
                background: rgba(255, 215, 0, 0.1);
                border-radius: 20px;
            }
            
            .reward-icon {
                font-size: 24px;
            }
            
            .reward-value {
                color: #ffd700;
                font-weight: bold;
                font-size: 18px;
            }
            
            /* Checklist styles */
            .checklist-items {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin: 24px 0;
                text-align: left;
            }
            
            .checklist-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                cursor: pointer;
            }
            
            .checklist-item input {
                width: 20px;
                height: 20px;
                accent-color: #64ffda;
            }
            
            .checklist-text {
                color: #e6edf3;
            }
            
            /* Step styles */
            .step-header {
                margin-bottom: 24px;
            }
            
            .step-content {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            
            .step-image-placeholder {
                background: rgba(100, 255, 218, 0.05);
                border: 2px dashed rgba(100, 255, 218, 0.3);
                padding: 48px;
                border-radius: 12px;
            }
            
            .step-icon {
                font-size: 48px;
                margin-bottom: 8px;
            }
            
            .step-description {
                color: #e6edf3;
                font-size: 16px;
                line-height: 1.6;
            }
            
            /* Gallery styles */
            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
                margin-top: 24px;
            }
            
            .gallery-item {
                background: rgba(255,255,255,0.05);
                padding: 16px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .gallery-icon {
                font-size: 32px;
                margin-bottom: 8px;
            }
            
            /* Hotspot styles */
            .hotspots-list {
                margin-top: 24px;
                text-align: left;
            }
            
            .hotspot-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .hotspot-item:hover {
                background: rgba(100, 255, 218, 0.1);
            }
            
            .hotspot-marker {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #64ffda;
                color: #1a1f3a;
                border-radius: 50%;
                font-weight: bold;
                font-size: 12px;
            }
            
            .practice-btn {
                padding: 16px 32px;
                background: linear-gradient(135deg, #9f7aea, #64ffda);
                border: none;
                border-radius: 12px;
                color: #fff;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 24px;
            }
            
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                50% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
            }
        `;
        document.head.appendChild(styles);
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GemBotAcademy.init());
} else {
    GemBotAcademy.init();
}

// Export
window.GemBotAcademy = GemBotAcademy;
