"""
ADMIN CONTROL PANEL - Unified System Controls
==============================================
Integrates all growth control mechanisms:
- Rate Limiter
- Feature Flags
- Kill Switches
- Circuit Breakers

Provides Flask blueprint for admin endpoints.

Usage:
    from ADMIN_CONTROL_PANEL import admin_bp, check_request_allowed
    app.register_blueprint(admin_bp, url_prefix='/admin')

Deploy: Railway with ARAYA_UNIFIED_API.py
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime
import os
import json

# Import control systems
try:
    from RATE_LIMITER import (
        RateLimiter, get_limiter, check_rate_limit,
        RATE_LIMITS
    )
    RATE_LIMITER_AVAILABLE = True
except ImportError:
    RATE_LIMITER_AVAILABLE = False
    print("[AdminPanel] Rate limiter not available")

try:
    from FEATURE_FLAGS import (
        FeatureFlags, get_flags, is_enabled as flag_enabled,
        DEFAULT_FLAGS
    )
    FEATURE_FLAGS_AVAILABLE = True
except ImportError:
    FEATURE_FLAGS_AVAILABLE = False
    print("[AdminPanel] Feature flags not available")

try:
    from KILL_SWITCH import (
        KillSwitch, get_kill_switch, is_killed,
        KILL_SWITCHES
    )
    KILL_SWITCH_AVAILABLE = True
except ImportError:
    KILL_SWITCH_AVAILABLE = False
    print("[AdminPanel] Kill switch not available")

try:
    from CIRCUIT_BREAKER import (
        CircuitBreaker, get_breaker, get_all_breakers,
        CircuitOpenError, circuit_protect
    )
    CIRCUIT_BREAKER_AVAILABLE = True
except ImportError:
    CIRCUIT_BREAKER_AVAILABLE = False
    print("[AdminPanel] Circuit breaker not available")


# ============================================
# ADMIN AUTHENTICATION
# ============================================

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'consciousness_admin_2026')

def require_admin(f):
    """Decorator to require admin authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        token = request.args.get('token', '')

        if auth.startswith('Bearer '):
            token = auth[7:]

        if token != ADMIN_TOKEN:
            return jsonify({
                'error': 'unauthorized',
                'message': 'Admin token required'
            }), 401

        return f(*args, **kwargs)
    return decorated


# ============================================
# UNIFIED REQUEST CHECKER
# ============================================

def check_request_allowed(user_id, tier, feature, action_type='query', message_length=0):
    """
    Unified check across all control systems.
    Returns: (allowed: bool, info: dict)
    """
    # 1. Check kill switch first (highest priority)
    if KILL_SWITCH_AVAILABLE:
        ks = get_kill_switch()

        # Map feature to kill switch
        switch_map = {
            'araya_chat': 'ALL_AI_QUERIES',
            'brain_query': 'BRAIN_QUERIES',
            'brain_write': 'BRAIN_WRITES',
            'file_read': 'FILE_READS',
            'file_write': 'FILE_WRITES',
            'discord': 'DISCORD_BOT',
            'email': 'EMAIL_GATEWAY'
        }

        switch_name = switch_map.get(feature, 'ALL_AI_QUERIES')
        if ks.is_killed(switch_name):
            return False, {
                'blocked_by': 'kill_switch',
                'switch': switch_name,
                'message': ks.get_message(switch_name),
                'retry_after': 300
            }

    # 2. Check circuit breaker
    if CIRCUIT_BREAKER_AVAILABLE:
        breaker_map = {
            'araya_chat': 'araya_api',
            'brain_query': 'cyclotron',
            'brain_write': 'cyclotron',
            'discord': 'discord',
            'deepseek': 'deepseek'
        }

        breaker_name = breaker_map.get(feature, 'araya_api')
        breaker = get_breaker(breaker_name)
        status = breaker.get_status()

        if status['state'] == 'open':
            return False, {
                'blocked_by': 'circuit_breaker',
                'circuit': breaker_name,
                'state': 'open',
                'message': 'System is recovering from overload',
                'retry_after': 30
            }

    # 3. Check feature flag
    if FEATURE_FLAGS_AVAILABLE:
        flags = get_flags()
        if not flags.is_enabled(feature, user_id, tier):
            flag_config = flags.get_flag(feature)
            return False, {
                'blocked_by': 'feature_flag',
                'feature': feature,
                'message': f'Feature "{feature}" not available for tier {tier}',
                'tier_required': flag_config.get('tiers', ['COMMANDER'])[0] if flag_config.get('tiers') else 'COMMANDER',
                'upgrade_hint': 'Upgrade your plan to access this feature'
            }

    # 4. Check rate limit
    if RATE_LIMITER_AVAILABLE:
        limiter = get_limiter()
        allowed, info = limiter.check(user_id, tier, action_type, message_length)
        if not allowed:
            info['blocked_by'] = 'rate_limit'
            return False, info

    # All checks passed
    return True, {
        'allowed': True,
        'tier': tier,
        'feature': feature
    }


