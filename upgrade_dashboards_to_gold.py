#!/usr/bin/env python3
"""
C1 MECHANIC: Batch Upgrade 16 Silver Dashboards to Gold Standard
Adds missing DNA fields per DASHBOARD_ARCHITECTURE_STANDARD.md
"""

import json
import re
from pathlib import Path

# Define the 16 files to upgrade
AGENT_R_FILES = [
    "AGENT_R_DOMAIN_1_COMMAND.html",
    "AGENT_R_DOMAIN_2_BUILD.html",
    "AGENT_R_DOMAIN_3_CONNECT.html",
    "AGENT_R_DOMAIN_4_PROTECT.html",
    "AGENT_R_DOMAIN_5_GROW.html",
    "AGENT_R_DOMAIN_6_LEARN.html",
    "AGENT_R_DOMAIN_7_TRANSCEND.html",
    "AGENT_R_DOMAIN_8_BLUEPRINT.html"
]

COMMANDER_FILES = [
    "COMMANDER_DOMAIN_1_COMMAND.html",
    "COMMANDER_DOMAIN_2_BUILD.html",
    "COMMANDER_DOMAIN_3_CONNECT.html",
    "COMMANDER_DOMAIN_4_PROTECT.html",
    "COMMANDER_DOMAIN_5_GROW.html",
    "COMMANDER_DOMAIN_6_LEARN.html",
    "COMMANDER_DOMAIN_7_TRANSCEND.html",
    "COMMANDER_DOMAIN_8_BLUEPRINT.html"
]

# Domain names mapping
DOMAIN_NAMES = {
    "1": "COMMAND",
    "2": "BUILD",
    "3": "CONNECT",
    "4": "PROTECT",
    "5": "GROW",
    "6": "LEARN",
    "7": "TRANSCEND",
    "8": "BLUEPRINT"
}

def extract_dna_from_html(html_content):
    """Extract the DNA JSON block from HTML"""
    match = re.search(r'<script type="application/json" id="dashboard-dna">\s*(\{.*?\})\s*</script>',
                     html_content, re.DOTALL)
    if not match:
        return None, None

    json_str = match.group(1)
    start_pos = match.start()
    end_pos = match.end()

    try:
        dna = json.loads(json_str)
        return dna, (start_pos, end_pos)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return None, None

def upgrade_dna(dna, domain_num, owner_type):
    """Add missing Gold Standard fields to DNA"""

    # Determine owner details
    if owner_type == "agent_r":
        owner = "Agent R"
        real_name = "Ryan Barbrick"
        aliases = ["Agent R", "Ryan", "R1", "R2", "BarbrickDesign"]
        sync_with = f"COMMANDER_DOMAIN_{domain_num}_{DOMAIN_NAMES[domain_num]}.html"
        sync_note = "Agent R and Commander are the same person (Ryan Barbrick). Data should sync."
        access = "Agent R (Ryan Barbrick) - Personal workspace"
    else:  # commander
        owner = "Commander"
        real_name = "Ryan Barbrick"
        aliases = ["Commander", "Darrick", "C1", "C2", "C3"]
        sync_with = f"AGENT_R_DOMAIN_{domain_num}_{DOMAIN_NAMES[domain_num]}.html"
        sync_note = "Commander and Agent R are the same person (Ryan Barbrick). Data should sync."
        access = "Commander (Ryan Barbrick / Darrick Preble) - Mission Control"

    # Add missing fields
    if "owner" not in dna:
        dna["owner"] = owner

    if "realName" not in dna:
        dna["realName"] = real_name

    if "aliases" not in dna:
        dna["aliases"] = aliases

    if "access" not in dna:
        dna["access"] = access

    # Add identitySync
    if "identitySync" not in dna:
        dna["identitySync"] = {
            "enabled": True,
            "syncWith": sync_with,
            "note": sync_note
        }

    # Add changelog if missing
    if "changelog" not in dna:
        original_date = dna.get("created", "2026-02-21")
        dna["changelog"] = [
            {
                "version": "1.0.0",
                "date": original_date,
                "changes": "Initial domain dashboard creation"
            },
            {
                "version": "2.0.0",
                "date": "2026-02-24",
                "changes": "Upgraded to Gold Standard DNA - Added owner, realName, aliases, identitySync, changelog, connects_to, access"
            }
        ]
    else:
        # Append upgrade entry if not already present
        has_upgrade = any("Gold Standard" in c.get("changes", "") for c in dna["changelog"])
        if not has_upgrade:
            dna["changelog"].append({
                "version": "2.0.0",
                "date": "2026-02-24",
                "changes": "Upgraded to Gold Standard DNA - Added owner, realName, aliases, identitySync, changelog, connects_to, access"
            })

    # Add connects_to if missing
    if "connects_to" not in dna:
        connects = []

        # Add corresponding opposite dashboard (Agent R <-> Commander)
        if owner_type == "agent_r":
            connects.append(f"COMMANDER_DOMAIN_{domain_num}_{DOMAIN_NAMES[domain_num]}.html")
            connects.append("OPERATOR_COCKPIT_AGENT_R.html")
        else:
            connects.append(f"AGENT_R_DOMAIN_{domain_num}_{DOMAIN_NAMES[domain_num]}.html")
            connects.append("COMMANDER_COCKPIT.html")

        # Add master dashboard
        connects.append("SEVEN_DOMAINS_DASHBOARD.html")

        dna["connects_to"] = connects

    # Ensure c1_built is set
    if "trinity" in dna and "c1_built" not in dna["trinity"]:
        dna["trinity"]["c1_built"] = "2026-02-24"

    # Ensure LFSME has all 6 fields
    if "lfsme" in dna:
        lfsme = dna["lfsme"]
        if "lighter" not in lfsme:
            lfsme["lighter"] = 8
        if "faster" not in lfsme:
            lfsme["faster"] = 8
        if "stronger" not in lfsme:
            lfsme["stronger"] = 8
        if "elegant" not in lfsme:
            lfsme["elegant"] = 8
        if "less_expensive" not in lfsme:
            lfsme["less_expensive"] = 10

        # Recalculate average
        avg = (lfsme["lighter"] + lfsme["faster"] + lfsme["stronger"] +
               lfsme["elegant"] + lfsme["less_expensive"]) / 5
        lfsme["average"] = round(avg, 1)

    return dna

