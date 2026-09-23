import { useMemo } from "react";
import { useVoting } from "../context/VotingContext.jsx";
import { candidateVoteCounts, totalVotes } from "../blockchain/chainService.js";
import { CANDIDATES } from "../data/candidates.js";

// Purpose-named slice of the voting context for components that only need
// read access to the current vote tallies and (Demo Mode) chain state.
//
// When Real Blockchain Mode is configured and reachable, `realResults` (from
// VotingContext) holds the actual on-chain tally and takes priority here —
// so the Election/Admin pages show real vote counts instead of Demo Mode
// numbers whenever a real contract is available. `blockHeight`/`chain` remain
// the Demo Mode simulated chain either way, since the Blockchain Explorer and
// Audit pages are an educational Demo Mode feature (see README).
export function useChain() {
  const { chain, loadingChain, realResults } = useVoting();
  const demoCounts = useMemo(() => candidateVoteCounts(chain), [chain]);

  const counts = useMemo(() => {
    if (!realResults) return demoCounts;
    const map = {};
    CANDIDATES.forEach((c, i) => {
      map[c.id] = realResults[i]?.votes ?? 0;
    });
    return map;
  }, [realResults, demoCounts]);

  const votes = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  return {
    chain,
    loadingChain,
    counts,
    votes,
    blockHeight: chain.length,
    isRealData: Boolean(realResults),
  };
}
