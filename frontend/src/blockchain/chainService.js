import { sha256 } from "../utils/hash.js";
import { CANDIDATES } from "../data/candidates.js";

// ---------------------------------------------------------------------------
// Demo Mode chain: a genuine, recomputable hash chain built and verified
// entirely client-side. Each block's hash is a real SHA-256 digest of its
// contents plus the previous block's hash, so the audit page's integrity
// check and tampering simulation are mathematically real, not scripted.
// ---------------------------------------------------------------------------

async function buildBlock(index, prevHash, txId, data, tsOffsetSec) {
  const timestamp = new Date(Date.UTC(2026, 8, 18, 10, 0, 0) + tsOffsetSec * 1000);
  const payload = JSON.stringify({ index, txId, data, prevHash, ts: timestamp.toISOString() });
  const hash = await sha256(payload);
  return {
    index,
    timestamp,
    txId,
    data,
    prevHash,
    hash,
    validator: "NODE-0" + ((index % 8) + 1),
    txCount: data.txCount || 1,
  };
}

export async function seedChain() {
  const chain = [];
  const genesisData = { type: "genesis", note: "Election initialized: Campus Leadership Election 2026", txCount: 0 };
  let prev = await buildBlock(1, "0".repeat(64), "0x" + "0".repeat(62) + "01", genesisData, 0);
  chain.push(prev);

  const seedVotes = [
    { candidateId: "aria", voter: "v-8841" },
    { candidateId: "noah", voter: "v-2093" },
    { candidateId: "maya", voter: "v-5567" },
  ];
  let i = 2;
  for (const v of seedVotes) {
    const txId = "0x" + (Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)).slice(0, 16);
    const data = { type: "vote", electionId: "campus-leadership-2026", candidateId: v.candidateId, voterRef: v.voter, txCount: 1 };
    const b = await buildBlock(i, prev.hash, txId, data, (i - 1) * 260);
    chain.push(b);
    prev = b;
    i++;
  }
  return chain;
}

export async function appendVoteBlock(chain, candidateId) {
  const prev = chain[chain.length - 1];
  const txId = "0x" + (Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)).slice(0, 16);
  const voterRef = "v-" + Math.floor(1000 + Math.random() * 8999);
  const data = { type: "vote", electionId: "campus-leadership-2026", candidateId, voterRef, txCount: 1 };
  const offset = prev.index * 260 + 60;
  const block = await buildBlock(prev.index + 1, prev.hash, txId, data, offset);
  return block;
}

export function candidateVoteCounts(chain) {
  const counts = Object.fromEntries(CANDIDATES.map((c) => [c.id, 0]));
  chain.forEach((b) => {
    if (b.data.type === "vote" && counts[b.data.candidateId] !== undefined) counts[b.data.candidateId]++;
  });
  return counts;
}

export function totalVotes(chain) {
  return chain.filter((b) => b.data.type === "vote").length;
}

// Recomputes every block's hash from its own contents and checks the prevHash
// link. Once any block is found invalid, every block after it is also marked
// invalid (PREVIOUS HASH INVALID) even if its own hash/prevHash happen to
// still check out in isolation — once a link in the chain is broken, nothing
// built on top of it can be trusted either, which is the whole point of the
// demonstration. Returns a per-block result list plus an overall pass/fail flag.
export async function verifyChain(chain) {
  const results = [];
  let allOk = true;
  let chainBroken = false;
  for (const b of chain) {
    const payload = JSON.stringify({ index: b.index, txId: b.txId, data: b.data, prevHash: b.prevHash, ts: b.timestamp.toISOString() });
    const recomputed = await sha256(payload);
    const hashOk = recomputed === b.hash;
    const prevOk = b.index === 1 ? true : chain.find((x) => x.index === b.index - 1)?.hash === b.prevHash;
    const ok = hashOk && prevOk && !chainBroken;
    let reason = null;
    if (!hashOk) reason = "HASH MISMATCH DETECTED";
    else if (!prevOk || chainBroken) reason = "PREVIOUS HASH INVALID";
    if (!ok) {
      allOk = false;
      chainBroken = true;
    }
    results.push({ index: b.index, ok, reason });
  }
  return { results, allOk };
}

// Returns a tampered deep copy of the chain: block #3's vote is silently
// switched to a different candidate without recomputing its hash, which is
// exactly what a real tamper attempt on a database record (not a blockchain)
// would look like — and exactly what this simulation is designed to catch.
export function tamperWithChain(chain) {
  const copy = chain.map((b) => ({ ...b, data: { ...b.data } }));
  const target = copy.find((b) => b.index === 3);
  if (target && target.data.type === "vote") {
    const alt = CANDIDATES.find((c) => c.id !== target.data.candidateId);
    target.data.candidateId = alt.id;
  }
  return copy;
}
