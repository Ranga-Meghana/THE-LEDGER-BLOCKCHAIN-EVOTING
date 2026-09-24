import React from "react";
import { Link, useNavigate } from "react-router-dom";
import SecurityStatus from "../components/SecurityStatus.jsx";
import { useChain } from "../hooks/useChain.js";
import { useVoting } from "../context/VotingContext.jsx";
import { ELECTION } from "../data/electionData.js";
import { CANDIDATES } from "../data/candidates.js";

export default function Election() {
  const navigate = useNavigate();
  const { votes, blockHeight, loadingChain } = useChain();
  // `hasVoted` already reflects the real, on-chain vote (Real Blockchain
  // Mode) or the Demo Mode simulated vote — VotingContext keeps this in
  // sync via the existing recoverRealVoteTx/localStorage logic, which is
  // untouched here. No new state or blockchain calls are needed.
  const { hasVoted } = useVoting();

  return (
    <div className="wrap screen-shell">
      <Link className="back-link" to="/">
        ← Back to home
      </Link>
      <div className="eyebrow">Election Overview</div>
      <h2 style={{ fontSize: 44 }}>{ELECTION.title}</h2>

      <div className="overview-grid" style={{ marginTop: 44 }}>
        <div>
          <div className="info-card">
            <h4>Election Details</h4>
            <div className="kv">
              <span className="k">Status</span>
              <span className="v sec-status">
                <span
                  className="live-dot"
                  style={{ background: "var(--ok)", width: 6, height: 6, borderRadius: "50%", display: "inline-block" }}
                ></span>{" "}
                {ELECTION.status}
              </span>
            </div>
            <div className="kv">
              <span className="k">Start Date</span>
              <span className="v">{ELECTION.startDate}</span>
            </div>
            <div className="kv">
              <span className="k">End Date</span>
              <span className="v">{ELECTION.endDate}</span>
            </div>
            <div className="kv">
              <span className="k">Registered Voters</span>
              <span className="v">{ELECTION.registeredVoters.toLocaleString()}</span>
            </div>
            <div className="kv">
              <span className="k">Votes Cast</span>
              <span className="v">{loadingChain ? "—" : votes}</span>
            </div>
            <div className="kv">
              <span className="k">Candidates</span>
              <span className="v">{CANDIDATES.length}</span>
            </div>
          </div>
          <div className="info-card">
            <h4>Voting Rules</h4>
            <div className="kv">
              <span className="k">Eligibility</span>
              <span className="v">Verified wallet only</span>
            </div>
            <div className="kv">
              <span className="k">Votes per voter</span>
              <span className="v">Exactly 1</span>
            </div>
            <div className="kv">
              <span className="k">Vote changes</span>
              <span className="v">Not permitted</span>
            </div>
          </div>
        </div>
        <div>
          <SecurityStatus />
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 16 }}
            onClick={() => navigate(hasVoted ? "/confirmation" : "/vote")}
          >
            {hasVoted ? "View My Vote Confirmation" : "Start Voting"}
          </button>
        </div>
      </div>
    </div>
  );
}