#!/usr/bin/env python3
"""
ARAYA Admin Authentication Patcher
Adds admin passphrase detection to araya-chat.mjs
"""

import re

def patch_araya_chat(filepath):
    """Add admin authentication to araya-chat.mjs"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # PATCH 1: Add ADMIN_PASSPHRASE constant after GITHUB_BRANCH
    patch1_marker = "const GITHUB_BRANCH = 'master';"
    patch1_code = """const GITHUB_BRANCH = 'master';

// ═══════════════════════════════════════════════════════════════
// ADMIN AUTHENTICATION - ARAYA Passphrase (from GitHub repo secret)
// Security Layer 1: Passphrase in message grants admin mode
// ═══════════════════════════════════════════════════════════════
const ADMIN_PASSPHRASE = process.env.ARAYA;"""

    if patch1_marker in content and 'ADMIN_PASSPHRASE' not in content:
        content = content.replace(patch1_marker, patch1_code)
        print("✓ Added ADMIN_PASSPHRASE constant")
    else:
        print("- ADMIN_PASSPHRASE already exists or marker not found")

    # PATCH 2: Add detectAdminMode function after extractName function
    patch2_marker = """    return null;
}

// Update or create user profile in Supabase"""

    patch2_code = """    return null;
}

// ═══════════════════════════════════════════════════════════════
// ADMIN MODE DETECTION - Check for passphrase in message
// ═══════════════════════════════════════════════════════════════
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

// Update or create user profile in Supabase"""

    if patch2_marker in content and 'detectAdminMode' not in content:
        content = content.replace(patch2_marker, patch2_code)
        print("✓ Added detectAdminMode function")
    else:
        print("- detectAdminMode already exists or marker not found")

    # PATCH 3: Add ARAYA_ADMIN_PROMPT after ARAYA_LEGAL_PROMPT
    patch3_marker = """VOICE: Direct, strategic, focused. "The pattern here is..." "The contradiction shows..." "Procedurally, they violated..."`;\n\n// NAME EXTRACTION"""

    patch3_code = """VOICE: Direct, strategic, focused. "The pattern here is..." "The contradiction shows..." "Procedurally, they violated..."`;\n
// ═══════════════════════════════════════════════════════════════
// ADMIN MODE PROMPT - Full system access personality
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

// NAME EXTRACTION"""

    if 'ARAYA_ADMIN_PROMPT' not in content:
        content = content.replace(patch3_marker, patch3_code)
        print("✓ Added ARAYA_ADMIN_PROMPT")
    else:
        print("- ARAYA_ADMIN_PROMPT already exists")

    # PATCH 4: Add admin detection in handler function
    patch4_marker = "const { message = '', conversationHistory = [], user_id, mode = 'normal', attachments = [] } = JSON.parse(event.body);"

    patch4_code = """const { message = '', conversationHistory = [], user_id, mode = 'normal', attachments = [] } = JSON.parse(event.body);

        // ═══════════════════════════════════════════════════════════════
        // ADMIN MODE DETECTION - Check for passphrase in message
        // ═══════════════════════════════════════════════════════════════
        const adminCheck = detectAdminMode(message);
        const isAdmin = adminCheck.isAdmin;
        let processedMessage = adminCheck.cleanedMessage;

        // Override mode if admin detected
        const effectiveMode = isAdmin ? 'admin' : mode;

        if (isAdmin) {
            console.log('[ADMIN MODE] ✓ Passphrase authenticated - admin privileges granted');
            console.log('[ADMIN MODE] Original message length:', message.length);
            console.log('[ADMIN MODE] Cleaned message length:', processedMessage.length);
        }"""

    if patch4_marker in content and 'adminCheck = detectAdminMode' not in content:
        content = content.replace(patch4_marker, patch4_code)
        print("✓ Added admin detection in handler")
    else:
        print("- Admin detection already exists or marker not found")

    # PATCH 5: Replace message references with processedMessage in Railway routing
    # Find the Railway routing section and update message references
    railway_pattern = r"if \(shouldRouteToRailway\(message, mode, attachments\)\)"
    railway_replacement = r"if (shouldRouteToRailway(processedMessage || message, effectiveMode || mode, attachments))"

    if re.search(railway_pattern, content):
        content = re.sub(railway_pattern, railway_replacement, content)
        print("✓ Updated Railway routing to use processedMessage/effectiveMode")

    # Update the proxyToRailway call
    proxy_pattern = r"message,\s*conversationHistory,\s*user_id,\s*mode,"
    proxy_replacement = r"message: processedMessage || message,\n                conversationHistory,\n                user_id,\n                mode: effectiveMode || mode,"

    if 'proxyToRailway({' in content and 'processedMessage || message' not in content:
        content = re.sub(proxy_pattern, proxy_replacement, content)
        print("✓ Updated proxyToRailway call")

    # PATCH 6: Update buildSystemPrompt call to use effectiveMode
    build_prompt_pattern = r"let systemPrompt = buildSystemPrompt\(memory, brainContext, mode\);"
    build_prompt_replacement = r"let systemPrompt = buildSystemPrompt(memory, brainContext, effectiveMode || mode);"

    if re.search(build_prompt_pattern, content):
        content = re.sub(build_prompt_pattern, build_prompt_replacement, content)
        print("✓ Updated buildSystemPrompt to use effectiveMode")

    # PATCH 7: Update message references to processedMessage
    # Find patterns like "fetchBrainContext(message," and update
    brain_pattern = r"fetchBrainContext\(message,"
    brain_replacement = r"fetchBrainContext(processedMessage || message,"

    if re.search(brain_pattern, content) and 'fetchBrainContext(processedMessage' not in content:
        content = re.sub(brain_pattern, brain_replacement, content)
        print("✓ Updated fetchBrainContext to use processedMessage")

    # Write the patched content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print("\n✅ Patching complete!")
    return True

if __name__ == '__main__':
    import sys
    filepath = sys.argv[1] if len(sys.argv) > 1 else 'araya-chat.mjs'
    patch_araya_chat(filepath)
