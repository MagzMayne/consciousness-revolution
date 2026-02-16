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
 * File: gemlords-academy-bridge.js
 * Declaration ID: IP-6DCBC0F-MLL28ZUY
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMLORDS ACADEMY BRIDGE
 * ═══════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick / Barbrick Design - ALL RIGHTS RESERVED
 * 
 * Connects GemBot Academy learning progress to GemLords job qualifications
 * Tracks certifications, skill progression, and job readiness status
 * ═══════════════════════════════════════════════════════════════════════════
 */

class GemLordsAcademyBridge {
    constructor() {
        this.version = '1.0.0';
        
        // Certification requirements mapped to academy courses
        this.CERTIFICATIONS = {
            'Basic Lapidary': {
                requiredCourses: ['basics'],
                requiredLessons: ['intro_gemstones', 'machine_overview', 'safety_first'],
                unlocks: ['Cabochon', 'Basic Polish', 'Simple Grinding'],
                badge: '🎓 Basic Lapidary Certified',
                description: 'Qualified for basic gemstone cutting and polishing tasks'
            },
            'Faceting Fundamentals': {
                requiredCourses: ['basics', 'cutting_fundamentals'],
                requiredLessons: ['intro_gemstones', 'machine_overview', 'safety_first', 'facet_angles', 'sequence'],
                unlocks: ['Faceted Round', 'Oval Cut', 'Step Cut', 'Table Cutting'],
                badge: '💎 Faceting Fundamentals Certified',
                description: 'Qualified for standard faceted gemstone cutting'
            },
            'Polish Master': {
                requiredCourses: ['basics', 'cutting_fundamentals', 'polishing_mastery'],
                requiredLessons: ['polish_compounds', 'lap_speed', 'mirror_polish'],
                unlocks: ['High Polish', 'Mirror Finish', 'Premium Stone Finishing'],
                badge: '✨ Polish Master Certified',
                description: 'Expert-level polishing and finishing skills'
            },
            'Advanced Designer': {
                requiredCourses: ['basics', 'cutting_fundamentals', 'polishing_mastery', 'advanced_designs'],
                requiredLessons: ['custom_faceting', 'fancy_shapes', 'fantasy_cuts'],
                unlocks: ['Custom Facets', 'Fantasy Cuts', 'Precision Work', 'Complex Designs'],
                badge: '🎨 Advanced Designer Certified',
                description: 'Master-level custom and fantasy cut design'
            }
        };
        
        // Skill progression tracking
        this.SKILL_CATEGORIES = {
            'Gemstone Knowledge': ['intro_gemstones', 'gem_properties', 'stone_identification'],
            'Machine Operation': ['machine_overview', 'motor_control', 'precision_positioning'],
            'Safety & Maintenance': ['safety_first', 'machine_maintenance', 'troubleshooting'],
            'Cutting Techniques': ['facet_angles', 'sequence', 'table_size', 'girdle_formation'],
            'Polishing Skills': ['polish_compounds', 'lap_speed', 'scratch_removal', 'mirror_polish'],
            'Advanced Design': ['fancy_shapes', 'custom_faceting', 'fantasy_cuts', 'concave_cutting']
        };
        
        console.log('🎓 GemLords Academy Bridge initialized');
    }
    
    /**
     * Check if student has completed specific certification
     */
    hasCertification(username, certName) {
        if (!window.GemBotAcademy) return false;
        
        const cert = this.CERTIFICATIONS[certName];
        if (!cert) return false;
        
        const academy = window.GemBotAcademy;
        const player = academy.player;
        
        // Check if all required courses are unlocked
        const hasRequiredCourses = cert.requiredCourses.every(course => 
            player.unlockedCourses?.includes(course)
        );
        
        // Check if all required lessons are completed
        const hasRequiredLessons = cert.requiredLessons.every(lesson =>
            player.completedLessons?.includes(lesson)
        );
        
        return hasRequiredCourses && hasRequiredLessons;
    }
    
    /**
     * Get all earned certifications for a student
     */
    getEarnedCertifications(username) {
        const earned = [];
        
        for (const [certName, certData] of Object.entries(this.CERTIFICATIONS)) {
            if (this.hasCertification(username, certName)) {
                earned.push({
                    name: certName,
                    badge: certData.badge,
                    description: certData.description,
                    unlocks: certData.unlocks,
                    earnedDate: this.getCertificationEarnDate(username, certName)
                });
            }
        }
        
        return earned;
    }
    
    /**
     * Get certification earn date (approximate based on last completed lesson)
     */
    getCertificationEarnDate(username, certName) {
        const cert = this.CERTIFICATIONS[certName];
        const lessonHistory = JSON.parse(localStorage.getItem(`lesson_history_${username}`) || '{}');
        
        let latestDate = null;
        cert.requiredLessons.forEach(lesson => {
            if (lessonHistory[lesson]) {
                const date = new Date(lessonHistory[lesson]);
                if (!latestDate || date > latestDate) {
                    latestDate = date;
                }
            }
        });
        
        return latestDate ? latestDate.toISOString() : new Date().toISOString();
    }
    
