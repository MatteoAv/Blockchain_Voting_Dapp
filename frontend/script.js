// Selezione degli elementi della pagina
const connectButton = document.getElementById("connectButton");
const userAddress = document.getElementById("userAddress");
const candidateList = document.getElementById("candidateList");
//const addressDisplay = document.getElementById("contractAddressDisplay");
const candidatesSelect = document.getElementById("candidatesSelect");
const voteForm = document.querySelector("form");
const alreadyVoted = document.getElementById("alreadyVoted");

// Nascondi il form inizialmente
voteForm.style.display = "none";
alreadyVoted.style.display = "none";

let provider;
let signer;
let electionContract;
let contractAddress;

// Funzione per ottenere l'ABI
async function getABI() {
    try {
        const response = await fetch("abi.json");
        const data = await response.json();
        return data.abi;
    } catch (error) {
        console.error("Error fetching ABI:", error);
    }
}

// Funzione per ottenere l'indirizzo del contratto
async function getContractAddress() {
    try {
        const response = await fetch("indirizzo.json");
        const data = await response.json();
        console.log("Contract Address Loaded:", data.address);
        
        // Visualizza l'indirizzo sullo schermo
        //addressDisplay.textContent = `Contract Address: ${data.address}`;
        
        return data.address;
    } catch (error) {
        console.error("Error fetching contract address:", error);
    }
}

// Connetti a Metamask
connectButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            const address = await signer.getAddress();
            userAddress.textContent = `Il tuo account: ${address}`;
            connectButton.style.display = "none";

            // Ottieni l'indirizzo del contratto
            contractAddress = await getContractAddress();
            if (!contractAddress) {
                alert("Contract address not found!");
                return;
            }

            const contractABI = await getABI();
            // Inizializza il contratto
            electionContract = new ethers.Contract(contractAddress, contractABI, signer);

            // Mostra i candidati e aggiorna il form
            await loadCandidates();
            await renderForm();
        } catch (error) {
            console.error("Error connecting to Metamask:", error);
        }
    } else {
        alert("Metamask not found. Please install Metamask.");
    }
});

// Funzione per caricare i candidati
async function loadCandidates() {
    try {
        if (!electionContract) {
            console.error("Election contract is not initialized.");
            return;
        }

        const count = await electionContract.candidatesCount();
        candidateList.innerHTML = "";
        for (let i = 1; i <= count; i++) {
            const candidate = await electionContract.candidates(i);
            const li = document.createElement("tr");
            li.innerHTML = `
                <th scope="row">${candidate.id}</th>
                <td>${candidate.name}</td>
                <td>${candidate.voteCount}</td>
            `;
            candidateList.appendChild(li);
        }

        
        document.getElementById("content").style.display = "block";
    } catch (error) {
        console.error("Error loading candidates:", error);
    }
}

// Funzione per aggiornare il form con la lista dei candidati
async function renderForm() {
    try {
        if (!electionContract) {
            console.error("Election contract is not initialized.");
            return;
        }

        const count = await electionContract.candidatesCount();
        candidatesSelect.innerHTML = "";  // Rimuove tutte le opzioni precedenti

        // Aggiungi il placeholder
        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.textContent = "Scegli...";
        candidatesSelect.appendChild(placeholderOption);

        // Aggiungi le opzioni per i candidati
        for (let i = 1; i <= count; i++) {
            const candidate = await electionContract.candidates(i);
            const option = document.createElement("option");
            option.value = candidate.id;
            option.textContent = candidate.name;
            candidatesSelect.appendChild(option);
        }

        const userAddress = await signer.getAddress();
        const hasVoted = await electionContract.voters(userAddress);

        if (hasVoted) {
            voteForm.style.display = "none"; // Nascondi il form se l'utente ha già votato
            alreadyVoted.style.display = "block";
        } else {
            voteForm.style.display = "block"; // Mostra il form se l'utente non ha ancora votato
        }
    } catch (error) {
        console.error("Error rendering form:", error);
    }
}


// Funzione per inviare un voto
voteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        if (!electionContract) {
            console.error("Election contract is not initialized.");
            return;
        }

        const candidateId = candidatesSelect.value;
        const userAddress = await signer.getAddress();

        // Invia il voto al contratto
        const tx = await electionContract.vote(candidateId, { from: userAddress });
        console.log("Transaction sent:", tx);

        alert("Votazione avvenuta con successo!");

        // Mostra il caricamento mentre si aggiorna lo stato
        document.getElementById("content").style.display = "none";
        

        // Aspetta la conferma della transazione
        await tx.wait();

        // Ricarica i dati dei candidati
        await loadCandidates();
        await renderForm();
    } catch (error) {
        console.error("Error casting vote:", error);
    }
});
