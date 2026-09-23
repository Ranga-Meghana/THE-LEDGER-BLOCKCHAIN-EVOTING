import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ParticleBackground from "../components/ParticleBackground.jsx";
import BlockchainVisualization from "../components/BlockchainVisualization.jsx";
import Timeline from "../components/Timeline.jsx";
import CandidateCard from "../components/CandidateCard.jsx";
import StatsCard from "../components/StatsCard.jsx";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { useChain } from "../hooks/useChain.js";
import { CANDIDATES } from "../data/candidates.js";
import { ELECTION } from "../data/electionData.js";

export default function Landing() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const { votes, blockHeight, loadingChain } = useChain();
  useScrollReveal(rootRef, [loadingChain]);

  return (
    <div ref={rootRef}>
      <section className="hero">
        <ParticleBackground />
        <div className="wrap">
          <div className="eyebrow reveal">BLOCKCHAIN-BASED E-VOTING SYSTEM</div>
          <h1 className="reveal">
            YOUR VOICE.
            <br />
            ON CHAIN.
          </h1>
          <p className="hero-sub reveal">
            A voting experience built around transparency, integrity, and verifiable digital records — where every
            ballot becomes a permanent, auditable entry instead of a promise to trust.
          </p>
          <div className="hero-actions reveal">
            <button className="btn btn-primary" onClick={() => navigate("/election")}>
              Enter Election
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore the Technology
            </button>
          </div>
        </div>
        <div className="scroll-cue">
          <span className="line"></span>Scroll to explore
        </div>
      </section>

      <section className="problem">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">The Problem</div>
            <h2>Trust should never be a black box.</h2>
            <p>
              Conventional electronic voting asks people to believe a result rather than verify it. This prototype
              exists to close that gap.
            </p>
          </div>
          <div className="problem-grid reveal">
            <div className="problem-item">
              <div className="num">01</div>
              <h3>Centralized Records</h3>
              <p>A single database holds the entire result, with no independent way to confirm it wasn't altered.</p>
            </div>
            <div className="problem-item">
              <div className="num">02</div>
              <h3>Limited Auditability</h3>
              <p>Logs can be edited or lost. Without a tamper-evident history, an audit is only as trustworthy as the people running it.</p>
            </div>
            <div className="problem-item">
              <div className="num">03</div>
              <h3>Trust Dependency</h3>
              <p>Voters are asked to trust an institution rather than verify a record — blockchain shifts part of that burden onto mathematics.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="solution">
        <div className="wrap">
          <div className="section-head center reveal">
            <div className="eyebrow">The Solution</div>
            <h2>A vote becomes a verifiable record.</h2>
            <p style={{ marginLeft: "auto", marginRight: "auto" }}>
              Each cast vote is sealed into a block, cryptographically linked to the one before it. Change one entry,
              and every block after it visibly breaks.
            </p>
          </div>
          <div className="reveal">
            <BlockchainVisualization />
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">How It Works</div>
            <h2>Five steps from person to permanent record.</h2>
          </div>
          <div className="reveal">
            <Timeline />
          </div>
        </div>
      </section>

      <section className="live-election">
        <div className="wrap">
          <div className="election-card reveal">
            <div className="election-top">
              <div>
                <div className="eyebrow">Current Election</div>
                <h2 style={{ fontSize: 32 }}>{ELECTION.title}</h2>
              </div>
              <div className="live-pill">
                <span className="live-dot"></span>LIVE
              </div>
            </div>
            <div className="stat-row">
              <StatsCard value={CANDIDATES.length} label="Candidates" />
              <StatsCard value={ELECTION.registeredVoters.toLocaleString()} label="Registered Voters" />
              <StatsCard value={loadingChain ? "—" : votes} label="Votes Cast" />
              <StatsCard value={loadingChain ? "—" : blockHeight} label="Blockchain Blocks" />
            </div>
            <div style={{ marginTop: 32, position: "relative", zIndex: 1 }}>
              <button className="btn btn-primary" onClick={() => navigate("/vote")}>
                Vote Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="candidates" id="candidates">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">Candidates</div>
            <h2>Three platforms. One record.</h2>
            <p>Fictional candidates created for this demonstration.</p>
          </div>
          <div className="cand-grid reveal">
            {CANDIDATES.map((c, i) => (
              <CandidateCard candidate={c} index={i} key={c.id} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
