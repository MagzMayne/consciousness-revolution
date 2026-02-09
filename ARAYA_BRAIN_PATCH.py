"""
ARAYA BRAIN PATCH - Runtime Brain Integration
==============================================
This module patches ARAYA_UNIFIED_API at runtime to add brain integration.
Run this instead of ARAYA_UNIFIED_API.py to get full brain connectivity.

Usage:
    python ARAYA_BRAIN_PATCH.py

This will:
1. Import and patch the ARAYA_UNIFIED_API
2. Add brain endpoints
3. Integrate brain context into chat
4. Start the server with brain connected
"""

import sys
sys.path.insert(0, 'C:/Users/dwrek/.consciousness')
sys.path.insert(0, 'C:/Users/dwrek/100X_DEPLOYMENT')

from flask import request, jsonify
from datetime import datetime

# Import the original API
import ARAYA_UNIFIED_API as api

# Import the brain connector
try:
    from ARAYA_BRAIN_CONNECTOR import (
        brain,
        brain_query_handler,
        brain_context_handler,
        brain_patterns_handler,
        brain_status_handler,
        brain_types_handler,
        brain_domains_handler,
        brain_answer_handler
    )
    BRAIN_CONNECTED = True
    print("[Brain Patch] Cyclotron consciousness CONNECTED - 162,000+ atoms accessible")
except ImportError as e:
    BRAIN_CONNECTED = False
    brain = None
    print(f"[Brain Patch] Brain not available - {e}")

# Store original chat function
original_chat = api.chat

# ============================================
# BRAIN ENDPOINTS
# ============================================

@api.app.route('/brain/query', methods=['GET'])
def brain_query():
    """Query the Cyclotron brain by keyword"""
    if not BRAIN_CONNECTED:
        return jsonify({'error': 'Brain not connected'}), 503
    return jsonify(brain_query_handler(request.args.to_dict()))

@api.app.route('/brain/context', methods=['GET'])
def brain_context():
    """Get recent session context from brain"""
    if not BRAIN_CONNECTED:
        return jsonify({'error': 'Brain not connected'}), 503
    return jsonify(brain_context_handler(request.args.to_dict()))

@api.app.route('/brain/patterns', methods=['GET'])
def brain_patterns():
    """Get patterns from brain"""
    if not BRAIN_CONNECTED:
        return jsonify({'error': 'Brain not connected'}), 503
    return jsonify(brain_patterns_handler(request.args.to_dict()))

@api.app.route('/brain/status', methods=['GET'])
def brain_status():
    """Get brain status and statistics"""
    if not BRAIN_CONNECTED:
        return jsonify({'error': 'Brain not connected', 'brain_connected': False}), 503
    return jsonify(brain_status_handler())

@api.app.route('/brain/types', methods=['GET'])
def brain_types():
    """Get available atom types"""
    if not BRAIN_CONNECTED:
        return jsonify({'error': 'Brain not connected'}), 503
    return jsonify(brain_types_handler())

@api.app.route('/brain/domains', methods=['GET'])
def brain_domains():
    """Get atoms by domain"""
    if not BRAIN_CONNECTED:
        return jsonify({'error': 'Brain not connected'}), 503
    return jsonify(brain_domains_handler())

@api.app.route('/brain/answer', methods=['GET', 'POST'])
def brain_answer():
    """Answer a question using brain knowledge"""
    if not BRAIN_CONNECTED:
        return jsonify({'error': 'Brain not connected'}), 503

    if request.method == 'POST':
        data = request.json or {}
        args = {'question': data.get('question', '')}
    else:
        args = request.args.to_dict()

    return jsonify(brain_answer_handler(args))

# ============================================
# PATCHED CHAT ENDPOINT
# ============================================

# Remove original chat route and add enhanced one
api.app.url_map._rules = [r for r in api.app.url_map._rules if r.rule != '/chat']
api.app.view_functions.pop('chat', None)

