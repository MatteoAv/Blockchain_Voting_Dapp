// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Election{

    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }
    
    //Il mapping tiene traccia degli utenti che hanno già votato, ad ogni indirizzo di un account associa un valore booleano
    //Il valore booleano è settato di default a FALSE
    mapping(address => bool) public voters;

    //Il mapping tiene traccia dei candidati, ad ogni id associa un candidato univoco
    mapping(uint => Candidate) public candidates;

    //Numero dei candidati nel mapping
    uint public candidatesCount;

    //Constructor
    constructor() {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    //La funzione incrementa di 1 il numero di candidati nel mapping e aggiunge un nuovo candidato passando id(il contatore viene usato come id), nome e numero di voti
    function addCandidate (string memory _name) private{
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    /*
      La funzione setta a true il valore del votante (per indicare che ha votato) ed incrementa di 1 
      il contatore del candidato il cui id è stato passato come parametro.
      La funzione deve essere pubblica, chiunque deve poter votare
    */
    function vote (uint _candidateId) public {

        /* Con require se la condizione non è verificata la funzione si interrompe immediatamente */

        //controlla che l'utente non abbia già votato
        require(!voters[msg.sender]);
        //controlla che il candidato selezionato sia un candidato valido
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount ++;        
    }
}