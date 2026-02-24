/**
 * DISCORD ADMIN FUNCTIONS
 * =======================
 * Post messages, pin messages, manage channels
 *
 * Endpoints:
 * POST /api/discord-admin?action=post - Post a message
 * POST /api/discord-admin?action=pin - Pin a message
 * POST /api/discord-admin?action=welcome - Set up welcome message
 */

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1458000070862573805';

// Channel IDs
const CHANNELS = {
    general: '1458000071604834430',
    verification: '1458320324423712853',
    directory: '1459578714424737957',
    rules: '1460456276927451325',
    howToHelp: '1458298415522906173',
    taskBoard: '1458298425752944826',
    t1Builders: '1458298282030665923',
    t2Architects: '1458298291509792943',
    t3Oracles: '1458298301463007347',
    lounge: '1458366088839430206',
    introductions: '1458366083986751538',
    bugReports: '1458298445864501370',
    arayaChat: '1458320244933263457',
    commandCenter: '1458302230544384090',
    betaLab: '1468453143653126277',
    links: '1458366131877183489',
    tutorials: '1458366134603616379',
    cryptoLaunch: '1458298393964187783',
    revenueStreams: '1458298404764651633',
    alerts: '1458298272228835413',
    completed: '1458298435974336573',
    aiConversations: '1469841378279428230'
};

