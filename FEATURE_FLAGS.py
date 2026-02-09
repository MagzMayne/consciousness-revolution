"""
FEATURE FLAGS - Controlled Rollout System
==========================================
Toggle features without deployment.
Percentage-based rollouts for gradual releases.
Tier-based access control.

Usage:
    from FEATURE_FLAGS import FeatureFlags, is_enabled

    flags = FeatureFlags()

    if flags.is_enabled('brain_connection', user_id='abc', tier='BUILDER'):
        # Feature is enabled for this user
        ...

Deploy: Local with Supabase backend (or in-memory for testing)
"""

import json
import hashlib
from datetime import datetime
import os

# ============================================
# FEATURE FLAG DEFINITIONS
# ============================================

DEFAULT_FLAGS = {
    # Core Features
    'araya_chat': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['FREE', 'SEEKER', 'BUILDER', 'OPERATOR', 'COMMANDER'],
        'kill_switch': False,
        'description': 'Basic ARAYA chat functionality'
    },

    # Brain/Memory Features
    'brain_connection': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['SEEKER', 'BUILDER', 'OPERATOR', 'COMMANDER'],
        'kill_switch': False,
        'description': 'Access to Cyclotron brain memory'
    },
    'brain_query': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['BUILDER', 'OPERATOR', 'COMMANDER'],
        'kill_switch': False,
        'description': 'Direct brain queries via /brain/query'
    },
    'brain_write': {
        'enabled': True,
        'percentage_rollout': 50,  # Gradual rollout
        'tiers': ['OPERATOR', 'COMMANDER'],
        'kill_switch': True,
        'description': 'Write to brain memory'
    },

    # File System Features
    'file_read': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['BUILDER', 'OPERATOR', 'COMMANDER'],
        'kill_switch': False,
        'description': 'Read files from allowed directories'
    },
    'file_write': {
        'enabled': True,
        'percentage_rollout': 75,  # Gradual rollout
        'tiers': ['OPERATOR', 'COMMANDER'],
        'kill_switch': True,
        'description': 'Write/edit files'
    },
    'file_delete': {
        'enabled': False,  # Not ready yet
        'percentage_rollout': 0,
        'tiers': ['COMMANDER'],
        'kill_switch': True,
        'description': 'Delete files (dangerous)'
    },

    # Advanced Features
    'pattern_library': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['SEEKER', 'BUILDER', 'OPERATOR', 'COMMANDER'],
        'kill_switch': False,
        'description': 'Access to pattern library'
    },
    'pattern_detection': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['FREE', 'SEEKER', 'BUILDER', 'OPERATOR', 'COMMANDER'],
        'kill_switch': False,
        'description': 'Manipulation pattern detection'
    },
    'advanced_analysis': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['BUILDER', 'OPERATOR', 'COMMANDER'],
        'kill_switch': False,
        'description': 'Deep pattern analysis'
    },

    # Communication Features
    'discord_integration': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['BUILDER', 'OPERATOR', 'COMMANDER'],
        'kill_switch': True,
        'description': 'Discord bot integration'
    },
    'email_integration': {
        'enabled': True,
        'percentage_rollout': 50,
        'tiers': ['OPERATOR', 'COMMANDER'],
        'kill_switch': True,
        'description': 'Email gateway integration'
    },
    'mass_email': {
        'enabled': False,
        'percentage_rollout': 0,
        'tiers': ['COMMANDER'],
        'kill_switch': True,
        'description': 'Mass email campaigns'
    },

    # Future Features (Disabled)
    'voice_interface': {
        'enabled': False,
        'percentage_rollout': 0,
        'tiers': ['COMMANDER'],
        'kill_switch': True,
        'description': 'Voice interaction with ARAYA'
    },
    'image_analysis': {
        'enabled': False,
        'percentage_rollout': 0,
        'tiers': ['OPERATOR', 'COMMANDER'],
        'kill_switch': True,
        'description': 'Image/screenshot analysis'
    },
    'api_access': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['OPERATOR', 'COMMANDER'],
        'kill_switch': True,
        'description': 'Direct API access'
    },
    'white_label': {
        'enabled': False,
        'percentage_rollout': 0,
        'tiers': ['COMMANDER'],
        'kill_switch': True,
        'description': 'White-label ARAYA deployment'
    },

    # Experimental Features
    'jedi_poker_table': {
        'enabled': True,
        'percentage_rollout': 25,  # Very gradual
        'tiers': ['OPERATOR', 'COMMANDER'],
        'kill_switch': True,
        'description': 'Multi-AI validation system'
    },
    'consciousness_journal': {
        'enabled': True,
        'percentage_rollout': 100,
        'tiers': ['FREE', 'SEEKER', 'BUILDER', 'OPERATOR', 'COMMANDER'],
        'kill_switch': False,
        'description': 'Personal journaling'
    }
}

