/**
 * Holiday Animations System
 * Autonomous Easter eggs that bring joy to all pages
 * Detects holidays and displays appropriate animations
 */

class HolidayAnimations {
    constructor() {
        this.currentDate = new Date();
        this.animations = [];
        this.init();
    }

    init() {
        const holiday = this.detectHoliday();
        if (holiday) {
            this.startAnimation(holiday);
        }
    }

    detectHoliday() {
        const month = this.currentDate.getMonth() + 1; // 1-12
        const day = this.currentDate.getDate();

        // Valentine's Day - February 14
        if (month === 2 && day === 14) {
            return 'valentines';
        }

        // Valentine's Week - Feb 13-15
        if (month === 2 && day >= 13 && day <= 15) {
            return 'valentines';
        }

        // New Year - January 1
        if (month === 1 && day === 1) {
            return 'newyear';
        }

        // Halloween - October 31
        if (month === 10 && day === 31) {
            return 'halloween';
        }

        // Halloween Week - Oct 29-31
        if (month === 10 && day >= 29 && day <= 31) {
            return 'halloween';
        }

        // Christmas - December 25
        if (month === 12 && day === 25) {
            return 'christmas';
        }

        // Christmas Week - Dec 23-26
        if (month === 12 && day >= 23 && day <= 26) {
            return 'christmas';
        }

        // Independence Day (US) - July 4
        if (month === 7 && day === 4) {
            return 'july4th';
        }

        // St. Patrick's Day - March 17
        if (month === 3 && day === 17) {
            return 'stpatricks';
        }

        return null;
    }

    startAnimation(holiday) {
        switch (holiday) {
            case 'valentines':
                this.valentinesAnimation();
                break;
            case 'newyear':
                this.newYearAnimation();
                break;
            case 'halloween':
                this.halloweenAnimation();
                break;
            case 'christmas':
                this.christmasAnimation();
                break;
            case 'july4th':
                this.july4thAnimation();
                break;
            case 'stpatricks':
                this.stPatricksAnimation();
                break;
        }
    }

