// Selezione degli elementi della pagina
const connectButton = document.getElementById("connectButton");
const candidateList = document.getElementById("candidateList");
const candidatesSelect = document.getElementById("candidatesSelect");
const initialSection = document.getElementById("initialSection");
const testo = document.getElementById("testo");
const sezioneRicerca = document.getElementById("sezioneRicerca");
const errore = document.getElementById("errore");
const electionDetails = document.getElementById("electionDetails");
const voteForm = document.getElementById("votazione");
const alreadyVoted  = document.getElementById("alreadyVoted");
const scaduta = document.getElementById("Expired");

scaduta.style.display = "none";
sezioneRicerca.style.display = "none";
errore.style.display = "none";
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
            localStorage.setItem("userAddress", address);
            //userAddress.textContent = `Il tuo account: ${address}`;
            connectButton.style.display = "none";

            //localStorage.setItem("userAddress", address);

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
            sezioneRicerca.style.display = "block";

            // Mostra i candidati e aggiorna il form
            //await loadCandidates();
            //await renderForm();
        } catch (error) {
            console.error("Error connecting to Metamask:", error);
        }
    } else {
        alert("Metamask not found. Please install Metamask.");
    }
});


// Variabile globale per memorizzare l'ID dell'elezione
let electionId;
let candidatesCount;
let electionDate;

// Funzione per recuperare l'elezione in base al codice
async function getElectionDetails() {
    try {
        const electionCode = document.getElementById("electionCode").value;
        if (!electionCode) {
            const successAlert = document.getElementById("AlertRicerca");

            successAlert.style.display = "block";
    
            setTimeout(() => {
                successAlert.style.display = "none";
            }, 1500);
            return;
        }

        if (!electionContract) {
            console.error("Election contract is not initialized.");
            return;
        }

        // Chiamata al contratto per ottenere i dettagli dell'elezione
        const election = await electionContract.getElectionByCode(electionCode);
        electionId = electionCode;

        if(election.title.trim() === ""){
            electionDetails.style.display = "none";
            document.getElementById("electionCode").value = "";
            errore.style.display = "block";
            return;
        }

        
        errore.style.display = "none";
        document.getElementById("electionCode").value = "";


        
        // Visualizza i dettagli dell'elezione
        document.getElementById("electionTitle").textContent = `Votazione: ${election.title}`;
        document.getElementById("electionDescription").textContent = `Descrizione: ${election.description}`;
        document.getElementById("electionEndDate").textContent = `Termine votazioni: ${new Date(election.endDate * 1000).toLocaleDateString()}`;

        electionDate = new Date(election.endDate * 1000);
        console.log("Data limite:", electionDate);
        console.log("Codice votazione:",electionId);


        // Popola la lista dei candidati
        const candidateList = document.getElementById("candidateList");
        candidateList.innerHTML = ""; // Svuota la lista dei candidati
        candidatesCount = election.ecandidates.length;
    

        election.ecandidates.forEach(candidate => {
            const li = document.createElement("tr");
            li.innerHTML = `
                <td>${candidate.id}</td>
                <td>${candidate.name}</td>
                <td>${candidate.voteCount}</td>
            `;
            candidateList.appendChild(li);
        });

        const userAddress = await signer.getAddress();
        const hasVoted = await electionContract.hasVoted(electionId, userAddress);

        if(hasVoted){
            alreadyVoted.style.display = "block";
            voteForm.style.display = "none";
            scaduta.style.display = "none";
        } 
        else if(electionDate < new Date()){
            alreadyVoted.style.display = "none";
            voteForm.style.display = "none";
            scaduta.style.display = "block";
        }
        else {
            renderOptions(election.ecandidates);
            voteForm.style.display = "block";
            alreadyVoted.style.display = "none";
            scaduta.style.display = "none";
        }


        // Mostra i dettagli dell'elezione
        document.getElementById("electionDetails").style.display = "block";
    } catch (error) {
        console.error("Error retrieving election details:", error);
    }
}

function renderOptions(candidates) {
    const candidatesSelect = document.getElementById("candidatesSelect");
    candidatesSelect.innerHTML = ""; // Svuota le opzioni esistenti

    // Aggiungi l'opzione di default
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "Seleziona un candidato...";
    candidatesSelect.appendChild(defaultOption);

    // Aggiungi ogni candidato come opzione
    candidates.forEach(candidate => {
        const option = document.createElement("option");
        option.value = candidate.id;
        option.textContent = candidate.name;
        candidatesSelect.appendChild(option);
    });
}


