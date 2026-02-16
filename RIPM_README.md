# ripM - Web3 Collectible Card Platform

## Overview

ripM is a production-ready Web3 collectible card platform that enables users to purchase themed card packs using PayPal or cryptocurrency, with real NFT minting to the blockchain.

## Features

### ✅ Real Functionality (No Simulations)

- **Real Wallet Integration**: Connect with MetaMask (Ethereum) or Phantom (Solana)
- **Real PayPal Payments**: Live PayPal SDK integration for fiat purchases
- **Real Crypto Payments**: Native ETH, SOL, and USDC token transfers
- **Real NFT Minting**: Cards are minted as actual NFTs on Ethereum or Solana
- **Real Blockchain Transactions**: All transactions are recorded on-chain
- **Transaction Verification**: Links to blockchain explorers (Etherscan, Solscan)

### Card Game Features

- **Themed Card Packs**: Rotating daily packs with unique themes and humor
- **Rarity System**: Common, Rare, Epic, and Legendary cards
- **Card Leveling**: Cards gain XP and level up through battles
- **Special Attributes**: Unique abilities like Holographic Shield, Phoenix Force, etc.
- **Card Battles**: Play cards against opponents to earn XP and level up
- **Burn Mechanism**: Cards can be burned after 3 losses (with special attribute protection)
- **Dynamic Card Images**: SVG-generated card artwork based on theme and rarity

### Pack System

- **4 Pack Tiers**: Budget, Standard, Premium, and Ultra
- **Daily Rotation**: New themed pack every 24 hours
- **Bonus Drops**: Chance for bonus cards from historical packs
- **Time-Limited Availability**: Packs available for 7 days before rotating

## Setup Instructions

### Prerequisites

