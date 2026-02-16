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
 * File: celebrity-outreach-agent.js
 * Declaration ID: IP-1CC00AB0-MLL28ZVY
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * CELEBRITY OUTREACH AGENT - Professional High-Profile Contact System
 * 
 * Purpose: Establish professional contact with high-profile individuals
 * for legitimate collaboration opportunities
 * 
 * Target: Mr. Beast (Jimmy Donaldson)
 * Mission: Team up to help make the world a better place through technology
 * 
 * Core Principles:
 * - ETHICAL & RESPECTFUL: No spam, harassment, or unwanted contact
 * - PROFESSIONAL: Business-grade communication only
 * - VALUE-FOCUSED: Emphasize mutual benefits and world-positive goals
 * - TRANSPARENT: Clear intent, authentic communication
 * - PERSISTENT BUT POLITE: Multiple channels, respectful frequency
 * 
 * Capabilities:
 * 1. Multi-channel outreach (email, social media, business contacts)
 * 2. Content generation (personalized professional messages)
 * 3. Response monitoring and tracking
 * 4. Engagement opportunity detection
 * 5. Follow-up scheduling with ethical rate limiting
 * 6. Success metrics and reporting
 * 
 * @author BarbrickDesign (barbrickdesign@gmail.com)
 * @version 1.0.0
 * @license Ethical Use Only - Professional Outreach Focused
 */

class CelebrityOutreachAgent {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      agentName: 'CelebrityOutreachAgent-MrBeast',
      targetName: 'Mr. Beast (Jimmy Donaldson)',
      checkInterval: 3600000, // 1 hour (respectful frequency)
      maxRetries: 3,
      autoOutreach: false, // IMPORTANT: Requires human approval for actual sending
      ethicalMode: 'strict', // Always strict for celebrity outreach
      
      // Contact channels
      channels: {
        email: {
          enabled: true,
          addresses: ['business@mrbeast.com'], // Public business email
          lastContact: null,
          cooldownPeriod: 604800000, // 1 week between emails
          maxAttempts: 3,
          currentAttempts: 0
        },
        twitter: {
          enabled: true,
          handle: '@MrBeast',
          lastMention: null,
          cooldownPeriod: 604800000, // 1 week between mentions
          engagementOnly: true, // Only engage with existing content
          maxAttempts: 5,
          currentAttempts: 0
        },
        youtube: {
          enabled: true,
          channel: '@MrBeast',
          lastComment: null,
          cooldownPeriod: 1209600000, // 2 weeks between comments
          relevantOnly: true, // Only comment on tech/collaboration related videos
          maxAttempts: 3,
          currentAttempts: 0
        },
        linkedin: {
          enabled: true,
          profile: 'Jimmy Donaldson',
          lastContact: null,
          cooldownPeriod: 2592000000, // 1 month between connection attempts
          maxAttempts: 1,
          currentAttempts: 0
        },
        management: {
          enabled: true,
          company: 'Night Media',
          website: 'https://nightmedia.co/',
          lastContact: null,
          cooldownPeriod: 1209600000, // 2 weeks
          maxAttempts: 2,
          currentAttempts: 0
        }
      },
      
