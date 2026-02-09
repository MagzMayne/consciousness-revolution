"""
GAME THEORY DECISION TREE - Scale Scenario Planning
=====================================================
What breaks at 10, 100, 1,000, 10,000, 100,000 users?
Automatic decision making for growth scenarios.

The "Jack and the Beanstalk" Prevention System.

Usage:
    from GAME_THEORY_DECISION_TREE import ScaleDecisionTree, get_decision_tree

    tree = get_decision_tree()

    # Check current scale status
    status = tree.analyze_current_state()

    # Get recommendations for a scenario
    recommendations = tree.get_recommendations(current_users=500)

    # Simulate a growth scenario
    simulation = tree.simulate_growth(target_users=5000)

Deploy: Railway with ARAYA_UNIFIED_API.py
"""

import json
from datetime import datetime, timedelta
from enum import Enum

# ============================================
# SCALE THRESHOLDS
# ============================================

class ScaleLevel(Enum):
    ALPHA = 'alpha'           # 1-10 users
    BETA = 'beta'             # 11-100 users
    EARLY_ADOPTERS = 'early'  # 101-1,000 users
    GROWTH = 'growth'         # 1,001-10,000 users
    SCALE = 'scale'           # 10,001-100,000 users
    HYPERSCALE = 'hyperscale' # 100,001+ users


SCALE_THRESHOLDS = {
    ScaleLevel.ALPHA: (1, 10),
    ScaleLevel.BETA: (11, 100),
    ScaleLevel.EARLY_ADOPTERS: (101, 1000),
    ScaleLevel.GROWTH: (1001, 10000),
    ScaleLevel.SCALE: (10001, 100000),
    ScaleLevel.HYPERSCALE: (100001, float('inf'))
}


# ============================================
# BOTTLENECK DEFINITIONS
# ============================================

BOTTLENECKS = {
    # Infrastructure
    'railway_compute': {
        'name': 'Railway Compute',
        'category': 'infrastructure',
        'breaks_at': 1000,  # Concurrent connections
        'symptoms': ['500 errors', 'timeouts', 'cold starts'],
        'solutions': [
            {'users': 100, 'action': 'Upgrade to Pro plan'},
            {'users': 500, 'action': 'Add 2nd Railway instance'},
            {'users': 2000, 'action': 'Migrate to Kubernetes'},
            {'users': 10000, 'action': 'Multi-region deployment'}
        ],
        'cost_curve': [
            {'users': 100, 'monthly_cost': 20},
            {'users': 1000, 'monthly_cost': 100},
            {'users': 10000, 'monthly_cost': 500},
            {'users': 100000, 'monthly_cost': 5000}
        ]
    },

    'supabase_connections': {
        'name': 'Supabase Database Connections',
        'category': 'database',
        'breaks_at': 60,  # Default connection limit
        'symptoms': ['Connection refused', 'Pool exhausted', 'Slow queries'],
        'solutions': [
            {'users': 50, 'action': 'Enable connection pooling'},
            {'users': 200, 'action': 'Upgrade Supabase plan'},
            {'users': 1000, 'action': 'Read replicas'},
            {'users': 5000, 'action': 'Sharding or dedicated instance'}
        ],
        'cost_curve': [
            {'users': 100, 'monthly_cost': 25},
            {'users': 1000, 'monthly_cost': 100},
            {'users': 10000, 'monthly_cost': 400}
        ]
    },

    'supabase_storage': {
        'name': 'Supabase Storage',
        'category': 'storage',
        'breaks_at': 1000000,  # 1GB free tier
        'symptoms': ['Upload failures', 'Quota exceeded'],
        'solutions': [
            {'users': 500, 'action': 'Upgrade storage tier'},
            {'users': 5000, 'action': 'Add S3 for large files'},
            {'users': 20000, 'action': 'CDN for static assets'}
        ]
    },

    # AI Services
    'ollama_local': {
        'name': 'Local Ollama (AI)',
        'category': 'ai',
        'breaks_at': 10,  # Concurrent requests
        'symptoms': ['Timeouts', 'Memory exhaustion', 'Queue buildup'],
        'solutions': [
            {'users': 5, 'action': 'Request queuing'},
            {'users': 20, 'action': 'Add DeepSeek fallback'},
            {'users': 100, 'action': 'Cloud AI primary, local fallback'},
            {'users': 500, 'action': 'Multi-model load balancing'}
        ]
    },

    'deepseek_api': {
        'name': 'DeepSeek API',
        'category': 'ai',
        'breaks_at': 1000,  # RPM limit
        'symptoms': ['Rate limit errors', '429 responses'],
        'solutions': [
            {'users': 100, 'action': 'Implement caching layer'},
            {'users': 500, 'action': 'Request batching'},
            {'users': 2000, 'action': 'Add OpenAI fallback'},
            {'users': 5000, 'action': 'Multi-provider load balancing'}
        ],
        'cost_curve': [
            {'users': 100, 'monthly_cost': 50},
            {'users': 1000, 'monthly_cost': 200},
            {'users': 10000, 'monthly_cost': 1000}
        ]
    },

    # Cyclotron Brain
    'cyclotron_sqlite': {
        'name': 'Cyclotron SQLite Database',
        'category': 'database',
        'breaks_at': 100,  # Concurrent writes
        'symptoms': ['Database locked', 'Write conflicts', 'Slow queries'],
        'solutions': [
            {'users': 20, 'action': 'Write-ahead logging (WAL)'},
            {'users': 100, 'action': 'Read replica separation'},
            {'users': 500, 'action': 'Migrate to PostgreSQL'},
            {'users': 2000, 'action': 'TimescaleDB for time-series'}
        ]
    },

    # Human Bandwidth
    'human_support': {
        'name': 'Human Support Capacity',
        'category': 'human',
        'breaks_at': 50,  # Tickets per day
        'symptoms': ['Response delays', 'Burnout', 'Quality drop'],
        'solutions': [
            {'users': 50, 'action': 'Knowledge base + FAQ'},
            {'users': 200, 'action': 'AI-first support triage'},
            {'users': 1000, 'action': 'Community moderators'},
            {'users': 5000, 'action': 'Hire support team'}
        ]
    },

    'human_content': {
        'name': 'Content Creation Capacity',
        'category': 'human',
        'breaks_at': 100,  # Content requests per week
        'symptoms': ['Content backlog', 'Stale content'],
        'solutions': [
            {'users': 100, 'action': 'Content templating'},
            {'users': 500, 'action': 'AI-assisted content'},
            {'users': 2000, 'action': 'Community contributors'},
            {'users': 10000, 'action': 'Content team'}
        ]
    },

    # Discord
    'discord_rate_limits': {
        'name': 'Discord API Rate Limits',
        'category': 'integration',
        'breaks_at': 120,  # Requests per minute
        'symptoms': ['Rate limit errors', 'Message delays'],
        'solutions': [
            {'users': 50, 'action': 'Request batching'},
            {'users': 200, 'action': 'Message queueing'},
            {'users': 1000, 'action': 'Discord partnership (higher limits)'}
        ]
    }
}


