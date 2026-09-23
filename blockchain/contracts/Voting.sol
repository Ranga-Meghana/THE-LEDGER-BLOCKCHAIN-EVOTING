// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Voting
/// @notice Minimal on-chain election contract for "The Ledger" e-voting prototype.
/// @dev Deliberately stores no personally-identifying voter data on-chain. Off-chain
///      systems are responsible for authenticating a person and issuing them a wallet
///      address as their voting credential; this contract only ever sees that address
///      (or, in the anonymized-ballot variant, a derived voter hash).
contract Voting {
    address public admin;

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        string title;
        uint256 startTime;
        uint256 endTime;
        bool exists;
        uint256 candidateCount;
        uint256 totalVotes;
    }

    // electionId => Election
    mapping(uint256 => Election) public elections;
    // electionId => candidateId => Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    // electionId => voter address => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    // electionId => voter address => eligible
    mapping(uint256 => mapping(address => bool)) public isEligible;

    uint256 public electionCount;

    event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoterRegistered(uint256 indexed electionId, address indexed voter);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter, uint256 timestamp);
    event ElectionEnded(uint256 indexed electionId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Voting: caller is not admin");
        _;
    }

    modifier electionExists(uint256 electionId) {
        require(elections[electionId].exists, "Voting: election does not exist");
        _;
    }

    modifier withinVotingWindow(uint256 electionId) {
        Election memory e = elections[electionId];
        require(block.timestamp >= e.startTime, "Voting: election has not started");
        require(block.timestamp <= e.endTime, "Voting: election has ended");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Create a new election. Candidates are added afterwards via addCandidate.
    function createElection(string calldata title, uint256 startTime, uint256 endTime) external onlyAdmin returns (uint256) {
        require(endTime > startTime, "Voting: endTime must be after startTime");
        electionCount++;
        elections[electionCount] = Election({
            title: title,
            startTime: startTime,
            endTime: endTime,
            exists: true,
            candidateCount: 0,
            totalVotes: 0
        });
        emit ElectionCreated(electionCount, title, startTime, endTime);
        return electionCount;
    }

    /// @notice Add a candidate to an election before it starts.
    function addCandidate(uint256 electionId, string calldata name) external onlyAdmin electionExists(electionId) {
        require(block.timestamp < elections[electionId].startTime, "Voting: election already started");
        elections[electionId].candidateCount++;
        uint256 candidateId = elections[electionId].candidateCount;
        candidates[electionId][candidateId] = Candidate({ id: candidateId, name: name, voteCount: 0 });
        emit CandidateAdded(electionId, candidateId, name);
    }

    /// @notice Register a wallet address as an eligible voter for a given election.
    /// @dev In production this would be gated by an off-chain identity/eligibility check
    ///      (e.g. a signed attestation) rather than called directly by an admin.
    function registerVoter(uint256 electionId, address voter) external onlyAdmin electionExists(electionId) {
        isEligible[electionId][voter] = true;
        emit VoterRegistered(electionId, voter);
    }

    function registerVotersBatch(uint256 electionId, address[] calldata voters) external onlyAdmin electionExists(electionId) {
        for (uint256 i = 0; i < voters.length; i++) {
            isEligible[electionId][voters[i]] = true;
            emit VoterRegistered(electionId, voters[i]);
        }
    }

    /// @notice Cast exactly one vote for a candidate in an election.
    function castVote(uint256 electionId, uint256 candidateId)
        external
        electionExists(electionId)
        withinVotingWindow(electionId)
    {
        require(isEligible[electionId][msg.sender], "Voting: not an eligible voter");
        require(!hasVoted[electionId][msg.sender], "Voting: address has already voted");
        require(candidateId > 0 && candidateId <= elections[electionId].candidateCount, "Voting: invalid candidate");

        hasVoted[electionId][msg.sender] = true;
        candidates[electionId][candidateId].voteCount++;
        elections[electionId].totalVotes++;

        emit VoteCast(electionId, candidateId, msg.sender, block.timestamp);
    }

    function getCandidateVotes(uint256 electionId, uint256 candidateId) external view returns (uint256) {
        return candidates[electionId][candidateId].voteCount;
    }

    function getElectionStatus(uint256 electionId) external view electionExists(electionId) returns (string memory) {
        Election memory e = elections[electionId];
        if (block.timestamp < e.startTime) return "UPCOMING";
        if (block.timestamp > e.endTime) return "ENDED";
        return "LIVE";
    }

    function getResults(uint256 electionId) external view electionExists(electionId) returns (string[] memory names, uint256[] memory votes) {
        uint256 count = elections[electionId].candidateCount;
        names = new string[](count);
        votes = new uint256[](count);
        for (uint256 i = 1; i <= count; i++) {
            names[i - 1] = candidates[electionId][i].name;
            votes[i - 1] = candidates[electionId][i].voteCount;
        }
    }
}
