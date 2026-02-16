// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VoiceNFT Smart Contract
 * @dev NFT contract for voice cards with metadata and marketplace functionality
 * @author BARBRICKDESIGN Team
 */

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VoiceNFT is ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Voice Card metadata structure
    struct VoiceCard {
        uint256 tokenId;
        address creator;
        string voiceName;
        string voiceType;        // e.g., "narrator", "character", "celebrity"
        string voiceDescription;
        string audioIPFSHash;    // IPFS hash for audio sample
        string imageIPFSHash;    // IPFS hash for card image
        uint256 mintedAt;
        uint256 usageCount;
        bool isMarketplaceListed;
        uint256 price;
    }

    // Mapping from token ID to VoiceCard
    mapping(uint256 => VoiceCard) public voiceCards;

    // Mapping from creator to their voice cards
    mapping(address => uint256[]) public creatorVoiceCards;

    // Marketplace listings
    mapping(uint256 => bool) public marketplaceListing;
    mapping(uint256 => uint256) public listingPrices;

    // Usage tracking
    mapping(uint256 => address[]) public voiceCardUsers;
    mapping(uint256 => mapping(address => uint256)) public userUsageCount;

    // Events
    event VoiceCardMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string voiceName,
        string audioIPFSHash
    );
    event VoiceCardListed(uint256 indexed tokenId, uint256 price);
    event VoiceCardDelisted(uint256 indexed tokenId);
    event VoiceCardSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event VoiceCardUsed(uint256 indexed tokenId, address indexed user);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount);

    // Royalty percentage (basis points, e.g., 500 = 5%)
    uint256 public royaltyPercentage = 500; // 5%
    uint256 public constant MAX_ROYALTY = 1000; // 10%

    constructor() ERC721("VoiceNFT", "VOICE") Ownable(msg.sender) {}

    /**
     * @dev Mint a new voice NFT card
     */
    function mintVoiceCard(
        string memory voiceName,
        string memory voiceType,
        string memory voiceDescription,
        string memory audioIPFSHash,
        string memory imageIPFSHash,
        string memory tokenURI
    ) public nonReentrant returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        VoiceCard memory newCard = VoiceCard({
            tokenId: newTokenId,
            creator: msg.sender,
            voiceName: voiceName,
            voiceType: voiceType,
            voiceDescription: voiceDescription,
            audioIPFSHash: audioIPFSHash,
            imageIPFSHash: imageIPFSHash,
            mintedAt: block.timestamp,
            usageCount: 0,
            isMarketplaceListed: false,
            price: 0
        });

        voiceCards[newTokenId] = newCard;
        creatorVoiceCards[msg.sender].push(newTokenId);

        emit VoiceCardMinted(newTokenId, msg.sender, voiceName, audioIPFSHash);

        return newTokenId;
    }

    /**
     * @dev List voice card on marketplace
     */
    function listVoiceCard(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");

        voiceCards[tokenId].isMarketplaceListed = true;
        voiceCards[tokenId].price = price;
        marketplaceListing[tokenId] = true;
        listingPrices[tokenId] = price;

        emit VoiceCardListed(tokenId, price);
    }

    /**
     * @dev Delist voice card from marketplace
     */
    function delistVoiceCard(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");

        voiceCards[tokenId].isMarketplaceListed = false;
        voiceCards[tokenId].price = 0;
        marketplaceListing[tokenId] = false;
        listingPrices[tokenId] = 0;

        emit VoiceCardDelisted(tokenId);
    }

    /**
     * @dev Purchase voice card from marketplace
     */
    function purchaseVoiceCard(uint256 tokenId) public payable nonReentrant {
        require(marketplaceListing[tokenId], "Card not listed");
        require(msg.value >= listingPrices[tokenId], "Insufficient payment");

        address seller = ownerOf(tokenId);
        address creator = voiceCards[tokenId].creator;
        uint256 price = listingPrices[tokenId];

        // Calculate royalty
        uint256 royalty = (price * royaltyPercentage) / 10000;
        uint256 sellerAmount = price - royalty;

        // Transfer payment
        payable(seller).transfer(sellerAmount);
        if (creator != seller) {
            payable(creator).transfer(royalty);
            emit RoyaltyPaid(tokenId, creator, royalty);
        } else {
            payable(seller).transfer(royalty);
        }

        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);

        // Update listing status
        voiceCards[tokenId].isMarketplaceListed = false;
        voiceCards[tokenId].price = 0;
        marketplaceListing[tokenId] = false;
        listingPrices[tokenId] = 0;

        emit VoiceCardSold(tokenId, seller, msg.sender, price);
    }

    /**
     * @dev Record usage of a voice card
     */
    function recordVoiceCardUsage(uint256 tokenId) public {
        require(_exists(tokenId), "Voice card does not exist");

        voiceCards[tokenId].usageCount++;
        
        if (userUsageCount[tokenId][msg.sender] == 0) {
            voiceCardUsers[tokenId].push(msg.sender);
        }
        userUsageCount[tokenId][msg.sender]++;

        emit VoiceCardUsed(tokenId, msg.sender);
    }

    /**
     * @dev Get all voice cards by creator
     */
    function getVoiceCardsByCreator(address creator) public view returns (uint256[] memory) {
        return creatorVoiceCards[creator];
    }

    /**
     * @dev Get voice card details
     */
    function getVoiceCard(uint256 tokenId) public view returns (VoiceCard memory) {
        require(_exists(tokenId), "Voice card does not exist");
        return voiceCards[tokenId];
    }

    /**
     * @dev Get all listed voice cards
     */
    function getListedVoiceCards() public view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIds.current();
        uint256 listedCount = 0;

        // Count listed cards
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (marketplaceListing[i]) {
                listedCount++;
            }
        }

        // Create array of listed token IDs
        uint256[] memory listedCards = new uint256[](listedCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (marketplaceListing[i]) {
                listedCards[index] = i;
                index++;
            }
        }

        return listedCards;
    }

    /**
     * @dev Set royalty percentage (only owner)
     */
    function setRoyaltyPercentage(uint256 percentage) public onlyOwner {
        require(percentage <= MAX_ROYALTY, "Royalty too high");
        royaltyPercentage = percentage;
    }

    /**
     * @dev Get total voice cards minted
     */
    function getTotalMinted() public view returns (uint256) {
        return _tokenIds.current();
    }

    // Override required functions
    function _increaseBalance(address account, uint128 amount) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, amount);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
