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
    throw new Error("No contract address configured (VITE_CONTRACT_ADDRESS is empty).");
  }
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask (or another injected wallet) was not detected.");
  }
}

// Read-only calls use a direct JSON-RPC provider so they work even before a
// wallet is connected (e.g. showing live results to a visitor).
function getReadProvider() {
  return new ethers.JsonRpcProvider(NETWORK_RPC_URL);
}

function getReadContract() {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, getReadProvider());
}

async function getSignerContract() {
  assertConfigured();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { contract: new ethers.Contract(CONTRACT_ADDRESS, ABI, signer), signer };
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
    throw new Error(`This election is not currently open for voting (status: ${status}).`);
  }
  if (!eligible) {
    throw new Error("This wallet address is not registered as an eligible voter for this election.");
  }
  if (alreadyVoted) {
    throw new Error("This wallet address has already voted in this election.");
  }

  let tx;
  try {
    tx = await contract.castVote(electionId, candidateOnChainId);
  } catch (err) {
    // Ethers v6 surfaces a user-rejected MetaMask prompt as ACTION_REJECTED.
    if (err.code === "ACTION_REJECTED") {
      throw new Error("Transaction rejected in wallet.");
    }
    throw new Error(extractRevertReason(err) || "Transaction failed to submit.");
  }

  let receipt;
  try {
    receipt = await tx.wait();
  } catch (err) {
    throw new Error(extractRevertReason(err) || "Transaction was submitted but failed to confirm.");
  }

  if (!receipt || receipt.status !== 1) {
    throw new Error("Transaction was mined but reverted.");
  }

  const block = await receipt.provider.getBlock(receipt.blockNumber);
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    timestamp: block ? new Date(block.timestamp * 1000) : new Date(),
  };
}

/** Reads the real, on-chain vote count for a single candidate. */
export async function realGetCandidateVotes(electionId, candidateOnChainId) {
  const contract = getReadContract();
  const count = await contract.getCandidateVotes(electionId, candidateOnChainId);
  return Number(count);
}

/** Reads real, on-chain results (names + vote counts) for the whole election. */
export async function realGetResults(electionId) {
  const contract = getReadContract();
  const [names, votes] = await contract.getResults(electionId);
  return names.map((name, i) => ({ name, votes: Number(votes[i]) }));
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
