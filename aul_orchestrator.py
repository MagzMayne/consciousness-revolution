#!/usr/bin/env python3
"""
AUL-Enhanced Autonomous Agent Orchestrator
Wraps existing orchestrator with AUL protocol support for speed and interoperability
"""

import sys
import time
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Import AUL components
from aul_agent_base import AULAgent, AULMessage
from aul_message_bus import get_message_bus
from aul_agent_registry import get_agent_registry


class AULOrchestrator(AULAgent):
    """
    AUL-enhanced orchestrator with native AUL protocol support
    Provides centralized coordination for all autonomous agents
    """
    
    def __init__(self):
        super().__init__(
            agent_id="orchestrator-main",
            agent_type="orchestrator",
            version="1.0.0",
            capabilities=[
                "monitor",
                "heal",
                "coordinate",
                "schedule",
                "escalate"
            ],
            heartbeat_interval=30
        )
        
        self.repo_root = Path(__file__).parent
        self.message_bus = get_message_bus()
        self.agent_registry = get_agent_registry()
        
        # Orchestrator-specific state
        self.monitored_agents = {}
        self.healing_queue = []
        self.schedules = []
        
        # Register handlers
        self.register_handler("agent_register", self._handle_agent_register)
        self.register_handler("agent_unregister", self._handle_agent_unregister)
        self.register_handler("health_check", self._handle_health_check)
        self.register_handler("heal_request", self._handle_heal_request)
        self.register_handler("event", self._handle_event)
    
    def on_start(self):
        """Initialize orchestrator services"""
        print("=" * 70)
        print("🤖 AUL-ENHANCED AUTONOMOUS AGENT ORCHESTRATOR")
        print("=" * 70)
        print(f"Started: {datetime.now().isoformat()}")
        print(f"Location: {self.repo_root}")
        print(f"AUL Version: 1.0")
        print()
        
        # Start message bus and registry
        self.message_bus.start()
        self.agent_registry.start()
        
        # Register self with registry
        self.agent_registry.register(self.get_capability_declaration())
        
        # Register with message bus
        self.message_bus.register_agent(
            agent_id=self.agent_id,
            agent_type=self.agent_type,
            capabilities=self.capabilities,
            callback=self.receive_message
        )
        
        print("✅ AUL Message Bus started")
        print("✅ Agent Registry started")
        print("✅ Orchestrator registered")
        print()
        
        # Discover and connect to existing agents
        self._discover_agents()
    
    def on_stop(self):
        """Cleanup orchestrator services"""
        print("\n🛑 Shutting down orchestrator...")
        
        # Unregister from services
        self.message_bus.unregister_agent(self.agent_id)
        self.agent_registry.unregister(self.agent_id)
        
        # Stop services
        self.message_bus.stop()
        self.agent_registry.stop()
        
        print("✅ Orchestrator stopped")
    
    def handle_message(self, message: AULMessage) -> Any:
        """Default message handler"""
        print(f"📨 Received {message.message_type} from {message.sender_id}")
        return {"acknowledged": True}
    
    def _handle_agent_register(self, message: AULMessage) -> Dict:
        """Handle agent registration requests"""
        agent_info = message.payload
        agent_id = agent_info.get("agent_id")
        
        print(f"📝 Registering agent: {agent_id}")
        
        # Register with registry
        success = self.agent_registry.register(agent_info)
        
        if success:
            self.monitored_agents[agent_id] = {
                "registered_at": time.time(),
                "last_health_check": time.time(),
                "health_status": "unknown"
            }
            
            # Send welcome message
            self.send_message(
                message_type="event",
                payload={
                    "event_name": "registration_confirmed",
                    "orchestrator_id": self.agent_id
                },
                recipient_id=agent_id
            )
        
        return {"success": success, "agent_id": agent_id}
    
    def _handle_agent_unregister(self, message: AULMessage) -> Dict:
        """Handle agent unregistration"""
        agent_id = message.payload.get("agent_id")
        
        print(f"📝 Unregistering agent: {agent_id}")
        
        success = self.agent_registry.unregister(agent_id)
        
        if agent_id in self.monitored_agents:
            del self.monitored_agents[agent_id]
        
        return {"success": success, "agent_id": agent_id}
    
    def _handle_health_check(self, message: AULMessage) -> Dict:
        """Handle health check requests"""
        target_agent = message.payload.get("agent_id")
        
        if target_agent:
            # Check specific agent
            agent_info = self.agent_registry.get_agent(target_agent)
            if agent_info:
                return {
                    "agent_id": target_agent,
                    "health": agent_info.get("health", {}),
                    "status": agent_info.get("status", "unknown")
                }
        else:
            # Return overall system health
            all_agents = self.agent_registry.list_all()
            return {
                "total_agents": len(all_agents),
                "healthy_agents": len([a for a in all_agents if a["status"] == "active"]),
                "system_status": "healthy" if all_agents else "no_agents"
            }
    
    def _handle_heal_request(self, message: AULMessage) -> Dict:
        """Handle healing requests"""
        issue = message.payload.get("issue")
        agent_id = message.payload.get("agent_id")
        
        print(f"🔧 Healing request: {issue} for agent {agent_id}")
        
        # Add to healing queue
        self.healing_queue.append({
            "timestamp": time.time(),
            "agent_id": agent_id,
            "issue": issue,
            "status": "queued"
        })
        
        return {"queued": True, "position": len(self.healing_queue)}
    
    def _handle_event(self, message: AULMessage) -> Dict:
        """Handle event notifications"""
        event_name = message.payload.get("event_name")
        
        print(f"📢 Event received: {event_name} from {message.sender_id}")
        
        # Handle critical events
        if message.priority == "critical":
            print(f"🚨 CRITICAL EVENT: {event_name}")
            
            # Escalate to healing
            if "error" in event_name.lower():
                self.healing_queue.append({
                    "timestamp": time.time(),
                    "agent_id": message.sender_id,
                    "issue": event_name,
                    "status": "critical"
                })
        
        return {"acknowledged": True}
    
    def _discover_agents(self):
        """Discover existing agents in the system"""
        print("🔍 Discovering agents...")
        
        # Broadcast discovery message
        self.send_message(
            message_type="query",
            payload={
                "query": "identify_agent",
                "orchestrator_id": self.agent_id
            }
        )
        
        print("✅ Discovery broadcast sent")
    
    def run_monitoring_cycle(self):
        """Run a single monitoring cycle"""
        print(f"\n{'='*70}")
        print(f"🔄 MONITORING CYCLE - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")
        
        # Get all registered agents
        agents = self.agent_registry.list_all()
        print(f"📊 Monitoring {len(agents)} agents")
        
        # Check health of each agent
        for agent in agents:
            agent_id = agent["agent_id"]
            health = agent.get("health", {})
            status = agent.get("status", "unknown")
            
            print(f"  • {agent_id}: {status} (uptime: {health.get('uptime_seconds', 0)}s)")
            
            # Update tracking
            if agent_id in self.monitored_agents:
                self.monitored_agents[agent_id]["last_health_check"] = time.time()
                self.monitored_agents[agent_id]["health_status"] = status
        
        # Process healing queue
        if self.healing_queue:
            print(f"\n🔧 Processing {len(self.healing_queue)} healing requests")
            # Process healing (simplified for now)
            self.healing_queue = []
        
        # Print statistics
        print("\n📈 Statistics:")
        bus_stats = self.message_bus.get_stats()
        print(f"  • Messages sent: {bus_stats['metrics']['messages_sent']}")
        print(f"  • Messages delivered: {bus_stats['metrics']['messages_delivered']}")
        print(f"  • Queue size: {bus_stats['queue_size']}")
        print(f"  • Avg latency: {bus_stats['metrics']['avg_latency_ms']:.2f}ms")
        
        registry_stats = self.agent_registry.get_stats()
        print(f"  • Total registered: {registry_stats['metrics']['total_registered']}")
        print(f"  • Active agents: {registry_stats['metrics']['active_agents']}")
    
    def run_forever(self):
        """Run orchestrator in continuous monitoring mode"""
        cycle = 0
        
        try:
            while self._running:
                cycle += 1
                self.run_monitoring_cycle()
                
                # Wait before next cycle (5 minutes)
                print(f"\n⏳ Next cycle in 5 minutes... (Ctrl+C to stop)")
                time.sleep(300)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Keyboard interrupt received")
        finally:
            self.stop()


def main():
    """Main entry point"""
    orchestrator = AULOrchestrator()
    orchestrator.start()
    orchestrator.run_forever()


if __name__ == "__main__":
    main()
