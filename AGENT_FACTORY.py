#!/usr/bin/env python3
"""
AGENT FACTORY
Factory pattern for creating and managing autonomous agents.

Features:
- Agent type registration and instantiation
- Singleton and batch creation
- Health monitoring across all agents
- Agent lifecycle management
- Configuration-based creation

MIT License - Consciousness Revolution Project
"""

import json
import logging
from typing import Dict, List, Optional, Any, Type
from pathlib import Path
from datetime import datetime
from AGENT_BASE_CLASS import BaseAgent, AgentConfig


logger = logging.getLogger(__name__)


class AgentFactory:
    """Factory for creating and managing autonomous agents."""
    
    def __init__(self):
        """Initialize the agent factory."""
        self.agent_registry: Dict[str, Type[BaseAgent]] = {}
        self.instances: Dict[str, BaseAgent] = {}
        self.metadata: Dict[str, Dict[str, Any]] = {}
        
        logger.info("AgentFactory initialized")
    
    def register_agent_type(
        self,
        agent_type: str,
        agent_class: Type[BaseAgent],
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Register an agent type.
        
        Args:
            agent_type: Unique type identifier
            agent_class: Agent class (must inherit from BaseAgent)
            metadata: Optional metadata about the agent type
        """
        if not issubclass(agent_class, BaseAgent):
            raise TypeError(f"{agent_class.__name__} must inherit from BaseAgent")
        
        if agent_type in self.agent_registry:
            logger.warning(f"Overwriting existing agent type: {agent_type}")
        
        self.agent_registry[agent_type] = agent_class
        self.metadata[agent_type] = {
            **(metadata or {}),
            "registered_at": datetime.now().isoformat(),
            "class_name": agent_class.__name__
        }
        
        logger.info(f"Registered agent type: {agent_type}")
    
    def create_agent(
        self,
        agent_type: str,
        name: str,
        config: Optional[AgentConfig] = None,
        singleton: bool = False
    ) -> BaseAgent:
        """Create an agent instance.
        
        Args:
            agent_type: Type of agent to create
            name: Instance name
            config: Agent configuration
            singleton: Whether to return existing instance if available
        
        Returns:
            Agent instance
        """
        # Check for existing singleton
        if singleton:
            instance_key = f"{agent_type}_{name}"
            if instance_key in self.instances:
                logger.info(f"Returning existing {agent_type} instance: {name}")
                return self.instances[instance_key]
        
        # Get agent class
        if agent_type not in self.agent_registry:
            available = ", ".join(self.agent_registry.keys())
            raise ValueError(
                f"Unknown agent type: {agent_type}. "
                f"Available types: {available or 'none registered'}"
            )
        
        agent_class = self.agent_registry[agent_type]
        
        # Create instance
        try:
            instance = agent_class(name=name, config=config)
            
            # Store singleton
            if singleton:
                instance_key = f"{agent_type}_{name}"
                self.instances[instance_key] = instance
            
            logger.info(f"Created {agent_type} agent: {name}")
            return instance
            
        except Exception as e:
            logger.error(f"Failed to create {agent_type} agent: {e}")
            raise
    
    def create_agent_batch(
        self,
        agent_type: str,
        count: int,
        name_prefix: str = "agent",
        config: Optional[AgentConfig] = None
    ) -> List[BaseAgent]:
        """Create multiple agents of the same type.
        
        Args:
            agent_type: Type of agent to create
            count: Number of agents to create
            name_prefix: Prefix for agent names
            config: Agent configuration
        
        Returns:
            List of agent instances
        """
        agents = []
        
        for i in range(count):
            name = f"{name_prefix}_{i + 1}"
            try:
                agent = self.create_agent(agent_type, name, config, singleton=False)
                agents.append(agent)
            except Exception as e:
                logger.error(f"Failed to create agent {name}: {e}")
        
        logger.info(f"Created batch of {len(agents)} {agent_type} agents")
        return agents
    
    def create_from_config(self, config: Dict[str, Any]) -> BaseAgent:
        """Create agent from configuration dictionary.
        
        Args:
            config: Configuration dictionary with 'type', 'name', and optional 'config'
        
        Returns:
            Agent instance
        """
        agent_type = config.get("type")
        name = config.get("name")
        agent_config = config.get("config")
        singleton = config.get("singleton", False)
        
        if not agent_type or not name:
            raise ValueError("Agent configuration must include 'type' and 'name'")
        
        # Convert config dict to AgentConfig if provided
        if agent_config and isinstance(agent_config, dict):
            agent_config = AgentConfig(**agent_config)
        
        return self.create_agent(agent_type, name, agent_config, singleton)
    
    def create_from_config_batch(self, config_list: List[Dict[str, Any]]) -> List[BaseAgent]:
        """Create multiple agents from configuration list.
        
        Args:
            config_list: List of configuration dictionaries
        
        Returns:
            List of agent instances
        """
        agents = []
        
        for config in config_list:
            try:
                agent = self.create_from_config(config)
                agents.append(agent)
            except Exception as e:
                logger.error(f"Failed to create agent from config: {e}")
        
        logger.info(f"Created {len(agents)} agents from configuration")
        return agents
    
    def get_instance(self, agent_type: str, name: str) -> Optional[BaseAgent]:
        """Get existing agent instance.
        
        Args:
            agent_type: Agent type
            name: Instance name
        
        Returns:
            Agent instance if exists, None otherwise
        """
        instance_key = f"{agent_type}_{name}"
        return self.instances.get(instance_key)
    
    def get_all_instances(self) -> List[BaseAgent]:
        """Get all agent instances.
        
        Returns:
            List of all agent instances
        """
        return list(self.instances.values())
    
    def get_registered_types(self) -> List[str]:
        """Get all registered agent types.
        
        Returns:
            List of agent type names
        """
        return list(self.agent_registry.keys())
    
    def get_type_metadata(self, agent_type: str) -> Optional[Dict[str, Any]]:
        """Get metadata for an agent type.
        
        Args:
            agent_type: Agent type
        
        Returns:
            Metadata dictionary if exists, None otherwise
        """
        return self.metadata.get(agent_type)
    
    async def destroy_instance(self, agent_type: str, name: str) -> bool:
        """Destroy an agent instance.
        
        Args:
            agent_type: Agent type
            name: Instance name
        
        Returns:
            True if destroyed, False if not found
        """
        instance_key = f"{agent_type}_{name}"
        instance = self.instances.get(instance_key)
        
        if instance:
            instance.stop()
            del self.instances[instance_key]
            logger.info(f"Destroyed instance: {instance_key}")
            return True
        
        return False
    
    async def destroy_all_instances(self) -> int:
        """Destroy all agent instances.
        
        Returns:
            Number of instances destroyed
        """
        count = len(self.instances)
        keys = list(self.instances.keys())
        
        for key in keys:
            instance = self.instances[key]
            instance.stop()
            del self.instances[key]
        
        logger.info(f"Destroyed all {count} instances")
        return count
    
    async def health_check_all(self) -> Dict[str, Any]:
        """Perform health check on all instances.
        
        Returns:
            Dictionary with health check results
        """
        results = []
        
        for key, instance in self.instances.items():
            try:
                health = await instance.health_check()
                results.append({
                    "key": key,
                    **health
                })
            except Exception as e:
                results.append({
                    "key": key,
                    "healthy": False,
                    "error": str(e)
                })
        
        healthy_count = sum(1 for r in results if r.get("healthy", False))
        
        return {
            "total": len(results),
            "healthy": healthy_count,
            "unhealthy": len(results) - healthy_count,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get factory statistics.
        
        Returns:
            Statistics dictionary
        """
        return {
            "registered_types": len(self.agent_registry),
            "active_instances": len(self.instances),
            "types": self.get_registered_types(),
            "instances": [
                {
                    "key": key,
                    "type": instance.__class__.__name__,
                    "name": instance.name,
                    "status": instance.status.value
                }
                for key, instance in self.instances.items()
            ],
            "timestamp": datetime.now().isoformat()
        }
    
    def save_state(self, output_path: Optional[Path] = None):
        """Save factory state to file.
        
        Args:
            output_path: Path to save state
        """
        output_path = output_path or Path("agent_factory_state.json")
        
        state = {
            "stats": self.get_stats(),
            "instances": {
                key: instance.get_status()
                for key, instance in self.instances.items()
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(state, f, indent=2)
        
        logger.info(f"Factory state saved to {output_path}")
    
    def load_config_file(self, config_path: Path) -> List[BaseAgent]:
        """Load and create agents from configuration file.
        
        Args:
            config_path: Path to configuration file
        
        Returns:
            List of created agents
        """
        with open(config_path, 'r') as f:
            config_data = json.load(f)
        
        agents_config = config_data.get("agents", [])
        return self.create_from_config_batch(agents_config)


# Singleton instance
_factory_instance = None


def get_agent_factory() -> AgentFactory:
    """Get singleton AgentFactory instance.
    
    Returns:
        AgentFactory singleton
    """
    global _factory_instance
    if _factory_instance is None:
        _factory_instance = AgentFactory()
    return _factory_instance


# Export
__all__ = ['AgentFactory', 'get_agent_factory']
