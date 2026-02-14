#!/usr/bin/env python3
"""
SYSTEM MONITORING AGENT
Example autonomous agent for monitoring system health.

Features:
- File system checks
- Dependency validation
- Service health monitoring
- Auto-healing capabilities
- Real-time reporting

MIT License - Consciousness Revolution Project
"""

import os
import subprocess
import json
from typing import Dict, Any, List
from pathlib import Path
from AGENT_BASE_CLASS import BaseAgent, AgentConfig


class SystemMonitoringAgent(BaseAgent):
    """Agent for monitoring system health and auto-healing."""
    
    def __init__(self, name: str, config: AgentConfig = None):
        """Initialize the monitoring agent."""
        super().__init__(name, config)
        self.repo_root = Path(__file__).parent
        self.issues_found = []
        self.healing_actions = []
    
    def get_capabilities(self) -> List[str]:
        """Get agent capabilities."""
        return [
            "filesystem_check",
            "dependency_check",
            "service_health_check",
            "auto_healing",
            "reporting"
        ]
    
    async def execute(self) -> Dict[str, Any]:
        """Execute monitoring checks."""
        self.log("info", "Starting system monitoring", {"agent": self.name})
        
        results = {
            "filesystem": await self._check_filesystem(),
            "dependencies": await self._check_dependencies(),
            "services": await self._check_services(),
            "healing": await self._perform_healing()
        }
        
        self.log("info", "Monitoring complete", {
            "agent": self.name,
            "issues_found": len(self.issues_found),
            "healing_actions": len(self.healing_actions)
        })
        
        return results
    
    async def _check_filesystem(self) -> Dict[str, Any]:
        """Check critical filesystem paths."""
        critical_paths = [
            "package.json",
            "README.md",
            "AUTONOMOUS_AGENT_ORCHESTRATOR.py",
            "AUTONOMOUS_AGENTS_DOCUMENTATION.md"
        ]
        
        missing = []
        for path in critical_paths:
            full_path = self.repo_root / path
            if not full_path.exists():
                missing.append(str(path))
                self.issues_found.append(f"Missing file: {path}")
        
        return {
            "status": "healthy" if not missing else "degraded",
            "total_checked": len(critical_paths),
            "missing": missing
        }
    
    async def _check_dependencies(self) -> Dict[str, Any]:
        """Check if dependencies are installed."""
        package_json = self.repo_root / "package.json"
        
        if not package_json.exists():
            return {"status": "unknown", "reason": "package.json not found"}
        
        # Check if node_modules exists
        node_modules = self.repo_root / "node_modules"
        
        if not node_modules.exists():
            self.issues_found.append("node_modules not found")
            return {
                "status": "unhealthy",
                "reason": "node_modules not found",
                "healing_available": True
            }
        
        return {"status": "healthy"}
    
    async def _check_services(self) -> Dict[str, Any]:
        """Check if critical services are accessible."""
        services = {
            "file_system": self.repo_root.exists(),
            "python": self._check_python(),
            "node": self._check_node()
        }
        
        healthy = all(services.values())
        
        return {
            "status": "healthy" if healthy else "degraded",
            "services": services
        }
    
    def _check_python(self) -> bool:
        """Check if Python is available."""
        try:
            result = subprocess.run(
                ["python3", "--version"],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def _check_node(self) -> bool:
        """Check if Node.js is available."""
        try:
            result = subprocess.run(
                ["node", "--version"],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False
    
    async def _perform_healing(self) -> Dict[str, Any]:
        """Perform auto-healing actions."""
        healing_results = []
        
        # Check if npm install is needed
        if "node_modules not found" in self.issues_found:
            result = await self._run_npm_install()
            healing_results.append(result)
        
        return {
            "actions_taken": len(healing_results),
            "results": healing_results
        }
    
    async def _run_npm_install(self) -> Dict[str, Any]:
        """Run npm install to fix missing dependencies."""
        self.log("info", "Running npm install", {"agent": self.name})
        self.healing_actions.append("npm_install")
        
        try:
            result = subprocess.run(
                ["npm", "install"],
                cwd=self.repo_root,
                capture_output=True,
                timeout=300,
                text=True
            )
            
            if result.returncode == 0:
                self.log("info", "npm install successful", {"agent": self.name})
                return {
                    "action": "npm_install",
                    "success": True,
                    "message": "Dependencies installed successfully"
                }
            else:
                self.log("error", "npm install failed", {
                    "agent": self.name,
                    "stderr": result.stderr[:500]
                })
                return {
                    "action": "npm_install",
                    "success": False,
                    "error": result.stderr[:500]
                }
        
        except Exception as e:
            self.log("error", "npm install exception", {
                "agent": self.name,
                "error": str(e)
            })
            return {
                "action": "npm_install",
                "success": False,
                "error": str(e)
            }


def main():
    """Test the monitoring agent."""
    print("=" * 70)
    print("🔍 SYSTEM MONITORING AGENT TEST")
    print("=" * 70)
    
    # Create and configure agent
    config = AgentConfig(
        enabled=True,
        interval=60,
        max_retries=3,
        auto_restart=True,
        log_level="INFO"
    )
    
    agent = SystemMonitoringAgent("system_monitor", config)
    agent.start()
    
    # Run monitoring
    import asyncio
    result = asyncio.run(agent.run())
    
    print(f"\n✅ Monitoring complete")
    print(f"Success: {result['success']}")
    print(f"Execution time: {result.get('execution_time', 0):.3f}s")
    
    # Show health status
    health = asyncio.run(agent.health_check())
    print(f"\n📊 Health Status:")
    print(f"  Healthy: {health['healthy']}")
    print(f"  Success rate: {health['success_rate']:.1%}")
    
    # Save state
    agent.save_state()
    print("\n✅ Test complete!")


if __name__ == "__main__":
    main()
