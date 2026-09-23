import React, { useState } from "react";
import { Link } from "react-router-dom";
import BlockCard from "../components/BlockCard.jsx";
import Modal from "../components/Modal.jsx";
import { useChain } from "../hooks/useChain.js";
import { formatTimestamp } from "../utils/format.js";

export default function BlockchainExplorer() {
  const { chain, loadingChain, blockHeight } = useChain();
  const [openBlockIndex, setOpenBlockIndex] = useState(null);
  const openBlock = chain.find((b) => b.index === openBlockIndex);

  if (loadingChain) {
    return (
      <div className="wrap screen-shell">
        <p style={{ color: "var(--ink-dim)" }}>Connecting to blockchain…</p>
      </div>
    );
  }

  const reversedChain = [...chain].reverse();
  const totalTxns = chain.reduce((a, b) => a + (b.txCount || 0), 0) + 12800;

  return (
    <div className="wrap screen-shell">
      <Link className="back-link" to="/">
        ← Back to home
      </Link>
      <div className="eyebrow">Blockchain Explorer</div>
      <h2 style={{ fontSize: 44 }}>The Ledger.</h2>

      <div className="chain-stats" style={{ marginTop: 40 }}>
        <div className="cs">
          <div className="l mono" style={{ fontSize: 10.5, color: "var(--ink-dimmer)" }}>
            NETWORK STATUS
          </div>
          <div style={{ color: "var(--ok)", fontFamily: "var(--font-mono)", marginTop: 6 }}>● OPERATIONAL</div>
        </div>
        <div className="cs">
          <div className="l mono" style={{ fontSize: 10.5, color: "var(--ink-dimmer)" }}>
            BLOCK HEIGHT
          </div>
          <div className="mono" style={{ marginTop: 6, fontSize: 18 }}>
            #{String(blockHeight).padStart(6, "0")}
          </div>
        </div>
        <div className="cs">
          <div className="l mono" style={{ fontSize: 10.5, color: "var(--ink-dimmer)" }}>
            TRANSACTIONS
          </div>
          <div className="mono" style={{ marginTop: 6, fontSize: 18 }}>
            {totalTxns.toLocaleString()}
          </div>
        </div>
        <div className="cs">
          <div className="l mono" style={{ fontSize: 10.5, color: "var(--ink-dimmer)" }}>
            LAST BLOCK
          </div>
          <div className="mono" style={{ marginTop: 6, fontSize: 18 }}>
            4s ago
          </div>
        </div>
      </div>

      {chain.length === 0 ? (
        <p style={{ color: "var(--ink-dim)" }}>No blocks recorded yet.</p>
      ) : (
        <div className="block-list">
          {reversedChain.map((b) => (
            <BlockCard block={b} key={b.index} onOpen={setOpenBlockIndex} />
          ))}
        </div>
      )}

      <Modal open={Boolean(openBlock)} onClose={() => setOpenBlockIndex(null)}>
        {openBlock && (
          <>
            <div className="eyebrow">Block #{String(openBlock.index).padStart(6, "0")}</div>
            <h3 style={{ fontSize: 22 }}>Block Details</h3>
            <div className="kv">
              <span className="k">Hash</span>
              <span className="v" style={{ wordBreak: "break-all" }}>
                {openBlock.hash}
              </span>
            </div>
            <div className="kv">
              <span className="k">Previous Hash</span>
              <span className="v" style={{ wordBreak: "break-all" }}>
                {openBlock.prevHash}
              </span>
            </div>
            <div className="kv">
              <span className="k">Transaction ID</span>
              <span className="v" style={{ wordBreak: "break-all" }}>
                {openBlock.txId}
              </span>
            </div>
            <div className="kv">
              <span className="k">Timestamp</span>
              <span className="v">{formatTimestamp(openBlock.timestamp)}</span>
            </div>
            <div className="kv">
              <span className="k">Validator</span>
              <span className="v">{openBlock.validator}</span>
            </div>
            <div className="kv">
              <span className="k">Type</span>
              <span className="v">{openBlock.data.type}</span>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