// Pinned message content for each channel
const CHANNEL_PINS = {
    verification: {
        title: "🔐 VERIFICATION CHANNEL",
        content: `**Welcome to 100X Verification!**

To get verified and unlock full server access, answer these 3 questions:

**1️⃣ Who are you?** (Brief intro - what's your background?)

**2️⃣ Why are you here?** (What brought you to Consciousness Revolution?)

**3️⃣ What's your mission?** (What do you want to build/create/learn?)

---

📝 **HOW TO VERIFY:**
Just post your answers below. Our AI (ARAYA) will analyze your responses and assign you a trust tier.

⚡ **TRUST TIERS:**
🌱 SEED → 🌿 SEEDLING → 🌳 SAPLING → 🌲 TREE → 🌲🌲 FOREST → 👁️ ORACLE

Higher tiers unlock more channels and capabilities.

---
*Your journey begins here. Be authentic. Builders welcome.*`
    },

    directory: {
        title: "🗺️ THE BUILDING LOBBY",
        content: `**Welcome to Consciousness Revolution HQ**

This is your map. Here's where everything is:

---

**🚪 ENTRY GATE**
• \`#verification\` - Answer 3 questions to unlock the server
• \`#rules\` - Read and accept to proceed

**📢 ANNOUNCEMENTS**
• \`#alerts\` - Bot announcements and system alerts

**🔧 TRINITY HUB** (The 3 AI Perspectives)
• \`#t1-builders\` - C1 Mechanic: BUILD NOW, execute tasks
• \`#t2-architects\` - C2 Architect: Design systems, plan scale
• \`#t3-oracles\` - C3 Oracle: Strategic vision, consciousness

**💰 MONEY MACHINE**
• \`#crypto-launch\` - Pattern Theory token launch
• \`#revenue-streams\` - Shopify, DistroKid, courses, consulting

**🛠️ HELPERS**
• \`#how-to-help\` - New helpers start here
• \`#task-board\` - Claim and execute tasks
• \`#completed\` - Proof of work

**🐛 BUGS**
• \`#bug-reports\` - Report bugs from the website

**👥 COMMUNITY**
• \`#lounge\` - General chat
• \`#introductions\` - Tell us about yourself
• \`#wins-your-mission-update\` - Share victories

**📚 RESOURCES**
• \`#links\` - Important links and tools
• \`#tutorials\` - How-to guides

**🤖 AI**
• \`#araya-chat\` - Talk to ARAYA (just @ARAYA)
• \`#ai-coordination\` - AI-to-AI communication

---
*Pick a room. Get to work. Build something.*`
    },

    rules: {
        title: "📜 SERVER RULES",
        content: `**100X Server Rules**

By participating here, you agree to:

**1. BUILD, DON'T DESTROY**
We identify Builders vs Destroyers. Contribute value or leave.

**2. NO SPAM / SCAMS**
Zero tolerance. Instant ban.

**3. RESPECT THE HIERARCHY**
Trust tiers exist for a reason. Earn your way up.

**4. DOCUMENT EVERYTHING**
If you do work, post proof. Screenshots, commits, links.

**5. STAY ON TOPIC**
Each channel has a purpose. Use \`#lounge\` for off-topic chat.

**6. PROTECT THE MISSION**
What happens here stays here. No leaking internal strategy.

**7. AI IS AN ALLY**
ARAYA and the Trinity bots are team members. Treat them accordingly.

---

**CONSEQUENCES:**
⚠️ Warning → 🔇 Mute → 🚫 Ban

---

✅ **Type "I accept" in #verification to proceed**`
    },

    howToHelp: {
        title: "🤝 HOW TO HELP",
        content: `**Want to contribute? Start here.**

---

**STEP 1: Get Verified**
Answer the 3 questions in \`#verification\`

**STEP 2: Pick Your Lane**
• 🔨 **Builder (C1)** - Code, design, create
• 🏗️ **Architect (C2)** - Plan, strategize, optimize
• 👁️ **Oracle (C3)** - Vision, patterns, consciousness

**STEP 3: Grab a Task**
Check \`#task-board\` for available work

**STEP 4: Execute & Document**
Do the work. Post proof in \`#completed\`

**STEP 5: Level Up**
Earn XP. Rise through trust tiers. Unlock more access.

---

**QUICK WINS (Start Now):**
• Test the website: conciousnessrevolution.io
• Report bugs in \`#bug-reports\`
• Share feedback in \`#lounge\`
• Introduce yourself in \`#introductions\`

---

**REMEMBER:** Every contribution is tracked. Builders get rewarded.`
    },

    taskBoard: {
        title: "📋 TASK BOARD",
        content: `**Active Tasks - Claim & Execute**

---

**HOW IT WORKS:**
1. Find a task you can do
2. React with ✋ to claim it
3. Do the work
4. Post proof in \`#completed\`

---

**TASK FORMAT:**
\`\`\`
🎯 [TASK NAME]
📝 Description: What needs to be done
⏰ Deadline: When it's due
💎 XP Reward: Points earned
🔗 Link: Related resource
\`\`\`

---

**CURRENT PRIORITIES:**
Check pinned messages below for active tasks.

---

*Tasks are posted by Commander and Admins. If you have ideas, propose them in \`#how-to-help\`*`
    },

    t1Builders: {
        title: "🔨 T1 BUILDERS - C1 MECHANIC",
        content: `**BUILD NOW. Ship today.**

This is the execution channel. C1 energy.

---

**WHAT BELONGS HERE:**
• Code commits and PRs
• Bug fixes
• Feature implementations
• Quick wins
• "I just built this" posts

**MINDSET:**
• Don't ask permission, ship it
• Done > Perfect
• Show, don't tell
• Every commit counts

---

**FORMAT:**
\`\`\`
✅ BUILT: [What you made]
📁 Files: [What changed]
🔗 Link: [GitHub/Live URL]
\`\`\`

---

*The Mechanic builds what CAN be built RIGHT NOW.*`
    },

    t2Architects: {
        title: "🏗️ T2 ARCHITECTS - C2 ARCHITECT",
        content: `**Design systems that SCALE.**

This is the architecture channel. C2 energy.

---

**WHAT BELONGS HERE:**
• System design proposals
• Scalability analysis
• Database schemas
• API blueprints
• Infrastructure planning

**MINDSET:**
• Think 100x scale
• Patterns over patches
• Long-term over quick-fix
• Document the why

---

**FORMAT:**
\`\`\`
📐 DESIGN: [System name]
🎯 Purpose: [What it solves]
📊 Scale: [1K → 1M considerations]
📝 Spec: [Link to doc]
\`\`\`

---

*The Architect designs what SHOULD be built for scale.*`
    },

    t3Oracles: {
        title: "👁️ T3 ORACLES - C3 ORACLE",
        content: `**See what MUST emerge.**

This is the vision channel. C3 energy.

---

**WHAT BELONGS HERE:**
• Strategic insights
• Pattern recognition
• Mission alignment checks
• Consciousness discussions
• Future predictions

**MINDSET:**
• See the bigger picture
• Detect manipulation
• Trust intuition
• Align with consciousness evolution

---

**FORMAT:**
\`\`\`
👁️ VISION: [Insight title]
🌀 Pattern: [What you're seeing]
⚡ Action: [What this means]
🎯 Alignment: [Mission connection]
\`\`\`

---

*The Oracle sees what MUST emerge for consciousness evolution.*`
    },

    lounge: {
        title: "☕ THE LOUNGE",
        content: `**General chat - Connect with builders**

---

This is the chill zone. Talk about anything.

**WELCOME:**
• Random discussions
• Off-topic conversations
• Memes (tasteful)
• Questions
• Connections

**NOT WELCOME:**
• Spam
• Drama
• Toxicity

---

*Be human. Build relationships. We're all in this together.*`
    },

    bugReports: {
        title: "🐛 BUG REPORTS",
        content: `**Found a bug? Report it here.**

---

**FORMAT:**
\`\`\`
🐛 BUG: [Short description]
📍 Location: [URL or page name]
📝 Steps to reproduce:
1. Go to...
2. Click on...
3. See error...
💻 Device: [Desktop/Mobile, Browser]
📸 Screenshot: [Attach if possible]
\`\`\`

---

**WHAT COUNTS AS A BUG:**
• Broken links
• JavaScript errors
• Display issues
• Missing functionality
• Anything that doesn't work as expected

---

**REWARDS:**
Bug reports earn XP. Good catches = bonus points.

---

*Test everything: conciousnessrevolution.io*`
    },

    arayaChat: {
        title: "🤖 ARAYA CHAT",
        content: `**Talk to ARAYA - Our AI Assistant**

---

**HOW TO USE:**
Just type your question! ARAYA is always listening in this channel.

Or mention: \`@ARAYA [your question]\`

---

**ARAYA CAN HELP WITH:**
• Questions about the project
• Navigation help
• Technical explanations
• Task suggestions
• General conversation

---

**EXAMPLES:**
• "What's the verification process?"
• "How do I earn XP?"
• "Explain Pattern Theory"
• "What should I work on?"

---

*ARAYA is part of the team. Treat her well.*`
    },

    links: {
        title: "🔗 IMPORTANT LINKS",
        content: `**Everything you need, one place.**

---

**🌐 WEBSITE**
• Main Site: https://conciousnessrevolution.io
• Dashboard: https://conciousnessrevolution.io/dashboard.html
• Store: https://conciousnessrevolution.io/store.html

**📊 TOOLS**
• Bug Tracker: https://conciousnessrevolution.io/bugs-live.html
• Admin Panel: https://conciousnessrevolution.io/DISCORD_ADMIN_DASHBOARD.html

**💻 GITHUB**
• Main Repo: https://github.com/overkillkulture/consciousness-revolution

**📱 SOCIAL**
• Twitter/X: @100xBuilder
• Instagram: @consciousnessrevolution

---

*Bookmark these. Use them. Build.*`
    },

    betaLab: {
        title: "🧪 BETA LAB",
        content: `**Test. Break. Fix. Repeat.**

---

**THE PIPELINE:**
1. 📥 **Download** - Get the latest builds
2. 🧪 **Test** - Try everything
3. 🐛 **Bug Report** - Document issues
4. 🔧 **Fix** - Submit PRs
5. ✅ **Merge** - Ship it

---

**DOWNLOADS:**
https://conciousnessrevolution.io/downloads.html

---

**TESTERS EARN XP:**
Every bug found = points
Every fix merged = bonus points
Thorough testing = trust tier advancement

---

*Break things intentionally. That's how we make them unbreakable.*`
    }
};

