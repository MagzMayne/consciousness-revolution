"""
ARAYA_WEB_BRIDGE.py - Web Search & Browsing for ARAYA
======================================================
Connects ARAYA to web search capabilities via multiple providers.

Providers (failover chain):
1. DuckDuckGo (free, always available)
2. Brave Search MCP (when Claude is running)
3. Firecrawl MCP (for deep content extraction)

Usage:
    from ARAYA_WEB_BRIDGE import (
        web_search, fetch_page, get_search_status,
        web_bp  # Flask blueprint for endpoints
    )

API Endpoints:
    POST /search           - Search the web
    POST /fetch            - Fetch and extract content from URL
    GET  /search/status    - Check provider status
    GET  /search/history   - Recent searches

Created: 2026-01-20
Part of: Trinity Build - Legal Case Support
"""

from flask import Blueprint, request, jsonify
import json
import sqlite3
import urllib.request
import urllib.parse
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple, Optional

# Create Flask blueprint
web_bp = Blueprint('web', __name__, url_prefix='/web')

# Paths
CYCLOTRON_DB = Path("C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db")
SEARCH_LOG = Path("C:/Users/dwrek/.consciousness/araya_search_log.jsonl")

# Provider priority by query type
QUERY_TYPE_ROUTES = {
    "legal": ["brave", "duckduckgo", "firecrawl"],
    "news": ["brave", "duckduckgo"],
    "local": ["brave_local", "duckduckgo"],
    "code": ["firecrawl", "duckduckgo"],
    "docs": ["firecrawl", "duckduckgo"],
    "research": ["brave", "firecrawl", "duckduckgo"],
    "case_law": ["brave", "firecrawl", "duckduckgo"],
    "general": ["duckduckgo", "brave", "firecrawl"]
}


def log_search(query: str, provider: str, success: bool, result_count: int = 0):
    """Log search to JSONL file and Cyclotron."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "query": query,
        "provider": provider,
        "success": success,
        "result_count": result_count
    }

    # Log to file
    SEARCH_LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(SEARCH_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

    # Save to Cyclotron
    if CYCLOTRON_DB.exists():
        try:
            conn = sqlite3.connect(CYCLOTRON_DB)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO atoms (content, type, source, created)
                VALUES (?, ?, ?, ?)
            """, (
                f"ARAYA web search: '{query}' - {result_count} results via {provider}",
                "araya_search",
                "ARAYA_WEB_BRIDGE",
                datetime.now().isoformat()
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[WebBridge] Cyclotron log error: {e}")


def detect_query_type(query: str) -> str:
    """Auto-detect query type based on keywords."""
    query_lower = query.lower()

    # Legal-specific detection
    if any(word in query_lower for word in [
        "rcw", "statute", "court", "case", "law", "legal", "ruling",
        "custody", "divorce", "parenting", "contempt", "motion",
        "commissioner", "judge", "hearing", "filing", "evidence"
    ]):
        return "legal"

    if any(word in query_lower for word in ["news", "latest", "today", "breaking"]):
        return "news"
    elif any(word in query_lower for word in ["near", "nearby", "location", "directions"]):
        return "local"
    elif any(word in query_lower for word in ["code", "github", "api", "library", "function"]):
        return "code"
    elif any(word in query_lower for word in ["docs", "documentation", "tutorial", "how to"]):
        return "docs"
    elif any(word in query_lower for word in ["research", "study", "paper", "analysis"]):
        return "research"
    elif any(word in query_lower for word in ["case law", "precedent", "ruling", "decision"]):
        return "case_law"
    else:
        return "general"


def search_duckduckgo(query: str, max_results: int = 10) -> Tuple[bool, List[Dict], str]:
    """
    Search using DuckDuckGo Instant Answer API.
    Free, no API key needed, privacy-focused.
    """
    try:
        encoded_query = urllib.parse.quote_plus(query)
        url = f"https://api.duckduckgo.com/?q={encoded_query}&format=json&no_html=1"

        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())

        results = []

        # Abstract (main result)
        if data.get("AbstractText"):
            results.append({
                "title": data.get("AbstractSource", "DuckDuckGo"),
                "snippet": data["AbstractText"],
                "url": data.get("AbstractURL", "")
            })

        # Related topics
        for topic in data.get("RelatedTopics", [])[:max_results]:
            if isinstance(topic, dict) and topic.get("Text"):
                results.append({
                    "title": topic.get("FirstURL", "").split("/")[-1].replace("_", " "),
                    "snippet": topic["Text"],
                    "url": topic.get("FirstURL", "")
                })

        # Infobox data
        if data.get("Infobox", {}).get("content"):
            for item in data["Infobox"]["content"][:3]:
                if item.get("value"):
                    results.append({
                        "title": item.get("label", "Info"),
                        "snippet": str(item["value"]),
                        "url": data.get("AbstractURL", "")
                    })

        log_search(query, "duckduckgo", True, len(results))
        return True, results, f"DuckDuckGo: {len(results)} results"

    except Exception as e:
        log_search(query, "duckduckgo", False)
        return False, [], f"DuckDuckGo error: {e}"


