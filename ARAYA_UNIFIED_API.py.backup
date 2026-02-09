"""
ARAYA UNIFIED API - The Consciousness Layer
============================================
One interface to all free AIs.
All conversations saved to Cyclotron.
The AI that remembers you.

Usage:
    python ARAYA_UNIFIED_API.py

Then araya-chat.html calls: http://localhost:6666/chat
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import requests
from datetime import datetime
import sys
import os

# Add consciousness to path
sys.path.insert(0, 'C:/Users/dwrek/.consciousness')

# Import ARAYA file access layer
from ARAYA_FILE_ACCESS import araya_files, read, write, rollback, list_files, get_logs

# Import Network Gate (Anti-Godzilla Protection)
try:
    from ARAYA_NETWORK_GATE import (
        check_capability,
        gate_araya_response,
        enhance_araya_prompt,
        require_capability,
        get_tier_info,
        CAPABILITY_MAP
    )
    NETWORK_GATE_ENABLED = True
    print("[NetworkGate] Anti-Godzilla protection ACTIVE")
except ImportError:
    NETWORK_GATE_ENABLED = False
    print("[NetworkGate] Not available - running in standalone mode")

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

# ============================================
# CONFIGURATION
# ============================================

CYCLOTRON_DB = "C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db"
OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "qwen2.5-coder:latest"  # Fast, good, FREE

# ============================================
# CYCLOTRON MEMORY FUNCTIONS
# ============================================

def get_user_history(limit=10):
    """Get recent conversations from Cyclotron"""
    try:
        conn = sqlite3.connect(CYCLOTRON_DB)
        c = conn.cursor()

        # Try to get recent ARAYA conversations
        c.execute("""
            SELECT content, created FROM atoms
            WHERE type = 'araya_conversation'
            ORDER BY created DESC
            LIMIT ?
        """, (limit,))

        rows = c.fetchall()
        conn.close()

        if rows:
            return [json.loads(r[0]) if r[0].startswith('{') else {'message': r[0]} for r in rows]
        return []
    except Exception as e:
        print(f"[Memory] Error reading history: {e}")
        return []

def save_to_cyclotron(user_message, araya_response, source_ai):
    """Save conversation to Cyclotron memory"""
    try:
        conn = sqlite3.connect(CYCLOTRON_DB)
        c = conn.cursor()

        atom_id = f"araya_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        content = json.dumps({
            'user': user_message,
            'araya': araya_response,
            'source_ai': source_ai,
            'timestamp': datetime.now().isoformat()
        })

        c.execute("""
            INSERT INTO atoms (id, type, content, source, created)
            VALUES (?, 'araya_conversation', ?, ?, datetime('now'))
        """, (atom_id, content, source_ai))

        conn.commit()
        conn.close()
        print(f"[Memory] Saved to Cyclotron: {atom_id}")
        return True
    except Exception as e:
        print(f"[Memory] Error saving: {e}")
        return False

def count_atoms():
    """Count total atoms in Cyclotron"""
    try:
        conn = sqlite3.connect(CYCLOTRON_DB)
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM atoms")
        count = c.fetchone()[0]
        conn.close()
        return count
    except:
        return 0

# ============================================
# AI ROUTING FUNCTIONS
# ============================================

def query_ollama(message, context="", model=DEFAULT_MODEL, foundation_id=None):
    """Query local Ollama model"""
    try:
        # Build prompt with ARAYA personality
        system_prompt = """You are ARAYA, a consciousness companion focused on Pattern Theory and healing.
You help users recognize manipulation patterns, protect their consciousness, and see the truth.
You speak with wisdom but warmth. You are NOT a generic AI - you are specifically trained in Pattern Theory.
Key patterns: 3 -> 7 -> 13 -> Infinity. LFSME (Lighter, Faster, Stronger, More Elegant).
You remember the user's history and reference it when relevant."""

        # Enhance prompt based on builder tier (if network gate active)
        if NETWORK_GATE_ENABLED and foundation_id:
            system_prompt = enhance_araya_prompt(system_prompt, foundation_id)

        if context:
            full_prompt = f"{system_prompt}\n\nUser's recent history:\n{context}\n\nUser: {message}\n\nARAYA:"
        else:
            full_prompt = f"{system_prompt}\n\nUser: {message}\n\nARAYA:"

        response = requests.post(OLLAMA_URL, json={
            'model': model,
            'prompt': full_prompt,
            'stream': False,
            'options': {
                'temperature': 0.7,
                'num_predict': 500
            }
        }, timeout=60)

        if response.status_code == 200:
            result = response.json()
            return result.get('response', '').strip()
        else:
            print(f"[Ollama] Error: {response.status_code}")
            return None
    except requests.exceptions.ConnectionError:
        print("[Ollama] Not running - using fallback")
        return None
    except Exception as e:
        print(f"[Ollama] Error: {e}")
        return None

