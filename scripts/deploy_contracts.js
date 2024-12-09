const hre = require("hardhat");

async function main() {
  const Election = await hre.ethers.getContractFactory("Election");
  const election = await Election.deploy();

  console.log("Deploying contract...");
  // Aspetta il completamento della transazione di deploy
  const receipt = await election.deploymentTransaction().wait();

  console.log("Election contract deployed to:", receipt.contractAddress);

  const candidate = await election.candidate();  // Assicurati che la funzione sia pubblica
  console.log("Candidate:", candidate);  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
