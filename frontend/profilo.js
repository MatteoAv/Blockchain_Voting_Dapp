const connectButton = document.getElementById("connectButton");
const initialSection = document.getElementById("initialSection");
const testo = document.getElementById("testo");
const pagina = document.getElementById("pagina");
const vuoto = document.getElementById("vuoto");
const generale = document.getElementById("generale");

let provider;
let signer;
let electionContract;
let contractAddress;

pagina.style.display = "none";
vuoto.style.display = "none";
generale.style.display = "none";

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
        return data.address;
    } catch (error) {
        console.error("Error fetching contract address:", error);
    }
}

// Connetti a Metamask
async function connectMetamask() {
    if (typeof window.ethereum !== "undefined") {
        try {
            // Richiesta degli account
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            const address = await signer.getAddress();
            localStorage.setItem("userAddress", address);
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
            console.log("Funzioni disponibili sul contratto:", electionContract);

            // Nascondi le sezioni di login
            initialSection.style.display = "none";
            testo.style.display = "none";
            pagina.style.display = "block";

            // Ora che siamo connessi, carichiamo automaticamente le elezioni
            loadUserElections();

        } catch (error) {
            console.error("Error connecting to Metamask:", error);
        }
    } else {
        alert("Metamask not found. Please install Metamask.");
    }
}

// Aggiungiamo l'evento di click al pulsante per la connessione (nel caso l'utente non sia già connesso)
connectButton.addEventListener("click", connectMetamask);

// Funzione per caricare le elezioni create dall'utente (usando un template definito in HTML)
async function loadUserElections() {
    try {
        const userAddress = await signer.getAddress();
        console.log("User address:", userAddress);

        // Otteniamo i dati delle elezioni create dall'utente
        const result = await electionContract.getElectionsByCreator(userAddress);
        // Il risultato è una tupla di array: [titles, descriptions, endDates, codes]
        const titles = result[0];
        const descriptions = result[1];
        const endDates = result[2];
        const codes = result[3];

        // Prendiamo il container dove inserire le card
        const userElectionsDiv = document.getElementById("userElections");
        userElectionsDiv.innerHTML = ""; // Puliamo il contenuto precedente

        if (titles.length === 0) {
            generale.style.display = "none";
            vuoto.style.display = "block";
            return;
        }

        generale.style.display = "block";
        // Prendiamo il template definito in HTML (il secondo template)
        const template = document.getElementById("cardTemplate");

        // Per ogni elezione, cloniamo il template e popoliamo i dati
        for (let i = 0; i < titles.length; i++) {
            const clone = template.content.cloneNode(true);
            // Impostiamo il titolo nel card-header
            clone.querySelector(".card-header").textContent = "Codice Elezione: " + codes[i];
            // Impostiamo il codice nel card-title (all'interno del card-body)
            clone.querySelector(".card-title").textContent = titles[i];
            // Impostiamo la descrizione nel card-text
            clone.querySelector(".card-text").textContent = descriptions[i];

            // Impostiamo la data nel card-footer
            const date = new Date(endDates[i] * 1000);
            clone.querySelector(".card-footer").textContent = "Scadenza: " + date.toLocaleDateString();

            const deleteButton = clone.querySelector("#elimina");
            const currentDate = new Date();

            const votiTotali = await electionContract.getTotalVotes(codes[i]);
            console.log("Voti totali di",codes[i] ,": ",votiTotali.toString());
            if (date < currentDate && votiTotali == 0) {
                deleteButton.style.display = "inline-block";
            } else {
                // Se la data non è passata, nascondi il pulsante
                deleteButton.style.display = "none";
            }

            // Aggiungi l'evento di clic al pulsante di eliminazione
            deleteButton.addEventListener("click", async (event) => {
                const electionCode = codes[i];  // Ottieni il codice dell'elezione
                await deleteElection(electionCode);  // Passa il codice alla funzione di eliminazione
            });            

            // Inseriamo il clone nel container
            userElectionsDiv.appendChild(clone);
        }
    } catch (error) {
        console.error("Error loading user elections:", error);
    }
}

// Funzione per chiamare la funzione deleteElection
async function deleteElection(electionCode) {

    try {
        if (!electionCode) {
            return;
        }
        
        const tx = await electionContract.deleteElection(electionCode);
        console.log("Transazione inviata:", tx);
        await tx.wait(); // Aspetta che la transazione venga confermata
        location.reload();

    } catch (error) {
        console.error("Errore:", error);
        location.reload();
    }
}

let hasConnectButtonBeenClicked = sessionStorage.getItem("hasConnectButtonBeenClicked") === "true";

// Funzione per verificare lo stato della connessione all'avvio
async function checkConnectionStatus() {
    const storedAddress = localStorage.getItem("userAddress");

    if (storedAddress && hasConnectButtonBeenClicked) {
        console.log("Utente già connesso, tentando di ricaricare il contratto...");
        await new Promise(resolve => setTimeout(resolve, 50));
        connectButton.click(); // Richiama la funzione per connettersi a Metamask
    }

    if (!electionContract) {
        console.warn("Election contract is not yet initialized. Attendere la connessione.");
        return; // Evita l'errore bloccante
    }

    if (storedAddress) {
        // Se l'utente risulta già connesso, tentiamo di riconnetterci
        console.log("Utente già connesso, tentativo di riconnessione...");
        await connectMetamask();
    } else {
        // Se non è connesso, mostriamo la sezione di login
        initialSection.style.display = "block";
        testo.style.display = "block";
    }
}

// Esegue la verifica subito dopo il caricamento della pagina
window.addEventListener("load", checkConnectionStatus);

connectButton.addEventListener("click", () => {
    hasConnectButtonBeenClicked = true; // Imposta il flag a true quando il pulsante viene cliccato
    sessionStorage.setItem("hasConnectButtonBeenClicked", "true"); // Memorizza questo stato per la sessione
    console.log('Cliccato');
});
