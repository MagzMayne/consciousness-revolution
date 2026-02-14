#!/usr/bin/env python3
"""
ENHANCED AUTONOMOUS AGENT INTEGRATION EXAMPLE
Demonstrates integration of new agent system with existing orchestrator.

This example shows how to use the new polymorphic agent system
alongside the existing AUTONOMOUS_AGENT_ORCHESTRATOR.py

MIT License - Consciousness Revolution Project
"""

import asyncio
from AGENT_FACTORY import get_agent_factory
from SYSTEM_MONITORING_AGENT import SystemMonitoringAgent
from AGENT_BASE_CLASS import AgentConfig
from MULTI_PROVIDER_AI_ORCHESTRATOR import MultiProviderOrchestrator


async def main():
    """Demonstration of enhanced agent system integration."""
    
    print("=" * 70)
    print("🤖 ENHANCED AUTONOMOUS AGENT SYSTEM INTEGRATION")
    print("=" * 70)
    print()
    
    # ========================================================================
    # 1. Initialize Agent Factory
    # ========================================================================
    print("📦 Step 1: Initialize Agent Factory")
    print("-" * 70)
    
    factory = get_agent_factory()
    
    # Register agent types
    factory.register_agent_type(
        "monitor",
        SystemMonitoringAgent,
        metadata={
            "description": "System health monitoring with auto-healing",
            "capabilities": ["filesystem", "dependencies", "services", "healing"]
        }
    )
    
    print(f"✅ Registered agent types: {factory.get_registered_types()}")
    print()
    
    # ========================================================================
    # 2. Create Agents with Different Configurations
    # ========================================================================
    print("🏭 Step 2: Create Multiple Agent Instances")
    print("-" * 70)
    
    # Create high-priority monitoring agent
    config_high = AgentConfig(
        enabled=True,
        interval=30,  # Check every 30 seconds
        max_retries=5,
        auto_restart=True,
        log_level="INFO"
    )
    
    agent_high = factory.create_agent(
        "monitor",
        "high_priority_monitor",
        config_high,
        singleton=True
    )
    
    # Create normal priority agents in batch
    config_normal = AgentConfig(
        enabled=True,
        interval=60,  # Check every minute
        max_retries=3,
        auto_restart=True,
        log_level="WARNING"
    )
    
    batch_agents = factory.create_agent_batch(
        "monitor",
        count=3,
        name_prefix="monitor_worker",
        config=config_normal
    )
    
    print(f"✅ Created {len(batch_agents) + 1} monitoring agents")
    print()
    
    # ========================================================================
    # 3. Initialize Multi-Provider AI Orchestrator
    # ========================================================================
    print("🧠 Step 3: Initialize AI Orchestrator")
    print("-" * 70)
    
    ai_orchestrator = MultiProviderOrchestrator()
    health = ai_orchestrator.get_health_status()
    
    print(f"✅ AI Orchestrator initialized")
    print(f"   Available providers: {len(health['providers'])}")
    for name, status in health['providers'].items():
        print(f"   - {name}: {status['status']}")
    print()
    
    # ========================================================================
    # 4. Start and Run Agents
    # ========================================================================
    print("🚀 Step 4: Start and Run Agents")
    print("-" * 70)
    
    # Start all agents
    agent_high.start()
    for agent in batch_agents:
        agent.start()
    
    print(f"✅ All agents started")
    print()
    
    # Run monitoring cycle
    print("🔄 Running monitoring cycle...")
    print()
    
    results = []
    
    # Run high priority agent
    result = await agent_high.run()
    results.append(("high_priority_monitor", result))
    
    # Run batch agents concurrently
    tasks = [agent.run() for agent in batch_agents]
    batch_results = await asyncio.gather(*tasks)
    
    for i, result in enumerate(batch_results):
        results.append((f"monitor_worker_{i+1}", result))
    
    # ========================================================================
    # 5. Analyze Results
    # ========================================================================
    print("📊 Step 5: Analyze Results")
    print("-" * 70)
    
    successful = sum(1 for _, r in results if r.get('success'))
    total_time = sum(r.get('execution_time', 0) for _, r in results)
    
    print(f"Total agents run: {len(results)}")
    print(f"Successful: {successful}/{len(results)} ({successful/len(results)*100:.1f}%)")
    print(f"Total execution time: {total_time:.3f}s")
    print(f"Average execution time: {total_time/len(results):.3f}s")
    print()
    
    # Show individual results
    for name, result in results:
        status_icon = "✅" if result.get('success') else "❌"
        print(f"{status_icon} {name}: {result.get('execution_time', 0):.3f}s")
    print()
    
    # ========================================================================
    # 6. Health Check All Agents
    # ========================================================================
    print("🏥 Step 6: Health Check All Agents")
    print("-" * 70)
    
    health_report = await factory.health_check_all()
    
    print(f"Total agents: {health_report['total']}")
    print(f"Healthy: {health_report['healthy']}")
    print(f"Unhealthy: {health_report['unhealthy']}")
    print()
    
    for agent_health in health_report['results']:
        status_icon = "✅" if agent_health['healthy'] else "❌"
        print(f"{status_icon} {agent_health['name']}: {agent_health['status']}")
    print()
    
    # ========================================================================
    # 7. Demonstrate AI Integration
    # ========================================================================
    print("🧠 Step 7: AI-Powered Analysis")
    print("-" * 70)
    
    # Use AI to analyze monitoring results
    summary = f"Monitoring cycle complete. {successful}/{len(results)} agents succeeded."
    
    ai_result = await ai_orchestrator.generate(
        f"Analyze this system monitoring result and provide insights: {summary}",
        system_prompt="You are a system health expert. Provide brief analysis.",
        max_tokens=150
    )
    
    if ai_result.get('success'):
        print(f"AI Analysis: {ai_result['response'][:200]}...")
        print(f"Provider used: {ai_result.get('provider')}")
    else:
        print(f"AI analysis failed: {ai_result.get('error')}")
    print()
    
    # ========================================================================
    # 8. Save State
    # ========================================================================
    print("💾 Step 8: Save State")
    print("-" * 70)
    
    factory.save_state()
    ai_orchestrator.save_health_report()
    
    print("✅ Factory state saved to: agent_factory_state.json")
    print("✅ AI health report saved to: ai_providers_health.json")
    print()
    
    # ========================================================================
    # 9. Factory Statistics
    # ========================================================================
    print("📈 Step 9: Factory Statistics")
    print("-" * 70)
    
    stats = factory.get_stats()
    
    print(f"Registered types: {stats['registered_types']}")
    print(f"Active instances: {stats['active_instances']}")
    print(f"Types: {', '.join(stats['types'])}")
    print()
    
    # ========================================================================
    # 10. Cleanup
    # ========================================================================
    print("🧹 Step 10: Cleanup")
    print("-" * 70)
    
    # Stop all agents
    agent_high.stop()
    for agent in batch_agents:
        agent.stop()
    
    print("✅ All agents stopped")
    print()
    
    # ========================================================================
    # Summary
    # ========================================================================
    print("=" * 70)
    print("✨ INTEGRATION DEMONSTRATION COMPLETE")
    print("=" * 70)
    print()
    print("Key Features Demonstrated:")
    print("  ✅ Agent factory with type registration")
    print("  ✅ Multiple agent instances with different configs")
    print("  ✅ Concurrent agent execution")
    print("  ✅ Health monitoring across all agents")
    print("  ✅ Multi-provider AI orchestration")
    print("  ✅ State persistence")
    print("  ✅ Graceful lifecycle management")
    print()
    print("Integration Points with Existing System:")
    print("  1. Can be called from AUTONOMOUS_AGENT_ORCHESTRATOR.py")
    print("  2. Agents can be added to monitoring cycles")
    print("  3. Factory manages multiple agent instances")
    print("  4. AI orchestrator provides intelligent decision making")
    print()


if __name__ == "__main__":
    asyncio.run(main())