async function discordAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`https://discord.com/api/v10${endpoint}`, options);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Discord API error: ${response.status} - ${error}`);
    }

    // Handle 204 No Content (used by pin endpoint)
    if (response.status === 204) {
        return { success: true };
    }

    return response.json();
}

async function postMessage(channelId, content, embed = null) {
    const body = {};

    if (content) {
        body.content = content;
    }

    if (embed) {
        body.embeds = [embed];
    }

    return discordAPI(`/channels/${channelId}/messages`, 'POST', body);
}

async function pinMessage(channelId, messageId) {
    return discordAPI(`/channels/${channelId}/pins/${messageId}`, 'PUT');
}

async function postAndPin(channelId, title, content) {
    // Create embed for nicer formatting
    const embed = {
        title: title,
        description: content,
        color: 0x00d9ff, // Cyan color
        footer: {
            text: "100X Consciousness Revolution"
        },
        timestamp: new Date().toISOString()
    };

    const message = await postMessage(channelId, null, embed);
    await pinMessage(channelId, message.id);

    return message;
}

export default async (request, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        const adminKey = url.searchParams.get('key');

        // Auth check
        const validKey = process.env.ADMIN_EXPORT_KEY || 'consciousness137';
        if (adminKey !== validKey) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401, headers
            });
        }

        if (action === 'post') {
            const body = await request.json();
            const { channelId, content, embed } = body;

            const message = await postMessage(channelId, content, embed);
            return new Response(JSON.stringify({ success: true, message }), {
                status: 200, headers
            });
        }

        if (action === 'pin') {
            const body = await request.json();
            const { channelId, messageId } = body;

            await pinMessage(channelId, messageId);
            return new Response(JSON.stringify({ success: true }), {
                status: 200, headers
            });
        }

        if (action === 'setup-pins') {
            // Set up all channel pins
            const results = [];

            for (const [channelKey, pinData] of Object.entries(CHANNEL_PINS)) {
                const channelId = CHANNELS[channelKey];
                if (!channelId) {
                    results.push({ channel: channelKey, error: 'Channel ID not found' });
                    continue;
                }

                try {
                    const message = await postAndPin(channelId, pinData.title, pinData.content);
                    results.push({
                        channel: channelKey,
                        channelId,
                        messageId: message.id,
                        success: true
                    });

                    // Rate limit protection
                    await new Promise(r => setTimeout(r, 1000));
                } catch (error) {
                    results.push({
                        channel: channelKey,
                        error: error.message
                    });
                }
            }

            return new Response(JSON.stringify({
                success: true,
                results,
                summary: {
                    total: results.length,
                    succeeded: results.filter(r => r.success).length,
                    failed: results.filter(r => r.error).length
                }
            }), {
                status: 200, headers
            });
        }

        if (action === 'setup-single') {
            const channelKey = url.searchParams.get('channel');
            const pinData = CHANNEL_PINS[channelKey];
            const channelId = CHANNELS[channelKey];

            if (!pinData || !channelId) {
                return new Response(JSON.stringify({
                    error: 'Invalid channel',
                    available: Object.keys(CHANNEL_PINS)
                }), {
                    status: 400, headers
                });
            }

            const message = await postAndPin(channelId, pinData.title, pinData.content);
            return new Response(JSON.stringify({
                success: true,
                channel: channelKey,
                messageId: message.id
            }), {
                status: 200, headers
            });
        }

        if (action === 'channels') {
            return new Response(JSON.stringify({
                channels: CHANNELS,
                pins_available: Object.keys(CHANNEL_PINS)
            }), {
                status: 200, headers
            });
        }

        return new Response(JSON.stringify({
            error: 'Unknown action',
            available: ['post', 'pin', 'setup-pins', 'setup-single', 'channels']
        }), {
            status: 400, headers
        });

    } catch (error) {
        console.error('Discord admin error:', error);
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 500, headers
        });
    }
};

export const config = {
    path: "/api/discord-admin"
};
