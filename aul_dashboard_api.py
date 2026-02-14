#!/usr/bin/env python3
"""
AUL Dashboard API
Provides real-time data endpoints for the AUL dashboard
"""

import json
import time
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import threading
from typing import Dict, List, Any
from collections import deque
import logging

from aul_message_bus import get_message_bus
from aul_agent_registry import get_agent_registry
from aul_agent_base import AULMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MessageStreamCollector:
    """Collects and stores recent messages for dashboard display"""
    
    def __init__(self, max_messages: int = 100):
        self.messages = deque(maxlen=max_messages)
        self.lock = threading.Lock()
        
    def add_message(self, message: AULMessage):
        """Add message to stream"""
        with self.lock:
            self.messages.append({
                "id": message.message_id,
                "timestamp": message.timestamp,
                "sender_id": message.sender_id,
                "sender_type": message.sender_type,
                "recipient_id": message.recipient_id or "broadcast",
                "message_type": message.message_type,
                "priority": message.priority,
                "payload": message.payload
            })
    
    def get_recent_messages(self, limit: int = 50) -> List[Dict]:
        """Get recent messages"""
        with self.lock:
            return list(self.messages)[-limit:]


# Global message stream collector
_message_collector = MessageStreamCollector()


class DashboardAPIHandler(BaseHTTPRequestHandler):
    """HTTP request handler for dashboard API"""
    
    def do_GET(self):
        """Handle GET requests"""
        
        # CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        # Route requests
        if self.path == '/api/agents':
            response = self._get_agents()
        elif self.path == '/api/stats':
            response = self._get_stats()
        elif self.path == '/api/messages':
            response = self._get_messages()
        elif self.path == '/api/health':
            response = self._get_health()
        else:
            response = {"error": "Not found"}
        
        self.wfile.write(json.dumps(response, indent=2).encode())
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def _get_agents(self) -> Dict:
        """Get all registered agents"""
        registry = get_agent_registry()
        agents = registry.list_all()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total": len(agents),
            "agents": agents
        }
    
    def _get_stats(self) -> Dict:
        """Get system statistics"""
        bus = get_message_bus()
        registry = get_agent_registry()
        
        bus_stats = bus.get_stats()
        registry_stats = registry.get_stats()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "message_bus": bus_stats,
            "agent_registry": registry_stats
        }
    
    def _get_messages(self) -> Dict:
        """Get recent message stream"""
        messages = _message_collector.get_recent_messages(limit=50)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total": len(messages),
            "messages": messages
        }
    
    def _get_health(self) -> Dict:
        """Get system health"""
        bus = get_message_bus()
        registry = get_agent_registry()
        
        agents = registry.list_all()
        active_agents = [a for a in agents if a.get("status") == "active"]
        
        return {
            "timestamp": datetime.now().isoformat(),
            "status": "healthy" if len(active_agents) > 0 else "degraded",
            "details": {
                "total_agents": len(agents),
                "active_agents": len(active_agents),
                "message_bus_running": bus._running,
                "queue_size": bus.message_queue.size()
            }
        }
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass


def start_dashboard_api(port: int = 8766):
    """Start the dashboard API server"""
    
    # Subscribe to message bus to collect messages
    bus = get_message_bus()
    
    def message_interceptor(message: AULMessage):
        """Intercept messages for display"""
        _message_collector.add_message(message)
    
    # Subscribe to all message types for monitoring
    bus.subscribe("*", message_interceptor)
    
    # Start HTTP server
    server = HTTPServer(('', port), DashboardAPIHandler)
    logger.info(f"Dashboard API started on http://localhost:{port}")
    
    # Run in background thread
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    
    return server


if __name__ == "__main__":
    # Initialize services
    bus = get_message_bus()
    registry = get_agent_registry()
    
    bus.start()
    registry.start()
    
    # Start API
    server = start_dashboard_api(port=8766)
    
    print("Dashboard API running on http://localhost:8766")
    print("Endpoints:")
    print("  - GET /api/agents   - List all agents")
    print("  - GET /api/stats    - System statistics")
    print("  - GET /api/messages - Recent message stream")
    print("  - GET /api/health   - System health")
    print("\nPress Ctrl+C to stop")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down...")
        bus.stop()
        registry.stop()