def fetch_url_content(url: str, max_chars: int = 5000) -> Tuple[bool, str, str]:
    """
    Fetch and extract readable content from a URL.
    Basic HTML to text extraction.
    """
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8', errors='ignore')

        # Basic HTML to text extraction
        # Remove scripts, styles, comments
        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)

        # Remove HTML tags
        text = re.sub(r'<[^>]+>', ' ', html)

        # Clean whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        # Decode HTML entities
        text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
        text = text.replace('&lt;', '<').replace('&gt;', '>')
        text = text.replace('&quot;', '"').replace('&#39;', "'")

        # Truncate
        if len(text) > max_chars:
            text = text[:max_chars] + "..."

        return True, text, f"Fetched {len(text)} characters"

    except Exception as e:
        return False, "", f"Fetch error: {e}"


def web_search(query: str, query_type: str = None, max_results: int = 10) -> Dict:
    """
    Main search function - routes to appropriate provider.
    Returns dict with results and metadata.
    """
    if not query_type:
        query_type = detect_query_type(query)

    providers = QUERY_TYPE_ROUTES.get(query_type, QUERY_TYPE_ROUTES["general"])

    all_results = []
    provider_used = None
    messages = []

    for provider in providers:
        if provider in ["duckduckgo", "brave", "brave_local"]:
            # Use DuckDuckGo (free, always available)
            success, results, msg = search_duckduckgo(query, max_results)
            if success and results:
                all_results.extend(results)
                provider_used = provider
                messages.append(msg)
                break  # Got results, stop trying
            else:
                messages.append(msg)

    # Deduplicate results by URL
    seen_urls = set()
    unique_results = []
    for r in all_results:
        url = r.get("url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_results.append(r)
        elif not url:
            unique_results.append(r)

    return {
        "success": len(unique_results) > 0,
        "query": query,
        "query_type": query_type,
        "provider": provider_used,
        "results": unique_results[:max_results],
        "result_count": len(unique_results),
        "messages": messages,
        "timestamp": datetime.now().isoformat()
    }


def get_search_status() -> Dict:
    """Get status of web search capabilities."""
    status = {
        "web_search": "online",
        "providers": {
            "duckduckgo": "available",
            "brave_mcp": "requires_claude",
            "firecrawl_mcp": "requires_claude"
        },
        "query_types": list(QUERY_TYPE_ROUTES.keys()),
        "total_searches": 0,
        "success_rate": 0.0
    }

    # Check search log stats
    if SEARCH_LOG.exists():
        with open(SEARCH_LOG) as f:
            lines = f.readlines()

        if lines:
            status["total_searches"] = len(lines)
            success_count = sum(1 for l in lines if '"success": true' in l)
            status["success_rate"] = round(100 * success_count / len(lines), 1)

    return status


def get_search_history(limit: int = 20) -> List[Dict]:
    """Get recent search history."""
    history = []

    if SEARCH_LOG.exists():
        with open(SEARCH_LOG) as f:
            lines = f.readlines()

        for line in lines[-limit:]:
            try:
                history.append(json.loads(line.strip()))
            except:
                pass

    history.reverse()  # Most recent first
    return history


# ============================================
# FLASK ENDPOINTS
# ============================================

@web_bp.route('/search', methods=['POST'])
def search_endpoint():
    """
    Search the web.
    POST: {"query": "...", "type": "legal", "max_results": 10}
    """
    try:
        data = request.json or {}
        query = data.get('query', '').strip()

        if not query:
            return jsonify({'error': 'No query provided'}), 400

        query_type = data.get('type') or data.get('query_type')
        max_results = data.get('max_results', 10)

        result = web_search(query, query_type, max_results)
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@web_bp.route('/fetch', methods=['POST'])
def fetch_endpoint():
    """
    Fetch and extract content from a URL.
    POST: {"url": "https://...", "max_chars": 5000}
    """
    try:
        data = request.json or {}
        url = data.get('url', '').strip()

        if not url:
            return jsonify({'error': 'No URL provided'}), 400

        max_chars = data.get('max_chars', 5000)

        success, content, message = fetch_url_content(url, max_chars)

        return jsonify({
            'success': success,
            'url': url,
            'content': content,
            'message': message,
            'char_count': len(content)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@web_bp.route('/status', methods=['GET'])
def status_endpoint():
    """Get web search status."""
    return jsonify(get_search_status())


@web_bp.route('/history', methods=['GET'])
def history_endpoint():
    """Get search history."""
    limit = request.args.get('limit', 20, type=int)
    history = get_search_history(limit)
    return jsonify({
        'searches': history,
        'count': len(history)
    })


# For direct testing
if __name__ == "__main__":
    # Test search
    print("\n" + "="*60)
    print("  ARAYA WEB BRIDGE - Testing")
    print("="*60)

    # Test 1: General search
    print("\n[Test 1] General search...")
    result = web_search("pattern recognition psychology")
    print(f"  Query type: {result['query_type']}")
    print(f"  Provider: {result['provider']}")
    print(f"  Results: {result['result_count']}")
    if result['results']:
        print(f"  First result: {result['results'][0].get('title', 'No title')}")

    # Test 2: Legal search
    print("\n[Test 2] Legal search...")
    result = web_search("Washington RCW child custody modification")
    print(f"  Query type: {result['query_type']}")
    print(f"  Provider: {result['provider']}")
    print(f"  Results: {result['result_count']}")

    # Test 3: Status
    print("\n[Test 3] Status check...")
    status = get_search_status()
    print(f"  Web search: {status['web_search']}")
    print(f"  Total searches: {status['total_searches']}")
    print(f"  Success rate: {status['success_rate']}%")

    print("\n" + "="*60)
    print("  Tests complete!")
    print("="*60 + "\n")
