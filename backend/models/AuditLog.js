const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    electionId: { type: Number, required: true },
    action: { type: String, required: true }, // e.g. "INTEGRITY_CHECK", "ELECTION_CREATED"
    result: { type: String }, // e.g. "PASS" / "FAIL"
    performedBy: { type: String }, // wallet address or "system"
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
