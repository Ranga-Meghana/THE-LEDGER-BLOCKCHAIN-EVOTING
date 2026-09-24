import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import TransactionCard from "../components/TransactionCard.jsx";
import { useVoting } from "../context/VotingContext.jsx";

export default function Confirmation() {
  const navigate = useNavigate();

  const {
    lastTx,
    hasVoted,
    wallet,
    walletMode,
    recoverRealVoteTx,
    realWalletRecoveryState,
    realWalletError,
    walletBootstrapped,
  } = useVoting();

  const [recovering, setRecovering] = useState(false);

  console.log("[confirmation-guard]", {
    wallet,
    walletMode,
    hasVoted,
    lastTx,
    realWalletRecoveryState,
    realWalletError,
    walletBootstrapped,
    hasMetaMask: !!window.ethereum,
    chainId: window.ethereum?.chainId,
    selectedAccount: window.ethereum?.selectedAddress,
  });

  /*
   * ------------------------------------------------------------
   * Recover an existing real blockchain vote if necessary.
   * ------------------------------------------------------------
   *
   * This is mainly useful when the user:
   * - refreshes /confirmation
   * - directly opens /confirmation
   * - reopens the application
   * - loses React state
   *
   * The blockchain remains the source of truth.
   */
  useEffect(() => {
    let active = true;

    if (!wallet || walletMode !== "real" || lastTx) {
      return undefined;
    }

    /*
     * VotingContext is already performing the initial recovery.
     * Do not start another recovery while it is still checking.
     */
    if (
      realWalletRecoveryState === "checking" ||
      realWalletRecoveryState === "idle"
    ) {
      return undefined;
    }

    async function recover() {
      setRecovering(true);

      try {
        await recoverRealVoteTx();
      } finally {
        if (active) {
          setRecovering(false);
        }
      }
    }

    recover();

    return () => {
      active = false;
    };
  }, [
    wallet,
    walletMode,
    lastTx,
    realWalletRecoveryState,
    recoverRealVoteTx,
  ]);

  /*
   * ------------------------------------------------------------
   * INITIAL WALLET BOOTSTRAP
   * ------------------------------------------------------------
   *
   * On a fresh page load, React initially has:
   *
   * wallet      = null
   * walletMode  = null
   * hasVoted    = false
   * lastTx      = null
   *
   * Those values do NOT mean:
   *
   * "The user has not voted."
   *
   * They mean:
   *
   * "The application has not checked yet."
   *
   * Therefore we must wait until VotingContext has finished
   * checking MetaMask before making any routing decision.
   */
  if (!walletBootstrapped) {
    return (
      <div className="wrap screen-shell">
        <div className="confirm-wrap">
          <div
            className="eyebrow"
            style={{ justifyContent: "center" }}
          >
            Verifying blockchain vote…
          </div>

          <h2 style={{ fontSize: 28 }}>
            Checking your wallet for an existing vote.
          </h2>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * REAL BLOCKCHAIN MODE
   * ------------------------------------------------------------
   */
  if (walletMode === "real" && !lastTx) {
    /*
     * Blockchain recovery is still running.
     */
    if (
      realWalletRecoveryState === "checking" ||
      realWalletRecoveryState === "idle"
    ) {
      return (
        <div className="wrap screen-shell">
          <div className="confirm-wrap">
            <div
              className="eyebrow"
              style={{ justifyContent: "center" }}
            >
              Verifying blockchain vote…
            </div>

            <h2 style={{ fontSize: 28 }}>
              Checking the Sepolia contract for your existing vote.
            </h2>
          </div>
        </div>
      );
    }

    /*
     * The blockchain says the wallet has voted, but the
     * transaction information could not be recovered.
     */
    if (realWalletRecoveryState === "failed") {
      return (
        <div className="wrap screen-shell">
          <div className="confirm-wrap">
            <div
              className="eyebrow"
              style={{ justifyContent: "center" }}
            >
              Real vote recovery error
            </div>

            <h2 style={{ fontSize: 28 }}>
              We could not verify the existing on-chain vote.
            </h2>

            <p
              style={{
                color: "var(--ink-dim)",
                marginTop: 10,
              }}
            >
              {realWalletError ||
                "The blockchain read did not return a transaction."}
            </p>

            <button
              className="btn btn-primary"
              onClick={() => recoverRealVoteTx()}
              style={{ marginTop: 16 }}
            >
              Retry recovery
            </button>
          </div>
        </div>
      );
    }

    /*
     * Only redirect when the blockchain recovery has actually
     * established that this wallet has NOT voted.
     */
    if (hasVoted === false) {
      return <Navigate to="/vote" replace />;
    }
  }

  /*
   * ------------------------------------------------------------
   * GENERAL CONFIRMATION GUARD
   * ------------------------------------------------------------
   *
   * A confirmation page requires:
   *
   * hasVoted === true
   * AND
   * lastTx exists
   *
   * For real mode, the recovery states above are handled first.
   */
  if (!hasVoted || !lastTx) {
    /*
     * Real wallet is still being checked.
     */
    if (
      walletMode === "real" &&
      (realWalletRecoveryState === "checking" ||
        realWalletRecoveryState === "idle")
    ) {
      return (
        <div className="wrap screen-shell">
          <div className="confirm-wrap">
            <div
              className="eyebrow"
              style={{ justifyContent: "center" }}
            >
              Verifying blockchain vote…
            </div>

            <h2 style={{ fontSize: 28 }}>
              Checking the Sepolia contract for your existing vote.
            </h2>
          </div>
        </div>
      );
    }

    /*
     * Real wallet recovery failed.
     */
    if (
      walletMode === "real" &&
      realWalletRecoveryState === "failed"
    ) {
      return (
        <div className="wrap screen-shell">
          <div className="confirm-wrap">
            <div
              className="eyebrow"
              style={{ justifyContent: "center" }}
            >
              Real vote recovery error
            </div>

            <h2 style={{ fontSize: 28 }}>
              We could not verify the existing on-chain vote.
            </h2>

            <p
              style={{
                color: "var(--ink-dim)",
                marginTop: 10,
              }}
            >
              {realWalletError ||
                "The blockchain read did not return a transaction."}
            </p>

            <button
              className="btn btn-primary"
              onClick={() => recoverRealVoteTx()}
              style={{ marginTop: 16 }}
            >
              Retry recovery
            </button>
          </div>
        </div>
      );
    }

    /*
     * At this point the application has completed bootstrap
     * and there is no valid confirmation state.
     */
    return <Navigate to="/vote" replace />;
  }

  /*
   * ------------------------------------------------------------
   * CONFIRMED VOTE
   * ------------------------------------------------------------
   */

  const isReal = lastTx.mode === "real";

  return (
    <div className="wrap screen-shell">
      <div className="confirm-wrap">

        {/* Success icon */}
        <div className="check-circle">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 12l5 5L20 6" />
          </svg>
        </div>

        {/* Confirmation type */}
        <div
          className="eyebrow"
          style={{ justifyContent: "center" }}
        >
          {isReal
            ? "Real Blockchain Transaction Confirmed"
            : "Transaction Confirmed (Demo Mode)"}
        </div>

        <h2 style={{ fontSize: 34 }}>
          Your vote has been recorded.
        </h2>

        {/* Transaction information */}
        <TransactionCard
          txId={lastTx.txId}
          blockIndex={lastTx.blockIndex}
          timestamp={lastTx.timestamp}
          mode={lastTx.mode}
        />

        {/* ----------------------------------------------------
            REAL BLOCKCHAIN — ETHERSCAN
            ---------------------------------------------------- */}
        {isReal && (
          <div
            style={{
              marginTop: 18,
              textAlign: "center",
            }}
          >
            <a
              href={`https://sepolia.etherscan.io/tx/${lastTx.txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                textDecoration: "none",
                alignItems: "center",
                gap: 8,
              }}
            >
              View on Sepolia Etherscan ↗
            </a>

            <p
              style={{
                fontSize: 11,
                color: "var(--ink-dimmer)",
                marginTop: 10,
              }}
            >
              Opens the public blockchain record for this transaction.
            </p>
          </div>
        )}

        {/* ----------------------------------------------------
            PRIVACY INFORMATION
            ---------------------------------------------------- */}
        {isReal ? (
          <p
            style={{
              fontSize: 12,
              color: "var(--ink-dimmer)",
              marginTop: 20,
              lineHeight: 1.6,
            }}
          >
            This was a real transaction mined on the connected network.
            The contract records your wallet address directly against
            this vote —{" "}
            <strong>this is not anonymous voting.</strong>{" "}
            Your identity is only kept separate from your vote in the
            sense that your real name is never written on-chain; anyone
            who can read the chain can still see which address voted for
            which candidate. See the README&apos;s Privacy Considerations
            section for what real ballot secrecy would require.
          </p>
        ) : (
          <p
            style={{
              fontSize: 12,
              color: "var(--ink-dimmer)",
              marginTop: 20,
              lineHeight: 1.6,
            }}
          >
            This is a Demo Mode simulation — no real transaction was
            sent. The simulated record uses an anonymized voter
            reference rather than a name, purely to illustrate how
            identity and ballot data are kept separate in the real
            design. It is not connected to the Blockchain Explorer /
            Audit pages&apos; underlying data source in Real Blockchain
            Mode.
          </p>
        )}

        {/* ----------------------------------------------------
            NAVIGATION BUTTONS
            ---------------------------------------------------- */}
        <div
          className="review-actions"
          style={{ justifyContent: "center" }}
        >
          <button
            className="btn btn-ghost"
            onClick={() => navigate("/blockchain")}
          >
            {isReal
              ? "View Demo Explorer"
              : "View on Blockchain"}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/election")}
          >
            Return to Election
          </button>
        </div>

        {/* ----------------------------------------------------
            REAL MODE EXPLORER NOTE
            ---------------------------------------------------- */}
        {isReal && (
          <p
            style={{
              fontSize: 11,
              color: "var(--ink-dimmer)",
              marginTop: 12,
            }}
          >
            Note: the Blockchain Explorer and Audit pages visualize
            a separate Demo Mode simulation for teaching purposes and
            will not show this real transaction. Use Sepolia Etherscan
            to inspect the actual blockchain transaction.
          </p>
        )}
      </div>
    </div>
  );
}