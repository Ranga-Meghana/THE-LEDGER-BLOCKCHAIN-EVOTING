const express = require("express");
const router = express.Router();
const controller = require("../controllers/auditController");

router.get("/:electionId", controller.getAuditLogs);
router.post("/:electionId/verify", controller.recordVerification);

module.exports = router;
