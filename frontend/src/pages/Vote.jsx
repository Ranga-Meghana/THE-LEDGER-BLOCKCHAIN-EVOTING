import React from "react";
import { Link, useNavigate } from "react-router-dom";
import VotingCard from "../components/VotingCard.jsx";
import { useVoting } from "../context/VotingContext.jsx";
import { CANDIDATES } from "../data/candidates.js";

export default function Vote() {
  const navigate = useNavigate();
  const { selectedCandidate, setSelectedCandidate, hasVoted, votedFor } = useVoting();

  const votedCandidate = CANDIDATES.find((c) => c.id === votedFor);

  return (
    <div className="wrap screen-shell">
      <Link className="back-link" to="/election">
        ← Back to election
      </Link>
      <div className="eyebrow">Campus Leadership Election 2026</div>
      <h2 style={{ fontSize: 44 }}>Cast your voice.</h2>
      <p style={{ color: "var(--ink-dim)", marginTop: 12, maxWidth: 480 }}>
        Select one candidate below. You'll be able to review your choice before it's submitted.
      </p>

      {hasVoted && (
        <div className="warn-box" style={{ maxWidth: 480, marginTop: 24 }}>
          You already cast your vote{votedCandidate ? <> for <strong>{votedCandidate.name}</strong></> : ""}. Each
          verified voter may only vote once.{" "}
          <Link to="/admin" style={{ color: "var(--lilac)" }}>
            View live results →
          </Link>
        </div>
      )}

      <div className="vote-grid">
        {CANDIDATES.map((c) => (
          <VotingCard
            key={c.id}
            candidate={c}
            selected={selectedCandidate === c.id}
            disabled={hasVoted}
            onSelect={setSelectedCandidate}
          />
        ))}
      </div>

      <div className="sticky-cta">
        <button
          className="btn btn-primary"
          disabled={!selectedCandidate || hasVoted}
          onClick={() => navigate("/review")}
        >
          Review Vote
        </button>
      </div>
    </div>
  );
}