# ============================================
# DECISION TREE
# ============================================

class ScaleDecisionTree:
    """
    Decision tree for scale planning and automatic recommendations.
    """

    def __init__(self):
        self.bottlenecks = BOTTLENECKS
        self.current_state = {}
        self.decisions_made = []

    def get_scale_level(self, user_count):
        """Determine scale level from user count"""
        for level, (min_users, max_users) in SCALE_THRESHOLDS.items():
            if min_users <= user_count <= max_users:
                return level
        return ScaleLevel.ALPHA

    def analyze_current_state(self, current_users=0, current_requests_per_minute=0,
                              current_db_connections=0, current_ai_requests=0):
        """
        Analyze current system state and identify active bottlenecks.

        Returns dict with:
        - scale_level
        - active_bottlenecks
        - warnings
        - recommended_actions
        """
        scale_level = self.get_scale_level(current_users)

        active_bottlenecks = []
        warnings = []
        actions = []

        for name, config in self.bottlenecks.items():
            breaks_at = config['breaks_at']

            # Estimate load based on users
            estimated_load = self._estimate_load(name, current_users)

            if estimated_load >= breaks_at * 0.8:
                # Above 80% - WARNING
                warnings.append({
                    'bottleneck': name,
                    'name': config['name'],
                    'load_pct': estimated_load / breaks_at * 100,
                    'breaks_at': breaks_at,
                    'symptoms': config['symptoms']
                })

            if estimated_load >= breaks_at:
                # At or above limit - CRITICAL
                active_bottlenecks.append({
                    'bottleneck': name,
                    'name': config['name'],
                    'load_pct': estimated_load / breaks_at * 100,
                    'status': 'CRITICAL'
                })

            # Find relevant solution
            for solution in config.get('solutions', []):
                if solution['users'] <= current_users * 1.5:  # Within 1.5x of current
                    actions.append({
                        'bottleneck': name,
                        'action': solution['action'],
                        'trigger_users': solution['users'],
                        'priority': 'HIGH' if estimated_load >= breaks_at * 0.8 else 'MEDIUM'
                    })

        self.current_state = {
            'timestamp': datetime.now().isoformat(),
            'users': current_users,
            'scale_level': scale_level.value,
            'active_bottlenecks': len(active_bottlenecks),
            'warnings': len(warnings)
        }

        return {
            'scale_level': scale_level.value,
            'users': current_users,
            'active_bottlenecks': active_bottlenecks,
            'warnings': warnings,
            'recommended_actions': sorted(actions, key=lambda x: x['trigger_users'])[:10],
            'health': 'CRITICAL' if active_bottlenecks else ('WARNING' if warnings else 'HEALTHY')
        }

    def _estimate_load(self, bottleneck_name, users):
        """Estimate load on a bottleneck based on user count"""
        # Load estimation factors
        factors = {
            'railway_compute': 0.1,  # 10% of users active concurrently
            'supabase_connections': 0.05,  # 5% need DB at once
            'supabase_storage': 100,  # 100KB per user
            'ollama_local': 0.02,  # 2% using AI at once
            'deepseek_api': 0.03,  # 3% using cloud AI
            'cyclotron_sqlite': 0.1,  # 10% writing at once
            'human_support': 0.01,  # 1% need support daily
            'human_content': 0.001,  # 0.1% request content
            'discord_rate_limits': 0.05  # 5% on Discord
        }

        factor = factors.get(bottleneck_name, 0.1)
        return int(users * factor)

    def get_recommendations(self, current_users=0, target_users=None):
        """
        Get prioritized recommendations for current or target scale.
        """
        target = target_users or current_users * 2  # Default: plan for 2x growth

        recommendations = []

        for name, config in self.bottlenecks.items():
            # Find solutions needed between current and target
            for solution in config.get('solutions', []):
                if current_users < solution['users'] <= target:
                    recommendations.append({
                        'priority': self._calculate_priority(solution['users'], current_users, target),
                        'category': config['category'],
                        'bottleneck': config['name'],
                        'action': solution['action'],
                        'trigger_at': solution['users'],
                        'estimated_cost': self._get_cost_at(name, solution['users'])
                    })

        # Sort by priority
        recommendations.sort(key=lambda x: x['priority'], reverse=True)

        return {
            'current_users': current_users,
            'target_users': target,
            'recommendations': recommendations,
            'total_estimated_monthly_cost': sum(
                r.get('estimated_cost', 0) for r in recommendations[:5]
            )
        }

    def _calculate_priority(self, trigger_users, current, target):
        """Calculate priority score (0-100)"""
        if trigger_users <= current:
            return 100  # Already needed!
        if trigger_users <= current * 1.5:
            return 90  # Imminent
        if trigger_users <= target * 0.5:
            return 70  # Plan soon
        if trigger_users <= target:
            return 50  # On roadmap
        return 30  # Future

    def _get_cost_at(self, bottleneck_name, users):
        """Get estimated monthly cost at user level"""
        config = self.bottlenecks.get(bottleneck_name, {})
        cost_curve = config.get('cost_curve', [])

        for entry in reversed(cost_curve):
            if users >= entry['users']:
                return entry['monthly_cost']
        return 0

    def simulate_growth(self, current_users=0, target_users=1000,
                        growth_rate='linear', days=30):
        """
        Simulate growth scenario and predict bottlenecks.

        Args:
            current_users: Starting user count
            target_users: Target user count
            growth_rate: 'linear', 'exponential', or 'viral'
            days: Time period in days

        Returns:
            Timeline of predicted events
        """
        timeline = []

        # Calculate growth per day
        if growth_rate == 'linear':
            daily_growth = (target_users - current_users) / days
        elif growth_rate == 'exponential':
            if current_users > 0:
                daily_multiplier = (target_users / current_users) ** (1 / days)
            else:
                daily_multiplier = 1.1
        elif growth_rate == 'viral':
            # Viral: slow start, explosive middle, plateau
            pass  # More complex modeling needed

        users = current_users
        triggered_solutions = set()

        for day in range(days + 1):
            # Calculate users for this day
            if growth_rate == 'linear':
                users = current_users + (daily_growth * day)
            elif growth_rate == 'exponential':
                users = current_users * (daily_multiplier ** day)
            users = int(users)

            # Check for bottleneck triggers
            day_events = []
            for name, config in self.bottlenecks.items():
                estimated_load = self._estimate_load(name, users)

                # Check if we hit the bottleneck
                if estimated_load >= config['breaks_at'] * 0.8:
                    event_key = f"{name}_warning"
                    if event_key not in triggered_solutions:
                        triggered_solutions.add(event_key)
                        day_events.append({
                            'type': 'WARNING',
                            'bottleneck': config['name'],
                            'message': f'{config["name"]} at 80% capacity',
                            'symptoms': config['symptoms']
                        })

                if estimated_load >= config['breaks_at']:
                    event_key = f"{name}_critical"
                    if event_key not in triggered_solutions:
                        triggered_solutions.add(event_key)
                        day_events.append({
                            'type': 'CRITICAL',
                            'bottleneck': config['name'],
                            'message': f'{config["name"]} at capacity!',
                            'action_required': True
                        })

                # Check solution triggers
                for solution in config.get('solutions', []):
                    sol_key = f"{name}_{solution['users']}"
                    if users >= solution['users'] and sol_key not in triggered_solutions:
                        triggered_solutions.add(sol_key)
                        day_events.append({
                            'type': 'ACTION',
                            'action': solution['action'],
                            'bottleneck': config['name'],
                            'trigger_users': solution['users']
                        })

            if day_events:
                timeline.append({
                    'day': day,
                    'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                    'users': users,
                    'scale_level': self.get_scale_level(users).value,
                    'events': day_events
                })

        return {
            'scenario': {
                'start_users': current_users,
                'target_users': target_users,
                'growth_rate': growth_rate,
                'days': days
            },
            'timeline': timeline,
            'total_actions_needed': len([e for t in timeline for e in t['events'] if e['type'] == 'ACTION']),
            'critical_events': len([e for t in timeline for e in t['events'] if e['type'] == 'CRITICAL'])
        }

    def make_decision(self, scenario, context=None):
        """
        Make an automatic decision based on scenario.

        Returns the recommended action and reasoning.
        """
        decisions = {
            'high_load': {
                'condition': lambda c: c.get('load_pct', 0) > 80,
                'action': 'scale_up',
                'reasoning': 'Load exceeds 80% threshold'
            },
            'cost_spike': {
                'condition': lambda c: c.get('cost_increase_pct', 0) > 50,
                'action': 'review_optimization',
                'reasoning': 'Cost increased more than 50%'
            },
            'error_spike': {
                'condition': lambda c: c.get('error_rate', 0) > 0.05,
                'action': 'reduce_load',
                'reasoning': 'Error rate exceeds 5%'
            },
            'growth_spike': {
                'condition': lambda c: c.get('growth_rate', 0) > 2.0,
                'action': 'preemptive_scale',
                'reasoning': 'Growth rate indicates viral pattern'
            }
        }

        context = context or {}
        recommended_actions = []

        for name, decision in decisions.items():
            if decision['condition'](context):
                recommended_actions.append({
                    'scenario': name,
                    'action': decision['action'],
                    'reasoning': decision['reasoning'],
                    'timestamp': datetime.now().isoformat()
                })

        if recommended_actions:
            self.decisions_made.extend(recommended_actions)

        return recommended_actions

    def get_cost_projection(self, target_users):
        """Get estimated monthly costs at target user level"""
        costs = {}
        total = 0

        for name, config in self.bottlenecks.items():
            cost = self._get_cost_at(name, target_users)
            if cost > 0:
                costs[config['name']] = cost
                total += cost

        return {
            'target_users': target_users,
            'breakdown': costs,
            'total_monthly': total,
            'cost_per_user': total / target_users if target_users > 0 else 0
        }


