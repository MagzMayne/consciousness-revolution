#!/usr/bin/env python3
"""
OFFLINE_CLI.py - Simple Offline Operations Terminal
====================================================
Minimal CLI for local operations when internet is unavailable.
Uses Ollama for AI, no external dependencies.

Usage:
    python OFFLINE_CLI.py                 # Interactive mode
    python OFFLINE_CLI.py ask "question"  # Quick question
    python OFFLINE_CLI.py status          # System status
    python OFFLINE_CLI.py scan            # Quick scan
    python OFFLINE_CLI.py fix             # Auto-fix common issues
    python OFFLINE_CLI.py brain "query"   # Query local brain

Requirements:
    - Python 3.8+ (no pip installs needed!)
    - Ollama running locally (optional for AI features)

Author: C1 Mechanic | Created: 2026-02-27 | M28 Machine Task
Pattern: 3 → 7 → 13 → ∞ | LFSME
"""

import os
import sys
import json
import subprocess
import sqlite3
from pathlib import Path
from datetime import datetime

# ============================================================================
# CONFIGURATION
# ============================================================================

VERSION = "1.0.0"
APP_NAME = "OFFLINE_CLI"

# Paths
HOME = Path.home()
BRAIN_DB = HOME / ".consciousness" / "cyclotron_core" / "atoms.db"
CONFIG_DIR = HOME / ".offline_cli"
HISTORY_FILE = CONFIG_DIR / "history.json"

# Ollama settings
OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3.2:latest"  # Fast, small model

# Colors for terminal
class Colors:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    END = "\033[0m"

def c(text, color):
    """Colorize text"""
    return f"{color}{text}{Colors.END}"


# ============================================================================
# OLLAMA INTEGRATION
# ============================================================================

def check_ollama() -> bool:
    """Check if Ollama is running"""
    try:
        import urllib.request
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
        with urllib.request.urlopen(req, timeout=2) as resp:
            return resp.status == 200
    except:
        return False


