/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: deploy.js
 * Declaration ID: IP-3614B450-MLL28ZUJ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/** SIGNED BY MeRLynn - ID: MERLYNN-6ddcf62a - TIMESTAMP: 2025-12-19T05:53:06.511Z - HASH: 06e46661 */
/** SIGNED BY AGentR - ID: AGENTR-2ef34cb7 - TIMESTAMP: 2025-12-19T05:53:06.511Z - HASH: 06e46661 */

// BankSky VaultCoin Contract Deployment Script
// Deploys the VaultCoin ERC20 contract with self-healing features

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying VaultCoin contract...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy VaultCoin contract
  const VaultCoin = await ethers.getContractFactory("VaultCoin");

  // Initial relayer address (can be updated later)
  const initialRelayer = deployer.address; // Use deployer as initial relayer

  console.log("Deploying VaultCoin with relayer:", initialRelayer);
  const vaultCoin = await VaultCoin.deploy(initialRelayer);

  await vaultCoin.waitForDeployment();

  const contractAddress = await vaultCoin.getAddress();
  console.log("✅ VaultCoin deployed to:", contractAddress);

  // Verify contract on Etherscan (if on mainnet)
  if (network.name === "mainnet") {
    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [initialRelayer],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Contract verification failed:", error.message);
    }
  }

  // Initial setup
  console.log("Running initial setup...");

  // Mint initial supply to deployer
  const initialMint = ethers.parseUnits("1000000", 18); // 1M tokens
  await vaultCoin.mint(deployer.address, initialMint);
  console.log(`✅ Initial supply minted: ${ethers.formatUnits(initialMint, 18)} VAULT`);

  // Log deployment details
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: network.name,
    blockNumber: await deployer.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    initialSupply: ethers.formatUnits(initialMint, 18),
    relayer: initialRelayer
  };

  console.log("📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save deployment info
  const fs = require("fs");
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment-info.json");

  // Update BankSky.html with new contract address
  console.log("🔄 Updating BankSky.html configuration...");
  updateBankSkyConfig(contractAddress);

  console.log("🎉 VaultCoin deployment completed successfully!");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Explorer: https://etherscan.io/address/${contractAddress}`);
}

// Update BankSky.html with deployed contract address
function updateBankSkyConfig(contractAddress) {
  const fs = require("fs");
  const path = require("path");

  const bankSkyPath = path.join(__dirname, "..", "BankSky.html");

  if (!fs.existsSync(bankSkyPath)) {
    console.log("⚠️  BankSky.html not found, skipping config update");
    return;
  }

  let content = fs.readFileSync(bankSkyPath, "utf8");

  // Update contract address
  const addressRegex = /VAULTCOIN_ADDRESS:\s*['"`][^'"`]*['"`]/;
  content = content.replace(addressRegex, `VAULTCOIN_ADDRESS: '${contractAddress}'`);

  fs.writeFileSync(bankSkyPath, content);
  console.log("✅ BankSky.html updated with new contract address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