def record_request_outcome(user_id, feature, success, response_time_ms=None, error_type=None):
    """Record the outcome of a request for circuit breaker tracking"""
    if CIRCUIT_BREAKER_AVAILABLE:
        breaker_map = {
            'araya_chat': 'araya_api',
            'brain_query': 'cyclotron',
            'deepseek': 'deepseek',
            'discord': 'discord'
        }

        breaker_name = breaker_map.get(feature, 'araya_api')
        breaker = get_breaker(breaker_name)

        if success:
            breaker.record_success(response_time_ms)
        else:
            breaker.record_failure(error_type or 'unknown')


# ============================================
# FLASK BLUEPRINT
# ============================================

admin_bp = Blueprint('admin', __name__)


# --- Status Endpoints ---

@admin_bp.route('/status', methods=['GET'])
@require_admin
def get_system_status():
    """Get complete system status"""
    status = {
        'timestamp': datetime.now().isoformat(),
        'controls': {}
    }

    if RATE_LIMITER_AVAILABLE:
        limiter = get_limiter()
        status['controls']['rate_limiter'] = {
            'available': True,
            'stats': limiter.get_stats()
        }
    else:
        status['controls']['rate_limiter'] = {'available': False}

    if FEATURE_FLAGS_AVAILABLE:
        flags = get_flags()
        status['controls']['feature_flags'] = {
            'available': True,
            'stats': flags.get_stats(),
            'flags': flags.get_all_flags()
        }
    else:
        status['controls']['feature_flags'] = {'available': False}

    if KILL_SWITCH_AVAILABLE:
        ks = get_kill_switch()
        status['controls']['kill_switches'] = {
            'available': True,
            'killed': ks.get_killed(),
            'status': ks.status()
        }
    else:
        status['controls']['kill_switches'] = {'available': False}

    if CIRCUIT_BREAKER_AVAILABLE:
        status['controls']['circuit_breakers'] = {
            'available': True,
            'breakers': get_all_breakers()
        }
    else:
        status['controls']['circuit_breakers'] = {'available': False}

    return jsonify(status)


# --- Rate Limiter Endpoints ---

@admin_bp.route('/rate-limits', methods=['GET'])
@require_admin
def get_rate_limits():
    """Get rate limit configuration"""
    if not RATE_LIMITER_AVAILABLE:
        return jsonify({'error': 'Rate limiter not available'}), 503

    return jsonify({
        'limits': RATE_LIMITS,
        'stats': get_limiter().get_stats()
    })


@admin_bp.route('/rate-limits/user/<user_id>', methods=['GET'])
@require_admin
def get_user_rate_status(user_id):
    """Get rate limit status for a specific user"""
    if not RATE_LIMITER_AVAILABLE:
        return jsonify({'error': 'Rate limiter not available'}), 503

    limiter = get_limiter()
    return jsonify(limiter.get_stats(user_id))


# --- Feature Flags Endpoints ---

@admin_bp.route('/feature-flags', methods=['GET'])
@require_admin
def get_feature_flags():
    """Get all feature flags"""
    if not FEATURE_FLAGS_AVAILABLE:
        return jsonify({'error': 'Feature flags not available'}), 503

    flags = get_flags()
    return jsonify({
        'flags': flags.get_all_flags(),
        'stats': flags.get_stats()
    })


@admin_bp.route('/feature-flags/<flag_name>', methods=['POST'])
@require_admin
def update_feature_flag(flag_name):
    """Update a feature flag"""
    if not FEATURE_FLAGS_AVAILABLE:
        return jsonify({'error': 'Feature flags not available'}), 503

    data = request.get_json() or {}
    flags = get_flags()

    flags.set_flag(
        flag_name,
        enabled=data.get('enabled'),
        percentage=data.get('percentage'),
        kill_switch=data.get('kill_switch')
    )

    return jsonify({
        'success': True,
        'flag': flags.get_flag(flag_name)
    })


@admin_bp.route('/feature-flags/<flag_name>/kill', methods=['POST'])
@require_admin
def kill_feature_flag(flag_name):
    """Activate kill switch for a feature flag"""
    if not FEATURE_FLAGS_AVAILABLE:
        return jsonify({'error': 'Feature flags not available'}), 503

    flags = get_flags()
    flags.kill_switch(flag_name, enable=True)

    return jsonify({
        'success': True,
        'message': f'Kill switch activated for {flag_name}',
        'flag': flags.get_flag(flag_name)
    })


