"""
PHASED ROLLOUT CONTROL - Staged Launch System
===============================================
Control exactly how and when features roll out.
Prevent "Jack and the Beanstalk" uncontrolled growth.

Phases:
    ALPHA   - Internal team only (10 users)
    BETA    - Beta testers (100 users)
    EARLY   - Early adopters (1,000 users)
    GROWTH  - Controlled growth (10,000 users)
    SCALE   - Full scale (unlimited)

Usage:
    from PHASED_ROLLOUT import PhaseController, get_phase_controller

    controller = get_phase_controller()

    # Check if user can access current phase
    if controller.can_access('araya_chat', user_id, user_created_at):
        # Allow access

    # Advance to next phase when ready
    controller.advance_phase('araya_chat', approved_by='COMMANDER')

Deploy: Railway with ARAYA_UNIFIED_API.py
"""

import os
import json
from datetime import datetime, timedelta
from enum import Enum
import hashlib
import threading

# ============================================
# PHASE DEFINITIONS
# ============================================

class Phase(Enum):
    ALPHA = 'alpha'       # Internal team only
    BETA = 'beta'         # Beta testers
    EARLY = 'early'       # Early adopters
    GROWTH = 'growth'     # Controlled growth
    SCALE = 'scale'       # Full scale


PHASE_CONFIGS = {
    Phase.ALPHA: {
        'name': 'Alpha',
        'max_users': 10,
        'description': 'Internal team testing',
        'allowed_tiers': ['COMMANDER', 'OPERATOR'],
        'requires_invite': True,
        'rate_multiplier': 0.5,  # 50% of normal rate limits (stricter)
        'features_enabled': ['basic_chat', 'brain_query'],
        'monitoring': 'intensive'
    },
    Phase.BETA: {
        'name': 'Beta',
        'max_users': 100,
        'description': 'Beta tester cohort',
        'allowed_tiers': ['COMMANDER', 'OPERATOR', 'BUILDER'],
        'requires_invite': True,
        'rate_multiplier': 0.75,
        'features_enabled': ['basic_chat', 'brain_query', 'file_read'],
        'monitoring': 'high'
    },
    Phase.EARLY: {
        'name': 'Early Access',
        'max_users': 1000,
        'description': 'Early adopter program',
        'allowed_tiers': ['COMMANDER', 'OPERATOR', 'BUILDER', 'SEEKER'],
        'requires_invite': False,
        'rate_multiplier': 1.0,
        'features_enabled': ['basic_chat', 'brain_query', 'file_read', 'file_write'],
        'monitoring': 'normal'
    },
    Phase.GROWTH: {
        'name': 'Growth',
        'max_users': 10000,
        'description': 'Controlled growth phase',
        'allowed_tiers': ['COMMANDER', 'OPERATOR', 'BUILDER', 'SEEKER', 'FREE'],
        'requires_invite': False,
        'rate_multiplier': 1.0,
        'features_enabled': ['basic_chat', 'brain_query', 'file_read', 'file_write', 'advanced_features'],
        'monitoring': 'normal'
    },
    Phase.SCALE: {
        'name': 'Scale',
        'max_users': -1,  # Unlimited
        'description': 'Full public scale',
        'allowed_tiers': ['COMMANDER', 'OPERATOR', 'BUILDER', 'SEEKER', 'FREE', 'GHOST'],
        'requires_invite': False,
        'rate_multiplier': 1.0,
        'features_enabled': ['all'],
        'monitoring': 'standard'
    }
}


# ============================================
# PHASE TRANSITION CHECKLIST
# ============================================

