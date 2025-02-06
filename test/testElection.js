const { expect } = require("chai");

describe("Election Contract", function () {
  let election;
  let owner;

  beforeEach(async function () {
    //ottieni il contratto e il proprietario
    const Election = await ethers.getContractFactory("Election");
    [owner] = await ethers.getSigners();

    //deploy del contratto
    election = await Election.deploy();
  });


  /*
  it("initializes with two candidates", async function () {
    const candidateCount = await election.candidatesCount();
    expect(candidateCount).to.equal(2);
  });


  it("initializes the candidates with the correct values", async function () {
    const candidate1 = await election.candidates(1);
    expect(candidate1.id).to.equal(1);
    expect(candidate1.name).to.equal("Candidate 1");
    expect(candidate1.voteCount).to.equal(0);

    const candidate2 = await election.candidates(2);
    expect(candidate2.id).to.equal(2);
    expect(candidate2.name).to.equal("Candidate 2");
    expect(candidate2.voteCount).to.equal(0);
  });


  it("allows a voter to cast a vote", async function () {
    const candidateId = 1;

    //chiama la funzione per votare
    await election.vote(candidateId);

    //controlla se il valore booleano associato all'indirizzo del votante è true
    const hasVoted = await election.voters(owner.address);
    expect(hasVoted).to.be.true;

    //controlla se il contatore dei voti del candidato votato è stato incrementato correttamente
    const candidate  = await election.candidates(candidateId);
    expect(candidate.voteCount).to.equal(1);
  });  


  it("throws an exception for invalid candidates", async function () {
    const invalidCandidateId = 99;
  
    //prova a votare per un candidato non valido e verifica che venga generata un'eccezione
    await expect(election.vote(invalidCandidateId)).to.be.reverted;
  
    //controlla che i voti dei candidati validi non siano cambiati
    const candidate1 = await election.candidates(1);
    expect(candidate1.voteCount).to.equal(0, "candidate 1 did not receive any votes");
  
    const candidate2 = await election.candidates(2);
    expect(candidate2.voteCount).to.equal(0, "candidate 2 did not receive any votes");
  });


  it("does not allow a voter to vote more than once", async function () {
    const candidateId = 1;
  
    //la prima chiamata per votare deve andare a buon fine
    await election.vote(candidateId);
  
    //la seconda chiamata deve fallire
    await expect(election.vote(candidateId)).to.be.reverted;
  
    //controlla che i voti del candidato rimangono invariati
    const candidate = await election.candidates(candidateId);
    expect(candidate.voteCount).to.equal(1, "candidate vote count should not change after a repeated vote attempt");
  });
   */ 
  

});
