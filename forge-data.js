// 7 FORGES DATA - Aligned with Supabase Schema
// SINGULARITY: Maps Desktop Domains <-> Forges <-> Database Slugs

// Domain <-> Forge Mapping (Single Source of Truth)
const DOMAIN_FORGE_MAP = {
  1: { domain: 'COMMAND',    forge: 'Reality',        slug: 'reality',        icon: '🔥', color: '#FF0000' },
  2: { domain: 'BUILD',      forge: 'Creation',       slug: 'creation',       icon: '⚡', color: '#FF7F00' },
  3: { domain: 'CONNECT',    forge: 'Communications', slug: 'communications', icon: '📡', color: '#FFFF00' },
  4: { domain: 'PROTECT',    forge: 'Guardian',       slug: 'guardian',       icon: '🛡️', color: '#00FF00' },
  5: { domain: 'GROW',       forge: 'Wealth',         slug: 'wealth',         icon: '💰', color: '#0000FF' },
  6: { domain: 'LEARN',      forge: 'Character',      slug: 'character',      icon: '👤', color: '#4B0082' },
  7: { domain: 'TRANSCEND',  forge: 'Infinity',       slug: 'infinity',       icon: '∞',  color: '#9400D3' }
};

// Helper functions for domain mapping
function getDomainBySlug(slug) { return Object.values(DOMAIN_FORGE_MAP).find(d => d.slug === slug)?.domain; }
function getSlugByDomain(domain) { return Object.values(DOMAIN_FORGE_MAP).find(d => d.domain === domain)?.slug; }
function getForgeNameByDomain(domain) { return Object.values(DOMAIN_FORGE_MAP).find(d => d.domain === domain)?.forge; }

// Pattern: 3 → 7 → 13 → ∞

