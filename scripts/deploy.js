const hre = require("hardhat");
const fs = require("fs");  // Aggiungi questa riga per importare il modulo fs
const crypto = require("crypto");

async function main() {
  const Election = await hre.ethers.getContractFactory("Election");
  const election = await Election.deploy();

  console.log("Deploying contract...");
  // Aspetta il completamento della transazione di deploy
  const receipt = await election.deploymentTransaction().wait();

  // Indirizzo per il deploy
  console.log("Election contract deployed to:", receipt.contractAddress);

  // Salva l'indirizzo in un file JSON
  const data = {
    address: receipt.contractAddress,
  };
  fs.writeFileSync("frontend/indirizzo.json", JSON.stringify(data, null, 2));  // Scrivi l'indirizzo nel file

  //File con ABI
  const artifactPath = "./artifacts/contracts/Election.sol/Election.json";
  const targetPath = "./frontend/abi.json";
  if (fs.existsSync(artifactPath)) {
    const artifactContent = fs.readFileSync(artifactPath, "utf-8");
    fs.writeFileSync(targetPath, artifactContent); // Copia l'intero contenuto
    console.log(`File copiato in ${targetPath}`);
  } else {
    console.error("Artifact non trovato:", artifactPath);
  }  

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});