async function handleVote() {
    console.log("Submit event triggered");
    try {
        if (!electionContract) {
            console.error("Election contract is not initialized.");
            return;
        }

        const candidatesSelect = document.getElementById("candidatesSelect");
        const candidateId = candidatesSelect.value;

        // Invia il voto al contratto
        console.log('Candidate ID:', candidateId);
        console.log("Numero candidati:",candidatesCount);

        const electionFee = ethers.utils.parseEther("0.05"); // 0.1 ETH
        const codice = electionId;

        console.log("Codice:", codice);
        const tx = await electionContract.connect(signer).vota(codice, candidateId, {value: electionFee});

        console.log("Transaction sent:", tx);

        const successAlert = document.getElementById("AlertSuccess");

        successAlert.style.display = "block";

        setTimeout(() => {
            successAlert.style.display = "none";
        }, 2000);

        // Aspetta la conferma della transazione
        await tx.wait();

        await updateCandidatesList();
        await updateVoteForm();


    } catch (error) {
        console.error("Error casting vote:", error);
    }
}


async function updateCandidatesList() {
    try {
        const election = await electionContract.getElectionByCode(electionId);
        const candidateList = document.getElementById("candidateList");
        candidateList.innerHTML = ""; // Svuota la lista dei candidati

        election.ecandidates.forEach(candidate => {
            const li = document.createElement("tr");
            li.innerHTML = `
                <td>${candidate.id}</td>
                <td>${candidate.name}</td>
                <td>${candidate.voteCount}</td>
            `;
            candidateList.appendChild(li);
        });

        renderOptions(election.ecandidates); // Rende le opzioni dei candidati nella select

    } catch (error) {
        console.error("Error updating candidate list:", error);
    }
}


async function updateVoteForm(){
    const userAddress = await signer.getAddress();
    const hasVoted = await electionContract.hasVoted(electionId, userAddress);


    if(hasVoted){
        alreadyVoted.style.display = "block";
        voteForm.style.display = "none";
    } 
    else if(electionDate < new Date()){
        console.log("La data della votazione è passata.");
        alreadyVoted.style.display = "none";
        voteForm.style.display = "none";
    }
    else {
        renderOptions(election.ecandidates);
        voteForm.style.display = "block";
        alreadyVoted.style.display = "none";
    }
}



// Event listener per il pulsante
document.getElementById("getElectionButton").addEventListener("click", getElectionDetails);


let hasConnectButtonBeenClicked = sessionStorage.getItem("hasConnectButtonBeenClicked") === "true";

async function checkConnectionStatus() {
    const storedAddress = localStorage.getItem("userAddress");

    // Se ha cliccato il pulsante, tentiamo la connessione
    if (storedAddress && hasConnectButtonBeenClicked) {
        console.log("Utente già connesso, tentando di ricaricare il contratto...");
        await new Promise(resolve => setTimeout(resolve, 50));
        connectButton.click(); // Richiama la funzione per connettersi a Metamask
    }


    if (!electionContract) {
        console.warn("Election contract is not yet initialized. Attendere la connessione.");
        return; // Evita l'errore bloccante
    }

    // Se l'utente è connesso, mostra la ricerca, altrimenti mostra il login
    if (storedAddress) {
        document.getElementById("initialSection").style.display = "none";
        document.getElementById("testo").style.display = "none";
        document.getElementById("sezioneRicerca").style.display = "block";
    } else {
        document.getElementById("initialSection").style.display = "block";
        document.getElementById("testo").style.display = "block";
        document.getElementById("sezioneRicerca").style.display = "none";
    }
}

// Esegue la verifica solo dopo il caricamento della pagina
window.addEventListener("load", checkConnectionStatus);

connectButton.addEventListener("click", () => {
    hasConnectButtonBeenClicked = true; // Imposta il flag a true quando il pulsante viene cliccato
    sessionStorage.setItem("hasConnectButtonBeenClicked", "true"); // Memorizza questo stato per la sessione
    console.log('Cliccato');
});