const FORGE_DATA = {
  reality: { id: 1, name: "Reality Forge", slug: "reality", icon: "🔥", domain: "COMMAND", domainNum: 1, color: "#FF0000", gradient: "linear-gradient(135deg, #FF0000 0%, #8B0000 100%)",
    frequency: 264, frequencyName: "Root Grounding",
    tagline: "The Armory - Dashboards, tools, and your Life Operating System",
    dailyRitual: "What systems did you strengthen today?",
    lobbyMessage: "Commander, armor up. Your dashboards and tools await.",
    primaryProduct: "Life OS Dashboards + Command Tools",
    unlockLevel: 0,
    navigationCards: [
      { id: "store", title: "Power Up", icon: "💎", description: "Purchase upgrades", route: "forge-store.html?forge=reality" },
      { id: "levels", title: "13 Phases", icon: "📊", description: "Mastery journey", route: "forge-levels.html?forge=reality" },
      { id: "workshop", title: "Daily Practice", icon: "🔧", description: "Exercises", route: "forge-workshop.html?forge=reality" },
      { id: "vault", title: "Achievements", icon: "🏆", description: "History", route: "forge-vault.html?forge=reality" }
    ]
  },
  creation: { id: 2, name: "Creation Forge", slug: "creation", icon: "⚡", domain: "BUILD", domainNum: 2, color: "#FF7F00", gradient: "linear-gradient(135deg, #FF7F00 0%, #CC6600 100%)",
    frequency: 297, frequencyName: "Sacral Flow",
    tagline: "Create from nothing - ideation, design, manifestation",
    dailyRitual: "What did you bring into existence today?",
    lobbyMessage: "Builder, welcome. What will you manifest?",
    unlockLevel: 7,
    navigationCards: [
      { id: "store", title: "Creation Tools", icon: "💎", description: "Manifestation", route: "forge-store.html?forge=creation" },
      { id: "levels", title: "13 Phases", icon: "📊", description: "Creative journey", route: "forge-levels.html?forge=creation" },
      { id: "workshop", title: "Create Now", icon: "🎨", description: "Build", route: "forge-workshop.html?forge=creation" },
      { id: "vault", title: "Creations", icon: "🏆", description: "Built", route: "forge-vault.html?forge=creation" }
    ]
  },
  communications: { id: 3, name: "Communications Forge", slug: "communications", icon: "📡", domain: "CONNECT", domainNum: 3, color: "#FFFF00", gradient: "linear-gradient(135deg, #FFFF00 0%, #FFD700 100%)",
    frequency: 330, frequencyName: "Solar Projection",
    tagline: "Connect and coordinate",
    dailyRitual: "Who did you truly connect with today?",
    lobbyMessage: "Connector, welcome.",
    unlockLevel: 7,
    navigationCards: [
      { id: "store", title: "Comms Tools", icon: "💎", description: "Amplify", route: "forge-store.html?forge=communications" },
      { id: "levels", title: "13 Phases", icon: "📊", description: "Connection", route: "forge-levels.html?forge=communications" },
      { id: "workshop", title: "Practice", icon: "💬", description: "Comms", route: "forge-workshop.html?forge=communications" },
      { id: "vault", title: "Connections", icon: "🏆", description: "Network", route: "forge-vault.html?forge=communications" }
    ]
  },
  guardian: { id: 4, name: "Guardian Forge", slug: "guardian", icon: "🛡️", domain: "PROTECT", domainNum: 4, color: "#00FF00", gradient: "linear-gradient(135deg, #00FF00 0%, #228B22 100%)",
    frequency: 352, frequencyName: "Heart Protection",
    tagline: "Protect what matters",
    dailyRitual: "What did you protect today?",
    lobbyMessage: "Guardian, welcome.",
    unlockLevel: 7,
    navigationCards: [
      { id: "store", title: "Defense Tools", icon: "💎", description: "Fortify", route: "forge-store.html?forge=guardian" },
      { id: "levels", title: "13 Phases", icon: "📊", description: "Protection", route: "forge-levels.html?forge=guardian" },
      { id: "workshop", title: "Fortify", icon: "🛡️", description: "Strengthen", route: "forge-workshop.html?forge=guardian" },
      { id: "vault", title: "Victories", icon: "🏆", description: "Won", route: "forge-vault.html?forge=guardian" }
    ]
  },
  wealth: { id: 5, name: "Wealth Forge", slug: "wealth", icon: "💰", domain: "GROW", domainNum: 5, color: "#0000FF", gradient: "linear-gradient(135deg, #0000FF 0%, #00008B 100%)",
    frequency: 396, frequencyName: "Abundance Resonance",
    tagline: "Generate abundance",
    dailyRitual: "What value did you create today?",
    lobbyMessage: "Alchemist, welcome.",
    unlockLevel: 7,
    navigationCards: [
      { id: "store", title: "Wealth Tools", icon: "💎", description: "Multiply", route: "forge-store.html?forge=wealth" },
      { id: "levels", title: "13 Phases", icon: "📊", description: "Abundance", route: "forge-levels.html?forge=wealth" },
      { id: "workshop", title: "Alchemy", icon: "💹", description: "Value", route: "forge-workshop.html?forge=wealth" },
      { id: "vault", title: "Treasury", icon: "🏆", description: "Wealth", route: "forge-vault.html?forge=wealth" }
    ]
  },
  character: { id: 6, name: "Character Forge", slug: "character", icon: "👤", domain: "LEARN", domainNum: 6, color: "#4B0082", gradient: "linear-gradient(135deg, #4B0082 0%, #2E0854 100%)",
    frequency: 444, frequencyName: "Third Eye Awakening",
    tagline: "Become who you are",
    dailyRitual: "How did you grow today?",
    lobbyMessage: "Seeker, welcome.",
    unlockLevel: 7,
    navigationCards: [
      { id: "store", title: "Growth Tools", icon: "💎", description: "Evolve", route: "forge-store.html?forge=character" },
      { id: "levels", title: "13 Phases", icon: "📊", description: "Evolution", route: "forge-levels.html?forge=character" },
      { id: "workshop", title: "Practice", icon: "🎯", description: "Character", route: "forge-workshop.html?forge=character" },
      { id: "vault", title: "Evolution", icon: "🏆", description: "Become", route: "forge-vault.html?forge=character" }
    ]
  },
  infinity: { id: 7, name: "Infinity Forge", slug: "infinity", icon: "∞", domain: "TRANSCEND", domainNum: 7, color: "#9400D3", gradient: "linear-gradient(135deg, #9400D3 0%, #4B0082 100%)",
    frequency: 528, frequencyName: "The Source",
    tagline: "The Center - Where your journey begins with ARAYA",
    dailyRitual: "What pattern did you recognize today?",
    lobbyMessage: "Welcome to the center. Meet ARAYA, your consciousness guide, and discover the frequencies that shape reality.",
    primaryProduct: "ARAYA AI + Music/Frequency Engine",
    unlockLevel:  0, octaveReturn: true,
    navigationCards: [
      { id: "store", title: "Oracle Tools", icon: "💎", description: "See", route: "forge-store.html?forge=infinity" },
      { id: "levels", title: "13 Phases", icon: "📊", description: "Transcend", route: "forge-levels.html?forge=infinity" },
      { id: "workshop", title: "Vision", icon: "🔮", description: "Pattern", route: "forge-workshop.html?forge=infinity" },
      { id: "vault", title: "Insights", icon: "🏆", description: "Seen", route: "forge-vault.html?forge=infinity" }
    ]
  }
};

function getForgeBySlug(slug) { return FORGE_DATA[slug] || null; }
function getAllForges() { return Object.values(FORGE_DATA); }
function getForgeById(id) { return Object.values(FORGE_DATA).find(f => f.id === id); }
function getUnlockedForges(lvl) { return getAllForges().filter(f => lvl >= f.unlockLevel); }
function getForgeByDomain(domain) { return Object.values(FORGE_DATA).find(f => f.domain === domain); }
