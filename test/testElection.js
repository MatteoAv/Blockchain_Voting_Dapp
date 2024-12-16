const { expect } = require("chai");

describe("Election Contract", function () {
  let election;
  let owner;

  beforeEach(async function () {
    // Ottieni il contratto e il proprietario
    const Election = await ethers.getContractFactory("Election");
    [owner] = await ethers.getSigners();

    // Deploy del contratto
    election = await Election.deploy();
  });

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
});
