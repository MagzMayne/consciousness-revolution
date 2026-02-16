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
