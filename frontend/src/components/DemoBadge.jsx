import React from "react";
import { useVoting } from "../context/VotingContext.jsx";

// Shows "REAL BLOCKCHAIN MODE" only once we've actually confirmed the
// configured contract is reachable (a successful on-chain read landed in
// realResults) AND the connected wallet was a real one — not just because a
// contract address happens to be configured. Otherwise falls back to the
// honest default: DEMO MODE.
export default function DemoBadge() {
  const { walletMode, realResults } = useVoting();
  const isReal = walletMode === "real" && realResults !== null;

  if (isReal) {
    return (
      <div className="demo-badge" style={{ color: "var(--ok)", background: "rgba(52,211,153,0.08)", borderColor: "rgba(52,211,153,0.35)" }}>
        <span className="d" style={{ background: "var(--ok)" }}></span>REAL BLOCKCHAIN MODE
      </div>
    );
  }

  return (
    <div className="demo-badge">
      <span className="d"></span>DEMO MODE
    </div>
  );
}
