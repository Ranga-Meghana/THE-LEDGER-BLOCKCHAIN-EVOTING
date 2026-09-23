import React from "react";
import { Link } from "react-router-dom";
import { useChain } from "../hooks/useChain.js";
import { useVoting } from "../context/VotingContext.jsx";
import { CANDIDATES } from "../data/candidates.js";
import { ELECTION } from "../data/electionData.js";

export default function Admin() {
  const { votes, counts, blockHeight, loadingChain, isRealData } = useChain();
  const { pushToast } = useVoting();
  const participation = ELECTION.registeredVoters ? ((votes / ELECTION.registeredVoters) * 100).toFixed(2) : "0.00";
  const maxVotes = Math.max(1, ...Object.values(counts));

  return (
    <div className="wrap screen-shell">
      <Link className="back-link" to="/">
        ← Back to home
      </Link>
      <div className="eyebrow">Admin Dashboard</div>
      <h2 style={{ fontSize: 38 }}>{ELECTION.title}</h2>

      <div className="admin-stats" style={{ marginTop: 36 }}>
        <div className="as">
          <div className="k">{ELECTION.registeredVoters.toLocaleString()}</div>
          <div className="l mono" style={{ fontSize: 10.5, color: "var(--ink-dimmer)" }}>
            REGISTERED VOTERS
          </div>
        </div>
        <div className="as">
          <div className="k">{loadingChain ? "—" : votes}</div>
          <div className="l mono" style={{ fontSize: 10.5, color: "var(--ink-dimmer)" }}>
            VOTES CAST
          </div>
        </div>
        <div className="as">
          <div className="k">{loadingChain ? "—" : `${participation}%`}</div>
          <div className="l mono" style={{ fontSize: 10.5, color: "var(--ink-dimmer)" }}>
            PARTICIPATION
          </div>
        </div>
        <div className="as">
          <div className="k">{loadingChain ? "—" : blockHeight}</div>
          <div className="l mono" style={{ fontSize: 10.5, color: "var(--ink-dimmer)" }}>
            BLOCKCHAIN BLOCKS
          </div>
        </div>
      </div>

      <div className="admin-panel-grid">
        <div className="info-card">
          <h4>
            Candidate Results{" "}
            <span style={{ fontWeight: 400, color: isRealData ? "var(--ok)" : "var(--ink-dimmer)", fontSize: 10.5 }}>
              — {isRealData ? "LIVE ON-CHAIN DATA" : "DEMO MODE DATA"}
            </span>
          </h4>
          {CANDIDATES.map((c) => {
            const v = counts[c.id] || 0;
            const pct = votes ? Math.round((v / votes) * 100) : 0;
            return (
              <div style={{ marginBottom: 18 }} key={c.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                  <span>{c.name}</span>
                  <span className="mono">
                    {v} votes · {pct}%
                  </span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(v / maxVotes) * 100}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <div className="info-card">
            <h4>Admin Actions</h4>
            <button
              className="btn btn-ghost btn-block"
              style={{ marginBottom: 10 }}
              onClick={() => pushToast("Election creation is a real-mode feature — disabled in Demo Mode.")}
            >
              Create Election
            </button>
            <button
              className="btn btn-ghost btn-block"
              style={{ marginBottom: 10 }}
              onClick={() => pushToast("Candidate management is a real-mode feature — disabled in Demo Mode.")}
            >
              Add Candidate
            </button>
            <Link to="/blockchain" className="btn btn-ghost btn-block" style={{ marginBottom: 10, display: "block", textAlign: "center" }}>
              View Blockchain Records
            </Link>
            <Link to="/audit" className="btn btn-ghost btn-block" style={{ marginBottom: 10, display: "block", textAlign: "center" }}>
              Verify Integrity
            </Link>
            <button className="btn btn-ghost btn-block" onClick={() => pushToast("Audit log export is a real-mode feature — disabled in Demo Mode.")}>
              Export Audit Log
            </button>
          </div>
          <div className="lock-note">
            <span>🔒</span>
            <span>Recorded votes cannot be edited by an administrator. The smart contract enforces this — not policy.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
