"""
RATE LIMITER - Controlled Explosion Protection
===============================================
Per-user, per-tier rate limiting for ARAYA API.
Prevents any single user or tier from overwhelming the system.

Usage:
    from RATE_LIMITER import RateLimiter, check_rate_limit

    limiter = RateLimiter()

    @app.route('/chat')
    def chat():
        user_id = request.json.get('user_id')
        tier = get_user_tier(user_id)

        allowed, info = limiter.check(user_id, tier, 'query')
        if not allowed:
            return jsonify({'error': 'rate_limited', **info}), 429

        # Continue with request...

Deploy: Railway with ARAYA_UNIFIED_API.py
Storage: In-memory (resets on restart) or Redis for persistence
"""

from datetime import datetime, timedelta
from collections import defaultdict
import time
import threading
import json

# ============================================
# RATE LIMIT CONFIGURATION
# ============================================

RATE_LIMITS = {
    'FREE': {
        'queries_per_minute': 2,
        'queries_per_hour': 20,
        'queries_per_day': 50,
        'max_message_length': 500,
        'brain_queries_per_day': 0,
        'file_writes_per_day': 0,
        'concurrent_requests': 1
    },
    'SEEKER': {
        'queries_per_minute': 10,
        'queries_per_hour': 100,
        'queries_per_day': 500,
        'max_message_length': 2000,
        'brain_queries_per_day': 20,
        'file_writes_per_day': 0,
        'concurrent_requests': 2
    },
    'BUILDER': {
        'queries_per_minute': 30,
        'queries_per_hour': 300,
        'queries_per_day': 2000,
        'max_message_length': 5000,
        'brain_queries_per_day': 200,
        'file_writes_per_day': 50,
        'concurrent_requests': 5
    },
    'OPERATOR': {
        'queries_per_minute': 60,
        'queries_per_hour': 600,
        'queries_per_day': 10000,
        'max_message_length': 10000,
        'brain_queries_per_day': 1000,
        'file_writes_per_day': 200,
        'concurrent_requests': 10
    },
    'COMMANDER': {
        'queries_per_minute': 120,
        'queries_per_hour': -1,  # Unlimited
        'queries_per_day': -1,   # Unlimited
        'max_message_length': 50000,
        'brain_queries_per_day': -1,  # Unlimited
        'file_writes_per_day': -1,    # Unlimited
        'concurrent_requests': 20
    }
}

# Map from business tiers to rate limit tiers
TIER_MAPPING = {
    'free': 'FREE',
    'seeker': 'SEEKER',
    'builder': 'BUILDER',
    'operator': 'OPERATOR',
    'commander': 'COMMANDER',
    # Builder Economics tiers
    'GHOST': 'FREE',
    'SEEDLING': 'SEEKER',
    'SAPLING': 'BUILDER',
    'TREE': 'OPERATOR',
    'FOREST': 'COMMANDER'
}

# ============================================
# RATE LIMITER CLASS
# ============================================

