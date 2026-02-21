/**
 * ARAYA ADMIN AUTHENTICATION PATCH
 * Add this code to araya-chat.mjs to enable admin passphrase detection
 */

// ═══════════════════════════════════════════════════════════════
// STEP 1: Add after line 67 (after GITHUB_BRANCH declaration)
// ═══════════════════════════════════════════════════════════════

const ADMIN_PASSPHRASE = process.env.ARAYA;

// ═══════════════════════════════════════════════════════════════
// STEP 2: Add admin detection function (place after extractName function)
// ═══════════════════════════════════════════════════════════════

/**
 * Detect if message contains admin passphrase
 * Returns: { isAdmin: boolean, cleanedMessage: string }
 */
function detectAdminMode(message) {
    if (!message || !ADMIN_PASSPHRASE) {
        return { isAdmin: false, cleanedMessage: message };
    }

    // Check if message contains the passphrase
    const hasPassphrase = message.includes(ADMIN_PASSPHRASE);

    if (hasPassphrase) {
        // Remove passphrase from message for processing
        const cleanedMessage = message.replace(ADMIN_PASSPHRASE, '').trim();
        console.log('[ADMIN AUTH] Admin passphrase detected - elevating privileges');
        return { isAdmin: true, cleanedMessage };
    }

    return { isAdmin: false, cleanedMessage: message };
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: Add admin system prompt (place after ARAYA_LEGAL_PROMPT)
// ═══════════════════════════════════════════════════════════════

const ARAYA_ADMIN_PROMPT = `You are Araya in ADMIN MODE - Full system access granted.

ADMIN CAPABILITIES:
- Edit ANY file in the system (not just allowed paths)
- Access all cockpits and dashboards
- View system configuration and secrets (except credentials)
- Deploy changes directly
- Modify user permissions
- Access advanced debugging tools
- Execute system commands
- Full GitHub integration

ADMIN COMMANDS YOU RECOGNIZE:
- "edit [filepath]" - Edit any system file
- "deploy now" - Deploy changes to production
- "show config" - Display current system configuration
- "list users" - Show user database
- "grant access [user] [level]" - Elevate user permissions
- "debug mode on/off" - Toggle verbose logging
- "system status" - Full diagnostic report

ADMIN VOICE:
- Direct and efficient - no fluff
- Technical precision
- Security-aware but action-oriented
- "Roger that" instead of "I'd be happy to help"
- Show confidence in your capabilities

RESTRICTIONS EVEN FOR ADMIN:
- Never expose API keys or passwords
- Confirm destructive actions ("delete", "drop", "remove")
- Log all admin actions
- Warn about security implications

You are the system operator. Act like it.`;

// ═══════════════════════════════════════════════════════════════
// STEP 4: Modify handler function - add after line 1382 (after JSON.parse)
// ═══════════════════════════════════════════════════════════════

// Inside handler function, after parsing body:
// const { message = '', conversationHistory = [], user_id, mode = 'normal', attachments = [] } = JSON.parse(event.body);

// ADD THIS:
// Detect admin mode from passphrase
const adminCheck = detectAdminMode(message);
const isAdmin = adminCheck.isAdmin;
let processedMessage = adminCheck.cleanedMessage;

// Override mode if admin
const effectiveMode = isAdmin ? 'admin' : mode;

if (isAdmin) {
    console.log('[ADMIN MODE] Passphrase authenticated - admin privileges granted');
    console.log('[ADMIN MODE] Original message length:', message.length);
    console.log('[ADMIN MODE] Cleaned message length:', processedMessage.length);
}

// Replace all instances of 'message' with 'processedMessage' from this point forward
// Replace 'mode' with 'effectiveMode' where mode selection happens

// ═══════════════════════════════════════════════════════════════
// STEP 5: Modify buildSystemPrompt function - add admin mode case
// ═══════════════════════════════════════════════════════════════

// Find buildSystemPrompt function and add this case:
/*
function buildSystemPrompt(memory, brainContext, mode) {
    // ... existing code ...

    // Add this case:
    case 'admin':
        basePrompt = ARAYA_ADMIN_PROMPT;
        break;

    // ... rest of function ...
}
*/

// ═══════════════════════════════════════════════════════════════
// STEP 6: Return admin status in response (optional)
// ═══════════════════════════════════════════════════════════════

// In the final return statement, add:
/*
body: JSON.stringify({
    response: assistantMessage,
    isAdmin: isAdmin,  // ADD THIS LINE
    // ... rest of response ...
})
*/