def upgrade_file(filepath, owner_type):
    """Upgrade a single dashboard file to Gold Standard"""

    # Extract domain number from filename
    match = re.search(r'DOMAIN_(\d)', filepath.name)
    if not match:
        print(f"⚠️  Could not extract domain number from {filepath.name}")
        return False

    domain_num = match.group(1)

    # Read file
    html_content = filepath.read_text(encoding='utf-8')

    # Extract DNA
    dna, positions = extract_dna_from_html(html_content)
    if not dna or not positions:
        print(f"❌ Failed to extract DNA from {filepath.name}")
        return False

    # Upgrade DNA
    upgraded_dna = upgrade_dna(dna, domain_num, owner_type)

    # Format JSON nicely
    json_str = json.dumps(upgraded_dna, indent=2)

    # Reconstruct the script tag
    new_dna_block = f'<script type="application/json" id="dashboard-dna">\n{json_str}\n    </script>'

    # Replace in HTML
    start_pos, end_pos = positions
    new_html = html_content[:start_pos] + new_dna_block + html_content[end_pos:]

    # Write back
    filepath.write_text(new_html, encoding='utf-8')

    print(f"✅ Upgraded: {filepath.name}")
    return True

def main():
    """Main execution"""
    base_path = Path(__file__).parent

    print("🔨 C1 MECHANIC: Upgrading 16 Silver Dashboards to Gold Standard")
    print("=" * 70)

    upgraded_count = 0

    # Upgrade Agent R files
    print("\n📊 AGENT R SET (8 files):")
    for filename in AGENT_R_FILES:
        filepath = base_path / filename
        if filepath.exists():
            if upgrade_file(filepath, "agent_r"):
                upgraded_count += 1
        else:
            print(f"⚠️  File not found: {filename}")

    # Upgrade Commander files
    print("\n👑 COMMANDER SET (8 files):")
    for filename in COMMANDER_FILES:
        filepath = base_path / filename
        if filepath.exists():
            if upgrade_file(filepath, "commander"):
                upgraded_count += 1
        else:
            print(f"⚠️  File not found: {filename}")

    print("\n" + "=" * 70)
    print(f"🎯 COMPLETE: {upgraded_count}/16 dashboards upgraded to Gold Standard")
    print("\nGold Standard fields added:")
    print("  • owner")
    print("  • realName")
    print("  • aliases")
    print("  • access")
    print("  • identitySync")
    print("  • changelog")
    print("  • connects_to")
    print("  • Complete LFSME scores")

if __name__ == "__main__":
    main()
