"""
CIRCUIT BREAKER - Automatic System Protection
==============================================
Automatically trips when system is overloaded.
Self-healing with gradual recovery.
Prevents cascade failures.

Usage:
    from CIRCUIT_BREAKER import CircuitBreaker, circuit_protect

    breaker = CircuitBreaker('araya_api')

    @circuit_protect('araya_api')
    def call_araya():
        # If circuit is open, this raises CircuitOpenError
        # If circuit is half-open, allows test request
        # Records success/failure to determine circuit state
        return make_api_call()

Deploy: Railway with ARAYA_UNIFIED_API.py
"""

import time
import threading
from datetime import datetime, timedelta
from collections import deque
from enum import Enum
import json

# ============================================
# CIRCUIT STATES
# ============================================

class CircuitState(Enum):
    CLOSED = 'closed'      # Normal operation
    OPEN = 'open'          # Blocking all requests
    HALF_OPEN = 'half_open'  # Testing if system recovered

# ============================================
# CONFIGURATION
# ============================================

CIRCUIT_CONFIG = {
    # Failure thresholds
    'failure_threshold': 5,      # Failures before opening circuit
    'failure_window_seconds': 60, # Window for counting failures

    # Recovery settings
    'recovery_timeout': 30,       # Seconds before trying half-open
    'success_threshold': 3,       # Successes needed to close circuit
    'half_open_max_requests': 3,  # Max requests in half-open state

    # Response time monitoring
    'slow_call_threshold_ms': 5000,  # 5 second = slow
    'slow_call_rate_threshold': 0.5, # 50% slow calls = problem

    # Fallback behavior
    'fallback_response': {
        'error': 'service_degraded',
        'message': 'Service is experiencing issues. Using fallback mode.',
        'retry_after': 30
    }
}

# ============================================
# EXCEPTIONS
# ============================================

class CircuitOpenError(Exception):
    """Raised when circuit is open and request is blocked"""
    def __init__(self, breaker_name, message=None, retry_after=None):
        self.breaker_name = breaker_name
        self.message = message or f'Circuit {breaker_name} is open'
        self.retry_after = retry_after or 30
        super().__init__(self.message)

# ============================================
# CIRCUIT BREAKER CLASS
# ============================================

