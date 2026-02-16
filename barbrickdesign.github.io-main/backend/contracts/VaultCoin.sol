// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VaultCoin
 * @dev ERC20 token for BankSky vault system
 * Features: Trust-based minting, time-locked rewards, governance integration
 */
contract VaultCoin is ERC20, Ownable, ReentrancyGuard {
    // Events
    event TrustMint(address indexed to, uint256 amount, uint256 trustScore);
    event RewardClaimed(address indexed user, uint256 amount);
    event RelayerUpdated(address indexed oldRelayer, address indexed newRelayer);

    // State variables
    mapping(address => uint256) public trustScores;
    mapping(address => uint256) public lastActivity;
    mapping(address => uint256) public pendingRewards;

    address public relayer; // Authorized relayer for meta-transactions
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    uint256 public constant MINT_COOLDOWN = 24 hours;
    uint256 public constant REWARD_RATE = 10; // 10 tokens per trust point per day

    // Trust score requirements
    uint256 public constant MIN_TRUST_MINT = 50; // Minimum trust score to mint
    uint256 public constant MAX_DAILY_MINT = 1000 * 10**18; // Max mint per day per user

    mapping(address => uint256) public dailyMintAmount;
    mapping(address => uint256) public lastMintTime;

    constructor(address _relayer) ERC20("VaultCoin", "VAULT") {
        relayer = _relayer;
        _mint(msg.sender, 1000000 * 10**18); // Initial supply to deployer
    }

    // Modifiers
    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can call this function");
        _;
    }

    modifier validTrustScore(uint256 score) {
        require(score >= 0 && score <= 100, "Invalid trust score");
        _;
    }

    // External functions

    /**
     * @dev Mint tokens based on trust score (only relayer)
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     * @param trustScore User's trust score (0-100)
     */
    function mint(address to, uint256 amount)
        external
        onlyRelayer
        nonReentrant
    {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");

        // Update trust score and activity
        uint256 currentTrust = trustScores[to];
        trustScores[to] = (currentTrust + trustScore) / 2; // Average with existing
        lastActivity[to] = block.timestamp;

        // Check daily mint limit
        if (block.timestamp - lastMintTime[to] >= 1 days) {
            dailyMintAmount[to] = 0;
        }
        require(dailyMintAmount[to] + amount <= MAX_DAILY_MINT, "Exceeds daily mint limit");

        // Update daily mint tracking
        dailyMintAmount[to] += amount;
        lastMintTime[to] = block.timestamp;

        // Mint tokens
        _mint(to, amount);

        emit TrustMint(to, amount, trustScore);
    }

    /**
     * @dev Claim accumulated rewards based on trust score
     */
    function claimRewards() external nonReentrant {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards available");

        // Reset activity timestamp to prevent double claiming
        lastActivity[msg.sender] = block.timestamp;
        pendingRewards[msg.sender] = 0;

        _mint(msg.sender, rewards);

        emit RewardClaimed(msg.sender, rewards);
    }

    /**
     * @dev Calculate available rewards for an address
     * @param user Address to calculate rewards for
     */
    function calculateRewards(address user) public view returns (uint256) {
        if (lastActivity[user] == 0) return 0;

        uint256 timeSinceActivity = block.timestamp - lastActivity[user];
        uint256 daysSinceActivity = timeSinceActivity / 1 days;

        uint256 trustMultiplier = trustScores[user] * REWARD_RATE;
        uint256 rewards = daysSinceActivity * trustMultiplier * 10**18;

        // Cap rewards to prevent abuse
        uint256 maxRewards = trustScores[user] * 100 * 10**18; // 100 tokens per trust point max
        return rewards > maxRewards ? maxRewards : rewards;
    }

    /**
     * @dev Update trust score (only relayer)
     * @param user Address to update
     * @param newScore New trust score
     */
    function updateTrustScore(address user, uint256 newScore)
        external
        onlyRelayer
        validTrustScore(newScore)
    {
        trustScores[user] = newScore;
        lastActivity[user] = block.timestamp;
    }

    /**
     * @dev Update relayer address (only owner)
     * @param newRelayer New relayer address
     */
    function updateRelayer(address newRelayer) external onlyOwner {
        require(newRelayer != address(0), "Invalid relayer address");
        address oldRelayer = relayer;
        relayer = newRelayer;

        emit RelayerUpdated(oldRelayer, newRelayer);
    }

    // View functions

    /**
     * @dev Get trust score for an address
     */
    function getTrustScore(address user) external view returns (uint256) {
        return trustScores[user];
    }

    /**
     * @dev Get user info (trust score, last activity, pending rewards)
     */
    function getUserInfo(address user) external view returns (
        uint256 trustScore,
        uint256 lastActivityTime,
        uint256 availableRewards,
        uint256 dailyMinted
    ) {
        return (
            trustScores[user],
            lastActivity[user],
            calculateRewards(user),
            dailyMintAmount[user]
        );
    }

    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalSupply_,
        uint256 maxSupply,
        uint256 circulatingSupply,
        address relayer_
    ) {
        return (
            totalSupply(),
            MAX_SUPPLY,
            totalSupply(), // Simplified - all supply is circulating
            relayer
        );
    }

    // Emergency functions

    /**
     * @dev Emergency pause (only owner)
     */
    function emergencyPause() external onlyOwner {
        // Implementation would pause minting/rewards
        // For now, just log the emergency
        emit EmergencyPaused(msg.sender, block.timestamp);
    }

    event EmergencyPaused(address indexed by, uint256 timestamp);
}
