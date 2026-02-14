#!/usr/bin/env python3
"""
AGENT BASE CLASS
Polymorphic base class for all autonomous agents in the Consciousness Revolution platform.

Features:
- Abstract base class with template method pattern
- Health monitoring and metrics tracking
- Configurable lifecycle management
- Error handling with retry logic
- Logging and status reporting

MIT License - Consciousness Revolution Project
"""

import json
import logging
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field, asdict
from enum import Enum


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


class AgentStatus(Enum):
    """Agent status enumeration."""
    INITIALIZED = "initialized"
    STARTING = "starting"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPING = "stopping"
    STOPPED = "stopped"
    ERROR = "error"


@dataclass
class AgentMetrics:
    """Metrics tracked for each agent."""
    tasks_completed: int = 0
    tasks_failed: int = 0
    total_execution_time: float = 0.0
    last_execution_time: Optional[float] = None
    last_run: Optional[str] = None
    last_success: Optional[str] = None
    last_failure: Optional[str] = None
    error_count: int = 0
    consecutive_failures: int = 0
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate."""
        total = self.tasks_completed + self.tasks_failed
        if total == 0:
            return 1.0
        return self.tasks_completed / total
    
    @property
    def avg_execution_time(self) -> float:
        """Calculate average execution time."""
        total = self.tasks_completed + self.tasks_failed
        if total == 0:
            return 0.0
        return self.total_execution_time / total
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert metrics to dictionary."""
        return {
            **asdict(self),
            'success_rate': self.success_rate,
            'avg_execution_time': self.avg_execution_time
        }


@dataclass
class AgentConfig:
    """Configuration for agents."""
    enabled: bool = True
    interval: int = 60  # seconds
    max_retries: int = 3
    timeout: int = 30  # seconds
    auto_restart: bool = True
    log_level: str = "INFO"
    custom_settings: Dict[str, Any] = field(default_factory=dict)


