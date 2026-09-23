import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import TransactionCard from "../components/TransactionCard.jsx";
import { useVoting } from "../context/VotingContext.jsx";

export default function Confirmation() {
  const navigate = useNavigate();
  const { lastTx, hasVoted } = useVoting();

  // Guard: nothing to confirm if no vote has been cast in this session.
  if (!hasVoted || !lastTx) {
    return <Navigate to="/vote" replace />;
  }

  const isReal = lastTx.mode === "real";

  return (
    <div className="wrap screen-shell">
      <div className="confirm-wrap">
        <div className="check-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12l5 5L20 6" />
          </svg>
        </div>
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          {isReal ? "Real Blockchain Transaction Confirmed" : "Transaction Confirmed (Demo Mode)"}
        </div>
        <h2 style={{ fontSize: 34 }}>Your vote has been recorded.</h2>

        <TransactionCard txId={lastTx.txId} blockIndex={lastTx.blockIndex} timestamp={lastTx.timestamp} mode={lastTx.mode} />

        {isReal ? (
          <p style={{ fontSize: 12, color: "var(--ink-dimmer)", marginTop: 20, lineHeight: 1.6 }}>
            This was a real transaction mined on the connected network. The contract records your wallet address
            directly against this vote — <strong>this is not anonymous voting.</strong> Your identity is only kept
            separate from your vote in the sense that your real name is never written on-chain; anyone who can read
            the chain can still see which address voted for which candidate. See the README's Privacy Considerations
            section for what real ballot secrecy would require.
          </p>
        ) : (
          <p style={{ fontSize: 12, color: "var(--ink-dimmer)", marginTop: 20, lineHeight: 1.6 }}>
            This is a Demo Mode simulation — no real transaction was sent. The simulated record uses an anonymized
            voter reference rather than a name, purely to illustrate how identity and ballot data are kept separate
            in the real design. It is not connected to the Blockchain Explorer / Audit pages' underlying data source
            in Real Blockchain Mode.
          </p>
        )}

        <div className="review-actions" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/blockchain")}>
            {isReal ? "View Demo Explorer" : "View on Blockchain"}
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/election")}>
            Return to Election
          </button>
        </div>
        {isReal && (
          <p style={{ fontSize: 11, color: "var(--ink-dimmer)", marginTop: 12 }}>
            Note: the Blockchain Explorer and Audit pages visualize a separate Demo Mode simulation for teaching
            purposes and will not show this real transaction. Use a real block explorer (e.g. pointed at your local
            Hardhat node) to inspect it directly.
          </p>
        )}
      </div>
    </div>
  );
}
