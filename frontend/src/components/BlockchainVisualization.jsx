import React from "react";

// Static illustrative 4-block chain used on the landing page's "Solution" section.
const DEMO_BLOCKS = [
  { n: "BLOCK 001", ts: "10:00:00", tx: "0x1a2b…", prev: "0x0000…", hash: "0x4f2a…" },
  { n: "BLOCK 002", ts: "10:04:20", tx: "0x8c7d…", prev: "0x4f2a…", hash: "0x9e13…" },
  { n: "BLOCK 003", ts: "10:08:40", tx: "0x3f0e…", prev: "0x9e13…", hash: "0xd571…" },
  { n: "BLOCK 004", ts: "10:13:00", tx: "0x6a9c…", prev: "0xd571…", hash: "0x22ab…" },
];

export default function BlockchainVisualization() {
  return (
    <div className="chain-visual">
      {DEMO_BLOCKS.map((b, i) => (
        <React.Fragment key={b.n}>
          <div className="chain-block">
            <div className="val head">{b.n}</div>
            <div>
              <div className="label">Timestamp</div>
              <div className="val">{b.ts}</div>
            </div>
            <div>
              <div className="label">Transaction ID</div>
              <div className="val">{b.tx}</div>
            </div>
            <div>
              <div className="label">Previous Hash</div>
              <div className="val">{b.prev}</div>
            </div>
            <div>
              <div className="label">Current Hash</div>
              <div className="val">{b.hash}</div>
            </div>
          </div>
          {i < DEMO_BLOCKS.length - 1 && <div className="chain-link"></div>}
        </React.Fragment>
      ))}
    </div>
  );
}