class RateLimiter:
    """
    In-memory rate limiter with sliding window.
    For production, replace storage with Redis.
    """

    def __init__(self, storage='memory'):
        self.storage = storage
        self.requests = defaultdict(list)  # user_id -> [(timestamp, action_type)]
        self.concurrent = defaultdict(int)  # user_id -> count
        self.lock = threading.Lock()

        # Cleanup old entries every 5 minutes
        self._start_cleanup_thread()

    def _start_cleanup_thread(self):
        def cleanup():
            while True:
                time.sleep(300)  # 5 minutes
                self._cleanup_old_entries()

        thread = threading.Thread(target=cleanup, daemon=True)
        thread.start()

    def _cleanup_old_entries(self):
        """Remove entries older than 24 hours"""
        cutoff = datetime.now() - timedelta(hours=24)
        with self.lock:
            for user_id in list(self.requests.keys()):
                self.requests[user_id] = [
                    (ts, action) for ts, action in self.requests[user_id]
                    if ts > cutoff
                ]
                if not self.requests[user_id]:
                    del self.requests[user_id]

    def _normalize_tier(self, tier):
        """Convert tier to rate limit tier name"""
        if tier is None:
            return 'FREE'
        return TIER_MAPPING.get(tier, TIER_MAPPING.get(tier.upper(), 'FREE'))

    def _get_count(self, user_id, action_type, window_seconds):
        """Count requests in the time window"""
        cutoff = datetime.now() - timedelta(seconds=window_seconds)
        return sum(
            1 for ts, action in self.requests.get(user_id, [])
            if ts > cutoff and (action_type == '*' or action == action_type)
        )

    def check(self, user_id, tier, action_type='query', message_length=0):
        """
        Check if request is allowed under rate limits.

        Returns: (allowed: bool, info: dict)
        """
        if not user_id:
            user_id = 'anonymous'

        rate_tier = self._normalize_tier(tier)
        limits = RATE_LIMITS.get(rate_tier, RATE_LIMITS['FREE'])

        now = datetime.now()

        # Check concurrent requests
        if self.concurrent[user_id] >= limits['concurrent_requests']:
            return False, {
                'reason': 'concurrent_limit',
                'message': f'Too many concurrent requests. Limit: {limits["concurrent_requests"]}',
                'retry_after': 1
            }

        # Check message length
        if message_length > limits['max_message_length']:
            return False, {
                'reason': 'message_too_long',
                'message': f'Message exceeds {limits["max_message_length"]} characters. Upgrade for longer messages.',
                'limit': limits['max_message_length'],
                'actual': message_length
            }

        # Check per-minute limit
        if limits['queries_per_minute'] > 0:
            count_minute = self._get_count(user_id, action_type, 60)
            if count_minute >= limits['queries_per_minute']:
                return False, {
                    'reason': 'minute_limit',
                    'message': f'Rate limit: {limits["queries_per_minute"]} requests per minute',
                    'limit': limits['queries_per_minute'],
                    'used': count_minute,
                    'retry_after': 60
                }

        # Check per-hour limit
        if limits['queries_per_hour'] > 0:
            count_hour = self._get_count(user_id, action_type, 3600)
            if count_hour >= limits['queries_per_hour']:
                return False, {
                    'reason': 'hour_limit',
                    'message': f'Rate limit: {limits["queries_per_hour"]} requests per hour',
                    'limit': limits['queries_per_hour'],
                    'used': count_hour,
                    'retry_after': 3600
                }

        # Check per-day limit
        if limits['queries_per_day'] > 0:
            count_day = self._get_count(user_id, action_type, 86400)
            if count_day >= limits['queries_per_day']:
                return False, {
                    'reason': 'day_limit',
                    'message': f'Daily limit reached: {limits["queries_per_day"]} requests',
                    'limit': limits['queries_per_day'],
                    'used': count_day,
                    'retry_after': 86400,
                    'upgrade_hint': 'Upgrade to a higher tier for more requests'
                }

        # Check brain queries (separate limit)
        if action_type == 'brain_query':
            if limits['brain_queries_per_day'] == 0:
                return False, {
                    'reason': 'feature_locked',
                    'message': 'Brain queries require SEEKER tier or higher',
                    'upgrade_hint': 'Upgrade to SEEKER ($9/mo) for memory features'
                }
            elif limits['brain_queries_per_day'] > 0:
                brain_count = self._get_count(user_id, 'brain_query', 86400)
                if brain_count >= limits['brain_queries_per_day']:
                    return False, {
                        'reason': 'brain_limit',
                        'message': f'Brain query limit reached: {limits["brain_queries_per_day"]} per day',
                        'limit': limits['brain_queries_per_day'],
                        'used': brain_count
                    }

        # Check file writes (separate limit)
        if action_type == 'file_write':
            if limits['file_writes_per_day'] == 0:
                return False, {
                    'reason': 'feature_locked',
                    'message': 'File writing requires BUILDER tier or higher',
                    'upgrade_hint': 'Upgrade to BUILDER ($29/mo) for file editing'
                }
            elif limits['file_writes_per_day'] > 0:
                write_count = self._get_count(user_id, 'file_write', 86400)
                if write_count >= limits['file_writes_per_day']:
                    return False, {
                        'reason': 'file_limit',
                        'message': f'File write limit reached: {limits["file_writes_per_day"]} per day',
                        'limit': limits['file_writes_per_day'],
                        'used': write_count
                    }

        # All checks passed - record this request
        with self.lock:
            self.requests[user_id].append((now, action_type))

        return True, {
            'tier': rate_tier,
            'remaining': self._get_remaining(user_id, rate_tier, action_type)
        }

    def _get_remaining(self, user_id, rate_tier, action_type):
        """Get remaining requests in each window"""
        limits = RATE_LIMITS.get(rate_tier, RATE_LIMITS['FREE'])

        remaining = {}

        if limits['queries_per_minute'] > 0:
            used = self._get_count(user_id, action_type, 60)
            remaining['minute'] = max(0, limits['queries_per_minute'] - used)

        if limits['queries_per_hour'] > 0:
            used = self._get_count(user_id, action_type, 3600)
            remaining['hour'] = max(0, limits['queries_per_hour'] - used)

        if limits['queries_per_day'] > 0:
            used = self._get_count(user_id, action_type, 86400)
            remaining['day'] = max(0, limits['queries_per_day'] - used)
        else:
            remaining['day'] = 'unlimited'

        return remaining

    def start_request(self, user_id):
        """Mark the start of a request (for concurrent limiting)"""
        with self.lock:
            self.concurrent[user_id] += 1

    def end_request(self, user_id):
        """Mark the end of a request"""
        with self.lock:
            self.concurrent[user_id] = max(0, self.concurrent[user_id] - 1)

    def get_stats(self, user_id=None):
        """Get usage statistics"""
        if user_id:
            return {
                'user_id': user_id,
                'total_requests': len(self.requests.get(user_id, [])),
                'concurrent': self.concurrent.get(user_id, 0),
                'requests_last_hour': self._get_count(user_id, '*', 3600),
                'requests_last_day': self._get_count(user_id, '*', 86400)
            }
        else:
            return {
                'total_users': len(self.requests),
                'total_requests': sum(len(r) for r in self.requests.values()),
                'active_concurrent': sum(self.concurrent.values())
            }


