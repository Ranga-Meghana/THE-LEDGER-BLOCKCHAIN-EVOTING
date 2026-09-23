import React from "react";
import { formatTimestamp } from "../utils/format.js";

// Used on the confirmation page to show the just-cast vote's transaction details.
// `mode` is 'real' (an actual mined transaction) or 'demo' (Demo Mode simulation)
// so the network label never overstates what actually happened.
export default function TransactionCard({ txId, blockIndex, timestamp, mode = "demo" }) {
  const networkLabel = mode === "real" ? "Local Ethereum Testnet (Real Transaction)" : "Local Ethereum Testnet (Demo Mode simulation)";
  return (
    <div className="tx-card">
      <div className="kv">
        <span className="k">Transaction Hash</span>
        <span className="v">{txId ? `${txId.slice(0, 10)}…${txId.slice(-4)}` : "—"}</span>
      </div>
      <div className="kv">
        <span className="k">Block</span>
        <span className="v">{blockIndex ? `#${String(blockIndex).padStart(6, "0")}` : "—"}</span>
      </div>
      <div className="kv">
        <span className="k">Timestamp</span>
        <span className="v">{timestamp ? formatTimestamp(timestamp) : "—"}</span>
      </div>
      <div className="kv">
        <span className="k">Network</span>
        <span className="v">{networkLabel}</span>
      </div>
      <div className="kv">
        <span className="k">Status</span>
        <span className="v status-confirmed">● CONFIRMED</span>
      </div>
    </div>
  );
}
