const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ electionId: req.params.electionId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

// Called after the frontend runs its client-side integrity verification, so there is
// also a durable off-chain record of when checks were run and what they found.
exports.recordVerification = async (req, res, next) => {
  try {
    const { result, performedBy, details } = req.body;
    const log = await AuditLog.create({
      electionId: req.params.electionId,
      action: "INTEGRITY_CHECK",
      result,
      performedBy,
      details,
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};
