const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    onChainId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    contractAddress: { type: String, required: true },
    candidates: [
      {
        onChainId: Number,
        name: String,
        manifesto: String,
        priorities: [String],
      },
    ],
    status: { type: String, enum: ["UPCOMING", "LIVE", "ENDED"], default: "UPCOMING" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Election", electionSchema);