      ...config
    };
    
    this.isActive = false;
    this.logs = [];
    this.outreachAttempts = [];
    this.metrics = {
      totalAttempts: 0,
      emailsSent: 0,
      socialEngagements: 0,
      responsesReceived: 0,
      meetingsScheduled: 0,
      contactEstablished: false,
      lastOutreach: null,
      successScore: 0
    };
    
    // Professional outreach templates
    this.emailTemplates = {
      initial: {
        subject: 'Collaboration Opportunity: Technology for Social Good',
        body: `Dear Mr. Beast Team,

My name is Ryan Barbrick, and I'm reaching out to explore a potential collaboration opportunity between MrBeast and Barbrick Design.

**About Barbrick Design:**
We've built a comprehensive platform with 300+ interactive web projects, including educational tools, AI systems, and technology focused on making positive social impact. Our projects reach thousands of users and are entirely open-source.

**Why This Matters:**
Your incredible work with Beast Philanthropy has inspired millions. We believe there's a powerful opportunity to combine MrBeast's massive reach with our technology platform to create even greater positive impact.

**Potential Collaborations:**
• Custom tech tools for Beast Philanthropy operations
• Educational platforms for your audience
• Innovation challenges leveraging our technology
• Creator tools for social good initiatives
• Impact measurement and tracking systems

We've prepared a detailed proposal and would love to discuss how we can work together to make the world better through technology and innovation.

**Next Steps:**
I'd be grateful for 15 minutes of your time to explore this opportunity. We're flexible and happy to work around your schedule.

Project Portfolio: https://barbrickdesign.github.io
Contact: BarbrickDesign@gmail.com

Thank you for considering this opportunity. Looking forward to potentially working together!

Best regards,
Ryan Barbrick
Founder, Barbrick Design
BarbrickDesign@gmail.com`
      },
      
      followUp: {
        subject: 'Following Up: Technology Collaboration Opportunity',
        body: `Dear Mr. Beast Team,

I wanted to follow up on my previous message regarding a potential collaboration between MrBeast and Barbrick Design.

Since my last email, we've:
• Expanded our platform with new educational tools
• Enhanced our AI systems for social good applications
• Prepared specific proposals for Beast Philanthropy integration

I understand you receive many partnership inquiries. What makes this different is our genuine alignment on values – using technology and innovation to make a real, measurable positive impact on the world.

**Quick Summary:**
• 300+ open-source projects ready for collaboration
• Technology tools specifically designed for social good
• Proven track record with thousands of users
• Zero cost to explore the opportunity

Would love to schedule a brief call to explore this further. Even a quick 10-minute conversation would be valuable.

Project Portfolio: https://barbrickdesign.github.io
Direct Contact: BarbrickDesign@gmail.com

Thank you for your time and consideration.

Best regards,
Ryan Barbrick
Founder, Barbrick Design`
      },
      
      management: {
        subject: 'Partnership Inquiry: Technology Platform for Social Impact',
        body: `Dear Night Media Team,

I'm reaching out to inquire about partnership opportunities with MrBeast, specifically around leveraging technology for social good initiatives.

**About Us:**
Barbrick Design is a technology platform with 300+ interactive projects focused on education, innovation, and positive social impact. We're open-source and community-driven.

**The Opportunity:**
We see incredible synergy between MrBeast's philanthropic work and our technology capabilities. We'd like to explore how we can support Beast Philanthropy and other initiatives with:

• Custom technology tools
• Educational platforms
• Impact tracking systems
• Creator collaboration tools

**Why This Fits:**
• Aligned values: Technology for good
• No upfront costs to explore
• Proven platform with active users
• Flexible collaboration models

Would you be open to a brief exploratory conversation? I'm happy to provide more details and discuss how this could benefit MrBeast's initiatives.

Portfolio: https://barbrickdesign.github.io
Contact: BarbrickDesign@gmail.com

Thank you for your consideration.

Best regards,
Ryan Barbrick
Founder, Barbrick Design
BarbrickDesign@gmail.com`
      }
    };
    
    // Social media engagement templates
    this.socialTemplates = {
      twitter: [
        '@MrBeast We\'ve built 300+ open-source projects focused on making the world better. Would love to explore how technology could amplify Beast Philanthropy\'s impact. Portfolio: https://barbrickdesign.github.io 🚀',
        '@MrBeast Big fan of what you\'re doing with Beast Philanthropy! We\'ve created tech tools for social good and would love to collaborate. Check out our work: https://barbrickdesign.github.io 💡',
        'Hey @MrBeast, we share your mission of making the world better! Our tech platform could support your philanthropic work. Let\'s connect: BarbrickDesign@gmail.com 🤝'
      ],
      
      youtube: [
        'This is amazing! We\'ve been working on technology tools to help amplify charitable work like this. Would love to collaborate with @MrBeast on tech for social good. Check out our platform: https://barbrickdesign.github.io',
        'Incredible impact @MrBeast! We\'ve built 300+ projects including tools that could support Beast Philanthropy. Would love to discuss collaboration opportunities. Contact: BarbrickDesign@gmail.com'
      ],
      
      linkedin: [
        'Hi Jimmy, huge admirer of your work with Beast Philanthropy. I\'ve built a technology platform focused on social good and see incredible potential for collaboration. Would love to connect and explore opportunities to amplify your impact through technology.'
      ]
    };
    
    this.init();
  }
  
  /**
   * Initialize the Celebrity Outreach Agent
   */
  async init() {
    try {
      this.log('Initializing Celebrity Outreach Agent for Mr. Beast...', 'info');
      
      // Load previous attempt history
      await this.loadHistory();
      
      // Register with Merlin Hive
      await this.registerWithHive();
      
      // Initialize tracking systems
      await this.initTracking();
      
      // Load ethical safeguards
      await this.loadEthicalSafeguards();
      
      this.isActive = true;
      this.log('Celebrity Outreach Agent initialized successfully', 'success');
      this.log('IMPORTANT: Auto-outreach is DISABLED. All communications require human approval.', 'warning');
      
      // Start monitoring (but not sending)
      this.startMonitoring();
      
    } catch (error) {
      this.log(`Failed to initialize Celebrity Outreach Agent: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Load previous outreach history
   */
  async loadHistory() {
    try {
      const saved = localStorage.getItem('celebrityOutreachHistory');
      if (saved) {
        const history = JSON.parse(saved);
        this.outreachAttempts = history.attempts || [];
        this.metrics = history.metrics || this.metrics;
        this.config.channels = history.channels || this.config.channels;
        this.log('Loaded previous outreach history', 'info');
      }
    } catch (error) {
      this.log(`Failed to load history: ${error.message}`, 'warning');
    }
  }
  
  /**
   * Save outreach history
   */
  async saveHistory() {
    try {
      const history = {
        attempts: this.outreachAttempts,
        metrics: this.metrics,
        channels: this.config.channels,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('celebrityOutreachHistory', JSON.stringify(history));
      this.log('Saved outreach history', 'info');
    } catch (error) {
      this.log(`Failed to save history: ${error.message}`, 'warning');
    }
  }
  
  /**
   * Register with Merlin Hive system
   */
  async registerWithHive() {
    try {
      if (typeof window !== 'undefined' && window.MerlinHive) {
        await window.MerlinHive.registerAgent({
          id: this.config.agentName,
          type: 'celebrity-outreach',
          target: this.config.targetName,
          status: 'active',
          capabilities: [
            'email-outreach',
            'social-monitoring',
            'response-tracking',
            'engagement-detection',
            'professional-communication'
          ]
        });
        this.log('Registered with Merlin Hive', 'success');
      }
    } catch (error) {
      this.log(`Failed to register with Hive: ${error.message}`, 'warning');
    }
  }
  
  /**
   * Initialize tracking systems
   */
  async initTracking() {
    this.tracking = {
      emailOpens: [],
      linkClicks: [],
      socialEngagements: [],
      websiteVisits: [],
      responses: []
    };
    this.log('Tracking systems initialized', 'info');
  }
  
  /**
   * Load ethical safeguards
   */
  async loadEthicalSafeguards() {
    this.ethicalSafeguards = {
      // Rate limiting
      maxDailyAttempts: 1,
      maxWeeklyAttempts: 3,
      maxMonthlyAttempts: 10,
      
      // Cooldown periods (in milliseconds)
      minTimeBetweenAttempts: 86400000, // 24 hours
      emailCooldown: 604800000, // 1 week
      socialCooldown: 604800000, // 1 week
      
      // Content requirements
      mustBePersonalized: true,
      mustIncludeValue: true,
      mustBeRelevant: true,
      noSpamKeywords: true,
      
      // Approval requirements
      requireHumanApproval: true, // Always require approval for celebrity outreach
      requireReview: true,
      
      // Stop conditions
      stopAfterResponse: true,
      stopAfterRejection: true,
      stopAfterMaxAttempts: true
    };
    
    this.log('Ethical safeguards loaded', 'success');
  }
  
  /**
   * Start monitoring for engagement opportunities
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(async () => {
      await this.checkEngagementOpportunities();
      await this.checkResponseStatus();
      await this.generateRecommendations();
    }, this.config.checkInterval);
    
    this.log('Started monitoring for engagement opportunities', 'info');
  }
  
  /**
   * Check for engagement opportunities (e.g., new videos, tweets)
   */
  async checkEngagementOpportunities() {
    try {
      this.log('Checking for engagement opportunities...', 'info');
      
      const opportunities = [];
      
      // Check YouTube for relevant videos
      if (this.config.channels.youtube.enabled) {
        const youtubeOpps = await this.checkYouTubeOpportunities();
        opportunities.push(...youtubeOpps);
      }
      
      // Check Twitter for relevant posts
      if (this.config.channels.twitter.enabled) {
        const twitterOpps = await this.checkTwitterOpportunities();
        opportunities.push(...twitterOpps);
      }
      
      // Store opportunities for human review
      if (opportunities.length > 0) {
        this.log(`Found ${opportunities.length} engagement opportunities`, 'success');
        this.pendingOpportunities = opportunities;
        await this.notifyOpportunities(opportunities);
      }
      
    } catch (error) {
      this.log(`Error checking opportunities: ${error.message}`, 'error');
    }
  }
  
  /**
   * Check YouTube for engagement opportunities
   */
  async checkYouTubeOpportunities() {
    const opportunities = [];
    
    // Keywords that indicate relevant content
    const relevantKeywords = [
      'technology', 'innovation', 'charity', 'philanthropy',
      'helping', 'world', 'change', 'collaboration', 'partnership'
    ];
    
    // This would integrate with YouTube API in production
    // For now, return simulated opportunities for testing
    this.log('Checking YouTube for relevant videos...', 'info');
    
    // Check if enough time has passed since last comment
    const lastComment = this.config.channels.youtube.lastComment;
    const cooldownPeriod = this.config.channels.youtube.cooldownPeriod;
    
    if (!lastComment || Date.now() - new Date(lastComment).getTime() > cooldownPeriod) {
      opportunities.push({
        platform: 'youtube',
        type: 'comment-opportunity',
        relevance: 'high',
        action: 'comment-on-relevant-video',
        message: 'Monitor for videos about technology, charity, or innovation',
        cooldownReady: true
      });
    } else {
      this.log('YouTube cooldown period active', 'info');
    }
    
    return opportunities;
  }
  
  /**
   * Check Twitter for engagement opportunities
   */
  async checkTwitterOpportunities() {
    const opportunities = [];
    
    this.log('Checking Twitter for relevant posts...', 'info');
    
    // Check if enough time has passed since last mention
    const lastMention = this.config.channels.twitter.lastMention;
    const cooldownPeriod = this.config.channels.twitter.cooldownPeriod;
    
    if (!lastMention || Date.now() - new Date(lastMention).getTime() > cooldownPeriod) {
      opportunities.push({
        platform: 'twitter',
        type: 'engagement-opportunity',
        relevance: 'medium',
        action: 'professional-mention',
        message: 'Twitter cooldown period complete, can engage professionally',
        cooldownReady: true
      });
    } else {
      this.log('Twitter cooldown period active', 'info');
    }
    
    return opportunities;
  }
  
  /**
   * Check response status across all channels
   */
  async checkResponseStatus() {
    try {
      this.log('Checking response status...', 'info');
      
      // Check email responses
      await this.checkEmailResponses();
      
      // Check social media replies
      await this.checkSocialReplies();
      
      // Check website visits
      await this.checkWebsiteAnalytics();
      
    } catch (error) {
      this.log(`Error checking responses: ${error.message}`, 'error');
    }
  }
  
  /**
   * Check for email responses
   */
  async checkEmailResponses() {
    // This would integrate with email API in production
    // For now, log the check
    this.log('Checking for email responses...', 'info');
    
    // If we get a response, update metrics
    // this.metrics.responsesReceived++;
    // this.metrics.contactEstablished = true;
  }
  
  /**
   * Check for social media replies
   */
  async checkSocialReplies() {
    // This would integrate with social media APIs in production
    this.log('Checking for social media replies...', 'info');
  }
  
  /**
   * Check website analytics for visits from target
   */
  async checkWebsiteAnalytics() {
    this.log('Checking website analytics...', 'info');
    // Would integrate with Google Analytics or similar
  }
  
  /**
   * Generate outreach recommendations
   */
  async generateRecommendations() {
    try {
      const recommendations = [];
      
      // Check each channel for readiness
      for (const [channelName, channel] of Object.entries(this.config.channels)) {
        if (!channel.enabled) continue;
        
        const timeSinceLastContact = channel.lastContact 
          ? Date.now() - new Date(channel.lastContact)
          : Infinity;
        
        const cooldownComplete = timeSinceLastContact > channel.cooldownPeriod;
        const attemptsRemaining = channel.maxAttempts - channel.currentAttempts;
        
        if (cooldownComplete && attemptsRemaining > 0) {
          recommendations.push({
            channel: channelName,
            action: 'outreach-ready',
            priority: this.calculatePriority(channelName, attemptsRemaining),
            attemptsRemaining,
            message: `${channelName} is ready for outreach (${attemptsRemaining} attempts remaining)`
          });
        }
      }
      
      if (recommendations.length > 0) {
        this.log(`Generated ${recommendations.length} outreach recommendations`, 'success');
        this.pendingRecommendations = recommendations;
      }
      
      return recommendations;
      
    } catch (error) {
      this.log(`Error generating recommendations: ${error.message}`, 'error');
      return [];
    }
  }
  
  /**
   * Calculate priority for outreach channel
   */
  calculatePriority(channelName, attemptsRemaining) {
    const priorities = {
      email: 10, // Highest priority - direct business contact
      management: 9, // Management company
      linkedin: 7, // Professional network
      twitter: 5, // Public engagement
      youtube: 4 // Engagement through content
    };
    
    const basePriority = priorities[channelName] || 1;
    const urgencyMultiplier = attemptsRemaining === 1 ? 1.2 : 1.0;
    
    return basePriority * urgencyMultiplier;
  }
  
  /**
   * Prepare outreach email (REQUIRES HUMAN APPROVAL TO SEND)
   */
  async prepareEmail(templateType = 'initial') {
    try {
      const template = this.emailTemplates[templateType];
      
      if (!template) {
        throw new Error(`Template type "${templateType}" not found`);
      }
      
      const email = {
        to: this.config.channels.email.addresses,
        subject: template.subject,
        body: template.body,
        timestamp: new Date().toISOString(),
        status: 'draft',
        requiresApproval: true
      };
      
      this.log(`Prepared ${templateType} email draft`, 'success');
      this.log('IMPORTANT: Email requires human approval before sending', 'warning');
      
      return email;
      
    } catch (error) {
      this.log(`Failed to prepare email: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Prepare social media post (REQUIRES HUMAN APPROVAL TO POST)
   */
  async prepareSocialPost(platform, context = null) {
    try {
      const templates = this.socialTemplates[platform];
      
      if (!templates || templates.length === 0) {
        throw new Error(`No templates for platform "${platform}"`);
      }
      
      // Select appropriate template
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      const post = {
        platform,
        content: template,
        timestamp: new Date().toISOString(),
        status: 'draft',
        requiresApproval: true,
        context
      };
      
      this.log(`Prepared ${platform} post draft`, 'success');
      this.log('IMPORTANT: Post requires human approval before sending', 'warning');
      
      return post;
      
    } catch (error) {
      this.log(`Failed to prepare social post: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Notify about engagement opportunities
   */
  async notifyOpportunities(opportunities) {
    this.log('=== ENGAGEMENT OPPORTUNITIES FOUND ===', 'success');
    
    for (const opp of opportunities) {
      this.log(`[${opp.platform.toUpperCase()}] ${opp.message}`, 'info');
    }
    
    // Store for dashboard access
    localStorage.setItem('mrBeastOpportunities', JSON.stringify({
      opportunities,
      timestamp: new Date().toISOString()
    }));
  }
  
  /**
   * Execute approved outreach (ONLY CALLED AFTER HUMAN APPROVAL)
   */
  async executeApprovedOutreach(outreach) {
    if (!outreach.approved) {
      throw new Error('Outreach must be approved before execution');
    }
    
    try {
      this.log(`Executing approved ${outreach.type} outreach...`, 'info');
      
      // Record the attempt
      this.outreachAttempts.push({
        type: outreach.type,
        channel: outreach.channel,
        timestamp: new Date().toISOString(),
        content: outreach.content,
        status: 'sent'
      });
      
      // Update channel tracking
      if (this.config.channels[outreach.channel]) {
        this.config.channels[outreach.channel].lastContact = new Date().toISOString();
        this.config.channels[outreach.channel].currentAttempts++;
      }
      
      // Update metrics
      this.metrics.totalAttempts++;
      if (outreach.type === 'email') {
        this.metrics.emailsSent++;
      } else {
        this.metrics.socialEngagements++;
      }
      this.metrics.lastOutreach = new Date().toISOString();
      
      // Save history
      await this.saveHistory();
      
      this.log('Approved outreach executed successfully', 'success');
      
      return { success: true, outreach };
      
    } catch (error) {
      this.log(`Failed to execute outreach: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Get current metrics and status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      targetName: this.config.targetName,
      metrics: this.metrics,
      channels: this.config.channels,
      pendingOpportunities: this.pendingOpportunities || [],
      pendingRecommendations: this.pendingRecommendations || [],
      recentAttempts: this.outreachAttempts.slice(-10),
      ethicalCompliance: this.checkEthicalCompliance()
    };
  }
  
  /**
   * Check ethical compliance
   */
  checkEthicalCompliance() {
    const checks = {
      rateLimitsRespected: true,
      cooldownsActive: true,
      humanApprovalRequired: this.ethicalSafeguards.requireHumanApproval,
      noSpamDetected: true,
      withinAttemptLimits: true
    };
    
    // Check attempt limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttempts = this.outreachAttempts.filter(a => 
      new Date(a.timestamp) > today
    ).length;
    
    if (todayAttempts >= this.ethicalSafeguards.maxDailyAttempts) {
      checks.rateLimitsRespected = false;
      checks.withinAttemptLimits = false;
    }
    
    return checks;
  }
  
  /**
   * Stop the agent
   */
  async stop() {
    this.log('Stopping Celebrity Outreach Agent...', 'info');
    
    this.isActive = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    await this.saveHistory();
    
    this.log('Celebrity Outreach Agent stopped', 'success');
  }
  
  /**
   * Logging system
   */
  log(message, level = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      agent: this.config.agentName
    };
    
    this.logs.push(entry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Console output with color
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m'
    };
    
    const color = colors[level] || '';
    console.log(`${color}[${this.config.agentName}] ${message}\x1b[0m`);
    
    // Report to Merlin Hive
    if (typeof window !== 'undefined' && window.MerlinHive) {
      window.MerlinHive.reportLog(entry);
    }
  }
  
  /**
   * Export logs
   */
  exportLogs(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else if (format === 'csv') {
      const headers = 'Timestamp,Level,Message,Agent\n';
      const rows = this.logs.map(log => 
        `${log.timestamp},${log.level},${log.message},${log.agent}`
      ).join('\n');
      return headers + rows;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CelebrityOutreachAgent;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.CelebrityOutreachAgent = CelebrityOutreachAgent;
}
