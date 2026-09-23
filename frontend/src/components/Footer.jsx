import React from "react";
import { Link } from "react-router-dom";
import { useVoting } from "../context/VotingContext.jsx";

export default function Footer() {
  const { pushToast } = useVoting();
  return (
    <footer id="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{ marginBottom: 14 }}>
              <span className="mark">
                <svg viewBox="0 0 26 26">
                  <polygon points="13,1 24,7 24,19 13,25 2,19 2,7" fill="none" stroke="#8B5CF6" strokeWidth="1.4" />
                  <polygon points="13,7 19,10.5 19,15.5 13,19 7,15.5 7,10.5" fill="#C084FC" opacity="0.85" />
                </svg>
              </span>
              THE LEDGER
            </div>
            <p style={{ maxWidth: 260 }}>
              Blockchain-based e-voting system. Academic prototype — designed for educational demonstration.
            </p>
          </div>
          <div>
            <h4>Navigation</h4>
            <Link to="/">Home</Link>
            <Link to="/election">Election</Link>
            <Link to="/blockchain">Blockchain</Link>
            <Link to="/audit">Audit</Link>
          </div>
          <div>
            <h4>Technology</h4>
            <Link to="/how-it-works">How Blockchain Works</Link>
            <Link to="/admin">Admin Dashboard</Link>
            <a href="javascript:void(0)" onClick={() => pushToast("GitHub link disabled in this demo build.")}>
              GitHub
            </a>
          </div>
          <div>
            <h4>Project Info</h4>
            <p>B.Tech Capstone — Blockchain-Based E-Voting System</p>
            <p>Solidity · Hardhat · Ethers.js · React</p>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 The Ledger — Academic prototype.</span>
          <span>Demonstration data only. Not a real election.</span>
        </div>
      </div>
    </footer>
  );
}
