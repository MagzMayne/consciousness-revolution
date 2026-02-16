# Voice NFT 3D Card Generator

## Overview

The Voice NFT 3D Card Generator is a decentralized application (dApp) that enables voice actors, celebrities, content creators, and anyone with a unique voice to mint their voice as an NFT on the blockchain. This revolutionary platform allows users to retain value from their voice across Web3 platforms and creates a transparent marketplace for voice licensing and usage.

## Key Features

### 🎨 Voice NFT Creation
- **Easy Minting**: Upload voice samples and mint them as NFTs with just a few clicks
- **3D Card Visualization**: Each voice NFT is represented as an interactive 3D card powered by Three.js
- **Rich Metadata**: Store voice characteristics, type, description, and use cases on-chain
- **IPFS Storage**: Audio files and card images are stored on IPFS for decentralized access

### 💎 NFT Collection Management
- **My Collection**: View all your voice NFTs in one place
- **Usage Tracking**: Monitor how many times your voice cards have been used
- **Portfolio View**: See statistics and earnings from your voice NFTs
- **Interactive 3D Gallery**: Browse your collection with beautiful 3D card animations

### 🏪 Decentralized Marketplace
- **Buy & Sell**: Trade voice NFTs with other creators
- **Smart Royalties**: Creators earn royalties on secondary sales (5% default)
- **Filter & Search**: Find voice NFTs by type (narrator, character, celebrity, etc.)
- **Transparent Pricing**: All transactions logged on-chain for transparency

### 📊 Analytics & Usage Stats
- **Usage Tracking**: Track how your voice is being used across platforms
- **Value Retention**: Earn from every use of your voice NFT
- **Performance Metrics**: View statistics on your voice NFT portfolio
- **Revenue Dashboard**: Monitor earnings from sales and royalties

## Technology Stack

### Frontend
- **HTML5/CSS3**: Modern, responsive UI design
- **JavaScript (ES6+)**: Interactive functionality
- **Three.js**: 3D card visualization and animations
- **Web Audio API**: Audio visualization and playback

### Blockchain Integration
- **Web3.js**: Ethereum blockchain interaction
- **Solana Web3.js**: Solana blockchain support
- **Smart Contracts**: ERC-721 compliant NFT contract
- **MetaMask**: Wallet connection and transaction signing

### Storage
- **IPFS**: Decentralized storage for audio files and images
- **LocalStorage**: Demo mode for testing without blockchain

### Smart Contract
- **Solidity 0.8.19**: Voice NFT smart contract
- **OpenZeppelin**: Battle-tested NFT standards (ERC721)
- **Royalty System**: Built-in creator royalties
- **Marketplace Functions**: List, delist, and purchase voice NFTs

## Smart Contract Features

The `VoiceNFT.sol` contract includes:

1. **Minting**: Create new voice NFTs with metadata
2. **Enumeration**: Track all voice NFTs by creator
3. **Marketplace**: Built-in listing and trading functionality
4. **Royalties**: Automatic creator royalties on secondary sales
5. **Usage Tracking**: Record when voice NFTs are used in projects
6. **Security**: ReentrancyGuard and Ownable from OpenZeppelin

## Use Cases

### For Voice Actors
- Mint your signature voices as NFTs
- License your voice for use in games, videos, and apps
- Earn royalties every time someone uses your voice
- Build a portfolio of voice work

### For Content Creators
- Access a library of licensed voice NFTs
- Use voice cards in your projects with proper attribution
- Purchase unique character voices for your content
- Support voice actors directly

### For Celebrities
- Protect and monetize your voice likeness
- Approve usage through blockchain-based licensing
- Track unauthorized usage
- Create exclusive voice content for fans

### For Platforms
- Integrate voice NFTs into games and apps
- Provide creators with licensed voice options
- Build transparent attribution systems
- Enable new monetization models

## Getting Started

### Prerequisites
- Web3 wallet (MetaMask, Trust Wallet, etc.)
- Cryptocurrency for gas fees (ETH for Ethereum, SOL for Solana)
- Audio file of your voice (MP3, WAV, or OGG format)

