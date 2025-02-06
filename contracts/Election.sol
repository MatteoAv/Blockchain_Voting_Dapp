// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;


contract Election {

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct ElectionInfo {
        string eelectionCode;
        uint ecandidatesCount;
        Candidate[] ecandidates;  
        mapping(address => bool) evoters;  // Mapping for voters inside the election context
        string description;
        string title;
        uint endDate;
        address creator;
        bool electionCancelled;
        uint creationCost;
    }    

    mapping(string => ElectionInfo) public elections;
    string[] public electionCodes;
    

    function generateElectionCode() internal view returns (string memory) {
        string memory charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        bytes memory randomBytes = abi.encodePacked(keccak256(abi.encodePacked(block.timestamp, msg.sender, electionCodes.length)));
        
        bytes memory code = new bytes(6);
        for (uint i = 0; i < 6; i++) {
            code[i] = bytes(charset)[uint8(randomBytes[i]) % bytes(charset).length];
        }
        
        return string(code);
    }

    // Funzione per creare una nuova votazione
    function createElection(string[] memory _candidateNames, string memory title, string memory description, uint endDate) public payable{

        string memory _electionCode;
        do {
            _electionCode = generateElectionCode();
        } while (bytes(elections[_electionCode].eelectionCode).length != 0); // Assicura unicità

        ElectionInfo storage newElection = elections[_electionCode];
        newElection.eelectionCode = _electionCode;
        newElection.title = title;
        newElection.description = description;
        newElection.endDate = endDate;
        newElection.creator = msg.sender;
        newElection.electionCancelled = false;

        // Aggiungi il controllo per verificare se l'utente ha inviato abbastanza fondi
        require(msg.value >= 0.1 ether, "Devi inviare almeno 0.1 ETH per creare l'elezione!");

        newElection.creationCost = msg.value;

        for (uint i = 0; i < _candidateNames.length; i++) {
            newElection.ecandidatesCount++;
            newElection.ecandidates.push(Candidate(newElection.ecandidatesCount, _candidateNames[i], 0));
        }

        electionCodes.push(_electionCode);
    }    

    // Funzione per ottenere le votazioni sulla blockchain
    function getAllElection() public view returns (string[] memory){
        return electionCodes;
    }

    function isCancelled(string memory electionCode) public view returns (bool) {
        return elections[electionCode].electionCancelled;
    }

    function getCreatorOfElection(string memory _electionCode) public view returns (address) {
        return elections[_electionCode].creator;
    }

    // Funzione per ottenere i dettagli di un'elezione dato il codice dell'elezione
    function getElectionByCode(string memory _electionCode) public view returns (
        string memory title, 
        string memory description, 
        uint endDate, 
        Candidate[] memory ecandidates
    ) {

        require(elections[_electionCode].electionCancelled == false, "La votazione e' stata eliminata e non risulta piu' visibile!");

        ElectionInfo storage election = elections[_electionCode];
        title = election.title;
        description = election.description;
        endDate = election.endDate;

        ecandidates = new Candidate[](election.ecandidatesCount);

        for (uint i = 0; i < election.ecandidatesCount; i++) {
            ecandidates[i] = election.ecandidates[i];
        }
    } 

    // Funzione per votare
    function vota(string memory _electionCode, uint _candidateId) public payable{
        ElectionInfo storage election = elections[_electionCode];

        // Controlla che chi vota non sia il creatore dell'elezione
        require(msg.sender != election.creator, "Il creatore dell'elezione non puo votare!");

        // Controlla che l'utente non abbia già votato in questa elezione
        require(!election.evoters[msg.sender], "Hai gia' votato per questa elezione!");

        // Controlla che il candidato selezionato sia valido per questa elezione
        require(_candidateId > 0 && _candidateId <= election.ecandidatesCount, "Candidato non valido!");

        // Affinche la votazione possa avvenire e' necessario che la data di terminazione della votazione non sia ancora passata
        require(block.timestamp <= election.endDate, "La votazione e' gia' terminata!");

        require(elections[_electionCode].electionCancelled == false, "La votazione e' stata eliminata e non risulta piu' visibile!");

        require(msg.value >= 0.05 ether, "Devi inviare almeno 0.05 ETH per votare!");

        election.evoters[msg.sender] = true;  // Segna che l'utente ha votato
        election.ecandidates[_candidateId - 1].voteCount++;  // Incrementa il voto del candidato
    }

    // Funzione per verificare se un utente ha già votato in una specifica elezione
    function hasVoted(string memory _electionCode, address _voter) public view returns (bool) {
        return elections[_electionCode].evoters[_voter];
    }

    // Funzione per cancellare l'elezione
    function deleteElection(string memory _electionCode) public {
        ElectionInfo storage election = elections[_electionCode];
        
        // Verifica che solo il creatore dell'elezione possa annullarla
        require(msg.sender == election.creator, "Solo il creatore puo' annullare l'elezione.");
        
        // Verifica che l'elezione sia scaduta
        require(block.timestamp > election.endDate, "L'elezione non e' ancora scaduta.");
        
        // Verifica che non siano stati emessi voti
        for (uint i = 0; i < election.ecandidatesCount; i++) {
            require(election.ecandidates[i].voteCount == 0, "Non puoi annullare l'elezione, ci sono gia' dei voti.");
        }

        elections[_electionCode].electionCancelled = true;
        
        // Restituisci i fondi al creatore
        uint refundAmount = election.creationCost;
        payable(election.creator).transfer(refundAmount);
    }

    // Funzione per ottenere il numero totale di voti in una elezione
    function getTotalVotes(string memory _electionCode) public view returns (uint totalVotes) {
        ElectionInfo storage election = elections[_electionCode];
        totalVotes = 0;

        // Somma i voti per ogni candidato
        for (uint i = 0; i < election.ecandidatesCount; i++) {
            totalVotes += election.ecandidates[i].voteCount;
        }

        return totalVotes;
    }    

    
}
