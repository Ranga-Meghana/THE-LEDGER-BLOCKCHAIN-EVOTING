import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useVoting } from "../context/VotingContext.jsx";
import { verifyChain, tamperWithChain } from "../blockchain/chainService.js";
import { api } from "../services/api.js";

const STEP_DELAY_MS = 220;

export default function Audit() {
  const { chain, pushToast } = useVoting();
  const [lines, setLines] = useState([]); // { index, ok, reason }
  const [verdict, setVerdict] = useState(null); // 'pass' | 'fail' | null
  const [running, setRunning] = useState(false);
  const [tamperedChain, setTamperedChain] = useState(null);
  const [canRestore, setCanRestore] = useState(false);

  const runVerification = useCallback(
    async (targetChain, { isTamperRun = false } = {}) => {
      setRunning(true);
      setLines([]);
      setVerdict(null);
      const { results, allOk } = await verifyChain(targetChain);
      for (const r of results) {
        await new Promise((res) => setTimeout(res, STEP_DELAY_MS));
        setLines((prev) => [...prev, r]);
      }
      await new Promise((res) => setTimeout(res, 150));
      setVerdict(allOk ? "pass" : "fail");
      setRunning(false);
      if (!allOk) setCanRestore(true);

      // Best-effort: persist the verification result off-chain. Silently
      // no-ops if the backend isn't running — Demo Mode still works.
      api.recordVerification(1, { result: allOk ? "PASS" : "FAIL", performedBy: "demo-user", details: { isTamperRun } });
    },
    []
  );

  function handleVerify() {
    runVerification(tamperedChain || chain, { isTamperRun: Boolean(tamperedChain) });
  }

  function handleTamper() {
    const copy = tamperWithChain(chain);
    setTamperedChain(copy);
    pushToast("Tampering simulated on Block #003. Re-running verification…");
    runVerification(copy, { isTamperRun: true });
  }

  function handleRestore() {
    setTamperedChain(null);
    setLines([]);
    setVerdict(null);
    setCanRestore(false);
    pushToast("Demo chain restored to its original state.");
  }

  return (
    <div className="wrap screen-shell">
      <Link className="back-link" to="/">
        ← Back to home
      </Link>
      <div className="eyebrow center" style={{ justifyContent: "center", display: "flex" }}>
        Chain Integrity
      </div>
      <h2 className="center" style={{ fontSize: 44 }}>
        Can the record be trusted?
      </h2>
      <p className="center" style={{ color: "var(--ink-dim)", maxWidth: 480, margin: "14px auto 0" }}>
        Recompute every block's hash independently and confirm nothing has quietly changed.
      </p>

      <div className="audit-panel" style={{ marginTop: 48 }}>
        <div>
          {lines.map((line) => (
            <div className="check-line show" key={line.index}>
              <span>Checking Block #{String(line.index).padStart(3, "0")}</span>
              <span className={line.ok ? "ok" : "bad"}>{line.ok ? "✓" : `✕ ${line.reason}`}</span>
            </div>
          ))}
        </div>
        {verdict && (
          <div className={`audit-result ${verdict}`}>
            {verdict === "pass" ? "CHAIN INTEGRITY VERIFIED" : "CHAIN INTEGRITY FAILED"}
          </div>
        )}
        <div className="audit-actions">
          <button className="btn btn-primary" onClick={handleVerify} disabled={running}>
            Verify Blockchain Integrity
          </button>
          <button className="btn btn-danger" onClick={handleTamper} disabled={running || Boolean(tamperedChain)}>
            Simulate Tampering
          </button>
          {canRestore && (
            <button className="btn btn-ghost" onClick={handleRestore} disabled={running}>
              Restore Demo Chain
            </button>
          )}
        </div>
        <div className="edu-note">Educational security demonstration — no real votes are affected.</div>
      </div>
    </div>
  );
}
