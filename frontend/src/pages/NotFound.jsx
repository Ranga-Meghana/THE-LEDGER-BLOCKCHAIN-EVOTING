import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="wrap screen-shell center">
      <div className="eyebrow center" style={{ justifyContent: "center", display: "flex" }}>
        404
      </div>
      <h2 style={{ fontSize: 40 }}>This page doesn't exist on the chain.</h2>
      <p style={{ color: "var(--ink-dim)", marginTop: 12 }}>
        <Link to="/" style={{ color: "var(--lilac)" }}>
          Return to the landing page →
        </Link>
      </p>
    </div>
  );
}