class BaseAgent(ABC):
    """Abstract base class for all autonomous agents.
    
    This class provides the foundation for creating specialized agents with:
    - Lifecycle management (start, stop, pause, resume)
    - Health monitoring and metrics
    - Configuration management
    - Error handling and retry logic
    - Logging and status reporting
    
    Subclasses must implement:
    - execute(): Main agent logic
    - get_capabilities(): List of agent capabilities
    """
    
    def __init__(
        self,
        name: str,
        config: Optional[AgentConfig] = None,
        logger: Optional[logging.Logger] = None
    ):
        """Initialize the agent.
        
        Args:
            name: Unique agent name
            config: Agent configuration
            logger: Optional logger instance
        """
        if self.__class__ == BaseAgent:
            raise TypeError("BaseAgent is abstract and cannot be instantiated directly")
        
        self.name = name
        self.config = config or AgentConfig()
        self.logger = logger or logging.getLogger(name)
        self.logger.setLevel(getattr(logging, self.config.log_level))
        
        self.status = AgentStatus.INITIALIZED
        self.metrics = AgentMetrics()
        self._running = False
        
        self._initialize()
    
    def _initialize(self):
        """Initialize agent (template method pattern)."""
        self.log("info", "Initializing agent", {"agent": self.name})
        self.load_configuration()
        self.setup_capabilities()
        self.validate_dependencies()
        self.log("info", "Agent initialized", {"agent": self.name})
    
    @abstractmethod
    async def execute(self) -> Dict[str, Any]:
        """Execute the main agent logic.
        
        This method must be implemented by all subclasses.
        It should contain the core functionality of the agent.
        
        Returns:
            Dict with execution results
        """
        pass
    
    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """Get list of agent capabilities.
        
        Returns:
            List of capability strings
        """
        pass
    
    def load_configuration(self):
        """Load agent-specific configuration.
        
        Override this method to load custom configuration from files or environment.
        """
        self.log("debug", "Loading configuration", {"agent": self.name})
    
    def setup_capabilities(self):
        """Setup agent capabilities.
        
        Override this method to initialize agent-specific capabilities.
        """
        self.log("debug", "Setting up capabilities", {"agent": self.name})
    
    def validate_dependencies(self):
        """Validate required dependencies.
        
        Override this method to check for required resources, APIs, etc.
        """
        self.log("debug", "Validating dependencies", {"agent": self.name})
    
    async def run(self) -> Dict[str, Any]:
        """Run the agent with error handling and metrics tracking.
        
        Returns:
            Dict with execution results
        """
        if not self.config.enabled:
            self.log("warning", "Agent is disabled", {"agent": self.name})
            return {"success": False, "reason": "agent_disabled"}
        
        if self.status != AgentStatus.RUNNING:
            self.log("warning", "Agent not in running state", {"agent": self.name, "status": self.status.value})
            return {"success": False, "reason": "not_running"}
        
        start_time = time.time()
        self.metrics.last_run = datetime.now().isoformat()
        
        try:
            self.log("info", "Starting execution", {"agent": self.name})
            
            # Execute agent logic (polymorphic call)
            result = await self.execute()
            
            execution_time = time.time() - start_time
            self._record_success(execution_time)
            
            self.log("info", "Execution completed successfully", {
                "agent": self.name,
                "execution_time": execution_time,
                "result": result
            })
            
            return {
                "success": True,
                "result": result,
                "execution_time": execution_time,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            execution_time = time.time() - start_time
            self._record_failure(execution_time)
            
            self.log("error", "Execution failed", {
                "agent": self.name,
                "error": str(e),
                "execution_time": execution_time
            })
            
            # Handle error with retry logic
            await self.handle_error(e)
            
            return {
                "success": False,
                "error": str(e),
                "execution_time": execution_time,
                "timestamp": datetime.now().isoformat()
            }
    
    async def handle_error(self, error: Exception):
        """Handle errors with retry logic.
        
        Args:
            error: The exception that occurred
        """
        self.log("error", "Error occurred", {
            "agent": self.name,
            "error": str(error),
            "consecutive_failures": self.metrics.consecutive_failures
        })
        
        # Check if we should retry
        if self.metrics.consecutive_failures < self.config.max_retries:
            self.log("info", "Will retry on next run", {
                "agent": self.name,
                "failures": self.metrics.consecutive_failures,
                "max_retries": self.config.max_retries
            })
        else:
            self.log("error", "Max retries exceeded", {
                "agent": self.name,
                "failures": self.metrics.consecutive_failures
            })
            
            if self.config.auto_restart:
                self.log("info", "Auto-restarting agent", {"agent": self.name})
                await self.restart()
    
    def _record_success(self, execution_time: float):
        """Record successful execution."""
        self.metrics.tasks_completed += 1
        self.metrics.total_execution_time += execution_time
        self.metrics.last_execution_time = execution_time
        self.metrics.last_success = datetime.now().isoformat()
        self.metrics.consecutive_failures = 0
    
    def _record_failure(self, execution_time: float):
        """Record failed execution."""
        self.metrics.tasks_failed += 1
        self.metrics.error_count += 1
        self.metrics.total_execution_time += execution_time
        self.metrics.last_execution_time = execution_time
        self.metrics.last_failure = datetime.now().isoformat()
        self.metrics.consecutive_failures += 1
    
    def start(self):
        """Start the agent."""
        if self.status == AgentStatus.RUNNING:
            self.log("warning", "Agent already running", {"agent": self.name})
            return
        
        self.log("info", "Starting agent", {"agent": self.name})
        self.status = AgentStatus.RUNNING
        self._running = True
        self.log("info", "Agent started", {"agent": self.name})
    
    def stop(self):
        """Stop the agent."""
        if self.status == AgentStatus.STOPPED:
            self.log("warning", "Agent already stopped", {"agent": self.name})
            return
        
        self.log("info", "Stopping agent", {"agent": self.name})
        self.status = AgentStatus.STOPPED
        self._running = False
        self.log("info", "Agent stopped", {"agent": self.name})
    
    def pause(self):
        """Pause the agent."""
        if self.status != AgentStatus.RUNNING:
            self.log("warning", "Agent not running", {"agent": self.name})
            return
        
        self.log("info", "Pausing agent", {"agent": self.name})
        self.status = AgentStatus.PAUSED
    
    def resume(self):
        """Resume the agent."""
        if self.status != AgentStatus.PAUSED:
            self.log("warning", "Agent not paused", {"agent": self.name})
            return
        
        self.log("info", "Resuming agent", {"agent": self.name})
        self.status = AgentStatus.RUNNING
    
    async def restart(self):
        """Restart the agent."""
        self.log("info", "Restarting agent", {"agent": self.name})
        self.stop()
        time.sleep(1)
        self.start()
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status and metrics.
        
        Returns:
            Dict with status information
        """
        return {
            "name": self.name,
            "type": self.__class__.__name__,
            "status": self.status.value,
            "enabled": self.config.enabled,
            "capabilities": self.get_capabilities(),
            "metrics": self.metrics.to_dict(),
            "config": {
                "interval": self.config.interval,
                "max_retries": self.config.max_retries,
                "timeout": self.config.timeout,
                "auto_restart": self.config.auto_restart
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check.
        
        Returns:
            Dict with health status
        """
        is_healthy = (
            self.status == AgentStatus.RUNNING and
            self.metrics.consecutive_failures < self.config.max_retries and
            self.metrics.success_rate >= 0.5
        )
        
        return {
            "healthy": is_healthy,
            "name": self.name,
            "status": self.status.value,
            "success_rate": self.metrics.success_rate,
            "consecutive_failures": self.metrics.consecutive_failures,
            "last_run": self.metrics.last_run,
            "timestamp": datetime.now().isoformat()
        }
    
    def log(self, level: str, message: str, details: Optional[Dict[str, Any]] = None):
        """Log message with details.
        
        Args:
            level: Log level (debug, info, warning, error, critical)
            message: Log message
            details: Additional details
        """
        log_method = getattr(self.logger, level.lower(), self.logger.info)
        if details:
            log_method(f"{message}: {json.dumps(details)}")
        else:
            log_method(message)
    
    def to_json(self) -> str:
        """Export agent data as JSON.
        
        Returns:
            JSON string
        """
        return json.dumps(self.get_status(), indent=2)
    
    def save_state(self, output_path: Optional[Path] = None):
        """Save agent state to file.
        
        Args:
            output_path: Path to save state (optional)
        """
        output_path = output_path or Path(f".{self.name}_state.json")
        
        with open(output_path, 'w') as f:
            f.write(self.to_json())
        
        self.log("debug", "State saved", {"agent": self.name, "path": str(output_path)})


# Export
__all__ = ['BaseAgent', 'AgentStatus', 'AgentMetrics', 'AgentConfig']
