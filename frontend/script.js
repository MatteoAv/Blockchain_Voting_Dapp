const connectButton = document.getElementById("connectButton");
const userAddress = document.getElementById("userAddress");
const candidateList = document.getElementById("candidateList");
const addressDisplay = document.getElementById("contractAddressDisplay");

let provider;
let signer;
let electionContract;
let contractAddress; // Definire la variabile per l'indirizzo del contratto

// ABI del contratto (non cambia)
const contractABI = [
    {
        "inputs": [], "stateMutability": "nonpayable", "type": "constructor"
    },
    {
        "inputs": [], "name": "candidatesCount", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "candidates", "outputs": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
        ], "stateMutability": "view", "type": "function"
    }
];

// Caricare dinamicamente l'indirizzo del contratto
async function getContractAddress() {
    try {
        const response = await fetch("indirizzo.json");
        const data = await response.json();
        console.log("Contract Address Loaded: ", data.address); 
        
        // Visualizza l'indirizzo sullo schermo
        addressDisplay.textContent = `Contract Address: ${data.address}`;
        
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
            userAddress.textContent = `Your Address: ${address}`;
            connectButton.style.display = "none";

            // Ottieni l'indirizzo del contratto
            contractAddress = await getContractAddress();
            if (!contractAddress) {
                alert("Contract address not found!");
                return;
            }

            // Inizializza il contratto
            electionContract = new ethers.Contract(contractAddress, contractABI, signer);

            // Mostra i candidati
            await loadCandidates();
        } catch (error) {
            console.error("Error connecting to Metamask:", error);
        }
    } else {
        alert("Metamask not found. Please install Metamask.");
    }
});

// Carica i candidati dal contratto
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

        document.getElementById("loader").style.display = "none";
        document.getElementById("content").style.display = "block";
    } catch (error) {
        console.error("Error loading candidates:", error);
    }
}