"""
KILL SWITCH - Emergency System Shutoff
======================================
Instantly disable features when problems arise.
Single point of control for all emergency actions.

Usage:
    from KILL_SWITCH import KillSwitch

    ks = KillSwitch()

    # Check before any critical operation
    if ks.is_killed('ALL_AI_QUERIES'):
        return {'error': 'System maintenance', 'message': ks.get_message('ALL_AI_QUERIES')}

    # Activate in emergency
    ks.kill('ALL_AI_QUERIES', reason='API overload detected')

    # Restore when fixed
    ks.restore('ALL_AI_QUERIES')

Deploy: Railway with ARAYA_UNIFIED_API.py
"""

import os
import json
from datetime import datetime
import threading

# Try to import notification systems
try:
    import smtplib
    from email.message import EmailMessage
    EMAIL_AVAILABLE = True
except ImportError:
    EMAIL_AVAILABLE = False

# ============================================
# KILL SWITCH DEFINITIONS
# ============================================

KILL_SWITCHES = {
    # Master Switch
    'ALL_SERVICES': {
        'enabled': False,
        'fallback_message': 'System is temporarily offline for emergency maintenance.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'CRITICAL',
        'auto_restore_minutes': None  # Never auto-restore
    },

    # AI/Query Switches
    'ALL_AI_QUERIES': {
        'enabled': False,
        'fallback_message': 'ARAYA is temporarily offline for maintenance. Please try again in a few minutes.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'HIGH',
        'auto_restore_minutes': 30
    },
    'DEEPSEEK_API': {
        'enabled': False,
        'fallback_message': 'AI service temporarily unavailable. Using cached responses.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'MEDIUM',
        'auto_restore_minutes': 15
    },
    'OLLAMA_LOCAL': {
        'enabled': False,
        'fallback_message': 'Local AI unavailable. Switching to cloud service.',
        'notify': [],
        'severity': 'LOW',
        'auto_restore_minutes': 5
    },

    # Data Switches
    'BRAIN_QUERIES': {
        'enabled': False,
        'fallback_message': 'Memory features temporarily disabled for maintenance.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'MEDIUM',
        'auto_restore_minutes': 15
    },
    'BRAIN_WRITES': {
        'enabled': False,
        'fallback_message': 'Memory writes temporarily disabled.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'MEDIUM',
        'auto_restore_minutes': 10
    },

    # File Switches
    'FILE_READS': {
        'enabled': False,
        'fallback_message': 'File access temporarily disabled.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'MEDIUM',
        'auto_restore_minutes': 10
    },
    'FILE_WRITES': {
        'enabled': False,
        'fallback_message': 'File editing temporarily disabled for security review.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'HIGH',
        'auto_restore_minutes': 30
    },

    # Integration Switches
    'DISCORD_BOT': {
        'enabled': False,
        'fallback_message': 'Discord integration temporarily offline.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'LOW',
        'auto_restore_minutes': 15
    },
    'EMAIL_GATEWAY': {
        'enabled': False,
        'fallback_message': 'Email features temporarily unavailable.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'MEDIUM',
        'auto_restore_minutes': 30
    },

    # Access Switches
    'NEW_SIGNUPS': {
        'enabled': False,
        'fallback_message': 'We are at capacity. Join the waitlist and we will notify you when spots open.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'LOW',
        'auto_restore_minutes': None
    },
    'FREE_TIER': {
        'enabled': False,
        'fallback_message': 'Free tier temporarily unavailable due to high demand. Upgrade to continue.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'MEDIUM',
        'auto_restore_minutes': 60
    },
    'API_ACCESS': {
        'enabled': False,
        'fallback_message': 'API access temporarily restricted.',
        'notify': ['commander@100xbuilder.io'],
        'severity': 'HIGH',
        'auto_restore_minutes': 30
    }
}

# ============================================
# KILL SWITCH CLASS
# ============================================

