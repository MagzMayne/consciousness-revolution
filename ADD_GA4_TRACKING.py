#!/usr/bin/env python3
"""
Add GA4 Tracking to Production HTML Files
GA4 ID: G-CPHEQZPHPZ
"""

import os
from pathlib import Path

GA4_SNIPPET = '''<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CPHEQZPHPZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-CPHEQZPHPZ');
</script>
'''

# Priority files to add analytics
PRIORITY_FILES = [
    'index.html',
    'araya-chat.html',
    'araya-welcome.html',
    'login.html',
    'dashboard.html',
    'workspace.html',
    'offline.html',
    'account.html',
    'ABOUT.html',
    '3d.html',
    '3dWifi.html',
    'aFactory.html',
    'aSpark.html',
    'aiSchool.html',
    'aiGridLink.html',
    'autoKey.html',
    'bCert.html',
    'Gems.html',
    'GemBot_Web_Control.html',
    'BudgetBoss.html',
]

def has_analytics(content):
    """Check if file already has GA4 tracking"""
    return 'G-CPHEQZPHPZ' in content or 'googletagmanager.com/gtag' in content

def add_analytics(filepath):
    """Add GA4 tracking after <head> tag"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        if has_analytics(content):
            return False, "Already has analytics"
        
        # Find <head> tag and insert after it
        head_pos = content.lower().find('<head>')
        if head_pos == -1:
            return False, "No <head> tag found"
        
        # Find the end of the <head> tag
        head_end = content.find('>', head_pos) + 1
        
        # Insert GA4 snippet after <head>
        new_content = content[:head_end] + '\n' + GA4_SNIPPET + content[head_end:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, "Analytics added"
    except Exception as e:
        return False, str(e)

def main():
    deploy_dir = Path('C:/Users/dwrek/100X_DEPLOYMENT')
    added = 0
    skipped = 0
    errors = 0
    
    print("=" * 60)
    print("GA4 ANALYTICS DEPLOYMENT")
    print("=" * 60)
    print()
    
    for filename in PRIORITY_FILES:
        filepath = deploy_dir / filename
        if not filepath.exists():
            print(f"⚠️  NOT FOUND: {filename}")
            continue
        
        success, message = add_analytics(filepath)
        if success:
            print(f"✅ ADDED:    {filename}")
            added += 1
        elif "Already" in message:
            print(f"⏭️  SKIP:     {filename} (already has analytics)")
            skipped += 1
        else:
            print(f"❌ ERROR:    {filename} - {message}")
            errors += 1
    
    print()
    print("=" * 60)
    print(f"RESULTS: {added} added, {skipped} skipped, {errors} errors")
    print("=" * 60)
    
    return added

if __name__ == '__main__':
    added = main()
    exit(0 if added > 0 else 1)