TRANSITION_REQUIREMENTS = {
    (Phase.ALPHA, Phase.BETA): {
        'min_days_in_phase': 3,
        'min_users_tested': 5,
        'max_error_rate': 0.05,  # 5%
        'required_features_stable': ['basic_chat'],
        'commander_approval': True
    },
    (Phase.BETA, Phase.EARLY): {
        'min_days_in_phase': 7,
        'min_users_tested': 50,
        'max_error_rate': 0.03,  # 3%
        'required_features_stable': ['basic_chat', 'brain_query'],
        'commander_approval': True
    },
    (Phase.EARLY, Phase.GROWTH): {
        'min_days_in_phase': 14,
        'min_users_tested': 500,
        'max_error_rate': 0.02,  # 2%
        'required_features_stable': ['basic_chat', 'brain_query', 'file_read'],
        'commander_approval': True
    },
    (Phase.GROWTH, Phase.SCALE): {
        'min_days_in_phase': 30,
        'min_users_tested': 5000,
        'max_error_rate': 0.01,  # 1%
        'required_features_stable': ['all'],
        'commander_approval': True
    }
}


# ============================================
# PHASE CONTROLLER
# ============================================

class PhaseController:
    """
    Controls phased rollout of features.
    """

    def __init__(self, storage='memory'):
        self.storage = storage
        self.lock = threading.Lock()

        # Current phase for each feature
        self.feature_phases = {}

        # Phase history
        self.phase_history = []

        # Invite list (for alpha/beta)
        self.invited_users = set()

        # User counts per feature/phase
        self.user_counts = {}

        # Metrics per feature
        self.metrics = {}

        # Initialize default phases
        self._init_defaults()
        self._load_state()

    def _init_defaults(self):
        """Initialize default feature phases"""
        default_features = {
            'araya_chat': Phase.BETA,      # Chat is in beta
            'brain_query': Phase.BETA,     # Brain query in beta
            'brain_write': Phase.ALPHA,    # Brain write still alpha
            'file_read': Phase.EARLY,      # File read in early access
            'file_write': Phase.ALPHA,     # File write still alpha
            'discord_bot': Phase.ALPHA,    # Discord integration alpha
            'email_gateway': Phase.ALPHA,  # Email gateway alpha
            'advanced_ai': Phase.BETA      # Advanced AI features beta
        }

        for feature, phase in default_features.items():
            self.feature_phases[feature] = {
                'phase': phase,
                'entered_at': datetime.now().isoformat(),
                'users': set(),
                'error_count': 0,
                'success_count': 0
            }

    def _load_state(self):
        """Load saved state"""
        if self.storage == 'file':
            try:
                state_file = os.path.join(
                    os.path.dirname(__file__),
                    '.phase_rollout_state.json'
                )
                if os.path.exists(state_file):
                    with open(state_file, 'r') as f:
                        saved = json.load(f)
                        # Restore phase data
                        for feature, data in saved.get('features', {}).items():
                            if feature in self.feature_phases:
                                self.feature_phases[feature]['phase'] = Phase(data['phase'])
                                self.feature_phases[feature]['entered_at'] = data.get('entered_at')
                        self.invited_users = set(saved.get('invited_users', []))
            except Exception as e:
                print(f"[PhaseController] State load failed: {e}")

    def _save_state(self):
        """Save current state"""
        if self.storage == 'file':
            try:
                state_file = os.path.join(
                    os.path.dirname(__file__),
                    '.phase_rollout_state.json'
                )
                save_data = {
                    'features': {
                        f: {
                            'phase': data['phase'].value,
                            'entered_at': data.get('entered_at')
                        }
                        for f, data in self.feature_phases.items()
                    },
                    'invited_users': list(self.invited_users)
                }
                with open(state_file, 'w') as f:
                    json.dump(save_data, f, indent=2)
            except Exception as e:
                print(f"[PhaseController] State save failed: {e}")

    def get_phase(self, feature):
        """Get current phase for a feature"""
        if feature not in self.feature_phases:
            return Phase.ALPHA  # Default to most restrictive
        return self.feature_phases[feature]['phase']

    def get_phase_config(self, feature):
        """Get configuration for feature's current phase"""
        phase = self.get_phase(feature)
        return PHASE_CONFIGS.get(phase, PHASE_CONFIGS[Phase.ALPHA])

    def can_access(self, feature, user_id, tier='FREE', user_created_at=None):
        """
        Check if a user can access a feature based on current phase.

        Args:
            feature: Feature name
            user_id: User identifier
            tier: User tier (FREE, SEEKER, BUILDER, etc.)
            user_created_at: When user account was created (for early adopter checks)

        Returns:
            (allowed: bool, info: dict)
        """
        with self.lock:
            phase_data = self.feature_phases.get(feature)
            if not phase_data:
                return False, {'reason': 'unknown_feature', 'feature': feature}

            phase = phase_data['phase']
            config = PHASE_CONFIGS[phase]

            # Check tier restriction
            if tier not in config['allowed_tiers']:
                return False, {
                    'reason': 'tier_restricted',
                    'phase': phase.value,
                    'allowed_tiers': config['allowed_tiers'],
                    'user_tier': tier,
                    'message': f'This feature is in {config["name"]} phase. Upgrade to access.'
                }

            # Check invite requirement
            if config['requires_invite'] and user_id not in self.invited_users:
                # Commander always has access
                if tier not in ['COMMANDER', 'OPERATOR']:
                    return False, {
                        'reason': 'invite_required',
                        'phase': phase.value,
                        'message': f'This feature is in {config["name"]}. Invite required.'
                    }

            # Check user count limit
            max_users = config['max_users']
            if max_users > 0:
                current_users = len(phase_data.get('users', set()))
                if user_id not in phase_data.get('users', set()) and current_users >= max_users:
                    return False, {
                        'reason': 'phase_full',
                        'phase': phase.value,
                        'current_users': current_users,
                        'max_users': max_users,
                        'message': f'{config["name"]} phase is full. Join the waitlist.'
                    }

            # User can access - track them
            if 'users' not in phase_data:
                phase_data['users'] = set()
            phase_data['users'].add(user_id)

            return True, {
                'phase': phase.value,
                'phase_name': config['name'],
                'rate_multiplier': config['rate_multiplier'],
                'features_enabled': config['features_enabled']
            }

    def record_outcome(self, feature, success, error_type=None):
        """Record success/failure for phase metrics"""
        with self.lock:
            phase_data = self.feature_phases.get(feature)
            if phase_data:
                if success:
                    phase_data['success_count'] = phase_data.get('success_count', 0) + 1
                else:
                    phase_data['error_count'] = phase_data.get('error_count', 0) + 1

    def get_metrics(self, feature):
        """Get metrics for a feature"""
        with self.lock:
            phase_data = self.feature_phases.get(feature, {})
            success = phase_data.get('success_count', 0)
            errors = phase_data.get('error_count', 0)
            total = success + errors

            return {
                'feature': feature,
                'phase': phase_data.get('phase', Phase.ALPHA).value,
                'users': len(phase_data.get('users', set())),
                'success_count': success,
                'error_count': errors,
                'error_rate': errors / total if total > 0 else 0,
                'entered_at': phase_data.get('entered_at')
            }

    def check_transition_ready(self, feature):
        """Check if feature is ready to advance to next phase"""
        with self.lock:
            phase_data = self.feature_phases.get(feature)
            if not phase_data:
                return False, {'reason': 'unknown_feature'}

            current_phase = phase_data['phase']

            # Find next phase
            phase_order = [Phase.ALPHA, Phase.BETA, Phase.EARLY, Phase.GROWTH, Phase.SCALE]
            current_idx = phase_order.index(current_phase)

            if current_idx >= len(phase_order) - 1:
                return False, {'reason': 'already_at_max_phase', 'phase': current_phase.value}

            next_phase = phase_order[current_idx + 1]
            transition_key = (current_phase, next_phase)

            requirements = TRANSITION_REQUIREMENTS.get(transition_key)
            if not requirements:
                return True, {'reason': 'no_requirements', 'next_phase': next_phase.value}

            # Check days in phase
            entered_at = datetime.fromisoformat(phase_data.get('entered_at', datetime.now().isoformat()))
            days_in_phase = (datetime.now() - entered_at).days
            if days_in_phase < requirements['min_days_in_phase']:
                return False, {
                    'reason': 'min_days_not_met',
                    'required_days': requirements['min_days_in_phase'],
                    'current_days': days_in_phase
                }

            # Check users tested
            users_tested = len(phase_data.get('users', set()))
            if users_tested < requirements['min_users_tested']:
                return False, {
                    'reason': 'min_users_not_met',
                    'required_users': requirements['min_users_tested'],
                    'current_users': users_tested
                }

            # Check error rate
            metrics = self.get_metrics(feature)
            if metrics['error_rate'] > requirements['max_error_rate']:
                return False, {
                    'reason': 'error_rate_too_high',
                    'max_rate': requirements['max_error_rate'],
                    'current_rate': metrics['error_rate']
                }

            return True, {
                'ready': True,
                'next_phase': next_phase.value,
                'requires_commander_approval': requirements.get('commander_approval', True)
            }

    def advance_phase(self, feature, approved_by=None, force=False):
        """
        Advance a feature to the next phase.

        Args:
            feature: Feature to advance
            approved_by: Who approved the transition
            force: Force transition even if requirements not met

        Returns:
            (success: bool, info: dict)
        """
        with self.lock:
            phase_data = self.feature_phases.get(feature)
            if not phase_data:
                return False, {'error': 'unknown_feature'}

            current_phase = phase_data['phase']
            phase_order = [Phase.ALPHA, Phase.BETA, Phase.EARLY, Phase.GROWTH, Phase.SCALE]
            current_idx = phase_order.index(current_phase)

            if current_idx >= len(phase_order) - 1:
                return False, {'error': 'already_at_max_phase'}

            # Check if ready
            if not force:
                ready, info = self.check_transition_ready(feature)
                if not ready:
                    return False, info

            next_phase = phase_order[current_idx + 1]

            # Perform transition
            phase_data['phase'] = next_phase
            phase_data['entered_at'] = datetime.now().isoformat()
            phase_data['success_count'] = 0
            phase_data['error_count'] = 0
            # Keep users

            # Log transition
            self.phase_history.append({
                'feature': feature,
                'from_phase': current_phase.value,
                'to_phase': next_phase.value,
                'approved_by': approved_by,
                'at': datetime.now().isoformat(),
                'forced': force
            })

            self._save_state()

            print(f"[PhaseController] {feature} advanced: {current_phase.value} -> {next_phase.value}")

            return True, {
                'success': True,
                'feature': feature,
                'from_phase': current_phase.value,
                'to_phase': next_phase.value,
                'config': PHASE_CONFIGS[next_phase]
            }

    def rollback_phase(self, feature, reason=None):
        """Roll back a feature to previous phase"""
        with self.lock:
            phase_data = self.feature_phases.get(feature)
            if not phase_data:
                return False, {'error': 'unknown_feature'}

            current_phase = phase_data['phase']
            phase_order = [Phase.ALPHA, Phase.BETA, Phase.EARLY, Phase.GROWTH, Phase.SCALE]
            current_idx = phase_order.index(current_phase)

            if current_idx <= 0:
                return False, {'error': 'already_at_min_phase'}

            prev_phase = phase_order[current_idx - 1]

            phase_data['phase'] = prev_phase
            phase_data['entered_at'] = datetime.now().isoformat()

            self.phase_history.append({
                'feature': feature,
                'from_phase': current_phase.value,
                'to_phase': prev_phase.value,
                'action': 'rollback',
                'reason': reason,
                'at': datetime.now().isoformat()
            })

            self._save_state()

            print(f"[PhaseController] {feature} ROLLED BACK: {current_phase.value} -> {prev_phase.value}")

            return True, {
                'success': True,
                'feature': feature,
                'from_phase': current_phase.value,
                'to_phase': prev_phase.value
            }

    def invite_user(self, user_id):
        """Add user to invite list"""
        with self.lock:
            self.invited_users.add(user_id)
            self._save_state()

    def remove_invite(self, user_id):
        """Remove user from invite list"""
        with self.lock:
            self.invited_users.discard(user_id)
            self._save_state()

    def get_status(self):
        """Get full phase status"""
        with self.lock:
            return {
                'features': {
                    f: {
                        'phase': data['phase'].value,
                        'config': PHASE_CONFIGS[data['phase']],
                        'users': len(data.get('users', set())),
                        'entered_at': data.get('entered_at'),
                        'metrics': self.get_metrics(f)
                    }
                    for f, data in self.feature_phases.items()
                },
                'invited_users_count': len(self.invited_users),
                'history': self.phase_history[-20:]
            }