def ask_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """Ask Ollama a question"""
    try:
        import urllib.request
        import json as json_lib

        data = json_lib.dumps({
            "model": model,
            "prompt": prompt,
            "stream": False
        }).encode('utf-8')

        req = urllib.request.Request(
            f"{OLLAMA_URL}/api/generate",
            data=data,
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json_lib.loads(resp.read().decode())
            return result.get("response", "No response")

    except Exception as e:
        return f"Error: {e}"


def list_models() -> list:
    """List available Ollama models"""
    try:
        import urllib.request
        import json as json_lib

        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
        with urllib.request.urlopen(req, timeout=5) as resp:
            result = json_lib.loads(resp.read().decode())
            return [m["name"] for m in result.get("models", [])]
    except:
        return []


# ============================================================================
# BRAIN QUERY
# ============================================================================

def query_brain(search_term: str, limit: int = 10) -> list:
    """Query the local Cyclotron brain"""

    if not BRAIN_DB.exists():
        return [{"error": f"Brain not found at {BRAIN_DB}"}]

    try:
        conn = sqlite3.connect(str(BRAIN_DB))
        cursor = conn.cursor()

        # Search in atoms table
        cursor.execute("""
            SELECT id, content, created_at
            FROM atoms
            WHERE content LIKE ?
            LIMIT ?
        """, (f"%{search_term}%", limit))

        results = []
        for row in cursor.fetchall():
            results.append({
                "id": row[0],
                "content": row[1][:200] + "..." if len(row[1]) > 200 else row[1],
                "created": row[2]
            })

        conn.close()
        return results

    except Exception as e:
        return [{"error": str(e)}]


def brain_stats() -> dict:
    """Get brain statistics"""

    if not BRAIN_DB.exists():
        return {"error": "Brain not found"}

    try:
        conn = sqlite3.connect(str(BRAIN_DB))
        cursor = conn.cursor()

        # Count atoms
        cursor.execute("SELECT COUNT(*) FROM atoms")
        atom_count = cursor.fetchone()[0]

        # Count tables
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        table_count = cursor.fetchone()[0]

        # Get DB size
        db_size = BRAIN_DB.stat().st_size / (1024 * 1024)  # MB

        conn.close()

        return {
            "atoms": atom_count,
            "tables": table_count,
            "size_mb": round(db_size, 2)
        }

    except Exception as e:
        return {"error": str(e)}


# ============================================================================
# SYSTEM COMMANDS
# ============================================================================

def system_status() -> dict:
    """Get system status"""

    status = {
        "timestamp": datetime.now().isoformat(),
        "ollama": "✅ Running" if check_ollama() else "❌ Not running",
        "models": list_models() if check_ollama() else [],
        "brain": brain_stats(),
        "python": sys.version.split()[0],
        "cwd": os.getcwd(),
        "home": str(HOME)
    }

    return status


def quick_scan() -> dict:
    """Quick system scan"""

    scan = {
        "timestamp": datetime.now().isoformat(),
        "checks": []
    }

    # Check Ollama
    if check_ollama():
        models = list_models()
        scan["checks"].append(f"✅ Ollama: {len(models)} models")
    else:
        scan["checks"].append("❌ Ollama: Not running")

    # Check brain
    if BRAIN_DB.exists():
        stats = brain_stats()
        scan["checks"].append(f"✅ Brain: {stats.get('atoms', 0):,} atoms")
    else:
        scan["checks"].append("❌ Brain: Not found")

    # Check key directories
    key_dirs = [
        ("100X_DEPLOYMENT", HOME / "100X_DEPLOYMENT"),
        (".consciousness", HOME / ".consciousness"),
        (".claude", HOME / ".claude"),
        ("Desktop", HOME / "Desktop")
    ]

    for name, path in key_dirs:
        if path.exists():
            scan["checks"].append(f"✅ {name}: Found")
        else:
            scan["checks"].append(f"⚠️ {name}: Missing")

    # Check git
    try:
        result = subprocess.run(["git", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            scan["checks"].append(f"✅ Git: {result.stdout.strip()}")
    except:
        scan["checks"].append("❌ Git: Not found")

    return scan


def auto_fix() -> list:
    """Auto-fix common issues"""

    fixes = []

    # Create config dir if missing
    if not CONFIG_DIR.exists():
        CONFIG_DIR.mkdir(parents=True)
        fixes.append("✅ Created config directory")

    # Check for common fix scenarios
    # 1. Ollama not running
    if not check_ollama():
        fixes.append("⚠️ Ollama not running - start with: ollama serve")

    # 2. Missing required dirs
    required_dirs = [
        HOME / ".consciousness",
        HOME / ".social_media_automation"
    ]
    for d in required_dirs:
        if not d.exists():
            d.mkdir(parents=True, exist_ok=True)
            fixes.append(f"✅ Created: {d}")

    if not fixes:
        fixes.append("✅ No issues found - system healthy!")

    return fixes


# ============================================================================
# INTERACTIVE MODE
# ============================================================================

def interactive_mode():
    """Interactive CLI mode"""

    print(f"\n{c('═' * 50, Colors.CYAN)}")
    print(f"{c(f' OFFLINE CLI v{VERSION}', Colors.BOLD)}")
    print(f"{c('═' * 50, Colors.CYAN)}")
    print(f"  Type {c('help', Colors.GREEN)} for commands, {c('exit', Colors.YELLOW)} to quit\n")

    # Show quick status
    ollama_status = "✅" if check_ollama() else "❌"
    brain_status = "✅" if BRAIN_DB.exists() else "❌"
    print(f"  Ollama: {ollama_status}  Brain: {brain_status}")
    print()

    while True:
        try:
            user_input = input(f"{c('>>> ', Colors.CYAN)}").strip()

            if not user_input:
                continue

            # Parse command
            parts = user_input.split(maxsplit=1)
            cmd = parts[0].lower()
            args = parts[1] if len(parts) > 1 else ""

            # Commands
            if cmd in ["exit", "quit", "q"]:
                print("👋 Goodbye!")
                break

            elif cmd == "help":
                print_help()

            elif cmd == "status":
                status = system_status()
                print(f"\n{c('System Status:', Colors.BOLD)}")
                print(f"  Ollama: {status['ollama']}")
                print(f"  Models: {', '.join(status['models'][:5]) if status['models'] else 'None'}")
                print(f"  Brain: {status['brain'].get('atoms', 'N/A')} atoms")
                print()

            elif cmd == "scan":
                scan = quick_scan()
                print(f"\n{c('Quick Scan:', Colors.BOLD)}")
                for check in scan["checks"]:
                    print(f"  {check}")
                print()

            elif cmd == "fix":
                fixes = auto_fix()
                print(f"\n{c('Auto-Fix Results:', Colors.BOLD)}")
                for fix in fixes:
                    print(f"  {fix}")
                print()

            elif cmd == "brain":
                if not args:
                    print("Usage: brain <search term>")
                    continue
                results = query_brain(args)
                print(f"\n{c(f'Brain results for: {args}', Colors.BOLD)}")
                for i, r in enumerate(results, 1):
                    if "error" in r:
                        print(f"  Error: {r['error']}")
                    else:
                        print(f"  {i}. {r['content'][:100]}...")
                print()

            elif cmd == "ask":
                if not args:
                    print("Usage: ask <question>")
                    continue
                if not check_ollama():
                    print("❌ Ollama not running. Start with: ollama serve")
                    continue
                print(f"\n{c('Thinking...', Colors.YELLOW)}")
                response = ask_ollama(args)
                print(f"\n{c('Response:', Colors.GREEN)}")
                print(response)
                print()

            elif cmd == "models":
                if not check_ollama():
                    print("❌ Ollama not running")
                    continue
                models = list_models()
                print(f"\n{c('Available Models:', Colors.BOLD)}")
                for m in models:
                    print(f"  - {m}")
                print()

            elif cmd == "clear":
                os.system('cls' if os.name == 'nt' else 'clear')

            else:
                print(f"Unknown command: {cmd}. Type 'help' for commands.")

        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")


def print_help():
    """Print help message"""
    print(f"""
{c('OFFLINE CLI Commands:', Colors.BOLD)}
{c('─' * 40, Colors.CYAN)}
  {c('ask', Colors.GREEN)} <question>  Ask Ollama a question
  {c('brain', Colors.GREEN)} <query>   Search local brain
  {c('status', Colors.GREEN)}          Show system status
  {c('scan', Colors.GREEN)}            Quick system scan
  {c('fix', Colors.GREEN)}             Auto-fix common issues
  {c('models', Colors.GREEN)}          List Ollama models
  {c('clear', Colors.GREEN)}           Clear screen
  {c('exit', Colors.GREEN)}            Exit CLI
""")


# ============================================================================
# CLI ENTRY POINT
# ============================================================================

def main():
    """Main entry point"""

    if len(sys.argv) < 2:
        interactive_mode()
        return

    cmd = sys.argv[1].lower()
    args = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""

    if cmd == "status":
        status = system_status()
        print(json.dumps(status, indent=2))

    elif cmd == "scan":
        scan = quick_scan()
        print(json.dumps(scan, indent=2))

    elif cmd == "fix":
        fixes = auto_fix()
        for fix in fixes:
            print(fix)

    elif cmd == "brain":
        if not args:
            print("Usage: python OFFLINE_CLI.py brain <query>")
            sys.exit(1)
        results = query_brain(args)
        for r in results:
            if "error" in r:
                print(f"Error: {r['error']}")
            else:
                print(f"[{r['id']}] {r['content']}")

    elif cmd == "ask":
        if not args:
            print("Usage: python OFFLINE_CLI.py ask <question>")
            sys.exit(1)
        if not check_ollama():
            print("Error: Ollama not running. Start with: ollama serve")
            sys.exit(1)
        response = ask_ollama(args)
        print(response)

    elif cmd in ["-h", "--help", "help"]:
        print(f"""
OFFLINE_CLI v{VERSION} - Simple Offline Operations Terminal

Usage:
    python OFFLINE_CLI.py                 Interactive mode
    python OFFLINE_CLI.py ask "question"  Ask Ollama
    python OFFLINE_CLI.py brain "query"   Query brain
    python OFFLINE_CLI.py status          System status
    python OFFLINE_CLI.py scan            Quick scan
    python OFFLINE_CLI.py fix             Auto-fix

Requirements: Python 3.8+, Ollama (optional)
        """)

    else:
        print(f"Unknown command: {cmd}")
        print("Run with --help for usage")
        sys.exit(1)


if __name__ == "__main__":
    main()