# ============================================
# FEATURE FLAGS CLASS
# ============================================

class FeatureFlags:
    """
    Feature flag manager with percentage-based rollout
    and tier-based access control.
    """

    def __init__(self, storage='memory', supabase_client=None):
        self.storage = storage
        self.supabase = supabase_client
        self.flags = DEFAULT_FLAGS.copy()
        self.overrides = {}  # user_id -> {flag_name: bool}
        self._load_from_storage()

    def _load_from_storage(self):
        """Load flags from storage backend"""
        if self.storage == 'supabase' and self.supabase:
            try:
                response = self.supabase.table('feature_flags').select('*').execute()
                for row in response.data:
                    if row['flag_name'] in self.flags:
                        self.flags[row['flag_name']].update({
                            'enabled': row['enabled'],
                            'percentage_rollout': row['percentage_rollout'],
                            'kill_switch': row['kill_switch']
                        })
            except Exception as e:
                print(f"[FeatureFlags] Supabase load failed: {e}")

        elif self.storage == 'file':
            try:
                flag_file = os.path.join(
                    os.path.dirname(__file__),
                    '.feature_flags.json'
                )
                if os.path.exists(flag_file):
                    with open(flag_file, 'r') as f:
                        saved = json.load(f)
                        for name, config in saved.items():
                            if name in self.flags:
                                self.flags[name].update(config)
            except Exception as e:
                print(f"[FeatureFlags] File load failed: {e}")

    def _save_to_storage(self):
        """Save flags to storage backend"""
        if self.storage == 'file':
            try:
                flag_file = os.path.join(
                    os.path.dirname(__file__),
                    '.feature_flags.json'
                )
                with open(flag_file, 'w') as f:
                    json.dump(self.flags, f, indent=2)
            except Exception as e:
                print(f"[FeatureFlags] File save failed: {e}")

    def _user_in_rollout(self, user_id, percentage):
        """
        Deterministically check if user is in rollout percentage.
        Same user always gets same result for same percentage.
        """
        if percentage >= 100:
            return True
        if percentage <= 0:
            return False

        # Hash user_id to get consistent 0-100 value
        hash_val = int(hashlib.md5(str(user_id).encode()).hexdigest(), 16)
        user_bucket = hash_val % 100
        return user_bucket < percentage

    def is_enabled(self, flag_name, user_id=None, tier='FREE'):
        """
        Check if a feature is enabled for a user.

        Args:
            flag_name: Name of the feature flag
            user_id: User identifier (for percentage rollout)
            tier: User's tier level

        Returns: bool
        """
        flag = self.flags.get(flag_name)
        if not flag:
            return False  # Unknown flag defaults to disabled

        # Check kill switch first
        if flag.get('kill_switch'):
            return False

        # Check if globally enabled
        if not flag.get('enabled'):
            return False

        # Check user override
        if user_id and user_id in self.overrides:
            override = self.overrides[user_id].get(flag_name)
            if override is not None:
                return override

        # Check tier access
        allowed_tiers = flag.get('tiers', [])
        tier_normalized = tier.upper() if tier else 'FREE'
        if tier_normalized not in allowed_tiers:
            return False

        # Check percentage rollout
        percentage = flag.get('percentage_rollout', 100)
        if user_id:
            return self._user_in_rollout(user_id, percentage)

        return percentage >= 100

    def get_flag(self, flag_name):
        """Get full flag configuration"""
        return self.flags.get(flag_name, {})

    def set_flag(self, flag_name, enabled=None, percentage=None, kill_switch=None):
        """Update a flag configuration"""
        if flag_name not in self.flags:
            self.flags[flag_name] = {
                'enabled': True,
                'percentage_rollout': 100,
                'tiers': ['FREE'],
                'kill_switch': False
            }

        if enabled is not None:
            self.flags[flag_name]['enabled'] = enabled
        if percentage is not None:
            self.flags[flag_name]['percentage_rollout'] = percentage
        if kill_switch is not None:
            self.flags[flag_name]['kill_switch'] = kill_switch

        self._save_to_storage()

    def set_user_override(self, user_id, flag_name, enabled):
        """Set a user-specific override for a flag"""
        if user_id not in self.overrides:
            self.overrides[user_id] = {}
        self.overrides[user_id][flag_name] = enabled

    def clear_user_override(self, user_id, flag_name=None):
        """Clear user overrides"""
        if user_id in self.overrides:
            if flag_name:
                self.overrides[user_id].pop(flag_name, None)
            else:
                del self.overrides[user_id]

    def kill_switch(self, flag_name, enable=True):
        """Activate or deactivate kill switch for a flag"""
        if flag_name in self.flags:
            self.flags[flag_name]['kill_switch'] = enable
            self._save_to_storage()
            return True
        return False

    def get_user_features(self, user_id, tier='FREE'):
        """Get all features available to a user"""
        available = {}
        for flag_name in self.flags:
            available[flag_name] = {
                'enabled': self.is_enabled(flag_name, user_id, tier),
                'description': self.flags[flag_name].get('description', ''),
                'tier_required': self.flags[flag_name].get('tiers', [])[0] if self.flags[flag_name].get('tiers') else 'FREE'
            }
        return available

    def get_all_flags(self):
        """Get all flag configurations (for admin)"""
        return self.flags

    def get_stats(self):
        """Get feature flag statistics"""
        total = len(self.flags)
        enabled = sum(1 for f in self.flags.values() if f.get('enabled') and not f.get('kill_switch'))
        killed = sum(1 for f in self.flags.values() if f.get('kill_switch'))
        partial = sum(1 for f in self.flags.values() if 0 < f.get('percentage_rollout', 100) < 100)

        return {
            'total_flags': total,
            'enabled': enabled,
            'disabled': total - enabled,
            'killed': killed,
            'partial_rollout': partial,
            'user_overrides': len(self.overrides)
        }


