// Selezione degli elementi della pagina
const connectButton = document.getElementById("connectButton");
const userAddress = document.getElementById("userAddress");
const electionForm = document.getElementById("electionForm");
const electionFormContainer = document.getElementById("electionFormContainer");

const numButton = document.getElementById("numButton");

// Nascondi il form inizialmente

numButton.style.display = "none"
electionFormContainer.style.display = "none";

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


            electionFormContainer.style.display = "block";
            numButton.style.display = "block"
        } catch (error) {
            console.error("Error connecting to Metamask:", error);
        }
    } else {
        alert("Metamask not found. Please install Metamask.");
    }
});



// Funzione per creare una nuova elezione
electionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {

        if (!electionContract) {
            console.error("Election contract is not initialized.");
            return;
        }

        const electionCode = document.getElementById("electionCode").value;
        const candidateNames = document.getElementById("candidateNames").value.split(","); // Assumiamo che i nomi siano separati da virgole

        const tx = await electionContract.createElection(electionCode, candidateNames);
        document.getElementById("electionCode").value = "";
        document.getElementById("candidateNames").value = "";
        console.log("Creazione elezione inviata:", tx);



        alert("Elezione creata con successo!");

        await tx.wait(); // Aspetta che la transazione sia confermata



    } catch (error) {
        console.error("Errore durante la creazione dell'elezione:", error);
    }
});


numButton.addEventListener("click", async(event) => {
    const electionCount = await electionContract.getElectionCount();
    alert(`Numero di elezioni sulla blockchain: ${electionCount}`);
});

