import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useVoting } from "../context/VotingContext.jsx";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/election", label: "Election" },
  { to: "/#candidates", label: "Candidates", scrollId: "candidates" },
  { to: "/#how", label: "How It Works", scrollId: "how" },
  { to: "/blockchain", label: "Blockchain" },
  { to: "/audit", label: "Audit" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { wallet, walletMode, connectWallet, disconnectWallet, pushToast } = useVoting();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleNavClick(link, e) {
    setMobileOpen(false);
    if (link.scrollId) {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(link.scrollId)?.scrollIntoView({ behavior: "smooth" });
        }, 60);
      } else {
        document.getElementById(link.scrollId)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  function handleWalletClick() {
    if (wallet) {
      // simple demo affordance — clicking a connected wallet offers disconnect
      const modeLabel = walletMode === "real" ? "Real Blockchain Mode" : "Demo Mode";
      if (window.confirm(`Connected as ${wallet}\n(${modeLabel})\n\nDisconnect wallet?`)) {
        disconnectWallet();
      }
    } else {
      connectWallet().catch((err) => pushToast(err?.message || "Wallet connection failed."));
    }
  }

  return (
    <nav id="nav" className={scrolled ? "scrolled" : ""}>
      <div className="wrap">
        <Link to="/" className="brand">
          <span className="mark">
            <svg viewBox="0 0 26 26">
              <polygon points="13,1 24,7 24,19 13,25 2,19 2,7" fill="none" stroke="#8B5CF6" strokeWidth="1.4" />
              <polygon points="13,7 19,10.5 19,15.5 13,19 7,15.5 7,10.5" fill="#C084FC" opacity="0.85" />
            </svg>
          </span>
          THE LEDGER
        </Link>
        <ul id="nav-links" style={mobileOpen ? { display: "flex", position: "fixed", top: 64, left: 16, right: 16, background: "rgba(13,10,24,0.98)", border: "1px solid var(--border)", borderRadius: 12, padding: 12, flexDirection: "column" } : undefined}>
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link to={link.scrollId ? "/" : link.to} onClick={(e) => handleNavClick(link, e)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <button className={`btn btn-wallet btn-sm ${wallet ? "connected" : ""}`} onClick={handleWalletClick}>
            {wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : "Connect Wallet"}
          </button>
          <button id="hamburger" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation menu">
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}
