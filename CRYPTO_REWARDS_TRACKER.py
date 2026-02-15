"""
CRYPTO_REWARDS_TRACKER.py - Solana Token Reward System

Tracks developer contributions and manages OVERKILL token rewards
on the Solana network for the Consciousness Revolution platform.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CryptoRewardsTracker:
    """Track and manage cryptocurrency rewards for platform contributions."""
    
    CONFIG_FILE = 'CRYPTO_CONFIG.json'
    REWARDS_LOG = 'crypto_rewards_log.json'
    
    def __init__(self):
        """Initialize the crypto rewards tracker."""
        self.config = self._load_config()
        self.rewards_log = self._load_rewards_log()
        
    def _load_config(self) -> Dict[str, Any]:
        """Load cryptocurrency configuration."""
        try:
            if os.path.exists(self.CONFIG_FILE):
                with open(self.CONFIG_FILE, 'r') as f:
                    return json.load(f)
            else:
                logger.warning(f"Config file {self.CONFIG_FILE} not found")
                return {}
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return {}
    
    def _load_rewards_log(self) -> List[Dict[str, Any]]:
        """Load existing rewards log."""
        try:
            if os.path.exists(self.REWARDS_LOG):
                with open(self.REWARDS_LOG, 'r') as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Error loading rewards log: {e}")
            return []
    
    def _save_rewards_log(self):
        """Save rewards log to file."""
        try:
            with open(self.REWARDS_LOG, 'w') as f:
                json.dump(self.rewards_log, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving rewards log: {e}")
    
    def get_reward_amount(self, contribution_type: str) -> int:
        """Get reward amount for contribution type."""
        reward_amounts = self.config.get('rewardAmounts', {})
        return reward_amounts.get(contribution_type, 0)
    
    def record_contribution(
        self,
        contributor: str,
        contribution_type: str,
        description: str,
        github_pr: Optional[str] = None,
        wallet_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Record a contribution and calculate reward.
        
        Args:
            contributor: GitHub username or contributor name
            contribution_type: Type of contribution (e.g., 'bug_fix_medium')
            description: Description of the contribution
            github_pr: GitHub PR URL (optional)
            wallet_address: Solana wallet address for payment (optional)
            
        Returns:
            Dictionary with contribution details and reward amount
        """
        reward_amount = self.get_reward_amount(contribution_type)
        
        contribution = {
            'id': len(self.rewards_log) + 1,
            'timestamp': datetime.now().isoformat(),
            'contributor': contributor,
            'contribution_type': contribution_type,
            'description': description,
            'reward_amount': reward_amount,
            'token': self.config.get('token', {}).get('symbol', 'OVERKILL'),
            'github_pr': github_pr,
            'wallet_address': wallet_address,
            'status': 'pending',
            'network': self.config.get('network', 'solana')
        }
        
        self.rewards_log.append(contribution)
        self._save_rewards_log()
        
        logger.info(
            f"Recorded contribution: {contributor} - {contribution_type} "
            f"- {reward_amount} tokens"
        )
        
        return contribution
    
    def mark_reward_paid(self, contribution_id: int, transaction_hash: str) -> bool:
        """
        Mark a reward as paid.
        
        Args:
            contribution_id: ID of the contribution
            transaction_hash: Solana transaction hash
            
        Returns:
            True if successful, False otherwise
        """
        for contribution in self.rewards_log:
            if contribution.get('id') == contribution_id:
                contribution['status'] = 'paid'
                contribution['transaction_hash'] = transaction_hash
                contribution['paid_at'] = datetime.now().isoformat()
                self._save_rewards_log()
                logger.info(f"Marked contribution {contribution_id} as paid")
                return True
        
        logger.warning(f"Contribution {contribution_id} not found")
        return False
    
    def get_pending_rewards(self) -> List[Dict[str, Any]]:
        """Get all pending reward contributions."""
        return [
            c for c in self.rewards_log 
            if c.get('status') == 'pending'
        ]
    
    def get_contributor_stats(self, contributor: str) -> Dict[str, Any]:
        """
        Get statistics for a specific contributor.
        
        Args:
            contributor: GitHub username or contributor name
            
        Returns:
            Dictionary with contributor statistics
        """
        contributions = [
            c for c in self.rewards_log 
            if c.get('contributor') == contributor
        ]
        
        total_earned = sum(c.get('reward_amount', 0) for c in contributions)
        paid_amount = sum(
            c.get('reward_amount', 0) for c in contributions 
            if c.get('status') == 'paid'
        )
        pending_amount = sum(
            c.get('reward_amount', 0) for c in contributions 
            if c.get('status') == 'pending'
        )
        
        return {
            'contributor': contributor,
            'total_contributions': len(contributions),
            'total_earned': total_earned,
            'paid_amount': paid_amount,
            'pending_amount': pending_amount,
            'token': self.config.get('token', {}).get('symbol', 'OVERKILL'),
            'contributions': contributions
        }
    
    def get_all_stats(self) -> Dict[str, Any]:
        """Get overall platform statistics."""
        total_rewards = sum(c.get('reward_amount', 0) for c in self.rewards_log)
        paid_rewards = sum(
            c.get('reward_amount', 0) for c in self.rewards_log 
            if c.get('status') == 'paid'
        )
        pending_rewards = sum(
            c.get('reward_amount', 0) for c in self.rewards_log 
            if c.get('status') == 'pending'
        )
        
        contributors = set(c.get('contributor') for c in self.rewards_log)
        
        return {
            'total_contributions': len(self.rewards_log),
            'total_rewards': total_rewards,
            'paid_rewards': paid_rewards,
            'pending_rewards': pending_rewards,
            'unique_contributors': len(contributors),
            'token': self.config.get('token', {}).get('symbol', 'OVERKILL'),
            'network': self.config.get('network', 'solana')
        }
    
    def export_report(self, filename: str = 'crypto_rewards_report.json'):
        """Export comprehensive rewards report."""
        report = {
            'generated_at': datetime.now().isoformat(),
            'overall_stats': self.get_all_stats(),
            'pending_rewards': self.get_pending_rewards(),
            'all_contributions': self.rewards_log,
            'token_info': self.config.get('token', {}),
            'network': self.config.get('network', 'solana')
        }
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Report exported to {filename}")
        return report


def main():
    """Example usage of CryptoRewardsTracker."""
    tracker = CryptoRewardsTracker()
    
    # Example: Record a contribution
    contribution = tracker.record_contribution(
        contributor='example_dev',
        contribution_type='bug_fix_medium',
        description='Fixed authentication bug in ARAYA system',
        github_pr='https://github.com/overkor-tek/consciousness-revolution/pull/123',
        wallet_address='ExampleSolanaWalletAddress123...'
    )
    
    print(f"Contribution recorded: {json.dumps(contribution, indent=2)}")
    
    # Get stats
    stats = tracker.get_all_stats()
    print(f"\nOverall stats: {json.dumps(stats, indent=2)}")
    
    # Get pending rewards
    pending = tracker.get_pending_rewards()
    print(f"\nPending rewards: {len(pending)}")
    
    # Export report
    tracker.export_report()


if __name__ == '__main__':
    main()
