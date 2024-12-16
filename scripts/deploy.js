const hre = require("hardhat");
const fs = require("fs");  // Aggiungi questa riga per importare il modulo fs

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

  // Facciamo restituire i dati del candidato numero 1
  const candidate = await election.candidates(1);  // Assicurati che la funzione sia pubblica
  console.log("Candidato 1:", candidate);

  // Usa le parentesi alla fine di candidatesCount per richiamare il getter, candidatesCount non è una funzione ma una variabile
  const numCandidates = await election.candidatesCount();
  console.log("Numero di candidati nel contratto: ", numCandidates.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
