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
    function createElection(string[] memory _candidateNames, string memory title, string memory description, uint endDate) public {

        string memory _electionCode;
        do {
            _electionCode = generateElectionCode();
        } while (bytes(elections[_electionCode].eelectionCode).length != 0); // Assicura unicità

        ElectionInfo storage newElection = elections[_electionCode];
        newElection.eelectionCode = _electionCode;
        newElection.title = title;
        newElection.description = description;
        newElection.endDate = endDate;

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

    // Funzione per ottenere i dettagli di un'elezione dato il codice dell'elezione
    function getElectionByCode(string memory _electionCode) public view returns (
        string memory title, 
        string memory description, 
        uint endDate, 
        Candidate[] memory ecandidates
    ) {
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
    function vota(string memory _electionCode, uint _candidateId) public {
        ElectionInfo storage election = elections[_electionCode];

        // Controlla che l'utente non abbia già votato in questa elezione
        require(!election.evoters[msg.sender], "Hai gia' votato per questa elezione!");

        // Controlla che il candidato selezionato sia valido per questa elezione
        require(_candidateId > 0, "Candidato non valido!");

        election.evoters[msg.sender] = true;  // Segna che l'utente ha votato
        election.ecandidates[_candidateId - 1].voteCount++;  // Incrementa il voto del candidato
    }
}
