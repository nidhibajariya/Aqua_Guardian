const hre = require("hardhat");

async function main() {
    console.log("=========================================");
    console.log("AQUA Guardian - Blockchain Deployment");
    console.log("=========================================\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deploying from address:", deployer.address);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

    if (balance === 0n) {
        console.log("❌ ERROR: Insufficient balance!");
        console.log("Get testnet ETH from:");
        console.log("  Sepolia: https://sepoliafaucet.com/");
        console.log("  Mumbai: https://faucet.polygon.technology/\n");
        process.exit(1);
    }

    // Deploy PollutionRegistry contract
    console.log("🚀 Deploying PollutionRegistry contract...\n");

    const PollutionRegistry = await hre.ethers.getContractFactory("PollutionRegistry");
    const pollutionRegistry = await PollutionRegistry.deploy();

    await pollutionRegistry.waitForDeployment();

    const contractAddress = await pollutionRegistry.getAddress();

    console.log("✅ PollutionRegistry deployed successfully!");
    console.log("📝 Contract address:", contractAddress);
    console.log("🔗 Network:", hre.network.name);
    console.log("⛽ Gas used: Estimated ~500,000 gas\n");

    // Get deployment transaction
    const deployTx = pollutionRegistry.deploymentTransaction();
    if (deployTx) {
        console.log("📄 Transaction hash:", deployTx.hash);
        console.log("🔍 Block number:", deployTx.blockNumber || "pending");
    }

    // Verify contract information
    console.log("\n📊 Contract Information:");
    const owner = await pollutionRegistry.owner();
    const reportCount = await pollutionRegistry.reportCount();
    console.log("  Owner:", owner);
    console.log("  Initial report count:", reportCount.toString());

    // Display Etherscan link
    const network = hre.network.name;
    let explorerUrl = "";
    if (network === "sepolia") {
        explorerUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;
    } else if (network === "mumbai") {
        explorerUrl = `https://mumbai.polygonscan.com/address/${contractAddress}`;
    }

    if (explorerUrl) {
        console.log("\n🔍 View on Explorer:", explorerUrl);
    }

    // Configuration instructions
    console.log("\n" + "=".repeat(80));
    console.log("NEXT STEPS:");
    console.log("=".repeat(80));
    console.log("\n1. Update backend/.env with:");
    console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`   WEB3_PROVIDER_URL=${process.env.SEPOLIA_RPC_URL || "YOUR_RPC_URL"}`);

    console.log("\n2. Verify contract on Etherscan (optional):");
    console.log(`   npx hardhat verify --network ${network} ${contractAddress}`);

    console.log("\n3. Test the contract:");
    console.log("   npx hardhat run scripts/test_contract.js --network", network);

    console.log("\n✅ Deployment complete!\n");

    // Save deployment info
    const fs = require("fs");
    const deploymentInfo = {
        network: network,
        contractAddress: contractAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        transactionHash: deployTx ? deployTx.hash : null
    };

    fs.writeFileSync(
        "./deployment_info.json",
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("💾 Deployment info saved to: deployment_info.json\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