### Steps to Create Your First Voice NFT

1. **Connect Wallet**
   - Click "Connect Wallet" in the top right
   - Approve the connection in your wallet

2. **Upload Voice Sample**
   - Navigate to "Create Voice NFT" tab
   - Enter voice name and description
   - Select voice type
   - Upload your audio file
   - (Optional) Upload custom card image

3. **Preview 3D Card**
   - View your voice card in 3D
   - Interact with the card using your mouse
   - Preview audio visualization

4. **Mint NFT**
   - Click "Mint Voice NFT"
   - Approve IPFS upload
   - Sign blockchain transaction
   - Wait for confirmation

5. **View in Collection**
   - Navigate to "My Collection" tab
   - See your newly minted voice NFT
   - List it on the marketplace or use it in projects

## Marketplace Usage

### Listing Your Voice NFT
1. Go to "My Collection"
2. Click on the voice card you want to sell
3. Click "List" button
4. Set your price
5. Confirm transaction

### Purchasing Voice NFTs
1. Browse "Marketplace" tab
2. Filter by voice type
3. Click on a voice card to view details
4. Click "Purchase" button
5. Confirm payment transaction

## Smart Contract Deployment

To deploy the VoiceNFT contract:

```bash
# Install dependencies
npm install @openzeppelin/contracts

# Compile contract
npx hardhat compile

# Deploy to network
npx hardhat run scripts/deploy.js --network <network-name>

# Verify on block explorer
npx hardhat verify --network <network-name> <contract-address>
```

## Configuration

Update the contract address in `voiceNFT3DCards.js`:

```javascript
const CONTRACT_ADDRESS = "0xYourContractAddressHere";
```

## API Reference

### Smart Contract Functions

#### Minting
```solidity
function mintVoiceCard(
    string memory voiceName,
    string memory voiceType,
    string memory voiceDescription,
    string memory audioIPFSHash,
    string memory imageIPFSHash,
    string memory tokenURI
) public returns (uint256)
```

#### Marketplace
```solidity
function listVoiceCard(uint256 tokenId, uint256 price) public
function delistVoiceCard(uint256 tokenId) public
function purchaseVoiceCard(uint256 tokenId) public payable
```

#### Queries
```solidity
function getVoiceCard(uint256 tokenId) public view returns (VoiceCard memory)
function getVoiceCardsByCreator(address creator) public view returns (uint256[] memory)
function getListedVoiceCards() public view returns (uint256[] memory)
```

## Voice Types Supported

- **Narrator**: Documentary, audiobook, podcast narration
- **Character**: Cartoon, anime, game character voices
- **Celebrity**: Celebrity impressions and likeness
- **Original**: Unique original character voices
- **AI-Generated**: AI-assisted voice synthesis
- **Voice Actor**: Professional voice acting work

## Security Considerations

- Smart contract uses OpenZeppelin's audited contracts
- ReentrancyGuard prevents reentrancy attacks
- Ownership controls for administrative functions
- IPFS ensures decentralized content storage
- All transactions are transparent and verifiable on-chain

## Future Enhancements

- [ ] Multi-chain support (Polygon, Arbitrum, etc.)
- [ ] AI voice generation integration
- [ ] Voice cloning protection mechanisms
- [ ] Batch minting for voice collections
- [ ] Advanced royalty splitting
- [ ] DAO governance for marketplace rules
- [ ] Integration with major content platforms
- [ ] Voice authentication and verification
- [ ] License term customization
- [ ] Voice NFT bundles and collections

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

MIT License - See LICENSE file for details

## Support

For support, please:
- Open an issue on GitHub
- Join our Discord community
- Email: support@barbrickdesign.com

## Credits

Built with ❤️ by BARBRICKDESIGN

Powered by:
- Three.js for 3D visualization
- OpenZeppelin for secure smart contracts
- IPFS for decentralized storage
- Web3.js for blockchain integration

---

**🎤 Empowering voice creators in the Web3 era**

Transform your voice into a valuable digital asset. Create, collect, and trade voice NFTs in a transparent, decentralized marketplace.