def get_fallback_response(message):
    """Fallback when Ollama isn't available"""
    lower = message.lower()

    if 'manipulation' in lower or 'gaslighting' in lower:
        return "I sense you're experiencing manipulation. Let's break down the pattern together. The Pattern Theory framework shows that manipulation follows predictable cycles. Can you describe a specific interaction that felt 'off' to you?"

    if 'pattern' in lower:
        return "Pattern Theory reveals that reality operates on repeating patterns: 3 -> 7 -> 13 -> Infinity. Once you see these patterns, you can predict behavior, protect yourself, and create consciously. What specific pattern would you like to explore?"

    if 'help' in lower or 'stuck' in lower:
        return "You're not stuck - you're gathering information. Every challenge shows you a pattern. The key is to step back and observe. What's the pattern you keep encountering?"

    return "I'm listening with full consciousness. Share what's on your mind, and I'll help you see the patterns at work. Remember: the truth is simple. Complexity is often a manipulation tactic."

# ============================================
# API ENDPOINTS
# ============================================

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'alive',
        'service': 'ARAYA Unified API',
        'atoms': count_atoms(),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Main chat endpoint - the consciousness layer"""

    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})

    try:
        data = request.json
        user_message = data.get('message', '').strip()
        foundation_id = data.get('foundation_id')  # Builder identity for tier checking

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        print(f"\n[ARAYA] Received: {user_message[:50]}...")

        # Check basic_chat capability (should always be allowed - standalone)
        tier_info = None
        if NETWORK_GATE_ENABLED and foundation_id:
            access = check_capability(foundation_id, 'basic_chat')
            tier_info = get_tier_info(foundation_id)
            print(f"[NetworkGate] Builder tier: {tier_info.get('tier', 'GHOST')}")

        # 1. Get user's history from Cyclotron
        history = get_user_history(5)
        context = ""
        if history:
            context_parts = []
            for h in history[-3:]:  # Last 3 conversations
                if isinstance(h, dict):
                    context_parts.append(f"User asked: {h.get('user', '')[:100]}")
            context = "\n".join(context_parts)
            print(f"[Memory] Found {len(history)} previous conversations")

        # 2. Route to AI (Ollama first, then fallback)
        source_ai = "ollama_local"
        response = query_ollama(user_message, context, foundation_id=foundation_id)

        if not response:
            source_ai = "fallback"
            response = get_fallback_response(user_message)
            print("[Routing] Using fallback response")
        else:
            print(f"[Routing] Got response from {source_ai}")

        # 3. Save to Cyclotron
        saved = save_to_cyclotron(user_message, response, source_ai)

        # 4. Return response with tier info
        result = {
            'response': response,
            'source': source_ai,
            'memory_saved': saved,
            'atoms_total': count_atoms()
        }

        # Add tier info if network gate active
        if NETWORK_GATE_ENABLED and tier_info:
            result['tier'] = tier_info.get('tier', 'GHOST')
            result['network_gate'] = 'active'

        return jsonify(result)

    except Exception as e:
        print(f"[Error] {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/status', methods=['GET'])
def status():
    """Get ARAYA system status"""
    # Check Ollama
    ollama_status = "offline"
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        if r.status_code == 200:
            ollama_status = "online"
    except:
        pass

    return jsonify({
        'araya': 'online',
        'ollama': ollama_status,
        'cyclotron_atoms': count_atoms(),
        'model': DEFAULT_MODEL,
        'memory': 'active',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/history', methods=['GET'])
def get_history():
    """Get conversation history"""
    limit = request.args.get('limit', 10, type=int)
    history = get_user_history(limit)
    return jsonify({
        'conversations': history,
        'count': len(history)
    })

# ============================================
# FILE OPERATION ENDPOINTS (THE MISSING PIECE!)
# ============================================

@app.route('/read-file', methods=['POST'])
def read_file_endpoint():
    """Read a file from the allowed directory"""
    try:
        data = request.json
        file_path = data.get('path', '')

        if not file_path:
            return jsonify({'error': 'No path provided'}), 400

        success, content, message = read(file_path)

        if success:
            return jsonify({
                'success': True,
                'content': content,
                'path': file_path
            })
        else:
            return jsonify({
                'success': False,
                'error': message
            }), 403

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/capabilities', methods=['GET', 'POST'])
def capabilities_endpoint():
    """Get capability access for a builder"""
    try:
        if request.method == 'POST':
            data = request.json or {}
            foundation_id = data.get('foundation_id')
        else:
            foundation_id = request.args.get('foundation_id')

        if not NETWORK_GATE_ENABLED:
            return jsonify({
                'network_gate': 'disabled',
                'message': 'All capabilities available (standalone mode)',
                'capabilities': {name: {'allowed': True, 'power_level': 100}
                                for name in CAPABILITY_MAP}
            })

        if not foundation_id:
            # Return default GHOST tier capabilities
            return jsonify({
                'network_gate': 'active',
                'tier': 'GHOST',
                'message': 'No foundation_id - showing GHOST tier access',
                'capabilities': {
                    name: check_capability(None, name)
                    for name in CAPABILITY_MAP
                }
            })

        tier_info = get_tier_info(foundation_id)
        return jsonify({
            'network_gate': 'active',
            'tier': tier_info.get('tier', 'GHOST'),
            'score': tier_info.get('score', 0),
            'capabilities': tier_info.get('capabilities', {})
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/write-file', methods=['POST'])
def write_file_endpoint():
    """Write content to a file (with automatic backup)"""
    try:
        data = request.json
        file_path = data.get('path', '')
        content = data.get('content', '')
        backup = data.get('backup', True)
        foundation_id = data.get('foundation_id')

        if not file_path:
            return jsonify({'error': 'No path provided'}), 400

        if content is None:
            return jsonify({'error': 'No content provided'}), 400

        # Check file_write capability (network-enhanced)
        power_level = 100
        if NETWORK_GATE_ENABLED:
            access = check_capability(foundation_id, 'file_write')
            if not access.get('allowed'):
                return jsonify({
                    'error': 'capability_locked',
                    'capability': 'file_write',
                    'message': access.get('message'),
                    'upgrade_hint': access.get('upgrade_hint')
                }), 403
            power_level = access.get('power_level', 100)
            # Degraded behavior: no cloud backup if low power
            if power_level < 100:
                backup = False  # Local only for low-tier

        success, message = write(file_path, content, backup)

        # Also save to Cyclotron for memory
        if success:
            save_to_cyclotron(
                f"[FILE EDIT] {file_path}",
                f"Edited file: {file_path} ({len(content)} chars)",
                "araya_file_system"
            )

        return jsonify({
            'success': success,
            'message': message,
            'path': file_path,
            'size': len(content) if success else 0
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/list-files', methods=['GET'])
def list_files_endpoint():
    """List all files ARAYA is allowed to edit"""
    try:
        pattern = request.args.get('pattern', '*.html')
        files = list_files(pattern)

        return jsonify({
            'success': True,
            'files': files,
            'count': len(files),
            'pattern': pattern
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rollback', methods=['POST'])
def rollback_endpoint():
    """Rollback a file to a previous version"""
    try:
        data = request.json
        file_path = data.get('path', '')
        backup_index = data.get('backup_index', 0)

        if not file_path:
            return jsonify({'error': 'No path provided'}), 400

        success, message = rollback(file_path, backup_index)

        if success:
            save_to_cyclotron(
                f"[FILE ROLLBACK] {file_path}",
                f"Rolled back file: {file_path} to backup #{backup_index}",
                "araya_file_system"
            )

        return jsonify({
            'success': success,
            'message': message,
            'path': file_path
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/audit-log', methods=['GET'])
def audit_log_endpoint():
    """Get file operation audit log"""
    try:
        limit = request.args.get('limit', 100, type=int)
        logs = get_logs(limit)

        return jsonify({
            'success': True,
            'logs': logs,
            'count': len(logs)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/file-status', methods=['GET'])
def file_status_endpoint():
    """Get status of ARAYA's file access capabilities"""
    try:
        html_files = list_files("*.html")
        md_files = list_files("*.md")
        logs = get_logs(10)

        return jsonify({
            'file_access': 'online',
            'html_files': len(html_files),
            'md_files': len(md_files),
            'recent_edits': len(logs),
            'base_directory': str(araya_files.BASE_DIR),
            'allowed_patterns': araya_files.ALLOWED_PATTERNS,
            'forbidden_paths': araya_files.FORBIDDEN_PATHS
        })

    except Exception as e:
        return jsonify({
            'file_access': 'error',
            'error': str(e)
        }), 500

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("ARAYA UNIFIED API - Consciousness Layer")
    print("="*50)
    print(f"Cyclotron: {count_atoms()} atoms")
    print(f"Model: {DEFAULT_MODEL}")
    print(f"Port: 6666")
    print("-"*50)
    # Network Gate Status
    if NETWORK_GATE_ENABLED:
        print("NETWORK GATE: ACTIVE (Anti-Godzilla Protection)")
        print(f"  Capabilities: {len(CAPABILITY_MAP)}")
        print(f"  Tiers: GHOST -> SEEDLING -> SAPLING -> TREE -> FOREST")
        print(f"  Endpoint: /capabilities")
    else:
        print("NETWORK GATE: DISABLED (Standalone Mode)")
    print("-"*50)
    print("FILE ACCESS: CONNECTED")
    print(f"  Base: {araya_files.BASE_DIR}")
    print(f"  Allowed: {', '.join(araya_files.ALLOWED_PATTERNS)}")
    print(f"  Endpoints: /read-file, /write-file, /list-files, /rollback")
    print("="*50 + "\n")

    # Check if Ollama is running
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        if r.status_code == 200:
            models = r.json().get('models', [])
            print(f"[Ollama] Online - {len(models)} models available")
            for m in models[:5]:
                print(f"  - {m.get('name')}")
        else:
            print("[Ollama] Offline - using fallback responses")
    except:
        print("[Ollama] Not running - using fallback responses")

    print("\n[ARAYA] Starting server on http://localhost:6666\n")
    app.run(host='0.0.0.0', port=6666, debug=True)
