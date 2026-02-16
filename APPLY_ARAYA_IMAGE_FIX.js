/**
 * ARAYA IMAGE FIX - APPLY SCRIPT
 *
 * This script applies the vision API fix to araya-chat.mjs
 * Run: node APPLY_ARAYA_IMAGE_FIX.js
 */

const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(__dirname, 'netlify', 'functions', 'araya-chat.mjs');
const BACKUP_FILE = TARGET_FILE + '.backup';

// The buggy code to find and replace
const BUGGY_CODE = `        if (hasImages) {
            // Images require Claude Vision API
            try {
                response = await callClaudeVision(fullMessage, imageAttachments);

                // Store images to Supabase with Claude's description
                if (user_id && response) {
                    for (const img of imageAttachments) {
                        const imageId = await storeImageToSupabase(
                            user_id,
                            img.data,
                            response,
                            img.type || 'image/png'
                        );
                        if (imageId) storedImageIds.push(imageId);
                    }
                    if (storedImageIds.length > 0) {
                        console.log(\`Stored \${storedImageIds.length} image(s) for user \${user_id}\`);
                    }
                }
            } catch (claudeError) {
                console.error('Claude Vision error:', claudeError);
                // Fallback to OpenAI if Claude fails
                try {
                    const contentParts = [];
                    if (fullMessage) contentParts.push({ type: 'text', text: fullMessage || 'What do you see in this image?' });
                    for (const img of imageAttachments) {
                        contentParts.push({ type: 'image_url', image_url: { url: img.data } });
                    }
                    messages.push({ role: 'user', content: contentParts });
                    response = await callAI(messages, false);
                    apiMode = 'openai_fallback';
                } catch (openaiError) {
                    console.error('OpenAI fallback also failed:', openaiError);
                    response = "I can see you sent an image but I'm having trouble processing it right now. Can you describe what you'd like me to look at?";
                    apiMode = 'fallback';
                }
            }
        }`;

// The fixed code
const FIXED_CODE = `        if (hasImages) {
            // Images: Claude Vision (primary) → OpenAI Vision (fallback) → Error
            try {
                console.log(\`Processing \${imageAttachments.length} image(s) with Claude Vision\`);
                response = await callClaudeVision(fullMessage, imageAttachments);
                console.log('Claude Vision success');

                // Store images to Supabase with Claude's description
                if (user_id && response) {
                    for (const img of imageAttachments) {
                        const imageId = await storeImageToSupabase(
                            user_id,
                            img.data,
                            response,
                            img.type || 'image/png'
                        );
                        if (imageId) storedImageIds.push(imageId);
                    }
                    if (storedImageIds.length > 0) {
                        console.log(\`Stored \${storedImageIds.length} image(s) for user \${user_id}\`);
                    }
                }
            } catch (claudeError) {
                console.error('❌ Claude Vision FAILED:', claudeError.message);
                console.error('Claude error details:', {
                    name: claudeError.name,
                    message: claudeError.message,
                    stack: claudeError.stack?.substring(0, 500)
                });

                // Fallback to OpenAI Vision (gpt-4o-mini supports vision)
                try {
                    console.log('🔄 Attempting OpenAI Vision fallback...');
                    const contentParts = [];

                    // Add text prompt
                    contentParts.push({
                        type: 'text',
                        text: fullMessage || 'What do you see in this image? Describe it in detail.'
                    });

                    // Add images using OpenAI's format
                    for (const img of imageAttachments) {
                        contentParts.push({
                            type: 'image_url',
                            image_url: {
                                url: img.data,
                                detail: 'high'
                            }
                        });
                    }

                    messages.push({ role: 'user', content: contentParts });
                    response = await callAI(messages, false); // false = use OpenAI
                    apiMode = 'openai_vision_fallback';
                    console.log('✅ OpenAI Vision fallback SUCCESS');

                    // Still store the image with OpenAI's description
                    if (user_id && response) {
                        for (const img of imageAttachments) {
                            const imageId = await storeImageToSupabase(
                                user_id,
                                img.data,
                                response,
                                img.type || 'image/png'
                            );
                            if (imageId) storedImageIds.push(imageId);
                        }
                        if (storedImageIds.length > 0) {
                            console.log(\`Stored \${storedImageIds.length} image(s) via OpenAI fallback\`);
                        }
                    }
                } catch (openaiError) {
                    console.error('❌ OpenAI Vision fallback FAILED:', openaiError.message);
                    console.error('OpenAI error details:', {
                        name: openaiError.name,
                        message: openaiError.message,
                        stack: openaiError.stack?.substring(0, 500)
                    });

                    // Both APIs failed - give helpful error
                    response = \`I can see you sent \${imageAttachments.length} image(s) but both my vision systems are having trouble right now.

🔴 Error details:
- Claude Vision: \${claudeError.message}
- OpenAI Vision: \${openaiError.message}

Can you try:
1. Describing what you'd like me to look at
2. Uploading a smaller image
3. Trying again in a moment

The issue has been logged and will be investigated.\`;
                    apiMode = 'vision_failure';

                    // Log to Supabase bugs table for investigation
                    try {
                        await storeBugReport(user_id || 'anonymous',
                            \`Image processing failure: Claude (\${claudeError.message}), OpenAI (\${openaiError.message})\`,
                            { claudeError: claudeError.message, openaiError: openaiError.message }
                        );
                    } catch (bugLogError) {
                        console.error('Could not log bug:', bugLogError);
                    }
                }
            }
        }`;

