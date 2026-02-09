"""
ARAYA FILE WRITER - Flask endpoint for live website editing
Allows ARAYA to write/edit files within ALLOWED domains
Security: Only allows writes within configured domain roots

DOMAINS:
- consciousness: 100X_DEPLOYMENT (default)
- legal: Pro Se Shield legal tools
- command: Desktop command center
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# DOMAIN CONFIGURATION - Multi-domain support
ALLOWED_ROOTS = {
    "consciousness": "C:/Users/dwrek/100X_DEPLOYMENT",
    "legal": "C:/Users/dwrek/Desktop/2_BUILD/PRO_SE_SHIELD",
    "command": "C:/Users/dwrek/Desktop/1_COMMAND",
}

DOMAIN_INFO = {
    "consciousness": {
        "name": "Consciousness Revolution",
        "description": "100X Platform - main website and tools",
        "color": "#00ff88"
    },
    "legal": {
        "name": "Pro Se Shield",
        "description": "Legal tools - court, patterns, documents",
        "color": "#ff6b6b"
    },
    "command": {
        "name": "Command Center",
        "description": "Desktop command files and protocols",
        "color": "#ffd700"
    }
}

# Backward compatibility
ALLOWED_ROOT = ALLOWED_ROOTS["consciousness"]
DEFAULT_DOMAIN = "consciousness"


def is_safe_path(path, domain=None):
    """Validate path is within allowed roots"""
    try:
        real_path = os.path.realpath(path)
        
        # If domain specified, check only that domain
        if domain and domain in ALLOWED_ROOTS:
            real_root = os.path.realpath(ALLOWED_ROOTS[domain])
            return real_path.startswith(real_root)
        
        # Otherwise check all allowed roots
        for root in ALLOWED_ROOTS.values():
            real_root = os.path.realpath(root)
            if real_path.startswith(real_root):
                return True
        return False
    except:
        return False


def get_domain_for_path(path):
    """Detect which domain a path belongs to"""
    try:
        real_path = os.path.realpath(path)
        for domain, root in ALLOWED_ROOTS.items():
            real_root = os.path.realpath(root)
            if real_path.startswith(real_root):
                return domain
        return None
    except:
        return None


def resolve_path(file_path, domain=None):
    """
    Resolve file path with domain awareness.
    Returns (absolute_path, detected_domain)
    """
    if os.path.isabs(file_path):
        # Absolute path - detect domain
        detected = get_domain_for_path(file_path)
        return file_path, detected
    else:
        # Relative path - use specified domain or default
        use_domain = domain if domain in ALLOWED_ROOTS else DEFAULT_DOMAIN
        root = ALLOWED_ROOTS[use_domain]
        return os.path.join(root, file_path), use_domain


@app.route('/write-file', methods=['POST'])
def write_file():
    """
    Write/edit files within allowed domains

    Expected JSON:
    {
        "file_path": "relative/or/absolute/path.html",
        "content": "file content here",
        "action": "write|append|edit",
        "domain": "consciousness|legal|command" (optional)
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        file_path = data.get('file_path')
        content = data.get('content')
        action = data.get('action', 'write')
        domain = data.get('domain')  # NEW: domain parameter

        if not file_path:
            return jsonify({"error": "Missing file_path"}), 400

        if action != 'edit' and content is None:
            return jsonify({"error": "Missing content"}), 400

        # Resolve path with domain awareness
        file_path, detected_domain = resolve_path(file_path, domain)

        # Security check
        if not is_safe_path(file_path, detected_domain):
            return jsonify({
                "error": "Security violation: Path outside allowed roots",
                "path": file_path,
                "allowed_domains": list(ALLOWED_ROOTS.keys())
            }), 403

        # Create directory if needed
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Perform action
        if action == 'write':
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

        elif action == 'append':
            with open(file_path, 'a', encoding='utf-8') as f:
                f.write(content)

        elif action == 'edit':
            old_string = data.get('old_string')
            new_string = data.get('new_string')

            if not old_string or new_string is None:
                return jsonify({"error": "Edit action requires old_string and new_string"}), 400

            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    existing = f.read()
            else:
                existing = ""

            if old_string not in existing:
                return jsonify({
                    "error": "old_string not found in file",
                    "old_string": old_string[:100]
                }), 400

            new_content = existing.replace(old_string, new_string)

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

        else:
            return jsonify({"error": f"Unknown action: {action}"}), 400

        # Verify write
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)

            return jsonify({
                "success": True,
                "file_path": file_path,
                "action": action,
                "size": file_size,
                "domain": detected_domain,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "error": "Write appeared to succeed but file not found",
                "file_path": file_path
            }), 500

    except Exception as e:
        return jsonify({
            "error": str(e),
            "type": type(e).__name__
        }), 500


