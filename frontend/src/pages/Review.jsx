import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVoting } from "../context/VotingContext.jsx";
import { CANDIDATES } from "../data/candidates.js";

export default function Review() {
  const navigate = useNavigate();
  const { selectedCandidate, castVote, hasVoted, pushToast } = useVoting();
  const [submitting, setSubmitting] = useState(false);
  const candidate = CANDIDATES.find((c) => c.id === selectedCandidate);

  // Guard: if someone lands here directly with nothing selected (or has already
  // voted), send them back rather than showing a broken review screen.
  if (!candidate) {
    navigate("/vote");
    return null;
  }

  async function handleConfirm() {
    if (hasVoted) return;
    setSubmitting(true);
    try {
      await castVote(candidate.id);
      navigate("/confirmation");
    } catch (err) {
      // Real Blockchain Mode failures (rejected in wallet, reverted, network
      // error) land here — surface them and let the voter try again rather
      // than silently doing nothing or advancing to a fake confirmation.
      pushToast(err?.message || "Vote submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap screen-shell">
      <a className="back-link" onClick={() => navigate("/vote")} style={{ cursor: "pointer" }}>
        ← Back to voting
      </a>
      <div className="review-box">
        <div className="eyebrow">Confirm Before Submitting</div>
        <h2 style={{ fontSize: 28 }}>Your selection</h2>
        <div style={{ marginTop: 24 }}>
          <div className="kv">
            <span className="k">Candidate</span>
            <span className="v">{candidate.name}</span>
          </div>
          <div className="kv">
            <span className="k">Election</span>
            <span className="v">Campus Leadership 2026</span>
          </div>
          <div className="kv">
            <span className="k">Voting status</span>
            <span className="v">One vote per verified voter</span>
          </div>
          <div className="kv">
            <span className="k">Security</span>
            <span className="v">Blockchain record</span>
          </div>
        </div>
        <div className="warn-box">
          Once submitted, this transaction will be recorded on the blockchain and cannot be casually altered.
        </div>
        <div className="review-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/vote")} disabled={submitting}>
            Back
          </button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Submitting…" : "Confirm & Cast Vote"}
          </button>
        </div>
      </div>
    </div>
  );
}
