#!/usr/bin/env python3
"""
AUL Message Bus
Central message routing and delivery system for autonomous agents
"""

import json
import time
import threading
from typing import Dict, List, Optional, Callable
from collections import defaultdict, deque
import logging

from aul_agent_base import AULMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MessageQueue:
    """Thread-safe priority queue for messages"""
    
    PRIORITY_ORDER = {"critical": 0, "high": 1, "normal": 2, "low": 3}
    
    def __init__(self, max_size: int = 10000):
        self.queues = {
            "critical": deque(maxlen=max_size),
            "high": deque(maxlen=max_size),
            "normal": deque(maxlen=max_size),
            "low": deque(maxlen=max_size)
        }
        self.lock = threading.Lock()
        self.not_empty = threading.Condition(self.lock)
    
    def put(self, message: AULMessage):
        """Add message to queue"""
        with self.not_empty:
            priority = message.priority
            self.queues[priority].append(message)
            self.not_empty.notify()
    
    def get(self, timeout: Optional[float] = None) -> Optional[AULMessage]:
        """Get highest priority message"""
        with self.not_empty:
            # Wait for message if queues empty
            if self.empty():
                if not self.not_empty.wait(timeout=timeout):
                    return None
            
            # Get from highest priority queue
            for priority in ["critical", "high", "normal", "low"]:
                if self.queues[priority]:
                    return self.queues[priority].popleft()
            
            return None
    
    def empty(self) -> bool:
        """Check if all queues are empty"""
        return all(len(q) == 0 for q in self.queues.values())
    
    def size(self) -> int:
        """Get total queue size"""
        return sum(len(q) for q in self.queues.values())