@app.route('/read-file', methods=['POST'])
def read_file():
    """Read file contents (for verification)"""
    try:
        data = request.get_json()
        file_path = data.get('file_path')
        domain = data.get('domain')

        if not file_path:
            return jsonify({"error": "Missing file_path"}), 400

        # Resolve path with domain awareness
        file_path, detected_domain = resolve_path(file_path, domain)

        # Security check
        if not is_safe_path(file_path, detected_domain):
            return jsonify({"error": "Security violation"}), 403

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        return jsonify({
            "success": True,
            "file_path": file_path,
            "content": content,
            "size": len(content),
            "domain": detected_domain
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/list-files', methods=['POST'])
def list_files():
    """List files in directory"""
    try:
        data = request.get_json()
        dir_path = data.get('dir_path', '.')
        domain = data.get('domain')

        # Resolve path with domain awareness
        dir_path, detected_domain = resolve_path(dir_path, domain)

        # Security check
        if not is_safe_path(dir_path, detected_domain):
            return jsonify({"error": "Security violation"}), 403

        if not os.path.exists(dir_path):
            return jsonify({"error": "Directory not found"}), 404

        files = []
        for item in os.listdir(dir_path):
            item_path = os.path.join(dir_path, item)
            files.append({
                "name": item,
                "type": "dir" if os.path.isdir(item_path) else "file",
                "size": os.path.getsize(item_path) if os.path.isfile(item_path) else 0
            })

        return jsonify({
            "success": True,
            "dir_path": dir_path,
            "files": files,
            "domain": detected_domain
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/domains', methods=['GET'])
def list_domains():
    """List all available domains and their status"""
    domains = []
    for domain_key, root_path in ALLOWED_ROOTS.items():
        info = DOMAIN_INFO.get(domain_key, {})
        exists = os.path.exists(root_path)
        file_count = 0
        if exists:
            try:
                file_count = len([f for f in os.listdir(root_path) if os.path.isfile(os.path.join(root_path, f))])
            except:
                pass
        
        domains.append({
            "key": domain_key,
            "name": info.get("name", domain_key),
            "description": info.get("description", ""),
            "color": info.get("color", "#888888"),
            "root": root_path,
            "exists": exists,
            "file_count": file_count
        })
    
    return jsonify({
        "success": True,
        "domains": domains,
        "default": DEFAULT_DOMAIN,
        "timestamp": datetime.now().isoformat()
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check with domain status"""
    domain_status = {}
    for domain, root in ALLOWED_ROOTS.items():
        domain_status[domain] = {
            "root": root,
            "exists": os.path.exists(root),
            "writable": os.access(root, os.W_OK) if os.path.exists(root) else False
        }
    
    return jsonify({
        "status": "alive",
        "domains": domain_status,
        "default_domain": DEFAULT_DOMAIN,
        "timestamp": datetime.now().isoformat()
    })


if __name__ == '__main__':
    print(f"ARAYA FILE WRITER starting...")
    print(f"MULTI-DOMAIN MODE ENABLED")
    print(f"Domains configured:")
    for domain, root in ALLOWED_ROOTS.items():
        status = "OK" if os.path.exists(root) else "MISSING"
        print(f"  - {domain}: {root} [{status}]")
    print(f"Running on http://localhost:5001")

    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
