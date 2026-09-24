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
  getConnectedWalletInfo,
} from "../blockchain/walletService.js";

import {
  realCastVote,
  realGetResults,
  realGetLastVote,
  realHasVoted,
} from "../blockchain/contractService.js";

import {
  REAL_MODE_AVAILABLE,
  getRealModeDiagnostic,
} from "../blockchain/config.js";
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
  const [realWalletRecoveryState, setRealWalletRecoveryState] = useState("idle");
  const [realWalletError, setRealWalletError] = useState("");

  // Becomes true once the app has finished its one-time startup check of
  // whether a live wallet is already connected (via syncConnectedRealWallet,
  // below). Until then, `wallet` / `walletMode` are just the useState
  // defaults (null) and must NOT be treated as "definitely not real mode" —
  // that's an unknown state, not a known-false one. Route guards (e.g.
  // Confirmation.jsx) key off this flag instead of off wallet/walletMode
  // directly, so they don't redirect away before the real wallet/vote state
  // has actually been checked.
  const [walletBootstrapped, setWalletBootstrapped] = useState(false);

  const syncConnectedRealWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setWallet(null);
      setWalletMode(null);
      setRealWalletRecoveryState("idle");
      setRealWalletError("");
      return false;
    }

    try {
      const info = await getConnectedWalletInfo();

      if (!info.available || !info.account) {
        if (!wallet) {
          setWallet(null);
          setWalletMode(null);
        }
        setRealWalletRecoveryState("idle");
        setRealWalletError("");
        return false;
      }

      setWallet(info.account);
      setWalletMode("real");
      setRealWalletRecoveryState("checking");
      setRealWalletError("");
      safeSet(STORAGE_KEYS.wallet, info.account);
      safeSet(STORAGE_KEYS.walletMode, "real");
      return true;
    } catch (err) {
      // Keep the currently known wallet account intact while the provider is
      // temporarily unavailable or while the wallet is still loading. If the
      // provider fails, the app should retry recovery instead of silently
      // clearing the wallet and redirecting to /vote.
      setRealWalletRecoveryState("failed");
      setRealWalletError(
        err?.message || "MetaMask is not connected to the correct network."
      );
      return false;
    }
  }, [wallet]);

  const recoverRealVoteTx = useCallback(async () => {
    if (!REAL_MODE_AVAILABLE || !wallet || walletMode !== "real") {
      setRealWalletRecoveryState("idle");
      return null;
    }

    setRealWalletRecoveryState("checking");
    setRealWalletError("");

    try {
      const votedOnChain = await realHasVoted(ELECTION.onChainId, wallet);

      if (!votedOnChain) {
        setHasVoted(false);
        setLastTx(null);
        setVotedFor(null);
        setRealWalletRecoveryState("noVote");
        safeSet(STORAGE_KEYS.hasVoted, "0");
        safeSet(STORAGE_KEYS.lastTx, JSON.stringify(null));
        safeSet(STORAGE_KEYS.votedFor, "");
        return null;
      }

      const recoveredTx = await realGetLastVote(ELECTION.onChainId, wallet);

      if (!recoveredTx) {
        // The wallet is already known to have voted on-chain. Preserve that
        // truth and show a recovery error instead of silently clearing state and
        // redirecting the user away from the confirmation flow.
        setHasVoted(true);
        setRealWalletRecoveryState("failed");
        setRealWalletError("The existing real vote was found on-chain, but the transaction details could not be recovered yet.");
        return null;
      }

      const candidateMatch = CANDIDATES.find(
        (candidate) => candidate.onChainId === Number(recoveredTx.candidateId)
      );
      const resolvedVotedFor = candidateMatch
        ? candidateMatch.id
        : String(recoveredTx.candidateId ?? "real-wallet-vote");

      setLastTx(recoveredTx);
      setHasVoted(true);
      setVotedFor(resolvedVotedFor);
      setRealWalletRecoveryState("recovered");

      safeSet(STORAGE_KEYS.lastTx, JSON.stringify(recoveredTx));
      safeSet(STORAGE_KEYS.hasVoted, "1");
      safeSet(STORAGE_KEYS.votedFor, resolvedVotedFor);
      safeSet(STORAGE_KEYS.wallet, wallet);
      safeSet(STORAGE_KEYS.walletMode, "real");

      return recoveredTx;
    } catch (err) {
      setRealWalletRecoveryState("failed");
      setRealWalletError(
        err?.message || "Could not recover the existing real vote."
      );
      console.warn(
        "Could not recover previous blockchain transaction:",
        err?.message || err
      );
      return null;
    }
  }, [wallet, walletMode]);

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
  // Restore saved frontend state when the application loads.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const savedHasVoted = safeGet(STORAGE_KEYS.hasVoted) === "1";
    const savedVotedFor = safeGet(STORAGE_KEYS.votedFor);
    const savedWallet = safeGet(STORAGE_KEYS.wallet);
    const savedWalletMode = safeGet(STORAGE_KEYS.walletMode);

    // LocalStorage is a convenience cache only. It must not override the live
    // MetaMask account or the real blockchain state.
    setHasVoted(savedHasVoted);
    setVotedFor(savedVotedFor);
    setWallet(savedWallet);
    setWalletMode(savedWalletMode);

    const realDiagnostic = savedWalletMode === "real" ? getRealModeDiagnostic() : "";
    if (realDiagnostic) {
      pushToast(realDiagnostic);
    }

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

    // Only flip walletBootstrapped once we actually know whether a live
    // wallet is connected (found, not found, or the check failed) — not
    // before. Route guards wait on this instead of on the wallet/walletMode
    // defaults so "haven't checked yet" is never mistaken for "not voted".
    syncConnectedRealWallet().finally(() => {
      setWalletBootstrapped(true);
    });

    seedChain().then((c) => {
      setChain(c);
      setLoadingChain(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushToast]);

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
    if (!wallet || walletMode !== "real") {
      console.log("[real-wallet] no active real wallet yet", { wallet, walletMode, realWalletRecoveryState });
      setRealWalletRecoveryState("idle");
      setRealWalletError("");
      return;
    }

    if (!REAL_MODE_AVAILABLE) {
      setRealWalletRecoveryState("failed");
      setRealWalletError("Real Blockchain Mode is unavailable because the wallet or contract config is invalid.");
      return;
    }

    let cancelled = false;

    async function recoverRealTransaction() {
      if (cancelled) return;
      console.log("[real-wallet] recovery triggered", {
        wallet,
        walletMode,
        realWalletRecoveryState,
        hasMetaMask: !!window.ethereum,
        chainId: window.ethereum?.chainId,
        account: window.ethereum?.selectedAddress,
      });
      await recoverRealVoteTx();
    }

    recoverRealTransaction();

    return () => {
      cancelled = true;
      console.log("[real-wallet] recovery cleanup");
    };
  }, [recoverRealVoteTx, wallet, walletMode]);

  // -------------------------------------------------------------------------
  // Connect wallet
  // -------------------------------------------------------------------------
  const connectWallet = useCallback(async () => {
    const { address, mode } = await connectWalletService();

    setWallet(address);
    setWalletMode(mode);
    setRealWalletRecoveryState(mode === "real" ? "checking" : "idle");
    setRealWalletError("");

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
    recoverRealVoteTx,
    realWalletRecoveryState,
    realWalletError,
    walletBootstrapped,

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