// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Election{

    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }
    
    //Il mapping tiene traccia dei candidati, ad ogni id associa un candidato univoco
    mapping(uint => Candidate) public candidates;

    //Numero dei candidati nel mapping
    uint public candidatesCount;

    //Constructor
    constructor() {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    //la funzione incrementa di 1 il numero di candidati nel mapping e aggiunge un nuovo candidato passando id(il contatore viene usato come id), nome e numero di voti
    function addCandidate (string memory _name) private{
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }
}