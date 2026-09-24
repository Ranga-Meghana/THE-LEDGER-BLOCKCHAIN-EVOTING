import { ethers } from "ethers";
import { CONTRACT_ADDRESS, NETWORK_RPC_URL } from "./config.js";
import ABI from "./VotingABI.json";

// ---------------------------------------------------------------------------
// Real Blockchain Mode: talks to the actual deployed Voting.sol contract via
// Ethers.js. Every function here either sends a real transaction (and waits
// for a real confirmation) or reads real on-chain state — nothing here is
// simulated. Compare with blockchain/chainService.js, which is the Demo Mode
// equivalent (a client-side, non-blockchain hash-chain simulation).
// ---------------------------------------------------------------------------

function assertConfigured() {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "No contract address configured (VITE_CONTRACT_ADDRESS is empty)."
    );
  }

  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "MetaMask (or another injected wallet) was not detected."
    );
  }
}

// Read-only calls use a direct JSON-RPC provider so they work even before a
// wallet is connected (e.g. showing live results to a visitor).
function getReadProvider() {
  return new ethers.JsonRpcProvider(NETWORK_RPC_URL);
}

function getReadContract() {
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    getReadProvider()
  );
}

async function getSignerContract() {
  assertConfigured();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return {
    contract: new ethers.Contract(CONTRACT_ADDRESS, ABI, signer),
    signer,
  };
}

/**
 * Casts a real vote by sending a real castVote() transaction and waiting for
 * it to be mined. Throws (with a readable message) on rejection or revert —
 * callers should catch this and show the error rather than treating it as a
 * successful vote.
 */
export async function realCastVote(electionId, candidateOnChainId) {
  const { contract, signer } = await getSignerContract();
  const address = await signer.getAddress();

  // Verify voter/election state up front with cheap read calls, so a voter
  // gets a clear reason immediately rather than paying gas for a doomed
  // transaction that the contract would revert anyway.
  const [status, eligible, alreadyVoted] = await Promise.all([
    contract.getElectionStatus(electionId),
    contract.isEligible(electionId, address),
    contract.hasVoted(electionId, address),
  ]);

  if (status !== "LIVE") {
    throw new Error(
      `This election is not currently open for voting (status: ${status}).`
    );
  }

  if (!eligible) {
    throw new Error(
      "This wallet address is not registered as an eligible voter for this election."
    );
  }

  if (alreadyVoted) {
    throw new Error(
      "This wallet address has already voted in this election."
    );
  }

  let tx;

  try {
    tx = await contract.castVote(electionId, candidateOnChainId);
  } catch (err) {
    // Ethers v6 surfaces a user-rejected MetaMask prompt as ACTION_REJECTED.
    if (err.code === "ACTION_REJECTED") {
      throw new Error("Transaction rejected in wallet.");
    }

    throw new Error(
      extractRevertReason(err) || "Transaction failed to submit."
    );
  }

  let receipt;

  try {
    receipt = await tx.wait();
  } catch (err) {
    throw new Error(
      extractRevertReason(err) ||
        "Transaction was submitted but failed to confirm."
    );
  }

  if (!receipt || receipt.status !== 1) {
    throw new Error("Transaction was mined but reverted.");
  }

  const block = await receipt.provider.getBlock(receipt.blockNumber);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    timestamp: block
      ? new Date(block.timestamp * 1000)
      : new Date(),
  };
}

/** Reads the real, on-chain vote count for a single candidate. */
export async function realGetCandidateVotes(
  electionId,
  candidateOnChainId
) {
  const contract = getReadContract();

  const count = await contract.getCandidateVotes(
    electionId,
    candidateOnChainId
  );

  return Number(count);
}

/** Reads real, on-chain results (names + vote counts) for the whole election. */
export async function realGetResults(electionId) {
  const contract = getReadContract();

  const [names, votes] = await contract.getResults(electionId);

  return names.map((name, i) => ({
    name,
    votes: Number(votes[i]),
  }));
}

/** Reads the real on-chain election status: "UPCOMING" | "LIVE" | "ENDED". */
export async function realGetElectionStatus(electionId) {
  const contract = getReadContract();

  return contract.getElectionStatus(electionId);
}

/** Checks (read-only) whether a given address has already voted on-chain. */
export async function realHasVoted(electionId, address) {
  const contract = getReadContract();

  return contract.hasVoted(electionId, address);
}

/**
 * Recovers the most recent real vote transaction for a wallet.
 *
 * This is used when the frontend is refreshed or reopened after a successful
 * blockchain vote. Instead of relying only on React state, the app searches
 * the deployed contract's VoteCast events and recovers the actual transaction
 * hash, block number, and timestamp from Sepolia.
 */
async function queryVoteEventsWithRetry(contract, filter, fromBlock, toBlock, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await contract.queryFilter(filter, fromBlock, toBlock);
    } catch (err) {
      const message = String(err?.message || err || "");
      const rateLimited = /429|compute units|capacity|rate limit|too many requests|exceeded/i.test(message);

      if (!rateLimited || attempt === retries) {
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  return [];
}

export async function realGetLastVote(electionId, voterAddress, maxLookbackBlocks = 100000) {
  const contract = getReadContract();
  const provider = getReadProvider();
  const latestBlockNumber = await provider.getBlockNumber();
  const earliestBlockNumber = Math.max(0, latestBlockNumber - maxLookbackBlocks);
  const maxQueryWindow = 10;
  let windowEnd = latestBlockNumber;

  while (windowEnd >= earliestBlockNumber) {
    const windowStart = Math.max(earliestBlockNumber, windowEnd - maxQueryWindow + 1);

    // Match the actual contract event signature exactly:
    // VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter, uint256 timestamp)
    // The safest read-only pattern is to query all VoteCast events for this election, then
    // filter the third argument (voter) in JavaScript. This avoids relying on null placeholders
    // in the filter being interpreted the way the code expects across providers/ABI versions.
    const filter = contract.filters.VoteCast(electionId);
    const events = await queryVoteEventsWithRetry(
      contract,
      filter,
      windowStart,
      windowEnd
    );

    const matchingEvents = events.filter((event) => {
      const voter = event.args?.[2];
      return Boolean(voter) && voter.toLowerCase() === voterAddress.toLowerCase();
    });

    if (matchingEvents.length) {
      const event = matchingEvents[matchingEvents.length - 1];
      const block = await provider.getBlock(event.blockNumber);

      const candidateId = Number(event.args?.[1]);

      return {
        txId: event.transactionHash,
        blockIndex: Number(event.blockNumber),
        timestamp: block
          ? new Date(block.timestamp * 1000)
          : new Date(),
        mode: "real",
        candidateId: Number.isFinite(candidateId) ? candidateId : null,
      };
    }

    if (windowStart === earliestBlockNumber) {
      break;
    }

    windowEnd = windowStart - 1;
  }

  return null;
}

function extractRevertReason(err) {
  // Ethers v6 puts the require() message in a few different places depending
  // on the provider/wallet; check the common ones.
  return (
    err?.shortMessage ||
    err?.reason ||
    err?.error?.message ||
    err?.info?.error?.message ||
    err?.message
  );
}