    valentinesAnimation() {
        // Create container for hearts
        const container = this.createContainer('holiday-hearts');
        
        // Create 15 hearts with random properties
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createHeart(container);
            }, i * 800); // Stagger creation
        }

        // Keep creating new hearts periodically
        setInterval(() => {
            this.createHeart(container);
        }, 3000);
    }

    createHeart(container) {
        const heart = document.createElement('div');
        heart.className = 'holiday-heart';
        heart.innerHTML = '❤️';
        
        // Random horizontal position
        heart.style.left = Math.random() * 100 + '%';
        
        // Random size
        const size = 20 + Math.random() * 30;
        heart.style.fontSize = size + 'px';
        
        // Random animation duration
        const duration = 8 + Math.random() * 6;
        heart.style.animationDuration = duration + 's';
        
        // Random delay
        heart.style.animationDelay = Math.random() * 2 + 's';
        
        // Random horizontal drift
        const drift = -50 + Math.random() * 100;
        heart.style.setProperty('--drift', drift + 'px');
        
        container.appendChild(heart);
        
        // Remove heart after animation completes
        setTimeout(() => {
            heart.remove();
        }, (duration + 2) * 1000);
    }

    newYearAnimation() {
        const container = this.createContainer('holiday-confetti');
        
        // Create confetti burst
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfetti(container);
            }, i * 50);
        }

        // Continue creating confetti periodically
        setInterval(() => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    this.createConfetti(container);
                }, i * 100);
            }
        }, 5000);
    }

    createConfetti(container) {
        const confetti = document.createElement('div');
        confetti.className = 'holiday-confetti';
        
        const colors = ['#FFD700', '#FF69B4', '#00D4FF', '#9370DB', '#32CD32'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDuration = (2 + Math.random() * 3) + 's';
        confetti.style.animationDelay = Math.random() + 's';
        
        container.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }

    halloweenAnimation() {
        const container = this.createContainer('holiday-halloween');
        
        // Create floating ghosts and pumpkins
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createHalloweenElement(container);
            }, i * 1500);
        }

        setInterval(() => {
            this.createHalloweenElement(container);
        }, 4000);
    }

    createHalloweenElement(container) {
        const element = document.createElement('div');
        element.className = 'holiday-halloween-element';
        
        const icons = ['👻', '🎃', '🦇', '🕷️'];
        element.innerHTML = icons[Math.floor(Math.random() * icons.length)];
        
        element.style.left = Math.random() * 100 + '%';
        element.style.fontSize = (25 + Math.random() * 25) + 'px';
        element.style.animationDuration = (10 + Math.random() * 8) + 's';
        
        container.appendChild(element);
        
        setTimeout(() => element.remove(), 20000);
    }

    christmasAnimation() {
        const container = this.createContainer('holiday-snowflakes');
        
        // Create snowflakes
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createSnowflake(container);
            }, i * 500);
        }

        setInterval(() => {
            this.createSnowflake(container);
        }, 2000);
    }

    createSnowflake(container) {
        const snowflake = document.createElement('div');
        snowflake.className = 'holiday-snowflake';
        
        const snowIcons = ['❄️', '❅', '❆'];
        snowflake.innerHTML = snowIcons[Math.floor(Math.random() * snowIcons.length)];
        
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.fontSize = (15 + Math.random() * 20) + 'px';
        snowflake.style.animationDuration = (8 + Math.random() * 8) + 's';
        snowflake.style.opacity = 0.6 + Math.random() * 0.4;
        
        const drift = -30 + Math.random() * 60;
        snowflake.style.setProperty('--drift', drift + 'px');
        
        container.appendChild(snowflake);
        
        setTimeout(() => snowflake.remove(), 18000);
    }

    july4thAnimation() {
        const container = this.createContainer('holiday-fireworks');
        
        // Create firework bursts
        setInterval(() => {
            this.createFirework(container);
        }, 2000);
        
        // Initial burst
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createFirework(container);
            }, i * 800);
        }
    }

    createFirework(container) {
        const firework = document.createElement('div');
        firework.className = 'holiday-firework';
        firework.innerHTML = '✨';
        
        const colors = ['#FF0000', '#FFFFFF', '#0000FF', '#FFD700'];
        firework.style.color = colors[Math.floor(Math.random() * colors.length)];
        firework.style.left = (20 + Math.random() * 60) + '%';
        firework.style.top = (20 + Math.random() * 40) + '%';
        firework.style.fontSize = (30 + Math.random() * 30) + 'px';
        
        container.appendChild(firework);
        
        setTimeout(() => firework.remove(), 2000);
    }

    stPatricksAnimation() {
        const container = this.createContainer('holiday-shamrocks');
        
        // Create floating shamrocks
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                this.createShamrock(container);
            }, i * 1000);
        }

        setInterval(() => {
            this.createShamrock(container);
        }, 3500);
    }

    createShamrock(container) {
        const shamrock = document.createElement('div');
        shamrock.className = 'holiday-shamrock';
        shamrock.innerHTML = '☘️';
        
        shamrock.style.left = Math.random() * 100 + '%';
        shamrock.style.fontSize = (20 + Math.random() * 25) + 'px';
        shamrock.style.animationDuration = (8 + Math.random() * 6) + 's';
        
        const drift = -40 + Math.random() * 80;
        shamrock.style.setProperty('--drift', drift + 'px');
        
        container.appendChild(shamrock);
        
        setTimeout(() => shamrock.remove(), 16000);
    }

    createContainer(className) {
        let container = document.getElementById(className);
        if (!container) {
            container = document.createElement('div');
            container.id = className;
            container.className = 'holiday-animation-container';
            document.body.appendChild(container);
        }
        return container;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HolidayAnimations();
    });
} else {
    new HolidayAnimations();
}
