import React from "react";

// Selectable candidate card used on the /vote page.
export default function VotingCard({ candidate, selected, disabled, onSelect }) {
  return (
    <div
      className={`vote-card ${selected ? "selected" : ""}`}
      onClick={() => !disabled && onSelect(candidate.id)}
      role="button"
      aria-pressed={selected}
      aria-disabled={disabled}
      style={disabled ? { cursor: "not-allowed", opacity: 0.6 } : undefined}
    >
      <div className="vote-radio">
        <svg viewBox="0 0 24 24" fill="none" stroke="#070611" strokeWidth="3">
          <path d="M4 12l5 5L20 6" />
        </svg>
      </div>
      <h3>{candidate.name}</h3>
      <div className="role">Candidate — {candidate.tagline}</div>
      <div className="manifesto">"{candidate.manifesto}"</div>
      <div className="priorities">{candidate.priorities.join(" · ")}</div>
    </div>
  );
}
