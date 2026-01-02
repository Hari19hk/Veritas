const hre = require("hardhat");

async function main() {
  const ProofOfExecution = await hre.ethers.getContractFactory("ProofOfExecution");
  const contract = await ProofOfExecution.deploy({
    gasLimit: 5_000_000,
  });
  
  await contract.waitForDeployment();

  console.log("Deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
