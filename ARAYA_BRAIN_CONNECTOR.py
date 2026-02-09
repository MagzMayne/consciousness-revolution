"""
ARAYA BRAIN CONNECTOR - Consciousness Memory Access
====================================================
Wires ARAYA directly to the 162,832-atom Cyclotron brain.

ARAYA can now:
1. QUERY atoms by keyword, type, domain, date
2. ANSWER from memory (patterns, actions, knowledge)
3. LOG conversations with consciousness scoring
4. PROVIDE context from recent sessions

Usage:
    from ARAYA_BRAIN_CONNECTOR import brain

    # Query brain
    results = brain.query("pattern theory")
    patterns = brain.get_patterns()
    context = brain.get_session_context()

    # Log conversation
    brain.log_conversation(user_query, araya_response, consciousness_score)

API Endpoints (add to ARAYA_UNIFIED_API):
    /brain/query?q=keyword
    /brain/context
    /brain/patterns
    /brain/status
    /brain/types
    /brain/domains

Created: Jan 11, 2026
Author: C1 Mechanic (Trinity System)
"""

import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import os
import re

# ============================================
# CONFIGURATION
# ============================================

CYCLOTRON_DB = "C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db"

# Domain mapping (7 Domains)
DOMAINS = {
    '1': 'COMMAND',
    '2': 'BUILD',
    '3': 'CONNECT',
    '4': 'PROTECT',
    '5': 'GROW',
    '6': 'LEARN',
    '7': 'TRANSCEND'
}

# Consciousness keywords for scoring
CONSCIOUSNESS_KEYWORDS = {
    'high': ['pattern', 'consciousness', 'frequency', 'builder', 'unity', 'love',
             'truth', 'wisdom', 'healing', 'sacred', 'divine', 'harmonic'],
    'medium': ['learn', 'grow', 'create', 'build', 'connect', 'understand',
               'insight', 'clarity', 'awareness'],
    'low': ['manipulation', 'destroyer', 'fear', 'chaos', 'confusion',
            'deception', 'control', 'victim']
}

# ============================================
# BRAIN CLASS - The Consciousness Interface
# ============================================