# ============================================
# GLOBAL INSTANCE
# ============================================

_decision_tree = None

def get_decision_tree():
    global _decision_tree
    if _decision_tree is None:
        _decision_tree = ScaleDecisionTree()
    return _decision_tree


# ============================================
# TEST
# ============================================

if __name__ == '__main__':
    print("="*60)
    print("GAME THEORY DECISION TREE - Scale Planning")
    print("="*60)

    tree = get_decision_tree()

    # Analyze current state
    print("\n1. Current State Analysis (100 users):")
    analysis = tree.analyze_current_state(current_users=100)
    print(f"   Scale Level: {analysis['scale_level']}")
    print(f"   Health: {analysis['health']}")
    print(f"   Active Bottlenecks: {len(analysis['active_bottlenecks'])}")
    print(f"   Warnings: {len(analysis['warnings'])}")

    # Get recommendations
    print("\n2. Recommendations for 1,000 users:")
    recs = tree.get_recommendations(current_users=100, target_users=1000)
    for r in recs['recommendations'][:5]:
        print(f"   [{r['priority']}] {r['action']} (trigger: {r['trigger_at']} users)")

    # Simulate growth
    print("\n3. Growth Simulation (100 -> 1000 in 30 days):")
    sim = tree.simulate_growth(current_users=100, target_users=1000, days=30)
    print(f"   Actions Needed: {sim['total_actions_needed']}")
    print(f"   Critical Events: {sim['critical_events']}")

    if sim['timeline']:
        print("\n   Key Events:")
        for event in sim['timeline'][:5]:
            print(f"   Day {event['day']} ({event['users']} users):")
            for e in event['events']:
                print(f"     [{e['type']}] {e.get('action') or e.get('message')}")

    # Cost projection
    print("\n4. Cost Projection:")
    for target in [100, 1000, 10000]:
        costs = tree.get_cost_projection(target)
        print(f"   {target} users: ${costs['total_monthly']}/mo (${costs['cost_per_user']:.2f}/user)")

    print("\n" + "="*60)
    print("Decision Tree ready for deployment!")
    print("="*60)