class CircuitBreaker:
    """
    Circuit breaker with sliding window failure detection.
    """

    def __init__(self, name, config=None):
        self.name = name
        self.config = {**CIRCUIT_CONFIG, **(config or {})}

        self.state = CircuitState.CLOSED
        self.failures = deque()  # (timestamp, error_type)
        self.successes = deque()
        self.slow_calls = deque()

        self.opened_at = None
        self.half_open_requests = 0
        self.half_open_successes = 0

        self.stats = {
            'total_requests': 0,
            'total_failures': 0,
            'total_successes': 0,
            'circuit_opens': 0,
            'last_failure': None,
            'last_success': None
        }

        self.lock = threading.Lock()
        self.listeners = []

    def _cleanup_old_entries(self):
        """Remove entries outside the failure window"""
        cutoff = datetime.now() - timedelta(
            seconds=self.config['failure_window_seconds']
        )
        while self.failures and self.failures[0][0] < cutoff:
            self.failures.popleft()
        while self.slow_calls and self.slow_calls[0] < cutoff:
            self.slow_calls.popleft()

    def _should_open(self):
        """Check if circuit should open based on failures"""
        self._cleanup_old_entries()
        return len(self.failures) >= self.config['failure_threshold']

    def _can_attempt(self):
        """Check if request can proceed"""
        with self.lock:
            if self.state == CircuitState.CLOSED:
                return True

            if self.state == CircuitState.OPEN:
                # Check if recovery timeout has passed
                if self.opened_at:
                    elapsed = (datetime.now() - self.opened_at).total_seconds()
                    if elapsed >= self.config['recovery_timeout']:
                        self._transition_to_half_open()
                        return True
                return False

            if self.state == CircuitState.HALF_OPEN:
                if self.half_open_requests < self.config['half_open_max_requests']:
                    self.half_open_requests += 1
                    return True
                return False

        return False

    def _transition_to_open(self, reason=None):
        """Open the circuit"""
        self.state = CircuitState.OPEN
        self.opened_at = datetime.now()
        self.stats['circuit_opens'] += 1

        self._notify_listeners('OPEN', reason)
        print(f"[CircuitBreaker] {self.name} OPENED: {reason}")

    def _transition_to_half_open(self):
        """Transition to half-open for testing"""
        self.state = CircuitState.HALF_OPEN
        self.half_open_requests = 0
        self.half_open_successes = 0

        self._notify_listeners('HALF_OPEN')
        print(f"[CircuitBreaker] {self.name} HALF-OPEN: Testing recovery")

    def _transition_to_closed(self):
        """Close the circuit - system recovered"""
        self.state = CircuitState.CLOSED
        self.opened_at = None
        self.failures.clear()
        self.half_open_requests = 0
        self.half_open_successes = 0

        self._notify_listeners('CLOSED')
        print(f"[CircuitBreaker] {self.name} CLOSED: System recovered")

    def record_success(self, response_time_ms=None):
        """Record a successful request"""
        with self.lock:
            now = datetime.now()
            self.stats['total_requests'] += 1
            self.stats['total_successes'] += 1
            self.stats['last_success'] = now.isoformat()

            # Check for slow call
            if response_time_ms and response_time_ms > self.config['slow_call_threshold_ms']:
                self.slow_calls.append(now)

            if self.state == CircuitState.HALF_OPEN:
                self.half_open_successes += 1
                if self.half_open_successes >= self.config['success_threshold']:
                    self._transition_to_closed()

    def record_failure(self, error_type='unknown'):
        """Record a failed request"""
        with self.lock:
            now = datetime.now()
            self.failures.append((now, error_type))
            self.stats['total_requests'] += 1
            self.stats['total_failures'] += 1
            self.stats['last_failure'] = now.isoformat()

            if self.state == CircuitState.CLOSED:
                if self._should_open():
                    self._transition_to_open(f'Failure threshold exceeded: {len(self.failures)} failures')

            elif self.state == CircuitState.HALF_OPEN:
                # Any failure in half-open returns to open
                self._transition_to_open('Failure during recovery test')

    def execute(self, func, *args, fallback=None, **kwargs):
        """
        Execute a function with circuit breaker protection.

        Args:
            func: Function to execute
            fallback: Fallback function if circuit is open
            *args, **kwargs: Arguments for func
        """
        if not self._can_attempt():
            if fallback:
                return fallback(*args, **kwargs)
            raise CircuitOpenError(
                self.name,
                retry_after=self.config['recovery_timeout']
            )

        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            response_time = (time.time() - start_time) * 1000
            self.record_success(response_time)
            return result
        except Exception as e:
            self.record_failure(type(e).__name__)
            raise

    def force_open(self, reason='Manual intervention'):
        """Manually open the circuit"""
        with self.lock:
            self._transition_to_open(reason)

    def force_close(self):
        """Manually close the circuit"""
        with self.lock:
            self._transition_to_closed()

    def add_listener(self, callback):
        """Add a state change listener"""
        self.listeners.append(callback)

    def _notify_listeners(self, new_state, reason=None):
        """Notify all listeners of state change"""
        for listener in self.listeners:
            try:
                listener(self.name, new_state, reason)
            except:
                pass

    def get_status(self):
        """Get current circuit status"""
        with self.lock:
            self._cleanup_old_entries()
            return {
                'name': self.name,
                'state': self.state.value,
                'failures_in_window': len(self.failures),
                'failure_threshold': self.config['failure_threshold'],
                'opened_at': self.opened_at.isoformat() if self.opened_at else None,
                'stats': self.stats.copy()
            }


# ============================================
# CIRCUIT BREAKER REGISTRY
# ============================================

_breakers = {}
_lock = threading.Lock()

def get_breaker(name, config=None):
    """Get or create a circuit breaker by name"""
    global _breakers
    with _lock:
        if name not in _breakers:
            _breakers[name] = CircuitBreaker(name, config)
        return _breakers[name]

def get_all_breakers():
    """Get status of all circuit breakers"""
    with _lock:
        return {name: b.get_status() for name, b in _breakers.items()}


# ============================================
# DECORATOR
# ============================================