    /**
     * Get next certification to work towards
     */
    getNextCertification(username) {
        const certOrder = ['Basic Lapidary', 'Faceting Fundamentals', 'Polish Master', 'Advanced Designer'];
        
        for (const certName of certOrder) {
            if (!this.hasCertification(username, certName)) {
                return {
                    name: certName,
                    ...this.CERTIFICATIONS[certName],
                    progress: this.getCertificationProgress(username, certName)
                };
            }
        }
        
        return null; // All certifications earned
    }
    
    /**
     * Calculate progress towards a certification
     */
    getCertificationProgress(username, certName) {
        if (!window.GemBotAcademy) return 0;
        
        const cert = this.CERTIFICATIONS[certName];
        const academy = window.GemBotAcademy;
        const player = academy.player;
        
        let completed = 0;
        let total = cert.requiredCourses.length + cert.requiredLessons.length;
        
        // Count completed courses
        cert.requiredCourses.forEach(course => {
            if (player.unlockedCourses?.includes(course)) completed++;
        });
        
        // Count completed lessons
        cert.requiredLessons.forEach(lesson => {
            if (player.completedLessons?.includes(lesson)) completed++;
        });
        
        return {
            completed,
            total,
            percentage: Math.round((completed / total) * 100)
        };
    }
    
    /**
     * Get skill proficiency in each category
     */
    getSkillProficiency(username) {
        if (!window.GemBotAcademy) return {};
        
        const academy = window.GemBotAcademy;
        const player = academy.player;
        const proficiency = {};
        
        for (const [category, lessons] of Object.entries(this.SKILL_CATEGORIES)) {
            const completed = lessons.filter(lesson => 
                player.completedLessons?.includes(lesson)
            ).length;
            
            proficiency[category] = {
                completed,
                total: lessons.length,
                percentage: Math.round((completed / lessons.length) * 100),
                level: this.getSkillLevel(completed, lessons.length)
            };
        }
        
        return proficiency;
    }
    
    /**
     * Determine skill level based on completion
     */
    getSkillLevel(completed, total) {
        const percentage = (completed / total) * 100;
        
        if (percentage >= 90) return 'Expert';
        if (percentage >= 70) return 'Advanced';
        if (percentage >= 50) return 'Intermediate';
        if (percentage >= 25) return 'Beginner';
        return 'Novice';
    }
    
    /**
     * Get all unlocked job types based on certifications
     */
    getUnlockedJobTypes(username) {
        const unlocked = new Set();
        
        for (const [certName, certData] of Object.entries(this.CERTIFICATIONS)) {
            if (this.hasCertification(username, certName)) {
                certData.unlocks.forEach(jobType => unlocked.add(jobType));
            }
        }
        
        return Array.from(unlocked);
    }
    
    /**
     * Check if ready for specific job type
     */
    isReadyForJobType(username, jobType) {
        const unlockedTypes = this.getUnlockedJobTypes(username);
        return unlockedTypes.includes(jobType);
    }
    
