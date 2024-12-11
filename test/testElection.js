const { expect } = require("chai");

describe("Election Contract", function () {
  let Election;
  let election;
  let owner;

  beforeEach(async function () {
    // Otteniamo il factory per il contratto
    Election = await ethers.getContractFactory("Election");

    // Deploy del contratto
    [owner] = await ethers.getSigners();
    election = await Election.deploy();
  });

  it("initializes with two candidates", async function () {
    // Verifica che il numero di candidati sia 2
    const candidateCount = await election.candidatesCount();
    expect(candidateCount).to.equal(2);
  });
});
