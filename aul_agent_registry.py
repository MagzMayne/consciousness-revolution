#!/usr/bin/env python3
"""
AUL Agent Registry
Central discovery service for autonomous agents
"""

import json
import time
import threading
from typing import Dict, List, Optional
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AULAgentRegistry:
    """
    Agent registry for discovery and capability lookup
    Optimized for fast queries and agent discovery
    """
    
    def __init__(self, heartbeat_timeout: int = 90):
        # Agent storage
        self.agents: Dict[str, Dict] = {}
        
        # Indices for fast lookup
        self._by_type: Dict[str, List[str]] = {}
        self._by_capability: Dict[str, List[str]] = {}
        
        # Configuration
        self.heartbeat_timeout = heartbeat_timeout
        
        # State
        self._running = False
        self._cleanup_thread = None
        
        # Metrics
        self.metrics = {
            "total_registered": 0,
            "total_unregistered": 0,
            "active_agents": 0,
            "stale_agents_removed": 0
        }
        
        logger.info("AUL Agent Registry initialized")
    
    def register(self, capability_declaration: Dict) -> bool:
        """Register an agent with the registry"""
        try:
            agent_id = capability_declaration["agent_id"]
            agent_type = capability_declaration["agent_type"]
            
            # Store full declaration
            self.agents[agent_id] = {
                **capability_declaration,
                "registered_at": time.time(),
                "last_heartbeat": time.time(),
                "lookup_count": 0
            }
            
            # Update indices
            self._index_agent(agent_id, agent_type, capability_declaration)
            
            # Update metrics
            self.metrics["total_registered"] += 1
            self.metrics["active_agents"] = len(self.agents)
            
            logger.info(f"Agent registered: {agent_id} ({agent_type})")
            return True
            
        except Exception as e:
            logger.error(f"Registration failed: {str(e)}")
            return False
    
    def unregister(self, agent_id: str) -> bool:
        """Unregister an agent"""
        if agent_id not in self.agents:
            logger.warning(f"Agent not found: {agent_id}")
            return False
        
        try:
            agent_info = self.agents[agent_id]
            agent_type = agent_info["agent_type"]
            
            # Remove from indices
            self._unindex_agent(agent_id, agent_type, agent_info)
            
            # Remove from storage
            del self.agents[agent_id]
            
            # Update metrics
            self.metrics["total_unregistered"] += 1
            self.metrics["active_agents"] = len(self.agents)
            
            logger.info(f"Agent unregistered: {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Unregistration failed: {str(e)}")
            return False
    
    def update_heartbeat(self, agent_id: str) -> bool:
        """Update agent heartbeat timestamp"""
        if agent_id not in self.agents:
            return False
        
        self.agents[agent_id]["last_heartbeat"] = time.time()
        
        # Update health status if present
        if "health" in self.agents[agent_id]:
            self.agents[agent_id]["health"]["last_heartbeat"] = \
                datetime.utcnow().isoformat() + "Z"
        
        return True
    
    def get_agent(self, agent_id: str) -> Optional[Dict]:
        """Get agent by ID"""
        agent = self.agents.get(agent_id)
        if agent:
            agent["lookup_count"] += 1
        return agent
    
    def find_by_type(self, agent_type: str) -> List[Dict]:
        """Find all agents of a specific type"""
        agent_ids = self._by_type.get(agent_type, [])
        return [self.agents[aid] for aid in agent_ids if aid in self.agents]
    
    def find_by_capability(self, capability: str) -> List[Dict]:
        """Find all agents with a specific capability"""
        agent_ids = self._by_capability.get(capability, [])
        return [self.agents[aid] for aid in agent_ids if aid in self.agents]
    
    def find_best_agent(
        self,
        capability: str,
        prefer_idle: bool = True
    ) -> Optional[Dict]:
        """
        Find the best agent for a capability
        Optimizes for availability and performance
        """
        candidates = self.find_by_capability(capability)
        
        if not candidates:
            return None
        
        # Filter by status
        active = [a for a in candidates if a["status"] == "active"]
        if not active:
            return None
        
        # Sort by criteria
        if prefer_idle:
            # Prefer agents with lower load
            active.sort(key=lambda a: a.get("health", {}).get("cpu_percent", 100))
        else:
            # Prefer fastest agents
            active.sort(key=lambda a: 
                a.get("capabilities", {}).get("avg_latency_ms", 1000))
        
        return active[0]
    
    def list_all(self, include_stale: bool = False) -> List[Dict]:
        """List all agents"""
        agents = list(self.agents.values())
        
        if not include_stale:
            # Filter out stale agents
            now = time.time()
            agents = [
                a for a in agents 
                if (now - a["last_heartbeat"]) < self.heartbeat_timeout
            ]
        
        return agents
    
    def _index_agent(self, agent_id: str, agent_type: str, declaration: Dict):
        """Add agent to indices"""
        # Index by type
        if agent_type not in self._by_type:
            self._by_type[agent_type] = []
        if agent_id not in self._by_type[agent_type]:
            self._by_type[agent_type].append(agent_id)
        
        # Index by capabilities
        capabilities = declaration.get("capabilities", {}).get("actions", [])
        for capability in capabilities:
            if capability not in self._by_capability:
                self._by_capability[capability] = []
            if agent_id not in self._by_capability[capability]:
                self._by_capability[capability].append(agent_id)
    
    def _unindex_agent(self, agent_id: str, agent_type: str, agent_info: Dict):
        """Remove agent from indices"""
        # Remove from type index
        if agent_type in self._by_type:
            if agent_id in self._by_type[agent_type]:
                self._by_type[agent_type].remove(agent_id)
        
        # Remove from capability indices
        capabilities = agent_info.get("capabilities", {}).get("actions", [])
        for capability in capabilities:
            if capability in self._by_capability:
                if agent_id in self._by_capability[capability]:
                    self._by_capability[capability].remove(agent_id)
    
    def _cleanup_loop(self):
        """Background thread to remove stale agents"""
        logger.info("Agent cleanup loop started")
        
        while self._running:
            try:
                now = time.time()
                stale_agents = []
                
                # Find stale agents
                for agent_id, agent_info in self.agents.items():
                    last_heartbeat = agent_info["last_heartbeat"]
                    if (now - last_heartbeat) > self.heartbeat_timeout:
                        stale_agents.append(agent_id)
                
                # Remove stale agents
                for agent_id in stale_agents:
                    logger.warning(f"Removing stale agent: {agent_id}")
                    self.unregister(agent_id)
                    self.metrics["stale_agents_removed"] += 1
                
            except Exception as e:
                logger.error(f"Cleanup error: {str(e)}")
            
            # Sleep for 30 seconds
            time.sleep(30)
        
        logger.info("Agent cleanup loop stopped")
    
    def start(self):
        """Start the registry"""
        if self._running:
            logger.warning("Registry already running")
            return
        
        self._running = True
        
        # Start cleanup thread
        self._cleanup_thread = threading.Thread(
            target=self._cleanup_loop,
            daemon=True
        )
        self._cleanup_thread.start()
        
        logger.info("Agent registry started")
    
    def stop(self):
        """Stop the registry"""
        if not self._running:
            return
        
        logger.info("Stopping agent registry...")
        self._running = False
        
        # Wait for cleanup thread
        if self._cleanup_thread:
            self._cleanup_thread.join(timeout=5)
        
        logger.info("Agent registry stopped")
    
    def get_stats(self) -> Dict:
        """Get registry statistics"""
        return {
            "metrics": self.metrics,
            "agent_types": list(self._by_type.keys()),
            "capabilities": list(self._by_capability.keys()),
            "uptime": "active" if self._running else "stopped"
        }
    
    def export_registry(self) -> Dict:
        """Export full registry for backup/inspection"""
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "agents": self.agents,
            "metrics": self.metrics
        }
    
    def import_registry(self, data: Dict) -> bool:
        """Import registry from backup"""
        try:
            if "agents" in data:
                for agent_id, agent_info in data["agents"].items():
                    self.register(agent_info)
            return True
        except Exception as e:
            logger.error(f"Import failed: {str(e)}")
            return False


