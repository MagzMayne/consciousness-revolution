# ripM Deployment Guide

This guide will walk you through setting up ripM with real PayPal, Web3 wallets, and blockchain integration.

## Quick Start (5 Minutes)

### 1. Get PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a new app or select existing
3. Copy your **Client ID**
4. For testing, switch to **Sandbox** mode

### 2. Get Ethereum RPC Endpoint

1. Sign up at [Alchemy](https://www.alchemy.com/) (free tier available)
2. Create a new app (Ethereum Mainnet or Goerli testnet)
3. Copy your **API Key** and **HTTP URL**

### 3. Deploy NFT Contract (Optional)

If you want real NFT minting, you'll need to deploy a contract:

**Option A: Use OpenZeppelin Wizard**
1. Go to [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/)
2. Select ERC-721
3. Add Mintable feature
4. Copy the contract code
5. Deploy using [Remix](https://remix.ethereum.org/)

**Option B: Use Pre-deployed Contract**
- For testing, you can use a test contract address
- Update `CONFIG.blockchain.ethereum.contractAddress` in ripM.html

### 4. Configure ripM

Edit the CONFIG object in ripM.html (around line 1976):

```javascript
const CONFIG = {
  paypal: {
    clientId: 'YOUR_ACTUAL_PAYPAL_CLIENT_ID',
    payeeEmail: 'your-paypal@email.com'
  },
  blockchain: {
    networks: {
      ethereum: {
        chainId: '0x5', // Goerli testnet for testing
        rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/YOUR_KEY',
        contractAddress: '0xYOUR_CONTRACT_ADDRESS',
        paymentAddress: '0xYOUR_WALLET_ADDRESS'
      }
    }
  }
};
```

### 5. Update PayPal SDK Script

In ripM.html (around line 1970), update the client-id:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID&currency=USD"></script>
```

### 6. Test It!

1. Open ripM.html in a browser
2. Install MetaMask if not already installed
3. Click "Connect wallet" 
4. Try purchasing a pack with PayPal (sandbox)
5. Try with crypto (make sure you're on testnet!)

## Detailed Setup

### PayPal Setup

#### Creating a PayPal Business Account

1. Go to [PayPal Business](https://www.paypal.com/business)
2. Click "Sign Up" for a business account
3. Complete the registration process
4. Verify your email and add bank account

#### Getting PayPal API Credentials

1. Log in to [PayPal Developer Portal](https://developer.paypal.com/)
2. Navigate to "Dashboard"
3. Click "My Apps & Credentials"
4. Under "REST API apps", click "Create App"
5. Give your app a name (e.g., "ripM Card Platform")
6. Click "Create App"
7. You'll see your **Client ID** and **Secret**
8. For live mode, toggle from Sandbox to Live

#### Testing with PayPal Sandbox

1. In Developer Dashboard, go to "Sandbox" → "Accounts"
2. Create test buyer and seller accounts
3. Use these credentials to test payments
4. Sandbox transactions don't use real money

### Ethereum/Web3 Setup

#### Getting an Alchemy Account

1. Sign up at [Alchemy](https://www.alchemy.com/)
2. Click "Create App"
3. Choose:
   - **Chain**: Ethereum
   - **Network**: Goerli (for testing) or Mainnet (for production)
4. Copy your **API Key** and **HTTPS endpoint**

Alternative RPC providers:
- [Infura](https://infura.io/)
- [QuickNode](https://www.quicknode.com/)
- [Ankr](https://www.ankr.com/)

#### Deploying an NFT Contract

**Using Remix IDE:**

1. Go to [Remix Ethereum IDE](https://remix.ethereum.org/)
2. Create a new file: `RipMNFT.sol`
3. Paste this contract code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RipMNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("ripM Cards", "RIPM") {}

    function mint(address recipient, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}
```

4. Compile the contract (Solidity 0.8.0+)
5. Connect MetaMask to Remix
6. Deploy the contract (make sure you're on testnet!)
7. Copy the contract address

**Using Hardhat (Advanced):**

```bash
npm install --save-dev hardhat @openzeppelin/contracts
npx hardhat init
# Follow prompts to create a project
# Write deployment script
npx hardhat run scripts/deploy.js --network goerli
```

### Solana Setup

#### Getting a Solana Wallet

1. Install [Phantom Wallet](https://phantom.app/)
2. Create a new wallet
3. **Save your seed phrase securely!**
4. Switch to Devnet for testing (Settings → Developer Settings → Change Network)

#### Getting Testnet SOL

1. Visit [Solana Faucet](https://solfaucet.com/)
2. Enter your wallet address
3. Request devnet SOL (free)

#### Setting Up Metaplex for NFTs

For Solana NFT minting, you'll typically use Metaplex:

```bash
npm install @metaplex-foundation/js @solana/web3.js
```

The ripM.html already includes basic Solana Web3.js integration.

### IPFS/Metadata Storage Setup

#### Using Pinata (Recommended)

1. Sign up at [Pinata](https://www.pinata.cloud/)
2. Go to API Keys
3. Create a new key with pinning permissions
4. Copy **API Key** and **API Secret**
5. Use their SDK or API to upload metadata

#### Using NFT.Storage (Free)

1. Sign up at [NFT.Storage](https://nft.storage/)
2. Create an API key
3. Upload files using their SDK:

```javascript
import { NFTStorage } from 'nft.storage'
const client = new NFTStorage({ token: 'YOUR_API_KEY' })
```

## Environment-Specific Configuration

### Development Environment

```javascript
const CONFIG = {
  paypal: {
    environment: 'sandbox',
    clientId: 'SANDBOX_CLIENT_ID'
  },
  blockchain: {
    networks: {
      ethereum: {
        chainId: '0x5', // Goerli
        rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/KEY'
      }
    }
  },
  features: {
    testMode: true,
    debug: true
  }
};
```

### Production Environment

```javascript
const CONFIG = {
  paypal: {
    environment: 'production',
    clientId: 'LIVE_CLIENT_ID'
  },
  blockchain: {
    networks: {
      ethereum: {
        chainId: '0x1', // Mainnet
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/KEY'
      }
    }
  },
  features: {
    testMode: false,
    debug: false
  }
};
```

## Security Best Practices

### Never Commit Secrets

Add to `.gitignore`:
```
ripM-config-production.js
.env
*.key
*.pem
```

### Use Environment Variables

For server-side deployments:

```javascript
const CONFIG = {
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    payeeEmail: process.env.PAYPAL_EMAIL
  },
  blockchain: {
    networks: {
      ethereum: {
        rpcUrl: process.env.ALCHEMY_URL
      }
    }
  }
};
```

### Validate All Inputs

The ripM.html includes input validation, but always:
- Verify payment amounts match expected values
- Validate wallet addresses
- Check transaction status before minting
- Implement rate limiting

### Use HTTPS

Always deploy on HTTPS to protect:
- Wallet connections
- API keys in transit
- User data

## Testing Checklist

### Before Going Live:

- [ ] Test PayPal sandbox payments
- [ ] Test MetaMask connection on testnet
- [ ] Test Phantom connection on devnet
- [ ] Test ETH payment on testnet
- [ ] Test SOL payment on devnet
- [ ] Test USDC payment on testnet
- [ ] Verify NFTs appear in wallet
- [ ] Test blockchain explorer links
- [ ] Test card battles and leveling
- [ ] Test special attributes
- [ ] Test burn mechanism
- [ ] Verify metadata uploads to IPFS
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Load test with multiple users
- [ ] Security audit of smart contracts

## Troubleshooting

### "PayPal SDK not loaded"

Check that the PayPal script is loading:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_ID&currency=USD"></script>
```

Load before the main script.

### "No Web3 wallet detected"

User needs to:
1. Install MetaMask or Phantom
2. Refresh the page
3. Unlock the wallet

### "Transaction failed"

Common causes:
- Insufficient gas fees
- Wrong network selected
- Contract not deployed
- Insufficient balance

Check:
```javascript
console.log('Connected network:', await web3Provider.eth.getChainId());
console.log('Balance:', await web3Provider.eth.getBalance(walletAddress));
```

### "NFT not appearing in wallet"

1. Check if transaction was confirmed on blockchain explorer
2. Verify contract address is correct
3. Try importing the token manually in wallet
4. Check if metadata URI is accessible

## Support Resources

- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [MetaMask Docs](https://docs.metamask.io/)
- [Phantom Docs](https://docs.phantom.app/)
- [Ethers.js Docs](https://docs.ethers.io/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)

## Getting Help

If you encounter issues:

1. Check browser console for errors
2. Verify all API keys are correct
3. Test on testnet first
4. Check blockchain explorer for transaction details
5. Review the RIPM_README.md for detailed documentation

## Next Steps

After successful setup:

1. **Customize Packs**: Edit the THEMED_PACKS array to create your own themes
2. **Adjust Pricing**: Modify PACK_TIERS to set your own prices
3. **Add More Blockchains**: Extend support for Polygon, Arbitrum, etc.
4. **Build Marketplace**: Create a secondary market for card trading
5. **Add Tournaments**: Implement competitive battle modes
6. **Mobile App**: Wrap in Capacitor or React Native

## Production Deployment

### Option 1: GitHub Pages (Static)

1. Push ripM.html to your repository
2. Enable GitHub Pages in repository settings
3. Access at `https://yourusername.github.io/ripM.html`

### Option 2: Netlify (Recommended)

1. Sign up at [Netlify](https://www.netlify.com/)
2. Connect your GitHub repository
3. Set environment variables in Netlify dashboard
4. Deploy automatically on push

### Option 3: Vercel

1. Sign up at [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Configure environment variables
4. Deploy with one click

### Option 4: Custom Server

Requirements:
- HTTPS enabled
- Node.js (if using server-side logic)
- Reverse proxy (nginx/Apache)

Example nginx config:
```nginx
server {
    listen 443 ssl;
    server_name ripm.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        root /var/www/ripM;
        index ripM.html;
    }
}
```

## Monitoring & Analytics

Consider adding:

- [Google Analytics](https://analytics.google.com/) for user tracking
- [Sentry](https://sentry.io/) for error tracking
- Custom logging for payment events
- Blockchain transaction monitoring

## Legal Considerations

Before going live:

1. **Terms of Service**: Create clear terms
2. **Privacy Policy**: GDPR/CCPA compliance
3. **Payment Processing**: Follow PayPal's acceptable use policy
4. **NFT Regulations**: Check local laws regarding digital assets
5. **Tax Implications**: Consult with accountant about cryptocurrency transactions

---

**Ready to launch? Remember to:**
- Start with testnet/sandbox
- Test thoroughly
- Keep backups of private keys
- Monitor transactions
- Have customer support ready

Good luck! 🚀
