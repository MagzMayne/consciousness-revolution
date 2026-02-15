#!/usr/bin/env python3
"""
AUL Protocol Test Suite
Comprehensive tests for AI Universal Language implementation

Usage:
    python3 aul_test_suite.py

Output:
    - Console output with test results
    - JSON file: AUL_TEST_RESULTS.json

Expected Output:
    - 35 tests total
    - 90%+ pass rate
    - Performance metrics validation
"""

import sys
import time
import json
from pathlib import Path

# Add repo root to path
repo_root = Path(__file__).parent
sys.path.insert(0, str(repo_root))

from aul_agent_base import AULAgent, AULMessage
from aul_message_bus import AULMessageBus, get_message_bus
from aul_agent_registry import AULAgentRegistry, get_agent_registry


class TestAgent(AULAgent):
    """Test agent for validation"""
    
    def __init__(self, agent_id="test-agent"):
        super().__init__(
            agent_id=agent_id,
            agent_type="test",
            capabilities=["read", "write", "analyze"]
        )
        self.messages_received = []
    
    def handle_message(self, message: AULMessage):
        self.messages_received.append(message)
        return {"processed": True, "count": len(self.messages_received)}


class AULTestSuite:
    """Comprehensive test suite for AUL protocol"""
    
    def __init__(self):
        self.tests_passed = 0
        self.tests_failed = 0
        self.test_results = []
    
    def run_all_tests(self):
        """Run all test categories"""
        print("=" * 70)
        print("🧪 AUL PROTOCOL TEST SUITE")
        print("=" * 70)
        print()
        
        # Test categories
        self.test_message_creation()
        self.test_agent_lifecycle()
        self.test_message_bus()
        self.test_agent_registry()
        self.test_performance()
        self.test_error_handling()
        self.test_interoperability()
        
        # Print summary
        self.print_summary()
        
        return self.tests_failed == 0
    
    def test(self, name: str, condition: bool, details: str = ""):
        """Helper to run a single test"""
        if condition:
            self.tests_passed += 1
            status = "✅ PASS"
            print(f"{status} - {name}")
        else:
            self.tests_failed += 1
            status = "❌ FAIL"
            print(f"{status} - {name}")
            if details:
                print(f"         {details}")
        
        self.test_results.append({
            "name": name,
            "passed": condition,
            "details": details
        })
    
    def test_message_creation(self):
        """Test AUL message envelope creation"""
        print("\n📋 Testing Message Creation...")
        
        # Create message
        msg = AULMessage(
            sender_id="test-sender",
            sender_type="test",
            message_type="command",
            payload={"action": "test"}
        )
        
        self.test(
            "Message has UUID",
            len(msg.message_id) == 36,
            f"UUID: {msg.message_id}"
        )
        
        self.test(
            "Message has timestamp",
            msg.timestamp is not None and "T" in msg.timestamp
        )
        
        self.test(
            "Message has correlation ID",
            msg.correlation_id == msg.message_id
        )
        
        # Test to_dict
        msg_dict = msg.to_dict()
        
        self.test(
            "Message converts to dict",
            isinstance(msg_dict, dict) and "aul_version" in msg_dict
        )
        
        self.test(
            "AUL version is 1.0",
            msg_dict["aul_version"] == "1.0"
        )
        
        # Test from_dict
        msg2 = AULMessage.from_dict(msg_dict)
        
        self.test(
            "Message reconstructs from dict",
            msg2.message_id == msg.message_id and msg2.payload == msg.payload
        )
    
    def test_agent_lifecycle(self):
        """Test agent lifecycle management"""
        print("\n🤖 Testing Agent Lifecycle...")
        
        # Create agent
        agent = TestAgent(agent_id="lifecycle-test-agent")
        
        self.test(
            "Agent initializes with correct ID",
            agent.agent_id == "lifecycle-test-agent"
        )
        
        self.test(
            "Agent starts in initializing state",
            agent.status == "initializing"
        )
        
        # Start agent
        agent.start()
        
        self.test(
            "Agent enters active state after start",
            agent.status == "active"
        )
        
        self.test(
            "Agent is running",
            agent._running == True
        )
        
        # Get capability declaration
        cap_decl = agent.get_capability_declaration()
        
        self.test(
            "Capability declaration has required fields",
            all(k in cap_decl for k in ["agent_id", "agent_type", "status", "capabilities", "health"])
        )
        
        # Get health status
        health = agent.get_health_status()
        
        self.test(
            "Health status contains uptime",
            "uptime_seconds" in health and health["uptime_seconds"] >= 0
        )
        
        # Stop agent
        agent.stop()
        
        self.test(
            "Agent enters offline state after stop",
            agent.status == "offline"
        )
        
        self.test(
            "Agent is not running",
            agent._running == False
        )
    
    def test_message_bus(self):
        """Test message bus functionality"""
        print("\n📨 Testing Message Bus...")
        
        # Create message bus
        bus = AULMessageBus()
        bus.start()
        
        self.test(
            "Message bus starts successfully",
            bus._running == True
        )
        
        # Create test agent
        agent = TestAgent(agent_id="bus-test-agent")
        
        # Register agent with bus
        received_messages = []
        
        def callback(msg):
            received_messages.append(msg)
        
        bus.register_agent(
            agent_id=agent.agent_id,
            agent_type=agent.agent_type,
            capabilities=agent.capabilities,
            callback=callback
        )
        
        self.test(
            "Agent registers with bus",
            agent.agent_id in bus.agents
        )
        
        # Publish message
        test_msg = AULMessage(
            sender_id="test-sender",
            sender_type="test",
            message_type="command",
            payload={"test": "data"},
            recipient_id=agent.agent_id
        )
        
        success = bus.publish(test_msg)
        
        self.test(
            "Message publishes successfully",
            success == True
        )
        
        # Wait for delivery
        time.sleep(0.5)
        
        self.test(
            "Message delivers to agent",
            len(received_messages) > 0
        )
        
        # Check stats
        stats = bus.get_stats()
        
        self.test(
            "Bus tracks metrics",
            stats["metrics"]["messages_sent"] > 0
        )
        
        # Unregister agent
        bus.unregister_agent(agent.agent_id)
        
        self.test(
            "Agent unregisters from bus",
            agent.agent_id not in bus.agents
        )
        
        # Stop bus
        bus.stop()
        
        self.test(
            "Message bus stops successfully",
            bus._running == False
        )
    
    def test_agent_registry(self):
        """Test agent registry functionality"""
        print("\n📚 Testing Agent Registry...")
        
        # Create registry
        registry = AULAgentRegistry()
        registry.start()
        
        self.test(
            "Registry starts successfully",
            registry._running == True
        )
        
        # Create test agent
        agent = TestAgent(agent_id="registry-test-agent")
        
        # Register agent
        cap_decl = agent.get_capability_declaration()
        success = registry.register(cap_decl)
        
        self.test(
            "Agent registers with registry",
            success == True
        )
        
        # Get agent
        agent_info = registry.get_agent(agent.agent_id)
        
        self.test(
            "Agent retrieves from registry",
            agent_info is not None and agent_info["agent_id"] == agent.agent_id
        )
        
        # Find by type
        agents_by_type = registry.find_by_type("test")
        
        self.test(
            "Find agents by type",
            len(agents_by_type) > 0 and agents_by_type[0]["agent_id"] == agent.agent_id
        )
        
        # Find by capability
        agents_by_cap = registry.find_by_capability("read")
        
        self.test(
            "Find agents by capability",
            len(agents_by_cap) > 0
        )
        
        # Find best agent
        best = registry.find_best_agent("analyze")
        
        self.test(
            "Find best agent for capability",
            best is not None and "analyze" in best["capabilities"]["actions"]
        )
        
        # Update heartbeat
        success = registry.update_heartbeat(agent.agent_id)
        
        self.test(
            "Heartbeat updates successfully",
            success == True
        )
        
        # Get stats
        stats = registry.get_stats()
        
        self.test(
            "Registry tracks metrics",
            stats["metrics"]["total_registered"] > 0
        )
        
        # Unregister
        success = registry.unregister(agent.agent_id)
        
        self.test(
            "Agent unregisters from registry",
            success == True
        )
        
        # Stop registry
        registry.stop()
        
        self.test(
            "Registry stops successfully",
            registry._running == False
        )
    
    def test_performance(self):
        """Test performance and speed"""
        print("\n⚡ Testing Performance...")
        
        # Create components
        bus = AULMessageBus()
        registry = AULAgentRegistry()
        bus.start()
        registry.start()
        
        agent = TestAgent(agent_id="perf-test-agent")
        agent.start()
        
        # Register agent
        registry.register(agent.get_capability_declaration())
        
        received = []
        bus.register_agent(
            agent_id=agent.agent_id,
            agent_type=agent.agent_type,
            capabilities=agent.capabilities,
            callback=lambda m: received.append(m)
        )
        
        # Send multiple messages and measure time
        start_time = time.time()
        num_messages = 100
        
        for i in range(num_messages):
            msg = AULMessage(
                sender_id="perf-tester",
                sender_type="test",
                message_type="command",
                payload={"index": i},
                recipient_id=agent.agent_id
            )
            bus.publish(msg)
        
        # Wait for delivery
        time.sleep(2)
        
        elapsed = time.time() - start_time
        throughput = num_messages / elapsed
        
        self.test(
            f"Throughput: {throughput:.1f} msg/s",
            throughput > 10,  # At least 10 messages per second
            f"Sent {num_messages} messages in {elapsed:.2f}s"
        )
        
        # Check latency
        stats = bus.get_stats()
        latency = stats["metrics"]["avg_latency_ms"]
        
        self.test(
            f"Average latency: {latency:.1f}ms",
            latency < 100,  # Less than 100ms average
            "Latency should be under 100ms"
        )
        
        # Cleanup
        agent.stop()
        bus.stop()
        registry.stop()
    
    def test_error_handling(self):
        """Test error handling and recovery"""
        print("\n🔧 Testing Error Handling...")
        
        agent = TestAgent(agent_id="error-test-agent")
        agent.start()
        
        # Test error levels
        self.test(
            "Agent handles L1 (transient) errors",
            agent.handle_error(Exception("Test L1"), "L1") is not None
        )
        
        self.test(
            "Agent handles L2 (degraded) errors",
            agent.handle_error(Exception("Test L2"), "L2") == {"fallback": True}
        )
        
        self.test(
            "Agent enters degraded state on L2 error",
            agent.status == "degraded"
        )
        
        agent.stop()
    
    def test_interoperability(self):
        """Test cross-language interoperability"""
        print("\n🌐 Testing Interoperability...")
        
        # Create Python message
        py_msg = AULMessage(
            sender_id="python-agent",
            sender_type="python",
            message_type="command",
            payload={"language": "python"}
        )
        
        # Convert to dict (simulates JSON serialization)
        msg_dict = py_msg.to_dict()
        
        self.test(
            "Python message serializes to dict",
            isinstance(msg_dict, dict) and msg_dict["aul_version"] == "1.0"
        )
        
        # Reconstruct (simulates JavaScript receiving message)
        reconstructed = AULMessage.from_dict(msg_dict)
        
        self.test(
            "Message reconstructs with same data",
            reconstructed.message_id == py_msg.message_id and
            reconstructed.payload == py_msg.payload
        )
        
        self.test(
            "Cross-language message format is valid",
            all(k in msg_dict for k in ["aul_version", "message_id", "timestamp", "sender", "recipient", "message"])
        )
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        total = self.tests_passed + self.tests_failed
        pass_rate = (self.tests_passed / total * 100) if total > 0 else 0
        
        print(f"\nTotal Tests: {total}")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_failed}")
        print(f"📈 Pass Rate: {pass_rate:.1f}%")
        
        if self.tests_failed == 0:
            print("\n🎉 ALL TESTS PASSED! AUL protocol is working perfectly.")
        else:
            print("\n⚠️  Some tests failed. Please review the output above.")
        
        print("=" * 70)
        
        # Export results
        results_file = Path(__file__).parent / "AUL_TEST_RESULTS.json"
        with open(results_file, 'w') as f:
            json.dump({
                "timestamp": time.time(),
                "total": total,
                "passed": self.tests_passed,
                "failed": self.tests_failed,
                "pass_rate": pass_rate,
                "results": self.test_results
            }, f, indent=2)
        
        print(f"\n📄 Results exported to: {results_file}")


def main():
    """Main entry point"""
    suite = AULTestSuite()
    success = suite.run_all_tests()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