1. **Web3 Wallet**
   - For Ethereum: [MetaMask](https://metamask.io/)
   - For Solana: [Phantom](https://phantom.app/)

2. **API Keys & Accounts**
   - PayPal Business Account & Developer Credentials
   - Alchemy or Infura account for Ethereum RPC
   - IPFS storage (Pinata, NFT.Storage, or Arweave)

3. **Smart Contracts**
   - Deployed ERC-721 NFT contract on Ethereum
   - Or Metaplex NFT program on Solana

### Configuration

1. **Copy the configuration template:**
   ```bash
   cp ripM-config.js ripM-config-production.js
   ```

2. **Edit `ripM-config-production.js` with your credentials:**
   ```javascript
   const RIPM_CONFIG = {
     paypal: {
       clientId: 'YOUR_PAYPAL_CLIENT_ID',
       payeeEmail: 'your-email@example.com',
       environment: 'production' // or 'sandbox' for testing
     },
     blockchain: {
       ethereum: {
         rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
         contractAddress: '0xYOUR_NFT_CONTRACT_ADDRESS',
         paymentAddress: '0xYOUR_PAYMENT_WALLET_ADDRESS'
       },
       solana: {
         rpcUrl: 'https://api.mainnet-beta.solana.com',
         paymentAddress: 'YOUR_SOLANA_WALLET_ADDRESS'
       }
     },
     storage: {
       provider: 'pinata',
       apiKey: 'YOUR_IPFS_API_KEY',
       apiSecret: 'YOUR_IPFS_API_SECRET'
     }
   };
   ```

3. **Update the PayPal SDK script tag in ripM.html:**
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD"></script>
   ```

### Testing

1. **Test Mode Setup:**
   - Use PayPal Sandbox for testing
   - Use Ethereum testnets (Goerli, Sepolia)
   - Use Solana devnet
   - Set `features.testMode: true` in config

2. **Test Credentials:**
   - Create test PayPal accounts in [PayPal Sandbox](https://developer.paypal.com/dashboard/)
   - Get testnet ETH from faucets
   - Get devnet SOL from Solana faucet

### Deployment

1. **Update configuration for production:**
   ```javascript
   features: {
     enableMinting: true,
     enableRealPayments: true,
     testMode: false,
     debug: false
   }
   ```

2. **Include config script in ripM.html:**
   ```html
   <script src="ripM-config-production.js"></script>
   ```

3. **Deploy to your web server or GitHub Pages**

4. **Security Notes:**
   - Never commit production config with real keys
   - Use environment variables for sensitive data
   - Add `ripM-config-production.js` to `.gitignore`

## How It Works

### Payment Flow

#### PayPal Payment:
1. User clicks "Rip Pack"
2. PayPal modal opens with payment details
3. User completes payment through PayPal
4. Order is captured and verified
5. NFTs are minted to user's wallet
6. Cards appear in inventory

#### Crypto Payment:
1. User selects crypto payment method (ETH, SOL, or USDC)
2. Connects wallet if not already connected
3. Clicks "Rip Pack"
4. Wallet prompts for transaction approval
5. Transaction is sent to blockchain
6. Transaction is confirmed
7. NFTs are minted
8. Cards appear in inventory

### NFT Minting Process

1. **Metadata Generation**: Card attributes, rarity, and image are compiled into JSON metadata
2. **IPFS Upload**: Metadata and images are uploaded to IPFS
3. **Blockchain Minting**: NFT is minted with metadata URI
4. **Transaction Confirmation**: Wait for blockchain confirmation
5. **Display**: Card appears in user's inventory with transaction hash

### Card Battle System

1. **Card Selection**: User clicks "Play" on a card in their inventory
2. **Power Calculation**: Card power = rarity + level + attributes + special bonuses
3. **Battle Resolution**: Player roll vs. Opponent roll
4. **Results**:
   - **Win**: Earn XP, possible level up, increased card value
   - **Loss**: Loss counter increases, risk of burn
5. **Special Attributes**: Various effects like shields, lucky charm, phoenix revival
6. **Burn Mechanism**: Cards with 3 losses are burned (removed) unless protected

## Themed Packs

### Available Themes:

1. **Doge Meme Madness** - OG crypto memes ($6.99)
2. **Boomer Nostalgia Pack** - Pre-internet relics ($4.99)
3. **Crypto Degen Chronicles** - Diamond-handed apes ($9.99)
4. **Corporate Cringe Collection** - Synergy and buzzwords ($5.99)
5. **Basement Dweller Legends** - Gaming culture ($4.99)
6. **Karen Manager Request** - Speak to the manager ($5.99)
7. **Gen Z Chaos Bundle** - No cap fr fr ($4.99)
8. **Legendary Dad Jokes** - Hi Hungry, I'm Dad ($3.99)

## API Reference

### Key Functions

#### Wallet Connection
```javascript
async connectWallet()
// Returns: { success: boolean, address: string }
```

#### Payment Processing
```javascript
async processPayment()
// Returns: { status, txHash, orderId, ... }
```

#### NFT Minting
```javascript
async mintNFT(card)
// Returns: { txHash, tokenId, network }
```

#### Pack Opening
```javascript
async ripPackAndMint()
// Returns: Array of card objects with minted NFTs
```

## Troubleshooting

### Common Issues

**Wallet Won't Connect:**
- Ensure MetaMask/Phantom is installed
- Check if wallet is locked
- Verify you're on the correct network
- Refresh the page

**Payment Fails:**
- Check PayPal account status
- Verify sufficient crypto balance
- Ensure correct network selected
- Check gas fees for crypto transactions

**NFT Minting Fails:**
- Verify contract address is correct
- Check if contract has minting enabled
- Ensure wallet has permission to mint
- Verify gas fees are sufficient

**Transaction Pending Forever:**
- Check blockchain explorer for transaction status
- Gas price may be too low
- Network congestion
- Try increasing gas limit

## Security Considerations

1. **Never share private keys or seed phrases**
2. **Verify contract addresses before transactions**
3. **Test on testnet first**
4. **Use hardware wallets for large amounts**
5. **Keep dependencies updated**
6. **Implement rate limiting**
7. **Validate all user inputs**
8. **Use secure RPC endpoints**

## Browser Support

- Chrome/Brave (recommended)
- Firefox
- Safari (limited Web3 support)
- Edge

## License

All rights reserved. See LICENSE file for details.

## Support

For issues or questions:
- GitHub Issues: [barbrickdesign/barbrickdesign.github.io](https://github.com/barbrickdesign/barbrickdesign.github.io/issues)
- Email: BarbrickDesign@gmail.com

## Changelog

### Version 1.0.0 (Current)
- ✅ Real PayPal integration
- ✅ Real Web3 wallet connection
- ✅ Real crypto payments (ETH, SOL, USDC)
- ✅ Real NFT minting
- ✅ Card leveling system
- ✅ Card battle mechanics
- ✅ Special attributes system
- ✅ Themed pack rotation
- ✅ Bonus drop system
- ✅ 3D card animations
- ✅ Blockchain explorer integration
- ❌ No demos
- ❌ No placeholders
- ❌ No simulations

## Roadmap

- [ ] Marketplace for trading cards
- [ ] Multiplayer battles
- [ ] Tournament system
- [ ] Card crafting/fusion
- [ ] Achievements and rewards
- [ ] Mobile app
- [ ] Additional blockchain support (Polygon, Arbitrum)
- [ ] Advanced card abilities
- [ ] Seasonal events
- [ ] Leaderboards