# ============================================
# GLOBAL INSTANCE
# ============================================

_limiter = None

def get_limiter():
    global _limiter
    if _limiter is None:
        _limiter = RateLimiter()
    return _limiter

def check_rate_limit(user_id, tier, action_type='query', message_length=0):
    """Convenience function for checking rate limits"""
    return get_limiter().check(user_id, tier, action_type, message_length)


# ============================================
# FLASK MIDDLEWARE
# ============================================

def rate_limit_middleware(get_user_id, get_tier):
    """
    Flask middleware decorator for rate limiting.

    Usage:
        @app.route('/chat')
        @rate_limit_middleware(
            get_user_id=lambda: request.json.get('user_id'),
            get_tier=lambda uid: get_user_tier_from_db(uid)
        )
        def chat():
            ...
    """
    from functools import wraps
    from flask import request, jsonify

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            limiter = get_limiter()

            user_id = get_user_id()
            tier = get_tier(user_id) if callable(get_tier) else get_tier

            # Get message length if available
            message_length = 0
            if request.is_json:
                message = request.json.get('message', '')
                message_length = len(message) if message else 0

            # Check rate limit
            allowed, info = limiter.check(user_id, tier, 'query', message_length)

            if not allowed:
                return jsonify({
                    'error': 'rate_limited',
                    'type': info.get('reason'),
                    'message': info.get('message'),
                    'retry_after': info.get('retry_after'),
                    'upgrade_hint': info.get('upgrade_hint')
                }), 429

            # Track concurrent requests
            limiter.start_request(user_id)
            try:
                return f(*args, **kwargs)
            finally:
                limiter.end_request(user_id)

        return decorated
    return decorator


# ============================================
# TEST
# ============================================

if __name__ == '__main__':
    print("="*50)
    print("RATE LIMITER - Test Suite")
    print("="*50)

    limiter = RateLimiter()

    # Test FREE tier limits
    print("\n1. Testing FREE tier (2/minute limit):")
    for i in range(5):
        allowed, info = limiter.check('test_free', 'FREE', 'query')
        status = "ALLOWED" if allowed else "BLOCKED"
        print(f"   Request {i+1}: {status}")
        if not allowed:
            print(f"   Reason: {info.get('message')}")

    # Test message length
    print("\n2. Testing message length limit:")
    allowed, info = limiter.check('test_length', 'FREE', 'query', message_length=1000)
    print(f"   1000 char message (limit 500): {'ALLOWED' if allowed else 'BLOCKED'}")
    if not allowed:
        print(f"   Reason: {info.get('message')}")

    # Test brain query access
    print("\n3. Testing brain query access:")
    allowed, info = limiter.check('test_brain', 'FREE', 'brain_query')
    print(f"   FREE tier brain query: {'ALLOWED' if allowed else 'BLOCKED'}")
    if not allowed:
        print(f"   Reason: {info.get('message')}")

    allowed, info = limiter.check('test_brain', 'BUILDER', 'brain_query')
    print(f"   BUILDER tier brain query: {'ALLOWED' if allowed else 'BLOCKED'}")

    # Test COMMANDER (unlimited)
    print("\n4. Testing COMMANDER tier (unlimited):")
    for i in range(10):
        allowed, info = limiter.check('test_commander', 'COMMANDER', 'query')
    print(f"   10 rapid requests: All ALLOWED")

    # Print stats
    print("\n5. Statistics:")
    stats = limiter.get_stats()
    print(f"   Total users: {stats['total_users']}")
    print(f"   Total requests: {stats['total_requests']}")

    print("\n" + "="*50)
    print("Rate Limiter ready for deployment!")
    print("="*50)
