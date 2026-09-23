import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sha256 } from "../utils/hash.js";

const CONCEPTS = [
  { title: "What is a block?", body: "A container holding a batch of transactions, a timestamp, and a reference to the block before it — one page in a permanent notebook." },
  { title: "What is a hash?", body: "A fixed-length fingerprint generated from data. Change a single character of input and the fingerprint changes completely and unpredictably." },
  { title: "What is a blockchain?", body: "A chain of blocks where each one stores the previous block's hash — so altering any past block breaks every hash that follows it." },
  { title: "What is a smart contract?", body: "Code deployed to the chain that enforces rules automatically — like refusing a second vote from the same wallet, with no human override." },
  { title: "How is a vote recorded?", body: "A vote becomes a transaction: election ID, candidate selection, and the voter's address, sealed into the next block. In this prototype's real contract, that address is public on-chain — it is not anonymized. Demo Mode substitutes an illustrative anonymized reference purely to teach the concept; real ballot secrecy needs additional cryptography (see the README)." },
  { title: "Why does an old edit break everything?", body: "Because each block's hash depends on the block before it. Rewrite history once, and every later block's stored link stops matching reality." },
];

export default function HowItWorks() {
  const [input, setInput] = useState("Aria Vale");
  const [hash, setHash] = useState("Computing…");

  useEffect(() => {
    let cancelled = false;
    sha256(input || "").then((h) => {
      if (!cancelled) setHash(h);
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <div className="wrap screen-shell">
      <Link className="back-link" to="/">
        ← Back to home
      </Link>
      <div className="eyebrow">How Blockchain Works</div>
      <h2 style={{ fontSize: 44 }}>The mechanics behind the ledger.</h2>

      <div className="learn-grid" style={{ marginTop: 40 }}>
        {CONCEPTS.map((c) => (
          <div className="concept-card" key={c.title}>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </div>

      <div className="hash-demo">
        <div className="eyebrow">Try It Yourself</div>
        <h3 style={{ fontSize: 20 }}>Type a candidate name and watch the hash change.</h3>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. Aria Vale" />
        <div className="hash-flow">
          <span className="node">INPUT</span> → <span className="node">TRANSACTION</span> → <span className="node">HASH</span> →{" "}
          <span className="node">BLOCK</span> → <span className="node">CHAIN</span>
        </div>
        <div className="hash-out">{hash}</div>
      </div>
    </div>
  );
}