class KillSwitch:
    """
    Emergency kill switch manager.
    Stores state in memory and optionally persists to file/database.
    """

    def __init__(self, storage='memory', notify_handler=None):
        self.storage = storage
        self.notify_handler = notify_handler
        self.switches = {}
        self.kill_log = []
        self.lock = threading.Lock()

        # Initialize from defaults
        for name, config in KILL_SWITCHES.items():
            self.switches[name] = {
                'killed': config.get('enabled', False),
                'killed_at': None,
                'killed_by': None,
                'reason': None,
                'auto_restore_at': None,
                **config
            }

        self._load_state()
        self._start_auto_restore_thread()

    def _load_state(self):
        """Load saved state"""
        if self.storage == 'file':
            try:
                state_file = os.path.join(
                    os.path.dirname(__file__),
                    '.kill_switch_state.json'
                )
                if os.path.exists(state_file):
                    with open(state_file, 'r') as f:
                        saved = json.load(f)
                        for name, state in saved.items():
                            if name in self.switches:
                                self.switches[name].update(state)
            except Exception as e:
                print(f"[KillSwitch] State load failed: {e}")

    def _save_state(self):
        """Save current state"""
        if self.storage == 'file':
            try:
                state_file = os.path.join(
                    os.path.dirname(__file__),
                    '.kill_switch_state.json'
                )
                save_data = {
                    name: {
                        'killed': s['killed'],
                        'killed_at': s['killed_at'],
                        'killed_by': s['killed_by'],
                        'reason': s['reason']
                    }
                    for name, s in self.switches.items()
                }
                with open(state_file, 'w') as f:
                    json.dump(save_data, f, indent=2)
            except Exception as e:
                print(f"[KillSwitch] State save failed: {e}")

    def _start_auto_restore_thread(self):
        """Start background thread for auto-restore"""
        def check_auto_restore():
            import time
            while True:
                time.sleep(60)  # Check every minute
                now = datetime.now()
                with self.lock:
                    for name, switch in self.switches.items():
                        if switch['killed'] and switch.get('auto_restore_at'):
                            try:
                                restore_time = datetime.fromisoformat(switch['auto_restore_at'])
                                if now >= restore_time:
                                    self._restore(name, by='AUTO_RESTORE')
                            except:
                                pass

        thread = threading.Thread(target=check_auto_restore, daemon=True)
        thread.start()

    def is_killed(self, switch_name):
        """Check if a switch is killed"""
        # Check master switch first
        if switch_name != 'ALL_SERVICES' and self.switches.get('ALL_SERVICES', {}).get('killed'):
            return True

        switch = self.switches.get(switch_name)
        if not switch:
            return False

        return switch.get('killed', False)

    def get_message(self, switch_name):
        """Get the fallback message for a killed switch"""
        switch = self.switches.get(switch_name)
        if switch:
            return switch.get('fallback_message', 'Service temporarily unavailable.')
        return 'Service temporarily unavailable.'

    def kill(self, switch_name, reason=None, killed_by='SYSTEM', notify=True):
        """
        Activate a kill switch.

        Args:
            switch_name: Name of the switch to kill
            reason: Why this is being killed
            killed_by: Who/what triggered the kill
            notify: Whether to send notifications
        """
        with self.lock:
            if switch_name not in self.switches:
                return False

            switch = self.switches[switch_name]
            now = datetime.now()

            switch['killed'] = True
            switch['killed_at'] = now.isoformat()
            switch['killed_by'] = killed_by
            switch['reason'] = reason

            # Set auto-restore time if configured
            auto_restore = switch.get('auto_restore_minutes')
            if auto_restore:
                from datetime import timedelta
                restore_time = now + timedelta(minutes=auto_restore)
                switch['auto_restore_at'] = restore_time.isoformat()

            # Log the kill
            self.kill_log.append({
                'action': 'KILL',
                'switch': switch_name,
                'reason': reason,
                'by': killed_by,
                'at': now.isoformat()
            })

            self._save_state()

        # Send notifications
        if notify and switch.get('notify'):
            self._notify(switch_name, 'KILLED', reason)

        print(f"[KillSwitch] {switch_name} KILLED by {killed_by}: {reason}")
        return True

    def _restore(self, switch_name, by='SYSTEM'):
        """Internal restore without lock"""
        if switch_name not in self.switches:
            return False

        switch = self.switches[switch_name]
        now = datetime.now()

        was_killed = switch['killed']
        switch['killed'] = False
        switch['auto_restore_at'] = None

        if was_killed:
            self.kill_log.append({
                'action': 'RESTORE',
                'switch': switch_name,
                'by': by,
                'at': now.isoformat()
            })

            self._save_state()
            print(f"[KillSwitch] {switch_name} RESTORED by {by}")

        return True

    def restore(self, switch_name, by='ADMIN'):
        """
        Restore a killed switch.
        """
        with self.lock:
            result = self._restore(switch_name, by)

        if result:
            switch = self.switches.get(switch_name)
            if switch and switch.get('notify'):
                self._notify(switch_name, 'RESTORED')

        return result

    def _notify(self, switch_name, action, reason=None):
        """Send notification about kill switch action"""
        switch = self.switches.get(switch_name)
        if not switch:
            return

        message = f"""
KILL SWITCH {action}

Switch: {switch_name}
Action: {action}
Severity: {switch.get('severity', 'UNKNOWN')}
Reason: {reason or 'Not specified'}
Time: {datetime.now().isoformat()}

Auto-restore: {switch.get('auto_restore_at', 'Manual restore required')}
"""

        # Use custom handler if provided
        if self.notify_handler:
            try:
                self.notify_handler(switch_name, action, message)
            except Exception as e:
                print(f"[KillSwitch] Notification failed: {e}")
            return

        # Default: print to console
        print(f"[NOTIFICATION] {message}")

        # TODO: Email notification
        # TODO: SMS notification via Twilio
        # TODO: Slack/Discord notification

    def status(self, switch_name=None):
        """Get status of one or all switches"""
        if switch_name:
            return self.switches.get(switch_name)

        return {
            name: {
                'killed': s['killed'],
                'severity': s.get('severity'),
                'killed_at': s.get('killed_at'),
                'reason': s.get('reason'),
                'auto_restore_at': s.get('auto_restore_at')
            }
            for name, s in self.switches.items()
        }

    def get_killed(self):
        """Get list of all currently killed switches"""
        return [
            name for name, s in self.switches.items()
            if s.get('killed')
        ]

    def get_log(self, limit=50):
        """Get recent kill switch activity"""
        return self.kill_log[-limit:]

    def kill_all_ai(self, reason=None, by='SYSTEM'):
        """Kill all AI-related switches"""
        self.kill('ALL_AI_QUERIES', reason=reason, killed_by=by)

    def restore_all_ai(self, by='ADMIN'):
        """Restore all AI-related switches"""
        self.restore('ALL_AI_QUERIES', by=by)
        self.restore('DEEPSEEK_API', by=by)
        self.restore('OLLAMA_LOCAL', by=by)

    def emergency_shutdown(self, reason=None, by='EMERGENCY'):
        """Kill everything - full emergency shutdown"""
        self.kill('ALL_SERVICES', reason=reason, killed_by=by, notify=True)