    /**
     * Award certification when requirements met
     */
    awardCertification(username, certName) {
        if (!this.hasCertification(username, certName)) {
            return false;
        }
        
        const cert = this.CERTIFICATIONS[certName];
        
        // Store certification
        const userCerts = JSON.parse(localStorage.getItem(`certifications_${username}`) || '[]');
        
        if (!userCerts.find(c => c.name === certName)) {
            userCerts.push({
                name: certName,
                badge: cert.badge,
                description: cert.description,
                earnedDate: new Date().toISOString(),
                unlocks: cert.unlocks
            });
            
            localStorage.setItem(`certifications_${username}`, JSON.stringify(userCerts));
            
            // Notify user
            this.showCertificationAward(cert);
            
            // Award XP if academy is available
            if (window.GemBotAcademy && window.GemBotAcademy.awardXP) {
                window.GemBotAcademy.awardXP(500); // Bonus XP for certification
            }
            
            // Notify GemLords integration
            if (window.gemLordsIntegration) {
                window.gemLordsIntegration.awardAchievement(
                    `cert_${certName.toLowerCase().replace(/\s+/g, '_')}`,
                    cert.badge,
                    cert.description
                );
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Show certification award notification
     */
    showCertificationAward(cert) {
        // Create visual notification
        const notification = document.createElement('div');
        notification.className = 'certification-award';
        notification.innerHTML = `
            <div class="cert-award-content">
                <div class="cert-badge">${cert.badge}</div>
                <h3>🎓 Certification Earned!</h3>
                <p>${cert.description}</p>
                <div class="cert-unlocks">
                    <strong>Unlocks:</strong>
                    <ul>
                        ${cert.unlocks.map(unlock => `<li>${unlock}</li>`).join('')}
                    </ul>
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Continue</button>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('cert-award-styles')) {
            const style = document.createElement('style');
            style.id = 'cert-award-styles';
            style.textContent = `
                .certification-award {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.5s;
                }
                
                .cert-award-content {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: 3px solid #FFD700;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 500px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    animation: slideIn 0.5s;
                }
                
                .cert-badge {
                    font-size: 64px;
                    margin-bottom: 16px;
                    animation: bounce 1s infinite;
                }
                
                .cert-award-content h3 {
                    color: white;
                    margin: 16px 0;
                    font-size: 28px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .cert-award-content p {
                    color: rgba(255, 255, 255, 0.9);
                    margin: 16px 0;
                    font-size: 16px;
                }
                
                .cert-unlocks {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
                    text-align: left;
                }
                
                .cert-unlocks strong {
                    color: #FFD700;
                    display: block;
                    margin-bottom: 8px;
                }
                
                .cert-unlocks ul {
                    margin: 0;
                    padding-left: 20px;
                    color: white;
                }
                
                .cert-unlocks li {
                    margin: 4px 0;
                }
                
                .cert-award-content button {
                    background: #FFD700;
                    color: #000;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 16px;
                    transition: transform 0.3s;
                }
                
                .cert-award-content button:hover {
                    transform: scale(1.05);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
    
    /**
     * Check for newly earned certifications
     */
    checkForNewCertifications(username) {
        const newCerts = [];
        
        for (const certName of Object.keys(this.CERTIFICATIONS)) {
            if (this.awardCertification(username, certName)) {
                newCerts.push(certName);
            }
        }
        
        return newCerts;
    }
    
    /**
     * Get learning recommendations for next job qualification
     */
    getLearningRecommendations(username) {
        const nextCert = this.getNextCertification(username);
        
        if (!nextCert) {
            return {
                message: '🎓 You have earned all certifications!',
                recommendations: ['Consider mentoring other students', 'Take on advanced custom jobs', 'Build your professional portfolio']
            };
        }
        
        if (!window.GemBotAcademy) {
            return {
                message: 'Complete academy lessons to earn certifications',
                recommendations: []
            };
        }
        
        const academy = window.GemBotAcademy;
        const player = academy.player;
        const recommendations = [];
        
        // Find incomplete required courses
        nextCert.requiredCourses.forEach(course => {
            if (!player.unlockedCourses?.includes(course)) {
                const courseData = academy.courses[course];
                if (courseData) {
                    recommendations.push(`📚 Complete course: ${courseData.name}`);
                }
            }
        });
        
        // Find incomplete required lessons
        nextCert.requiredLessons.forEach(lesson => {
            if (!player.completedLessons?.includes(lesson)) {
                recommendations.push(`📖 Complete lesson: ${lesson.replace(/_/g, ' ')}`);
            }
        });
        
        return {
            message: `Working towards: ${nextCert.badge}`,
            progress: nextCert.progress,
            recommendations: recommendations.slice(0, 5), // Top 5 recommendations
            unlocks: nextCert.unlocks
        };
    }
    
    /**
     * Generate professional student profile for job applications
     */
    generateStudentProfile(username) {
        const certifications = this.getEarnedCertifications(username);
        const proficiency = this.getSkillProficiency(username);
        const unlockedJobs = this.getUnlockedJobTypes(username);
        const recommendations = this.getLearningRecommendations(username);
        
        return {
            username,
            certifications,
            skillProficiency: proficiency,
            qualifiedJobTypes: unlockedJobs,
            nextGoal: recommendations,
            profileCompleteness: this.calculateProfileCompleteness(certifications, proficiency),
            readyForWork: certifications.length > 0
        };
    }
    
    /**
     * Calculate profile completeness percentage
     */
    calculateProfileCompleteness(certifications, proficiency) {
        const totalCerts = Object.keys(this.CERTIFICATIONS).length;
        const earnedCerts = certifications.length;
        const certProgress = (earnedCerts / totalCerts) * 100;
        
        const totalSkills = Object.keys(this.SKILL_CATEGORIES).length;
        const avgSkillProgress = Object.values(proficiency).reduce((sum, skill) => 
            sum + skill.percentage, 0) / totalSkills;
        
        return Math.round((certProgress * 0.6) + (avgSkillProgress * 0.4));
    }
}

// Initialize global instance
window.gemLordsAcademyBridge = new GemLordsAcademyBridge();

// Auto-check for certifications when lessons are completed
if (window.GemBotAcademy) {
    // Hook into lesson completion
    const originalCompleteLesson = window.GemBotAcademy.completeLesson;
    
    if (originalCompleteLesson) {
        window.GemBotAcademy.completeLesson = function(...args) {
            // Call original method
            const result = originalCompleteLesson.apply(this, args);
            
            // Check for new certifications
            const username = window.gemLordsIntegration?.getCurrentUsername() || 'Guest';
            setTimeout(() => {
                window.gemLordsAcademyBridge.checkForNewCertifications(username);
            }, 1000);
            
            return result;
        };
    }
}

console.log('🎓 GemLords Academy Bridge loaded');
