import React from "react";

const CHECKS = [
  "Identity Verification",
  "One Vote Enforcement",
  "Smart Contract",
  "Blockchain Recording",
  "Integrity Verification",
  "Audit Trail",
];

export default function SecurityStatus() {
  return (
    <div className="info-card">
      <h4>Security Status</h4>
      {CHECKS.map((c) => (
        <div className="kv" key={c}>
          <span className="k">{c}</span>
          <span className="v" style={{ color: "var(--ok)" }}>
            ✓
          </span>
        </div>
      ))}
    </div>
  );
}
