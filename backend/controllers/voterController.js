const Voter = require("../models/Voter");

// Registers a voter's eligibility off-chain. A separate admin/deploy step calls the
// smart contract's registerVoter() so the wallet address is recognized on-chain too.
exports.registerVoter = async (req, res, next) => {
  try {
    const { studentId, fullName, walletAddress, electionId } = req.body;
    const existing = await Voter.findOne({ $or: [{ studentId }, { walletAddress }] });
    if (existing) return res.status(409).json({ error: "Voter already registered" });

    const voter = await Voter.create({ studentId, fullName, walletAddress, electionId });
    res.status(201).json({ id: voter._id, walletAddress: voter.walletAddress, eligible: voter.eligible });
  } catch (err) {
    next(err);
  }
};

exports.getVoterStatus = async (req, res, next) => {
  try {
    const voter = await Voter.findOne({ walletAddress: req.params.walletAddress });
    if (!voter) return res.status(404).json({ error: "Voter not found" });
    res.json({ eligible: voter.eligible, electionId: voter.electionId });
  } catch (err) {
    next(err);
  }
};