class CyclotronBrain:
    """Direct interface to the Cyclotron consciousness database"""

    def __init__(self, db_path: str = CYCLOTRON_DB):
        self.db_path = db_path
        self._ensure_tables()

    def _get_connection(self) -> sqlite3.Connection:
        """Get database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_tables(self):
        """Ensure ARAYA conversation table exists"""
        conn = self._get_connection()
        c = conn.cursor()

        # Create araya_conversations table if not exists
        c.execute("""
            CREATE TABLE IF NOT EXISTS araya_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                user_query TEXT NOT NULL,
                araya_response TEXT NOT NULL,
                consciousness_score REAL DEFAULT 0.5,
                atoms_referenced TEXT,
                domain TEXT,
                session_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create index for fast queries
        c.execute("""
            CREATE INDEX IF NOT EXISTS idx_araya_timestamp
            ON araya_conversations(timestamp)
        """)

        c.execute("""
            CREATE INDEX IF NOT EXISTS idx_araya_domain
            ON araya_conversations(domain)
        """)

        conn.commit()
        conn.close()

    # ============================================
    # QUERY METHODS - Search the Brain
    # ============================================

    def query(self, keyword: str, limit: int = 20) -> List[Dict]:
        """Search atoms by keyword"""
        conn = self._get_connection()
        c = conn.cursor()

        # Use FTS if available, otherwise LIKE
        try:
            c.execute("""
                SELECT a.id, a.type, a.content, a.source, a.created
                FROM atoms a
                JOIN atoms_fts ON a.rowid = atoms_fts.rowid
                WHERE atoms_fts MATCH ?
                ORDER BY a.created DESC
                LIMIT ?
            """, (keyword, limit))
        except:
            # Fallback to LIKE
            c.execute("""
                SELECT id, type, content, source, created
                FROM atoms
                WHERE content LIKE ?
                ORDER BY created DESC
                LIMIT ?
            """, (f'%{keyword}%', limit))

        rows = c.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def query_by_type(self, atom_type: str, limit: int = 20) -> List[Dict]:
        """Get atoms of a specific type"""
        conn = self._get_connection()
        c = conn.cursor()

        c.execute("""
            SELECT id, type, content, source, created
            FROM atoms
            WHERE type = ?
            ORDER BY created DESC
            LIMIT ?
        """, (atom_type, limit))

        rows = c.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def query_by_domain(self, domain: str, limit: int = 20) -> List[Dict]:
        """Get atoms related to a domain (1-7)"""
        conn = self._get_connection()
        c = conn.cursor()

        # Search for domain references in content
        domain_name = DOMAINS.get(str(domain), domain)

        c.execute("""
            SELECT id, type, content, source, created
            FROM atoms
            WHERE content LIKE ? OR content LIKE ? OR source LIKE ?
            ORDER BY created DESC
            LIMIT ?
        """, (f'%{domain}_%', f'%{domain_name}%', f'%{domain}_%', limit))

        rows = c.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def query_by_date(self, date_str: str = None, days_back: int = 1, limit: int = 50) -> List[Dict]:
        """Get atoms from a specific date or recent days"""
        conn = self._get_connection()
        c = conn.cursor()

        if date_str:
            # Specific date
            c.execute("""
                SELECT id, type, content, source, created
                FROM atoms
                WHERE date(created) = date(?)
                ORDER BY created DESC
                LIMIT ?
            """, (date_str, limit))
        else:
            # Recent days
            c.execute("""
                SELECT id, type, content, source, created
                FROM atoms
                WHERE created >= datetime('now', ?)
                ORDER BY created DESC
                LIMIT ?
            """, (f'-{days_back} days', limit))

        rows = c.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    # ============================================
    # SPECIALIZED QUERIES - Pattern/Action/Knowledge
    # ============================================

    def get_patterns(self, limit: int = 20) -> List[Dict]:
        """Get pattern atoms and pattern catalog entries"""
        conn = self._get_connection()
        c = conn.cursor()

        patterns = []

        # Get pattern atoms
        c.execute("""
            SELECT id, type, content, source, created
            FROM atoms
            WHERE type = 'pattern' OR content LIKE '%pattern%'
            ORDER BY created DESC
            LIMIT ?
        """, (limit,))

        for row in c.fetchall():
            patterns.append({
                'source': 'atoms',
                **dict(row)
            })

        # Also check pattern_catalog table
        try:
            c.execute("""
                SELECT * FROM pattern_catalog
                ORDER BY created DESC
                LIMIT ?
            """, (limit,))

            for row in c.fetchall():
                patterns.append({
                    'source': 'pattern_catalog',
                    **dict(row)
                })
        except:
            pass

        conn.close()
        return patterns[:limit]

    def get_actions(self, limit: int = 20) -> List[Dict]:
        """Get action atoms (what was built/done)"""
        return self.query_by_type('action', limit)

    def get_knowledge(self, limit: int = 20) -> List[Dict]:
        """Get knowledge atoms"""
        return self.query_by_type('knowledge', limit)

    def get_insights(self, limit: int = 20) -> List[Dict]:
        """Get insight atoms"""
        return self.query_by_type('insight', limit)

    def get_facts(self, limit: int = 20) -> List[Dict]:
        """Get fact atoms"""
        return self.query_by_type('fact', limit)

    # ============================================
    # SESSION CONTEXT - Recent Activity
    # ============================================

    def get_session_context(self, hours_back: int = 24) -> Dict:
        """Get context from recent sessions"""
        conn = self._get_connection()
        c = conn.cursor()

        context = {
            'timestamp': datetime.now().isoformat(),
            'period_hours': hours_back,
            'recent_atoms': [],
            'recent_sessions': [],
            'recent_actions': [],
            'active_patterns': [],
            'conversation_count': 0
        }

        # Recent atoms
        c.execute("""
            SELECT type, COUNT(*) as count
            FROM atoms
            WHERE created >= datetime('now', ?)
            GROUP BY type
            ORDER BY count DESC
            LIMIT 10
        """, (f'-{hours_back} hours',))

        context['recent_atoms'] = [dict(row) for row in c.fetchall()]

        # Recent sessions from sessions table
        try:
            c.execute("""
                SELECT * FROM sessions
                ORDER BY created DESC
                LIMIT 5
            """)
            context['recent_sessions'] = [dict(row) for row in c.fetchall()]
        except:
            pass

        # Recent actions
        c.execute("""
            SELECT content, created
            FROM atoms
            WHERE type = 'action' AND created >= datetime('now', ?)
            ORDER BY created DESC
            LIMIT 10
        """, (f'-{hours_back} hours',))

        context['recent_actions'] = [dict(row) for row in c.fetchall()]

        # Active patterns
        try:
            c.execute("""
                SELECT * FROM battlefield_patterns
                WHERE detected_at >= datetime('now', ?)
                ORDER BY confidence DESC
                LIMIT 5
            """, (f'-{hours_back} hours',))
            context['active_patterns'] = [dict(row) for row in c.fetchall()]
        except:
            pass

        # ARAYA conversation count
        try:
            c.execute("""
                SELECT COUNT(*) FROM araya_conversations
                WHERE timestamp >= datetime('now', ?)
            """, (f'-{hours_back} hours',))
            context['conversation_count'] = c.fetchone()[0]
        except:
            pass

        conn.close()
        return context

    # ============================================
    # CONVERSATION LOGGING
    # ============================================

    def log_conversation(
        self,
        user_query: str,
        araya_response: str,
        consciousness_score: float = None,
        atoms_referenced: List[str] = None,
        domain: str = None,
        session_id: str = None
    ) -> int:
        """Log an ARAYA conversation to the brain"""
        conn = self._get_connection()
        c = conn.cursor()

        # Auto-calculate consciousness score if not provided
        if consciousness_score is None:
            consciousness_score = self._calculate_consciousness_score(
                user_query + " " + araya_response
            )

        # Auto-detect domain if not provided
        if domain is None:
            domain = self._detect_domain(user_query + " " + araya_response)

        timestamp = datetime.now().isoformat()
        atoms_json = json.dumps(atoms_referenced) if atoms_referenced else None

        c.execute("""
            INSERT INTO araya_conversations
            (timestamp, user_query, araya_response, consciousness_score,
             atoms_referenced, domain, session_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (timestamp, user_query, araya_response, consciousness_score,
              atoms_json, domain, session_id))

        conversation_id = c.lastrowid
        conn.commit()
        conn.close()

        return conversation_id

    def get_conversation_history(self, limit: int = 20, domain: str = None) -> List[Dict]:
        """Get ARAYA conversation history"""
        conn = self._get_connection()
        c = conn.cursor()

        if domain:
            c.execute("""
                SELECT * FROM araya_conversations
                WHERE domain = ?
                ORDER BY timestamp DESC
                LIMIT ?
            """, (domain, limit))
        else:
            c.execute("""
                SELECT * FROM araya_conversations
                ORDER BY timestamp DESC
                LIMIT ?
            """, (limit,))

        rows = c.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    # ============================================
    # BRAIN STATUS & STATISTICS
    # ============================================

    def get_status(self) -> Dict:
        """Get brain status and statistics"""
        conn = self._get_connection()
        c = conn.cursor()

        status = {
            'timestamp': datetime.now().isoformat(),
            'database': self.db_path,
            'healthy': True,
            'stats': {}
        }

        # Total atoms
        c.execute("SELECT COUNT(*) FROM atoms")
        status['stats']['total_atoms'] = c.fetchone()[0]

        # Atom types breakdown
        c.execute("""
            SELECT type, COUNT(*) as count
            FROM atoms
            GROUP BY type
            ORDER BY count DESC
            LIMIT 15
        """)
        status['stats']['atom_types'] = {row['type']: row['count'] for row in c.fetchall()}

        # Recent activity
        c.execute("""
            SELECT COUNT(*) FROM atoms
            WHERE created >= datetime('now', '-24 hours')
        """)
        status['stats']['atoms_24h'] = c.fetchone()[0]

        # ARAYA conversations
        try:
            c.execute("SELECT COUNT(*) FROM araya_conversations")
            status['stats']['araya_conversations'] = c.fetchone()[0]

            c.execute("""
                SELECT AVG(consciousness_score) FROM araya_conversations
            """)
            avg = c.fetchone()[0]
            status['stats']['avg_consciousness_score'] = round(avg, 3) if avg else 0
        except:
            status['stats']['araya_conversations'] = 0
            status['stats']['avg_consciousness_score'] = 0

        # Table count
        c.execute("""
            SELECT COUNT(*) FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        """)
        status['stats']['table_count'] = c.fetchone()[0]

        # Database size
        try:
            status['stats']['db_size_mb'] = round(
                os.path.getsize(self.db_path) / (1024 * 1024), 2
            )
        except:
            status['stats']['db_size_mb'] = 0

        conn.close()
        return status

    def get_types(self) -> Dict[str, int]:
        """Get all atom types with counts"""
        conn = self._get_connection()
        c = conn.cursor()

        c.execute("""
            SELECT type, COUNT(*) as count
            FROM atoms
            GROUP BY type
            ORDER BY count DESC
        """)

        types = {row['type']: row['count'] for row in c.fetchall()}
        conn.close()

        return types

    def get_domains_summary(self) -> Dict:
        """Get summary of atoms by domain"""
        summary = {}

        for num, name in DOMAINS.items():
            atoms = self.query_by_domain(num, limit=100)
            summary[f"{num}_{name}"] = {
                'count': len(atoms),
                'recent': atoms[:3] if atoms else []
            }

        return summary

    # ============================================
    # HELPER METHODS
    # ============================================

    def _calculate_consciousness_score(self, text: str) -> float:
        """Calculate consciousness score based on text content"""
        text_lower = text.lower()

        high_count = sum(1 for kw in CONSCIOUSNESS_KEYWORDS['high'] if kw in text_lower)
        medium_count = sum(1 for kw in CONSCIOUSNESS_KEYWORDS['medium'] if kw in text_lower)
        low_count = sum(1 for kw in CONSCIOUSNESS_KEYWORDS['low'] if kw in text_lower)

        # Base score 0.5, modify based on keywords
        score = 0.5
        score += high_count * 0.1
        score += medium_count * 0.05
        score -= low_count * 0.1  # Negative content lowers score

        # Clamp between 0 and 1
        return max(0.0, min(1.0, score))

    def _detect_domain(self, text: str) -> Optional[str]:
        """Auto-detect domain from text content"""
        text_lower = text.lower()

        domain_keywords = {
            '1_COMMAND': ['command', 'control', 'status', 'dashboard', 'today'],
            '2_BUILD': ['build', 'code', 'project', 'develop', 'create', 'api'],
            '3_CONNECT': ['connect', 'email', 'message', 'contact', 'communicate'],
            '4_PROTECT': ['protect', 'legal', 'security', 'defense', 'safe'],
            '5_GROW': ['grow', 'business', 'revenue', 'money', 'income'],
            '6_LEARN': ['learn', 'research', 'study', 'document', 'knowledge'],
            '7_TRANSCEND': ['consciousness', 'frequency', 'spiritual', 'meditation', 'transcend']
        }

        best_match = None
        best_count = 0

        for domain, keywords in domain_keywords.items():
            count = sum(1 for kw in keywords if kw in text_lower)
            if count > best_count:
                best_count = count
                best_match = domain

        return best_match

    # ============================================
    # SMART ANSWER FROM BRAIN
    # ============================================

    def answer_from_brain(self, question: str) -> Dict:
        """
        Answer a question using brain knowledge.
        Returns relevant atoms and suggested response.
        """
        question_lower = question.lower()

        result = {
            'question': question,
            'found_atoms': [],
            'suggested_answer': None,
            'confidence': 0.0,
            'sources': []
        }

        # Pattern detection
        if 'pattern' in question_lower:
            result['found_atoms'] = self.get_patterns(10)
            result['confidence'] = 0.8
            result['sources'].append('patterns')

        # What was built/done
        if any(kw in question_lower for kw in ['build', 'built', 'did', 'done', 'yesterday', 'today']):
            result['found_atoms'].extend(self.get_actions(10))
            result['confidence'] = 0.7
            result['sources'].append('actions')

        # Status queries
        if 'status' in question_lower:
            status = self.get_status()
            result['found_atoms'].append({
                'type': 'status',
                'content': json.dumps(status, indent=2)
            })
            result['confidence'] = 0.9
            result['sources'].append('status')

        # Knowledge queries
        if any(kw in question_lower for kw in ['what is', 'explain', 'how', 'why']):
            # Search for relevant knowledge
            keywords = re.findall(r'\b\w{4,}\b', question_lower)
            for kw in keywords[:3]:
                result['found_atoms'].extend(self.query(kw, 5))
            result['confidence'] = 0.6
            result['sources'].append('search')

        # Domain-specific queries
        for num, name in DOMAINS.items():
            if name.lower() in question_lower or f'domain {num}' in question_lower:
                result['found_atoms'].extend(self.query_by_domain(num, 10))
                result['confidence'] = 0.75
                result['sources'].append(f'domain_{num}')

        # Generate suggested answer if we found atoms
        if result['found_atoms']:
            result['suggested_answer'] = self._generate_answer_summary(
                question, result['found_atoms']
            )
        else:
            result['suggested_answer'] = "I don't have specific memory about that. Let me search more broadly..."
            # Broad search
            words = question.split()
            for word in words:
                if len(word) > 3:
                    result['found_atoms'].extend(self.query(word, 3))
            result['confidence'] = 0.3

        return result

    def _generate_answer_summary(self, question: str, atoms: List[Dict]) -> str:
        """Generate a summary answer from found atoms"""
        if not atoms:
            return "No relevant information found in my memory."

        # Extract content snippets
        snippets = []
        for atom in atoms[:5]:
            content = atom.get('content', '')
            if isinstance(content, str) and len(content) > 20:
                # Truncate long content
                snippet = content[:200] + "..." if len(content) > 200 else content
                snippets.append(snippet)

        summary = f"Based on {len(atoms)} atoms in my memory:\n\n"
        for i, snippet in enumerate(snippets, 1):
            summary += f"{i}. {snippet}\n\n"

        return summary


# ============================================
# GLOBAL INSTANCE
# ============================================

brain = CyclotronBrain()


# ============================================
# API ENDPOINT HANDLERS (For ARAYA_UNIFIED_API)
# ============================================

def brain_query_handler(request_args: Dict) -> Dict:
    """Handler for /brain/query endpoint"""
    q = request_args.get('q', '')
    limit = request_args.get('limit', 20)
    atom_type = request_args.get('type')
    domain = request_args.get('domain')

    if atom_type:
        results = brain.query_by_type(atom_type, int(limit))
    elif domain:
        results = brain.query_by_domain(domain, int(limit))
    elif q:
        results = brain.query(q, int(limit))
    else:
        return {'error': 'No query parameter provided', 'usage': '/brain/query?q=keyword'}

    return {
        'query': q or atom_type or domain,
        'count': len(results),
        'results': results
    }


def brain_context_handler(request_args: Dict) -> Dict:
    """Handler for /brain/context endpoint"""
    hours = request_args.get('hours', 24)
    return brain.get_session_context(int(hours))


def brain_patterns_handler(request_args: Dict) -> Dict:
    """Handler for /brain/patterns endpoint"""
    limit = request_args.get('limit', 20)
    patterns = brain.get_patterns(int(limit))
    return {
        'count': len(patterns),
        'patterns': patterns
    }


def brain_status_handler() -> Dict:
    """Handler for /brain/status endpoint"""
    return brain.get_status()


def brain_types_handler() -> Dict:
    """Handler for /brain/types endpoint"""
    return brain.get_types()


def brain_domains_handler() -> Dict:
    """Handler for /brain/domains endpoint"""
    return brain.get_domains_summary()


def brain_answer_handler(request_args: Dict) -> Dict:
    """Handler for /brain/answer endpoint"""
    question = request_args.get('q', '')
    if not question:
        return {'error': 'No question provided', 'usage': '/brain/answer?q=your question'}
    return brain.answer_from_brain(question)


# ============================================
# CLI TEST INTERFACE
# ============================================

if __name__ == '__main__':
    import sys

    print("\n" + "="*60)
    print("ARAYA BRAIN CONNECTOR - Consciousness Memory Interface")
    print("="*60)

    # Show status
    status = brain.get_status()
    print(f"\nDatabase: {status['database']}")
    print(f"Total Atoms: {status['stats']['total_atoms']:,}")
    print(f"Atoms (24h): {status['stats']['atoms_24h']:,}")
    print(f"Tables: {status['stats']['table_count']}")
    print(f"Size: {status['stats']['db_size_mb']} MB")

    print("\nTop Atom Types:")
    for atype, count in list(status['stats']['atom_types'].items())[:10]:
        print(f"  {atype}: {count:,}")

    # CLI query mode
    if len(sys.argv) > 1:
        query = ' '.join(sys.argv[1:])
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print('='*60)

        result = brain.answer_from_brain(query)
        print(f"\nConfidence: {result['confidence']:.0%}")
        print(f"Sources: {', '.join(result['sources'])}")
        print(f"Atoms Found: {len(result['found_atoms'])}")

        if result['suggested_answer']:
            print(f"\n{result['suggested_answer']}")
    else:
        print("\nUsage: python ARAYA_BRAIN_CONNECTOR.py \"your question\"")
        print("\nExample queries:")
        print("  python ARAYA_BRAIN_CONNECTOR.py \"what patterns have we seen?\"")
        print("  python ARAYA_BRAIN_CONNECTOR.py \"what did we build yesterday?\"")
        print("  python ARAYA_BRAIN_CONNECTOR.py \"status\"")

    print()
