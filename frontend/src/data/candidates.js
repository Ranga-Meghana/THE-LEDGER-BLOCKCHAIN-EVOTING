// Fictional candidates created for this demonstration. Not real politicians.
//
// `onChainId` must match the order candidates were added via addCandidate() in
// blockchain/scripts/deploy.js (candidate IDs on the contract are 1-indexed, in
// insertion order). If you redeploy with a different candidate order, update
// these to match, or the "real mode" vote counts will point at the wrong name.
export const CANDIDATES = [
  {
    id: "aria",
    onChainId: 1,
    letter: "A",
    name: "Aria Vale",
    tagline: "Build. Secure. Lead.",
    manifesto:
      "Every system this campus relies on should be transparent enough to trust and resilient enough to depend on.",
    priorities: ["Campus infrastructure", "Digital security", "Student services"],
  },
  {
    id: "noah",
    onChainId: 2,
    letter: "B",
    name: "Noah Reyes",
    tagline: "Every voice counts.",
    manifesto:
      "Representation only matters if every voice actually reaches the table. I want to widen that table.",
    priorities: ["Inclusive governance", "Open forums", "Accessibility"],
  },
  {
    id: "maya",
    onChainId: 3,
    letter: "C",
    name: "Maya Sen",
    tagline: "Progress with purpose.",
    manifesto:
      "Change for its own sake wastes momentum. I want progress that is measured, funded, and actually finished.",
    priorities: ["Sustainability", "Budget transparency", "Long-term planning"],
  },
];
