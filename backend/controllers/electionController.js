const Election = require("../models/Election");

exports.listElections = async (req, res, next) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    next(err);
  }
};

exports.getElection = async (req, res, next) => {
  try {
    const election = await Election.findOne({ onChainId: req.params.id });
    if (!election) return res.status(404).json({ error: "Election not found" });
    res.json(election);
  } catch (err) {
    next(err);
  }
};

// Mirrors an election that was already created on-chain (via the deploy/admin script)
// into off-chain metadata storage (title, description, candidate manifestos, etc).
exports.createElection = async (req, res, next) => {
  try {
    const { onChainId, title, description, startTime, endTime, contractAddress, candidates } = req.body;
    const election = await Election.create({
      onChainId,
      title,
      description,
      startTime,
      endTime,
      contractAddress,
      candidates,
    });
    res.status(201).json(election);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const election = await Election.findOneAndUpdate(
      { onChainId: req.params.id },
      { status },
      { new: true }
    );
    if (!election) return res.status(404).json({ error: "Election not found" });
    res.json(election);
  } catch (err) {
    next(err);
  }
};
