import React from "react";

const GRADIENTS = [
  "135deg, rgba(139,92,246,0.35), rgba(232,121,249,0.15)",
  "135deg, rgba(34,211,238,0.3), rgba(109,40,217,0.2)",
  "135deg, rgba(232,121,249,0.3), rgba(139,92,246,0.15)",
];

// Read-only display card used on the landing page's candidate showcase.
export default function CandidateCard({ candidate, index = 0 }) {
  return (
    <div className="cand-card">
      <div className="cand-portrait" style={{ background: `linear-gradient(${GRADIENTS[index % GRADIENTS.length]})` }}>
        <div
          className="glyph"
          style={{ background: "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.08), transparent 55%)" }}
        ></div>
      </div>
      <div className="cand-body">
        <div className="cletter">CANDIDATE {candidate.letter}</div>
        <h3>{candidate.name}</h3>
        <div className="role">"{candidate.tagline}"</div>
        <div className="manifesto">"{candidate.manifesto}"</div>
        <div className="cand-tags">
          {candidate.priorities.map((p) => (
            <span className="tag" key={p}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
