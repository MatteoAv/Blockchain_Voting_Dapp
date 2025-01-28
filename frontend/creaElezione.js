// Selezione degli elementi della pagina
const connectButton = document.getElementById("connectButton");
const userAddress = document.getElementById("userAddress");
const electionForm = document.getElementById("electionForm");
const electionFormContainer = document.getElementById("electionFormContainer");
const initialSection = document.getElementById("initialSection");
const testo = document.getElementById("testo");

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
            // Nascondi subito initialSection e testo


            // Richiesta di accesso a MetaMask
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            const address = await signer.getAddress();
            //userAddress.textContent = `Il tuo account: ${address}`;

            // Mostra il form solo dopo che l'accesso è stato confermato
            

            // Ottieni l'indirizzo del contratto
            contractAddress = await getContractAddress();
            if (!contractAddress) {
                alert("Contract address not found!");
                return;
            }

            const contractABI = await getABI();
            // Inizializza il contratto
            electionContract = new ethers.Contract(contractAddress, contractABI, signer);

            
            initialSection.style.display = "none";
            testo.style.display = "none";
            connectButton.style.display = "none";
            numButton.style.display = "block";
            electionFormContainer.style.display = "block";

        } catch (error) {
            console.error("Error connecting to Metamask:", error);
            // Gestisci l'errore nel caso l'utente non confermi o ci siano problemi
            initialSection.style.display = "block";
            testo.style.display = "block";
            connectButton.style.display = "block";
            electionFormContainer.style.display = "none";
            alert("Errore nella connessione con MetaMask. Prova di nuovo.");
        }
    } else {
        alert("MetaMask non è installato. Per favore, installa MetaMask.");
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
        const electionTitle =  document.getElementById("electionTitle").value;
        const candidateNames = document.getElementById("candidateNames").value.split(","); // Assumiamo che i nomi siano separati da virgole
        const electionDescription = document.getElementById("electionDescription").value;
        const electionDate = document.getElementById("endDate").value;

        const endDateTimestamp = new Date(electionDate).getTime() / 1000; // Dividi per 1000 per ottenere i secondi


        const tx = await electionContract.createElection(electionCode, candidateNames, electionTitle, electionDescription, endDateTimestamp);
        document.getElementById("electionCode").value = "";
        document.getElementById("candidateNames").value = "";
        document.getElementById("electionTitle").value = "";
        document.getElementById("electionDescription").value = "";
        document.getElementById("endDate").value = "";
        
        console.log("Creazione elezione inviata:", tx);

        //controllo data corretta
        //let date = new Date(endDateTimestamp * 1000);
        //console.log("Data inserita:",date.toLocaleString());




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

