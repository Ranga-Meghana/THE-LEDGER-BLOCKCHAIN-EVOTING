const mongoose = require("mongoose");

// Off-chain identity + eligibility record. Deliberately holds NO candidate choice —
// that lives only on-chain, keyed by wallet address / anonymized voter reference.
const voterSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    walletAddress: { type: String, required: true, unique: true },
    electionId: { type: Number, required: true },
    eligible: { type: Boolean, default: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voter", voterSchema);
