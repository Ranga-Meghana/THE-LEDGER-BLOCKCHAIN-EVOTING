import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  seedChain,
  appendVoteBlock,
  totalVotes,
} from "../blockchain/chainService.js";

import {
  connectWallet as connectWalletService,
} from "../blockchain/walletService.js";

import {
  realCastVote,
  realGetResults,
  realGetLastVote,
} from "../blockchain/contractService.js";

import { REAL_MODE_AVAILABLE } from "../blockchain/config.js";
import { CANDIDATES } from "../data/candidates.js";
import { ELECTION } from "../data/electionData.js";

const VotingContext = createContext(null);

const STORAGE_KEYS = {
  hasVoted: "ledger_has_voted",
  votedFor: "ledger_voted_for",
  wallet: "ledger_wallet",
  walletMode: "ledger_wallet_mode",
  lastTx: "ledger_last_tx",
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
  const [walletMode, setWalletMode] = useState(null);

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);

  const [lastTx, setLastTx] = useState(null);

  const [toasts, setToasts] = useState([]);

  const [realResults, setRealResults] = useState(null);

  // -------------------------------------------------------------------------
  // Restore saved frontend state when the application loads.
  // -------------------------------------------------------------------------
  useEffect(() => {
    setHasVoted(safeGet(STORAGE_KEYS.hasVoted) === "1");
    setVotedFor(safeGet(STORAGE_KEYS.votedFor));

    const savedWallet = safeGet(STORAGE_KEYS.wallet);
    const savedWalletMode = safeGet(STORAGE_KEYS.walletMode);

    setWallet(savedWallet);
    setWalletMode(savedWalletMode);

    // Restore the last transaction if it was previously saved.
    const savedTx = safeGet(STORAGE_KEYS.lastTx);

    if (savedTx) {
      try {
        const parsedTx = JSON.parse(savedTx);

        setLastTx({
          ...parsedTx,
          timestamp: parsedTx.timestamp
            ? new Date(parsedTx.timestamp)
            : new Date(),
        });
      } catch {
        // Ignore malformed stored transaction data.
      }
    }

    // Demo Mode's simulated hash chain — always built, since the Blockchain
    // Explorer / Audit pages are an educational Demo Mode feature regardless
    // of whether the connected wallet is real or simulated.
    seedChain().then((c) => {
      setChain(c);
      setLoadingChain(false);
    });
  }, []);

  // -------------------------------------------------------------------------
  // Toast notifications
  // -------------------------------------------------------------------------
  const pushToast = useCallback((message) => {
    const id = Math.random().toString(36).slice(2);

    setToasts((t) => [...t, { id, message }]);

    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3400);
  }, []);

  // -------------------------------------------------------------------------
  // Reads real, on-chain results.
  // -------------------------------------------------------------------------
  const refreshRealResults = useCallback(async () => {
    if (!REAL_MODE_AVAILABLE) return;

    try {
      const results = await realGetResults(ELECTION.onChainId);
      setRealResults(results);
    } catch (err) {
      console.warn(
        "Could not read on-chain results (staying on Demo Mode data):",
        err.message
      );
    }
  }, []);

  useEffect(() => {
    refreshRealResults();
  }, [refreshRealResults]);

  // -------------------------------------------------------------------------
  // Recover the most recent real blockchain transaction for the connected
  // wallet.
  //
  // This is especially important after refreshing/reopening the app because
  // React state is reset. The transaction itself remains safely on Sepolia.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (
      !REAL_MODE_AVAILABLE ||
      !wallet ||
      walletMode !== "real"
    ) {
      return;
    }

    let cancelled = false;

    async function recoverRealTransaction() {
      try {
        const recoveredTx = await realGetLastVote(
          ELECTION.onChainId,
          wallet
        );

        if (!cancelled && recoveredTx) {
          setLastTx(recoveredTx);

          safeSet(
            STORAGE_KEYS.lastTx,
            JSON.stringify(recoveredTx)
          );

          setHasVoted(true);
          safeSet(STORAGE_KEYS.hasVoted, "1");
        }
      } catch (err) {
        console.warn(
          "Could not recover previous blockchain transaction:",
          err.message
        );
      }
    }

    recoverRealTransaction();

    return () => {
      cancelled = true;
    };
  }, [wallet, walletMode]);

  // -------------------------------------------------------------------------
  // Connect wallet
  // -------------------------------------------------------------------------
  const connectWallet = useCallback(async () => {
    const { address, mode } = await connectWalletService();

    setWallet(address);
    setWalletMode(mode);

    safeSet(STORAGE_KEYS.wallet, address);
    safeSet(STORAGE_KEYS.walletMode, mode);

    pushToast(
      mode === "real"
        ? "Wallet connected."
        : "Wallet connected (Demo Mode)."
    );

    return { address, mode };
  }, [pushToast]);

  // -------------------------------------------------------------------------
  // Disconnect wallet
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Cast vote
  // -------------------------------------------------------------------------
  const castVote = useCallback(
    async (candidateId) => {
      let addr = wallet;
      let mode = walletMode;

      if (!addr) {
        const connected = await connectWallet();

        addr = connected.address;
        mode = connected.mode;
      }

      const candidate = CANDIDATES.find(
        (c) => c.id === candidateId
      );

      if (!candidate) {
        throw new Error("Selected candidate could not be found.");
      }

      // ---------------------------------------------------------------------
      // REAL BLOCKCHAIN MODE
      // ---------------------------------------------------------------------
      if (mode === "real" && REAL_MODE_AVAILABLE) {
        const {
          txHash,
          blockNumber,
          timestamp,
        } = await realCastVote(
          ELECTION.onChainId,
          candidate.onChainId
        );

        setHasVoted(true);
        setVotedFor(candidateId);

        safeSet(STORAGE_KEYS.hasVoted, "1");
        safeSet(STORAGE_KEYS.votedFor, candidateId);

        const tx = {
          txId: txHash,
          blockIndex: blockNumber,
          timestamp,
          mode: "real",
        };

        setLastTx(tx);

        // Persist the real transaction so the confirmation page survives
        // refreshes.
        safeSet(
          STORAGE_KEYS.lastTx,
          JSON.stringify(tx)
        );

        pushToast(
          "Vote submitted to the blockchain and confirmed."
        );

        refreshRealResults();

        return tx;
      }

      // ---------------------------------------------------------------------
      // DEMO MODE
      // ---------------------------------------------------------------------
      await new Promise((r) => setTimeout(r, 650));

      const block = await appendVoteBlock(
        chain,
        candidateId
      );

      setChain((c) => [...c, block]);

      setHasVoted(true);
      setVotedFor(candidateId);

      safeSet(STORAGE_KEYS.hasVoted, "1");
      safeSet(STORAGE_KEYS.votedFor, candidateId);

      const tx = {
        txId: block.txId,
        blockIndex: block.index,
        timestamp: block.timestamp,
        mode: "demo",
      };

      setLastTx(tx);

      // Persist Demo Mode transaction as well.
      safeSet(
        STORAGE_KEYS.lastTx,
        JSON.stringify(tx)
      );

      return tx;
    },
    [
      wallet,
      walletMode,
      chain,
      connectWallet,
      pushToast,
      refreshRealResults,
    ]
  );

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------
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

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const ctx = useContext(VotingContext);

  if (!ctx) {
    throw new Error(
      "useVoting must be used within a VotingProvider"
    );
  }

  return ctx;
}