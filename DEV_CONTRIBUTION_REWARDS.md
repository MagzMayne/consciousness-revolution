# Developer Contribution Rewards System

## Overview

The r3Link protocol now includes a comprehensive developer contribution tracking and reward system that incentivizes building and contributing to the BarbrickDesign ecosystem. Developers earn points for every commit, pull request, issue, and code review they make to barbrickdesign projects.

## Features

### GitHub Integration
- **Automatic Tracking**: Sync your GitHub username to automatically track contributions
- **Real-time Updates**: Fetch latest contributions from GitHub's public events API
- **Organization-Scoped**: Only tracks contributions to barbrickdesign organization projects
- **Public Profile Required**: Works with public GitHub profiles and public contributions

### Point System

#### Development Actions
| Action | Points | Description |
|--------|--------|-------------|
| Commit | 15 pts | Every commit to a barbrickdesign project |
| PR Created | 50 pts | Creating a pull request |
| PR Merged | 150 pts | Getting a pull request merged |
| Issue Created | 20 pts | Opening an issue |
| Issue Resolved | 75 pts | Resolving an issue |
| Code Review | 40 pts | Reviewing a pull request |
| Repo Contribution | 200 pts | Contributing to a new project |

### Achievements

#### Developer Milestones
- 🔨 **First Commit** (50 pts) - Make your first commit to a project
- ⚡ **Commit Veteran** (200 pts) - Make 10 commits to projects
- 🚀 **First Pull Request** (100 pts) - Create your first PR
- ✅ **PR Accepted** (250 pts) - Get your first PR merged
- 🏆 **PR Master** (1000 pts) - Get 10 PRs merged
- 🔍 **Issue Hunter** (150 pts) - Create 5 issues
- 💡 **Problem Solver** (500 pts) - Resolve 5 issues
- 👁️ **Code Reviewer** (400 pts) - Review 10 PRs
- 🌟 **Ecosystem Builder** (800 pts) - Contribute to 3 different projects

## How to Use

### 1. Enter Your GitHub Username
Visit [r3link.html](https://barbrickdesign.github.io/r3link.html) and locate the "Dev Contributions" section in the sidebar.

### 2. Sync Your Contributions
1. Enter your GitHub username in the input field
2. Click "🔄 Sync GitHub" button
3. The system will fetch your recent public contributions
4. Points are automatically awarded for new contributions

### 3. Track Your Progress
The sidebar displays:
- Total commits
- PRs created and merged
- Issues created and resolved
- Code reviews completed
- Number of projects contributed to
- Last sync timestamp

### 4. Level Up & Earn Stake
Points contribute to your overall level progression:
- **Level 0 - Observer**: 0 pts (1% vault stake multiplier)
- **Level 1 - Contributor**: 50 pts (2% multiplier)
- **Level 2 - Builder**: 200 pts (5% multiplier)
- **Level 3 - Guardian**: 500 pts (10% multiplier)
- **Level 4 - Architect**: 1000 pts (20% multiplier)
- **Level 5 - Oracle**: 2500 pts (50% multiplier)

## Technical Implementation

### GitHub API Integration
The system uses the GitHub Events API to fetch public contributions:
- Endpoint: `https://api.github.com/users/{username}/events/public`
- Rate limiting: 1 second between API calls
- Filters for barbrickdesign organization projects

### Tracked Event Types
- `PushEvent` - Commits
- `PullRequestEvent` - PR creation and merging
- `IssuesEvent` - Issue creation and resolution
- `PullRequestReviewEvent` - Code reviews

### Data Storage
- **LocalStorage**: Quick access to player state
- **IndexedDB**: Persistent storage for contribution history
- **Server Sync**: Optional sync to backend (when authenticated)

### Privacy & Security
- Only public GitHub events are tracked
- No GitHub authentication required
- Username stored locally in browser
- Contributions sync on-demand (manual button click)

## API Reference

### JavaScript API

```javascript
// Access the gamification system
window.r3LinkGamification.syncGitHubContributions('your-username');

// Get current player state
const state = window.r3LinkGamification.getPlayerState();
console.log(state.devContributions);

// Access GitHub tracker directly
window.r3LinkAPI.github.fetchUserContributions('your-username');
```

### Player State Schema

```javascript
{
  githubUsername: "your-username",
  devContributions: {
    totalCommits: 0,
    totalPRsCreated: 0,
    totalPRsMerged: 0,
    totalIssuesCreated: 0,
    totalIssuesResolved: 0,
    totalCodeReviews: 0,
    projectsContributed: [],
    lastSynced: timestamp
  }
}
```

## Machine-Readable API

The contribution system is documented in `r3link-api.json`:

```json
{
  "gamification": {
    "dev_contribution_rewards": true,
    "github_integration": true,
    "point_actions": {
      "githubCommit": 15,
      "githubPRCreated": 50,
      "githubPRMerged": 150,
      "githubIssueCreated": 20,
      "githubIssueResolved": 75,
      "githubCodeReview": 40,
      "githubRepoContribution": 200
    },
    "dev_achievements": [...]
  }
}
```

## Future Enhancements

### Planned Features
- **Automatic Sync**: Background sync every 24 hours
- **Contribution Feed**: Real-time feed of recent contributions
- **Leaderboard**: Top contributors ranking
- **Project-Specific Rewards**: Bonus points for priority projects
- **Team Collaboration**: Track team contributions
- **OAuth Integration**: Secure GitHub authentication
- **Private Repo Support**: Track private contributions with auth

### Integration Opportunities
- Discord bot notifications for achievements
- Revenue sharing based on contribution score
- Governance voting power based on dev contributions
- NFT badges for milestone achievements

## Support & Contributing

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/barbrickdesign/barbrickdesign.github.io)
- Join the [Discord sanctuary](https://discord.gg/M4QZyPQq)
- Read the [full protocol documentation](https://barbrickdesign.github.io/r3link.html)

## License

This reward system is part of the r3Link protocol, following the same license as the repository (CC-BY-4.0 or more permissive).

---

**Remember**: The first and last question remains: *"What did you make?"*

Build. Contribute. Earn. 🔨