@admin_bp.route('/feature-flags/<flag_name>/restore', methods=['POST'])
@require_admin
def restore_feature_flag(flag_name):
    """Deactivate kill switch for a feature flag"""
    if not FEATURE_FLAGS_AVAILABLE:
        return jsonify({'error': 'Feature flags not available'}), 503

    flags = get_flags()
    flags.kill_switch(flag_name, enable=False)

    return jsonify({
        'success': True,
        'message': f'Kill switch deactivated for {flag_name}',
        'flag': flags.get_flag(flag_name)
    })


# --- Kill Switch Endpoints ---

@admin_bp.route('/kill-switches', methods=['GET'])
@require_admin
def get_kill_switches():
    """Get all kill switches"""
    if not KILL_SWITCH_AVAILABLE:
        return jsonify({'error': 'Kill switch not available'}), 503

    ks = get_kill_switch()
    return jsonify({
        'switches': ks.status(),
        'killed': ks.get_killed(),
        'log': ks.get_log(20)
    })


@admin_bp.route('/kill-switches/<switch_name>/kill', methods=['POST'])
@require_admin
def kill_switch(switch_name):
    """Activate a kill switch"""
    if not KILL_SWITCH_AVAILABLE:
        return jsonify({'error': 'Kill switch not available'}), 503

    data = request.get_json() or {}
    ks = get_kill_switch()

    result = ks.kill(
        switch_name,
        reason=data.get('reason', 'Admin action'),
        killed_by=data.get('killed_by', 'ADMIN')
    )

    if result:
        return jsonify({
            'success': True,
            'message': f'{switch_name} KILLED',
            'status': ks.status(switch_name)
        })
    else:
        return jsonify({
            'success': False,
            'message': f'Unknown switch: {switch_name}'
        }), 400


@admin_bp.route('/kill-switches/<switch_name>/restore', methods=['POST'])
@require_admin
def restore_switch(switch_name):
    """Restore a kill switch"""
    if not KILL_SWITCH_AVAILABLE:
        return jsonify({'error': 'Kill switch not available'}), 503

    ks = get_kill_switch()
    result = ks.restore(switch_name, by='ADMIN')

    if result:
        return jsonify({
            'success': True,
            'message': f'{switch_name} RESTORED',
            'status': ks.status(switch_name)
        })
    else:
        return jsonify({
            'success': False,
            'message': f'Unknown switch: {switch_name}'
        }), 400


@admin_bp.route('/kill-switches/emergency', methods=['POST'])
@require_admin
def emergency_shutdown():
    """Emergency shutdown - kills ALL_SERVICES"""
    if not KILL_SWITCH_AVAILABLE:
        return jsonify({'error': 'Kill switch not available'}), 503

    data = request.get_json() or {}
    ks = get_kill_switch()
    ks.emergency_shutdown(
        reason=data.get('reason', 'Emergency shutdown'),
        by=data.get('by', 'ADMIN_EMERGENCY')
    )

    return jsonify({
        'success': True,
        'message': 'EMERGENCY SHUTDOWN ACTIVATED',
        'killed': ks.get_killed()
    })


# --- Circuit Breaker Endpoints ---

@admin_bp.route('/circuit-breakers', methods=['GET'])
@require_admin
def get_circuit_breakers():
    """Get all circuit breaker statuses"""
    if not CIRCUIT_BREAKER_AVAILABLE:
        return jsonify({'error': 'Circuit breaker not available'}), 503

    return jsonify({
        'breakers': get_all_breakers()
    })


@admin_bp.route('/circuit-breakers/<breaker_name>', methods=['GET'])
@require_admin
def get_circuit_breaker(breaker_name):
    """Get a specific circuit breaker status"""
    if not CIRCUIT_BREAKER_AVAILABLE:
        return jsonify({'error': 'Circuit breaker not available'}), 503

    breaker = get_breaker(breaker_name)
    return jsonify(breaker.get_status())


@admin_bp.route('/circuit-breakers/<breaker_name>/open', methods=['POST'])
@require_admin
def force_open_breaker(breaker_name):
    """Force open a circuit breaker"""
    if not CIRCUIT_BREAKER_AVAILABLE:
        return jsonify({'error': 'Circuit breaker not available'}), 503

    data = request.get_json() or {}
    breaker = get_breaker(breaker_name)
    breaker.force_open(reason=data.get('reason', 'Admin action'))

    return jsonify({
        'success': True,
        'message': f'{breaker_name} circuit OPENED',
        'status': breaker.get_status()
    })


@admin_bp.route('/circuit-breakers/<breaker_name>/close', methods=['POST'])
@require_admin
def force_close_breaker(breaker_name):
    """Force close a circuit breaker"""
    if not CIRCUIT_BREAKER_AVAILABLE:
        return jsonify({'error': 'Circuit breaker not available'}), 503

    breaker = get_breaker(breaker_name)
    breaker.force_close()

    return jsonify({
        'success': True,
        'message': f'{breaker_name} circuit CLOSED',
        'status': breaker.get_status()
    })


