#!/usr/bin/env python3
import re

# Read the file
with open('netlify/functions/araya-chat.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# The new enhanced handler
new_handler = '''                // === DASHBOARD CUSTOMIZATION HANDLER (Scalable 1000x) ===
                case 'dashboard_edit':
                    // Check if we have real file editing permissions
                    if (context?.canEdit === true && context?.file) {
                        // REAL FILE EDITING PATH
                        console.log('[DASHBOARD_EDIT] Real file editing mode for:', context.file);

                        // Color mappings for common requests
                        const colorMap = {
                            'gold': '#FFD700', 'bright gold': '#FFD700', 'metallic gold': '#D4AF37',
                            'purple': '#8B5CF6', 'violet': '#7C3AED', 'indigo': '#6366F1',
                            'blue': '#3B82F6', 'cyan': '#06B6D4', 'teal': '#14B8A6',
                            'green': '#10B981', 'emerald': '#059669', 'lime': '#84CC16',
                            'red': '#EF4444', 'crimson': '#DC2626', 'rose': '#F43F5E',
                            'orange': '#F97316', 'amber': '#F59E0B', 'yellow': '#EAB308',
                            'pink': '#EC4899', 'magenta': '#D946EF', 'fuchsia': '#C026D3',
                            'white': '#FFFFFF', 'black': '#000000', 'dark': '#0A0A0A',
                            'gray': '#6B7280', 'silver': '#94A3B8', 'slate': '#475569'
                        };

                        // Detect what property to change
                        const msgLower = message.toLowerCase();
                        let cssVarOptions = null;
                        let newColor = null;
                        let propertyName = null;

                        // Detect color from message
                        for (const [name, hex] of Object.entries(colorMap)) {
                            if (msgLower.includes(name)) {
                                newColor = hex;
                                break;
                            }
                        }
                        // Also check for hex codes
                        const hexMatch = message.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/);
                        if (hexMatch) newColor = hexMatch[0];

                        // Detect which CSS variable to change
                        const cssVarMap = {
                            'accent': { names: ['--accent', '--accent-color'], display: 'accent color' },
                            'primary': { names: ['--primary', '--primary-color', '--d1'], display: 'primary color' },
                            'background': { names: ['--bg', '--bg-color', '--background'], display: 'background color' },
                            'text': { names: ['--text', '--text-color'], display: 'text color' },
                            'header': { names: ['--header-bg', '--header'], display: 'header background' },
                            'gem': { names: ['--gem', '--gem-color'], display: 'gem color' },
                            'card': { names: ['--card', '--card-bg'], display: 'card background' },
                            'border': { names: ['--border', '--border-color'], display: 'border color' }
                        };

                        if (msgLower.includes('accent')) {
                            cssVarOptions = cssVarMap['accent'];
                            propertyName = 'accent color';
                        } else if (msgLower.includes('primary')) {
                            cssVarOptions = cssVarMap['primary'];
                            propertyName = 'primary color';
                        } else if (msgLower.includes('background') || msgLower.includes('bg')) {
                            cssVarOptions = cssVarMap['background'];
                            propertyName = 'background color';
                        } else if (msgLower.includes('text') || msgLower.includes('font color')) {
                            cssVarOptions = cssVarMap['text'];
                            propertyName = 'text color';
                        } else if (msgLower.includes('header')) {
                            cssVarOptions = cssVarMap['header'];
                            propertyName = 'header background';
                        } else if (msgLower.includes('gem')) {
                            cssVarOptions = cssVarMap['gem'];
                            propertyName = 'gem color';
                        } else if (msgLower.includes('card')) {
                            cssVarOptions = cssVarMap['card'];
                            propertyName = 'card background';
                        } else if (msgLower.includes('border')) {
                            cssVarOptions = cssVarMap['border'];
                            propertyName = 'border color';
                        }

                        if (cssVarOptions && newColor) {
                            const readResult = await araraFileOperation('read', context.file);
                            if (readResult.success) {
                                let fileContent = readResult.content;
                                let foundVar = null;

                                for (const varName of cssVarOptions.names) {
                                    const testRegex = new RegExp(varName + '\\\\s*:');
                                    if (testRegex.test(fileContent)) {
                                        foundVar = varName;
                                        break;
                                    }
                                }

                                if (foundVar) {
                                    fileContent = fileContent.replace(new RegExp('(' + foundVar + '\\\\s*:\\\\s*)([^;]+)(;)', 'g'), '$1' + newColor + '$3');
                                    const writeResult = await araraFileOperation('write', context.file, fileContent, '[ARAYA] Dashboard edit: ' + propertyName + ' to ' + newColor);

                                    if (writeResult.success) {
                                        abilityResult = { type: 'dashboard_edit', success: true, property: propertyName, value: newColor, file: context.file, fileEdited: true, cssVar: foundVar };
                                        abilityContext = `\\n\\n[FILE EDITED]: Changed ${propertyName} to ${newColor} in ${context.file}!\\n\\nRefresh the page to see your changes!`;
                                    } else {
                                        abilityResult = { type: 'dashboard_edit', success: false, error: writeResult.error };
                                        abilityContext = `\\n\\n[FILE EDIT FAILED]: ${writeResult.error}`;
                                    }
                                } else {
                                    abilityResult = { type: 'dashboard_edit', success: false };
                                    abilityContext = `\\n\\n[CSS VARIABLE NOT FOUND]: None of ${cssVarOptions.names.join(', ')} found in this file.`;
                                }
                            } else {
                                abilityResult = { type: 'dashboard_edit', success: false, error: readResult.error };
                                abilityContext = `\\n\\n[FILE READ FAILED]: ${readResult.error}`;
                            }
                        } else if (!newColor) {
                            abilityResult = { type: 'dashboard_edit', success: false };
                            abilityContext = `\\n\\n[COLOR NOT RECOGNIZED]: Supported: gold, purple, blue, cyan, teal, green, red, orange, pink. Or use hex: #FFD700`;
                        } else if (!cssVarOptions) {
                            abilityResult = { type: 'dashboard_edit', success: false };
                            abilityContext = `\\n\\n[WHAT TO CHANGE?]: Try "change my ACCENT color to ${newColor}" or "change my BACKGROUND to ${newColor}"`;
                        }
                    } else {
                        // FALLBACK: Dashboard config path (no file editing permission)
                        const parseResponse = await fetch(`${process.env.URL || 'https://consciousnessrevolution.io'}/.netlify/functions/dashboard-config?action=parse`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message })
                        });

                        let parsed = { understood: false };
                        if (parseResponse.ok) {
                            const parseData = await parseResponse.json();
                            parsed = parseData.parsed || parsed;
                        }

                        if (parsed.understood && parsed.property && parsed.value) {
                            const dashboard = context?.page || context?.dashboard || 'COMMANDER_DOMAIN_1';
                            const editResponse = await fetch(`${process.env.URL || 'https://consciousnessrevolution.io'}/.netlify/functions/dashboard-config?action=set`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ user_id: user_id, dashboard: dashboard, property: parsed.property, value: parsed.value })
                            });

                            if (editResponse.ok) {
                                abilityResult = { type: 'dashboard_edit', success: true, property: parsed.propertyFriendly || parsed.property, value: parsed.value, dashboard: dashboard };
                                abilityContext = `\\n\\n[PREFERENCE SAVED]: Updated ${parsed.propertyFriendly || parsed.property} to ${parsed.value}! Refresh to see.`;
                            } else {
                                abilityResult = { type: 'dashboard_edit', success: false };
                                abilityContext = `\\n\\n[EDIT FAILED]: Could not save.`;
                            }
                        } else {
                            abilityResult = { type: 'dashboard_edit', success: false };
                            abilityContext = `\\n\\n[DASHBOARD CUSTOMIZER]: Try "change my accent color to gold" or "make my background dark"`;
                        }
                    }
                    break;'''

# Find and replace the old handler
old_pattern = r"// === DASHBOARD CUSTOMIZATION HANDLER \(Scalable 1000x\) ===\s*\n\s*case 'dashboard_edit':.*?break;"

match = re.search(old_pattern, content, flags=re.DOTALL)
if match:
    print('Found handler at position:', match.start())
    new_content = content[:match.start()] + new_handler + content[match.end():]
    with open('netlify/functions/araya-chat.mjs', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('SUCCESS: Handler replaced')
    print('File size:', len(new_content))
else:
    print('ERROR: Pattern not found')