console.log('🔧 ARAYA IMAGE FIX - APPLYING...\n');

// Read the file
let content;
try {
    content = fs.readFileSync(TARGET_FILE, 'utf8');
    console.log('✅ Read araya-chat.mjs');
} catch (err) {
    console.error('❌ Failed to read file:', err.message);
    process.exit(1);
}

// Check if buggy code exists
if (!content.includes('// Images require Claude Vision API')) {
    console.log('⚠️  Buggy code pattern not found. File may already be fixed or code has changed.');
    console.log('Searching for image handling section...\n');

    if (content.includes('if (hasImages)')) {
        console.log('Found image handling code. Please review manually.');
    } else {
        console.log('❌ Cannot locate image handling code.');
    }
    process.exit(1);
}

// Create backup
try {
    fs.writeFileSync(BACKUP_FILE, content);
    console.log(`✅ Backup created: ${path.basename(BACKUP_FILE)}`);
} catch (err) {
    console.error('❌ Failed to create backup:', err.message);
    process.exit(1);
}

// Apply fix
const fixedContent = content.replace(BUGGY_CODE, FIXED_CODE);

if (fixedContent === content) {
    console.log('❌ Fix pattern did not match. Manual review required.');
    process.exit(1);
}

// Write fixed file
try {
    fs.writeFileSync(TARGET_FILE, fixedContent);
    console.log('✅ Fix applied to araya-chat.mjs\n');

    console.log('📋 CHANGES MADE:');
    console.log('  - Added detailed logging with emojis (🔄 ✅ ❌)');
    console.log('  - Fixed OpenAI Vision format (added detail: "high")');
    console.log('  - Store images even when using OpenAI fallback');
    console.log('  - Auto-log both API failures to Supabase bugs table');
    console.log('  - User-friendly error message with specific failure reasons\n');

    console.log('🚀 NEXT STEPS:');
    console.log('  1. Test the fix with: node TEST_ARAYA_IMAGE.js');
    console.log('  2. Deploy: cd 100X_DEPLOYMENT && netlify deploy --prod --dir=.');
    console.log(`  3. If issues: cp ${path.basename(BACKUP_FILE)} araya-chat.mjs\n`);

} catch (err) {
    console.error('❌ Failed to write fixed file:', err.message);
    process.exit(1);
}

console.log('✅ FIX COMPLETE!');
