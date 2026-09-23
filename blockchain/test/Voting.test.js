const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Voting", function () {
  let voting, admin, voter1, voter2, outsider;

  beforeEach(async function () {
    [admin, voter1, voter2, outsider] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.waitForDeployment();
  });

  // Creates an election that starts in the future (so addCandidate is still
  // allowed), adds candidates and voters, then fast-forwards the chain's own
  // clock past the start time so castVote() is allowed for the rest of the
  // test. All times are computed from `time.latest()` (the chain's current
  // block timestamp), not the host machine's wall clock — earlier tests in
  // this file may have already advanced the chain's clock via time.increaseTo.
  async function createLiveElection() {
    const start = (await time.latest()) + 60;
    const end = start + 60 * 60 * 24;
    await voting.createElection("Campus Leadership Election 2026", start, end);
    await voting.addCandidate(1, "Aria Vale");
    await voting.addCandidate(1, "Noah Reyes");
    await voting.registerVoter(1, voter1.address);
    await voting.registerVoter(1, voter2.address);
    await time.increaseTo(start + 1);
  }

  it("creates an election with candidates", async function () {
    const start = (await time.latest()) + 3600;
    await voting.createElection("Test Election", start, start + 1000);
    await voting.addCandidate(1, "Candidate A");
    const [names] = await voting.getResults(1);
    expect(names[0]).to.equal("Candidate A");
  });

  it("only allows the admin to create an election", async function () {
    const start = (await time.latest()) + 1000;
    await expect(
      voting.connect(voter1).createElection("Not Allowed", start, start + 1000)
    ).to.be.revertedWith("Voting: caller is not admin");
  });

  it("rejects adding a candidate after the election has started", async function () {
    const start = (await time.latest()) + 60;
    await voting.createElection("Already Started Soon", start, start + 1000);
    await time.increaseTo(start + 1);
    await expect(voting.addCandidate(1, "Too Late")).to.be.revertedWith(
      "Voting: election already started"
    );
  });

  it("allows an eligible voter to cast exactly one vote", async function () {
    await createLiveElection();
    await voting.connect(voter1).castVote(1, 1);
    expect(await voting.getCandidateVotes(1, 1)).to.equal(1);
    expect(await voting.hasVoted(1, voter1.address)).to.equal(true);
  });

  it("rejects a second vote from the same address", async function () {
    await createLiveElection();
    await voting.connect(voter1).castVote(1, 1);
    await expect(voting.connect(voter1).castVote(1, 2)).to.be.revertedWith(
      "Voting: address has already voted"
    );
  });

  it("rejects a vote from an ineligible address", async function () {
    await createLiveElection();
    await expect(voting.connect(outsider).castVote(1, 1)).to.be.revertedWith(
      "Voting: not an eligible voter"
    );
  });

  it("rejects a vote for a non-existent candidate", async function () {
    await createLiveElection();
    await expect(voting.connect(voter1).castVote(1, 99)).to.be.revertedWith(
      "Voting: invalid candidate"
    );
  });

  it("reports election status based on the current time window", async function () {
    const start = (await time.latest()) + 1000;
    await voting.createElection("Upcoming Election", start, start + 2000);
    expect(await voting.getElectionStatus(1)).to.equal("UPCOMING");
  });

  it("reports LIVE status once the start time has passed", async function () {
    const start = (await time.latest()) + 60;
    await voting.createElection("Soon Live Election", start, start + 2000);
    await time.increaseTo(start + 1);
    expect(await voting.getElectionStatus(1)).to.equal("LIVE");
  });

  it("tallies votes correctly across multiple voters", async function () {
    await createLiveElection();
    await voting.connect(voter1).castVote(1, 1);
    await voting.connect(voter2).castVote(1, 1);
    expect(await voting.getCandidateVotes(1, 1)).to.equal(2);
  });
});