def circuit_protect(breaker_name, fallback=None, config=None):
    """
    Decorator to protect a function with circuit breaker.

    Usage:
        @circuit_protect('api_calls')
        def call_api():
            ...

        @circuit_protect('ai_service', fallback=lambda: {'cached': True})
        def call_ai():
            ...
    """
    from functools import wraps

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            breaker = get_breaker(breaker_name, config)
            return breaker.execute(func, *args, fallback=fallback, **kwargs)
        return wrapper
    return decorator


# ============================================
# FLASK INTEGRATION
# ============================================

def circuit_breaker_response(breaker_name):
    """
    Create a Flask response for circuit breaker errors.
    """
    from flask import jsonify

    breaker = get_breaker(breaker_name)
    status = breaker.get_status()

    return jsonify({
        'error': 'circuit_open',
        'message': CIRCUIT_CONFIG['fallback_response']['message'],
        'circuit': status['state'],
        'retry_after': CIRCUIT_CONFIG['recovery_timeout']
    }), 503


# ============================================
# PRESET BREAKERS FOR CONSCIOUSNESS REVOLUTION
# ============================================

def setup_default_breakers():
    """Setup circuit breakers for standard services"""

    # ARAYA API
    get_breaker('araya_api', {
        'failure_threshold': 5,
        'recovery_timeout': 30,
        'slow_call_threshold_ms': 10000
    })

    # DeepSeek API
    get_breaker('deepseek', {
        'failure_threshold': 3,
        'recovery_timeout': 60,
        'slow_call_threshold_ms': 15000
    })

    # Ollama Local
    get_breaker('ollama', {
        'failure_threshold': 3,
        'recovery_timeout': 10,
        'slow_call_threshold_ms': 30000
    })

    # Brain/Cyclotron
    get_breaker('cyclotron', {
        'failure_threshold': 10,
        'recovery_timeout': 15,
        'slow_call_threshold_ms': 5000
    })

    # Supabase
    get_breaker('supabase', {
        'failure_threshold': 5,
        'recovery_timeout': 30,
        'slow_call_threshold_ms': 3000
    })

    # Discord
    get_breaker('discord', {
        'failure_threshold': 5,
        'recovery_timeout': 60,
        'slow_call_threshold_ms': 5000
    })


# Initialize default breakers
setup_default_breakers()


# ============================================
# TEST
# ============================================

if __name__ == '__main__':
    print("="*50)
    print("CIRCUIT BREAKER - Test Suite")
    print("="*50)

    # Test basic operation
    print("\n1. Testing normal operation:")
    breaker = get_breaker('test_breaker', {'failure_threshold': 3})

    for i in range(5):
        breaker.record_success()
        print(f"   Success {i+1}: State = {breaker.state.value}")

    # Test failure threshold
    print("\n2. Testing failure threshold (3 failures):")
    breaker = get_breaker('test_failures', {'failure_threshold': 3})

    for i in range(4):
        breaker.record_failure('TestError')
        print(f"   Failure {i+1}: State = {breaker.state.value}")

    # Test execute with fallback
    print("\n3. Testing execute with fallback:")

    def risky_function():
        raise Exception("API Error")

    def fallback_function():
        return {'fallback': True, 'cached': True}

    breaker = get_breaker('test_execute', {'failure_threshold': 2, 'recovery_timeout': 1})

    for i in range(5):
        try:
            result = breaker.execute(risky_function, fallback=fallback_function)
            print(f"   Request {i+1}: {result}")
        except CircuitOpenError as e:
            print(f"   Request {i+1}: Circuit open - {e.message}")
        except Exception as e:
            print(f"   Request {i+1}: Error - {e}")

    # Wait for recovery and test again
    print("\n4. Testing recovery (waiting 1.5 seconds):")
    time.sleep(1.5)

    # This should trigger half-open
    try:
        result = breaker.execute(lambda: {'success': True}, fallback=fallback_function)
        print(f"   After recovery: {result}")
    except Exception as e:
        print(f"   After recovery: {e}")

    # Print status
    print("\n5. All breaker status:")
    all_status = get_all_breakers()
    for name, status in all_status.items():
        print(f"   {name}: {status['state']} (failures: {status['failures_in_window']})")

    print("\n" + "="*50)
    print("Circuit Breaker ready for deployment!")
    print("="*50)