# ============================================
# GLOBAL INSTANCE
# ============================================

_flags = None

def get_flags():
    global _flags
    if _flags is None:
        _flags = FeatureFlags()
    return _flags

def is_enabled(flag_name, user_id=None, tier='FREE'):
    """Convenience function for checking feature flags"""
    return get_flags().is_enabled(flag_name, user_id, tier)


# ============================================
# TEST
# ============================================

if __name__ == '__main__':
    print("="*50)
    print("FEATURE FLAGS - Test Suite")
    print("="*50)

    flags = FeatureFlags()

    # Test basic enable/disable
    print("\n1. Testing basic flags:")
    print(f"   araya_chat (FREE): {flags.is_enabled('araya_chat', 'user1', 'FREE')}")
    print(f"   brain_connection (FREE): {flags.is_enabled('brain_connection', 'user1', 'FREE')}")
    print(f"   brain_connection (BUILDER): {flags.is_enabled('brain_connection', 'user1', 'BUILDER')}")

    # Test tier access
    print("\n2. Testing tier access:")
    for tier in ['FREE', 'SEEKER', 'BUILDER', 'OPERATOR', 'COMMANDER']:
        has_brain = flags.is_enabled('brain_query', 'user1', tier)
        has_file = flags.is_enabled('file_write', 'user1', tier)
        print(f"   {tier}: brain_query={has_brain}, file_write={has_file}")

    # Test percentage rollout
    print("\n3. Testing percentage rollout (50%):")
    flags.set_flag('test_flag', enabled=True, percentage=50)
    flags.flags['test_flag']['tiers'] = ['FREE', 'SEEKER', 'BUILDER', 'OPERATOR', 'COMMANDER']

    in_rollout = sum(
        1 for i in range(100)
        if flags.is_enabled('test_flag', f'user_{i}', 'FREE')
    )
    print(f"   Users in 50% rollout: {in_rollout}/100")

    # Test kill switch
    print("\n4. Testing kill switch:")
    print(f"   file_write before kill: {flags.is_enabled('file_write', 'user1', 'COMMANDER')}")
    flags.kill_switch('file_write', enable=True)
    print(f"   file_write after kill: {flags.is_enabled('file_write', 'user1', 'COMMANDER')}")
    flags.kill_switch('file_write', enable=False)
    print(f"   file_write after unkill: {flags.is_enabled('file_write', 'user1', 'COMMANDER')}")

    # Test user override
    print("\n5. Testing user override:")
    print(f"   brain_query for FREE user: {flags.is_enabled('brain_query', 'special_user', 'FREE')}")
    flags.set_user_override('special_user', 'brain_query', True)
    print(f"   brain_query after override: {flags.is_enabled('brain_query', 'special_user', 'FREE')}")
    flags.clear_user_override('special_user')

    # Print stats
    print("\n6. Statistics:")
    stats = flags.get_stats()
    print(f"   Total flags: {stats['total_flags']}")
    print(f"   Enabled: {stats['enabled']}")
    print(f"   Partial rollout: {stats['partial_rollout']}")
    print(f"   Kill switches active: {stats['killed']}")

    print("\n" + "="*50)
    print("Feature Flags ready for deployment!")
    print("="*50)