# Singleton instance
_registry_instance = None

def get_agent_registry() -> AULAgentRegistry:
    """Get global agent registry instance"""
    global _registry_instance
    if _registry_instance is None:
        _registry_instance = AULAgentRegistry()
    return _registry_instance


# Example usage
if __name__ == "__main__":
    # Create registry
    registry = AULAgentRegistry()
    registry.start()
    
    # Register test agent
    test_agent = {
        "agent_id": "test-agent-01",
        "agent_type": "example",
        "version": "1.0.0",
        "status": "active",
        "capabilities": {
            "actions": ["read", "analyze", "write"],
            "max_throughput": 100,
            "avg_latency_ms": 50
        },
        "health": {
            "uptime_seconds": 3600,
            "error_count": 0,
            "success_rate": 100.0
        }
    }
    
    registry.register(test_agent)
    
    # Find by capability
    print("\nAgents with 'analyze' capability:")
    agents = registry.find_by_capability("analyze")
    for agent in agents:
        print(f"  - {agent['agent_id']} ({agent['agent_type']})")
    
    # Find best agent
    print("\nBest agent for 'analyze':")
    best = registry.find_best_agent("analyze")
    if best:
        print(f"  {best['agent_id']} (latency: {best['capabilities']['avg_latency_ms']}ms)")
    
    # Print stats
    print("\nRegistry Stats:")
    print(json.dumps(registry.get_stats(), indent=2))
    
    # Stop registry
    time.sleep(2)
    registry.stop()
