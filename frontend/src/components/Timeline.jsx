import React from "react";

const STEPS = [
  {
    num: "STEP 01",
    title: "Identity",
    desc: "The voter connects a wallet that represents their eligibility, without exposing personal details on-chain.",
    icon: <path d="M12 8a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-7 8-7s8 3 8 7" />,
  },
  {
    num: "STEP 02",
    title: "Verify",
    desc: "The smart contract checks eligibility and confirms this voter has not already cast a ballot.",
    icon: (
      <>
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  },
  {
    num: "STEP 03",
    title: "Vote",
    desc: "A candidate is selected and the choice is packaged into a transaction ready for submission.",
    icon: <path d="M4 12h16M14 6l6 6-6 6" />,
  },
  {
    num: "STEP 04",
    title: "Record",
    desc: "The transaction is hashed and sealed into a new block, linked to every block before it.",
    icon: (
      <>
        <rect x="4" y="8" width="16" height="12" rx="1" />
        <path d="M8 8V6a4 4 0 018 0v2" />
      </>
    ),
  },
  {
    num: "STEP 05",
    title: "Audit",
    desc: "Anyone can independently recompute every hash and confirm the chain hasn't been altered.",
    icon: <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />,
  },
];

export default function Timeline() {
  return (
    <div className="steps">
      {STEPS.map((s) => (
        <div className="step-card" key={s.title}>
          <div className="snum">{s.num}</div>
          <div className="sicon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {s.icon}
            </svg>
          </div>
          <h3>{s.title}</h3>
          <p>{s.desc}</p>
        </div>
      ))}
    </div>
  );
}