# ============================================
# GLOBAL INSTANCE
# ============================================

_phase_controller = None

def get_phase_controller():
    global _phase_controller
    if _phase_controller is None:
        _phase_controller = PhaseController()
    return _phase_controller


# ============================================
# FLASK INTEGRATION
# ============================================

def require_phase(feature):
    """
    Decorator to check phase access.

    Usage:
        @app.route('/chat')
        @require_phase('araya_chat')
        def chat():
            ...
    """
    from functools import wraps
    from flask import request, jsonify

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            data = request.get_json() or {}
            user_id = data.get('user_id') or data.get('foundation_id') or 'anonymous'
            tier = data.get('tier', 'FREE')

            controller = get_phase_controller()
            allowed, info = controller.can_access(feature, user_id, tier)

            if not allowed:
                return jsonify({
                    'error': 'phase_restricted',
                    'phase': info.get('phase'),
                    'message': info.get('message', 'Feature not available in current phase'),
                    'reason': info.get('reason')
                }), 403

            return f(*args, **kwargs)
        return decorated
    return decorator


# ============================================
# TEST
# ============================================

if __name__ == '__main__':
    print("="*50)
    print("PHASED ROLLOUT - Test Suite")
    print("="*50)

    controller = get_phase_controller()

    # Test phase access
    print("\n1. Testing phase access:")

    # Commander should have access to everything
    allowed, info = controller.can_access('araya_chat', 'commander_1', 'COMMANDER')
    print(f"   COMMANDER to araya_chat: {'ALLOWED' if allowed else 'BLOCKED'} ({info.get('phase')})")

    # FREE tier blocked from alpha features
    allowed, info = controller.can_access('brain_write', 'free_user_1', 'FREE')
    print(f"   FREE to brain_write (alpha): {'ALLOWED' if allowed else 'BLOCKED'} - {info.get('reason', 'OK')}")

    # BUILDER can access beta
    allowed, info = controller.can_access('araya_chat', 'builder_1', 'BUILDER')
    print(f"   BUILDER to araya_chat (beta): {'ALLOWED' if allowed else 'BLOCKED'}")

    # Test invite system
    print("\n2. Testing invite system:")
    controller.invite_user('special_user')
    allowed, info = controller.can_access('araya_chat', 'special_user', 'FREE')
    print(f"   Invited FREE user: {'ALLOWED' if allowed else 'BLOCKED'}")

    # Test transition readiness
    print("\n3. Testing transition readiness:")
    ready, info = controller.check_transition_ready('araya_chat')
    print(f"   araya_chat ready to advance: {ready}")
    if not ready:
        print(f"   Reason: {info.get('reason')}")

    # Test phase status
    print("\n4. Current phase status:")
    status = controller.get_status()
    for feature, data in status['features'].items():
        print(f"   {feature}: {data['phase']} ({data['users']} users)")

    print("\n" + "="*50)
    print("Phased Rollout ready for deployment!")
    print("="*50)