# ============================================
# GLOBAL INSTANCE
# ============================================

_kill_switch = None

def get_kill_switch():
    global _kill_switch
    if _kill_switch is None:
        _kill_switch = KillSwitch()
    return _kill_switch

def is_killed(switch_name):
    """Convenience function for checking kill status"""
    return get_kill_switch().is_killed(switch_name)


# ============================================
# FLASK MIDDLEWARE
# ============================================

def require_service(switch_name):
    """
    Decorator to check kill switch before endpoint execution.

    Usage:
        @app.route('/chat')
        @require_service('ALL_AI_QUERIES')
        def chat():
            ...
    """
    from functools import wraps
    from flask import jsonify

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            ks = get_kill_switch()

            if ks.is_killed(switch_name):
                return jsonify({
                    'error': 'service_unavailable',
                    'message': ks.get_message(switch_name),
                    'retry_after': 300  # 5 minutes
                }), 503

            return f(*args, **kwargs)
        return decorated
    return decorator


# ============================================
# TEST
# ============================================

if __name__ == '__main__':
    print("="*50)
    print("KILL SWITCH - Test Suite")
    print("="*50)

    ks = KillSwitch()

    # Test initial state
    print("\n1. Initial state:")
    killed = ks.get_killed()
    print(f"   Killed switches: {killed if killed else 'None'}")

    # Test kill
    print("\n2. Testing kill:")
    ks.kill('ALL_AI_QUERIES', reason='Test kill', killed_by='TEST')
    print(f"   ALL_AI_QUERIES killed: {ks.is_killed('ALL_AI_QUERIES')}")
    print(f"   Message: {ks.get_message('ALL_AI_QUERIES')}")

    # Test restore
    print("\n3. Testing restore:")
    ks.restore('ALL_AI_QUERIES', by='TEST')
    print(f"   ALL_AI_QUERIES after restore: {ks.is_killed('ALL_AI_QUERIES')}")

    # Test master switch
    print("\n4. Testing master switch:")
    ks.kill('ALL_SERVICES', reason='Master test', killed_by='TEST')
    print(f"   ALL_SERVICES killed: {ks.is_killed('ALL_SERVICES')}")
    print(f"   BRAIN_QUERIES blocked by master: {ks.is_killed('BRAIN_QUERIES')}")
    ks.restore('ALL_SERVICES', by='TEST')

    # Test status
    print("\n5. Status check:")
    status = ks.status()
    active = sum(1 for s in status.values() if s['killed'])
    print(f"   Total switches: {len(status)}")
    print(f"   Currently killed: {active}")

    # Test log
    print("\n6. Activity log:")
    log = ks.get_log(5)
    for entry in log:
        print(f"   {entry['action']}: {entry['switch']} by {entry['by']}")

    print("\n" + "="*50)
    print("Kill Switch ready for deployment!")
    print("="*50)
