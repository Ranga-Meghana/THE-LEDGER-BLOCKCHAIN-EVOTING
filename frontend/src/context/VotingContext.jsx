import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { seedChain, appendVoteBlock, totalVotes } from "../blockchain/chainService.js";
import { connectWallet as connectWalletService } from "../blockchain/walletService.js";
import { realCastVote, realGetResults } from "../blockchain/contractService.js";
import { REAL_MODE_AVAILABLE } from "../blockchain/config.js";
import { CANDIDATES } from "../data/candidates.js";
import { ELECTION } from "../data/electionData.js";

const VotingContext = createContext(null);

const STORAGE_KEYS = {
  hasVoted: "ledger_has_voted",
  votedFor: "ledger_voted_for",
  wallet: "ledger_wallet",
  walletMode: "ledger_wallet_mode",
};

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore — private browsing / storage disabled */
  }
}

export function VotingProvider({ children }) {
  const [chain, setChain] = useState([]);
  const [loadingChain, setLoadingChain] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [walletMode, setWalletMode] = useState(null); // 'real' | 'demo' | null
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [lastTx, setLastTx] = useState(null); // { txId, blockIndex, timestamp, mode }
  const [toasts, setToasts] = useState([]);
  const [realResults, setRealResults] = useState(null); // on-chain [{name, votes}] or null

  useEffect(() => {
    setHasVoted(safeGet(STORAGE_KEYS.hasVoted) === "1");
    setVotedFor(safeGet(STORAGE_KEYS.votedFor));
    setWallet(safeGet(STORAGE_KEYS.wallet));
    setWalletMode(safeGet(STORAGE_KEYS.walletMode));
    // Demo Mode's simulated hash chain — always built, since the Blockchain
    // Explorer / Audit pages are an educational Demo Mode feature regardless
    // of whether the connected wallet is real or simulated.
    seedChain().then((c) => {
      setChain(c);
      setLoadingChain(false);
    });
  }, []);

  const pushToast = useCallback((message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  // Reads real, on-chain results. No-ops (leaves realResults as null) unless
  // Real Blockchain Mode is actually configured and available.
  const refreshRealResults = useCallback(async () => {
    if (!REAL_MODE_AVAILABLE) return;
    try {
      const results = await realGetResults(ELECTION.onChainId);
      setRealResults(results);
    } catch (err) {
      console.warn("Could not read on-chain results (staying on Demo Mode data):", err.message);
    }
  }, []);

  useEffect(() => {
    refreshRealResults();
  }, [refreshRealResults]);

  const connectWallet = useCallback(async () => {
    const { address, mode } = await connectWalletService();
    setWallet(address);
    setWalletMode(mode);
    safeSet(STORAGE_KEYS.wallet, address);
    safeSet(STORAGE_KEYS.walletMode, mode);
    pushToast(mode === "real" ? "Wallet connected." : "Wallet connected (Demo Mode).");
    return { address, mode };
  }, [pushToast]);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    setWalletMode(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.wallet);
      localStorage.removeItem(STORAGE_KEYS.walletMode);
    } catch {
      /* ignore */
    }
    pushToast("Wallet disconnected.");
  }, [pushToast]);

  const castVote = useCallback(
    async (candidateId) => {
      let addr = wallet;
      let mode = walletMode;
      if (!addr) {
        const connected = await connectWallet();
        addr = connected.address;
        mode = connected.mode;
      }

      const candidate = CANDIDATES.find((c) => c.id === candidateId);

      // --- Real Blockchain Mode: a genuine transaction against Voting.sol ---
      if (mode === "real" && REAL_MODE_AVAILABLE) {
        const { txHash, blockNumber, timestamp } = await realCastVote(ELECTION.onChainId, candidate.onChainId);
        setHasVoted(true);
        setVotedFor(candidateId);
        safeSet(STORAGE_KEYS.hasVoted, "1");
        safeSet(STORAGE_KEYS.votedFor, candidateId);
        const tx = { txId: txHash, blockIndex: blockNumber, timestamp, mode: "real" };
        setLastTx(tx);
        pushToast("Vote submitted to the blockchain and confirmed.");
        refreshRealResults();
        return tx;
      }

      // --- Demo Mode: simulated hash-chain, no real network involved ---
      await new Promise((r) => setTimeout(r, 650)); // simulated mining latency
      const block = await appendVoteBlock(chain, candidateId);
      setChain((c) => [...c, block]);
      setHasVoted(true);
      setVotedFor(candidateId);
      safeSet(STORAGE_KEYS.hasVoted, "1");
      safeSet(STORAGE_KEYS.votedFor, candidateId);
      const tx = { txId: block.txId, blockIndex: block.index, timestamp: block.timestamp, mode: "demo" };
      setLastTx(tx);
      return tx;
    },
    [wallet, walletMode, chain, connectWallet, pushToast, refreshRealResults]
  );

  const value = {
    chain,
    setChain,
    loadingChain,
    wallet,
    walletMode,
    connectWallet,
    disconnectWallet,
    selectedCandidate,
    setSelectedCandidate,
    hasVoted,
    votedFor,
    lastTx,
    castVote,
    votesCast: totalVotes(chain),
    realResults,
    refreshRealResults,
    toasts,
    pushToast,
  };

  return <VotingContext.Provider value={value}>{children}</VotingContext.Provider>;
}

export function useVoting() {
  const ctx = useContext(VotingContext);
  if (!ctx) throw new Error("useVoting must be used within a VotingProvider");
  return ctx;
}