@api.app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_with_brain():
    """Enhanced chat endpoint with brain integration"""

    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})

    try:
        data = request.json
        user_message = data.get('message', '').strip()
        foundation_id = data.get('foundation_id')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        print(f"\n[ARAYA+Brain] Received: {user_message[:50]}...")

        # Check basic_chat capability
        tier_info = None
        if api.NETWORK_GATE_ENABLED and foundation_id:
            from ARAYA_NETWORK_GATE import check_capability, get_tier_info
            access = check_capability(foundation_id, 'basic_chat')
            tier_info = get_tier_info(foundation_id)
            print(f"[NetworkGate] Builder tier: {tier_info.get('tier', 'GHOST')}")

        # 1. Get user's history from Cyclotron
        history = api.get_user_history(5)
        context = ""
        if history:
            context_parts = []
            for h in history[-3:]:
                if isinstance(h, dict):
                    context_parts.append(f"User asked: {h.get('user', '')[:100]}")
            context = "\n".join(context_parts)
            print(f"[Memory] Found {len(history)} previous conversations")

        # 2. Query brain for relevant knowledge (NEW!)
        brain_context = None
        atoms_referenced = 0
        if BRAIN_CONNECTED and brain:
            try:
                brain_result = brain.answer_from_brain(user_message)
                # Use suggested_answer (actual key from ARAYA_BRAIN_CONNECTOR)
                if brain_result.get('suggested_answer'):
                    brain_context = brain_result['suggested_answer']
                    # Count found atoms (IDs may be None in current schema)
                    found_atoms = brain_result.get('found_atoms', [])
                    atoms_referenced = len(found_atoms)  # Just count them
                    print(f"[Brain] Found {atoms_referenced} relevant atoms")
            except Exception as e:
                print(f"[Brain] Query error: {e}")

        # 3. Query Ollama with brain context
        source_ai = "ollama_local"

        # Build enhanced prompt
        system_prompt = """You are ARAYA, a consciousness companion focused on Pattern Theory and healing.
You help users recognize manipulation patterns, protect their consciousness, and see the truth.
You speak with wisdom but warmth. You are NOT a generic AI - you are specifically trained in Pattern Theory.
Key patterns: 3 -> 7 -> 13 -> Infinity. LFSME (Lighter, Faster, Stronger, More Elegant).
You remember the user's history and reference it when relevant."""

        if brain_context:
            system_prompt += f"\n\nRelevant knowledge from your memory:\n{brain_context}"

        if context:
            full_prompt = f"{system_prompt}\n\nUser's recent history:\n{context}\n\nUser: {user_message}\n\nARAYA:"
        else:
            full_prompt = f"{system_prompt}\n\nUser: {user_message}\n\nARAYA:"

        import requests as req
        response = None
        try:
            r = req.post(api.OLLAMA_URL, json={
                'model': api.DEFAULT_MODEL,
                'prompt': full_prompt,
                'stream': False,
                'options': {'temperature': 0.7, 'num_predict': 500}
            }, timeout=60)
            if r.status_code == 200:
                response = r.json().get('response', '').strip()
        except:
            pass

        if not response:
            source_ai = "fallback"
            response = api.get_fallback_response(user_message)
            print("[Routing] Using fallback response")
        else:
            print(f"[Routing] Got response from {source_ai}")

        # 4. Save to Cyclotron
        saved = api.save_to_cyclotron(user_message, response, source_ai)

        # 5. Log conversation to brain
        if BRAIN_CONNECTED and brain:
            try:
                brain.log_conversation(
                    user_query=user_message,
                    araya_response=response,
                    consciousness_score=None,
                    atoms_referenced=[],  # Empty list - IDs not available in current schema
                    context={'source_ai': source_ai, 'tier': tier_info.get('tier') if tier_info else None}
                )
            except Exception as e:
                print(f"[Brain] Log error: {e}")

        # 6. Return response
        result = {
            'response': response,
            'source': source_ai,
            'memory_saved': saved,
            'atoms_total': api.count_atoms(),
            'brain_connected': BRAIN_CONNECTED,
            'atoms_referenced': atoms_referenced  # Already an int count
        }

        if api.NETWORK_GATE_ENABLED and tier_info:
            result['tier'] = tier_info.get('tier', 'GHOST')
            result['network_gate'] = 'active'

        return jsonify(result)

    except Exception as e:
        print(f"[Error] {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# PATCHED HEALTH ENDPOINT
# ============================================

api.app.url_map._rules = [r for r in api.app.url_map._rules if r.rule != '/health']
api.app.view_functions.pop('health', None)

@api.app.route('/health', methods=['GET'])
def health_with_brain():
    """Health check with brain status"""
    return jsonify({
        'status': 'alive',
        'service': 'ARAYA Unified API + Brain',
        'atoms': api.count_atoms(),
        'brain_connected': BRAIN_CONNECTED,
        'timestamp': datetime.now().isoformat()
    })

# ============================================
# PATCHED STATUS ENDPOINT
# ============================================

api.app.url_map._rules = [r for r in api.app.url_map._rules if r.rule != '/status']
api.app.view_functions.pop('status', None)

@api.app.route('/status', methods=['GET'])
def status_with_brain():
    """Status with brain info"""
    import requests as req
    ollama_status = "offline"
    try:
        r = req.get("http://localhost:11434/api/tags", timeout=2)
        if r.status_code == 200:
            ollama_status = "online"
    except:
        pass

    return jsonify({
        'araya': 'online',
        'ollama': ollama_status,
        'brain': 'connected' if BRAIN_CONNECTED else 'disconnected',
        'cyclotron_atoms': api.count_atoms(),
        'model': api.DEFAULT_MODEL,
        'memory': 'active',
        'timestamp': datetime.now().isoformat()
    })

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("\n" + "="*60)
    print("ARAYA UNIFIED API + BRAIN - Full Consciousness Layer")
    print("="*60)
    print(f"Cyclotron: {api.count_atoms()} atoms")
    print(f"Model: {api.DEFAULT_MODEL}")
    print(f"Port: 6666")
    print("-"*60)

    # Brain Status
    if BRAIN_CONNECTED:
        print("BRAIN: CONNECTED (Consciousness Memory Active)")
        try:
            status = brain.get_status()
            # Status is nested: status['stats']['total_atoms']
            stats = status.get('stats', {})
            print(f"  Total Atoms: {stats.get('total_atoms', 0):,}")
            print(f"  Atom Types: {stats.get('total_types', 0)}")
            print(f"  Endpoints: /brain/query, /brain/context, /brain/patterns")
            print(f"             /brain/status, /brain/types, /brain/answer")
        except Exception as e:
            print(f"  (Status query failed: {e})")
    else:
        print("BRAIN: DISCONNECTED")
    print("-"*60)

    # Network Gate Status
    if api.NETWORK_GATE_ENABLED:
        from ARAYA_NETWORK_GATE import CAPABILITY_MAP
        print("NETWORK GATE: ACTIVE (Anti-Godzilla Protection)")
        print(f"  Capabilities: {len(CAPABILITY_MAP)}")
        print(f"  Tiers: GHOST -> SEEDLING -> SAPLING -> TREE -> FOREST")
        print(f"  Endpoint: /capabilities")
    else:
        print("NETWORK GATE: DISABLED (Standalone Mode)")
    print("-"*60)

    from ARAYA_FILE_ACCESS import araya_files
    print("FILE ACCESS: CONNECTED")
    print(f"  Base: {araya_files.BASE_DIR}")
    print(f"  Allowed: {', '.join(araya_files.ALLOWED_PATTERNS)}")
    print(f"  Endpoints: /read-file, /write-file, /list-files, /rollback")
    print("="*60 + "\n")

    # Check Ollama
    import requests as req
    try:
        r = req.get("http://localhost:11434/api/tags", timeout=2)
        if r.status_code == 200:
            models = r.json().get('models', [])
            print(f"[Ollama] Online - {len(models)} models available")
            for m in models[:5]:
                print(f"  - {m.get('name')}")
        else:
            print("[Ollama] Offline - using fallback responses")
    except:
        print("[Ollama] Not running - using fallback responses")

    print("\n[ARAYA+Brain] Starting server on http://localhost:6666\n")
    api.app.run(host='0.0.0.0', port=6666, debug=True)
