// Populates MongoDB with demo election/candidate data matching the frontend's
// Demo Mode data (frontend/src/data/*.js), so Real Blockchain Mode and Demo
// Mode show the same election out of the box.
require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("./config/db");
const Election = require("./models/Election");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/the_ledger";

const demoElection = {
  onChainId: 1,
  title: "Campus Leadership Election 2026",
  description: "Annual student leadership election for the 2026 term.",
  startTime: new Date("2026-09-01T00:00:00Z"),
  endTime: new Date("2026-09-30T23:59:59Z"),
  contractAddress: process.env.SEED_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  candidates: [
    {
      onChainId: 1,
      name: "Aria Vale",
      manifesto: "Every system this campus relies on should be transparent enough to trust and resilient enough to depend on.",
      priorities: ["Campus infrastructure", "Digital security", "Student services"],
    },
    {
      onChainId: 2,
      name: "Noah Reyes",
      manifesto: "Representation only matters if every voice actually reaches the table. I want to widen that table.",
      priorities: ["Inclusive governance", "Open forums", "Accessibility"],
    },
    {
      onChainId: 3,
      name: "Maya Sen",
      manifesto: "Change for its own sake wastes momentum. I want progress that is measured, funded, and actually finished.",
      priorities: ["Sustainability", "Budget transparency", "Long-term planning"],
    },
  ],
  status: "LIVE",
};

async function seed() {
  await connectDB(MONGO_URI);
  await Election.findOneAndUpdate({ onChainId: demoElection.onChainId }, demoElection, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  console.log("Seeded demo election:", demoElection.title);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