# --- User Feature Access ---

@admin_bp.route('/user/<user_id>/features', methods=['GET'])
@require_admin
def get_user_features(user_id):
    """Get all features available to a user"""
    tier = request.args.get('tier', 'FREE')

    if not FEATURE_FLAGS_AVAILABLE:
        return jsonify({'error': 'Feature flags not available'}), 503

    flags = get_flags()
    return jsonify({
        'user_id': user_id,
        'tier': tier,
        'features': flags.get_user_features(user_id, tier)
    })


@admin_bp.route('/user/<user_id>/override', methods=['POST'])
@require_admin
def set_user_override(user_id):
    """Set a user-specific feature override"""
    if not FEATURE_FLAGS_AVAILABLE:
        return jsonify({'error': 'Feature flags not available'}), 503

    data = request.get_json() or {}
    flags = get_flags()

    flag_name = data.get('flag_name')
    enabled = data.get('enabled', True)

    if not flag_name:
        return jsonify({'error': 'flag_name required'}), 400

    flags.set_user_override(user_id, flag_name, enabled)

    return jsonify({
        'success': True,
        'user_id': user_id,
        'flag': flag_name,
        'enabled': enabled
    })


# ============================================
# MIDDLEWARE DECORATOR FOR ARAYA API
# ============================================

def controlled_endpoint(feature, action_type='query'):
    """
    Decorator to add all growth controls to an endpoint.

    Usage:
        @app.route('/chat')
        @controlled_endpoint('araya_chat', 'query')
        def chat():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # Get user info from request
            data = request.get_json() or {}
            user_id = data.get('user_id') or data.get('foundation_id') or 'anonymous'
            tier = data.get('tier', 'FREE')
            message = data.get('message', '')

            # Check if request is allowed
            allowed, info = check_request_allowed(
                user_id=user_id,
                tier=tier,
                feature=feature,
                action_type=action_type,
                message_length=len(message)
            )

            if not allowed:
                status_code = 429 if info.get('blocked_by') == 'rate_limit' else 503
                return jsonify({
                    'error': info.get('blocked_by', 'blocked'),
                    'message': info.get('message', 'Request blocked'),
                    'retry_after': info.get('retry_after'),
                    'upgrade_hint': info.get('upgrade_hint')
                }), status_code

            # Execute the endpoint
            import time
            start_time = time.time()

            try:
                result = f(*args, **kwargs)
                response_time = (time.time() - start_time) * 1000
                record_request_outcome(user_id, feature, True, response_time)
                return result
            except Exception as e:
                record_request_outcome(user_id, feature, False, error_type=type(e).__name__)
                raise

        return decorated
    return decorator


# ============================================
# TEST
# ============================================

if __name__ == '__main__':
    print("="*50)
    print("ADMIN CONTROL PANEL - Test Suite")
    print("="*50)

    print(f"\nControl Systems Available:")
    print(f"  Rate Limiter:    {'YES' if RATE_LIMITER_AVAILABLE else 'NO'}")
    print(f"  Feature Flags:   {'YES' if FEATURE_FLAGS_AVAILABLE else 'NO'}")
    print(f"  Kill Switches:   {'YES' if KILL_SWITCH_AVAILABLE else 'NO'}")
    print(f"  Circuit Breaker: {'YES' if CIRCUIT_BREAKER_AVAILABLE else 'NO'}")

    # Test unified check
    print("\n1. Testing unified request check:")
    allowed, info = check_request_allowed('test_user', 'FREE', 'araya_chat')
    print(f"   FREE user araya_chat: {'ALLOWED' if allowed else 'BLOCKED'}")

    allowed, info = check_request_allowed('test_user', 'FREE', 'brain_query')
    print(f"   FREE user brain_query: {'ALLOWED' if allowed else 'BLOCKED'}")
    if not allowed:
        print(f"   Blocked by: {info.get('blocked_by')}")

    allowed, info = check_request_allowed('test_user', 'COMMANDER', 'brain_query')
    print(f"   COMMANDER brain_query: {'ALLOWED' if allowed else 'BLOCKED'}")

    # Test kill switch integration
    if KILL_SWITCH_AVAILABLE:
        print("\n2. Testing kill switch integration:")
        ks = get_kill_switch()
        ks.kill('ALL_AI_QUERIES', reason='Test', killed_by='TEST')
        allowed, info = check_request_allowed('test_user', 'COMMANDER', 'araya_chat')
        print(f"   COMMANDER with AI killed: {'ALLOWED' if allowed else 'BLOCKED'}")
        ks.restore('ALL_AI_QUERIES')

    print("\n" + "="*50)
    print("Admin Control Panel ready!")
    print("="*50)
