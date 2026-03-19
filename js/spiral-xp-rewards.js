// RootIB: RB-20260319142113-D615E070
/**
 * SPIRAL XP REWARDS SYSTEM
 * Award XP for user actions
 *
 * Usage:
 *   <button onclick="SpiralRewards.awardXP('reality', 'task_complete', 100)">
 *     Complete Task (+100 XP)
 *   </button>
 */

const SpiralRewards = {
  // XP values for different actions
  XP_VALUES: {
    // Workshop actions
    'workshop_visit': 10,
    'exercise_start': 25,
    'exercise_complete': 100,
    'daily_ritual': 50,
    'streak_day': 25,

    // Store actions
    'item_view': 5,
    'item_purchase': 200,

    // Levels/Progression
    'level_view': 10,
    'phase_complete': 500,
    'milestone_reached': 1000,

    // Social/Engagement
    'share_content': 50,
    'invite_friend': 300,
    'feedback_submit': 75,

    // Quests/Challenges
    'quest_accept': 25,
    'quest_progress': 50,
    'quest_complete': 250,
    'challenge_complete': 500,

    // Special
    'cheat_code': 0, // Variable based on code
    'bonus_reward': 100,
    'daily_login': 50,
    'first_time': 150
  },

  /**
   * Award XP to user
   * @param {string} forgeSlug - Which forge to award XP to
   * @param {string} actionType - Type of action (from XP_VALUES)
   * @param {number} customAmount - Override XP amount (optional)
   * @param {object} metadata - Additional data to track
   */
  async awardXP(forgeSlug, actionType, customAmount = null, metadata = {}) {
    const userId = this.getUserId();
    if (!userId) {
      console.warn('No user ID found. XP not awarded.');
      return null;
    }

    const amount = customAmount || this.XP_VALUES[actionType] || 0;
    if (amount === 0) {
      console.warn(`No XP value for action: ${actionType}`);
      return null;
    }

    try {
      const result = await SpiralEngine.addXP(
        userId,
        forgeSlug,
        amount,
        actionType,
        {
          ...metadata,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        }
      );

      if (result.success) {
        this.showXPNotification(amount, forgeSlug);

        if (result.data.leveled_up) {
          const forgeInfo = SpiralEngine.FORGE_DATA[forgeSlug] || {};
          SpiralEngine.showLevelUpNotification(forgeInfo.name, result.data.new_level);
        }

        return result.data;
      } else {
        console.error('Failed to award XP:', result.error);
        return null;
      }
    } catch (error) {
      console.error('XP award error:', error);
      return null;
    }
  },

  /**
   * Get current user ID from localStorage
   */
  getUserId() {
    return localStorage.getItem('spiralUserId')
        || localStorage.getItem('userEmail')
        || null;
  },

  /**
   * Set current user ID
   */
  setUserId(userId) {
    localStorage.setItem('spiralUserId', userId);
  },

  /**
   * Show floating XP notification
   */
  showXPNotification(amount, forgeSlug) {
    const forgeInfo = SpiralEngine.FORGE_DATA[forgeSlug] || {};

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, ${forgeInfo.color || '#667eea'}, rgba(0,0,0,0.9));
      color: white;
      padding: 15px 25px;
      border-radius: 12px;
      font-size: 1.2rem;
      font-weight: bold;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.5s;
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    notification.innerHTML = `
      <span style="font-size: 1.5rem;">${forgeInfo.icon || '⚡'}</span>
      <span>+${amount} XP</span>
    `;

    // Add animation styles if not already present
    if (!document.getElementById('spiral-xp-animations')) {
      const style = document.createElement('style');
      style.id = 'spiral-xp-animations';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  },

  /**
   * Track page visit (auto-award XP)
   */
  async trackPageVisit(forgeSlug) {
    const visitKey = `spiral_visit_${forgeSlug}_${new Date().toDateString()}`;

    // Only award once per day
    if (localStorage.getItem(visitKey)) {
      return;
    }

    const result = await this.awardXP(forgeSlug, 'workshop_visit');
    if (result) {
      localStorage.setItem(visitKey, 'true');
    }
  },

  /**
   * Track daily login streak
   */
  async trackDailyLogin() {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('spiral_last_login');

    if (lastLogin === today) {
      return; // Already logged in today
    }

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isStreak = lastLogin === yesterday.toDateString();

    let streak = parseInt(localStorage.getItem('spiral_streak') || '0');
    if (isStreak) {
      streak++;
    } else {
      streak = 1;
    }

    localStorage.setItem('spiral_last_login', today);
    localStorage.setItem('spiral_streak', streak.toString());

    // Award XP to Reality Forge (main hub)
    await this.awardXP('reality', 'daily_login', null, {
      streak: streak,
      isStreak: isStreak
    });

    // Bonus for streak milestones
    if (streak % 7 === 0) {
      await this.awardXP('reality', 'milestone_reached', 500, {
        type: 'weekly_streak',
        streak: streak
      });
    }
  },

  /**
   * Create action button with XP reward
   * Returns HTML string for a button that awards XP
   */
  createActionButton(label, forgeSlug, actionType, xpAmount = null) {
    const xp = xpAmount || this.XP_VALUES[actionType] || 0;
    const forgeInfo = SpiralEngine.FORGE_DATA[forgeSlug] || {};

    return `
      <button
        onclick="SpiralRewards.awardXP('${forgeSlug}', '${actionType}', ${xpAmount})"
        style="
          background: linear-gradient(135deg, ${forgeInfo.color}, rgba(0,0,0,0.8));
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        "
        onmouseover="this.style.transform='translateY(-2px)'"
        onmouseout="this.style.transform='translateY(0)'"
      >
        <span>${forgeInfo.icon || '⚡'}</span>
        <span>${label}</span>
        <span style="opacity: 0.7; font-size: 0.85rem;">(+${xp} XP)</span>
      </button>
    `;
  },

  /**
   * Initialize rewards system on page load
   * Call this in your page's DOMContentLoaded event
   */
  async init(forgeSlug = null) {
    // Track daily login
    await this.trackDailyLogin();

    // Track page visit if forge specified
    if (forgeSlug) {
      await this.trackPageVisit(forgeSlug);
    }
  }
};

// Make globally available
if (typeof window !== 'undefined') {
  window.SpiralRewards = SpiralRewards;
}

// Auto-init on load if user is logged in
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    if (SpiralRewards.getUserId()) {
      SpiralRewards.init();
    }
  });
}