class AULMessageBus:
    """
    Central message bus for agent communication
    Provides routing, filtering, and delivery with speed optimizations
    """
    
    def __init__(self, max_queue_size: int = 10000):
        # Agent registry
        self.agents: Dict[str, Dict] = {}
        self.subscribers: Dict[str, List[Callable]] = defaultdict(list)
        
        # Message queues
        self.message_queue = MessageQueue(max_queue_size)
        
        # Message history for dashboard (keep last 100 messages)
        self.message_history = deque(maxlen=100)
        self.history_lock = threading.Lock()
        
        # State
        self._running = False
        self._dispatch_thread = None
        
        # Metrics
        self.metrics = {
            "messages_sent": 0,
            "messages_delivered": 0,
            "messages_dropped": 0,
            "avg_latency_ms": 0.0
        }
        
        # Performance optimization
        self._agent_cache = {}  # Cache for fast agent lookup
        self._routing_cache = {}  # Cache for routing decisions
        
        logger.info("AUL Message Bus initialized")
    
    def register_agent(
        self,
        agent_id: str,
        agent_type: str,
        capabilities: List[str],
        callback: Optional[Callable] = None
    ):
        """Register agent with the message bus"""
        self.agents[agent_id] = {
            "agent_id": agent_id,
            "agent_type": agent_type,
            "capabilities": capabilities,
            "callback": callback,
            "registered_at": time.time(),
            "last_seen": time.time(),
            "message_count": 0
        }
        
        # Update cache
        self._agent_cache[agent_id] = self.agents[agent_id]
        
        logger.info(f"Agent registered: {agent_id} ({agent_type})")
    
    def unregister_agent(self, agent_id: str):
        """Unregister agent from message bus"""
        if agent_id in self.agents:
            del self.agents[agent_id]
            if agent_id in self._agent_cache:
                del self._agent_cache[agent_id]
            logger.info(f"Agent unregistered: {agent_id}")
    
    def subscribe(self, message_type: str, callback: Callable):
        """Subscribe to specific message type"""
        self.subscribers[message_type].append(callback)
        logger.info(f"New subscriber for message type: {message_type}")
    
    def publish(self, message: AULMessage) -> bool:
        """
        Publish message to the bus
        Returns True if accepted, False if rejected
        """
        try:
            # Check TTL
            message_age = time.time() - self._parse_timestamp(message.timestamp)
            if message_age > message.ttl:
                logger.warning(f"Message expired (age: {message_age}s)")
                self.metrics["messages_dropped"] += 1
                return False
            
            # Add to queue
            self.message_queue.put(message)
            self.metrics["messages_sent"] += 1
            
            # Add to history for dashboard
            with self.history_lock:
                self.message_history.append({
                    "id": message.message_id,
                    "timestamp": message.timestamp,
                    "sender_id": message.sender_id,
                    "sender_type": message.sender_type,
                    "recipient_id": message.recipient_id or "broadcast",
                    "message_type": message.message_type,
                    "priority": message.priority,
                    "payload": message.payload
                })
            
            logger.debug(f"Message published: {message.message_id} ({message.message_type})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to publish message: {str(e)}")
            self.metrics["messages_dropped"] += 1
            return False
    
    def _dispatch_loop(self):
        """Background thread that dispatches messages"""
        logger.info("Message dispatch loop started")
        
        while self._running:
            try:
                # Get next message (with timeout)
                message = self.message_queue.get(timeout=1.0)
                if not message:
                    continue
                
                start_time = time.time()
                
                # Route and deliver message
                self._route_message(message)
                
                # Update metrics
                latency = (time.time() - start_time) * 1000
                self._update_latency(latency)
                
            except Exception as e:
                logger.error(f"Dispatch error: {str(e)}")
        
        logger.info("Message dispatch loop stopped")
    
    def _route_message(self, message: AULMessage):
        """Route message to appropriate recipients"""
        delivered = False
        
        # Direct routing
        if message.recipient_id:
            delivered = self._deliver_to_agent(message, message.recipient_id)
        
        # Broadcast routing
        else:
            # Notify all subscribers
            for callback in self.subscribers.get(message.message_type, []):
                try:
                    callback(message)
                    delivered = True
                except Exception as e:
                    logger.error(f"Subscriber callback error: {str(e)}")
            
            # Deliver to all capable agents
            for agent_id, agent_info in self.agents.items():
                if self._can_handle(agent_info, message):
                    if self._deliver_to_agent(message, agent_id):
                        delivered = True
        
        # Update metrics
        if delivered:
            self.metrics["messages_delivered"] += 1
        else:
            self.metrics["messages_dropped"] += 1
            logger.warning(f"Message not delivered: {message.message_id}")
    
    def _deliver_to_agent(self, message: AULMessage, agent_id: str) -> bool:
        """Deliver message to specific agent"""
        agent_info = self._agent_cache.get(agent_id)
        
        if not agent_info:
            logger.warning(f"Agent not found: {agent_id}")
            return False
        
        try:
            callback = agent_info.get("callback")
            if callback:
                callback(message)
                
                # Update agent stats
                agent_info["last_seen"] = time.time()
                agent_info["message_count"] += 1
                
                return True
            else:
                logger.warning(f"No callback for agent: {agent_id}")
                return False
                
        except Exception as e:
            logger.error(f"Delivery error to {agent_id}: {str(e)}")
            return False
    
    def _can_handle(self, agent_info: Dict, message: AULMessage) -> bool:
        """Check if agent can handle message type"""
        # Fast path: check cache
        cache_key = (agent_info["agent_id"], message.message_type)
        if cache_key in self._routing_cache:
            return self._routing_cache[cache_key]
        
        # Determine if agent can handle
        can_handle = False
        
        # All agents get heartbeats and events
        if message.message_type in ["heartbeat", "event"]:
            can_handle = True
        # For other message types, agent receives if no specific routing
        # In production, this would check agent capabilities
        # For now, broadcast non-targeted messages to all agents
        elif not message.recipient_id:
            can_handle = True
        
        # Cache result
        self._routing_cache[cache_key] = can_handle
        return can_handle
    
    def _update_latency(self, latency_ms: float):
        """Update average latency metric"""
        alpha = 0.1  # Exponential moving average factor
        self.metrics["avg_latency_ms"] = (
            alpha * latency_ms + 
            (1 - alpha) * self.metrics["avg_latency_ms"]
        )
    
    def _parse_timestamp(self, timestamp: str) -> float:
        """Parse ISO-8601 timestamp to Unix time"""
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            return dt.timestamp()
        except:
            return time.time()
    
    def start(self):
        """Start the message bus"""
        if self._running:
            logger.warning("Message bus already running")
            return
        
        self._running = True
        
        # Start dispatch thread
        self._dispatch_thread = threading.Thread(
            target=self._dispatch_loop,
            daemon=True
        )
        self._dispatch_thread.start()
        
        logger.info("Message bus started")
    
    def stop(self):
        """Stop the message bus"""
        if not self._running:
            return
        
        logger.info("Stopping message bus...")
        self._running = False
        
        # Wait for dispatch thread
        if self._dispatch_thread:
            self._dispatch_thread.join(timeout=5)
        
        logger.info("Message bus stopped")
    
    def get_stats(self) -> Dict:
        """Get message bus statistics"""
        return {
            "agents_registered": len(self.agents),
            "queue_size": self.message_queue.size(),
            "metrics": self.metrics,
            "uptime": "active" if self._running else "stopped"
        }
    
    def list_agents(self) -> List[Dict]:
        """List all registered agents"""
        return [
            {
                "agent_id": info["agent_id"],
                "agent_type": info["agent_type"],
                "capabilities": info["capabilities"],
                "message_count": info["message_count"],
                "last_seen": info["last_seen"]
            }
            for info in self.agents.values()
        ]
    
    def get_message_history(self, limit: int = 50) -> List[Dict]:
        """Get recent message history for dashboard"""
        with self.history_lock:
            return list(self.message_history)[-limit:]


# Singleton instance
_message_bus_instance = None

def get_message_bus() -> AULMessageBus:
    """Get global message bus instance"""
    global _message_bus_instance
    if _message_bus_instance is None:
        _message_bus_instance = AULMessageBus()
    return _message_bus_instance


# Example usage
if __name__ == "__main__":
    # Create message bus
    bus = AULMessageBus()
    bus.start()
    
    # Register test agent
    def test_callback(message: AULMessage):
        print(f"Received: {message.message_type} - {message.payload}")
    
    bus.register_agent(
        agent_id="test-agent-01",
        agent_type="test",
        capabilities=["read"],
        callback=test_callback
    )
    
    # Send test message
    test_msg = AULMessage(
        sender_id="sender-01",
        sender_type="test",
        message_type="command",
        payload={"action": "test"},
        recipient_id="test-agent-01"
    )
    
    bus.publish(test_msg)
    
    # Wait for delivery
    time.sleep(2)
    
    # Print stats
    print("\nMessage Bus Stats:")
    print(json.dumps(bus.get_stats(), indent=2))
    
    # Stop bus
    bus.stop()
