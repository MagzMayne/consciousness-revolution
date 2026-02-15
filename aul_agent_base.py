#!/usr/bin/env python3
"""
AUL Agent Base Class
Provides universal foundation for all autonomous agents
"""

import json
import time
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Any, Optional, Callable
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AULMessage:
    """Universal message envelope for agent communication"""
    
    def __init__(
        self,
        sender_id: str,
        sender_type: str,
        message_type: str,
        payload: Dict[str, Any],
        recipient_id: Optional[str] = None,
        priority: str = "normal",
        correlation_id: Optional[str] = None,
        ttl: int = 300
    ):
        self.message_id = str(uuid.uuid4())
        self.timestamp = datetime.utcnow().isoformat() + "Z"
        self.sender_id = sender_id
        self.sender_type = sender_type
        self.recipient_id = recipient_id
        self.message_type = message_type
        self.priority = priority
        self.payload = payload
        self.correlation_id = correlation_id or self.message_id
        self.ttl = ttl
        self.trace = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to AUL protocol dict"""
        return {
            "aul_version": "1.0",
            "message_id": self.message_id,
            "timestamp": self.timestamp,
            "sender": {
                "agent_id": self.sender_id,
                "agent_type": self.sender_type
            },
            "recipient": {
                "agent_id": self.recipient_id,
                "routing": "direct" if self.recipient_id else "broadcast"
            },
            "message": {
                "type": self.message_type,
                "priority": self.priority,
                "payload": self.payload,
                "ttl": self.ttl
            },
            "context": {
                "correlation_id": self.correlation_id,
                "trace": self.trace
            }
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AULMessage':
        """Create message from AUL protocol dict"""
        msg = cls(
            sender_id=data["sender"]["agent_id"],
            sender_type=data["sender"]["agent_type"],
            message_type=data["message"]["type"],
            payload=data["message"]["payload"],
            recipient_id=data["recipient"].get("agent_id"),
            priority=data["message"].get("priority", "normal"),
            correlation_id=data["context"].get("correlation_id"),
            ttl=data["message"].get("ttl", 300)
        )
        msg.message_id = data["message_id"]
        msg.timestamp = data["timestamp"]
        msg.trace = data["context"].get("trace", [])
        return msg


class AULAgent(ABC):
    """Base class for all AUL-compliant autonomous agents"""
    
    def __init__(
        self,
        agent_id: str,
        agent_type: str,
        version: str = "1.0.0",
        capabilities: Optional[List[str]] = None,
        heartbeat_interval: int = 30
    ):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.version = version
        self.capabilities = capabilities or []
        self.heartbeat_interval = heartbeat_interval
        
        # State management
        self.status = "initializing"
        self.start_time = time.time()
        self.error_count = 0
        self.success_count = 0
        self.message_handlers: Dict[str, Callable] = {}
        
        # Threading
        self._running = False
        self._heartbeat_thread = None
        self._message_thread = None
        
        # Performance metrics
        self.metrics = {
            "requests_per_second": 0.0,
            "avg_response_ms": 0.0,
            "error_rate_percent": 0.0
        }
        
        logger.info(f"AUL Agent initialized: {self.agent_id} ({self.agent_type})")
    
    def get_capability_declaration(self) -> Dict[str, Any]:
        """Get agent capability declaration for registry"""
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "version": self.version,
            "status": self.status,
            "capabilities": {
                "actions": self.capabilities,
                "max_throughput": self.get_max_throughput(),
                "avg_latency_ms": self.metrics["avg_response_ms"]
            },
            "health": self.get_health_status(),
            "endpoints": self.get_endpoints()
        }
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get current health status"""
        uptime = time.time() - self.start_time
        total_ops = self.success_count + self.error_count
        success_rate = (self.success_count / total_ops * 100) if total_ops > 0 else 100.0
        
        return {
            "uptime_seconds": int(uptime),
            "last_heartbeat": datetime.utcnow().isoformat() + "Z",
            "error_count": self.error_count,
            "success_count": self.success_count,
            "success_rate": round(success_rate, 2)
        }
    
    def get_endpoints(self) -> Dict[str, str]:
        """Get agent endpoints (override in subclass if needed)"""
        return {
            "health": f"/agent/{self.agent_id}/health",
            "execute": f"/agent/{self.agent_id}/execute",
            "status": f"/agent/{self.agent_id}/status"
        }
    
    def get_max_throughput(self) -> int:
        """Get maximum throughput (override in subclass)"""
        return 100
    
    def register_handler(self, message_type: str, handler: Callable):
        """Register a handler for specific message type"""
        self.message_handlers[message_type] = handler
        logger.info(f"Registered handler for message type: {message_type}")
    
    def send_message(
        self,
        message_type: str,
        payload: Dict[str, Any],
        recipient_id: Optional[str] = None,
        priority: str = "normal"
    ) -> AULMessage:
        """Send an AUL message"""
        message = AULMessage(
            sender_id=self.agent_id,
            sender_type=self.agent_type,
            message_type=message_type,
            payload=payload,
            recipient_id=recipient_id,
            priority=priority
        )
        
        # Add to trace
        message.trace.append({
            "agent_id": self.agent_id,
            "timestamp": message.timestamp,
            "action": "sent"
        })
        
        self.on_send_message(message)
        return message
    
    def receive_message(self, message: AULMessage) -> Optional[Dict[str, Any]]:
        """Receive and process an AUL message"""
        try:
            start_time = time.time()
            
            # Add to trace
            message.trace.append({
                "agent_id": self.agent_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "action": "received"
            })
            
            # Check if we have a handler
            if message.message_type in self.message_handlers:
                result = self.message_handlers[message.message_type](message)
            else:
                result = self.handle_message(message)
            
            # Track success
            execution_time = (time.time() - start_time) * 1000
            self.success_count += 1
            self._update_metrics(execution_time, success=True)
            
            # Return response
            return {
                "success": True,
                "data": result,
                "execution_time_ms": round(execution_time, 2)
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            self.error_count += 1
            execution_time = (time.time() - start_time) * 1000
            self._update_metrics(execution_time, success=False)
            
            return {
                "success": False,
                "error": str(e),
                "execution_time_ms": round(execution_time, 2)
            }
    
    def _update_metrics(self, execution_time_ms: float, success: bool):
        """Update performance metrics"""
        # Update average response time (exponential moving average)
        alpha = 0.1
        self.metrics["avg_response_ms"] = (
            alpha * execution_time_ms + 
            (1 - alpha) * self.metrics["avg_response_ms"]
        )
        
        # Update error rate
        total = self.success_count + self.error_count
        if total > 0:
            self.metrics["error_rate_percent"] = (self.error_count / total) * 100
    
    def send_heartbeat(self):
        """Send heartbeat message"""
        heartbeat = self.send_message(
            message_type="heartbeat",
            payload={
                "status": self.status,
                "uptime": int(time.time() - self.start_time),
                "load": self.metrics["avg_response_ms"]
            }
        )
        logger.debug(f"Heartbeat sent: {self.agent_id}")
        return heartbeat
    
    def _heartbeat_loop(self):
        """Background thread for sending heartbeats"""
        while self._running:
            try:
                self.send_heartbeat()
            except Exception as e:
                logger.error(f"Heartbeat error: {str(e)}")
            
            time.sleep(self.heartbeat_interval)
    
    def start(self):
        """Start the agent"""
        if self._running:
            logger.warning(f"Agent {self.agent_id} already running")
            return
        
        self._running = True
        self.status = "active"
        
        # Start heartbeat thread
        self._heartbeat_thread = threading.Thread(
            target=self._heartbeat_loop,
            daemon=True
        )
        self._heartbeat_thread.start()
        
        # Call subclass initialization
        self.on_start()
        
        logger.info(f"Agent started: {self.agent_id}")
    
    def stop(self):
        """Stop the agent gracefully"""
        if not self._running:
            return
        
        logger.info(f"Stopping agent: {self.agent_id}")
        self._running = False
        self.status = "offline"
        
        # Wait for threads
        if self._heartbeat_thread:
            self._heartbeat_thread.join(timeout=5)
        
        # Call subclass cleanup
        self.on_stop()
        
        logger.info(f"Agent stopped: {self.agent_id}")
    
    def handle_error(self, error: Exception, level: str = "L2"):
        """Handle errors according to AUL protocol"""
        logger.error(f"Error (Level {level}): {str(error)}")
        
        if level == "L1":  # Transient - retry
            return self.retry_with_backoff()
        elif level == "L2":  # Degraded - continue
            self.status = "degraded"
            return {"fallback": True}
        elif level == "L3":  # Critical - escalate
            return self.escalate_to_orchestrator(error)
        else:  # L4 - Fatal
            self.graceful_shutdown(error)
    
    def retry_with_backoff(self, max_retries: int = 5):
        """Retry with exponential backoff"""
        for i in range(max_retries):
            delay = min(0.1 * (2 ** i), 30)  # Max 30s
            logger.info(f"Retrying in {delay}s...")
            time.sleep(delay)
            # Retry logic here
        return None
    
    def escalate_to_orchestrator(self, error: Exception):
        """Escalate critical error to orchestrator"""
        self.send_message(
            message_type="event",
            payload={
                "event_name": "critical_error",
                "agent_id": self.agent_id,
                "error": str(error)
            },
            priority="critical"
        )
    
    def graceful_shutdown(self, error: Exception):
        """Graceful shutdown on fatal error"""
        logger.critical(f"Fatal error, shutting down: {str(error)}")
        self.stop()
    
    # Abstract methods - must be implemented by subclasses
    
    @abstractmethod
    def handle_message(self, message: AULMessage) -> Any:
        """Process incoming message (implement in subclass)"""
        pass
    
    def on_start(self):
        """Called when agent starts (override if needed)"""
        pass
    
    def on_stop(self):
        """Called when agent stops (override if needed)"""
        pass
    
    def on_send_message(self, message: AULMessage):
        """Called when message is sent (override if needed)"""
        pass


# Example usage
if __name__ == "__main__":
    class ExampleAgent(AULAgent):
        def __init__(self):
            super().__init__(
                agent_id="example-agent-01",
                agent_type="example",
                capabilities=["read", "analyze"]
            )
        
        def handle_message(self, message: AULMessage):
            logger.info(f"Received message: {message.message_type}")
            return {"processed": True}
    
    # Create and start agent
    agent = ExampleAgent()
    agent.start()
    
    # Test message
    test_msg = AULMessage(
        sender_id="test-sender",
        sender_type="test",
        message_type="command",
        payload={"action": "test"}
    )
    
    response = agent.receive_message(test_msg)
    print(f"Response: {json.dumps(response, indent=2)}")
    
    # Stop agent
    time.sleep(2)
    agent.stop()
